const conexion = require('../database/db');

// Controlador para hacer las operaciones de stock y obtener productos

// Controlador para obtener productos
exports.obtenerProductos = async (req, res) => {
  const { data, error } = await conexion
    .from('articulo')
    .select('*');

  if (error) {
    console.error('Error al obtener productos:', error);
    return res.status(500).json({ 'Error al obtener los productos': error.message });
  }
  res.json(data);
};

// Controlador para actualizar el stock, que aumenta en 1 
exports.actualizarStock = async (req, res) => {
  const { idProducto } = req.body;

  // Obtenemos el producto para saber su stock actual
  const { data: producto, error: errorFetch } = await conexion
    .from('articulo')
    .select('stock')
    .eq('id_producto', idProducto)
    .single();

  if (errorFetch || !producto) {
    console.error('Error al obtener el producto:', errorFetch);
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const nuevoStock = (producto.stock || 0) + 1;

  // Actualizamos el stock en Supabase
  const { error: errorUpdate } = await conexion
    .from('articulo')
    .update({ stock: nuevoStock })
    .eq('id_producto', idProducto);

  if (errorUpdate) {
    console.error('Error al actualizar stock:', errorUpdate);
    return res.status(500).json({ error: 'Error al actualizar stock' });
  }

  res.json({ idProducto, nuevoStock });
};
