const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress

var channels = [];

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

ipfs.once('ready', async function() {

  orbitdb = new OrbitDB(ipfs)

  const access = {
  // Give write access to everyone
  write: ['*'],
}
  // init our database
   globaldb = await orbitdb.feed('/orbitdb/Qma6kDMVMeCxKjmnSa9xWSVYvYKq1Mwej2tr74gBrARjZ8/bids');
   channels.push(globaldb);

  // load local cached db
  await globaldb.load();

});

async function createChannel(channelName) {
  return await orbitdb.feed(channelName);
}

/*
Bid should be JSON in form of jsonObject = {
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
      "adress" : adressString,
      "channel" : channelString
    };
*/
async function acceptBid(bid){
  db = await orbitdb.feed(bid.channel);
  channels.push(db); //create channel
  await db.load();
  await db.add(bid.address);
}



function getBid(amount){
  var bids = globaldb.iterator({ limit: 5 }).collect().map((e) => e.payload.value);
  return JSON.stringify(bids, null, 2);
}

module.exports = {
  addBid,
  getBid,
}
