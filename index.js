require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.ht2ef7a.mongodb.net/?retryWrites=true&w=majority`;

const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const database = client.db('buyNsale');
    const ProductCollection = database.collection('products');
    const CategoryCollection = database.collection('categories');

    app.get('/products', async (_req, res) => {
      const products = await ProductCollection.find({}).toArray();
      res.json(products);
    });

    app.get('/products-categories', async (_req, res) => {
      const productsCategories = await CategoryCollection.find({}).toArray();
      res.json(productsCategories);
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
