
const db = require("./DBHandler.js");
const messenger = require("./OrbitDBHandler");
const runOnce = require("./runOnce.js");
const trader = require("./tradeHandler.js");
const diskStore = require("./diskStore.js");
const localStore = require("./localStore.js");

// Describes every currency that is available to the user
const availableCurrencies = [
    "BTC",
    "ETH",
    "ETC",
];

async function init() {
    // messageHandler kommer att vara tillgänglig här
    const messengerPromise = messenger.init();
    await messengerPromise;
    const dbPromise = db.init(messageHandler);
    await dbPromise;
}

const ensureInitialized = runOnce(init);

var messageHandler = null;
function setMessageHandler(messageHandlerArg) {
    messageHandler = messageHandlerArg;
}


// Adds a new bid to the decentralized database
async function addBid(bid) {
    await ensureInitialized();
    console.log("Is this thing on");
    bid.status = "ACTIVE";
    bid.channel = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await db.addBid(bid);

}

// Fetches all available bids from the decentralized database
async function getBids() {
    await ensureInitialized();
    return db.getBids(50);

}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, seed) {
    await ensureInitialized();
    var bid = await db.acceptBid(bidID);
    await trader.acceptBid(bid);
    // console.log("User accepts the bid with this ID: %s", bidID);
}

// Fetches all accounts associated with the user
async function getWallet() {
    await ensureInitialized();
    function Account(currency, amount) {
        return {
            currency: currency,
            amount: amount,
        };
    }

    var returnArr = [];
    try{
        var eth = require("./ethereum.js");
        if(eth.web3 != undefined){
            var address = eth.web3.eth.getAccounts()
            .then(accs => {
                eth.web3.eth.getBalance(accs[2])
                .then(amount => {
                    returnArr.push(Account("Ethereum", amount));
                });
            });
        }

    } catch(e){
        console.log("Error in index.getWallet(): " + e);
    }

    console.log(returnArr);

    return returnArr;
}

// Fetches all bids associated with the user
async function getUserBids() {
    await ensureInitialized();
    return db.getUserBids(50);
}
async function getAcceptedBids() {
    await ensureInitialized();
    return db.getAcceptedBids(50);
}

// Fetches the currencies which is available for the user to create bids with
async function getCurrencies() {
    await ensureInitialized();
    // TODO: Implementera på riktigt
    return availableCurrencies;
}
async function getSettings() {
    await ensureInitialized();

    var blockchainPathList = [];
    for(var i in availableCurrencies) {
        const currency = availableCurrencies[i];
        const value = (await diskStore.get("blockchainPath" + currency)) || "";

        blockchainPathList.push({
            currency,
            value,
        });
    }
    return {
        blockchainPathList,
    };
}
async function setSettings(newSettings) {
    await ensureInitialized();

    for(var i in newSettings.blockchainPathList) {
        const element = newSettings.blockchainPathList[i];
        const currency = element.currency;
        const value = element.value;

        // Only available currencies will be stored
        if(availableCurrencies.indexOf(currency) != -1) {
            await diskStore.set("blockchainPath" + currency, value);
        }
    }
}
async function isValidPassword(currency, password) {
    // TODO: Implementera på riktigt
    return password === "";
}
async function setPasswords(passwords) {
    await ensureInitialized();

    var passwordPromises = {};
    var result = [];
    for(var i in passwords) {
        passwordPromises[i] = isValidPassword(
            passwords[i].currency,
            passwords[i].password
        );
    }
    for(var i in passwords) {
        const currency = passwords[i].currency;
        const password = passwords[i].password;
        const success = await passwordPromises[i];

        if(success) {
            localStore.set("password" + currency, password);
        }
        result.push({
            currency,
            success,
        });
    }
    return result;
}

// Temporär. Finns av testningsskäl.
function delay(seconds) {
    return new Promise(resolve => {
        setTimeout(resolve, seconds * 1000);
    });
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
    getWallet,
    getUserBids,
    getAcceptedBids,
    getCurrencies,
    getSettings,
    setSettings,
    setPasswords,
    setMessageHandler,
};
