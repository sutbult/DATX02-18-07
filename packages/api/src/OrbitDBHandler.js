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
var db
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
async function addData(data, address){
  data["step"] = "1"
  data["channel"] = await createDB(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), "feed", "public"); //randomly generated String https://gist.github.com/6174/6062387
  var db = await orbitdb.log(address);
  await db.load();
  var hash = await db.add(data);

  console.log(data.channel);

  channel = await orbitdb.feed(data.channel);
  await channel.add(data.address);
  return hash;

  //gives error
//  processInfo(checkForStep(2));
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
async function acceptBid(bid){
  channel = await orbitdb.feed(bid.channel);
  await channel.load();
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value)
  var jsonObject = { "step" : "2", "address" : bid.address};
  await channel.add(jsonObject);
  processInfo(message);
  //Let everybody know that the bid is taken.
  //checkForStep(3);
}

function checkForStep(step) {
  var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
  while(message.step != step) {
    var message = channel.iterator({ limit: 1 }).collect().map((e) => e.payload.value);
  }

  return message;
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
async function pushDigestInfo(contractInfo) {
  jsonObject = {
      "step" : "3",
      "digest" : contractInfo.digest,
      "contractAddress" : contractInfo.contractAddress
    };
  await channel.add(jsonObject);

  processInfo(checkForStep(4));

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
  jsonObject = {
      "step" : "4",
      "contractAddress" : contractInfo.contractAddress
    };
  await channel.add(jsonObject);
}


function processInfo(message) {
  if(contractInfo.step == 1) {
    return message;
    //call checkForStep(3)
  } else if(contractInfo.step == 2) {
    return message;
    //prompt user to complete step 3
  } else if(contractInfo.step == 3) {
    //prompt user to complete step 4
    return message;
  } else if(contractInfo.step == 4) {
    return message;
  } else {

  }

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
async function getData(amount, address){
    var db = await orbitdb.log(address)
    await db.load()
    var data = db.iterator({ limit : amount }).collect()
    return data
}

module.exports = {
  init,
  addData,
  getData,
  acceptBid,
  checkForStep,
  createDB,
  addKVData,
  getKVData
}
