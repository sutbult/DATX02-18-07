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
       require(digest == keccak256(_hash));
       Claim(_hash);
       selfdestruct(dest);
       return true; //This will not be called
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
