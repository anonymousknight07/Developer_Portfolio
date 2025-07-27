"use client";

import { Project } from "@/utils/interfaces";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import Filters from "./filters";
import { SectionHeading, SlideIn, TextReveal, Transition } from "./ui";
import { useMediaQuery } from "@/utils/useMediaQuery";
import { Button } from "./ui/button";
import { useCursorVariants } from "@/utils/context";
import { Dialog } from "./ui/dialog";
import { ProjectsProvider, useProjects } from "@/utils/project-context";

interface ProjectProps {
  data: Project[];
}

const Projects = ({ data }: ProjectProps) => {
  return (
    <ProjectsProvider data={data}>
      <section className="md:p-8 p-4 relative" id="projects">
        <SectionHeading className="md:pl-16">
          <SlideIn className="text-white/40">Selected</SlideIn>
          <br />
          <SlideIn>works</SlideIn>
        </SectionHeading>
        <Filters />
        <ProjectContainer />
      </section>
    </ProjectsProvider>
  );
};

export default Projects;

const ProjectContainer = () => {
  const { filteredProjects, setSingleProject } = useProjects();
  const [showMore, setShowMore] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const isMobile = useMediaQuery("(max-width: 768px)");

  const numProjectToShow = isMobile ? 4 : 6;

  return (
    <AnimatePresence>
      <motion.div
        layout
        className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-2 md:gap-6 gap-4 px-2 md:px-0"
      >
        {filteredProjects
          .slice(0, showMore ? filteredProjects.length : numProjectToShow)
          .map((project, index) =>
            project.enabled ? (
              <Transition
                transition={{ delay: 0.2 + index * 0.1 }}
                viewport={{ once: true }}
                key={project._id}
                onClick={() => {
                  setShowDialog(true);
                  setSingleProject(project);
                }}
              >
                <Card {...project} />
              </Transition>
            ) : null
          )}
      </motion.div>
      <div className="grid place-items-center py-8">
        {filteredProjects.length > numProjectToShow && (
          <Button onClick={() => setShowMore(!showMore)}>
            <TextReveal>{showMore ? "Show less" : "Show more"}</TextReveal>
          </Button>
        )}
      </div>
      <Dialog showDialog={showDialog} setShowDialog={setShowDialog} />
    </AnimatePresence>
  );
};

const Card = ({ title, image, description }: Project) => {
  const [hover, setHover] = useState(false);
  const { setVariant } = useCursorVariants();

  const mouseEnter = () => {
    setHover(true);
    setVariant("PROJECT");
  };
  const mouseLeave = () => {
    setHover(false);
    setVariant("DEFAULT");
  };

  return (
    <motion.div
      layout
      className="relative rounded-xl md:rounded-3xl overflow-hidden aspect-square bg-secondary/30 md:px-4 cursor-pointer"
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseLeave}
    >
      <div className="absolute top-3 right-3 w-full h-full flex justify-end md:hidden z-10">
        <div className="bg-white size-8 rounded-full text-black grid place-items-center">
          <ArrowUpRight size={20} />
        </div>
      </div>
      <div className="md:py-8 relative z-10">
        <motion.div
          animate={{ y: hover ? -10 : 0 }}
          className="flex justify-between items-center max-md:hidden"
        >
          <p className="text-sm md:text-lg font-semibold truncate pr-2">
            {title}
          </p>
          <button className="flex gap-2 items-center justify-center max-md:px-4">
            <TextReveal className="text-sm">Visit</TextReveal>
            <span className="bg-black text-white/80 rounded-full p-1">
              <ArrowUpRight className="size-4 md:size-6" />
            </span>
          </button>
        </motion.div>
        <div className="overflow-hidden max-md:hidden">
          <motion.p
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: hover ? -10 : 0, opacity: hover ? 1 : 0 }}
            className="absolute text-white/50 text-sm"
          >
            Click here to know more about the project
          </motion.p>
        </div>
      </div>

      {/* Mobile title overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:hidden">
        <h3 className="text-white font-semibold text-sm truncate">{title}</h3>
      </div>

      <Image
        src={image.url}
        width={500}
        height={500}
        alt={title}
        className="absolute inset-0 object-cover h-full w-full object-center rounded-xl md:rounded-t-3xl"
      />
    </motion.div>
  );
};
