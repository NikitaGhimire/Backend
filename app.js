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

const allowedOrigins = [
  "http://localhost:3000",
  "https://my-blogpost-frontend.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
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

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
