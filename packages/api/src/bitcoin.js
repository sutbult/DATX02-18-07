var bitcoinjs = require('bitcoinjs-lib')
var OPS = require('bitcoin-ops')
var bcrypto = bitcoinjs.crypto
var base58check = require('bs58')
var bip65 = require('bip65')
var RpcClient = require('bitcoind-rpc');


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
  var htlc = await createHTLC("heja", buyerPublicKeyBuffer, 10, bitcoinjs.networks.testnet);
  // var ok = await htlcAddress(htlc.digest, sellerECPair.getPublicKeyBuffer(), htlc.buyerPublicKeyBuffer, 10, bitcoinjs.networks.testnet);
  //buyer verifies contract and sends funds to it
  BitcoinClient('bitcoinrpc', 'password', '127.0.0.1', '16593');
  var balance = await getBalance();
  console.log(balance);
  var ok = await verifyHTLC(htlc.digest, htlc.sellerPublicKeyBuffer, buyerPublicKeyBuffer, 10, bitcoinjs.networks.testnet, htlc.address);
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
    setTimeout(async function() {
      var redeem = await redeemAsSeller(htlc.sellerECPair, "heja", txid, bitcoinjs.networks.testnet, result.timeout, address, 10000000, htlc.htlc.redeemScript);
      console.log(redeem);
    }, 10000);

  }
}

//first to hex, then split into twos and then reverse and get it back into chars
var rpc;
// main();

// let htlcTransactionObject = {};
var htlcTransactionObject = new Object();

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

function getAddress() {
  return new Promise((resolve, reject) => {
    rpc.getNewAddress((err, ret) => {
      if (err) {
        reject(err)
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
  console.log(transId);
  return new Promise(async function(resolve, reject) {
    var transaction = await getRawTransactionObject(transId);
    var vout = transaction.vout[0].n;
    resolve(vout);
  });
}

async function getRawTransactionObject(transId) {
  console.log(transId);
  return new Promise((resolve, reject) => {
    rpc.getRawTransaction(transId, (err, ret) => {
      if (err) {
        console.log("error happened!");
        reject(err);
      }
      console.log(ret);
      var rawTransaction = ret.result;
      rpc.decodeRawTransaction(rawTransaction, (err1, ret1) => {
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
    rpc.getNewAddress((err1, addr) => {
      if (err1) {
        resolve(err1);
      } else {
        // resolve(addr.result.toString())
        // console.log(addr);
        rpc.dumpPrivKey(addr.result.toString(), (err2, priv) => {
          if (err2) {
            reject(err2)
          } else {
            // console.log(priv);
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
  var something = await checkForSecret('mhK2UW65ffGoUr3irFYovwjfByEaBYwLuQ', 1);
  console.log("something");
  console.log(something);
}

async function checkForSecret(compareAddress, numBlocks) {
  result = {'secret': '', found: false}
  return new Promise(async function(resolve, reject) {
    rpc.getBestBlockHash(async function(err1, ret1) {
      if (err1) {
        reject(err1)
      } else {
        let currentBlock = ret1.result;
        for (var i = 0; i < numBlocks; i++) {
          var txPrev = await getBlockTxsAndPrev(currentBlock);
          let secretJson = await findSecretInBlock(txPrev.txs, compareAddress);
          console.log("secretJson");
          console.log(secretJson);
          if (secretJson.found) {
            //convert secret
            console.log("secret found!");
            result.found = true;
            result.secret = secretJson.secret;
            resolve(secretJson.secret)
          } else {
            currentBlock = txPrev.prev;
          }
        }
      }
    });
  });
}

extractSecret('3045022100e8f2dac1d3188c5f748102a810e592337bf94ce4c93324c1d204630c0e88f505022069d52b8f2622d4d2bbb97ebe242dee01f34a896e9e1a214dc4748369db71a74d[ALL] 02d2190cb746f1b51a7f83e8371aa90b76fcf461c2f9c54e8ff1ffa01d9f7710e4 1634362728 1 63a82053718f4f064c43e6b13f74ab0dc10745b958bde7d938531cb5cc4afd745709d78876a91448070dfcbf9586fe8a2863ba66aa18d28dc9d99b67029701b17576a914184eaa29e57787be8ac75328784aa18c570d29a36888ac');
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
    rpc.getBlock(blockhash, 1, (err, ret) => {
      if (err) {
        reject(err)
      } else {
        result.txs = ret.result.tx;
        result.prev = ret.result.previousblockhash;
        resolve(result);
      }
    });
  });;
}

async function findSecretInBlock(txs, compareAddress) {
  console.log('compareAddress');
  console.log(compareAddress);
  console.log("transactions");
  console.log(txs);
  var result = {'secret': '', 'found': false};
  return new Promise(async function(resolve, reject) {
    console.log('hello');
    for (var i = 0; i < txs.length; i++) {
      // console.log('hhe');
      // console.log(txs[i]);
      var transaction = await getRawTransactionObject(txs[i]);
      // console.log('transaction');
      // console.log(transaction);
      console.log('address');
      console.log(transaction.vout[0].scriptPubKey.addresses[0]);
      var scriptSig = transaction.vin[0].scriptSig;
      if (scriptSig !== undefined) {
        console.log('scriptSig');
        console.log(scriptSig);
        console.log(scriptSig.asm);
        if (transaction.vout[0].scriptPubKey.addresses[0] == compareAddress) {
          result.found = true;
          result.secret = scriptSig.asm;
          console.log("fOUND IT");
          console.log(transaction.vin[0].scriptSig.asm);
          resolve(result);
        }
      }
    }
  });
}

function toDigest(secret){
  return bcrypto.sha256(secret);
}

// var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet);
// console.log(alice.getPublicKeyBuffer());


function sendToHTLC(address, btc) {
  return new Promise((resolve, reject) => {
    rpc.sendToAddress(address, btc, (err, ret) => {
      if (err) {
        reject(err);
      } else {
        resolve(ret.result);
      }
    })
  });
}

async function generateTimeout(timeoutBlocks) {
  return new Promise((resolve, reject) => {
    rpc.getBlockCount((err, ret) => {
      if (err) {
        reject("Couldn't get current block count");
      }
      var timeout = bip65.encode({ blocks: (ret.result + timeoutBlocks)});
      resolve(timeout);
    });
  });
}

// function sendToHTLC(secret, sellerPublicKeyBuffer, btc) {
//   getPrivateKey().then((privkey) => {
//     this.htlcTransactionObject = createHTLCTransactionObject(secret, privkey,
//       sellerPublicKeyBuffer, bitcoinjs.networks.testnet);
//     rpc.sendToAddress("2N1aStg5sVBrxbNNcuCYz72TtZtAGrDNNju" /*this.htlcTransactionObject.address*/, btc, (err, ret) => {
//       if (err) {
//         console.log(err);
//       } else {
//         this.htlcTransactionObject.txid = ret.result;
//         setHTLCTrans("txid", ret.result);
//         rpc.getTransaction(this.htlcTransactionObject.txid, (err2, ret2) => {
//           if (err2) {
//             console.log(err2);
//           } else {
//             this.htlcTransactionObject.vout = ret2.result.details[0].vout;
//             // console.log(ret2);
//             console.log("htlc inside " + JSON.stringify(this.htlcTransactionObject));
//             console.log(bitcoinjs.script.decompile(this.htlcTransactionObject.redeemScript));
//           }
//         });
//         // console.log(ret);
//       }
//     });
//   });
//
// }

// sendToHTLC(undefined, undefined, 0.2);
// console.log("htlc " + this.htlcTransactionObject);

// function for sending to htlc address and adding id and stuff to htlcTransactionObject
// htlcTransactionObject global object?
// function for uploading and sending to htlc calls function above and htlcTransactionObject


// TODO: Make sure that selPubKeyBuf is one of the seller's actual keys or have it saved in a file?
// TODO: One block might have been mined between creation of address and verification so remove one timeoutBlocks and check again if regular fails?
async function verifyHTLC(digest, selPubKeyBuf, buyPubKeyBuf, timeoutBlocks, network, compareAddress) {
  // generate htlcAddress and make sure it matches htlcAddress
  var htlc = await htlcAddress(digest, selPubKeyBuf, buyPubKeyBuf, timeoutBlocks, network);
  var address = htlc.address;
  // return address + "\n" + compareAddress;
  // console.log(address);
  return address === compareAddress;
}

async function createHTLC(secret, buyPubKeyBuf, timeoutBlocks, network) {
  // get private key ECPair and call htlcAddress
  var result = {};
  var privkey = await getPrivateKey();
  var sellerECPair = bitcoinjs.ECPair.fromWIF(privkey, network);
  var selPubKeyBuf = sellerECPair.getPublicKeyBuffer();
  var digest = toDigest(secret);
  var htlc = await htlcAddress(digest, selPubKeyBuf, buyPubKeyBuf, timeoutBlocks, network);
  result.sellerECPair = sellerECPair;
  result.digest = digest;
  result.sellerPublicKeyBuffer = selPubKeyBuf;
  result.address = htlc.address;
  result.htlc = htlc;
  result.timeout = htlc.timeout;
  return result;
}

async function htlcAddress(digest, selPubKeyBuf,  buyPubKeyBuf, timeoutBlocks, network) {
  var hashType = bitcoinjs.Transaction.SIGHASH_ALL;
  var timeout = await generateTimeout(timeoutBlocks);
  return new Promise(function(resolve, reject) {
    result = {};
    var redeemScript = htlc(digest, selPubKeyBuf, buyPubKeyBuf, timeout);
    var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
    var address = bitcoinjs.address.fromOutputScript(scriptPubKey, network);
    result.timeout = timeout;
    result.redeemScript = redeemScript;
    result.scriptPubKey = scriptPubKey;
    result.address = address;
    resolve(result);
  });

  // //dump private key for alice or get fromWIF some other way?
  // var alice = bitcoinjs.ECPair.fromWIF('cRuoxDPY2ku1LjANJJMBUjqWYejYnF5MwmzbWsAs7i1uoVSqCmzH', bitcoinjs.networks.testnet); //Use your own key!
  // //receive bobs fromWif as an arugment
  // var bob = bitcoinjs.ECPair.fromWIF('cRgLkMozC74fjazThBBQipMyk8yyL5z3NeDYe5pQ9ckhyo4Q7kCj', bitcoinjs.networks.testnet); //Use your own key!
  // var secret = "1"
  // // Get current block and add timeoutBlocks to that
  // var timeout = bip65.encode({ blocks: 110 }) //The block where you can refund the transaction after (in absolute value; check current block height)
  // result.timeout = timeout;
  // // var redeemScript = htlc(bcrypto.sha256(secret), alice.getPublicKeyBuffer(), bob.getPublicKeyBuffer(), timeout);
  // var redeemScript = htlc(digest, sellerPublicKeyBuffer, buyerPublicKeyBuffer, timeout);
  // result.redeemScript = redeemScript;
  // var scriptPubKey = bitcoinjs.script.scriptHash.output.encode(bitcoinjs.crypto.hash160(redeemScript));
  // var address = bitcoinjs.address.fromOutputScript(scriptPubKey, bitcoinjs.networks.testnet);
  // result.address = address;
  // console.log(address);
  // return result;
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
    // bcrypto.hash160(seller.getPublicKeyBuffer()), we don't know the other person's private key...
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

async function redeemAsBuyer(buyerECPair, network, htlcTransId, timeout, destination, btc, redeemScript) {
  var tx = await buildReedemTransaction(htlcTransId, network, timeout,
    destination, btc);
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    buyerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    buyerECPair.getPublicKeyBuffer(),
    bitcoinjs.opcodes.OP_FALSE
  ], redeemScript);
  tx.setInputScript(0, redeemScriptSig);
  return new Promise(function(resolve, reject) {
    rpc.sendRawTransaction(tx, true, (err, ret) => {
      if (err) {
        reject(err);
      }
      resolve(ret.result);
    });
  });
}
//
async function redeemAsSeller(sellerECPair, secret, htlcTransId, network, timeout, destination, btc, redeemScript) {
  console.log("Inside redeemAsSeller");
  var tx = await buildReedemTransaction(htlcTransId, network, timeout,
    destination, btc);
  console.log(tx);
  console.log(Buffer.from(secret).toString('hex'));
  var signatureHash = tx.hashForSignature(0, redeemScript, bitcoinjs.Transaction.SIGHASH_ALL);
  var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
    sellerECPair.sign(signatureHash).toScriptSignature(bitcoinjs.Transaction.SIGHASH_ALL),
    sellerECPair.getPublicKeyBuffer(),
    // Buffer.from("1"), //This is the secret
    Buffer.from(secret),
    bitcoinjs.opcodes.OP_TRUE
  ], redeemScript);
  tx.setInputScript(0, redeemScriptSig);
  console.log("tx");
  console.log(tx.toHex());
  return new Promise(function(resolve, reject) {
    rpc.sendRawTransaction(tx.toHex(), true, (err, ret) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      console.log(ret);
      resolve(ret.result);
    });
  });
}

async function buildReedemTransaction(htlcTransId, network, timeout, destination, btc) {
  console.log(htlcTransId);
  return new Promise(async function(resolve, reject) {
    var vout = await voutFromTransaction(htlcTransId);
    var txb = new bitcoinjs.TransactionBuilder(network);
    // txb.setLockTime(0);
    txb.addInput(htlcTransId, vout, 0xfffffffe);
    txb.addOutput(destination, btc - 400);
    var tx = txb.buildIncomplete();
    console.log(tx);
    resolve(tx);
  });
}
  // // var txb = new bitcoinjs.TransactionBuilder(bitcoinjs.networks.testnet);
  //
  // // txb.setLockTime(timeout) //Transaction needs to have the appropriate locktime
  // // txb.addInput("0c09009f269f682d08cc53abae0b466409c55b95922e08d8a9edbef68de37fbf", 0, 0xfffffffe); //First argument is transaction ID of tx to P2SH address, second vout, third sequence
  // // txb.addOutput("2N6dyyk1a3L6keV5EENZe9jvf5NuXfjPuU2", 9e8); //First argument is destination for money and second is the amount
  // var txb = new bitcoinjs.TransactionBuilder(network);
  // txb.setLockTime(timeout);
  // txb.addInput(htlcTransId, vout, 0xfffffffe);
  // txb.addOutput(destination, btc);
  //
  // var tx = txb.buildIncomplete();
  //
  // // var signatureHash = tx.hashForSignature(0, htlcTransObj.redeemScript, htlcTransObj.hashType);
  // // var redeemScriptSig = bitcoinjs.script.scriptHash.input.encode([ //This whole thing is the stack that will run through the script
  // //   bob.sign(signatureHash).toScriptSignature(hashType),
  // //   bob.getPublicKeyBuffer(),
  // //   //Buffer.from("1"), //This is the secret
  // //   //bitcoinjs.opcodes.OP_TRUE
  // //   bitcoinjs.opcodes.OP_FALSE
  // // ], redeemScript)
  //
  // tx.setInputScript(0, redeemScriptSig);
  //
  // console.log(bitcoinjs.script.decompile(redeemScript));
  // console.log(bcrypto.hash160(alice.getPublicKeyBuffer()).toString('hex'));


module.exports = {htlcTransactionObject/*htlc, toDigest, alice, bob, tx, redeemScript*/};
