import { Connectionreq } from "../models/connectionreq.js";
import { User } from "../models/user.js";


export const UserReq=async(req,res)=>{
    try {
        const loggedInUser=req.user;

        const pendingReq=await Connectionreq.find({
            toUserId:loggedInUser._id,
            status:"interested"
        }).populate("fromUserId",["firstName", "lastName","age","skills","about","photoUrl"]);
        //refernce datbase se dta fetch karta hai
        res.status(200).json({
            pendingReq,
        })        
    } catch (error) {
        res.status(500).json({
            message:error.message,
        })
    }
}


export const UserConnection = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: No user logged in" });
        }

        const loggedInUser = req.user;

        const connectionreq = await Connectionreq.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" }
            ]
        })
        .populate("fromUserId", "firstName lastName about skills photoUrl")
        .populate("toUserId", "firstName lastName about skills photoUrl");

        const data = connectionreq.map((row) => 
            row.fromUserId._id.toString() === loggedInUser._id.toString()
                ? row.toUserId
                : row.fromUserId
        );

        res.status(200).json({ data });

    } catch (error) {
        res.status(500).json({ message: error.message }); // Fixed `.josn()` typo
    }
};


export const feed=async(req,res)=>{

    try {

        //user should see all the profile except 
        //his own,his all accepted ,ignored peroples ,already sent to the conneftikn req

        const loggedInUser=req.user;

        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||10;
        const skip=(page-1)*limit;


        const connectionreq=await Connectionreq.find({
            $or:[
                {fromUserId:loggedInUser._id},
                {toUserId:loggedInUser._id}
            ]
        }).select("fromUserId toUserId")
        // .populate("fromUserId", "firstName lastName")
        // .populate("toUserId", "firstName lastName");

        const hideUsesrsfromfeed=new Set();
        for (const req of connectionreq) {
            hideUsesrsfromfeed.add(req.fromUserId._id.toString());
            hideUsesrsfromfeed.add(req.toUserId._id.toString());
        }

        // console.log(hideUsesrsfromfeed);

        const users=await User.find({
            $and:[
                { _id: { $nin: [...hideUsesrsfromfeed] } },
                { _id: { $ne: loggedInUser._id } }
            ]
        }
        ).select("firstName lastName photoUrl about skills").skip(skip).limit(limit)

        

        res.status(200).json({
            users,
        })




    } catch (error) {
        res.status(500).json({

        })
    }
}