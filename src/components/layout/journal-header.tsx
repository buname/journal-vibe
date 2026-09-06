import Link from "next/link";

import { auth } from "@/auth";
import { DailyPerspectiveBar } from "@/components/layout/daily-perspective-bar";
import { UserMenu } from "@/components/layout/user-menu";
import "@/components/layout/journal-chrome.css";

export async function JournalHeader() {
  const session = await auth();

  return (
    <header className="journal-header">
      <div className="journal-header-inner">
        <div className="journal-header-row">
          <Link
            href="/notebook"
            className="journal-wordmark"
            aria-label="Journal"
          >
            <span className="journal-wordmark-phi" aria-hidden="true">
              φ
            </span>
          </Link>
          {session?.user ? <UserMenu user={session.user} /> : null}
        </div>
      </div>
      <DailyPerspectiveBar />
    </header>
  );
}
