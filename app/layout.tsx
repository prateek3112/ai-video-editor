import type {Metadata} from 'next';
import './globals.css';
import { Geist, Inter, Sora } from "next/font/google";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});
const inter = Inter({subsets:['latin'],variable:'--font-inter',display:'swap'});
const sora = Sora({subsets:['latin'],variable:'--font-sora',display:'swap'});

export const metadata: Metadata = {
  title: 'AI Video Editor — Viral Edits Powered by AI',
  description: 'AI-powered video editor with dynamic captions, B-roll visuals, transitions, zoom effects, and sound design. Upload raw footage and get viral-ready content.',
  keywords: ['AI video editor', 'auto captions', 'Hinglish', 'viral edits', 'Remotion', 'B-roll'],
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable, inter.variable, sora.variable)}>
      <body suppressHydrationWarning>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
