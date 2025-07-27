"use client";

import { useProjects } from "@/utils/project-context";
import { ExternalLink, Github, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, ReactNode, SetStateAction } from "react";

interface DialogProps {
  showDialog: boolean;
  setShowDialog: Dispatch<SetStateAction<boolean>>;
}

export const Dialog = ({ showDialog, setShowDialog }: DialogProps) => {
  const { singleProject } = useProjects();

  return (
    <>
      {showDialog && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 grid place-items-center"
          onClick={(e) => e.target === e.currentTarget && setShowDialog(false)}
        >
          <div className="bg-black/90 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-white/10">
            {singleProject && (
              <div className="relative">
                <button
                  className="absolute top-4 right-4 bg-black size-8 rounded-full border border-white/40 grid place-items-center text-white"
                  onClick={() => setShowDialog(false)}
                >
                  <X size={20} />
                </button>

                <Image
                  src={singleProject.image.url}
                  width={300}
                  height={300}
                  alt={singleProject.title}
                  className="w-full aspect-video md:aspect-[16/9] object-cover object-center"
                />

                <div className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <h5 className="text-2xl md:text-4xl font-bold">
                      {singleProject.title}
                    </h5>
                    <div className="flex items-center gap-4">
                      <Link
                        href={singleProject.githuburl}
                        className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <Github size={20} />
                      </Link>
                      <Link
                        href={singleProject.liveurl}
                        className="p-2 bg-primary text-black rounded-full hover:bg-primary/80 transition-colors"
                      >
                        <ExternalLink size={20} />
                      </Link>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {singleProject.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <p className="text-white/70 leading-relaxed">
                    {singleProject.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
