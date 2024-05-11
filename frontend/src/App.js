import React, { useState, useEffect } from "react";
import Web3 from "web3";
import ShipmentServiceABI from "./utils/ShipmentService.json";
import "./App.css"
import githubLogo from './assets/githubLogo.png';

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
  const [givenAddress, setgivenAddress] = useState(account);
  const [givenItem, setgivenItem] = useState("");
  const [orderStatus, setOrderStatus] = useState("Invalid");
  const [items, setItems] = useState([]);
  const [ordersAddress,setordersAddress] = useState([]);
  const [displayOTP, setDisplayOTP] = useState("");
  const [text,setText] = useState("");
  const [processingOrders, setProcessingOrders] = useState([]);
  const [shippedOrders, setShippedOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);

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
        setText("Error creating order!");
      }
    }
  };


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
      setText("Error getting OTP!");
      
    }
  };

  const acceptOrder = async () => {
    if (contract && orderNumber > 0 && otp) {
      try {
        await contract.methods
          .acceptOrder(orderNumber, otp)
          .send({ from: account });
        console.log("Order accepted successfully!");
        setText("Order accepted successfully!");
      } catch (error) {
        console.error("Error accepting order:", error);
        setText("Error accepting order!");
      }
    }
  };

  const cancelOrder = async () => {
    if (contract && orderNumber > 0) {
      try {
        const customerOrder = await contract.methods.customerOrders(orderNumber).call();

        if (customerOrder !== account) {
            console.error("Only the address that placed the order can cancel it.");
            setText("Only the address that placed the order can cancel it.");
            return;
        }

        await contract.methods.cancelOrder(orderNumber).send({ from: account, 
            value: web3.utils.toWei("0.001", "ether"),
            gasLimit: 5000000, // Specify a higher gas limit
        });
        console.log("Order canceled successfully!");
        setText("Order canceled successfully!");
      } catch (error) {
        console.error("Error canceling order:", error);
        setText("Error canceling order!");
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
        setText("Error getting order status");
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
            setText("Order shipped and OTP set successfully!");
        } catch (error) {
            console.error("Error shipping order and setting OTP:", error);
            setText("Error shipping order and setting OTP!");
        }
    }
  };
  
  const getProcessingOrders = async () => {
    if(contract && account) {
        try {
            const order = await contract.methods.getProcessingOrders().call({ from: account });
            console.log("Processing Orders:", order);            
            setProcessingOrders(order.map(Number).filter(num => num !== 0));
          } catch (error) {
            console.error("Error getting processing orders:", error);
            setText("Error getting processing orders!");
          }
    }
    
  };
  
  const getShippedOrders = async () => {
    if(contract && account) {
        try {
            const order = await contract.methods.getShippedOrders().call({ from: account });
            console.log("Shipped Orders:", order);
            setShippedOrders(order.map(Number).filter(num => num !== 0));
          } catch (error) {
            console.error("Error getting processing orders:", error);
            setText("Error getting shipped orders!");
          }
    }
  };
  
  const getDeliveredOrders = async () => {
    if(contract && account) {
        try {
            const order = await contract.methods.getDeliveredOrders().call({ from: account });
            console.log("Delivered Orders:", order);
            setDeliveredOrders(order.map(Number).filter(num => num !== 0));
          } catch (error) {
            console.error("Error getting delivered orders:", error);
            setText("Error getting delivered orders!");
          }
    }
  };
  
  const getOrdersForAddress = async () => {
    if(givenAddress) {
        try {
            const orders = await contract.methods.getOrdersForAddress(givenAddress).call();
            console.log("Orders:", orders);
            setordersAddress(orders.map(Number).filter(num => num !== 0));
          } catch (error) {
            console.error("Error getting orders for address:", error);
            setText("Error getting orders for address!");
          }
    }
  };
  
  const getItemsForOrder = async () => {
    if(orderNumber>0) {
        try {
            const itemsForOrder = await contract.methods.getItemsForOrder(orderNumber).call();
            console.log("Items for Order:", itemsForOrder);
            setItems(itemsForOrder);

          } catch (error) {
            console.error("Error getting items for order:", error);
            setText("Error getting items for orders!");
          }
    }
    
  };
  
  const getQuantitiesOfItemForOrder = async () => {
    if(orderNumber>0 && givenItem) {
        try {
            const _quantity = await contract.methods.getQuantitiesOfItemForOrder(orderNumber, givenItem).call();
            setQuantity(Number(_quantity))
            console.log(`Quantity of ${givenItem} for Order ${orderNumber} :`, quantity);
          } catch (error) {
            console.error("Error getting quantity of item for order:", error);
            setText("Error getting quantity of items for orders!");
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

    setText("");
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

    setText("");
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

    setText("");
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

    setText("");
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

    setText("");
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

    setText("");
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
    setText("");
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
    setText("");
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
    setText("");
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

    setText("");
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

    setText("");
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

    setText("");
  };

  const isOwner = account === "0x5Fe091C06EF6329f86186fb7c0C7F142AA62Ea83";

  return (
    <div>
      <div className="title">Shipment Service</div>
      {walletConnected ? (
        <>
          <p className="account-connected-text">Connected Account: {account}</p>
          {isOwner ? ( // Display owner-specific functionality
            <div className="form-container">
                <div className="button-container">
                    <button className="action-button" onClick={handleShipAndCreateOtpsClick}>Ship Order</button>
                    <button className="action-button" onClick={handleGetProcessingOrdersClick}>View Processing Orders</button>
                    <button className="action-button" onClick={handleGetShippedOrdersClick}>View Shipped Orders</button>
                    <button className="action-button" onClick={handleGetDeliveredOrdersClick}>View Delivered Orders</button>
                </div>
                <div className="input-container"> 
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
                        <button className="internal-button" onClick={ShipAndCreateOtp}>Dispatch order</button>
                        <p>{text}</p>
                    </div>
                    )}
                    {showGetProcessingOrders && (
                        <div>
                            <p>Orders in processing stage:</p>
                            <ul>
                            {processingOrders.map((order) => (
                                <li key={order}>Order #{order}</li>
                            ))}
                            </ul>
                            <p>{text}</p>
                      </div>
                    )}
                    {showGetShippedOrders && (
                        <div>
                            <p>Orders shipped:</p>
                            <ul>
                            {shippedOrders.map((order) => (
                                <li key={order}>Order #{order}</li>
                            ))}
                            </ul>
                            <p>{text}</p>
                        </div>
                    )}
                    {showGetDeliveredOrders && (
                        <div>
                            <p>Orders delivered:</p>
                            <ul>
                            {deliveredOrders.map((order) => (
                                <li key={order}>Order #{order}</li>
                            ))}
                            </ul>
                            <p>{text}</p>
                        </div>
                    )}
                </div>
            </div>
          ) : (
            <div className="form-container">
              <div className="button-container">
                <button className="action-button" onClick={handleCreateOrderClick}>Create Order</button>
                <button className="action-button" onClick={handleGetOTPClick}>Get OTP</button>
                <button className="action-button" onClick={handleAcceptOrderClick}>Accept Order</button>
                <button className="action-button" onClick={handleCancelOrderClick}>Cancel Order</button>
              </div>
              <div className="input-container">
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
                    <button className="internal-button" onClick={createOrder}>Place Order</button>
                    <p className="account-connected-text">Order Number: {orderNumber}</p>
                    <p>{text}</p>
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
                    <button className="internal-button" onClick={getOTPForOrder}>Get OTP</button>
                    <p>{displayOTP}</p>
                    <p>{text}</p>
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
                    <button className="internal-button" onClick={acceptOrder}>Accept Order</button>
                    <p>{text}</p>
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
                    <button className="internal-button" onClick={cancelOrder}>Cancel Order</button>
                    <p>{text}</p>
                  </div>
                )}
                
              </div>
            </div>
          )}
          <div className="form-container">
            <div className="button-container">
                <button className="action-button" onClick={handleGetOrderStatusClick}>Get Order Status</button>
                <button className="action-button" onClick={handleGetOrdersForAddressClick}>Get Orders for an address</button>
                <button className="action-button" onClick={handleGetItemsForOrderClick}>Get items in an Order</button>
                <button className="action-button" onClick={handleGetQuantitiesOfItemForOrderClick}>Get quantities of items in a order</button>
            </div>
            <div className="input-container">
                {showGetOrderStatus && (
                    <div>
                        <input
                        type="number"
                        placeholder="Order Number"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(parseInt(e.target.value))}
                        />
                        <button className="internal-button" onClick={getOrderStatus}>Get Order Status</button>
                        <p>Order Status: {orderStatus}</p>
                        <p>{text}</p>
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
                        <button className="internal-button" onClick={getOrdersForAddress}>Get Details</button>
                        <div>
                            <p>Orders for address {givenAddress} are :</p>
                            <ul>
                            {ordersAddress.map((order) => (
                                <li key={order}>Order #{order}</li>
                            ))}
                            </ul>
                      </div>
                      <p>{text}</p>
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
                        <button className="internal-button" onClick={getItemsForOrder}>Get Details</button>
                        <p>Items for Order: {items.join(", ")}</p>
                        <p>{text}</p>
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
                            onChange={(e) => setgivenItem(e.target.value)}
                        />
                        <button className="internal-button" onClick={getQuantitiesOfItemForOrder}>Get Details</button>
                        <p>Quantity of {givenItem} for Order {orderNumber} : {quantity}</p>
                        <p>{text}</p>
                    </div>
                )}
            </div>  
          </div>
        </>
      ) : (
        <div className="connect-wallet-container">
            <button className="connect-wallet-button" onClick={connectToWeb3}>Connect to Web3</button>
        </div>
      )}

        <div className="footer-container">
            <img alt="Github Logo" className="github-logo" src={githubLogo} />
            <a
                className="footer-text"
                href={'https://github.com/reethuthota'}
                target="_blank"
                rel="noreferrer"
            >{`@reethuthota`}</a>
            <a
                className="footer-text"
                href={'https://github.com/shreyasrajiv327'}
                target="_blank"
                rel="noreferrer"
            >{`@shreyasrajiv`}</a>
        </div>
    </div>
  );
}

export default ShipmentServiceApp;