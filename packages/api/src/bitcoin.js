var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')
var bip65 = require('bip65')
var RpcClient = require('bitcoind-rpc');
const Currency = require('./currency.js')
var rpc;
var network;


async function main() {
  //buyer sends it public key
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var buyerPrivkey = await getAddrPrivkeyPair();
  var buyerECPair = bitcoinjs.ECPair.fromWIF(buyerPrivkey, bitcoinjs.networks.testnet);
  var buyerPublicKeyBuffer = buyerECPair.getPublicKeyBuffer();
  //seller creates contract
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
  var balance = await getBalance();
  console.log(balance);
  var privkey = await getAddrPrivkeyPair();
  var sellerECPair = bitcoinjs.ECPair.fromWIF(privkey, bitcoinjs.networks.testnet);
  var selPubKeyBuf = sellerECPair.getPublicKeyBuffer();
  var htlc = await createHTLC(toDigest("heja"), selPubKeyBuf, buyerPublicKeyBuffer, 10000, bitcoinjs.networks.testnet);
  // var ok = await htlcAddress(htlc.digest, sellerECPair.getPublicKeyBuffer(), htlc.buyerPublicKeyBuffer, 10, bitcoinjs.networks.testnet);
  //buyer verifies contract and sends funds to it
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var balance = await getBalance();
  console.log(balance);
  // console.log(htlc.redeemScript);
  // console.log(htlc.address);
  var ok = await verifyHTLC(toDigest("heja"), selPubKeyBuf, buyerPublicKeyBuffer, 10000, bitcoinjs.networks.testnet, htlc.address);
  console.log(ok);
  if (ok) {
    var txid = await sendToHTLC(htlc.address, 0.1)
    var balance = await getBalance();
    console.log(txid);
    console.log(balance);

    //seller redeems with secret
    BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
    var balance = await getBalance();
    console.log(balance);
    var generate = await generateBlock();
    console.log(generate);
    var address = await getAddress();
    console.log(address);
    console.log('before');
    setTimeout(async function() {
      var redeem = await redeemAsSeller(sellerECPair, "heja", txid, bitcoinjs.networks.testnet, address, 10000000, htlc.redeemScript);
      console.log(redeem);
    }, 10000);

  }
}

async function send(wallet, digest, selPubKey, btc, timeoutOffset) {
  var buyPubKey = wallet.pubkey;
  var timeout = await generateTimeout(timeoutOffset);
  var htlc = await htlcAddress(digest, selPubKey, buyPubKey, timeout, this.network);
  var txid = await sendToHTLC(htlc.address, btc);
  receipt = new Object();
  receipt.contractAddress = txid;
  receipt.digest = digest;
  receipt.timelock = timeout;
  receipt.address = buyPubKey;
  return receipt;
}

async function validate() {
  return true;
}

function BitcoinTest(host, port) {
  Bitcoin(host, port, bitcoinjs.networks.testnet);
}

function Bitcoin(host, port, network) {
  var currency = new Currency.construct(getBalance, send, validate, redeemAsSeller, checkForSecret, unlockAccount, wallet);
  var config = {};
  config.protocol = 'http';
  config.host = host;
  config.port = port;
  currency.config = config;
  currency.network = network;
}

function wallet() {
  var res = {};
  var addrPriv = await getAddrPrivkeyPair();
  var privkey = addrPriv.privkey;
  var ECPair = bitcoinjs.ECPair.fromWIF(sellerPrivkey, bitcoinjs.networks.testnet);
  var publicKeyBuffer = sellerECPair.getPublicKeyBuffer();
  res.address = addrPriv.address;
  res.pubkey = publicKeyBuffer;
  return res;
}

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

function unlockAccount(user, pass) {
  this.config.user = user;
  this.config.pass = pass;
  this.rpc = new RpcClient(this.config);
}

function ping(callback) {
  var result = {'error': '', 'status': ''};
  this.rpc.getNetworkInfo(function (err, ret) {
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
    this.rpc.getBalance((err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.result);
      }
    });
  });
}

function getAddress() {
  return new Promise((resolve, reject) => {
    this.rpc.getNewAddress((err, ret) => {
      if (err) {
        reject(err)
      }
      resolve(ret.result);
    });
  });
}

function generateBlock() {
  return new Promise(function(resolve, reject) {
    this.rpc.generate(1, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(ret.result);
    });
  });
}

async function voutFromTransaction(transId) {
  return new Promise(async function(resolve, reject) {
    var transaction = await getRawTransactionObject(transId);
    var vout = transaction.vout[0].n;
    resolve(vout);
  });
}

async function getRawTransactionObject(transId) {
  return new Promise((resolve, reject) => {
    this.rpc.getRawTransaction(transId, (err, ret) => {
      if (err) {
        reject(err);
      }
      var rawTransaction = ret.result;
      this.rpc.decodeRawTransaction(rawTransaction, (err1, ret1) => {
        if (err1) {
          reject(err1);
        } else {
          resolve(ret1.result);
        }
      });
    });
  });
}

function getAddrPrivkeyPair() {
  result = {};
  return new Promise((resolve, reject) => {
    this.rpc.getNewAddress((err1, addr) => {
      if (err1) {
        resolve(err1);
      } else {
        this.rpc.dumpPrivKey(addr.result.toString(), (err2, priv) => {
          if (err2) {
            reject(err2)
          } else {
            result.address = addr.result;
            result.privkey = priv.result;
            resolve(result);
          }
        });
      }
    });
  });
}

function getPrivkeyFromAddr(addr) {
  return new Promise((resolve, reject) => {
    this.rpc.dumpPrivKey(addr, (err, priv) => {
      if (err) {
        reject(err);
      } else {
        resolve(priv.result);
      }
    });
  });
}

async function test() {
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var something = await checkForSecret('mhK2UW65ffGoUr3irFYovwjfByEaBYwLuQ', 2);
  console.log("something");
  console.log(something);
}

async function getAddressFromTransation(txid) {
  this.rpc.getRawTransaction()
}

async function checkForSecret(txid, numBlocks) {

  result = {'secret': '', found: false}
  return new Promise(async function(resolve, reject) {

    this.rpc.getBestBlockHash(async function(err1, ret1) {
      if (err1) {
        reject(err1);
      } else {
        let currentBlock = ret1.result;
        for (var i = 0; i < numBlocks; i++) {
          var txPrev = await getBlockTxsAndPrev(currentBlock);
          let secretJson = await findSecretInBlock(txPrev.txs, txid);
          if (secretJson.found) {
            result.found = true;
            result.secret = secretJson.secret;
            resolve(result);
          } else {
            currentBlock = txPrev.prev;
          }
        }
        resolve(result);
      }
    });
  });
}

async function findSecretInBlock(txs, txid) {
  var result = {'secret': '', 'found': false};
  return new Promise(async function(resolve, reject) {
    for (var i = 0; i < txs.length; i++) {
      var transaction = await getRawTransactionObject(txs[i]);
      var scriptSig = transaction.vin[0].scriptSig;
      if (scriptSig !== undefined) {
        if (transaction.vin[0].txid == txid) {
          result.found = true;
          result.secret = extractSecret(scriptSig.asm);
          resolve(result);
        }
      }
    }
    resolve(result);
  });
}

function extractSecret(asm) {
  var byteSecret = asm.split(' ')[2];
  var numberHex = parseInt(byteSecret).toString(16);
  var twos = [];
  for (var i = 0; i < numberHex.length; i += 2) {
    let newString = numberHex[i] + numberHex[i + 1];
    twos[i / 2] = newString;
  }
  var reversed = twos.reverse();
  var result = "";
  for (var k = 0; k < reversed.length; k++) {
    result += String.fromCharCode(parseInt(reversed[k], 16));
  }
  return result;
}

async function getBlockTxsAndPrev(blockhash) {
  var result = {'txs': '', 'prev': ''};
  return new Promise((resolve, reject) => {
    this.rpc.getBlock(blockhash, 1, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        result.txs = ret.result.tx;
        result.prev = ret.result.previousblockhash;
        resolve(result);
      }
    });
  });
}

function toDigest(secret){
  return bcrypto.sha256(secret);
}

function sendToHTLC(address, btc) {
  return new Promise((resolve, reject) => {
    this.rpc.sendToAddress(address, btc, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.result);
      }
    });
  });
}

async function generateTimeoutBlocks(timeoutBlocks) {
  return new Promise((resolve, reject) => {
    this.rpc.getBlockCount((err, ret) => {
      if (err) {
        reject("Couldn't get current block count");
      }
      var timeout = bip65.encode({ blocks: (ret.result + timeoutBlocks)});
      resolve(timeout);
    });
  });
}

async function generateTimeout(offset) {
  return new Promise((resolve, reject) => {
    this.rpc.getBestBlockHash((err, ret) => {
      if (err) {
        reject(err);
      } else {
        this.rpc.getBlock(ret.result, 1, (err1, ret1) => {
          if (err1) {
            reject(err1)
          } else {
            var timeout = bip65.encode({ utc: ret1.result.time + offset});
            resolve(timeout);
          }
        });
      }
    });
  });
}

// TODO: Implement as interface says
// TODO: rename validate and get information from transaction
async function verifyHTLC(digest, selPubKeyBuf, buyPubKeyBuf, timeoutOffset, network, compareAddress) {
  // generate htlcAddress and make sure it matches htlcAddress
  var htlc = await htlcAddress(digest, selPubKeyBuf, buyPubKeyBuf, timeoutOffset, network);
  var address = htlc.address;
  // return address + "\n" + compareAddress;
  // console.log(address);
  return address === compareAddress;
}

async function createHTLC(digest, selPubKeyBuf, buyPubKeyBuf, timeoutOffset, network) {
  var result = {};
  var htlc = await htlcAddress(digest, selPubKeyBuf, buyPubKeyBuf, timeoutOffset, network);
  // result.sellerECPair = sellerECPair;
  // result.digest = digest;
  // result.sellerPublicKeyBuffer = selPubKeyBuf;
  result.address = htlc.address;
  result.htlc = htlc;
  result.timeout = htlc.timeout;
  result.redeemScript = htlc.redeemScript;
  return result;
}

async function htlcAddress(digest, selPubKeyBuf,  buyPubKeyBuf, timeout, network) {
  var hashType = bitcoinjs.Transaction.SIGHASH_ALL;
  return new Promise(function(resolve, reject) {
    result = {};
    var redeemScript = htlc(digest, selPubKeyBuf, buyPubKeyBuf, timeout);
    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
    var address = bitcoinjs.address.fromOutputScript(scriptPubKey, network);
    result.timeout = timeout;
    result.redeemScript = redeemScript;
    result.scriptPubKey = scriptPubKey;
    result.address = address;
    // console.log(JSON.stringify(result.redeemScript));
    resolve(result);
  });
}

function htlc(digest, sellerPublicKeyBuffer, buyerPublicKeyBuffer, timeout) {
  return bitcoinjs.script.compile //CHECKSQUENCEVERIFY REFUSES TO WORK
  ([
    bitcoinjs.opcodes.OP_IF,
    bitcoinjs.opcodes.OP_SHA256,
    digest,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_DUP,
    bitcoinjs.opcodes.OP_HASH160,
    bcrypto.hash160(sellerPublicKeyBuffer),
    bitcoinjs.opcodes.OP_ELSE,
    bitcoinjs.script.number.encode(timeout),
    bitcoinjs.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoinjs.opcodes.OP_DROP,
    bitcoinjs.opcodes.OP_DUP,
    bitcoinjs.opcodes.OP_HASH160,
    bcrypto.hash160(buyerPublicKeyBuffer),
    bitcoinjs.opcodes.OP_ENDIF,
    bitcoinjs.opcodes.OP_EQUALVERIFY,
    bitcoinjs.opcodes.OP_CHECKSIG
  ]);
};

async function redeemAsBuyer(buyerECPair, network, htlcTransId, destination, btc, redeemScript) {
  var tx = await buildReedemTransaction(htlcTransId, network, destination, btc);
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    buyerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    buyerECPair.getPublicKeyBuffer(),
    bitcoinjs.opcodes.OP_FALSE
  ], redeemScript);
  tx.setInputScript(0, redeemScriptSig);
  return new Promise(function(resolve, reject) {
    this.rpc.sendRawTransaction(tx, true, (err, ret) => {
      if (err) {
        reject(err);
      }
      resolve(ret.result);
    });
  });
}

async function redeemAsSeller(preImageHash, wallet, message) {
  var htlcTransId = message.contractAddress;
  var timeout = message.timeout;
  var sellerPrivkey = await getPrivkeyFromAddr(wallet.address);
  var sellerECPair = bitcoinjs.ECPair.fromWIF(sellerPrivkey, this.network);
  var selPubKeyBuf = sellerECPair.getPublicKeyBuffer();
  var redeemScript = await (toDigest(preImageHash), selPubKeyBuf,  buyPubKeyBuf, timeout, this.network)
  var destination = await getAddress();
  var transObject = await getRawTransactionObject(htlcTransId);
  var satoshi = transObject.vout[0].value*100000000; // multiply with hundred million to get satoshi
  var tx = await buildReedemTransaction(htlcTransId, this.network, destination, satoshi);
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    sellerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    sellerECPair.getPublicKeyBuffer(),
    Buffer.from(preImageHash),
    bitcoinjs.opcodes.OP_TRUE
  ], redeemScript);
  tx.setInputScript(0, redeemScriptSig);
  return new Promise(function(resolve, reject) {
    this.rpc.sendRawTransaction(tx.toHex(), true, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.result);
      }
    });
  });
}

async function buildReedemTransaction(htlcTransId, network, destination, satoshi) {
  var vout = await voutFromTransaction(htlcTransId);
  var txb = new bitcoinjs.TransactionBuilder(network);
  txb.addInput(htlcTransId, vout, 0xfffffffe);
  txb.addOutput(destination, satoshi - 400);
  var tx = txb.buildIncomplete();
  return tx;
}

module.exports = {BitcoinTest/*htlc, toDigest, alice, bob, tx, redeemScript*/};
