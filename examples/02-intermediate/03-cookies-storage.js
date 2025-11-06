import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 6: Cookies e Storage
 *
 * Este exemplo demonstra:
 * - Como manipular cookies
 * - Como acessar localStorage e sessionStorage
 * - Como limpar dados do navegador
 * - Como trabalhar com diferentes storages
 *
 * Execute: npm run example:06-cookies
 */

async function main() {
  console.log('🍪 Exemplo 6: Cookies e Storage\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Network.enable');
    await client.send('Runtime.enable');

    // 1. Navegar para uma página
    const url = 'https://github.com';
    console.log(`🌐 Navegando para: ${url}`);
    await client.send('Page.navigate', { url });
    await sleep(3000);

    // 2. Listar todos os cookies
    console.log('\n🍪 Cookies existentes:');
    const allCookies = await client.send('Network.getAllCookies');

    console.log(`   Total: ${allCookies.cookies.length} cookies`);
    allCookies.cookies.slice(0, 5).forEach((cookie, i) => {
      console.log(`\n   Cookie ${i + 1}:`);
      console.log(`     Nome: ${cookie.name}`);
      console.log(`     Valor: ${cookie.value.substring(0, 50)}${cookie.value.length > 50 ? '...' : ''}`);
      console.log(`     Domínio: ${cookie.domain}`);
      console.log(`     Path: ${cookie.path}`);
      console.log(`     Secure: ${cookie.secure}`);
      console.log(`     HttpOnly: ${cookie.httpOnly}`);
      console.log(`     SameSite: ${cookie.sameSite || 'None'}`);
    });

    // 3. Criar um cookie customizado
    console.log('\n\n📝 Criando cookie customizado...');
    await client.send('Network.setCookie', {
      name: 'meu_cookie_cdp',
      value: 'teste_valor_123',
      domain: '.github.com',
      path: '/',
      secure: true,
      httpOnly: false,
      sameSite: 'Lax'
    });
    console.log('   ✅ Cookie criado: meu_cookie_cdp');

    // 4. Verificar se o cookie foi criado
    const updatedCookies = await client.send('Network.getAllCookies');
    const myCookie = updatedCookies.cookies.find(c => c.name === 'meu_cookie_cdp');
    if (myCookie) {
      console.log(`   ✅ Cookie verificado: ${myCookie.name} = ${myCookie.value}`);
    }

    // 5. Deletar um cookie específico
    console.log('\n🗑️  Deletando cookie...');
    await client.send('Network.deleteCookies', {
      name: 'meu_cookie_cdp',
      domain: '.github.com',
      path: '/'
    });
    console.log('   ✅ Cookie deletado');

    // 6. Trabalhar com localStorage
    console.log('\n\n💾 LocalStorage:');

    // Definir item no localStorage
    await client.send('Runtime.evaluate', {
      expression: `
        localStorage.setItem('cdp_test', JSON.stringify({
          timestamp: Date.now(),
          message: 'Teste do CDP',
          data: [1, 2, 3, 4, 5]
        }));
      `
    });
    console.log('   ✅ Item salvo no localStorage');

    // Ler localStorage
    const localStorageResult = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const items = {};
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            items[key] = localStorage.getItem(key);
          }
          return items;
        })()
      `,
      returnByValue: true
    });

    const localStorageItems = localStorageResult.result.value;
    console.log(`\n   Items no localStorage (${Object.keys(localStorageItems).length}):`);
    Object.entries(localStorageItems).slice(0, 5).forEach(([key, value]) => {
      console.log(`     ${key}: ${value.substring(0, 60)}${value.length > 60 ? '...' : ''}`);
    });

    // 7. Trabalhar com sessionStorage
    console.log('\n\n📦 SessionStorage:');

    await client.send('Runtime.evaluate', {
      expression: `
        sessionStorage.setItem('cdp_session', 'valor_da_sessao');
      `
    });
    console.log('   ✅ Item salvo no sessionStorage');

    const sessionStorageResult = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const items = {};
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            items[key] = sessionStorage.getItem(key);
          }
          return items;
        })()
      `,
      returnByValue: true
    });

    const sessionStorageItems = sessionStorageResult.result.value;
    console.log(`   Items no sessionStorage (${Object.keys(sessionStorageItems).length}):`);
    Object.entries(sessionStorageItems).forEach(([key, value]) => {
      console.log(`     ${key}: ${value}`);
    });

    // 8. Usando Storage Domain (mais poderoso)
    console.log('\n\n🔐 Usando Storage Domain:');

    // Habilitar Storage domain
    await client.send('Storage.enable');

    // Obter informações de storage por origin
    const frameTree = await client.send('Page.getFrameTree');
    const origin = new URL(frameTree.frameTree.frame.url).origin;

    console.log(`   Origin: ${origin}`);

    // Obter usage e quota
    const usageResult = await client.send('Storage.getUsageAndQuota', {
      origin
    });

    console.log(`\n   📊 Uso de Storage:`);
    console.log(`     Usado: ${(usageResult.usage / 1024).toFixed(2)} KB`);
    console.log(`     Quota: ${(usageResult.quota / 1024 / 1024).toFixed(2)} MB`);
    console.log(`\n   Breakdown por tipo:`);
    usageResult.usageBreakdown.forEach(breakdown => {
      console.log(`     ${breakdown.storageType}: ${(breakdown.usage / 1024).toFixed(2)} KB`);
    });

    // 9. Limpar storage (CUIDADO: isso remove dados!)
    const clearStorage = false; // Mude para true para testar

    if (clearStorage) {
      console.log('\n\n🧹 Limpando storage...');

      await client.send('Storage.clearDataForOrigin', {
        origin,
        storageTypes: 'local_storage,session_storage'
      });

      console.log('   ✅ localStorage e sessionStorage limpos');
    }

    // 10. Monitorar mudanças em cookies (exemplo de evento)
    console.log('\n\n👂 Monitorando mudanças em cookies...');

    let cookieChanges = 0;
    client.on('Network.cookieChanged', (params) => {
      cookieChanges++;
      console.log(`   🍪 Cookie alterado: ${params.cookie.name}`);
    });

    // Criar um cookie para testar o evento
    await client.send('Network.setCookie', {
      name: 'test_event',
      value: 'valor_teste',
      domain: '.github.com',
      path: '/'
    });

    await sleep(500);
    console.log(`   Total de mudanças detectadas: ${cookieChanges}`);

    // 11. Cache Storage (para PWAs)
    console.log('\n\n📦 Cache Storage (PWA):');

    const cacheResult = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          try {
            const cacheNames = await caches.keys();
            return { available: true, caches: cacheNames };
          } catch (e) {
            return { available: false, error: e.message };
          }
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });

    if (cacheResult.result.value.available) {
      console.log(`   Caches disponíveis: ${cacheResult.result.value.caches.length}`);
      cacheResult.result.value.caches.forEach((cacheName, i) => {
        console.log(`     ${i + 1}. ${cacheName}`);
      });
    } else {
      console.log('   ℹ️  Cache Storage não disponível nesta página');
    }

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Network.getAllCookies() lista todos os cookies');
    console.log('   - Network.setCookie() cria cookies');
    console.log('   - Network.deleteCookies() remove cookies');
    console.log('   - Runtime.evaluate pode acessar localStorage/sessionStorage');
    console.log('   - Storage.enable() + Storage.getUsageAndQuota() para info detalhada');
    console.log('   - Storage.clearDataForOrigin() limpa dados');
    console.log('   - Network.cookieChanged monitora mudanças em cookies');
    console.log('   - Cache Storage para PWAs');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
