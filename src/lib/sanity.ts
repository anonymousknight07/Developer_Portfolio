import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "your-project-id",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  useCdn: true,
  apiVersion: "2023-05-03",
});

const builder = imageUrlBuilder(client);

export const urlFor = (source: any) => builder.image(source);

// Blog queries
export const blogQueries = {
  getAllPosts: `*[_type == "blog" && enabled == true] | order(publishedAt desc) {
    _id,
    title,
    slug,
    author,
    publishedAt,
    excerpt,
    featuredImage,
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
    featuredImage,
    tags,
    readTime,
    enabled
  }`,

  getAllTags: `*[_type == "blog" && enabled == true] {
    tags
  }`,
};
