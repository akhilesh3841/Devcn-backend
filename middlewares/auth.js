import jwt from "jsonwebtoken";
import { User } from "../models/user.js"; // Ensure correct file extension

export const userauth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ message: "Please Login!" });
        }

        const decodedvalue = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = decodedvalue;

        const user = await User.findById(_id);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // Attach user object to req
        next(); // Call next middleware

    } catch (error) {
        res.status(401).json({ message: "Authentication failed: " + error.message });
    }
};
