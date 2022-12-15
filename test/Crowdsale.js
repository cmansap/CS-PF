const { expect } =  require('chai');
const { ethers } = require('hardhat');

const tokens = (n) =>{
    return ethers.utils.parseUnits(n.toString(),'ether')
}

const ether = tokens

describe("Crowdsale",async()=>{
    let crowdsale,token
    let accounts,deployer,user1
    beforeEach(async()=>{
        const Crowdsale = await ethers.getContractFactory("Crowdsale")
        const Token = await ethers.getContractFactory("Token")
        token = await Token.deploy("Dapp University","DAPP","1000000")
        accounts = await ethers.getSigners()
        deployer = accounts[0]
        user1 = accounts[1]

        crowdsale = await Crowdsale.deploy(token.address,ether(1),'1000000')
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
            it("emits the buy event",async()=>{         
                await expect(transaction).to.emit(crowdsale,"Buy").withArgs(amount,user1.address)
            })

        })  
        
        describe("Failure",async()=>{
            it("reject insufficient ETH",async()=>{         
                await expect(crowdsale.connect(user1).buyTokens(tokens(10),{value:0})).to.be.reverted
            })
            
        })
    })

    // describe("Sending ETH",async()=>{
    //     let transaction , result
    //     let amount = ether(10)

    //     describe("Success",async()=>{
    //         beforeEach(async()=>{
    //             transaction = await user1.sendTransaction({to:crowdsale.address,value:amount})
    //             result = await transaction.wait()
    //         })
    //         it("updates contracts ether balance",async()=>{         
    //             expect(await ethers.provider.getBalance(crowdsale.address)).to.eq(amount)
    //         })
    //         // it("updates totalSold",async()=>{         
    //         //     expect(await crowdsale.tokensSold()).to.eq(amount)
    //         // })
    //         // it("emits the buy event",async()=>{         
    //         //     await expect(transaction).to.emit(crowdsale,"Buy").withArgs(amount,user1.address)
    //         // })

    //     })  
        
    // })


    // describe("Updating Price",()=>{
    //     let transaction,result
    //     let price = ether(2)

    //     describe("Success",()=>{
    //         beforeEach(async()=>{
    //             transaction = await crowdsale.connect(deployer).setPrice(ether(2))
    //             result = await transaction.wait()
    //         })

    //         it("updates the price",async()=>{
    //             expect(await crowdsale.price()).to.equal(ether(2))
    //         })

    //     })

    //     describe("Failure",async()=>{
    //         it("prevents the non-owner update the price",async()=>{
    //             await expect(crowdsale.connect(user1).setPrice(price)).to.be.reverted
    //         })
    //     })
    // })

    // describe("Finalizing the Sale",async()=>{
    //     let transaction , result
    //     let amount = tokens(10)
    //     let value = ether(10)

    //     describe("Success",async()=>{

    //         beforeEach(async()=>{
    //             transaction = await crowdsale.connect(user1).buyTokens(amount,{value : value})
    //             result = await transaction.wait()

    //             transaction = await crowdsale.connect(deployer).finalize()
    //             result = await transaction.wait()

    //         })

    //         it("transfers remaining tokens to owner",async()=>{
    //             expect(await token.balanceOf(crowdsale.address)).to.equal(0)
    //             expect(await token.balanceOf(deployer.address)).to.equal(tokens(999990))
    //         })

    //         it("transfers ETH balance to owner",async()=>{
    //             expect(await ethers.provider.getBalance(crowdsale.address)).to.equal(0)
    //         })

    //         it("emits Finalize event",async()=>{
    //             await expect(transaction).to.emit(crowdsale,"Finalize").withArgs(amount,value)
    //         })

    //     })

    //     describe("Failure",async()=>{
    //         it("prevents non-owner from finalizing",async()=>{
    //             await expect(crowdsale.connect(user1).finalize()).to.be.reverted
    //         })
            
    //     })
    // })


    describe("refund the amount to investor",async()=>{

        beforeEach(async()=>{
            transaction = await crowdsale.connect(user1).buyTokens(tokens(10),{value : ether(10)})
            result = await transaction.wait()
        })

        it("amount received by investor",async()=>{  
            console.log(`The user1 balance before is ${(await ethers.provider.getBalance(user1.address))}`)
            await crowdsale.refundInvestor(user1.address)
            console.log(`The user1 balance After is ${(await ethers.provider.getBalance(user1.address))}`)

        })

        describe("capped crowdsale",async()=>{


            it("has the correct hard cap",async()=>{  
                console.log(await crowdsale.etherRaised())
                //expect(await crowdsale.cap().to.equal(0)

            })

        })

    })
})


