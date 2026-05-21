const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Crear el cliente de Supabase
const conexion = createClient(supabaseUrl, supabaseKey);

module.exports = conexion;