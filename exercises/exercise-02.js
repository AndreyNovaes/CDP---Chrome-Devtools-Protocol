import { createCDPClient, sleep } from '../utils/cdp-client.js';
import { writeFileSync } from 'fs';

/**
 * EXERCÍCIO 2: Extrator de Links
 *
 * Objetivo: Extrair todos os links de uma página e salvar em JSON.
 *
 * Requisitos:
 * 1. Navegue para uma página
 * 2. Extraia todos os links <a href="...">
 * 3. Para cada link, capture: URL, texto, target
 * 4. Salve em links.json
 *
 * Desafio Extra:
 * - Categorize links (internos vs externos)
 * - Verifique links quebrados
 * - Crie relatório HTML
 */

async function extractLinks() {
  console.log('🔗 Exercício 2: Extrator de Links\n');

  const client = await createCDPClient();

  try {
    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // TODO: Escolha uma página interessante
    const url = 'https://news.ycombinator.com';
    console.log(`🌐 Navegando para: ${url}`);

    await client.send('Page.navigate', { url });
    await sleep(3000);

    console.log('✅ Página carregada\n');

    // TODO: Extraia todos os links
    console.log('🔍 Extraindo links...\n');

    const linksResult = await client.send('Runtime.evaluate', {
      expression: `
        // Seu código aqui: selecione todos os links e extraia informações
        Array.from(document.querySelectorAll('a[href]')).map(link => ({
          url: link.href,
          text: link.textContent.trim(),
          target: link.target || '_self',
          rel: link.rel || '',
        }))
      `,
      returnByValue: true
    });

    const links = linksResult.result.value;

    console.log(`✅ Encontrados ${links.length} links\n`);

    // Exibir primeiros 10 links
    console.log('📋 Primeiros 10 links:\n');
    links.slice(0, 10).forEach((link, i) => {
      console.log(`${i + 1}. ${link.text.substring(0, 50)}${link.text.length > 50 ? '...' : ''}`);
      console.log(`   URL: ${link.url.substring(0, 80)}${link.url.length > 80 ? '...' : ''}`);
      console.log(`   Target: ${link.target}\n`);
    });

    // TODO: DESAFIO - Categorize links internos vs externos
    const pageUrl = new URL(url);
    const categorized = links.reduce((acc, link) => {
      try {
        const linkUrl = new URL(link.url);
        const isInternal = linkUrl.hostname === pageUrl.hostname;

        if (isInternal) {
          acc.internal.push(link);
        } else {
          acc.external.push(link);
        }
      } catch (e) {
        // URL inválida
        acc.invalid.push(link);
      }

      return acc;
    }, { internal: [], external: [], invalid: [] });

    console.log('📊 Estatísticas:\n');
    console.log(`   Links internos: ${categorized.internal.length}`);
    console.log(`   Links externos: ${categorized.external.length}`);
    console.log(`   Links inválidos: ${categorized.invalid.length}`);

    // TODO: Salve em arquivo JSON
    const output = {
      url,
      timestamp: new Date().toISOString(),
      totalLinks: links.length,
      categorized,
      allLinks: links
    };

    writeFileSync('links.json', JSON.stringify(output, null, 2));
    console.log('\n✅ Links salvos em: links.json');

    console.log('\n✅ Exercício concluído!');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

// Executar
extractLinks();

// ====================================
// DESAFIO EXTRA: Verificar Links Quebrados
// ====================================
//
// async function checkLink(url) {
//   try {
//     const response = await fetch(url, { method: 'HEAD' });
//     return {
//       url,
//       status: response.status,
//       ok: response.ok
//     };
//   } catch (error) {
//     return {
//       url,
//       status: 'ERROR',
//       error: error.message
//     };
//   }
// }
//
// const brokenLinks = [];
// for (const link of links.slice(0, 20)) { // Teste primeiros 20
//   const result = await checkLink(link.url);
//   if (!result.ok) {
//     brokenLinks.push(result);
//   }
// }
