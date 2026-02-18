import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'manifest.json'],
      manifest: {
        name: 'Zuryo - On Demand Fitness',
        short_name: 'Zuryo',
        description: "India's first community-based On Demand Fitness platform. Book certified trainers to your doorstep in 60 minutes. No contracts. Experience the future of fitness with Zuryo today.",
        theme_color: '#142B5D',
        background_color: '#142B5D',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ["fitness", "health", "lifestyle"],
        display_override: ["window-controls-overlay", "standalone", "browser"],
        launch_handler: {
            client_mode: "navigate-existing"
        },
        share_target: {
            action: "/book",
            method: "GET",
            enctype: "application/x-www-form-urlencoded",
            params: {
              title: "title",
              text: "text",
              url: "url"
            }
        },
        icons: [
          {
            src: 'https://i.ibb.co/JRS0NMMj/ZUL.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'https://i.ibb.co/JRS0NMMj/ZUL.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: "https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
            form_factor: "narrow",
            label: "Mobile Booking"
          },
          {
            src: "https://socialfoundationindia.org/wp-content/uploads/2026/02/Zuryo_Updated_Logo.jpeg",
            sizes: "512x512",
            type: "image/jpeg",
            form_factor: "wide",
            label: "Fitness on your terms"
          }
        ],
        shortcuts: [
          {
            name: "Book Session",
            short_name: "Book",
            description: "Book a fitness trainer now",
            url: "/book",
            icons: [{ "src": "https://i.ibb.co/JRS0NMMj/ZUL.png", "sizes": "192x192" }]
          },
          {
            name: "View Trainers",
            short_name: "Trainers",
            description: "Browse available trainers",
            url: "/trainers",
            icons: [{ "src": "https://i.ibb.co/JRS0NMMj/ZUL.png", "sizes": "192x192" }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            // Cache the new icon from i.ibb.co
            urlPattern: /^https:\/\/i\.ibb\.co\/.*\.png/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-icons',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/socialfoundationindia\.org\/wp-content\/uploads\/.*\.jpeg/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'logo-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // Background sync to satisfy PWABuilder checklist
          {
             urlPattern: ({ url }) => url.pathname.startsWith('/api'),
             handler: 'NetworkOnly',
             options: {
               backgroundSync: {
                 name: 'api-queue',
                 options: {
                   maxRetentionTime: 24 * 60
                 }
               }
             }
          }
        ]
      }
    })
  ],
});