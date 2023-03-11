const jwt = require('jsonwebtoken');
const getCollections = require('../database/db');

exports.createToken = (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN);
  res.json({ token });
};

exports.getSellersProducts = async (req, res, next) => {
  try {
    const { email } = req.query;
    const { payload } = req;

    if (email !== payload?.email) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden Access!' });
    }

    const { ProductCollection } = await getCollections();

    const products = await ProductCollection.find({
      sellerEmail: email,
    })
      .sort({ _id: -1 })
      .toArray();

    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getSellers = async (req, res, next) => {
  try {
    const { email } = req.query;
    const { payload } = req;

    if (email !== payload?.email) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden Access!' });
    }

    const { UserCollection } = await getCollections();

    const sellers = await UserCollection.find({
      isSeller: true,
      email: { $ne: email },
      isDeleted: false,
    }).toArray();

    res.json(sellers);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { email } = req.query;
    const { payload } = req;

    if (email !== payload?.email) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden Access!' });
    }

    const { UserCollection } = await getCollections();

    const buyers = await UserCollection.find({
      email: { $ne: email },
      isDeleted: false,
    }).toArray();

    res.json(buyers);
  } catch (err) {
    next(err);
  }
};

exports.updateUsers = async (req, res, next) => {
  try {
    const { UserCollection } = await getCollections();
    const user = req.body;
    const email = req.query.email;
    const result = await UserCollection.updateOne(
      { email },
      { $set: user },
      { upsert: true }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.makeUserAdmin = async (req, res, next) => {
  try {
    const { UserCollection } = await getCollections();
    const email = req.query.email;
    const result = await UserCollection.updateOne(
      { email },
      { $set: { isAdmin: true } }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.verifyUser = async (req, res, next) => {
  try {
    const { UserCollection, ProductCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};

exports.unverifyUser = async (req, res, next) => {
  try {
    const { UserCollection, ProductCollection } = await getCollections();

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
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const { UserCollection } = await getCollections();
    const email = req.query.email;
    const result = await UserCollection.updateOne(
      { email },
      { $set: { isDeleted: true } }
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
};

exports.getUserStatus = async (req, res, next) => {
  try {
    const { UserCollection } = await getCollections();

    const email = req.query?.email;
    const user = await UserCollection.findOne({ email });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    let role = 'buyer';
    if (user.isAdmin) {
      role = 'admin';
    } else if (user.isSeller) {
      role = 'seller';
    }

    const status = {
      role,
      isSeller: user.isSeller,
      isVerified: user.isVerified,
      name: user.name,
    };

    res.json(status);
  } catch (err) {
    next(err);
  }
};
