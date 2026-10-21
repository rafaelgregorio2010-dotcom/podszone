export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Pega os dados que o seu site enviou
    const body = req.body;

    // Faz a chamada para a NexPay
    const respostaNexPay = await fetch('https://api.nexpay.site/v1/cobrancas', { // Confira a URL correta na documentação deles
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}` // Puxa a chave secreta da Vercel
      },
      body: JSON.stringify(body)
    });

    const dados = await respostaNexPay.json();

    // Devolve a resposta para o seu site
    return res.status(respostaNexPay.status).json(dados);
    
  } catch (erro) {
    console.error(erro);
    return res.status(500).json({ error: 'Erro interno ao gerar PIX' });
  }
}
