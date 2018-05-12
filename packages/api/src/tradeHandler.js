const messenger = require("./OrbitDBHandler.js");
const db = require("./DBHandler.js");
const sha256 = require("./sha256.js");

// Refund time (in hours) and the time margin when validating the first contract (in seconds)
const refund_seller = 172800; // 48 hours in seconds
const margin_seller = 7920; //22 hours in seconds

// Refund time (in hours) and the time margin when validating the second contract (in seconds)
const refund_buyer = 86400; // 24 hours in seconds
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
    message.secret = secret;

    console.log("ლಠ益ಠ)ლ From " + message.bid.from.currency);

    currency_buyer = currencies[message.bid.to.currency];
    currency_seller = currencies[message.bid.from.currency];

    receipt = await issueSellerContract(currency_seller, message);

    console.log("ლಠ益ಠ)ლ RESULT ლಠ益ಠ)ლ " + receipt);

    
    receipt.bid = message.bid;
    receipt.address = await currency_buyer.wallet();
    require("./OrbitDBHandler.js").pushDigestInfo(receipt, unlockWithSecret);

}

async function acceptBid(bid){
    var currency, wallet;
    //    var bid = db.getBid2(bidID);

    currency = currencies[bid.from.currency]; //to?

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
        console.log('finished');
    }
    else{
        console.log("Ooh, what an exotic currency, perhaps we will support it someday!");
    }
}


async function unlockWithSecret(whisper){
    var message;
    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);
    message.secret = secret;

    var fromCurrency = currencies[message.bid.from.currency];
    var toCurrency = currencies[message.bid.to.currency]; //-
    claim(fromCurrency, toCurrency, message);
}

async function validateBuyerContract(currency, message){
    // var valid;
    //
    // console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    // console.log(message);
    // var wallet = await currency.wallet();
    // valid = await currency.validate(message.contractAddress, wallet, message.bid.from.amount, message.digest, message.timelock, 7920);
    //
    // return valid;
    return true;
}

async function issueSellerContract(currency, message){
    var wallet = await currency.wallet(), to, value, result, receipt;
   //Make sure only one contract is deployed, this does that by changing status to pending
    if(wallet != null){
        to = message.address;
        value = message.bid.from.amount;
        secret = message.secret;

        console.log("(´･ω･`) Unlocking account for first contract (´･ω･`)");
        result = await currency.unlock(wallet, "headlesschrome");

        console.log("(´･ω･`) Sending first contract (´･ω･`)");
        receipt = await currency.send(wallet, sha256.hash(secret), to, value, refund_seller);
        console.log("(´･ω･`) Maybe sent first contract (´･ω･`)");

        return receipt;
    }else {
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}

async function runBuyer(whisper){
    //In pushContractInfo we send a json object, otherwise we send a string
    var message, receipt, currency_seller, currency_buyer, valid;

    if(whisper.constructor === {}.constructor) message = whisper;
    else message = JSON.parse(whisper);

    currency_seller = currencies[message.bid.from.currency];
    currency_buyer = currencies[message.bid.to.currency];

    console.log("To " + message.bid.to.currency);
    valid = await validateSellerContract(currency_seller, message);

    if (valid){
        console.log("ヽ(ヅ)ノ Buyer finds Seller contract valid! ヽ(ヅ)ノ");
        receipt = await issueBuyerContract.bind(this)(currency_buyer, message);
        require("./OrbitDBHandler.js").pushContractInfo(receipt, message, unlockWithSecret);
    }
    else {
        console.log("(-公- ;) Buyer finds Seller contract invalid... (-公- ;)");
        //WHAT SHOULD HAPPEN HERE?
    }

}

async function validateSellerContract(currency, message){
  /*  var valid;

    console.log("(´･ω･`) Buyer validating Seller contract (´･ω･`)");
    var wallet = await currency.wallet();
    valid = await currency.validate(message.contractAddress, wallet, message.bid.to.amount, message.digest, message.timelock, 15840);

    return valid;*/
    return true;
}

async function issueBuyerContract(currency, message){
    var wallet = await currency.wallet(), receipt, to, digest, value, result;

    if(wallet != null){
        to = message.address;
        value = message.bid.from.amount; //to amount?
        digest = message.digest;

        console.log("(´･ω･`) Unlocking account for second contract (´･ω･`)");
        result = await currency.unlock(wallet, "headlesschrome");

        console.log("(´･ω･`) Sending second contract (´･ω･`)");
        receipt = await currency.send(wallet, digest, to, value, refund_buyer);
        console.log("(´･ω･`) Maybe sent second contract (´･ω･`)");

        return receipt;
    }else{
        console.log("ಠ▃ಠ You don't have an account ಠ▃ಠ");
    }

    return undefined;
}

async function claim(fromCurrency, toCurrency, message){
    var fromWallet = await fromCurrency.wallet(), contract, secret;
    var toWallet = await toCurrency.wallet();

    if(fromWallet != null){
        contract = message.contractAddress;

        if(message.secret != null){
            console.log("(´･ω･`) Unlocking with original secret (´･ω･`)");
            secret = message.secret;
            try{
                console.log("Unlocking account: ");
                  await fromCurrency.unlock(fromWallet, "headlesschrome")
                return await fromCurrency.claim(secret, fromWallet, contract);
            }catch(e){
                console.log("Claim was wrong: %s", e);
            }
        }else{
          contract = require("./OrbitDBHandler.js").getContract();
          console.log("Second User Claiming from: " + contract)
            console.log("(´･ω･`) Searching for secret (´･ω･`)");
            var looping = true;
            while(looping){
                console.log("Looping");
                var result = await fromCurrency.search(message.contractAddress, 0);
                if(result.claimed){
          //          currency = currencies[message.bid.to.currency];
                    console.log("unlocking account");
                    await toCurrency.unlock(toWallet, "headlesschrome");
                    console.log("(´･ω･`) Found secret (´･ω･`)");
                    console.log("(´･ω･`) Claiming contract (´･ω･`)");
                    var res =  await toCurrency.claim(result.secret, toWallet, contract);
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
