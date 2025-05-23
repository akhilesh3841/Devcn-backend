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
  ...paymentsaved.toJSON(),
  keyId:process.env.RAZORPAY_KEYID
});



  } catch (error) {
    console.error("❌ Error creating Razorpay order:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});




router.post("/webhook",async(req,res)=>{
    try {

       console.log("Webhook Called");
     const webhookSignature = req.get("X-Razorpay-Signature");
          console.log("Webhook Signature", webhookSignature);

        const iswebhookvalid=validateWebhookSignature(
          JSON.stringify(req.body), 
          webhookSignature,
          process.env.RAZORPAY_WEBHOOK
        );


        if (!iswebhookvalid) {
      console.log("INvalid Webhook Signature");
      return res.status(400).json({ msg: "Webhook signature is invalid" });
    }
    console.log("Valid Webhook Signature");


        //update my payment sucess in db

        const paymentDetails=req.body.payload.payment.entity;

        const payment=await Payment.findOne({orderId:paymentDetails.order_id});
        payment.status=paymentDetails.status;
        await payment.save();
           console.log("Payment saved");


        //update user premimum
        const user=await User.findOne({_id:payment.userId});
        user.isPremium=true
        user.membershipType=payment.notes.membershipType
        console.log("User saved");
        await user.save();
        
        //return sucess response


        // if(req.body.event=="payment.captured"){

        // }
        // if(req.body.event=="payment.failed"){

        // }


        return res.status(200).json({
            msg:"webhook received sucessfully"
        })
          

    } catch (error) {

        return res.status(500).json({
            msg:error.message
        })
        
    }

})

router.get("/premiumverify",userauth,(req,res)=>{
  const user=req.user.toJSON();

  if(user.isPremium){
    return res.json({
      ...user
    })
  }
  else{
    return res.json({
      ...user
    })
  }

})


export default router;
