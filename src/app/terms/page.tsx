import Link from "next/link";
import { GraduationCap, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Use — YouTube Edu",
};

export default function TermsPage() {
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

        <h1 className="mb-2 text-3xl font-bold text-white">Terms of Use</h1>
        <p className="mb-10 text-sm text-gray-500">Last updated: February 2026</p>

        <div className="space-y-8 text-sm leading-relaxed text-gray-300">
          <section>
            <h2 className="mb-3 text-base font-semibold text-white">1. Acceptance of terms</h2>
            <p>
              By accessing or using YouTube Edu, you agree to be bound by these Terms of Use. If you
              do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">2. Service description</h2>
            <p>
              YouTube Edu is a tool that allows users to organize public YouTube playlists into
              structured educational courses with progress tracking and achievements. The service is
              provided as-is with no guarantees of uptime, accuracy, or fitness for a particular
              purpose.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">3. YouTube content</h2>
            <p>
              YouTube Edu does not host, download, or store any video content. All videos are
              streamed directly from YouTube and are subject to{" "}
              <a
                href="https://www.youtube.com/t/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-400 hover:underline"
              >
                YouTube&apos;s Terms of Service
              </a>
              . Users are responsible for ensuring their use of YouTube content complies with
              YouTube&apos;s terms and applicable copyright law.
            </p>
            <p className="mt-3">
              You may only use public playlists. Using this service to access private or restricted
              content is not permitted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">4. User responsibilities</h2>
            <ul className="list-disc space-y-1.5 pl-5 text-gray-400">
              <li>You must be at least 13 years old to use this service.</li>
              <li>You are responsible for maintaining the security of your account.</li>
              <li>
                You agree not to use the service for any unlawful purpose or in a way that violates
                these terms.
              </li>
              <li>
                You agree not to attempt to reverse-engineer, scrape, or abuse the service&apos;s
                APIs.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">5. Disclaimer of warranties</h2>
            <p>
              The service is provided{" "}
              <strong className="text-white">&quot;as is&quot;</strong> without warranties of any
              kind, express or implied. We do not guarantee that the service will be uninterrupted,
              error-free, or meet your expectations. Use the service at your own risk.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">6. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, YouTube Edu and its creators shall not be
              liable for any indirect, incidental, or consequential damages arising from your use of
              the service, including loss of data or interruption of service.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">7. Account termination</h2>
            <p>
              We reserve the right to suspend or terminate accounts that violate these terms. You
              may delete your account at any time using the{" "}
              <strong className="text-white">Delete Account</strong> option in the profile dropdown.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">8. Changes to terms</h2>
            <p>
              We may update these terms from time to time. Continued use of the service after
              changes are posted constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-base font-semibold text-white">9. Contact</h2>
            <p>
              For questions about these terms, please{" "}
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
