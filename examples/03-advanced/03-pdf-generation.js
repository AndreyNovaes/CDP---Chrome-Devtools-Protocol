import { createCDPClient, sleep } from '../../utils/cdp-client.js';
import { writeFileSync } from 'fs';

/**
 * EXEMPLO 9: Geração de PDFs
 *
 * Este exemplo demonstra:
 * - Como gerar PDFs de páginas web
 * - Como configurar tamanho e margens
 * - Como adicionar headers/footers
 * - Como gerar PDFs de conteúdo dinâmico
 * - Diferentes opções de impressão
 *
 * Execute: npm run example:09-pdf
 */

async function main() {
  console.log('📄 Exemplo 9: Geração de PDFs\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    // 1. PDF de uma página web existente
    console.log('🌐 Gerando PDF de página web...\n');

    await client.send('Page.navigate', { url: 'https://example.com' });
    await sleep(3000);

    console.log('📄 Gerando PDF básico...');
    const pdfBasico = await client.send('Page.printToPDF', {
      printBackground: true,
      landscape: false
    });

    writeFileSync('example-basico.pdf', Buffer.from(pdfBasico.data, 'base64'));
    console.log('✅ PDF salvo: example-basico.pdf');

    // 2. PDF com configurações customizadas
    console.log('\n📄 Gerando PDF com configurações personalizadas...');

    const pdfCustomizado = await client.send('Page.printToPDF', {
      landscape: false,
      displayHeaderFooter: true,
      printBackground: true,
      scale: 1.0,
      paperWidth: 8.5,  // polegadas (Letter)
      paperHeight: 11,  // polegadas (Letter)
      marginTop: 0.4,
      marginBottom: 0.4,
      marginLeft: 0.4,
      marginRight: 0.4,
      headerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%;">
          <span>Gerado via CDP</span>
        </div>
      `,
      footerTemplate: `
        <div style="font-size:10px; text-align:center; width:100%;">
          <span class="pageNumber"></span> / <span class="totalPages"></span>
        </div>
      `,
      preferCSSPageSize: false
    });

    writeFileSync('example-customizado.pdf', Buffer.from(pdfCustomizado.data, 'base64'));
    console.log('✅ PDF salvo: example-customizado.pdf');

    // 3. PDF de conteúdo HTML customizado
    console.log('\n📄 Gerando PDF de conteúdo HTML customizado...\n');

    await client.send('Page.navigate', { url: 'about:blank' });
    await sleep(500);

    // Criar conteúdo HTML rico
    await client.send('Runtime.evaluate', {
      expression: `
        document.body.innerHTML = \`
          <style>
            @page {
              margin: 2cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
            }
            h1 {
              color: #2c3e50;
              border-bottom: 3px solid #3498db;
              padding-bottom: 10px;
            }
            h2 {
              color: #34495e;
              margin-top: 30px;
            }
            .box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin: 20px 0;
            }
            .highlight {
              background: #fff3cd;
              padding: 15px;
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background: #3498db;
              color: white;
            }
            tr:nth-child(even) {
              background: #f2f2f2;
            }
            .code {
              background: #f4f4f4;
              border: 1px solid #ddd;
              border-radius: 4px;
              padding: 10px;
              font-family: 'Courier New', monospace;
              overflow-x: auto;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 2px solid #eee;
              text-align: center;
              color: #7f8c8d;
            }
          </style>

          <h1>🚀 Chrome DevTools Protocol - Relatório Completo</h1>

          <div class="box">
            <h2>📋 Resumo Executivo</h2>
            <p>
              Este documento foi gerado automaticamente usando o Chrome DevTools Protocol (CDP).
              O CDP é uma poderosa ferramenta para automação e controle de navegadores Chromium.
            </p>
          </div>

          <h2>📊 Principais Características</h2>
          <table>
            <tr>
              <th>Recurso</th>
              <th>Descrição</th>
              <th>Status</th>
            </tr>
            <tr>
              <td>Navegação</td>
              <td>Controle completo de navegação entre páginas</td>
              <td>✅ Disponível</td>
            </tr>
            <tr>
              <td>Screenshots</td>
              <td>Captura de imagens em diversos formatos</td>
              <td>✅ Disponível</td>
            </tr>
            <tr>
              <td>Network</td>
              <td>Interceptação e análise de tráfego</td>
              <td>✅ Disponível</td>
            </tr>
            <tr>
              <td>Performance</td>
              <td>Métricas detalhadas de performance</td>
              <td>✅ Disponível</td>
            </tr>
            <tr>
              <td>PDF Generation</td>
              <td>Geração de PDFs com alta qualidade</td>
              <td>✅ Disponível</td>
            </tr>
          </table>

          <div class="highlight">
            <h3>💡 Dica Importante</h3>
            <p>
              O CDP é a base de ferramentas como Puppeteer e Playwright.
              Entender o CDP diretamente permite criar soluções mais eficientes e customizadas.
            </p>
          </div>

          <h2>💻 Exemplo de Código</h2>
          <div class="code">
const client = await createCDPClient();
await client.send('Page.navigate', { url: 'https://example.com' });
const pdf = await client.send('Page.printToPDF', {
  printBackground: true,
  landscape: false
});
          </div>

          <h2>📈 Casos de Uso</h2>
          <ul>
            <li><strong>Testes Automatizados:</strong> Validação de interfaces e funcionalidades</li>
            <li><strong>Web Scraping:</strong> Extração de dados de sites dinâmicos</li>
            <li><strong>Geração de Relatórios:</strong> PDFs automáticos de conteúdo web</li>
            <li><strong>Monitoramento:</strong> Análise de performance e disponibilidade</li>
            <li><strong>Screenshots:</strong> Captura automática de telas para documentação</li>
          </ul>

          <h2>🎯 Próximos Passos</h2>
          <ol>
            <li>Explorar todos os domínios disponíveis no CDP</li>
            <li>Implementar casos de uso específicos</li>
            <li>Integrar com sistemas existentes</li>
            <li>Otimizar performance para produção</li>
          </ol>

          <div class="footer">
            <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Chrome DevTools Protocol v1.0</p>
          </div>
        \`;
      `
    });

    await sleep(1000);

    console.log('📝 Conteúdo HTML criado');
    console.log('📄 Gerando PDF rico...');

    const pdfRico = await client.send('Page.printToPDF', {
      landscape: false,
      displayHeaderFooter: false,
      printBackground: true,
      scale: 1,
      paperWidth: 8.5,
      paperHeight: 11,
      marginTop: 0.4,
      marginBottom: 0.4,
      marginLeft: 0.4,
      marginRight: 0.4,
      preferCSSPageSize: false
    });

    writeFileSync('relatorio-completo.pdf', Buffer.from(pdfRico.data, 'base64'));
    console.log('✅ PDF salvo: relatorio-completo.pdf');

    // 4. PDF em modo paisagem (landscape)
    console.log('\n📄 Gerando PDF em modo paisagem...');

    const pdfLandscape = await client.send('Page.printToPDF', {
      landscape: true,
      displayHeaderFooter: true,
      printBackground: true,
      paperWidth: 11,
      paperHeight: 8.5,
      headerTemplate: '<div style="font-size:10px; width:100%; text-align:center;">Modo Paisagem</div>',
      footerTemplate: '<div style="font-size:10px; width:100%; text-align:center;"><span class="pageNumber"></span></div>'
    });

    writeFileSync('relatorio-landscape.pdf', Buffer.from(pdfLandscape.data, 'base64'));
    console.log('✅ PDF salvo: relatorio-landscape.pdf');

    // 5. PDF tamanho A4
    console.log('\n📄 Gerando PDF em tamanho A4...');

    const pdfA4 = await client.send('Page.printToPDF', {
      landscape: false,
      displayHeaderFooter: false,
      printBackground: true,
      paperWidth: 8.27,  // A4 width in inches
      paperHeight: 11.69, // A4 height in inches
      marginTop: 0.4,
      marginBottom: 0.4,
      marginLeft: 0.4,
      marginRight: 0.4
    });

    writeFileSync('relatorio-a4.pdf', Buffer.from(pdfA4.data, 'base64'));
    console.log('✅ PDF salvo: relatorio-a4.pdf');

    // 6. Resumo
    console.log('\n📊 Resumo dos PDFs gerados:\n');
    console.log('   1. example-basico.pdf');
    console.log('      - Configurações padrão');
    console.log('      - Sem headers/footers');
    console.log('');
    console.log('   2. example-customizado.pdf');
    console.log('      - Headers e footers customizados');
    console.log('      - Margens personalizadas');
    console.log('      - Numeração de páginas');
    console.log('');
    console.log('   3. relatorio-completo.pdf');
    console.log('      - Conteúdo HTML rico e estilizado');
    console.log('      - Tabelas, listas, código');
    console.log('      - Gradientes e cores');
    console.log('');
    console.log('   4. relatorio-landscape.pdf');
    console.log('      - Modo paisagem');
    console.log('      - Ideal para tabelas largas');
    console.log('');
    console.log('   5. relatorio-a4.pdf');
    console.log('      - Formato A4 padrão');
    console.log('      - Tamanho internacional');

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Page.printToPDF gera PDFs de qualidade');
    console.log('   - Controle total sobre tamanho, margens e orientação');
    console.log('   - Headers e footers customizáveis com HTML');
    console.log('   - printBackground: true preserva cores e gradientes');
    console.log('   - scale controla o zoom do conteúdo');
    console.log('   - preferCSSPageSize usa @page CSS se disponível');

    console.log('\n🎯 Casos de uso práticos:');
    console.log('   - Geração automática de relatórios');
    console.log('   - Exportação de dashboards');
    console.log('   - Documentação técnica');
    console.log('   - Faturas e recibos');
    console.log('   - Certificados');

    console.log('\n📝 Parâmetros importantes:');
    console.log('   - landscape: orientação (false=retrato, true=paisagem)');
    console.log('   - paperWidth/paperHeight: tamanho em polegadas');
    console.log('   - marginTop/Bottom/Left/Right: margens em polegadas');
    console.log('   - displayHeaderFooter: exibir header/footer');
    console.log('   - headerTemplate/footerTemplate: HTML customizado');
    console.log('   - printBackground: incluir cores de fundo');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
