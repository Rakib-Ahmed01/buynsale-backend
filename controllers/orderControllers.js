const getCollections = require('../database/db');

exports.getOrders = async (req, res, next) => {
  try {
    const { OrderCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { OrderCollection, WishlistCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};
