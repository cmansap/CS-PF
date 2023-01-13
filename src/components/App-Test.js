
import { Container} from "react-bootstrap";
import {ethers} from 'ethers';

// Import Components
import Navigation from "./Navigation.js"
import Info from "./Info.js"
import { useEffect, useState } from "react";

// ABIs
import TOKEN_ABI from '../abis/Token.json'
import CROWDSALE_ABI from '../abis/Crowdsale.json'

// config
import config from '../config.json';

const Test = ()=>{
    const [provider, setProvider] = useState(null)
    const [crowdsale, setCrowdsale] = useState(null)
    const [account,SetAccount] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [accountBalance, setAccountBalance] = useState(0)

    const [price, setPrice] = useState(0)
    const [maxTokens, setMaxTokens] = useState(0)
    const [tokensSold, setTokensSold] = useState(0)

    const loadBlockchainData = async()=>{
        const provider =new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)

          // Initiate contracts
        const token = new ethers.Contract(config[31337].token.address, TOKEN_ABI , provider)
        const crowdsale = new ethers.Contract(config[31337].crowdsale.address, CROWDSALE_ABI, provider)
        setCrowdsale(crowdsale)


        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = ethers.utils.getAddress(accounts[0])
        SetAccount(account)

          // Fetch account balance
        const accountBalance = ethers.utils.formatUnits(await token.balanceOf(account), 18)
        setAccountBalance(accountBalance)

      

          // Fetch price
        // const price = ethers.utils.formatUnits(await crowdsale.price(), 18)
        //console.log(price)
        // setPrice(price)

        // // Fetch max tokens
        // const maxTokens = ethers.utils.formatUnits(await crowdsale.maxTokens(), 18)
        // setMaxTokens(maxTokens)

        // // Fetch tokens sold
        // const tokensSold = ethers.utils.formatUnits(await crowdsale.tokensSold(), 18)
        // setTokensSold(tokensSold)

        setIsLoading(false)

    }

    useEffect(() => {
        if (isLoading) {
          loadBlockchainData()
        }
      }, [isLoading]);
    return(
        <Container>
            <Navigation />
            <h1 className='my-4 text-center'>Introducing JS Token!</h1>
            
            <p className='text-center'><strong>Current Price:</strong> {price} ETH</p>

            <hr />
            {account && (
              <Info account={account} acb = {accountBalance}/>
            )}    
        </Container>
        
    )
}

export default Test;