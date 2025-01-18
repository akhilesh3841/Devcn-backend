import mongoose from 'mongoose';

export const connectdb=async()=>{
    try {
        await mongoose.connnect()
    } catch (error) {
        
    }

}