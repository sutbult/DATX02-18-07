
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

  var channelName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) //randomly generated String https://gist.github.com/6174/6062387

  //var bidStringify = JSON.stringify(bid);
  //var bidParsed = JSON.parse(bidStringify)
  //var object = {"id" : bidParsed.id, "status" : bidParsed.status, "from" : bidParsed.from, "to" : bidParsed.to, "address" : "", "channel" : channelName};
  //console.log("BID: " + JSON.stringify(object));
  //console.log("Bid: " + bid);


  // Add bid to global database
  //Consult Samuel about structure of bids
  var key = await globalDB.add(bid) //object instead of bid
  // Add bid to local database
  await orbitDB.addData("test", channelName, "PLACEHOLDER") //Consult group on how to get address
  orbitDB.close()
  await localDB.add(bid)
  //await orbitDB.addKVData(key, bid, statusDB)

}

async function acceptBid(bid) {
  console.log("AcceptBid: " + bid);
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
  acceptBid,
  changeBidStatus,
  getUserBids,
  init
}
