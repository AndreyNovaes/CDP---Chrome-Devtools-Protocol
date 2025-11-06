#!/bin/bash

# test-cdp-simple.sh
# Script simples para testar se CDP está funcionando

echo "🔍 Testando Chrome DevTools Protocol..."
echo ""

# Teste 1: Verificar se porta 9222 está aberta
echo "1️⃣ Verificando porta 9222..."
if command -v nc &> /dev/null; then
  if nc -z 127.0.0.1 9222 2>/dev/null; then
    echo "   ✅ Porta 9222 está aberta"
  else
    echo "   ❌ Porta 9222 está fechada"
    echo "   💡 Execute: google-chrome --remote-debugging-port=9222 --user-data-dir=\"/tmp/chrome-debug\""
    exit 1
  fi
else
  echo "   ⚠️  'nc' não disponível, pulando teste de porta"
fi

echo ""

# Teste 2: Fazer request HTTP
echo "2️⃣ Testando HTTP endpoint..."
if command -v curl &> /dev/null; then
  HTTP_RESPONSE=$(curl -s http://localhost:9222/json/version)

  if [ $? -eq 0 ]; then
    echo "   ✅ HTTP endpoint respondendo"

    # Extrair informações (requer jq)
    if command -v jq &> /dev/null; then
      BROWSER=$(echo "$HTTP_RESPONSE" | jq -r '.Browser')
      WS_URL=$(echo "$HTTP_RESPONSE" | jq -r '.webSocketDebuggerUrl')
      echo "   📦 Navegador: $BROWSER"
      echo "   🔌 WebSocket: $WS_URL"
    else
      echo "$HTTP_RESPONSE"
    fi
  else
    echo "   ❌ Falha ao conectar"
    exit 1
  fi
else
  echo "   ❌ 'curl' não disponível"
  exit 1
fi

echo ""

# Teste 3: Listar páginas
echo "3️⃣ Listando páginas abertas..."
PAGES=$(curl -s http://localhost:9222/json/list)

if command -v jq &> /dev/null; then
  PAGE_COUNT=$(echo "$PAGES" | jq '. | length')
  echo "   📄 Páginas abertas: $PAGE_COUNT"

  if [ "$PAGE_COUNT" -gt 0 ]; then
    echo ""
    echo "   Primeira página:"
    echo "$PAGES" | jq -r '.[0] | "   - Título: \(.title)\n   - URL: \(.url)\n   - WebSocket: \(.webSocketDebuggerUrl)"'
  fi
else
  echo "$PAGES"
fi

echo ""
echo "✅ CDP está funcionando corretamente!"
echo ""
echo "🚀 Próximos passos:"
echo "   1. Instale dependências: npm install"
echo "   2. Execute exemplo: npm run example:01-basic"
echo "   3. Ou use wscat: wscat -c \$(curl -s http://localhost:9222/json/list | jq -r '.[0].webSocketDebuggerUrl')"
