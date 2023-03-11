const express = require('express');
const {
  getCategories,
  getProducts,
  getProductsByCategory,
  createProduct,
  deleteProduct,
  advertiseProduct,
  getReportedProducts,
  createReportedProduct,
} = require('../controllers/productControllers');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getProducts);

router.post('/', createProduct);

router.put('/products/:id', deleteProduct);

router.patch('/advertize-products', advertiseProduct);

router.get('/reported-products', verifyToken, verifyAdmin, getReportedProducts);

router.get('/categories', getCategories);

router.get('/:categoryId', getProductsByCategory);

router.put('/reported-products', createReportedProduct);

module.exports = {
  productRouter: router,
};
