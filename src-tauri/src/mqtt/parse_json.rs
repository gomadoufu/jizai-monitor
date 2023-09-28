use std::collections::HashMap;

use serde::{Deserialize, Serialize};

pub enum Parsable {
    Parsed(ReceivedData),
    Raw(Vec<u8>),
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ReceivedData {
    #[serde(rename = "services")]
    pub services: String,
    #[serde(rename = "sensors")]
    pub sensors: String,
    #[serde(rename = "latest-record")]
    pub record: String,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ServiceStatus {
    #[serde(rename = "Name")]
    pub name: String,
    #[serde(rename = "Active")]
    pub active: bool,
    #[serde(rename = "PID")]
    pub pid: u32,
    #[serde(rename = "CGroup")]
    pub cgroup: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct ServicesStatus(Vec<ServiceStatus>);

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct CoreTemp {
    #[serde(rename = "Adapter")]
    pub adapter: String,
    #[serde(rename = "Package id 0")]
    pub temps: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct WifiTemp {
    #[serde(rename = "Adapter")]
    pub adapter: String,
    #[serde(rename = "temp1")]
    pub temps: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct AcpiTemp {
    #[serde(rename = "Adapter")]
    pub adapter: String,
    #[serde(rename = "temp1")]
    pub temps: HashMap<String, f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SensorStatus {
    #[serde(rename = "coretemp-isa-0000")]
    pub coretemp: CoreTemp,
    #[serde(rename = "acpitz-acpi-0")]
    pub acpitz_acpi: AcpiTemp,
    #[serde(rename = "iwlwifi_1-virtual-0")]
    pub iwlwifi: WifiTemp,
}

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RecordStatus {
    pub time: String,
    pub record: String,
    pub length: String,
}

pub fn parse_whole(data: &[u8]) -> Parsable {
    serde_json::from_slice(data)
        .map(Parsable::Parsed)
        .unwrap_or_else(|_| Parsable::Raw(data.to_vec()))
}

pub fn parse_services(data: &[u8]) -> Result<ServicesStatus, serde_json::Error> {
    serde_json::from_slice(data)
}

pub fn parse_sensors(data: &[u8]) -> Result<SensorStatus, serde_json::Error> {
    serde_json::from_slice(data)
}

pub fn parse_record(data: &[u8]) -> Result<RecordStatus, serde_json::Error> {
    serde_json::from_slice(data)
}
