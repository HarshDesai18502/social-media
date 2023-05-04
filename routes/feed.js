const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const isAuth = require("../middleware/isAuth");

const {
  getAllPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  getAllPostsOfUser,
  search,
  creatorPostCount,
} = require("../controllers/feed");

// To get All Posts
router.get("/posts", isAuth, getAllPosts);

// To create Post
router.post(
  "/create/post",
  [
    body("title").trim().isLength({ min: 3 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  createPost
);

// To get a Post
router.get("/post/:postId", getPost);

// To update a Post
router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 3 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  updatePost
);

// To search the post by its title
router.get("/search", search);

// To delete a Post
router.delete("/post/:postId", isAuth, deletePost);

// To get all the post's of user
router.get("/myPosts", isAuth, getAllPostsOfUser);

// To get all the user's and count of how much post they have created
router.get("/creator-post-count", creatorPostCount);

module.exports = router;
