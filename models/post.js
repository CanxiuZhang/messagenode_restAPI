const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    required: true,
    type: String
  },
  imageUrl: {
    required: true,
    type: String
  },
  creator: {
    required: true,
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {timestamps: true});

module.exports = mongoose.model('Post', postSchema);