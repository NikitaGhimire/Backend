const express = require("express");
require("./middlewares/auth");
const bodyParser = require("body-parser");
const passport = require("passport");
require("dotenv").config();
//importing routes
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");

//initialise app
const app = express();

//middleware
app.use(bodyParser.json());
app.use(passport.initialize());

// Use the defined routes
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
