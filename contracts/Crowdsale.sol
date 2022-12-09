// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.9;
import "./Token.sol";


contract Crowdsale {
    address public owner;
    Token public token;
    uint256 public price;
    uint256 public maxTokens;
    uint256 public tokensSold;

    constructor(Token _token,uint256 _price,uint256 _maxTokens){
       token = _token; 
       price = _price;
       maxTokens = _maxTokens;
       owner = msg.sender;
    }

    event Buy(uint256 amount,address Buyer);
    event Finalize(uint256 tokensSold,uint256 ethRaised);

    modifier onlyOwner(){
        require(msg.sender == owner,"caller must be owner");
        _;
    }

    receive() external payable {
        uint256 amount = msg.value / price;
        buyTokens(amount);
    }

    function buyTokens(uint256 _amount) public payable {
        require(msg.value==(_amount/1e18)*price);
        token.transfer(msg.sender,_amount);
        require(token.balanceOf(address(this))>=_amount);
        tokensSold+=_amount;
        emit Buy(_amount,msg.sender);
    }

    function finalize() public onlyOwner{
        uint256 remainingTokens = token.balanceOf(address(this));
        token.transfer(owner,remainingTokens);

        uint256 value = address(this).balance;
        (bool sent,) = owner.call{value:value}(" ");
        require(sent);

        emit Finalize(tokensSold, value);
    }

    function setPrice(uint256 _price) public onlyOwner {
        price = _price;
    }

}



