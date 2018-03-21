const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress


var globaldb
var messagedb
let orbitdb
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
    globaldb = await orbitdb.feed('/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db');
    messagedb = await orbitdb.feed('/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message')
    console.log(globaldb.address.toString())
} catch (e) {
  console.error(e)
}

});

async function createChannel(channelName) {
  return await orbitdb.feed(channelName);
}

/*
Bid should be JSON in form of jsonObject = {
    "step" : "1",
    "from" : "CURRENCY",
    "fromAmount" : int,
    "to":"CURRENCY",
    "toAmount" : int,
    "address" : adressString,
    "channel" : channelString
  };

  Can only push one bid at a time at the moment
*/
async function addBid(bid){
  //bid to json
  //var bidJSON = JSON.stringify(bid);
  //await globaldb.add(bidJSON);
  await globaldb.add(bid);
  db = await orbitdb.feed(bid.channel);
  channels.push(db); //create channel
  await db.load();
  await db.add(bid.address);
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
  channels.push(db); //create channel
  await db.load();
  await db.add(bid.address);
  //Also let everybody know that the bid is taken.
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
async function pushContractInfo(contractInfo) {
  //db has already been created, how to we access it?
  //Need to add check to confirm that we have received the correct JsonObject
  newJson = {
    "step" : "3",
    "digest" : contractInfo.digest,
    "contractAddress" : contractInfo.contractAddress
  };
  await db.add(newJson);
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
  //db has already been created, how to we access it?
  //Need to add check to confirm that we have received the correct JsonObject
  newJson = {
    "step" : "4",
    "contractAddress" : contractInfo.contractAddress
  };
  await db.add(newJson);
}


/*
What's left? Add functionality to take continiously take down the new information
*/

function processInfo(contractInfo) {
  if(contractInfo.step == 1) {

  } else if(contractInfo.step == 2) {

  } else if(contractInfo.step == 3) {

  } else if(contractInfo.step == 4) {

  } else {

  }

}



async function getBid(amount){
  await globaldb.add('test')
  var bids = globaldb.iterator({ limit: 5 }).collect().map((e) => e.payload.value)
  return JSON.stringify(bids, null, 2)
}

module.exports = {
  addBid,
  getBid,
}
