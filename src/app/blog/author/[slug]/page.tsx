"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { Author, BlogPost } from "@/utils/interfaces";
import { formatDate } from "@/utils";
import { Transition } from "@/components/ui";
import { fetchAllAuthors, fetchBlogPosts } from "@/lib/sanity-queries";
import { PortableTextRenderer } from "@/components/portable-text";

const AuthorPage = () => {
  const params = useParams();
  const [author, setAuthor] = useState<Author | null>(null);
  const [authorPosts, setAuthorPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.slug) {
      fetchAuthorData(params.slug as string);
    }
  }, [params?.slug]);

  const fetchAuthorData = async (slug: string) => {
    try {
      // Get all authors and find the one with matching slug
      const authors = await fetchAllAuthors();
      const currentAuthor = authors.find(
        (a) =>
          a.slug?.current === slug ||
          a.name.toLowerCase().replace(/\s+/g, "-") === slug
      );

      if (currentAuthor) {
        setAuthor(currentAuthor);

        // Get all posts by this author
        const allPosts = await fetchBlogPosts();
        const authorPosts = allPosts.filter(
          (post) => post.author === currentAuthor.name && post.enabled
        );
        setAuthorPosts(authorPosts);
      }
    } catch (error) {
      console.error("Error fetching author data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-white/60">Loading author...</p>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Author Not Found</h1>
          <p className="text-white/60 mb-8">
            The author you&apos;re looking for doesn&apos;t exist.
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

  return (
    <main className="min-h-screen bg-background relative">
      {/* Background Elements */}
      <span className="blob size-1/2 absolute top-20 right-0 blur-[100px] -z-10" />
      <span className="blob size-1/3 absolute bottom-20 left-0 blur-[100px] -z-10" />

      <div className="container mx-auto px-4 py-20 max-w-6xl">
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

        {/* Author Header */}
        <section className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {/* Author Image */}
            {author.image?.url && (
              <Transition className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={author.image.url}
                    alt={author.name}
                    width={200}
                    height={200}
                    className="rounded-full object-cover w-32 h-32 md:w-48 md:h-48 border-4 border-white/10"
                    priority
                  />
                </div>
              </Transition>
            )}

            {/* Author Info */}
            <div className="flex-1">
              <Transition>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-white">
                  {author.name}
                </h1>
              </Transition>

              <Transition transition={{ delay: 0.2 }}>
                <div className="flex items-center gap-4 text-white/60 mb-6 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    <span>Author</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>{authorPosts.length} posts</span>
                  </div>
                </div>
              </Transition>

              {/* Author Bio */}
              {author.bio && author.bio.length > 0 && (
                <Transition transition={{ delay: 0.3 }}>
                  <div className="text-white/80 leading-relaxed max-w-3xl">
                    <PortableTextRenderer content={author.bio} />
                  </div>
                </Transition>
              )}
            </div>
          </div>
        </section>

        {/* Author's Posts */}
        <section>
          <Transition>
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">
              Posts by {author.name}
            </h2>
          </Transition>

          {authorPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/60 text-lg">
                No posts found by this author.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {authorPosts.map((post, index) => (
                <Transition
                  key={post._id}
                  transition={{ delay: 0.1 + index * 0.1 }}
                >
                  <AuthorPostCard post={post} />
                </Transition>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

const AuthorPostCard = ({ post }: { post: BlogPost }) => {
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

export default AuthorPage;
