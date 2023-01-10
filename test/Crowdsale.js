const { expect } =  require('chai');
const { ethers } = require('hardhat');
const { time } = require('@nomicfoundation/hardhat-network-helpers');

const tokens = (n) =>{
    return ethers.utils.parseUnits(n.toString(),'ether')
}

const ether = tokens

describe("Crowdsale",async()=>{
    let crowdsale,token
    let accounts,deployer,user1,OPENINGTIME,CLOSINGTIME
    beforeEach(async()=>{
        const Crowdsale = await ethers.getContractFactory("Crowdsale")
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Dapp University","DAPP","1000000")
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        let now = await time.latest()
        console.log(`The time is $now`)
        OPENINGTIME = now - 1000;
        CLOSINGTIME = now + 2000;

        // const CAP = ethers.utils.parseUnits('10','ether')
        // const PRICE = ethers.utils.parseUnits('0.025','ether')
        // const OPENINGTIME = (Date.now()-60000).toString().slice(0, 10)
        // console.log(`The opetime is ${OPENINGTIME}`)
        // const CLOSINGTIME = (Date.now()+10*24*60*60*1000).toString().slice(0, 10)
        // console.log(`The closingtime is ${CLOSINGTIME}`)
        crowdsale = await Crowdsale.deploy(token.address,ether(1),OPENINGTIME,CLOSINGTIME,ether(100))
        let transaction = await token.connect(deployer).transfer(crowdsale.address,tokens(1000000))
        await transaction.wait()
        
    })
    
    describe("Deployment",async()=>{

        it("transfer tokens",async()=>{
            expect(await token.balanceOf(crowdsale.address)).to.eq(tokens('1000000'))    
        })

        it("returns the price",async()=>{
            expect(await crowdsale.price()).to.eq(ether(1))    
        })
        it("returns the token address",async()=>{
            expect(await crowdsale.token()).to.eq(token.address)    
        })
        it("returns the crowdsale cap",async()=>{
            expect(await crowdsale.cap()).to.eq(ether(100))    
        })

        // it("returns the crowdsale opening time",async()=>{
        //     console.log(await crowdsale.openingTime())
        //     console.log(await crowdsale.closingTime())
        //     //expect(await crowdsale.openingTime()).to.eq(ether(100))    
        // })

      
    })

    describe("Buying Tokens",async()=>{
        let transaction , result
        let amount = tokens(10)

        describe("Success",async()=>{
            beforeEach(async()=>{
                transaction = await crowdsale.connect(user1).buyTokens(tokens(10),{value : ether(10)})
                result = await transaction.wait()
            })
            it("transfer tokens",async()=>{         
                expect(await token.balanceOf(crowdsale.address)).to.eq(tokens(999990))
                expect(await token.balanceOf(user1.address)).to.eq(amount) 
            })

            it("updates contracts ether balance",async()=>{         
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(ether(10))
            })
            it("amount deposited by investor",async()=>{    
                expect(await crowdsale.deposit(user1.address)).to.eq(ether(10))
            })
   
            it("updates totalSold",async()=>{         
                expect(await crowdsale.tokensSold()).to.eq(amount)
            })
            it("ether raised for a transaction",async()=>{         
                expect(await crowdsale.etherRaised()).to.equal(ether(10))
            })
            
            it("emits the buy event",async()=>{         
                await expect(transaction).to.emit(crowdsale,"Buy").withArgs(amount,user1.address)
            })

        })  
        
        describe("Failure",async()=>{
            it("reject insufficient ETH",async()=>{         
                await expect(crowdsale.connect(user1).buyTokens(tokens(10),{value:0})).to.be.reverted
            })

            it("reject buy transaction if the opentime > block.timestamp",async()=>{  
                await time.increaseTo(OPENINGTIME+1005)       
                await expect(crowdsale.connect(user1).buyTokens(tokens(10),{value:10})).to.be.reverted
            })
            
        })
    })

    describe("Sending ETH",async()=>{
        let transaction , result
        let amount = ether(2)

        describe("Success",async()=>{
            beforeEach(async()=>{
                transaction = await user1.sendTransaction({to:crowdsale.address,value:amount})
                result = await transaction.wait()
            })

            it("updates contracts ether balance",async()=>{         
                expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount)
            })

            it("updates totalSold",async()=>{         
                expect(await crowdsale.tokensSold()).to.eq(amount)
            })

            it("emits the buy event",async()=>{         
                await expect(transaction).to.emit(crowdsale,"Buy").withArgs(amount,user1.address)
            })


        })  
        
    })


    describe("Updating Price",()=>{
        let transaction,result
        let price = ether(2)

        describe("Success",()=>{
            beforeEach(async()=>{
                transaction = await crowdsale.connect(deployer).setPrice(ether(2))
                result = await transaction.wait()
            })

            it("updates the price",async()=>{
                expect(await crowdsale.price()).to.equal(ether(2))
            })

        })

        describe("Failure",async()=>{
            it("prevents the non-owner update the price",async()=>{
                await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
            })
        })
    })

    describe("Finalizing the Sale",async()=>{
        let transaction , result
        let amount = tokens(10)
        let value = ether(10)

        describe("Success",async()=>{

            beforeEach(async()=>{
                transaction = await crowdsale.connect(user1).buyTokens(amount,{value : value})
                result = await transaction.wait()

                transaction = await crowdsale.connect(deployer).finalize()
                result = await transaction.wait()

            })

            it("transfers remaining tokens to owner",async()=>{
                expect(await token.balanceOf(crowdsale.address)).to.equal(0)
                expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
            })

            it("transfers ETH balance to owner",async()=>{
                expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0)
            })

            it("emits Finalize event",async()=>{
                await expect(transaction).to.emit(crowdsale,"Finalize").withArgs(amount,value)
            })

        })

        describe("Failure",async()=>{
            it("prevents non-owner from finalizing",async()=>{
                await expect(crowdsale.connect(user1).finalize()).to.be.reverted
            })
            
        })
    })


    // describe("refund the amount to investor",async()=>{

    //     beforeEach(async()=>{
    //         transaction = await crowdsale.connect(user1).buyTokens(tokens(10),{value : ether(10)})
    //         result = await transaction.wait()
    //     })

    //     it("amount received by investor",async()=>{  
    //         console.log(`The user1 balance before is ${(await ethers.provider.getBalance(user1.address))}`)
    //         await crowdsale.refundInvestor(user1.address)
    //         console.log(`The user1 balance After is ${(await ethers.provider.getBalance(user1.address))}`)

    //     })   

    // })

    describe("capped crowdsale",async()=>{

        it("has the correct hard cap",async()=>{  
            transaction = await crowdsale.connect(user1).buyTokens(tokens(1),{value : ether(1)})
            result = await transaction.wait()
            expect(await crowdsale.etherRaised()).to.equal(ether(1))
            expect(await crowdsale.cap()).to.equal(ether(100))

        })

    })
})


