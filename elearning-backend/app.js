const express = require('express');
const app = express();
const userRoutes = require("./src/api/v1/user.route");

require('dotenv').config();
app.use(express.json());
app.use('/api/v1', require('./src/api/v1'));
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});