export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { valor } = req.body;
  const chave = process.env.NEXPAY_SECRET_KEY;

  const urls = [
    'https://nexpay.site/api/charge_create.php',
    'https://www.nexpay.site/api/charge_create.php'
  ];

  const metodos = ['POST', 'GET'];

  for (const url of urls) {
    for (const metodo of metodos) {
      try {
        console.log(`Testando ${metodo} em ${url}`);
        
        const opcoes = {
          method: metodo,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${chave}`
          }
        };

        // Se for POST, envia o corpo com o valor
        if (metodo === 'POST') {
          opcoes.body = JSON.stringify({ valor: valor });
        }

        const resposta = await fetch(url, opcoes);
        const texto = await resposta.text();

        console.log(`STATUS ${resposta.status} (${metodo} ${url})`);
        console.log(`RESPOSTA: ${texto.substring(0, 200)}`);

        // Se a resposta for JSON válido, retornamos imediatamente
        if (texto.trim().startsWith('{')) {
          try {
            const dados = JSON.parse(texto);
            if (resposta.ok) {
              return res.status(200).json(dados);
            }
            // Se for JSON de erro, retornamos o erro específico
            return res.status(resposta.status).json(dados);
          } catch (e) {
            // Ignora erro de parse e continua testando
          }
        }

      } catch (erro) {
        console.error(`Erro de rede em ${metodo} ${url}:`, erro.message);
      }
    }
  }

  return res.status(500).json({
    error: 'Nenhuma combinação de URL e método retornou JSON válido. Verifique os logs da Vercel para ver os status exatos.'
  });
                              }
