var bitcoin = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoin.crypto
var btemplates = bitcoin.templates
var scriptOutput = require('./node_modules/bitcoinjs-lib/src/templates/scripthash/output')
var base58check = require('./node_modules/bs58check/base')
var address = bitcoin.address
var script = bitcoin.script
var ecdsa = require('./node_modules/bitcoinjs-lib/src/ecdsa')
var ecpair = require('./node_modules/bitcoinjs-lib/src/ecpair')
var NETWORKS = require('./node_modules/bitcoinjs-lib/src/networks')
var convert = require('./node_modules/bigi/lib/convert')


// prevOutScript = btemplates.scriptHash.output.encode(bcrypto.hash160(redeemScript))
// console.log(scriptOutput.encode(bcrypto.hash160("522103310188e911026cf18c3ce274e0ebb5f95b00\
//     7f230d8cb7d09879d96dbeab1aff210243930746e6ed6552e03359db521b\
//     088134652905bd2d1541fa9124303a41e95621029e03a901b85534ff1e92\
//     c43c74431f7ce72046060fcf7a95c37e148f78c7725553ae")))
const MAIN_PREF = '05'
const TEST_PREF = 196



// var buffer = Buffer.from('5121039a77bb1d92c983ce8791da06711d435081181d3af3d4c10d9d388e2f36cbc73051ae', 'hex')
var buffer = Buffer.from('a9147a336338b50f19548c8a340e48a28b919138678087', 'hex')
var pub_key = Buffer.from('76a9147074ce8ff2f417d6b232d73a789ca09e7c0e8ef388ac', 'hex')

var ripeMD160 = bcrypto.hash160(buffer)


var sha256 = bcrypto.sha256('514104398184a2cef0d7b73ed7a3a1d4ad16296c3c6986bed0bd72775060aae9891979eaea1efb28d7eb1da3304ec38a98b42086e3be2ceba82b0e932128ec422a6fc2210250504b2d4245544120506565722d506565722d6e6574776f726b2062657461212102553432353135362e31323234202020202020202020202020202020202020202053ae');
// console.log(sha256.toString('hex'))


console.log(ripeMD160.toString('hex'));

var withNetPrefixBuffer = Buffer.from(MAIN_PREF, 'hex')
var withNetPrefixBuffer1 = Buffer.concat([withNetPrefixBuffer, ripeMD160], withNetPrefixBuffer.length + ripeMD160.length)
console.log(withNetPrefixBuffer1.toString('hex'));

var checkSum = bcrypto.hash256(withNetPrefixBuffer1).slice(0, 4)
console.log(checkSum.toString('hex'));

var scriptAddress = Buffer.concat([/*withNetPrefixBuffer, */ripeMD160/*, checkSum*/])

console.log(scriptAddress.toString('hex'));
// base58check.decodeRaw(scriptAddress)

var base58Address = address.toBase58Check(ripeMD160, 5)
var base58AddressTestnet = address.toBase58Check(scriptAddress, TEST_PREF)

var asm = "01 04398184a2cef0d7b73ed7a3a1d4ad16296c3c6986bed0bd72775060aae9891979eaea1efb28d7eb1da3304ec38a98b42086e3be2ceba82b0e932128ec422a6fc2 0250504b2d4245544120506565722d506565722d6e6574776f726b206265746121 02553432353135362e313232342020202020202020202020202020202020202020 03 OP_CHECKMULTISIG";

// script.toASM('514104398184a2cef0d7b73ed7a3a1d4ad16296c3c6986bed0bd72775060aae9891979eaea1efb28d7eb1da3304ec38a98b42086e3be2ceba82b0e932128ec422a6fc2210250504b2d4245544120506565722d506565722d6e6574776f726b2062657461212102553432353135362e31323234202020202020202020202020202020202020202053ae')

console.log(base58Address.toString('hex'));
console.log(base58AddressTestnet.toString('hex'));


console.log(script.fromASM(asm))

var address1 = 'mig62kzfrCcBbpKnpTTeEzxGxDDCs8XWjR'
console.log('hello');
console.log(address.fromBase58Check(address1)['hash'].toString('hex'));




var timeout = "0c" // 12
var secret = "01"
var digest = bcrypto.hash160(secret).toString('hex')

var seller_pubkey_hash = '22a29435b1386d8fbc779a72612ccda7401d4aa2'
var buyer_pubkey_hash = '7074ce8ff2f417d6b232d73a789ca09e7c0e8ef3'
// var pubkey_script = OPS.OP_HASH160;
var redeem_script =
  "OP_IF " +
    "OP_RIPEMD160 " + digest + " OP_EQUALVERIFY " + "OP_DUP " + "OP_HASH160 " + seller_pubkey_hash +
  " OP_ELSE " +
    timeout + " OP_CHECKSEQUENCEVERIFY " + "OP_DROP " + "OP_DUP " + "OP_HASH160 " + buyer_pubkey_hash +
  " OP_ENDIF " +
  "OP_EQUALVERIFY " +
  "OP_CHECKSIG"

console.log(redeem_script);
console.log(script.fromASM(redeem_script).toString('hex'));
var fromASM = script.fromASM(redeem_script).toString('hex')
var hashASM = bcrypto.hash160(fromASM).toString('hex')
console.log("hashASM");
console.log(hashASM);
var pubkey_script = "OP_HASH160 " + hashASM + " OP_EQUAL"

console.log(pubkey_script);
console.log(asmToAddress(pubkey_script));


var something = "OP_DUP OP_HASH160 df9ac343e79ae35a727ff757b02e93ac5a4748dd OP_EQUALVERIFY OP_CHECKSIG"
console.log(script.fromASM(something).toString('hex'));

// var tx = txb.buildIncomplete()
// var signatureHash = tx.hashForSignature(0, redeemScript, hashType)
// var redeemScriptSig = bitcoin.script.scriptHash.input.encode([
//         alice.sign(signatureHash).toScriptSignature(hashType),
//         bitcoin.opcodes.OP_TRUE
// ], redeemScript)


// var fromASM1 = script.fromASM(pubkey_script)
// console.log(fromASM1);
// var hash160000 = bcrypto.hash160(fromASM1)
//
// var scriptAddress1 = address.toBase58Check(hash160000, TEST_PREF)
// console.log(scriptAddress1.toString('hex'));

/*
Pubkey script: OP_HASH160 <Hash160(redeemScript)> OP_EQUAL
Signature script: <sig> [sig] [sig...] <redeemScript>
*/

/*
OP_IF
    [HASHOP] <digest> OP_EQUALVERIFY OP_DUP OP_HASH160 <seller pubkey hash>
OP_ELSE
    <num> [TIMEOUTOP] OP_DROP OP_DUP OP_HASH160 <buyer pubkey hash>
OP_ENDIF
OP_EQUALVERIFY
OP_CHECKSIG
*/

//without else
/*
seller redeemScript: OP_SHA256 <digest> OP_EQUALVERIFY OP_DUP OP_HASH160 <seller pubkey hash> OP_EQUALVERIFY OP_CHECKSIG
seller Signature script: <sig> <seller pubkey> <secret> <01>

buyer redeemScript: <num> OP_CHECKSEQUENCEVERIFY OP_DROP OP_DUP OP_HASH160 <buyer pubkey hash> OP_EQUALVERIFY OP_CHECKSIG
buyer Signature script: <sig> <buyer pubkey> <00>

Pubkey script: OP_HASH160 <Hash160(redeemScript)> OP_EQUAL
Seller Signature script: <sig> <seller pubkey> <secret> <01> <redeemScript>
Buyer Signature script: <sig> <buyer pubkey> <00> <redeemScript>
*/

/*
HASHOP is a hashing algorithm (RIPEMD, SHA256). TIMEOUTOP is either OP_CHECKSEQUENCEVERIFY or OP_CHECKLOCKTIMEVERIFY.
This script allows the “buyer” to buy the preimage to <digest> by forcing the seller to reveal it when they claim their funds, and if the seller doesn’t reveal it,
the buyer can get their money back after the timeout period.
*/

/*
Pubkey script: OP_DUP OP_HASH160 <PubKeyHash> OP_EQUALVERIFY OP_CHECKSIG
Signature script: <sig> <pubkey>
*/

var privKey = 'cNehmrE2nzm1bUR19dV3cTrKcYuaE5vTHzN7NMQMWSZMrGedBeMb'
var tx = "0200000001306bc01d406f5a42979dce88addc49ecf7a45c77cb85c8d70c1d2e71742c82b60000000000ffffffff01806de729010000001976a914a1a1d4dd83b9c8e8d8557f2a48fca42181da767a88ac00000000"
var txHash = bcrypto.hash256(tx)

// ecdsa.signum

// ecdsa.verify

console.log(ecpair.fromWIF(privKey, NETWORKS.testnet));

rAndS = ecdsa.sign(txHash, ecpair.fromWIF(privKey, NETWORKS.testnet).d)

console.log('Helo mate');
console.log(rAndS.r);
// console.log(convert.toHex(rAndS, 10));
console.log(rAndS.r.toBuffer(21).toString('hex'))
console.log(rAndS.s.toBuffer(20).toString('hex'))


function asmToAddress(asm) {
  var asmHex = script.fromASM(asm)
  console.log(asmHex.toString('hex'))
  var buffer = Buffer.from(asmHex, 'hex')
  console.log(buffer);
  var ripeMD1601 = bcrypto.hash160(buffer)
  console.log(ripeMD1601);
  return address.toBase58Check(ripeMD1601, TEST_PREF)
}
