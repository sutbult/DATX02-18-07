const orbitDB = require("./OrbitDBHandler.js")
var globalDB
var statusDB
var messageHandler
var key

async function init(msgHandler){
  var messageHandler = msgHandler

  // Address to the local database containing status of the user's bids
  var status = await orbitDB.createDB("bidStatus", "keyvalue", "public")
  statusDB = await orbitDB.getKVDB(status)
  await statusDB.load()
  await orbitDB.close()

  // Address to the global database containing all bids
  var bids = await orbitDB.createDB("Bids", "log", "public")
  globalDB = await orbitDB.getLogDB(bids)
  await globalDB.load()
  await orbitDB.close()
  key = globalDB.key.getPublic('hex')




  //Add Listeners
/*  globalDB.events.on('replicated', () => {
    messageHandler({
        cmd: "updateBids",
    });
  });

  globalDB.events.on('write', () => {
    messageHandler({
        cmd: "updateBids",
    });
  });
*/
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


}

function getBids(amount){
  var bids = getBid(amount, globalDB)
  for (var i = bids.length - 1; i >= 0; i--){
    //var tempAmount = bids[i].from.amount
    //bids[i].from.amount = bids[i].to.amount
    //bids[i].to.amount = tempAmount
    if(bids[i].key == key || bids[i].status == "PENDING" || bids[i].status == "FINISHED"){
      bids.splice(i,1);
    }
  }
  return bids
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
  var id = await globalDB.add(bid) //object instead of bid
  // Add bid to local database
  await statusDB.put(id, "ACTIVE");

  await orbitDB.addData("test", bid.channel, "PLACEHOLDER") //Placeholder replace with function to get address
  orbitDB.close()

}

async function acceptBid(bidID) {
  await statusDB.put(bidID, "PENDING")
  //await orbitDB.acceptBid(bid);
}

async function changeBidStatus(bid, status){
  bid.status = status
  await orbitDB.addKVData(bid.id, bid, statusDB)
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
  getBids,
  acceptBid,
  changeBidStatus,
  getUserBids,
  init
}
