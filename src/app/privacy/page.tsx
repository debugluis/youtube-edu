import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — YouTube Edu",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-50 flex h-16 items-center border-b border-white/10 bg-[#0f0f0f]/95 px-4 backdrop-blur-sm md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-7 w-7 text-emerald-500" />
          <span className="text-lg font-bold text-white">YouTube Edu</span>
        </Link>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-12 md:px-6">
        <Link
          href="/"
          className="mb-8 flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <h1 className="mb-2 text-3xl font-bold text-white">Privacy Policy</h1>
        <p className="mb-10 text-sm text-gray-500">Last updated: February 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-3 text-base font-semibold text-white">1. What data we collect</h2>
            <p className="mb-3">
              When you sign in with Google, we receive and store the following information from your
              Google account:
            </p>
            <ul className="list-disc space-y-1.5 pl-5 text-gray-400">
              <li>Your display name</li>
              <li>Your email address</li>
              <li>Your profile photo URL</li>
            </ul>
            <p className="mt-3">
              We also store data you generate while using the app, including:
            </p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-400">
              <li>Course data created from YouTube playlists you submit</li>
              <li>Your video watch progress and completion status</li>
              <li>Achievements you have unlocked</li>
              <li>Your language preference</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">2. How data is stored</h2>
            <p>
              All data is stored in Firebase Firestore and Firebase Authentication, both provided by
              Google Cloud. Data is stored in the United States region by default. We do not maintain
              our own database servers.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">3. How we use your data</h2>
            <p>Your data is used solely to provide the YouTube Edu service:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-400">
              <li>To authenticate you and identify your courses and progress</li>
              <li>To display your name and photo in the app</li>
              <li>To persist your learning progress across sessions and devices</li>
            </ul>
            <p className="mt-3 font-medium text-white">
              We do not sell, rent, or share your personal data with any third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">4. Third-party services</h2>
            <p>YouTube Edu uses the following third-party services:</p>
            <ul className="mt-2 list-disc space-y-1.5 pl-5 text-gray-400">
              <li>
                <strong className="text-gray-300">Google / Firebase</strong> — Authentication and
                database storage
              </li>
              <li>
                <strong className="text-gray-300">YouTube Data API v3</strong> — To fetch playlist
                and video metadata (no video content is stored)
              </li>
              <li>
                <strong className="text-gray-300">Anthropic Claude API</strong> — To analyze and
                organize playlist content into modules (only video titles and descriptions are sent)
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">5. Data retention and deletion</h2>
            <p>
              You can delete all your data at any time by using the{" "}
              <strong className="text-white">Delete Account</strong> option in the profile dropdown.
              This will permanently remove your profile, all courses, and all progress from our
              systems. Firebase Authentication account deletion is also performed immediately.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">6. Cookies</h2>
            <p>
              We do not use tracking or advertising cookies. Firebase may set authentication-related
              cookies or tokens to keep you signed in.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">7. Contact</h2>
            <p>
              If you have any questions or concerns about this privacy policy, please{" "}
              <a
                href="https://github.com/debugluis/youtube-edu/issues/new"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                open an issue on GitHub
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
