/* =========================================================
   Portfolio JS — Essi Ballogou (redesign)
   - Canvas particules dorées
   - Menu mobile
   - Reveal au scroll
   - Carrousel drag + boutons + dots
   - Copier email
   - Modals
   - Voir plus
   - Année footer
   ========================================================= */

(function () {

  /* =====================================================
     CANVAS — Particules dorées
  ===================================================== */
  const canvas = document.getElementById('bg-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const mouse = { x: W / 2, y: H / 2 };
    const COUNT = 90;
    const ATTRACT = 0.028;
    const FRICTION = 0.90;
    const MAX_DIST = 160;
    const CONNECT = 90;

    const rnd = (a, b) => a + Math.random() * (b - a);

    const COLORS = [
      'rgba(201,168,76,',
      'rgba(228,200,122,',
      'rgba(124,92,191,',
    ];

    class Particle {
      reset() {
        this.x = rnd(0, W); this.y = rnd(0, H);
        this.vx = rnd(-0.3, 0.3); this.vy = rnd(-0.3, 0.3);
        this.size = rnd(1.5, 3.5);
        this.baseAlpha = rnd(0.2, 0.6);
        this.alpha = this.baseAlpha;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      }
      constructor() { this.reset(); }
      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const f = (MAX_DIST - dist) / MAX_DIST;
          this.vx += dx * ATTRACT * f;
          this.vy += dy * ATTRACT * f;
          this.alpha = Math.min(1, this.baseAlpha + f * 0.5);
        } else {
          this.alpha = this.baseAlpha;
        }
        this.vx *= FRICTION; this.vy *= FRICTION;
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W) this.vx *= -1;
        if (this.y < 0 || this.y > H) this.vy *= -1;
        this.x = Math.max(0, Math.min(W, this.x));
        this.y = Math.max(0, Math.min(H, this.y));
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color + this.alpha + ')';
        ctx.fill();
      }
    }

    const particles = Array.from({ length: COUNT }, () => new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT) {
            const a = (1 - d / CONNECT) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${a})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      drawLines();
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    }, { passive: true });
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener('touchmove', e => {
      if (e.touches.length) { mouse.x = e.touches[0].clientX; mouse.y = e.touches[0].clientY; }
    }, { passive: true });
  }

  /* =====================================================
     MENU MOBILE
  ===================================================== */
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('nav-menu');

  const setMenu = open => {
    if (!menu || !toggle) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  };

  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    document.querySelectorAll('.nav-links a').forEach(a => a.addEventListener('click', () => setMenu(false)));
    document.addEventListener('click', e => {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  }

  /* =====================================================
     REVEAL AU SCROLL
  ===================================================== */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* =====================================================
     CARROUSEL
  ===================================================== */
  const track = document.getElementById('projects-track');
  const dotsWrap = document.getElementById('track-dots');
  const prevBtn = document.getElementById('track-prev');
  const nextBtn = document.getElementById('track-next');

  if (track) {
    const cards = track.querySelectorAll('.proj-card');
    const GAP = 20;
    let dots = [];

    if (dotsWrap) {
      cards.forEach((_, i) => {
        const d = document.createElement('button');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', `Projet ${i + 1}`);
        d.addEventListener('click', () => scrollTo(i));
        dotsWrap.appendChild(d);
        dots.push(d);
      });
    }

    const scrollTo = i => {
      if (!cards[i]) return;
      const w = cards[0].offsetWidth + GAP;
      track.scrollTo({ left: i * w, behavior: 'smooth' });
    };

    const updateDots = () => {
      const w = cards[0].offsetWidth + GAP;
      const i = Math.round(track.scrollLeft / w);
      dots.forEach((d, j) => d.classList.toggle('active', j === i));
    };

    track.addEventListener('scroll', updateDots, { passive: true });

    if (prevBtn) prevBtn.addEventListener('click', () => {
      const w = cards[0].offsetWidth + GAP;
      scrollTo(Math.max(0, Math.round(track.scrollLeft / w) - 1));
    });
    if (nextBtn) nextBtn.addEventListener('click', () => {
      const w = cards[0].offsetWidth + GAP;
      scrollTo(Math.min(cards.length - 1, Math.round(track.scrollLeft / w) + 1));
    });

    // Drag
    let dragging = false, startX = 0, startScroll = 0;
    track.addEventListener('mousedown', e => {
      dragging = true; startX = e.pageX; startScroll = track.scrollLeft;
      track.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', e => {
      if (!dragging) return;
      track.scrollLeft = startScroll - (e.pageX - startX);
    });
    document.addEventListener('mouseup', () => { dragging = false; track.style.userSelect = ''; });
  }

  /* =====================================================
     COPIER EMAIL
  ===================================================== */
  const copyBtn = document.getElementById('copy-email');
  const copyStatus = document.getElementById('copy-status');
  if (copyBtn && copyStatus) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyStatus.textContent = '✓ Email copié';
      } catch {
        try {
          const tmp = document.createElement('input');
          tmp.value = email;
          document.body.appendChild(tmp); tmp.select();
          document.execCommand('copy');
          document.body.removeChild(tmp);
          copyStatus.textContent = '✓ Email copié';
        } catch { copyStatus.textContent = 'Impossible de copier'; }
      }
      clearTimeout(copyBtn._t);
      copyBtn._t = setTimeout(() => { copyStatus.textContent = ''; }, 3000);
    });
  }

  /* =====================================================
     MODALS
  ===================================================== */
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = document.getElementById(`modal-${btn.dataset.modal}`);
      if (d?.showModal) d.showModal();
    });
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('dialog')?.close());
  });
  document.querySelectorAll('dialog.modal').forEach(d => {
    d.addEventListener('click', e => {
      const r = d.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') d.close(); });
  });

  /* =====================================================
     VOIR PLUS
  ===================================================== */
  const vpBtn = document.getElementById('voir-plus-btn');
  const vpLabel = document.getElementById('voir-plus-label');
  const vpIcon = document.getElementById('voir-plus-icon');
  const vpMore = document.getElementById('projects-more');

  if (vpBtn && vpMore) {
    vpBtn.addEventListener('click', () => {
      const open = !vpMore.classList.contains('hidden');
      if (open) {
        vpMore.classList.add('hidden');
        vpLabel.textContent = 'Voir tous les projets';
        vpBtn.classList.remove('open');
      } else {
        vpMore.classList.remove('hidden');
        vpLabel.textContent = 'Voir moins';
        vpBtn.classList.add('open');
        vpMore.querySelectorAll('.reveal:not(.is-visible)').forEach(el => {
          setTimeout(() => el.classList.add('is-visible'), 60);
        });
      }
    });
  }

  /* =====================================================
     ANNÉE FOOTER
  ===================================================== */
  const yr = document.getElementById('year');
  if (yr) yr.textContent = String(new Date().getFullYear());
const titleEl = document.getElementById('hero-typewriter');
if (titleEl) {
  const parts = [
    { text: 'je suis ', em: false },
    { text: 'Essi', em: true },
  ];
  const fullText = parts.map(p => p.text).join('');
  let i = 0;

  const cursor = document.createElement('span');
  cursor.textContent = '|';
  cursor.style.cssText = 'color:var(--gold);margin-left:2px;animation:tw-blink 0.9s step-end infinite;display:inline-block;';
  const s = document.createElement('style');
  s.textContent = '@keyframes tw-blink{0%,100%{opacity:1}50%{opacity:0}}';
  document.head.appendChild(s);
  titleEl.appendChild(cursor);

  const type = () => {
    if (i < fullText.length) {
      const char = fullText.charAt(i);
      // On est dans la partie "Essi" ?
      const offset = parts[0].text.length;
      const node = document.createTextNode(char);
      if (i >= offset) {
        const em = titleEl.querySelector('em') || (() => {
          const e = document.createElement('em');
          titleEl.insertBefore(e, cursor);
          return e;
        })();
        em.appendChild(node);
      } else {
        titleEl.insertBefore(node, cursor);
      }
      i++;
      setTimeout(type, 100);
    } else {

    }
  };

  setTimeout(type, 600);
}

})();