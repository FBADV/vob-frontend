# Backend - Integração Judicial VOB

Backend Node.js + Express para integração judicial com certificado digital A1.

## 🚀 Início Rápido

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 📁 Estrutura

```
src/
├── judicialIntegration/
│   ├── models/          # Interfaces TypeScript
│   ├── repositories/    # Camada de persistência
│   ├── services/        # Lógica de negócio
│   ├── routes/          # Endpoints HTTP
│   └── middleware/      # Interceptadores
├── app.ts              # Configuração Express
└── server.ts           # Inicialização do servidor
```

## 🔐 Segurança

- **Certificados A1**: Criptografados com AES-256-GCM
- **Senhas**: NUNCA armazenadas
- **HTTPS**: Obrigatório em produção
- **CORS**: Configurável via env

## 📡 APIs Principais

### Advogados

- `PUT /api/judicial/advogados/:id/oab` - Atualizar OAB
- `POST /api/judicial/advogados/:id/certificado` - Upload certificado A1
- `GET /api/judicial/advogados/:id/teste-conexao` - Testar mTLS

Mais APIs em desenvolvimento (onboarding, clientes, sincronização).

## ⚙️ Variáveis de Ambiente

Ver `.env.example` para lista completa.

**Obrigatórias:**
- `CRYPTO_KEY`: Chave criptografia (min 32 chars)
- `PORT`: Porta do servidor
- `FRONTEND_URL`: URL do frontend para CORS

## 🧪 Testes

```bash
# Testes unitários (futuro)
npm test

# Testes via HTTP
# Ver TESTING.md
```

## 📚 Documentação Técnica

Ver planos de implementação em `/artifacts/brain/`:
- `plano_final_consolidado.md`
- `plano_revisado_integracao_judicial_seguro.md`

## 🔄 Próximas Fases

- [ ] Repositórios restantes (Processo, Parte, Cliente, Movimentação)
- [ ] SincronizacaoService com mocks
- [ ] OnboardingService
- [ ] ClienteService
- [ ] Rotas completas de onboarding
- [ ] Frontend React components

## 📝 Licença

PROPRIETARY - Virtual Office Brasil
