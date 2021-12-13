// This script is designed to test the solidity smart contract - SuppyChain.sol -- and the various functions within
// Declare a variable and assign the compiled smart contract artifact
var SupplyChain = artifacts.require('SupplyChain');

const truffleAssert = require('truffle-assertions');

contract('SupplyChain', function (accounts) {
  // Declare few constants and assign a few sample accounts generated by ganache-cli
  var sku = 1;
  var upc = 1;
  const ownerID = accounts[0];
  const originFarmerID = accounts[1];
  const originFarmName = 'John Doe';
  const originFarmInformation = 'Yarray Valley';
  const originFarmLatitude = '-38.239770';
  const originFarmLongitude = '144.341490';
  var productID = sku + '-' + upc;
  const productNotes = 'Best beans for Espresso';
  const productPrice = web3.utils.toWei('1', 'ether');
  var itemState = 7; // Purchased State
  const distributorID = accounts[2];
  const retailerID = accounts[3];
  const consumerID = accounts[4];
  const emptyAddress = '0x00000000000000000000000000000000000000';

  ///Available Accounts
  ///==================
  ///(0) 0x27d8d15cbc94527cadf5ec14b69519ae23288b95
  ///(1) 0x018c2dabef4904ecbd7118350a0c54dbeae3549a
  ///(2) 0xce5144391b4ab80668965f2cc4f2cc102380ef0a
  ///(3) 0x460c31107dd048e34971e57da2f99f659add4f02
  ///(4) 0xd37b7b8c62be2fdde8daa9816483aebdbd356088
  ///(5) 0x27f184bdc0e7a931b507ddd689d76dba10514bcb
  ///(6) 0xfe0df793060c49edca5ac9c104dd8e3375349978
  ///(7) 0xbd58a85c96cc6727859d853086fe8560bc137632
  ///(8) 0xe07b5ee5f738b2f87f88b99aac9c64ff1e0c7917
  ///(9) 0xbd3ff2e3aded055244d66544c9c059fa0851da44

  console.log('ganache-cli accounts used here...');
  console.log('Contract Owner: accounts[0] ', accounts[0]);
  console.log('Farmer: accounts[1] ', accounts[1]);
  console.log('Distributor: accounts[2] ', accounts[2]);
  console.log('Retailer: accounts[3] ', accounts[3]);
  console.log('Consumer: accounts[4] ', accounts[4]);

  // 1st Test
  it('Testing smart contract function harvestItem() that allows a farmer to harvest coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // add farmer address to list of farmers
    await supplyChain.addFarmer(accounts[1]);

    // Declare and Initialize a variable for event
    var eventEmitted = false;

    // Watch the emitted event Harvested()
    // var event = supplyChain.Harvested();

    // if (event.watch) {
    //   await event.watch((err, res) => {
    //     eventEmitted = true;
    //   });
    // }

    // Mark an item as Harvested by calling function harvestItem()
    const tx = await supplyChain.harvestItem(
      upc,
      originFarmerID,
      originFarmName,
      originFarmInformation,
      originFarmLatitude,
      originFarmLongitude,
      productNotes,
      {
        from: accounts[1],
      }
    );

    // Retrieve the events information from the transaction
    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Harvested', log.event);

    truffleAssert.eventEmitted(tx, 'Harvested');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');
    assert.equal(
      resultBufferOne[2],
      originFarmerID,
      'Error: Missing or Invalid ownerID'
    );
    assert.equal(
      resultBufferOne[3],
      originFarmerID,
      'Error: Missing or Invalid originFarmerID'
    );
    assert.equal(
      resultBufferOne[4],
      originFarmName,
      'Error: Missing or Invalid originFarmName'
    );
    assert.equal(
      resultBufferOne[5],
      originFarmInformation,
      'Error: Missing or Invalid originFarmInformation'
    );
    assert.equal(
      resultBufferOne[6],
      originFarmLatitude,
      'Error: Missing or Invalid originFarmLatitude'
    );
    assert.equal(
      resultBufferOne[7],
      originFarmLongitude,
      'Error: Missing or Invalid originFarmLongitude'
    );
    assert.equal(resultBufferTwo[5], 0, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 2nd Test
  it('Testing smart contract function processItem() that allows a farmer to process coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Processed()

    // Mark an item as Processed by calling function processtItem()
    const tx = await supplyChain.processItem(upc, {
      from: accounts[1],
    });

    // Retrieve the events information from the transaction
    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Processed', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Processed');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');

    assert.equal(
      resultBufferOne[2],
      originFarmerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 1, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 3rd Test
  it('Testing smart contract function packItem() that allows a farmer to pack coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Packed()

    // Mark an item as Packed by calling function packItem()
    const tx = await supplyChain.packItem(upc, {
      from: accounts[1],
    });

    // Retrieve the events information from the transaction
    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Packed', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Packed');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');

    assert.equal(
      resultBufferOne[2],
      originFarmerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 2, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 4th Test
  it('Testing smart contract function sellItem() that allows a farmer to sell coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event ForSale()

    // Mark an item as ForSale by calling function sellItem()
    const tx = await supplyChain.sellItem(upc, productPrice, {
      from: accounts[1],
    });

    // Retrieve the events information from the transaction
    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('ForSale', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'ForSale');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(resultBufferOne[0], sku, 'Error: Invalid item SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Invalid item UPC');

    assert.equal(
      resultBufferOne[2],
      originFarmerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(
      resultBufferTwo[4],
      productPrice,
      'Error: Incorrect product price'
    );

    assert.equal(resultBufferTwo[5], 3, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 5th Test
  it('Testing smart contract function buyItem() that allows a distributor to buy coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // add distributor address to list of distributors
    await supplyChain.addDistributor(distributorID);

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Sold()
    // var event = supplyChain.Sold();

    // Mark an item as Sold by calling function buyItem()
    const tx = await supplyChain.buyItem(upc, {
      from: distributorID,
      value: web3.utils.toWei('1', 'ether'),
    });

    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Sold', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Sold');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(
      resultBufferOne[2],
      distributorID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(
      resultBufferTwo[6],
      distributorID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 4, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 6th Test
  it('Testing smart contract function shipItem() that allows a distributor to ship coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Shipped()

    // Mark an item as Sold by calling function buyItem()
    const tx = await supplyChain.shipItem(upc, {
      from: distributorID,
    });

    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Shipped', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Shipped');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(
      resultBufferOne[2],
      distributorID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 5, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 7th Test
  it('Testing smart contract function receiveItem() that allows a retailer to mark coffee received', async () => {
    const supplyChain = await SupplyChain.deployed();

    // add retailer address to list of retailers
    await supplyChain.addRetailer(retailerID);

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Received()

    // Mark an item as Sold by calling function buyItem()
    const tx = await supplyChain.receiveItem(upc, {
      from: retailerID,
    });

    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Received', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Received');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(
      resultBufferOne[2],
      retailerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(
      resultBufferTwo[7],
      retailerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 6, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 8th Test
  it('Testing smart contract function purchaseItem() that allows a consumer to purchase coffee', async () => {
    const supplyChain = await SupplyChain.deployed();

    // add consumer address to list of consumers
    await supplyChain.addConsumer(consumerID);

    // Declare and Initialize a variable for event
    let eventEmitted = false;

    // Watch the emitted event Purchased()

    // Mark an item as Sold by calling function purchaseItem()
    const tx = await supplyChain.purchaseItem(upc, { from: consumerID });

    const { logs } = tx;

    assert.ok(Array.isArray(logs));
    assert.equal(logs.length, 1);

    const log = logs[0];

    if (log.event) {
      eventEmitted = true;
    }

    assert.equal('Purchased', log.event);

    // use truffle assert to test events
    truffleAssert.eventEmitted(tx, 'Purchased');

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set
    assert.equal(
      resultBufferOne[2],
      consumerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(
      resultBufferTwo[8],
      consumerID,
      'Error: Missing or Invalid ownerID'
    );

    assert.equal(resultBufferTwo[5], 7, 'Error: Invalid item State');
    assert.equal(eventEmitted, true, 'Invalid event emitted');
  });

  // 9th Test
  it('Testing smart contract function fetchItemBufferOne() that allows anyone to fetch item details from blockchain', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferOne = await supplyChain.fetchItemBufferOne.call(upc);

    // Verify the result set:
    assert.equal(resultBufferOne[0], sku, 'Error: Missing or Invalid SKU');
    assert.equal(resultBufferOne[1], upc, 'Error: Missing or Invalid UPC');
    assert.equal(
      resultBufferOne[2],
      consumerID,
      'Error: Missing or Invalid OwnerID'
    );
    assert.equal(
      resultBufferOne[3],
      originFarmerID,
      'Error: Missing or Invalid Origin Farmer ID'
    );
    assert.equal(
      resultBufferOne[4],
      originFarmName,
      'Error: Missing or Invalid Origin Farm Name'
    );
    assert.equal(
      resultBufferOne[5],
      originFarmInformation,
      'Error: Missing or Invalid Origin Farm Info'
    );
    assert.equal(
      resultBufferOne[6],
      originFarmLatitude,
      'Error: Missing or Invalid Origin Farm Lat'
    );
    assert.equal(
      resultBufferOne[7],
      originFarmLongitude,
      'Error: Missing or Invalid Origin Farm Lng'
    );
  });

  // 10th Test
  it('Testing smart contract function fetchItemBufferTwo() that allows anyone to fetch item details from blockchain', async () => {
    const supplyChain = await SupplyChain.deployed();

    // Retrieve the just now saved item from blockchain by calling function fetchItem()
    const resultBufferTwo = await supplyChain.fetchItemBufferTwo.call(upc);

    // Verify the result set:
    assert.equal(resultBufferTwo[0], sku, 'Error: Missing or Invalid SKU');
    assert.equal(resultBufferTwo[1], upc, 'Error: Missing or Invalid UPC');

    assert.equal(
      resultBufferTwo[2],
      productID,
      'Error: Missing or Invalid Product ID'
    );

    assert.equal(
      resultBufferTwo[3],
      productNotes,
      'Error: Missing or Invalid Product Notes'
    );
    assert.equal(
      resultBufferTwo[4],
      productPrice,
      'Error: Missing or Invalid Product Price'
    );
    assert.equal(
      resultBufferTwo[5],
      itemState,
      'Error: Missing or Invalid Item State'
    );
    assert.equal(
      resultBufferTwo[6],
      distributorID,
      'Error: Missing or Invalid Distributor ID'
    );
    assert.equal(
      resultBufferTwo[7],
      retailerID,
      'Error: Missing or Invalid Retailer ID'
    );
    assert.equal(
      resultBufferTwo[8],
      consumerID,
      'Error: Missing or Invalid ownerID'
    );
  });
});
