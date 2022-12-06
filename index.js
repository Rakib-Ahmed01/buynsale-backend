require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const app = express();
const port = 8000;

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.ht2ef7a.mongodb.net/?retryWrites=true&w=majority`;

// const uri = process.env.DB_URI;

// console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db('buyNsale');
    const UserCollection = database.collection('users');
    const OrderCollection = database.collection('orders');
    const ProductCollection = database.collection('products');
    const WishlistCollection = database.collection('wishlists');
    const CategoryCollection = database.collection('categories');
    const ReportedProductCollection = database.collection('reportedProducts');

    // app.get('/delete', async (_req, res) => {
    //   const result = await ProductCollection.updateMany(
    //     {},
    //     { $set: { isDeleted: false } }
    //   );
    //   console.log(result);
    //   res.json(result);
    // });

    function verifyToken(req, res, next) {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ message: 'Unauthorized Access!' });
      }
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.ACCESS_TOKEN, (err, payload) => {
        if (err) {
          return res.status(401).json({ message: 'Unauthorized Access!' });
        }
        req.payload = payload;
        next();
      });
    }

    async function verifyAdmin(req, res, next) {
      const payload = req?.payload;
      const user = await UserCollection.findOne({ email: payload?.email });
      if (!user?.isAdmin) {
        return res.status(401).json({ message: 'Unauthorized Access!' });
      }
      next();
    }

    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN);
      res.json({ token });
    });

    app.get('/products-categories', async (_req, res) => {
      const productsCategories = await CategoryCollection.find({}).toArray();
      res.json(productsCategories);
    });

    app.get('/products', async (_req, res) => {
      const products = await ProductCollection.find({
        isDeleted: { $ne: true },
      })
        .sort({ _id: -1 })
        .toArray();
      res.json(products);
    });

    app.get('/products/:categoryId', async (req, res) => {
      const categoryId = req.params.categoryId;
      const products = await ProductCollection.find({ categoryId }).toArray();
      res.json(products);
    });

    app.post('/products', async (req, res) => {
      let product = req.body;
      const categories = await CategoryCollection.find({}).toArray();
      let result;

      let categoryExists = categories.filter(
        (category) =>
          category.categoryName.toUpperCase() ===
          product.categoryName.toUpperCase()
      );

      if (categoryExists.length) {
        const category = categoryExists[0];
        const categoryId = category._id.toString();
        delete category._id;
        delete category.image;
        product = { ...product, ...category, categoryId };
        result = await ProductCollection.insertOne(product);
        return res.json(result);
      } else {
        const categoryName =
          product?.categoryName?.charAt(0)?.toUpperCase() +
          product.categoryName?.slice(1);
        const category = {
          categoryName,
          image: product.image,
        };
        const categoriesRes = await CategoryCollection.insertOne(category);
        const productRes = {
          ...product,
          categoryId: categoriesRes.insertedId.toString(),
        };
        result = await ProductCollection.insertOne(productRes);
        return res.json(result);
      }
    });

    app.put('/products/:id', async (req, res) => {
      const productId = req.params.id;
      const result = await ProductCollection.updateOne(
        { _id: ObjectId(productId) },
        { $set: { isDeleted: true } }
      );
      res.json(result);
    });

    app.patch('/products', async (req, res) => {
      const { productId } = req.body;
      const result = await ProductCollection.updateOne(
        { _id: ObjectId(productId) },
        { $set: { isAdvertised: true } }
      );
      res.json(result);
    });

    app.get('/my-products', verifyToken, async (req, res) => {
      const email = req.query.email;
      const payload = req?.payload;
      if (email !== payload?.email) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden Access!' });
      }
      const products = await ProductCollection.find({
        sellerEmail: email,
      })
        .sort({ _id: -1 })
        .toArray();
      res.json(products);
    });

    app.get('/sellers', verifyToken, verifyAdmin, async (req, res) => {
      const email = req.query?.email;
      const payload = req?.payload;
      if (email !== payload?.email) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden Access!' });
      }
      const sellers = await UserCollection.find({
        isSeller: true,
        email: { $ne: email },
        isDeleted: false,
      }).toArray();
      res.json(sellers);
    });

    app.get('/users', verifyToken, verifyAdmin, async (req, res) => {
      const email = req.query?.email;
      const payload = req?.payload;
      if (email !== payload?.email) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden Access!' });
      }
      const buyers = await UserCollection.find({
        email: { $ne: email },
        isDeleted: false,
      }).toArray();
      res.json(buyers);
    });

    app.put('/users', async (req, res) => {
      const user = req.body;
      const email = req.query.email;
      const result = await UserCollection.updateOne(
        { email },
        { $set: user },
        { upsert: true }
      );
      res.json(result);
    });

    app.put('/admin', async (req, res) => {
      const email = req.query.email;
      const result = await UserCollection.updateOne(
        { email },
        { $set: { isAdmin: true } }
      );
      res.json(result);
    });

    app.put('/verify', async (req, res) => {
      const email = req.query.email;
      const result = await UserCollection.updateOne(
        { email },
        { $set: { isVerified: true } }
      );
      await ProductCollection.updateMany(
        { sellerEmail: email },
        { $set: { sellerVerified: true } }
      );
      res.json(result);
    });

    app.put('/unverify', async (req, res) => {
      const email = req.query.email;
      const result = await UserCollection.updateOne(
        { email },
        { $set: { isVerified: false } }
      );
      await ProductCollection.updateMany(
        { sellerEmail: email },
        { $set: { sellerVerified: false } }
      );
      res.json(result);
    });

    app.put('/delete', async (req, res) => {
      const email = req.query.email;
      const result = await UserCollection.updateOne(
        { email },
        { $set: { isDeleted: true } }
      );
      res.json(result);
    });

    app.get('/user-status', async (req, res) => {
      const email = req.query?.email;
      const user = await UserCollection.findOne({ email });
      let status;

      if (user?.isAdmin) {
        status = { role: 'admin' };
      } else if (user?.isSeller) {
        status = { role: 'seller' };
      } else {
        status = { role: 'buyer' };
      }
      res.json({
        ...status,
        isSeller: user.isSeller,
        isVerified: user.isVerified,
        name: user.name,
      });
    });

    app.get('/orders', verifyToken, async (req, res) => {
      const email = req.query?.email;
      const payload = req?.payload;
      if (email !== payload?.email) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden Access!' });
      }
      const orders = await OrderCollection.find({
        buyerEmail: email,
      }).toArray();
      res.json(orders);
    });

    app.put('/orders', async (req, res) => {
      const order = req.body;
      const email = order?.buyerEmail;
      const id = order?.productId;
      const filter = { buyerEmail: email, productId: id };
      const options = { upsert: true };
      const result = await OrderCollection.updateOne(
        filter,
        { $set: order },
        options
      );
      await WishlistCollection.deleteOne({ productId: id });
      res.json(result);
    });

    app.get('/wishlists', verifyToken, async (req, res) => {
      const email = req.query?.email;
      const payload = req?.payload;
      if (email !== payload?.email) {
        return res
          .status(403)
          .json({ success: false, message: 'Forbidden Access!' });
      }
      const wishlists = await WishlistCollection.find({
        buyerEmail: email,
      }).toArray();
      res.json(wishlists);
    });

    app.put('/wishlists', async (req, res) => {
      const wishlist = req.body;
      const email = wishlist?.buyerEmail;
      const id = wishlist?.productId;
      const filter = { buyerEmail: email, productId: id };
      const options = { upsert: true };
      const result = await WishlistCollection.updateOne(
        filter,
        { $set: wishlist },
        options
      );
      res.json(result);
    });

    app.get(
      '/reported-products',
      verifyToken,
      verifyAdmin,
      async (req, res) => {
        const email = req.query?.email;
        const payload = req?.payload;
        if (email !== payload?.email) {
          return res
            .status(403)
            .json({ success: false, message: 'Forbidden Access!' });
        }
        const products = await ReportedProductCollection.find({})
          .sort({ _id: -1 })
          .toArray();
        res.json(products);
      }
    );

    app.put('/reported-products', async (req, res) => {
      const product = req.body;
      const id = product?.productId;
      const filter = { productId: id };
      const options = { upsert: true };
      const result = await ReportedProductCollection.updateOne(
        filter,
        { $set: { ...product, productId: id } },
        options
      );
      res.json(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get('/', (_req, res) => {
  res.json({ message: 'Home Page' });
});

app.listen(port, () => {
  console.log('server is listening on port', +port);
});
