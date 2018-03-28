//1st: Bud och egen address.
//2nd: accept bid, skickar sin egen adress.
//1st: lägger upp ett kontrakt, skickar digest och konstraktsadress.
//2nd: skickar konstraktsadress


//pushBid that then creates channel that user listens to
//person that accepts bid also listens to channel

//function init() {
//}

//Call pushBid(channel) when bid has been pushed to database
function pushBid(channel) {
  //EmbarkJS.Messages.listenTo({channel}).then( function(msg) {
    //if first message, notify user to set.up contact and send contract info to the same channel
  //} );
}

function acceptBid(ownAddress, channel) {
  //EmbarkJS.Messages.sendMessage({topic: channel, data: ownAddress});
  //notify database to remove bid
  //listenTo
  //EmbarkJS.Messages.listenTo({channel}).then( function(msg) {
    //if Contact is setUp, tell user to send Contract Address
  //} );
}

function sendDigestInfo(digest, contractAddress, channel) {
    //EmbarkJS.Messages.sendMessage({topic: channel, data: {digest: digest, contractAddress: contractAddress} });
}

function sendContractInfo(contractAddress, channel) {
  //EmbarkJS.Messages.sendMessage({topic: channel, data: contractAddress});
}
