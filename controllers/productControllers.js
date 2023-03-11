const getCollections = require('../database/db');

exports.getCategories = async (req, res, next) => {
  try {
    const { CategoryCollection } = await getCollections();
    const productsCategories = await CategoryCollection.find({}).toArray();
    res.json(productsCategories);
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { ProductCollection } = await getCollections();
    const products = await ProductCollection.find({
      isDeleted: { $ne: true },
    })
      .sort({ _id: -1 })
      .toArray();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getProductsByCategory = async (req, res, next) => {
  try {
    const { ProductCollection } = await getCollections();
    const categoryId = req.params.categoryId;
    const products = await ProductCollection.find({ categoryId }).toArray();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    // Getting necessary collections
    const { CategoryCollection, ProductCollection } = await getCollections();

    // Get product from request body
    let product = req.body;

    // Get all categories from the CategoryCollection
    const categories = await CategoryCollection.find({}).toArray();
    let result;

    // Check if the product's category already exists in the categories list
    let categoryExists = categories.filter(
      (category) =>
        category.categoryName.toUpperCase() ===
        product.categoryName.toUpperCase()
    );

    // If the category exists, get its ID and remove unnecessary fields
    if (categoryExists.length) {
      const category = categoryExists[0];
      const categoryId = category._id.toString();
      delete category._id;
      delete category.image;

      // Add the category ID to the product and insert the product into the ProductCollection
      product = { ...product, ...category, categoryId };
      result = await ProductCollection.insertOne(product);
      return res.json(result);
    } else {
      // If the category does not exist, create a new category and insert it into the CategoryCollection
      const categoryName =
        product?.categoryName?.charAt(0)?.toUpperCase() +
        product.categoryName?.slice(1);

      const category = {
        categoryName,
        image: product.image,
      };

      // Add the new category's ID to the product and insert the product into the ProductCollection
      const categoriesRes = await CategoryCollection.insertOne(category);
      const productRes = {
        ...product,
        categoryId: categoriesRes.insertedId.toString(),
      };
      result = await ProductCollection.insertOne(productRes);
      return res.json(result);
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteProduct = async (req, res, next) => {
  try {
    const { ProductCollection } = await getCollections();
    const productId = req.params.id;
    const result = await ProductCollection.updateOne(
      { _id: ObjectId(productId) },
      { $set: { isDeleted: true } }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.advertiseProduct = async (req, res, next) => {
  try {
    const { ProductCollection } = await getCollections();
    const { productId } = req.body;
    const result = await ProductCollection.updateOne(
      { _id: ObjectId(productId) },
      { $set: { isAdvertised: true } }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getReportedProducts = async (req, res, next) => {
  try {
    const { ReportedProductCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};

exports.createReportedProduct = async (req, res, next) => {
  try {
    const { ReportedProductCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};
