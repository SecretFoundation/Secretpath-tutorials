import { SecretNetworkClient } from "secretjs";

const routing_contract = "secret1hsy2pj2846jnprfq9xmvdcrlukxh0lzrddtn97"; //the contract you want to call in secret
const routing_code_hash =
  "6311a3f85261fc720d9a61e4ee46fae1c8a23440122b2ed1bbcebf49e3e46ad2"; //its codehash

let query = async () => {
  const key = "key";
  const viewing_key = "viewing_key";

  const secretjs = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net",
    chainId: "pulsar-3",
  });

  const query_tx = await secretjs.query.compute.queryContract({
    contract_address: routing_contract,
    code_hash: routing_code_hash,
    query: { retrieve_value: { key: key, viewing_key: viewing_key } },
  });
  console.log(query_tx);
};

query();
