// 🎥 Control del video de fondo
const video = document.getElementById('bg-video');
const btnVideo = document.getElementById('toggle-video');
let videoActive = true;

btnVideo.addEventListener('click', () => {
  videoActive = !videoActive;
  video.style.display = videoActive ? 'block' : 'none';
  btnVideo.textContent = videoActive ? '🎥 Fondo: Activado' : '🎥 Fondo: Desactivado';
});

// 🎵 Control de música
const music = document.getElementById('bg-music');
const btnMusic = document.getElementById('toggle-music');
const volumeSlider = document.getElementById('volume');

music.volume = 0.4;
music.play();

btnMusic.addEventListener('click', () => {
  if (music.paused) {
    music.play();
    btnMusic.textContent = '🎵 Música: Activada';
  } else {
    music.pause();
    btnMusic.textContent = '🎵 Música: Desactivada';
  }
});
volumeSlider.addEventListener('input', e => {
  music.volume = e.target.value;
});

// 🌟 Animación de partículas
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

class Particle {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 3 + 1;
    this.speedY = Math.random() * 1 + 0.3;
    this.color = `hsl(${Math.random()*360}, 100%, 70%)`;
  }
  update() {
    this.y += this.speedY;
    if (this.y > canvas.height) {
      this.y = 0;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }
}

function initParticles() {
  particles = [];
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
}

function animateParticles() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach(p => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animateParticles);
}

initParticles();
animateParticles();

// 🔢 Animación contador de voluntarios
const counter = document.getElementById("counter");
if (counter) {
  const target = +counter.getAttribute("data-target");
  let count = 0;

  const updateCounter = () => {
    const increment = target / 100; // velocidad de subida
    if (count < target) {
      count += increment;
      counter.textContent = Math.ceil(count);
      requestAnimationFrame(updateCounter);
    } else {
      counter.textContent = target;
    }
  };
  updateCounter();
}
