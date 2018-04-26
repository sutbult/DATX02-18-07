const ETC = require("./ethereumClassic.js");
ETC.genesisCheck(ETC.web3);

async function getAccounts(){
    //The user should get to choose which account
    accounts = await ETC.web3.eth.getAccounts();
    return accounts;
}

async function firstContract(message){
   accounts = await getAccounts()
   
    if(accounts != null){
        to_addr = message.address;
        wei_value = message.bid.from.amount;
        secret = JSON.stringify(message.secret);
        from_addr = accounts[2];
        console.log("*******Unlocking account for first contract in Ethereum classic************");
        result = await ETC.unlockAccount(ETC.web3, from_addr, "111")
        contract = await ETC.sendEtherContract(ETC.web3,from_addr,secret,null,to_addr,wei_value);
        return contract;
    }else{
        console.log("You don't have an account");
    }
    
    return undefined;
}

async function secondContract(message, callback, callbackargument){
    accounts = await getAccounts()
   
    if(accounts != null){
        to_addr = message.address;
        wei_value = message.bid.from.amount;
        digest = message.digest;
        from_addr = accounts[2];
        console.log("*******Unlocking account for second contract in Ethereum classic************");
        result = await ETC.unlockAccount(ETC.web3, from_addr, "111")
        contract = await ETC.sendEtherContract(ETC.web3,from_addr,null,digest,to_addr,wei_value);
        return contract;
    }else{
        console.log("You don't have an account");
    }
}

async function claim(message){
    // ethchain = ETC.web3;
    accounts = await getAccounts();
   
    if(accounts != null){
        from_address = accounts[2];
        claim_address = message.contractAddress;
        if(message.secret != null){
            console.log("********************Claim first contract on ETC***********************");
            pre_image_hash = JSON.stringify(message.secret);
            ETC.getPastClaim(ETC.web3,message.contractAddress);
            //ETC.claimContract(ethchain,pre_image_hash,from_address,claim_address);
        }else{
            console.log("*************Claim second contract ETC********************");
            message.promise.subscribe((error,event) => {
                var hash = event.returnValues._hash;
                ETC.getPastClaim(ETC.web3,message.contractAddress);
                //ETH.claimContract(ethchain,hash,from_address,claim_address);
            });
        }
    }
}

module.exports = {
    getAccounts,
    firstContract,
    secondContract,
    claim
}