/**Imports */
const fs = require("fs");
const Web3 = require("web3");
const Currency = require("./currency.js");

//const web3 = new Web3(Web3.givenProvider  || getIpcPath(), require("net"));
const web3 = new Web3("http://localhost:8545");

/**Query for the compiled abi and bytecode */
var erc20 = JSON.parse(fs.readFileSync('../../contracts/ERC20Partial.json', 'utf8'));
var htlc_ether = JSON.parse(fs.readFileSync('../../contracts/HTLC.json', 'utf8'));
var htlc_erc20 = JSON.parse(fs.readFileSync('../../contracts/HTLC_ERC20.json', 'utf8'));

function Ether(rpc = "http://localhost:8545") {
    var currency = new Currency.construct(getEtherBalance, sendEtherContract, validateEtherContract, claimContract, getPastClaim, unlockAccount, wallet);
    currency.chain = new Web3(rpc);
    currency.contract = htlc_ether;
    return currency;
}

function Token(token_address, rpc = "http://localhost:8545") {
    var currency = new Currency.construct(getTokenBalance, sendERC20Contract, validateERC20Contract, claimContract, getPastClaim, unlockAccount, wallet);
    currency.chain = new Web3(rpc);
    currency.token = token_address;
    currency.contract = htlc_erc20;
    currency.erc20 = erc20;
    return currency;
}

/** FUNCTION IS SUPPOSED TO GET YOU WALLET BUT IS HARDCODED FOR NOW */
async function wallet(){
    var accounts;
    accounts = await this.chain.eth.getAccounts();
    return accounts[0];
    //return await this.chain.eth.getCoinbase();
}

async function getEtherBalance(account_address){
    var balance;

    balance = await this.chain.eth.getBalance(account_address);
    return balance;
}

async function getTokenBalance(account_address){
    var balance, token_address, token;

    token_address = this.token;
    token = new this.chain.eth.Contract(this.erc20.abi, token_address);
    balance = await token.methods.balanceOf(account_address).call();
    return balance;
}

async function unlockAccount(account_address, account_password, time_in_ms = 10000){
    var account = await this.chain.eth.personal.unlockAccount(account_address, account_password, time_in_ms);
    console.log("Unlocked: " + account);
}

/**  This function will validate an Ether HTLC contract
*  @param {string} self_address - The destination of the contract, ie: yourself
*  @param {string} value_in_wei - The value of Ether that should be in the contract in its smallest unit (wei)
*  @param {string} digest - The digest of the contract, if there is any (only for second contracts)
*  @param {int}    time_margin - How much time should at least be remaining for it to be a valid contract
*/
async function validateEtherContract(contract_address, self_address, value_in_wei, digest = null, unlock_time, time_margin){
    var res_cont, res_val;

    res_cont = await validateContract.bind(this)(contract_address, self_address, digest, unlock_time, time_margin);
    res_val = await validateValue.bind(this)(value_in_wei, contract_address);
    console.log("(・ωｰ)～☆ Ether: " + res_val);
    return res_cont && res_val;
}

/**  This function will validate a ERC20 HTLC contract
*  @param {string} self_address - The destination of the contract, ie: yourself
*  @param {string} value_in_tokens - The number of tokens, without decimals, so fix decimals before putting something in!
*  @param {string} digest - The digest of the contract, if there is any (only for second contracts)
*  @param {int}    time_margin - How much time should at least be remaining for it to be a valid contract
*/
async function validateERC20Contract(contract_address, self_address, value_in_tokens, digest = null, unlock_time, time_margin){
    var res_cont, res_address, res_val;

    res_cont = await validateContract.bind(this)(contract_address, self_address, digest, unlock_time, time_margin);
    res_address = await validateERC20Address.bind(this)(contract_address);
    ("(・ωｰ)～☆ Token: " + res_address);
    res_val = await validateERC20Value.bind(this)(value_in_tokens, contract_address);
    ("(・ωｰ)～☆ Value: " + res_val);
    return res_cont && res_val && res_address;
}

/** This function validates parts of a HTLC contract, used by other functions
*/
async function validateContract(contract_address, self_address, digest = null, unlock_time, time_margin){
    var res_code, res_dest, res_digest, res_refund;

    console.log("Validating contract ");
    res_code = await validateCode.bind(this)(contract_address);
    console.log("(・ωｰ)～☆ Code: " + res_code);
    res_dest = await validateDestination.bind(this)(self_address, contract_address);
    console.log("(・ωｰ)～☆ Destination: " + res_dest);
    res_refund = await validateRefund.bind(this)(contract_address, unlock_time, time_margin);
    console.log("(・ωｰ)～☆ Refund: " + res_refund);
    res_digest = true;
    if(digest != null){
        res_digest = await validateDigest.bind(this)(digest, contract_address);
    }
    console.log("(・ωｰ)～☆ Digest: " + res_digest);
    return res_code && res_dest && res_digest && res_refund;
}

/** This function will validate the stored byte code against the byte code on a certain address.
 *  Remember that it's the runtime bytecode that needs to be compared, not the compiletime bytecode
*/
async function validateCode(contract_address){
    var chain_code;

    chain_code = await this.chain.eth.getCode(contract_address);
    return this.contract.runtime_bytecode == chain_code;
}

/** This function will validate that the there is at least 500 blocks until the contract can be unlocked and that it will be locked for 1000 blocks
*/

async function validateRefund(contract_address, unlock_time, time_margin){
    var contract, contract_unlock_time, latest_block;

    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    contract_unlock_time = await contract.methods.unlockAtTime().call();
    latest_block = await this.chain.eth.getBlock('latest');
    console.log("unlock time: " + unlock_time);
    console.log("latest block: " + latest_block.timestamp);
    console.log("time margin: " + time_margin);
    return contract_unlock_time == unlock_time &&
	(unlock_time - latest_block.timestamp) > time_margin;
}

/** This function will validate that the destination on a contract is correct.
* Assuming you are validating, it should be yourself.
*/
async function validateDestination(dest_address, contract_address) {
    var contract, contract_dest;

    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    contract_dest = await contract.methods.dest().call();
    return dest_address == contract_dest;
}

/** This function validates that the digest on a contract is correct.
 *  This is only necessary for one party.
*/
async function validateDigest(digest, contract_address) {
    var contract, contract_digest;

    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    contract_digest = await contract.methods.digest().call();
    return digest == contract_digest;
}

/** This function validates that the ether value of a contract is correct.
 *  Only works on normal HTLC (With Ether)
*/
async function validateValue(value_in_wei, contract_address){
    var balance;

    balance = await this.chain.eth.getBalance(contract_address);
    return value_in_wei == balance;
}

/** This function validates that the ERC20 token value of a contract is correct.
 *  Only works on ERC20-HTLC!
*/
async function validateERC20Value(value_in_tokens, contract_address){
    var token, balance;

    token = new this.chain.eth.Contract(this.erc20.abi, this.token);
    balance = await token.methods.balanceOf(contract_address).call();
    return value_in_tokens == balance;
}

/** This function validates that the contract sends the correct token when claimed.
 *  Only works on ERC20-HTLC!
*/
async function validateERC20Address(contract_address){
    var contract, contract_token;

    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    contract_token = await contract.methods.token().call();
    return this.token == contract_token;
}

/** This function will deploy a HTLC for Ether with Ether
 * @param {hex} from_adr - adress the user wishes to send money from
 * @param {hex} digest - the digest, or hashed value (sha256) that the contract is locked with
 * @param {hex} destination - the destination of the contract
 */

 async function sendEtherContract(from_address, digest, destination, value_in_wei, refund_time){
    var args, receipt;

    args = [digest, destination, refund_time];
    receipt = await sendContract.bind(this)(args, from_address, value_in_wei);
    return receipt;
}

/** This function will deploy a HTLC for a Token and then send Tokens to that contract
 * @param {hex} from_adr - adress the user wishes to send money from
 * @param {hex} digest - the digest, or hashed value (sha256) that the contract is locked with
 * @param {hex} destination - the destination of the contract
 */

async function sendERC20Contract(from_address, digest, destination, value_in_tokens, refund_time){
    var args, receipt;

    args = [digest, destination, this.token, refund_time];
    receipt = await sendContract.bind(this)(args, from_address, 0);
    sendTokensToContract.bind(this)(from_address, receipt.address, value_in_tokens);
    return receipt;
}



async function sendContract(args, from_address, value_in_wei){
    var ether, gas_estimate, contract, contract_instance, contract_address, receipt;
    gas_estimate =  572810;

    contract = new this.chain.eth.Contract(this.contract.abi);

    contract_instance = contract.deploy({data: '0x' + this.contract.code, arguments: args});
    receipt = await contract_instance.send({from: from_address, gasPrice: "100000000000", gas: gas_estimate*2, value: value_in_wei}).on('transactionHash', (transactionHash) => {
      console.log('Successfully submitted contract: ' + transactionHash);
    });
    contract_address = receipt._address;
    console.log("(ΘεΘʃƪ) Contract deployed at address " + contract_address + " (ΘεΘʃƪ)");


    contract.options.address = contract_address;
    //var subPromise = subscribeToClaim(contract, receipt.blockNumber);
    receipt = new Object();
    receipt.contractAddress = contract_address;
    receipt.digest = args[0];
    receipt.timelock = await contract.methods.unlockAtTime().call();
    receipt.address = from_address; //this is incorrect, remove
    //returnObj.promise = subPromise;
    return receipt;
}

/**  This function will validate a ERC20 HTLC contract
*  @param {string} value_in_tokens - The number of tokens, without decimals, so fix decimals before putting something in!
*/
async function sendTokensToContract(from_address, contract_address, value_in_tokens){

    var token, gas_estimate, transaction;
    gas_estimate =  4712386;
    token = new this.chain.eth.Contract(this.erc20.abi, this.token);
    transaction = await token
        .methods
        .transfer(contract_address, value_in_tokens)
        .send({from: from_address, gasPrice: "100000000000", gas: gas_estimate, value: 0});
    console.log("(ΘεΘʃƪ) Sent Tokens to contract (ΘεΘʃƪ)");
    return transaction;
}

function tokensNoDecimals(tokens, decimals) {
    return tokens * Math.pow(10, decimals);
}

/** Will return the value of the first Claim event it founds.
*
*/
async function getPastClaim(contract_address, from_block = 10849){
    var contract, events, result;
    console.log("In getPastClaim");
    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    events = await contract.getPastEvents('Claim', {
      fromBlock: from_block,
      toBlock: 'latest'
    });
    console.log(events);
    result = new Object();

    if(events.length == 0){
        result.claimed = false;
    }
    else {
        result.claimed = true;
        result.secret = events[0].returnValues._hash;
    }
    return result;
}

async function claimContract(pre_image_hash, from_address, claim_address){
  //  console.log(pre_image_hash.toString());
  //  console.log(from_address.toString());
  //  console.log(claim_address.toString());
    console.log("In claimContract in Ethereum");
    var contract;

    /**@todo the account claiming the contract should be based on user input */

    contract = new this.chain.eth.Contract(this.contract.abi, claim_address);

    try {
        console.log(pre_image_hash);
        var result = await contract.methods.claim(pre_image_hash.toString()).send({from: from_address});

        console.log(result);
        return true;
    }
    catch(e){
        console.log(e);
    }
}

async function readDigest(contract_address){
    var contract, contract_digest;

    contract = new this.chain.eth.Contract(this.contract.abi, contract_address);
    contract_digest = await contract.methods.digest().call();
    return contract_digest;
}

module.exports = {
    Ether,
    Token,
    web3
};
