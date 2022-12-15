
import { Navbar,NavbarBrand } from "react-bootstrap";
import logo from '../logo.png';

const test = ()=>{
    return(     
        <Navbar>
            <img alt = "logo" src = {logo} witdh = "40" height = "40" className  = "d-inline-block align-top mx-3"/>
            <NavbarBrand href='#'>DApp ICO Crowdsale</NavbarBrand>
        </Navbar>     
    )
}

export default test;