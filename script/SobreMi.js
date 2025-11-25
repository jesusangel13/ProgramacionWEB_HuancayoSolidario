// ========= Helpers =========
const qs = (s, root = document) => root.querySelector(s);
const qsa = (s, root = document) => Array.from(root.querySelectorAll(s));

// ========= SCROLL REVEAL + STAGGER + FADE =========
const boxObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      const children = qsa('h3, p, img, .mission-card, .stat-box, .valor-box', entry.target);
      children.forEach((child, idx) => {
        child.style.transition = `opacity .5s ease ${idx * 0.08 + 0.12}s, transform .5s cubic-bezier(.2,.9,.2,1) ${idx * 0.08 + 0.12}s`;
        child.style.opacity = 1;
        child.style.transform = 'translateY(0) scale(1)';
      });
      entry.target.style.transition = 'transform .6s ease, opacity .6s ease';
      entry.target.style.transform = 'translateY(0) scale(1)';
      entry.target.style.opacity = 1;
      boxObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.18 });

qsa('.section-box').forEach(box => {
  qsa('h3, p, img, .mission-card, .stat-box, .valor-box', box).forEach(ch => {
    ch.style.opacity = 0;
    ch.style.transform = 'translateY(10px) scale(0.96)';
  });
  box.style.opacity = 0;
  box.style.transform = 'translateY(20px) scale(0.95)';
  boxObserver.observe(box);
});

// ========= PARALLAX SUAVE INTRO + IMAGE =========
window.addEventListener('scroll', () => {
  const intro = qs('.intro');
  if (!intro) return;
  intro.style.backgroundPositionY = `${-window.scrollY * 0.08}px`;

  const img = qs('.intro-img img');
  if (img) {
    img.style.transform = `translateY(${window.scrollY * 0.04}px) scale(1.02)`;
  }
});

// ========= TILT (3D) EN TARJETAS =========
qsa('.mission-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;
    const tiltX = (dy * 8).toFixed(2);
    const tiltY = (dx * -8).toFixed(2);
    card.style.transform = `perspective(900px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-6px) scale(1.03)`;
    card.style.boxShadow = '0 18px 40px rgba(0,0,0,0.25)';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// ========= TYPEWRITER CON CURSOR =========
const titleEl = qs('.intro-title');
if (titleEl) {
  const full = titleEl.textContent.trim();
  titleEl.textContent = '';
  let pos = 0;
  const cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '|';
  titleEl.appendChild(cursor);
  function type() {
    if (pos < full.length) {
      cursor.insertAdjacentText('beforebegin', full.charAt(pos));
      pos++;
      setTimeout(type, 30 + Math.random() * 50);
    } else {
      cursor.style.opacity = '0.3';
      cursor.style.transition = 'opacity .8s ease-in-out';
      setInterval(() => {
        cursor.style.opacity = cursor.style.opacity === '0.3' ? '1' : '0.3';
      }, 600);
    }
  }
  setTimeout(type, 300);
}

// ========= CONTADORES SUAVES =========
qsa('.stat-box').forEach((box) => {
  const target = parseInt(box.getAttribute('data-target') || '0', 10);
  if (target > 0) {
    const num = document.createElement('div');
    num.className = 'counter';
    num.style.fontSize = '2rem';
    num.style.fontWeight = '700';
    num.style.marginBottom = '8px';
    box.insertBefore(num, box.firstChild);
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(ent => {
        if (ent.isIntersecting) {
          let start = 0;
          const dur = 1000;
          const step = Math.max(1, Math.floor(target / 40));
          const t = setInterval(() => {
            start += step;
            if (start >= target) { num.textContent = target; clearInterval(t); }
            else { num.textContent = start; }
          }, Math.max(10, Math.round(dur / (target / step))));
          obs.unobserve(box);
        }
      });
    }, { threshold: 0.5 });
    obs.observe(box);
  }
});

// ========= FOOTER APARECE CON EFECTO =========
const footer = qs('.footer');
if (footer) {
  const fObs = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      footer.classList.add('visible');
      footer.style.transform = 'translateY(0) scale(1)';
      footer.style.opacity = 1;
      fObs.unobserve(footer);
    }
  }, { threshold: 0.2 });
  footer.style.opacity = 0;
  footer.style.transform = 'translateY(30px) scale(0.95)';
  fObs.observe(footer);
}

// ========= WOW WORDS ANIMATION =========
// Palabras en lugar de letras (mantiene typewriter para .intro-title)
const wowWords = (selector, delayStep = 150) => {
  qsa(selector).forEach(el => {
    if(el.classList.contains('intro-title')) return; // ignora typewriter
    const words = el.textContent.trim().split(' ');
    el.textContent = '';
    words.forEach((word, i) => {
      const span = document.createElement('span');
      span.textContent = word + ' ';
      span.style.display = 'inline-block';
      span.style.opacity = 0;
      span.style.transform = 'translateY(20px) scale(0.8)';
      span.style.transition = `all 0.7s cubic-bezier(.2,.8,.2,1) ${i * delayStep}ms`;
      el.appendChild(span);
    });
  });
};
wowWords('.section-title, .intro-text p, .mission-card h3, .valor-box h3, .stat-box h3');

const wowWordsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      const spans = qsa('span', entry.target);
      spans.forEach(span => {
        span.style.opacity = 1;
        span.style.transform = 'translateY(0) scale(1)';
        span.animate([
          { color: 'var(--color-primario)' },
          { color: 'var(--color-acento)' },
          { color: 'var(--color-secundario)' },
          { color: 'var(--color-primario)' }
        ], { duration: 1200 + Math.random()*600, iterations: Infinity });
      });
      wowWordsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

qsa('.section-title, .intro-text p, .mission-card h3, .valor-box h3, .stat-box h3')
  .forEach(el => wowWordsObserver.observe(el));

// ========= PÁRRAFOS REBOTANDO =========
qsa('.intro-text p, .mission-card p, .valor-box p, .stat-box p').forEach(p => {
  p.animate([
    { transform: 'translateY(0px)' },
    { transform: 'translateY(-4px)' },
    { transform: 'translateY(2px)' },
    { transform: 'translateY(0px)' }
  ], {
    duration: 2500 + Math.random()*1000,
    iterations: Infinity
  });
});

// ========= TÍTULOS VIBRANDO =========
qsa('.intro-title, .section-title').forEach(title => {
  title.animate([
    { transform: 'translateX(0px)' },
    { transform: 'translateX(-1px)' },
    { transform: 'translateX(1px)' },
    { transform: 'translateX(-1px)' },
    { transform: 'translateX(1px)' },
    { transform: 'translateX(0px)' }
  ], {
    duration: 1000 + Math.random()*500,
    iterations: Infinity
  });
});

// ========= PARALLAX + HUE ROTATE =========
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  qsa('.intro, .section-box').forEach(el => {
    el.style.backgroundPosition = `center ${-scrollY * 0.05}px`;
    el.style.filter = `hue-rotate(${scrollY*0.02}deg)`;
  });
});
