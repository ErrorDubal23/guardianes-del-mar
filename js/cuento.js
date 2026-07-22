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
    if (contador) contador.textContent = `Escena ${actual + 1} de ${escenas.length}`;
    puntos.forEach((p, i) => p.classList.toggle('activo', i === actual));
    if (btnAnterior) btnAnterior.disabled = actual === 0;
    if (btnSiguiente) btnSiguiente.disabled = actual === escenas.length - 1;
    if (libro) libro.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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

  /* ---- Escena 2: toca la basura para descubrir qué es ---- */
  document.querySelectorAll('.cuento-basura').forEach((btn) => {
    btn.addEventListener('click', () => {
      const info = document.getElementById(btn.dataset.info);
      if (!info) return;
      const yaActiva = info.classList.contains('activa');
      document.querySelectorAll('.cuento-basura-info').forEach((p) => p.classList.remove('activa'));
      if (!yaActiva) info.classList.add('activa');
    });
  });

  /* ---- Escena 3: toca a cada Guardián para escuchar su frase ---- */
  document.querySelectorAll('.guardian-mini').forEach((btn) => {
    btn.addEventListener('click', () => {
      const frase = document.getElementById(btn.dataset.frase);
      if (!frase) return;
      const yaActiva = frase.classList.contains('activa');
      document.querySelectorAll('.guardian-mini-frase').forEach((p) => p.classList.remove('activa'));
      if (!yaActiva) frase.classList.add('activa');
    });
  });

  /* ---- Escena 5: sembrar árboles limpia el río ---- */
  const btnSembrar = document.getElementById('btnSembrarArboles');
  const rioEscenario = document.getElementById('rioEscenario');
  if (btnSembrar && rioEscenario) {
    btnSembrar.addEventListener('click', () => {
      rioEscenario.classList.add('limpio');
      btnSembrar.disabled = true;
      btnSembrar.textContent = '¡Árboles sembrados!';
    });
  }

  /* ---- Escena 7: volver a leer el cuento desde el inicio ---- */
  const btnReiniciar = document.getElementById('btnReiniciarCuento');
  if (btnReiniciar) btnReiniciar.addEventListener('click', () => mostrarEscena(0));
}
