/* =========================================================
   Portfolio JS (minimal)
   - Menu mobile
   - Fade-in au scroll (IntersectionObserver)
   - Copier email
   - Modals projets
   ========================================================= */

(function () {
  const navToggle = document.querySelector(".nav-toggle");
  const navMenu = document.querySelector("#nav-menu");
  const navLinks = document.querySelectorAll(".nav-links a");

  // --- Menu mobile
  const setMenuOpen = (open) => {
    if (!navMenu || !navToggle) return;
    navMenu.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.contains("open");
      setMenuOpen(!isOpen);
    });

    // Fermer le menu si on clique un lien
    navLinks.forEach((a) => {
      a.addEventListener("click", () => setMenuOpen(false));
    });

    // Fermer le menu si on clique hors du menu (mobile)
    document.addEventListener("click", (e) => {
      const target = e.target;
      const clickedInside =
        navMenu.contains(target) || navToggle.contains(target);
      if (!clickedInside) setMenuOpen(false);
    });

    // Fermer avec Esc
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    });
  }

  // --- Fade-in au scroll (reveal)
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealEls.forEach((el) => io.observe(el));
  } else {
    // Fallback: si le navigateur ne supporte pas IO
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // --- Copier email
  const copyBtn = document.getElementById("copy-email");
  const copyStatus = document.getElementById("copy-status");

  const setStatus = (msg) => {
    if (!copyStatus) return;
    copyStatus.textContent = msg;
    if (msg) {
      window.clearTimeout(setStatus._t);
      setStatus._t = window.setTimeout(() => {
        copyStatus.textContent = "";
      }, 2500);
    }
  };

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const email = copyBtn.getAttribute("data-email");
      if (!email) return;

      try {
        await navigator.clipboard.writeText(email);
        setStatus("Email copié dans le presse-papiers.");
      } catch (err) {
        // Fallback: sélection + execCommand
        const tmp = document.createElement("input");
        tmp.value = email;
        document.body.appendChild(tmp);
        tmp.select();
        try {
          document.execCommand("copy");
          setStatus("Email copié dans le presse-papiers.");
        } catch (e) {
          setStatus("Impossible de copier. Vous pouvez sélectionner l’email manuellement.");
        } finally {
          document.body.removeChild(tmp);
        }
      }
    });
  }

  // --- Modals projets
  const modalButtons = document.querySelectorAll("[data-modal]");
  const closeButtons = document.querySelectorAll("[data-close]");

  const openModal = (key) => {
    const dialog = document.getElementById(`modal-${key}`);
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  };

  const closeModal = (dialog) => {
    if (dialog && typeof dialog.close === "function") dialog.close();
  };

  modalButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-modal");
      if (!key) return;
      openModal(key);
    });
  });

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const dialog = btn.closest("dialog");
      closeModal(dialog);
    });
  });

  // Fermer modal en cliquant sur le backdrop
  document.querySelectorAll("dialog.modal").forEach((dialog) => {
    dialog.addEventListener("click", (e) => {
      const rect = dialog.getBoundingClientRect();
      const clickedInDialog =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      // Si click hors de la zone => close
      if (!clickedInDialog) closeModal(dialog);
    });
  });

  // --- Année footer
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

// ===== Typewriter Effect =====
document.addEventListener("DOMContentLoaded", () => {
  const text = "Bonjour, je suis Essi";
  const el = document.getElementById("typewriter");

  if (!el) return;

  let index = 0;
  let cursorVisible = true;

  // Création du curseur
  const cursor = document.createElement("span");
  cursor.textContent = "|";
  cursor.style.color = "var(--accent)";
  cursor.style.marginLeft = "6px";
  el.appendChild(cursor);

  function typeWriter() {
    if (index < text.length) {
      el.insertBefore(document.createTextNode(text.charAt(index)), cursor);
      index++;
      setTimeout(typeWriter, 70);
    } else {
      // Stop clignotement après écriture
      setTimeout(() => {
        cursor.remove(); // 🔥 suppression définitive
      }, 500);
    }
  }

  // Effet clignotement
  const blink = setInterval(() => {
    if (index < text.length) {
      cursor.style.opacity = cursorVisible ? "0" : "1";
      cursorVisible = !cursorVisible;
    } else {
      clearInterval(blink);
    }
  }, 500);

  typeWriter();
});

