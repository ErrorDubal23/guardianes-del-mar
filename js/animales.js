const CLAVE_ADOPTADOS = 'gm_animales_adoptados';

function obtenerAdoptados() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_ADOPTADOS) || '[]');
  } catch {
    return [];
  }
}

function guardarAdoptados(lista) {
  localStorage.setItem(CLAVE_ADOPTADOS, JSON.stringify(lista));
}

document.addEventListener('DOMContentLoaded', () => {
  const tarjetas = document.querySelectorAll('.animal-card');
  const total = tarjetas.length;
  const textoProgreso = document.getElementById('adopcionTexto');
  const relleno = document.getElementById('adopcionRelleno');
  const completa = document.getElementById('adopcionCompleta');
  let adoptados = obtenerAdoptados();

  function actualizarProgreso() {
    const cantidad = adoptados.length;
    if (textoProgreso) {
      textoProgreso.textContent = cantidad === total
        ? `¡Adoptaste a los ${total} animales!`
        : `Has adoptado ${cantidad} de ${total} animales`;
    }
    if (relleno) relleno.style.width = (cantidad / total) * 100 + '%';
    if (completa) completa.classList.toggle('visible', cantidad === total);
  }

  tarjetas.forEach((card) => {
    const datoDiv = card.querySelector('.dato');
    const nombre = card.dataset.animal;
    if (adoptados.includes(nombre)) {
      card.classList.add('adoptado');
    }

    card.addEventListener('click', () => {
      const abierta = card.classList.toggle('abierta');
      if (abierta && !datoDiv.textContent) {
        datoDiv.textContent = card.dataset.dato;
      }
      if (abierta && !adoptados.includes(nombre)) {
        adoptados.push(nombre);
        guardarAdoptados(adoptados);
        card.classList.add('adoptado');
        actualizarProgreso();
        if (adoptados.length === total) {
          setTimeout(lanzarConfeti, 200);
        }
      }
    });
  });

  actualizarProgreso();
});
