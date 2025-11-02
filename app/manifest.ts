import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PUMP KOMBAT",
    short_name: "PUMP KOMBAT",
    description: "The ultimate Solana-powered fighting arena. Bet on epic battles and win big rewards.",
    start_url: "/",
    display: "standalone",
    background_color: "#0f172a",
    theme_color: "#9333ea",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}
