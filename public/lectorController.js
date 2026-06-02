const resultadoEscaneo = document.getElementById('resultado-escaneo');
const resText = document.getElementById('res-text');
const resIcon = document.getElementById('res-icon');
const toggleCamara = document.getElementById('toggle-camara');
const statusText = document.getElementById('status-text');
const lectorOperacion = document.querySelector('.scanner-guide');
const operacionRadios = document.querySelectorAll('input[name="operacion"]');

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

function iniciarEscaner() {
    lector = new Html5Qrcode('lector');
    actualizarStatus('Iniciando...');

    // Configuración de cámara
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

    // Intentamos iniciar con la cámara trasera, si falla intentamos con la frontal
    lector.start(
        { facingMode: 'environment' },
        configuracion,
        alDetectar,
        () => { }
    ).then(() => {
        actualizarStatus('Cámara activa');
    }).catch(() => {
        lector.start(
            { facingMode: 'user' },
            configuracion,
            alDetectar,
            () => { }
        ).then(() => {
            actualizarStatus('Cámara activa');
        }).catch((error) => {
            console.error(error);
            actualizarStatus('Error');
        });
    });
}

async function manejarDeteccion(valor) {
    const idProducto = parseInt(valor.trim(), 10);

    if (!isNaN(idProducto)) {
        escaneoBloqueado = true;
        actualizarStatus('Procesando...');

        const operacionElement = document.querySelector('input[name="operacion"]:checked');
        const operacion = operacionElement ? operacionElement.value : 'sumar';

        try {
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
        if (lector) {
            actualizarStatus('Apagado');
            await lector.stop().catch(err => console.error("Error al detener:", err));
        }
        lectorPlaceholder.style.display = 'flex';
    } else {
        lectorPlaceholder.style.display = 'none';
        iniciarEscaner();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    actualizarGuia();
    if (toggleCamara.checked) {
        lectorPlaceholder.style.display = 'none';
        iniciarEscaner();
    } else {
        lectorPlaceholder.style.display = 'flex';
        actualizarStatus('Apagado');
    }
});