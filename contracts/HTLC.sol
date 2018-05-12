contract HTLC {
    bytes32 public digest;
    address public dest;
    uint256 public unlockAtTime;
    address issuer = msg.sender;

    event Claim(string _hash);

    function HTLC(bytes32 _digest, address _dest, uint256 _hoursLocked) public {
        digest = _digest;
        dest = _dest;
        unlockAtTime = now + (_hoursLocked * 1 hours);
    }
    
    function claim(string _hash) public returns(bool result) {
       if(digest != sha256(_hash)){
           throw;
       }
       Claim(_hash);
       suicide(dest);
       return true; //This will not be called
    }

    function refund() public returns(bool result) {
        if(now < unlockAtTime || msg.sender != issuer){
            throw;
        }
        suicide(issuer);
        return true;
    }
    
    function remaining() constant public returns(uint256 time){
        return unlockAtTime - now;
    }
}
