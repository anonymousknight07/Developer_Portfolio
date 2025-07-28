import { client } from "./sanity";

// Blog queries
export const blogQueries = {
  getAllPosts: `*[_type == "blog" && enabled == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    publishedAt,
    excerpt,
    content,
    featuredImage {
      asset-> {
        _id,
        url
      }
    },
    tags,
    readTime,
    enabled,
    sequence
  }`,

  getPostBySlug: (
    slug: string
  ) => `*[_type == "blog" && slug.current == "${slug}"][0] {
    _id,
    title,
    slug,
    author,
    publishedAt,
    excerpt,
    content,
    featuredImage {
      asset-> {
        _id,
        url
      }
    },
    tags,
    readTime,
    enabled
  }`,
};

// Music queries
export const musicQueries = {
  getAllSongs: `*[_type == "music" && enabled == true] | order(sequence asc) {
    _id,
    title,
    artist,
    album,
    genre,
    releaseDate,
    duration,
    audioFile {
      asset-> {
        _id,
        url
      }
    },
    coverImage {
      asset-> {
        _id,
        url
      }
    },
    lyrics,
    description,
    spotifyUrl,
    appleMusicUrl,
    youtubeUrl,
    soundcloudUrl,
    enabled,
    featured,
    sequence
  }`,

  getFeaturedSongs: `*[_type == "music" && enabled == true && featured == true] | order(sequence asc) {
    _id,
    title,
    artist,
    album,
    genre,
    releaseDate,
    duration,
    audioFile {
      asset-> {
        _id,
        url
      }
    },
    coverImage {
      asset-> {
        _id,
        url
      }
    },
    lyrics,
    description,
    spotifyUrl,
    appleMusicUrl,
    youtubeUrl,
    soundcloudUrl,
    enabled,
    featured,
    sequence
  }`,
};

// Fetch functions
export const fetchBlogPosts = async () => {
  try {
    const posts = await client.fetch(blogQueries.getAllPosts);
    return posts.map((post: any) => ({
      ...post,
      featuredImage: {
        url: post.featuredImage?.asset?.url || "",
      },
    }));
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    return [];
  }
};

export const fetchBlogPostBySlug = async (slug: string) => {
  try {
    const post = await client.fetch(blogQueries.getPostBySlug(slug));
    if (!post) return null;

    return {
      ...post,
      featuredImage: {
        url: post.featuredImage?.asset?.url || "",
      },
    };
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
};

export const fetchMusicTracks = async () => {
  try {
    const tracks = await client.fetch(musicQueries.getAllSongs);
    return tracks.map((track: any) => ({
      ...track,
      coverImage: {
        url: track.coverImage?.asset?.url || "",
      },
      audioFile: track.audioFile
        ? {
            asset: {
              url: track.audioFile.asset.url,
            },
          }
        : null,
    }));
  } catch (error) {
    console.error("Error fetching music tracks:", error);
    return [];
  }
};
