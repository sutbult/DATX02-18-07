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
    
    messenger.acceptBid(bid, acceptBid2);
}

function acceptBid2(){
    console.log(message);
    console.log("Rad 48 in TradeHandler, printas detta anta att messenger.acceptBid funkar");
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
            return;
            //throw error
    }
    console.log(jsonObj);
    // console.log(messenger);
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
            return;
            //Throw error
    }
    
}

module.exports = {
    whenBidAccepted,
    acceptBid
}