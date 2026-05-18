const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdminSeed } = require('../controllers/authController');

router.post('/login', loginAdmin);
router.post('/register-seed', registerAdminSeed); // Careful with this in production

module.exports = router;
