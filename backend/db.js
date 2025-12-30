const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'your_supabase_project_url' || supabaseKey === 'your_supabase_anon_key') {
    console.error('❌ Missing or invalid Supabase credentials in .env file');
    console.log('Please add valid SUPABASE_URL and SUPABASE_ANON_KEY to your .env file');
    console.log('Get them from: Supabase Dashboard → Settings → API');
    console.log('Current URL:', supabaseUrl);
    console.log('Current Key length:', supabaseKey ? supabaseKey.length : 0, '(should be ~200+ characters)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Wrapper to maintain pg-like query interface
const db = {
    query: async (text, params) => {
        // Parse the SQL query to determine the operation
        const trimmedQuery = text.trim().toUpperCase();
        
        if (trimmedQuery.startsWith('SELECT')) {
            return handleSelect(text, params);
        } else if (trimmedQuery.startsWith('INSERT')) {
            return handleInsert(text, params);
        } else if (trimmedQuery.startsWith('UPDATE')) {
            return handleUpdate(text, params);
        } else if (trimmedQuery.startsWith('DELETE')) {
            return handleDelete(text, params);
        } else if (trimmedQuery.startsWith('BEGIN') || trimmedQuery.startsWith('COMMIT') || trimmedQuery.startsWith('ROLLBACK')) {
            // Supabase handles transactions automatically
            return { rows: [] };
        } else {
            throw new Error('Unsupported query type');
        }
    }
};

async function handleSelect(text, params) {
    // Extract table name from SELECT query
    const tableMatch = text.match(/FROM\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name');
    
    const tableName = tableMatch[1];
    let query = supabase.from(tableName).select('*');
    
    // Handle WHERE clause with parameters
    if (params && params.length > 0) {
        if (text.includes('WHERE email =')) {
            query = query.eq('email', params[0]);
        } else if (text.includes('WHERE user_id =')) {
            query = query.eq('user_id', params[0]);
        } else if (text.includes('WHERE id =')) {
            query = query.eq('id', params[0]);
        }
    }
    
    // Handle ORDER BY
    if (text.includes('ORDER BY')) {
        const orderMatch = text.match(/ORDER BY\s+\w+\.(\w+)\s+(DESC|ASC)/i);
        if (orderMatch) {
            const column = orderMatch[1];
            const ascending = orderMatch[2].toUpperCase() === 'ASC';
            query = query.order(column, { ascending });
        }
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return { rows: data || [] };
}

async function handleInsert(text, params) {
    const tableMatch = text.match(/INSERT INTO\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name');
    
    const tableName = tableMatch[1];
    const columnsMatch = text.match(/\(([^)]+)\)/);
    if (!columnsMatch) throw new Error('Could not parse columns');
    
    const columns = columnsMatch[1].split(',').map(c => c.trim());
    const insertData = {};
    
    columns.forEach((col, idx) => {
        if (params[idx] !== undefined) {
            insertData[col] = params[idx];
        }
    });
    
    const { data, error } = await supabase
        .from(tableName)
        .insert(insertData)
        .select();
    
    if (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            const err = new Error(error.message);
            err.code = '23505';
            throw err;
        }
        throw error;
    }
    
    return { rows: data || [] };
}

async function handleUpdate(text, params) {
    const tableMatch = text.match(/UPDATE\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name');
    
    const tableName = tableMatch[1];
    const setMatch = text.match(/SET\s+(.+?)\s+WHERE/is);
    if (!setMatch) throw new Error('Could not parse SET clause');
    
    // Parse SET clause
    const updateData = {};
    const setClause = setMatch[1];
    const assignments = setClause.split(',');
    
    let paramIndex = 0;
    assignments.forEach(assignment => {
        const [column] = assignment.split('=').map(s => s.trim());
        if (column && column !== 'updated_at') {
            updateData[column] = params[paramIndex++];
        }
    });
    
    // Parse WHERE clause
    const whereMatch = text.match(/WHERE\s+(.+?)(?:RETURNING|$)/is);
    let query = supabase.from(tableName).update(updateData);
    
    if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        if (whereClause.includes('user_id =')) {
            query = query.eq('user_id', params[params.length - 1]);
        } else if (whereClause.includes('id =')) {
            query = query.eq('id', params[params.length - 1]);
        }
    }
    
    const { data, error } = await query.select();
    if (error) throw error;
    
    return { rows: data || [] };
}

async function handleDelete(text, params) {
    const tableMatch = text.match(/DELETE FROM\s+(\w+)/i);
    if (!tableMatch) throw new Error('Could not parse table name');
    
    const tableName = tableMatch[1];
    let query = supabase.from(tableName).delete();
    
    if (params && params.length > 0) {
        if (text.includes('WHERE id =')) {
            query = query.eq('id', params[0]);
        } else if (text.includes('WHERE user_id =')) {
            query = query.eq('user_id', params[0]);
        }
    }
    
    const { data, error } = await query.select();
    if (error) throw error;
    
    return { rows: data || [] };
}

module.exports = db;
module.exports.supabase = supabase;
