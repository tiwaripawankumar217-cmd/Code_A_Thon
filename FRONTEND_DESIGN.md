# 🎨 FraudGuard Frontend Design Prompt

> Use this prompt to build the complete frontend for the FraudGuard project. Every page should feel **premium, warm, dynamic, and alive** — like a high-end fintech dashboard.

---

## 🌈 Color Palette — Warm Tones

```css
:root {
    /* ── Primary Warm Gradient Stops ── */
    --warm-orange:        #FF6B35;
    --warm-amber:         #F7931E;
    --warm-gold:          #FFB627;
    --warm-coral:         #FF4E50;
    --warm-rose:          #FC466B;
    --warm-peach:         #FFA07A;

    /* ── Dark Background Tones (warm-tinted dark) ── */
    --bg-deep:            #0D0D0D;
    --bg-dark:            #1A1A2E;
    --bg-card:            #16213E;
    --bg-card-hover:      #1F2B47;

    /* ── Glass Overlay ── */
    --glass-bg:           rgba(255, 107, 53, 0.08);
    --glass-border:       rgba(255, 182, 39, 0.15);
    --glass-shadow:       rgba(255, 107, 53, 0.25);

    /* ── Text ── */
    --text-primary:       #FFFFFF;
    --text-secondary:     #B0B0C3;
    --text-accent:        #FFB627;

    /* ── Status Colors ── */
    --success:            #00C853;
    --warning:            #FFB627;
    --danger:             #FF4E50;

    /* ── Gradients ── */
    --gradient-primary:   linear-gradient(135deg, #FF6B35, #FF4E50, #FC466B);
    --gradient-gold:      linear-gradient(135deg, #F7931E, #FFB627, #FFA07A);
    --gradient-dark-bg:   linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #16213E 100%);
    --gradient-card:      linear-gradient(145deg, rgba(255,107,53,0.1), rgba(252,70,107,0.05));
    --gradient-hero:      linear-gradient(135deg, #1A1A2E 0%, #0D0D0D 40%, #1A0A0A 100%);
}
```

---

## 🖼️ Page-by-Page Design Specifications

---

### PAGE 1: Login / Register

**Layout:** Centered card on a full-screen animated gradient background.

**Background:**
- `linear-gradient(135deg, #0D0D0D, #1A1A2E, #2D1B00)` as the base
- Floating soft-glow orbs (CSS `@keyframes` moving radial-gradient circles in warm orange/gold)
- Subtle animated mesh/grid pattern (SVG or CSS) to add depth

**Card:**
- Glassmorphism: `background: rgba(255, 107, 53, 0.06); backdrop-filter: blur(20px);`
- Border: `1px solid rgba(255, 182, 39, 0.15)`
- Box-shadow: `0 8px 32px rgba(255, 107, 53, 0.15), 0 0 80px rgba(255, 78, 80, 0.05)`
- **3D hover tilt**: On mouse move, card tilts slightly using CSS `perspective(1000px) rotateX() rotateY()` via a small JS snippet
- Rounded corners: `border-radius: 24px`

**Form Elements:**
- Inputs with warm bottom border that glows orange on focus
- `transition: all 0.3s ease; border-bottom: 2px solid rgba(255,182,39,0.3);`
- On focus: `border-bottom-color: #FF6B35; box-shadow: 0 4px 15px rgba(255,107,53,0.2);`
- Submit button: `background: linear-gradient(135deg, #FF6B35, #FC466B);` with hover scale(1.03) and glow
- Tab switch between Login/Register with animated underline indicator

**Image:**
- Right side (or behind the card as a watermark): A semi-transparent shield/lock icon in warm gold tones
- Or: An abstract 3D illustration of a floating credit card with warm lighting

---

### PAGE 2: Dashboard (Main Page)

**Layout:** CSS Grid — sidebar (optional) + main content area with card-based widgets.

**Background:**
- `background: linear-gradient(135deg, #0D0D0D 0%, #1A1A2E 50%, #0D0D0D 100%);`
- Fixed background with subtle animated particles (warm-colored dots drifting slowly)

**Navbar:**
- Sticky top, `background: rgba(13, 13, 13, 0.8); backdrop-filter: blur(12px);`
- Logo with warm gradient text: `-webkit-background-clip: text; background: linear-gradient(135deg, #FF6B35, #FFB627);`
- Nav links with hover underline animation (warm orange line slides in from left)
- User avatar circle with warm border glow

**Stat Cards Row (4 cards across):**
Each card shows: Total Income, Total Expenses, Health Score, Flagged Count

- Background: `linear-gradient(145deg, rgba(255,107,53,0.08), rgba(252,70,107,0.04))`
- Border: `1px solid rgba(255,182,39,0.12)`
- **3D Hover Effect:**
  ```css
  .stat-card {
      transition: transform 0.4s ease, box-shadow 0.4s ease;
      transform-style: preserve-3d;
  }
  .stat-card:hover {
      transform: translateY(-8px) rotateX(5deg);
      box-shadow: 0 20px 60px rgba(255, 107, 53, 0.25);
      border-color: rgba(255, 107, 53, 0.4);
  }
  ```
- Each card has a glowing icon (e.g., 💰 📉 ❤️ ⚠️) with a warm radial glow behind it
- Numbers animate in (count-up effect) when the page loads

**Image/Icon Ideas for Stat Cards:**
- Income card: Upward arrow with gold glow
- Expense card: Downward arrow with coral glow
- Health score: Heart/shield icon with animated pulse
- Flagged: Warning triangle with red-orange pulse

**Chart Section (2-column grid):**

Left: Income vs Expense Bar Chart
- Chart.js with warm custom colors:
  - Income bars: `linear-gradient(180deg, #FFB627, #F7931E)`
  - Expense bars: `linear-gradient(180deg, #FF4E50, #FC466B)`
- Chart container card with glassmorphism

Right: Category Pie/Doughnut Chart
- Warm color segments: `['#FF6B35', '#FFB627', '#FC466B', '#FFA07A', '#F7931E', '#FF4E50']`
- Center text showing total
- Container card matching left

**Budget Progress Section:**
- Each budget category as a horizontal progress bar
- Bar background: `rgba(255,255,255,0.05)`
- Fill gradient changes based on percentage:
  - 0-60%: `linear-gradient(90deg, #00C853, #69F0AE)` (green)
  - 60-80%: `linear-gradient(90deg, #F7931E, #FFB627)` (warm amber)
  - 80-100%+: `linear-gradient(90deg, #FF4E50, #FC466B)` (danger red)
- On hover, bar slightly grows in height and glows
- Category label on the left, "$spent / $limit" on the right

**Recent Transactions Table:**
- Dark table with warm accent borders
- Alternating row backgrounds: `rgba(255,107,53,0.03)` and `transparent`
- Hover row: `background: rgba(255,107,53,0.08); transform: scale(1.01);`
- Flagged rows: left border `4px solid #FF4E50` + subtle red background tint
- Amount column: green for income, coral-red for expenses
- Each row slides in with a staggered animation on page load

**Fraud Alert Toast (SSE-triggered):**
- Position: fixed top-right
- Background: `linear-gradient(135deg, #FF4E50, #FC466B)`
- Slides in from the right with `@keyframes slideIn`
- Shakes slightly on appearance (attention-grab)
- Has a warm glow: `box-shadow: 0 4px 30px rgba(255, 78, 80, 0.5);`
- Auto-dismisses after 8 seconds with fade-out
- Shows: ⚠️ icon, amount, and first reason

---

### PAGE 3: Transactions Page

**Layout:** Form on top, table below.

**Add Transaction Form:**
- Card with glassmorphism (same as dashboard cards)
- Input fields in a 2-column grid (amount + type on one row, category + date on next)
- Dropdown selects with custom warm styling (replace default browser selects)
- Submit button: warm gradient with hover glow and 3D press effect
  ```css
  .btn-submit:active {
      transform: translateY(2px) scale(0.98);
      box-shadow: 0 2px 10px rgba(255, 107, 53, 0.3);
  }
  ```

**Transaction List:**
- Same table style as dashboard, but full-width with more columns
- Filter/search bar at the top with warm-glow focus state
- Flagged transactions expandable — click to see fraud reasons in a collapsible panel
- Delete button: appears on hover, red with confirmation animation

**Images:**
- Empty state: Illustration of an empty wallet with warm tones + "No transactions yet" message
- Success state after adding: Brief green checkmark animation

---

### PAGE 4: Budget Management

**Layout:** Grid of budget cards + "Add Budget" button.

**Budget Cards:**
- Each category budget is a card with:
  - Category icon (🛒 🏠 🎮 💸 etc.)
  - Category name in warm gradient text
  - Circular progress ring (SVG) showing percentage used
  - Dollar amount: "$150 / $200"
  - Delete button (appears on hover with slide-in)
- **3D hover**: Cards lift and tilt slightly, border glows warmer
- Over-budget cards have a pulsing red border animation

**Add Budget Modal:**
- Dark overlay with blur
- Glassmorphism modal card that scales in: `transform: scale(0.9)` → `scale(1)` on open
- Warm gradient header bar at the top of the modal

---

## 🌟 Global Effects & Animations

### 3D Card Tilt (JS — apply to all major cards)
```js
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (y - centerY) / 15;
        const rotateY = (centerX - x) / 15;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    });
});
```

### Floating Background Orbs (CSS)
```css
.bg-orb {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.15;
    animation: float 20s ease-in-out infinite;
    pointer-events: none;
    z-index: 0;
}
.bg-orb-1 {
    width: 400px; height: 400px;
    background: radial-gradient(circle, #FF6B35, transparent);
    top: -100px; left: -100px;
}
.bg-orb-2 {
    width: 350px; height: 350px;
    background: radial-gradient(circle, #FC466B, transparent);
    bottom: -80px; right: -80px;
    animation-delay: -7s;
}
.bg-orb-3 {
    width: 300px; height: 300px;
    background: radial-gradient(circle, #FFB627, transparent);
    top: 50%; left: 50%;
    animation-delay: -14s;
}
@keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    25% { transform: translate(30px, -50px) rotate(5deg); }
    50% { transform: translate(-20px, 20px) rotate(-5deg); }
    75% { transform: translate(50px, 30px) rotate(3deg); }
}
```

### Staggered Card Entrance Animation
```css
@keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
.card { animation: fadeSlideUp 0.6s ease forwards; }
.card:nth-child(1) { animation-delay: 0.1s; }
.card:nth-child(2) { animation-delay: 0.2s; }
.card:nth-child(3) { animation-delay: 0.3s; }
.card:nth-child(4) { animation-delay: 0.4s; }
```

### Hover Glow Effect (apply to buttons, cards, icons)
```css
.glow-hover {
    transition: all 0.3s ease;
}
.glow-hover:hover {
    box-shadow: 
        0 0 15px rgba(255, 107, 53, 0.4),
        0 0 45px rgba(255, 107, 53, 0.15),
        0 0 80px rgba(255, 107, 53, 0.05);
}
```

### Gradient Text
```css
.gradient-text {
    background: linear-gradient(135deg, #FF6B35, #FFB627);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
```

### Animated Number Count-Up
```js
function animateCountUp(element, target, duration = 1500) {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = '$' + target.toLocaleString();
            clearInterval(timer);
        } else {
            element.textContent = '$' + Math.floor(start).toLocaleString();
        }
    }, 16);
}
```

---

## 🖼️ Images & Visual Assets to Include

| Where | Image Description | Purpose |
|-------|-------------------|---------|
| Login page background | Abstract warm gradient mesh or aurora | Sets the premium tone |
| Login card | 3D floating shield/lock icon in gold | Reinforces security theme |
| Dashboard hero area | Subtle background pattern (dots, grid, or topography lines in warm tones) | Adds texture without distraction |
| Stat card icons | Glowing icons (arrow up, arrow down, heart, warning triangle) | Quick visual identification |
| Empty states | Illustrated wallet/piggy bank in warm colors | Friendly UX when no data |
| Fraud alert toast | Warning shield icon with red-orange glow | Grabs attention |
| Budget cards | Category-specific icons (cart, house, gamepad, car) | Visual categorization |
| Footer | Small team logo or abstract warm geometric shapes | Branding |

> **Tip:** Use your `generate_image` tool or free illustration sources like unDraw, Storyset, or Humaaans (recolored to warm tones).

---

## 📐 Typography

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

h1 { font-weight: 800; font-size: 2.5rem; }
h2 { font-weight: 700; font-size: 1.75rem; }
h3 { font-weight: 600; font-size: 1.25rem; }
p  { font-weight: 400; line-height: 1.6; }

/* Numbers/Stats — use tabular figures for alignment */
.stat-number {
    font-weight: 800;
    font-size: 2rem;
    font-variant-numeric: tabular-nums;
}
```

---

## 📱 Responsive Breakpoints

```css
/* Tablet */
@media (max-width: 768px) {
    .stat-grid { grid-template-columns: 1fr 1fr; }
    .chart-grid { grid-template-columns: 1fr; }
}

/* Mobile */
@media (max-width: 480px) {
    .stat-grid { grid-template-columns: 1fr; }
    .navbar { flex-direction: column; }
}
```

---

## ✅ Design Checklist

- [ ] Warm color palette applied everywhere (no cold blues or greens except for success states)
- [ ] Linear gradient backgrounds on every page
- [ ] Glassmorphism cards with warm-tinted glass
- [ ] 3D tilt hover on all major cards (stat cards, budget cards, chart containers)
- [ ] Hover glow effects on buttons and interactive elements
- [ ] Staggered entrance animations on page load
- [ ] Floating background orbs for ambient warmth
- [ ] Gradient text on headings and key labels
- [ ] Animated count-up on stat numbers
- [ ] Fraud toast with slide-in + shake animation
- [ ] Budget progress bars with dynamic gradient colors
- [ ] Table rows with hover lift and flagged-row red accent
- [ ] Custom-styled form inputs with warm focus glow
- [ ] Images/illustrations on login, empty states, and icons
- [ ] Inter font loaded from Google Fonts
- [ ] Responsive down to mobile (480px)

---

> **Use this document as the single source of truth for all frontend styling decisions in the FraudGuard project.**
