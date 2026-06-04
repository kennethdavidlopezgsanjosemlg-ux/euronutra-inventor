(function(){
    const contenedor = document.getElementById('contenedor-productos');
    const containerRoot = document.querySelector('.container.py-4');
    const buscador = document.getElementById('buscador');
    const tbody = document.querySelector('#contenedor-productos tbody');
    let timeoutBusqueda;
    let busquedaActual = buscador.value;

    function showOverlay() {
        // Remover overlay anterior si existe
        const oldOverlay = document.getElementById('historial-loading-overlay');
        if (oldOverlay) oldOverlay.remove();
        
        // Crear nuevo overlay
        const overlay = document.createElement('div');
        overlay.id = 'historial-loading-overlay';
        overlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
        overlay.style.position = 'absolute';
        overlay.style.inset = '0';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.background = 'rgba(0,0,0,0.35)';
        overlay.style.zIndex = '999';
        contenedor.style.position = 'relative';
        contenedor.appendChild(overlay);
    }

    function hideOverlay() {
        const overlay = document.getElementById('historial-loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    async function fetchAndReplace(url) {
        showOverlay();
        try {
            const res = await fetch(url, { credentials: 'same-origin' });
            const html = await res.text();
            const temp = document.createElement('div');
            temp.innerHTML = html;

            const nuevaTabla = temp.querySelector('#contenedor-productos');
            if (nuevaTabla && contenedor) {
                contenedor.innerHTML = nuevaTabla.innerHTML;
                // Recrear el overlay después de actualizar el HTML
                showOverlay();
            }

            const nuevaPaginacion = temp.querySelector('nav[aria-label="Navegación de historial"]');
            const pagActual = document.querySelector('nav[aria-label="Navegación de historial"]');
            if (nuevaPaginacion) {
                if (pagActual) pagActual.outerHTML = nuevaPaginacion.outerHTML;
                else containerRoot.appendChild(nuevaPaginacion);
            } else if (pagActual) {
                pagActual.remove();
            }

            // Actualizar mensaje de "No hay artículos"
            const nuevoNoHayMensaje = temp.querySelector('.text-center.text-secondary.mt-5.h4');
            const noHayMensajeActual = document.querySelector('.text-center.text-secondary.mt-5.h4');
            
            if (nuevoNoHayMensaje) {
                if (!noHayMensajeActual) {
                    containerRoot.appendChild(nuevoNoHayMensaje);
                } else {
                    noHayMensajeActual.outerHTML = nuevoNoHayMensaje.outerHTML;
                }
            } else if (noHayMensajeActual) {
                noHayMensajeActual.remove();
            }

        } catch (err) {
            console.error('Error cargando página:', err);
            window.location.href = url;
        } finally {
            hideOverlay();
        }
    }

    // Paginación AJAX
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.page-link');
        if (!link) return;
        const nav = link.closest('nav[aria-label="Navegación de historial"]');
        if (!nav) return;

        e.preventDefault();
        nav.querySelectorAll('a.page-link').forEach(a => a.classList.add('disabled'));

        if (document.activeElement) document.activeElement.blur();

        fetchAndReplace(link.href);

        setTimeout(() => {
            nav.querySelectorAll('a.page-link').forEach(a => a.classList.remove('disabled'));
        }, 2000);
    });

    // Prefetch en hover
    let prefetchCache = new Set();
    document.addEventListener('mouseover', (e) => {
        const link = e.target.closest('a.page-link');
        if (!link) return;
        if (prefetchCache.has(link.href)) return;
        prefetchCache.add(link.href);
        fetch(link.href, { credentials: 'same-origin' }).then(() => {}).catch(()=>{});
    });

    // Función para ordenar las filas de la tabla
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

    // Búsqueda en tiempo real
    buscador.addEventListener('input', function () {
        const textoBusqueda = buscador.value.trim();
        busquedaActual = textoBusqueda;

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
                        } else {
                            containerRoot.appendChild(nuevaPaginacion);
                        }
                    }
                } else if (paginacionActual) {
                    paginacionActual.remove();
                }

                const nuevoNoHayMensaje = tempDiv.querySelector('.text-center.text-secondary.mt-5.h4');
                const noHayMensajeActual = document.querySelector('.text-center.text-secondary.mt-5.h4');
                
                if (nuevoNoHayMensaje) {
                    if (!noHayMensajeActual) {
                        containerRoot.appendChild(nuevoNoHayMensaje);
                    } else {
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

    // Posicionar el cursor en el buscador al cargar si hay búsqueda
    window.addEventListener('DOMContentLoaded', () => {
        if (buscador.value.length > 0) {
            buscador.focus();
            const val = buscador.value;
            buscador.value = '';
            buscador.value = val;
        }
    });
})();
