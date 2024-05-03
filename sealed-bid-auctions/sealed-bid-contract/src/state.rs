use cosmwasm_std::{Addr, Binary};
use secret_toolkit::storage::{Item, Keymap};

use schemars::JsonSchema;
use serde::{Deserialize, Serialize};

pub static CONFIG: Item<State> = Item::new(b"config");
pub static AUCTION_MAP: Keymap<u32, AuctionItem> = Keymap::new(b"AUCTION_MAP");
pub static BID_MAP: Keymap<u32, Vec<BidItem>> = Keymap::new(b"BID_MAP");

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct State {
    pub gateway_address: Addr,
    pub gateway_hash: String,
    pub gateway_key: Binary,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AuctionItem {
    pub name: String,
    pub description: String,
    pub end_time: u64,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct BidItem {
    pub amount: String,
    pub bidder_address: String,
    pub index: u32,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, JsonSchema)]
pub struct AuctionBids {
    pub bids: Vec<BidItem>,
}
