const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

var globaldb
var messagedb
let orbitdb

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

async function addBid(bid){
  await globaldb.add(bid)
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
