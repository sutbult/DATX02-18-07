const api = require("./OrbitDBHandler.js");

// Exempel på funktioner som mycket väl kan finnas med i denna modul

// Adds a new bid to the decentralized database
async function addBid(bid) {
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
    api.addBid(jsonObject)

}


// Temporär
function BidFactory() {
    var idCounter = 1;
    function Bid(fromCurrency, fromAmount, toCurrency, toAmount) {
        return {
            id: "VeryRandomID" + idCounter++,
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
    // Detta fungerar inte
    //addBid('test')
    //return api.getBid(5)

    // TODO: Implementera på riktigt
    var Bid = BidFactory();
    return [
        Bid("Bitcoin",      0.01,   "Ethereum",     0.1     ),
        Bid("Ethereum",     0.5,    "Monero",       5       ),
        Bid("Ethereum",     0.1,    "Dogecoin",     9001    ),
        Bid("Bitcoin",      0.02,   "Monero",       2       ),
        Bid("Bitcoin cash", 0.3,    "Monero",       3       ),
        Bid("Dogecoin",     100,    "Monero",       3       ),
    ];
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
        Account("Bitcoin", 1000),
        Account("Ethereum", 10000),
        Account("Dogecoin", 1000000000), // Wow, such wealth, many monies
    ];
}

// Fetches all bids associated with the user
async function getUserBids() {
    var Bid = BidFactory();
    return [
        Bid("Dogecoin",     1000,   "Ethereum", 0.1),
        Bid("Bitcoin cash", 0.5,    "Bitcoin",  0.1),
    ];
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
    getWallet,
    getUserBids,
};
