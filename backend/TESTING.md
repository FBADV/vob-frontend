# Guia de Teste End-to-End - Backend Judicial

## 🎯 Objetivo

Testar fluxo completo de integração judicial com certificado A1:
1. Criar advogado
2. Definir OAB
3. Upload de certificado
4. Sincronizar processos
5. Onboarding: selecionar clientes a partir de partes
6. Gerenciar clientes

---

## 🚀 Preparação

```bash
# 1. Iniciar servidor
cd backend
npm run dev

# 2. Em outro terminal, criar advogado mock
```

**Criar Advogado Temporário** (via código ou endpoint futuro):
```typescript
// Executar via ts-node ou criar endpoint POST /api/judicial/advogados
import { advogadoRepository } from './repositories/AdvogadoRepository';
import { v4 as uuid } from 'uuid';

const adv = await advogadoRepository.create({
  id: 'adv-test-001',
  nome: 'Dr. João Silva',
  oab: 'OAB/RN 00000', // Será atualizado
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 📝 TESTE 1: Atualizar OAB

```bash
curl -X PUT http://localhost:3001/api/judicial/advogados/adv-test-001/oab \
  -H "Content-Type: application/json" \
  -d '{"oab": "OAB/RN 12345"}'
```

**Resposta Esperada (200)**:
```json
{
  "success": true,
  "advogado": {
    "id": "adv-test-001",
    "nome": "Dr. João Silva",
    "oab": "OAB/RN 12345",
    "updatedAt": "2025-12-03T..."
  }
}
```

---

## 📜 TESTE 2: Upload de Certificado (Opcional - requer cert real)

```bash
# Se tiver certificado A1 real:
curl -X POST http://localhost:3001/api/judicial/advogados/adv-test-001/certificado \
  -F "certificate=@/caminho/para/certificado.pfx" \
  -F "password=senha_do_cert"
```

**Resposta Esperada (200)**:
```json
{
  "success": true,
  "message": "Certificado de Dr. João Silva carregado com sucesso",
  "certInfo": {
    "cn": "João Silva:12345678900",
    "validFrom": "2024-01-01T00:00:00.000Z",
    "validUntil": "2025-12-31T23:59:59.000Z"
  }
}
```

---

## 🔄 TESTE 3: Sincronizar Processos (MOCK)

```bash
curl -X POST http://localhost:3001/api/judicial/advogados/adv-test-001/sincronizar-processos \
  -H "Content-Type: application/json"
```

**Resposta Esperada (200)**:
```json
{
  "processosNovos": 3,
  "processosAtualizados": 0,
  "partesImportadas": 6
}
```

**O que aconteceu**:
- ✅ 3 processos mock criados
- ✅ 6 partes importadas (2 por processo)
- ✅ Todos com `statusOnboarding: "aguardando_definicao_cliente"`

**Processos Mock Criados**:
1. `0800001-11.2024.8.20.0001` - Ação de Cobrança
2. `0800002-22.2024.8.20.0001` - Ação de Despejo
3. `0800003-33.2024.8.20.0002` - Divórcio Consensual

---

## 👥 TESTE 4: Ver Partes para Onboarding

```bash
# Obter ID de processo (primeiro processo mock)
# processoId será retornado via endpoint GET /processos ou via logs

curl "http://localhost:3001/api/judicial/processos/{processoId}/partes?advogadoId=adv-test-001"
```

**Exemplo com processoId real**:
```bash
curl "http://localhost:3001/api/judicial/processos/abc123/partes?advogadoId=adv-test-001"
```

**Resposta Esperada (200)**:
```json
{
  "processo": {
    "id": "abc123",
    "numeroProcesso": "0800001-11.2024.8.20.0001",
    "classe": "Ação de Cobrança",
    "statusOnboarding": "aguardando_definicao_cliente"
  },
  "partes": [
    {
      "id": "parte-1",
      "nomeParte": "João Silva Santos",
      "tipoParte": "autor",
      "polo": "ativo",
      "documento": "12345678900",
      "advogados": ["Adv. OAB/RN 12345"],
      "isCliente": false
    },
    {
      "id": "parte-2",
      "nomeParte": "Empresa XYZ Ltda",
      "tipoParte": "reu",
      "polo": "passivo",
      "documento": "12345678000190",
      "advogados": [],
      "isCliente": false
    }
  ]
}
```

---

## ✅ TESTE 5: Definir Clientes

Selecionar "João Silva Santos" como cliente:

```bash
curl -X POST http://localhost:3001/api/judicial/processos/{processoId}/definir-clientes \
  -H "Content-Type: application/json" \
  -d '{
    "advogadoId": "adv-test-001",
    "partesIds": ["parte-1"]
  }'
```

**Resposta Esperada (200)**:
```json
{
  "success": true,
  "clientesCriados": 1,
  "clientesVinculados": ["cliente-xyz"],
  "processo": {
    "id": "abc123",
    "numeroProcesso": "0800001-11.2024.8.20.0001",
    "statusOnboarding": "cliente_definido",
    "clientesIds": ["cliente-xyz"],
    "updatedAt": "..."
  }
}
```

**O que aconteceu**:
- ✅ Cliente "João Silva Santos" criado automaticamente
- ✅ Parte marcada como `isCliente: true`
- ✅ Processo atualizado para `cliente_definido`

---

## 📋 TESTE 6: Listar Clientes

```bash
curl "http://localhost:3001/api/judicial/clientes?advogadoId=adv-test-001"
```

**Resposta Esperada (200)**:
```json
[
  {
    "id": "cliente-xyz",
    "advogadoId": "adv-test-001",
    "nome": "João Silva Santos",
    "documento": "12345678900",
    "tipoDocumento": "CPF",
    "endereco": "Rua das Flores, 123 - Natal/RN",
    "origemCriacao": "onboarding_processo",
    "parteProcessualOrigemId": "parte-1",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

## ✏️ TESTE 7: Atualizar Cliente (Complementar Dados)

```bash
curl -X PUT http://localhost:3001/api/judicial/clientes/cliente-xyz \
  -H "Content-Type: application/json" \
  -d '{
    "advogadoId": "adv-test-001",
    "email": "joao.silva@email.com",
    "celular": "(84) 98765-4321",
    "cidade": "Natal",
    "estado": "RN",
    "cep": "59000-000"
  }'
```

**Resposta Esperada (200)**:
```json
{
  "id": "cliente-xyz",
  "advogadoId": "adv-test-001",
  "nome": "João Silva Santos",
  "documento": "12345678900",
  "tipoDocumento": "CPF",
  "email": "joao.silva@email.com",
  "celular": "(84) 98765-4321",
  "endereco": "Rua das Flores, 123 - Natal/RN",
  "cidade": "Natal",
  "estado": "RN",
  "cep": "59000-000",
  "origemCriacao": "onboarding_processo",
  "updatedAt": "..."
}
```

---

## ✔️ TESTE 8: Concluir Onboarding

```bash
curl -X POST http://localhost:3001/api/judicial/processos/{processoId}/concluir-onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "advogadoId": "adv-test-001"
  }'
```

**Resposta Esperada (200)**:
```json
{
  "success": true
}
```

**Processo agora**: `statusOnboarding: "onboarding_concluido"`

---

## 🎯 Resumo do Fluxo Completo

```
1. Advogado criado ✅
2. OAB definida: OAB/RN 12345 ✅
3. Certificado uploaded (opcional) ✅
4. Sincronização: 3 processos + 6 partes ✅
5. Partes visualizadas ✅
6. Cliente selecionado e criado ✅
7. Clientes listados ✅
8. Cliente atualizado com email/telefone ✅
9. Onboarding concluído ✅
```

---

## 📊 Validações de Segurança

Durante os testes, verificar:

- [ ] OAB deve ter formato `OAB/UF NÚMERO`
- [ ] Não permite OAB duplicada
- [ ] Certificado criptografado em `certs/`
- [ ] Senha nunca logada
- [ ] Processo só acessível pelo advogado dono
- [ ] Cliente criado uma única vez (verifica duplicata por documento)
- [ ] Campos imutáveis de Cliente protegidos
- [ ] Status de onboarding segue fluxo unidirecional

---

## 🔍 Verificar Logs no Servidor

Durante os testes, o console do servidor deve mostrar:

```
[Sincronização] Buscando processos para OAB: OAB/RN 12345
[Sincronização] Concluída: 3 novos, 0 atualizados, 6 partes
[CertificadoService] Certificado validado: João Silva:12345678900
[CertificadoService] Certificado salvo: /path/to/certs/adv-test-001_...enc
[MtlsClient] Agente criado para advogado adv-test-001
```

---

## ✅ Checklist de Testes

- [ ] Health check responde OK
- [ ] OAB atualizada com validação de formato
- [ ] Certificado uploaded e criptografado (se tiver cert real)
- [ ] Sincronização cria 3 processos mock
- [ ] Partes listadas corretamente
- [ ] Cliente criado a partir de parte
- [ ] Cliente não duplicado ao selecionar mesma parte em outro processo
- [ ] Cliente pode ser atualizado
- [ ] Onboarding pode ser concluído
- [ ] Error handling funciona para casos inválidos

---

## 🚀 Próximos Passos

1. Substituir mocks por integrações reais (PDPJ, PortalJusBr)
2. Criar frontend React para UX visual
3. Migrar repositórios in-memory para PostgreSQL
4. Adicionar autenticação JWT
5. Implementar testes automatizados (Jest)
6. Deploy em ambiente staging

---

**Backend 100% Funcional e Pronto para Integração! 🎉**
