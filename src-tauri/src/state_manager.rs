use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Mutex};
use uuid::Uuid;

use crate::mqtt::parse_json;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Monitor {
    pub uuid: Uuid,
    pub thing: String,
    pub sub_topic: String,
    pub pub_topic: String,
    pub services: parse_json::ServicesStatus,
    pub sensors: parse_json::SensorStatus,
    pub record: parse_json::RecordStatus,
}

impl Monitor {
    pub fn new(
        uuid: String,
        thing: String,
        sub_topic: String,
        pub_topic: String,
        services: String,
        sensors: String,
        record: String,
    ) -> Self {
        let Ok(services) = parse_json::parse_services(services.as_bytes()) else {
            panic!("services parse error");
        };
        let Ok(sensors) = parse_json::parse_sensors(sensors.as_bytes()) else {
            panic!("sensors parse error");
        };
        let Ok(record) = parse_json::parse_record(record.as_bytes()) else {
            panic!("record parse error");
        };
        Self {
            uuid: Uuid::parse_str(uuid.as_str()).unwrap(),
            thing,
            sub_topic,
            pub_topic,
            services,
            sensors,
            record,
        }
    }
}

pub struct GlobalState(Mutex<AppState>);

pub struct AppState {
    file_cache: HashMap<String, Vec<u8>>,
    monitors: HashMap<Uuid, Monitor>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            file_cache: HashMap::new(),
            monitors: HashMap::new(),
        }
    }
}

impl GlobalState {
    pub fn new() -> Self {
        Self(Mutex::new(AppState::new()))
    }

    pub fn get_file_cache(&self) -> HashMap<String, Vec<u8>> {
        self.0.lock().unwrap().file_cache.clone()
    }

    pub fn add_file_to_cache(&self, file_name: String, file: Vec<u8>) {
        self.0.lock().unwrap().file_cache.insert(file_name, file);
    }

    pub fn get_monitor(&self, id: Uuid) -> Option<Monitor> {
        let state = self.0.lock().unwrap();
        state.monitors.get(&id).cloned()
    }

    pub fn add_monitor(&self, id: Uuid, monitor: Monitor) {
        let mut state = self.0.lock().unwrap();
        state.monitors.insert(id, monitor);
    }
}

pub mod commands {
    // use tauri::State;

    // use super::*;

    // #[tauri::command]
    // pub fn person_list(person_manager: State<'_, PersonManager>) -> Result<Vec<Person>, String> {
    //     let person_list = person_manager.person_list();
    //     Ok(person_list)
    // }

    // #[tauri::command]
    // pub fn person_add(person_manager: State<'_, PersonManager>) -> Result<(), String> {
    //     person_manager.add_new_person();
    //     Ok(())
    // }

    // #[tauri::command]
    // pub fn person_clean(person_manager: State<'_, PersonManager>) -> Result<(), String> {
    //     person_manager.clean();
    //     Ok(())
    // }
}
