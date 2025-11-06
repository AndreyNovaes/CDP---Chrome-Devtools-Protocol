import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 3: Executando JavaScript na Página
 *
 * Este exemplo demonstra:
 * - Como executar JavaScript no contexto da página
 * - Como obter valores de retorno
 * - Como manipular o DOM
 * - Como trabalhar com Promises no CDP
 *
 * Execute: npm run example:03-execute-js
 */

async function main() {
  console.log('⚡ Exemplo 3: Executando JavaScript\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // Navegar para uma página de teste
    console.log('🌐 Navegando para example.com...');
    await client.send('Page.navigate', { url: 'https://example.com' });
    await sleep(2000);

    // 1. Executar JavaScript simples e obter resultado
    console.log('\n1️⃣ Executando JavaScript simples:');
    const result1 = await client.send('Runtime.evaluate', {
      expression: '2 + 2',
      returnByValue: true
    });
    console.log('   2 + 2 =', result1.result.value);

    // 2. Obter informações da página
    console.log('\n2️⃣ Obtendo informações da página:');
    const pageInfo = await client.send('Runtime.evaluate', {
      expression: `({
        title: document.title,
        url: window.location.href,
        width: window.innerWidth,
        height: window.innerHeight,
        userAgent: navigator.userAgent.substring(0, 50) + '...'
      })`,
      returnByValue: true
    });
    console.log('   Informações:', JSON.stringify(pageInfo.result.value, null, 2));

    // 3. Manipular o DOM
    console.log('\n3️⃣ Manipulando o DOM:');
    await client.send('Runtime.evaluate', {
      expression: `
        // Adicionar um elemento à página
        const div = document.createElement('div');
        div.id = 'cdp-test';
        div.style.cssText = 'position:fixed;top:10px;right:10px;background:red;color:white;padding:20px;z-index:9999;';
        div.textContent = 'Olá do CDP! 👋';
        document.body.appendChild(div);
      `
    });
    console.log('   ✅ Elemento adicionado ao DOM');

    await sleep(1000);

    // 4. Verificar se o elemento foi criado
    const elementCheck = await client.send('Runtime.evaluate', {
      expression: 'document.querySelector("#cdp-test") !== null',
      returnByValue: true
    });
    console.log('   Elemento existe?', elementCheck.result.value);

    // 5. Obter conteúdo do elemento
    const elementContent = await client.send('Runtime.evaluate', {
      expression: 'document.querySelector("#cdp-test")?.textContent',
      returnByValue: true
    });
    console.log('   Conteúdo do elemento:', elementContent.result.value);

    // 6. Executar código assíncrono
    console.log('\n4️⃣ Executando código assíncrono:');
    const asyncResult = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          await new Promise(resolve => setTimeout(resolve, 1000));
          return 'Completado após 1 segundo!';
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('   Resultado:', asyncResult.result.value);

    // 7. Obter todas as imagens da página
    console.log('\n5️⃣ Obtendo todas as imagens da página:');
    const images = await client.send('Runtime.evaluate', {
      expression: `
        Array.from(document.querySelectorAll('img')).map(img => ({
          src: img.src,
          alt: img.alt,
          width: img.width,
          height: img.height
        }))
      `,
      returnByValue: true
    });
    console.log(`   Encontradas ${images.result.value.length} imagens`);
    images.result.value.forEach((img, i) => {
      console.log(`   ${i + 1}. ${img.alt || 'Sem alt'} - ${img.src.substring(0, 50)}...`);
    });

    // 8. Simular interação do usuário
    console.log('\n6️⃣ Simulando scroll da página:');
    await client.send('Runtime.evaluate', {
      expression: 'window.scrollTo(0, document.body.scrollHeight / 2)'
    });
    console.log('   ✅ Página rolada');

    await sleep(500);

    // 9. Obter posição do scroll
    const scrollPos = await client.send('Runtime.evaluate', {
      expression: 'window.pageYOffset',
      returnByValue: true
    });
    console.log('   Posição do scroll:', scrollPos.result.value);

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Runtime.evaluate executa JavaScript no contexto da página');
    console.log('   - returnByValue: true retorna o valor, não uma referência');
    console.log('   - awaitPromise: true aguarda Promises completarem');
    console.log('   - Você pode manipular DOM, fazer queries e interagir com a página');
    console.log('   - Código assíncrono é suportado');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
