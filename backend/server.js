const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const qr = require("qrcode");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

const inventorySchema = new mongoose.Schema(
  {
    name: String,
    quantity: Number,
    price: Number,
    qrCode: String,
  },
  { timestamps: true }
);

const Inventory = mongoose.model("Inventory", inventorySchema);

const generateQRCode = async (text) => {
  try {
    return await qr.toDataURL(text);
  } catch (err) {
    console.error("QR Code Generation Error:", err);
    return null;
  }
};

app.get("/inventory", async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/inventory/:id", async (req, res) => {
  try {
    const item = await Inventory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/inventory", async (req, res) => {
  try {
    const { name, quantity, price } = req.body;
    const qrCode = await generateQRCode(name);
    const newItem = new Inventory({ name, quantity, price, qrCode });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


app.put("/inventory/:id", async (req, res) => {
    try {
        const { name, quantity, price } = req.body;

        console.log("Received update request for ID:", req.params.id);
        console.log("Update data:", req.body);

        const existingItem = await Inventory.findById(req.params.id);
        if (!existingItem) return res.status(404).json({ message: "Item not found" });

        // Update quantity instead of replacing
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity < 0) {
            return res.status(400).json({ message: "Insufficient stock to remove" });
        }

        const qrCode = name ? await generateQRCode(name) : existingItem.qrCode; // Keep existing QR if name unchanged

        const updatedItem = await Inventory.findByIdAndUpdate(
            req.params.id,
            { name, quantity: newQuantity, price, qrCode },
            { new: true }
        );

        res.json(updatedItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



app.delete("/inventory/:id", async (req, res) => {
  try {
    const item = await Inventory.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


app.get("/", (req, res) => {
  res.send("QR Inventory Management API is running");
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
});
