
const db = require("./DBHandler.js");
const messenger = require("./OrbitDBHandler")
const runOnce = require("./runOnce.js");

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

// Exempel på funktioner som mycket väl kan finnas med i denna modul

// Adds a new bid to the decentralized database
async function addBid(bid) {
    await ensureInitialized();
    bid.status = "ACTIVE"
    bid.channel = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    //bid.channel = "/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message"
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
    console.log("User adds this bid:\n" + JSON.stringify(jsonObject, null, 4));
    */
    await db.addBid(bid);
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
    return db.getBids(50)

}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, callback) {
    await ensureInitialized();
    // TODO: Implementera på riktigt
    //var test = await db.acceptBid("bidID")
    console.log("User accepts the bid with this ID: %s", bidID);
    await db.acceptBid(bidID)
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
        Account("BTC", "100000000000"               ),
        Account("ETH", "20000000000000000000010"    ),
        Account("ETC", "10000000000000000000010"    ),
    ];
}

// Fetches all bids associated with the user
async function getUserBids() {
    await ensureInitialized();
    return db.getUserBids(50)
}
async function getAcceptedBids() {
    await ensureInitialized();
    // TODO: Implementera detta
    return [];
}

// Fetches the currencies which is available for the user to create bids with
async function getCurrencies() {
    await ensureInitialized();
    // TODO: Implementera på riktigt
    return [
        "BTC",
        "ETH",
        "ETC",
    ];
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
    getWallet,
    getUserBids,
    getAcceptedBids,
    getCurrencies,
    setMessageHandler,
};
