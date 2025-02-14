import express from 'express';
import { userauth } from '../middlewares/auth.js';
import { acceptedOrRejected, ignoredorinterested} from '../controllers/request.js';

const router=express.Router();

router.post("/send/:status/:toUserId",userauth,ignoredorinterested);


router.post("/review/:status/:requestId",userauth,acceptedOrRejected);



export default router;

