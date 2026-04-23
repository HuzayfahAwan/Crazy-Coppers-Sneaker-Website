// Theme toggle
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');

const savedTheme = localStorage.getItem('cc-theme') || 'dark';
html.dataset.theme = savedTheme;
themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
  const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('cc-theme', next);
  themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
});

// Animated stat counters
function animateCounter(el) {
  const target = parseInt(el.dataset.target);
  const isCurrency = el.dataset.format === 'currency';
  const duration = 1600;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = isCurrency ? '$' + value.toLocaleString() : value;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-number').forEach(animateCounter);
      statsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

statsObserver.observe(document.querySelector('.stats-bar'));

// Fade-in on scroll
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// Skeleton image loaders
document.querySelectorAll('.card-img-wrap img').forEach(img => {
  const wrap = img.parentElement;
  const reveal = () => {
    img.style.opacity = '1';
    wrap.classList.remove('skeleton');
  };
  if (img.complete && img.naturalWidth > 0) reveal();
  else img.addEventListener('load', reveal);
  img.addEventListener('error', reveal);
});

// Toast
const toast = document.getElementById('toast');
let toastTimer;

function showToast(msg) {
  clearTimeout(toastTimer);
  toast.textContent = msg;
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

// Cop It toast (only fires, doesn't block navigation)
document.querySelectorAll('.cop-btn').forEach(btn => {
  btn.addEventListener('click', () => showToast('Taking you to the listing... 🔥'));
});

// Card flip — info button
document.querySelectorAll('.info-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.sneaker-card').classList.add('is-flipped');
  });
});

// Card flip — back button
document.querySelectorAll('.flip-back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.sneaker-card').classList.remove('is-flipped');
  });
});

// Share button
document.querySelectorAll('.share-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const url = `${location.origin}${location.pathname}#${id}`;
    navigator.clipboard.writeText(url)
      .then(() => showToast('Link copied to clipboard! 📋'))
      .catch(() => showToast('Could not copy — check browser permissions'));
  });
});

// Scroll to + highlight card if URL has a hash
window.addEventListener('DOMContentLoaded', () => {
  const hash = location.hash.slice(1);
  if (!hash) return;
  const card = document.getElementById(hash);
  if (!card) return;
  setTimeout(() => {
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.style.outline = '2px solid var(--gold)';
    card.style.outlineOffset = '3px';
    setTimeout(() => {
      card.style.outline = '';
      card.style.outlineOffset = '';
    }, 2200);
  }, 400);
});

// Filter + Search + Sort
let currentSearch = '';
let currentBrand = 'all';
let currentSort = 'desc';

function applyAll() {
  const grid = document.getElementById('sneakerGrid');
  const cards = [...grid.querySelectorAll('.sneaker-card')];

  cards.sort((a, b) => {
    const pa = parseInt(a.dataset.price);
    const pb = parseInt(b.dataset.price);
    return currentSort === 'asc' ? pa - pb : pb - pa;
  });
  cards.forEach(card => grid.appendChild(card));

  let visible = 0;
  cards.forEach(card => {
    const name = card.querySelector('.card-name').textContent.toLowerCase();
    const brand = card.dataset.brand;
    const show = name.includes(currentSearch) && (currentBrand === 'all' || brand === currentBrand);
    card.style.display = show ? '' : 'none';
    if (show) visible++;
  });

  document.getElementById('noResults').style.display = visible === 0 ? 'block' : 'none';
}

document.getElementById('searchInput').addEventListener('input', e => {
  currentSearch = e.target.value.toLowerCase().trim();
  applyAll();
});

document.querySelectorAll('.filter-pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    currentBrand = pill.dataset.brand;
    applyAll();
  });
});

document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSort = btn.dataset.sort;
    applyAll();
  });
});
