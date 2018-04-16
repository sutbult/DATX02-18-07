var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')
var bip65 = require('bip65')
var RpcClient = require('bitcoind-rpc');


var rpc;


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

function getBalance(callback) {
  var result = {'error': '', 'balance': ''};
  if (rpc === undefined) {
    result.error = 'RPC needs to be defined';
    callback(result);
    return;
  }
  rpc.getBalance(function (err, ret) {
    if (err) {
      result.error = err;
    } else {
      result.balance = ret.result.toString();
    }
    callback(result)
  });
}

function myFun(word) {
  console.log(word);
}

BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
// DefaultBitcoinClient();
ping(myFun);
/*
var hashType = bitcoinjs.Transaction.SIGHASH_ALL

var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet); //Use your own key!
var bob = bitcoinjs.ECPair.fromWIF('cRgLkMozC74fjazThBBQipMyk8yyL5z3NeDYe5pQ9ckhyo4Q7kCj', bitcoinjs.networks.testnet); //Use your own key!

var secret = "1"

function toDigest(secret){
  return bcrypto.sha256(secret);
}

var timeout = bip65.encode({ blocks: 110 }) //The block where you can refund the transaction after (in absolute value; check current block height)

function htlc (digest, seller, buyer, timeout) {
  return bitcoinjs.script.compile //CHECKSQUENCEVERIFY REFUSES TO WORK
  ([
    bitcoinjs.opcodes.OP_IF,
      bitcoinjs.opcodes.OP_SHA256,
      digest,
      bitcoinjs.opcodes.OP_EQUALVERIFY,
      bitcoinjs.opcodes.OP_DUP,
      bitcoinjs.opcodes.OP_HASH160,
      bcrypto.hash160(seller.getPublicKeyBuffer()),
    bitcoinjs.opcodes.OP_ELSE,
      bitcoinjs.script.number.encode(timeout),
      bitcoinjs.opcodes.OP_CHECKLOCKTIMEVERIFY,
      bitcoinjs.opcodes.OP_DROP,
      bitcoinjs.opcodes.OP_DUP,
      bitcoinjs.opcodes.OP_HASH160,
      bcrypto.hash160(buyer.getPublicKeyBuffer()),
    bitcoinjs.opcodes.OP_ENDIF,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_CHECKSIG
  ]);
};


var redeemScript = htlc(bcrypto.sha256(secret), alice, bob, timeout);

var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
var address = bitcoinjs.address.fromOutputScript(scriptPubKey, bitcoinjs.networks.testnet);

console.log(address);

var txb = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);

txb.setLockTime(timeout) //Transaction needs to have the appropriate locktime
txb.addInput("0c09009f269f682d08cc53abae0b466409c55b95922e08d8a9edbef68de37fbf", 0, 0xfffffffe); //First argument is transaction ID of tx to P2SH address, second vout, third sequence
txb.addOutput("2N6dyyk1a3L6keV5EENZe9jvf5NuXfjPuU2", 9e8); //First argument is destination for money and second is the amount

var tx = txb.buildIncomplete();

var signatureHash = tx.hashForSignature(0, redeemScript, hashType);
var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    bob.sign(signatureHash).toScriptSignature(hashType),
    bob.getPublicKeyBuffer(),
    //Buffer.from("1"), //This is the secret
    //bitcoinjs.opcodes.OP_TRUE
    bitcoinjs.opcodes.OP_FALSE
  ], redeemScript)

tx.setInputScript(0, redeemScriptSig);

console.log(bitcoinjs.script.decompile(redeemScript));
console.log(bcrypto.hash160(alice.getPublicKeyBuffer()).toString('hex'));



module.exports = {htlc, toDigest, alice, bob, tx, redeemScript};
*/
