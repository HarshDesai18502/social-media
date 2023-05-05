const mongoose = require('mongoose');

const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    location: {
      type: String
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    comments: [
      {
        content: String,
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
