const express = require('express');
const router = express.Router();
const stockController = require('./controllers/stock');
const loginController = require('./controllers/login');
const conexion = require('./database/db'); // Importante para la ruta /historial

// Rutas para las operaciones de productos
router.get('/api/productos', stockController.obtenerProductos);
router.post('/api/actualizar-stock', stockController.actualizarStock);
router.post('/login', loginController.iniciarSesion);


// pagina de historial, cargamos los datos de la tabla articulo y los pasamos a la vista historial.ejs
router.get('/historial', async (req, res) => {
    try {
        const { data, error } = await conexion
            .from('articulo')
            .select('*')
            .order('id_producto', { ascending: true });

        if (error) {
            console.error('Error al cargar historial:', error);
            return res.status(500).send('Error fallido al cargar historial');
        }

        res.render('historial', { articulos: data });
    } catch (error) {
        console.error('Error inesperado al cargar historial:', error);
        res.status(500).send('Error fallido al cargar historial');
    }
});

//página de escaneo
router.get('/escaneo', (req, res) => {
    res.render('escaneo'); // Renderiza escaneo.ejs
});

//página de selección
router.get('/seleccion', (req, res) => {
    console.log('Accediendo a /seleccion');
    res.render('seleccion');
});

// disminuir stock desde el historial, con el id del producto
router.get('/disminuir/:id', async (req, res) => {
    const idProducto = req.params.id;

    try {
        const { data: producto, error: errorFetch } = await conexion
            .from('articulo')
            .select('stock')
            .eq('id_producto', idProducto)
            .single();

        if (errorFetch || !producto) {
            console.error('Error al obtener el producto:', errorFetch);
            return res.status(404).send('Producto no encontrado');
        }

        const nuevoStock = Math.max((producto.stock || 0) - 1, 0);
        const { error: errorUpdate } = await conexion
            .from('articulo')
            .update({ stock: nuevoStock })
            .eq('id_producto', idProducto);

        if (errorUpdate) {
            console.error('Error al disminuir stock:', errorUpdate);
            return res.status(500).send(
                `Error al disminuir stock: ${errorUpdate.message} (${errorUpdate.code || 'sin código'})`
            );
        }

        res.redirect('/historial');
    } catch (error) {
        console.error('Error inesperado al disminuir stock:', error);
        res.status(500).send('Error al disminuir stock');
    }
});



module.exports = router;
