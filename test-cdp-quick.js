// test-cdp-quick.js
// Teste rápido e simples do CDP usando apenas Node.js built-in fetch

async function quickTest() {
  console.log('🔍 Teste Rápido do CDP\n');

  try {
    // 1. Verificar versão do Chrome
    console.log('1️⃣ Verificando versão do Chrome...');
    const versionResponse = await fetch('http://localhost:9222/json/version');
    const version = await versionResponse.json();
    console.log(`   ✅ ${version.Browser}`);
    console.log(`   🔌 WebSocket: ${version.webSocketDebuggerUrl}\n`);

    // 2. Listar páginas abertas
    console.log('2️⃣ Listando páginas abertas...');
    const pagesResponse = await fetch('http://localhost:9222/json/list');
    const pages = await pagesResponse.json();
    console.log(`   ✅ ${pages.length} página(s) encontrada(s)\n`);

    if (pages.length === 0) {
      console.log('   ⚠️  Nenhuma página aberta');
      console.log('   💡 Abra uma aba no Chrome ou navegue para about:blank\n');
      return;
    }

    // 3. Mostrar info da primeira página
    const page = pages[0];
    console.log('3️⃣ Informações da primeira página:');
    console.log(`   📄 Título: ${page.title || '(sem título)'}`);
    console.log(`   🌐 URL: ${page.url}`);
    console.log(`   🆔 ID: ${page.id}`);
    console.log(`   🔌 WebSocket: ${page.webSocketDebuggerUrl}\n`);

    // 4. Teste básico com WebSocket
    console.log('4️⃣ Testando comando via WebSocket...');
    await testWebSocket(page.webSocketDebuggerUrl);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Certifique-se de que o Chrome está rodando com:');
    console.log('   google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"\n');
    process.exit(1);
  }
}

async function testWebSocket(wsUrl) {
  const WebSocket = (await import('ws')).default;

  return new Promise((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let timeout;

    ws.on('open', () => {
      console.log('   ✅ WebSocket conectado!');

      // Enviar comando simples: obter título da página
      const command = {
        id: 1,
        method: 'Runtime.evaluate',
        params: {
          expression: 'document.title',
          returnByValue: true
        }
      };

      ws.send(JSON.stringify(command));

      // Timeout de 5 segundos
      timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Timeout aguardando resposta'));
      }, 5000);
    });

    ws.on('message', (data) => {
      const message = JSON.parse(data.toString());

      // Se for resposta ao nosso comando
      if (message.id === 1 && message.result) {
        clearTimeout(timeout);
        console.log(`   📝 Título da página via CDP: "${message.result.result.value}"`);
        console.log('   ✅ Comando executado com sucesso!\n');
        ws.close();
        resolve();
      }
    });

    ws.on('error', (error) => {
      clearTimeout(timeout);
      console.error('   ❌ Erro WebSocket:', error.message);
      reject(error);
    });

    ws.on('close', () => {
      console.log('   🔌 WebSocket fechado\n');
      resolve();
    });
  });
}

// Executar teste
console.log('═'.repeat(60));
console.log('   Chrome DevTools Protocol - Teste Rápido');
console.log('═'.repeat(60));
console.log();

quickTest().then(() => {
  console.log('✅ Todos os testes passaram!\n');
  console.log('🚀 Próximos passos:');
  console.log('   • Execute: npm run example:01-basic');
  console.log('   • Explore: npm run example:02-screenshot');
  console.log('   • Leia: cat QUICKSTART.md\n');
}).catch((error) => {
  console.error('❌ Teste falhou:', error.message);
  process.exit(1);
});
