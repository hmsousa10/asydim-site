'use strict';

/* ---- NAVBAR scroll ---- */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

/* ---- HAMBURGER / MOBILE DRAWER ---- */
const hamburger   = document.getElementById('hamburger');
const mobileDrawer = document.getElementById('mobile-drawer');
const backdrop    = document.getElementById('nav-backdrop');
const drawerClose = document.getElementById('drawer-close');
const drawerCta   = document.getElementById('btn-drawer-cta');

function openDrawer() {
  mobileDrawer?.classList.add('open');
  backdrop?.classList.add('open');
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileDrawer?.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  mobileDrawer?.classList.remove('open');
  backdrop?.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileDrawer?.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', () => {
  mobileDrawer?.classList.contains('open') ? closeDrawer() : openDrawer();
});
drawerClose?.addEventListener('click', closeDrawer);
backdrop?.addEventListener('click', closeDrawer);
drawerCta?.addEventListener('click', closeDrawer);

// close drawer links
mobileDrawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

/* ---- SMOOTH SCROLL ---- */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 16, behavior: 'smooth' });
  });
});

/* ---- CAROUSEL ---- */
(function initCarousel() {
  const track   = document.getElementById('carousel-track');
  const slides  = track ? [...track.querySelectorAll('.carousel-slide')] : [];
  if (!slides.length) return;

  const tagEl   = document.getElementById('car-tag');
  const titleEl = document.getElementById('car-title');
  const countEl = document.getElementById('car-count');
  const dots    = [...document.querySelectorAll('.car-dot')];
  const total   = slides.length;
  let current   = 0;
  let autoTimer;

  let isAnimating = false;

  function goTo(idx) {
    if (isAnimating) return; // Prevents clicking arrows too fast
    isAnimating = true;

    current = (idx + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // update caption with fade
    [tagEl, titleEl].forEach(el => { if (el) el.style.opacity = '0'; });
    setTimeout(() => {
      const sl = slides[current];
      if (tagEl)   tagEl.textContent   = sl.dataset.tag   || '';
      if (titleEl) titleEl.textContent = sl.dataset.title || '';
      [tagEl, titleEl].forEach(el => { if (el) el.style.opacity = '1'; });
    }, 220);

    // update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === current));

    // Unlock after CSS transition finishes
    setTimeout(() => { isAnimating = false; }, 500);
  }

  document.getElementById('car-prev')?.addEventListener('click', () => { goTo(current - 1); resetAuto(); });
  document.getElementById('car-next')?.addEventListener('click', () => { goTo(current + 1); resetAuto(); });
  dots.forEach(d => d.addEventListener('click', () => { goTo(+d.dataset.idx); resetAuto(); }));

  // keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft')  { goTo(current - 1); resetAuto(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); resetAuto(); }
  });

  // Swipe & Mouse Drag support
  let touchStartX = 0;
  let touchEndX = 0;
  let isDragging = false;
  
  function handleDragStart(x) {
    touchStartX = x;
    isDragging = true;
    clearInterval(autoTimer); // Pause auto-play during interaction
  }

  function handleDragEnd(x) {
    if (!isDragging) return;
    isDragging = false;
    touchEndX = x;
    const swipeThreshold = 40; // Snap limit
    if (touchEndX < touchStartX - swipeThreshold) {
      goTo(current + 1);
    } else if (touchEndX > touchStartX + swipeThreshold) {
      goTo(current - 1);
    }
    resetAuto(); // Restart auto-play
  }

  // Touch
  track.addEventListener('touchstart', e => handleDragStart(e.changedTouches[0].screenX), { passive: true });
  track.addEventListener('touchend', e => handleDragEnd(e.changedTouches[0].screenX), { passive: true });

  // Mouse
  track.addEventListener('mousedown', e => {
    e.preventDefault(); // Prevents default image drag
    handleDragStart(e.screenX);
  });
  track.addEventListener('mouseup', e => handleDragEnd(e.screenX));
  track.addEventListener('mouseleave', e => handleDragEnd(e.screenX));

  // auto-play
  function startAuto() { 
    clearInterval(autoTimer); // FIX: prevent duplicate timers
    autoTimer = setInterval(() => goTo(current + 1), 3000); 
  }
  function resetAuto() { 
    clearInterval(autoTimer); 
    startAuto(); 
  }
  const carousel = document.getElementById('proj-carousel');
  carousel?.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carousel?.addEventListener('mouseleave', startAuto);

  // caption fade transition
  [tagEl, titleEl, countEl].forEach(el => {
    if (el) el.style.transition = 'opacity .25s ease';
  });

  startAuto();
})();

/* ---- PARCEIROS TICKER — duplicate items for seamless loop ---- */
(function initParceiros() {
  const track = document.getElementById('parceiros-track');
  if (!track) return;
  // Clone all items and append to create the seamless loop (CSS animates to -50%)
  const items = [...track.children];
  items.forEach(item => track.appendChild(item.cloneNode(true)));
})();

/* ---- REVEAL on scroll (all devices) ---- */
// section headings & text blocks
document.querySelectorAll('.section-title, .eyebrow, .section-sub, .sobre-img-wrap, .sobre-text, .contacto-info, .contacto-form').forEach(el => {
  el.classList.add('reveal', 'reveal--up');
});

// cards — staggered by column index
document.querySelectorAll('.cards-grid .card').forEach((el, i) => {
  el.classList.add('reveal', 'reveal--up');
  el.dataset.revealDelay = String(i % 3);
});

// legacy items alternate left/right
document.querySelectorAll('.legacy-item').forEach((el, i) => {
  el.classList.add('reveal', i % 2 === 0 ? 'reveal--left' : 'reveal--right');
});

// generic elements
document.querySelectorAll('.gal-item, .value-item, .proj-card').forEach(el => {
  el.classList.add('reveal', 'reveal--up');
});

const ro = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const sibIdx = el.dataset.revealDelay != null
      ? +el.dataset.revealDelay
      : [...(el.parentElement?.children ?? [])].indexOf(el);
    el.style.transitionDelay = Math.min(sibIdx * 80, 400) + 'ms';
    el.classList.add('visible');
    ro.unobserve(el);
  });
}, { threshold: 0.08 });
document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

/* ---- CARD tilt (desktop) / touch bounce (mobile) ---- */
if (window.matchMedia('(hover:hover)').matches) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - .5;
      const y = (e.clientY - r.top)  / r.height - .5;
      card.style.transform = `translateY(-7px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
} else {
  // touch: brief bounce on tap
  document.querySelectorAll('.card, .legacy-item').forEach(el => {
    el.addEventListener('touchstart', function() {
      this.classList.add('touch-active');
    }, { passive: true });
    el.addEventListener('touchend', function() {
      const self = this;
      setTimeout(() => self.classList.remove('touch-active'), 350);
    }, { passive: true });
  });
}

/* ---- CONTACT FORM (EmailJS) ---- */
// ⚠️ IMPORTANTE: Substituir estas chaves pelas do teu projeto no EmailJS
const EMAILJS_PUBLIC_KEY  = 'ATbBV3ublLsher5vQ';
const EMAILJS_SERVICE_ID  = 'service_npv01jw';
const EMAILJS_TEMPLATE_ID = 'template_dntddbg';

const form = document.getElementById('contact-form');
const succ = document.getElementById('form-success');
if (form) {
  // Inicializar o EmailJS se o script estiver carregado
  if (typeof emailjs !== 'undefined') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome  = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validação básica
    if (!nome || !email) {
      [document.getElementById('nome'), document.getElementById('email')].forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = '#e07a7a';
          setTimeout(() => { f.style.borderColor = ''; }, 2000);
        }
      });
      return;
    }

    const btn = document.getElementById('btn-submit');
    btn.textContent = 'A enviar...'; 
    btn.style.opacity = '.7'; 
    btn.disabled = true;

    // Verificar se a biblioteca EmailJS falhou no carregamento
    if (typeof emailjs === 'undefined') {
      alert("Aviso: Falha ao carregar o serviço de emails (EmailJS). Verifique a sua internet ou o bloqueador de anúncios.");
      btn.textContent = 'Enviar Mensagem'; btn.style.opacity = '1'; btn.disabled = false;
      return;
    }

    // Enviar o formulário usando EmailJS
    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(() => {
        form.reset();
        btn.textContent = 'Enviado ✓'; btn.style.opacity = '1';
        if (succ) succ.style.display = 'block';
        setTimeout(() => {
          btn.textContent = 'Enviar Mensagem'; btn.disabled = false;
          if (succ) succ.style.display = 'none';
        }, 4000);
      })
      .catch((error) => {
        console.error('Falha no envio de email:', error);
        alert('Ocorreu um erro ao enviar a mensagem. Por favor, confirme as chaves do EmailJS ou tente novamente mais tarde.');
        btn.textContent = 'Enviar Mensagem'; btn.style.opacity = '1'; btn.disabled = false;
      });
  });
}

/* ---- PARALLAX MOUSE EFFECT FOR 3D ORBS ---- */
document.addEventListener('mousemove', (e) => {
  const orbs = document.querySelectorAll('.parallax-wrap');
  if (orbs.length === 0) return;
  
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;
  
  orbs.forEach((orb) => {
    const speed = parseFloat(orb.getAttribute('data-speed'));
    const x = ((mouseX - centerX) * speed) / 100;
    const y = ((mouseY - centerY) * speed) / 100;
    orb.style.transform = `translate(${x}px, ${y}px)`;
  });
});

/* ---- 3D VANTA NET INITIALIZATION ---- */
document.addEventListener('DOMContentLoaded', () => {
  if (window.VANTA) {
    VANTA.NET({
      el: "#vanta-bg",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x457b9d,      /* Asydim Logo Blue Nodes */
      backgroundColor: 0x05130b, /* Deep Dark Green Background */
      points: 12.00,
      maxDistance: 22.00,
      spacing: 18.00,
      showDots: true
    });
  }
});
