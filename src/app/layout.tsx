import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Akshat Pandey | Full Stack Developer & Freelance Software Engineer",
  description:
    "Welcome to my portfolio! I'm Akshat Pandey, a Full Stack Developer specializing in building responsive web applications using modern technologies like React, Node.js, and more. Explore my projects, skills, and get in touch for collaboration.",
  keywords: [
    "Akshat Pandey",
    "Full Stack Developer",
    "Software Engineer",
    "Freelancer",
    "Web Developer",
    "React",
    "Node.js",
    "Portfolio",
    "Technology",
    "AI Solutions",
    "Entrepreneurship",
  ],
  authors: [{ name: "Akshat Pandey" }],
  openGraph: {
    title: "Akshat Pandey | Full Stack Developer & Freelance Software Engineer",
    description:
      "Explore my portfolio showcasing web applications, projects, and skills in modern software development.",
    url: "https://akshath.vercel.app/", 
    images: [
      {
        url: "https://cdn.sanity.io/images/mnzfyx37/production/bef862dcca260cd50cf89d8e8c96598471d136cd-1892x890.png", 
        width: 800,
        height: 600,
        alt: "Portfolio Preview",
      },
    ],
    siteName: "Akshat Pandey Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Akshat Pandey | Full Stack Developer & Freelance Software Engineer",
    description:
      "Welcome to my portfolio! Discover my projects and skills in web development.",
    images: ["https://cdn.sanity.io/images/mnzfyx37/production/f669e95d5ce7f6a079dd6ec68193732c3c7b218e-960x1280.jpg"], 
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={poppins.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
