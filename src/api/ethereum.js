/**Imports */
const fs = require("fs");
const Web3 = require("web3");
// const geth = require("geth");
const { exec } = require('child_process');

/**Geth related */
// var options = {
//     testnet: null,
//     port: 30303, //Trying to connect from same network you need to change it up
//     light: null,
//     ws: null,
//     wsaddr: "127.0.0.1",
//     wsport: 7545

// };

// geth.start(options, (err, res) => {
//     if (err) return console.log(err + " \n Install Geth");
// });


/**@todo kill this child-process once parent is killed */
const geth = exec("geth --light --testnet --ws --wsaddr 127.0.0.1 --wsport 7545 --wsorigins='*' --port 30303");

geth.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

geth.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

geth.on('error', (err) => {
    console.log(err + " Install Geth");
});

geth.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});

async function isConnected(ethchain){
  try {
    let a = await ethchain.eth.net.isListening();
  } catch (e){
    return false;
  } 
  return true;
}

/**Connect our application to Ethereum-servers
 * Current: "experimental" connects to an Ethereum blockchain using localhost 7545
 *          "classic" -||- on localhost 8545
 * So if the chains are not using those localhosts, no connection
 * @todo recognise that two chains are running and connect to them
*/

var experimental = new Web3('ws://127.0.0.1:7545');
var classic =  new Web3('ws://127.0.0.1:8545');


console.log(experimental.currentProvider);
console.log(classic.currentProvider);

/**Query for the compiled abi and bytecode */
var erc20 = JSON.parse(fs.readFileSync('./contracts/ERC20Partial.json', 'utf8'));
var abi;
var bytecode;
var htlc = JSON.parse(fs.readFileSync('./contracts/HTLC.json', 'utf8'));
abi = htlc.abi;
bytecode = '0x' + htlc.code;

/** This function will validate the stored byte code against the byte code on a certain address.
 *  Remember that it's the runtime bytecode that needs to be compared, not the compiletime bytecode
 *
 *
*/

async function validateContract(ethchain, jsoncontract, contract_address, self_address, value_in_eth, digest = null){
    var res_code = await validateCode(ethchain, jsoncontract.runtime_bytecode, contract_address);
    var res_val = await validateValue(ethchain, value_in_eth, contract_address);
    var res_dest = await validateDestination(ethchain, jsoncontract.abi, self_address, contract_address);
    var res_digest = true;
    if(digest != null){
        res_digest = await validateDigest(ethchain, contract_abi, digest, contract_address);
    }
    return res_code && res_val && res_dest
}

async function validateCode(ethchain, runtime_bytecode, contract_address){
    chain_code = await ethchain.eth.getCode(contract_address);
    return runtime_bytecode == chain_code;
}

async function validateDestination(ethchain, contract_abi, dest_address, contract_address) {
    var contract = new ethchain.eth.Contract(contract_abi, contract_address);
    var contract_dest = await contract.methods.dest().call();
    return dest_address == contract_dest;
}

async function validateDigest(ethchain, contract_abi, digest, contract_address) {
    var contract = new ethchain.eth.Contract(contract_abi, contract_address);
    var contract_digest = await contract.methods.digest().call();
    return digest = contact_digest;
}

async function validateValue(ethchain, value_in_eth, contract_address){
    var balance = await ethchain.eth.getBalance(contract_address);
    console.log(balance);
    return Web3.utils.toWei(value_in_eth) == balance;
}

async function validateERC20Value(ethchain, value_in_tokens, token_address, contract_address, decimals = 18){
    var token = new ethchain.eth.Contract(erc20.abi, token_address);
    var balance = await token.methods.balanceOf(contract_address).call();
    return value_in_tokens * Math.pow(10, decimals) == balance;
}

/**
 * This modules main function
 * @param {hex} from_adr -  adress the user wishes to send money from
 */
function prepareAndDeploy(ethchain, from_adr,p_secret, p_digest, p_dest, p_amount){

    var digest, ether, gasEstimate, contractInstance;
    /**If you are bid poster the secret will be keccak256-hashed
     * else p_digest will contain the hashed secret
     */
    if(p_secret != null){
        digest = ethchain.utils.sha3(p_secret);
        console.log("Digest, send to tradee");
        console.log(digest);
    }else{
        digest = p_digest;
    }

    /**Need to convert the user inputted amount to Wei */
    ether = ethchain.utils.toWei(p_amount, "ether");
    gasEstimate =  4712386;//web3FirstChain.eth.estimateGas({data: bytecode});

      /**Creating an instance of our HTL contract
     * Currently using the predefined coinbase of the first chain
     * @todo make "from:" from_adr once message passing works
     */
     
     
    var contract = new ethchain.eth.Contract(abi);
    var contractInstance = contract.deploy({data: bytecode, arguments: [digest, p_dest]});
    contractInstance.send({from: from_adr, gasPrice: gasEstimate.toString(), gas: gasEstimate, value: 0})
      .once('receipt', function (receipt){
        ethchain.eth.getBlockNumber().then((number) => console.log("Waiting for a mined block to include your contract... currently in block " + number + receipt.contractAddress));
        console.log("i'm here");
        /**@todo send this information to other user */
        console.log("Contract deployed at " + receipt.blockNumber);
        contract.options.address = receipt.contractAddress;
        subscribeToClaim(contract, receipt.blockNumber)
      });
}

function subscribeToClaim(contract, block){
    contract.events.Claim({fromBlock: "latest"}, function(error, event){console.log(event.returnValues._hash);});
}

async function getPastClaim(ethchain, jsoncontract, contract_address, from_block = 1){
    var contract = new ethchain.eth.Contract(jsoncontract.abi, contract_address);
    var events = await contract.getPastEvents('Claim', {
      fromBlock: from_block,
      toBlock: 'latest'
    });
    return events[0].returnValues._hash;
}

function unlock(ethchain, pre_image_hash, from_adr, claim_adr){
    /**@todo the account claiming the contract should be based on user input */

    var contract = new ethchain.eth.Contract(abi);
    contract.options.address = claim_adr;
    
    contract.methods.claim(pre_image_hash).send({from: from_adr}).on("receipt", function(receipt){
    console.log("DEPLOYED");});
}

module.exports = {isConnected, subscribeToClaim, getPastClaim, experimental, geth, htlc, validateCode, validateContract, validateDestination, validateValue, validateERC20Value, classic, abi, bytecode, unlock, prepareAndDeploy, validateContract};
