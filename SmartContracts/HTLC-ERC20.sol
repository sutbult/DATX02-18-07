pragma solidity ^0.4.18;

contract ERC20Partial {
    mapping (address => uint256) public balanceOf;
    function name() public returns (string);
    function symbol() public returns (string);
    
    function transfer(address _to, uint _value) public returns (bool success);
    event Transfer(address indexed _from, address indexed _to, uint _value);
}

contract HTLC {

////////////////
//Global VARS//////////////////////////////////////////////////////////////////////////
//////////////

    string public version = "0.0.1";
    bytes32 public digest;
    address public dest;
    address private token;
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

    function HTLC(bytes32 _digest, address _dest, address _token) public payable {
        digest = _digest;
        dest = _dest;
        token = _token;
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

/* only issuer */
    //if the time expires; the issuer can reclaim funds and destroy the contract
    function refund() onlyIssuer public returns(bool result) {
        require(now >= timeOut);
        transfer(issuer);
        selfdestruct(issuer);
        return true;
    }
}

