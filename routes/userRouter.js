const express = require('express');
const {
  createToken,
  getSellersProducts,
  getSellers,
  getUsers,
  updateUsers,
  makeUserAdmin,
  verifyUser,
  unverifyUser,
  getUserStatus,
  deleteUser,
} = require('../controllers/userControllers');
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/jwt', createToken);

router.get('/my-products', verifyToken, getSellersProducts);

router.get('/sellers', verifyToken, verifyAdmin, getSellers);

router.get('/', verifyToken, verifyAdmin, getUsers);

router.put('/', updateUsers);

router.put('/admin', makeUserAdmin);

router.put('/verify', verifyUser);

router.put('/unverify', unverifyUser);

router.put('/delete', deleteUser);

router.get('/user-status', getUserStatus);

module.exports = {
  userRouter: router,
};
