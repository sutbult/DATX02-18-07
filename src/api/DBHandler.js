const orbitDB = require("./OrbitDBHandler.js")
var db = '/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db'
/*try {
// db = orbitDB.createChannel('/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db')
 db = createDB('/orbitdb/QmNupSCzj3YFbvcpJYxbfAXZHVczcNzyxgjj7BjSrXbHMr/db')

catch (e) {
  console.error(e)
}*/

async function createDB(dbName){
  db = orbitDB.createChannel(dbName)
//  console.log(db.address.toString())
  return db
}

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
