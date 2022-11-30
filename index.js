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

    app.get('/my-products', async (req, res) => {
      const email = req.query.email;
      const products = await ProductCollection.find({
        sellerEmail: email,
      })
        .sort({ _id: -1 })
        .toArray();
      res.json(products);
    });

    app.get('/sellers', async (req, res) => {
      const email = req.query?.email;
      const sellers = await UserCollection.find({
        isSeller: true,
        email: { $ne: email },
        isDeleted: false,
      }).toArray();
      res.json(sellers);
    });

    app.get('/buyers', async (req, res) => {
      const email = req.query?.email;
      console.log(email);
      const buyers = await UserCollection.find({
        isSeller: false,
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
      console.log(user);
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

    app.get('/orders', async (req, res) => {
      const email = req.query?.email;
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
      console.log(order);
      res.json(result);
    });

    app.get('/wishlists', async (req, res) => {
      const email = req.query?.email;
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

    app.get('/reported-products', async (_req, res) => {
      const products = await ReportedProductCollection.find({})
        .sort({ _id: -1 })
        .toArray();
      res.json(products);
    });

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

app.listen(port, () => {
  console.log('server is listening on port', +port);
});

[
  {
    categoryName: '',
    categoryId: '637fb4b34ec94940689018a9',
    image: '',
    title: '',
    description: '',
    condition: '',
    location: '',
    originalPrice: '',
    resalePrice: '',
    yearsOfUse: '',
    time: '',
    sellerName: '',
    sellerEmail: '',
    sellerVerified: '',
    sellerPhone: '',
    isSold: '',
    isPaid: '',
    isAdvertised: '',
  },
];

[
  {
    categoryName: 'Samsung',
    image: 'https://i.ibb.co/7Whc7SV/anh-nhat-yqclo-Mb3-Abw-unsplash.jpg',
  },
  {
    categoryName: 'Apple',
    image: 'https://i.ibb.co/sVztcKy/tron-le-y-PFAAwom-TYQ-unsplash.jpg',
  },
  {
    categoryName: 'Huawei',
    image: 'https://i.ibb.co/n017gbc/kamil-kot-JUflt-Uc-MG8-unsplash.jpg',
  },
];

// prodcuts data
[
  {
    categoryName: 'Samsung',
    categoryId: '637fb4b34ec94940689018a9',
    image: 'https://i.ibb.co/7Whc7SV/anh-nhat-yqclo-Mb3-Abw-unsplash.jpg',
    title: 'Samsung S21+ 5G',
    description:
      'Samsung Galaxy S21+ 5G Android smartphone. Announced Jan 2021. Features 6.7″ display, Exynos 2100 chipset, 4800 mAh battery, 256 GB storage, 8 GB RAM...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
  {
    categoryName: 'Samsung',
    categoryId: '637fb4b34ec94940689018a9',
    image: 'https://i.ibb.co/NnFyZ61/anh-nhat-YKFBd-V-RRXI-unsplash.jpg',
    title: 'Samsung S21+ Ultra 5G',
    description:
      'Samsung Galaxy S21 Ultra 5G Android smartphone. Announced Jan 2021. Features 6.7″ display, Exynos 2100 chipset, 4800 mAh battery, 256 GB storage, 8 GB RAM...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
  {
    categoryName: 'Apple',
    categoryId: '637fb4b34ec94940689018aa',
    image: 'https://i.ibb.co/zV1p8g7/v-a-tao-Oxvl-DO8-Rw-Kg-unsplash.jpg',
    title: 'Iphone 12 Mini',
    description:
      'Apple iPhone 12 mini smartphone. Announced Oct 2020. Features 5.4″ display, Apple A14 Bionic chipset, 12MP. 2160p. 4GB RAM...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
  {
    categoryName: 'Apple',
    categoryId: '637fb4b34ec94940689018aa',
    image: 'https://i.ibb.co/sjYFB0v/neil-soni-6wd-Ru-K7b-VTE-unsplash.jpg',
    title: 'Iphone 11',
    description:
      'Apple iPhone 11 smartphone. Announced Oct 2020. Features 5.4″ display, Apple A14 Bionic chipset, 12MP. 2160p. 4GB RAM...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
  {
    categoryName: 'Huawei',
    categoryId: '637fb4b34ec94940689018ab',
    image: 'https://i.ibb.co/n017gbc/kamil-kot-JUflt-Uc-MG8-unsplash.jpg',
    title: 'Iphone P20 Pro',
    description:
      'Huawei P20 Pro Android smartphone. Announced Mar 2018. Features 6.1″ display, Kirin 970 chipset, 4000 mAh battery, 256 GB storage, 8 GB RAM, Corning Gorilla...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
  {
    categoryName: 'Huawei',
    categoryId: '637fb4b34ec94940689018ab',
    image:
      'https://i.ibb.co/crCQJLN/jonathan-kemper-t6-Wmvbw-Md-I-unsplash.jpg',
    title: 'Iphone P23 Pro',
    description:
      'Huawei P30 Pro Android smartphone. Announced Mar 2018. Features 6.1″ display, Kirin 970 chipset, 4000 mAh battery, 256 GB storage, 8 GB RAM, Corning Gorilla...',
    condition: 'Excellent',
    location: 'Kushtia',
    originalPrice: '1,00,000',
    resalePrice: '75,000',
    yearsOfUse: '1.5 Years',
    time: new Date(),
    sellerName: 'Rakib Ahmed',
    sellerEmail: 'rakibahmed34366@gmail.com',
    sellerVerified: true,
    sellerPhone: '01945454545',
    isSold: false,
    isPaid: false,
    isAdvertised: false,
  },
];
