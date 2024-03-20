import { SecretNetworkClient, Wallet, coinsFromString } from "secretjs";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const wallet = new Wallet(process.env.MNEMONIC);

const contract_wasm = fs.readFileSync("../contract.wasm.gz");

const secretjs = new SecretNetworkClient({
  chainId: "pulsar-3",
  url: "https://api.pulsar3.scrttestnet.com",
  wallet: wallet,
  walletAddress: wallet.address,
});

// Declare global variables
let codeId;
let contractCodeHash;
let contractAddress;

let upload_contract = async () => {
  console.log("Starting deployment…");

  let tx = await secretjs.tx.compute.storeCode(
    {
      sender: wallet.address,
      wasm_byte_code: contract_wasm,
      source: "",
      builder: "",
    },
    {
      gasLimit: 4_000_000,
    }
  );

  codeId = Number(
    tx.arrayLog.find((log) => log.type === "message" && log.key === "code_id")
      .value
  );
  console.log("codeId: ", codeId);

  contractCodeHash = (
    await secretjs.query.compute.codeHashByCodeId({ code_id: codeId })
  ).code_hash;
  console.log(`Contract hash: ${contractCodeHash}`);
};

let instantiate_contract = async () => {
  if (!codeId || !contractCodeHash) {
    throw new Error("codeId or contractCodeHash is not set.");
  }
  console.log("Instantiating contract…");

  let init = {
    gateway_address: "secret10ex7r7c4y704xyu086lf74ymhrqhypayfk7fkj",
    gateway_hash:
      "012dd8efab9526dec294b6898c812ef6f6ad853e32172788f54ef3c305c1ecc5",
    gateway_key:
      "0x04173a82969fec6b375013438a650316c7c0ece9bdb0646057c34c61e25d752e6b851d56200ea3dd521f305d7dddff23ee2d40bf1d1f4bc8c592852eac9e7c8a74",
  };
  let tx = await secretjs.tx.compute.instantiateContract(
    {
      code_id: codeId,
      sender: wallet.address,
      code_hash: contractCodeHash,
      init_msg: init,
      label: "SnakePath Encrypt " + Math.ceil(Math.random() * 10000),
    },
    {
      gasLimit: 400_000,
    }
  );

  //Find the contract_address in the logs
  const contractAddress = tx.arrayLog.find(
    (log) => log.type === "message" && log.key === "contract_address"
  ).value;

  console.log("contract address: ", contractAddress);
};

// Chain the execution using promises
upload_contract()
  .then(() => {
    instantiate_contract();
  })
  .catch((error) => {
    console.error("Error:", error);
  });
