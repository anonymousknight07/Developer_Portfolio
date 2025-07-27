// Sanity schemas for Blog and Music sections

export const blogSchema = {
  name: "blog",
  title: "Blog Posts",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "author",
      title: "Author",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      validation: (Rule: any) => Rule.required().max(200),
    },
    {
      name: "content",
      title: "Content",
      type: "array",
      of: [
        {
          type: "block",
        },
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
    },
    {
      name: "featuredImage",
      title: "Featured Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    },
    {
      name: "readTime",
      title: "Read Time (minutes)",
      type: "number",
    },
    {
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "sequence",
      title: "Sequence",
      type: "number",
    },
  ],
  orderings: [
    {
      title: "Published Date, New",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
};

export const musicSchema = {
  name: "music",
  title: "Music",
  type: "document",
  fields: [
    {
      name: "title",
      title: "Song Title",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "artist",
      title: "Artist",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "album",
      title: "Album",
      type: "string",
    },
    {
      name: "genre",
      title: "Genre",
      type: "string",
    },
    {
      name: "releaseDate",
      title: "Release Date",
      type: "date",
    },
    {
      name: "duration",
      title: "Duration (in seconds)",
      type: "number",
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: "audioFile",
      title: "Audio File",
      type: "file",
      options: {
        accept: "audio/*",
      },
    },
    {
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "lyrics",
      title: "Lyrics",
      type: "text",
      rows: 10,
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    },
    {
      name: "spotifyUrl",
      title: "Spotify URL",
      type: "url",
    },
    {
      name: "appleMusicUrl",
      title: "Apple Music URL",
      type: "url",
    },
    {
      name: "youtubeUrl",
      title: "YouTube URL",
      type: "url",
    },
    {
      name: "soundcloudUrl",
      title: "SoundCloud URL",
      type: "url",
    },
    {
      name: "enabled",
      title: "Enabled",
      type: "boolean",
      initialValue: true,
    },
    {
      name: "featured",
      title: "Featured",
      type: "boolean",
      initialValue: false,
    },
    {
      name: "sequence",
      title: "Sequence",
      type: "number",
    },
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
  ],
};
