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
    
    // Calculate unlock time (current time + delay in seconds)
    let unlock_time = time() + (request.unlock_delay_days as u64 * 24 * 60 * 60 * 1_000_000_000);
    
    let new_capsule = TimeCapsule {
        encrypted_message: request.encrypted_message,
        unlock_time,
        created_at: time(),
        is_unlocked: false,
    };
    
    CAPSULES.with(|capsules| {
        let mut capsules_map = capsules.borrow_mut();
        capsules_map.entry(caller).or_insert_with(Vec::new).push(new_capsule);
    });
    
    format!("Time capsule created! Will unlock in {} days", request.unlock_delay_days)
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
fn add_guardian(guardian_address: String) -> String {
    let caller = ic_cdk::caller();
    
    GUARDIANS.with(|guardians| {
        let mut guardians_map = guardians.borrow_mut();
        guardians_map.entry(caller).or_insert_with(Vec::new).push(guardian_address);
    });
    
    "Guardian added successfully!".to_string()
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

// Export Candid interface
ic_cdk::export_candid!();