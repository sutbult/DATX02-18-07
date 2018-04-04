const orbitDB = require("./OrbitDBHandler.js")
var db = '/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db'

async function getBid(amount){
  var object = await orbitDB.getData(amount, db)
  var bids = []
  for (var i = 0; i < amount; i++) {
    var bid = object[i].payload.value
    bid["id"] = object[i].hash
    bids.push(bid)
  }

  return bids
}

async function addBid(bid){
  await orbitDB.addData(bid, db)

}


function removeBid(){
// Not possible with log
}

module.exports = {
  addBid,
  getBid
}
