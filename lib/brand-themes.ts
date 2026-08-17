export type BrandTheme = {
  id: string;
  name: string;
  description: string;
  background: string;
  surface: string;
  accent: string;
  secondary: string;
  text: string;
  mutedText: string;
  fontFamily: string;
  logoUrl?: string;
  iconUrl?: string;
};

export const BRAND_THEMES: BrandTheme[] = [
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Claude & Anthropic aesthetic with warm cream, orange, and dark glass cards.",
    background: "#F5F0EB",
    surface: "#1C1B1A",
    accent: "#E87C4F",
    secondary: "#2D6B4D",
    text: "#1C1B1A",
    mutedText: "#78716C",
    fontFamily: "Inter",
    logoUrl: "/brand/claude-starburst.svg",
  },
  {
    id: "dark-premium",
    name: "Dark Premium",
    description: "Sleek dark card layout with vibrant orange and cream highlights.",
    background: "#0F0F0F",
    surface: "#1A1A1A",
    accent: "#E87C4F",
    secondary: "#2D6B4D",
    text: "#FFFFFF",
    mutedText: "#A1A1AA",
    fontFamily: "Inter",
    logoUrl: "/brand/claude-starburst.svg",
  },
  {
    id: "electric-lime",
    name: "Electric Lime",
    description: "Dark creator-tech look with a high-retention lime accent.",
    background: "#090B10",
    surface: "#141820",
    accent: "#D7FF3F",
    secondary: "#7C3AED",
    text: "#FFFFFF",
    mutedText: "#B8BEC9",
    fontFamily: "Avenir Next",
  },
  {
    id: "signal-orange",
    name: "Signal Orange",
    description: "Editorial warmth, punchy orange and cream.",
    background: "#120B08",
    surface: "#24130D",
    accent: "#FF6A2A",
    secondary: "#FFE7D6",
    text: "#FFFFFF",
    mutedText: "#D9C2B7",
    fontFamily: "Avenir Next",
  },
  {
    id: "cyber-cyan",
    name: "Cyber Cyan",
    description: "Clean AI and software visual language.",
    background: "#07111A",
    surface: "#0C2230",
    accent: "#5EEBFF",
    secondary: "#A78BFA",
    text: "#F7FCFF",
    mutedText: "#A9C2CE",
    fontFamily: "Sora",
  },
  {
    id: "creator-yellow",
    name: "Creator Yellow",
    description: "Bold social-first yellow and hot pink.",
    background: "#11100A",
    surface: "#252110",
    accent: "#FFD83D",
    secondary: "#FF3D81",
    text: "#FFFFFF",
    mutedText: "#D8D1B0",
    fontFamily: "Montserrat",
  },
  {
    id: "mono-lux",
    name: "Mono Lux",
    description: "Minimal black, white and silver for premium brands.",
    background: "#050505",
    surface: "#171717",
    accent: "#FFFFFF",
    secondary: "#9CA3AF",
    text: "#FFFFFF",
    mutedText: "#A3A3A3",
    fontFamily: "Helvetica Neue",
  },
];

export const DEFAULT_BRAND_THEME_ID = "warm-editorial";

export function getBrandTheme(id?: string): BrandTheme {
  return BRAND_THEMES.find((theme) => theme.id === id) ?? BRAND_THEMES[0];
}


