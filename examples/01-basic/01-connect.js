import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 1: Conexão Básica e Navegação
 *
 * Este exemplo demonstra:
 * - Como conectar ao Chrome via CDP
 * - Como navegar para uma URL
 * - Como obter informações da página
 *
 * Antes de executar:
 * 1. Inicie o Chrome com: chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
 * 2. Execute: npm run example:01-basic
 */

async function main() {
  console.log('🚀 Exemplo 1: Conexão Básica e Navegação\n');

  try {
    // 1. Criar e conectar o cliente CDP
    const client = await createCDPClient();

    // 2. Habilitar o domínio Page (necessário para usar comandos de página)
    console.log('📄 Habilitando domínio Page...');
    await client.send('Page.enable');

    // 3. Navegar para uma URL
    const url = 'https://example.com';
    console.log(`🌐 Navegando para: ${url}`);
    await client.send('Page.navigate', { url });

    // 4. Aguardar o carregamento da página
    console.log('⏳ Aguardando carregamento...');
    await sleep(2000);

    // 5. Obter informações da página atual
    const frameTree = await client.send('Page.getFrameTree');
    console.log('\n📊 Informações da página:');
    console.log('  URL:', frameTree.frameTree.frame.url);
    console.log('  ID do Frame:', frameTree.frameTree.frame.id);

    // 6. Executar um comando simples: obter o título da página
    const result = await client.send('Runtime.evaluate', {
      expression: 'document.title'
    });
    console.log('  Título:', result.result.value);

    console.log('\n✅ Exemplo concluído com sucesso!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Como conectar ao Chrome via WebSocket');
    console.log('   - Como habilitar domínios do CDP (Page, Runtime, etc.)');
    console.log('   - Como enviar comandos usando client.send()');
    console.log('   - Como navegar para URLs');

    // 7. Fechar conexão
    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.log('\n💡 Dica: Certifique-se de que o Chrome está rodando com --remote-debugging-port=9222');
    process.exit(1);
  }
}

main();
