let web3;
let marketplace;
const ABIcontract = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "itemId",
        type: "uint256",
      },
    ],
    name: "buyItem",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "listItem",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllItems",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "id",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "address payable",
            name: "seller",
            type: "address",
          },
          {
            internalType: "bool",
            name: "sold",
            type: "bool",
          },
        ],
        internalType: "struct Marketplace.Item[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getItemsCount",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "items",
    outputs: [
      {
        internalType: "uint256",
        name: "id",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
      {
        internalType: "address payable",
        name: "seller",
        type: "address",
      },
      {
        internalType: "bool",
        name: "sold",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nextItemId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const contractAddress = "0x6003036C35038EE60f30d141a22393cF82821B19";

window.addEventListener("load", async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
      await window.ethereum.enable(); // Request account access
      initApp();
    } catch (error) {
      console.error("User denied account access");
    }
  } else if (window.web3) {
    web3 = new Web3(window.web3.currentProvider);
    initApp();
  } else {
    console.log(
      "Non-Ethereum browser detected. You should consider trying MetaMask!"
    );
  }
});

function initApp() {
  marketplace = new web3.eth.Contract(ABIcontract, contractAddress);
  loadItems();
}

async function listItem() {
  const name = document.getElementById("name").value;
  const price = document.getElementById("price").value;
  const accounts = await web3.eth.getAccounts();
  marketplace.methods
    .listItem(name, price)
    .send({ from: accounts[0] })
    .on("receipt", function (receipt) {
      console.log("Item listed successfully!");
      const item = { name: name, price: price }; // Create an item object
      displayTransactionHash("Listing", item, receipt.transactionHash); // Pass the transaction type and item details
      loadItems(); // Refresh the list
    })
    .on("error", function (error) {
      console.error("Error listing the item:", error);
    });
}

async function buyItem(itemId) {
  const accounts = await web3.eth.getAccounts();
  try {
    const item = await marketplace.methods.items(itemId).call();
    if (!item.sold) {
      marketplace.methods
        .buyItem(itemId)
        .send({ from: accounts[0], value: item.price })
        .on("receipt", function (receipt) {
          console.log("Item bought successfully!");
          displayTransactionHash("Buying", item, receipt.transactionHash); // Pass the transaction type and item details
          loadItems(); // Refresh the list
        })
        .on("error", function (error) {
          console.error("Error purchasing the item:", error);
        });
    } else {
      console.log("This item has already been sold.");
    }
  } catch (error) {
    console.error("Failed to fetch item details:", error);
  }
}

function displayTransactionHash(type, item, hash) {
  const hashList = document.getElementById("transactionHashes");
  const li = document.createElement("li");
  const link = document.createElement("a");
  link.href = `https://sepolia.etherscan.io/tx/${hash}`;
  link.textContent = `${type} transaction for "${item.name}" - Transaction Hash: ${hash}`;
  link.target = "_blank"; // Open in new tab
  li.appendChild(link);
  hashList.appendChild(li);
}

async function loadItems() {
  const itemsCount = await marketplace.methods.getItemsCount().call();
  const itemsList = document.getElementById("items");
  itemsList.innerHTML = "";

  for (let i = 0; i < itemsCount; i++) {
    const item = await marketplace.methods.items(i).call();
    const itemElement = document.createElement("li");
    itemElement.textContent = `Item ${item.id}: ${item.name} - ${item.price} Wei `;
    if (!item.sold) {
      const buyButton = document.createElement("button");
      buyButton.textContent = "Buy";
      buyButton.onclick = function () {
        buyItem(item.id);
      };
      itemElement.appendChild(buyButton);
    } else {
      itemElement.textContent += "(Sold)";
    }
    itemsList.appendChild(itemElement);
  }
}
