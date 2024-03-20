import { SecretNetworkClient } from "secretjs";

const routing_contract = "secret1pfg825wflcl40dqpd3yj96zhevnlxkh35hedks"; //the contract you want to call in secret
const routing_code_hash =
  "fc5007efb0580334be20142a3011f34101be681eaa2fe277ee429f4d76107876"; //its codehash

let query = async () => {
  const key = "this is my key";
  const viewing_key = "this is my viewing key";

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
