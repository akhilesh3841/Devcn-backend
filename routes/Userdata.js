import express from 'express';
import { userauth } from '../middlewares/auth.js';
import { UserReq ,UserConnection, feed} from '../controllers/Userdata.js';

const router =express.Router();

router.get("/pending/recived",userauth,UserReq);

router.get("/pending/accepted",userauth,UserConnection);


router.get("/feed",userauth,feed)



export default router;