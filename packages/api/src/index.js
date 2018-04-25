
const db = require("./DBHandler.js");
const messenger = require("./OrbitDBHandler")
const runOnce = require("./runOnce.js");
const trader = require("./tradeHandler.js");

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
async function acceptBid(bidID, callback) {
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
    return [
        "Bitcoin",
        "Ethereum",
        "Bitcoin cash",
        "Ethereum classic",
        "Monero",
        "Dogecoin"
    ];
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
    getWallet,
    getUserBids,
    getCurrencies,
    setMessageHandler,
};
