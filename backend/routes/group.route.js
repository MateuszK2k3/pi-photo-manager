import express from 'express';
import {
    listUserGroups,
    createGroup,
    getGroupDetails,
    inviteMember,
    leaveGroup,
    removeMember, searchUsers, acceptInvite, rejectInvite
} from '../controllers/group.controller.js';
import { protect } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/',          listUserGroups);       // GET  /api/groups
router.post('/',         createGroup);          // POST /api/groups
router.get('/:groupId',  getGroupDetails);      // GET  /api/groups/:groupId
router.post('/:groupId/invite', inviteMember);  // POST /api/groups/:groupId/invite  { userId }
router.post('/:groupId/leave',   leaveGroup);    // POST /api/groups/:groupId/leave
router.post('/:groupId/remove', protect, removeMember);
router.post('/:groupId/accept-invite', protect, acceptInvite);
router.post('/:groupId/reject-invite', protect, rejectInvite);

export default router;
