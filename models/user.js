import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
   emailId: {
    type: String,
    required: [true, "Email address is required"], // Custom error message for required validation
    unique: true, // Ensures email is unique in the database
    trim: true, // Removes leading/trailing spaces
    lowercase: true, // Converts email to lowercase for consistency
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      

    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: {
        values: ["male", "female", "other"],
        message: "is not a valid gender type",
      },
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
    },
    photoUrl: {
      type: String,
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt fields automatically
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token; // <-- This line was missing
};


userSchema.methods.validatepassword=async function(passwordinputuser){
  const user=this;
  const passwordhash=user.password;
  const ispassword=await bcrypt.compare(passwordinputuser,passwordhash);
  return ispassword;
}



export const User=mongoose.model("User",userSchema);


