"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  ArrowRight,
  Search,
  Calendar,
  Disc,
  ExternalLink,
} from "lucide-react";
import { Music as MusicType } from "@/utils/interfaces";
import {
  SectionHeading,
  SlideIn,
  Transition,
  Input,
  Textarea,
  TextReveal,
} from "@/components/ui";
import { fetchMusicTracks } from "@/lib/sanity-queries";

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
  const [filteredSongs, setFilteredSongs] = useState<MusicType[]>([]);
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    filterSongs();
  }, [songs, searchQuery, selectedGenre]);

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
      const musicTracks = await fetchMusicTracks();
      const enabledSongs = musicTracks.filter((song) => song.enabled);
      setSongs(enabledSongs);

      // Fetch stats for all songs
      enabledSongs.forEach((song) => {
        fetchSongStats(song._id);
      });
    } catch (error) {
      console.error("Error fetching songs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterSongs = () => {
    let filtered = songs;

    // Filter by genre
    if (selectedGenre !== "all") {
      filtered = filtered.filter((song) => song.genre === selectedGenre);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (song) =>
          song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
          song.album?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredSongs(filtered);
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
    const currentIndex = filteredSongs.findIndex(
      (song) => song._id === currentSong._id
    );
    const nextIndex = (currentIndex + 1) % filteredSongs.length;
    setCurrentSong(filteredSongs[nextIndex]);
  };

  const prevSong = () => {
    if (!currentSong) return;
    const currentIndex = filteredSongs.findIndex(
      (song) => song._id === currentSong._id
    );
    const prevIndex =
      currentIndex === 0 ? filteredSongs.length - 1 : currentIndex - 1;
    setCurrentSong(filteredSongs[prevIndex]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const allGenres = Array.from(
    new Set(songs.map((song) => song.genre).filter(Boolean))
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1db954] mx-auto mb-4"></div>
          <p className="text-white/60">Loading music...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#121212] text-white pb-32 relative overflow-x-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1a1a] via-[#121212] to-[#000000] -z-10" />

      {/* Back to Home */}
      <div className="fixed md:top-8 top-6 md:left-8 left-6 z-30">
        <Transition>
          <Link
            href="/"
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
          >
            <ArrowRight
              className="rotate-180 group-hover:-translate-x-1 transition-transform"
              size={20}
            />
            <TextReveal>Back to Home</TextReveal>
          </Link>
        </Transition>
      </div>

      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-8 md:mb-16">
          <SectionHeading className="mb-8 text-white">
            <SlideIn className="text-white/40">My</SlideIn>
            <br />
            <SlideIn>Music</SlideIn>
          </SectionHeading>
          <Transition transition={{ delay: 0.3 }}>
            <p className="text-white/70 text-base md:text-lg lg:text-xl max-w-2xl mx-auto px-4">
              Original compositions and musical creations from my artistic
              journey
            </p>
          </Transition>
        </div>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-12">
          <Transition className="mb-8">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search songs, artists, albums..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 py-3 md:py-4 bg-[#2a2a2a] border-[#404040] rounded-xl text-base md:text-lg text-white placeholder-white/40 focus:border-[#1db954] focus:ring-1 focus:ring-[#1db954]"
              />
            </div>
          </Transition>

          <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
            <Transition>
              <button
                onClick={() => setSelectedGenre("all")}
                className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-full border transition-all font-medium ${
                  selectedGenre === "all"
                    ? "bg-[#1db954] text-black border-[#1db954] shadow-lg shadow-[#1db954]/25"
                    : "border-white/30 hover:border-white/50 hover:bg-white/5"
                }`}
              >
                <TextReveal>{`All (${songs.length})`}</TextReveal>
              </button>
            </Transition>
            {allGenres.map((genre, index) => {
              const count = songs.filter((song) => song.genre === genre).length;
              return (
                <Transition
                  key={genre}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedGenre(genre!)}
                    className={`px-4 md:px-6 py-2 md:py-3 text-sm md:text-base rounded-full border transition-all font-medium capitalize ${
                      selectedGenre === genre
                        ? "bg-[#1db954] text-black border-[#1db954] shadow-lg shadow-[#1db954]/25"
                        : "border-white/30 hover:border-white/50 hover:bg-white/5"
                    }`}
                  >
                    <TextReveal>{`${genre} (${count})`}</TextReveal>
                  </button>
                </Transition>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* Songs List */}
          <div className="xl:col-span-8 order-2 xl:order-1">
            {filteredSongs.length === 0 ? (
              <div className="text-center py-12 md:py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                  <MusicIcon className="text-white/40" size={32} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold mb-4">
                  No songs found
                </h3>
                <p className="text-white/60 text-base md:text-lg px-4">
                  {searchQuery || selectedGenre !== "all"
                    ? "Try adjusting your search criteria or browse all songs."
                    : "No music tracks are available at the moment."}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredSongs.map((song, index) => (
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
            )}
          </div>

          {/* Now Playing Sidebar */}
          <div className="xl:col-span-4 order-1 xl:order-2">
            {currentSong && (
              <div className="sticky top-6">
                <Transition>
                  <div className="bg-gradient-to-b from-[#2a2a2a] to-[#1a1a1a] rounded-2xl p-6 backdrop-blur-sm border border-white/10">
                    {/* Now Playing Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-2 h-2 bg-[#1db954] rounded-full animate-pulse"></div>
                      <h3 className="text-lg font-bold text-[#1db954]">
                        Now Playing
                      </h3>
                    </div>

                    {/* Song Image and Info Layout */}
                    <div className="flex gap-4 mb-6">
                      {/* Song Image */}
                      <div className="w-24 h-24 relative rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
                        <Image
                          src={currentSong.coverImage.url}
                          alt={currentSong.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20"></div>
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-lg mb-1 line-clamp-2 text-white">
                          {currentSong.title}
                        </h4>
                        <p className="text-white/70 text-sm mb-2 line-clamp-1">
                          {currentSong.artist}
                        </p>
                        {currentSong.album && (
                          <div className="flex items-center gap-1 text-white/50 text-xs mb-2">
                            <Disc size={12} />
                            <span className="line-clamp-1">
                              {currentSong.album}
                            </span>
                          </div>
                        )}
                        {currentSong.releaseDate && (
                          <div className="flex items-center gap-1 text-white/50 text-xs">
                            <Calendar size={12} />
                            <span>
                              {new Date(currentSong.releaseDate).getFullYear()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Song Description */}
                    {currentSong.description && (
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold mb-2 text-white/90">
                          About this song
                        </h5>
                        <p className="text-sm text-white/70 leading-relaxed">
                          {currentSong.description}
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 mb-6">
                      <button
                        onClick={() => handleLike(currentSong._id)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all font-medium ${
                          songStats[currentSong._id]?.hasLiked
                            ? "bg-red-500/20 text-red-400 shadow-lg shadow-red-500/25"
                            : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
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
                        className={`flex items-center gap-2 px-4 py-2 text-sm rounded-full transition-all font-medium ${
                          showComments
                            ? "bg-[#1db954]/20 text-[#1db954] shadow-lg shadow-[#1db954]/25"
                            : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                        }`}
                      >
                        <MessageCircle size={16} />
                        <span>
                          {songStats[currentSong._id]?.commentsCount || 0}
                        </span>
                      </button>
                      {currentSong.lyrics && (
                        <button
                          onClick={() => setShowLyrics(!showLyrics)}
                          className={`px-4 py-2 text-sm rounded-full transition-all font-medium ${
                            showLyrics
                              ? "bg-[#1db954] text-black shadow-lg shadow-[#1db954]/25"
                              : "bg-white/10 hover:bg-white/20 text-white/70 hover:text-white"
                          }`}
                        >
                          Lyrics
                        </button>
                      )}
                    </div>

                    {/* External Links */}
                    {(currentSong.spotifyUrl ||
                      currentSong.appleMusicUrl ||
                      currentSong.youtubeUrl) && (
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold mb-3 text-white/90">
                          Listen on
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {currentSong.spotifyUrl && (
                            <Link
                              href={currentSong.spotifyUrl}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 bg-[#1db954] text-black rounded-full text-xs font-medium hover:bg-[#1ed760] transition-colors"
                            >
                              <ExternalLink size={12} />
                              Spotify
                            </Link>
                          )}
                          {currentSong.appleMusicUrl && (
                            <Link
                              href={currentSong.appleMusicUrl}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 bg-white text-black rounded-full text-xs font-medium hover:bg-gray-200 transition-colors"
                            >
                              <ExternalLink size={12} />
                              Apple Music
                            </Link>
                          )}
                          {currentSong.youtubeUrl && (
                            <Link
                              href={currentSong.youtubeUrl}
                              target="_blank"
                              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-full text-xs font-medium hover:bg-red-700 transition-colors"
                            >
                              <ExternalLink size={12} />
                              YouTube
                            </Link>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Lyrics Panel */}
                    {showLyrics && currentSong.lyrics && (
                      <div className="mb-6">
                        <h5 className="text-sm font-semibold mb-3 text-white/90">
                          Lyrics
                        </h5>
                        <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent bg-black/20 rounded-lg p-4">
                          <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans leading-relaxed">
                            {currentSong.lyrics}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Comments Section */}
                    {showComments && (
                      <div>
                        <h5 className="text-sm font-semibold mb-4 text-white/90">
                          Comments
                        </h5>

                        {/* Add Comment Form */}
                        <form
                          onSubmit={handleComment}
                          className="mb-6 space-y-3"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Input
                              placeholder="Your name"
                              value={newComment.author}
                              onChange={(e) =>
                                setNewComment({
                                  ...newComment,
                                  author: e.target.value,
                                })
                              }
                              className="bg-black/20 border-white/20 text-white placeholder-white/40 text-sm"
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
                              className="bg-black/20 border-white/20 text-white placeholder-white/40 text-sm"
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
                            className="bg-black/20 border-white/20 text-white placeholder-white/40 text-sm"
                            required
                            rows={3}
                          />
                          <button
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1db954] text-black rounded-full hover:bg-[#1ed760] transition-colors font-medium shadow-lg shadow-[#1db954]/25"
                          >
                            <Send size={14} />
                            Post Comment
                          </button>
                        </form>

                        {/* Comments List */}
                        <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
                          {comments.map((comment) => (
                            <div
                              key={comment._id}
                              className="bg-black/20 rounded-lg p-3"
                            >
                              <div className="flex items-center gap-2 mb-2">
                                <User size={14} className="text-white/60" />
                                <span className="font-medium text-sm text-white">
                                  {comment.author}
                                </span>
                                <span className="text-white/40 text-xs">
                                  {new Date(
                                    comment.createdAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-white/80 text-sm leading-relaxed">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                          {comments.length === 0 && (
                            <p className="text-white/60 text-center py-6 text-sm">
                              No comments yet. Be the first to comment!
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Transition>
              </div>
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
  <div
    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg hover:bg-[#2a2a2a] transition-all duration-300 group cursor-pointer ${
      isCurrentSong ? "bg-[#2a2a2a] border-l-4 border-[#1db954]" : ""
    }`}
  >
    <div className="w-6 md:w-8 text-center text-white/50 group-hover:hidden text-sm md:text-base">
      {isCurrentSong && isPlaying ? (
        <div className="flex items-center justify-center">
          <div className="flex gap-1">
            <div className="w-1 h-4 bg-[#1db954] animate-pulse"></div>
            <div
              className="w-1 h-4 bg-[#1db954] animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-1 h-4 bg-[#1db954] animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      ) : (
        index
      )}
    </div>
    <button
      onClick={onPlay}
      className="w-6 h-6 md:w-8 md:h-8 hidden group-hover:flex items-center justify-center text-[#1db954] hover:scale-110 transition-transform"
    >
      {isCurrentSong && isPlaying ? (
        <Pause size={16} className="md:w-5 md:h-5" />
      ) : (
        <Play size={16} className="md:w-5 md:h-5" />
      )}
    </button>

    <Image
      src={song.coverImage.url}
      alt={song.title}
      width={48}
      height={48}
      className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
    />

    <div className="flex-1 min-w-0">
      <h4
        className={`font-medium truncate text-sm md:text-base ${
          isCurrentSong ? "text-[#1db954]" : "text-white"
        }`}
      >
        {song.title}
      </h4>
      <p className="text-white/70 text-xs md:text-sm truncate">{song.artist}</p>
    </div>

    {song.album && (
      <div className="hidden lg:block text-white/50 text-sm truncate max-w-24 lg:max-w-32">
        {song.album}
      </div>
    )}

    {song.genre && (
      <div className="hidden xl:block">
        <span className="px-2 py-1 bg-[#1db954]/20 text-[#1db954] text-xs rounded-full font-medium capitalize">
          {song.genre}
        </span>
      </div>
    )}

    <div className="text-white/50 text-xs md:text-sm flex-shrink-0">
      {Math.floor(song.duration / 60)}:
      {(song.duration % 60).toString().padStart(2, "0")}
    </div>

    <div className="flex items-center gap-1 md:gap-2">
      <button
        onClick={onLike}
        className={`flex items-center gap-1 p-1.5 md:p-2 rounded-full transition-colors ${
          stats?.hasLiked
            ? "text-red-400 bg-red-500/20"
            : "hover:text-red-400 hover:bg-red-500/10 text-white/50"
        }`}
      >
        <Heart
          size={14}
          className="md:w-4 md:h-4"
          fill={stats?.hasLiked ? "currentColor" : "none"}
        />
        <span className="text-xs hidden sm:inline">{stats?.likes || 0}</span>
      </button>
      <div className="flex items-center gap-1 text-white/50 p-1.5 md:p-2">
        <MessageCircle size={14} className="md:w-4 md:h-4" />
        <span className="text-xs hidden sm:inline">
          {stats?.commentsCount || 0}
        </span>
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
    <div className="fixed bottom-0 left-0 right-0 bg-[#181818] backdrop-blur-md border-t border-white/10 p-3 md:p-4 z-40">
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
            style={{
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${
                (currentTime / duration) * 100
              }%, #4a4a4a ${(currentTime / duration) * 100}%, #4a4a4a 100%)`,
            }}
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          {/* Song Info */}
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <Image
              src={song.coverImage.url}
              alt={song.title}
              width={56}
              height={56}
              className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover flex-shrink-0 shadow-lg"
            />
            <div className="min-w-0">
              <h4 className="font-medium truncate text-sm md:text-base text-white">
                {song.title}
              </h4>
              <p className="text-white/70 text-xs md:text-sm truncate">
                {song.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onPrev}
              className="p-1.5 md:p-2 hover:text-white text-white/70 transition-colors"
            >
              <SkipBack size={18} className="md:w-5 md:h-5" />
            </button>
            <button
              onClick={onTogglePlay}
              className="bg-[#1db954] text-black rounded-full p-2.5 md:p-3 hover:scale-110 transition-transform shadow-lg shadow-[#1db954]/25"
            >
              {isPlaying ? (
                <Pause size={20} className="md:w-6 md:h-6" />
              ) : (
                <Play size={20} className="md:w-6 md:h-6" />
              )}
            </button>
            <button
              onClick={onNext}
              className="p-1.5 md:p-2 hover:text-white text-white/70 transition-colors"
            >
              <SkipForward size={18} className="md:w-5 md:h-5" />
            </button>
          </div>

          {/* Volume */}
          <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
            <Volume2 size={18} className="md:w-5 md:h-5 text-white/70" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-16 md:w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #1db954 0%, #1db954 ${
                  volume * 100
                }%, #4a4a4a ${volume * 100}%, #4a4a4a 100%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPage;
