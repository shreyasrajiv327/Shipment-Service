import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ShipmentServiceABI from "./utils/ShipmentService.json";

const CONTRACT_ADDRESS = "0x5Fe091C06EF6329f86186fb7c0C7F142AA62Ea83";

function ShipmentServiceApp() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [item, setItem] = useState("");
  const [quantity, setQuantity] = useState(0);
  const [orderNumber, setOrderNumber] = useState(0);
  const [otp, setOTP] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [showCreateOrder, setShowCreateOrder] = useState(false);
  const [showGetOTP, setShowGetOTP] = useState(false);
  const [showAcceptOrder, setShowAcceptOrder] = useState(false);
  const [showCancelOrder, setShowCancelOrder] = useState(false);
  const [showGetOrderStatus, setShowGetOrderStatus] = useState(false);
  const [givenAddress, setgivenAddress] = useState(account);
  const [givenItem, setgivenItem] = useState("");
  const[orderStatus, setOrderStatus] = useState(0);



  useEffect(() => {
    connectToWeb3();
  }, []);

  const connectToWeb3 = async () => {
    if (window.ethereum) {
      try {
        const web3Instance = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3Instance.eth.getAccounts();
        setAccount(accounts[0]);
        setWeb3(web3Instance);

        const networkId = await web3Instance.eth.net.getId();
        const contractInstance = new web3Instance.eth.Contract(
          ShipmentServiceABI.abi,
          CONTRACT_ADDRESS
        );

        setContract(contractInstance);
        setWalletConnected(true);
      } catch (error) {
        console.error("Error connecting to Web3:", error);
      }
    } else {
      console.error("Please install a Web3-compatible wallet extension");
    }
  };

  const createOrder = async () => {
    if (contract && item && quantity > 0) {
      try {
        const receipt = await contract.methods
          .createOrder(item, quantity)
          .send({
            from: account,
            value: web3.utils.toWei("0.001", "ether"),
            gasLimit: 5000000, // Specify a higher gas limit
          });
        const orderNumber = Number(
          receipt.events.OrderCreated.returnValues.orderNumber
        );
        console.log(
          "Order has been placed successfully, order number:",
          orderNumber
        );
        setOrderNumber(orderNumber); // Update order number state here
      } catch (error) {
        console.error("Error creating order:", error);
      }
    }
  };

  const getOTPForOrder = async () => {
    if (contract && orderNumber > 0) {
      try {
        const otp = await contract.methods
          .getOTP(orderNumber)
          .call({ from: account });
        setOTP(otp);
      } catch (error) {
        console.error("Error getting OTP:", error);
      }
    }
  };

  const acceptOrder = async () => {
    if (contract && orderNumber > 0 && otp) {
      try {
        await contract.methods
          .acceptOrder(orderNumber, otp)
          .send({ from: account });
        console.log("Order accepted successfully!");
      } catch (error) {
        console.error("Error accepting order:", error);
      }
    }
  };

  const cancelOrder = async () => {
    if (contract && orderNumber > 0) {
      try {
        await contract.methods.cancelOrder(orderNumber).send({ from: account });
        console.log("Order canceled successfully!");
      } catch (error) {
        console.error("Error canceling order:", error);
      }
    }
  };

  const getOrderStatus = async () => {
    if (contract && orderNumber > 0) {
      try {
        const status = await contract.methods
          .getOrderStatus(orderNumber)
          .call();
        console.log("Order Status:", status);
        if (status === 0) {
          setOrderStatus("Invalid");
        } else if (status === "1n") {
          setOrderStatus("Processing");
        } else if (status === 2) {
          setOrderStatus("Shipped");
        } else if (status === 3) {
          setOrderStatus("Delivered");
        } else if (status === 4) {
          setOrderStatus("Canceled");
        } else {
          setOrderStatus(status);
        }
        console.log("Order Status after:", orderStatus);
      } catch (error) {
        console.error("Error getting order status:", error);
      }
    }
  };

  const ShipAndCreateOtp = async () => {
    if(orderNumber>0 && otp) {
        try {
            await contract.methods
              .ShipAndCreateOtp(orderNumber, otp)
              .send({ from: account });
            console.log("Order shipped and OTP set successfully!");
        } catch (error) {
            console.error("Error shipping order and setting OTP:", error);
        }
    }
  };
  
  const getProcessingOrders = async () => {
    try {
      const processingOrders = await contract.methods.getProcessingOrders().call();
      console.log("Processing Orders:", processingOrders);
      // Handle processing orders data here
    } catch (error) {
      console.error("Error getting processing orders:", error);
    }
  };
  
  const getDeliveredOrders = async () => {
    try {
      const deliveredOrders = await contract.methods.getDeliveredOrders().call();
      console.log("Delivered Orders:", deliveredOrders);
      // Handle delivered orders data here
    } catch (error) {
      console.error("Error getting delivered orders:", error);
    }
  };
  
  const getOrdersForAddress = async () => {
    if(givenAddress) {
        try {
            const ordersForAddress = await contract.methods.getOrdersForAddress(givenAddress).call();
            console.log("Orders for Address:", ordersForAddress);
            // Handle orders for address data here
          } catch (error) {
            console.error("Error getting orders for address:", error);
          }
    }
    
  };
  
  const getItemsForOrder = async () => {
    if(orderNumber>0) {
        try {
            const itemsForOrder = await contract.methods.getItemsForOrder(orderNumber).call();
            console.log("Items for Order:", itemsForOrder);
            // Handle items for order data here
          } catch (error) {
            console.error("Error getting items for order:", error);
          }
    }
    
  };
  
  const getQuantitiesOfItemForOrder = async (_orderNumber, _item) => {
    if(orderNumber>0 && givenItem) {
        try {
            const quantity = await contract.methods.getQuantitiesOfItemForOrder(_orderNumber, _item).call();
            console.log(`Quantity of ${_item} for Order ${_orderNumber}:`, quantity);
            // Handle quantity data here
          } catch (error) {
            console.error("Error getting quantity of item for order:", error);
          }
    }
    
  };
  

  const handleCreateOrderClick = () => {
    setShowCreateOrder(true);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
  };

  const handleGetOTPClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(true);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
  };

  const handleAcceptOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(true);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
  };

  const handleCancelOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(true);
    setShowGetOrderStatus(false);
  };

  const handleGetOrderStatusClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(true);
  };

  const isOwner = account === "0xCe19176eA57a236d0c918C4A6B0EbEFaE1d0ff20";

  return (
    <div>
      <h1>Shipment Service</h1>
      {walletConnected ? (
        <>
          <p>Connected Account: {account}</p>
          {isOwner ? ( // Display owner-specific functionality
            <div>
              {/* <button onClick={() => ShipAndCreateOtp(orderNumber, otp)}>
                Ship and Set OTP
              </button> */}
              <p>Hereee</p>
            </div>
          ) : (
            <div>
              <div>
                <button onClick={handleCreateOrderClick}>Create Order</button>
                <button onClick={handleGetOTPClick}>Get OTP</button>
                <button onClick={handleAcceptOrderClick}>Accept Order</button>
                <button onClick={handleCancelOrderClick}>Cancel Order</button>
                <button onClick={handleGetOrderStatusClick}>
                  Get Order Status 
                </button>
              </div>
              <div>
                {showCreateOrder && (
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
                    <button onClick={createOrder}>Place Order</button>
                  </div>
                )}
                {showGetOTP && (
                  <div>
                    <input
                      type="number"
                      placeholder="Order Number"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                    />
                    <button onClick={getOTPForOrder}>Get OTP</button>
                  </div>
                )}
                {showAcceptOrder && (
                  <div>
                    <input
                      type="number"
                      placeholder="Order Number"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                    />
                    <input
                      type="number"
                      placeholder="OTP"
                      value={otp}
                      onChange={(e) => setOTP(parseInt(e.target.value))}
                    />
                    <button onClick={acceptOrder}>Accept Order</button>
                  </div>
                )}
                {showCancelOrder && (
                  <div>
                    <input
                      type="number"
                      placeholder="Order Number"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                    />
                    <button onClick={cancelOrder}>Cancel Order</button>
                  </div>
                )}
                {showGetOrderStatus && (
                  <div>
                    <input
                      type="number"
                      placeholder="Order Number"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                    />
                    <button onClick={getOrderStatus}>Get Order Status</button>
                    <p>Order Status: {Number(orderStatus)}</p>
                  </div>
                )}
              </div>
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
