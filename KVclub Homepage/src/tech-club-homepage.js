(function () {
  "use strict";

  const homepage = document.querySelector(".tc-homepage");
  if (!homepage) return;

  document.documentElement.classList.add("tc-js");

  homepage.querySelectorAll(".tc-fragment").forEach((fragment) => {
    fragment.style.left = `${5 + Math.random() * 90}%`;
    fragment.style.top = `${12 + Math.random() * 76}%`;
  });

  const siteLinks = window.TC_SITE_LINKS || {};
  const announcementList = window.TC_HOMEPAGE_CONTENT && window.TC_HOMEPAGE_CONTENT.announcements;
  const announcement = announcementList && (
    announcementList.find((item) => item.status === "upcoming") || announcementList[0]
  );
  const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = homepage.querySelector(".tc-particle-canvas");
  const context = canvas && canvas.getContext("2d");

  function getLink(path) {
    return path.split(".").reduce((value, key) => value && value[key], siteLinks);
  }

  homepage.querySelectorAll("[data-site-link]").forEach((anchor) => {
    const destination = getLink(anchor.dataset.siteLink);
    if (!destination || !destination.url) {
      anchor.removeAttribute("href");
      anchor.setAttribute("aria-disabled", "true");
      return;
    }

    anchor.href = destination.url;
    anchor.dataset.linkStatus = destination.status;
    if (anchor.hasAttribute("data-new-tab")) {
      anchor.target = "_blank";
      anchor.rel = "noopener noreferrer";
    }
  });

  if (announcement) {
    const dateParts = String(announcement.date).trim().split(/\s+/);
    const day = dateParts.shift() || "";
    const month = dateParts.join(" ");
    const status = String(announcement.status || "announcement");
    const statusLabel = status === "upcoming" ? "UPCOMING" : status.toUpperCase();

    homepage.querySelector("[data-announcement-status]").textContent = statusLabel;
    homepage.querySelector("[data-announcement-day]").textContent = day.padStart(2, "0");
    homepage.querySelector("[data-announcement-month]").textContent = month.slice(0, 3).toUpperCase();
    homepage.querySelector("[data-announcement-date]").setAttribute("aria-label", announcement.date);
    homepage.querySelector("[data-announcement-title]").textContent = announcement.title;
    homepage.querySelector("[data-announcement-description]").textContent = announcement.description;
    homepage.querySelector(".tc-hero-display").setAttribute("aria-label", `${statusLabel}: ${announcement.title} on ${announcement.date}`);
  }

  const header = homepage.querySelector(".tc-header");
  const menuToggle = homepage.querySelector(".tc-menu-toggle");
  const navLinks = homepage.querySelectorAll(".tc-nav-links a");

  function setMenuOpen(isOpen) {
    header.classList.toggle("tc-menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Close navigation menu" : "Open navigation menu");
  }

  menuToggle.addEventListener("click", () => {
    setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  navLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

  homepage.querySelectorAll(".tc-button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const bounds = button.getBoundingClientRect();
      button.style.setProperty("--tc-pointer-x", `${event.clientX - bounds.left}px`);
      button.style.setProperty("--tc-pointer-y", `${event.clientY - bounds.top}px`);
    }, { passive: true });

    button.addEventListener("click", (event) => {
      if (motionPreference.matches || event.detail === 0) return;
      const bounds = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "tc-ripple";
      ripple.style.left = `${event.clientX - bounds.left - 6}px`;
      ripple.style.top = `${event.clientY - bounds.top - 6}px`;
      button.append(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });

  const revealItems = homepage.querySelectorAll(".tc-reveal");
  const pendingReveals = new Set(revealItems);
  let revealObserver = null;
  if ("IntersectionObserver" in window && !motionPreference.matches) {
    revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        pendingReveals.delete(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -36px 0px", threshold: 0.08 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    pendingReveals.clear();
  }

  function revealInView() {
    const revealLine = window.innerHeight * 0.92;
    pendingReveals.forEach((item) => {
      const bounds = item.getBoundingClientRect();
      if (bounds.top >= revealLine || bounds.bottom <= 0) return;
      item.classList.add("is-visible");
      if (revealObserver) revealObserver.unobserve(item);
      pendingReveals.delete(item);
    });
  }

  window.addEventListener("scroll", revealInView, { passive: true });
  window.addEventListener("resize", revealInView, { passive: true });
  revealInView();

  if (!canvas || !context) return;

  const hero = homepage.querySelector(".tc-hero");
  const palette = ["#58a7ff", "#58a7ff", "#58a7ff", "#b19aff", "#ff9a57"];
  const nodeColors = [...new Set(palette)];
  const pointer = { x: 0, y: 0, active: false };
  let particles = [];
  let pixelRatio = 1;
  let frameId = 0;
  let running = false;
  let reducedMotion = motionPreference.matches;

  // Particles ease toward their home positions; cursor attraction is local and temporary.
  function makeParticles(width, height) {
    const baseCount = width <= 600
      ? 34
      : Math.max(80, Math.min(112, Math.round((width * height) / 14000)));
    const count = reducedMotion ? Math.min(36, baseCount) : baseCount;
    return Array.from({ length: count }, (_, index) => {
      const x = Math.random() * width;
      const y = Math.random() * height;
      return {
        homeX: x,
        homeY: y,
        x,
        y,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.22 + Math.random() * 0.18,
        color: palette[index % palette.length]
      };
    });
  }

  function resizeCanvas() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = makeParticles(width, height);
    canvas.dataset.particleCount = String(particles.length);
    drawFrame(0, false);
    startAnimation();
  }

  function drawFrame(timestamp, animate) {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const time = timestamp / 1000;
    context.clearRect(0, 0, width, height);

    if (animate) {
      particles.forEach((particle) => {
        const driftX = Math.sin(time * particle.speed + particle.phase) * 2.4;
        const driftY = Math.cos(time * particle.speed * 0.83 + particle.phase) * 2.4;
        const homeX = particle.homeX + driftX;
        const homeY = particle.homeY + driftY;
        particle.vx += (homeX - particle.x) * 0.004;
        particle.vy += (homeY - particle.y) * 0.004;

        if (pointer.active) {
          const dx = pointer.x - particle.x;
          const dy = pointer.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const radius = 145;
          if (distance > 0 && distance < radius) {
            const pull = ((radius - distance) / radius) ** 2 * 0.11;
            particle.vx += (dx / distance) * pull;
            particle.vy += (dy / distance) * pull;
          }
        }

        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const homeDx = particle.x - particle.homeX;
        const homeDy = particle.y - particle.homeY;
        const displacement = Math.sqrt(homeDx * homeDx + homeDy * homeDy);
        if (displacement > 30) {
          particle.x = particle.homeX + (homeDx / displacement) * 30;
          particle.y = particle.homeY + (homeDy / displacement) * 30;
        }
      });
    }

    const maxDistance = 120;
    const maxDistanceSquared = maxDistance * maxDistance;
    context.beginPath();
    for (let first = 0; first < particles.length; first += 1) {
      for (let second = first + 1; second < particles.length; second += 1) {
        const dx = particles[first].x - particles[second].x;
        const dy = particles[first].y - particles[second].y;
        if (dx * dx + dy * dy > maxDistanceSquared) continue;
        context.moveTo(particles[first].x, particles[first].y);
        context.lineTo(particles[second].x, particles[second].y);
      }
    }
    context.strokeStyle = "rgba(88, 167, 255, 0.145)";
    context.lineWidth = 0.7;
    context.stroke();

    nodeColors.forEach((color) => {
      context.beginPath();
      particles.forEach((particle) => {
        if (particle.color === color) {
          context.moveTo(particle.x + 1.15, particle.y);
          context.arc(particle.x, particle.y, 1.15, 0, Math.PI * 2);
        }
      });
      context.fillStyle = color;
      context.fill();
    });
  }

  function animate(timestamp) {
    if (!running || reducedMotion || document.hidden) return;
    drawFrame(timestamp, true);
    frameId = window.requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (reducedMotion || document.hidden || running) return;
    running = true;
    frameId = window.requestAnimationFrame(animate);
  }

  function stopAnimation() {
    running = false;
    window.cancelAnimationFrame(frameId);
  }

  function updatePointer(event) {
    if (event.pointerType !== "mouse") return;
    const bounds = hero.getBoundingClientRect();
    pointer.active = event.clientY >= bounds.top && event.clientY <= bounds.bottom;
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }

  window.addEventListener("pointermove", updatePointer, { passive: true });
  window.addEventListener("pointerout", (event) => {
    if (!event.relatedTarget) pointer.active = false;
  }, { passive: true });
  window.addEventListener("scroll", () => {
    const bounds = hero.getBoundingClientRect();
    if (pointer.y < bounds.top || pointer.y > bounds.bottom) pointer.active = false;
  }, { passive: true });
  window.addEventListener("resize", resizeCanvas, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopAnimation();
    else startAnimation();
  });

  motionPreference.addEventListener("change", (event) => {
    reducedMotion = event.matches;
    pointer.active = false;
    stopAnimation();
    resizeCanvas();
  });

  resizeCanvas();
})();
