const hre = require("hardhat");

async function main()
{
    try{
        const ShippingContract =  await hre.ethers.getContractFactory("ShipmentService");
        const contract = await ShippingContract.deploy();
        
        console.log("Contract deployed to:", await contract.getAddress());
    }catch(error)
    {
        console.error(error);
        process.exit(1);
      }
    
}

main();