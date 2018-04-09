var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')

var hashType = bitcoinjs.Transaction.SIGHASH_ALL

var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet); //Use your own key!
var bob = bitcoinjs.ECPair.fromWIF('cRgLkMozC74fjazThBBQipMyk8yyL5z3NeDYe5pQ9ckhyo4Q7kCj', bitcoinjs.networks.testnet); //Use your own key!

var timeout = "0" // 12
var secret = "1"

function toDigest(secret){
  return bcrypto.sha256(secret);
}

function htlc (digest, seller, buyer, timeout) { 
  return bitcoinjs.script.compile //Script is wrong right now
  ([
    bitcoinjs.opcodes.OP_IF,
      bitcoinjs.opcodes.OP_SHA256,
      digest,
      bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_ELSE,
      bitcoinjs.script.number.encode(timeout),
      bitcoinjs.opcodes.OP_CHECKSEQUENCEVERIFY,
      bitcoinjs.opcodes.OP_DROP,
    bitcoinjs.opcodes.OP_ENDIF,
    bitcoinjs.opcodes.OP_TRUE
  ]);
};

var redeemScript = htlc(bcrypto.sha256(secret), alice, bob, timeout);

var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
var address = bitcoinjs.address.fromOutputScript(scriptPubKey, bitcoinjs.networks.testnet);

console.log(address);

var txb = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);

txb.addInput("4125b47e9fbc4819bb8734d0c0fe3a463240bd4f3d7a02c661411b7b4a7a3488", 1, 0xfffffffe); //First argument is transaction ID of tx to P2SH address
txb.addOutput("2NFq89LPdqicKXEagYqHZtbzjwUsovRmeZG", 7e7); //First argument is destination for money and second is the amount

var tx = txb.buildIncomplete();

var signatureHash = tx.hashForSignature(0, redeemScript, hashType);
var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    Buffer.from("1"), //This is the secret
    bitcoinjs.opcodes.OP_TRUE
  ], redeemScript)
tx.setInputScript(0, redeemScriptSig);

console.log(bitcoinjs.script.decompile(redeemScript));


module.exports = {htlc, toDigest, alice, bob, timeout, tx, redeemScript};


