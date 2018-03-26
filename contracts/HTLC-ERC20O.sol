pragma solidity ^0.4.17;

contract ERC20Partial {
    mapping (address => uint256) public balanceOf;    
    function transfer(address _to, uint _value) public returns (bool success);
    event Transfer(address indexed _from, address indexed _to, uint _value);
}

contract HTLC_ERC20O {

////////////////
//Global VARS//////////////////////////////////////////////////////////////////////////
//////////////

    string public version = "0.0.1";
    bytes32 public digest;
    address public dest;
    address private token;
    uint public timeOut = 0;
    address issuer;

/////////////
//MODIFIERS////////////////////////////////////////////////////////////////////
////////////


    modifier onlyIssuer {require(msg.sender == issuer); _; }

    event Claim(string _hash);

//////////////
//Operations////////////////////////////////////////////////////////////////////////
//////////////

    function HTLC_ERC20O(bytes32 _digest, address _token, address _issuer) public {
        digest = _digest;
        token = _token;
        issuer = _issuer;
    }

/* public */
    //a string is subitted that is hash tested to the digest; If true the funds are sent to the dest address and destroys the contract
    function claim(string _hash) public returns(bool result) {
       require(digest == keccak256(_hash));
       transfer(dest);
       Claim(_hash);       
       selfdestruct(dest);
       return true; //This will not occur
       }

    function transfer(address _to) internal {
        ERC20Partial e = ERC20Partial(token);
        e.transfer(_to, e.balanceOf(this));
    } 
    
    function addressToken() constant public returns (address) {
        return token;
    }
    
    function balanceOf() constant public returns (uint256) {
        ERC20Partial e = ERC20Partial(token);
        return e.balanceOf(this);
    }
    
    function lock() public {
        assert(!isLocked());      
        dest = msg.sender;
        timeOut = now + 1 hours;
    }
    
    function isLocked() constant public returns (bool) {
        return now >= timeOut;
    }

/* only issuer */
    //if the time expires; the issuer can reclaim funds and destroy the contract
    function refund() onlyIssuer public returns (bool result) {
        require(now >= timeOut);
        transfer(issuer);
        selfdestruct(issuer);
        return true;
    }
}
