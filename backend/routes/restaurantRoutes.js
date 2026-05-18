const express = require('express');
const router = express.Router();
const { getRestaurantInfo, updateRestaurantInfo } = require('../controllers/restaurantController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getRestaurantInfo);
router.put('/', protect, updateRestaurantInfo);

module.exports = router;
