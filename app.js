const express = require("express");
require("./middlewares/auth");
const bodyParser = require("body-parser");
const passport = require("passport");
require("dotenv").config();
const cors = require("cors");
//importing routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

//initialise app
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

//middleware
app.use(bodyParser.json());
app.use(passport.initialize());

// Use the defined routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const PORT = 6001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
