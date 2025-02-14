


import mongoose from "mongoose";

const connectionreqSchema = new mongoose.Schema({
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is incorrect status type`
        },
        required: true
    }
}, { timestamps: true }); // ✅ Correct placement of timestamps



connectionreqSchema.index({
    fromUserId:1,
    toUserId:1
})


export const Connectionreq = mongoose.model("Connectionreq", connectionreqSchema);



