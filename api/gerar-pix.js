export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  try {
    const { valor } = req.body;

    // A DOCUMENTAÇÃO EXIGE O VALOR COMO STRING COM 2 CASAS DECIMAIS (ex: "20.00")
    const valorFormatado = Number(valor).toFixed(2);

    const resposta = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
      },
      body: JSON.stringify({ valor: valorFormatado })
    });

    const texto = await resposta.text();

    try {
      const dados = JSON.parse(texto);
      
      // Se a NexPay retornar um erro (ex: chave inválida), repassa para o site
      if (!resposta.ok) {
        return res.status(resposta.status).json(dados);
      }
      
      return res.status(200).json(dados);
    } catch (erroParse) {
      // Se retornar HTML, mostra o erro nos logs
      console.error('NexPay retornou HTML:', texto.substring(0, 300));
      return res.status(500).json({
        error: `NexPay retornou HTML (Status ${resposta.status}).`,
        detalhes: 'Verifique a URL ou a chave de API.'
      });
    }

  } catch (erro) {
    console.error('Erro de rede:', erro);
    return res.status(500).json({ error: erro.message });
  }
}
