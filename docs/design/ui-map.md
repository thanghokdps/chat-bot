# UI map — CHAT A.I+

Source: Figma `ZIYKCxqRlpYMY98YFbMseb`, page "🧑‍💻 Screens". Every screen is a **flattened 1920×1080 raster** (no layers, no variables), so all values below are measured from pixels; fonts are *estimated*.

## Frames (`design/frames/`, 1×: the rasters have no 2× source)

| State file | Node | Figma name |
|---|---|---|
| `sign-up.png` | 19:915 | Sign up |
| `welcome.png` | 19:914 | new chat |
| `conversation-pink.png` | 19:913 | chat ai |
| `conversation-yellow.png` | 19:910 | chat ai-1 |
| `conversation-blue.png` | 19:911 | chat ai-2 |
| `conversation-green.png` | 19:912 | chat ai-3 |

## State inventory

Decisions marked *default* were made without a frame (owner said: proceed without further questions); revisit when frames exist.

| State | Frame / decision |
|---|---|
| Welcome / empty | `welcome.png` |
| User message | `conversation-*.png` (prompt line with avatar + edit button) |
| Assistant message | `conversation-*.png` (label, markdown, toolbar, Regenerate) |
| Streaming | *default*: answer grows with a blinking caret; Send, Edit and Regenerate disabled; no Stop button (ADR 0001) |
| Thinking | *default*: assistant label + three pulsing dots until the first token |
| Tool running / done / failed | not applicable — 0 tools (ADR 0001) |
| Confirm card | not applicable — no writes by the agent |
| Suggestions after an answer | *skip* — not in the design |
| Error / offline / unauthorised | *default*: notice pill above the composer with the server's fixed copy; failed answer shows its fixed text + Regenerate; 401 → `/sign-in` |
| Long conversation | `conversation-*.png` — content scrolls under the composer and fades out |
| Narrow width | *default*: below 1024px a top bar (menu · logo · Pro pill) replaces the Upgrade side tab and the sidebar becomes a drawer (Esc or backdrop closes it). Welcome, thread and composer size from the main column via container queries: suggestion rows stack below 672px, answer text 16px below 768px, inputs 16px on phones (no iOS zoom). Upgrade tab is vertically centred and the column keeps 74px clear of it from 1024px up. 1920×1080 renders as the frames |
| Dark | *skip* — no dark frame |
| Sign in | *default*: the sign-up layout with the login copy |

## Tokens (`src/styles/tokens.css`)

Components use token names only; `grep -rnE '\[#[0-9a-fA-F]{3,8}\]' src` finds nothing outside `styles/` and `dev/`.

| Design value (measured) | Token → class |
|---|---|
| `#5661f6` buttons, links, active row text, Upgrade tab | `--color-primary` → `bg-primary`, `text-primary` |
| `#000000` logo, search button, headings · `#191919` titles/body · `#4d4d4f` sign-up subtitle | `--color-ink` · `--color-ink-2` · `--color-ink-3` |
| `#3a3a3a` prompt text · `#4c4d4f` toolbar/edit icons · `#8b9093` section labels | `--color-body` · `--color-icon` · `--color-muted` |
| `#a3a6a8` placeholders · `#b6b7b8` tile description, grip bars · `#b42318` errors | `--color-placeholder` · `--color-tile-muted` · `--color-danger` |
| `#ffffff` sidebar card, composer · `#f9fbfd` edit button | `--color-surface` · `--color-surface-2` |
| `#f5f6ff` active row · `#eef0fe` row action pill | `--color-primary-50` · `--color-primary-100` |
| `#f2f2f2` sidebar dividers · `#efefef` pill borders · `#e5e5e5` social buttons, swatches · `#dfe3e8` exchange divider · `#c9ccd0` toolbar rule | `--color-divider` · `--color-line` · `--color-hairline` · `--color-separator` · `--color-toolbar-rule` |
| `#fbfbfc` suggestion cards · `#191919` category tiles · `#f5f5f5` inputs | `--color-card` · `--color-tile` · `--color-field` |
| page backgrounds `#f0f1f2` `#f3f7fb` `#fceae7` `#f5eec9` `#edf5d8` | `--bg-*` → runtime `--page-bg` → `bg-page` (from `user_settings.background`) |
| type sizes 12–44px; answer 17.5px; consent 13.5px | `--text-12` … `--text-44`, `--text-answer`, `--text-legal` (size only; line-height stays per element) |
| radius: sidebar 28px · cards 12px · inputs 10px · notice 18px · Upgrade tab 26px | `--radius-panel` `--radius-card` `--radius-field` `--radius-notice` `--radius-tab` |
| shadows: card hover · composer · send ring | `--shadow-card-hover` `--shadow-composer` `--shadow-send` |
| sidebar 348px (300px at 1024–1279) · drawer · Upgrade tab height · welcome/auth top spacing | `--spacing-sidebar` `--spacing-sidebar-lg` `--spacing-drawer` `--spacing-upgrade-tab` `--spacing-welcome-top` `--spacing-welcome-gap` `--spacing-auth-top` (viewport-scaled, max = frame value) |
| other px spacing | Tailwind's 4px scale: `mt-11.5` = 46px, `px-7.25` = 29px |
| Font: geometric sans, single-storey a/g | **Outfit** via `next/font` (*estimated*) |

## Element ladder

The whole chat is **L3 headless** (`useAgent` with own layout). `CopilotChat` slots cannot express: the prompt rendered as a header line with avatar and a right-aligned edit button; a divider per exchange; Regenerate and Edit that must send `forwardedProps` (`regenerate`/`edit` + DB message id) for the server's branch tree; the composer floating over the thread inside a custom page grid with the sidebar.

| Element | Rung | Implementation | Why |
|---|---|---|---|
| Sidebar card, logo, New chat, search | app | `components/sidebar.tsx` | outside any chat component |
| Conversation rows, groups, Clear All, rename/delete pill | app | `sidebar.tsx` + REST `/api/conversations` | data from our DB, not the agent |
| Settings / user pills | app | `sidebar.tsx` | — |
| Upgrade to Pro tab | app | `upgrade-tab.tsx` | page chrome |
| Welcome hero + suggestion grid | L3 | `welcome.tsx` | grid of DB rows; a card sends its prompt |
| Prompt line (avatar, text, edit) | L3 | `thread.tsx` `PromptLine` | layout not reachable by `userMessage` slot |
| Answer (label, markdown, toolbar, Regenerate) | L3 | `thread.tsx` `Answer` + `react-markdown` | Regenerate/feedback call our endpoints |
| Composer | L3 | `composer.tsx` | floating pill with emoji glyph + send circle |
| Notices | L3 | `composer.tsx` | CUSTOM `notice` events from `runTurn` |
| Sign up / sign in | app | `auth-screen.tsx` + Better Auth client | not a chat surface |

Raster art cropped from the frames into `public/`: sign-up hero (left half), suggestion thumbnails, 🧠 and ✨ glyphs, sample avatar (fixtures only — real users get their image or initials).

## Comparison (Step 5)

`/design-states?state=<name>` (dev only) renders every state from `src/components/fixtures.ts`. Shots at 1920×1080, `deviceScaleFactor: 1`, compared with `compare-shots.py` (3% threshold, tolerance 24):

| State | Diff | Result | Remaining difference |
|---|---|---|---|
| sign-up | 1.4% | PASS | — |
| welcome | 3.2% | FAIL (0.2 over) | glyph shapes in the 22px card titles; layout boxes match to ±2px |
| conversation-blue / pink / yellow / green | 6.9% | FAIL | glyph shapes only: line breaks, list indents, toolbar and divider positions match; Outfit is an estimate of the raster's font, so every letter of a 900px text block differs by a few pixels |

**Pending owner acceptance:** the conversation and welcome differences come from the font. Supplying the real font (or a layered Figma file) closes them; no layout change is needed.

Calibrated from the rasters: answer text 17.5px/28px with 0.005em tracking, prompt line 16px, welcome headline 44px.
