const fs = require('fs');
const path = require('path');
// const { validationResult } = require('express-validator');
const logger = require('../logger');

const Post = require('../models/post');
const User = require('../models/user');

// To Create a Post
const createPost = async (req, res, next) => {
  const { title, content } = req.body;

  // const errors = validationResult(req);

  // if (!errors.isEmpty()) {
  //   const error = new Error('Validation Failed, please input correct values');
  //   error.statusCode = 422;
  //   throw error;
  // }

  if (!req.file) {
    const error = new Error('No image provided');
    error.statusCode = 422;
    throw error;
  }

  const imageUrl = req.file.path;

  try {
    const post = await Post.create({
      title,
      imageUrl,
      content,
      creator: req.userId
    });

    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    res.json({
      message: req.t('post_create_success'),
      post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Problem in creating post';
    }
    next(err);
  }
};

// To get a single Post
const getPost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not Exist');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      message: 'Post Found Successfully',
      post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Problem in fetching post';
    }
    next(err);
  }
};

// To get All Posts
const getAllPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const ITEMS_PER_PAGE = 2;

  try {
    const posts = await Post.find()
      .skip((currentPage - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);

    res.status(200).json({
      message: 'Posts fetched Successfully',
      posts
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Problem in fetching posts';
    }
    next(err);
  }
};

// Search Functionality
const search = async (req, res) => {
  try {
    const searchTerm = req.query.q;
    const posts = await Post.find({
      title: { $regex: searchTerm, $options: 'i' }
    });

    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ error: 'An error occurred while searching for posts.' });
  }
};

// To delete the image from the folder
const clearImage = (filePath) => {
  let a = filePath;
  a = path.join(__dirname, '..', filePath);
  fs.unlink(a, () =>
    logger.customerLogger.log('error', 'Error in deleting the image from file')
  );
};

// getAll Posts
const getAllPostsOfUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    const result = await user.populate('posts');
    res.json({
      message: "User's Post",
      posts: result.posts
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = "Problem in fetching user's post";
    }
    next(err);
  }
};

// To Update a Post
const updatePost = async (req, res, next) => {
  const { postId } = req.params;
  const { title, content } = req.body;

  let imageUrl;
  if (req.file) {
    imageUrl = req.file.path;
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not Exist');
      error.statusCode = 404;
      throw error;
    }

    if (req.userId.toString() !== post.creator._id.toString()) {
      const error = new Error(
        "You can't update posts which is not created by you."
      );
      error.statusCode = 403;
      throw error;
    }

    post.title = title;
    post.content = content;
    if (imageUrl) {
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.imageUrl = imageUrl;
    }
    await post.save();

    res.status(200).json({
      message: req.t('post_update_success'),
      post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Problem in fetching post';
    }
    next(err);
  }
};

// To delete a post
const deletePost = async (req, res, next) => {
  const { postId } = req.params;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error('Post not Exist');
      error.statusCode = 404;
      throw error;
    }

    if (req.userId.toString() !== post.creator._id.toString()) {
      const error = new Error(
        "You can't delete posts which is not created by you."
      );
      error.statusCode = 403;
      throw error;
    }

    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);

    const user = await User.findById(req.userId);
    await user.posts.pull(postId);
    await user.save();

    res.status(200).json({
      message: req.t('post_delete_success')
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      err.message = 'Something went wrong.';
    }
    next(err);
  }
};

const creatorPostCount = async (req, res) => {
  try {
    const posts = await Post.aggregate([
      {
        $lookup: {
          from: 'users', // collection name for the referenced collection
          localField: 'creator', // field from the posts collection
          foreignField: '_id', // field from the users collection
          as: 'creator' // name for the joined field
        }
      },
      {
        $unwind: '$creator' // deconstruct the array created by the lookup
      },
      {
        $group: {
          _id: '$creator',
          sum: {
            $sum: 1
          }
        }
      },

      {
        $project: {
          _id: 0,
          creatorName: '$_id.name',
          creatorEmail: '$_id.email',
          sum: 1
        }
      },
      {
        $sort: {
          creatorName: 1
        }
      }
    ]);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllPosts,
  createPost,
  getPost,
  search,
  updatePost,
  deletePost,
  getAllPostsOfUser,
  creatorPostCount
};
