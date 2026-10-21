export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { valor } = req.body;
    
    // Tenta conectar com a NexPay
    const resposta = await fetch('https://api.nexpay.site/v1/cobrancas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
      },
      body: JSON.stringify({ valor: valor })
    });

    const dados = await resposta.json();
    return res.status(resposta.status).json(dados);

  } catch (erro) {
    // Se der erro de conexão, isso vai aparecer no alerta do site
    return res.status(500).json({ error: erro.message, detalhes: erro.cause });
  }
}
