import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ShipmentServiceABI from "./utils/ShipmentService.json";

const CONTRACT_ADDRESS = "0xCFA5B588f1F98fed30eDa82a6Cb02553d9df15bB";

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
  const [showShipAndCreateOtp, setShowShipAndCreateOtps] = useState(false);
  const [showGetProcessingOrders, setShowGetProcessingOrders] = useState(false);
  const [showGetShippedOrders, setShowGetShippedOrders] = useState(false);
  const [showGetDeliveredOrders, setShowGetDeliveredOrders] = useState(false);
  const [showGetOrdersForAddress, setShowGetOrdersForAddress] = useState(false);
  const [showGetItemsForOrder, setShowGetItemsForOrder] = useState(false);
  const [showGetQuantitiesOfItemForOrder, setShowGetQuantitiesOfItemForOrder] = useState(false);
  const [displayOTP, setDisplayOTP] = useState('');


  const [givenAddress, setgivenAddress] = useState(account);
  const [givenItem, setgivenItem] = useState("");
  const[orderStatus, setOrderStatus] = useState(0);
  const [items, setItems] = useState([]);
  const[ordersAddress,setordersAddress] = useState([]);

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

  // const getOTPForOrder = async () => {
  //   if (contract && orderNumber > 0) {
  //     try {
  //       const otp = await contract.methods
  //         .getOTP(orderNumber)
  //         .call({ from: account,gasLimit: 5000000,value: web3.utils.toWei("0.000", "ether") });
  //         console.log("OTP is :" ,otp);
  //       setOTP(otp);
  //     } catch (error) {
  //       console.error("Error getting OTP:", error);
  //     }
  //   }
  // };
  const getOTPForOrder = async (event) => {
    try {
      const orderNumberAsNumber = Number(orderNumber);
  
      // Call the contract method and get the result as a BigNumber
      const otp = await contract.methods.getOTP(orderNumberAsNumber).call();
  
      // Convert the BigNumber to a regular number or handle it as needed
      console.log("OTP RESPONSE IS ",otp);
      const otpAsNumber = Number(otp);
  
      console.log("OTP for order", orderNumberAsNumber, "is:", otpAsNumber);
      // Handle the OTP value as needed
      setDisplayOTP(`OTP for order ${orderNumberAsNumber} is: ${otpAsNumber}`);
    } catch (error) {
      console.error('Error getting OTP:', error);
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
          const statusNumber = Number(status);
        console.log("Order Status:", status);
        if (status === 0) {
          setOrderStatus("Invalid");
        } else if (statusNumber === "1") {
          setOrderStatus("Processing");
        } else if (statusNumber === 2) {
          setOrderStatus("Shipped");
        } else if (statusNumber === 3) {
          setOrderStatus("Delivered");
        } else if (statusNumber === 4) {
          setOrderStatus("Canceled");
        } else {
          setOrderStatus(statusNumber);
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
              .send({ from: account,value: web3.utils.toWei("0.000", "ether"),
              gasLimit: 5000000,});
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
  
  const getShippedOrders = async () => {
    try {
      const shippedOrders = await contract.methods.getShippedOrders().call();
      console.log("Shipped Orders:", shippedOrders);
      // Handle delivered orders data here
    } catch (error) {
      console.error("Error getting shipped orders:", error);
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
            const size = ordersForAddress.length;
            const parsedOrdersForAddress= ordersForAddress.map(Number);
        
            console.log("Orders for Address:", parsedOrdersForAddress);
            setordersAddress(parsedOrdersForAddress);
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
            setItems(itemsForOrder);
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
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleGetOTPClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(true);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleAcceptOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(true);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleCancelOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(true);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleGetOrderStatusClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(true);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleShipAndCreateOtpsClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(true);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleGetProcessingOrdersClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(true);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);

    getProcessingOrders();
  };

  const handleGetShippedOrdersClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(true);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);

    getShippedOrders();
  };

  const handleGetDeliveredOrdersClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(true);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);

    getDeliveredOrders();
  };

  const handleGetOrdersForAddressClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(true);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleGetItemsForOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(true);
    setShowGetQuantitiesOfItemForOrder(false);
  };

  const handleGetQuantitiesOfItemForOrderClick = () => {
    setShowCreateOrder(false);
    setShowGetOTP(false);
    setShowAcceptOrder(false);
    setShowCancelOrder(false);
    setShowGetOrderStatus(false);
    setShowShipAndCreateOtps(false);
    setShowGetProcessingOrders(false);
    setShowGetShippedOrders(false);
    setShowGetDeliveredOrders(false);
    setShowGetOrdersForAddress(false);
    setShowGetItemsForOrder(false);
    setShowGetQuantitiesOfItemForOrder(true);
  };

  const isOwner = account === "0x5Fe091C06EF6329f86186fb7c0C7F142AA62Ea83";

  return (
    <div>
      <h1>Shipment Service</h1>
      {walletConnected ? (
        <>
          <p>Connected Account: {account}</p>
          {isOwner ? ( // Display owner-specific functionality
            <div>
                <div>
                    <button onClick={handleShipAndCreateOtpsClick}>Ship Order</button>
                    <button onClick={handleGetProcessingOrdersClick}>View Processing Orders</button>
                    <button onClick={handleGetShippedOrdersClick}>View Shipped Orders</button>
                    <button onClick={handleGetDeliveredOrdersClick}>View Delivered Orders</button>
                </div>
                <div>
                    {showShipAndCreateOtp && (
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
                        <button onClick={ShipAndCreateOtp}>Dispatch order</button>
                    </div>
                    )}
                    {showGetProcessingOrders && (
                        <p>Orders in processing stage</p>
                    )}
                    {showGetShippedOrders && (
                        <p>Orders in processing stage</p>
                    )}
                    {showGetDeliveredOrders && (
                        <p>Orders in processing stage</p>
                    )}
                </div>
            </div>
          ) : (
            <div>
              <div>
                <button onClick={handleCreateOrderClick}>Create Order</button>
                <button onClick={handleGetOTPClick}>Get OTP</button>
                <button onClick={handleAcceptOrderClick}>Accept Order</button>
                <button onClick={handleCancelOrderClick}>Cancel Order</button>
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
    <p>{displayOTP}</p>
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
                
              </div>
            </div>
          )}
          <div>
            <div>
                <button onClick={handleGetOrderStatusClick}>Get Order Status</button>
                <button onClick={handleGetOrdersForAddressClick}>Get Orders for an address</button>
                <button onClick={handleGetItemsForOrderClick}>Get items in an Order</button>
                <button onClick={handleGetQuantitiesOfItemForOrderClick}>Get quantities of items in a order</button>
            </div>
                {showGetOrderStatus && (
                    <div>
                        <input
                        type="number"
                        placeholder="Order Number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                        />
                        <button onClick={getOrderStatus}>Get Order Status</button>
                        <p>Order Status: {orderStatus}</p>
                    </div>
                )}
                {showGetOrdersForAddress && (
                    <div>
                        <input
  type="text"
  placeholder="Address"
  value={givenAddress}
  onChange={(e) => setgivenAddress(e.target.value)}
/>
                        <button onClick={getOrdersForAddress}>Get Details</button>
                    <p>Orders for {givenAddress} are {ordersAddress}</p>
                    </div>
                )}
                {showGetItemsForOrder && (
  <div>
    <input
      type="number"
      placeholder="Order Number"
      value={orderNumber}
      onChange={(e) => setOrderNumber(parseInt(e.target.value))}
    />
    <button onClick={getItemsForOrder}>Get Details</button>
    <p>Items for Order: {items.join(", ")}</p>
  </div>
)}
                {showGetQuantitiesOfItemForOrder && (
                    <div>
                        <input
                            type="number"
                            placeholder="Order Number"
                            value={orderNumber}
                            onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                        />
                        <input
                            type="text"
                            placeholder="Item"
                            value={givenItem}
                            onChange={(e) => setgivenItem((e.target.value))}
                        />
                        <button onClick={getQuantitiesOfItemForOrder}>Get Details</button>
                    </div>
                )}
          </div>
        </>
      ) : (
        <button onClick={connectToWeb3}>Connect to Web3</button>
      )}
    </div>
  );
}

export default ShipmentServiceApp;
