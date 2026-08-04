document.addEventListener('DOMContentLoaded', () => {
  initReproductorCancion();
  initLimiteBurbujas();
  initVideo();
  initAdoptaTeaser();
});

/* ---------- Progreso de adopción (vista rápida en la portada) ---------- */
function initAdoptaTeaser() {
  const el = document.getElementById('adoptaTeaserProgreso');
  if (!el) return;
  const TOTAL_ANIMALES = 5;
  let adoptados = [];
  try {
    adoptados = JSON.parse(localStorage.getItem('gm_animales_adoptados') || '[]');
  } catch {
    adoptados = [];
  }
  el.textContent = adoptados.length
    ? `${adoptados.length} de ${TOTAL_ANIMALES} adoptados`
    : 'Empieza tu colección';
}

/* ---------- Video: Los Guardianes del Mar Caribe (local) ----------
   Toca la miniatura para reemplazarla por el reproductor de video real. */
function initVideo() {
  const marco = document.getElementById('videoMarco');
  const overlay = document.getElementById('videoOverlayBoton');
  if (!marco || !overlay) return;

  overlay.addEventListener('click', () => {
    const video = document.createElement('video');
    video.src = marco.dataset.videoSrc;
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute('title', 'Los Guardianes del Mar Caribe, la película');
    marco.innerHTML = '';
    marco.appendChild(video);
  });
}

/* ---------- Burbujas solo a partir del mar (no en la playa) ---------- */
function initLimiteBurbujas() {
  const burbujas = document.getElementById('burbujas');
  const hero = document.querySelector('header.hero');
  if (!burbujas || !hero) return;

  function actualizar() {
    const limite = hero.getBoundingClientRect().bottom + window.scrollY;
    const pasadoLaPlaya = window.scrollY + window.innerHeight * 0.2 >= limite;
    burbujas.style.opacity = pasadoLaPlaya ? '1' : '0';
  }

  actualizar();
  window.addEventListener('scroll', actualizar, { passive: true });
  window.addEventListener('resize', actualizar);
}

/* ---------- Visualizador de audio real (Web Audio API) ---------- */
function crearVisualizadorAudio(audio, { barras, rayos, ventana }) {
  let ctx, analyser, datos, listo = false, animId;

  function conectar() {
    if (listo) return;
    if (window.location.protocol === 'file:') {
      // Chrome silencia el audio real al conectarlo a Web Audio cuando la
      // página se abre como archivo local (file://). Evitamos romper el
      // sonido: nos quedamos con la animación básica del ecualizador.
      return;
    }
    try {
      const AudioContextClase = window.AudioContext || window.webkitAudioContext;
      ctx = new AudioContextClase();
      const fuente = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      fuente.connect(analyser);
      analyser.connect(ctx.destination);
      datos = new Uint8Array(analyser.frequencyBinCount);
      listo = true;
    } catch (err) {
      console.warn('Visualizador de audio no disponible, se usa animación básica.', err);
      listo = false;
    }
  }

  function cuadro() {
    if (!listo) return;
    analyser.getByteFrequencyData(datos);
    const grupo = Math.floor(datos.length / barras.length);
    let sumaTotal = 0;

    barras.forEach((barra, i) => {
      let suma = 0;
      for (let j = i * grupo; j < (i + 1) * grupo; j++) suma += datos[j];
      const prom = suma / grupo;
      sumaTotal += prom;
      barra.style.height = (12 + (prom / 255) * 88) + '%';
    });

    const intensidad = sumaTotal / (barras.length * 255);
    rayos.forEach((r) => { r.style.opacity = 0.25 + intensidad * 0.6; });
    if (ventana) ventana.style.transform = `scale(${1 + intensidad * 0.025})`;

    animId = requestAnimationFrame(cuadro);
  }

  return {
    onPlay() {
      conectar();
      if (ctx && ctx.state === 'suspended') ctx.resume();
      if (listo) {
        barras.forEach((b) => { b.style.animation = 'none'; });
        cuadro();
      }
    },
    onPause() {
      cancelAnimationFrame(animId);
      if (listo) {
        barras.forEach((b) => { b.style.animation = ''; b.style.height = ''; });
        rayos.forEach((r) => { r.style.opacity = ''; });
        if (ventana) ventana.style.transform = '';
      }
    },
  };
}

/* ---------- Letra de "Los Guardianes del Mar Caribe" (sincronizada por tiempo real) ---------- */
const LETRA_CANCION = [
  { texto: '🎵 🎶 🎵', inicio: 0 },
  { texto: 'Somos amigos del mar,', inicio: 9678 },
  { texto: '¡Lo vamos a cuidar!', inicio: 11574 },
  { texto: 'Con amor y con alegría,', inicio: 15255 },
  { texto: '¡Lo protegemos cada día!', inicio: 18775 },
  { texto: 'Reciclamos el cartón,', inicio: 21746 },
  { texto: 'Las botellas al contenedor.', inicio: 24763 },
  { texto: 'Si la playa está limpita,', inicio: 27605 },
  { texto: '¡Sonríe la tortuguita!', inicio: 31079 },
  { texto: 'Elizabeth va a ayudar,', inicio: 34305 },
  { texto: 'Grace Elena va a limpiar.', inicio: 36820 },
  { texto: 'María Victoria también,', inicio: 40160 },
  { texto: '¡Abigail lo hace muy bien!', inicio: 43522 },
  { texto: 'Matías recoge aquí,', inicio: 47274 },
  { texto: 'Kilyan dice: ¡Sí, sí, sí!', inicio: 48945 },
  { texto: 'Todos juntos a cantar,', inicio: 52540 },
  { texto: '¡Nuestro mar vamos a cuidar!', inicio: 55275 },
  { texto: '¡Mar Caribe, limpio y azul!', inicio: 60587 },
  { texto: '¡Lo cuidamos tú y yo!', inicio: 63159 },
  { texto: 'Los corales brillarán,', inicio: 66278 },
  { texto: '¡Y los peces nadarán!', inicio: 68957 },
  { texto: '¡Mar Caribe, limpio y azul!', inicio: 72876 },
  { texto: '¡Lo cuidamos con amor!', inicio: 75715 },
  { texto: 'Guardianes vamos a ser,', inicio: 78598 },
  { texto: '¡Hoy, mañana y siempre también!', inicio: 81497 },
  { texto: '🎵 🎶 🎵', inicio: 85500 },
  { texto: '¡Mar Caribe, limpio y azul!', inicio: 117205 },
  { texto: '¡Lo cuidamos tú y yo!', inicio: 119719 },
  { texto: 'Los corales brillarán,', inicio: 122929 },
  { texto: '¡Y los peces nadarán!', inicio: 126080 },
  { texto: '¡Mar Caribe, limpio y azul!', inicio: 129553 },
  { texto: '¡Lo cuidamos con amor!', inicio: 132395 },
  { texto: 'Guardianes vamos a ser,', inicio: 135705 },
  { texto: '¡Hoy, mañana y siempre también!', inicio: 138649 },
  { texto: '¡Yo cuido el Mar Caribe!', inicio: 142452 },
];

function initLetraSincronizada(audio) {
  const actual = document.getElementById('letraActual');
  const anterior = document.getElementById('letraAnterior');
  const siguiente = document.getElementById('letraSiguiente');
  if (!actual || !anterior || !siguiente) return;

  let indiceActual = -2; // -2 = todavía sin iniciar, -1 = intro (antes de la primera línea)

  function indiceParaTiempo(ms) {
    let indice = -1;
    for (let i = 0; i < LETRA_CANCION.length; i++) {
      if (ms >= LETRA_CANCION[i].inicio) indice = i;
      else break;
    }
    return indice;
  }

  function mostrar(indice) {
    if (indice === indiceActual) return;
    indiceActual = indice;
    actual.textContent = indice >= 0 ? LETRA_CANCION[indice].texto : '';
    anterior.textContent = indice > 0 ? LETRA_CANCION[indice - 1].texto : '';
    siguiente.textContent = indice >= 0 && indice < LETRA_CANCION.length - 1 ? LETRA_CANCION[indice + 1].texto : (indice === -1 ? LETRA_CANCION[0].texto : '');
    actual.classList.remove('nueva');
    void actual.offsetWidth;
    actual.classList.add('nueva');
  }

  audio.addEventListener('timeupdate', () => {
    mostrar(indiceParaTiempo(audio.currentTime * 1000));
  });

  audio.addEventListener('play', () => {
    if (indiceActual === -2) mostrar(indiceParaTiempo(audio.currentTime * 1000));
  });
  audio.addEventListener('ended', () => { indiceActual = -2; });
}

/* ---------- Reproductor de canción dinámico ---------- */
function initReproductorCancion() {
  const audio = document.getElementById('cancionAudio');
  const tarjeta = document.getElementById('cancionViva');
  const btnPlay = document.getElementById('playCancion');
  const barra = document.getElementById('cancionBarra');
  const progreso = document.getElementById('cancionProgreso');
  const tiempo = document.getElementById('cancionTiempo');
  const notasContenedor = document.getElementById('notasContenedor');
  const particulasContenedor = document.getElementById('particulasVentana');
  const ventana = document.getElementById('ventanaMar');
  const barrasEcualizador = Array.from(document.querySelectorAll('#ecualizador span'));
  const rayos = Array.from(document.querySelectorAll('.rayo-luz'));
  if (!audio || !btnPlay) return;

  const visualizador = crearVisualizadorAudio(audio, { barras: barrasEcualizador, rayos, ventana });
  initLetraSincronizada(audio);

  function formatoTiempo(segundos) {
    if (!isFinite(segundos)) return '0:00';
    const m = Math.floor(segundos / 60);
    const s = Math.floor(segundos % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  let intervaloNotas = null;
  function crearNota() {
    if (!notasContenedor) return;
    const nota = document.createElement('span');
    nota.className = 'nota-flotante';
    nota.style.left = 8 + Math.random() * 84 + '%';
    nota.innerHTML = '<svg viewBox="0 0 24 24" width="' + (14 + Math.random() * 8) + '" height="20" fill="currentColor"><path d="M9 18V5l11-2v13"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></svg>';
    notasContenedor.appendChild(nota);
    setTimeout(() => nota.remove(), 2500);
  }

  let intervaloParticulas = null;
  function crearParticula() {
    if (!particulasContenedor) return;
    const p = document.createElement('span');
    p.className = 'particula-ventana';
    p.style.left = 5 + Math.random() * 90 + '%';
    particulasContenedor.appendChild(p);
    setTimeout(() => p.remove(), 3700);
  }

  btnPlay.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().catch(() => { tiempo.textContent = 'Canción pendiente'; });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener('play', () => {
    btnPlay.classList.add('reproduciendo');
    if (tarjeta) tarjeta.classList.add('reproduciendo');
    visualizador.onPlay();
    crearNota();
    crearParticula();
    intervaloNotas = setInterval(crearNota, 650);
    intervaloParticulas = setInterval(crearParticula, 450);
  });
  const detener = () => {
    btnPlay.classList.remove('reproduciendo');
    if (tarjeta) tarjeta.classList.remove('reproduciendo');
    visualizador.onPause();
    clearInterval(intervaloNotas);
    clearInterval(intervaloParticulas);
  };
  audio.addEventListener('pause', detener);
  audio.addEventListener('ended', detener);

  audio.addEventListener('timeupdate', () => {
    const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
    progreso.style.width = pct + '%';
    tiempo.textContent = `${formatoTiempo(audio.currentTime)} / ${formatoTiempo(audio.duration)}`;
  });

  barra.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = barra.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
  });
}

