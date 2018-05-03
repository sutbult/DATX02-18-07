pragma solidity ^0.4.18;

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

    modifier onlyIssuer {require(msg.sender == issuer); _; }

    event Claim(string _hash);

    function HTLC_ERC20(bytes32 _digest, address _dest, address _token, uint256 _hoursLocked) public payable {
        digest = _digest;
        dest = _dest;
        token = _token;
        unlockAtTime = now + (_hoursLocked * 1 hours);
    }

    function claim(string _hash) public returns(bool result) {
       require(digest == sha256(_hash));
       transfer(dest);
       Claim(_hash);       
       selfdestruct(dest);
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
    
    function refund() onlyIssuer public returns(bool result) {
        require(now >= unlockAtTime);
        transfer(issuer);
        selfdestruct(issuer);
        return true;
    }
}

