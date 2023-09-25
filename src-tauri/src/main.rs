// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_reader;
mod mqtt;
mod state_manager;

use serde::{Deserialize, Serialize};
use state_manager::{GlobalState, Monitor};
use tauri::State;
use tokio::task;

use anyhow::Result;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitMessage {
    pub uuid: String,
    pub thing: String,
    pub ca: String,
    pub cert: String,
    pub key: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseMessage {
    pub thing: String,
    pub payload: String,
}

#[tauri::command]
async fn mqtt_call(message: SubmitMessage, appstate: State<'_, GlobalState>) -> Result<(), String> {
    let SubmitMessage {
        uuid,
        thing,
        ca,
        cert,
        key,
    } = message;

    let cert_paths = vec![ca, cert, key];

    let cert_contents = file_reader::read_certificates(&appstate, &cert_paths).unwrap();

    let (client, eventloop) = mqtt::client::init(&cert_contents);

    let subscribe_topic = "status/monitor/".to_string() + &thing;
    let publish_topic = "monitor/get/".to_string() + &thing;
    let publish_payload = "{\"mode\": \"machine\"}".to_string();

    let subscribe_topic_clone = subscribe_topic.clone();
    let publish_topic_clone = publish_topic.clone();

    task::spawn(async move {
        mqtt::client::subscribe(&client, &subscribe_topic_clone)
            .await
            .expect("subscribe error");
        mqtt::client::publish(&client, &publish_topic_clone, &publish_payload)
            .await
            .expect("publish error");
    });

    let received_handle = tokio::spawn(async {
        mqtt::client::poll_event(eventloop)
            .await
            .expect("poll error")
    });

    // 指定の秒数まってMQTTが帰ってこなければ、問題があったとみなす
    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    received_handle.abort();

    match received_handle.await {
        Ok(received_data) => {
            let monitor = Monitor::new(
                uuid.clone(),
                thing.clone(),
                subscribe_topic.clone(),
                publish_topic.clone(),
                received_data.services.clone(),
                received_data.sensors.clone(),
                received_data.record.clone(),
            );

            appstate.add_monitor(Uuid::parse_str(uuid.as_str()).unwrap(), monitor);

            Ok(())
        }
        Err(_) => Err("MQTT通信に失敗しました".to_string()),
    }
}

#[tauri::command]
async fn fetch_monitor(uuid: String, appstate: State<'_, GlobalState>) -> Result<Monitor, ()> {
    let monitor = appstate.get_monitor(Uuid::parse_str(uuid.as_str()).unwrap());

    match monitor {
        Some(monitor) => Ok(monitor),
        None => {
            panic!("monitor not found");
        }
    }
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![mqtt_call, fetch_monitor])
        .manage(GlobalState::new())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
