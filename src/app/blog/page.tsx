"use client";

import { BlogPost } from "@/utils/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading, SlideIn, TextReveal, Transition } from "@/components/ui";
import { Calendar, Clock, User } from "lucide-react";
import { formatDate } from "@/utils";
import { fetchBlogPosts } from "@/lib/sanity-queries";
import { useEffect } from "react";

interface BlogProps {
  posts: BlogPost[];
}

const Blog = ({ posts: initialPosts }: BlogProps) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);

  // If no initial posts provided, fetch from Sanity
  useEffect(() => {
    if (!initialPosts || initialPosts.length === 0) {
      fetchBlogPosts().then(setPosts);
    }
  }, [initialPosts]);

  const enabledPosts = posts.filter((post) => post.enabled);
  const allTags = Array.from(
    new Set(enabledPosts.flatMap((post) => post.tags || []))
  );

  const filteredPosts =
    selectedTag === "all"
      ? enabledPosts
      : enabledPosts.filter((post) => post.tags?.includes(selectedTag));

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background Elements */}
      <span className="blob size-1/2 absolute top-20 right-0 blur-[100px] -z-10" />
      <span className="blob size-1/3 absolute bottom-20 left-0 blur-[100px] -z-10" />

      <div className="container mx-auto px-4 py-20">
        <SectionHeading className="text-center mb-8">
          <SlideIn className="text-white/40">Latest</SlideIn>
          <br />
          <SlideIn>Blog Posts</SlideIn>
        </SectionHeading>

        {/* Tag Filters */}
        <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-12 px-4">
          <Transition>
            <button
              onClick={() => setSelectedTag("all")}
              className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-full border transition-all ${
                selectedTag === "all"
                  ? "bg-primary text-black border-primary"
                  : "border-white/30 hover:border-white/50"
              }`}
            >
              <TextReveal>All</TextReveal>
            </button>
          </Transition>
          {allTags.map((tag, index) => (
            <Transition key={tag} transition={{ delay: 0.1 + index * 0.05 }}>
              <button
                onClick={() => setSelectedTag(tag)}
                className={`px-3 md:px-4 py-2 text-sm md:text-base rounded-full border transition-all ${
                  selectedTag === tag
                    ? "bg-primary text-black border-primary"
                    : "border-white/30 hover:border-white/50"
                }`}
              >
                <TextReveal>{tag}</TextReveal>
              </button>
            </Transition>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {filteredPosts.map((post, index) => (
            <Transition
              key={post._id}
              transition={{ delay: 0.2 + index * 0.1 }}
              viewport={{ once: true }}
            >
              <BlogCard post={post} />
            </Transition>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12 md:py-20">
            <p className="text-white/60 text-lg">
              No posts found for the selected tag.
            </p>
          </div>
        )}
      </div>
    </main>
  );
};

const BlogCard = ({ post }: { post: BlogPost }) => {
  const publishedDate = formatDate(post.publishedAt);

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block bg-secondary/20 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-secondary/40 transition-all duration-300 border border-white/10"
    >
      <div className="aspect-[4/3] md:aspect-video relative overflow-hidden">
        <Image
          src={post.featuredImage.url}
          alt={post.title}
          width={400}
          height={250}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="absolute top-2 md:top-4 left-2 md:left-4 flex flex-wrap gap-1 md:gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary text-black text-xs md:text-sm rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 md:mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-white/70 mb-3 md:mb-4 line-clamp-2 md:line-clamp-3 text-sm md:text-base">
          {post.excerpt}
        </p>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 text-xs md:text-sm text-white/50">
          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {publishedDate.month}/{publishedDate.year}
              </span>
            </div>
          </div>

          {post.readTime && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{post.readTime} min read</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default Blog;
