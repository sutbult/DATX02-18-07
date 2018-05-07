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
  var buyerPrivkey = await getPrivateKey();
  var buyerECPair = bitcoinjs.ECPair.fromWIF(buyerPrivkey, bitcoinjs.networks.testnet);
  var buyerPublicKeyBuffer = buyerECPair.getPublicKeyBuffer();
  //seller creates contract
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16592');
  var balance = await getBalance();
  console.log(balance);
  var privkey = await getPrivateKey();
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

async function send(selPubKey, digest, buyPubKey, btc, timeout) {
  var htlc = await createHTLC(digest, selPubKey, buyPubKey, timeout, this.network);
  var txid = await sendToHTLC(htlc.address, btc);
  return txid;
}

async function validate() {
  return true;
}

function BitcoinTest(host, port) {
  Bitcoin(host, port, bitcoinjs.networks.testnet);
}

function Bitcoin(host, port, network) {
  var currency = new Currency.construct(getBalance, send, validate, redeemAsSeller, checkForSecret, unlockAccount, bla);
  var config = {};
  config.protocol = 'http';
  config.host = host;
  config.port = port;
  currency.config = config;
  currency.network = network;
}

function bla() {
  return this.config;
}

//first to hex, then split into twos and then reverse and get it back into chars
// main();


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

function getPrivateKey() {
  return new Promise((resolve, reject) => {
    this.rpc.getNewAddress((err1, addr) => {
      if (err1) {
        resolve(err1);
      } else {
        this.rpc.dumpPrivKey(addr.result.toString(), (err2, priv) => {
          if (err2) {
            reject(err2)
          } else {
            resolve(priv.result)
          }
        });
      }
    });
  });
}
// test();
async function test() {
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var something = await checkForSecret('mhK2UW65ffGoUr3irFYovwjfByEaBYwLuQ', 2);
  console.log("something");
  console.log(something);
}

// TODO:
//get address from transaction instead of having it right away
async function checkForSecret(compareAddress, numBlocks) {
  result = {'secret': '', found: false}
  return new Promise(async function(resolve, reject) {
    this.rpc.getBestBlockHash(async function(err1, ret1) {
      if (err1) {
        reject(err1);
      } else {
        let currentBlock = ret1.result;
        for (var i = 0; i < numBlocks; i++) {
          var txPrev = await getBlockTxsAndPrev(currentBlock);
          let secretJson = await findSecretInBlock(txPrev.txs, compareAddress);
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

async function findSecretInBlock(txs, compareAddress) {
  var result = {'secret': '', 'found': false};
  return new Promise(async function(resolve, reject) {
    for (var i = 0; i < txs.length; i++) {
      var transaction = await getRawTransactionObject(txs[i]);
      var scriptSig = transaction.vin[0].scriptSig;
      if (scriptSig !== undefined) {
        if (transaction.vout[0].scriptPubKey.addresses[0] == compareAddress) {
          result.found = true;
          result.secret = extractSecret(scriptSig.asm);
          resolve(result);
        }
      }
    }
    resolve(result);
  });
}

// extractSecret('3045022100e8f2dac1d3188c5f748102a810e592337bf94ce4c93324c1d204630c0e88f505022069d52b8f2622d4d2bbb97ebe242dee01f34a896e9e1a214dc4748369db71a74d[ALL] 02d2190cb746f1b51a7f83e8371aa90b76fcf461c2f9c54e8ff1ffa01d9f7710e4 1634362728 1 63a82053718f4f064c43e6b13f74ab0dc10745b958bde7d938531cb5cc4afd745709d78876a91448070dfcbf9586fe8a2863ba66aa18d28dc9d99b67029701b17576a914184eaa29e57787be8ac75328784aa18c570d29a36888ac');
// extractSecret('3044022071e65dcd657579556b02e88192b7b9a1a98f8c8f9aab927c22cbfd2dbd2d3776022001bc3333d62baac5e482719b471b3a57c1859cf1ba9f8bc82e050ee416bca665[ALL] 0389e6c5984155275b70b978fc26e0aecdf253a8a9c4cdc47108afc4cf45575dab 12337 1 63a8204a44dc15364204a80fe80e9039455cc1608281820fe2b24f1e5233ade6af1dd58876a9148202efafd6b7b249445ba0398f9fce27fb2a8d3b67028f01b17576a914b4349cd9d2d570376d3ab1d0857de8d6745cfd986888ac');
// extractSecret('304402207521729dff2dd1fe38c63122c882a2b1a2a740e5ff1c5768a60831a4b81c0e6802204b96b576a4b25b4c10c82ee8a62693a370ed7dcfc2a8be1fc37c05d3d6f4b9df[ALL] 0275374631c2ed89a8e15fb9b491347b390af23e233294e1308847dc920e40dc47 3552822 1 63a820c7e616822f366fb1b5e0756af498cc11d2c0862edcb32ca65882f622ff39de1b8876a91445d6d1d7179bf69c153bec098840b2186911131e67028a01b17576a9142c16495307f014fa83e8ea44328459c24e446fe86888ac');

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

async function htlcAddress(digest, selPubKeyBuf,  buyPubKeyBuf, timeoutOffset, network) {
  var hashType = bitcoinjs.Transaction.SIGHASH_ALL;
  var timeout = await generateTimeout(timeoutOffset);
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
  console.log('htlc');
  console.log(digest);
  console.log(sellerPublicKeyBuffer);
  console.log(buyerPublicKeyBuffer);
  console.log(timeout);
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

// TODO: get Destination
// TODO: get amount from Transaction
async function redeemAsSeller(preImageHash, htlcTransId, sellerECPair,  /*destination, btc,*/ redeemScript) {
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
