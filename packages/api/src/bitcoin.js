var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')
var bip68 = require('bip68')

var hashType = bitcoinjs.Transaction.SIGHASH_ALL

var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet); //Use your own key!
var bob = bitcoinjs.ECPair.fromWIF('cRgLkMozC74fjazThBBQipMyk8yyL5z3NeDYe5pQ9ckhyo4Q7kCj', bitcoinjs.networks.testnet); //Use your own key!

var timeout = "01" // 12
var secret = "1"

function toDigest(secret){
  return bcrypto.sha256(secret);
}

var sequence = bip68.encode({ blocks: 1 })

function htlc (digest, seller, buyer, timeout) { 
  return bitcoinjs.script.compile //Script is wrong right now
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
      bitcoinjs.opcodes.OP_CHECKSEQUENCEVERIFY,
      bitcoinjs.opcodes.OP_DROP,
      bitcoinjs.opcodes.OP_DUP,
      bitcoinjs.opcodes.OP_HASH160,
      bcrypto.hash160(buyer.getPublicKeyBuffer()),
    bitcoinjs.opcodes.OP_ENDIF,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_CHECKSIG
  ]);
};

var redeemScript = htlc(bcrypto.sha256(secret), alice, bob, sequence);

var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
var address = bitcoinjs.address.fromOutputScript(scriptPubKey, bitcoinjs.networks.testnet);

console.log(address);

var txb = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);

txb.addInput("dc717b626af43c4c66653ba48475d3f7bb67dbfbdbb44adb1f6902fd5026b889", 1, 0xfffffffe); //First argument is transaction ID of tx to P2SH address
txb.addOutput("2NFq89LPdqicKXEagYqHZtbzjwUsovRmeZG", 7e7); //First argument is destination for money and second is the amount

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



module.exports = {htlc, toDigest, alice, bob, timeout, tx, redeemScript};


