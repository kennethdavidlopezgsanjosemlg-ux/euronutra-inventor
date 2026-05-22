const notificacion = document.getElementById('notificacion');
const textoDetectado = document.getElementById('textoDetectado');
const toggleCamara = document.getElementById('toggle-camara');

let escaneoBloqueado = false;
let lector;

function iniciarEscaner() {
    lector = new Html5Qrcode('lector'); 

    // Configuración para mejorar la detección de escáner ya que por defecto es muy malo
    const configuracion = { fps: 15 };
    const alDetectar = (texto) => {
        if (escaneoBloqueado) return;
        manejarDeteccion(texto);
    };

    // Inicio de cámara ya se trasera como frontal 
    lector.start(
        { facingMode: 'environment' },
        configuracion,
        alDetectar,
        () => { }
    ).catch(() => {
        lector.start(
            { facingMode: 'user' },
            configuracion,
            alDetectar,
            () => { }
        ).catch((error) => console.error(error));
    });
    console.log('Cámara y escáner iniciado con éxito');
}

async function manejarDeteccion(valor) {
    const idProducto = parseInt(valor.trim(), 10); 
    notificacion.classList.remove('alert-success', 'alert-info', 'alert-warning', 'alert-danger');

    // Si el valor detectado es un número, se asume que es un ID de producto
    if (!isNaN(idProducto)) {
        console.log(`ID detectado: ${idProducto}`);
        escaneoBloqueado = true;
        notificacion.classList.add('alert-success');
        textoDetectado.innerText = `Actualizando stock para el ID: ${idProducto}`;

        try {
            const respuesta = await fetch('/api/actualizar-stock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idProducto })
            });

            if (respuesta.ok) {
                const datos = await respuesta.json();
                console.log(`Stock actualizado: ${JSON.stringify(datos)}`);
                textoDetectado.innerText = `ID ${datos.idProducto} actualizado. Stock actual: ${datos.nuevoStock}`;
            } else {
                textoDetectado.innerText = `El ID ${idProducto} no existe en la base de datos`;
                notificacion.classList.replace('alert-success', 'alert-danger');
            }
        } catch {
            textoDetectado.innerText = 'Error de conexión con el servidor';
            notificacion.classList.replace('alert-success', 'alert-danger');
        }
    } else {
        notificacion.classList.add('alert-info');
        textoDetectado.innerText = `Detectado: ${valor}`;
    }

    notificacion.classList.remove('d-none');

    // Después de 3 segundos, ocultar la notificación y desbloquea el escaneo otra vez 
    setTimeout(() => {
        notificacion.classList.add('d-none');
        escaneoBloqueado = false;
    }, 3000);
}

// Escuchar cambios en el switch para apagar o encender la cámara
toggleCamara.addEventListener('change', async function () {
    if (this.checked) {
        // Si el switch está activo, desactivamos la cámara
        if (lector) {
            await lector.stop().catch(err => console.error("Error al detener:", err));
            console.log('Cámara desactivada');
        }
    } else {
        // Si el switch se desactiva, volvemos a iniciar la cámara
        iniciarEscaner();
    }
});

document.addEventListener("DOMContentLoaded", () => {
    // Solo iniciamos el escáner si el switch NO está marcado (cámara activa)
    if (!toggleCamara.checked) {
        iniciarEscaner();
    } else {
        console.log('Cámara desactivada por configuración inicial');
    }
});