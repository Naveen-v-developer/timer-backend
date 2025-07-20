const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// View all users and their session stats
router.get('/users', adminController.getAllUsers);

// Delete a user and their records
router.delete('/user/:id', adminController.deleteUser);

module.exports = router;
