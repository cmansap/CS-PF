
import { Container} from "react-bootstrap";
import {ethers} from 'ethers';

// Import Components
import Navigation from "./Navigation.js"
import Info from "./Info.js"
import { useEffect, useState } from "react";

const Test = ()=>{

    const [account,SetAccount] = useState(null)
    const loadBockchaninData = async()=>{
        const provider =new ethers.providers.Web3Provider(window.ethereum)


        const accounts = await window.ethereum.request({method: 'eth_requestAccounts'})
        const account = ethers.utils.getAddress(accounts[0])
        SetAccount(account)
    }

    useEffect(()=>{
        loadBockchaninData() 
    })
    return(
        <Container>
            <Navigation />
            <hr />
            {account && (
              <Info account={account}/>
            )}    
        </Container>
        
    )
}

export default Test;