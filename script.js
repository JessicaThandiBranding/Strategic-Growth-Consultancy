const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const servicesNav = nav.querySelector("[data-services-nav]");
const servicesNavToggle = servicesNav?.querySelector(".nav-services-toggle");
const servicesNavMenu = servicesNav?.querySelector(".nav-dropdown-menu");
const panelTriggers = document.querySelectorAll("[data-panel-trigger]");
const servicePanelHome = document.querySelector('[data-panel-region="services"]');
const mobilePanelQuery = window.matchMedia("(max-width: 860px)");
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const enquirySelect = document.querySelector("[data-enquiry-select]");
const enquiryLinks = document.querySelectorAll("[data-enquiry]");
const enquiryForm = document.querySelector("[data-form]");
const formSuccess = document.querySelector("[data-form-success]");
const panelCloseTimers = new WeakMap();
const headerSections = document.querySelector(".hero")
  ? [...document.querySelectorAll("main > section")]
  : [];
const sectionNavLinks = [...nav.querySelectorAll('a[href^="#"]')];
const setActiveSection = (id) => {
  sectionNavLinks.forEach((link) => {
    if (link.getAttribute("href") === `#${id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
  if (servicesNavToggle) {
    if (id === "services") servicesNavToggle.setAttribute("aria-current", "location");
    else servicesNavToggle.removeAttribute("aria-current");
  }
};

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
  if (!headerSections.length) return;
  const sectionEdge = header.getBoundingClientRect().bottom + 2;
  const section = headerSections.find((item) => {
    const bounds = item.getBoundingClientRect();
    return bounds.top <= sectionEdge && bounds.bottom > sectionEdge;
  });
  const surface = section?.matches(".about-feature, .approach-feature")
    ? "image"
    : section?.matches(".hero") ? "home" : "cream";
  const activeId = section?.matches(".hero") ? "top"
    : section?.matches(".about-closing") ? "about"
    : section?.id || "contact";
  setActiveSection(activeId);
  if (surface === "image") {
    const picture = section.querySelector("picture");
    const image = picture?.querySelector("img");
    if (image?.naturalWidth) {
      const bounds = image.getBoundingClientRect();
      const scale = Math.max(bounds.width / image.naturalWidth, bounds.height / image.naturalHeight);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const fade = getComputedStyle(picture, "::after").backgroundImage;
      header.style.setProperty("--header-section-image", `url("${image.currentSrc}")`);
      header.style.setProperty("--header-section-fade", fade === "none" ? "linear-gradient(transparent, transparent)" : fade);
      header.style.setProperty("--header-image-size", `${width}px ${height}px`);
      // Extend only the background-only top edge, never the portrait or artwork below it.
      header.style.setProperty("--header-image-position", `${bounds.right - width}px 0px`);
      const edgeHeight = header.getBoundingClientRect().height + 3;
      header.style.setProperty("--header-edge-height", `${edgeHeight}px`);
      header.style.setProperty("--header-edge-scale", edgeHeight);
    }
  }
  if (header.dataset.surface !== surface) header.dataset.surface = surface;
};
let headerFrame;
const scheduleHeaderSync = () => {
  if (headerFrame) return;
  headerFrame = window.requestAnimationFrame(() => {
    headerFrame = null;
    syncHeader();
  });
};

if (document.querySelector("#about") && "ResizeObserver" in window) {
  const aboutHeaderObserver = new ResizeObserver(() => {
    if (header.classList.contains("is-scrolled") && window.innerWidth > 1024) {
      document.documentElement.style.setProperty("--about-header-height", `${header.getBoundingClientRect().height}px`);
    }
  });
  aboutHeaderObserver.observe(header, { box: "border-box" });
}

const siteFooter = document.querySelector(".site-footer");
if (document.querySelector("#contact") && siteFooter && "ResizeObserver" in window) {
  const footerObserver = new ResizeObserver(() => {
    document.documentElement.style.setProperty("--site-footer-height", `${siteFooter.getBoundingClientRect().height}px`);
  });
  footerObserver.observe(siteFooter, { box: "border-box" });
}

const closePanel = (panel, trigger, instant = false) => {
  if (!panel || panel.hidden) return;
  window.clearTimeout(panelCloseTimers.get(panel));

  trigger?.setAttribute("aria-expanded", "false");
  trigger?.closest(".service-card")?.classList.remove("is-active");

  if (instant || reducedMotionQuery.matches) {
    panel.hidden = true;
    panel.classList.remove("is-visible", "is-closing");
    return;
  }

  panel.classList.remove("is-visible");
  panel.classList.add("is-closing");

  panelCloseTimers.set(panel, window.setTimeout(() => {
    panel.hidden = true;
    panel.classList.remove("is-closing");
  }, 200));
};

const isServiceTrigger = (trigger) => trigger?.classList.contains("card-trigger");

const placeServicePanel = (panel, trigger) => {
  if (!panel || !trigger || !isServiceTrigger(trigger)) return;

  if (mobilePanelQuery.matches) {
    trigger.closest(".service-card")?.insertAdjacentElement("afterend", panel);
    return;
  }

  servicePanelHome?.append(panel);
};

const openPanel = (panel, trigger) => {
  if (!panel || !trigger) return;

  const regionPanels = document.querySelectorAll('.service-panels [data-panel], .service-grid [data-panel]');

  regionPanels.forEach((otherPanel) => {
    if (otherPanel !== panel) {
      const otherTrigger = document.querySelector(`[data-panel-trigger="${otherPanel.dataset.panel}"]`);
      closePanel(otherPanel, otherTrigger, true);
    }
  });

  placeServicePanel(panel, trigger);
  window.clearTimeout(panelCloseTimers.get(panel));
  panel.hidden = false;
  panel.classList.remove("is-closing");
  panel.classList.add("is-visible");
  trigger.setAttribute("aria-expanded", "true");
  trigger.closest(".service-card")?.classList.add("is-active");

  if (isServiceTrigger(trigger) && mobilePanelQuery.matches) {
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({ block: "nearest", behavior: reducedMotionQuery.matches ? "instant" : "smooth" });
    });
  }

};

let servicesOpenedByHover = false;
const syncServicesNavPosition = () => {
  if (!servicesNav || mobilePanelQuery.matches) return;
  const offset = header.getBoundingClientRect().bottom - servicesNav.getBoundingClientRect().bottom + 4;
  servicesNav.style.setProperty("--services-nav-offset", `${offset}px`);
};
const setServicesNavOpen = (open, fromHover = false) => {
  if (!servicesNavToggle || !servicesNavMenu) return;
  if (open) syncServicesNavPosition();
  servicesOpenedByHover = open && fromHover;
  servicesNavToggle.setAttribute("aria-expanded", String(open));
  servicesNavMenu.hidden = !open;
};
if (servicesNav) {
  if ("ResizeObserver" in window) new ResizeObserver(syncServicesNavPosition).observe(header);
  window.addEventListener("resize", syncServicesNavPosition);
  if (document.body.classList.contains("pricing-page")) servicesNavToggle.setAttribute("aria-current", "page");
  servicesNavToggle.addEventListener("click", () => {
    setServicesNavOpen(servicesOpenedByHover || servicesNavToggle.getAttribute("aria-expanded") !== "true");
  });
  servicesNavToggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setServicesNavOpen(true);
      const links = servicesNavMenu.querySelectorAll("a");
      links[event.key === "ArrowDown" ? 0 : links.length - 1].focus();
    }
  });
  servicesNav.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      setServicesNavOpen(false);
      servicesNavToggle.focus();
    }
  });
  servicesNav.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse" && !mobilePanelQuery.matches) setServicesNavOpen(true, true);
  });
  servicesNav.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse" && !servicesNav.contains(document.activeElement)) setServicesNavOpen(false);
  });
  servicesNav.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!servicesNav.contains(document.activeElement)) setServicesNavOpen(false);
    });
  });
  document.addEventListener("click", (event) => {
    if (!servicesNav.contains(event.target)) setServicesNavOpen(false);
  });
  mobilePanelQuery.addEventListener("change", () => setServicesNavOpen(false));
}

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  if (!isOpen) setServicesNavOpen(false);
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    if (headerSections.length && sectionNavLinks.includes(event.target)) {
      setActiveSection(event.target.hash.slice(1));
    }
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
    setServicesNavOpen(false);
  }
});

panelTriggers.forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const panel = document.querySelector(`[data-panel="${trigger.dataset.panelTrigger}"]`);
    const isOpen = trigger.getAttribute("aria-expanded") === "true";

    if (isOpen) {
      closePanel(panel, trigger);
      return;
    }

    openPanel(panel, trigger);
  });
});

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-panel-close]");

  if (!closeButton) return;

  const panel = closeButton.closest("[data-panel]");
  const trigger = document.querySelector(`[data-panel-trigger="${panel?.dataset.panel}"]`);
  trigger?.focus({ preventScroll: true });
  closePanel(panel, trigger);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const panel = event.target.closest?.("[data-panel]");
  if (!panel) return;
  const trigger = document.querySelector(`[data-panel-trigger="${panel.dataset.panel}"]`);
  trigger?.focus({ preventScroll: true });
  closePanel(panel, trigger);
});

const selectEnquiry = (value) => {
  const legacyInterests = {
    "Brand & Customer Experience Review": "First Impressions & Brand Review",
    "Brand & Growth Implementation": "Brand Building Projects",
  };
  const interest = legacyInterests[value] || value;
  if (enquirySelect && Array.from(enquirySelect.options).some((option) => option.value === interest)) {
    enquirySelect.value = interest;
  }
};

selectEnquiry(new URLSearchParams(window.location.search).get("interest"));

enquiryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const enquiryType = link.dataset.enquiry;

    selectEnquiry(enquiryType);
  });
});

enquiryForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const submitButton = enquiryForm.querySelector("[type='submit']");
  const formData = new FormData(enquiryForm);

  submitButton.disabled = true;
  formSuccess?.classList.remove("is-visible");

  try {
    await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString(),
    });

    formSuccess?.classList.add("is-visible");
    formSuccess?.focus();
  } finally {
    submitButton.disabled = false;
  }
});

mobilePanelQuery.addEventListener("change", () => {
  panelTriggers.forEach((trigger) => {
    const panel = document.getElementById(trigger.getAttribute("aria-controls"));
    placeServicePanel(panel, trigger);
  });
});

window.addEventListener("scroll", scheduleHeaderSync, { passive: true });
window.addEventListener("resize", scheduleHeaderSync);
window.addEventListener("load", scheduleHeaderSync);
document.querySelectorAll(".about-background img, .approach-background img").forEach((image) => {
  image.addEventListener("load", scheduleHeaderSync);
});
document.fonts.ready.then(scheduleHeaderSync);
syncHeader();

const signatureOfferSummaries = document.querySelectorAll(
  "#brand-customer-experience-review > summary, #brand-growth-diagnostic > summary, #ongoing-strategic-partnership > summary"
);
signatureOfferSummaries.forEach((summary) => {
  const restoreFocusIndicator = () => summary.classList.remove("is-link-arrival");
  summary.addEventListener("blur", restoreFocusIndicator);
  summary.addEventListener("keydown", restoreFocusIndicator);
});

const revealPricingOffer = () => {
  const offer = document.getElementById(window.location.hash.slice(1));
  if (!offer?.matches("details.pricing-offer")) return;
  offer.open = true;
  window.requestAnimationFrame(() => {
    const summary = offer.querySelector("summary");
    if ([...signatureOfferSummaries].includes(summary)) summary.classList.add("is-link-arrival");
    summary.focus({ preventScroll: true });
    summary.scrollIntoView({ block: "start", behavior: "instant" });
  });
};

window.addEventListener("hashchange", revealPricingOffer);
window.addEventListener("load", revealPricingOffer);
document.fonts.ready.then(revealPricingOffer);

const settleApproachAnchor = async () => {
  if (window.location.hash !== "#approach") return;
  await document.fonts.ready;
  let settleTimer;
  let remainingChecks = 12;
  let stableChecks = 0;
  const userEvents = ["wheel", "touchstart", "keydown", "pointerdown"];
  const cancelAlignment = () => {
    window.clearTimeout(settleTimer);
    window.removeEventListener("scroll", scheduleAlignment);
    userEvents.forEach((type) => window.removeEventListener(type, cancelAlignment));
  };
  const alignApproach = () => {
    if (window.location.hash === "#approach") {
      const approach = document.getElementById("approach");
      if (approach) {
        const top = window.scrollY + approach.getBoundingClientRect().top - header.getBoundingClientRect().bottom;
        const delta = top - window.scrollY;
        stableChecks = Math.abs(delta) < 1 ? stableChecks + 1 : 0;
        if (Math.abs(delta) >= 1) window.scrollTo({ top, behavior: "instant" });
        // Header resizing can change the viewport-sized sections above this anchor.
        if (--remainingChecks > 0 && stableChecks < 3) {
          settleTimer = window.setTimeout(alignApproach, 180);
          return;
        }
      }
    }
    cancelAlignment();
  };
  const scheduleAlignment = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(alignApproach, 180);
  };
  window.addEventListener("scroll", scheduleAlignment, { passive: true });
  userEvents.forEach((type) => window.addEventListener(type, cancelAlignment, { once: true, passive: true }));
  scheduleAlignment();
};

window.addEventListener("load", settleApproachAnchor);
window.addEventListener("hashchange", settleApproachAnchor);

const footerPanels = [...document.querySelectorAll(".footer-legal-panel")];
const footerToggles = [...document.querySelectorAll(".footer-disclosure-toggle")];
const showFooterPanel = (id) => {
  const panel = footerPanels.find((item) => item.id === id);
  if (!panel) return;
  footerPanels.forEach((item) => { item.hidden = item !== panel; });
  footerToggles.forEach((button) => button.setAttribute("aria-expanded", String(button.getAttribute("aria-controls") === id)));
  window.requestAnimationFrame(() => {
    panel.focus({ preventScroll: true });
    panel.scrollIntoView({ block: "start", behavior: reducedMotionQuery.matches ? "instant" : "smooth" });
  });
};
const closeFooterPanel = (panel) => {
  panel.hidden = true;
  const button = footerToggles.find((item) => item.getAttribute("aria-controls") === panel.id);
  button?.setAttribute("aria-expanded", "false");
  button?.focus({ preventScroll: true });
  button?.scrollIntoView({ block: "nearest", behavior: "instant" });
};
footerToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const panel = document.getElementById(button.getAttribute("aria-controls"));
    if (panel.hidden) showFooterPanel(panel.id);
    else closeFooterPanel(panel);
  });
});
footerPanels.forEach((panel) => {
  panel.querySelector("[data-footer-close]").addEventListener("click", () => closeFooterPanel(panel));
  panel.addEventListener("keydown", (event) => {
    if (event.key === "Escape") { event.preventDefault(); closeFooterPanel(panel); }
  });
});
const revealFooterDisclosure = () => showFooterPanel(window.location.hash.slice(1));

document.querySelectorAll("[data-footer-disclosure-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    window.history.pushState(null, "", link.hash);
    showFooterPanel(link.hash.slice(1));
  });
});
window.addEventListener("hashchange", revealFooterDisclosure);
window.addEventListener("load", revealFooterDisclosure);
