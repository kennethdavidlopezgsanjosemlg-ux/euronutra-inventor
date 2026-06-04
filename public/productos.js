// Manejo asíncrono de paginación en la vista de productos
(function(){
    const contenedor = document.getElementById('contenedor-productos');
    const containerRoot = document.querySelector('.container.py-4');

    function showOverlay() {
        let overlay = document.getElementById('productos-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'productos-loading-overlay';
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
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        const overlay = document.getElementById('productos-loading-overlay');
        if (overlay) overlay.style.display = 'none';
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
            }

            const nuevaPaginacion = temp.querySelector('nav[aria-label="Navegación de productos"]');
            const pagActual = document.querySelector('nav[aria-label="Navegación de productos"]');
            if (nuevaPaginacion) {
                if (pagActual) pagActual.outerHTML = nuevaPaginacion.outerHTML;
                else containerRoot.appendChild(nuevaPaginacion);
            } else if (pagActual) {
                pagActual.remove();
            }

            // Rehabilitar enlaces después de cargar nueva página

        } catch (err) {
            console.error('Error cargando página:', err);
            window.location.href = url; // Fallback a navegación normal si falla la carga asíncrona
        } finally {
            hideOverlay();
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.page-link');
        if (!link) return;
        const nav = link.closest('nav[aria-label="Navegación de productos"]');
        if (!nav) return;

        // Prevenir click en página actual o deshabilitada
        const liItem = link.closest('li.page-item');
        if (liItem && (liItem.classList.contains('active') || liItem.classList.contains('disabled'))) {
            e.preventDefault();
            return;
        }

        // Prevent default navigation and show loading state
        e.preventDefault();

        // Deshabilitar enlaces para evitar múltiples clicks
        nav.querySelectorAll('a.page-link').forEach(a => a.classList.add('disabled'));

        // Quitar foco para evitar que quede resaltado el enlace
        if (document.activeElement) document.activeElement.blur();

        fetchAndReplace(link.href);

        // Rehabilitar enlaces después de un tiempo (en caso de que algo falle)
        setTimeout(() => {
            nav.querySelectorAll('a.page-link').forEach(a => a.classList.remove('disabled'));
        }, 2000);
    });
})();
