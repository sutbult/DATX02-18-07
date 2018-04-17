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


/*
Bid should be JSON in form of jsonObject = {
    "step" : "1",
    "from" : {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "to": {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "address" : adressString,
    "channel" : channelString
  };

  Can only push one bid at a time at the moment
*/
async function addData(data, channelName, address){
/*
  var channelName = await createDB(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), "log", "public") //randomly generated String https://gist.github.com/6174/6062387

  var dataStringify = JSON.stringify(data);
  var dataParsed = JSON.parse(dataStringify)
  //var parsedData = JSON.parse(data)
  console.log("Status: " + dataParsed.status);

  var object = { "step" : "1", "from" : dataParsed.from, "to" : dataParsed.to, "address" : address, "channel" : channelName};
  console.log("BID: " + JSON.stringify(object));
*/
  var messaging = await createDB(channelName, "log", "public")
  channel = await getLogDB(messaging)
  await channel.load()
  console.log("1: " + messaging);

  var initialMessage = new Object();
  initialMessage.step = 1;
  initialMessage.address = address;

  var initialJSON = JSON.stringify(initialMessage);

  var key = await channel.add(initialJSON)

  //For testing
  const date = channel.iterator({ limit: -1 }).collect().map((e) => e.payload.value)

  // console.log("date: " + date);
  // console.log("JSON.parse(date).step: " + JSON.parse(date).step);

  //checkForStep(2);

  //Return address and tell blockchain part to call step 3

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

/*
  Just send address
  jsonObject = {
      "step" : "2",
      "adress" : adressString
    };
*/
async function acceptBid(bid,address, func){
  var messagingChannel = await createDB(bid.channel, "log", "public")
  // console.log("MessagingChannel: " + messagingChannel);
  channel = await getLogDB(messagingChannel)
  await channel.load()
  // console.log("After channel.log");
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)

  //Send information to blockchain parts

  var acceptMessage = new Object();
  acceptMessage.step = 2;
  acceptMessage.address = address; //How do we access address?

  var JSONObject = JSON.stringify(acceptMessage)
  await channel.add(JSONObject);


  checkForStep(3,func); //Might be done at blockchain part
  //Let everybody know that the bid is taken.
  //Send to blockchain parts
}

async function bidAccepted(bid, func){
  var messagingChannel = await createDB(bid.channel, "log", "public")
  channel = await getLogDB(messagingChannel)
  await channel.load()
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)

  checkForStep(2,func);
}

function checkForStep(step, func) {
  console.log(step);
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)
  console.log(message);
  //the first step is unnecessary, no one has accepted your bid yet
  if(JSON.parse(message).step == 1){
    console.log("it ends here");
    close();
    return
  }
  var timer = setInterval(function(){
    if(JSON.parse(message).step != step) {
      message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
      console.log("In checkForStep " + JSON.parse(message).step);
      //return message
    } else {
      clearInterval(timer)
      console.log("Correct step: " + JSON.parse(message).step)
      func(message);
    }
  }, 1000);
}

/*
  Just send address and channel
  jsonObject = {
      "step" : "3",
      "channel" : channelString,
      "digest" : digestString,
      "contractAddress" : contractAddressString
    };
*/
async function pushDigestInfo(contractInfo, func) {

  var digestMessage = new Object();
  digestMessage.step = 3;
  digestMessage.digest = contractInfo.digest;
  digestMessage.contractAddress = contractInfo.contractAddress;
  digestMessage.address = contractInfo.address;


  var JSONdigest = JSON.stringify(digestMessage)
  await channel.add(JSONdigest);
  checkForStep(4,func);
  //Send to blockchain
}

/*
  Just send address and channel
  jsonObject = {
      "step" : "4",
      "channel" : channelString,
      "contractAddress" : contractAddressString
    };
*/
async function pushContractInfo(contractInfo) {
  var contractMessage = new Object();
  contractMessage.step = 4;
  contractMessage.contractAddress = contractMessage.contractAddress;
  var JSONContract = JSON.stringify(contractMessage)

  await channel.add(JSONContract);

  //Complete transaction
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




/*
var jsonObject = {
    "step" : "1",
    "from" : "CURRENCY",
    "fromAmount" : '5',
    "to":"CURRENCY",
    "toAmount" : '5',
    "address" : 'test',
    "channel" : '/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message'
  };
*/
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
