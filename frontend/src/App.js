import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ShipmentServiceABI from './utils/ShipmentService.json';

const CONTRACT_ADDRESS = '0xb7BeE1aFD89F7Ba724305732c1CC9998D0928b65';

function ShipmentServiceApp() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [orderNumber, setOrderNumber] = useState(0);
  const [otp, setOTP] = useState('');

  useEffect(() => {
    connectToWeb3();
  }, []);

  const connectToWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const contractInstance = new web3Instance.eth.Contract(
          ShipmentServiceABI.abi,
          CONTRACT_ADDRESS
        );

        setContract(contractInstance);
      } catch (error) {
        console.error('Error connecting to Web3:', error);
      }
    } else {
      console.error('Please install a Web3-compatible wallet extension');
    }
  };

  // const createOrder = async () => {
  //   if (contract && item && quantity > 0) {
  //     try {
  //       const result = await contract.methods.createOrder(item, quantity).send({ 
  //         from: account, 
  //         value: web3.utils.toWei('0.001', 'ether'),
  //         gasLimit: 5000000  // Specify a higher gas limit
  //       });
  //       console.log("transaction done macha");
  //       setOrderNumber(result.events.OrderCreated.returnValues.orderNumber); // Update order number here
  //       console.log("Order has been placed successfully");
  //     } catch (error) {
  //       console.error('Error creating order:', error);
  //     }
  //   }
  //};
  const createOrder = async () => {
    if (contract && item && quantity > 0) {
      try {
        const receipt = await contract.methods.createOrder(item, quantity).send({ 
          from: account, 
          value: web3.utils.toWei('0.001', 'ether'),
          gasLimit: 5000000  // Specify a higher gas limit
        });
        const orderNumber = Number(receipt.events.OrderCreated.returnValues.orderNumber);
        console.log("Order has been placed successfully, order number:", orderNumber);
        setOrderNumber(orderNumber); // Update order number state here
      } catch (error) {
        console.error('Error creating order:', error);
      }
    }
  };




  const getOTPForOrder = async () => {
    if (contract && orderNumber > 0) {
      try {
        const otp = await contract.methods.getOTP(orderNumber).call({ from: account });
        setOTP(otp);
      } catch (error) {
        console.error('Error getting OTP:', error);
      }
    }
  };

  const acceptOrder = async () => {
    if (contract && orderNumber > 0 && otp) {
      try {
        await contract.methods.acceptOrder(orderNumber, otp).send({ from: account });
        console.log('Order accepted successfully!');
      } catch (error) {
        console.error('Error accepting order:', error);
      }
    }
  };

  const cancelOrder = async () => {
    if (contract && orderNumber > 0) {
      try {
        await contract.methods.cancelOrder(orderNumber).send({ from: account });
        console.log('Order canceled successfully!');
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };

  const getOrderStatus = async () => {
    if (contract && orderNumber > 0) {
      try {
        const status = await contract.methods.getOrderStatus(orderNumber).call();
        console.log('Order Status:', status);
      } catch (error) {
        console.error('Error getting order status:', error);
      }
    }
  };
  const shipAndCreateOtp = async () => {
    if (contract && orderNumber > 0 && otp) {
      try {
        await contract.methods.ShipAndCreateOtp(orderNumber, otp).send({ from: account });
        console.log('OTP created and order shipped successfully!');
        // Optionally, you can update the order status or perform other actions here
      } catch (error) {
        console.error('Error shipping and creating OTP:', error);
      }
    } else {
      console.error('Invalid order number or OTP');
    }
  };
  
  return (
    <div>
      <h1>Shipment Service</h1>
      {web3 && account ? (
        <>
          <p>Connected Account: {account}</p>
          <div>
            <input
              type="text"
              placeholder="Item"
              value={item}
              onChange={(e) => setItem(e.target.value)}
            />
            <input
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
            <button onClick={createOrder}>Create Order</button>
          </div>
          {orderNumber > 0 && (
            <div>
              <p>Order Number: {orderNumber}</p>
              <button onClick={getOTPForOrder}>Get OTP</button>
              {otp && (
                <>
                  <p>OTP: {otp}</p>
                  <button onClick={acceptOrder}>Accept Order</button>
                  <button onClick={cancelOrder}>Cancel Order</button>
                </>
              )}
              <button onClick={getOrderStatus}>Get Order Status</button>
              {/* Add button to ship and create OTP */}
              <button onClick={shipAndCreateOtp}>Ship & Create OTP</button>
            </div>
          )}
        </>
      ) : (
        <button onClick={connectToWeb3}>Connect to Web3</button>
      )}
    </div>
  );
  
}

export default ShipmentServiceApp;