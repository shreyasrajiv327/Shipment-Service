# Shipment Service

This project is a decentralized application (DApp) built on Ethereum blockchain using Solidity smart contracts for managing shipments. It allows users to create orders, track their status, and perform actions such as shipping, accepting, and canceling orders.

## Features

- **Order Creation**: Customers can create new orders by specifying items and quantities.
- **Order Tracking**: Customers can track the status of their orders, whether they are being processed, shipped, delivered, or canceled.
- **Order Shipping**: The owner of the contract can mark orders as shipped and generate OTPs (One-Time Passwords) for customers to confirm receipt.
- **Order Acceptance**: Customers can accept orders by providing the OTP generated during shipping.
- **Order Cancellation**: Customers can cancel orders and receive refunds if the orders are still in the processing stage.
- **View Packages by Stage**: The owner can view all packages currently in a particular stage (e.g., processing, shipped, delivered) to manage shipments more efficiently.
- **Secure Transactions**: All transactions are secured by the Ethereum blockchain.

## Technologies Used

- Solidity: Smart contract language used for implementing the business logic.
- Ethereum: Blockchain network for deploying and executing the smart contracts.
- Sepolia Testnet: Ethereum test network used for deploying and testing smart contracts.
- Hardhat: Ethereum development environment for compiling, deploying, and testing smart contracts.
- React: Frontend framework for building the user interface.
- Web3.js: JavaScript library for interacting with Ethereum blockchain from the frontend.

## Installation

1. Clone the repository:
   
   ```bash
   git clone <repository-url>
   ```

2. Install dependancies 
- For the frontend
    ``` bash
    cd shipment-service/frontend
    npm install
    ```
- For the hardhat (if you want to redeploy the contract)
    ``` bash
    cd shipment-service/solidity
    npm install
    ```

### To deploy contract on a network

1. Change directory
    ``` bash
    cd shipment-service/solidity
    ```

2. Set your 'ALCHEMY_API_KEY' and 'SEPOLIA_PRIVATE_KEY' present in the hardhat.config.js file.
     ``` bash
    npx hardhat vars set ALCHEMY_API_KEY
    ```
    ``` bash
    npx hardhat vars set SEPOLIA_PRIVATE_KEY
    ```

3. Compile the contract
    ```bash
    npx hardhat compile
    ```

4. Deploy the contract 
    ```bash
    npx hardhat run scripts/deploy.js  --network sepolia
    ```

### React frontend

1. If you have redeployed the contract
- navigate to frontend/src/App.js and change the following
    ```javascript
    const CONTRACT_ADDRESS = "deployed-contract-address";
    ```
- navigate to solidity/artifacts/contracts/ShipmentService.json. Copy the contents of this file into frontend/src/utils/ShipmentService.json

2. Start the react server
    ```bash
    npm start
    ```

3. Access the DApp in your browser at http://localhost:3000.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
