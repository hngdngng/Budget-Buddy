const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const compression = require("compression");

const PORT = process.env.PORT || 3000;

// initialize express application
const app = express();
// initialize logger and specify format 'dev'
app.use(logger("dev"));
// initialize compression middleware
app.use(compression());
// JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// load static assets in public directory
app.use(express.static("public"));

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/budget", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

// routes
app.use(require("./routes/api.js"));

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}!`);
});