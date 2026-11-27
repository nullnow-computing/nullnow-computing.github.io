/**
 * Nullnow Computing — Interactive Engine
 * Handles:
 * 1. Dynamic UTC+1 Copyright Year
 * 2. Light / Dark Theme Switcher (persisted in localStorage)
 * 3. Hero Headline Mechanical Glitch-Scramble Reveal
 * 4. Portfolio Hydration & Filtering from portfolio.js
 * 5. Dual-Layer Lerp Custom Cursor
 * 6. IntersectionObserver Scroll Reveals & Section Scanlines
 * 7. Nav Link Hover Glitch & Mobile Drawer
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ------------------------------------------------------------------------
     1. Dynamic UTC+1 Copyright Year
     ------------------------------------------------------------------------ */
  function setUTCPlusOneYear() {
    const yearEl = document.getElementById("copyright-year");
    if (!yearEl) return;

    const now = new Date();
    // Calculate UTC+1 timestamp (West Africa Time)
    const utcPlusOneTime = new Date(now.getTime() + 60 * 60 * 1000);
    yearEl.textContent = utcPlusOneTime.getUTCFullYear();
  }

  /* ------------------------------------------------------------------------
     2. Dark / Light Theme Switcher
     ------------------------------------------------------------------------ */
  function initThemeSwitcher() {
    const root = document.documentElement;
    const toggleBtn = document.getElementById("theme-toggle");
    const themeLabel = document.getElementById("theme-label");

    const savedTheme = localStorage.getItem("nullnow-theme");
    const initialTheme = savedTheme === "dark" ? "dark" : "light";

    function applyTheme(theme) {
      root.setAttribute("data-theme", theme);
      localStorage.setItem("nullnow-theme", theme);
      if (themeLabel) {
        themeLabel.textContent = theme === "dark" ? "LIGHT MODE" : "DARK MODE";
      }
    }

    applyTheme(initialTheme);

    if (toggleBtn) {
      toggleBtn.addEventListener("click", () => {
        const current = root.getAttribute("data-theme");
        const next = current === "dark" ? "light" : "dark";
        applyTheme(next);
      });
    }
  }

  /* ------------------------------------------------------------------------
     3. Hero Headline Character-Scramble Reveal (PRD §9)
     ------------------------------------------------------------------------ */
  function initHeroScramble() {
    const headline = document.getElementById("hero-headline");
    if (!headline) return;

    const finalText =
      headline.getAttribute("data-final-text") || headline.textContent.trim();

    if (prefersReducedMotion) {
      headline.textContent = finalText;
      return;
    }

    const symbols = ["/", "\\", "|", "_", "-", "=", "#", "@", "0", "1"];
    const length = finalText.length;
    const totalDuration = 600; // ms
    const startDelay = 300; // ms

    // Precompute resolution order: letters/digits resolve left-to-right, punctuation resolves last
    const isPunctuation = (ch) => /[^a-zA-Z0-9\s]/.test(ch);
    const letterIndices = [];
    const punctIndices = [];

    for (let i = 0; i < length; i++) {
      if (finalText[i] === " ") continue;
      if (isPunctuation(finalText[i])) {
        punctIndices.push(i);
      } else {
        letterIndices.push(i);
      }
    }

    const orderedIndices = [...letterIndices, ...punctIndices];
    const resolveTimes = new Array(length).fill(0);
    const step = totalDuration / Math.max(orderedIndices.length, 1);

    orderedIndices.forEach((charIdx, orderIdx) => {
      resolveTimes[charIdx] = (orderIdx + 1) * step;
    });

    // Set initial scrambled state
    headline.textContent = finalText
      .split("")
      .map((ch) =>
        ch === " " ? " " : symbols[Math.floor(Math.random() * symbols.length)],
      )
      .join("");

    setTimeout(() => {
      const startTime = performance.now();
      let lastCycle = 0;

      function frame(now) {
        const elapsed = now - startTime;
        const shouldCycle = now - lastCycle >= 40;
        if (shouldCycle) lastCycle = now;

        let output = "";
        let allResolved = true;

        for (let i = 0; i < length; i++) {
          const targetChar = finalText[i];
          if (targetChar === " " || elapsed >= resolveTimes[i]) {
            output += targetChar;
          } else {
            allResolved = false;
            output += symbols[Math.floor(Math.random() * symbols.length)];
          }
        }

        headline.textContent = output;

        if (!allResolved && elapsed <= totalDuration + 80) {
          requestAnimationFrame(frame);
        } else {
          headline.textContent = finalText;
        }
      }

      requestAnimationFrame(frame);
    }, startDelay);
  }

  /* ------------------------------------------------------------------------
     4. Portfolio Parser & Renderer (Reads global `portfolio` from portfolio.js)
     ------------------------------------------------------------------------ */
  function deriveProjectMetadata(entryText, index) {
    const lower = entryText.toLowerCase();

    // Category classification for filter tabs
    let category = "FULLSTACK";
    if (
      lower.includes("fintech educational") ||
      lower.includes("fintech") ||
      lower.includes("loan") ||
      lower.includes("savings") ||
      lower.includes("microfinance") ||
      lower.includes("architecture blueprint") ||
      lower.includes("database")
    ) {
      category = "SOFTWARE & DATA";
    } else if (
      lower.includes("business plan") ||
      lower.includes("managed a team") ||
      lower.includes("product requirement") ||
      lower.includes("edtech")
    ) {
      category = "STRATEGY & PMO";
    }

    // Concise editorial title extraction
    const titleRules = [
      { match: "community church", title: "Lagos Community Church Platform" },
      {
        match: "poet and voice actor",
        title: "Poet & Voice Actor Multimedia Portal",
      },
      { match: "design creative", title: "Art & Interior Design Showcase CMS" },
      {
        match: "sme acceleration",
        title: "SME Acceleration & Investment Blueprint",
      },
      { match: "technology firm", title: "Enterprise Tech Firm Web & CMS" },
      {
        match: "public relations office",
        title: "PR & Government Services Infrastructure",
      },
      {
        match: "audio creative",
        title: "Audio Creative Portfolio & Auth System",
      },
      {
        match: "creative design agency",
        title: "Creative Design Agency & Case Studies",
      },
      {
        match: "sms and email campaign",
        title: "Omnichannel Campaign Frontend",
      },
      {
        match: "entertainment executive",
        title: "Entertainment Executive Digital Presence",
      },
      {
        match: "foundational gaming",
        title: "Gaming Application Core API & DB",
      },
      {
        match: "digital publication",
        title: "Digital Publication Strategy & Rollout",
      },
      {
        match: "edtech engagement",
        title: "EdTech Curriculum & LMS Architecture",
      },
      {
        match: "digital savings",
        title: "Digital Savings & Insurance Engineering",
      },
      {
        match: "fintech educational",
        title: "Finance EdTech MVP & Bookkeeping Suite",
      },
      {
        match: "microfinance facility",
        title: "Microfinance Loan Management System",
      },
      {
        match: "multimedia content delivery",
        title: "Low-Latency Multimedia Delivery Platform",
      },
      {
        match: "entertainment events",
        title: "Events Portal & Undergraduate Creatives Blog",
      },
    ];

    let title = `Engagement // ${String(index + 1).padStart(2, "0")}`;
    for (const rule of titleRules) {
      if (lower.includes(rule.match)) {
        title = rule.title;
        break;
      }
    }

    // Extract technical stack / discipline tags
    const tagMap = [
      { key: "fullstack", label: "fullstack-js" },
      { key: "youtube api", label: "youtube-api" },
      { key: "admin dashboard", label: "admin-dashboard" },
      { key: "dashboard", label: "dashboard" },
      { key: "cms", label: "custom-cms" },
      { key: "api", label: "api-integration" },
      { key: "database", label: "db-modelling" },
      { key: "dns", label: "dns-devops" },
      { key: "authentication", label: "auth" },
      { key: "software", label: "software" },
      { key: "loan", label: "rbac-lending" },
      { key: "blueprint", label: "enterprise-arch" },
      { key: "business plan", label: "product-strategy" },
      { key: "product requirement", label: "prd-lms" },
      { key: "deployment", label: "ci-cd" },
    ];

    const tags = [];
    for (const item of tagMap) {
      if (lower.includes(item.key) && !tags.includes(item.label)) {
        tags.push(item.label);
      }
      if (tags.length >= 4) break;
    }

    if (tags.length === 0) {
      tags.push("web-engineering", "strategy");
    }

    return { title, category, tags };
  }

  function initPortfolio() {
    const grid = document.getElementById("portfolio-grid");
    const countLabel = document.getElementById("portfolio-count");
    const filterButtons = document.querySelectorAll(".filter-btn");

    if (
      !grid ||
      typeof portfolio === "undefined" ||
      !Array.isArray(portfolio)
    ) {
      return;
    }

    const enrichedItems = portfolio.map((desc, idx) => ({
      index: idx + 1,
      description: desc.trim(),
      ...deriveProjectMetadata(desc, idx),
    }));

    function renderCards(filterCategory) {
      const filtered =
        filterCategory === "ALL"
          ? enrichedItems
          : enrichedItems.filter((item) => item.category === filterCategory);

      if (countLabel) {
        countLabel.textContent = `${String(filtered.length).padStart(2, "0")} ENGAGEMENTS`;
      }

      grid.innerHTML = "";

      filtered.forEach((item, idx) => {
        const card = document.createElement("article");
        card.className = "project-card";
        card.setAttribute("data-reveal", "");
        card.style.transitionDelay = `${Math.min(idx * 50, 300)}ms`;

        const indexStr = String(item.index).padStart(2, "0");
        const badgesHTML = item.tags
          .map((tag) => `<span class="stack-badge">${tag}</span>`)
          .join("");

        card.innerHTML = `
          <div class="card-top-bar"></div>
          <div class="project-card-header">
            <span class="mono-label">PRJ // ${indexStr}</span>
            <span class="mono-label">${item.category}</span>
          </div>
          <h3 class="project-title">${item.title}</h3>
          <p class="project-desc">${item.description}</p>
          <div class="project-badges">${badgesHTML}</div>
        `;

        // One-shot wave distortion on hover entry (PRD §9)
        card.addEventListener("mouseenter", () => {
          if (prefersReducedMotion) return;
          card.classList.remove("wave-distort");
          void card.offsetWidth; // trigger reflow
          card.classList.add("wave-distort");
        });

        grid.appendChild(card);
      });

      observeReveals();
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        filterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        renderCards(btn.getAttribute("data-filter"));
      });
    });

    renderCards("ALL");
  }

  /* ------------------------------------------------------------------------
     5. Dual-Layer Lerp Custom Cursor (PRD §6)
     ------------------------------------------------------------------------ */
  function initCustomCursor() {
    const wrapper = document.querySelector(".cursor-wrapper");
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");
    if (!wrapper || !dot || !ring) return;

    const coarsePointer = window.matchMedia("(pointer: coarse)");
    if (coarsePointer.matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    const lerpFactor = 0.14;

    // Position immediately before first move
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;

    document.addEventListener("mousemove", (e) => {
      if (e.pointerType === "touch") {
        wrapper.classList.remove("visible");
        return;
      }

      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;
      wrapper.classList.add("visible");

      const target = e.target;
      const isInteractive =
        target instanceof Element &&
        target.closest("a, button, .project-card, .spec-card, .stack-badge");
      const isText =
        !isInteractive &&
        target instanceof Element &&
        target.closest("p, h1, h2, h3, li, span");

      wrapper.classList.toggle("hovering", Boolean(isInteractive));
      wrapper.classList.toggle("text-hover", Boolean(isText));
    });

    document.addEventListener("mousedown", () => {
      wrapper.classList.add("clicking");
    });

    document.addEventListener("mouseup", () => {
      wrapper.classList.remove("clicking");
    });

    document.addEventListener("mouseleave", () => {
      wrapper.classList.remove("visible");
    });

    function animateRing() {
      ringX += (mouseX - ringX) * lerpFactor;
      ringY += (mouseY - ringY) * lerpFactor;
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
      requestAnimationFrame(animateRing);
    }

    requestAnimationFrame(animateRing);
  }

  /* ------------------------------------------------------------------------
     6. IntersectionObserver Scroll Reveals & Scanlines (PRD §9 & §10)
     ------------------------------------------------------------------------ */
  let revealObserver = null;

  function observeReveals() {
    const revealEls = document.querySelectorAll("[data-reveal]:not(.revealed)");
    const ruleEls = document.querySelectorAll(
      "[data-reveal-rule]:not(.revealed)",
    );

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach((el) => el.classList.add("revealed"));
      ruleEls.forEach((el) => el.classList.add("revealed"));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("revealed");
            obs.unobserve(entry.target);
          });
        },
        { threshold: 0.15 },
      );
    }

    revealEls.forEach((el) => revealObserver.observe(el));
    ruleEls.forEach((el) => revealObserver.observe(el));
  }

  function initSectionScanlines() {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) return;

    const sections = document.querySelectorAll("[data-scanline-section]");
    const scanObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const scanline = document.createElement("div");
          scanline.className = "section-scanline";
          entry.target.appendChild(scanline);

          setTimeout(() => {
            scanline.remove();
          }, 260);

          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );

    sections.forEach((sec) => scanObserver.observe(sec));
  }

  /* ------------------------------------------------------------------------
     7. Navbar Scroll State, Glitch Links & Mobile Drawer
     ------------------------------------------------------------------------ */
  function initNavigation() {
    const navbar = document.getElementById("navbar");
    const glitchLinks = document.querySelectorAll("[data-glitch-link]");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const closeBtn = document.getElementById("mobile-close-btn");
    const drawer = document.getElementById("mobile-drawer");
    const backdrop = document.getElementById("drawer-backdrop");
    const mobileLinks = document.querySelectorAll(".mobile-nav-link");

    window.addEventListener(
      "scroll",
      () => {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 20);
      },
      { passive: true },
    );

    glitchLinks.forEach((link) => {
      link.addEventListener("mouseenter", () => {
        if (prefersReducedMotion) return;
        link.classList.remove("glitch-shift");
        void link.offsetWidth;
        link.classList.add("glitch-shift");
      });
    });

    function setDrawer(open) {
      if (!drawer || !menuBtn) return;
      drawer.classList.toggle("open", open);
      drawer.setAttribute("aria-hidden", String(!open));
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";

      if (backdrop) {
        backdrop.classList.toggle("open", open);
        backdrop.setAttribute("aria-hidden", String(!open));
      }

      if (open && closeBtn) {
        closeBtn.focus();
      } else if (!open) {
        menuBtn.focus();
      }
    }

    if (menuBtn) menuBtn.addEventListener("click", () => setDrawer(true));
    if (closeBtn) closeBtn.addEventListener("click", () => setDrawer(false));
    if (backdrop) backdrop.addEventListener("click", () => setDrawer(false));

    mobileLinks.forEach((link) =>
      link.addEventListener("click", () => setDrawer(false)),
    );

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && drawer && drawer.classList.contains("open")) {
        setDrawer(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     Initialize Application
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", () => {
    setUTCPlusOneYear();
    initThemeSwitcher();
    initHeroScramble();
    initPortfolio();
    initCustomCursor();
    observeReveals();
    initSectionScanlines();
    initNavigation();
  });
})();
