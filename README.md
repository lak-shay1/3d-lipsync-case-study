
# 3D Lipsync Case Study Real-Time Avatar Interaction using Next.js, R3F & Supabase

An interactive **3D web application** built with **Next.js (App Router)**, **React Three Fiber**, and **Supabase**, featuring a real-time speaking avatar powered by **Wawa Lipsync**.

This project was developed as part of a technical case study focused on creating immersive, AI-driven 3D experiences that support multiple concurrent users and live messaging sessions.

---

## Live Demo

- [View on Vercel](https://3d-lipsync-case-study-three.vercel.app)
- [GitHub Repository](https://github.com/lak-shay1/3d-lipsync-case-study)

---

## Features

- **3D Avatar Rendering** — Renders an open-source GLB avatar in a dynamic Three.js scene using React Three Fiber (R3F).  
- **Lipsync Animation** — Synchronizes the avatar’s jaw movement with user-provided text using Wawa Lipsync.  
- **3D Environment** — Includes a lightweight, open-source 3D background for spatial context.  
- **Interactive Messaging** — Users can input messages, which are stored in Supabase and trigger avatar speech.  
- **Session Management** — Each session is isolated using unique IDs stored in localStorage.  
- **Supabase Integration** — Real-time sync for user messages and concurrent session tracking.  
- **Deployed on Vercel** — Optimized for serverless deployment and static asset delivery.

---

## Tech Stack

| Category | Tools / Libraries |
|-----------|------------------|
| Framework | [Next.js 15 (App Router)](https://nextjs.org/) |
| 3D Rendering | [React Three Fiber](https://github.com/pmndrs/react-three-fiber), [@react-three/drei](https://github.com/pmndrs/drei) |
| Lipsync Engine | [Wawa Lipsync](https://github.com/wass08/wawa-lipsync) |
| Database / Realtime | [Supabase](https://supabase.com/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) |
| Language | TypeScript |
| Deployment | Vercel |

---

## Project Structure

```

3d-lipsync-case-study/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── experience/
│   │   ├── page.tsx              # Main 3D experience route
│   │   ├── components/
│   │   │   ├── Avatar.tsx        # 3D avatar setup + rotation fixes
│   │   │   ├── Scene.tsx         # R3F Canvas and environment
│   │   │   ├── LipsyncController.tsx  # Handles mouth animation logic
│   │   │   ├── Form.tsx          # Name + message input
│   │   └── utils/
│   │       ├── supabase.ts       # Realtime Supabase client setup
│   │       └── wawa.ts           # Wawa Lipsync text cue generator
├── public/
│   ├── models/
│   │   └── avatar.glb            # 3D model asset
│   └── env/
│       └── .env.local            # Local Supabase keys (ignored in git)
├── tailwind.config.js
├── tsconfig.json
├── package.json
└── README.md

````

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lak-shay1/3d-lipsync-case-study.git
cd 3d-lipsync-case-study
````

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_KEY
```

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to preview the app.

---

## Implementation Overview

### 1. 3D Avatar & Scene

* Loaded via `useGLTF()` from `@react-three/drei`.
* Rotated 180° to face the camera.
* Includes scaling and positional normalization for consistent framing.

### 2. Lipsync System

* Integrates **Wawa Lipsync** to map text to mouth shape cues.
* Fallback generator ensures continuous animation when visemes aren’t present.
* Supports future integration with TTS engines (e.g., ElevenLabs, OpenTTS).

### 3. Real-Time Messaging

* Uses **Supabase Realtime** to store and broadcast user messages.
* Each user gets a session ID via localStorage.
* Messages trigger the avatar animation sequence.

### 4. Session Management

* Session IDs stored locally to isolate users.
* Synced with Supabase to manage concurrent sessions.

---

## Commands

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start local development server |
| `npm run build` | Create production build        |
| `npm run lint`  | Lint code using ESLint         |
| `npm run start` | Serve built version locally    |

---

## Developer Notes

* Current avatar uses jaw bone fallback for lipsync (no blendshapes).
* Modular structure — swapping models with blendshapes will improve viseme accuracy.
* Built with TypeScript for type safety and maintainability.
* Strict ESLint configuration for consistent code quality.

---

## Future Improvements

* Add text-to-speech integration (ElevenLabs / OpenTTS).
* Integrate ARKit viseme model for enhanced facial animation.
* Enable real-time speech playback with Supabase channel sync.
* Support multi-user live sessions using WebSocket or Supabase channels.
* Optimize rendering with suspense and lazy loading.

---

## About the Developer

**Lakshay Arora**
Final-Year Computer Science Student, RMIT University (Melbourne)
Experience in Machine Learning, DevOps, and Cloud-Native Full Stack Development.

* [GitHub](https://github.com/lak-shay1)
* [LinkedIn](https://www.linkedin.com/in/lakshay-arora1)

---

## License

This project is open-source and available under the **MIT License**.
