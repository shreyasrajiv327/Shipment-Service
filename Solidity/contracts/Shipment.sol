// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipmentService {
    address public owner;

    constructor() {
        owner = msg.sender; 
    }
    event OrderCreated(uint256 indexed orderNumber, address indexed customer, string item, uint quantity);

    uint256 public orderNumber = 0;

    // Mapping to track the order number for of an order with it's address
    mapping(uint256 => address) public customerOrders;
    
    // Mapping to store items for each order
    mapping(uint256 => string[]) public itemsForOrder;

    // Nested mapping to store quantities of each item for a given order
    mapping(uint256 => mapping(string => uint)) public quantitiesOfItemForOrder;

    // Mapping to store order status for each order
    mapping(uint256 => OrderStatuses) public orderStatus;

    // Mapping to store order OTP for each order
    mapping(uint256 => uint) public orderOTP;

    // Mapping to store order cost for each order
    mapping(uint256 => uint) public orderCosts;

    // Mapping to store order cost for cancellation of order
    mapping(uint256 => uint) public orderCancellationRefunds;

    enum OrderStatuses {Invalid, Processing, Shipped, Delivered, Canceled}

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can perform this action");
        _;
    }

    modifier onlyCustomer() {
        require(msg.sender != owner, "Owner cannot perform this action");
        _;
    }

    // This function is for owner to set the otp for an order and ship it.
    function ShipAndCreateOtp(uint256 _orderNumber, uint otp) public onlyOwner {
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        require(orderStatus[_orderNumber] != OrderStatuses.Delivered, "Order has been delivered");
        require(orderStatus[_orderNumber] != OrderStatuses.Shipped, "Order has already been shipped");
        require(otp >= 999 && otp <= 9999, "Invalid OTP entered.");
  
        orderStatus[_orderNumber] = OrderStatuses.Shipped;
        orderOTP[_orderNumber] = otp;
    }

    // This function is for customer to get the OTP for their order
    function getOTP(uint256 _orderNumber) public view onlyCustomer returns (uint) {
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        require(orderStatus[_orderNumber] == OrderStatuses.Shipped, "Order has not been shipped yet");
        return orderOTP[_orderNumber];
    }

    // This function is for customer to create order
    function createOrder(string memory _item, uint _quantity) public payable onlyCustomer returns(uint256)  {
        require(bytes(_item).length > 0, "Item name cannot be empty");
        require(_quantity > 0, "Quantity must be greater than zero");

        uint orderCost = calculateOrderCost(_item, _quantity); // Calculate order cost
        require(msg.value >= orderCost, "Insufficient payment for the order");

        orderNumber++;
        customerOrders[orderNumber] = msg.sender;
        itemsForOrder[orderNumber].push(_item);
        quantitiesOfItemForOrder[orderNumber][_item] += _quantity;
        orderStatus[orderNumber] = OrderStatuses.Processing;

        // Transfer payment to contract owner
        payable(owner).transfer(msg.value);

        orderCosts[orderNumber] = orderCost;
        emit OrderCreated(orderNumber, msg.sender, _item, _quantity);
        return orderNumber;
    }

    // Function to calculate the cost of an order
    function calculateOrderCost(string memory _item, uint _quantity) internal pure returns (uint) {
        uint itemPrice;
        if (keccak256(abi.encodePacked(_item)) == keccak256(abi.encodePacked("fruit"))) {
            itemPrice = 1; 
        } else if (keccak256(abi.encodePacked(_item)) == keccak256(abi.encodePacked("furniture"))){
            itemPrice = 3;
        } else if (keccak256(abi.encodePacked(_item)) == keccak256(abi.encodePacked("computer"))){
            itemPrice = 4;
        } else {
            itemPrice = 2;
        } 
        
        return itemPrice * _quantity;
    }
    
    // Function for customer to accept order
    function acceptOrder(uint256 _orderNumber, uint otp) public onlyCustomer {
        require(customerOrders[_orderNumber] == msg.sender, "Only address that placed the order can accept it.");
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        require(orderOTP[_orderNumber] == otp, "Wrong OTP, please try again");
        orderStatus[_orderNumber] = OrderStatuses.Delivered;
    }

    // Function for customer to cancel their order and get a refund
    function cancelOrder(uint256 _orderNumber) public payable onlyCustomer {
        require(customerOrders[_orderNumber] == msg.sender, "Only address that placed the order can cancel it.");
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        require(orderStatus[_orderNumber] == OrderStatuses.Processing, "Order cannot be canceled");
        
        uint amountToRefund = (orderCosts[_orderNumber] * 90) / 100;
        orderStatus[_orderNumber] = OrderStatuses.Canceled;
        
        // Transfer refund to customer
        payable(msg.sender).transfer(amountToRefund);
        orderCancellationRefunds[_orderNumber] = amountToRefund;
    }

    // Gets the status of any order
    function getOrderStatus(uint256 _orderNumber) public view returns (OrderStatuses) {
        return orderStatus[_orderNumber];
    }

    // Gets orders that are currently shipped
    function getShippedOrders() public view onlyOwner returns (uint256[] memory) {
        uint256[] memory shippedOrders = new uint256[](orderNumber);
        uint num = 0;
        for (uint i = 1; i <= orderNumber; i++) {
            if (orderStatus[i] == OrderStatuses.Shipped) {
                shippedOrders[num] = i;
                num++;
            }
        }
        return shippedOrders;
    }

    // Gets orders that are currently being processed
    function getProcessingOrders() public view onlyOwner returns (uint256[] memory) {
        uint256[] memory processingOrders = new uint256[](orderNumber);
        uint num = 0;
        for (uint i = 1; i <= orderNumber; i++) {
            if (orderStatus[i] == OrderStatuses.Processing) {
               processingOrders[num] = i;
                num++;
            }
        }
        return processingOrders;
    }

    // Gets orders that are currently being processed
    function getDeliveredOrders() public view onlyOwner returns (uint256[] memory) {
        uint256[] memory deliveredOrders = new uint256[](orderNumber);
        uint num = 0;
        for (uint i = 1; i <= orderNumber; i++) {
            if (orderStatus[i] == OrderStatuses.Delivered) {
               deliveredOrders[num] = i;
                num++;
            }
        }
        return deliveredOrders;
    }

    // Gets orders for a particular address
    function getOrdersForAddress(address _addr) public view returns (uint256[] memory) {
        uint256[] memory ordersForAddress = new uint256[](orderNumber);
        uint num = 0;
        for (uint i = 1; i <= orderNumber; i++) {
            if (customerOrders[i] == _addr) {
                ordersForAddress[num] = i;
                num++;
            }
        }
        return ordersForAddress;
    }

    // Gets items in a order
    function getItemsForOrder(uint256 _orderNumber) public view returns (string[] memory) {
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        return itemsForOrder[_orderNumber];
    }

    // Gets quantities of items in a order
    function getQuantitiesOfItemForOrder(uint256 _orderNumber, string memory _item) public view returns (uint) {
        require(orderStatus[_orderNumber] != OrderStatuses.Invalid, "Order number is invalid");
        return quantitiesOfItemForOrder[_orderNumber][_item];
    }
}
