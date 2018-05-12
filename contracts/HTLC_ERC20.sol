contract ERC20Partial {
    mapping (address => uint256) public balanceOf;
    function name() public returns (string);
    function symbol() public returns (string);
    
    function transfer(address _to, uint _value) public returns (bool success);
    event Transfer(address indexed _from, address indexed _to, uint _value);
}

contract HTLC_ERC20 {
    bytes32 public digest;
    address public dest;
    address public token;
    uint256 public unlockAtTime;
    address issuer = msg.sender;
    event Claim(string _hash);

    function HTLC_ERC20(bytes32 _digest, address _dest, address _token, uint256 _secondsLocked) public {
        digest = _digest;
        dest = _dest;
        token = _token;
        unlockAtTime = now + _secondsLocked;
    }

    function claim(string _hash) public returns(bool result) {
       if(digest != sha256(_hash)){
           throw;
       }
       transfer(dest);
       Claim(_hash);       
       suicide(dest);
       return true; //This will not occur
    }

    function transfer(address _to) internal {
        ERC20Partial e = ERC20Partial(token);
        e.transfer(_to, e.balanceOf(this));
    } 
    
    function balanceOf() constant public returns (uint256) {
        ERC20Partial e = ERC20Partial(token);
        return e.balanceOf(this);
    }
    
    function refund() public returns(bool result) {
        if(msg.sender != issuer || now < unlockAtTime){
            throw;
        }
        transfer(issuer);
        suicide(issuer);
        return true;
    }
}

