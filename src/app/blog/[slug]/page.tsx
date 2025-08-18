"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, User, ArrowLeft, Tag } from "lucide-react";
import { BlogPost, Author } from "@/utils/interfaces";
import { formatDate } from "@/utils";
import { Transition } from "@/components/ui";
import {
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchAuthorByName,
} from "@/lib/sanity-queries";
import { PortableTextRenderer } from "@/components/portable-text";

const BlogPostPage = () => {
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (params?.slug) {
      fetchPost(params.slug as string);
    }
  }, [params?.slug]);

  const fetchPost = async (slug: string) => {
    try {
      const currentPost = await fetchBlogPostBySlug(slug);
      setPost(currentPost);

      // Fetch author information
      if (currentPost?.author) {
        const authorData = await fetchAuthorByName(currentPost.author);
        setAuthor(authorData);
      }

      // Get related posts (same tags)
      if (currentPost) {
        const posts = await fetchBlogPosts();
        const related = posts
          .filter(
            (p) =>
              p._id !== currentPost._id &&
              p.enabled &&
              p.tags?.some((tag) => currentPost.tags?.includes(tag))
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-white/60 mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-full hover:bg-primary/80 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = formatDate(post.publishedAt);

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background Elements */}
      <span className="blob size-1/2 absolute top-20 right-0 blur-[100px] -z-10" />
      <span className="blob size-1/3 absolute bottom-20 left-0 blur-[100px] -z-10" />

      <article className="container mx-auto px-4 py-20 max-w-4xl">
        {/* Back Button */}
        <Transition className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>
        </Transition>

        {/* Featured Image */}
        <Transition className="mb-8">
          <div className="aspect-[4/3] md:aspect-video relative overflow-hidden rounded-xl">
            <Image
              src={post.featuredImage.url}
              alt={post.title}
              width={800}
              height={450}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        </Transition>

        {/* Post Header */}
        <header className="mb-6 md:mb-8">
          <Transition>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 leading-tight">
              {post.title}
            </h1>
          </Transition>

          <Transition transition={{ delay: 0.2 }}>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 text-white/60 mb-4 md:mb-6 text-sm md:text-base">
              <Link
                href={`/blog/author/${author?.slug?.current || post.author.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-2 hover:text-primary transition-colors"
              >
                <User size={16} className="md:w-[18px] md:h-[18px]" />
                <span>{post.author}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="md:w-[18px] md:h-[18px]" />
                <span>
                  {publishedDate.month}/{publishedDate.year}
                </span>
              </div>
              {post.readTime && (
                <div className="flex items-center gap-2">
                  <Clock size={16} className="md:w-[18px] md:h-[18px]" />
                  <span>{post.readTime} min read</span>
                </div>
              )}
            </div>
          </Transition>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <Transition transition={{ delay: 0.3 }}>
              <div className="flex flex-wrap gap-2 mb-4 md:mb-6">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 md:px-3 py-1 bg-primary/20 text-primary rounded-full text-xs md:text-sm font-medium"
                  >
                    <Tag size={12} className="md:w-[14px] md:h-[14px]" />
                    {tag}
                  </span>
                ))}
              </div>
            </Transition>
          )}

          <Transition transition={{ delay: 0.4 }}>
            <p className="text-base md:text-lg lg:text-xl text-white/80 leading-relaxed">
              {post.excerpt}
            </p>
          </Transition>
        </header>

        {/* Post Content */}
        <Transition transition={{ delay: 0.5 }}>
          <PortableTextRenderer content={post.content} />
        </Transition>

        {/* Author Bio Section */}
        {author && (
          <section className="mt-12 md:mt-16 pt-8 md:pt-16 border-t border-white/10">
            <Transition>
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
                {author.image?.url && (
                  <div className="flex-shrink-0">
                    <Image
                      src={author.image.url}
                      alt={author.name}
                      width={120}
                      height={120}
                      className="rounded-full object-cover w-20 h-20 md:w-30 md:h-30"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">
                    About {author.name}
                  </h3>
                  {author.bio && author.bio.length > 0 && (
                    <div className="text-white/80 leading-relaxed">
                      <PortableTextRenderer content={author.bio} />
                    </div>
                  )}
                </div>
              </div>
            </Transition>
          </section>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 md:mt-16 pt-8 md:pt-16 border-t border-white/10">
            <Transition>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">
                Related Posts
              </h2>
            </Transition>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {relatedPosts.map((relatedPost, index) => (
                <Transition
                  key={relatedPost._id}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <Link
                    href={`/blog/${relatedPost.slug.current}`}
                    className="group block bg-secondary/20 backdrop-blur-sm rounded-xl overflow-hidden hover:bg-secondary/40 transition-all duration-300 border border-white/10"
                  >
                    <div className="aspect-[4/3] md:aspect-video relative overflow-hidden">
                      <Image
                        src={relatedPost.featuredImage.url}
                        alt={relatedPost.title}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors text-sm md:text-base">
                        {relatedPost.title}
                      </h3>
                      <p className="text-white/60 text-xs md:text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                    </div>
                  </Link>
                </Transition>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
};

export default BlogPostPage;
