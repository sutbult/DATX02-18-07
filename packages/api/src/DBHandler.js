const orbitDB = require("./OrbitDBHandler.js");
var globalDB;
var statusDB;
var localDB;
var messageHandler;
var key;

async function init(msgHandler){
    var messageHandler = msgHandler;

  // Address to a global keyvalue database containing status of the bids

    console.log("1");
    var status = await orbitDB.createDB("bidStatus", "keyvalue", "public");
    console.log(status);
    this.statusDB = await orbitDB.getKVDB(status);
    await this.statusDB.load();

    console.log("2");
  // Address to the global database containing all bids
    var bids = await orbitDB.createDB("Bids", "log", "public");
    this.globalDB = await orbitDB.getLogDB(bids);
    await this.globalDB.load();
    this.key = this.globalDB.key.getPublic('hex');

    console.log("3");
  // Address to the local databaes containing accepted bidStatus
    var localbids = await orbitDB.createDB("acceptedBids", "keyvalue", "local");
    this.localDB = await orbitDB.getKVDB(localbids);
    await this.localDB.load();
    console.log("4");
    //Add Listeners
    this.statusDB.events.on('replicated', () => {
	messageHandler({
            cmd: "updateBids",
	});
    });
    console.log("5");

    this.statusDB.events.on('write', () => {
	messageHandler({
            cmd: "updateBids",
	});
    });

    console.log("6");

    this.localDB.events.on('write', () => {
	messageHandler({
            cmd: "updateBids",
	});
    });
}

function getBids(amount){
    var bids = getBid.bind(this)(amount, this.globalDB);
  // for (var i = bids.length - 1; i >= 0; i--){
    //var tempAmount = bids[i].from.amount
    //bids[i].from.amount = bids[i].to.amount
    //bids[i].to.amount = tempAmount
    // if(bids[i].key == key || bids[i].status == "PENDING" || bids[i].status == "FINISHED"){
  //    bids.splice(i,1);
    // }
  // }
    return bids;
}

 function getBid2(bidID){
   console.log('getbid2')
  var bids = getBid(50, this.globalDB);
  for(var i = bids.length -1; i >=0; i--){
    if(bids[i].id == bidID){
      console.log('here')
      return bids[i]
    }
  }
  console.log('null')
  return null
}

async function addBid(bid){
  // Add bid to global database
  //Consult Samuel about structure of bids
    var id = await this.globalDB.add(bid); //object instead of bid
  // Add bid to local database
  await this.statusDB.put(id, "ACTIVE");
  console.log("***********bid is: %o", bid);

  await orbitDB.onChannelMessage(bid);

}

async function acceptBid(bidID) {
  await this.statusDB.put(bidID, "PENDING");
  await this.localDB.put(bidID, "PENDING");
  return this.globalDB.get(bidID)

}

/**
* Change the status of a bid
* @param bidID The id of the bid (bid.id)
* @param status The new status of the bid ("ACTIVE", "PENDING", "FINISHED")
*/

async function changeBidStatus(bidID, status){
    await this.statusDB.put(bidID, status);
}

function getUserBids(amount){
    var bids = getBid.bind(this)(amount, this.globalDB);
    for (var i = bids.length - 1; i >= 0; i--){
	if(bids[i].key != key){
	    bids.splice(i,1);
	}
    }
    return bids;
}

function getAcceptedBids(amount){
    var bids = getBids.bind(this)(amount);
    for (var i = bids.length - 1; i >= 0; i--){
	if(this.localDB.get(bids[i].id) == undefined){
	    bids.splice(i,1);
	}
    }
    return bids;
}

function getBidStatus(bidID){
    return this.statusDB.get(bidID);
}

function getBid(amount, db){
    var data = db.iterator({ limit : amount }).collect();
    var bids = [];
    for (var i = 0; i < data.length; i++) {
	var bid = data[i].payload.value;
	bid.id = data[i].hash;
	bid.key = data[i].key;
	bid.status = this.statusDB.get(data[i].hash);
	bids.push(bid);
    }
    return bids;
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
    init,
    globalDB
};
