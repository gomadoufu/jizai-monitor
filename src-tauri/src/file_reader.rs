use std::{error::Error, fs::File, io::Read};

use tauri::State;

use crate::state_manager::GlobalState;

pub fn read_certificates(
    state: &State<GlobalState>,
    paths: &Vec<String>,
) -> Result<Vec<Vec<u8>>, Box<dyn Error>> {
    let mut contents = vec![];
    let cache = state.get_file_cache();
    for path in paths {
        if let Some(cache_item) = cache.get(path) {
            contents.push(cache_item.to_owned());
            continue;
        }
        let content = read_file(path)?;
        contents.push(content.clone());
        state.add_file_to_cache(path.to_string(), content);
    }
    Ok(contents)
}

fn read_file(path_to_file: &str) -> Result<Vec<u8>, Box<dyn Error>> {
    dbg!(path_to_file);
    let mut buf = vec![];
    let mut file = File::open(path_to_file)?;
    let _ = file.read_to_end(&mut buf)?;
    Ok(buf)
}
