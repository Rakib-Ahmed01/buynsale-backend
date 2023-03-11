const express = require('express');
const {
  createWishlist,
  getWishlists,
} = require('../controllers/wishlistControllers');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getWishlists);

router.put('/', createWishlist);

module.exports = {
  wishlistRouter: router,
};
