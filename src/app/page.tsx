import About from "@/components/about";
import Header from "@/components/header";
import Projects from "@/components/projects";
import Testimonials from "@/components/testimonials";
import {
  HoverImageLink,
  ParallaxText,
  SectionHeading,
  SlideIn,
  TextReveal,
  Transition,
} from "@/components/ui";

import { UserObject } from "@/utils/interfaces";
import Experience from "@/components/experience";
import { ContactUs } from "@/components/contact-us";
import Link from "next/link";
import { Hero } from "@/components/hero";
import Blog from "@/components/blog";
import Music from "@/components/music";

export default async function Home() {
  try {
    // Add error handling for the fetch request
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL as string);

    // Check if the response is ok
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    // Check if the response is actually JSON
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new Error("Response is not JSON");
    }

    const { user } = (await res.json()) as UserObject;

    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-white">No user data found</p>
        </div>
      );
    }

    const {
      about,
      testimonials,
      services,
      skills,
      projects,
      social_handles,
      timeline,
      email,
      blog,
      music,
    } = user;

    return (
      <main className="relative">
        <Transition className="fixed md:top-8 top-6 md:left-8 left-6 z-30 hover:text-white/80 text-white/40">
          <Link href={"/"}>
            <TextReveal className="font-semibold ">ThePortfolio</TextReveal>
          </Link>
        </Transition>
        <Header social={social_handles} />
        <Hero about={about} />
        <About about={about} timeline={timeline} />
        <Experience timeline={timeline} />
        {/* ===SKILLS SECTION=== */}
        <section id="skills">
          <ParallaxText baseVelocity={-5}>
            {skills
              .sort((a, b) => a.sequence - b.sequence)
              .map((skill) =>
                skill.enabled ? (
                  <span
                    key={skill._id}
                    className="md:text-7xl text-xl font-semibold uppercase text-white/30"
                  >
                    {skill.name} •
                  </span>
                ) : null
              )}
          </ParallaxText>
          <ParallaxText baseVelocity={5}>
            {skills
              .sort((a, b) => a.sequence - b.sequence)
              .map((skill) =>
                skill.enabled ? (
                  <span
                    key={skill._id}
                    className="md:text-7xl text-xl font-semibold uppercase text-white/30"
                  >
                    {skill.name} •
                  </span>
                ) : null
              )}
          </ParallaxText>
          <ParallaxText baseVelocity={-5}>
            {skills
              .sort((a, b) => a.sequence - b.sequence)
              .map((skill) =>
                skill.enabled ? (
                  <span
                    key={skill._id}
                    className="md:text-7xl text-xl font-semibold uppercase text-white/30"
                  >
                    {skill.name} •
                  </span>
                ) : null
              )}
          </ParallaxText>
        </section>
        {/* ===SERVICES SECTION=== */}
        <section className="px-2 py-20 relative" id="services">
          <span className="blob absolute top-[20%] right-0 w-1/3 h-5/6 blur-[100px] rotate-180 -z-10" />
          <SectionHeading className="md:pl-16 overflow-hidden">
            <SlideIn className="text-white/40">Here&apos;s how</SlideIn> <br />
            <SlideIn>I can help you</SlideIn>
          </SectionHeading>
          <div className="mx-auto pt-10">
            {services.map((service) => (
              <Transition key={service._id}>
                <HoverImageLink
                  heading={service.name}
                  href=""
                  price={service.charge}
                  imgSrc={service.image.url}
                  subheading={service.desc}
                />
              </Transition>
            ))}
          </div>
          <Transition className="flex items-center py-10 md:hidden">
            <div className="p-4 rounded-full border border-white/50">
              <span>Discuss the project</span>
            </div>
          </Transition>
        </section>
        {/* ===PROJECTS SECTION=== */}
        <Projects data={projects} />

        {/* ===BLOG SECTION=== */}
        {blog && blog.length > 0 && <Blog posts={blog} />}

        {/* ===MUSIC SECTION=== */}
        {music && music.length > 0 && <Music songs={music} />}

        {/* ===TESTIMONIALS SECTION=== */}
        <section className="py-20 relative" id="testimonials">
          <span className="blob size-1/2 absolute -top-20 left-0 blur-[100px] -z-10" />
          <SectionHeading className="md:pl-28">
            <SlideIn className="text-white/40">What Our</SlideIn> <br />
            <SlideIn className="">Clients Say</SlideIn>
          </SectionHeading>
          <Testimonials data={testimonials} speed="normal" pauseOnHover />
          <Testimonials
            data={testimonials}
            pauseOnHover
            speed="normal"
            direction="left"
          />
        </section>

        {/* ===CONTACT US=== */}
        <div
          className="rounded-t-[2rem] md:rounded-t-[3rem] overflow-hidden"
          id="contact"
        >
          <ContactUs
            email={email}
            about={about}
            social_handle={social_handles}
          />
        </div>
      </main>
    );
  } catch (error) {
    console.error("Error fetching user data:", error);

    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-500">
          Error Loading Portfolio
        </h1>
        <p className="text-white/70">
          {error instanceof Error
            ? error.message
            : "Failed to load portfolio data"}
        </p>
        <p className="text-white/50 text-sm">
          Please check your API endpoint: {process.env.NEXT_PUBLIC_API_URL}
        </p>
      </div>
    );
  }
}
