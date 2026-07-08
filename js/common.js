// ===== Guardianes del Mar — funciones compartidas =====

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initSonido();
  initBurbujas();
  initEscuchar();
  initRevelado();
});

/* ---------- Menú de navegación ---------- */
function initMenu() {
  const toggle = document.getElementById('menuToggle');
  const links = document.getElementById('topnavLinks');
  if (!toggle || !links) return;

  toggle.addEventListener('click', () => {
    const abierto = links.classList.toggle('abierto');
    toggle.classList.toggle('abierto', abierto);
    toggle.setAttribute('aria-expanded', abierto ? 'true' : 'false');
  });

  links.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      links.classList.remove('abierto');
      toggle.classList.remove('abierto');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Sonido ambiente ---------- */
function initSonido() {
  const btn = document.getElementById('soundToggle');
  const audio = document.getElementById('ambienteAudio');
  if (!btn || !audio) return;

  const encendido = localStorage.getItem('gm_sonido') === 'on';
  aplicarEstadoSonido(btn, !encendido);
  if (encendido) {
    audio.play().catch(() => {});
  }

  btn.addEventListener('click', () => {
    const estaSilenciado = btn.classList.contains('silenciado');
    if (estaSilenciado) {
      audio.play().catch(() => {});
      aplicarEstadoSonido(btn, false);
      localStorage.setItem('gm_sonido', 'on');
    } else {
      audio.pause();
      aplicarEstadoSonido(btn, true);
      localStorage.setItem('gm_sonido', 'off');
    }
  });
}

function aplicarEstadoSonido(btn, silenciado) {
  btn.classList.toggle('silenciado', silenciado);
  btn.setAttribute('aria-pressed', silenciado ? 'false' : 'true');
  btn.setAttribute('aria-label', silenciado ? 'Activar sonido' : 'Silenciar sonido');
}

/* ---------- Burbujas decorativas ---------- */
function initBurbujas() {
  const contenedor = document.getElementById('burbujas');
  if (!contenedor) return;

  const CANTIDAD = 14;
  for (let i = 0; i < CANTIDAD; i++) {
    const burbuja = document.createElement('span');
    burbuja.className = 'burbuja';
    const tam = 10 + Math.random() * 26;
    const izquierda = Math.random() * 100;
    const duracion = 10 + Math.random() * 12;
    const retraso = Math.random() * 16;
    const deriva = (Math.random() * 60 - 30) + 'px';

    burbuja.style.width = tam + 'px';
    burbuja.style.height = tam + 'px';
    burbuja.style.left = izquierda + '%';
    burbuja.style.animationDuration = duracion + 's';
    burbuja.style.animationDelay = '-' + retraso + 's';
    burbuja.style.setProperty('--deriva', deriva);

    contenedor.appendChild(burbuja);
  }
}

/* ---------- Escuchar (texto a voz), reutilizable en cualquier página -----------
   Cualquier botón con clase "btn-icono-escuchar" y atributo
   data-lee="idDelTexto" lee en voz alta el texto de ese elemento. */
function elegirMejorVoz() {
  const voces = window.speechSynthesis.getVoices();
  if (!voces.length) return null;

  const esVoces = voces.filter((v) => v.lang && v.lang.toLowerCase().startsWith('es'));
  const candidatas = esVoces.length ? esVoces : voces;

  const preferencias = [
    (v) => /google/i.test(v.name),
    (v) => /^(eddy|reed|shelley|flo)\b/i.test(v.name),
    (v) => /natural|neural|enhanced|premium/i.test(v.name),
    (v) => /mónica|monica|paulina|marisol|helena|lucía|lucia|isabela|elena/i.test(v.name),
    (v) => v.lang.toLowerCase() === 'es-es',
    () => true,
  ];

  for (const prueba of preferencias) {
    const encontrada = candidatas.find(prueba);
    if (encontrada) return encontrada;
  }
  return candidatas[0];
}

function initEscuchar() {
  const botones = document.querySelectorAll('.btn-icono-escuchar[data-lee]');
  if (!botones.length) return;

  if (!('speechSynthesis' in window)) {
    botones.forEach((b) => (b.style.display = 'none'));
    return;
  }

  let mejorVoz = elegirMejorVoz();
  window.speechSynthesis.onvoiceschanged = () => { mejorVoz = elegirMejorVoz(); };

  botones.forEach((btn) => {
    const textoEl = document.getElementById(btn.dataset.lee);
    if (!textoEl) return;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('leyendo')) {
        window.speechSynthesis.cancel();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textoEl.textContent.trim());
      if (mejorVoz) {
        utterance.voice = mejorVoz;
        utterance.lang = mejorVoz.lang;
      } else {
        utterance.lang = 'es-ES';
      }
      utterance.rate = 0.96;
      utterance.pitch = 1.05;
      utterance.onstart = () => btn.classList.add('leyendo');
      utterance.onend = () => btn.classList.remove('leyendo');
      utterance.onerror = () => btn.classList.remove('leyendo');
      window.speechSynthesis.speak(utterance);
    });
  });
}

/* ---------- Confeti de celebración (reutilizable) ---------- */
function lanzarConfeti() {
  const colores = ['#FFC93C', '#FF6B6B', '#5FD1CD', '#4CAF7D', '#0891A8'];
  for (let i = 0; i < 26; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confeti';
    pieza.style.left = Math.random() * 100 + 'vw';
    pieza.style.background = colores[Math.floor(Math.random() * colores.length)];
    pieza.style.animationDuration = 2 + Math.random() * 1.5 + 's';
    pieza.style.animationDelay = Math.random() * 0.4 + 's';
    pieza.style.width = pieza.style.height = 6 + Math.random() * 6 + 'px';
    document.body.appendChild(pieza);
    setTimeout(() => pieza.remove(), 4000);
  }
}

/* ---------- Animaciones de entrada al hacer scroll ---------- */
function initRevelado() {
  if (!('IntersectionObserver' in window)) return;

  const SELECTOR_INDIVIDUAL = [
    '.hero-texto', '.hero-imagen', 'header.page-header',
    '.cuento-card', '.cancion-viva', '.video-feature', '.guia-preview',
    '.adopta-teaser', '.agradecimientos-texto', '.vuela-registro',
  ].join(',');

  document.querySelectorAll(SELECTOR_INDIVIDUAL).forEach((el) => {
    el.classList.add('reveal');
  });

  const SELECTOR_GRUPOS = '.juegos-grid, .animales-grid, .equipo-grid, .guia-tarjetas';
  document.querySelectorAll(SELECTOR_GRUPOS).forEach((grupo) => {
    Array.from(grupo.children).forEach((hijo, i) => {
      hijo.classList.add('reveal');
      hijo.style.transitionDelay = Math.min(i * 0.08, 0.4) + 's';
    });
  });

  const elementos = document.querySelectorAll('.reveal');
  if (!elementos.length) return;

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });

  elementos.forEach((el) => observador.observe(el));
}

/* ---------- Identificador de dispositivo ---------- */
function obtenerDeviceId() {
  let id = localStorage.getItem('gm_device_id');
  if (!id) {
    id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gm_device_id', id);
  }
  return id;
}
