const express = require("express");
const jwt = require("jsonwebtoken");

const Comment = require("../models/Comment");
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
            message:
                "Please login first"
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
// ADD COMMENT
// ==========================================

router.post(
    "/:postId",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                content
            } = req.body;


            if (
                !content ||
                !content.trim()
            ) {

                return res.status(400).json({
                    message:
                        "Comment cannot be empty"
                });

            }


            const post =
                await Post.findById(
                    req.params.postId
                );


            if (!post) {

                return res.status(404).json({
                    message:
                        "Post not found"
                });

            }


            const comment =
                new Comment({
                    post:
                        req.params.postId,

                    user:
                        req.userId,

                    content:
                        content.trim()
                });


            await comment.save();


            await comment.populate(
                "user",
                "username"
            );


            res.status(201).json(
                comment
            );


        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to add comment",

                error:
                    error.message
            });

        }

    }
);


// ==========================================
// GET COMMENTS
// ==========================================

router.get(
    "/:postId",
    authenticateToken,
    async (req, res) => {

        try {

            const comments =
                await Comment.find({
                    post:
                        req.params.postId
                })
                .populate(
                    "user",
                    "username"
                )
                .sort({
                    createdAt: 1
                });


            res.json(
                comments
            );


        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to fetch comments",

                error:
                    error.message
            });

        }

    }
);


// ==========================================
// DELETE COMMENT
// ==========================================

router.delete(
    "/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const comment =
                await Comment.findById(
                    req.params.id
                );


            if (!comment) {

                return res.status(404).json({
                    message:
                        "Comment not found"
                });

            }


            // Only comment owner can delete

            if (
                comment.user.toString() !==
                req.userId.toString()
            ) {

                return res.status(403).json({
                    message:
                        "You can delete only your own comment"
                });

            }


            await Comment.findByIdAndDelete(
                req.params.id
            );


            res.json({
                message:
                    "Comment deleted successfully"
            });


        } catch (error) {

            res.status(500).json({
                message:
                    "Failed to delete comment",

                error:
                    error.message
            });

        }

    }
);


module.exports = router;