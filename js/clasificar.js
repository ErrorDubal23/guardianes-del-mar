// ===== Clasifica los residuos + diploma al completar =====

document.addEventListener('DOMContentLoaded', () => {
  initJuego();
  initDiploma();
  initGuiaIntro();
});

/* ---------- Guía animada previa al juego ---------- */
function initGuiaIntro() {
  const guia = document.getElementById('guiaIntro');
  const contenido = document.getElementById('juegoContenido');
  const btn = document.getElementById('btnEmpezarJuego');
  if (!guia || !contenido || !btn) return;

  btn.addEventListener('click', () => {
    guia.style.display = 'none';
    contenido.classList.remove('oculto');
    contenido.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

const PISTA_BLANCO = 'Pista: el plástico, el papel, el cartón, el vidrio y el metal limpios van juntos en la caneca blanca.';
const PISTA_VERDE = 'Pista: las cáscaras y los restos de comida son orgánicos, van en la caneca verde.';
const PISTA_NEGRO = 'Pista: lo que está sucio, usado o mezcla materiales no se puede reciclar, va en la caneca negra.';

const NOMBRES_CANECA = { blanco: 'blanca', verde: 'verde', negro: 'negra' };

const OBJETOS = [
  { img: 'obj_botella.png', nombre: 'Botella de plástico', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_papel.png', nombre: 'Hoja de papel', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_carton.png', nombre: 'Caja de cartón', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_frasco.png', nombre: 'Frasco de vidrio', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_lata.png', nombre: 'Lata', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_periodico.png', nombre: 'Periódico', categoria: 'blanco', pista: PISTA_BLANCO },
  { img: 'obj_cascara_platano.png', nombre: 'Cáscara de plátano', categoria: 'verde', pista: PISTA_VERDE },
  { img: 'obj_manzana.png', nombre: 'Manzana mordida', categoria: 'verde', pista: PISTA_VERDE },
  { img: 'obj_cascara_huevo.png', nombre: 'Cáscara de huevo', categoria: 'verde', pista: PISTA_VERDE },
  { img: 'obj_cascara_papa.png', nombre: 'Cáscara de papa', categoria: 'verde', pista: PISTA_VERDE },
  { img: 'obj_servilleta.png', nombre: 'Servilleta usada', categoria: 'negro', pista: PISTA_NEGRO },
  { img: 'obj_chicle.png', nombre: 'Chicle', categoria: 'negro', pista: 'Pista: el chicle no se puede reciclar, va en la caneca negra.' },
  { img: 'obj_papel_higienico.png', nombre: 'Papel higiénico usado', categoria: 'negro', pista: PISTA_NEGRO },
  { img: 'obj_envoltorio.png', nombre: 'Envoltorio de dulce', categoria: 'negro', pista: 'Pista: los envoltorios de dulces mezclan varios materiales, van en la caneca negra.' },
];

function barajar(array) {
  const copia = [...array];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function initJuego() {
  const pool = document.getElementById('poolObjetos');
  const canecas = document.querySelectorAll('.caneca');
  const mensaje = document.getElementById('mensajeJuego');
  const marcadorTexto = document.getElementById('marcadorTexto');
  const marcadorTotal = document.getElementById('marcadorTotal');
  const juegoCompleto = document.getElementById('juegoCompleto');

  const objetosJuego = barajar(OBJETOS);
  marcadorTotal.textContent = objetosJuego.length;
  let resueltos = 0;
  let seleccionado = null;

  objetosJuego.forEach((obj, index) => {
    const btn = document.createElement('button');
    btn.className = 'objeto';
    btn.dataset.categoria = obj.categoria;
    btn.dataset.index = index;
    btn.setAttribute('aria-label', obj.nombre);
    btn.innerHTML = `<img src="imagenes/${obj.img}" alt="${obj.nombre}">`;

    btn.addEventListener('click', () => {
      if (btn.classList.contains('resuelto')) return;

      if (seleccionado && seleccionado.botonEl === btn) {
        btn.classList.remove('seleccionado');
        seleccionado = null;
        mensaje.textContent = '';
        return;
      }

      if (seleccionado) {
        seleccionado.botonEl.classList.remove('seleccionado');
      }
      btn.classList.add('seleccionado');
      seleccionado = { botonEl: btn, categoria: obj.categoria, nombre: obj.nombre, pista: obj.pista };
      mensaje.textContent = `Seleccionaste: ${obj.nombre}. Ahora toca la caneca correcta.`;
      mensaje.classList.remove('mensaje-pista');
    });

    pool.appendChild(btn);
  });

  canecas.forEach((caneca) => {
    caneca.addEventListener('click', () => {
      if (!seleccionado) {
        caneca.classList.add('activa');
        setTimeout(() => caneca.classList.remove('activa'), 300);
        mensaje.textContent = 'Primero toca un objeto de la lista.';
        return;
      }

      const categoriaCaneca = caneca.dataset.categoria;

      if (categoriaCaneca === seleccionado.categoria) {
        seleccionado.botonEl.classList.remove('seleccionado');
        seleccionado.botonEl.classList.add('resuelto');
        caneca.classList.add('activa');
        setTimeout(() => caneca.classList.remove('activa'), 300);
        resueltos++;
        marcadorTexto.textContent = resueltos;
        mensaje.textContent = `Muy bien, ${seleccionado.nombre} va en la caneca correcta.`;
        mensaje.classList.remove('mensaje-pista');
        seleccionado = null;

        if (resueltos === objetosJuego.length) {
          setTimeout(() => {
            mensaje.textContent = '';
            juegoCompleto.classList.add('visible');
            juegoCompleto.scrollIntoView({ behavior: 'smooth', block: 'start' });
            dibujarDiplomaGlobal();
          }, 500);
        }
      } else {
        caneca.classList.add('sacudir');
        setTimeout(() => caneca.classList.remove('sacudir'), 400);
        const nombreCaneca = NOMBRES_CANECA[categoriaCaneca];
        mensaje.textContent = `${seleccionado.nombre} no va en la caneca ${nombreCaneca}. ${seleccionado.pista}`;
        mensaje.classList.add('mensaje-pista');
      }
    });
  });
}

/* ---------- Diploma (se revela solo al completar el juego) ---------- */
let dibujarDiplomaGlobal = () => {};

function initDiploma() {
  const canvas = document.getElementById('diplomaCanvas');
  const ctx = canvas.getContext('2d');
  const inputNombre = document.getElementById('nombreDiploma');
  const btnGenerar = document.getElementById('generarDiploma');
  const btnDescargar = document.getElementById('descargarDiploma');
  const marco = new Image();
  marco.src = 'imagenes/diploma_marco.png';

  function ajustarLineas(ctx, texto, maxAncho) {
    const palabras = texto.split(' ');
    const lineas = [];
    let actual = '';
    palabras.forEach((palabra) => {
      const prueba = actual ? `${actual} ${palabra}` : palabra;
      if (ctx.measureText(prueba).width > maxAncho && actual) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = prueba;
      }
    });
    if (actual) lineas.push(actual);
    return lineas;
  }

  function dibujarDiploma() {
    const nombre = inputNombre.value.trim() || 'Guardián del Mar';
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#FFF8E7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (marco.complete && marco.naturalWidth > 0) {
      ctx.drawImage(marco, 0, 0, canvas.width, canvas.height);
    }

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#0B4F6C';
    ctx.font = '700 40px Fredoka, sans-serif';
    ctx.fillText('Diploma de Guardián del Mar', canvas.width / 2, 210);

    ctx.font = '500 24px "Baloo 2", sans-serif';
    ctx.fillStyle = '#0891A8';
    ctx.fillText('Se otorga con orgullo a', canvas.width / 2, 275);

    // El nombre se encoge automáticamente si es muy largo, para no invadir el marco
    let tamNombre = 56;
    const anchoMaximoNombre = 760;
    ctx.font = `700 ${tamNombre}px Fredoka, sans-serif`;
    while (ctx.measureText(nombre).width > anchoMaximoNombre && tamNombre > 26) {
      tamNombre -= 2;
      ctx.font = `700 ${tamNombre}px Fredoka, sans-serif`;
    }
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#0B4F6C';
    ctx.strokeText(nombre, canvas.width / 2, 385);
    ctx.fillStyle = '#FFC93C';
    ctx.fillText(nombre, canvas.width / 2, 385);

    ctx.font = '500 22px "Baloo 2", sans-serif';
    ctx.fillStyle = '#123B47';
    const lineasDescripcion = ajustarLineas(ctx, 'por aprender a cuidar el mar y clasificar los residuos', 760);
    let yDescripcion = 452;
    lineasDescripcion.forEach((linea) => {
      ctx.fillText(linea, canvas.width / 2, yDescripcion);
      yDescripcion += 34;
    });

    const fecha = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.font = '500 18px "Baloo 2", sans-serif';
    ctx.fillStyle = '#4a6b74';
    ctx.fillText(fecha, canvas.width / 2, yDescripcion + 34);
  }

  marco.onload = dibujarDiploma;
  marco.onerror = dibujarDiploma;
  btnGenerar.addEventListener('click', dibujarDiploma);
  inputNombre.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') dibujarDiploma();
  });

  btnDescargar.addEventListener('click', (e) => {
    e.preventDefault();
    dibujarDiploma();
    const link = document.createElement('a');
    link.download = 'diploma-guardian-del-mar.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });

  dibujarDiplomaGlobal = dibujarDiploma;
  dibujarDiploma();
}
