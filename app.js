import express from 'express';
import {connection} from "./config/database.js"
import cookieParser from "cookie-parser";
import registerrouter from "./routes/user.js"
import statusrouter from "./routes/request.js";
import Userreqrouter from "./routes/Userdata.js"

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file



const app = express();
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
