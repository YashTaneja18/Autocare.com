const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const session = require('express-session');
const path=require('path');
const app = express();
const Razorpay = require("razorpay");
require("dotenv").config();
const cors = require('cors');
const crypto = require("crypto");

const http = require('http');
const fetchCartData = require('./fetchCartData');



// MySQL connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Yas@2004',
    database: 'autocare',
    debug: true
});
connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'timing.html')));
app.use(express.static(path.join(__dirname, 'compressor.html')));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files
app.use(session({
    secret: '4f6e9a8724b3b8d1d9e8fa4f4e3c3aef6b7c8d6e5f4a3b2c1d0e9f8a7b6c5d4e',
    resave: false,
    saveUninitialized: false,
}));

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id:"rzp_test_nzh24hfUXQSQpC",
    key_secret: "LBAxJ0oJfaWvYDyS8afqKHxH",
});

app.post('/order1', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 1001;
    const unitPrice = 350; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Timing Belt", ?, ?, ?, ?)';
                connection.query(insertQuery, ["a", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order2', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 1002;
    const unitPrice = 450; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Timing Belt", ?, ?, ?, ?)';
                connection.query(insertQuery, ["b", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order3', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 1003;
    const unitPrice = 126; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Timing Belt", ?, ?, ?, ?)';
                connection.query(insertQuery, ["c", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});



app.post('/order4', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 2001;
    const unitPrice = 750; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "AC Compressor", ?, ?, ?, ?)';
                connection.query(insertQuery, ["d", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order5', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 2002;
    const unitPrice = 855; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "AC Compressor", ?, ?, ?, ?)';
                connection.query(insertQuery, ["e", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order6', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 2003;
    const unitPrice = 985; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "AC Compressor", ?, ?, ?, ?)';
                connection.query(insertQuery, ["f", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order7', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 3001;
    const unitPrice = 750; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternate Pulley", ?, ?, ?, ?)';
                connection.query(insertQuery, ["g", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order8', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 3002;
    const unitPrice = 999; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternate Pulley", ?, ?, ?, ?)';
                connection.query(insertQuery, ["h", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});



app.post('/order9', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 3003;
    const unitPrice = 855; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern=req.session.username;
    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }
        
        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo,usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock

                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo,usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternate Pulley", ?, ?, ?, ?)';
                connection.query(insertQuery, ["i", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});
app.post('/order10', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 4001;
    const unitPrice = 300; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternator Bearing", ?, ?, ?, ?)';
                connection.query(insertQuery, ["j", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});

app.post('/order11', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 4002;
    const unitPrice = 120; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternator Bearing", ?, ?, ?, ?)';
                connection.query(insertQuery, ["k", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});


app.post('/order12', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 4003;
    const unitPrice = 250; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Alternator Bearing", ?, ?, ?, ?)';
                connection.query(insertQuery, ["l", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});

app.post('/order13', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 5001;
    const unitPrice = 5000; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Body Kit", ?, ?, ?, ?)';
                connection.query(insertQuery, ["m", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});

app.post('/order14', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 5002;
    const unitPrice = 4500; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Body Kit", ?, ?, ?, ?)';
                connection.query(insertQuery, ["n", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});

app.post('/order15', (req, res) => {
    let { quantity } = req.body;
    const itemNo = 5003;
    const unitPrice = 6499; // Price per unit
    quantity = parseInt(quantity, 10);
    const usern = req.session.username;

    // Step 1: Check available quantity in inventory
    const checkInventoryQuery = 'SELECT Quantity FROM parts WHERE Partno = ?';
    connection.query(checkInventoryQuery, [itemNo], (err, results) => {
        if (err) {
            console.error('Error checking inventory:', err);
            return res.status(500).send('Error checking inventory');
        }

        if (results.length === 0) {
            return res.status(400).send('Item not found in inventory');
        }

        let availableQuantity = results[0].Quantity;

        if (quantity > availableQuantity) {
            return res.send(`<script>alert("Selected quantity is not available!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        if (quantity <= 0) {
            return res.send(`<script>alert("Item is out of stock!"); window.location.href="http://localhost:3000/cartData";</script>`);
        }

        // Step 2: Check if the item already exists in the cart
        const checkCartQuery = 'SELECT Quantity FROM cart WHERE Itemno = ? AND username = ?';
        connection.query(checkCartQuery, [itemNo, usern], (err, cartResults) => {
            if (err) {
                console.error('Error checking cart:', err);
                return res.status(500).send('Error checking cart');
            }

            if (cartResults.length > 0) {
                // Item exists in cart, update quantity and price
                let existingQuantity = parseInt(cartResults[0].Quantity, 10);
                let newQuantity = existingQuantity + quantity;
                let newPrice = newQuantity * unitPrice;

                // Ensure new quantity does not exceed available stock
                const updateCartQuery = 'UPDATE cart SET Quantity = ?, Price = ? WHERE Itemno = ? AND username = ?';
                connection.query(updateCartQuery, [newQuantity, newPrice, itemNo, usern], err => {
                    if (err) {
                        console.error('Error updating cart:', err);
                        return res.status(500).send('Error updating cart');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('Cart updated with new quantity & price. Inventory adjusted.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            } else {
                // Item does not exist in cart, insert new entry
                const insertQuery = 'INSERT INTO cart (imgsource, Itemname, Itemno, Quantity, Price, username) VALUES (?, "Body Kit", ?, ?, ?, ?)';
                connection.query(insertQuery, ["o", itemNo, quantity, (quantity * unitPrice), usern], err => {
                    if (err) {
                        console.error('Error adding record:', err);
                        return res.status(500).send('Error adding record');
                    }

                    // Step 3: Reduce inventory quantity
                    const updateInventoryQuery = 'UPDATE parts SET Quantity = Quantity - ? WHERE Partno = ?';
                    connection.query(updateInventoryQuery, [quantity, itemNo], err => {
                        if (err) {
                            console.error('Error updating inventory:', err);
                            return res.status(500).send('Error updating inventory');
                        }

                        console.log('New record added and inventory updated.');
                        return res.redirect('http://localhost:3000/cartData');
                    });
                });
            }
        });
    });
});



app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'signup.html'));
});

app.get('/timingbelt.html', (req, res) => {
    res.sendFile(path.join(__dirname , 'timingbelt.html'));
});

app.get('/timingbelt2.html', (req, res) => {
    res.sendFile(path.join(__dirname , 'timingbelt2.html'));
});

app.get('/timingbelt3.html', (req, res) => {
    res.sendFile(path.join(__dirname , 'timingbelt3.html'));
});

app.get('/compressor.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'compressor.html'));
  });

app.get('/compressor2.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'compressor2.html'));
  });

app.get('/compressor3.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'compressor3.html'));
  });

app.get('/alternatepulley.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'alternatepulley.html'));
});  

app.get('/alternatepulley2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'alternatepulley2.html'));
});  

app.get('/alternatepulley3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'alternatepulley3.html'));
});  

app.get('/bearings.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'bearings.html'));
});  

app.get('/bearings2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'bearings2.html'));
}); 

app.get('/bearings3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'bearings3.html'));
}); 

app.get('/exterior.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'exterior.html'));
}); 

app.get('/exterior2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'exterior2.html'));
}); 

app.get('/exterior3.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'exterior3.html'));
}); 

app.get('/redirect', (req, res) => {
    res.redirect('http://localhost:3000/cartData');
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname , 'profile.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
  });  


// Create a Razorpay Order
app.post("/create-order", async (req, res) => {
  try {
      const { amount } = req.body;
      const options = {
          amount: amount * 100, // Convert to paise
          currency: "INR",
          receipt: `order_rcptid_${Date.now()}`
      };

      const order = await razorpay.orders.create(options); // ✅ Use the initialized Razorpay instance
      res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
      console.error("Razorpay Order Creation Error:", error); // Log error
      res.status(500).json({ error: error.message });
  }
});


// Verify Razorpay Payment
app.post("/verify-payment", async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const secret = "LBAxJ0oJfaWvYDyS8afqKHxH";

    const generated_signature = crypto
        .createHmac("sha256", secret)
        .update(razorpay_order_id + "|" + razorpay_payment_id)
        .digest("hex");

    if (generated_signature === razorpay_signature) {
        res.json({ success: true, message: "Payment verified successfully" });
    } else {
        res.status(400).json({ success: false, message: "Payment verification failed" });
    }
});
app.get('/cartData', (req, res) => {
    const usern = req.session.username;
  fetchCartData(usern,(err, rows) => {
      if (err) {
          res.status(500).send('Error fetching data from database');
          return;
      }

      let totalAmount = 0;
      let html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Cart</title>
      <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f8f9fa;
          }
          .container {
              width: 80%;
              margin: auto;
              overflow: hidden;
              background: #fff;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              margin-top: 20px;
          }
          h2 {
              text-align: center;
              color: #333;
          }
          table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
          }
          th, td {
              padding: 12px;
              text-align: left;
              border-bottom: 1px solid #ddd;
          }
          th {
              background-color: #007bff;
              color: white;
          }
          tr:hover {
              background-color: #f1f1f1;
          }
          button {
              display: block;
              width: 100%;
              padding: 10px;
              background: #28a745;
              color: white;
              border: none;
              border-radius: 5px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
          }
          button:hover {
              background: #218838;
          }
      </style>
      </head>
      <body>
          <div class="container">
              <h2>Shopping Cart</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Product</th>
                          <th>Product Number</th>
                          <th>Quantity</th>
                          <th>Total Price</th>
                      </tr>
                  </thead>
                  <tbody>`;

      rows.forEach(row => {
          totalAmount += row.Price;
          html += `
              <tr>
                  <td>${row.Itemname}</td>
                  <td>${row.Itemno}</td>
                  <td>${row.Quantity}</td>
                  <td>₹${row.Price}</td>
              </tr>`;
      });

      html += `  
                  </tbody>
              </table>
              <h3>Total Amount: ₹${totalAmount}</h3>
              <button onclick="initiatePayment(${totalAmount})">Pay with Razorpay</button>
          </div>

          <script>
              async function initiatePayment(amount) {
                  const response = await fetch("/create-order", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount: amount })
                  });
                  const data = await response.json();

                  const options = {
                      key: "rzp_test_nzh24hfUXQSQpC",
                      amount: data.amount,
                      currency: data.currency,
                      order_id: data.orderId,
                      name: "AutoCare",
                      description: "Payment for Cart Items",
                      handler: async function (response) {
                          const verifyResponse = await fetch("/verify-payment", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(response)
                          });

                          const verifyData = await verifyResponse.json();
                          if (verifyData.success) {
                              alert("Payment successful!");
                          } else {
                              alert("Payment verification failed!");
                          }
                      },
                      theme: { color: "#F37254" }
                  };

                  const rzp1 = new Razorpay(options);
                  rzp1.open();
              }
          </script>
      </body>
      </html>`;

      res.send(html);
  });
});
app.post("/login", (req, res) => {
    const { uname, psw } = req.body;
    const query = "SELECT * FROM userinfo WHERE username = ? AND password = ?";
    
    connection.query(query, [uname, psw], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).send("Internal Server Error");
        }
        if (results.length === 0) {
            return res.status(401).send("Invalid Credentials");
        }
        req.session.username = uname;
        console.log('${req.session.username}');
        res.json({ status: "OK", uname: uname });
    });
});
app.get("/get-user", (req, res) => {
    console.log("Session Data:", req.session); // Debugging
    if (req.session.username) {
        res.json({ username: req.session.username });
    } else {
        res.json({ username: null });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Logout failed');
        }
        res.send("OK"); // Redirect to login page
    });
});

app.get("/dashboard", (req, res) => {
    if (!req.session.username) {
        return res.send("Not logged in. <a href='/login.html'>Login</a>");
    }
    res.send(`<h1>Welcome, ${req.session.username}!</h1> <a href="/logout">Logout</a>`);
});

app.get('/get-profile', (req, res) => {
    // Assuming user information is stored in the session or JWT
    const username = req.session.username; // Or use your method to get the logged-in user

    if (!username) {
        return res.status(401).json({ success: false, message: 'User not logged in' });
    }

    // Query the database for the user's profile details
    connection.query('SELECT username, email, Firstname, Lastname, DOB FROM userinfo WHERE username = ?', [username], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error' });
        }

        if (result.length > 0) {
            const userProfile = result[0];
            return res.json({
                success: true,
                profile: {
                    username: userProfile.username,
                    email: userProfile.email,
                    Firstname: userProfile.Firstname,
                    Lastname: userProfile.Lastname,
                    DOB: userProfile.DOB
                }
            });
        } else {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
    });
});

app.post('/register', (req, res) => {
  const { fname, lname, dob, email, Username, psw } = req.body;

  const userData = {
    firstname: fname,
    lastname: lname,
    dob: dob, // assuming dob is a string in the format 'YYYY-MM-DD'
    email: email,
    username: Username,
    password: psw
  };

  const sql = 'INSERT INTO userinfo SET ?';

  connection.query(sql, userData, (err, result) => {
    if (err) {
      console.error('Error registering user: ' + err.stack);
      res.status(500).send('Error registering user');
      return;
    }

    console.log('User registered successfully');
    res.redirect("/login.html")
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
