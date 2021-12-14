const HDWalletProvider = require('@truffle/hdwallet-provider');
const { mnemonic } = require('./secrets.json');

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1',
      port: 7545,
      network_id: '*', // Match any network id
    },
    rinkeby: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `wss://rinkeby.infura.io/ws/v3/91dd495617a44c508e7669a2cda75255`
        ),
      network_id: 4,
      gas: 5000000,
      gasPrice: 45000000000,
      skipDryRun: true,
      networkCheckTimeout: 100000000,
      websocket: true,
    },
  },
  compilers: {
    solc: {
      version: '0.8.0', // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      // settings: {          // See the solidity docs for advice about optimization and evmVersion
      //  optimizer: {
      //    enabled: false,
      //    runs: 200
      //  },
      //  evmVersion: "byzantium"
      // }
    },
  },
};
