// WhatsApp number in international format, digits only (0986580996 -> 251986580996).
// Change this if orders should go to a different WhatsApp number.
const WHATSAPP_NUMBER = "251986580996";

function whatsappLink(item) {
  const text = item
    ? `Hello Time Coffee! I'd like to order: ${item}`
    : "Hello Time Coffee! I'd like to place an order.";
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

// Every element with data-order opens WhatsApp, prefilled with the item if one is given.
document.querySelectorAll("[data-order]").forEach((el) => {
  el.href = whatsappLink(el.dataset.order);
  el.target = "_blank";
  el.rel = "noopener";
});

// Mobile navigation toggle
const toggle = document.querySelector(".nav-toggle");
const links = document.getElementById("nav-links");
toggle.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  toggle.setAttribute("aria-expanded", String(open));
});
links.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  })
);

// Highlight the nav link for the section in view
const navMap = { menu: "#menu", favorites: "#menu", why: "#why", visit: "#visit" };
const navLinks = links.querySelectorAll("a:not(.btn)");
window.addEventListener("scroll", () => {
  let current = "#top";
  for (const id of Object.keys(navMap)) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top < 120) current = navMap[id];
  }
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === current));
  document.querySelector(".to-top").classList.toggle("show", window.scrollY > 500);
}, { passive: true });

document.getElementById("privacy-link").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Time Coffee only uses your details to prepare and deliver your order. We never sell or share your information.");
});

document.getElementById("year").textContent = new Date().getFullYear();
