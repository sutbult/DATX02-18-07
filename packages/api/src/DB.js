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

    // init database
    var name = document.getElementById("nameInput").value
    var type = document.getElementById("typeInput").value
    var permission = document.getElementById("permissionInput").value
    if ( permission == 'true' ) {
      const access = {
      write: ['*'],
    }
      db = await orbitdb[type](name, access);
      console.log(db.address.toString())
    }
    else {
      const access = {
      write: [permission],
    }
      db = await orbitdb[type](name, access);
      console.log(db.address.toString())
    }

  });


}

document.getElementById("createBtn").onclick = async function() {
    createDB()
};
