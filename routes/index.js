import express from 'express';
import { registerController, loginController, userController } from '../controllers';
import auth from '../middlewares/auth';

const router = express.Router();

router.post('/register', registerController.resiter);

router.post('/login', loginController.login);

router.get('/me',auth, userController.me);

export default router;