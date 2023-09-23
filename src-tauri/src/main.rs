// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod file_reader;
mod mqtt;
mod state_manager;

use serde::{Deserialize, Serialize};
use state_manager::{GlobalState, Monitor};
use tauri::State;
use tokio::task;

#[derive(Debug, Serialize, Deserialize)]
pub struct SubmitMessage {
    pub ca: String,
    pub cert: String,
    pub key: String,
    pub thing: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ResponseMessage {
    pub thing: String,
    pub payload: String,
}

#[tauri::command]
async fn submit(message: SubmitMessage, appstate: State<'_, GlobalState>) -> Result<String, ()> {
    // idはフロントで生成して持ってきた方がいいね

    let SubmitMessage {
        ca,
        cert,
        key,
        thing,
    } = message;

    println!("ca = {:?}", ca);
    println!("cert = {:?}", cert);
    println!("key = {:?}", key);
    println!("thing = {:?}", thing);

    let cert_paths = vec![ca, cert, key];

    let cert_contents = file_reader::read_certificates(&appstate, &cert_paths).unwrap();

    let (client, eventloop) = mqtt::client::init(&cert_contents);

    let subscribe_topic = "status/monitor/".to_string() + &thing;
    let publish_topic = "monitor/get/".to_string() + &thing;
    let publish_payload = "{\"mode\": \"machine\"}".to_string();

    let mut monitor = Monitor::new(
        thing.clone(),
        "".to_string(),
        subscribe_topic.clone(),
        publish_topic.clone(),
    );

    println!("subscribe_topic = {:?}", subscribe_topic);
    println!("publish_topic = {:?}", publish_topic);

    task::spawn(async move {
        mqtt::client::subscribe(&client, &subscribe_topic)
            .await
            .unwrap();
        mqtt::client::publish(&client, &publish_topic, &publish_payload)
            .await
            .unwrap();
    });

    println!("Waiting for eventloop to poll event...");

    let received_data = mqtt::client::poll_event(eventloop).await.unwrap();
    println!("received_data = {:?}", received_data);

    monitor.payload = received_data.sensors.clone();

    appstate.add_monitor(monitor);

    Ok(received_data.sensors)
}

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![submit])
        .manage(GlobalState::new())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
