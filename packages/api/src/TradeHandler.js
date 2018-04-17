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
    messenger.pushDigestInfo(jsonObj, whenBidAccepted2);
}

function whenBidAccepted2(){
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
    var bid = await db.getBid2(bidID);
    // const util = require("util");
    // console.log(util.inspect(bid,false,null));
    var message;
    var address;
    var fromCurrency = bid.from.currency;
    switch(fromCurrency){
        case "Ethereum":
            console.log("From Ethereum");
            var eth = require("./tradeEth.js");
            address = eth.getAddress();
            messenger.acceptBid(bid, address, eth.acceptBid(bid));
            break;
        case "Ethereum classic":
            console.log("From Ethereum classic");
            //jsonObj = require("./tradeEtc.js").secondReceiver(bid);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
            return;
            //Throw error
    }
    // messenger.acceptBid(bid, address, acceptBid2);
}

module.exports = {
    whenBidAccepted,
    acceptBid
}