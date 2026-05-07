# AI Agent Guide: Personal Portfolio Website

## Project Overview
This is **Aufan's Personal Portfolio Website** - a modern, dark-themed portfolio showcasing skills and projects. Built with vanilla JavaScript, HTML5, CSS3, and Bootstrap 5 for maximum performance.

**Live Site:** [aufan.ifportofolio.com](http://aufan.ifportofolio.com)

---

## 🎨 Design System & Conventions

### CSS Architecture
- **Color System:** CSS custom properties (`:root`) define all colors in `css/styles.css`:
  - Primary background: `#010f1c` (dark blue-black)
  - Accent: `#11cf3d` (neon green)
  - Text: `#f0f0f0` (light gray)
- **Glassmorphism:** Uses semi-transparent overlays (`--bg-glass`) for modern card effects
- **Animations:** All transitions use `0.3s ease` by default
- **Typography:** Poppins font family

### Button Convention
Primary buttons (`btn-primary`) feature:
- Neon green background with hover lift effect (`transform: translateY(-3px)`)
- Glowing shadow on hover

**When modifying styles:** Update CSS variables in `:root` rather than hardcoding values.

---

## 🔧 JavaScript Architecture & Patterns

### File Organization
- **`js/script.js`** - Core logic: typing effect, portfolio filtering, scroll animations, form validation, modal
- **`js/music.js`** - Dedicated music player with LocalStorage persistence

### Key JavaScript Features

#### 1. Typing Effect Animation
- Animates hero section text cycling through: Backend Developer → Frontend Developer → AI Enthusiast → UI/UX Designer
- Located in `index.html` with ID `typing-text`
- **Code pattern:** Event-driven with `DOMContentLoaded` trigger

#### 2. Portfolio Filtering
- Dynamic filter buttons (`.filter-btn`) sort projects without page reload
- Categories: Web, Design, App
- **Key DOM elements:** `.portfolio-item` contains filterable content
- **Pattern:** Click handler updates item visibility via data attributes or classes

#### 3. Scroll Reveal Animation
- Uses Intersection Observer API (native, no library)
- Elements fade-in smoothly as user scrolls
- **When adding new sections:** Apply reveal animation to new portfolio items automatically

#### 4. Persistent Music Player
- `music.js` handles background audio with LocalStorage
- **Persisted data:**
  - Play/Pause state
  - Volume level
  - Current timestamp (never restarts from beginning)
- **When modifying:** Preserve LocalStorage logic to maintain user experience across page reloads

#### 5. Form Validation
- Client-side validation on contact form (check for empty fields and valid email format)
- Must validate BEFORE submission

---

## 📁 Page Structure

| File | Purpose |
|------|---------|
| `index.html` | Homepage: Hero section with typing effect, skills showcase |
| `about.html` | About me page |
| `portofolio.html` | Portfolio gallery with filtering and modal details |
| `kontak.html` | Contact form with validation |

**Navigation:** All pages use consistent header/footer (likely in partial or inline)

---

## 🚀 Development & Deployment

### Build System
- **No build step required** - pure HTML/CSS/JS, runs directly in browser
- **Testing:** Open `.html` files directly in browser or use local web server

### Deployment Pipeline
- **CI/CD:** GitHub Actions (`.github/workflows/deploy.yml`)
- **Trigger:** Push to `main` branch
- **Action:** Deploys via FTP to `aufan.ifportofolio.com` using:
  - Secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`
  - Deployment directory: `./public_html/aufan/`
- **Clean deploy:** Includes `dangerous-clean-slate: true` (full directory replacement)

**Before deployment:** Commit to `main` branch - action automatically pushes live.

---

## 🛠️ Common Development Tasks

### Adding a New Portfolio Item
1. Add HTML markup to `portofolio.html` with class `portfolio-item`
2. Add filter category data attribute (e.g., `data-category="web"`)
3. Add to the portfolio array in `script.js` for modal functionality
4. Styling automatically inherits from existing `.portfolio-item` CSS

### Updating Colors/Theme
1. Modify CSS variables in `:root` of `css/styles.css`
2. All elements automatically use new colors via `var(--color-*)` references
3. No need to update individual elements

### Adding New Pages
1. Create new `.html` file with same header/footer structure
2. Include `<script src="js/script.js"></script>` and `<script src="js/music.js"></script>` tags
3. Add navigation link in header to new page
4. Deployment automatically includes new files

### Testing Form Validation
- Form must validate email format and prevent empty submissions
- Test in browser console: verify form submit event doesn't fire with invalid data

---

## 📝 Code Style Notes

- **Vanilla JavaScript:** No frameworks - keep it lightweight
- **Comments:** Existing code uses clear function names; add JSDoc comments only for complex logic
- **Responsive:** Bootstrap 5 grid system - test on mobile, tablet, desktop
- **Accessibility:** Ensure alt text on images, semantic HTML, proper heading hierarchy

---

## ⚠️ Important Constraints

1. **No Heavy Libraries:** Avoid adding jQuery, moment.js, or other large dependencies. Stick with native APIs.
2. **LocalStorage Persistence:** Music player must work across page reloads - test thoroughly.
3. **FTP Deployment:** Secrets must be set in GitHub repo settings. Full directory clean-deploy means no manual FTP management.
4. **Bootstrap 5 Compatibility:** CSS is built on Bootstrap 5 - verify any new components use Bootstrap classes.

---

## 🔗 Quick References

- **README.md** - See [README.md](README.md) for detailed project info, feature descriptions, and student details
- **Live Demo** - Test features at http://aufan.ifportofolio.com
- **GitHub Workflows** - See `.github/workflows/deploy.yml` for deployment details
