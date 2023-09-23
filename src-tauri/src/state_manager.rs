use std::{collections::HashMap, sync::Mutex};
use uuid::Uuid;

#[derive(Clone)]
pub struct Monitor {
    pub thing: String,
    pub sub_topic: String,
    pub pub_topic: String,
    pub payload: String,
}

impl Monitor {
    pub fn new(thing: String, payload: String, sub_topic: String, pub_topic: String) -> Self {
        Self {
            thing,
            payload,
            sub_topic,
            pub_topic,
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

    // pub fn get_monitors(&self) -> HashMap<Uuid, Monitor> {
    //     self.0.lock().unwrap().monitors.clone()
    // }

    pub fn add_monitor(&self, monitor: Monitor) -> Uuid {
        let mut state = self.0.lock().unwrap();
        let id = Uuid::new_v4();
        state.monitors.insert(id, monitor);
        id
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
