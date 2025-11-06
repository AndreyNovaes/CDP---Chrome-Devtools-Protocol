import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 7: Debugging Avançado
 *
 * Este exemplo demonstra:
 * - Como definir breakpoints
 * - Como pausar execução de JavaScript
 * - Como inspecionar variáveis
 * - Como capturar console.log
 * - Como monitorar exceções
 *
 * Execute: npm run example:07-debugging
 */

async function main() {
  console.log('🐛 Exemplo 7: Debugging Avançado\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Debugger.enable');
    await client.send('Console.enable');

    // 1. Capturar mensagens do console
    console.log('📝 Configurando captura de console...\n');

    const consoleLogs = [];

    client.on('Runtime.consoleAPICalled', (params) => {
      const type = params.type;
      const args = params.args.map(arg => arg.value || arg.description);
      const message = args.join(' ');

      consoleLogs.push({ type, message });
      console.log(`   [Console.${type}] ${message}`);
    });

    // 2. Capturar exceções
    console.log('🚨 Configurando captura de exceções...\n');

    const exceptions = [];

    client.on('Runtime.exceptionThrown', (params) => {
      const exception = params.exceptionDetails;
      exceptions.push(exception);

      console.log(`   ❌ EXCEÇÃO:`);
      console.log(`      Mensagem: ${exception.exception?.description || exception.text}`);
      console.log(`      Linha: ${exception.lineNumber}`);
      console.log(`      Coluna: ${exception.columnNumber}`);
      if (exception.url) {
        console.log(`      URL: ${exception.url}`);
      }
    });

    // 3. Navegar para about:blank e injetar código de teste
    console.log('🌐 Navegando para página de teste...\n');
    await client.send('Page.navigate', { url: 'about:blank' });
    await sleep(1000);

    // 4. Criar uma página HTML com JavaScript para debug
    console.log('💉 Injetando código de teste...\n');

    await client.send('Runtime.evaluate', {
      expression: `
        document.body.innerHTML = \`
          <h1>CDP Debugging Test</h1>
          <button id="testBtn">Clique para testar</button>
          <div id="output"></div>
        \`;

        // Função com bug proposital
        function calcular(a, b) {
          console.log('Calculando:', a, '+', b);
          const resultado = a + b;
          console.log('Resultado:', resultado);
          return resultado;
        }

        // Função que gera erro
        function gerarErro() {
          console.error('Esta função vai gerar um erro!');
          throw new Error('Erro proposital para demonstração');
        }

        // Event listener
        document.getElementById('testBtn').addEventListener('click', () => {
          console.log('Botão clicado!');
          const result = calcular(10, 20);
          document.getElementById('output').textContent = 'Resultado: ' + result;
        });

        console.log('Página de teste carregada!');
        console.warn('Isto é um warning');
        console.info('Isto é uma info');

        // Criar algumas variáveis globais para inspeção
        window.testData = {
          nome: 'CDP Test',
          valores: [1, 2, 3, 4, 5],
          config: { debug: true, version: '1.0' }
        };
      `
    });

    await sleep(500);

    // 5. Inspecionar objetos globais
    console.log('\n🔍 Inspecionando variáveis globais:');

    const testDataResult = await client.send('Runtime.evaluate', {
      expression: 'window.testData',
      returnByValue: true
    });

    console.log('   window.testData:', JSON.stringify(testDataResult.result.value, null, 2));

    // 6. Executar função e capturar logs
    console.log('\n▶️  Executando função calcular(5, 10)...');

    await client.send('Runtime.evaluate', {
      expression: 'calcular(5, 10)'
    });

    await sleep(300);

    // 7. Simular clique no botão
    console.log('\n🖱️  Simulando clique no botão...');

    await client.send('Runtime.evaluate', {
      expression: 'document.getElementById("testBtn").click()'
    });

    await sleep(300);

    // 8. Avaliar expressões no contexto da página
    console.log('\n🧮 Avaliando expressões:');

    const expressions = [
      '2 + 2',
      'typeof window.testData',
      'window.testData.valores.length',
      'document.title'
    ];

    for (const expr of expressions) {
      const result = await client.send('Runtime.evaluate', {
        expression: expr,
        returnByValue: true
      });
      console.log(`   ${expr} = ${result.result.value}`);
    }

    // 9. Definir um breakpoint em erro (demonstração conceitual)
    console.log('\n⏸️  Testando captura de exceções...');

    // Pausar na próxima exceção
    await client.send('Debugger.setPauseOnExceptions', {
      state: 'all'  // 'none', 'uncaught', 'all'
    });

    console.log('   Configurado para pausar em exceções');

    // Nota: Em um cenário real, quando o debugger pausa, você receberia
    // eventos como 'Debugger.paused' e poderia:
    // - Inspecionar o call stack
    // - Avaliar variáveis no escopo
    // - Dar step over/into/out
    // - Continuar execução

    // 10. Obter todas as propriedades de um objeto
    console.log('\n📋 Obtendo propriedades de window.testData...');

    const objectResult = await client.send('Runtime.evaluate', {
      expression: 'window.testData'
    });

    if (objectResult.result.objectId) {
      const properties = await client.send('Runtime.getProperties', {
        objectId: objectResult.result.objectId,
        ownProperties: true
      });

      console.log('   Propriedades:');
      properties.result.forEach(prop => {
        const value = prop.value?.value || prop.value?.description || 'N/A';
        console.log(`     ${prop.name}: ${JSON.stringify(value)}`);
      });
    }

    // 11. Profile de CPU (exemplo conceitual)
    console.log('\n⚡ Profiling de CPU:');

    // Iniciar profiling
    await client.send('Profiler.enable');
    await client.send('Profiler.start');
    console.log('   ✅ Profiling iniciado');

    // Executar código
    await client.send('Runtime.evaluate', {
      expression: `
        // Código pesado para profile
        let sum = 0;
        for (let i = 0; i < 1000000; i++) {
          sum += Math.sqrt(i);
        }
        sum;
      `
    });

    // Parar profiling
    const profile = await client.send('Profiler.stop');
    console.log('   ✅ Profiling completado');
    console.log(`   Nós no profile: ${profile.profile.nodes.length}`);
    console.log(`   Amostras coletadas: ${profile.profile.samples.length}`);

    // 12. Cobertura de código (Coverage)
    console.log('\n📊 Cobertura de código:');

    await client.send('Profiler.startPreciseCoverage', {
      callCount: true,
      detailed: true
    });

    // Executar código
    await client.send('Runtime.evaluate', {
      expression: `
        function funcaoUsada() { return 42; }
        function funcaoNaoUsada() { return 0; }
        funcaoUsada();
      `
    });

    const coverage = await client.send('Profiler.takePreciseCoverage');
    await client.send('Profiler.stopPreciseCoverage');

    console.log(`   ✅ Scripts com cobertura: ${coverage.result.length}`);

    // 13. Resumo dos logs capturados
    console.log('\n📊 Resumo:');
    console.log(`   Console logs capturados: ${consoleLogs.length}`);
    console.log(`   Exceções capturadas: ${exceptions.length}`);

    const logsByType = consoleLogs.reduce((acc, log) => {
      acc[log.type] = (acc[log.type] || 0) + 1;
      return acc;
    }, {});

    console.log('\n   Logs por tipo:');
    Object.entries(logsByType).forEach(([type, count]) => {
      console.log(`     ${type}: ${count}`);
    });

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Console.enable + Runtime.consoleAPICalled capturam console.log');
    console.log('   - Runtime.exceptionThrown captura exceções JavaScript');
    console.log('   - Debugger.enable permite usar breakpoints');
    console.log('   - Runtime.getProperties inspeciona objetos em profundidade');
    console.log('   - Profiler.start/stop para análise de performance de CPU');
    console.log('   - Profiler.startPreciseCoverage para cobertura de código');
    console.log('   - Debugger.setPauseOnExceptions para pausar em erros');

    console.log('\n🔧 Recursos adicionais do Debugger:');
    console.log('   - Debugger.setBreakpointByUrl() - define breakpoint em linha');
    console.log('   - Debugger.pause() - pausa execução');
    console.log('   - Debugger.resume() - continua execução');
    console.log('   - Debugger.stepOver/stepInto/stepOut() - navega pelo código');
    console.log('   - Debugger.evaluateOnCallFrame() - avalia no frame pausado');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
