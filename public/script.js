const root = document.documentElement;
const siteHeader = document.querySelector(".site-header");
const navToggle = document.querySelector(".nav-toggle");
const themeToggle = document.querySelector("[data-theme-toggle]");
const filterContainer = document.querySelector("#tech-filters");
const filterStatus = document.querySelector("#filter-status");
const filterReset = document.querySelector("[data-filter-reset]");
const revealables = document.querySelectorAll(".reveal");
const darkPreference = window.matchMedia?.("(prefers-color-scheme: dark)");

const tagMap = {
  "AxiomCore platform": ["Android", "Kotlin", "API", "Loyalty"],
  AxiomCache: ["Android", "Kotlin", "Cache", "API"],
  "PhotoCache and PhotoLoader": ["Android", "Kotlin", "Images", "Cache"],
  "Login, sessions and auth": ["Android", "Kotlin", "Auth", "API"],
  "LayoutDSL and screen state": ["Android", "Kotlin", "UI"],
  "UI DSL and components": ["Android", "Kotlin", "UI"],
  "Animations and motion": ["Android", "UI"],
  "Themes and source-of-truth": ["Android", "UI"],
  "Payments, QR and wallet flows": ["Android", "Payments", "Google Wallet"],
  "LoyalKit / Viseca": ["Android", "Kotlin", "Loyalty"],
  Alphamega: ["Android", "Kotlin", "Loyalty", "Google Wallet"],
  Antamivi: ["Android", "Kotlin", "Maps", "Loyalty"],
  Omonoia: ["Android", "Kotlin", "Loyalty"],
  Cablenet: ["Android", "Kotlin", "Loyalty"],
  FEBE: ["Android", "Kotlin", "Payments"],
  "Bean Bar": ["Android", "Kotlin", "Payments", "Commerce"],
  "Stick And Win": ["Android", "Kotlin", "Loyalty"],
  "Legacy product lines": ["Android", "Kotlin", "Payments"],
  AxiomPipe: ["CI/CD", "Azure", "DevOps"],
  "AxiomPlugin / LibraryPlugin": ["Gradle", "Android", "CI/CD"],
  CodexReview: ["AI", "Azure", "DevOps"],
  AxiomAgency: ["Docker", "Azure", "DevOps"],
  "Support libraries": ["Kotlin", "Security", "Cache"],
  ".NET API/library pipeline support": [".NET", "API", "CI/CD"],
  SakuraStats: ["Android", "Kotlin", "Java", "SQLite"],
  "SakuraStats CLI": ["Java", "SQLite", "Web"],
  "LGS-2013": ["Android", "Java", "Media"],
  LittleBox: ["Android", "Kotlin", "Game"],
  "Fake News Detection": ["Java", "SQLite", "NLP"],
  "Database Translation": ["Java", "SQLite", "Automation"],
  "IRC game-lobby client": ["Java", "JavaFX", "PHP", "SQLite"],
  "Vacation-management system": ["Java", "JPA", "Swing"],
  "Early websites": ["Web", "JavaScript", "PHP"],
  HashPDF: ["C#", "Utility"],
  Guit2Key: ["Python", "Utility"],
  "Repository-Listing": ["Android", "Kotlin"],
  JellyRecycler: ["Android", "Kotlin", "UI"],
  ColorBetween: ["Android", "Kotlin", "UI"],
  SpaceInvaders: ["Python", "Game"],
  Semigods: ["Game", "HTML5"],
  "Greeenhouse Dystopia": ["Game", "Godot"],
  Castaways: ["Game"],
  Raid51: ["Game"],
  "Hang on, Bill!": ["Game", "HTML5"],
  KTee: ["Kotlin", "Library"],
  LoggingInterceptor: ["Kotlin", "OkHttp", "Library"],
  "Bottom Sheet Image Picker fork": ["Android", "Kotlin", "Library"],
  "CountryCodePicker fork": ["Android", "Java", "Library"],
  "LoadingButtonAndroid fork": ["Android", "Kotlin", "Library"],
  "Pdf-Viewer fork": ["Android", "Kotlin", "Library"],
  "RoundableLayout fork": ["Android", "Kotlin", "Library"],
  "Wikimedia Commons app fork": ["Android", "Java"],
  "Flashbar fork": ["Android", "Kotlin", "Library"],
  "BlurKit Android fork": ["Android", "Java", "Library"],
  "ElevationImageView fork": ["Android", "Kotlin", "Library"],
};

function getStorage(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function setStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures in private browsing or locked-down browsers.
  }
}

function applyTheme(theme) {
  if (theme === "light" || theme === "dark") {
    root.dataset.theme = theme;
  } else {
    root.removeAttribute("data-theme");
  }

  const effectiveTheme = getEffectiveTheme(theme);
  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(effectiveTheme === "dark"));
    themeToggle.setAttribute(
      "aria-label",
      effectiveTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"
    );
  }

  requestAnimationFrame(checkPrimaryButtonContrast);
}

function getEffectiveTheme(theme) {
  if (theme === "dark" || theme === "light") return theme;
  return darkPreference?.matches ? "dark" : "light";
}

function setupDisplayControls() {
  applyTheme(getStorage("portfolioTheme", "system"));

  themeToggle?.addEventListener("click", () => {
    const currentTheme = getStorage("portfolioTheme", "system");
    const nextTheme = getEffectiveTheme(currentTheme) === "dark" ? "light" : "dark";
    setStorage("portfolioTheme", nextTheme);
    applyTheme(nextTheme);
  });

  darkPreference?.addEventListener?.("change", () => {
    if (getStorage("portfolioTheme", "system") === "system") {
      applyTheme("system");
    }
    requestAnimationFrame(checkPrimaryButtonContrast);
  });

}

function parseColor(value) {
  const match = value.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;

  const [r, g, b, a = "1"] = match[1]
    .split(",")
    .map(part => Number.parseFloat(part.trim()));

  if ([r, g, b, a].some(component => Number.isNaN(component))) return null;
  return { r, g, b, a };
}

function relativeLuminance({ r, g, b }) {
  const normalize = value => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * normalize(r) + 0.7152 * normalize(g) + 0.0722 * normalize(b);
}

function contrastRatio(foreground, background) {
  const light = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const dark = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (light + 0.05) / (dark + 0.05);
}

function checkPrimaryButtonContrast() {
  const button = document.querySelector(".button-primary");
  if (!button) return;

  const style = getComputedStyle(button);
  const foreground = parseColor(style.color);
  const background = parseColor(style.backgroundColor);

  if (!foreground || !background || background.a === 0) {
    root.dataset.contrastGuard = "true";
    return;
  }

  if (contrastRatio(foreground, background) < 4.5) {
    root.dataset.contrastGuard = "true";
  }
}

function setupContrastGuard() {
  checkPrimaryButtonContrast();
  window.setTimeout(checkPrimaryButtonContrast, 250);
  window.setTimeout(checkPrimaryButtonContrast, 1200);
  window.setTimeout(checkPrimaryButtonContrast, 3000);
}

function setupNavigation() {
  navToggle?.addEventListener("click", () => {
    const isOpen = siteHeader?.classList.toggle("is-nav-open") ?? false;
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.querySelectorAll(".site-nav a").forEach(link => {
    link.addEventListener("click", () => {
      siteHeader?.classList.remove("is-nav-open");
      navToggle?.setAttribute("aria-expanded", "false");
    });
  });
}

function setupTechFilter() {
  if (!filterContainer) return;

  const cards = [...document.querySelectorAll(".work-card, .system-card, .project-card")].map(card => {
    const title = card.querySelector("h3")?.textContent?.trim() ?? "";
    const tags = tagMap[title] ?? [];
    card.dataset.tags = tags.join(",");
    return { card, title, tags };
  });

  const counts = new Map();
  cards.forEach(({ tags }) => {
    tags.forEach(tag => counts.set(tag, (counts.get(tag) ?? 0) + 1));
  });

  const sortedTags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  sortedTags.forEach(([tag, count]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.filterTag = tag;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = `${tag}<small>${count}</small>`;
    filterContainer.append(button);
  });

  function applyFilter(activeTag) {
    const isAll = !activeTag;
    let shown = 0;

    cards.forEach(({ card, tags }) => {
      const matches = isAll || tags.includes(activeTag);
      card.classList.toggle("is-filtered-out", !matches);
      if (matches) shown += 1;
    });

    filterContainer.querySelectorAll("button").forEach(button => {
      button.setAttribute("aria-pressed", String(button.dataset.filterTag === activeTag));
    });

    if (filterStatus) {
      filterStatus.textContent = isAll
        ? `Showing all ${cards.length} cards.`
        : `Showing ${shown} cards tagged ${activeTag}.`;
    }
  }

  filterContainer.addEventListener("click", event => {
    const button = event.target.closest("button[data-filter-tag]");
    if (!button) return;
    const selected = button.getAttribute("aria-pressed") === "true" ? "" : button.dataset.filterTag;
    applyFilter(selected);
  });

  filterReset?.addEventListener("click", () => applyFilter(""));
  applyFilter("");
}

function setupRevealAnimation() {
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealables.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index * 45, 220)}ms`;
    observer.observe(element);
  });
}

setupDisplayControls();
setupNavigation();
setupTechFilter();
setupRevealAnimation();
setupContrastGuard();
