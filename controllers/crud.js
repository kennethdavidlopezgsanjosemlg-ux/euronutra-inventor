const conexion = require('../database/db');

exports.listar = async (req, res) => {
    const {data, error} = await conexion
        .from('articulo')
        .select('*')
        .order('id_producto', {ascending: true});

    if (error) {
        console.error('Error al listar productos:', error);
        return res.status(500).send('Error al cargar productos');
    }

    res.render('productos', {results: data});
};

exports.save = async (req, res) => {
    const {nombre, precio, categoria} = req.body;

    const {error} = await conexion.from('articulo').insert({
        nombre,
        precio: parseFloat(precio),
        categoria,
        stock: 0
    });

    if (error) {
        console.error('Error al guardar el articulo:', error);
        return res.status(500).send('Error al guardar el articulo');
    }

    res.redirect('/crudProductos');
};

exports.update = async (req, res) => {
    const {id_producto, nombre, precio, categoria} = req.body;

    const {error} = await conexion
        .from('articulo')
        .update({
            nombre,
            precio: parseFloat(precio),
            categoria
        })
        .eq('id_producto', id_producto);

    if (error) {
        console.error('Error al actualizar el articulo:', error);
        return res.status(500).send('Error al actualizar el articulo');
    }

    res.redirect('/crudProductos');
};

exports.mostrarEditar = async (req, res) => {
    const id = req.params.id_producto;

    const {data, error} = await conexion
        .from('articulo')
        .select('*')
        .eq('id_producto', id)
        .single();

    if (error || !data) {
        console.error('Error al obtener articulo:', error);
        return res.status(404).send('Artículo no encontrado');
    }

    res.render('edit', {articulo: data});
};

exports.eliminar = async (req, res) => {
    const id = req.params.id_producto;

    const {error} = await conexion
        .from('articulo')
        .delete()
        .eq('id_producto', id);

    if (error) {
        console.error('Error al eliminar articulo:', error);
        return res.status(500).send('Error al eliminar el articulo');
    }

    res.redirect('/crudProductos');
};

exports.obtenerPorId = async (req, res) => {
    const id = req.params.id;

    const {data, error} = await conexion
        .from('articulo')
        .select('*')
        .eq('id_producto', id)
        .single();

    if (error || !data) {
        return res.status(404).json({error: 'Producto no encontrado'});
    }

    res.json(data);
};
