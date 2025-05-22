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
        console.log("[Webhook] Received:", req.body.event); // Debug

        const webhookSignature = req.get("X-Razorpay-Signature");
        
        if (!webhookSignature) {
            console.error("[Webhook] Missing signature");
            return res.status(400).json({ msg: "Missing webhook signature" });
        }

        // Validate signature
        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body), 
            webhookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if (!isWebhookValid) {
            console.error("[Webhook] Invalid signature");
            return res.status(400).json({ msg: "Invalid signature" });
        }

        // Only process successful payments
        if (req.body.event === "payment.captured") {
            const paymentDetails = req.body.payload.payment.entity;
            console.log("[Webhook] Payment ID:", paymentDetails.id); // Debug

            // Update payment status
            const payment = await Payment.findOneAndUpdate(
                { orderId: paymentDetails.order_id },
                { status: "Captured" },
                { new: true }
            );

            if (!payment) {
                console.error("[Webhook] Payment not found for order:", paymentDetails.order_id);
                return res.status(404).json({ msg: "Payment not found" });
            }

            // Update user premium status
            const user = await User.findOneAndUpdate(
                { _id: payment.userId },
                { 
                    isPremium: true,
                    membershipType: payment.notes.membershipType 
                },
                { new: true }
            );

            if (!user) {
                console.error("[Webhook] User not found:", payment.userId);
                return res.status(404).json({ msg: "User not found" });
            }

            console.log("[Webhook] Success: User upgraded to premium"); // Debug
            return res.status(200).json({ msg: "Webhook processed successfully" });
        }

        // For other events (like payment.failed), just acknowledge
        return res.status(200).json({ msg: "Webhook ignored (not payment.captured)" });

    } catch (error) {
        console.error("[Webhook] Error:", error);
        return res.status(500).json({ msg: "Server error", error: error.message });
    }
});

export default router;
