(function(){
    const contenedor = document.getElementById('contenedor-productos');
    if (!contenedor) return;

    const containerRoot = document.querySelector('.container.py-4');

    function updateOverlayBounds(overlay) {
        if (!overlay) return;
        if (containerRoot) {
            overlay.style.position = 'absolute';
            overlay.style.top = `${contenedor.offsetTop}px`;
            overlay.style.left = `${contenedor.offsetLeft}px`;
            overlay.style.width = `${contenedor.offsetWidth}px`;
            overlay.style.height = `${contenedor.offsetHeight}px`;
        } else {
            overlay.style.position = 'absolute';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
        }
    }

    function showOverlay() {
        let overlay = document.getElementById('table-pagination-loading-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'table-pagination-loading-overlay';
            overlay.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="visually-hidden">Cargando...</span></div>';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.background = 'rgba(0,0,0,0.35)';
            overlay.style.zIndex = '999';
            overlay.style.pointerEvents = 'auto';
            if (containerRoot) {
                containerRoot.style.position = 'relative';
                containerRoot.appendChild(overlay);
            } else {
                contenedor.style.position = 'relative';
                contenedor.appendChild(overlay);
            }
            window.addEventListener('resize', () => updateOverlayBounds(overlay));
        }
        updateOverlayBounds(overlay);
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        const overlay = document.getElementById('table-pagination-loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    async function fetchAndReplace(url) {
        showOverlay();
        try {
            const res = await fetch(url, { credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const html = await res.text();
            const temp = document.createElement('div');
            temp.innerHTML = html;

            const nuevaTabla = temp.querySelector('#contenedor-productos');
            if (nuevaTabla && contenedor) {
                contenedor.innerHTML = nuevaTabla.innerHTML;
            }

            const nuevaPaginacion = temp.querySelector('nav[aria-label^="Navegación de"]');
            const pagActual = document.querySelector('nav[aria-label^="Navegación de"]');
            if (nuevaPaginacion) {
                if (pagActual) pagActual.outerHTML = nuevaPaginacion.outerHTML;
                else if (containerRoot) containerRoot.appendChild(nuevaPaginacion);
            } else if (pagActual) {
                pagActual.remove();
            }
        } catch (err) {
            console.error('Error cargando página:', err);
            window.location.href = url;
        } finally {
            hideOverlay();
        }
    }

    document.addEventListener('click', (e) => {
        const link = e.target.closest('a.page-link');
        if (!link) return;
        const nav = link.closest('nav[aria-label^="Navegación de"]');
        if (!nav) return;

        const liItem = link.closest('li.page-item');
        if (liItem && (liItem.classList.contains('active') || liItem.classList.contains('disabled'))) {
            e.preventDefault();
            return;
        }

        e.preventDefault();
        nav.querySelectorAll('a.page-link').forEach(a => a.classList.add('disabled'));

        if (document.activeElement) document.activeElement.blur();

        fetchAndReplace(link.href);

        setTimeout(() => {
            nav.querySelectorAll('a.page-link').forEach(a => a.classList.remove('disabled'));
        }, 2000);
    });
})();
