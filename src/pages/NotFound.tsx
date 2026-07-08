import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-display font-semibold">Page nahi mili</h1>
      <Link to="/" className="text-brand-500 hover:underline">
        Home par wapas jaayein
      </Link>
    </div>
  );
}
