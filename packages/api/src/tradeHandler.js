const messenger = require("./OrbitDBHandler.js");
const db = require("./DBHandler.js");
const sha256 = require("./sha256.js");

// Refund time (in hours) and the time margin when validating the first contract (in seconds)
const refund_seller = 48; // in hours
const margin_seller = 7920; //22 hours in seconds

// Refund time (in hours) and the time margin when validating the second contract (in seconds)
const refund_buyer = 24; //in hours
const margin_buyer = 15840; //44 hours in seconds

//"global" variable, will be assigned if function whenBidAccepted is called, otherwise stays null
var secret = null;

/** Different types of currencies following the currency format in currency.js
    Usage example: currencies["ETH"] to get the ETH currency
*/

var currencies =
    {
	ETH: require("./ethereum.js").Ether("http://localhost:8545"),
	ETC: require("./ethereum.js").Ether("http://localhost:8546")
	// BTC: require("./bitcoin.js").BitcoinTest('127.0.0.1', '16592')
    };

//Called from an interval set in index.js if bid has been accepted
//bid is accepted if the bid.channel contains a step 2
async function runSeller(whisper){
    var message, currency_seller, currency_buyer, receipt;
    //remove bid from db to prevent multiple contracts

    //use random function to get a good secret
    secret = 1;

    // console.log("****LETS SEE WHAT WE HAVE HERE %s and the whole thing %o", message.bid.status, message);
    message = JSON.parse(whisper);

    console.log("ლಠ益ಠ)ლ From " + message.bid.from.currency);

    currency_seller = currencies[message.bid.to.currency];
    currency_buyer = currencies[message.bid.from.currency];

    receipt = await issueSellerContract(currency_seller, message, secret);

    message.digest = receipt.digest;
    message.timelock = receipt.timelock;
    message.currencySeller.contract = receipt.contractAddress;
    message.currencyBuyer.sellerAddress = currency_buyer.wallet();
    message.currencySeller.sellerAddress = currency_seller.wallet();
    
    console.log("ლಠ益ಠ)ლ RESULT ლಠ益ಠ)ლ " + receipt);

    require("./OrbitDBHandler.js").pushDigestInfo(message, claimBuyerContract, secret);

}

async function acceptBid(bid){
    var currency_seller, wallet;
    //    var bid = db.getBid2(bidID);

    currency_seller = currencies[bid.to.currency]; //to?

    if(currency_seller != null){

	console.log("(´･ω･`) Bid accepted (´･ω･`)");
	wallet =  await currency_seller.wallet();
	console.log("wallet: %s", wallet);
	console.log(messenger);
        try{
            //messenger is undefined inside here?
            await require("./OrbitDBHandler.js").acceptBid(bid, wallet, runBuyer.bind(this));
        }catch(e){
            console.log(e);
        }
        console.log('finished');
    }
    else{
        console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }
}

async function validateBuyerContract(currency_buyer, message){
    var valid, wallet;

    console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    console.log(message);
    
    wallet = await currency_buyer.wallet();
    valid = await currency_buyer.validate(message.currencyBuyer.contract, message.currencyBuyer.buyerAddress, wallet, message.bid.from.amount, message.digest, message.timelock, 7920);

    return valid;
}

async function issueSellerContract(currency_seller, message, secret){
    var wallet, to, value, result, receipt;
    
    wallet = await currency_seller.wallet();
    
    //Make sure only one contract is deployed, this does that by changing status to pending
    if(wallet != null){
        to = message.currencySeller.buyerAddress;
        value = message.bid.from.amount;

        console.log("(´･ω･`) Unlocking account for first contract (´･ω･`)");
        result = await currency_seller.unlock(wallet, "headlesschrome");

        console.log("(´･ω･`) Sending first contract (´･ω･`)");
        receipt = await currency_seller.send(wallet, sha256.hash(secret), to, value, refund_seller);
        
        console.log("(´･ω･`) Maybe sent first contract (´･ω･`)");

        return receipt;
    }else {
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}

async function runBuyer(whisper){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message, receipt, currency_seller, currency_buyer, valid, exchange_to, exchange_from;

    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);

    currency_buyer = currencies[message.bid.from.currency];
    currency_seller = currencies[message.bid.to.currency];

    console.log("To " + message.bid.from.currency);
    valid = await validateSellerContract(currency_seller, message);

    if (valid){
        console.log("ヽ(ヅ)ノ Buyer finds Seller contract valid! ヽ(ヅ)ノ");
        
        receipt = await issueBuyerContract.bind(this)(currency_buyer, message);

        message.currencySeller.buyerAddress = currency_buyer.wallet();
        message.currencyBuyer.buyerAddress = currency_seller.wallet();
        message.currencyBuyer.contract = receipt.contractAddress;
	
        require("./OrbitDBHandler.js").pushContractInfo(receipt, message, claimSellerContract);
    }
    else {
        console.log("(-公- ;) Buyer finds Seller contract invalid... (-公- ;)");
        //WHAT SHOULD HAPPEN HERE?
    }

}

async function validateSellerContract(currencySeller, message){
    var valid;

    console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    var wallet = await currencySeller.wallet();
    valid = await currencySeller.validate(message.currencySeller.contract, message.currencySeller.sellerAddress,  wallet, message.bid.to.amount, message.digest, message.timelock, 15840);

    return valid;
    return true;
}

async function issueBuyerContract(currency_buyer, message){
    var wallet, receipt, to, digest, value, result;
    
    wallet = await currency_buyer.wallet();

    if(wallet != null){
        to = message.currencyBuyer.sellerAddress;
        value = message.bid.from.amount;
        digest = message.digest;

        console.log("(´･ω･`) Unlocking account for second contract (´･ω･`)");
        result = await currency_buyer.unlock(wallet, "headlesschrome");

        console.log("(´･ω･`) Sending second contract (´･ω･`)");
        receipt = await currency_buyer.send(wallet, digest, to, value, refund_buyer);
        console.log("(´･ω･`) Maybe sent second contract (´･ω･`)");

        return receipt;
    }else{
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}


async function claimBuyerContract(whisper, secret){
    var wallet, currency_buyer;
    
    message = getMessage(whisper);
    
    currency_buyer = currencies[message.bid.from.currency];
    
    wallet =  = await currency_buyer.wallet()
    
    console.log("(´･ω･`) Unlocking with original secret (´･ω･`)");
    
    try{
        return await currency_buyer.claim(secret, wallet, message);
    }catch(e){
        console.log("Claim was wrong: %s", e);
    }
}

async function claimSellerContract(whisper){
    var search_result, claim_result, currency_buyer, currency_seller, wallet, message;
    
    message = getMessage(whisper);
    
    currency_buyer = currencies[message.bid.from.currency];
    currency_seller = currencies[message.bid.to.currency];
    
    console.log("Second User Claiming from: " + message.currencySeller.contract);
    console.log("(´･ω･`) Searching for secret (´･ω･`)");
    
    wallet = await currency_seller.wallet();
    
    while(true){
        console.log("Looping");
        var search_result = await currency_buyer.search(message.currencyBuyer.contract, 0);
        
        if(search_result.claimed){            
            console.log("(´･ω･`) Found secret (´･ω･`)");
            console.log("(´･ω･`) Claiming contract (´･ω･`)");
            
            claim_result = await currency_seller.claim(search_result.secret, wallet, message);
            
            return claim_result;
        }
    }
    return false;
}
function getMessage(whisper){
    var message;
    
    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);
    
    return message;
}

module.exports = {
    acceptBid,
    runSeller
};
