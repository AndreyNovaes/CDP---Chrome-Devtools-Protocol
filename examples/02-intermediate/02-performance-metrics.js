import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 5: Métricas de Performance
 *
 * Este exemplo demonstra:
 * - Como coletar métricas de performance
 * - Como usar Performance API do Chrome
 * - Como medir tempos de carregamento
 * - Web Vitals (LCP, FID, CLS)
 *
 * Execute: npm run example:05-performance
 */

async function main() {
  console.log('⚡ Exemplo 5: Métricas de Performance\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Performance.enable');

    // 1. Iniciar tracking de performance
    console.log('📊 Iniciando coleta de métricas...\n');

    // Marcar início
    const startTime = Date.now();

    // 2. Navegar para uma página
    const url = 'https://github.com';
    console.log(`🌐 Navegando para: ${url}`);
    await client.send('Page.navigate', { url });

    // Aguardar evento de carregamento
    await new Promise((resolve) => {
      client.on('Page.loadEventFired', () => {
        console.log('✅ Evento Page.load disparado');
        resolve();
      });
    });

    await sleep(2000);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    // 3. Obter métricas do Performance API
    console.log('\n📈 Coletando métricas de performance...\n');

    const metrics = await client.send('Performance.getMetrics');

    console.log('🎯 Métricas do Chrome:');
    const metricMap = {};
    metrics.metrics.forEach(metric => {
      metricMap[metric.name] = metric.value;
      console.log(`   ${metric.name}: ${metric.value.toFixed(4)}`);
    });

    // 4. Obter métricas de timing do navegador
    const timingMetrics = await client.send('Runtime.evaluate', {
      expression: `JSON.stringify({
        // Navigation Timing API
        navigationStart: performance.timing.navigationStart,
        fetchStart: performance.timing.fetchStart,
        domainLookupStart: performance.timing.domainLookupStart,
        domainLookupEnd: performance.timing.domainLookupEnd,
        connectStart: performance.timing.connectStart,
        connectEnd: performance.timing.connectEnd,
        requestStart: performance.timing.requestStart,
        responseStart: performance.timing.responseStart,
        responseEnd: performance.timing.responseEnd,
        domLoading: performance.timing.domLoading,
        domInteractive: performance.timing.domInteractive,
        domContentLoadedEventStart: performance.timing.domContentLoadedEventStart,
        domContentLoadedEventEnd: performance.timing.domContentLoadedEventEnd,
        domComplete: performance.timing.domComplete,
        loadEventStart: performance.timing.loadEventStart,
        loadEventEnd: performance.timing.loadEventEnd
      })`,
      returnByValue: true
    });

    const timing = JSON.parse(timingMetrics.result.value);
    const navStart = timing.navigationStart;

    console.log('\n⏱️  Navigation Timing (ms):');
    console.log(`   DNS Lookup: ${timing.domainLookupEnd - timing.domainLookupStart}ms`);
    console.log(`   TCP Connection: ${timing.connectEnd - timing.connectStart}ms`);
    console.log(`   Request: ${timing.responseStart - timing.requestStart}ms`);
    console.log(`   Response: ${timing.responseEnd - timing.responseStart}ms`);
    console.log(`   DOM Interactive: ${timing.domInteractive - navStart}ms`);
    console.log(`   DOM Complete: ${timing.domComplete - navStart}ms`);
    console.log(`   Load Event: ${timing.loadEventEnd - navStart}ms`);

    // 5. Calcular métricas importantes
    const timeToFirstByte = timing.responseStart - navStart;
    const domContentLoaded = timing.domContentLoadedEventEnd - navStart;
    const windowLoad = timing.loadEventEnd - navStart;

    console.log('\n🎯 Métricas Chave:');
    console.log(`   Time to First Byte (TTFB): ${timeToFirstByte}ms`);
    console.log(`   DOM Content Loaded: ${domContentLoaded}ms`);
    console.log(`   Window Load: ${windowLoad}ms`);
    console.log(`   Total (medido): ${totalTime}ms`);

    // 6. Web Vitals (Largest Contentful Paint)
    const lcpResult = await client.send('Runtime.evaluate', {
      expression: `
        new Promise((resolve) => {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1];
              resolve(lastEntry.renderTime || lastEntry.loadTime);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });

            // Timeout após 5 segundos
            setTimeout(() => resolve(null), 5000);
          } catch (e) {
            resolve(null);
          }
        })
      `,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('\n🎨 Web Vitals:');
    if (lcpResult.result.value) {
      console.log(`   Largest Contentful Paint (LCP): ${lcpResult.result.value.toFixed(2)}ms`);
      if (lcpResult.result.value < 2500) {
        console.log('   ✅ LCP é bom (< 2.5s)');
      } else if (lcpResult.result.value < 4000) {
        console.log('   ⚠️  LCP precisa melhorar (2.5s - 4s)');
      } else {
        console.log('   ❌ LCP é ruim (> 4s)');
      }
    } else {
      console.log('   ⚠️  LCP não disponível');
    }

    // 7. Recursos carregados
    const resourcesResult = await client.send('Runtime.evaluate', {
      expression: `
        performance.getEntriesByType('resource').map(r => ({
          name: r.name.split('/').pop().substring(0, 30),
          type: r.initiatorType,
          duration: r.duration,
          size: r.transferSize
        }))
      `,
      returnByValue: true
    });

    const resources = resourcesResult.result.value;
    console.log(`\n📦 Recursos carregados (${resources.length} total):`);

    // Agrupar por tipo
    const byType = resources.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {});

    Object.entries(byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });

    // Top 5 recursos mais lentos
    const slowest = resources
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5);

    console.log('\n🐌 5 recursos mais lentos:');
    slowest.forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} (${r.type}): ${r.duration.toFixed(2)}ms`);
    });

    // 8. Memory Usage
    const memoryResult = await client.send('Runtime.evaluate', {
      expression: `
        performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null
      `,
      returnByValue: true
    });

    if (memoryResult.result.value) {
      const memory = memoryResult.result.value;
      console.log('\n💾 Uso de Memória:');
      console.log(`   Heap usado: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Heap total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   Limite: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
    }

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - Performance.enable e Performance.getMetrics()');
    console.log('   - Navigation Timing API via Runtime.evaluate');
    console.log('   - Como calcular TTFB, DOMContentLoaded, Load');
    console.log('   - Web Vitals (LCP) usando PerformanceObserver');
    console.log('   - Análise de recursos carregados');
    console.log('   - Monitoramento de memória JavaScript');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

main();
