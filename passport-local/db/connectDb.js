const mongoose = require("mongoose");
mongoose.set("strictQuery", true);

const connect = () => {
  try {
    mongoose.connect("mongodb://127.0.0.1:27017/authDB");
    console.log("mongo connected");
  } catch (err) {
    console.log(err);
  }
};

module.exports = connect;
