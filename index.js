require("dotenv/config");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const routes = require("./routes/index");
const app = express();
app.use(cors());
app.use(express.json());
app.use(routes);
mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Database connected sucessfully");
});
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
