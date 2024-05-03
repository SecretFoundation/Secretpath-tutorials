use crate::{
    msg::{
        AuctionItemStoreMsg, BidItemStoreMsg, ExecuteMsg, GatewayMsg, InstantiateMsg, QueryMsg,
        ResponseRetrieveAuctionItemMsg, ResponseRetrieveBidsMsg, ResponseStoreAuctionItemMsg,
    },
    state::{AuctionItem, BidItem, State, AUCTION_MAP, BID_MAP, CONFIG},
};
use cosmwasm_std::{
    entry_point, to_binary, Binary, Deps, DepsMut, Env, MessageInfo, Response, StdError, StdResult,
};
use secret_toolkit::utils::{pad_handle_result, pad_query_result, HandleCallback};
use tnls::{
    msg::{PostExecutionMsg, PrivContractHandleMsg},
    state::Task,
};

/// pad handle responses and log attributes to blocks of 256 bytes to prevent leaking info based on
/// response size
pub const BLOCK_SIZE: usize = 256;

#[entry_point]
pub fn instantiate(
    deps: DepsMut,
    _env: Env,
    _info: MessageInfo,
    msg: InstantiateMsg,
) -> StdResult<Response> {
    let state = State {
        gateway_address: msg.gateway_address,
        gateway_hash: msg.gateway_hash,
        gateway_key: msg.gateway_key,
    };

    CONFIG.save(deps.storage, &state)?;

    Ok(Response::default())
}

#[entry_point]
pub fn execute(deps: DepsMut, env: Env, info: MessageInfo, msg: ExecuteMsg) -> StdResult<Response> {
    let response = match msg {
        ExecuteMsg::Input { message } => try_handle(deps, env, info, message),
    };
    pad_handle_result(response, BLOCK_SIZE)
}

// acts like a gateway message handle filter
fn try_handle(
    deps: DepsMut,
    env: Env,
    _info: MessageInfo,
    msg: PrivContractHandleMsg,
) -> StdResult<Response> {
    // verify signature with stored gateway public key
    let gateway_key = CONFIG.load(deps.storage)?.gateway_key;
    deps.api
        .secp256k1_verify(
            msg.input_hash.as_slice(),
            msg.signature.as_slice(),
            gateway_key.as_slice(),
        )
        .map_err(|err| StdError::generic_err(err.to_string()))?;

    // determine which function to call based on the included handle
    let handle = msg.handle.as_str();
    match handle {
        "create_auction_item" => {
            create_auction_item(deps, env, msg.input_values, msg.task, msg.input_hash)
        }
        "create_bid" => create_bid(deps, env, msg.input_values, msg.task, msg.input_hash),

        _ => Err(StdError::generic_err("invalid handle".to_string())),
    }
}

fn create_auction_item(
    deps: DepsMut,
    env: Env,
    input_values: String,
    task: Task,
    input_hash: Binary,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;

    let input: AuctionItemStoreMsg = serde_json_wasm::from_str(&input_values)
        .map_err(|err| StdError::generic_err(err.to_string()))?;

    // Parse the index as u32
    let end_time = input
        .end_time
        .parse::<u64>()
        .map_err(|err| StdError::generic_err(format!("Invalid index: {}", err)))?;

    let auction_end = calculate_future_block_height(env.block.height, end_time);

    let auction_item = AuctionItem {
        name: input.name,
        description: input.description,
        end_time: auction_end,
    };

    // Extract KeyIter from Result, handle error if necessary
    let key_iter_result = AUCTION_MAP.iter_keys(deps.storage);
    let mut max_key: u32 = 0;

    for key in key_iter_result? {
        max_key = max_key.max(key?);
    }
    let new_key = max_key + 1;

    // Insert the new auction item with the new key
    AUCTION_MAP.insert(deps.storage, &new_key, &auction_item)?;

    let data = ResponseStoreAuctionItemMsg {
        message: "Value store completed successfully".to_string(),
    };

    let json_string =
        serde_json_wasm::to_string(&data).map_err(|err| StdError::generic_err(err.to_string()))?;

    let result = base64::encode(json_string);

    let callback_msg = GatewayMsg::Output {
        outputs: PostExecutionMsg {
            result,
            task,
            input_hash,
        },
    }
    .to_cosmos_msg(
        config.gateway_hash,
        config.gateway_address.to_string(),
        None,
    )?;

    Ok(Response::new()
        .add_message(callback_msg)
        .add_attribute("status", "stored value with key"))
}

fn create_bid(
    deps: DepsMut,
    env: Env,
    input_values: String,
    task: Task,
    input_hash: Binary,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;

    let input: BidItemStoreMsg = serde_json_wasm::from_str(&input_values)
        .map_err(|err| StdError::generic_err(err.to_string()))?;

    // Parse the index as u32
    let index = input
        .index
        .parse::<u32>()
        .map_err(|err| StdError::generic_err(format!("Invalid index: {}", err)))?;

    let auction_item = AUCTION_MAP
        .get(deps.storage, &index)
        .ok_or_else(|| StdError::generic_err("Auction item not found"))?;

    let max_block_height = auction_item.end_time;

    // Check if the current block height has surpassed the maximum allowed block height for bidding
    if env.block.height > max_block_height {
        return Err(StdError::generic_err("Bidding period has ended"));
    }

    let storage_item = BidItem {
        amount: input.amount,
        bidder_address: input.bidder_address,
        index: index,
    };

    // Attempt to retrieve the existing bids for the auction item
    let bids_result = BID_MAP.get(deps.storage, &storage_item.index);

    let mut auction_bids: Vec<BidItem> = match bids_result {
        Some(bids) => bids, // If there are existing bids
        None => Vec::new(), // If no bids are found, start with an empty vector
    };

    // Add the new bid
    auction_bids.push(storage_item.clone());

    // Save the updated bids back to storage
    BID_MAP.insert(deps.storage, &storage_item.index, &auction_bids)?;

    let data = ResponseStoreAuctionItemMsg {
        message: "Bid stored successfully".to_string(),
    };

    // Serialize the struct to a JSON string
    let json_string =
        serde_json_wasm::to_string(&data).map_err(|err| StdError::generic_err(err.to_string()))?;

    // Encode the JSON string to base64
    let result = base64::encode(json_string);

    let callback_msg = GatewayMsg::Output {
        outputs: PostExecutionMsg {
            result,
            task,
            input_hash,
        },
    }
    .to_cosmos_msg(
        config.gateway_hash,
        config.gateway_address.to_string(),
        None,
    )?;

    Ok(Response::new()
        .add_message(callback_msg)
        .add_attribute("status", "Bid stored with key"))
}

#[entry_point]
pub fn query(deps: Deps, env: Env, msg: QueryMsg) -> StdResult<Binary> {
    let response = match msg {
        QueryMsg::RetrieveAuctionItem { key } => retrieve_auction_item_query(deps, key),
        QueryMsg::RetrieveBids { key } => retrieve_bids_query(env, deps, key),
    };
    pad_query_result(response, BLOCK_SIZE)
}

fn retrieve_auction_item_query(deps: Deps, key: u32) -> StdResult<Binary> {
    let value = AUCTION_MAP
        .get(deps.storage, &key)
        .ok_or_else(|| StdError::generic_err("Value not found"))?;

    to_binary(&ResponseRetrieveAuctionItemMsg {
        message: "Retrieved value successfully".to_string(),
        end_time: value.end_time,
        name: value.name,
        description: value.description,
    })
}

fn retrieve_bids_query(env: Env, deps: Deps, key: u32) -> StdResult<Binary> {
    // Retrieve the bids for the given auction item key
    let bids = BID_MAP
        .get(deps.storage, &key)
        .ok_or_else(|| StdError::generic_err("Bids not found for the given auction item"))?;

    let auction = AUCTION_MAP
        .get(deps.storage, &key)
        .ok_or_else(|| StdError::generic_err("Value not found"))?;

    let max_block_height = auction.end_time;

    // Check if the current block height has surpassed the maximum allowed block height for bidding
    if env.block.height > max_block_height {
        // Attempt to find the highest bid.
        let highest_bid = bids
            .iter()
            .map(|bid| BidItem {
                amount: bid.amount.clone(),
                bidder_address: bid.bidder_address.clone(),
                index: bid.index,
            })
            // Convert the amount from String to a numeric type, here I'm using u64 for the example.
            // You'll need to handle possible parse errors. Here, we filter out any items that can't be parsed.
            .filter_map(|bid| bid.amount.parse::<u64>().ok().map(|amount| (amount, bid)))
            // Now find the maximum by the numeric amount
            .max_by_key(|&(amount, _)| amount)
            // We only care about the BidItem, not the amount, so extract it, if present.
            .map(|(_, bid)| bid);

        // highest_bid is an Option<BidItem>, handle it as you need, e.g., unwrap, expect, or match for error handling.

        let message = match &highest_bid {
            Some(bid) => format!("Bidding is closed. The highest bid is: ${}", bid.amount),
            None => "Bidding is closed".to_string(),
        };

        // Serialize the response with bids
        to_binary(&ResponseRetrieveBidsMsg { message: message })
    } else {
        to_binary(&ResponseRetrieveBidsMsg {
            message: "Bidding is open".to_string(),
        })
    }
}

fn calculate_future_block_height(current_block_height: u64, minutes_into_future: u64) -> u64 {
    let average_block_time_seconds = 6; // Rounded average block time in seconds for simplification
    let seconds_into_future = minutes_into_future * 60; // Convert minutes into seconds

    // Calculate how many blocks will be produced in that time using integer arithmetic
    let blocks_to_be_added = seconds_into_future / average_block_time_seconds;

    // Calculate and return the future block height
    current_block_height + blocks_to_be_added as u64
}
