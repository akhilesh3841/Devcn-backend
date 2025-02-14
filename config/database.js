import mongoose from "mongoose";

export const connection = async() => {
     await mongoose.connect(process.env.MONGO_URI, {
        dbName: "newapp",
    })
    .then(() => {
        console.log("Database connected successfully!");
    })
    .catch((error) => {
        console.error("Error connecting to the database:", error.message);
    });
};