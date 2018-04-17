var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')
var bip65 = require('bip65')
var RpcClient = require('bitcoind-rpc');


var rpc;
var htlcTransactionObject;


function BitcoinClient(user, password, host, port) {
  var config = {
    protocol: 'http',
    user: user,
    pass: password,
    host: host,
    port: port,
  };
  rpc = new RpcClient(config);
}

function DefaultBitcoinClient() {
  var config = {
    // protocol: 'http'
    // user: 'user'
    // pass: 'pass'
    // host: '127.0.0.1'
    // port: '8332'
  }
  rpc = new RpcClient(config);
}

function ping(callback) {
  var result = {'error': '', 'status': ''};
  rpc.getNetworkInfo(function (err, ret) {
    if (err) {
      result.error = err;
    } else {
      result.status = 'OK';
    }
    callback(result);
  });
}

function getBalance() {
  return new Promise((resolve, reject) => {
    var result = {'error': '', 'balance': ''};
    if (rpc === undefined) {
      result.error = 'RPC needs to be defined';
      resolve(result);
      return;
    }
    rpc.getBalance((err, ret) => {
      if (err) {
        reject(err);
        //result.error = err;
      } else {
        resolve({
          balance: ret.result.toString(),
        });
        //result.balance = ret.result.toString();
      }
      //resolve(result)
    });
  });
}

function myFun(word) {
  console.log(word);
}

BitcoinClient('bitcoinrpc', 'password', '127.0.0.2', '16592');
// DefaultBitcoinClient();

// async function functionName() {
//   const something = await getBalance();
//   return something;
// }
// functionName().then((a) => console.log(a));
// console.log("hello");
// ping(myFun

var timeout = getTimeout(110)
result = htlcTransactionObject(undefined, undefined, undefined)
console.log(result);
var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet);
console.log(alice.getPublicKeyBuffer());

redeemScript = result.redeemScript;
hashType = result.hashType;

function getTimeout(timeoutBlocks) {
  //get current blockNumber first and add to timeoutBlocks
  return bip65.encode({ blocks: timeoutBlocks });
}

function sendToHTLC(secret, sellerPublicKey, satoshis) {
  this.htlcTransactionObject = htlcTransactionObject()
}

// function for sending to htlc address and adding id and stuff to htlcTransactionObject
// htlcTransactionObject global object?
// function for uploading and sending to htlc calls function above and htlcTransactionObject

//



function htlcTransactionObject(bobKey, secret, timeoutBlocks) {
  var result = {};
  var hashType = bitcoinjs.Transaction.SIGHASH_ALL;
  result.hashType = hashType;

  //dump private key for alice or get fromWIF some other way?
  var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet); //Use your own key!
  //receive bobs fromWif as an arugment
  var bob = bitcoinjs.ECPair.fromWIF('cRgLkMozC74fjazThBBQipMyk8yyL5z3NeDYe5pQ9ckhyo4Q7kCj', bitcoinjs.networks.testnet); //Use your own key!
  var secret = "1"
  // Get current block and add timeoutBlocks to that
  var timeout = bip65.encode({ blocks: 110 }) //The block where you can refund the transaction after (in absolute value; check current block height)
  result.timeout = timeout;
  var redeemScript = htlc(bcrypto.sha256(secret), alice, bob, timeout);
  result.redeemScript = redeemScript;
  var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
  var address = bitcoinjs.address.fromOutputScript(scriptPubKey, bitcoinjs.networks.testnet);
  result.address = address;
  console.log(address);
  return result;
}

function toDigest(secret){
  return bcrypto.sha256(secret);
}

function htlc (digest, sellerPublicKeyBuffer, buyerECPair, timeout) {
  return bitcoinjs.script.compile //CHECKSQUENCEVERIFY REFUSES TO WORK
  ([
    bitcoinjs.opcodes.OP_IF,
    bitcoinjs.opcodes.OP_SHA256,
    digest,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_DUP,
    bitcoinjs.opcodes.OP_HASH160,
    bcrypto.hash160(sellerPublicKeyBuffer),
    // bcrypto.hash160(seller.getPublicKeyBuffer()), we don't know the other person's private key...
    bitcoinjs.opcodes.OP_ELSE,
    bitcoinjs.script.number.encode(timeout),
    bitcoinjs.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoinjs.opcodes.OP_DROP,
    bitcoinjs.opcodes.OP_DUP,
    bitcoinjs.opcodes.OP_HASH160,
    bcrypto.hash160(buyerECPair.getPublicKeyBuffer()),
    bitcoinjs.opcodes.OP_ENDIF,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_CHECKSIG
  ]);
};

function redeemAsSeller() {
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    bob.sign(signatureHash).toScriptSignature(hashType),
    bob.getPublicKeyBuffer(),
    bitcoinjs.opcodes.OP_FALSE
  ], redeemScript)
  //call buildReedemTransaction
}

//
function redeemAsBuyer(secret) {
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    bob.sign(signatureHash).toScriptSignature(hashType),
    bob.getPublicKeyBuffer(),
    Buffer.from("1"), //This is the secret
    bitcoinjs.opcodes.OP_TRUE
  ], redeemScript)
  //call buildReedemTransaction
}

function buildReedemTransaction(htlcTransObj, htlcTransId, redeemScriptSig, network, destination, satoshis, vout, sequence) {
  // var txb = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);

  // txb.setLockTime(timeout) //Transaction needs to have the appropriate locktime
  // txb.addInput("0c09009f269f682d08cc53abae0b466409c55b95922e08d8a9edbef68de37fbf", 0, 0xfffffffe); //First argument is transaction ID of tx to P2SH address, second vout, third sequence
  // txb.addOutput("2N6dyyk1a3L6keV5EENZe9jvf5NuXfjPuU2", 9e8); //First argument is destination for money and second is the amount
  var txb = new bitcoinjs.TransactionBuilder(network);
  txb.setLockTime(htlcTransObj.timeout);
  txb.addInput(htlcTransId, 0, 0xfffffffe);
  txb.addOutput(destination, satoshis);

  var tx = txb.buildIncomplete();

  var signatureHash = tx.hashForSignature(0, htlcTransObj.redeemScript, htlcTransObj.hashType);
  // var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
  //   bob.sign(signatureHash).toScriptSignature(hashType),
  //   bob.getPublicKeyBuffer(),
  //   //Buffer.from("1"), //This is the secret
  //   //bitcoinjs.opcodes.OP_TRUE
  //   bitcoinjs.opcodes.OP_FALSE
  // ], redeemScript)

  tx.setInputScript(0, redeemScriptSig);

  console.log(bitcoinjs.script.decompile(redeemScript));
  console.log(bcrypto.hash160(alice.getPublicKeyBuffer()).toString('hex'));

}



module.exports = {/*htlc, toDigest, alice, bob, tx, redeemScript*/};
