require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get('/', (_req, res) => {
  res.json({ message: 'Home Page' });
});

app.listen(port, () => {
  console.log('server is listening on port', +port);
});
