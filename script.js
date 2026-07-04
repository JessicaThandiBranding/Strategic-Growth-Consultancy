const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const panelTriggers = document.querySelectorAll("[data-panel-trigger]");
const panelRegions = document.querySelectorAll("[data-panel-region]");
const enquirySelect = document.querySelector("[data-enquiry-select]");
const enquiryLinks = document.querySelectorAll("[data-enquiry]");
const formSuccess = document.querySelector("[data-form-success]");

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

const closePanel = (panel, trigger, instant = false) => {
  if (!panel || panel.hidden) return;

  trigger?.setAttribute("aria-expanded", "false");
  trigger?.closest(".service-card, .expandable-offer")?.classList.remove("is-active");

  if (instant) {
    panel.hidden = true;
    panel.classList.remove("is-visible", "is-closing");
    return;
  }

  panel.classList.remove("is-visible");
  panel.classList.add("is-closing");

  window.setTimeout(() => {
    panel.hidden = true;
    panel.classList.remove("is-closing");
  }, 200);
};

const openPanel = (panel, trigger) => {
  if (!panel || !trigger) return;

  const region = panel.closest("[data-panel-region]");
  const regionPanels = region?.querySelectorAll("[data-panel]") || [];

  regionPanels.forEach((otherPanel) => {
    if (otherPanel !== panel) {
      const otherTrigger = document.querySelector(`[data-panel-trigger="${otherPanel.dataset.panel}"]`);
      closePanel(otherPanel, otherTrigger, true);
    }
  });

  panel.hidden = false;
  panel.classList.remove("is-closing");
  panel.classList.add("is-visible");
  trigger.setAttribute("aria-expanded", "true");
  trigger.closest(".service-card, .expandable-offer")?.classList.add("is-active");
};

toggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(isOpen));
  toggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation");
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

panelRegions.forEach((region) => {
  region.addEventListener("click", (event) => {
    const closeButton = event.target.closest("[data-panel-close]");

    if (!closeButton) return;

    const panel = closeButton.closest("[data-panel]");
    const trigger = document.querySelector(`[data-panel-trigger="${panel?.dataset.panel}"]`);
    closePanel(panel, trigger);
  });
});

enquiryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const enquiryType = link.dataset.enquiry;

    if (enquirySelect && enquiryType) {
      enquirySelect.value = enquiryType;
    }
  });
});

if (formSuccess && new URLSearchParams(window.location.search).get("success") === "true") {
  formSuccess.classList.add("is-visible");
  formSuccess.focus();
}

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
