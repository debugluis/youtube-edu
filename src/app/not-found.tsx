import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex justify-center">
        <div className="rounded-2xl bg-emerald-500/10 p-4">
          <GraduationCap className="h-12 w-12 text-emerald-500" />
        </div>
      </div>

      <p className="mb-2 text-6xl font-bold text-white">404</p>
      <h1 className="mb-3 text-2xl font-semibold text-white">Page not found</h1>
      <p className="mb-8 max-w-sm text-gray-400">
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/dashboard"
        className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
