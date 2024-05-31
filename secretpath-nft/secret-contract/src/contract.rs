use crate::{
    msg::{
        ExecuteMsg, GatewayMsg, InstantiateMsg, MetadataStoreMsg, QueryMsg, ResponseMetadataRetrieveMsg, ResponseMsg, ResponsePrivateMetadataRetrieveMsg
    },
    state::{ConfidentialMetadata, State, CONFIDENTIAL_METADATA, CONFIG},
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

#[entry_point]
pub fn query(deps: Deps, _env: Env, msg: QueryMsg) -> StdResult<Binary> {
    let response = match msg {
        QueryMsg::RetrieveMetadata {token_id} => retrieve_metadata(deps, token_id),
        QueryMsg::RetrievePrivateMetadata {token_id, password } => retrieve_private_metadata(deps, token_id, password)
    };
    pad_query_result(response, BLOCK_SIZE)
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
        "execute_store_confidential_metadata" => execute_store_confidential_metadata(
            deps,
            env,
            msg.input_values,
            msg.task,
            msg.input_hash,
        ),
        _ => Err(StdError::generic_err("invalid handle".to_string())),
    }
}

fn execute_store_confidential_metadata(
    deps: DepsMut,
    _env: Env,
    input_values: String,
    task: Task,
    input_hash: Binary,
) -> StdResult<Response> {
    let config = CONFIG.load(deps.storage)?;

    let input: MetadataStoreMsg = serde_json_wasm::from_str(&input_values)
    .map_err(|err| StdError::generic_err(err.to_string()))?;

    let owner = input.owner;
    let uri = input.uri;
    let token_id = input
    .token_id
    .parse::<u64>()
    .map_err(|err| StdError::generic_err(format!("Invalid index: {}", err)))?;
    let private_metadata = input.private_metadata;
    let password = input.password;

    let confidential_metadata = ConfidentialMetadata {
        owner: owner,
        token_id: token_id,
        uri: uri,
        private_metadata: private_metadata,
        password: password,
    };

    CONFIDENTIAL_METADATA.insert(deps.storage, &token_id, &confidential_metadata)?;

    let data = ResponseMsg {
        message: "Metadata stored successfully".to_string(),
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
        .add_attribute("status", "confidential metadata storage complete!"))
}

fn retrieve_metadata(deps: Deps, token_id:u64) -> StdResult<Binary> {
    let value = CONFIDENTIAL_METADATA
        .get(deps.storage, &token_id)
        .ok_or_else(|| StdError::generic_err("Value not found"))?;

    to_binary(&ResponseMetadataRetrieveMsg {
        owner: value.owner,
        token_id: value.token_id,
        uri: value.uri,
       
    })
}

fn retrieve_private_metadata(deps: Deps, token_id:u64, password: String) -> StdResult<Binary> {
    let value = CONFIDENTIAL_METADATA
        .get(deps.storage, &token_id)
        .ok_or_else(|| StdError::generic_err("Value not found"))?;

    if value.password != password {
        return Err(StdError::generic_err("Invalid password"));
    }

    to_binary(&ResponsePrivateMetadataRetrieveMsg {
        private_metadata: value.private_metadata,
    })
}
