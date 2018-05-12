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
  this.network = bitcoinjs.networks.testnet;
  //buyer sends it public key
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
  var sellerAddrPrivkey = await wallet();
  var secret = "hc";

  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var buyerAddPrivkey = await wallet();
  // console.log("SELLER: " + JSON.stringify(sellerAddrPrivkey));
  // console.log("BUYER: " + JSON.stringify  (buyerAddPrivkey));

  var receipt = await send(buyerAddPrivkey, toDigest(secret), sellerAddrPrivkey.pubkey, 0.1, 10000);
  //seller creates contract
  var balance = await getBalance();
  // console.log('balance');
  // console.log(balance);

  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
  // var sellerAddrPrivkey = await wallet();
  // BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var balance = await getBalance();
  // console.log('balance');
  // console.log(balance);
  var generate = await generateBlock();
  // console.log("generate");
  // console.log(generate);
  // var secret = await checkForSecret('2526cbcf869bb3e555b98d3535fa2b0b1e1c2fcc83002a9b608f1e40413245ad', 10);
  // console.log(secret);
  var message = receipt;
  // console.log("message" + JSON.stringify(message));
  var interval = setInterval(async function() {
    var ok = false;
    try {
      var redeem = await redeemAsSeller(secret, sellerAddrPrivkey, message);
      ok = true;
    } catch(err) {
      // console.log("Got an error");
      // console.log(err);
    }
    if (ok) {
      clearInterval(interval);
    }
    // console.log("redeem" + JSON.stringify(redeem));
    var balance = await getBalance();
    // console.log('balance');
    // console.log(balance);
  }, 10000);

}
async function send(wallet, digest, selPubKey, btc, timeoutOffset) {
  console.log("wallet");
  console.log(wallet);
  console.log("selPubKey");
  console.log(selPubKey);
  console.log(selPubKey.pubkey);

  var rpc = this.rpc;
  var buyPubKey = wallet.pubkey;
  console.log("1");
  var timeout = await generateTimeout.bind(this)(timeoutOffset);
  console.log("2");
    var htlc = await htlcAddress.bind(this)(digest, Buffer.from(selPubKey.pubkey.data), Buffer.from(buyPubKey), timeout, this.network);
  console.log("3");
  var txid = await sendToHTLC.bind(this)(htlc.address, btc/100000000);
  console.log("4");
  receipt = new Object();
  receipt.contractAddress = txid;
  receipt.digest = digest;
  receipt.timelock = timeout;
  return receipt;
}

async function validate() {
  return true;
}

function BitcoinTest(host, port) {
  return Bitcoin(host, port, bitcoinjs.networks.testnet);
}

function Bitcoin(host, port, network) {
  var currency = new Currency.construct(getBalance, send, validate, redeemAsSeller, checkForSecret, unlockAccount, wallet);
  var config = {};
  config.protocol = 'http';
  config.host = host;
  config.port = port;
  currency.config = config;
  currency.network = network;
  return currency;
}

async function wallet() {
  rpc = this.rpc;
  var res = {};
  var addrPriv = await getAddrPrivkeyPair.bind(this)(rpc);
  var privkey = addrPriv.privkey;
  var ECPair = bitcoinjs.ECPair.fromWIF(privkey, this.network);
  var publicKeyBuffer = ECPair.getPublicKeyBuffer();
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
  this.rpc = new RpcClient(config);
}

function DefaultBitcoinClient() {
  var config = {
    // protocol: 'http'
    // user: 'user'
    // pass: 'pass'
    // host: '127.0.0.1'
    // port: '8332'
  };
  rpc = new RpcClient(config);
}

function unlockAccount(user, pass) {
    console.log("UNLOCKING ACCOUNT\n");
  this.config.user = "bitcoinrpc";
  this.config.pass = "password";
  this.rpc = new RpcClient(this.config);
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
  var rpc = this.rpc;
    return new Promise(((resolve, reject) => {
    var result = {'error': '', 'balance': ''};
    if (this.rpc === undefined) {
      result.error = 'RPC needs to be defined';
      resolve(result);
      return;
    }
    rpc.getBalance((err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.result);
      }
    });
    }).bind(this));
}

function getAddress() {
  return new Promise((resolve, reject) => {
    rpc.getNewAddress((err, ret) => {
      if (err) {
          reject(err);
      }
      resolve(ret.result);
    });
  });
}

function generateBlock() {
  return new Promise(function(resolve, reject) {
    rpc.generate(1, (err, ret) => {
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
    return new Promise(((resolve, reject) => {
    rpc.getRawTransaction(transId, (err, ret) => {
      if (err) {
        reject(err);
      }
      var rawTransaction = ret.result;
      rpc.decodeRawTransaction(rawTransaction, (err1, ret1) => {
        if (err1) {
          reject(err1);
        } else {
          resolve(ret1.result);
        }
      });
    });
    }).bind(this));
}

function getAddrPrivkeyPair(rpc) {
  result = {};
    return new Promise(((resolve, reject) => {
    this.rpc.getNewAddress((err1, addr) => {
      if (err1) {
        resolve(err1);
      } else {
        rpc.dumpPrivKey(addr.result.toString(), (err2, priv) => {
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
    }).bind(this));
}

function getPrivkeyFromAddr(addr) {
    return new Promise(((resolve, reject) => {
    this.rpc.dumpPrivKey(addr, (err, priv) => {
      if (err) {
        reject(err);
      } else {
        resolve(priv.result);
      }
    });
    }).bind(this));
}

async function test() {
  this.network = bitcoinjs.networks.testnet;
  console.log('hello');
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var secret = await checkForSecret('367cb024ffafd74ba244a53266ef93e8e45d8f50ff1f7f4b2a46ca9e9a093983', 30);
  console.log("secret");
  console.log(secret);
  console.log("fasfa");
}

async function getAddressFromTransation(txid) {
  rpc.getRawTransaction()
}

async function checkForSecret(txid, numBlocks) {
  var rpc = this.rpc;

  result = {'secret': '', found: false}
    return new Promise((async function(resolve, reject) {

    rpc.getBestBlockHash(async function(err1, ret1) {
      if (err1) {
        reject(err1);
      } else {
        let currentBlock = ret1.result;
        for (var i = 0; i < numBlocks; i++) {
          var txPrev = await getBlockTxsAndPrev.bind(this)(currentBlock);
          let secretJson = await findSecretInBlock.bind(this)(txPrev.txs, txid);
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
    }).bind(this));
}

async function findSecretInBlock(txs, txid) {
  var result = {'secret': '', 'found': false};
    return new Promise((async function(resolve, reject) {
    for (var i = 0; i < txs.length; i++) {
      var transaction = await getRawTransactionObject(txs[i]);
      var scriptSig = transaction.vin[0].scriptSig;
      if (scriptSig !== undefined) {
        if (transaction.vin[0].txid == txid && txs[i] == transaction.hash) {
          result.found = true;
          result.secret = extractSecret(scriptSig.asm);
          resolve(result);
        }
      }
    }
    resolve(result);
    }).bind(this));
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
    return new Promise(((resolve, reject) => {
    this.rpc.getBlock(blockhash, 1, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        result.txs = ret.result.tx;
        result.prev = ret.result.previousblockhash;
        resolve(result);
      }
    });
    }).bind(this));
}

function toDigest(secret){
  return bcrypto.sha256(secret);
}

async function sendToHTLC(address, btc) {
  console.log("btc");
  console.log(btc);
    return new Promise(((resolve, reject) => {
    rpc.sendToAddress(address, btc, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        console.log(ret);
        resolve(ret.result);
      }
    });
    }).bind(this));
}

async function generateTimeoutBlocks(timeoutBlocks) {
    return new Promise(((resolve, reject) => {
    this.rpc.getBlockCount((err, ret) => {
      if (err) {
        reject("Couldn't get current block count");
      }
      var timeout = bip65.encode({ blocks: (ret.result + timeoutBlocks)});
      resolve(timeout);
    });
    }).bind(this));
}

async function generateTimeout(offset) {
    return new Promise(((resolve, reject) => {
    this.rpc.getBestBlockHash((err, ret) => {
      if (err) {
        reject(err);
      } else {
        rpc.getBlock(ret.result, 1, (err1, ret1) => {
          if (err1) {
            reject(err1)
          } else {
            var timeout = bip65.encode({ utc: ret1.result.time + offset});
            resolve(timeout);
          }
        });
      }
    });
    }).bind(this));
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
    return new Promise((function(resolve, reject) {
    result = {};
    var redeemScript = htlc(digest, selPubKeyBuf, buyPubKeyBuf, timeout);
    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
    var address = bitcoinjs.address.fromOutputScript(scriptPubKey, network);
    result.timeout = timeout;
    result.redeemScript = redeemScript;
    result.scriptPubKey = scriptPubKey;
    result.address = address;
    resolve(result);
    }).bind(this));
}

function htlc(digest, sellerPublicKeyBuffer, buyerPublicKeyBuffer, timeout) {
  var text=  bitcoinjs.script.compile //CHECKSQUENCEVERIFY REFUSES TO WORK
  ([
    bitcoinjs.opcodes.OP_IF,
    bitcoinjs.opcodes.OP_SHA256,
    Buffer.from(digest),
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
  console.log("compiled");
  return text;
}

async function redeemAsBuyer(buyerECPair, network, htlcTransId, destination, btc, redeemScript) {
  var tx = await buildReedemTransaction(htlcTransId, network, destination, btc);
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    buyerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    buyerECPair.getPublicKeyBuffer(),
    bitcoinjs.opcodes.OP_FALSE
  ], redeemScript);
  tx.setInputScript(0, redeemScriptSig);
    return new Promise((function(resolve, reject) {
    this.rpc.sendRawTransaction(tx, true, (err, ret) => {
      if (err) {
        reject(err);
      }
      resolve(ret.result);
    });
    }).bind(this));
}

async function redeemAsSeller(preImageHash, wallet, htlcTransId, buyPubKeyBuf, timeout) {
  var rpc = this.rpc;
  var sellerPrivkey = await getPrivkeyFromAddr.bind(this)(wallet.address);
  var sellerECPair = bitcoinjs.ECPair.fromWIF(sellerPrivkey, this.network);
  var selPubKeyBuf = sellerECPair.getPublicKeyBuffer();
  var htlc = await htlcAddress.bind(this)(toDigest(preImageHash), selPubKeyBuf,  buyPubKeyBuf, timeout, this.network);
  var redeemScript = htlc.redeemScript;
  var destination = await getAddress.bind(this)();
  var transObject = await getRawTransactionObject.bind(this)(htlcTransId);
  var satoshi = transObject.vout[0].value*100000000; // multiply with hundred million to get satoshi
  var tx = await buildReedemTransaction.bind(this)(htlcTransId, this.network, destination, satoshi);
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var stack = [ //This whole thing is the stack that will run through the script
    sellerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    sellerECPair.getPublicKeyBuffer(),
    Buffer.from(preImageHash),
    bitcoinjs.opcodes.OP_TRUE
  ];
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode(stack, redeemScript);
  tx.setInputScript(0, redeemScriptSig);
    return new Promise((function(resolve, reject) {
    this.rpc.sendRawTransaction(tx.toHex(), true, (err, ret) => {
      if (err) {
        // console.log(err);
        reject(false);
      } else {
        resolve(true);
      }
    });
    }).bind(this));
}

async function buildReedemTransaction(htlcTransId, network, destination, satoshi) {
  var vout = await voutFromTransaction(htlcTransId);
  var txb = new bitcoinjs.TransactionBuilder(network);
  txb.addInput(htlcTransId, vout, 0xffffffff);
  txb.addOutput(destination, satoshi - 400);
  var tx = txb.buildIncomplete();
  return tx;
}

module.exports = {BitcoinTest/*htlc, toDigest, alice, bob, tx, redeemScript*/};
