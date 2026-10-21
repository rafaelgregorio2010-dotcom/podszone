export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega o txid que o frontend enviou
    const { id } = req.query; 
    const apiKey = process.env.NEXPAY_SECRET_KEY;

    // URL correta para consultar o status
    const resposta = await fetch(`https://www.nexpay.site/api/charge_status.php?txid=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({ 
        error: dados.message || dados.error || 'Erro ao consultar status' 
      });
    }

    return res.status(200).json(dados);

  } catch (erro) {
    console.error('Erro na checagem:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
