import { PlayIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export const musicType = defineType({
  name: "music",
  title: "Music",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "title",
      title: "Song Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "artist",
      title: "Artist",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "album",
      title: "Album",
      type: "string",
    }),
    defineField({
      name: "genre",
      title: "Genre",
      type: "string",
      options: {
        list: [
          { title: "Pop", value: "pop" },
          { title: "Rock", value: "rock" },
          { title: "Hip Hop", value: "hip-hop" },
          { title: "Electronic", value: "electronic" },
          { title: "Jazz", value: "jazz" },
          { title: "Classical", value: "classical" },
          { title: "R&B", value: "rnb" },
          { title: "Country", value: "country" },
          { title: "Folk", value: "folk" },
          { title: "Indie", value: "indie" },
          { title: "Alternative", value: "alternative" },
          { title: "Other", value: "other" },
        ],
      },
    }),
    defineField({
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    }),
    defineField({
      name: "duration",
      title: "Duration (in seconds)",
      type: "number",
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: "audioFile",
      title: "Audio File",
      type: "file",
      options: {
        accept: "audio/*",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lyrics",
      title: "Lyrics",
      type: "text",
      rows: 15,
      description: "Song lyrics that will be displayed on the frontend",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "spotifyUrl",
      title: "Spotify URL",
      type: "url",
    }),
    defineField({
      name: "appleMusicUrl",
      title: "Apple Music URL",
      type: "url",
    }),
    defineField({
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
    }),
    defineField({
      name: "soundcloudUrl",
      title: "SoundCloud URL",
      type: "url",
    }),
    defineField({
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "sequence",
      title: "Sequence",
      type: "number",
      validation: (Rule) => Rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Release Date, New",
      name: "releaseDateDesc",
      by: [{ field: "releaseDate", direction: "desc" }],
    },
    {
      title: "Sequence",
      name: "sequenceAsc",
      by: [{ field: "sequence", direction: "asc" }],
    },
    {
      title: "Featured First",
      name: "featuredFirst",
      by: [
        { field: "featured", direction: "desc" },
        { field: "sequence", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: {
      title: "title",
      artist: "artist",
      media: "coverImage",
      featured: "featured",
    },
    prepare(selection) {
      const { artist, featured } = selection;
      return {
        ...selection,
        subtitle: `${artist}${featured ? " • Featured" : ""}`,
      };
    },
  },
});
