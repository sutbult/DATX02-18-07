pragma solidity ^0.4.17;

contract HTLC {
    bytes32 public digest;
    address public dest;
    uint256 public unlockAtBlock;
    uint256 public numBlocksLocked = 1000;
    address issuer = msg.sender;

    modifier onlyIssuer {require(msg.sender == issuer); _; }

    event Claim(string _hash);

    constructor (bytes32 _digest, address _dest) public payable {
        digest = _digest;
        dest = _dest;
        unlockAtBlock = block.number + numBlocksLocked;
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
        require(block.number >= unlockAtBlock);
        selfdestruct(issuer);
        return true;
    }
}
