"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Play } from "lucide-react";

export function MainNav() {
  const pathname = usePathname();
  const isEditor = pathname?.startsWith('/editor');

  if (isEditor) return null;

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b z-50 px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Play className="w-4 h-4 fill-current" />
        </div>
        <span className="font-semibold text-lg tracking-tight">AI Video</span>
      </div>

      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
        <Link href="#features" className="hover:text-black transition-colors">Features</Link>
        <Link href="#how-it-works" className="hover:text-black transition-colors">How it works</Link>
        <Link href="#pricing" className="hover:text-black transition-colors">Pricing</Link>
      </nav>

      <div className="flex items-center gap-4">
        <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-black hidden sm:block">
          Log in
        </Link>
        <Link href="/editor">
          <Button className="rounded-full px-6">Get Started</Button>
        </Link>
      </div>
    </motion.header>
  );
}
