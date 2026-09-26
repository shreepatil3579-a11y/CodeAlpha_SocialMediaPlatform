const express = require("express");
const jwt = require("jsonwebtoken");
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
            message: "Invalid or expired token"
        });

    }

}


// ==========================================
// GET ALL POSTS
// ==========================================

router.get(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const posts =
                await Post.find()
                    .populate(
                        "user",
                        "username email"
                    )
                    .sort({
                        createdAt: -1
                    });

            res.json(posts);

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to fetch posts",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// CREATE POST
// ==========================================

router.post(
    "/",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                content
            } = req.body;

            if (!content || !content.trim()) {

                return res.status(400).json({
                    message:
                        "Post content is required"
                });

            }

            const post =
                new Post({
                    user: req.userId,
                    content:
                        content.trim(),
                    likes: []
                });

            await post.save();

            await post.populate(
                "user",
                "username email"
            );

            res.status(201).json(
                post
            );

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to create post",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// LIKE / UNLIKE POST
// ==========================================

router.post(
    "/:id/like",
    authenticateToken,
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );

            if (!post) {

                return res.status(404).json({
                    message:
                        "Post not found"
                });

            }


            const userId =
                req.userId.toString();


            const alreadyLiked =
                post.likes.some(
                    id =>
                        id.toString() ===
                        userId
                );


            if (alreadyLiked) {

                // UNLIKE

                post.likes =
                    post.likes.filter(
                        id =>
                            id.toString() !==
                            userId
                    );

            } else {

                // LIKE

                post.likes.push(
                    req.userId
                );

            }


            await post.save();


            res.json({
                message:
                    alreadyLiked
                        ? "Post unliked"
                        : "Post liked",

                liked:
                    !alreadyLiked,

                likesCount:
                    post.likes.length
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to like post",
                error:
                    error.message
            });

        }

    }
);


// ==========================================
// DELETE POST
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const post =
                await Post.findById(
                    req.params.id
                );

            if (!post) {

                return res.status(404).json({
                    message:
                        "Post not found"
                });

            }


            if (
                post.user.toString() !==
                req.userId.toString()
            ) {

                return res.status(403).json({
                    message:
                        "You can delete only your own post"
                });

            }


            await Post.findByIdAndDelete(
                req.params.id
            );


            res.json({
                message:
                    "Post deleted successfully"
            });

        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to delete post",
                error:
                    error.message
            });

        }

    }
);


module.exports = router;