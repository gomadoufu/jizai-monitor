use rumqttc::{self, AsyncClient, EventLoop, Key, MqttOptions, QoS, TlsConfiguration, Transport};
use std::{error::Error, time::Duration};

pub fn init(uuid: String, cert_contents: &[Vec<u8>]) -> (AsyncClient, EventLoop) {
    let mut mqttoptions = MqttOptions::new(
        uuid,
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
    mqttoptions.set_max_packet_size(std::u16::MAX as usize, std::u16::MAX as usize);

    AsyncClient::new(mqttoptions, 30)
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

pub async fn poll_event(topic: &str, eventloop: &mut EventLoop) -> Result<Vec<u8>, Box<dyn Error>> {
    while let Ok(event) = eventloop.poll().await {
        println!("{:?}", event);
        if let rumqttc::Event::Incoming(rumqttc::Incoming::Publish(packet)) = event {
            if packet.topic != topic {
                continue;
            }
            return Ok(packet.payload.to_vec());
        }
        if let rumqttc::Event::Outgoing(rumqttc::Outgoing::PingReq) = event {
            return Err("MQTT通信に失敗しました".into());
        }
    }
    Err("MQTT通信に失敗しました".into())
}
