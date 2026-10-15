import express from 'express';
import * as userCtrl from './user.controller.js';
import { validate, registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../../middlewares/validate.js';
import { verifyToken } from '../../middlewares/verifyToken.js';
import { handleSingleUpload } from '../../middlewares/upload.js';

const router = express.Router();

router.post('/register', validate(registerSchema), userCtrl.register);
router.post('/login', validate(loginSchema), userCtrl.login);
router.post('/logout', userCtrl.logout);
router.get('/me', verifyToken, userCtrl.getMe);
router.put('/profile', verifyToken, validate(updateProfileSchema), userCtrl.updateProfile);
router.put('/password', verifyToken, validate(changePasswordSchema), userCtrl.changePassword);
router.delete('/account', verifyToken, userCtrl.deleteAccount);
router.post('/avatar', verifyToken, handleSingleUpload('avatar'), userCtrl.uploadAvatar);
router.delete('/avatar', verifyToken, userCtrl.removeAvatar);

export default router;
