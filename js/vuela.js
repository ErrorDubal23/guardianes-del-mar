// ===== Rescate en el Arrecife — juego de memoria =====

const CLAVE_NOMBRE = 'gm_arrecife_nombre';
const CLAVE_PARTIDAS = 'gm_arrecife_partidas';
const CLAVE_PUNTAJE = 'gm_arrecife_puntaje';
const COLECCION_RANKING = 'ranking_arrecife';

const CARTAS = [
  { valor: 'delfin', img: 'delfin.png', nombre: 'Delfín' },
  { valor: 'pulpo', img: 'pulpo.png', nombre: 'Pulpo' },
  { valor: 'caballito', img: 'caballito.png', nombre: 'Caballito de mar' },
  { valor: 'cangrejo', img: 'cangrejo.png', nombre: 'Cangrejo' },
  { valor: 'pez', img: 'pez.png', nombre: 'Pez' },
  { valor: 'saludo', img: 'tortuga_saludo.png', nombre: 'Marino saludando' },
  { valor: 'nadando', img: 'tortuga_nadando.png', nombre: 'Marino nadando' },
  { valor: 'saltando', img: 'tortuga_saltando.png', nombre: 'Marino saltando' },
];

let db = null;

/* ---------- Conexión opcional a Firebase ---------- */
async function initFirebase() {
  if (!window.firebaseListo) return;
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js');
    const firestoreMod = await import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js');
    const app = initializeApp(window.firebaseConfig);
    db = firestoreMod.getFirestore(app);
    window._firestoreMod = firestoreMod;
  } catch (err) {
    console.warn('No se pudo conectar a Firebase, usando ranking local.', err);
    db = null;
  }
}

async function subirPuntaje(nombre, puntaje) {
  if (!db) return;
  try {
    const mod = window._firestoreMod;
    const deviceId = obtenerDeviceId();
    const ref = mod.doc(db, COLECCION_RANKING, deviceId);
    await mod.setDoc(ref, {
      nombre: nombre.slice(0, 24),
      puntaje: Math.round(puntaje),
      actualizado: mod.serverTimestamp(),
    });
  } catch (err) {
    console.warn('No se pudo subir el puntaje al ranking compartido.', err);
  }
}

async function cargarRanking() {
  const lista = document.getElementById('rankingLista');
  const nota = document.getElementById('rankingNota');
  if (!lista) return;

  if (!db) {
    nota.textContent = 'Ranking compartido no conectado todavía. Mostrando solo tu puntaje en este dispositivo.';
    lista.innerHTML = '';
    return;
  }

  try {
    const mod = window._firestoreMod;
    const q = mod.query(mod.collection(db, COLECCION_RANKING), mod.orderBy('puntaje', 'desc'), mod.limit(10));
    const snap = await mod.getDocs(q);
    lista.innerHTML = '';
    let puesto = 1;
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      const fila = document.createElement('div');
      fila.className = 'ranking-fila';
      fila.innerHTML = `<span class="ranking-puesto">${puesto}</span><span class="ranking-nombre">${escaparHtml(d.nombre)}</span><span>${d.puntaje}</span>`;
      lista.appendChild(fila);
      puesto++;
    });
    nota.textContent = snap.empty ? 'Todavía nadie ha jugado. ¡Sé el primero!' : '';
  } catch (err) {
    nota.textContent = 'No se pudo cargar el ranking compartido en este momento.';
  }
}

function escaparHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function obtenerDeviceId() {
  let id = localStorage.getItem('gm_device_id');
  if (!id) {
    id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('gm_device_id', id);
  }
  return id;
}

/* ---------- Registro de jugador ---------- */
function initRegistro() {
  const form = document.getElementById('formRegistro');
  const inputNombre = document.getElementById('nombreJugador');
  const registroBox = document.getElementById('vuelaRegistro');
  const juegoBox = document.getElementById('vuelaJuego');
  const saludo = document.getElementById('saludoJugador');

  const nombreGuardado = localStorage.getItem(CLAVE_NOMBRE);
  if (nombreGuardado) {
    mostrarJuego(nombreGuardado);
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = inputNombre.value.trim();
    if (!nombre) return;
    localStorage.setItem(CLAVE_NOMBRE, nombre);
    mostrarJuego(nombre);
  });

  function mostrarJuego(nombre) {
    registroBox.style.display = 'none';
    juegoBox.style.display = 'block';
    saludo.textContent = `Hola, ${nombre}`;
    actualizarEstado();
  }
}

function actualizarEstado() {
  const partidas = parseInt(localStorage.getItem(CLAVE_PARTIDAS) || '0', 10);
  const puntaje = parseInt(localStorage.getItem(CLAVE_PUNTAJE) || '0', 10);
  const estado = document.getElementById('vuelaEstado');
  const btnJugar = document.getElementById('btnJugar');

  if (partidas === 0) {
    estado.textContent = 'Toca "Jugar" cuando quieras empezar.';
    btnJugar.textContent = 'Jugar';
  } else {
    estado.textContent = `Partidas jugadas: ${partidas}. Tu puntaje: ${puntaje}.`;
    btnJugar.textContent = 'Jugar de nuevo';
  }
}

function barajar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

/* ---------- Juego de memoria ---------- */
function initJuego() {
  const grid = document.getElementById('memoriaGrid');
  const btnJugar = document.getElementById('btnJugar');
  const statPuntos = document.getElementById('statPuntos');
  const statIntentos = document.getElementById('statIntentos');
  const statTiempo = document.getElementById('statTiempo');
  const stats = document.getElementById('memoriaStats');
  const completo = document.getElementById('memoriaCompleto');
  const resumen = document.getElementById('memoriaResumen');

  const TOTAL_PAREJAS = CARTAS.length;
  let volteadas = [];
  let emparejadas = 0;
  let intentos = 0;
  let bloqueado = false;
  let jugando = false;
  let inicioTiempo = null;
  let intervaloTiempo = null;

  function formatoTiempo(seg) {
    const m = Math.floor(seg / 60);
    const s = seg % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  function calcularPuntajeActual() {
    const base = emparejadas * 100;
    const penalizacion = Math.max(0, intentos - emparejadas) * 15;
    return Math.max(0, base - penalizacion);
  }

  function actualizarStats() {
    statPuntos.textContent = calcularPuntajeActual();
    statIntentos.textContent = intentos;
  }

  function crearTablero() {
    const mazo = barajar([...CARTAS, ...CARTAS]);
    grid.innerHTML = '';
    mazo.forEach((carta) => {
      const btn = document.createElement('button');
      btn.className = 'memoria-carta';
      btn.dataset.valor = carta.valor;
      btn.setAttribute('aria-label', carta.nombre);
      btn.innerHTML = `
        <span class="memoria-carta-interior">
          <span class="memoria-cara-atras"></span>
          <span class="memoria-cara-frente"><img src="imagenes/${carta.img}" alt="${carta.nombre}"></span>
        </span>`;
      btn.addEventListener('click', () => manejarClick(btn));
      grid.appendChild(btn);
    });
  }

  function manejarClick(btn) {
    if (!jugando || bloqueado) return;
    if (btn.classList.contains('volteada') || btn.classList.contains('emparejada')) return;
    if (volteadas.length === 2) return;

    if (!inicioTiempo) {
      inicioTiempo = Date.now();
      intervaloTiempo = setInterval(() => {
        const seg = Math.floor((Date.now() - inicioTiempo) / 1000);
        statTiempo.textContent = formatoTiempo(seg);
      }, 1000);
    }

    btn.classList.add('volteada');
    volteadas.push(btn);

    if (volteadas.length === 2) {
      intentos++;
      const [a, b] = volteadas;
      if (a.dataset.valor === b.dataset.valor) {
        emparejadas++;
        a.classList.add('emparejada');
        b.classList.add('emparejada');
        volteadas = [];
        actualizarStats();
        if (emparejadas === TOTAL_PAREJAS) {
          terminarJuego();
        }
      } else {
        bloqueado = true;
        actualizarStats();
        setTimeout(() => {
          a.classList.add('sacudir');
          b.classList.add('sacudir');
          setTimeout(() => {
            a.classList.remove('volteada', 'sacudir');
            b.classList.remove('volteada', 'sacudir');
            volteadas = [];
            bloqueado = false;
          }, 400);
        }, 550);
      }
    }
  }

  function terminarJuego() {
    jugando = false;
    clearInterval(intervaloTiempo);
    const segundos = inicioTiempo ? Math.floor((Date.now() - inicioTiempo) / 1000) : 0;

    const base = emparejadas * 100;
    const penalizacion = Math.max(0, intentos - emparejadas) * 15;
    const bonusTiempo = segundos < 40 ? 300 : segundos < 70 ? 200 : segundos < 100 ? 100 : 0;
    const puntajeFinal = Math.max(0, base - penalizacion + bonusTiempo);

    statPuntos.textContent = puntajeFinal;

    const partidas = parseInt(localStorage.getItem(CLAVE_PARTIDAS) || '0', 10) + 1;
    localStorage.setItem(CLAVE_PARTIDAS, String(partidas));
    localStorage.setItem(CLAVE_PUNTAJE, String(puntajeFinal));

    const nombre = localStorage.getItem(CLAVE_NOMBRE) || 'Guardián del Mar';
    subirPuntaje(nombre, puntajeFinal).then(cargarRanking);

    resumen.textContent = `${intentos} intentos en ${formatoTiempo(segundos)}. Puntaje: ${puntajeFinal}${bonusTiempo ? ` (incluye +${bonusTiempo} por rapidez)` : ''}.`;
    completo.classList.add('visible');
    lanzarConfeti();
    actualizarEstado();
    btnJugar.textContent = 'Jugar de nuevo';
  }

  btnJugar.addEventListener('click', () => {
    volteadas = [];
    emparejadas = 0;
    intentos = 0;
    bloqueado = false;
    inicioTiempo = null;
    clearInterval(intervaloTiempo);
    statTiempo.textContent = '0:00';
    statPuntos.textContent = '0';
    statIntentos.textContent = '0';
    completo.classList.remove('visible');
    stats.classList.add('visible');
    crearTablero();
    jugando = true;
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  await initFirebase();
  initRegistro();
  initJuego();
  cargarRanking();
});
