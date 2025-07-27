"use client";

import { Music as MusicType } from "@/utils/interfaces";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { SectionHeading, SlideIn, TextReveal, Transition } from "./ui";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  Heart,
  ExternalLink,
  Music as MusicIcon,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface MusicProps {
  songs: MusicType[];
}

const Music = ({ songs }: MusicProps) => {
  const [currentSong, setCurrentSong] = useState<MusicType | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showLyrics, setShowLyrics] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const enabledSongs = songs.filter((song) => song.enabled);
  const featuredSongs = enabledSongs.filter((song) => song.featured);

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

  const playSong = (song: MusicType) => {
    if (currentSong?._id === song._id) {
      togglePlayPause();
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
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

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const nextSong = () => {
    if (!currentSong) return;
    const currentIndex = enabledSongs.findIndex(
      (song) => song._id === currentSong._id
    );
    const nextIndex = (currentIndex + 1) % enabledSongs.length;
    setCurrentSong(enabledSongs[nextIndex]);
  };

  const prevSong = () => {
    if (!currentSong) return;
    const currentIndex = enabledSongs.findIndex(
      (song) => song._id === currentSong._id
    );
    const prevIndex =
      currentIndex === 0 ? enabledSongs.length - 1 : currentIndex - 1;
    setCurrentSong(enabledSongs[prevIndex]);
  };

  return (
    <section className="py-20 px-4 md:px-8 relative" id="music">
      <span className="blob size-1/2 absolute top-20 left-0 blur-[100px] -z-10" />

      <SectionHeading className="md:pl-16">
        <SlideIn className="text-white/40">My</SlideIn>
        <br />
        <SlideIn>Music</SlideIn>
      </SectionHeading>

      {/* Featured Songs */}
      {featuredSongs.length > 0 && (
        <div className="mb-16">
          <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            <Transition>Featured Tracks</Transition>
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSongs.map((song, index) => (
              <Transition
                key={song._id}
                transition={{ delay: 0.1 + index * 0.1 }}
              >
                <FeaturedSongCard
                  song={song}
                  onPlay={() => playSong(song)}
                  isCurrentSong={currentSong?._id === song._id}
                  isPlaying={isPlaying}
                />
              </Transition>
            ))}
          </div>
        </div>
      )}

      {/* All Songs */}
      <div className="mb-16">
        <h3 className="text-2xl md:text-3xl font-bold mb-8 text-center">
          <Transition>All Tracks</Transition>
        </h3>
        <div className="space-y-4">
          {enabledSongs.map((song, index) => (
            <Transition
              key={song._id}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <SongRow
                song={song}
                onPlay={() => playSong(song)}
                isCurrentSong={currentSong?._id === song._id}
                isPlaying={isPlaying}
                index={index + 1}
              />
            </Transition>
          ))}
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
          showLyrics={showLyrics}
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
          onToggleLyrics={() => setShowLyrics(!showLyrics)}
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
    </section>
  );
};

const FeaturedSongCard = ({
  song,
  onPlay,
  isCurrentSong,
  isPlaying,
}: {
  song: MusicType;
  onPlay: () => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
}) => (
  <div className="bg-secondary/30 rounded-xl overflow-hidden group hover:bg-secondary/50 transition-all">
    <div className="aspect-square relative">
      <Image
        src={song.coverImage.url}
        alt={song.title}
        width={300}
        height={300}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <button
          onClick={onPlay}
          className="bg-primary text-black rounded-full p-4 hover:scale-110 transition-transform"
        >
          {isCurrentSong && isPlaying ? (
            <Pause size={24} />
          ) : (
            <Play size={24} />
          )}
        </button>
      </div>
    </div>
    <div className="p-4">
      <h4 className="font-bold text-lg mb-1 line-clamp-1">{song.title}</h4>
      <p className="text-white/70 text-sm mb-2">{song.artist}</p>
      {song.genre && (
        <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs rounded-full">
          {song.genre}
        </span>
      )}
    </div>
  </div>
);

const SongRow = ({
  song,
  onPlay,
  isCurrentSong,
  isPlaying,
  index,
}: {
  song: MusicType;
  onPlay: () => void;
  isCurrentSong: boolean;
  isPlaying: boolean;
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

    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
      <button className="p-1 hover:text-primary transition-colors">
        <Heart size={16} />
      </button>
      {song.spotifyUrl && (
        <Link
          href={song.spotifyUrl}
          className="p-1 hover:text-primary transition-colors"
        >
          <ExternalLink size={16} />
        </Link>
      )}
    </div>
  </div>
);

const MusicPlayer = ({
  song,
  isPlaying,
  currentTime,
  duration,
  volume,
  showLyrics,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleLyrics,
}: {
  song: MusicType;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  showLyrics: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleLyrics: () => void;
}) => (
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

        {/* Volume & Actions */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          {song.lyrics && (
            <button
              onClick={onToggleLyrics}
              className={`p-2 transition-colors ${
                showLyrics ? "text-primary" : "hover:text-primary"
              }`}
            >
              <MusicIcon size={20} />
            </button>
          )}
          <div className="flex items-center gap-2">
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

      {/* Lyrics Panel */}
      {showLyrics && song.lyrics && (
        <div className="mt-4 p-4 bg-secondary/30 rounded-lg max-h-40 overflow-y-auto">
          <h5 className="font-medium mb-2">Lyrics</h5>
          <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">
            {song.lyrics}
          </pre>
        </div>
      )}

      {/* Description */}
      {song.description && (
        <div className="mt-2 text-sm text-white/60">{song.description}</div>
      )}
    </div>
  </div>
);

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export default Music;
