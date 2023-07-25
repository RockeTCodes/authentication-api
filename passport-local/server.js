const connect = require("./db/connectdb");
connect();
const {
  app,
  register,
  login,
  logout,
} = require("./controllers/authController.js");

app.post("/register", register);

app.post("/login", login);

app.get("/logout", logout);

app.listen(process.env.PORT || 5000, () => {
  console.log("Server Started");
});
