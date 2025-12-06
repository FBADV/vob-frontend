const https = require('https');

const API_KEY = 'cDZHYzlZa0JadVREZDJCendQbXY6SkJlTzNjLV9TRENyQk1RdnFKZGRQdw==';
const URL = 'https://api-publica.datajud.cnj.jus.br/api_publica_tjam/_search';

// Exemplo de processo do TJAM (Tribunal de Justiça do Amazonas)
// Formato CNJ: 0636892-06.2020.8.04.0001
const payload = JSON.stringify({
    "query": {
        "match": {
            "numeroProcesso": "06368920620208040001"
        }
    }
});

const options = {
    method: 'POST',
    headers: {
        'Authorization': `APIKey ${API_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': payload.length
    }
};

console.log('Enviando requisição para DataJud (TJAM)...');

const req = https.request(URL, options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Resposta recebida:');
        try {
            const json = JSON.parse(data);
            console.log(JSON.stringify(json, null, 2));
        } catch (e) {
            console.log(data);
        }
    });
});

req.on('error', (error) => {
    console.error('Erro na requisição:', error);
});

req.write(payload);
req.end();
