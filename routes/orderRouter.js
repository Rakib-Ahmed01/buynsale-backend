const express = require('express');
const { getOrders, createOrder } = require('../controllers/orderControllers');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, getOrders);

router.put('/', createOrder);

module.exports = {
  orderRouter: router,
};
