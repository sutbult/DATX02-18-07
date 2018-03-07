/**Imports */
$ = window.jQuery = require('jQuery');
const Web3 = require("web3");
var async = require('asyncawait/async');
var await = require('asyncawait/await');

/**Connect our application to Ethereum-servers
 * Current: web3FirstChain connects to an Ethereum blockchain using localhost 7545
 *          web3SecondChain -||- on localhost 8545
 * So if the chains are not using those localhosts, no connection
 * @todo recognise that two chains are running and connect to them
*/
web3FirstChain = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
web3SecondChain = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
console.log(web3FirstChain.isConnected);
console.log(web3SecondChain.isConnected);

/**Query for the compiled abi and bytecode */
var abi;
var bytecode;
$.getJSON('../../contracts/HTLC.json', (result) => {
    abi = result.abi; 
    bytecode = '0x' + result.code;
});

function validateContract(runtime_code, address){
    var chain_code = Web3.eth.getCode(address);
    return "0x" + runtime_code == chain_code;
}

/**
 * This modules main function
 * @param {hex} from_adr -  adress the user wishes to send money from
 */
function prepareAndDeploy(from_adr,p_secret, p_digest, p_dest, p_amount){

    var digest, ether, gasEstimate, contractInstance;
    var contract = web3FirstChain.eth.contract(abi);
    /**If you are bid poster the secret will be keccak256-hashed
     * else p_digest will contain the hashed secret
     */
    if(p_secret != null){
        digest = web3FirstChain.sha3(p_secret);
        console.log("Digest, send to tradee");
        console.log(digest);
    }else{
        digest = p_digest;
    }

    /**Need to convert the user inputted amount to Wei */
    ether = web3FirstChain.toWei(amount, "ether");
    gasEstimate =  4712386;//web3FirstChain.eth.estimateGas({data: bytecode});

    /**Creating an instance of our HTL contract
     * Currently using the predefined coinbase of the first chain
     * @todo make "from:" from_adr once message passing works
     */
    contractInstance = contract.new(digest,p_dest, {data: bytecode,gas: gasEstimate,from: web3FirstChain.eth.coinbase, value: ether});
   
    waitBlock(contractInstance);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// wait until any miner has included the transaction
// in a block to get the address of the contract
(async (function waitBlock(contract) {
    while (true) {
        let receipt = web3FirstChain.eth.getTransactionReceipt(contract.transactionHash);
        if (receipt && receipt.contractAddress) {
            /**@todo send this information to other user */
            console.log("Contract deployed at " + receipt.contractAddress);
            addEvent(contract);
            break;
        }
        console.log("Waiting for a mined block to include your contract... currently in block " + web3FirstChain.eth.blockNumber);
        await(sleep(4000));
    }
}))();

function addEvent(contract){
    var claimEvent = contract.Claim();
    
    claimEvent.watch(function(error,result) {
    //TODO: add automated unlock here!
        if(!error){
            console.log("The secret is " + result.args._hash.toString());
        } else {
            console.log(error);
        }
    });
}


function unlock(hash, claim_adr){
    
    /**@todo the account claiming the contract should be based on user input */
    web3SecondChain.eth.defaultAccount = web3SecondChain.eth.coinbase;

    let contract = web3SecondChain.eth.contract(abi);
    let contractInstance = contract.at(claim_adr);
    console.log(contractInstance);
    
    contractInstance.claim(hash);
}