const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const headless = require("./Headless.js")


//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress

var orbitdb
var db
var channels = []

const access = {
   // Give write access to ourselves
   write: ['*'],
 }

var ipfs = new Ipfs({
  repo: "ipfs/shared",
  config: {
    Addresses: {
      Swarm: [
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star'
      ]
    }
  },
  EXPERIMENTAL: {
      pubsub: true // OrbitDB requires pubsub
  }
});

ipfs.once('error', (err) => console.error(err))

ipfs.once('ready', async function() {

  try {
    orbitdb = new OrbitDB(ipfs)
} catch (e) {
  console.error(e)
}

});

async function createChannel(channelName) {
  try{
    ipfs.on('ready', async function(){
      var returnDB = await orbitdb.feed(channelName)
      return returnDB

    })

  }
  catch (e) {
    console.error(e)
  }
}

/**
* Creates a new database address
* @param name The name of the database
* @param type The database type (log, feed, keyvalue)
* @param permission The write permission of the database. Leave empty for local permission
*/
async function createDB(name, type, permission){
  return headless.createDB(name, type, permission)
}


//console.log(test)

/*
Bid should be JSON in form of jsonObject = {
    "step" : "1",
    "from" : {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "to": {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "address" : adressString,
    "channel" : channelString
  };

  Can only push one bid at a time at the moment
*/
async function addData(data, address){
  var db = await orbitdb.feed(address)
  await db.load()
  await db.add(data);

  var channel = await orbitdb.feed(data.channel)
  await channel.add(data.address);

  //gives error
//  processInfo(checkForStep(2));
}

/*
  Just send address and channel
  jsonObject = {
      "step" : "2",
      "adress" : adressString,
      "channel" : channelString
    };
*/
async function acceptBid(bid){
  db = await orbitdb.feed(bid.channel);
  await db.load();
  var message = db.iterator({ limit: 1 }).collect().map((e) => e.payload.value)
  await db.add(bid.address);
  processInfo(message);
  //Let everybody know that the bid is taken.
  //checkForStep(3);
}

function checkForStep(step) {
  var message = db.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
  while(message.step != step) {
    var message = db.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
  }

  return message;
}

/*
  Just send address and channel
  jsonObject = {
      "step" : "3",
      "channel" : channelString,
      "digest" : digestString,
      "contractAddress" : contractAddressString
    };
*/
async function pushDigestInfo(contractInfo) {

  await db.add(contactInfo);

  processInfo(checkForStep(4));

}

/*
  Just send address and channel
  jsonObject = {
      "step" : "4",
      "channel" : channelString,
      "contractAddress" : contractAddressString
    };
*/
async function pushContractInfo(contractInfo) {

  await db.add(contractInfo);
}


function processInfo(message) {
  if(contractInfo.step == 1) {
    return message;
    //call checkForStep(3)
  } else if(contractInfo.step == 2) {
    return message;
    //prompt user to complete step 3
  } else if(contractInfo.step == 3) {
    //prompt user to complete step 4
    return message;
  } else if(contractInfo.step == 4) {
    return message;
  } else {

  }

}



/*
var jsonObject = {
    "step" : "1",
    "from" : "CURRENCY",
    "fromAmount" : '5',
    "to":"CURRENCY",
    "toAmount" : '5',
    "address" : 'test',
    "channel" : '/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message'
  };
*/
async function getData(amount, address){
    var db = await orbitdb.feed(address)
    await db.load()
    var data = db.iterator({ limit: amount }).collect()
    return data
}

module.exports = {
  addData,
  getData,
  acceptBid,
  checkForStep,
  createChannel,
  createDB
}
