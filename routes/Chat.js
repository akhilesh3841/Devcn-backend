import express from "express";
import { Chatstore } from "../models/chat.js";
import { userauth } from "../middlewares/auth.js";
import { User } from "../models/user.js";
import mongoose from "mongoose";

const router = express.Router();

router.get("/store/:targetuserid", userauth, async (req, res) => {
  const { targetuserid } = req.params;
  const userId = req.user._id;

  try {
    let chat = await Chatstore.findOne({
      participants: { $all: [userId, targetuserid] },
    }).populate({
        path:"messages.senderId",
        select:"firstName lastName"
    });

    if (!chat) {
      chat = new Chatstore({
        participants: [userId, targetuserid],
        messages: [],
      });
      await chat.save();
    }

    res.json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
});






router.get("/checkpremium/:targetuserid",async(req,res)=>{

    const {targetuserid}=req.params;
    try {


        const targetuser=await User.findOne({
            _id:new mongoose.Types.ObjectId(targetuserid)

        }).select('isPremium firstName lastName photoUrl');


        if(!targetuser){
            return res.status(404).json({
                message: "User not found"
            });
        }



        return res.status(200).json({
            isPremium: targetuser.isPremium ,
            firstName:targetuser.firstName,
            lastName:targetuser.lastName,
            photoUrl:targetuser.photoUrl

        })
        
    } catch (error) {
        console.log(error)
    }
})

export default router;
