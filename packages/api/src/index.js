
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
    setInterval(checkAccBid, 10000);
}
const ensureInitialized = runOnce(init);

var messageHandler = null;
function setMessageHandler(messageHandlerArg) {
    messageHandler = messageHandlerArg;
}

// Adds a new bid to the decentralized database
async function addBid(bid) {
    await ensureInitialized();
    bid.status = "ACTIVE"
    bid.channel = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    await db.addBid(bid);
}

async function checkAccBid(){
    console.log("It's alive!");
    /**Not sure how the limit in this function works, but need all userBids, soo
    *@todo someone with knowledge fix this 
    */
    var bids = await db.getUserBids(1000000000000000);
    //console.log(bids);
    bids.forEach(bid => {
        messenger.bidAccepted(bid,trader.whenBidAccepted);
        //Only testcheck, remove
        // if(bid.status === "ACTIVE"){
        //     console.log("Bara att fortsätta vänta");
        // }
        // //The big question is if the status will be === ACCEPTED
        // if(bid.status === "ACCEPTED"){
        //     trader.whenBidAccepted(bid);
        // }
    });
}


// Temporär
function BidFactory() {
    var idCounter = 1;
    function Bid(fromCurrency, fromAmount, toCurrency, toAmount, status) {
        if(!status) {
            status = "ACTIVE";
        }
        return {
            id: "VeryRandomID" + idCounter++,
            status: status,
            from: {
                currency: fromCurrency,
                amount: fromAmount,
            },
            to: {
                currency: toCurrency,
                amount: toAmount,
            }
        }
    }
    return Bid;
}

// Fetches all available bids from the decentralized database
async function getBids() {
    await ensureInitialized();
    return db.getBid(50)

}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, callback) {
    await ensureInitialized();
    
    trader.acceptBid(bidID);
    console.log("User accepts the bid with this ID: %s", bidID);
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
    return [
        Account("Bitcoin",  "100000000000"              ),
        Account("Ethereum", "10000000000000000000010"   ),
        Account("Dogecoin", "1000000000"                ), // Wow, such wealth, many monies
    ];
}

// Fetches all bids associated with the user
async function getUserBids() {
    await ensureInitialized();
    return db.getUserBids(50)
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
