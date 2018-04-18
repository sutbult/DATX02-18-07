const ETH = require("./ethereum.js");
ETH.genesisCheck(ETH.web3);

function getAddress(){
    //The user should get to choose which account
    return ETH.web3.eth.getAccounts();
}

async function firstContract(message, callback){
    // console.log("message should contain to_adr");
    //From address should perhaps be set somewhere else
    //secret should be generated based on mouse movement
    var secret = "1";
    getAddress()
    .then(accs => {
        if(accs != null){
            to_adr = message.address;
            wei_value = message.bid.from.amount;
            from_adr = accs[1];
            console.log("*******Unlocking account************");
            ETH.unlockAccount(ETH.web3, from_adr, "111")
            .then(result => {
                console.log(result);
                callback(ETH.sendEtherContract(ETH.web3,from_adr,secret,null,to_adr,wei_value));
            });
        
        }else{console.log("You don't have an account");}
    });
}

function secondContract(message, callback){
    getAddress()
    .then(accs => {
        if(accs != null){
            from_adr = accs[1];
            digest = message.digest;
            to_adr = message.address;
            wei_value = message.bid.to.amount;

            ETH.unlockAccount(ETH.web3, from_adr, "111")
            .then(result => {
                callback(ETH.sendEtherContract(ETH.web3,from_adr,null,digest,to_adr,wei_value));
            });
        }else{console.log("You don't have an account");}
    });
}


module.exports = {
    getAddress,
    // acceptBid,
    firstContract,
    secondContract
}