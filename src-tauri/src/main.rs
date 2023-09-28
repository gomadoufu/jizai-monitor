// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_reader;
mod mqtt;
mod state_manager;

use mqtt::parse_json::Parsable::{Parsed, Raw};
use serde::{Deserialize, Serialize};
use state_manager::{GlobalState, Monitor};
use tauri::State;

use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitMessage {
    pub uuid: Vec<String>,
    pub things: Vec<String>,
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
        things,
        ca,
        cert,
        key,
    } = message;

    println!("{:?}", uuid);
    println!("{:?}", things);

    let cert_paths = vec![ca, cert, key];

    let cert_contents = file_reader::read_certificates(&appstate, &cert_paths).unwrap();

    let (client, mut eventloop) = mqtt::client::init(uuid[0].clone(), &cert_contents);

    // let subscribe_topic = "status/monitor/".to_string() + &thing;
    // let publish_topic = "monitor/get/".to_string() + &thing;
    let publish_payload = "{\"mode\": \"machine\"}".to_string();

    let subscribe_topics = things
        .iter()
        .map(|thing| "status/monitor/".to_string() + thing)
        .collect::<Vec<String>>();
    let publish_topics = things
        .iter()
        .map(|thing| "monitor/get/".to_string() + thing)
        .collect::<Vec<String>>();

    let client_clone = client.clone();
    let subscribe_topics_clone = subscribe_topics.clone();
    let publish_topics_clone = publish_topics.clone();

    tokio::spawn(async move {
        for subscribe_topic in subscribe_topics_clone.iter() {
            mqtt::client::subscribe(&client_clone, subscribe_topic)
                .await
                .expect("Subscribeに失敗しました")
        }
        for publish_topic in publish_topics_clone.iter() {
            mqtt::client::publish(&client_clone, publish_topic, &publish_payload)
                .await
                .expect("Publishに失敗しました");
        }
    });

    for (uuid, (thing, (subscribe_topic, publish_topic))) in uuid.iter().zip(
        things
            .iter()
            .zip(subscribe_topics.iter().zip(publish_topics.iter())),
    ) {
        let data = mqtt::client::poll_event(subscribe_topic, &mut eventloop)
            .await
            .expect("MQTT通信に失敗しました");

        client.unsubscribe(subscribe_topic).await.unwrap();

        create_monitor(
            uuid,
            thing,
            subscribe_topic,
            publish_topic,
            &data,
            appstate.clone(),
        )?
    }

    Ok(())
}

fn create_monitor<T: Into<String>>(
    uuid: &str,
    thing: T,
    subscribe_topic: T,
    publish_topic: T,
    data: &[u8],
    appstate: State<'_, GlobalState>,
) -> Result<(), String> {
    let received_data = mqtt::parse_json::parse_whole(data);

    match received_data {
        Parsed(payload) => {
            let monitor = Monitor::new(
                uuid.into(),
                thing.into(),
                subscribe_topic.into(),
                publish_topic.into(),
                "parsed".to_string(),
                payload.services.clone(),
                payload.sensors.clone(),
                payload.record.clone(),
            );

            appstate.add_monitor(Uuid::parse_str(uuid).unwrap(), monitor);

            Ok(())
        }
        Raw(payload) => {
            let raw = String::from_utf8(payload).or(Err("MQTTペイロードがUTF-8ではありません"))?;
            let monitor = Monitor::new(
                uuid.into(),
                thing.into(),
                subscribe_topic.into(),
                publish_topic.into(),
                raw,
                "raw".to_string(),
                "raw".to_string(),
                "raw".to_string(),
            );

            appstate.add_monitor(Uuid::parse_str(uuid).unwrap(), monitor);

            Ok(())
        }
    }
}

#[tauri::command]
async fn fetch_monitor(uuid: String, appstate: State<'_, GlobalState>) -> Result<Monitor, ()> {
    let monitor = appstate.get_monitor(Uuid::parse_str(uuid.as_str()).unwrap());

    println!("{:?}", monitor);

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
