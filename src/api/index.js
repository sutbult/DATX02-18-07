
// Exempel på funktioner som mycket väl kan finnas med i denna modul

// Adds a new bid to the decentralized database
function addBid(bid, callback) {
    // TODO: Implementera på riktigt
    console.log("User adds this bid:\n" + JSON.stringify(bid, null, 4));
    callback(null);
}

// Fetches all available bids from the decentralized database
function getBids(callback) {
    // TODO: Implementera på riktigt
    function Bid(fromCurrency, fromAmount, toCurrency, toAmount) {
        return {
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
    callback(null, [
        Bid("Bitcoin",      0.01,   "Ethereum",     0.1     ),
        Bid("Ethereum",     0.5,    "Monero",       5       ),
        Bid("Ethereum",     0.1,    "Dogecoin",     9001    ),
        Bid("Bitcoin",      0.02,   "Monero",       2       ),
        Bid("Bitcoin cash", 0.3,    "Monero",       3       ),
        Bid("Dogecoin",     100,    "Monero",       3       ),
    ]);
}

// Accepts a bid and starts the swapping process
/*
    Har vi något system för att hantera referenser till bud? I så fall borde
    denna ändpunkt ta emot en sådan referens istället för hela budet.

    / Samuel
*/
function acceptBid(bid, callback) {
    // TODO: Implementera på riktigt
    console.log("User accepts this bid:\n" + JSON.stringify(bid, null, 4));
    callback(null);
}

module.exports = {
    addBid,
    getBids,
    acceptBid,
};
