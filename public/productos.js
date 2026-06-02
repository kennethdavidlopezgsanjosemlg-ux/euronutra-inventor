const buscador = document.getElementById('buscador');
const tbody = document.querySelector('#contenedor-productos tbody');
const formEditar = document.getElementById('formEditar');
const editarId = document.getElementById('editar-id');
const editarNombre = document.getElementById('editar-nombre');
const editarCategoria = document.getElementById('editar-categoria');
const editarStock = document.getElementById('editar-stock');

document.querySelectorAll('.btn-editar').forEach(boton => {
    boton.addEventListener('click', () => {
        const id = boton.dataset.id;
        formEditar.action = `/productos/${id}/actualizar`;
        editarId.value = id;
        editarNombre.value = boton.dataset.nombre;
        editarCategoria.value = boton.dataset.categoria;
        editarStock.value = boton.dataset.stock;
    });
});

document.querySelectorAll('.form-eliminar').forEach(formulario => {
    formulario.addEventListener('submit', (evento) => {
        if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
            evento.preventDefault();
        }
    });
});

let timeoutBusqueda;

if (buscador && tbody) {
    buscador.addEventListener('input', function () {
        const textoBusqueda = buscador.value.trim();

        clearTimeout(timeoutBusqueda);
        timeoutBusqueda = setTimeout(async () => {
            try {
                const response = await fetch(
                    `/productos?buscar=${encodeURIComponent(textoBusqueda)}&ajax=1`
                );
                const html = await response.text();
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;

                const nuevaTabla = tempDiv.querySelector('#contenedor-productos tbody');
                if (nuevaTabla) {
                    tbody.innerHTML = nuevaTabla.innerHTML;
                    enlazarEventosFilas();
                }

                const nuevaPaginacion = tempDiv.querySelector('nav[aria-label="Navegación de productos"]');
                const paginacionActual = document.querySelector('nav[aria-label="Navegación de productos"]');
                const contenedor = document.querySelector('.container.py-4');

                if (nuevaPaginacion) {
                    if (paginacionActual) {
                        paginacionActual.outerHTML = nuevaPaginacion.outerHTML;
                    } else {
                        const noHayMensaje = document.querySelector('.text-center.text-secondary.mt-5.h4');
                        if (noHayMensaje) {
                            noHayMensaje.before(nuevaPaginacion);
                        } else if (contenedor) {
                            contenedor.appendChild(nuevaPaginacion);
                        }
                    }
                } else if (paginacionActual) {
                    paginacionActual.remove();
                }

                const nuevoNoHayMensaje = tempDiv.querySelector('.text-center.text-secondary.mt-5.h4');
                const noHayMensajeActual = document.querySelector('.text-center.text-secondary.mt-5.h4');

                if (nuevoNoHayMensaje) {
                    if (!noHayMensajeActual && contenedor) {
                        contenedor.appendChild(nuevoNoHayMensaje);
                    } else if (noHayMensajeActual) {
                        noHayMensajeActual.outerHTML = nuevoNoHayMensaje.outerHTML;
                    }
                } else if (noHayMensajeActual) {
                    noHayMensajeActual.remove();
                }
            } catch (error) {
                console.error('Error al buscar productos:', error);
            }
        }, 400);
    });
}

function enlazarEventosFilas() {
    document.querySelectorAll('.btn-editar').forEach(boton => {
        boton.addEventListener('click', () => {
            const id = boton.dataset.id;
            formEditar.action = `/productos/${id}/actualizar`;
            editarId.value = id;
            editarNombre.value = boton.dataset.nombre;
            editarCategoria.value = boton.dataset.categoria;
            editarStock.value = boton.dataset.stock;
        });
    });

    document.querySelectorAll('.form-eliminar').forEach(formulario => {
        formulario.addEventListener('submit', (evento) => {
            if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) {
                evento.preventDefault();
            }
        });
    });
}

window.addEventListener('DOMContentLoaded', () => {
    if (buscador && buscador.value.length > 0) {
        buscador.focus();
        const val = buscador.value;
        buscador.value = '';
        buscador.value = val;
    }
});
