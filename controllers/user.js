import {User} from "../models/user.js";
import bcrypt from "bcrypt";

import {validateEditProfileData, validateSignUpData} from "../utils/validation.js"
import jwt from "jsonwebtoken"

export const register=async(req,res)=>{
    try {
        validateSignUpData(req);
        const {firstName,lastName,emailId,password} = req.body;
        const hashpassword=await bcrypt.hash(password,10);

        const user=new User({
            firstName,
            lastName, 
            emailId,
            password: hashpassword,
        })

        const saveduser=await user.save();

        res.status(201).json({
            message: "user saved successfully",
            saveduser,
        });
        
    } catch (error) {
        res.status(404).json({
            message:error.message,
        })
        console.log(error);
    }
}


export const login = async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await user.validatepassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = await user.getJWT();

 
        res.cookie("token", token, {
            httpOnly: true, // Secure cookie, can't be accessed by JavaScript
            secure: process.env.NODE_ENV === "production", // Secure in production
            sameSite: "strict",
        });

        res.status(200).json({
            message: "Logged in successfully",
            user,
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



export const profileview=async(req,res)=>{

    try {
        const user=req.user;
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        res.status(200).json({user});
        
    } catch (error) {
        res.status(500).json({message:error.message});
        console.error(error);
        
    }

}


export const logout=async(req,res)=>{

    try {
        res.cookie("token",null,{
            expires:new Date(Date.now()),
            httpOnly:true,
        })
        res.status(200).json({
            message:"Logged out successfully"
        })
    
    } catch (error) {
        res.status(500).json({message:error.message});       
    }

}

export const profileEdit = async (req, res) => {
    try {
        const validationResult = validateEditProfileData(req);
        if (!validationResult.isValid) {
            return res.status(400).json({ error: validationResult.message });
        }

        const loggedInUser = req.user;

        // Update only allowed fields
        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key];
        });

        // Save the updated user (assuming it's a Mongoose model)
        await loggedInUser.save();

        return res.status(200).json({ message: "Profile updated successfully", user: loggedInUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export const password=async(req,res)=>{
    try {
        const user=req.user;
        if(!user){
            return res.status(404).json({message:"User not found"});
        }
        const {oldPassword,newPassword}=req.body;
        
    } catch (error) {
        
    }
}