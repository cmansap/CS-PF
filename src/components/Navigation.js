

import Navbar from 'react-bootstrap/Navbar';
import logo from '../logo.jpeg'

const Navigation = ()=>{
    return (
        <Navbar>
            <img 
            alt = "logo"
            src = {logo} 
            width="40" 
            height = "40"
            className="d-inline-block align-top mx-1"
            />
            <Navbar.Brand href="#">JANASENA ICO Crowdsale</Navbar.Brand>
        </Navbar>
    )
}


export default Navigation;