import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-5xl font-bold tracking-tight">
          Design anything. <span className="text-brand-500">Ship it fast.</span>
        </h1>
        <p className="mt-4 text-lg text-white/60 max-w-xl mx-auto">
          Infinite canvas, AI-assisted tools aur ready templates — sab ek jagah.
        </p>
        <Link
          to="/editor"
          className="inline-block mt-10 rounded-md bg-brand-600 px-6 py-3 text-white font-medium hover:bg-brand-700 transition-colors"
        >
          Naya design shuru karein
        </Link>
      </main>
    </div>
  );
}
