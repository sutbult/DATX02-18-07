const api = require("./OrbitDBHandler.js");

// Exempel på funktioner som mycket väl kan finnas med i denna modul

// Adds a new bid to the decentralized database
async function addBid(bid) {
    // TODO: Implementera på riktigt
    console.log("User adds this bid:\n" + JSON.stringify(bid, null, 4));
}

// Fetches all available bids from the decentralized database
async function getBids() {
    return api.getBid(5)
}

// Accepts a bid and starts the swapping process
async function acceptBid(bidID, callback) {
    // TODO: Implementera på riktigt
    console.log("User accepts the bid with this ID: %s", bidID);
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
};
