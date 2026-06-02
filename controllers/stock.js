const conexion = require('../database/db');

// Controlador para hacer las operaciones de stock y obtener productos

// Controlador para obtener productos con paginación opcional
exports.obtenerProductos = async (req, res) => {
    const pagina = parseInt(req.query.pagina);
    const limite = parseInt(req.query.limite) || 10;

    let consulta = conexion.from('articulo').select('*');

    if (!isNaN(pagina)) {
        const desde = (pagina - 1) * limite;
        const hasta = desde + limite - 1;
        consulta = consulta.range(desde, hasta);
    }

    const {data, error} = await consulta.order('id_producto', {ascending: true});

    if (error) {
        console.error('Error al obtener productos:', error);
        return res.status(500).json({'Error al obtener los productos': error.message});
    }
    res.json(data);
};

// Controlador para actualizar el stock, que aumenta o disminuye según la operación
exports.actualizarStock = async (req, res) => {
    const {idProducto, operacion} = req.body; // operacion: 'sumar' o 'restar'

    // Obtenemos el producto para saber su stock actual
    const {data: producto, error: errorFetch} = await conexion
        .from('articulo')
        .select('stock')
        .eq('id_producto', idProducto)
        .single();

    if (errorFetch || !producto) {
        console.error('Error al obtener el producto:', errorFetch);
        return res.status(404).json({error: 'Producto no encontrado'});
    }

    let nuevoStock;
    if (operacion === 'restar') {
        nuevoStock = Math.max((producto.stock || 0) - 1, 0);
    } else {
        nuevoStock = (producto.stock || 0) + 1;
    }

    // Actualizamos el stock en Supabase
    const {error: errorUpdate} = await conexion
        .from('articulo')
        .update({stock: nuevoStock})
        .eq('id_producto', idProducto);

    if (errorUpdate) {
        console.error('Error al actualizar stock:', errorUpdate);
        return res.status(500).json({
            error: 'Error al actualizar stock',
            detalle: errorUpdate.message,
            codigo: errorUpdate.code
        });
    }

    res.json({idProducto, nuevoStock});
};
