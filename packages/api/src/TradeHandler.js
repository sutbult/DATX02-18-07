const messenger = require("./OrbitDBHandler")
const db = require("./DBHandler.js");
var secret = null;
function whenBidAccepted(msg){
    //remove bid from db to prevent multiple contracts

    //use random function to get a good secret
    secret = 1;
    var jsonObj;
    var message = JSON.parse(msg);
    message.secret = secret;
    var fromCurrency = message.bid.from.currency;
    
    switch(fromCurrency){
        case "Ethereum":
            console.log("From Ethereum");
            require("./tradeETH.js").firstContract(message, function(promise){
                promise.then(result => {
                    result.bid = message.bid;
                    messenger.pushDigestInfo(result, unlockWithSecret);
                });
            }); 
            break;
        case "Ethereum classic":
            console.log("From Ethereum classic");
            //jsonObj = require("./tradeEtc.js").firstContract(bid);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
            //Throw error
    }
}

function unlockWithSecret(msg){
    // console.log("Unlock msg");
    // console.log(msg);
    var message;
    if(msg.constructor === {}.constructor) message = msg;
    else message = JSON.parse(msg);
    message.secret = secret;
    // console.log(message);
    var toCurrency = message.bid.to.currency;
    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            require("./tradeETH.js").claim(message);
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
    var bid = await db.getBid2(bidID);
    var message;
    var address;
    var fromCurrency = bid.from.currency;
    switch(fromCurrency){
        case "Ethereum":
            console.log("From Ethereum");
            var eth = require("./tradeETH.js");
            eth.getAddress()
            .then(accs => {
                messenger.acceptBid(bid, accs[1], secondContract);
            });
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

function secondContract(msg){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message;
    if(msg.constructor === {}.constructor) message = msg;
    else message = JSON.parse(msg);

    var toCurrency = message.bid.to.currency;
    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            var eth = require("./tradeETH.js");
            eth.secondContract(message, messenger.pushContractInfo,unlockWithSecret);
            break;
        case "Ethereum classic":
            console.log("To Ethereum classic");
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