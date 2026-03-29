# Kaki! — Technical Specification

> iPhone-optimized mobile web app for discovering affordable hidden gems in Singapore.
> Discovery Mode only. No trails, no route planning.

---

## 1. Project Architecture

### File Structure (Multi-file)
```
Kaki!/
├── index.html          # App shell, all screens as sections
├── styles.css          # All styles including dark mode
├── app.js              # Core logic, routing, state management
├── cards.js            # Card stack, flip, swipe mechanics
├── search.js           # Search, filtering, category inference
├── favourites.js       # Favourites list, persistence, unfavourite flow
├── data.json           # Business data (extended with teaser, category, price)
├── manifest.json       # PWA manifest
├── sw.js               # Service worker (app shell caching)
├── images/             # Placeholder images (to be replaced by user)
│   └── placeholder.png
└── icons/              # PWA icons (placeholder, to be replaced by user)
    └── icon-192.png
    └── icon-512.png
```

### Client-Side Routing
- **Hash-based routing**: `#home`, `#search`, `#favourites`, `#profile`
- Browser back/forward buttons navigate between tabs
- Default route: `#home`
- Each tab section is shown/hidden based on the active hash
- Deep-linkable: opening `app/#favourites` goes directly to that tab

### State Persistence (localStorage)
Persisted across browser sessions:
- **Favourites list**: Array of business keys (strings)
- **Card stack position**: Current card index (resets if sort order changes)
- **Near Me toggle state**: Boolean
- **Profile display name / avatar color** (if edited)
- **Onboarding seen flag**: Boolean (so the gesture overlay shows only once)
- **Unseen favourites flag**: Boolean (for notification dot)

---

## 2. Design System

### Color Tokens — Light Mode (Default)
| Token | Value | Usage |
|---|---|---|
| Primary (Terracotta) | `#C96B4F` | Logo, headings, active tab, CTAs |
| Background (Cream) | `#FFF8F0` | Page background, tab bar |
| Accent (Sage Green) | `#A3B18A` | Secondary actions, hints, inactive toggle |
| Text Primary (Warm Brown) | `#6B4F3A` | Body text, inactive tabs |
| Surface (Soft Sand) | `#E8DDD3` | Search bar bg, card surface, input fields |
| Card Shadow | `0 4px 16px rgba(107,79,58,0.10)` | Card elevation |

### Color Tokens — Dark Mode (Auto via `prefers-color-scheme: dark`)
| Token | Value | Usage |
|---|---|---|
| Background | `#1E1E1E` | Page background, tab bar |
| Surface / Cards | `#2D2D2D` | Card bg, input fields, search bar |
| Text Primary | `#F5F0EB` | Body text (inverted cream) |
| Text Secondary | `#B0A89F` | Muted text, hints |
| Primary (Terracotta) | `#C96B4F` | Unchanged — logo, headings, CTAs |
| Accent (Sage Green) | `#A3B18A` | Unchanged — secondary actions, hints |
| Card Shadow | `0 4px 16px rgba(0,0,0,0.25)` | Elevated shadow for dark bg |
| Tab bar border | `#3A3A3A` | Subtle separator |

Dark mode is triggered automatically via CSS `@media (prefers-color-scheme: dark)`. No manual toggle. Use CSS custom properties (`--bg`, `--surface`, `--text-primary`, etc.) on `:root` and override in the dark media query.

### Typography
| Element | Font | Weight | Size |
|---|---|---|---|
| Headings / Logo | Nunito or Poppins (Google Fonts) | 700 (Bold) | 24–32px |
| Body text | Inter or system sans-serif | 400 (Regular) | 14–16px |
| Card business name | Nunito/Poppins | 700 | 22px |
| Card teaser | Inter | 400 italic | 15px |
| Labels / hints | Inter | 400 | 12–13px |

### Spacing & Layout
- **Target width**: 390px (iPhone 14/15 logical width)
- **Card border radius**: 18px
- **Tab bar height**: 56px + safe area bottom inset
- **Top safe area**: Respected via `env(safe-area-inset-top)`
- **Horizontal padding**: 20px on page content, 16px inside cards
- **Card dimensions**: ~340px wide × ~460px tall (centered, with breathing room)

---

## 3. Data Model

### Extended JSON Structure (`data.json`)
Each business entry includes the original fields plus new fields marked with `[NEW]`:

```json
{
  "businesses": [
    {
      "id": "whatcha",
      "name": "Whatcha",
      "openingHours": "Launch based (Check Instagram)",
      "description": "Cafe-style concept featuring matcha and hojicha latte series alongside signature banana puddings.",
      "teaser": "Matcha lattes & banana puddings from a Tiong Bahru pop-up",
      "ratings": 4.6,
      "location": "150104, Singapore (Tiong Bahru Road)",
      "estimatedDistance": "0.7 km",
      "estimatedDuration": "9 mins (Walking)",
      "gmapsurl": "https://www.google.com/maps/search/?api=1&query=150104+Singapore",
      "price": 2,
      "imageUrl": "images/placeholder.png"
    }
  ]
}
```

**New fields:**
| Field | Type | Description |
|---|---|---|
| `id` | string | URL-safe unique key (lowercase, no spaces) |
| `teaser` | string | Hand-crafted 1-liner for card front (shorter than description) |
| `price` | number (1–3) | 1 = $ (budget), 2 = $$ (moderate), 3 = $$$ (premium) |
| `imageUrl` | string | Path to business photo. Defaults to `images/placeholder.png` |

### Category Inference (No field needed)
Categories are inferred at runtime from description + name keyword matching:
| Category | Keywords (case-insensitive) |
|---|---|
| Café | coffee, cafe, latte, espresso, barista |
| Bakery | bakery, sourdough, bread, cookies, brownies, shiopan |
| Food | hawker, food, meal, rice, noodle |
| Crafts | craft, workshop, handmade, pottery |
| Services | service, repair, tailor, clean |

A business can match multiple categories. If no keywords match, it falls into "All" by default.

### Distance Parsing
The `estimatedDistance` string (e.g. `"0.7 km"`) is parsed at runtime:
```js
parseFloat(business.estimatedDistance) // returns 0.7
```
Used for "Near Me" sorting. No separate numeric field needed.

---

## 4. Screen Specifications

### 4.1 Splash Screen (Loading State)
- Shown for ~1 second on app launch
- Centered Kaki! logo in terracotta on cream/dark background
- Smooth fade-out transition to the Home screen
- Purpose: gives fonts time to load, feels app-like

### 4.2 First-Time Onboarding Overlay
- Triggered once on first visit (tracked via `localStorage` flag `onboardingSeen`)
- Semi-transparent dark overlay covering the entire screen
- Three gesture instruction graphics overlaid on the card area:
  - **Swipe left** → "Next gem" (left arrow)
  - **Swipe right** → "Previous gem" (right arrow)
  - **Swipe up** → "Save & navigate!" (up arrow)
  - **Tap** → "Flip card" (tap icon)
- Single "Got it!" button at the bottom (terracotta fill, cream text) to dismiss
- Overlay does not appear again after dismissal

### 4.3 Screen 1: Home (Card Stack Discovery)

**Top Section:**
- Kaki! logo in terracotta, centered
- Tagline: "Discover Singapore's best-kept secrets" — warm brown on cream
- Full-width search bar: rounded corners, sand background (`#E8DDD3`), magnifying-glass icon left, placeholder "Search hidden gems…"
  - Tapping the search bar navigates to `#search` (does not search inline on Home)

**Near Me Toggle:**
- Directly below the search bar
- Pill-shaped toggle with location-pin icon
- **Active**: Terracotta fill, white text/icon → cards sorted by `estimatedDistance` ascending
- **Inactive**: Sage green outline, sage green text/icon → default curated order
- Toggling performs an **instant reset**: card stack immediately shows the first card in the new sort order
- Toggle state persisted in localStorage

**Card Stack:**
- Centered on screen, one card visible at a time
- No card counter or progress indicator (pure discovery feel)
- Cards are 18px border radius, subtle drop shadow

**Card Front (Teaser):**
- Soft gradient background (cream → sand) or subtle warm pattern
- Business **name** in large bold terracotta, centered
- **Teaser** text (from `teaser` field) in warm brown italic, centered below name
- **Rating**: Small `★ 4.8` in warm brown, top-right corner
- **"Tap to reveal"** hint at bottom: pulsing hand-tap icon in sage green

**Card Back (Details):**
- Top ~50%: Rounded-rectangle image container with `imageUrl` (placeholder for MVP)
- Bottom ~50%: Cream background with business details:
  - **Name** — bold, terracotta, left-aligned
  - **Opening Hours** — clock icon, warm brown
  - **Rating** — star icon + number, sage green
  - **Location** — map-pin icon, warm brown
  - **Estimated Distance** — walking-person icon, e.g. "0.7 km away"
  - **Estimated Duration** — e.g. "9 mins walk"
  - **Heart icon** — tap to toggle favourite (filled terracotta if saved, outline if not). This is the save-only path (no maps redirect).
- **"Tap to flip back"** hint at bottom in subtle sage green

**Card Flip Animation:**
- **Subtle 3D flip** — horizontal axis rotation with moderate `perspective` value (~800px)
- Uses CSS `transform: rotateY(180deg)` with `backface-visibility: hidden`
- Transition duration: ~500ms, ease-in-out
- Tap card front → flip to back. Tap card back → flip to front.

**Swipe Gestures (via Hammer.js):**

| Gesture | Action | Animation |
|---|---|---|
| Swipe left | Advance to next card | Card slides off left, next slides in from right |
| Swipe right | Go to previous card | Card slides off right, previous slides in from left |
| Swipe up | Save to favourites + open Google Maps (new tab) | Card flies upward off screen |

- **Swipe detection**: Velocity-based. A fast flick triggers even from short distance. Slow drags need to cross ~50% of card width.
- **Mid-drag visual feedback**: Card tilts slightly in swipe direction (rotation) and fades in opacity. Tinder-style.
- **Swipe-up always does both**: saves to favourites AND opens `gmapsurl` in a new tab (`target="_blank"`).
- After swipe-up, card is **deprioritized**: moved to end of the stack (not removed). A small heart badge on the card front indicates it's already saved.

**Gesture Hint Row:**
- Below the card stack: three subtle icons in sage green
- `← prev` | `↑ go!` | `next →`
- Small text labels beneath each icon

**End of Stack:**
- When user swipes past the last card, show a warm illustration/message:
  - Cozy illustration (placeholder)
  - Text: "You've explored all the gems! ✨" in warm brown
  - "Check your favourites" button (terracotta) linking to `#favourites`
  - "Start over" text button (sage green) to reset to first card

**Center Overlay Toast (for save actions):**
- Triggered on swipe-up or heart icon tap
- Centered on screen, brief overlay (like Instagram's heart animation)
- Shows: filled heart icon + "Saved to Favourites"
- Auto-dismisses after ~1.5 seconds
- Semi-transparent warm brown background, cream text

### 4.4 Screen 2: Search

**Layout:**
- Full-screen search experience
- Search bar at top (auto-focused, keyboard opens immediately on tab switch)
- Same styling as home search bar: rounded, sand bg, magnifying-glass icon
- Placeholder: "Search by name, area, or type…"

**Search Behavior:**
- **Hybrid trigger**: Results appear after 2+ characters typed, with 300ms debounce
- Searches against: business name, description, teaser, location
- Blank query or <2 chars: show all businesses as mini-cards
- Case-insensitive matching

**Filter Chips (horizontal scrollable row below search bar):**
- Categories: "All", "Food", "Café", "Bakery", "Crafts", "Services"
- Pill-shaped chips
- **Unselected**: sage green outline on cream
- **Selected**: solid sage green fill, cream text
- "All" is selected by default
- Multiple selection NOT supported — selecting a chip deselects others (radio behavior)

**Filters Panel (slide-up):**
- Triggered by "Filters" button (slider icon) at end of chip row
- Slide-up panel covering bottom ~60% of screen
- **Price range**: Pill chips — "$" (budget), "$$" (moderate), "$$$" (premium). Multi-select allowed.
- **Distance**: Segmented control — "< 1 km", "< 5 km", "< 10 km", "Any distance"
- **Rating**: Segmented control — "4.0+", "4.5+", "Any"
- **"Apply Filters"** button: terracotta fill, cream text. Dismisses panel and filters results.
- Backdrop tap also dismisses (without applying)

**Search Results:**
- Scrollable list of mini-cards below filters
- Each mini-card shows:
  - Business name (bold, terracotta)
  - One-liner description (warm brown)
  - Rating (★ + number)
  - Distance
  - Heart icon (tap to favourite)
- Tapping a mini-card → **expanded card detail view** (see §4.6)

**No Results State:**
- Friendly message: "No gems found for that search"
- Row of suggested search terms based on available data:
  - e.g. "Try: coffee, matcha, bakery, sourdough"
- Suggestion chips are tappable, populate the search bar and trigger a search

### 4.5 Screen 3: Favourites

**Header:** "Your Favourites" in terracotta on cream

**Favourites List (populated):**
- Vertical scrollable list
- Each item shows:
  - Small thumbnail image (left) — rounded, from `imageUrl`
  - Business name (bold, terracotta), one-liner description, rating, distance (right)
  - Filled heart icon (terracotta) — tap to unfavourite
- Tapping the card → **expanded card detail view** (see §4.6)

**Unfavourite Flow:**
- Tapping the filled heart opens a **custom styled modal**:
  - Warm-styled dialog matching the app's terracotta/cream palette
  - Text: "Remove from favourites?"
  - Two buttons: "Remove" (terracotta outline) and "Keep" (terracotta fill)
  - Backdrop tap dismisses (keeps the favourite)

**Empty State:**
- Warm illustration placeholder (hand-drawn heart with a small shop)
- Text: "No favourites yet! Swipe up on a card to save places you love." in warm brown
- "Start exploring" button linking to `#home`

**Notification Dot:**
- Small terracotta dot appears on the Favourites tab icon immediately after a swipe-up save on the Home screen
- Dot clears when user navigates to the Favourites tab
- Tracked via localStorage flag `unseenFavourites`

### 4.6 Expanded Card Detail View

Triggered from: tapping a mini-card in Search results, or tapping a favourite item.

**Behavior:**
- The mini-card/list item **smoothly expands in-place** to fill ~90% of the screen
- Shared element transition: card grows from its original position
- Content matches card back layout but with more space:
  - Large image at top (~50%)
  - Name, opening hours, rating, location, distance, duration below
  - Heart icon to toggle favourite
  - "Open in Google Maps" button (terracotta fill, cream text) at the bottom
- **Swipe up** on the expanded card opens Google Maps (new tab) for that business
- **Swipe down** to dismiss: drag down collapses the card back to its original size/position
- No close button needed (swipe down is the dismiss gesture)

### 4.7 Screen 4: Profile

**Layout (minimal MVP):**
- Circular avatar placeholder at top (sage green border, centered)
  - Default: first letter of display name on sage green circle
- Display name below avatar (default: "Explorer")
- Favourites count: "♥ X hidden gems saved" in warm brown

**Settings Options (visual placeholders):**
- "Edit Profile" → tapping shows center overlay toast: "Coming Soon"
- "Notification Preferences" → "Coming Soon" toast
- "About Kaki!" → shows a brief blurb about the app in a slide-up panel
- "Log Out" → "Coming Soon" toast

**Footer:**
- "Made with ♥ for Singapore's hidden gems" in sage green, centered at bottom

---

## 5. Bottom Tab Bar

**Fixed bottom navigation, visible on all screens.**

| Tab | Icon | Label | Route |
|---|---|---|---|
| Home | House | "Home" | `#home` |
| Search | Magnifying glass | "Search" | `#search` |
| Favourites | Heart | "Favourites" | `#favourites` |
| Profile | Person circle | "Profile" | `#profile` |

**Styling:**
- **Active tab**: Terracotta icon + terracotta label text, full opacity
- **Inactive tab**: Warm brown icon + warm brown label text, 60% opacity
- **Background**: Cream (`#FFF8F0`) with subtle top border/shadow
- **Height**: 56px + `env(safe-area-inset-bottom)` padding
- **Notification dot**: Small terracotta circle on Favourites icon when `unseenFavourites` is true

---

## 6. Touch & Gesture Handling

### Library: Hammer.js (~7KB gzipped)
- Load via CDN or bundle locally
- Initialize on the card stack container

### Gesture Configuration
```js
const hammer = new Hammer(cardElement);
hammer.get('swipe').set({
  direction: Hammer.DIRECTION_ALL,
  threshold: 10,       // Low distance threshold
  velocity: 0.3        // Velocity-based: fast flick triggers from short distance
});
```

### Mid-Swipe Visual Feedback
- During `pan` events (before swipe triggers):
  - Card follows finger position with slight offset
  - **Rotation**: Card tilts proportionally to horizontal drag distance (max ±15°)
  - **Opacity**: Card fades from 1.0 → 0.6 as it moves further from center
- On release below threshold: card snaps back with spring animation

### Swipe Animations
| Direction | Animation | Duration |
|---|---|---|
| Left (next) | `translateX(-120%) rotate(-10deg)`, opacity → 0 | 300ms ease-out |
| Right (prev) | `translateX(120%) rotate(10deg)`, opacity → 0 | 300ms ease-out |
| Up (save+maps) | `translateY(-150%)`, opacity → 0 | 400ms ease-out |

New card enters from the opposite direction with a 200ms ease-out slide-in.

---

## 7. PWA Configuration

### manifest.json
```json
{
  "name": "Kaki!",
  "short_name": "Kaki!",
  "description": "Discover Singapore's best-kept secrets",
  "start_url": "/index.html#home",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#C96B4F",
  "icons": [
    { "src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Service Worker (`sw.js`) — App Shell Caching Only
- **Cached**: `index.html`, `styles.css`, `app.js`, `cards.js`, `search.js`, `favourites.js`, Google Fonts CSS, Hammer.js
- **NOT cached**: `data.json` (always fetch fresh), business images
- Strategy: Cache-first for app shell assets, network-first for data
- On update: new service worker installs in background, activates on next visit

### Apple-Specific Meta Tags (in `index.html`)
```html
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Kaki!">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
```

### Icons
- Placeholder icons to be provided — user will replace with final artwork
- Required sizes: 192×192 and 512×512 (PNG)

---

## 8. Animations & Transitions Summary

| Element | Animation | Duration | Easing |
|---|---|---|---|
| Splash screen fade-out | Opacity 1 → 0, then `display: none` | 500ms | ease-out |
| Card flip | `rotateY(0 → 180deg)`, perspective ~800px | 500ms | ease-in-out |
| Card swipe (left/right) | translateX + rotate + opacity fade | 300ms | ease-out |
| Card swipe (up) | translateY(-150%) + opacity fade | 400ms | ease-out |
| New card enter | translateX from edge → center | 200ms | ease-out |
| Toast overlay (appear) | Scale 0.8 → 1, opacity 0 → 1 | 200ms | ease-out |
| Toast overlay (dismiss) | Opacity 1 → 0 | 300ms | ease-in (after 1.5s delay) |
| Expanded card (open) | Scale + position from mini-card to full | 350ms | ease-out |
| Expanded card (dismiss) | Reverse of open | 300ms | ease-in |
| Tab switch | Fade crossfade between sections | 150ms | ease |
| Filter panel (slide up) | translateY(100% → 0) | 300ms | ease-out |
| Onboarding overlay | Opacity 0 → 1 | 300ms | ease-out |
| Near Me toggle reorder | Instant (no animation) — reset to card 1 | 0ms | — |
| Pulsing tap hint | Scale 1 → 1.15 → 1, repeating | 2000ms | ease-in-out |

---

## 9. Business Data (Complete — with new fields)

Each business below includes the original data plus `teaser`, `price`, and `imageUrl`:

| Business | Teaser | Price | Category (inferred) |
|---|---|---|---|
| Whatcha | "Matcha lattes & banana puddings from a Tiong Bahru pop-up" | 2 | Café |
| harina bakery | "Small-batch sourdough from a Bukit Purmei home kitchen" | 2 | Bakery |
| pebblescoffee | "Barista-quality coffee in an intimate home setting" | 2 | Café |
| Fuku | "Handcrafted matcha drinks & Japanese-inspired desserts at home" | 2 | Café |
| kopi khoo | "Artisanal coffee from a charming heritage neighbourhood" | 1 | Café |
| coffeenearme | "Pet-friendly weekend lattes & brownies in a cozy corner" | 1 | Café, Bakery |
| kohpan | "Mentaiko & truffle shiopans from a specialty home bakery" | 2 | Bakery |
| tofutofu | "Muslim-friendly barista coffee & matcha from home" | 1 | Café |
| brewedbydavine | "Preorder matcha beverages & decadent brownies" | 1 | Café, Bakery |
| state of mind | "Handcrafted espresso from a Yishun window-service bar" | 1 | Café |

---

## 10. Key Technical Decisions Summary

| Decision | Choice | Rationale |
|---|---|---|
| Persistence | localStorage | Favourites, card position, toggle state survive across sessions |
| End of card stack | Warm illustration + CTA | "You've explored all gems!" with link to favourites |
| File structure | Multi-file (HTML, CSS, JS × 3, JSON) | Clean separation of concerns |
| Swipe-up behavior | Always save + maps | Heart icon on card back is the save-only alternative |
| Card flip | Subtle 3D (perspective ~800px) | Polished without being over-the-top |
| Swipe threshold | Velocity-based | Fast flick from any distance, slow drag needs ~50% |
| Mid-swipe feedback | Rotation + opacity | Tinder-style tilt and fade |
| Card images | Placeholder (user replaces later) | Code uses `imageUrl` field pointing to placeholder |
| Categories | Keyword inference from description | No category field in data, matched at runtime |
| Price filter | Added to JSON (1–3 scale) | Makes filter functional immediately |
| Distance sorting | Parse string at runtime | `parseFloat("0.7 km")` → 0.7 |
| No results | Show search suggestions | "Try: coffee, matcha, bakery" based on available data |
| Saved cards in stack | Keep but deprioritize | Moved to end of stack, shown with heart badge |
| Favourites notification | Dot after swipe-up | Clears when Favourites tab is visited |
| Unfavourite confirmation | Custom styled modal | Matches app palette, "Remove" / "Keep" buttons |
| Detail view | Expanded card (in-place) | Swipe up → maps, swipe down → dismiss |
| Profile buttons | Visual placeholders | "Coming Soon" toast on tap |
| Routing | Hash-based (#home, #search, etc.) | Browser back/forward works |
| Gesture library | Hammer.js | Battle-tested, handles velocity detection cleanly |
| PWA | Full (manifest + service worker) | App shell cached; icons are placeholder |
| Offline caching | App shell only | HTML/CSS/JS cached, data always fetched fresh |
| Loading state | Brief splash (~1s) | Kaki! logo, gives fonts time to load |
| Teaser text | Dedicated `teaser` field in JSON | Hand-crafted per business for quality |
| Onboarding | One-time overlay | Semi-transparent with gesture instructions, dismissed permanently |
| Maps link target | New tab (`_blank`) | App stays loaded in original tab |
| Search trigger | Hybrid (2+ chars, 300ms debounce) | Responsive without being twitchy |
| Card counter | None | Pure discovery feel, no completionist pressure |
| Dark mode | Auto (`prefers-color-scheme`) | Charcoal neutral palette, accents unchanged |
| Dark background | `#1E1E1E` | Standard dark mode feel, warm accents pop |
| Expanded card dismiss | Swipe down | Natural iOS sheet gesture |
| Toast style | Center overlay | Instagram-like, auto-dismiss after 1.5s |
| Near Me reorder animation | Instant reset | Jump to first card in new order, no shuffle |
