import type { ZudokuConfig } from "zudoku";

const config: ZudokuConfig = {
  site: {
    logo: {
      src: { light: "/logo-dark.png", dark: "/logo-light.png" },
      alt: "Opencircle",
      width: "130px",
    },
  },
  navigation: [
    {
      type: "category",
      label: "Platform",
      items: [
        {
          type: "category",
          label: "Getting Started",
          icon: "sparkles",
          items: [
            "/introduction",
            "/self-hosting",
            "/platform-setup",
          ],
        },
        {
          type: "category",
          label: "Core Learning",
          icon: "book",
          items: [
            "/features/courses",
            "/features/lessons",
            "/features/articles",
            "/features/enrollment",
            "/features/sections",
          ],
        },
        {
          type: "category",
          label: "Community & Interaction",
          icon: "users",
          items: [
            "/features/channels",
            "/features/posts",
            "/features/reactions",
            "/features/mention",
            "/features/timeline",
          ],
        },
        {
          type: "category",
          label: "User & System",
          icon: "settings",
          items: [
            "/features/auth",
            "/features/user",
            "/features/notifications",
            "/features/media",
            "/features/appSettings",
          ],
        },
        {
          type: "category",
          label: "Infrastructure",
          icon: "database",
          items: [
            "/features/resources",
            "/features/extras",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Admin",
      items: [
        {
          type: "category",
          label: "Core Admin",
          icon: "shield",
          items: [
            "/admin/dashboard",
            "/admin/appSettings",
            "/admin/auth",
          ],
        },
        {
          type: "category",
          label: "Content Management",
          icon: "file-text",
          items: [
            "/admin/course",
            "/admin/lesson",
            "/admin/section",
            "/admin/articles",
            "/admin/resources",
          ],
        },
        {
          type: "category",
          label: "Community Management",
          icon: "users-2",
          items: [
            "/admin/channels",
            "/admin/user",
            "/admin/inviteCode",
          ],
        },
      ],
    },
  ],
  redirects: [{ from: "/", to: "/introduction" }],
  theme: {
    light: {
      background: "oklch(100% 0 none)",
      foreground: "oklch(14.1% 0.004 286)",
      card: "oklch(100% 0 none)",
      cardForeground: "oklch(14.1% 0.004 286)",
      popover: "oklch(100% 0 none)",
      popoverForeground: "oklch(14.1% 0.004 286)",
      primary: "oklch(0.4769 0.2307 271.68)",
      primaryForeground: "oklch(0.9519 0 258.37)",
      secondary: "oklch(96.8% 0.001 286)",
      secondaryForeground: "oklch(21% 0.006 286)",
      muted: "oklch(96.8% 0.001 286)",
      mutedForeground: "oklch(55.2% 0.014 286)",
      accent: "oklch(96.8% 0.001 286)",
      accentForeground: "oklch(21% 0.006 286)",
      destructive: "oklch(63.7% 0.208 25.3)",
      destructiveForeground: "oklch(0.9519 0 258.37)",
      border: "oklch(92% 0.004 286)",
      input: "oklch(92% 0.004 286)",
      ring: "oklch(21% 0.006 286)",
    },
    dark: {
      background: "oklch(0.1768 0.007 258.37)",
      foreground: "oklch(0.9519 0 258.37)",
      card: "oklch(14.1% 0.004 286)",
      cardForeground: "oklch(0.9519 0 258.37)",
      popover: "oklch(14.1% 0.004 286)",
      popoverForeground: "oklch(0.9519 0 258.37)",
      primary: "oklch(0.4769 0.2307 271.68)",
      primaryForeground: "oklch(21% 0.006 286)",
      secondary: "oklch(27.4% 0.005 286)",
      secondaryForeground: "oklch(0.9519 0 258.37)",
      muted: "oklch(27.4% 0.005 286)",
      mutedForeground: "oklch(71.2% 0.013 286)",
      accent: "oklch(27.4% 0.005 286)",
      accentForeground: "oklch(0.9519 0 258.37)",
      destructive: "oklch(39.6% 0.133 25.7)",
      destructiveForeground: "oklch(0.9519 0 258.37)",
      border: "oklch(27.4% 0.005 286)",
      input: "oklch(27.4% 0.005 286)",
      ring: "oklch(87.1% 0.005 286)",
    },
  },
};

export default config;
