const conexion = require('../database/db');

const LIMITE_POR_PAGINA = 10;

async function consultarProductos(pagina, busqueda) {
    const limite = LIMITE_POR_PAGINA;
    const desde = (pagina - 1) * limite;
    const hasta = desde + limite - 1;

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
        totalPaginas: Math.ceil(count / limite)
    };
}

exports.mostrarPagina = async (req, res) => {
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
        console.error('Error al cargar productos:', err);
        res.status(500).send('Error al cargar productos');
    }
};

exports.crear = async (req, res) => {
    const pagina = req.body.pagina || 1;
    const busqueda = req.body.buscar || '';

    const idProducto = parseInt(req.body.id_producto, 10);
    const nombre = (req.body.nombre || '').trim();
    const categoria = (req.body.categoria || '').trim() || null;
    const stock = parseInt(req.body.stock, 10);

    if (isNaN(idProducto) || !nombre) {
        return res.redirect(
            `/productos?error=datos&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    }

    try {
        const {error} = await conexion.from('articulo').insert({
            id_producto: idProducto,
            nombre,
            categoria,
            stock: isNaN(stock) ? 0 : Math.max(stock, 0)
        });

        if (error) {
            console.error('Error al crear producto:', error);
            const codigo = error.code === '23505' ? 'duplicado' : 'crear';
            return res.redirect(
                `/productos?error=${codigo}&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
            );
        }

        res.redirect(
            `/productos?mensaje=creado&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    } catch (err) {
        console.error('Error inesperado al crear producto:', err);
        res.redirect(
            `/productos?error=crear&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    }
};

exports.actualizar = async (req, res) => {
    const idProducto = req.params.id;
    const pagina = req.body.pagina || 1;
    const busqueda = req.body.buscar || '';

    const nombre = (req.body.nombre || '').trim();
    const categoria = (req.body.categoria || '').trim() || null;
    const stock = parseInt(req.body.stock, 10);

    if (!nombre) {
        return res.redirect(
            `/productos?error=datos&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
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
            console.error('Error al actualizar producto:', error);
            return res.redirect(
                `/productos?error=actualizar&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
            );
        }

        res.redirect(
            `/productos?mensaje=actualizado&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    } catch (err) {
        console.error('Error inesperado al actualizar producto:', err);
        res.redirect(
            `/productos?error=actualizar&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    }
};

exports.eliminar = async (req, res) => {
    const idProducto = req.params.id;
    const pagina = req.body.pagina || 1;
    const busqueda = req.body.buscar || '';

    try {
        const {error} = await conexion
            .from('articulo')
            .delete()
            .eq('id_producto', idProducto);

        if (error) {
            console.error('Error al eliminar producto:', error);
            return res.redirect(
                `/productos?error=eliminar&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
            );
        }

        res.redirect(
            `/productos?mensaje=eliminado&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    } catch (err) {
        console.error('Error inesperado al eliminar producto:', err);
        res.redirect(
            `/productos?error=eliminar&pagina=${pagina}&buscar=${encodeURIComponent(busqueda)}`
        );
    }
};
