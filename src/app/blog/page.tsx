"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, Search } from "lucide-react";
import {
  SectionHeading,
  SlideIn,
  TextReveal,
  Transition,
  Input,
} from "@/components/ui";
import { formatDate } from "@/utils";
import { BlogPost } from "@/utils/interfaces";

const BlogPage = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, selectedTag, searchQuery]);

  const fetchPosts = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL as string);
      const { user } = await res.json();
      setPosts(user.blog || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts.filter((post) => post.enabled);

    // Filter by tag
    if (selectedTag !== "all") {
      filtered = filtered.filter((post) => post.tags?.includes(selectedTag));
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    setFilteredPosts(filtered);
  };

  const allTags = Array.from(new Set(posts.flatMap((post) => post.tags || [])));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <SectionHeading className="text-center mb-16">
          <SlideIn className="text-white/40">My</SlideIn>
          <br />
          <SlideIn>Blog</SlideIn>
        </SectionHeading>

        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <Transition className="mb-8">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/30 border-white/20"
              />
            </div>
          </Transition>

          <div className="flex flex-wrap gap-3 justify-center">
            <Transition>
              <button
                onClick={() => setSelectedTag("all")}
                className={`px-4 py-2 rounded-full border transition-all ${
                  selectedTag === "all"
                    ? "bg-primary text-black border-primary"
                    : "border-white/30 hover:border-white/50"
                }`}
              >
              <TextReveal>{`All (${posts.length})`}</TextReveal>

              </button>
            </Transition>
            {allTags.map((tag, index) => {
              const count = posts.filter((post) =>
                post.tags?.includes(tag)
              ).length;
              return (
                <Transition
                  key={tag}
                  transition={{ delay: 0.1 + index * 0.05 }}
                >
                  <button
                    onClick={() => setSelectedTag(tag)}
                    className={`px-4 py-2 rounded-full border transition-all ${
                      selectedTag === tag
                        ? "bg-primary text-black border-primary"
                        : "border-white/30 hover:border-white/50"
                    }`}
                  >
                    <TextReveal>{`${tag} (${count})`}</TextReveal>
                  </button>
                </Transition>
              );
            })}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="max-w-6xl mx-auto">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/60 text-lg">
                {searchQuery || selectedTag !== "all"
                  ? "No posts found matching your criteria."
                  : "No blog posts available."}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          )}
        </div>
      </div>
    </main>
  );
};

const BlogCard = ({ post }: { post: BlogPost }) => {
  const publishedDate = formatDate(post.publishedAt);

  return (
    <Link
      href={`/blog/${post.slug.current}`}
      className="group block bg-secondary/30 rounded-xl overflow-hidden hover:bg-secondary/50 transition-all duration-300 hover:scale-105"
    >
      <div className="aspect-video relative overflow-hidden">
        <Image
          src={post.featuredImage.url}
          alt={post.title}
          width={400}
          height={250}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

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
            {post.tags.length > 2 && (
              <span className="px-2 py-1 bg-white/20 text-white text-xs rounded-full font-medium">
                +{post.tags.length - 2}
              </span>
            )}
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
                {String(publishedDate.month)}/{String(publishedDate.year)}
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

export default BlogPage;
