const messenger = require("./OrbitDBHandler")
const db = require("./DBHandler.js");
//"global" variable, will be assigned if function whenBidAccepted is called, otherwise stays null
var secret = null;

//Called from an interval set in index.js if bid has been accepted
//bid is accepted if the bid.channel contains a step 2
function whenBidAccepted(msg){
    //remove bid from db to prevent multiple contracts

    //use random function to get a good secret
    secret = 1;

    var jsonObj;
    var message = JSON.parse(msg);
    message.secret = secret;
    var fromCurrency = message.bid.from.currency;
    // console.log("****LETS SEE WHAT WE HAVE HERE %s and the whole thing %o", message.bid.status, message);
    if(message.bid.status == "ACTIVE"){
        switch(fromCurrency){
            case "Ethereum":
                console.log("From Ethereum");
                //Make sure only one contract is deployed, this does that by changing status to pending
                db.acceptBid(message.bid.id);
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
    }else{
        console.log("Already deployed");
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
                messenger.acceptBid(bid, accs[2], secondContract);
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

function unlockWithSecret(msg){
    var message;
    if(msg.constructor === {}.constructor) message = msg;
    else message = JSON.parse(msg);
    message.secret = secret;
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

module.exports = {
    whenBidAccepted,
    acceptBid
}