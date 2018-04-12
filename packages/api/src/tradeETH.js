const ETH = require("./ethereum.js");
ETH.genesisCheck(ETH.web3);

function firstSender(bid, message){
    console.log("message should contain to_adr");
    //From address should perhaps be set somewhere else
    //secret should be generated based on mouse movement
    var secret = "1";
    
    //to_adr = message.to_adr
    wei_value bid.from.amount; //This is not in wei!!!


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
    firstSender,
    firstReceiver,
    secondSender,
    secondReceiver
}