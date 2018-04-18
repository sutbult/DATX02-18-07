const ETH = require("./ethereum.js");
ETH.genesisCheck(ETH.web3);

var bid;
//Set the global bid to be used in acceptBid for instance, does it work?
function setBid(_bid){
    bid = _bid;
    console.log("bid is set to: " + bid);
}

function getAddress(){
    //The user should get to choose which account
    return ETH.web3.eth.getAccounts();
    // .then(accs => {return accs[0]});
}

function getAddressSuccess(result){
    console.log("Hello");
    console.log(result);
}

function acceptBid(message){
    console.log(message);
    console.log(bid);
    var jsonObj;
    var toCurrency = bid.to.currency;
    switch(toCurrency){
        case "Ethereum":
            console.log("To Ethereum");
            // jsonObj = require("./tradeEth.js").secondSender(bid, message);
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

    console.log("Alrighty, you can continue from acceptBid in tradeETH");
    // console.log(jsonObj);
    // console.log(messenger);
    // messenger.pushContractInfo(jsonObj);

    // var fromCurrency = bid.from.currency;
    // switch(fromCurrency){
    //     case "Ethereum":
    //         console.log("From Ethereum");
    //         jsonObj = require("./tradeEth.js").secondReceiver(bid);
    //         break;
    //     case "Ethereum classic":
    //         console.log("From Ethereum classic");
    //         //jsonObj = require("./tradeEtc.js").secondReceiver(bid);
    //         break;
    //     default:
    //         console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    //         return;
    //         //Throw error
    // }
    
}



function firstSender(bid, message){
    console.log("message should contain to_adr");
    //From address should perhaps be set somewhere else
    //secret should be generated based on mouse movement
    var secret = "1";
    
    //to_adr = message.to_adr
    wei_value = bid.from.amount; //This is not in wei!!!


    return ETH.sendEtherContract(ETH.web3,form_adr,secret,digest,to_adr,wei_value);
}

function firstReceiver(bid, message){
    console.log("message should contain contractaddress " + message);
}



function secondSender(bid, message){
    console.log("message should contain contractaddress and digest " + message);
}

function secondReceiver(bid, message){
    console.log("message should contain contractaddress " + message);
}

module.exports = {
    getAddress,
    acceptBid
    // firstSender,
    // firstReceiver,
    // secondSender,
    // secondReceiver
}