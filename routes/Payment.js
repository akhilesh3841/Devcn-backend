import express from 'express';
import { userauth } from '../middlewares/auth.js';
import razorpayinstance from "../utils/razorpay.js";

import {Payment} from "../models/payment.js"
import membershipAmount from '../utils/constant.js';
const router = express.Router();

import {validateWebhookSignature} from 'razorpay/dist/utils/razorpay-utils.js'
import { User } from '../models/user.js';

router.post("/createpay", userauth, async (req, res) => {
  try {

    const {membershipType}=req.body;

    const {firstName,lastName,emailId}=req.user;

    const order = await razorpayinstance.orders.create({
      amount: membershipAmount[membershipType]*100, // in paise
      currency: "INR",
      receipt: "receipt#1",
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType
      }
    });


    //save in db
    const payment=new Payment({
        userId:req.user._id,
        orderId:order.id,
        status:order.status,
        amount:order.amount,
        currency:order.currency,
        receipt:order.receipt,
        notes:order.notes,
    })

    const paymentsaved=await payment.save();



res.status(200).json({
  success: true,
  amount: order.amount,
  currency: order.currency,
  keyId: process.env.RAZORPAY_KEYID,
  notes: order.notes,
  orderId: order.id
});



  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


router.post("/api/webhook", async (req, res) => {
    try {
        const webhookSignature = req.get("X-Razorpay-Signature");

        if (!webhookSignature) {
            return res.status(400).json({ msg: "Missing webhook signature" });
        }

        const payload = req.body.toString('utf8'); // if using raw body
        const isWebhookValid = validateWebhookSignature(
            payload,
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK
        );

        if (!isWebhookValid) {
            return res.status(400).json({ msg: "Invalid webhook signature" });
        }

        const body = JSON.parse(payload);
        const paymentDetails = body.payload.payment.entity;

        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        if (!payment) return res.status(404).json({ msg: "Payment not found" });

        payment.status = paymentDetails.status;
        await payment.save();

        const user = await User.findOne({ _id: payment.userId });
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.isPremium = true;
        user.membershipType = paymentDetails.notes.membershipType;
        await user.save();

        return res.status(200).json({ msg: "Webhook received successfully" });
    } catch (error) {
        console.error("Webhook error:", error);
        return res.status(500).json({ msg: error.message });
    }
});

export default router;
