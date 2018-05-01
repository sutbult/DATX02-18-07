pragma solidity ^0.4.23;

contract HTLC {
    bytes32 public digest;
    address public dest;
    uint256 public unlockAtTime;
    address issuer = msg.sender;

    modifier onlyIssuer {require(msg.sender == issuer); _; }

    event Claim(string _hash);

    constructor (bytes32 _digest, address _dest, uint256 _hoursLocked) public payable {
        digest = _digest;
        dest = _dest;
        unlockAtTime = now + (_hoursLocked * 1 hours);
    }
    
    function claim(string _hash) public returns(bool result) {
       require(digest == sha256(_hash));
       emit Claim(_hash);
       selfdestruct(dest);
       return true; //This will not be called
       }

    // allow payments
    function () public payable {}

    function refund() onlyIssuer public returns(bool result) {
        require(now >= unlockAtTime);
        selfdestruct(issuer);
        return true;
    }
    
    function remaining() constant public returns(uint256 time){
        return unlockAtTime - now;
    }
}
