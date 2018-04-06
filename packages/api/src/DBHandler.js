const orbitDB = require("./OrbitDBHandler.js")
var globalDB
var statusDB
var localDB
init()

async function init(){
  // Address to the global database containing all bids
  globalDB = "/orbitdb/QmPEqy2vrB8gkkeVv7yLdLd2e3sh9XxUdMkAvKE37aLKGn/Bids"

  // Address to the local database containing status of the user's bids
  // Currently globalaccess, needs to be fixed
  statusDB = await orbitDB.createDB("bidStatus", "keyvalue", "global")

  // Address to the local database containing user's bid history
  localDB = await orbitDB.createDB("bidHistory", "log", "global")
}

async function getBid(amount){
  return await getBids(amount, globalDB)
}

async function addBid(bid){
  // Add bid to global database
  var key = await orbitDB.addData(bid, globalDB)
  // Add bid to local database
  await orbitDB.addData(bid, localDB)
  await orbitDB.addKVData(key, bid, statusDB)

}

async function changeBidStatus(bid, status){
  bid.status = status
  await orbitDB.addKVData(bid.id, bid, statusDB)
}

async function getUserBids(amount){
  if(localDB == null){
    localDB = await orbitDB.createDB("bidHistory", "log", "global")
  }
  return await getBids(amount, localDB)
}

async function getBids(amount, db){
  var object = await orbitDB.getData(amount, db)
  var bids = []
  for (var i = 0; i < object.length; i++) {
    var bid = object[i].payload.value
    bid.id = object[i].hash
    bids.push(bid)
  }

  return bids
}



module.exports = {
  addBid,
  getBid,
  changeBidStatus,
  getUserBids,
  init
}
