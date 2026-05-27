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
    const textoBusqueda = buscador.value.trim();
    const paginacion = document.querySelector('nav[aria-label="Navegación de historial"]');

    clearTimeout(timeoutBusqueda);
    timeoutBusqueda = setTimeout(async () => {
        try {
            // Realizar petición asíncrona al servidor
            const response = await fetch(`/historial?buscar=${encodeURIComponent(textoBusqueda)}&ajax=1`);
            const html = await response.text();
            
            // Crear un elemento temporal para parsear el HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Actualizar la tabla
            const nuevaTabla = tempDiv.querySelector('#contenedor-productos tbody');
            if (nuevaTabla) {
                tbody.innerHTML = nuevaTabla.innerHTML;
            }

            // Actualizar la paginación
            const nuevaPaginacion = tempDiv.querySelector('nav[aria-label="Navegación de historial"]');
            const contenedorPadrePaginacion = document.querySelector('.container.py-4');
            const paginacionActual = document.querySelector('nav[aria-label="Navegación de historial"]');
            
            if (nuevaPaginacion) {
                if (paginacionActual) {
                    paginacionActual.outerHTML = nuevaPaginacion.outerHTML;
                } else {
                    // Si no había paginación, la añadimos antes del mensaje de "No hay artículos" o al final
                    const noHayMensaje = document.querySelector('.text-center.text-secondary.mt-5.h4');
                    if (noHayMensaje) {
                        noHayMensaje.before(nuevaPaginacion);
                    } else {
                        contenedorPadrePaginacion.appendChild(nuevaPaginacion);
                    }
                }
            } else if (paginacionActual) {
                paginacionActual.remove();
            }

            // Actualizar mensaje de "No hay artículos"
            const nuevoNoHayMensaje = tempDiv.querySelector('.text-center.text-secondary.mt-5.h4');
            const noHayMensajeActual = document.querySelector('.text-center.text-secondary.mt-5.h4');
            
            if (nuevoNoHayMensaje) {
                if (!noHayMensajeActual) {
                    contenedorPadrePaginacion.appendChild(nuevoNoHayMensaje);
                } else {
                    noHayMensajeActual.outerHTML = nuevoNoHayMensaje.outerHTML;
                }
            } else if (noHayMensajeActual) {
                noHayMensajeActual.remove();
            }

            // Re-vincular eventos si es necesario
            const nuevosBotonesDisminuir = tbody.querySelectorAll('.boton-disminuir');
            nuevosBotonesDisminuir.forEach(boton => {
                boton.addEventListener('click', (e) => {
                    // Si queremos que los botones de la tabla sigan funcionando normalmente (redirección)
                    // no hace falta hacer nada especial aquí a menos que queramos que la resta sea AJAX también.
                });
            });

        } catch (error) {
            console.error('Error al buscar productos:', error);
        }
    }, 400); // 400ms de debounce para no saturar el servidor
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
