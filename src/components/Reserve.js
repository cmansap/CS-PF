import { useState } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { ethers } from 'ethers'

const Reserve = ({ provider, price, crowdsale, setIsLoading }) => {
  const [amount, setAmount] = useState('0')
  const [isWaiting, setIsWaiting] = useState(false)

  const reserveHandler = async (e) => {
    e.preventDefault()
    setIsWaiting(true)

    try {
      const signer = await provider.getSigner()

      // We need to calculate the required ETH in order to reserve the tokens...
      const value = ethers.utils.parseUnits((amount * price).toString(), 'ether')
      const formattedAmount = ethers.utils.parseUnits(amount.toString(), 'ether')

      const transaction = await crowdsale.connect(signer).reserveTokens(formattedAmount, { value: value })
      await transaction.wait()

    } catch {
      window.alert('User rejected or transaction reverted')
    }

    setIsLoading(true)
  }

  const finalizeHandler = async(e) => {

    try{
      e.preventDefault()
      setIsWaiting(true)
      console.log("Chandra Mannava")
  
      const signer = await provider.getSigner()
  
      const transaction = await crowdsale.connect(signer).finalize()
      await transaction.wait()
    }catch {
      window.alert('User rejected or transaction reverted')
    }
    setIsLoading(true)
  }

  return(
    <>
     <Form onSubmit={reserveHandler} onSubmit={finalizeHandler} style={{ maxWidth: '800px', margin: '50px auto' }}>
      <Form.Group as={Row}>
        <Col>
          <Form.Control type="number" placeholder="Enter amount" onChange={(e) => setAmount(e.target.value)}/>
        </Col>
        <Col className='text-center'>
          {isWaiting ? (
            <Spinner animation="border"/>
          ): (
            <>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
              Reserve Tokens
            </Button>
            </>        
          )}
        </Col>
        <Col className='text-center'>
          {isWaiting ? (
            <Spinner animation="border"/>
          ): (
            <>
              <Button variant="primary" type="submit" style={{ width: '100%' }}>
              Finalize
            </Button>
            </>        
          )}
        </Col>
      </Form.Group>
    </Form>
    </>
   
  )
}

export default Reserve;
