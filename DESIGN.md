# Design

<!-- impeccable:design-schema 1 -->

## Surfaces

Landing (`/`), sign-in (`/login`), and authenticated journal chrome (Timeline, Journal, Trades, Backtests, Dashboard). One committed world across the book.

## Mode

Landing and sign-in: Persuade. Authenticated rooms: Operate.

## World

Editorial Field · Kinetic. White ground, high-contrast serif display with italic stress, a living grid of 0/1 glyphs that resolve into the journal’s forms (φ, a fill, the tape). Cool periwinkle as the only accent, spent on the field. Hairline crosses, figure captions, tabbed rooms. Committed single world. Not a SaaS hero, not a cloned Pathfinder face.

## Color

White `#ffffff`. Ink `#111111`; body `#3a3a3a`. Glyph periwinkle `#5a66ba`. Hairlines `rgba(17,17,17,.12)`. Selection, caret, and focus from the glyph colour. No five-colour poster system; the field carries the colour.

## Type

Instrument Serif (400, italic) for display and wordmark. Geist Sans for UI and aside. Geist Mono for figure captions and the glyph grid. Headline ~`clamp(2.1rem, 5.4vw, 3.65rem)`, tracking `-0.03em`. Aside measure ~36ch.

## Motion

The field is the authored moment. Degrades to a settled static grid under `prefers-reduced-motion`. (Current build: the φ figure is fixed and centred, its digits flip in place, and the pointer erases the cells under it; the earlier assemble/scan/tab-morph choreography is retired.)

## Components

First viewport: full-width serif headline (one italic word), then a two-column stage — glyph figure with corner crosses, specimen caption, room tabs — and an aside with one paragraph plus a text CTA (Sign in with Google / Open the book). Below: two serif columns of product truth. Footer: φ + one line. Login shares the same type and hairline bar. Authenticated chrome stays operate-first on the same white/ink tokens.

## Files

`src/components/gate/glyph-field.tsx` (canvas field), `src/components/gate/gate.tsx`, `src/components/gate/gate.css`, `src/components/gate/keep-fills.tsx`, `src/components/gate/phi-mark.tsx`, `src/app/(auth)/layout.tsx` + `src/components/auth/login-form.tsx`, `src/components/layout/journal-header.tsx`.
