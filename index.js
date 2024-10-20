const Razorpay = require('razorpay');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const app = express();
var dotenv = require('dotenv');
dotenv.config()
bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())
app.listen(3000, () => {
  console.log('Server is running on port 3000');
})

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret, // Replace with your Razorpay key secret
});

// Create a Razorpay order API
app.post('/create-order', async (req, res) => {
  const { amount, currency } = req.body
  try {
    const options = {
      amount: amount, // Amount in paise (1 INR = 100 paise)
      currency: currency,
      receipt: `receipt_${new Date().getTime()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ error: 'Error creating Razorpay order' });
  }
});

// Verify payment signature
app.post('/verify-payment', (req, res) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.razorpay_secret) // Use your Razorpay secret key here
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});