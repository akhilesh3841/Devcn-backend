import mongoose, { mongo } from "mongoose";



const messageSchema=new mongoose.Schema({

        senderId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true
        },



        text:{
            type:String,
            required:true
        }

},{
    timestamps:true
})

const chatSchema=new mongoose.Schema(
    {
        participants:[
            {type:mongoose.Schema.Types.ObjectId,ref:"User",required:true}
        ],

        messages:[messageSchema]
    }
)


export const Chatstore=mongoose.model("Chatstore",chatSchema)