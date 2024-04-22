import { SecretNetworkClient } from "secretjs";

let query = async () => {
  const secretjs = new SecretNetworkClient({
    url: "https://lcd.testnet.secretsaturn.net",
    chainId: "pulsar-3",
  });

  const query_tx = await secretjs.query.compute.queryContract({
    contract_address: "secret1xntd537a3vvv65d67m3pxc0e42pxv40h0wrel6",
    code_hash:
      "6d38a8569aba096b0849253dbf8de09b9c72dd693f2a6d1d87697fc0877cbc29",
    query: { retrieve_auction_item: { key: 13 } },
  });
  console.log(query_tx);
};

query();
