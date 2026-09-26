const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");


// ===============================
// Routes
// ===============================

const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const commentRoutes = require("./routes/comments");
const userRoutes = require("./routes/users");


// ===============================
// App
// ===============================

const app = express();

const PORT = 5000;


// ===============================
// Middleware
// ===============================

app.use(cors());

app.use(express.json());


// ===============================
// API Routes
// ===============================

app.use("/api/auth", authRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/users", userRoutes);


// ===============================
// Frontend
// ===============================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// ===============================
// MongoDB Connection
// ===============================

mongoose
    .connect(
        "mongodb://127.0.0.1:27017/codealpha_social"
    )

    .then(() => {

        console.log(
            "MongoDB Connected Successfully"
        );

    })

    .catch((error) => {

        console.log(
            "MongoDB Connection Error:",
            error.message
        );

    });


// ===============================
// Test API
// ===============================

app.get("/api", (req, res) => {

    res.json({
        message:
            "CodeAlpha Social Media API is running"
    });

});


// ===============================
// Start Server
// ===============================

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});