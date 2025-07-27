import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SongSchema = new mongoose.Schema({
  songId: {
    type: String,
    required: true,
    unique: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  likedBy: [
    {
      type: String, // Store IP addresses or user IDs
    },
  ],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

SongSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Song || mongoose.model("Song", SongSchema);
