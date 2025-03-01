import express from 'express';
import { login, logout,profileEdit,  profileview, register } from '../controllers/user.js';
import { userauth } from '../middlewares/auth.js';
const router=express.Router();

router.post('/api/register',register);

router.post('/login',login);

router.get("/profile/view",userauth,profileview);

router.post('/logout',logout);

router.patch("/profile/edit",userauth,profileEdit);





export default router;
