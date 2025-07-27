import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "@/lib/mongodb";
import Song from "@/models/Song";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
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

    let song = await Song.findOne({ songId });

    if (!song) {
      song = new Song({ songId, likes: 0, likedBy: [], comments: [] });
    }

    const hasLiked = song.likedBy.includes(clientIp);

    if (hasLiked) {
      // Unlike
      song.likes = Math.max(0, song.likes - 1);
      song.likedBy = song.likedBy.filter((ip: string) => ip !== clientIp);
    } else {
      // Like
      song.likes += 1;
      song.likedBy.push(clientIp);
    }

    await song.save();

    res.status(200).json({
      likes: song.likes,
      hasLiked: !hasLiked,
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
