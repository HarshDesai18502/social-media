const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  profilePic: {
    type: String
  },
  password: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  following: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  followers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  status: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Post'
    }
  ]
});

module.exports = mongoose.model('User', userSchema);
