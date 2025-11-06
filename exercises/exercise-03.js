import { createCDPClient, sleep } from '../utils/cdp-client.js';
import { writeFileSync } from 'fs';

/**
 * EXERCÍCIO 3: Screenshot Automático
 *
 * Objetivo: Criar um script que tira screenshots de múltiplas páginas.
 *
 * Requisitos:
 * 1. Receba lista de URLs
 * 2. Para cada URL: navegue, aguarde, screenshot
 * 3. Salve com nome baseado no domínio
 * 4. Exiba progresso
 *
 * Uso: node exercises/exercise-03.js [url1] [url2] [url3]
 *
 * Desafio Extra:
 * - Adicione opções de viewport
 * - Screenshots mobile e desktop
 * - Crie thumbnails
 */

async function takeScreenshots() {
  console.log('📸 Exercício 3: Screenshot Automático\n');

  // TODO: Obtenha URLs dos argumentos ou use lista padrão
  let urls = process.argv.slice(2);

  if (urls.length === 0) {
    console.log('ℹ️  Nenhuma URL fornecida, usando lista padrão\n');
    urls = [
      'https://example.com',
      'https://github.com',
      'https://news.ycombinator.com'
    ];
  }

  console.log(`📋 ${urls.length} URLs para capturar:\n`);
  urls.forEach((url, i) => console.log(`   ${i + 1}. ${url}`));
  console.log();

  const client = await createCDPClient();

  try {
    await client.send('Page.enable');

    const results = [];

    // TODO: Para cada URL, tire screenshot
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const progress = `[${i + 1}/${urls.length}]`;

      console.log(`${progress} 🌐 Navegando para: ${url}`);

      try {
        // Navegar
        await client.send('Page.navigate', { url });

        // TODO: Aguarde carregamento completo
        // Dica: use Page.loadEventFired ou setTimeout
        console.log(`${progress} ⏳ Aguardando carregamento...`);

        await new Promise(resolve => {
          client.on('Page.loadEventFired', resolve);
        });

        await sleep(1000); // Aguardar um pouco mais para garantir

        console.log(`${progress} 📸 Capturando screenshot...`);

        // Tirar screenshot
        const screenshot = await client.send('Page.captureScreenshot', {
          format: 'png',
          quality: 100
        });

        // TODO: Gerar nome do arquivo baseado no domínio
        const domain = new URL(url).hostname.replace(/\./g, '_');
        const filename = `screenshot-${domain}-${Date.now()}.png`;

        // Salvar
        writeFileSync(filename, Buffer.from(screenshot.data, 'base64'));

        console.log(`${progress} ✅ Salvo: ${filename}\n`);

        results.push({
          url,
          filename,
          success: true
        });

      } catch (error) {
        console.error(`${progress} ❌ Erro: ${error.message}\n`);

        results.push({
          url,
          success: false,
          error: error.message
        });
      }
    }

    // Resumo
    console.log('='.repeat(60));
    console.log('\n📊 Resumo:\n');

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log(`   ✅ Sucesso: ${successful}`);
    console.log(`   ❌ Falhas: ${failed}`);
    console.log(`   📁 Total: ${results.length}\n`);

    if (successful > 0) {
      console.log('📁 Arquivos criados:\n');
      results.filter(r => r.success).forEach(r => {
        console.log(`   - ${r.filename}`);
      });
    }

    if (failed > 0) {
      console.log('\n❌ URLs com falha:\n');
      results.filter(r => !r.success).forEach(r => {
        console.log(`   - ${r.url}: ${r.error}`);
      });
    }

    console.log('\n✅ Exercício concluído!');

    client.close();

  } catch (error) {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
  }
}

// Executar
takeScreenshots();

// ====================================
// DESAFIO EXTRA: Screenshots Mobile e Desktop
// ====================================
//
// const viewports = {
//   mobile: { width: 375, height: 667, deviceScaleFactor: 2, mobile: true },
//   tablet: { width: 768, height: 1024, deviceScaleFactor: 2, mobile: true },
//   desktop: { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false }
// };
//
// for (const [name, viewport] of Object.entries(viewports)) {
//   await client.send('Emulation.setDeviceMetricsOverride', viewport);
//   const screenshot = await client.send('Page.captureScreenshot');
//   writeFileSync(`screenshot-${domain}-${name}.png`, Buffer.from(screenshot.data, 'base64'));
// }
//
// ====================================
// DESAFIO EXTRA: Criar Thumbnails
// ====================================
//
// Use biblioteca 'sharp' para redimensionar:
//
// import sharp from 'sharp';
//
// await sharp(screenshotBuffer)
//   .resize(320, 240)
//   .toFile(`thumbnail-${filename}`);
