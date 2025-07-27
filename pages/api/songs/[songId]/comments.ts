import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import Song from "@/models/Song";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { songId } = req.query;

  try {
    await clientPromise;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    if (req.method === "GET") {
      const song = await Song.findOne({ songId });
      const comments = song?.comments || [];

      res.status(200).json({ comments });
    } else if (req.method === "POST") {
      const { author, email, content } = req.body;

      if (!author || !email || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let song = await Song.findOne({ songId });

      if (!song) {
        song = new Song({ songId, likes: 0, likedBy: [], comments: [] });
      }

      const newComment = {
        author,
        email,
        content,
        createdAt: new Date(),
      };

      song.comments.push(newComment);
      await song.save();

      res.status(201).json({
        message: "Comment added successfully",
        comment: newComment,
      });
    } else {
      res.status(405).json({ message: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error handling comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
