const ordenarItems = document.querySelectorAll('.orden-item');
const tbody = document.querySelector('#contenedor-productos tbody');

function sortRows(criteria) {
    const rows = Array.from(tbody.querySelectorAll('tr'));
    rows.sort((a, b) => {
        const stockA = Number(a.dataset.stock || 0);
        const stockB = Number(b.dataset.stock || 0);
        const idA = Number(a.dataset.id || 0);
        const idB = Number(b.dataset.id || 0);

        if (criteria === 'mayor-stock') return stockB - stockA;
        if (criteria === 'menor-stock') return stockA - stockB;
        return idA - idB;
    });
    rows.forEach(row => tbody.appendChild(row));
}

ordenarItems.forEach(item => {
    item.addEventListener('click', () => {
        sortRows(item.dataset.sort);
    });
});

const buscador = document.getElementById('buscador');
let timeoutBusqueda;

buscador.addEventListener('input', function () {
    const textoBusqueda = buscador.value.toLowerCase();
    const filas = document.querySelectorAll('#contenedor-productos tbody tr');
    const paginacion = document.querySelector('nav[aria-label="Navegación de historial"]');

    if (textoBusqueda.length > 0) {
        if (paginacion) paginacion.style.display = 'none';
    } else {
        if (paginacion) paginacion.style.display = '';
    }

    filas.forEach(fila => {
        const nombre = fila.querySelector('td:nth-child(2)').textContent.toLowerCase();
        if (nombre.includes(textoBusqueda)) {
            fila.style.display = '';
        } else {
            fila.style.display = 'none';
        }
    });
});

// Posicionar el cursor al final del texto en el buscador al cargar si hay búsqueda
window.addEventListener('DOMContentLoaded', () => {
    if (buscador.value.length > 0) {
        buscador.focus();
        const val = buscador.value;
        buscador.value = '';
        buscador.value = val;
    }
});
