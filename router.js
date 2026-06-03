const express = require('express');
const router = express.Router();
const stockController = require('./controllers/stock');
const loginController = require('./controllers/login');
const productosController = require('./controllers/productos');
const conexion = require('./database/db'); // Importante para la ruta /historial

// Rutas para las operaciones de productos
router.get('/api/productos', stockController.obtenerProductos);
router.post('/api/actualizar-stock', stockController.actualizarStock);
router.get('/api/producto-existe', productosController.verificarIdProducto);
router.post('/login', loginController.iniciarSesion);


// pagina de historial, cargamos los datos de la tabla articulo y los pasamos a la vista historial.ejs con paginación
router.get('/historial', async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const busqueda = req.query.buscar || '';
        const limite = 10; // Número de artículos por página
        const desde = (pagina - 1) * limite;
        const hasta = desde + limite - 1;

        let consultaConteo = conexion.from('articulo').select('*', {count: 'exact', head: true});
        let consultaDatos = conexion.from('articulo').select('*');

        if (busqueda) {
            consultaConteo = consultaConteo.ilike('nombre', `%${busqueda}%`);
            consultaDatos = consultaDatos.ilike('nombre', `%${busqueda}%`);
        }

        // Obtener el total de registros para calcular las páginas
        const {count, error: errorConteo} = await consultaConteo;

        if (errorConteo) {
            return res.status(500).send('Error al cargar historial');
        }

        const totalPaginas = Math.ceil(count / limite);

        const {data, error} = await consultaDatos
            .order('id_producto', {ascending: true})
            .range(desde, hasta);

        if (error) {
            return res.status(500).send('Error fallido al cargar historial');
        }

        res.render('historial', {
            articulos: data,
            paginaActual: pagina,
            totalPaginas: totalPaginas,
            busqueda: busqueda,
            layout: req.query.ajax ? false : undefined // Esto es para algunos motores, pero en EJS lo manejaremos en la vista o enviando solo el render
        });
    } catch (error) {
        res.status(500).send('Error fallido al cargar historial');
    }
});

//página de escaneo
router.get('/escaneo', (req, res) => {
    res.render('escaneo'); // Renderiza escaneo.ejs
});

//página de selección
router.get('/seleccion', (req, res) => {
    res.render('seleccion');
});

// CRUD de productos (controlador Node.js)
router.get('/productos', productosController.listar);
router.get('/productos/crear', productosController.mostrarCrear);
router.post('/productos/guardar', productosController.guardar);
router.get('/productos/editar/:id_producto', productosController.mostrarEditar);
router.post('/productos/actualizar', productosController.actualizar);
router.get('/productos/eliminar/:id_producto', productosController.eliminar);

// disminuir stock desde el historial, con el id del producto
router.get('/disminuir/:id', async (req, res) => {
    const idProducto = req.params.id;

    try {
        const {data: producto, error: errorFetch} = await conexion
            .from('articulo')
            .select('stock')
            .eq('id_producto', idProducto)
            .single();

        if (errorFetch || !producto) {
            return res.status(404).send('Producto no encontrado');
        }

        const nuevoStock = Math.max((producto.stock || 0) - 1, 0);
        const {error: errorUpdate} = await conexion
            .from('articulo')
            .update({stock: nuevoStock})
            .eq('id_producto', idProducto);

        if (errorUpdate) {
            return res.status(500).send(
                `Error al disminuir stock: ${errorUpdate.message} (${errorUpdate.code || 'sin código'})`
            );
        }

        res.redirect(`/historial?pagina=${req.query.pagina || 1}&buscar=${req.query.buscar || ''}`);
    } catch (error) {
        res.status(500).send('Error al disminuir stock');
    }
});

module.exports = router;
