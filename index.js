require('dotenv').config();
const express = require('express');
const cors = require('cors');
const {
  globalErrorMiddleware,
  notFoundMiddleware,
} = require('./middlewares/errorMiddleware');
const { userRouter } = require('./routes/userRouter');
const { orderRouter } = require('./routes/orderRouter');
const { productRouter } = require('./routes/productRouter');
const { wishlistRouter } = require('./routes/wishlistRouter');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.use('/users', userRouter);
app.use('/orders', orderRouter);
app.use('/products', productRouter);
app.use('/wishlists', wishlistRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to BuyNSale!' });
});

app.use(notFoundMiddleware);
app.use(globalErrorMiddleware);

app.listen(port);
