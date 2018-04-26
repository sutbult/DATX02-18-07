const ETC = require("./ethereumClassic.js");
ETC.genesisCheck(ETC.web3);

function getAddress(){
    //The user should get to choose which account
    return ETC.web3.eth.getAccounts();
}

async function firstContract(message, callback){
    getAddress()
    .then(accs => {
        if(accs != null){
            to_adr = message.address;
            wei_value = message.bid.from.amount;
            secret = JSON.stringify(message.secret);
            from_adr = accs[2];
            console.log("*******Unlocking account for first contract************");
            ETC.unlockAccount(ETC.web3, from_adr, "111")
            .then(result => {
                callback(ETC.sendEtherContract(ETC.web3,from_adr,secret,null,to_adr,wei_value));
            });
        
        }else{console.log("You don't have an account");}
    });
}

function secondContract(message, callback, callbackargument){
    getAddress()
    .then(accs => {
        if(accs != null){
            from_adr = accs[2];
            digest = message.digest;
            to_adr = message.address;
            wei_value = message.bid.to.amount;

            console.log("*******Unlocking account for second contract************");
            ETC.unlockAccount(ETH.web3, from_adr, "111")
            .then(result => {
                callback(ETH.sendEtherContract(ETC.web3,from_adr,null,digest,to_adr,wei_value),message,callbackargument);
            });
        }else{console.log("You don't have an account");}
    });
}

function claim(message){
    ethchain = ETC.web3;
    getAddress()
    .then(accs => {
        from_address = accs[2];
        claim_address = message.contractAddress;
        if(message.secret != null){
            console.log("********************Claim first contract***********************");
            pre_image_hash = JSON.stringify(message.secret);
            ETC.claimContract(ethchain,pre_image_hash,from_address,claim_address);
        }else{
            console.log("*************Claim second contract********************");
            message.promise.subscribe((error,event) => {
                var hash = event.returnValues._hash;
                ETH.claimContract(ethchain,hash,from_address,claim_address);
            });
        }
    });
}

module.exports = {
    getAddress,
    firstContract,
    secondContract,
    claim
}