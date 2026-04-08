const Contact = require('../models/Contact');

// @desc    Create a new contact message
// @route   POST /api/contacts
// @access  Public
const createContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = new Contact({
            name,
            email,
            subject,
            message
        });

        const createdContact = await contact.save();
        res.status(201).json(createdContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all contacts
// @route   GET /api/contacts
// @access  Private/Admin
const getContacts = async (req, res) => {
    try {
        const contacts = await Contact.find({}).sort({ createdAt: -1 });
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get unread contact count
// @route   GET /api/contacts/unread-count
// @access  Private/Admin
const getUnreadCount = async (req, res) => {
    try {
        const count = await Contact.countDocuments({ status: 'unread' });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark contact as read/unread
// @route   PUT /api/contacts/:id/status
// @access  Private/Admin
const updateContactStatus = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        contact.status = req.body.status || 'read';
        const updatedContact = await contact.save();

        res.json(updatedContact);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a contact message
// @route   DELETE /api/contacts/:id
// @access  Private/Admin
const deleteContact = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({ message: 'Contact not found' });
        }

        await Contact.deleteOne({ _id: contact._id });
        res.json({ message: 'Contact message removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createContact,
    getContacts,
    getUnreadCount,
    updateContactStatus,
    deleteContact
};
