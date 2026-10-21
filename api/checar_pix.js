export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido. Use GET.' });
  }

  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: 'O parâmetro id (txid) é obrigatório.' });
    }

    const resposta = await fetch(`https://www.nexpay.site/api/charge_status.php?txid=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
      }
    });

    const texto = await resposta.text();
    
    try {
      const dados = JSON.parse(texto);
      return res.status(resposta.status).json(dados);
    } catch (erroParse) {
      return res.status(500).json({
        error: `Erro na NexPay (Status ${resposta.status})`,
        detalhes: "A NexPay retornou HTML em vez de JSON."
      });
    }
  } catch (erro) {
    return res.status(500).json({ error: erro.message });
  }
}
