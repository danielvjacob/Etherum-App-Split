// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Item {
        uint id;
        string name;
        uint price;
        address payable seller;
        bool sold;
    }

    Item[] public items;
    uint public nextItemId;

    function listItem(string memory name, uint price) public {
        require(price > 0, "Price must be greater than zero");
        items.push(Item(nextItemId, name, price, payable(msg.sender), false));
        nextItemId++;
    }

    function buyItem(uint itemId) public payable {
        require(itemId < items.length && items[itemId].id == itemId, "Item does not exist");
        Item storage item = items[itemId];
        require(msg.value >= item.price, "Not enough Ether provided");
        require(!item.sold, "Item already sold");
        item.seller.transfer(msg.value);
        item.sold = true;
    }

    function getItemsCount() public view returns (uint) {
        return items.length;
    }
    
    function getAllItems() external view returns (Item[] memory) {
        return items;
    }
}
