// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ShipmentService {
    address public owner;

    // Mapping to store items for each customer address
    mapping(address => string[]) public itemsForAddress;

    // Nested mapping to store quantities for each item and customer address
    mapping(address => mapping(string => uint)) public quantitiesForItemAndAddress;

    // Mapping to store order status for each customer address
    mapping(address => OrderStatus) public orderStatus;

    // Mapping to store order OTP for each customer address
    mapping(address => uint) public orderOTP;

    // Mapping to track whether an address has active orders
    mapping(address => bool) public addressExists;

    // Array to store active orders
    address[] public activeOrders;

    enum OrderStatus { NoOrdersPlaced, Shipped, Delivered }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the Owner can Perform this action");
        _;
    }

    modifier onlyCustomer() {
        require(addressExists[msg.sender], "You have no active orders");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function shipWithPin(address customerAddress, uint pin) public onlyOwner {
        require(orderStatus[customerAddress] != OrderStatus.Shipped, "Another order has been shipped to this address");
        require(pin >= 999 && pin <= 9999, "Invalid pin entered");
  
        orderStatus[customerAddress] = OrderStatus.Shipped;
        orderOTP[customerAddress] = pin;
        addressExists[customerAddress] = true;
        activeOrders.push(customerAddress);
    }

    function getOTP() public view returns (uint) {
        return orderOTP[msg.sender];
    }

    function createOrder(string memory _item, uint _quantity) public {
        require(bytes(_item).length > 0, "Item name cannot be empty");
        require(_quantity > 0, "Quantity must be greater than zero");

        // Update items for the sender's address
        itemsForAddress[msg.sender].push(_item);

        // Update quantity for the item and sender's address
        quantitiesForItemAndAddress[msg.sender][_item] += _quantity;
    }

    function getActiveOrders() public view onlyOwner returns (address[] memory) {
        return activeOrders;
    }

    function getItemsForAddress(address _addr) public view returns (string[] memory) {
        return itemsForAddress[_addr];
    }

    function getQuantityForItemAndAddress(address _addr, string memory _item) public view returns (uint) {
        return quantitiesForItemAndAddress[_addr][_item];
    }
}
