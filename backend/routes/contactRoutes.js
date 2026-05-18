const express = require('express');
const router = express.Router();
const { submitMessage, getMessages, submitReservation, getReservations } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');
const { validateRequest, schemas } = require('../middleware/validateMiddleware');

router.post('/', validateRequest(schemas.contactMessage), submitMessage);
router.get('/', protect, getMessages);
router.put('/:id/read', protect, require('../controllers/contactController').markMessageRead);

router.post('/reservations', validateRequest(schemas.reservation), submitReservation);
router.get('/reservations', protect, getReservations);

module.exports = router;
