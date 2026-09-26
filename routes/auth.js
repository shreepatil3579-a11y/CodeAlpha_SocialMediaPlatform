const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

const JWT_SECRET = "codealpha_social_secret";

// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req, res) => {
    try {

        const {
            username,
            email,
            password
        } = req.body;

        if (
            !username ||
            !email ||
            !password
        ) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser =
            await User.findOne({
                $or: [
                    { email },
                    { username }
                ]
            });

        if (existingUser) {
            return res.status(400).json({
                message:
                    "Username or email already exists"
            });
        }

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );

        const user = new User({
            username: username.trim(),
            email: email.trim(),
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "Registration successful",
            userId: user._id
        });

    } catch (error) {

        res.status(500).json({
            message: "Registration failed",
            error: error.message
        });

    }
});


// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req, res) => {
    try {

        const {
            email,
            password
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required"
            });
        }

        const user =
            await User.findOne({
                email: email.trim()
            });

        if (!user) {
            return res.status(400).json({
                message:
                    "Invalid email or password"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {
            return res.status(400).json({
                message:
                    "Invalid email or password"
            });
        }

        const token =
            jwt.sign(
                {
                    userId:
                        user._id.toString()
                },
                JWT_SECRET,
                {
                    expiresIn: "7d"
                }
            );

        res.json({

            message: "Login successful",

            token,

            user: {
                _id: user._id,
                username: user.username,
                email: user.email
            }

        });

    } catch (error) {

        res.status(500).json({
            message: "Login failed",
            error: error.message
        });

    }
});


module.exports = router;