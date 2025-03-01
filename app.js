import express from 'express';
import {connection} from "./config/database.js"
import cookieParser from "cookie-parser";
import registerrouter from "./routes/user.js"
import statusrouter from "./routes/request.js";
import Userreqrouter from "./routes/Userdata.js"

import cors from "cors"; // Import cors

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file



const app = express();
app.use(cors({
    origin: 'http://localhost:5173', // Frontend ka URL
    credentials: true,  // Allow cookies to be sent with requests
}));
app.use(express.json());
app.use(cookieParser());




connection();

app.use('/',registerrouter);

app.use('/req', statusrouter);

app.use("/userdata",Userreqrouter);

const PORT=process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
