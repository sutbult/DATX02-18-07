const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

var db

async function createDB(){
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
    // init database
    db = await orbitdb.feed(document.getElementById("nameInput").value, access);
    console.log(db.address.toString())

  });


}

document.getElementById("createBtn").onclick = async function() {
    createDB()
};