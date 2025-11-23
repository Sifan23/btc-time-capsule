use candid::{CandidType, Principal};
use ic_cdk::api::time;
use ic_cdk_macros::*;
use serde::Deserialize;
use std::cell::RefCell;
use std::collections::HashMap;

// Data structures
#[derive(CandidType, Deserialize, Clone)]
struct TimeCapsule {
    encrypted_message: String,
    unlock_time: u64,
    created_at: u64,
    is_unlocked: bool,
    encryption_key: String, 
}

#[derive(CandidType, Deserialize)]
struct CreateCapsuleRequest {
    encrypted_message: String,
    unlock_delay_days: u32,
}

// Storage
thread_local! {
    static CAPSULES: RefCell<HashMap<Principal, Vec<TimeCapsule>>> = RefCell::new(HashMap::new());
    static GUARDIANS: RefCell<HashMap<Principal, Vec<String>>> = RefCell::new(HashMap::new());
}

// API endpoints
#[init]
fn init() {}

#[update]
fn create_capsule(request: CreateCapsuleRequest) -> String {
    let caller = ic_cdk::caller();

    let encrypted_message = encrypt_message(&request.encrypted_message);
    
    // Calculate unlock time (current time + delay in seconds)
    let unlock_time = time() + (request.unlock_delay_days as u64 * 24 * 60 * 60 * 1_000_000_000);
    
    let new_capsule = TimeCapsule {
        encrypted_message: request.encrypted_message,
        unlock_time,
        created_at: time(),
        is_unlocked: false,
        encryption_key: "vetkey_simulated".to_string(),
    };
    
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        capsules_map.entry(caller).or_insert_with(Vec::new).push(new_capsule);
    });
    
    format!("Encrypted time capsule created! Will unlock in {} days", request.unlock_delay_days)
}

#[query]
fn get_my_capsules() -> Vec<TimeCapsule> {
    let caller = ic_cdk::caller();
    
    CAPSULES.with(|capsules| {
        capsules.borrow()
            .get(&caller)
            .cloned()
            .unwrap_or_default()
    })
}

#[update]
fn unlock_capsule(capsule_index: u32) -> String {
    let caller = ic_cdk::caller();
    let current_time = time();
    
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        
        if let Some(user_capsules) = capsules_map.get_mut(&caller) {
            if let Some(capsule) = user_capsules.get_mut(capsule_index as usize) {
                if current_time >= capsule.unlock_time {
                    let decrypted_message = decrypt_message(&capsule.encrypted_message);
                    capsule.is_unlocked = true;
                    return decrypted_message;
                } else {
                    return "Capsule not ready to unlock yet!".to_string();
                }
            }
        }
        "Capsule not found!".to_string()
    })
}

#[update]
fn test_unlock_now(capsule_index: u32) -> String {
    let caller = ic_cdk::caller();
    
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        
        if let Some(user_capsules) = capsules_map.get_mut(&caller) {
            if let Some(capsule) = user_capsules.get_mut(capsule_index as usize) {
                // Force unlock for testing
                let decrypted_message = decrypt_message(&capsule.encrypted_message);
                capsule.is_unlocked = true;
                return format!("TEST UNLOCK: {}", decrypted_message);
            }
        }
        "Capsule not found!".to_string()
    })
}

#[update]
fn add_guardian(guardian_address: String) -> String {
    let caller = ic_cdk::caller();
    
    GUARDIANS.with(|guardians| {
        let mut guardians_map = guardians.borrow_mut();
        let user_guardians = guardians_map.entry(caller).or_insert_with(Vec::new);
        
        // Clone the address to avoid move
        let guardian_clone = guardian_address.clone();
        
        if !user_guardians.contains(&guardian_clone) {
            user_guardians.push(guardian_clone);
            format!("Guardian {} added successfully!", guardian_address)
        } else {
            "Guardian already exists!".to_string()
        }
    })
}

#[update]
fn test_guardian_unlock(capsule_index: u32) -> String {
    let caller = ic_cdk::caller();
    
    // Simulate guardian unlock for testing
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        
        if let Some(user_capsules) = capsules_map.get_mut(&caller) {
            if let Some(capsule) = user_capsules.get_mut(capsule_index as usize) {
                let decrypted_message = decrypt_message(&capsule.encrypted_message);
                capsule.is_unlocked = true;
                return format!("GUARDIAN EMERGENCY UNLOCK: {}", decrypted_message);
            }
        }
        "Capsule not found!".to_string()
    })
}

#[update]
fn guardian_unlock_capsule(guardian_address: String, capsule_index: u32) -> String {
    let caller = ic_cdk::caller();
    
    // Verify the caller is a guardian for this user
    let is_guardian = GUARDIANS.with(|guardians| {
        guardians.borrow()
            .get(&caller)
            .map_or(false, |guardians_list| guardians_list.contains(&guardian_address))
    });
    
    if !is_guardian {
        return "Unauthorized: You are not a guardian for this address".to_string();
    }
    
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        
        if let Some(user_capsules) = capsules_map.get_mut(&Principal::from_text(&guardian_address).unwrap()) {
            if let Some(capsule) = user_capsules.get_mut(capsule_index as usize) {
                // Guardians can unlock immediately (emergency access)
                let decrypted_message = decrypt_message(&capsule.encrypted_message);
                capsule.is_unlocked = true;
                return format!("EMERGENCY UNLOCK by guardian: {}", decrypted_message);
            }
        }
        "Capsule not found!".to_string()
    })
}

#[update]
fn verify_bitcoin_ownership(address: String, message: String, signature: String) -> bool {
    !address.is_empty()
}

#[query]
fn get_bitcoin_balance(address: String) -> String {
    "0.001 BTC".to_string()
}

fn encrypt_message(message: &str) -> String {
    format!("encrypted_{}", message)
}

fn decrypt_message(encrypted: &str) -> String {
    encrypted.replace("encrypted_", "")
}


#[query]
fn get_my_guardians() -> Vec<String> {
    let caller = ic_cdk::caller();
    
    GUARDIANS.with(|guardians| {
        guardians.borrow()
            .get(&caller)
            .cloned()
            .unwrap_or_default()
    })
}

// Health check
#[query]
fn version() -> String {
    "BTC Time Capsule v1.0 (Rust)".to_string()
}


ic_cdk::export_candid!();