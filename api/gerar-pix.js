export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { valor } = req.body;
    const apiKey = process.env.NEXPAY_SECRET_KEY;

    // URL correta conforme a documentação da NexPay
    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ valor: valor })
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
      return res.status(resposta.status).json({ 
        error: dados.message || dados.error || 'Erro retornado pela NexPay' 
      });
    }

    return res.status(200).json(dados);

  } catch (erro) {
    console.error('Erro no backend:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
