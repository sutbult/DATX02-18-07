const orbitDB = require("./OrbitDBHandler.js")
//const headless = require("./Headless.js")
var db = '/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db'

async function getBid(amount){
  var bids = await orbitDB.getBid(amount, db)
  return bids
}

async function addBid(bid){
  await orbitDB.addBid(bid, db)

}


function removeBid(){
// Not possible with log
}

module.exports = {
  addBid,
  getBid
}
