const header = document.querySelector("[data-header]");
const toggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const serviceCards = document.querySelectorAll("[data-service-card]");
const enquirySelect = document.querySelector("[data-enquiry-select]");
const enquiryLinks = document.querySelectorAll("[data-enquiry]");
const formSuccess = document.querySelector("[data-form-success]");

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
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

window.addEventListener("scroll", syncHeader, { passive: true });
syncHeader();

serviceCards.forEach((card) => {
  card.addEventListener("toggle", () => {
    if (!card.open) return;

    serviceCards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.open = false;
      }
    });
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
