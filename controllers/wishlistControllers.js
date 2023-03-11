const getCollections = require('../database/db');

exports.getWishlists = async (req, res, next) => {
  try {
    const { WishlistCollection } = await getCollections();

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
  } catch (err) {
    next(err);
  }
};

exports.createWishlist = async (req, res) => {
  try {
    const { WishlistCollection } = await getCollections();
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
  } catch (err) {
    next(err);
  }
};
