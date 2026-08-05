"use client";

import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Scissors, Wand2, Zap, Play } from "lucide-react";
import Link from "next/link";
import { MainNav } from "@/components/main-nav";
import { AiCreateDialog } from "@/components/ai-create-dialog";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#0A0A0A]">
      <MainNav />
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 pt-24 pb-20 sm:pt-32">
        <div className="flex flex-col items-center text-center space-y-10">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium bg-white shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
            Introducing AI Video Gen 2.0
          </motion.div>

          {/* Hero text */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-7xl font-semibold tracking-tight leading-[1.1] max-w-4xl"
          >
            Never miss a viral moment. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              Never lose a viewer.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-500 max-w-2xl"
          >
            The Apple-quality video editor that automatically turns long boring footage into viral-ready short-form content with one click.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <AiCreateDialog />
            <Link href="/editor">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base rounded-full bg-white shadow-sm hover:shadow-md">
                Open AI Editor Mode
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Live Demo Simulation Graphic */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-24 relative max-w-5xl mx-auto"
        >
          <div className="absolute inset-0 -top-10 -bottom-10 bg-gradient-to-b from-blue-50/50 to-transparent -z-10 rounded-3xl" />
          <div className="glass-panel overflow-hidden rounded-2xl border border-gray-200/50 bg-white/40 shadow-2xl">
            {/* Window controls */}
            <div className="h-12 border-b flex items-center px-4 gap-2 bg-white/50">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto flex h-6 items-center rounded-md bg-gray-100 px-24 text-xs text-gray-500">
                app.aivideo.com
              </div>
            </div>
            {/* Fake UI */}
            <div className="grid md:grid-cols-3 h-[500px]">
              <div className="border-r bg-white/50 p-6 flex flex-col gap-4">
                <div className="h-32 rounded-xl bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-200">
                  <span className="text-sm font-medium text-gray-400">Drag video here</span>
                </div>
                <div className="space-y-3 mt-4">
                  <div className="h-4 w-2/3 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-4 w-full bg-gray-100 rounded-full" />
                  <div className="h-4 w-4/5 bg-gray-100 rounded-full" />
                </div>
              </div>
              <div className="md:col-span-2 relative bg-[#050505] overflow-hidden flex flex-col justify-end p-10">
                <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/800/600')] bg-cover bg-center" />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    repeat: Infinity,
                    repeatType: "reverse",
                    duration: 1.5,
                  }}
                  className="relative z-10 text-center space-y-4"
                >
                  <span className="text-4xl font-extrabold text-white tracking-tight uppercase" style={{ WebkitTextStroke: '1px black' }}>
                    <span className="text-yellow-400">Insane</span> AI tool
                  </span>
                  <br />
                  <span className="text-4xl font-extrabold text-white tracking-tight uppercase" style={{ WebkitTextStroke: '1px black' }}>
                    for creators
                  </span>
                </motion.div>
                
                {/* Timeline UI */}
                <div className="absolute bottom-4 left-4 right-4 h-16 glass-panel rounded-xl flex items-center p-2 gap-2 border-white/10 bg-white/10">
                  <div className="h-full w-10 bg-blue-500 rounded-md" />
                  <div className="h-full flex-1 bg-white/20 rounded-md flex overflow-hidden gap-1 p-1">
                    <div className="h-full w-1/4 bg-white/50 rounded-sm" />
                    <div className="h-full w-1/4 bg-yellow-400/80 rounded-sm" />
                    <div className="h-full w-2/4 bg-white/50 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Wand2 className="h-6 w-6 text-blue-600" />}
            title="Auto Viral Captions"
            description="Animated word-by-word captions like Hormozi, generated in seconds."
          />
          <FeatureCard 
            icon={<Scissors className="h-6 w-6 text-indigo-600" />}
            title="Silence Removal"
            description="Our AI engine perfectly snips out dead air and long pauses."
          />
          <FeatureCard 
            icon={<Zap className="h-6 w-6 text-yellow-500" />}
            title="LLM-based Editing"
            description="Prompt your video: 'Make it punchier' or 'Zoom in on laughs'."
          />
        </div>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-6 rounded-2xl border bg-white shadow-sm flex flex-col gap-4"
    >
      <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}
