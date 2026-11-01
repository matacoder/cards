//! The state file, and moving it from the Electron releases, which were named "Cards".
use std::fs;
use std::io;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

pub const STATE_FILE: &str = "cards-state.json";

/// The card and settings windows both edit the file. A write based on an outdated read is
/// refused, and the caller redoes its change on fresh data, so no change gets lost.
pub struct Store {
    dir: PathBuf,
    revision: Mutex<u64>,
}

impl Store {
    pub fn new(dir: PathBuf) -> Self {
        Self { dir, revision: Mutex::new(0) }
    }

    pub fn read(&self) -> (u64, Option<String>) {
        let revision = self.revision.lock().unwrap();
        (*revision, read(&self.dir))
    }

    pub fn write(&self, based_on: u64, json: &str) -> io::Result<bool> {
        let mut revision = self.revision.lock().unwrap();
        if *revision != based_on {
            return Ok(false);
        }
        write(&self.dir, json)?;
        *revision += 1;
        Ok(true)
    }
}

pub fn read(dir: &Path) -> Option<String> {
    fs::read_to_string(dir.join(STATE_FILE)).ok()
}

pub fn write(dir: &Path, json: &str) -> io::Result<()> {
    fs::create_dir_all(dir)?;
    let tmp = dir.join(format!("{STATE_FILE}.tmp"));
    fs::write(&tmp, json)?;
    fs::rename(tmp, dir.join(STATE_FILE))
}

/// Copies the old state once. Never overwrites, and the old file stays as a backup.
pub fn migrate_legacy(dir: &Path, legacy_dir: &Path) -> io::Result<bool> {
    let target = dir.join(STATE_FILE);
    let legacy = legacy_dir.join(STATE_FILE);
    if target == legacy || target.exists() || !legacy.exists() {
        return Ok(false);
    }
    fs::create_dir_all(dir)?;
    fs::copy(legacy, target)?;
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicU32, Ordering};

    static NEXT: AtomicU32 = AtomicU32::new(0);

    fn dirs() -> (PathBuf, PathBuf) {
        let id = NEXT.fetch_add(1, Ordering::SeqCst);
        let root = std::env::temp_dir().join(format!("vocapeek-test-{}-{id}", std::process::id()));
        let _ = fs::remove_dir_all(&root);
        fs::create_dir_all(root.join("Cards")).unwrap();
        (root.join("Vocapeek"), root.join("Cards"))
    }

    #[test]
    fn copies_old_progress_and_keeps_the_original() {
        let (dir, legacy) = dirs();
        fs::write(legacy.join(STATE_FILE), "old").unwrap();
        assert!(migrate_legacy(&dir, &legacy).unwrap());
        assert_eq!(read(&dir).unwrap(), "old");
        assert!(legacy.join(STATE_FILE).exists());
    }

    #[test]
    fn never_overwrites_existing_progress() {
        let (dir, legacy) = dirs();
        fs::write(legacy.join(STATE_FILE), "old").unwrap();
        write(&dir, "new").unwrap();
        assert!(!migrate_legacy(&dir, &legacy).unwrap());
        assert_eq!(read(&dir).unwrap(), "new");
    }

    #[test]
    fn clean_install_does_nothing() {
        let (dir, legacy) = dirs();
        assert!(!migrate_legacy(&dir, &legacy).unwrap());
        assert!(read(&dir).is_none());
    }

    #[test]
    fn write_from_an_outdated_read_is_refused() {
        let (dir, _) = dirs();
        let store = Store::new(dir);
        let (first, _) = store.read();
        let (second, _) = store.read();
        assert!(store.write(first, "first").unwrap());
        assert!(!store.write(second, "second").unwrap());
        assert_eq!(store.read().1.unwrap(), "first");
    }

    #[test]
    fn write_replaces_the_whole_file() {
        let (dir, _) = dirs();
        write(&dir, "first, longer").unwrap();
        write(&dir, "second").unwrap();
        assert_eq!(read(&dir).unwrap(), "second");
    }
}
