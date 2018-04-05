const db = require("./DBHandler.js");
const messenger = require("./OrbitDBHandler")

// Exempel på funktioner som mycket väl kan finnas med i denna modul

// Adds a new bid to the decentralized database
async function addBid(bid) {
  bid.status = "ACTIVE"
  bid.channel = "/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message"
  /*var jsonObject = {
      "step" : "1",
      "from" : "CURRENCY",
      "fromAmount" : '5',
      "to":"CURRENCY",
      "toAmount" : '5',
      "address" : 'test',
      "channel" : '/orbitdb/QmYSrtiCHNTGxoBikQBt5ynoMfGHhEuLmWkPx7yaPdCPgs/message'
    };
    console.log("User adds this bid:\n" + JSON.stringify(jsonObject, null, 4));*/
    await db.addBid(bid)
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
    var bid = await db.getBid(50)
    return bid
}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, callback) {
    // TODO: Implementera på riktigt
    console.log("User accepts the bid with this ID: %s", bidID);
}

// Fetches all accounts associated with the user
async function getWallet() {
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
  var bid = await db.getUserBids(50)
  return bid

}

// Fetches the currencies which is available for the user to create bids with
async function getCurrencies() {
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
};
