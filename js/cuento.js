// ===== Cuento interactivo: "Los Guardianes del Mar Caribe" =====

document.addEventListener('DOMContentLoaded', () => {
  initCuento();
});

function initCuento() {
  const escenas = Array.from(document.querySelectorAll('.cuento-escena'));
  if (!escenas.length) return;

  const contador = document.getElementById('cuentoContador');
  const puntosWrap = document.getElementById('cuentoPuntos');
  const btnAnterior = document.getElementById('cuentoAnterior');
  const btnSiguiente = document.getElementById('cuentoSiguiente');
  const libro = document.getElementById('cuentoLibro');
  const audioCancion = document.getElementById('cancionAudio');

  let actual = 0;

  if (puntosWrap) {
    escenas.forEach((_, i) => {
      const punto = document.createElement('span');
      punto.className = 'punto' + (i === 0 ? ' activo' : '');
      punto.addEventListener('click', () => mostrarEscena(i));
      puntosWrap.appendChild(punto);
    });
  }
  const puntos = puntosWrap ? Array.from(puntosWrap.children) : [];

  function mostrarEscena(indice) {
    if (indice < 0 || indice >= escenas.length || indice === actual) return;
    escenas[actual].classList.remove('activa');
    if (actual === escenas.length - 1 && audioCancion) audioCancion.pause();
    actual = indice;
    escenas[actual].classList.add('activa');
    if (contador) contador.textContent = `Página ${actual + 1} de ${escenas.length}`;
    puntos.forEach((p, i) => p.classList.toggle('activo', i === actual));
    if (btnAnterior) btnAnterior.disabled = actual === 0;
    if (btnSiguiente) btnSiguiente.disabled = actual === escenas.length - 1;
    if (libro) {
      const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 0;
      const destino = libro.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({ top: Math.max(0, destino), behavior: 'smooth' });
    }
  }

  if (btnAnterior) {
    btnAnterior.disabled = true;
    btnAnterior.addEventListener('click', () => mostrarEscena(actual - 1));
  }
  if (btnSiguiente) btnSiguiente.addEventListener('click', () => mostrarEscena(actual + 1));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') mostrarEscena(actual + 1);
    if (e.key === 'ArrowLeft') mostrarEscena(actual - 1);
  });

  /* ---- Escena 7: volver a leer el cuento desde el inicio ---- */
  const btnReiniciar = document.getElementById('btnReiniciarCuento');
  if (btnReiniciar) btnReiniciar.addEventListener('click', () => mostrarEscena(0));
}
