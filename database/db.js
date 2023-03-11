const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.ht2ef7a.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function getCollections() {
  try {
    const database = client.db('buyNsale');
    const UserCollection = database.collection('users');
    const OrderCollection = database.collection('orders');
    const ProductCollection = database.collection('products');
    const WishlistCollection = database.collection('wishlists');
    const CategoryCollection = database.collection('categories');
    const ReportedProductCollection = database.collection('reportedProducts');

    return {
      UserCollection,
      OrderCollection,
      ProductCollection,
      WishlistCollection,
      CategoryCollection,
      ReportedProductCollection,
    };
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
}

module.exports = getCollections;
