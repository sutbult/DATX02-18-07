const messenger = require("./OrbitDBHandler")
const db = require("./DBHandler.js");
//"global" variable, will be assigned if function whenBidAccepted is called, otherwise stays null
var secret = null;

//Called from an interval set in index.js if bid has been accepted
//bid is accepted if the bid.channel contains a step 2
async function whenBidAccepted(msg){
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
            case "ETH":
                console.log("From Ethereum");
                //Make sure only one contract is deployed, this does that by changing status to pending
                db.acceptBid(message.bid.id);
                result = await require("./tradeETH.js").firstContract(message);
                console.log("¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤result¤¤¤ " + result);
                result.bid = message.bid;
                messenger.pushDigestInfo(result, unlockWithSecret);
                break;
            case "ETC":
                console.log("From Ethereum classic");
                
                //Make sure only one contract is deployed, this does that by changing status to pending
                db.acceptBid(message.bid.id);
                result = await require("./tradeETC.js").firstContract(message);
                console.log("¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤¤result¤¤¤ " + result);
                result.bid = message.bid;
                messenger.pushDigestInfo(result, unlockWithSecret);
                break;
            default:
                console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
                return;
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
        case "ETH":
            console.log("From Ethereum");
            
            accounts = await require("./tradeETH.js").getAccounts()
            messenger.acceptBid(bid, accounts[2], secondContract);
            
            break;
        case "ETC":
            console.log("From Ethereum classic");
            
            accounts = await require("./tradeETC.js").getAccounts()
            messenger.acceptBid(bid, accounts[2], secondContract);

            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
            return;
            //Throw error
    }
}

async function secondContract(msg){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message;
    if(msg.constructor === {}.constructor) message = msg;
    else message = JSON.parse(msg);

    var toCurrency = message.bid.to.currency;
    switch(toCurrency){
        case "ETH":
            console.log("To Ethereum");
            var eth = require("./tradeETH.js");
            contract = await eth.secondContract(message);
            messenger.pushContractInfo(contract, message, unlockWithSecret);
            break;
        case "ETC":
            console.log("To Ethereum classic");
            var etc = require("./tradeETC.js");
            contract = await etc.secondContract(message)
            messenger.pushContractInfo(contract, message, unlockWithSecret);
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
        case "ETH":
            console.log("To Ethereum");
            require("./tradeETH.js").claim(message);
            break;
        case "ETC":
            console.log("To Ethereum classic");
            require("./tradeETC.js").claim(message);
            break;
        default:
            console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }
}

module.exports = {
    whenBidAccepted,
    acceptBid
}
