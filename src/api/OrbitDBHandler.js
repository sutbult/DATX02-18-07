const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

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

  var orbitdb = new OrbitDB(ipfs)

  const access = {
  // Give write access to everyone
  write: ['*'],
}
  // init our database
   globaldb = await orbitdb.feed('/orbitdb/Qma6kDMVMeCxKjmnSa9xWSVYvYKq1Mwej2tr74gBrARjZ8/bids');

  // load local cached db
  await globaldb.load();

});

async function addBid(bid){
  await globaldb.add(bid)
}

function getBid(amount){
  var bids = globaldb.iterator({ limit: 5 }).collect().map((e) => e.payload.value)
  return JSON.stringify(bids, null, 2)
}

module.exports = {
  addBid,
  getBid,
}
