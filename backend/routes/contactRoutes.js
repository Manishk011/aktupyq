const express = require('express');
const router = express.Router();
const {
    createContact,
    getContacts,
    getUnreadCount,
    updateContactStatus,
    deleteContact
} = require('../controllers/contactController');
const { protect, admin } = require('../middleware/auth');

router.route('/')
    .get(protect, admin, getContacts)
    .post(createContact);

router.route('/unread-count')
    .get(protect, admin, getUnreadCount);

router.route('/:id/status')
    .put(protect, admin, updateContactStatus);

router.route('/:id')
    .delete(protect, admin, deleteContact);

module.exports = router;
