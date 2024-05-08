import React, { useState, useEffect } from 'react';
import Web3 from 'web3';

// Replace with your deployed contract address
const CONTRACT_ADDRESS = '0x716b99eFd68368F88596397A0c439CEa6Ab82450';

// Replace with the ABI (Application Binary Interface) of your contract
const CONTRACT_ABI = '/Users/shreyasr/Documents/Blockchain/Projects/Shipment-Service/artifacts/contracts/Shipment.sol/ShipmentService.json'

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [otp, setOtp] = useState(0);
  const [address, setAddress] = useState('');
  const [items, setItems] = useState([]);
  const [itemQuantities, setItemQuantities] = useState({});

  useEffect(() => {
    const initWeb3 = async () => {
      if (window.ethereum) {
        try {
          const web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          setWeb3(web3Instance);

          const accounts = await web3Instance.eth.getAccounts();
          setAccounts(accounts);

          const contractInstance = new web3Instance.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
          setContract(contractInstance);
        } catch (error) {
          console.error('Error initializing Web3:', error);
        }
      } else {
        console.error('No Web3 provider detected');
      }
    };

    initWeb3();
  }, []);

  const handleCreateOrder = async () => {
    if (contract && accounts.length > 0) {
      try {
        await contract.methods.createOrder(item, quantity).send({ from: accounts[0] });
        console.log('Order created successfully');
      } catch (error) {
        console.error('Error creating order:', error);
      }
    } else {
      console.error('Contract or accounts not available');
    }
  };

  const handleGetOTP = async () => {
    if (contract && accounts.length > 0) {
      try {
        const otp = await contract.methods.getOTP().call({ from: accounts[0] });
        setOtp(otp);
      } catch (error) {
        console.error('Error getting OTP:', error);
      }
    } else {
      console.error('Contract or accounts not available');
    }
  };

  const handleGetItemsAndQuantities = async () => {
    if (contract && web3) {
      try {
        const itemsForAddress = await contract.methods.getItemsForAddress(address).call();
        setItems(itemsForAddress);

        const itemQuantities = {};
        for (const item of itemsForAddress) {
          const quantity = await contract.methods.getQuantityForItemAndAddress(address, item).call();
          itemQuantities[item] = quantity;
        }
        setItemQuantities(itemQuantities);
      } catch (error) {
        console.error('Error getting items and quantities:', error);
      }
    } else {
      console.error('Contract or Web3 not available');
    }
  };

  return (
    <div>
      <h1>Shipment Service</h1>
      <div>
        <label>
          Item:
          <input type="text" value={item} onChange={(e) => setItem(e.target.value)} />
        </label>
        <label>
          Quantity:
          <input type="number" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
        </label>
        <button onClick={handleCreateOrder}>Create Order</button>
      </div>
      <div>
        <button onClick={handleGetOTP}>Get OTP</button>
        <p>OTP: {otp}</p>
      </div>
      <div>
        <label>
          Address:
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <button onClick={handleGetItemsAndQuantities}>Get Items and Quantities</button>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item}: {itemQuantities[item]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;