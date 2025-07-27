import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import Song from "@/models/Song";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { songId } = req.query;
    const clientIp =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      "unknown";

    await clientPromise;

    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const song = await Song.findOne({ songId });

    if (!song) {
      return res.status(200).json({
        likes: 0,
        hasLiked: false,
        commentsCount: 0,
      });
    }

    const hasLiked = song.likedBy.includes(clientIp);

    res.status(200).json({
      likes: song.likes,
      hasLiked,
      commentsCount: song.comments.length,
    });
  } catch (error) {
    console.error("Error fetching song stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
