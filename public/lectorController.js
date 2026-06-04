const resultadoEscaneo = document.getElementById('resultado-escaneo');
const resText = document.getElementById('res-text');
const resIcon = document.getElementById('res-icon');
const toggleCamara = document.getElementById('toggle-camara');
const statusText = document.getElementById('status-text');
const lectorOperacion = document.querySelector('.scanner-guide');
const operacionRadios = document.querySelectorAll('input[name="operacion"]');

// Función para actualizar la guía de escaneo según la operación seleccionada
function actualizarGuia() {
    if (!lectorOperacion) return;
    const operacion = document.querySelector('input[name="operacion"]:checked').value;
    if (operacion === 'sumar') {
        lectorOperacion.classList.add('scan-sumar');
        lectorOperacion.classList.remove('scan-restar');
    } else {
        lectorOperacion.classList.add('scan-restar');
        lectorOperacion.classList.remove('scan-sumar');
    } 
}
// Agregar evento a los radios para actualizar la guía al cambiar la operación
operacionRadios.forEach(r => r.addEventListener('change', actualizarGuia));

let escaneoBloqueado = false;
let lector;

function actualizarStatus(texto) {
    if (statusText) statusText.innerText = texto;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    resText.innerText = mensaje;
    resultadoEscaneo.classList.remove('d-none', 'res-success', 'res-error', 'res-info');

    let iconClass = 'fa-check-circle';
    if (tipo === 'error') {
        resultadoEscaneo.classList.add('res-error');
        iconClass = 'fa-exclamation-circle';
    } else if (tipo === 'info') {
        resultadoEscaneo.classList.add('res-info');
        iconClass = 'fa-info-circle';
    } else {
        resultadoEscaneo.classList.add('res-success');
    }

    if (resIcon) resIcon.className = `fas ${iconClass} mb-2`;

    // Ocultar el mensaje después de 2 segundos
    setTimeout(() => {
        resultadoEscaneo.classList.add('d-none');
    }, 2000);

    // Desbloquear el escaneo después de 4 segundos
    setTimeout(() => {
        escaneoBloqueado = false;
        if (toggleCamara.checked) actualizarStatus('Cámara activa');
    }, 4000);
}

async function iniciarEscaner() {
    if (!lector) {
        lector = new Html5Qrcode('lector');
    }

    actualizarStatus('Iniciando...');
    lectorPlaceholder.style.display = 'none';

    const configuracion = {
        fps: 15,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showQrRegionImg: false
    };

    const alDetectar = (texto) => {
        if (escaneoBloqueado) return;
        manejarDeteccion(texto);
    };

    try {
        await lector.start(
            { facingMode: 'environment' },
            configuracion,
            alDetectar,
            () => { }
        );
        actualizarStatus('Cámara activa');
        initZoom('lector','zoom-range-escaneo','zoom-control-escaneo');
    } catch (error) {
        console.warn('Fallo cámara trasera, probando frontal:', error);
        try {
            await lector.start(
                { facingMode: 'user' },
                configuracion,
                alDetectar,
                () => { }
            );
            actualizarStatus('Cámara activa');
            initZoom('lector','zoom-range-escaneo','zoom-control-escaneo');
        } catch (error2) {
            console.error('No se pudo iniciar la cámara:', error2);
            lectorPlaceholder.style.display = 'flex';
            actualizarStatus('Error al activar cámara');
        }
    }
}

function initZoom(containerId, sliderId, wrapperId) {
    const slider = document.getElementById(sliderId);
    const wrapper = document.getElementById(wrapperId);
    if (!slider || !wrapper) return;
    wrapper.style.display = 'none';

    const trySetup = () => {
        const container = document.getElementById(containerId);
        if (!container) return;
        const video = container.querySelector('video');
        if (!video || !video.srcObject) {
            setTimeout(trySetup, 400);
            return;
        }
        const track = video.srcObject.getVideoTracks()[0];
        if (!track || !track.getCapabilities) {
            wrapper.style.display = 'none';
            return;
        }
        const caps = track.getCapabilities();
        if (caps.zoom === undefined) {
            wrapper.style.display = 'none';
            return;
        }

        const min = caps.zoom.min || 1;
        const max = caps.zoom.max || 1;
        const step = caps.zoom.step || 0.1;
        slider.min = min;
        slider.max = max;
        slider.step = step;
        slider.value = Math.max(min, Math.min(max, min));
        wrapper.style.display = 'flex';

        slider.addEventListener('input', async (e) => {
            const value = parseFloat(e.target.value);
            try {
                await track.applyConstraints({ advanced: [{ zoom: value }] });
            } catch (err) {
                try { await track.applyConstraints({ zoom: value }); } catch (_) {}
            }
        });
    };

    trySetup();
}

async function detenerEscaner() {
    if (!lector) return;

    try {
        await lector.stop();
        await lector.clear();
    } catch (error) {
        console.error('Error al detener el escáner:', error);
    }
    const wrapper = document.getElementById('zoom-control-escaneo');
    if (wrapper) wrapper.style.display = 'none';
}

async function manejarDeteccion(valor) {
    const idProducto = parseInt(valor.trim(), 10);

    if (!isNaN(idProducto)) {
        escaneoBloqueado = true;
        actualizarStatus('Procesando...');

        const operacionElement = document.querySelector('input[name="operacion"]:checked');
        const operacion = operacionElement ? operacionElement.value : 'sumar';

        try {
            if (operacion === 'registrar') {
                const nombre = window.prompt(`Nombre del nuevo producto (ID ${idProducto}):`);
                if (!nombre || !nombre.trim()) {
                    mostrarNotificacion('Registro cancelado', 'info');
                    actualizarStatus('Cancelado');
                    escaneoBloqueado = false;
                    return;
                }

                const precioTexto = window.prompt('Precio del producto:');
                const precio = parseFloat((precioTexto || '').replace(',', '.'));
                if (isNaN(precio)) {
                    mostrarNotificacion('Precio inválido', 'error');
                    actualizarStatus('Error');
                    escaneoBloqueado = false;
                    return;
                }

                const categoria = window.prompt('Categoría del producto:');
                if (!categoria || !categoria.trim()) {
                    mostrarNotificacion('Categoría inválida', 'error');
                    actualizarStatus('Error');
                    escaneoBloqueado = false;
                    return;
                }

                const respuestaRegistro = await fetch('/api/producto/registrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({idProducto, nombre, precio, categoria})
                });
                const datosRegistro = await respuestaRegistro.json();

                if (respuestaRegistro.ok) {
                    mostrarNotificacion(
                        `Producto ${datosRegistro.producto.nombre} (ID ${datosRegistro.producto.id_producto}) registrado`,
                        'success'
                    );
                    actualizarStatus('Registrado');
                } else if (respuestaRegistro.status === 409) {
                    mostrarNotificacion(`ID ${idProducto} ya existe`, 'error');
                    actualizarStatus('Duplicado');
                } else {
                    mostrarNotificacion(datosRegistro.error || 'No se pudo registrar', 'error');
                    actualizarStatus('Error');
                }
            } else {
                const respuesta = await fetch('/api/actualizar-stock', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idProducto, operacion })
                });

                if (respuesta.ok) {
                    const datos = await respuesta.json();
                    mostrarNotificacion(`ID ${datos.idProducto} actualizado. Stock: ${datos.nuevoStock}`, 'success');
                    actualizarStatus('Escaneado');
                } else {
                    mostrarNotificacion(`ID ${idProducto} no encontrado`, 'error');
                    actualizarStatus('No encontrado');
                }
            }
        } catch {
            mostrarNotificacion('Error de conexión', 'error');
            actualizarStatus('Error');
        }
    } else {
        mostrarNotificacion(`Detectado: ${valor}`, 'info');
    }

    setTimeout(() => {
        if (!escaneoBloqueado && toggleCamara.checked) actualizarStatus('Cámara activa');
    }, 4000);
}

const lectorPlaceholder = document.getElementById('lector-placeholder');

toggleCamara.addEventListener('change', async function () {
    if (!this.checked) {
        actualizarStatus('Apagado');
        await detenerEscaner();
        lectorPlaceholder.style.display = 'flex';
    } else {
        lectorPlaceholder.style.display = 'none';
        await iniciarEscaner();
    }
});

document.addEventListener("DOMContentLoaded", async () => {
    actualizarGuia();
    if (toggleCamara.checked) {
        lectorPlaceholder.style.display = 'none';
        await iniciarEscaner();
    } else {
        lectorPlaceholder.style.display = 'flex';
        actualizarStatus('Apagado');
    }
});

window.addEventListener('pagehide', async () => {
    await detenerEscaner();
});