# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user is a solo discretionary futures trader (inferred from this project’s live use: MNQ / MES / MYM fills, session notes, Google-gated private book). They open the site after or during a session to log executions and review the day. Other audiences are not confirmed.

## Product Purpose

A private trading and life journal: log fills (instrument, direction, entry/exit/stop, size), keep session notes, store backtest notes with win rate and expectancy, and review the work on a dashboard. Success is that the day’s work is captured while it is still in the trader’s head, and can be found later.

## Positioning

The book is account-private (Prisma-backed), not a social feed or a broker. PnL and R are computed from the fill, not typed as a story.

## Operating Context

Web app (Next.js). Logged-out public site is **only** the split gate: login/sign up on the left, the maker’s own 21st.dev ASCII eye on the right. No marketing landing that explains the book. After sign-in the working surfaces are Timeline (`/notebook`), Journal, Trades, Backtests, Dashboard. Design scope is the **whole site**: this gate, sign-in, and authenticated journal chrome. Interior Operate rooms are built later; the public surface stays this one screen until then.

## Capabilities and Constraints

- Sign-in today: Google via Auth.js. Unauthenticated visitors cannot use the book.
- Email/password accounts: **undecided**. The gate may show email/password fields; they are not a confirmed second auth mechanism until decided.
- Trades: symbol, LONG/SHORT, prices, size, session, images, computed PnL and R.
- Do not invent brokerage, live data, social proof, or customer counts.
- Stack is the existing Next.js 15 app.
- Authenticated Operate surfaces must stay usable immediately and must not wait through a load show every navigation.

## Brand Commitments

- Name in product: Journal (header) / Trading & Life Journal (metadata).
- Binding asset: the maker’s 21st.dev ASCII piece **abe** (eye with φ in the iris). Source: `https://21st.dev/community/ascii/abe-3618cc3b-7f61-454e-8fd2-d2fdfd2e7d71`. Shipped files: `public/gate/abe.mp4`, `public/gate/abe.webp`. It sits with the φ mark; it is the public eye. Do not replace it with someone else’s 21st demo (no UIMIX / Endless Pursuit / Sisyphus copy, no third-party hero chrome).
- φ tab mark: `src/app/icon.png`. Small φ on the login column; the large eye/ASCII is abe.
- Do not clone third-party studio sites (Kiln Overprint/Kembang) or Pathfinder’s face, copy, product name, or metrics.
- Earlier Pathfinder-style “full-width editorial field as the whole first viewport” is **retired** as the public arrival. The public screen is the login/eye split.
- User-pinned: Dribbble / Awwwards craft, animated; no reddish landing as the whole identity.

## Evidence on Hand

Real product exists and is in use (trade log with actual fills). The abe ASCII loop and still are maker-authored. No testimonials, press, or marketing photography. Do not fabricate them.

## Product Principles

1. Private book, not a feed.
2. The fill is the source of truth; derived numbers stay derived.
3. The public site is the door (login + the maker’s eye), not a brochure. The journal is where the work happens.
4. Do not claim capabilities the app does not have.
5. Do not ship other people’s 21st/Unicorn demo identity on this book.

## Accessibility & Inclusion

No product-specific requirement established beyond shipping usable, keyboard-reachable sign-in, and honoring `prefers-reduced-motion` on opening motion.
