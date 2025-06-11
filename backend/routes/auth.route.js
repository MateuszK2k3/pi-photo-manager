import express from 'express';
import {getUserInvitations, loginUser, registerUser} from "../controllers/auth.controller.js";
import {searchUsers} from "../controllers/group.controller.js";
import {protect} from "../middlewares/auth.middleware.js";

const router = express.Router();

// POST /api/auth/
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/search', protect, searchUsers);
router.get('/:userId/invitations', getUserInvitations);

export default router;