const messenger = require("./OrbitDBHandler.js");
const db = require("./DBHandler.js");
const sha256 = require("./sha256.js");

// Refund time (in hours) and the time margin when validating the first contract (in seconds)
const refund_seller = 48;
const margin_seller = 22;

// Refund time (in hours) and the time margin when validating the second contract (in seconds)
const refund_buyer = 24;
const margin_buyer = 44;

//"global" variable, will be assigned if function whenBidAccepted is called, otherwise stays null
var secret = null;

/** Different types of currencies following the currency format in currency.js
    Usage example: currencies["ETH"] to get the ETH currency
*/

var currencies =
    {
	ETH: require("./ethereum.js").Ether("http://localhost:8545"),
	ETC: require("./ethereum.js").Ether("http://localhost:8546")
    };

//Called from an interval set in index.js if bid has been accepted
//bid is accepted if the bid.channel contains a step 2
async function runSeller(whisper){
    var message, currency, receipt;
    //remove bid from db to prevent multiple contracts

    //use random function to get a good secret
    secret = 1;

    // console.log("****LETS SEE WHAT WE HAVE HERE %s and the whole thing %o", message.bid.status, message);
    message = JSON.parse(whisper);
    message.secret = secret;

    console.log("ლಠ益ಠ)ლ From " + message.bid.from.currency);

    currency = currencies[message.bid.to.currency];


    receipt = await issueSellerContract(currency, message);

    console.log("ლಠ益ಠ)ლ RESULT ლಠ益ಠ)ლ " + receipt);

    receipt.bid = message.bid;
    require("./OrbitDBHandler.js").pushDigestInfo(receipt, unlockWithSecret);

}

async function acceptBid(bid){
//    var bid = db.getBid2(bidID);
    currency = currencies[bid.from.currency];

    if(currency != null){

	    console.log("(´･ω･`) Bid accepted (´･ω･`)");
      wallet =  await currency.wallet();
      console.log("wallet: %s", wallet);
       console.log(messenger);
        try{
            //messenger is undefined inside here?
            await require("./OrbitDBHandler.js").acceptBid(bid, wallet, runBuyer.bind(this));
        }catch(e){
            console.log(e);
        }
        console.log('finished')
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

async function validateBuyerContract(currency, message){
    return true;
    // var valid;

    // console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    // valid = await currency.validate(message.contractAddress, currency.wallet, message.bid.from.amount, message.digest, margin_seller);

    // return valid;
}

async function issueSellerContract(currency, message){
   var wallet = await currency.wallet();
   //Make sure only one contract is deployed, this does that by changing status to pending
    if(wallet != null){
        to_addr = message.address;
        value = message.bid.from.amount;
        secret = JSON.stringify(message.secret);
        from_addr = wallet;

        console.log("(´･ω･`) Unlocking account for first contract (´･ω･`)");
        result = await currency.unlock(from_addr, "111");

        console.log("(´･ω･`) Sending first contract (´･ω･`)");
        receipt = await currency.send(from_addr, sha256.hash(secret), to_addr, value, refund_seller);
        console.log("(´･ω･`) Maybe sent first contract (´･ω･`)");

        return receipt;
    }else {
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}

async function runBuyer(whisper){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message, receipt, currency, valid, exchange_to, exchange_from;

    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);

    exchange_to = currencies[message.bid.to.currency];
    exchange_from = currencies[message.bid.from.currency];

    console.log("To " + message.bid.to.currency);
    valid   = await validateSellerContract(exchange_from, message);

    if (valid){
        console.log("ヽ(ヅ)ノ Buyer finds Seller contract valid! ヽ(ヅ)ノ");
        receipt = await issueBuyerContract.bind(this)(exchange_to, message);
        require("./OrbitDBHandler.js").pushContractInfo(receipt, message, unlockWithSecret);
    }
    else {
        console.log("(-公- ;) Buyer finds Seller contract invalid... (-公- ;)");
        //WHAT SHOULD HAPPEN HERE?
    }

}

async function validateSellerContract(currency, message){
    return true;
    // var valid;

    // console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    // valid = await currency.validate(message.contractAddress, currency.wallet, message.bid.to.amount, null, margin_buyer);

    // return valid;
}

async function issueBuyerContract(currency, message){
    var wallet = await currency.wallet();

    if(wallet != null){
        to_addr = message.address;
        value = message.bid.from.amount;
        digest = message.digest;
        from_addr = wallet;

        console.log("(´･ω･`) Unlocking account for second contract (´･ω･`)");
        result = await currency.unlock(from_addr, "111");

        console.log("(´･ω･`) Sending second contract (´･ω･`)");
        receipt = await currency.send(from_addr, digest, to_addr, value, refund_buyer);
        console.log("(´･ω･`) Maybe sent second contract (´･ω･`)");

        return receipt;
    }else{
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}

async function claim(currency, message){
    var wallet = await currency.wallet();

    if(wallet != null){
        from_address = wallet;
        claim_address = message.contractAddress;


        if(message.secret != null){
            console.log("(´･ω･`) Unlocking with original secret (´･ω･`)");
            pre_image_hash = JSON.stringify(message.secret);
            try{
                return await currency.claim(pre_image_hash, from_address.toString(), claim_address.toString());
            }catch(e){
                console.log("Claim was wrong: %s", e);
            }
        }else{
            console.log("(´･ω･`) Searching for secret (´･ω･`)");
            var looping = true;
            while(looping){
                console.log("Looping");
                var result = await currency.search(message.contractAddress, 0);
                if(result.claimed){
                    console.log("(´･ω･`) Found secret (´･ω･`)");
                    console.log("(´･ω･`) Claiming contract (´･ω･`)");
                    var res =  await currency.claim(result.secret, from_address.toString(), claim_address.toString());
                    looping = false;
                    return res;

                }
            }
        }
    }
    return false;
}

module.exports = {
    acceptBid,
    runSeller
};
