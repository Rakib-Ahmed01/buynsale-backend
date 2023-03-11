const jwt = require('jsonwebtoken');
const getCollections = require('../database/db');

async function verifyAdmin(req, res, next) {
  const { UserCollection } = await getCollections();

  const payload = req?.payload;
  const user = await UserCollection.findOne({ email: payload?.email });
  if (!user?.isAdmin) {
    return res.status(401).json({ message: 'Unauthorized Access!' });
  }
  next();
}

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

module.exports = {
  verifyAdmin,
  verifyToken,
};
