require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks :{
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/mEypHBnAV0-26uN74oK24rGYYj4Gyu3v",
     accounts: ["eb2c34931c12c58c02864b3d6ec99ce09d7b2fd08d51f15de3daa62bf3c91a05"],
  },
},
}