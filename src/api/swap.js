/**Imports */
const fs = require("fs");
const Web3 = require("web3");
// const geth = require("geth");
const { exec } = require('child_process');

/**Geth related */
// var options = {
//     testnet: null,
//     networkid: "1900",
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
const geth = exec('geth --light --testnet --networkid 1900 --port 30303');

geth.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});
geth.on('error', (err) => {
    console.log(err + " Install Geth");
});
geth.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});





/**Connect our application to Ethereum-servers
 * Current: web3FirstChain connects to an Ethereum blockchain using localhost 7545
 *          web3SecondChain -||- on localhost 8545
 * So if the chains are not using those localhosts, no connection
 * @todo recognise that two chains are running and connect to them
*/

var experimental = new Web3('ws://127.0.0.1:7545');
var classic =  new Web3('ws://127.0.0.1:8545');


console.log(experimental.currentProvider);
console.log(classic.currentProvider);

/**Query for the compiled abi and bytecode */
var abi;
var bytecode;
var obj = JSON.parse(fs.readFileSync('./contracts/HTLC.json', 'utf8'));
abi = obj.abi;
bytecode = '0x' + obj.code;



/** This function will validate the stored byte code against the byte code on a certain address.
 *  Remember that it's the runtime bytecode that needs to be compared, not the compiletime bytecode
 *
 *
*/
function validateContract(runtime_code, address){
    var chain_code = Web3.eth.getCode(address);
    return '0x' + runtime_code == chain_code;
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
        addEvent(contract, receipt.blockNumber)
      });
}


function addEvent(contract, block){
    contract.events.Claim({fromBlock: "latest"}, function(error, event){console.log(event.returnValues._hash);});
}

function unlock(ethchain, hash, from_adr, claim_adr){
    /**@todo the account claiming the contract should be based on user input */

    var contract = new ethchain.eth.Contract(abi);
    contract.options.address = claim_adr;
    
    contract.methods.claim(hash).send({from: from_adr}).on("receipt", function(receipt){
    console.log("DEPLOYED");});
}

module.exports = {addEvent, experimental, classic, abi, bytecode, unlock, prepareAndDeploy, validateContract};
