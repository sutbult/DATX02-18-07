const orbitDB = require("./OrbitDBHandler.js")
const headless = require("./Headless.js")
var db = '/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db'

async function getBid(amount){
  var bids = orbitDB.getBid(amount, db)
  return bids
}

function addBid(bid){
  orbitDB.addBid(bid, db)

}


function removeBid(){
// Not possible with log
}

module.exports = {
  addBid,
  getBid
}
