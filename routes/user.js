import express from 'express';
import { forgetpassword, login, logout,profileEdit,  profileview, register,resetPassword } from '../controllers/user.js';
import { userauth } from '../middlewares/auth.js';
const router=express.Router();

router.post('/api/register',register);

router.post('/login',login);

router.get("/profile/view",userauth,profileview);

router.post('/logout',logout);

router.patch("/profile/edit",userauth,profileEdit);

router.post("/api/forgotpass",forgetpassword);

router.put("/api/reset-password/:token",resetPassword);







export default router;
