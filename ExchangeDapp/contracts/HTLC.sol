// Hashed Time-Locked Contract transactions
// HashTimelocked contract for cross-chain atomic swaps
// @authors:
// Cody Burns <dontpanic@codywburns.com>
// license: Apache 2.0

/* usage:
Victor (the "buyer") and Peggy (the "seller") exchange public keys and mutually agree upon a timeout threshold.
    Peggy provides a hash digest. Both parties can now
        - construct the script and P2SH address for the HTLC.
        - Victor sends funds to the P2SH address or contract.
Either:
    Peggy spends the funds, and in doing so, reveals the preimage to Victor in the transaction; OR
    Victor recovers the funds after the timeout threshold.

Victor is interested in a lower timeout to reduce the amount of time that his funds are encumbered in the event that Peggy
does not reveal the preimage. Peggy is interested in a higher timeout to reduce the risk that she is unable to spend the
funds before the threshold, or worse, that her transaction spending the funds does not enter the blockchain before Victor's
but does reveal the preimage to Victor anyway.

script hash from BIP 199: Hashed Time-Locked Contract transactions for BTC like chains

OP_IF
    [HASHOP] <digest> OP_EQUALVERIFY OP_DUP OP_HASH160 <seller pubkey hash>
OP_ELSE
    <num> [TIMEOUTOP] OP_DROP OP_DUP OP_HASH160 <buyer pubkey hash>
OP_ENDIF
OP_EQUALVERIFY
OP_CHECKSIG

*/


pragma solidity ^0.4.17;

contract HTLC {

////////////////
//Global VARS//////////////////////////////////////////////////////////////////////////
//////////////

    string public version = "0.0.1";
    bytes32 public digest;
    address public dest;
    uint public timeOut = now + 1 hours;
    address issuer = msg.sender;

/////////////
//MODIFIERS////////////////////////////////////////////////////////////////////
////////////


    modifier onlyIssuer {require(msg.sender == issuer); _; }

    event Claim(string _hash);

//////////////
//Operations////////////////////////////////////////////////////////////////////////
//////////////

    function HTLC(bytes32 _digest, address _dest) public payable {
        digest = _digest;
        dest = _dest;

    }

/* public */
    //a string is subitted that is hash tested to the digest; If true the funds are sent to the dest address and destroys the contract
    function claim(string _hash) public returns(bool result) {
       require(digest == sha256(_hash));
       selfdestruct(dest);
       Claim(_hash);
       return true;
       }

    // allow payments
    function () public payable {}

/* only issuer */
    //if the time expires; the issuer can reclaim funds and destroy the contract
    function refund() onlyIssuer public returns(bool result) {
        require(now >= timeOut);
        selfdestruct(issuer);
        return true;
    }
}
