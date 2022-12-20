// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;
import "./Token.sol";


contract Crowdsale {
    address payable[] public investors;
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;
    uint256 public openingTime;
    uint256 public closingTime;
    uint256 public cap;
    bool public isFinalized = false;
    uint256 public etherRaised;

    //constructor(Token _token,uint256 _price,uint256 _maxTokens,uint256 _openingTime,uint256 _closingTime,uint256 _cap){
    constructor(Token _token,uint256 _price,uint256 _openingTime,uint256 _closingTime,uint256 _cap){
       token = _token; 
       price = _price;
       //maxTokens = _maxTokens;
       openingTime = _openingTime;
       closingTime = _closingTime;
       cap = _cap;
       owner = msg.sender;
    }
    // This mapping is track the ether deposited by investor (use to refund)
    mapping(address =>uint256) public deposit;

    event Buy(uint256 amount,address Buyer);
    event Finalize(uint256 tokensSold,uint256 ethRaised);

    modifier onlyOwner(){
        require(msg.sender == owner,"caller must be owner");
        _;
    }

    modifier onlyWhileOpen {
        // console.log(block.timestamp);
        require(block.timestamp >= openingTime && block.timestamp <= closingTime);
    _;
  }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount);
    }

    //function buyTokens(uint256 _amount) public payable  {
    function buyTokens(uint256 _amount) public payable onlyWhileOpen {
        require(msg.value==(_amount/1e18)*price);
        deposit[msg.sender]+=msg.value;
        investors.push(payable(msg.sender));
        etherRaised+=msg.value;
        
        token.transfer(msg.sender,_amount);
        //require(token.balanceOf(address(this))>=_amount);
        tokensSold+=_amount;
        emit Buy(_amount,msg.sender);
    }

    function finalize() public onlyOwner{
        require(!isFinalized);
        require(hasClosed());
        uint256 remainingTokens = token.balanceOf(address(this));
        token.transfer(owner,remainingTokens);

        uint256 value = address(this).balance;
        (bool sent,) = owner.call{value:value}(" ");
        require(sent);

        emit Finalize(tokensSold, value);

        isFinalized = true;
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

     function hasClosed() public view returns (bool) {
        //require(etherRaised == cap, "not met the fundraising goal");
        return block.timestamp > closingTime;
    }

    function goalReached() public view returns(bool){
        return etherRaised >= cap;
    }

    // function refundInvestor(address payable _investor) public onlyOwner{
    //     uint256 depositedAmount = deposit[_investor];
    //     deposit[_investor] = 0;
    //     _investor.transfer(depositedAmount);
    // }

    function finalization() internal onlyOwner{
        if(goalReached()){
           finalize();
        }else{
            refundInvestors();
        }

    }

    function refundInvestors() public onlyOwner{
       
        for(uint i = 0; i < investors.length; i++){
		uint256 depositedAmount = deposit[investors[i]];
        deposit[investors[i]] = 0;
        investors[i].transfer(depositedAmount);
		}
        
    }

}



