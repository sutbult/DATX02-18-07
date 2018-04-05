const orbitDB = require("./OrbitDBHandler.js")
var globaldb
var localdb
init()

async function init(){
  // Address to the global database containing all bids
  globaldb = '/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db'

  // Address to the local database containing status of the user's bids
  localdb = await orbitDB.createDB('beef', 'feed', 'asd')
  console.log(localdb)
}

async function getBid(amount){
  var object = await orbitDB.getData(amount, globaldb)
  var bids = []
  for (var i = 0; i < amount; i++) {
    var bid = object[i].payload.value
    bid["id"] = object[i].hash
    bids.push(bid)
  }

  return bids
}

async function addBid(bid){
  await orbitDB.addData(bid, globaldb)

}


function removeBid(){
// Not possible with log
}

module.exports = {
  addBid,
  getBid
}
