const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const panelTriggers = document.querySelectorAll("[data-panel-trigger]");
const servicePanelHome = document.querySelector('[data-panel-region="services"]');
const offerPanelHome = document.querySelector('[data-panel-region="offers"]');
const mobileServiceQuery = window.matchMedia("(max-width: 620px)");
const mobilePanelQuery = window.matchMedia("(max-width: 860px)");
const enquirySelect = document.querySelector("[data-enquiry-select]");
const enquiryLinks = document.querySelectorAll("[data-enquiry]");
const enquiryForm = document.querySelector("[data-form]");
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

const isServiceTrigger = (trigger) => trigger?.classList.contains("card-trigger");
const isOfferTrigger = (trigger) => trigger?.classList.contains("offer-trigger");

const placeServicePanel = (panel, trigger) => {
  if (!panel || !trigger || !isServiceTrigger(trigger)) return;

  if (mobilePanelQuery.matches) {
    trigger.closest(".service-card")?.insertAdjacentElement("afterend", panel);
    return;
  }

  servicePanelHome?.append(panel);
};

const placeOfferPanel = (panel, trigger) => {
  if (!panel || !trigger || !isOfferTrigger(trigger)) return;

  if (mobilePanelQuery.matches) {
    trigger.closest(".expandable-offer, .partnership-card")?.insertAdjacentElement("afterend", panel);
    return;
  }

  offerPanelHome?.append(panel);
};

const openPanel = (panel, trigger) => {
  if (!panel || !trigger) return;

  const regionSelector = isServiceTrigger(trigger)
    ? '.service-panels [data-panel], .service-grid [data-panel]'
    : '.offer-panels [data-panel], .offer-section > [data-panel]';
  const regionPanels = document.querySelectorAll(regionSelector);

  regionPanels.forEach((otherPanel) => {
    if (otherPanel !== panel) {
      const otherTrigger = document.querySelector(`[data-panel-trigger="${otherPanel.dataset.panel}"]`);
      closePanel(otherPanel, otherTrigger, true);
    }
  });

  placeServicePanel(panel, trigger);
  placeOfferPanel(panel, trigger);
  panel.hidden = false;
  panel.classList.remove("is-closing");
  panel.classList.add("is-visible");
  trigger.setAttribute("aria-expanded", "true");
  trigger.closest(".service-card, .expandable-offer")?.classList.add("is-active");

  if (isServiceTrigger(trigger) && mobilePanelQuery.matches) {
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

  if (isOfferTrigger(trigger) && mobilePanelQuery.matches) {
    window.requestAnimationFrame(() => {
      panel.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }
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

document.addEventListener("click", (event) => {
  const closeButton = event.target.closest("[data-panel-close]");

  if (!closeButton) return;

  const panel = closeButton.closest("[data-panel]");
  const trigger = document.querySelector(`[data-panel-trigger="${panel?.dataset.panel}"]`);
  closePanel(panel, trigger);
});

enquiryLinks.forEach((link) => {
  link.addEventListener("click", () => {
    const enquiryType = link.dataset.enquiry;

    if (enquirySelect && enquiryType) {
      enquirySelect.value = enquiryType;
    }
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
  document.querySelectorAll(".service-grid [data-panel]").forEach((panel) => {
    servicePanelHome?.append(panel);
  });
  document.querySelectorAll(".offer-section > [data-panel]").forEach((panel) => {
    offerPanelHome?.append(panel);
  });
});

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();
