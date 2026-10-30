# AGENTS.md — Development Guidelines & Architecture

This document defines the architectural rules, coding standards, and conventions for AI coding agents and developers working on this repository.

---

## 1. Project Overview

This repository contains the personal portfolio website for **Adham Alrefai — AI Engineer & Biomedical Engineer**.

The website is designed to be:
- **Modern & Technical**: Highlighting deep engineering capabilities across AI/ML, Biomedical Engineering, LLMs, Computer Vision, and Software Systems.
- **Minimal & Premium**: Clean typography, dark obsidian theme, high contrast, subtle micro-interactions, and no generic visual clutter.
- **Data-Driven & Extensible**: Projects, research topics, skills, and experience are completely decoupled from UI presentation via structured data modules.
- **Performant & Accessible**: Fast page loads, device-aware 3D rendering with WebGL fallbacks, full semantic HTML, and `prefers-reduced-motion` compliance.

---

## 2. Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Language**: **JavaScript ONLY** (Strict rule: No TypeScript)
- **Styling**: Tailwind CSS, PostCSS, `tailwind-merge`, `clsx`
- **Icons**: Lucide React (`lucide-react`)
- **3D Graphics**: Three.js (`three`), React Three Fiber (`@react-three/fiber`), React Three Drei (`@react-three/drei`)
- **Animation**: Framer Motion (`framer-motion`)

---

## 3. Critical JavaScript Rules

> **CRITICAL RULE**: This project uses **JavaScript only**. Never introduce TypeScript.

- Do **NOT** create `.ts` or `.tsx` files.
- Do **NOT** create `tsconfig.json`.
- Do **NOT** add TypeScript type annotations, interfaces, or generic type parameters.
- All code files MUST use `.js` or `.jsx` extensions.
- Use `jsconfig.json` for module path resolution (`@/*` -> `./*`).

---

## 4. Architecture & Directory Structure

```text
my_website/
├── AGENTS.md                          # Engineering & agent rules (this document)
├── jsconfig.json                      # Path aliases (@/*)
├── next.config.mjs                    # Next.js configuration
├── tailwind.config.js                 # Tailwind design tokens
├── postcss.config.js                  # PostCSS plugins
├── package.json                       # Dependencies and scripts
│
├── app/                               # Next.js App Router
│   ├── layout.js                      # Root HTML layout, SEO tags, metadata
│   ├── page.js                        # Home page composition
│   ├── globals.css                    # Tailwind directives, theme variables, scrollbar
│   ├── not-found.js                   # Custom 404 page
│   ├── sitemap.js                     # Dynamic SEO sitemap
│   ├── robots.js                      # Dynamic robots.txt
│   └── projects/
│       └── [slug]/
│           └── page.js                # Dynamic project detail page (case study)
│
├── components/                        # Modular React components
│   ├── layout/                        # Layout components (Navbar, Footer, Container)
│   ├── sections/                      # Page sections (Hero, About, FeaturedProjects, Research, Skills, Experience, Education, Contact)
│   ├── projects/                      # Project-specific components (ProjectCard, ProjectFilter)
│   ├── three/                         # 3D R3F components & canvas wrappers (NeuralNetworkScene, SceneContainer, WebGLFallback)
│   └── ui/                            # Reusable UI primitives (Button, Badge, Card, SectionHeading)
│
├── data/                              # Data source files (decoupled from UI)
│   ├── personal.js                    # Bio, titles, social links, resume link
│   ├── projects.js                    # Comprehensive project data & case studies
│   ├── research.js                    # Research focus areas, methods & directions
│   ├── skills.js                      # Technical skills categorized by domain
│   ├── experience.js                  # Engineering and research timeline
│   └── education.js                   # Academic credentials (MTI Biomedical Eng.)
│
├── lib/                               # Helper utilities
│   └── utils.js                       # Class merger `cn()`, string & date formatters
│
└── public/                            # Static assets
    ├── images/                        # Project thumbnails and visuals
    └── resume.pdf                     # Downloadable CV
```

---

## 5. Component Rules

- **Modularity & Reusability**: Components should be single-responsibility and composable. Avoid monolithic 500+ line components.
- **Client vs. Server Components**: Keep page components as Server Components where possible; use `"use client"` directive only when interactive hooks (`useState`, `useEffect`, `useRef`, R3F, Framer Motion) are required.
- **Clean Separation of Concerns**: Never hardcode project lists, skills, or experience arrays directly inside UI components. Always import from `@/data/*`.
- **Semantic HTML**: Always use semantic tags (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<time>`, `<figure>`).
- **Prop Validation**: Use standard JavaScript default parameters and clear prop names.

---

## 6. Styling & Design System Rules

- **Tailwind-First**: Use Tailwind utility classes for all styling. Avoid custom `.css` files unless defining keyframe animations or base CSS variables in `globals.css`.
- **Consistent Color Palette**:
  - Backgrounds: Dark Obsidian (`#06080d`), Deep Slate (`#0b0f19`), Surface Card (`#111625`).
  - Accents: Electric Cyan (`#06b6d4`), Emerald / Healthcare Green (`#10b981`), Neural Violet (`#8b5cf6`).
  - Text: Bright White (`#f8fafc`), Muted Slate (`#94a3b8`), Subtle Gray (`#64748b`).
  - Borders: Sleek Slate (`#1e293b`), Highlight Border (`#334155`).
- **Responsive-First**: Design mobile-first using Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`).
- **Accessible Contrast**: Ensure text meets WCAG AA standards (minimum 4.5:1 for normal text).
- **Utility Helper**: Always use `cn(...)` from `@/lib/utils.js` for dynamic or conditional class merging.

---

## 7. 3D Graphics & React Three Fiber Rules

- **Framework**: Use Three.js via `@react-three/fiber` and `@react-three/drei`.
- **SSR Safety**: Always load 3D scenes dynamically with Next.js dynamic import (`ssr: false`) through `SceneContainer.jsx`.
- **Performance Optimization**:
  - Keep geometry polygon count low (use buffer geometries, instanced meshes, or lightweight point clouds).
  - Limit active particle count to reasonable limits (<= 150 nodes/connections on desktop, <= 40 on mobile).
  - Use `dpr={[1, 1.5]}` to prevent high-DPI GPU throttling.
  - Disable or throttle camera animation when the hero section is out of the viewport.
- **Graceful Degradation**:
  - Include an elegant SVG/CSS `WebGLFallback` component for devices where WebGL is unsupported or disabled.
  - The main text and core navigation must render immediately independent of 3D canvas readiness.
- **Motion Accessibility**: Honor `prefers-reduced-motion` media queries by freezing or disabling camera sway and rapid particle transitions.

---

## 8. Project Data Schema & Content Rules

All project entries in `data/projects.js` must adhere to this structure:

```js
{
  id: "leukemia-detection-cnn",
  title: "Deep Learning Leukemia Blood Cell Classification",
  slug: "leukemia-detection",
  category: "Healthcare AI", // e.g. "Healthcare AI", "AI / Machine Learning", "LLM / AI Agents", "Computer Vision", "Biomedical Engineering"
  summary: "Automated white blood cell anomaly detection and acute lymphoblastic leukemia subtyping using convolutional neural networks with 98.4% diagnostic accuracy.",
  description: "Comprehensive case study description...",
  technologies: ["Python", "TensorFlow", "Keras", "OpenCV", "Scikit-learn", "FastAPI"],
  featured: true,
  year: "2024",
  github: "https://github.com/...",
  demo: "https://...",
  highlights: [
    "98.4% classification accuracy across 4 cell subtypes",
    "Implemented automated cell segmentation pipeline using morphological operations",
    "Engineered lightweight inference API reducing diagnostic latency to 42ms"
  ],
  caseStudy: {
    overview: "...",
    problem: "...",
    approach: "...",
    architecture: "...",
    implementation: "...",
    challenges: "...",
    results: "...",
    lessonsLearned: "..."
  }
}
```

Adding a new project or updating existing content should require modifying only the respective file in `data/`.

---

## 9. SEO & Metadata Rules

- Each page must have proper Open Graph and Twitter card metadata.
- Page title format: `[Page Title] | Adham Alrefai — AI & Biomedical Engineer`.
- Include `robots.js` and `sitemap.js` in the `app/` directory.
- Use clean semantic landmarks for screen reader navigation.

---

## 10. Verification & Quality Standards

Before committing or completing any task:
1. Ensure `npm run build` succeeds without warnings or syntax errors.
2. Confirm zero `.ts`, `.tsx`, or `tsconfig.json` files exist in the tree.
3. Test dynamic project routing (`/projects/[slug]`) and ensure 404 handler works for invalid slugs.
4. Verify responsive mobile menu functionality and interactive elements.
5. Verify that WebGL canvas runs smoothly without memory leaks.
