const conexion = require('../database/db');

// Controlador para hacer las operaciones de stock y obtener productos

// Controlador para obtener productos
exports.obtenerProductos = (req, res) => {
  const consulta = 'SELECT * FROM articulo';
  conexion.query(consulta, (error, resultados) => {
    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ 'Error al obtener los productos': error });
    }
    res.json(resultados);
  });
};

// Controlador para actualizar el stock, que aumenta en 1 
exports.actualizarStock = (req, res) => {
  const { idProducto } = req.body;

  const consultaSeleccion = 'SELECT stock FROM articulo WHERE id_producto = ?';
  conexion.query(consultaSeleccion, [idProducto], (error, resultados) => {
    if (error) {
      console.error('Error al obtener los datos de los productos:', error);
      return res.status(500).json({ error: 'Error al obtener los datos de los productos' });
    }

    if (resultados.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const nuevoStock = resultados[0].stock + 1;

    const consultaUpdateStock = 'UPDATE articulo SET stock = ? WHERE id_producto = ?';
    conexion.query(consultaUpdateStock, [nuevoStock, idProducto], (error) => {
      if (error) {
        console.error('Error al actualizar stock:', error);
        return res.status(500).json({ error: 'Error al actualizar stock' });
      }
      res.json({ idProducto, nuevoStock });
    });
  });
};
