/**Imports */
const fs = require("fs");
const Web3 = require("web3");

/**
 * Operating systems have different ipc paths, these are the standard ipcpaths
 * @todo either take user input if several blockchains use ipc, or force ethereum classic to use an non-standard path 
 */
function getIpcPath(){
    var p = require('path');
    var path = require('os').homedir();

    if(process.platform === 'darwin')
        path += '/Library/Ethereum/geth.ipc';

    if(process.platform === 'freebsd' ||
       process.platform === 'linux' ||
       process.platform === 'sunos')
        path += '/Desktop/magnusnet/geth.ipc';

    if(process.platform === 'win32')
        path = '\\\\.\\pipe\\geth.ipc';

    console.log('CONNECT to IPC PATH: '+ path);
    return path;
}

const web3 = new Web3(Web3.givenProvider  || getIpcPath(), require("net"));

/**Query for the compiled abi and bytecode */
var erc20 = JSON.parse(fs.readFileSync('../../contracts/ERC20Partial.json', 'utf8'));
var htlc_ether = JSON.parse(fs.readFileSync('../../contracts/HTLC.json', 'utf8'));
var htlc_erc20 = JSON.parse(fs.readFileSync('../../contracts/HTLC_ERC20.json', 'utf8'));


//Use to check which chain you are on.
function genesisCheck(ethchain){
    ethchain.eth.getBlock(0)
    .then(genblock => {
        if(genblock.hash == "0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3"){//Mainnet genesis block
            (console.log("Connected to mainnet"));
        }else{
            //console.log(genblock.hash)
            if(genblock.hash == "0x41941023680923e0fe4d74a34bdac8141f2540e3ae90623718e47d66d1ca4a2d"){//Ropsten testnet genesis block, for testing
                (console.log("Connected to Ropsten testnet"));
            }
        }
    });
}

async function getBalance(ethchain, account_address){
    var balance;
    
    balance = await web3.fromWei(ethchain.eth.getBalance(account_address));
    return balance;
}

async function unlockAccount(ethchain, account_address, account_password, time_in_ms = 10000){
    var account = await ethchain.eth.personal.unlockAccount(account_address, account_password, time_in_ms);
    console.log("Unlocked: " + account);
}



async function readDigest(ethchain, contract_address){
    var contract, contract_digest;

    contract = new ethchain.eth.Contract(htlc_ether, contract_address);
    contract_digest = await contract.methods.digest().call();
    return contract_digest;
}

/**  This function will validate an Ether HTLC contract
*  @param {string} digest - The digest of the contract, if there is any (only for second contracts)
*  @param {string} self_address - The destination of the contract, ie: yourself
*/
async function validateEtherContract(ethchain, contract_address, self_address, value_in_wei, digest = null){
    var res_cont, res_val;

    res_cont = await validateContract(ethchain, htlc_ether, contract_address, self_address, digest);
    res_val = await validateERC20Value(ethchain, value_in_wei, contract_address);
    return res_cont && res_val;
}

/**  This function will validate a ERC20 HTLC contract
*  @param {string} token_address - The address of the token
*  @param {string} value_in_tokens - The number of tokens, without decimals, so fix decimals before putting something in!
*  @param {string} digest - The digest of the contract, if there is any (only for second contracts)
*  @param {string} self_address - The destination of the contract, ie: yourself
*/
async function validateERC20Contract(ethchain, contract_address, self_address, token_address, value_in_tokens, digest = null){
    var res_cont, res_address, res_val;

    res_cont = await validateContract(ethchain, htlc_erc20, contract_address, self_address, digest);
    res_address = await validateERC20Address(ethchain, htlc_erc20.abi, token_address, contract_address);
    res_val = await validateERC20Value(ethchain, value_in_tokens, token_address, contract_address);
    return res_cont && res_val && res_address;
}

/** This function validates parts of a HTLC contract, used by other functions
*/
async function validateContract(ethchain, jsoncontract, contract_address, self_address, digest = null){
    var res_code, res_dest, res_digest;

    res_code = await validateCode(ethchain, jsoncontract.runtime_bytecode, contract_address);
    res_dest = await validateDestination(ethchain, self_address, contract_address);
    res_digest = true;
    if(digest != null){
        res_digest = await validateDigest(ethchain, digest, contract_address);
    }
    return res_code && res_dest && res_digest;
}

/** This function will validate the stored byte code against the byte code on a certain address.
 *  Remember that it's the runtime bytecode that needs to be compared, not the compiletime bytecode
*/
async function validateCode(ethchain, runtime_bytecode, contract_address){
    var chain_code;

    chain_code = await ethchain.eth.getCode(contract_address);
    return runtime_bytecode == chain_code;
}

/** This function will validate that the destination on a contract is correct.
* Assuming you are validating, it should be yourself.
*/
async function validateDestination(ethchain, dest_address, contract_address) {
    var contract, contract_dest;

    contract = new ethchain.eth.Contract(htlc_ether, contract_address);
    contract_dest = await contract.methods.dest().call();
    return dest_address == contract_dest;
}

/** This function validates that the digest on a contract is correct.
 *  This is only necessary for one party.
*/
async function validateDigest(ethchain, digest, contract_address) {
    var contract, contract_digest;

    contract = new ethchain.eth.Contract(htlc_ether, contract_address);
    contract_digest = await contract.methods.digest().call();
    return digest == contract_digest;
}

/** This function validates that the ether value of a contract is correct.
 *  Only works on normal HTLC (With Ether)
*/
async function validateValue(ethchain, value_in_wei, contract_address){
    var balance;

    balance = await ethchain.eth.getBalance(contract_address);
    return value_in_wei == balance;
}

/** This function validates that the ERC20 token value of a contract is correct.
 *  Only works on ERC20-HTLC!
*/
async function validateERC20Value(ethchain, value_in_tokens, token_address, contract_address){
    var token, balance;

    token = new ethchain.eth.Contract(erc20.abi, token_address);
    balance = await token.methods.balanceOf(contract_address).call();
    return value_in_tokens == balance;
}

/** This function validates that the contract sends the correct token when claimed.
 *  Only works on ERC20-HTLC!
*/
async function validateERC20Address(ethchain, contract_abi, token_address, contract_address){
    var contract, contract_token;

    contract = new ethchain.eth.Contract(contract_abi, contract_address);
    contract_token = await contract.methods.token().call();
    return token_address == contract_token;
}

/**
 * This modules main function
 * @param {hex} from_adr -  adress the user wishes to send money from
 */

async function sendERC20Contract(ethchain, from_address, secret = null, digest = null, destination, value_in_tokens, token_address){
    var args, gen_digest, contract_address;

    gen_digest = generateDigest(ethchain, secret, digest);
    args = [gen_digest, destination, token_address];
    contract_address = await sendContract(ethchain, htlc_erc20, args, from_address, gen_digest, 0);
    sendTokensToContract(ethchain, contract_address, token_address, value_in_tokens);
}

async function sendEtherContract(ethchain, from_address, secret, digest, destination, value_in_wei){
    var args, gen_digest;

    gen_digest = generateDigest(ethchain, secret, digest);
    args = [gen_digest, destination];
    returnObj = await sendContract(ethchain, htlc_ether, args, from_address, gen_digest, value_in_wei);
    return returnObj;
}

async function sendContract(ethchain, jsoncontract, args, from_address, digest, value_in_wei){
    var ether, gas_estimate, contract, contract_instance, contract_address;
    gas_estimate =  572810;


    contract = new ethchain.eth.Contract(jsoncontract.abi);

    contract_instance = contract.deploy({data: '0x' + jsoncontract.code, arguments: args});
    var receipt = await contract_instance.send({from: from_address, gasPrice: gas_estimate.toString(), gas: gas_estimate, value: value_in_wei});

    contract_address = receipt._address;
    console.log("Contract deployed at address " + contract_address);

    contract.options.address = contract_address;
    var subPromise = subscribeToClaim(contract, receipt.blockNumber);
    var returnObj = new Object();
    returnObj.contractAddress = contract_address;
    returnObj.digest = args[0];
    returnObj.address = from_address; //this is incorrect, remove
    returnObj.promise = subPromise;
    return returnObj;
}

function generateDigest(ethchain, secret, digest){
    if(secret != null){
        return ethchain.utils.sha3(secret);
    }
    else{
        return digest;
    }
}

/**  This function will validate a ERC20 HTLC contract
*  @param {string} value_in_tokens - The number of tokens, without decimals, so fix decimals before putting something in!
*/
async function sendTokensToContract(ethchain, contract_address, token_address, value_in_tokens){
    var token, gas_estimate;

    gas_estimate =  4712386;
    token = new ethchain.eth.Contract(erc20.abi, token_address);
    return token
        .methods
        .transfer(contract_address, value_in_tokens)
        .send({from: from_address, gasPrice: gasEstimate.toString(), gas: gasEstimate, value: 0});
}

function tokensNoDecimals(tokens, decimals) {
    return tokens * Math.pow(10, decimals);
}

function subscribeToClaim(contract, block){
    /** return a promise
    *
    */
    // contract.events.Claim({fromBlock: "latest"}, function(error,event){console.log("*******************CLAIMEVENT*************** " + event.returnValues._hash);});
    
    return contract.events.Claim({fromBlock: "latest"});
}

/** Will return the value of the first Claim event it founds.
*
*/
function getPastClaim(ethchain, contract_address, from_block = 10849){
    var contract, events;
    contract = new ethchain.eth.Contract(htlc_ether.abi, contract_address);
    
    return contract.getPastEvents('Claim', {
      fromBlock: from_block,
      toBlock: 'latest'
    });
}

function claimContract(ethchain, pre_image_hash, from_address, claim_address){
    var contract;

    /**@todo the account claiming the contract should be based on user input */

    contract = new ethchain.eth.Contract(htlc_ether.abi);
    contract.options.address = claim_address;

    contract.methods.claim(pre_image_hash).send({from: from_address})
    .on("receipt", function(receipt){
        console.log("Claimed");
    });
}

module.exports = {
    web3,
    genesisCheck,
    getBalance,
    subscribeToClaim,
    unlockAccount,
    getPastClaim,
    htlc_ether,
    htlc_erc20,
    validateCode,
    validateEtherContract,
    validateERC20Contract,
    validateContract,
    validateDestination,
    validateValue,
    validateERC20Value,
    claimContract,
    sendTokensToContract,
    sendERC20Contract,
    sendEtherContract,
    validateContract
};
