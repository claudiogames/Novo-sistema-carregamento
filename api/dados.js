import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_URL_SEC;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY_SEC;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Erro de configuração: Variáveis de ambiente em falta na Vercel." });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Aceita vários nomes possíveis para o parâmetro (data, date, dia)
    const dataParam = req.query.data || req.query.date || req.query.dia;

    let query = supabase.from('controle_faltas_portao').select('*');

    // Se o frontend enviou uma data, filtra por ela. Se não enviou, traz os dados para evitar o erro.
    if (dataParam) {
      query = query.eq('data_operacao', dataParam);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Erro na consulta ao Supabase:", error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, data });

  } catch (err) {
    console.error("Erro interno no servidor:", err.message);
    return res.status(500).json({ error: "A server error occurred: " + err.message });
  }
}
