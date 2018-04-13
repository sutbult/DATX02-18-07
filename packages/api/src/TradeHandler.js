const messenger = require("./OrbitDBHandler")
const db = require("./DBHandler.js");

function whenBidAccepted(bid){
    var jsonObj;
    var fromCurrency = bid.from.currency;
    
    switch(fromCurrency){
        case "Ethereum":
            console.log("From Ethereum");
            jsonObj = require("./tradeEth.js").firstSender(bid);
            break;
        case "Ethereum classic":
            console.log("From Ethereum classic");
            //jsonObj = require("./tradeEtc.js").firstSender(bid);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
            //Throw error
    }

    //firstSender will wait here until secondSender has sent their contractAdr
    var message = messenger.pushDigestInfo(jsonObj);

    var toCurrency = bid.to.currency;
    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            require("./tradeEth.js").firstReceiver(bid, message);
            break;
        case "Ethereum classic":
            console.log("To Ethereum classic");
            //require("./tradeEtc.js").firstReceiver(bid, message);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }
}

async function acceptBid(bidID){
    //Fetch bid from database with bidID
    var bid = await db.getBid(bidID);
    // const util = require("util");
    // console.log(util.inspect(bid,false,null));
    
    //step 2
    messenger.acceptBid(bid);
    //Also in step 2 must run checkForStep(3)
    
    //needs to receive message before secondSender can send anything
    var message = messenger.checkForStep(3);

    var jsonObj;

    var toCurrency = bid.to.currency;
    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            jsonObj = require("./tradeEth.js").secondSender(bid, message);
            break;
        case "Ethereum classic":
            console.log("To Ethereum classic");
            //jsonObj = require("./tradeEtc.js").secondSender(bid, message);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }

    messenger.pushContractInfo(jsonObj);

    var fromCurrency = bid.from.currency;
    switch(fromCurrency){
        case "Ethereum":
            console.log("From Ethereum");
            jsonObj = require("./tradeEth.js").secondReceiver(bid);
            break;
        case "Ethereum classic":
            console.log("From Ethereum classic");
            //jsonObj = require("./tradeEtc.js").secondReceiver(bid);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
            //Throw error
    }
}

/**Deploy the HTLC on the appropriate chain. Determined by to and from of bid
 * @param {object} bid 
 */
function toSwitchCase(bid, message){
    var toCurrency = bid.to.currency;

    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            Eth.receiver(bid, message);
            break;
        case "Ethereum classic":
            console.log("To Ethereum classic");
            //Etc.receiver(bid, message);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }
}

module.exports = {
    whenBidAccepted,
    acceptBid
}