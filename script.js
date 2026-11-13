const body = document.body;
const themeToggle = document.getElementById("themeToggle");
const menuToggle = document.getElementById("menuToggle");
const desktopNav = document.querySelector(".desktop-nav");
const progress = document.getElementById("readingProgress");
const toTop = document.getElementById("toTop");

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark");
  const isDark = body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀" : "☾";
  localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
});
if (localStorage.getItem("portfolio-theme") === "dark") {
  body.classList.add("dark");
  themeToggle.textContent = "☀";
}
menuToggle.addEventListener("click", () => {
  desktopNav.classList.toggle("open");
  menuToggle.textContent = desktopNav.classList.contains("open") ? "×" : "☰";
});
desktopNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  desktopNav.classList.remove("open");
  menuToggle.textContent = "☰";
}));

function updateScrollUI() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const percent = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progress.style.width = percent + "%";
  toTop.classList.toggle("visible", window.scrollY > 500);
}
window.addEventListener("scroll", updateScrollUI, { passive: true });
updateScrollUI();
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

const sections = [...document.querySelectorAll("main section[id]")];
const sideLinks = [...document.querySelectorAll(".side-link")];
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      sideLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-25% 0px -60% 0px" });
sections.forEach(section => observer.observe(section));

/* Lightbox works automatically for images added inside .evidence-placeholder or .about-photo */
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
function openLightbox(src, alt) {
  lightboxImage.src = src;
  lightboxImage.alt = alt || "Ảnh minh chứng";
  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
}
document.addEventListener("click", event => {
  const image = event.target.closest(".evidence-placeholder img, .about-photo img");
  if (image) openLightbox(image.src, image.alt);
});
function closeLightbox() {
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  lightboxImage.src = "";
}
document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
document.addEventListener("keydown", event => { if (event.key === "Escape") closeLightbox(); });

/* If you add an image but its path is wrong, keep the designed placeholder visible. */
document.querySelectorAll("[data-image-slot]").forEach(slot => {
  const img = slot.querySelector("img");
  if (!img) return;
  img.addEventListener("error", () => slot.classList.add("image-missing"));
  img.addEventListener("load", () => slot.classList.add("has-image"));
});
