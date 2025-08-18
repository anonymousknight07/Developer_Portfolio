"use client";

import { PortableText, PortableTextComponents } from "@portabletext/react";
import { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

interface PortableTextRendererProps {
  content: PortableTextBlock[];
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }

      return (
        <div className="my-8">
          <Image
            src={urlFor(value).width(800).height(450).url()}
            alt={value.alt || "Blog image"}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
          />
          {value.alt && (
            <p className="text-center text-sm text-white/60 mt-2 italic">
              {value.alt}
            </p>
          )}
        </div>
      );
    },
  },
  block: {
    normal: ({ children }) => (
      <p className="mb-4 text-white/90 leading-relaxed">{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl font-bold mb-6 mt-8 text-white">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl md:text-3xl font-bold mb-4 mt-6 text-white">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl md:text-2xl font-bold mb-3 mt-5 text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg md:text-xl font-bold mb-2 mt-4 text-white">
        {children}
      </h4>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-white/80 bg-white/5 py-4 rounded-r-lg">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside mb-4 space-y-2 text-white/90">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside mb-4 space-y-2 text-white/90">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="ml-4">{children}</li>,
    number: ({ children }) => <li className="ml-4">{children}</li>,
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-white/90">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:text-primary/80 underline transition-colors"
      >
        {children}
      </a>
    ),
  },
};

export const PortableTextRenderer = ({
  content,
}: PortableTextRendererProps) => {
  if (!content || content.length === 0) {
    return (
      <div className="text-white/60 text-center py-8">
        <p>No content available for this post.</p>
      </div>
    );
  }

  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <PortableText value={content} components={components} />
    </div>
  );
};
