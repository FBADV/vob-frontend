#!/bin/bash

# Script de teste DataJud - VOB Alaska
# Testa se a captura de processos está funcionando

echo "🔍 Testando Captura DataJud..."
echo ""

# URL do backend
BACKEND_URL="http://localhost:3001"

# Criar advogado de teste
echo "1️⃣ Criando advogado de teste..."
ADVOGADO_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/judicial/advogados \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Advogado Teste DataJud",
    "oab": "12345/RN",
    "email": "teste@datajud.com"
  }')

echo "Resposta: $ADVOGADO_RESPONSE"
echo ""

# Extrair ID do advogado (assumindo JSON)
ADVOGADO_ID=$(echo $ADVOGADO_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$ADVOGADO_ID" ]; then
    echo "❌ Erro: Não foi possível criar advogado"
    exit 1
fi

echo "✅ Advogado criado: ID = $ADVOGADO_ID"
echo ""

# Sincronizar processos
echo "2️⃣ Sincronizando processos via DataJud..."
SYNC_RESPONSE=$(curl -s -X POST ${BACKEND_URL}/api/judicial/advogados/${ADVOGADO_ID}/sincronizar \
  -H "Content-Type: application/json" \
  -d '{"tribunal":"DATAJUD"}')

echo "Resposta: $SYNC_RESPONSE"
echo ""

# Aguardar processamento
echo "⏳ Aguardando 3 segundos..."
sleep 3
echo ""

# Buscar processos
echo "3️⃣ Buscando processos capturados..."
PROCESSOS_RESPONSE=$(curl -s ${BACKEND_URL}/api/judicial/advogados/${ADVOGADO_ID}/processos)

echo "Resposta: $PROCESSOS_RESPONSE"
echo ""

# Verificar se há processos
PROCESSOS_COUNT=$(echo $PROCESSOS_RESPONSE | grep -o '"numeroProcesso"' | wc -l)

if [ $PROCESSOS_COUNT -gt 0 ]; then
    echo "✅ Sucesso! $PROCESSOS_COUNT processo(s) capturado(s)"
else
    echo "⚠️ Nenhum processo capturado"
    echo ""
    echo "Possíveis causas:"
    echo "- API Key do DataJud inválida"
    echo "- OAB não tem processos"
    echo "- Delay de indexação do DataJud"
fi

echo ""
echo "✅ Teste concluído!"
