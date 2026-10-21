module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { valor } = req.body;
  const SECRET_KEY = process.env.NEXPAY_SECRET_KEY;

  try {
    const response = await fetch('https://www.nexpay.site/api/charge_create.php', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ valor: valor.toFixed(2) })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao gerar PIX' });
  }
};
