App = {
  web3Provider: null,
  contracts: {},
  emptyAddress: '0x0000000000000000000000000000000000000000',
  sku: 0,
  upc: 0,
  metamaskAccountID: '0x0000000000000000000000000000000000000000',
  ownerID: '0x0000000000000000000000000000000000000000',
  originFarmerID: '0x0000000000000000000000000000000000000000',
  originFarmName: null,
  originFarmInformation: null,
  originFarmLatitude: null,
  originFarmLongitude: null,
  productNotes: null,
  productPrice: 0,
  distributorID: '0x0000000000000000000000000000000000000000',
  retailerID: '0x0000000000000000000000000000000000000000',
  consumerID: '0x0000000000000000000000000000000000000000',
  accounts: [],
  //   web3: null,
  contract: null,
  init: async function () {
    App.readForm();
    /// Setup access to blockchain
    return await App.initWeb3();
  },

  readForm: function () {
    App.sku = $('#sku').val();
    App.upc = $('#upc').val();
    App.ownerID = $('#ownerID').val();
    App.originFarmerID = $('#originFarmerID').val();
    App.originFarmName = $('#originFarmName').val();
    App.originFarmInformation = $('#originFarmInformation').val();
    App.originFarmLatitude = $('#originFarmLatitude').val();
    App.originFarmLongitude = $('#originFarmLongitude').val();
    App.productNotes = $('#productNotes').val();
    App.productPrice = $('#productPrice').val();
    App.distributorID = $('#distributorID').val();
    App.retailerID = $('#retailerID').val();
    App.consumerID = $('#consumerID').val();

    console.log(
      App.sku,
      App.upc,
      App.ownerID,
      App.originFarmerID,
      App.originFarmName,
      App.originFarmInformation,
      App.originFarmLatitude,
      App.originFarmLongitude,
      App.productNotes,
      App.productPrice,
      App.distributorID,
      App.retailerID,
      App.consumerID
    );
  },

  initWeb3: async function () {
    /// Find or Inject Web3 Provider
    /// Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
        console.error('User denied account access');
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      );
    }

    App.getMetaskAccountID();

    return App.initSupplyChain();
  },

  getMetaskAccountID: function () {
    web3 = new Web3(App.web3Provider);

    // App.web3 = web3;

    // Retrieving accounts
    web3.eth.getAccounts(function (err, res) {
      if (err) {
        console.log('Error:', err);
        return;
      }
      console.log('getMetaskID:', res);
      App.metamaskAccountID = res[0];
      App.accounts = res;

      console.log(App.accounts);
    });
  },

  initSupplyChain: function () {
    /// Source the truffle compiled smart contracts
    var jsonSupplyChain = '../../build/contracts/SupplyChain.json';

    /// JSONfy the smart contracts
    $.getJSON(jsonSupplyChain, function (data) {
      console.log('jsonSupplyChain data', data);
      var SupplyChainArtifact = data;
      App.contracts.SupplyChain = TruffleContract(SupplyChainArtifact);
      App.contracts.SupplyChain.setProvider(App.web3Provider);

      web3.eth.net.getId().then((networkId) => {
        const deployedNetwork = data.networks[networkId];

        console.log('deployedNetwork: ', deployedNetwork);

        App.contract = new web3.eth.Contract(data.abi, deployedNetwork.address);
      });

      // do not call this yet as there maybe no items yet
      //App.fetchItemBufferOne();
      //App.fetchItemBufferTwo();
      App.fetchEvents();
    });

    return App.bindEvents();
  },

  bindEvents: function () {
    $(document).on('click', App.handleButtonClick);
  },

  handleButtonClick: async function (event) {
    event.preventDefault();

    App.getMetaskAccountID();

    var processId = parseInt($(event.target).data('id'));
    console.log('processId', processId);

    switch (processId) {
      case 1:
        return await App.harvestItem(event);
        break;
      case 2:
        return await App.processItem(event);
        break;
      case 3:
        return await App.packItem(event);
        break;
      case 4:
        return await App.sellItem(event);
        break;
      case 5:
        return await App.buyItem(event);
        break;
      case 6:
        return await App.shipItem(event);
        break;
      case 7:
        return await App.receiveItem(event);
        break;
      case 8:
        return await App.purchaseItem(event);
        break;
      case 9:
        return await App.fetchItemBufferOne(event);
        break;
      case 10:
        return await App.fetchItemBufferTwo(event);
        break;
    }
  },

  harvestItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { harvestItem } = App.contract.methods;

        return harvestItem(
          App.upc,
          App.metamaskAccountID,
          App.originFarmName,
          App.originFarmInformation,
          App.originFarmLatitude,
          App.originFarmLongitude,
          App.productNotes
        ).send({ from: App.metamaskAccountID });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('harvestItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  processItem: async function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { processItem } = App.contract.methods;
        return processItem(App.upc).send({
          from: App.metamaskAccountID,
        });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('processItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  packItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { packItem } = App.contract.methods;
        return packItem(App.upc).send({
          from: App.metamaskAccountID,
        });
        // return instance.packItem(App.upc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('packItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  sellItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const productPrice = web3.utils.toWei(1, 'ether');
        console.log('productPrice', productPrice);

        const { sellItem } = App.contract.methods;

        return sellItem(App.upc, App.productPrice).send({
          from: App.metamaskAccountID,
        });

        // return instance.sellItem(App.upc, App.productPrice, {
        //   from: App.metamaskAccountID,
        // });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('sellItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  buyItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const walletValue = web3.utils.toWei(3, 'ether');

        const { buyItem } = App.contract.methods;

        return buyItem(App.upc).send({
          from: App.metamaskAccountID,
          value: walletValue,
        });

        // return instance.buyItem(App.upc, {
        //   from: App.metamaskAccountID,
        //   value: walletValue,
        // });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('buyItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  shipItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { shipItem } = App.contract.methods;

        return shipItem(App.upc).call({
          from: App.metamaskAccountID,
        });

        // return instance.shipItem(App.upc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('shipItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  receiveItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { receiveItem } = App.contract.methods;

        return receiveItem(App.upc).call({
          from: App.metamaskAccountID,
        });

        // return instance.receiveItem(App.upc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('receiveItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  purchaseItem: function (event) {
    event.preventDefault();
    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { purchaseItem } = App.contract.methods;

        return purchaseItem(App.upc).call({
          from: App.metamaskAccountID,
        });

        // return instance.purchaseItem(App.upc, { from: App.metamaskAccountID });
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('purchaseItem', result);
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },

  fetchItemBufferOne: function () {
    ///   event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));
    App.upc = $('#upc').val();
    console.log('upc', App.upc);

    console.log(App.contracts.SupplyChain);

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { fetchItemBufferOne } = App.contract.methods;

        // return fetchItemBufferOne(App.upc).call();

        return fetchItemBufferOne(App.upc).call({
          from: App.metamaskAccountID,
        });

        // return instance.fetchItemBufferOne(App.upc);
      })
      .then(function (result) {
        $('#ftc-item').text(result);
        console.log('fetchItemBufferOne', result);
      })
      .catch(function (err) {
        console.log('error in fetchItemBufferOne() ' + err.message);
      });
  },

  fetchItemBufferTwo: function () {
    ///    event.preventDefault();
    ///    var processId = parseInt($(event.target).data('id'));

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        const { fetchItemBufferTwo } = App.contract.methods;

        return fetchItemBufferTwo(App.upc).call({
          from: App.metamaskAccountID,
        });

        // return instance.fetchItemBufferTwo.call(App.upc);
      })
      .then(function (result) {
        $('#ftc-item').text(result.transactionHash);
        console.log('fetchItemBufferTwo', result);
      })
      .catch(function (err) {
        console.log('error in fetchItemBufferTwo() ' + err.message);
      });
  },

  fetchEvents: function () {
    if (
      typeof App.contracts.SupplyChain.currentProvider.sendAsync !== 'function'
    ) {
      App.contracts.SupplyChain.currentProvider.sendAsync = function () {
        return App.contracts.SupplyChain.currentProvider.send.apply(
          App.contracts.SupplyChain.currentProvider,
          arguments
        );
      };
    }

    App.contracts.SupplyChain.deployed()
      .then(function (instance) {
        var events = instance.allEvents(function (err, log) {
          if (!err)
            $('#ftc-events').append(
              '<li>' + log.event + ' - ' + log.transactionHash + '</li>'
            );
        });
      })
      .catch(function (err) {
        console.log(err.message);
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
