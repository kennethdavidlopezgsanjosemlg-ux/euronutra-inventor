const conexion = require('../database/db');
const LIMITE_POR_PAGINA = 10; // Constante para el número de productos por página

function redireccionListado(pagina, busqueda, extra = '') {
    const buscarParam = busqueda ? `&buscar=${encodeURIComponent(busqueda)}` : '';
    const extraParam = extra ? `&${extra}` : '';
    return `/productos?pagina=${pagina}${buscarParam}${extraParam}`;
}

// Función para consultar productos con paginación
async function consultarProductos(pagina, busqueda) {
    const desde = (pagina - 1) * LIMITE_POR_PAGINA;
    const hasta = desde + LIMITE_POR_PAGINA - 1;

    let consultaConteo = conexion.from('articulo').select('*', {count: 'exact', head: true});
    let consultaDatos = conexion.from('articulo').select('*');

    if (busqueda) {
        consultaConteo = consultaConteo.ilike('nombre', `%${busqueda}%`);
        consultaDatos = consultaDatos.ilike('nombre', `%${busqueda}%`);
    }

    const {count, error: errorConteo} = await consultaConteo;
    if (errorConteo) throw errorConteo;

    const {data, error} = await consultaDatos
        .order('id_producto', {ascending: true})
        .range(desde, hasta);

    if (error) throw error;

    return {
        productos: data,
        totalPaginas: Math.ceil(count / LIMITE_POR_PAGINA)
    };
}

// Controladores para productos
exports.listar = async (req, res) => {
    try {
        const pagina = parseInt(req.query.pagina) || 1;
        const busqueda = req.query.buscar || '';
        const {productos, totalPaginas} = await consultarProductos(pagina, busqueda);

        res.render('productos', {
            productos,
            paginaActual: pagina,
            totalPaginas,
            busqueda,
            mensaje: req.query.mensaje || '',
            error: req.query.error || ''
        });
    } catch (err) {
        res.status(500).send('Error al cargar productos');
    }
};

// Controladores para crear, editar, eliminar productos

exports.mostrarCrear = (req, res) => {
    res.render('crear-producto', {
        paginaActual: req.query.pagina || 1,
        busqueda: req.query.buscar || ''
    });
};

exports.guardar = async (req, res) => {
    const pagina = req.body.pagina || 1;
    const busqueda = req.body.buscar || '';

    const idProducto = parseInt(req.body.id_producto, 10);
    const nombre = (req.body.nombre || '').trim();
    const categoria = (req.body.categoria || '').trim() || null;
    const stock = parseInt(req.body.stock, 10);

    if (isNaN(idProducto) || !nombre) {
        return res.redirect(redireccionListado(pagina, busqueda, 'error=datos'));
    }

    try {
        const {error} = await conexion.from('articulo').insert({
            id_producto: idProducto,
            nombre,
            categoria,
            stock: isNaN(stock) ? 0 : Math.max(stock, 0)
        });

        if (error) {
            const codigo = error.code === '23505' ? 'duplicado' : 'crear';
            return res.redirect(redireccionListado(pagina, busqueda, `error=${codigo}`));
        }

        res.redirect(redireccionListado(pagina, busqueda, 'mensaje=creado'));
    } catch (err) {
        res.redirect(redireccionListado(pagina, busqueda, 'error=crear'));
    }
};

exports.mostrarEditar = async (req, res) => {
    const idProducto = req.params.id_producto;

    try {
        const {data: producto, error} = await conexion
            .from('articulo')
            .select('*')
            .eq('id_producto', idProducto)
            .single();

        if (error || !producto) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('editar-producto', {
            producto,
            paginaActual: req.query.pagina || 1,
            busqueda: req.query.buscar || ''
        });
    } catch (err) {
        res.status(500).send('Error al cargar el producto');
    }
};

// Controlador para verificar si un ID de producto existe
exports.verificarIdProducto = async (req, res) => {
    const idProducto = parseInt(req.query.id, 10);

    if (isNaN(idProducto)) {
        return res.status(400).json({error: 'ID inválido'});
    }

    try {
        const {data: producto, error} = await conexion
            .from('articulo')
            .select('id_producto')
            .eq('id_producto', idProducto)
            .maybeSingle();

        if (error) {
            return res.status(500).json({error: 'Error al verificar ID'});
        }

        res.json({exists: !!producto});
    } catch (err) {
        res.status(500).json({error: 'Error interno'});
    }
};

// Controlador para actualizar un producto
exports.actualizar = async (req, res) => {
    const idProducto = req.body.id_producto;
    const pagina = req.body.pagina || 1;
    const busqueda = req.body.buscar || '';

    const nombre = (req.body.nombre || '').trim();
    const categoria = (req.body.categoria || '').trim() || null;
    const stock = parseInt(req.body.stock, 10);

    if (!nombre) {
        return res.redirect(redireccionListado(pagina, busqueda, 'error=datos'));
    }

    try {
        const {error} = await conexion
            .from('articulo')
            .update({
                nombre,
                categoria,
                stock: isNaN(stock) ? 0 : Math.max(stock, 0)
            })
            .eq('id_producto', idProducto);

        if (error) {
            return res.redirect(redireccionListado(pagina, busqueda, 'error=actualizar'));
        }

        res.redirect(redireccionListado(pagina, busqueda, 'mensaje=actualizado'));
    } catch (err) {
        res.redirect(redireccionListado(pagina, busqueda, 'error=actualizar'));
    }
};

// Controlador para eliminar un producto
exports.eliminar = async (req, res) => {
    const idProducto = req.params.id_producto;
    const pagina = req.query.pagina || 1;
    const busqueda = req.query.buscar || '';

    try {
        const {error} = await conexion
            .from('articulo')
            .delete()
            .eq('id_producto', idProducto);

        if (error) {
            return res.redirect(redireccionListado(pagina, busqueda, 'error=eliminar'));
        }

        res.redirect(redireccionListado(pagina, busqueda, 'mensaje=eliminado'));
    } catch (err) {
        res.redirect(redireccionListado(pagina, busqueda, 'error=eliminar'));
    }
};
