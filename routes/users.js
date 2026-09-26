const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Post = require("../models/Post");

const router = express.Router();

const JWT_SECRET = "codealpha_social_secret";


// ==========================================
// AUTHENTICATION
// ==========================================

function authenticateToken(req, res, next) {

    const authHeader =
        req.headers["authorization"];

    const token =
        authHeader &&
        authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Please login first"
        });
    }

    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );

        req.userId =
            decoded.userId;

        next();

    } catch (error) {

        return res.status(403).json({
            message:
                "Invalid or expired token"
        });

    }
}


// ==========================================
// GET ALL USERS
// ==========================================

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const users =
                await User.find(
                    {
                        _id: {
                            $ne: req.userId
                        }
                    },
                    "username email followers following"
                );

            res.json(users);

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to fetch users",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// GET USER PROFILE
// ==========================================

router.get(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.params.id,
                    "username email followers following createdAt"
                );

            if (!user) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            const posts =
                await Post.find({
                    user: req.params.id
                })
                .populate(
                    "user",
                    "username"
                )
                .sort({
                    createdAt: -1
                });


            const isFollowing =
                user.followers.some(
                    id =>
                        id.toString() ===
                        req.userId.toString()
                );


            res.json({

                user: {

                    _id:
                        user._id,

                    username:
                        user.username,

                    email:
                        user.email,

                    followersCount:
                        user.followers.length,

                    followingCount:
                        user.following.length,

                    isFollowing:
                        isFollowing

                },

                posts:
                    posts

            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to fetch profile",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// FOLLOW USER
// ==========================================

router.post(
    "/:id/follow",
    authenticateToken,
    async (req, res) => {

        try {

            const targetUser =
                await User.findById(
                    req.params.id
                );

            if (!targetUser) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            if (
                targetUser._id.toString() ===
                req.userId.toString()
            ) {

                return res.status(400).json({
                    message:
                        "You cannot follow yourself"
                });

            }

            const currentUser =
                await User.findById(
                    req.userId
                );

            if (!currentUser) {

                return res.status(404).json({
                    message:
                        "Current user not found"
                });

            }

            const alreadyFollowing =
                currentUser.following.some(
                    id =>
                        id.toString() ===
                        targetUser._id.toString()
                );

            if (alreadyFollowing) {

                return res.status(400).json({
                    message:
                        "You are already following this user"
                });

            }

            currentUser.following.push(
                targetUser._id
            );

            targetUser.followers.push(
                currentUser._id
            );

            await currentUser.save();
            await targetUser.save();

            res.json({

                message:
                    "User followed successfully",

                followersCount:
                    targetUser.followers.length,

                followingCount:
                    currentUser.following.length

            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to follow user",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// UNFOLLOW USER
// ==========================================

router.delete(
    "/:id/follow",
    authenticateToken,
    async (req, res) => {

        try {

            const targetUser =
                await User.findById(
                    req.params.id
                );

            if (!targetUser) {

                return res.status(404).json({
                    message:
                        "User not found"
                });

            }

            const currentUser =
                await User.findById(
                    req.userId
                );

            if (!currentUser) {

                return res.status(404).json({
                    message:
                        "Current user not found"
                });

            }

            currentUser.following =
                currentUser.following.filter(
                    id =>
                        id.toString() !==
                        targetUser._id.toString()
                );

            targetUser.followers =
                targetUser.followers.filter(
                    id =>
                        id.toString() !==
                        currentUser._id.toString()
                );

            await currentUser.save();
            await targetUser.save();

            res.json({

                message:
                    "User unfollowed successfully",

                followersCount:
                    targetUser.followers.length,

                followingCount:
                    currentUser.following.length

            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to unfollow user",
                error:
                    error.message
            });

        }

    }
);


module.exports = router;