export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { valor } = req.body;

  // Vamos testar as duas variações de URL mais prováveis
  const urlsParaTestar = [
    'https://nexpay.site/api/charge_create.php',
    'https://www.nexpay.site/api/charge_create.php'
  ];

  for (const url of urlsParaTestar) {
    try {
      console.log(`Testando URL: ${url}`);
      
      const resposta = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXPAY_SECRET_KEY}`
        },
        body: JSON.stringify({ valor: valor })
      });

      const texto = await resposta.text();
      
      // Loga o status e os primeiros 300 caracteres da resposta
      console.log(`STATUS ${resposta.status} para ${url}`);
      console.log(`RESPOSTA: ${texto.substring(0, 300)}`);

      // Se a resposta não for um erro de HTML, tentamos processar
      if (texto.trim().startsWith('{')) {
        const dados = JSON.parse(texto);
        if (resposta.ok) {
          return res.status(200).json(dados);
        }
        // Se for JSON de erro, paramos e retornamos
        return res.status(resposta.status).json(dados);
      }

    } catch (erro) {
      console.error(`Erro de rede em ${url}:`, erro.message);
    }
  }

  // Se todas as tentativas falharem
  return res.status(500).json({
    error: 'NexPay retornou página de erro HTML em todas as URLs testadas. Verifique os logs da Vercel para ver o status exato.'
  });
}
