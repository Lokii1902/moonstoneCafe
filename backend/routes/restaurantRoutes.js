const express = require('express');
const router = express.Router();
const { getRestaurantInfo, updateRestaurantInfo } = require('../controllers/restaurantController');

router.get('/', getRestaurantInfo);
router.put('/', updateRestaurantInfo);

module.exports = router;
