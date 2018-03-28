const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')

var db

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
  db = await orbitdb.feed('createdb', access);
  console.log(db.address.toString())

  $(async function() {
    $('#offerBtn').on('click', async function() {
      // add to database
      document.getElementById("mytext").value = db

      await globaldb.add(document.getElementById('tradeInput').value + ' ether for ' + document.getElementById('receiveInput').value + ' bitcoin')

      // Get last 5 entries
      var latest = globaldb.iterator({ limit: 5 }).collect()
       console.log(JSON.stringify(latest, null, 2))
    });

  });

});
