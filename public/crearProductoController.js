const toggleCamara = document.getElementById('toggle-camara');
const scanStatus = document.getElementById('scan-status');
const scanResult = document.getElementById('scan-result');
const scanPlaceholder = document.getElementById('scan-placeholder');
const idInput = document.getElementById('id_producto');
const scanReader = document.getElementById('scan-reader');
let scanner;
let scanCooldown = false;

function updateStatus(text, type = 'info') {
    scanStatus.textContent = `Estado: ${text}`;
    scanStatus.className = `mt-3 ${type === 'error' ? 'text-danger' : type === 'success' ? 'text-success' : 'text-white-50'}`;
}

function updateResult(text, type = 'success') {
    scanResult.textContent = text;
    scanResult.className = `mt-2 ${type === 'error' ? 'text-danger' : type === 'success' ? 'text-success' : 'text-info'}`;
    scanResult.classList.remove('visually-hidden');
    setTimeout(() => scanResult.classList.add('visually-hidden'), 4000);
}

async function verificarIdUnico(id) {
    try {
        const response = await fetch(`/api/producto-existe?id=${encodeURIComponent(id)}`);
        if (!response.ok) return false;
        const data = await response.json();
        return !data.exists;
    } catch (err) {
        console.error('Error al verificar ID:', err);
        return false;
    }
}

async function iniciarEscaner() {
    if (!scanner) {
        scanner = new Html5Qrcode('scan-reader');
    }

    scanPlaceholder.style.display = 'none';
    updateStatus('Buscando código...', 'info');

    try {
        await scanner.start(
            { facingMode: 'environment' },
            {
                fps: 10,
                qrbox: { width: 220, height: 220 },
                aspectRatio: 1.0,
                showQrRegionImg: false
            },
            onScanSuccess,
            () => {
                // silent error callback
            }
        );
    } catch (error) {
        console.error('No se pudo iniciar la cámara:', error);
        updateStatus('No se pudo activar la cámara', 'error');
        scanPlaceholder.style.display = 'flex';
    }
}

async function detenerEscaner() {
    if (scanner) {
        try {
            await scanner.stop();
            await scanner.clear();
        } catch (error) {
            console.error('Error al detener la cámara:', error);
        }
    }
    scanPlaceholder.style.display = 'flex';
    updateStatus('Cámara desactivada', 'info');
}

async function onScanSuccess(decodedText) {
    if (scanCooldown) return;
    scanCooldown = true;
    const texto = decodedText.trim();
    const idLeido = parseInt(texto, 10);

    if (isNaN(idLeido)) {
        updateResult(`Código no válido: ${texto}`, 'error');
        updateStatus('Escaneo inválido', 'error');
        setTimeout(() => { scanCooldown = false; updateStatus('Buscando código...', 'info'); }, 2000);
        return;
    }

    if (idInput.value && parseInt(idInput.value, 10) === idLeido) {
        updateResult(`ID ${idLeido} ya está en el campo`, 'info');
        updateStatus('Id ya rellenado', 'info');
        scanCooldown = false;
        return;
    }

    updateStatus(`Verificando ID ${idLeido}...`, 'info');
    const unico = await verificarIdUnico(idLeido);

    if (unico) {
        idInput.value = idLeido;
        updateResult(`ID ${idLeido} rellenado`, 'success');
        updateStatus('ID único', 'success');
    } else {
        updateResult(`ID ${idLeido} ya existe`, 'error');
        updateStatus('ID repetido', 'error');
    }

    setTimeout(() => {
        scanCooldown = false;
        if (toggleCamara.checked) updateStatus('Buscando código...', 'info');
    }, 2000);
}

toggleCamara.addEventListener('change', async () => {
    if (toggleCamara.checked) {
        await iniciarEscaner();
    } else {
        await detenerEscaner();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    if (toggleCamara.checked) {
        await iniciarEscaner();
    } else {
        scanPlaceholder.style.display = 'flex';
        updateStatus('Cámara desactivada', 'info');
    }
});

window.addEventListener('pagehide', async () => {
    await detenerEscaner();
});