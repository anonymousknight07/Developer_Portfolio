"use client";

import { BlogPost } from "@/utils/interfaces";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { SectionHeading, SlideIn, TextReveal, Transition } from "./ui";
import { Calendar, Clock, User } from "lucide-react";
import { formatDate } from "@/utils";

interface BlogProps {
  posts: BlogPost[];
}

const Blog = ({ posts }: BlogProps) => {
  const [selectedTag, setSelectedTag] = useState<string>("all");

  const enabledPosts = posts.filter((post) => post.enabled);
  const allTags = Array.from(
    new Set(enabledPosts.flatMap((post) => post.tags || []))
  );

  const filteredPosts =
    selectedTag === "all"
      ? enabledPosts
      : enabledPosts.filter((post) => post.tags?.includes(selectedTag));

  return (
    <section className="py-20 px-4 md:px-8 relative" id="blog">
      <span className="blob size-1/2 absolute top-20 right-0 blur-[100px] -z-10" />

      <SectionHeading className="md:pl-16">
        <SlideIn className="text-white/40">Latest</SlideIn>
        <br />
        <SlideIn>Blog Posts</SlideIn>
      </SectionHeading>

      {/* Tag Filters */}
      <div className="flex flex-wrap gap-3 justify-center mb-12">
        <Transition>
          <button
            onClick={() => setSelectedTag("all")}
            className={`px-4 py-2 rounded-full border transition-all ${
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
              className={`px-4 py-2 rounded-full border transition-all ${
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
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
        <div className="text-center py-20">
          <p className="text-white/60 text-lg">
            No posts found for the selected tag.
          </p>
        </div>
      )}
    </section>
  );
};

const BlogCard = ({ post }: { post: BlogPost }) => {
  const publishedDate = formatDate(post.publishedAt);

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block bg-secondary/30 rounded-xl overflow-hidden hover:bg-secondary/50 transition-all duration-300"
    >
      <div className="aspect-video relative overflow-hidden">
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
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-primary text-black text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl md:text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
          {post.title}
        </h3>

        <p className="text-white/70 mb-4 line-clamp-3 text-sm md:text-base">
          {post.excerpt}
        </p>

        <div className="flex items-center justify-between text-xs md:text-sm text-white/50">
          <div className="flex items-center gap-4">
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
