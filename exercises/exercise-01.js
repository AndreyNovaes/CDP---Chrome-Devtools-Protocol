import { createCDPClient, sleep } from '../utils/cdp-client.js';

/**
 * EXERCÍCIO 1: Monitor de Título
 *
 * Objetivo: Criar um script que monitora mudanças no título da página em tempo real.
 *
 * Requisitos:
 * 1. Conecte ao Chrome
 * 2. Navegue para uma página
 * 3. Monitore o título da página a cada 2 segundos
 * 4. Exiba quando o título mudar
 *
 * Dicas:
 * - Use Runtime.evaluate com document.title
 * - Use setInterval para verificar periodicamente
 * - Compare o título anterior com o novo
 *
 * Desafio Extra:
 * - Adicione timestamp das mudanças
 * - Salve histórico em arquivo
 * - Detecte mudanças automaticamente (sem polling)
 */

async function monitorTitle() {
  console.log('📺 Exercício 1: Monitor de Título\n');

  const client = await createCDPClient();

  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // TODO: Navegue para uma página
    // Sugestão: https://twitter.com (título muda com notificações)
    const url = 'https://example.com';
    console.log(`🌐 Navegando para: ${url}\n`);

    // Seu código aqui
    await client.send('Page.navigate', { url });
    await sleep(2000);

    // TODO: Obtenha o título inicial
    let previousTitle = '';

    const getTitleResult = await client.send('Runtime.evaluate', {
      expression: 'document.title',
      returnByValue: true
    });

    previousTitle = getTitleResult.result.value;
    console.log(`📌 Título inicial: "${previousTitle}"\n`);
    console.log('👀 Monitorando mudanças no título (Ctrl+C para parar)...\n');

    // TODO: Monitore o título periodicamente
    // Dica: Use setInterval
    const intervalId = setInterval(async () => {
      try {
        // Seu código aqui: obtenha o título atual
        const currentTitleResult = await client.send('Runtime.evaluate', {
          expression: 'document.title',
          returnByValue: true
        });

        const currentTitle = currentTitleResult.result.value;

        // Seu código aqui: compare com o título anterior
        if (currentTitle !== previousTitle) {
          const timestamp = new Date().toLocaleTimeString();
          console.log(`🔄 [${timestamp}] Título mudou!`);
          console.log(`   Anterior: "${previousTitle}"`);
          console.log(`   Novo: "${currentTitle}"\n`);

          previousTitle = currentTitle;
        }

      } catch (error) {
        console.error('❌ Erro ao verificar título:', error.message);
      }
    }, 2000); // Verificar a cada 2 segundos

    // Aguardar indefinidamente (use Ctrl+C para parar)
    await new Promise(() => {});

    // Cleanup (nunca alcançado, mas boa prática)
    clearInterval(intervalId);

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

// Executar
monitorTitle();

// ====================================
// DESAFIO EXTRA: Detecção Automática
// ====================================
//
// Em vez de polling, use MutationObserver para detectar mudanças:
//
// await client.send('Runtime.evaluate', {
//   expression: `
//     new MutationObserver(() => {
//       console.log('Title changed to:', document.title);
//     }).observe(
//       document.querySelector('title'),
//       { subtree: true, characterData: true, childList: true }
//     );
//   `
// });
//
// E capture console.log do Chrome:
// client.on('Runtime.consoleAPICalled', (params) => {
//   console.log('Título mudou:', params.args[1].value);
// });
