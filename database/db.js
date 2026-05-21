const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://uhdbkfgnepaauhucumic.supabase.co';
const supabaseKey = 'sb_publishable_a23fjDalU-_zbV9OU5O6-w_m0jqiJBl';

// Crear el cliente de Supabase
const conexion = createClient(supabaseUrl, supabaseKey);

module.exports = conexion;