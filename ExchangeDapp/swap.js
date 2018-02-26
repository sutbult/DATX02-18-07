window.onload = function () {
    addDeployEvent();
    addUnlockEvent();
    
    //console.log(orbit.connect('Haad'));
    console.log("asd");
}

//import Jquery module
window.$ = window.jQuery = require('jQuery');

//connect web3 to Ethereum-servers
web3FirstChain = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
web3SecondChain = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
console.log(web3FirstChain.isConnected());
console.log(web3SecondChain.isConnected());

//Get the abi and bytecode compiled by embark
var abi;
var bytecode;
$.getJSON('contracts/HTLC.json', (result) => {
    abi = result.abi; 
    bytecode = '0x' + result.code;
    
});

var accounts = []    
web3FirstChain.eth.getAccounts((err,acc) => {
    console.log(acc);
    accounts.push(acc);
});

//this function gets called by addDeployEvent() when you press the deploy btn
function prepareAndDeploy(){
    


    var p_digest;
    //Will differ if you placed or accepted bid
    if(!document.getElementById('secret').value){
        p_digest = document.getElementById('digest').value;
    }else{
        p_digest = web3FirstChain.sha3(document.getElementById('secret').value);
        console.log("Digest, send to tradee");
        console.log(p_digest);
    }

    var p_dest = document.getElementById('dest').value;
    var ether = web3FirstChain.toWei(document.getElementById('ether').value, "ether");//web3FirstChain.toWei(10,"ether");

    var contract = web3FirstChain.eth.contract(abi);
    let gasEstimate =  4712386;//web3FirstChain.eth.estimateGas({data: bytecode});
    var contractInstance = contract.new(p_digest,p_dest, {data: bytecode,gas: gasEstimate,from: web3FirstChain.eth.coinbase, value: ether});
   
    waitBlock(contractInstance);
}

function addDeployEvent(){
    const deployBtn = document.getElementById('contract-deploy');
    deployBtn.addEventListener('click', prepareAndDeploy);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// wait until any miner has included the transaction
// in a block to get the address of the contract
async function waitBlock(contract) {
    while (true) {
        let receipt = web3FirstChain.eth.getTransactionReceipt(contract.transactionHash);
        if (receipt && receipt.contractAddress) {
            status("Contract deployed at " + receipt.contractAddress);
            addEvent(contract);
            break;
        }
        status("Waiting for miners");
        console.log("Waiting for a mined block to include your contract... currently in block " + web3FirstChain.eth.blockNumber);
        await sleep(4000);
    }
}



function unlock(){
    
    web3SecondChain.eth.defaultAccount = web3SecondChain.eth.coinbase;
    let contract = web3SecondChain.eth.contract(abi);
    let contractInstance = contract.at(document.getElementById('adrForHTLC').value);
    console.log(contractInstance);
    let _hash = document.getElementById('key').value;
    
    contractInstance.claim(_hash);
}

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

function addUnlockEvent(){
    const unlockBtn = document.getElementById('htlc-unlock');
    unlockBtn.addEventListener('click', unlock);
}

function status(txt) {
    document.getElementById('status').innerHTML = txt
}