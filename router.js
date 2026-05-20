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
router.get('/historial', (req, res) => {
    conexion.query('SELECT * FROM articulo', (err, resultados) => {
        if (err) {
            console.error('Error al cargar historial:', err);
            return res.status(500).send('Error fallido al cargar historial');
        }
        res.render('historial', { articulos: resultados }); // Renderiza historial.ejs
    });
});

//página de escaneo
router.get('/escaneo', (req, res) => {
    res.render('escaneo'); // Renderiza escaneo.ejs
});

// disminuir stock desde el historial, con el id del producto
router.get('/disminuir/:id', (req, res) => {
    const idProducto = req.params.id;
    const consulta = 'UPDATE articulo SET stock = stock - 1 WHERE id_producto = ?';
    conexion.query(consulta, [idProducto], (error, resultados) => {
        if (error) {
            console.error('Error al disminuir stock:', error);
            return res.status(500).send('Error al disminuir stock');
        }
        res.redirect('/historial');
    });
});



module.exports = router;
