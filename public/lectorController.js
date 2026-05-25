const notificacion = document.getElementById('notificacion');
const textoDetectado = document.getElementById('textoDetectado');
const toggleCamara = document.getElementById('toggle-camara');
const statusText = document.getElementById('status-text');
const notifIcon = document.getElementById('notif-icon');

let escaneoBloqueado = false;
let lector;

function actualizarStatus(texto) {
    if (statusText) statusText.innerText = texto;
}

function mostrarNotificacion(mensaje, tipo = 'success') {
    textoDetectado.innerText = mensaje;
    notificacion.classList.remove('d-none', 'notif-success', 'notif-error', 'notif-info');
    
    let iconClass = 'fa-check-circle';
    if (tipo === 'error') {
        notificacion.classList.add('notif-error');
        iconClass = 'fa-exclamation-circle';
    } else if (tipo === 'info') {
        notificacion.classList.add('notif-info');
        iconClass = 'fa-info-circle';
    } else {
        notificacion.classList.add('notif-success');
    }
    
    if (notifIcon) notifIcon.className = `fas ${iconClass} me-2`;

    setTimeout(() => {
        notificacion.classList.add('d-none');
        escaneoBloqueado = false;
    }, 3000);
}

function iniciarEscaner() {
    lector = new Html5Qrcode('lector'); 
    actualizarStatus('Iniciando...');

    const configuracion = { fps: 15 };
    const alDetectar = (texto) => {
        if (escaneoBloqueado) return;
        manejarDeteccion(texto);
    };

    lector.start(
        { facingMode: 'environment' },
        configuracion,
        alDetectar,
        () => { }
    ).then(() => {
        actualizarStatus('Listo');
    }).catch(() => {
        lector.start(
            { facingMode: 'user' },
            configuracion,
            alDetectar,
            () => { }
        ).then(() => {
            actualizarStatus('Listo');
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
                actualizarStatus('Éxito');
            } else {
                mostrarNotificacion(`ID ${idProducto} no encontrado`, 'error');
                actualizarStatus('No encontrado');
            }
        } catch {
            mostrarNotificacion('Error de conexión', 'error');
            actualizarStatus('Error Red');
        }
    } else {
        mostrarNotificacion(`Detectado: ${valor}`, 'info');
    }

    setTimeout(() => {
        if (!escaneoBloqueado) actualizarStatus('Listo');
    }, 3000);
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
    if (toggleCamara.checked) {
        lectorPlaceholder.style.display = 'none';
        iniciarEscaner();
    } else {
        lectorPlaceholder.style.display = 'flex';
        actualizarStatus('Apagado');
    }
});