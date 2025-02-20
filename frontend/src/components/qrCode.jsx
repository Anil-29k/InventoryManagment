import React, { useState, useEffect } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { QrReader } from "@blackbox-vision/react-qr-reader";
import axios from "axios";

const InventoryQR = () => {
  const [inventory, setInventory] = useState([]);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [newItem, setNewItem] = useState({ name: "", quantity: 0, price: 0 });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axios.get("http://localhost:5000/inventory");
      setInventory(response.data);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const handleScan = (result) => {
    if (result) {
      setScanResult(result.text);
    }
  };

  const handleDelete = async (itemId) => {
    if (!itemId) {
      console.error("Error: Missing item ID.");
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:5000/inventory/${itemId}`);

      console.log("Delete response:", response.data);

      fetchInventory(); // Refresh inventory list
    } catch (error) {
      console.error("Error deleting item:", error.response?.data || error.message);
    }
  };

  const handleUpdate = async (id, quantityChange) => {
    try {
      const response = await axios.put(`http://localhost:5000/inventory/${id}`, { quantity: quantityChange });
      console.log("Updated item:", response.data);
      fetchInventory();
    } catch (error) {
      console.error("Error updating item:", error.response?.data || error.message);
    }
  };
  const handleAddItem = async () => {
    if (!newItem.name || newItem.quantity <= 0 || newItem.price <= 0) {
      console.error("Invalid item data:", newItem);
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/inventory", newItem);

      console.log("Response from server:", response.data);

      if (!response.data || !response.data._id) {
        throw new Error("Unexpected response format from server");
      }

      setNewItem({ name: "", quantity: 0, price: 0 });
      fetchInventory(); // Refresh inventory
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };



  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Inventory Management</h2>
      <div className="mb-4 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold">Add New Item</h3>
        <input
          type="text"
          placeholder="Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-2 rounded w-full mt-2"
        />
        <input
          type="number"
          placeholder="Quantity"
          value={newItem.quantity}
          onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
          className="border p-2 rounded w-full mt-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
          className="border p-2 rounded w-full mt-2"
        />
        <button onClick={handleAddItem} className="bg-green-500 text-white px-3 py-2 mt-2 rounded w-full">Add Item</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {inventory.map((item) => (
          <div key={item._id} className="border p-4 rounded-lg shadow-lg text-center">
            <h3 className="font-semibold mb-2">{item.name}</h3>
            <QRCodeCanvas value={item.qrCode} size={256} />
            <p className="mt-2">Quantity: {item.quantity}</p>
            <p>Price: ₹{item.price}</p>
            <button onClick={() => handleDelete(item._id)} className="bg-red-500 text-white px-3 py-1 mt-2 rounded">Delete</button>
            <button onClick={() => handleUpdate(item._id, 1)}>➕ Add</button>
            <button onClick={() => handleUpdate(item._id, -1)}>➖ Remove</button>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Scan QR Code</h2>

        {/* Button to Start Scanning */}
        {!scanning ? (
          <button
            onClick={() => setScanning(true)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700"
          >
            📷 Scan QR Code
          </button>
        ) : (
          <div>
            <QrReader
              onResult={(result, error) => {
                if (result) {
                  console.log("QR Code detected:", result.text);
                  setScanResult(result.text);
                  handleScan(result.text);
                  setScanning(false); // Close scanner after successful scan
                } else if (error) {
                  console.error("QR Scan Error:", error);
                }
              }}
              constraints={{ facingMode: "environment" }}
              className="w-full max-w-md mx-auto border rounded-lg shadow-md"
            />

            {/* Cancel Button */}
            <button
              onClick={() => setScanning(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600"
            >
              ❌ Cancel
            </button>
          </div>
        )}

        {/* Show Scanned Result */}
        {scanResult && (
          <p className="mt-4 text-lg font-semibold">Scanned Data: {scanResult}</p>
        )}
      </div>
    </div>
  );
};

export default InventoryQR;
