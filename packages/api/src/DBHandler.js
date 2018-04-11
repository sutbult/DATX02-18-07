const orbitDB = require("./OrbitDBHandler.js")
var globalDB
var statusDB
var localDB

async function init(){
  // Address to the global database containing all bids
  var bids = await orbitDB.createDB("Bids", "log", "public")
  globalDB = await orbitDB.getLogDB(bids)
  await globalDB.load()
  await orbitDB.close()

  // Address to the local database containing status of the user's bids
  // Currently globalaccess, needs to be fixed
//  statusDB = await orbitDB.createDB("bidStatus", "keyvalue", "local")

  // Address to the local database containing user's bid history
  var local = await orbitDB.createDB("bidHistory", "log", "local")
  localDB = await orbitDB.getLogDB(local)
  await localDB.load()
  await orbitDB.close()

}

async function getBid(amount){
  return await getBids(amount, globalDB)
}

async function addBid(bid){
  // Add bid to global database
  var key = await globalDB.add(bid)
  // Add bid to local database
  await localDB.add(bid)
  //await orbitDB.addKVData(key, bid, statusDB)

}

async function acceptBid(bid) {
  await orbitDB.acceptBid(bid);
}

async function changeBidStatus(bid, status){
  bid.status = status
  await orbitDB.addKVData(bid.id, bid, statusDB)
}

async function getUserBids(amount){
  return await getBids(amount, localDB)
}

async function getBids(amount, db){
  var data = db.iterator({ limit : amount }).collect()
  var bids = []
  for (var i = 0; i < data.length; i++) {
    var bid = data[i].payload.value
    bid.id = data[i].hash
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
