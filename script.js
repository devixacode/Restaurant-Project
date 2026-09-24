document.addEventListener("DOMContentLoaded", () => {
  const header = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  // Mobile navigation
  function toggleMenu(force) {
    const open = typeof force === "boolean" ? force : !navMenu.classList.contains("open");
    navMenu.classList.toggle("open", open);
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuToggle.addEventListener("click", () => toggleMenu());

  navMenu.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => toggleMenu(false));
  });

  // Sticky navbar state
  function updateHeader() {
    header.classList.toggle("scrolled", window.scrollY > 30);
  }
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  // Scroll reveal
  const revealItems = document.querySelectorAll(".reveal:not(.hero-content)");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach(item => revealObserver.observe(item));

  // Subtle parallax for featured section
  const featureImage = document.querySelector(".feature-image");
  function updateParallax() {
    if (!featureImage) return;
    const rect = featureImage.parentElement.getBoundingClientRect();
    const viewport = window.innerHeight;
    if (rect.bottom > 0 && rect.top < viewport) {
      const progress = (viewport - rect.top) / (viewport + rect.height);
      featureImage.style.transform = `translateY(${(progress - 0.5) * 55}px)`;
    }
  }
  window.addEventListener("scroll", updateParallax, { passive: true });
  updateParallax();

  // Gallery lightbox
  const galleryItems = [...document.querySelectorAll(".gallery-item")];
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxClose = document.getElementById("lightboxClose");
  const lightboxPrev = document.getElementById("lightboxPrev");
  const lightboxNext = document.getElementById("lightboxNext");
  let currentGalleryIndex = 0;

  const galleryImages = galleryItems.map(item => ({
    src: item.querySelector("img").src,
    alt: item.querySelector("img").alt
  }));

  function showLightbox(index) {
    currentGalleryIndex = (index + galleryImages.length) % galleryImages.length;
    lightboxImage.src = galleryImages[currentGalleryIndex].src;
    lightboxImage.alt = galleryImages[currentGalleryIndex].alt;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
  }

  function nextImage() { showLightbox(currentGalleryIndex + 1); }
  function prevImage() { showLightbox(currentGalleryIndex - 1); }

  galleryItems.forEach(item => {
    item.addEventListener("click", () => showLightbox(Number(item.dataset.index)));
  });

  lightboxClose.addEventListener("click", closeLightbox);
  lightboxNext.addEventListener("click", nextImage);
  lightboxPrev.addEventListener("click", prevImage);

  lightbox.addEventListener("click", event => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", event => {
    if (!lightbox.classList.contains("open")) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowRight") nextImage();
    if (event.key === "ArrowLeft") prevImage();
  });

  // Testimonial slider
  const testimonials = [...document.querySelectorAll(".testimonial")];
  const dotsContainer = document.getElementById("sliderDots");
  const prevTestimonial = document.getElementById("testimonialPrev");
  const nextTestimonial = document.getElementById("testimonialNext");
  let testimonialIndex = 0;
  let testimonialTimer;

  testimonials.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.className = "slider-dot";
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      showTestimonial(index);
      restartTestimonialTimer();
    });
    dotsContainer.appendChild(dot);
  });

  const dots = [...dotsContainer.children];

  function showTestimonial(index) {
    testimonialIndex = (index + testimonials.length) % testimonials.length;
    testimonials.forEach((item, i) => item.classList.toggle("active", i === testimonialIndex));
    dots.forEach((dot, i) => dot.classList.toggle("active", i === testimonialIndex));
  }

  function restartTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(() => showTestimonial(testimonialIndex + 1), 5000);
  }

  prevTestimonial.addEventListener("click", () => {
    showTestimonial(testimonialIndex - 1);
    restartTestimonialTimer();
  });

  nextTestimonial.addEventListener("click", () => {
    showTestimonial(testimonialIndex + 1);
    restartTestimonialTimer();
  });

  showTestimonial(0);
  restartTestimonialTimer();

  // Reservation form validation
  const form = document.getElementById("reservationForm");
  const formMessage = document.getElementById("formMessage");
  const dateInput = form.querySelector('input[name="date"]');

  // Prevent selecting a past date.
  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString().split("T")[0];
  dateInput.min = localToday;

  form.addEventListener("submit", event => {
    event.preventDefault();
    formMessage.classList.remove("error");

    const name = form.elements.name.value.trim();
    const email = form.elements.email.value.trim();
    const date = form.elements.date.value;
    const time = form.elements.time.value;
    const guests = form.elements.guests.value;

    if (!name || !email || !date || !time || !guests) {
      formMessage.textContent = "Please complete all required fields.";
      formMessage.classList.add("error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      formMessage.textContent = "Please enter a valid email address.";
      formMessage.classList.add("error");
      return;
    }

    const selectedDate = new Date(`${date}T${time}`);
    if (Number.isNaN(selectedDate.getTime()) || selectedDate < new Date()) {
      formMessage.textContent = "Please choose a valid future date and time.";
      formMessage.classList.add("error");
      return;
    }

    formMessage.textContent = "Your reservation request has been received.";
    form.reset();
    dateInput.min = localToday;
  });

  // Current year
  document.getElementById("year").textContent = new Date().getFullYear();
});
