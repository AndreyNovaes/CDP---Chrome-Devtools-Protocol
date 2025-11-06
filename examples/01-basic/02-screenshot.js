import { createCDPClient, sleep } from '../../utils/cdp-client.js';
import { writeFileSync } from 'fs';

/**
 * EXEMPLO 2: Captura de Screenshots
 *
 * Este exemplo demonstra:
 * - Como tirar screenshots de páginas
 * - Como capturar apenas viewport ou página inteira
 * - Como salvar imagens em formato PNG
 *
 * Execute: npm run example:02-screenshot
 */

async function main() {
  console.log('📸 Exemplo 2: Captura de Screenshots\n');

  try {
    const client = await createCDPClient();

    // Habilitar domínios necessários
    await client.send('Page.enable');

    // Navegar para uma página interessante
    const url = 'https://github.com/trending';
    console.log(`🌐 Navegando para: ${url}`);
    await client.send('Page.navigate', { url });

    // Aguardar carregamento completo
    console.log('⏳ Aguardando carregamento completo...');
    await sleep(3000);

    // 1. Screenshot básico (viewport)
    console.log('\n📷 Capturando screenshot do viewport...');
    const screenshotViewport = await client.send('Page.captureScreenshot', {
      format: 'png',
      quality: 100
    });

    // Salvar screenshot
    const viewportBuffer = Buffer.from(screenshotViewport.data, 'base64');
    writeFileSync('screenshot-viewport.png', viewportBuffer);
    console.log('✅ Screenshot salvo: screenshot-viewport.png');

    // 2. Screenshot da página inteira
    console.log('\n📷 Capturando screenshot da página inteira...');

    // Primeiro, obter as dimensões da página
    const metrics = await client.send('Page.getLayoutMetrics');
    const { width, height } = metrics.contentSize;

    console.log(`📐 Dimensões da página: ${width}x${height}`);

    // Definir viewport para capturar página inteira
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: Math.ceil(width),
      height: Math.ceil(height),
      deviceScaleFactor: 1,
      mobile: false
    });

    await sleep(500);

    const screenshotFull = await client.send('Page.captureScreenshot', {
      format: 'png',
      quality: 100
    });

    const fullBuffer = Buffer.from(screenshotFull.data, 'base64');
    writeFileSync('screenshot-full.png', fullBuffer);
    console.log('✅ Screenshot salvo: screenshot-full.png');

    // 3. Screenshot em diferentes formatos
    console.log('\n📷 Capturando screenshot em JPEG...');
    const screenshotJpeg = await client.send('Page.captureScreenshot', {
      format: 'jpeg',
      quality: 80
    });

    const jpegBuffer = Buffer.from(screenshotJpeg.data, 'base64');
    writeFileSync('screenshot.jpg', jpegBuffer);
    console.log('✅ Screenshot salvo: screenshot.jpg');

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Como capturar screenshots com Page.captureScreenshot');
    console.log('   - Diferença entre viewport e página inteira');
    console.log('   - Como obter dimensões da página com Page.getLayoutMetrics');
    console.log('   - Como usar Emulation.setDeviceMetricsOverride');
    console.log('   - Diferentes formatos de imagem (PNG, JPEG)');

    console.log('\n📂 Arquivos criados:');
    console.log('   - screenshot-viewport.png (viewport atual)');
    console.log('   - screenshot-full.png (página inteira)');
    console.log('   - screenshot.jpg (formato JPEG)');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
