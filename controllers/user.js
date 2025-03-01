import {User} from "../models/user.js";
import bcrypt from "bcrypt";

import {validateEditProfileData, validateSignUpData} from "../utils/validation.js"

export const register=async(req,res)=>{
    try {
        validateSignUpData(req);
        const {firstName,lastName,emailId,password,age,gender,photoUrl,about,skills} = req.body;
        const hashpassword=await bcrypt.hash(password,10);

        const user=new User({
            firstName,
            lastName, 
            emailId,
            password: hashpassword,
            age,
            gender,
            photoUrl,
            about,
            skills,
        })

        const saveduser=await user.save();
        const token = await user.getJWT();

        res.cookie("token", token, {
          expires: new Date(Date.now() + 8 * 3600000),
          httpOnly: true,
        });

        res.status(201).json({
            data:saveduser
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

        // const isPasswordValid = await user.validatepassword(password);
      
            const token=await user.getJWT();

            res.cookie("token",token,{
                expires: new Date(Date.now() + 8*3600000),
                httpOnly: true,
            })
            res.send(user);
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
        res.status(200).json({
            data:user
        });
        
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

        return res.status(200).json({ message: "Profile updated successfully", data: loggedInUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


// export const password=async(req,res)=>{
//     try {
//         const user=req.user;
//         if(!user){
//             return res.status(404).json({message:"User not found"});
//         }
//         const {oldPassword,newPassword}=req.body;
        
//     } catch (error) {
        
//     }
// }