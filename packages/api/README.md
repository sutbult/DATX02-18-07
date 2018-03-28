# OrbitDBHandler.js
This readme specifies the steps needed to complete a transaction with the help of OrbitDBHandler.js.

## 4 Step process
User A is the user that publishes the bid first.
User B is the user that accepts the bid.

The transaction needs to go through a 4 step process:
Step 1: User A publishes their bid to the main database. User A also creates a new channel and publishes the address to it.
Step 2: User B accepts the bid. User B also publishes their own address to the new channel.
Step 3: User A creates a new contract and pushes the digest and contract address to the new channel.
Step 4: User B pushes the contract address to the new channel.

### Step 1
User A adds a bid through the function addBid(bid, db). User A then waits for User B to complete step 2. After that, User B's address is returned to User A.

bid: 
jsonObject = {
    "step" : "1",
    "from" : {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "to": {
        "currency": "CURRENCY",
        "amount" : "AMOUNT"
    },
    "address" : "adressString"
    "channel" : "Address"
  };

db: currently not in use

### Step 2
User B accepts bid through the function acceptBid(bid). User B publishes their own address to the new channel, and the address of User A is returned. Also in step 2, the client that runs User B must run checkForStep(3) after calling acceptBid(bid).

bid: 
jsonObject = {
      "step" : "2",
      "adress" : adressString,
      "channel" : channelString
    };

### Step 3
User A pushes the digest and contract address to the new channel using the function pushDigestInfo(contractInfo). After that User A waits for User B to complete step 4. User B's contract address is then returned to A.

contractInfo: 
jsonObject = {
      "step" : "3",
      "channel" : channelString,
      "digest" : digestString,
      "contractAddress" : contractAddressString
    };

### Step 4
User B pushes the contract address to the new channel using pushContractInfo(contractInfo).

contractInfo: 
jsonObject = {
      "step" : "4",
      "channel" : channelString,
      "contractAddress" : contractAddressString
    };
