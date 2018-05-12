const Ipfs = require('ipfs');
const OrbitDB = require('orbit-db');
const headless = require("./Headless.js");
const os = require("os");
const path = require("path");
const trader = require("./tradeHandler.js");
const access = {
write: ['*'],
}

var directory;


const STORAGE_DIR = path.join(
    os.homedir(),
    ".DATX02-18-07",
    "storage"
);
const IPFS_DIR = path.join(
    STORAGE_DIR,
    "ipfs"
);
const ORBITDB_DIR = path.join(
    STORAGE_DIR,
    "orbitdb"
);


async function init() {
    var string = __dirname.split("\\packages");
    directory = string[0].replace(/\\/g, "/");

    const orbitDBPromise = initOrbitDB();
    const headlessPromise = headless.init();
    await orbitDBPromise;
    await headlessPromise;
}

//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress

var orbitdb;
var channel;
var key;
var ipfs;

function initOrbitDB() {
    return new Promise((resolve, reject) => {
        ipfs = new Ipfs({
            repo: IPFS_DIR,
            config: {
                Addresses: {
                    Swarm: [
          '/dns4/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
          //  '/dnsaddr/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
          // '/dnsaddr/ws-star-signal-1.servep2p.com/tcp/443/wss/p2p-websocket-star',
          // '/dnsaddr/ws-star-signal-2.servep2p.com/tcp/443/wss/p2p-websocket-star',
          // '/dnsaddr/ws-star-signal-3.servep2p.com/tcp/443/wss/p2p-websocket-star',
                    ],
                },
            },
            EXPERIMENTAL: {
                // OrbitDB requires pubsub
                pubsub: true,
            },
        });
        ipfs.once('error', error => {
            reject(error);
        });
        ipfs.once('ready', () => {
            try {
                orbitdb = new OrbitDB(ipfs, ORBITDB_DIR);
                key = orbitdb.key.getPublic('hex');
                resolve();
            }
            catch(error) {
                reject(error);
            }
        });
    });
}



/**
* Creates a new database address
* @param name The name of the database
* @param type The database type (log, feed, keyvalue)
* @param permission The write permission of the database. (public, local)
*/
async function createDB(name, type, permission){
  if(os.platform() == "win32"){
    if(permission == "local"){
        permission = key;
    }
      return headless.createDB(name, type, permission);
  }
  else {
    return name;
  }

}

// Used for keyvalue database
async function addKVData(key, value, address){
    var db = await orbitdb.keyvalue(address);
    await db.load();
    await db.put(key, value);
}

async function getKVData(key, address){
    console.log(address);
    var db = await orbitdb.keyvalue(address);
    console.log(db);
    await db.load();
    var data = db.get(key);
    return data;
}

async function acceptBid(bid, address, callback){
    console.log('messenger');
    var messagingChannel = await createDB(bid.channel, "log", "public");
    channel = await getLogDB(messagingChannel);
    await channel.load();
    var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);

    var acceptMessage = new Object();
    acceptMessage.step = 1;
    acceptMessage.bid = bid;
    acceptMessage.currencySeller = new Object();
    acceptMessage.currencyBuyer = new Object();
    acceptMessage.currencySeller.buyerAddress = address;

    var JSONObject = JSON.stringify(acceptMessage);
    var returnvalue = await channel.add(JSONObject);
    console.log('sent to the channel');
    await require("./DBHandler.js").acceptBid(bid.id);

    checkForStep(2,callback);
}

async function bidAccepted(bid, callback){
    var messagingChannel = await createDB(bid.channel, "log", "public");
    channel = await getLogDB(messagingChannel);
    await channel.load();
    var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);

    checkForStep(1,callback);
}

//If correct step is found the information in the channel will be returned to the callback function
function checkForStep(step, callback, secret) {
    var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
    try{
	console.log(message);
	jsonObj = JSON.parse(message);
    } catch(e) {
	console.log("No one has accepted this bid yet: " + e);
	return;
    }
    var timer = setInterval(function(){
	//after claim it sometimes turns up empty, TODO, fix that bug
	if(message != null && message != []){
	    console.log(message);
	    try{
		if(JSON.parse(message).step != step) {
		    message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
		} else {
		    clearInterval(timer);
		    callback(message, secret);
		}

	    }catch(e){
		console.log("For some reason an incorrect message: " + e);
	    }
	}
    }, 5000);
}

async function pushDigestInfo(contractInfo, func, secret) {

    // var messaging = await createDB(contractInfo.channel, "log", "public"); //Additions
    // channel = await getLogDB(messaging);
    // await channel.load();
    // close();

    var jsonObj = contractInfo;
    jsonObj.step = 2;
    // jsonObj.digest = contractInfo.digest;
    // jsonObj.contractAddress = contractInfo.contractAddress;
    // jsonObj.address = contractInfo.address;
    // jsonObj.bid = contractInfo.bid;

    var digestMessage = JSON.stringify(jsonObj);
    await channel.add(digestMessage);
    checkForStep(3, func, secret);
}

async function pushContractInfo(message, callback) {
    //Will wait until the contract is deployed on the blockchain

    var jsonMessage = message;
    jsonMessage.step = 3; //recycling step 3 data, need to update some values
    var contractMessage = JSON.stringify(jsonMessage);

    channel.add(contractMessage);
    callback(message);
}



async function getLogDB(address){
  var db;
    if(os.platform() == "win32"){
      db = await orbitdb.log(address);
      headless.close();
    }
    else{
      db = await orbitdb.log(address, access);
    }
    return db;

}

async function getKVDB(address){
  var db;
  if(os.platform() == "win32"){
    var db = await orbitdb.keyvalue(address);
    headless.close();
  }
  else {
    db = await orbitdb.keyvalue(address, access);
  }
    return db;
}

async function getData(amount, db){
    var data = db.iterator({ limit : amount }).collect();
    var bids = [];
    for (var i = 0; i < data.length; i++) {
	var bid = data[i].payload.value;
	bids.push(bid);
    }
    return bids;
}

async function changeStatus(message, newStatus){
    message.bid.status = newStatus;

    channel.add(message);

}

var bidz
async function onChannelMessage(bid){
    var messagingChannel, channel;
    console.log("Let's go");
    messagingChannel = await createDB(bid.channel, "log", "public");
    channel = await getLogDB(messagingChannel);
    await channel.load();
    // console.log(channel);
    bidz = bid;
    channel.events.on('replicated',(address) => {
        console.log("In onChannelMessage");
        bidAccepted(bid, trader.runSeller);
    });
}

async function exit(){
    await headless.closeAll();
  if(orbitdb) {
      await orbitdb.stop();
  }
  if(ipfs) {
      await ipfs.stop();
  }
}

function getContract(){
  var data = channel.iterator({ limit : -1 }).collect().map((e) => e.payload.value)
  var message = []
  for (var i = 0; i < data.length; i++){
    message[i] = JSON.parse(data[i])
  }

  for(var i = 0; i < message.length; i++){
    if(message[i].step == 2){
        return message[i].contractAddress;
    }
  }
}

module.exports = {
    init,
    getData,
    bidAccepted,
    acceptBid,
    pushDigestInfo,
    pushContractInfo,
    checkForStep,
    createDB,
    addKVData,
    getKVData,
    getLogDB,
    getKVDB,
    changeStatus,
    onChannelMessage,
    exit,
    getContract
};
