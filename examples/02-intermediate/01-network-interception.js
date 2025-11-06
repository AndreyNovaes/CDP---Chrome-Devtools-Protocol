import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 4: Interceptação de Rede (Network Interception)
 *
 * Este exemplo demonstra:
 * - Como monitorar requisições HTTP
 * - Como interceptar e bloquear requisições
 * - Como modificar headers e respostas
 * - Como analisar tráfego de rede
 *
 * Execute: npm run example:04-network
 */

async function main() {
  console.log('🌐 Exemplo 4: Interceptação de Rede\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Network.enable');

    // Armazenar estatísticas
    const stats = {
      requests: 0,
      responses: 0,
      bytesReceived: 0,
      imageRequests: 0,
      jsRequests: 0,
      cssRequests: 0,
      blockedRequests: 0
    };

    // 1. Monitorar requisições
    console.log('👂 Configurando listeners de rede...\n');

    client.on('Network.requestWillBeSent', (params) => {
      stats.requests++;
      const url = params.request.url;
      const method = params.request.method;

      // Classificar tipo de recurso
      if (url.match(/\.(jpg|jpeg|png|gif|svg|webp)$/i)) stats.imageRequests++;
      if (url.match(/\.js$/i)) stats.jsRequests++;
      if (url.match(/\.css$/i)) stats.cssRequests++;

      console.log(`📤 [${method}] ${url.substring(0, 80)}${url.length > 80 ? '...' : ''}`);
    });

    client.on('Network.responseReceived', (params) => {
      stats.responses++;
      const status = params.response.status;
      const mimeType = params.response.mimeType;

      console.log(`📥 [${status}] ${mimeType}`);
    });

    client.on('Network.dataReceived', (params) => {
      stats.bytesReceived += params.dataLength;
    });

    client.on('Network.loadingFailed', (params) => {
      console.log(`❌ Falha ao carregar: ${params.errorText}`);
    });

    // 2. Habilitar bloqueio de requisições (opcional)
    // Bloquear imagens para economizar banda
    const blockImages = false; // Mude para true para testar

    if (blockImages) {
      console.log('🚫 Habilitando bloqueio de imagens...\n');
      await client.send('Network.setBlockedURLs', {
        urls: ['*.jpg', '*.jpeg', '*.png', '*.gif', '*.svg', '*.webp']
      });
      stats.blockedRequests = 'Imagens bloqueadas';
    }

    // 3. Configurar cache (desabilitar para testes)
    await client.send('Network.setCacheDisabled', {
      cacheDisabled: true
    });
    console.log('🗑️  Cache desabilitado\n');

    // 4. Simular condições de rede (throttling)
    const simulateSlowNetwork = false; // Mude para true para testar

    if (simulateSlowNetwork) {
      console.log('🐌 Simulando rede 3G lenta...\n');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        latency: 400,           // 400ms de latência
        downloadThroughput: 400 * 1024 / 8,  // 400kb/s
        uploadThroughput: 400 * 1024 / 8     // 400kb/s
      });
    }

    // 5. Navegar e monitorar
    console.log('🌐 Navegando para https://github.com...\n');
    console.log('='.repeat(80));

    await client.send('Page.navigate', { url: 'https://github.com' });

    // Aguardar carregamento
    console.log('\n⏳ Aguardando carregamento completo...');
    await sleep(5000);

    // 6. Exibir estatísticas
    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Estatísticas de Rede:');
    console.log(`   Total de requisições: ${stats.requests}`);
    console.log(`   Total de respostas: ${stats.responses}`);
    console.log(`   Bytes recebidos: ${(stats.bytesReceived / 1024).toFixed(2)} KB`);
    console.log(`   Requisições de imagens: ${stats.imageRequests}`);
    console.log(`   Requisições de JavaScript: ${stats.jsRequests}`);
    console.log(`   Requisições de CSS: ${stats.cssRequests}`);
    if (blockImages) {
      console.log(`   ⚠️  ${stats.blockedRequests}`);
    }

    // 7. Obter cookies
    console.log('\n🍪 Obtendo cookies:');
    const cookies = await client.send('Network.getAllCookies');
    console.log(`   Total de cookies: ${cookies.cookies.length}`);
    cookies.cookies.slice(0, 3).forEach((cookie, i) => {
      console.log(`   ${i + 1}. ${cookie.name} = ${cookie.value.substring(0, 30)}...`);
    });

    // 8. Exemplo de modificação de headers (requires Fetch domain)
    console.log('\n🔧 Dica Avançada:');
    console.log('   Para interceptar e modificar requisições/respostas, use:');
    console.log('   - Fetch.enable() para interceptação moderna');
    console.log('   - Network.setExtraHTTPHeaders() para adicionar headers');
    console.log('   - Network.setUserAgentOverride() para mudar User-Agent');

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Network.enable habilita monitoramento de rede');
    console.log('   - Eventos: requestWillBeSent, responseReceived, dataReceived');
    console.log('   - Network.setBlockedURLs bloqueia padrões de URL');
    console.log('   - Network.emulateNetworkConditions simula diferentes redes');
    console.log('   - Network.setCacheDisabled controla o cache');
    console.log('   - Como coletar estatísticas de tráfego');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
