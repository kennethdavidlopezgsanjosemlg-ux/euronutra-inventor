(function(){
    const containerRoot = document.querySelector('.container.py-4');
    const buscador = document.getElementById('buscador');
    const tbody = document.querySelector('#contenedor-productos tbody');
    let timeoutBusqueda;

    function sortRows(criteria) {
        const rows = Array.from(document.querySelectorAll('#contenedor-productos tbody tr'));
        rows.sort((a, b) => {
            const stockA = Number(a.dataset.stock || 0);
            const stockB = Number(b.dataset.stock || 0);
            const idA = Number(a.dataset.id || 0);
            const idB = Number(b.dataset.id || 0);

            if (criteria === 'mayor-stock') return stockB - stockA;
            if (criteria === 'menor-stock') return stockA - stockB;
            return idA - idB;
        });
        const tbody = document.querySelector('#contenedor-productos tbody');
        rows.forEach(row => tbody.appendChild(row));
    }

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.orden-item');
        if (item) {
            sortRows(item.dataset.sort);
        }
    });

    buscador.addEventListener('input', function () {
        const textoBusqueda = buscador.value.trim();

        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(async () => {
            try {
                const response = await fetch(`/historial?buscar=${encodeURIComponent(textoBusqueda)}&pagina=1&ajax=1`);
                const html = await response.text();

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                const nuevaTabla = tempDiv.querySelector('#contenedor-productos tbody');
                const tbody = document.querySelector('#contenedor-productos tbody');
                if (nuevaTabla && tbody) {
                    tbody.innerHTML = nuevaTabla.innerHTML;
                }

                const nuevaPaginacion = tempDiv.querySelector('nav[aria-label="Navegación de historial"]');
                const paginacionActual = document.querySelector('nav[aria-label="Navegación de historial"]');

                if (nuevaPaginacion) {
                    if (paginacionActual) {
                        paginacionActual.outerHTML = nuevaPaginacion.outerHTML;
                    } else {
                        const noHayMensaje = document.querySelector('.text-center.text-secondary.mt-5.h4');
                        if (noHayMensaje) {
                            noHayMensaje.before(nuevaPaginacion);
                        } else if (containerRoot) {
                            containerRoot.appendChild(nuevaPaginacion);
                        }
                    }
                } else if (paginacionActual) {
                    paginacionActual.remove();
                }

                const nuevoNoHayMensaje = tempDiv.querySelector('.text-center.text-secondary.mt-5.h4');
                const noHayMensajeActual = document.querySelector('.text-center.text-secondary.mt-5.h4');

                if (nuevoNoHayMensaje) {
                    if (!noHayMensajeActual && containerRoot) {
                        containerRoot.appendChild(nuevoNoHayMensaje);
                    } else if (noHayMensajeActual) {
                        noHayMensajeActual.outerHTML = nuevoNoHayMensaje.outerHTML;
                    }
                } else if (noHayMensajeActual) {
                    noHayMensajeActual.remove();
                }

            } catch (error) {
                console.error('Error en búsqueda:', error);
            }
        }, 400);
    });

    window.addEventListener('DOMContentLoaded', () => {
        if (buscador && buscador.value.length > 0) {
            buscador.focus();
            const val = buscador.value;
            buscador.value = '';
            buscador.value = val;
        }
    });
})();
