use rumqttc::{self, AsyncClient, EventLoop, Key, MqttOptions, QoS, TlsConfiguration, Transport};
use std::{error::Error, time::Duration};

use crate::mqtt::parse_json::parse_whole;

use super::parse_json::ReceivedData;

pub fn init(cert_contents: &[Vec<u8>]) -> (AsyncClient, EventLoop) {
    let mut mqttoptions = MqttOptions::new(
        "test-1",
        "a3s7ndurym0i2s-ats.iot.ap-northeast-1.amazonaws.com",
        8883,
    );
    mqttoptions.set_keep_alive(Duration::from_secs(5));

    let client_ca = cert_contents[0].clone();
    let client_cert = cert_contents[1].clone();
    let client_key = cert_contents[2].clone();

    let transport = Transport::Tls(TlsConfiguration::Simple {
        ca: client_ca,
        alpn: None,
        client_auth: Some((client_cert, Key::RSA(client_key))),
    });

    mqttoptions.set_transport(transport);

    AsyncClient::new(mqttoptions, 10)
}

pub async fn subscribe(client: &AsyncClient, topic: &str) -> Result<(), rumqttc::ClientError> {
    client.subscribe(topic, QoS::AtMostOnce).await
}

pub async fn publish(
    client: &AsyncClient,
    topic: &str,
    payload: &str,
) -> Result<(), rumqttc::ClientError> {
    client.publish(topic, QoS::AtMostOnce, false, payload).await
}

pub async fn poll_event(mut eventloop: EventLoop) -> Result<ReceivedData, Box<dyn Error>> {
    while let Ok(event) = eventloop.poll().await {
        if let rumqttc::Event::Incoming(rumqttc::Incoming::Publish(packet)) = event {
            let received_data = parse_whole(packet.payload.as_ref());
            match received_data {
                Ok(received_data) => {
                    return Ok(received_data);
                }
                Err(e) => {
                    return Err(e.into());
                }
            }
        }
    }
    Err("Error".into())
}
