
const db = require("./DBHandler.js");
const messenger = require("./OrbitDBHandler")
const runOnce = require("./runOnce.js");
const trader = require("./tradeHandler.js");
const diskStore = require("./diskStore.js");

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

    /**check in a set interval if anyone accepted your bid
     * @todo clearInterval once all bids are accepted: https://nodejs.org/en/docs/guides/timers-in-node/
     */
    const interval = setInterval(checkAccBid, 10000);
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
    bid.status = "ACTIVE"
    bid.channel = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    await db.addBid(bid);
}

async function checkAccBid(){
    // console.log("CHECK IF ANY BID IS ACCEPTED");
    /**Not sure how the limit in this function works, but need all userBids, soo
    *@todo someone with knowledge fix this
    */
    var bids = await db.getUserBids(1000000000000000);
    // console.log("*********Lets see ******");
    // console.log(db.getAcceptedBids(50));
    // console.log(bids);
    bids.forEach(bid => {
        // console.log(bid);
        console.log(db.getBidStatus(bid.id)); //bidStatus in statusDB is changed in tradeHandler if accepted
        //This is to stop multiple deploys
        if(bid.status == "ACTIVE" && db.getBidStatus(bid.id) == "ACTIVE") messenger.bidAccepted(bid,trader.whenBidAccepted);
    });
}

// Fetches all available bids from the decentralized database
async function getBids() {
    await ensureInitialized();
    return db.getBids(50);

}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, seed) {
    await ensureInitialized();
    // db.acceptBid(bidID);
    trader.acceptBid(bidID);
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
    return db.getUserBids(50)
}
async function getAcceptedBids() {
    await ensureInitialized();
    return db.getAcceptedBids(50)
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
    }
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
async function setPasswords(passwords) {
    await ensureInitialized();
    // TODO: Implementera på riktigt
    console.log("User posted these passwords: %s", JSON.stringify(passwords, null, 4));

    var result = [];
    for(var i in passwords) {
        result.push({
            currency: passwords[i].currency,
            success: passwords[i].password === "",
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
