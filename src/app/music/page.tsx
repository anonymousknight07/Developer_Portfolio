"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  MessageCircle,
  Music as MusicIcon,
  Clock,
  User,
  Mail,
  Send,
} from "lucide-react";
import { Music as MusicType } from "@/utils/interfaces";
import {
  SectionHeading,
  SlideIn,
  Transition,
  Input,
  Textarea,
} from "@/components/ui";

interface SongStats {
  likes: number;
  hasLiked: boolean;
  commentsCount: number;
}

interface Comment {
  _id: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
}

const MusicPage = () => {
  const [songs, setSongs] = useState<MusicType[]>([]);
  const [currentSong, setCurrentSong] = useState<MusicType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [songStats, setSongStats] = useState<Record<string, SongStats>>({});
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    author: "",
    email: "",
    content: "",
  });
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [currentSong]);

  useEffect(() => {
    if (currentSong) {
      fetchSongStats(currentSong._id);
      fetchComments(currentSong._id);
    }
  }, [currentSong]);

  const fetchSongs = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL as string);
      const { user } = await res.json();
      const enabledSongs = (user.music || []).filter(
        (song: MusicType) => song.enabled
      );
      setSongs(enabledSongs);

      // Fetch stats for all songs
      enabledSongs.forEach((song: MusicType) => {
        fetchSongStats(song._id);
      });
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSongStats = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/stats`);
      const stats = await res.json();
      setSongStats((prev) => ({ ...prev, [songId]: stats }));
    } catch (error) {
      console.error("Error fetching song stats:", error);
    }
  };

  const fetchComments = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async (songId: string) => {
    try {
      const res = await fetch(`/api/songs/${songId}/like`, {
        method: "POST",
      });
      const data = await res.json();
      setSongStats((prev) => ({
        ...prev,
        [songId]: {
          ...prev[songId],
          likes: data.likes,
          hasLiked: data.hasLiked,
        },
      }));
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentSong ||
      !newComment.author ||
      !newComment.email ||
      !newComment.content
    )
      return;

    try {
      const res = await fetch(`/api/songs/${currentSong._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newComment),
      });

      if (res.ok) {
        setNewComment({ author: "", email: "", content: "" });
        fetchComments(currentSong._id);
        fetchSongStats(currentSong._id);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const playSong = (song: MusicType) => {
    if (currentSong?._id === song._id) {
      togglePlayPause();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setShowLyrics(false);
      setShowComments(false);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(
      (song) => song._id === currentSong._id
    );
    const nextIndex = (currentIndex + 1) % songs.length;
    setCurrentSong(songs[nextIndex]);
  };

  const prevSong = () => {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(
      (song) => song._id === currentSong._id
    );
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    setCurrentSong(songs[prevIndex]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Loading music...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pb-32">
      <div className="container mx-auto px-4 py-20">
        <SectionHeading className="text-center mb-16">
          <SlideIn className="text-white/40">My</SlideIn>
          <br />
          <SlideIn>Music</SlideIn>
        </SectionHeading>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Songs List */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {songs.map((song, index) => (
                <Transition
                  key={song._id}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <SongRow
                    song={song}
                    onPlay={() => playSong(song)}
                    onLike={() => handleLike(song._id)}
                    isCurrentSong={currentSong?._id === song._id}
                    isPlaying={isPlaying}
                    stats={songStats[song._id]}
                    index={index + 1}
                  />
                </Transition>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {currentSong && (
              <>
                {/* Now Playing */}
                <Transition>
                  <div className="bg-secondary/30 rounded-xl p-6">
                    <h3 className="text-xl font-bold mb-4">Now Playing</h3>
                    <div className="aspect-square relative mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={currentSong.coverImage.url}
                        alt={currentSong.title}
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h4 className="font-bold text-lg mb-1">
                      {currentSong.title}
                    </h4>
                    <p className="text-white/70 mb-4">{currentSong.artist}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <button
                        onClick={() => handleLike(currentSong._id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full transition-colors ${
                          songStats[currentSong._id]?.hasLiked
                            ? "bg-red-500/20 text-red-400"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                      >
                        <Heart
                          size={16}
                          fill={
                            songStats[currentSong._id]?.hasLiked
                              ? "currentColor"
                              : "none"
                          }
                        />
                        <span>{songStats[currentSong._id]?.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      >
                        <MessageCircle size={16} />
                        <span>
                          {songStats[currentSong._id]?.commentsCount || 0}
                        </span>
                      </button>
                      {currentSong.lyrics && (
                        <button
                          onClick={() => setShowLyrics(!showLyrics)}
                          className={`px-3 py-2 rounded-full transition-colors ${
                            showLyrics
                              ? "bg-primary text-black"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          <MusicIcon size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </Transition>

                {/* Lyrics */}
                {showLyrics && currentSong.lyrics && (
                  <Transition>
                    <div className="bg-secondary/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">Lyrics</h3>
                      <div className="max-h-96 overflow-y-auto">
                        <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                          {currentSong.lyrics}
                        </pre>
                      </div>
                    </div>
                  </Transition>
                )}

                {/* Comments */}
                {showComments && (
                  <Transition>
                    <div className="bg-secondary/30 rounded-xl p-6">
                      <h3 className="text-xl font-bold mb-4">Comments</h3>

                      {/* Add Comment Form */}
                      <form onSubmit={handleComment} className="mb-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            placeholder="Your name"
                            value={newComment.author}
                            onChange={(e) =>
                              setNewComment({
                                ...newComment,
                                author: e.target.value,
                              })
                            }
                            required
                          />
                          <Input
                            type="email"
                            placeholder="Your email"
                            value={newComment.email}
                            onChange={(e) =>
                              setNewComment({
                                ...newComment,
                                email: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <Textarea
                          placeholder="Write a comment..."
                          value={newComment.content}
                          onChange={(e) =>
                            setNewComment({
                              ...newComment,
                              content: e.target.value,
                            })
                          }
                          required
                          rows={3}
                        />
                        <button
                          type="submit"
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-full hover:bg-primary/80 transition-colors"
                        >
                          <Send size={16} />
                          Post Comment
                        </button>
                      </form>

                      {/* Comments List */}
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {comments.map((comment) => (
                          <div
                            key={comment._id}
                            className="bg-white/5 rounded-lg p-4"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <User size={16} className="text-white/60" />
                              <span className="font-medium">
                                {comment.author}
                              </span>
                              <span className="text-white/40 text-sm">
                                {new Date(
                                  comment.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-white/80">{comment.content}</p>
                          </div>
                        ))}
                        {comments.length === 0 && (
                          <p className="text-white/60 text-center py-8">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  </Transition>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Music Player */}
      {currentSong && (
        <MusicPlayer
          song={currentSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          onTogglePlay={togglePlayPause}
          onNext={nextSong}
          onPrev={prevSong}
          onSeek={(time) => {
            if (audioRef.current) {
              audioRef.current.currentTime = time;
            }
          }}
          onVolumeChange={(vol) => {
            setVolume(vol);
            if (audioRef.current) {
              audioRef.current.volume = vol;
            }
          }}
        />
      )}

      {/* Hidden Audio Element */}
      {currentSong?.audioFile && (
        <audio
          ref={audioRef}
          src={currentSong.audioFile.asset.url}
          onEnded={nextSong}
          autoPlay={isPlaying}
        />
      )}
    </main>
  );
};

const SongRow = ({
  song,
  onPlay,
  onLike,
  isCurrentSong,
  isPlaying,
  stats,
  index,
}: {
  song: MusicType;
  onPlay: () => void;
  onLike: () => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
  stats?: SongStats;
  index: number;
}) => (
  <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg hover:bg-secondary/40 transition-all group">
    <div className="w-8 text-center text-white/50 group-hover:hidden">
      {index}
    </div>
    <button
      onClick={onPlay}
      className="w-8 h-8 hidden group-hover:flex items-center justify-center text-primary hover:scale-110 transition-transform"
    >
      {isCurrentSong && isPlaying ? <Pause size={20} /> : <Play size={20} />}
    </button>

    <Image
      src={song.coverImage.url}
      alt={song.title}
      width={48}
      height={48}
      className="w-12 h-12 rounded-lg object-cover"
    />

    <div className="flex-1 min-w-0">
      <h4
        className={`font-medium truncate ${
          isCurrentSong ? "text-primary" : ""
        }`}
      >
        {song.title}
      </h4>
      <p className="text-white/70 text-sm truncate">{song.artist}</p>
    </div>

    {song.album && (
      <div className="hidden md:block text-white/50 text-sm truncate max-w-32">
        {song.album}
      </div>
    )}

    <div className="text-white/50 text-sm">
      {Math.floor(song.duration / 60)}:
      {(song.duration % 60).toString().padStart(2, "0")}
    </div>

    <div className="flex items-center gap-2">
      <button
        onClick={onLike}
        className={`flex items-center gap-1 p-1 rounded transition-colors ${
          stats?.hasLiked ? "text-red-400" : "hover:text-red-400"
        }`}
      >
        <Heart size={16} fill={stats?.hasLiked ? "currentColor" : "none"} />
        <span className="text-xs">{stats?.likes || 0}</span>
      </button>
      <div className="flex items-center gap-1 text-white/50">
        <MessageCircle size={16} />
        <span className="text-xs">{stats?.commentsCount || 0}</span>
      </div>
    </div>
  </div>
);

const MusicPlayer = ({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
}: {
  song: MusicType;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}) => {
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10 p-4 z-40">
      <div className="max-w-6xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e) => onSeek(Number(e.target.value))}
            className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {/* Song Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Image
              src={song.coverImage.url}
              alt={song.title}
              width={56}
              height={56}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="font-medium truncate">{song.title}</h4>
              <p className="text-white/70 text-sm truncate">{song.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={onPrev}
              className="p-2 hover:text-primary transition-colors"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={onTogglePlay}
              className="bg-primary text-black rounded-full p-3 hover:scale-110 transition-transform"
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} />}
            </button>
            <button
              onClick={onNext}
              className="p-2 hover:text-primary transition-colors"
            >
              <SkipForward size={20} />
            </button>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Volume2 size={20} />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
