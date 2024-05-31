use cosmwasm_std::{Addr, Binary};
use secret_toolkit::storage::{Item, Keymap};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub static CONFIG: Item<State> = Item::new(b"config");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub gateway_address: Addr,
    pub gateway_hash: String,
    pub gateway_key: Binary,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct ConfidentialMetadata {
    pub owner: String,
    pub token_id: u64,
    pub uri: String,
    pub private_metadata: String, 
    pub password: String,
}

pub static CONFIDENTIAL_METADATA: Keymap<u64, ConfidentialMetadata> =
    Keymap::new(b"confidential_metadata");
