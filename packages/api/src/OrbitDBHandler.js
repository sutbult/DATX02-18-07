const Ipfs = require('ipfs')
const OrbitDB = require('orbit-db')
const headless = require("./Headless.js")

async function init() {
    const orbitDBPromise = initOrbitDB();
    const headlessPromise = headless.init();
    await orbitDBPromise;
    await headlessPromise;
}

//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress

var orbitdb
var channel
var key
var ipfs

const access = {
    // Give write access to ourselves
    write: ['*'],
};

function initOrbitDB() {
    return new Promise((resolve, reject) => {
        ipfs = new Ipfs({
            repo: "ipfs/shared",
            config: {
                Addresses: {
                    Swarm: [
                      '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
                      '/dns4/wrtc-star.discovery.libp2p.io/tcp/443/wss/p2p-webrtc-star'
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
                orbitdb = new OrbitDB(ipfs);
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
  if(permission == "local"){
    permission = key
  }
  return headless.createDB(name, type, permission)
}

async function addData(data, channelName, address){
  var messaging = await createDB(channelName, "log", "public")
  channel = await getLogDB(messaging)
  await channel.load()

  var initialMessage = new Object();
  initialMessage.step = 1;
  initialMessage.address = address;

  var initialJSON = JSON.stringify(initialMessage);

  var key = await channel.add(initialJSON)

  //For testing
  const date = channel.iterator({ limit: -1 }).collect().map((e) => e.payload.value)
}

// Used for keyvalue database
async function addKVData(key, value, address){
  var db = await orbitdb.keyvalue(address)
  await db.load()
  await db.put(key, value);
}

async function getKVData(key, address){
  var db = await orbitdb.keyvalue(address)
  await db.load()
  var data = db.get(key)
  return data
}

async function acceptBid(bid, address, callback){
  var messagingChannel = await createDB(bid.channel, "log", "public")
  channel = await getLogDB(messagingChannel)
  await channel.load()
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)

  var acceptMessage = new Object();
  acceptMessage.step = 2;
  acceptMessage.address = address;
  acceptMessage.bid = bid;

  var JSONObject = JSON.stringify(acceptMessage)
  var returnvalue = await channel.add(JSONObject);

  checkForStep(3,callback);
}

async function bidAccepted(bid, callback){
  var messagingChannel = await createDB(bid.channel, "log", "public")
  channel = await getLogDB(messagingChannel)
  await channel.load()
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)

  checkForStep(2,callback);
}

//If correct step is found the information in the channel will be returned to the callback function
function checkForStep(step, callback) {
  console.log(step);
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)
  if(message != null) jsonObj = JSON.parse(message);
  else return;
  //the first step should terminate here, no one has accepted your bid yet
  if(jsonObj.step == 1){
    console.log("No one has accepted this bid yet");
    close(); //Doing only this creates this error: MaxListenersExceededWarning: Possible EventEmitter memory leak detected
    return
  }
  var index = require("./index.js")

  if(!index.acceptedBids.includes(jsonObj.bid)){
    index.acceptedBids.push(jsonObj.bid);
  }
  var timer = setInterval(function(){
    console.log(message);
    //after claim it sometimes turns up empty, TODO, fix that bug
    if(message !== []){
      if(JSON.parse(message).step != step) {
        message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
      } else {
        clearInterval(timer)
        callback(message);
      }
    }
  }, 5000);
}

async function pushDigestInfo(contractInfo, func) {

  var jsonObj = new Object();
  jsonObj.step = 3;
  jsonObj.digest = contractInfo.digest;
  jsonObj.contractAddress = contractInfo.contractAddress;
  jsonObj.address = contractInfo.address;
  jsonObj.bid = contractInfo.bid;

  var digestMessage = JSON.stringify(jsonObj)
  await channel.add(digestMessage);
  checkForStep(4,func);
}

async function pushContractInfo(contractInfo, message, callback) {
  //Will wait until the contract is deployed on the blockchain
  contractInfo.then(result => {

    var jsonMessage = message;
    jsonMessage.step = 4; //recycling step 3 data, need to update some values
    jsonMessage.contractAddress = result.contractAddress;
    var contractMessage = JSON.stringify(jsonMessage)

    message.promise = result.promise;
    channel.add(contractMessage);
    callback(message);
  });
}



async function getLogDB(address){
  var db = await orbitdb.log(address)
    return db

}

async function getKVDB(address){
  var db = await orbitdb.keyvalue(address)
  return db
}


async function close(){
  headless.close()
}

async function getData(amount, db){
  var data = db.iterator({ limit : amount }).collect()
  var bids = []
  for (var i = 0; i < data.length; i++) {
    var bid = data[i].payload.value
    bids.push(bid)
  }
  return bids
}

module.exports = {
  init,
  addData,
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
  close
}
