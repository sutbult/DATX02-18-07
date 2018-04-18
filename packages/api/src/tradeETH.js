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
    getAddress()
    .then(accs => {
        if(accs != null){
            to_adr = message.address;
            wei_value = message.bid.from.amount;
            secret = JSON.stringify(message.secret);
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

function secondContract(message, callback, callbackargument){
    getAddress()
    .then(accs => {
        if(accs != null){
            from_adr = accs[1];
            digest = message.digest;
            to_adr = message.address;
            wei_value = message.bid.to.amount;

            console.log("*******Unlocking account************");
            ETH.unlockAccount(ETH.web3, from_adr, "111")
            .then(result => {
                callback(ETH.sendEtherContract(ETH.web3,from_adr,null,digest,to_adr,wei_value),message,callbackargument);
            });
        }else{console.log("You don't have an account");}
    });
}

function claim(message){
    ethchain = ETH.web3;
    getAddress()
    .then(accs => {
        from_address = accs[1];
        claim_address = message.contractAddress;
        if(secret != null){
            ETH.getPastClaim(ETH.web3, claim_address)
            .then(hash => {
                console.log("Got hash: " + hash);
                ETH.claimContract(ethchain,hash,from_address,claim_address);
            });
        }else{
            pre_image_hash = message.secret;
            ETH.claimContract(ethchain,pre_image_hash,from_address,claim_address);
        }
    });
}

module.exports = {
    getAddress,
    firstContract,
    secondContract,
    claim
}