
import { Connectionreq } from "../models/connectionreq.js";
import { User } from "../models/user.js";

export const ignoredorinterested = async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;

        //check for the valid status type
        const allowedstatus=["ignored","interested"];
        if(!allowedstatus.includes(status)){
            return res.status(400).json({ message: "Invalid status type" });
        }

        //check karo ki joloing user hai wo khud ko interested and ignored ka message to ni bhej rha
        if(fromUserId.equals(toUserId)){
            throw new Error("cannot send connection to urself")
        }

        //check to userid is in the db or not
        const touser=await User.findById(toUserId);
        if(!touser){
            return res.status(404).json({message:"user not found"});
        }

        //check if the request already exists
        const existingreq=await Connectionreq.findOne({
            $or:[
                {   fromUserId,toUserId},
                {   fromUserId: toUserId,toUserId: fromUserId}
            ]
        })

        if(existingreq){
            return res.status(200).json({
                message:"Request already exists",
            })
        }

        // ✅ Correct field names matching the schema
        const request = new Connectionreq({
            fromUserId: fromUserId,
            toUserId: toUserId,     
            status: status
        });

        const data = await request.save();

        res.status(200).json({
            message: "Request sent successfully",
            data
        });

    } catch (error) {
        res.status(400).send("Error: " + error.message);
    }
};


export const acceptedOrRejected = async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
  
        const allowedStatus = ["accepted", "rejected"];
        if (!allowedStatus.includes(status)) {
          return res.status(400).json({ messaage: "Status not allowed!" });
        }
  
        const connectionRequest = await Connectionreq.findOne({
          _id: requestId,
          toUserId: loggedInUser._id,
          status: "interested",
        });
        if (!connectionRequest) {
          return res
            .status(404)
            .json({ message: "Connection request not found" });
        }
  
        connectionRequest.status = status;
  
        const data = await connectionRequest.save();
  
        res.json({ message: "Connection request " + status, data });
      } catch (err) {
        res.status(400).send("ERROR: " + err.message);
      }
    }




