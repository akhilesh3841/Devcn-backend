import {User} from "../models/user.js";
import bcrypt from "bcrypt";
import crypto from "crypto"
import nodemailer from "nodemailer"

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
    const {emailId, password} = req.body;
    try {
        const user=await User.findOne({emailId});
        if(!user){
            return res.status(404).json({
                message:"User not found"
            })
        };
        const ismatch=await bcrypt.compare(password,user.password);
        if(!ismatch){
            return res.status(400).json({
                message:"Invalid credentials"
            });
        }
        if(ismatch){
            const token=await user.getJWT();

            res.cookie("token",token,{
                expires: new Date(Date.now() + 8*3600000),
                httpOnly: true,
            })
            res.send(user);
        }
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "ERROR: " + error.message,
        });
        
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

export const forgetpassword=async(req,res)=>{
    try {

        const {emailId}=req.body;

        if(!emailId){
            return res.status(400).json({
                message:"please provide an email"
            })
        }

        const user=await User.findOne({emailId});

        if(!user){
            return res.status(404).json({
                message:"account not found please create account first"
            })
        }
        
        const resetToken=crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken=crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpires= Date.now() + 10 * 60 * 1000;
        await user.save();

        // 3. Send email (fake link for now)
        const resetLink = `http://localhost:5173/reset-password/${resetToken}`; // replace with frontend link

        // Use nodemailer (for production, use a real SMTP service)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'akhilesh4149yadav@gmail.com',
                pass: 'gych lseh dhne oydo' // Never use real password
            }
        });

        const mailOptions = {
            from: 'akhilesh4149yadav@gmail.com',
            to: user.emailId,
            subject: 'Reset your password',
            html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Reset link sent to your email' });


    } catch (error) {
          console.error('Error in forgetpassword:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
}


export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Token is invalid or expired' });
    }

    // ✅ Hash the new password before saving
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: 'Password reset successfully' });
};

