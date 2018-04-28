const messenger = require("./OrbitDBHandler")
const db = require("./DBHandler.js");
//"global" variable, will be assigned if function whenBidAccepted is called, otherwise stays null
var secret = null;



/** Different types of currencies following the currency format in currency.js
    Usage example: currencies["ETH"] to get the ETH currency
*/

var currencies 
    { 
    ETH: require("./ethereum.js").Ether("http://localhost:8545"),
    ETC: require("./ethereum.js").Ether("http://localhost:8546")
    };

//Called from an interval set in index.js if bid has been accepted
//bid is accepted if the bid.channel contains a step 2
async function whenBidAccepted(msg){
    //remove bid from db to prevent multiple contracts

    //use random function to get a good secret
    secret = 1;

    var jsonObj;
    var message = JSON.parse(msg);
    message.secret = secret;
    var currency = currencies[message.bid.from.currency];
    // console.log("****LETS SEE WHAT WE HAVE HERE %s and the whole thing %o", message.bid.status, message);
    if(message.bid.status == "ACTIVE"){
        console.log("From " + message.bid.from.currency);
        //Make sure only one contract is deployed, this does that by changing status to pending
        db.acceptBid(message.bid.id);
        
        result = await firstContract(currency, message);
        console.log("ლಠ益ಠ)ლ RESULT ლಠ益ಠ)ლ " + result);
        
        result.bid = message.bid;
        messenger.pushDigestInfo(result, unlockWithSecret);
    }else{
        console.log("Already deployed");
    }
}

async function acceptBid(bidID){
    var bid = await db.getBid2(bidID);
    var message;
    var address;
    var currency = currencies[bid.from.currency];
    if(currency != null){
        wallet = await currency.wallet();
        messenger.acceptBid(bid, wallet, secondContract);
    }
    else{
        console.log("Ooh, what an exotic currency, perhaps we will support it someday!");        
    }
}


function unlockWithSecret(whisper){
    var message;
    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);
    message.secret = secret;
    
    var currency = currencies[message.bid.to.currency];
    claim(currency, message);
}

async function firstContract(currency, message){
   var wallet = await currency.wallet();
   
    if(wallet != null){
        to_addr = message.address;
        value = message.bid.from.amount;
        secret = JSON.stringify(message.secret);
        from_addr = wallet;
        
        console.log("(´･ω･`) Unlocking account for first contract (´･ω･`)");
        result = await currency.unlock(from_addr, "111")
        
        console.log("(´･ω･`) Sending first contract (´･ω･`)");
        contract = await currency.send(from_addr, secret, null, to_addr, value);
        console.log("(´･ω･`) Maybe sent first contract (´･ω･`)");
        
        return contract;
    }else {
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }
}


async function secondContract(whisper){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message;
    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);

    var currency = currencies[message.bid.to.currency];
    console.log("To " + message.bid.to.currency);
    contract = await secondContract(currency, message)
    messenger.pushContractInfo(contract, message, unlockWithSecret);
}

async function secondContract(currency, message){
    var wallet = await currency.wallet();
    
    if(wallet != null){
        to_addr = message.address;
        value = message.bid.from.amount;
        digest = message.digest;
        from_addr = wallet;
        
        console.log("(´･ω･`) Unlocking account for second contract (´･ω･`)");
        result = await currency.unlock(from_addr, "111")
        
        console.log("(´･ω･`) Sending second contract (´･ω･`)");
        contract = await currency.send(from_addr, null, digest, to_addr, value);
        console.log("(´･ω･`) Maybe sent second contract (´･ω･`)");
        
        return contract;
    }else{
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }
}

async function claim(currency, message){
    var wallet = await currency.wallet();
    
    if(wallet != null){
        from_address = wallet;
        claim_address = message.contractAddress;

        
        if(message.secret != null){
            pre_image_hash = JSON.stringify(message.secret);
            return await currency.claim(pre_image_hash, from_address, claim_address);
        }else{
            console.log("(´･ω･`) Searching for secret (´･ω･`)");
            var result = await currency.search(message.contractAddress, 0);
            if(result.claimed){
                console.log("(´･ω･`) Found secret (´･ω･`)");
                console.log("(´･ω･`) Claiming contract (´･ω･`)");
                return await currency.claim(result.secret, from_address, claim_address);
            }
            else {
                return false;
            }
        }
    }
}

module.exports = {
    whenBidAccepted,
    acceptBid
}
