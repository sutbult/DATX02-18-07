const orbitDB = require("./OrbitDBHandler.js")
var globalDB
var statusDB
var localDB
var messageHandler
var key

async function init(msgHandler){
  var messageHandler = msgHandler

  // Address to a global keyvalue database containing status of the bids

  var status = await orbitDB.createDB("bidStatus", "keyvalue", "public")
  statusDB = await orbitDB.getKVDB(status)
  await statusDB.load()

  // Address to the global database containing all bids
  var bids = await orbitDB.createDB("Bids", "log", "public")
  globalDB = await orbitDB.getLogDB(bids)
  await globalDB.load()
  key = globalDB.key.getPublic('hex')


  // Address to the local databaes containing accepted bidStatus
  var localbids = await orbitDB.createDB("acceptedBids", "keyvalue", "local")
  localDB = await orbitDB.getKVDB(localbids)
  await localDB.load()

  //Add Listeners
  statusDB.events.on('replicated', () => {
    messageHandler({
        cmd: "updateBids",
    });
  });

  statusDB.events.on('write', () => {
    messageHandler({
        cmd: "updateBids",
    });
  });

  localDB.events.on('write', () => {
    messageHandler({
        cmd: "updateBids",
    });
  })



}

function getBids(amount){
  var bids = getBid(amount, globalDB)
  // for (var i = bids.length - 1; i >= 0; i--){
    //var tempAmount = bids[i].from.amount
    //bids[i].from.amount = bids[i].to.amount
    //bids[i].to.amount = tempAmount
    // if(bids[i].key == key || bids[i].status == "PENDING" || bids[i].status == "FINISHED"){
  //    bids.splice(i,1);
    // }
  // }
  return bids
}

async function getBid2(bidID){
  return await globalDB.get(bidID).payload.value;
}

async function addBid(bid){

  //var channelName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) //randomly generated String https://gist.github.com/6174/6062387

  //var bidStringify = JSON.stringify(bid);
  //var bidParsed = JSON.parse(bidStringify)
  //var object = {"id" : bidParsed.id, "status" : bidParsed.status, "from" : bidParsed.from, "to" : bidParsed.to, "address" : "", "channel" : channelName};
  //console.log("BID: " + JSON.stringify(object));
  //console.log("Bid: " + bid);


  // Add bid to global database
  //Consult Samuel about structure of bids
  var id = await globalDB.add(bid) //object instead of bid
  // Add bid to local database
  await statusDB.put(id, "ACTIVE");
  console.log("***********StatusDB: %o", statusDB.get(id));

  await orbitDB.addData(bid);
}

async function acceptBid(bidID) {
  await statusDB.put(bidID, "PENDING")
  await localDB.put(bidID, "PENDING")
  //await orbitDB.acceptBid(bid);
}

/**
* Change the status of a bid
* @param bidID The id of the bid (bid.id)
* @param status The new status of the bid ("ACTIVE", "PENDING", "FINISHED")
*/

async function changeBidStatus(bidID, status){
  await statusDB.put(bidID, status)
}

function getUserBids(amount){
  var bids = getBid(amount, globalDB)
  for (var i = bids.length - 1; i >= 0; i--){
    if(bids[i].key != key){
      bids.splice(i,1);
    }
  }
  return bids
}

function getAcceptedBids(amount){
  var bids = getBids(amount)
  for (var i = bids.length - 1; i >= 0; i--){
    if(localDB.get(bids[i].id) == undefined){
      bids.splice(i,1);
    }
  }
  return bids
}

function getBidStatus(bidID){
  return statusDB.get(bidID);
}

function getBid(amount, db){
  var data = db.iterator({ limit : amount }).collect()
  var bids = []
  for (var i = 0; i < data.length; i++) {
    var bid = data[i].payload.value
    bid.id = data[i].hash
    bid.key = data[i].key
    bid.status = statusDB.get(data[i].hash)
    bids.push(bid)
  }
  return bids
}

module.exports = {
  addBid,
  getBid,
  getBid2,
  getBids,
  acceptBid,
  changeBidStatus,
  getUserBids,
  getAcceptedBids,
  getBidStatus,
  init
}
