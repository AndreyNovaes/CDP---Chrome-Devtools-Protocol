# CDP Cheatsheet - Referência Rápida

## Conexão Básica

```javascript
import { createCDPClient } from './utils/cdp-client.js';

const client = await createCDPClient();
await client.send('Page.enable');
```

## Page Domain

### Navegação
```javascript
// Navegar
await client.send('Page.navigate', { url: 'https://example.com' });

// Reload
await client.send('Page.reload');

// Voltar/Avançar
await client.send('Page.navigateToHistoryEntry', { entryId });

// Parar carregamento
await client.send('Page.stopLoading');
```

### Screenshots
```javascript
// Screenshot viewport
const screenshot = await client.send('Page.captureScreenshot', {
  format: 'png',
  quality: 100
});

// Screenshot página inteira
const metrics = await client.send('Page.getLayoutMetrics');
await client.send('Emulation.setDeviceMetricsOverride', {
  width: Math.ceil(metrics.contentSize.width),
  height: Math.ceil(metrics.contentSize.height),
  deviceScaleFactor: 1,
  mobile: false
});
const fullScreenshot = await client.send('Page.captureScreenshot');
```

### PDF
```javascript
const pdf = await client.send('Page.printToPDF', {
  printBackground: true,
  landscape: false,
  paperWidth: 8.5,
  paperHeight: 11,
  marginTop: 0.4,
  marginBottom: 0.4,
  marginLeft: 0.4,
  marginRight: 0.4
});
```

### Eventos
```javascript
client.on('Page.loadEventFired', () => console.log('Loaded'));
client.on('Page.frameNavigated', (params) => console.log('Navigated:', params.frame.url));
```

## Runtime Domain

### Executar JavaScript
```javascript
// Simples
const result = await client.send('Runtime.evaluate', {
  expression: 'document.title',
  returnByValue: true
});

// Async/await
const asyncResult = await client.send('Runtime.evaluate', {
  expression: '(async () => { return await fetch("/api"); })()',
  awaitPromise: true,
  returnByValue: true
});

// Com objeto de retorno
const obj = await client.send('Runtime.evaluate', {
  expression: 'window.myObject'
  // Não use returnByValue para obter objectId
});
```

### Inspecionar Objetos
```javascript
const props = await client.send('Runtime.getProperties', {
  objectId: someObjectId,
  ownProperties: true
});
```

### Console
```javascript
await client.send('Console.enable');

client.on('Runtime.consoleAPICalled', (params) => {
  console.log(`[${params.type}]`, ...params.args.map(a => a.value));
});

client.on('Runtime.exceptionThrown', (params) => {
  console.error('Exception:', params.exceptionDetails.text);
});
```

## Network Domain

### Monitoramento
```javascript
await client.send('Network.enable');

client.on('Network.requestWillBeSent', (params) => {
  console.log('Request:', params.request.url);
});

client.on('Network.responseReceived', (params) => {
  console.log('Response:', params.response.status);
});

client.on('Network.dataReceived', (params) => {
  console.log('Data:', params.dataLength, 'bytes');
});
```

### Controle
```javascript
// Desabilitar cache
await client.send('Network.setCacheDisabled', { cacheDisabled: true });

// Bloquear URLs
await client.send('Network.setBlockedURLs', {
  urls: ['*.jpg', '*.png', '*ads*']
});

// Simular rede lenta
await client.send('Network.emulateNetworkConditions', {
  offline: false,
  latency: 100,
  downloadThroughput: 500 * 1024,
  uploadThroughput: 500 * 1024
});

// Headers customizados
await client.send('Network.setExtraHTTPHeaders', {
  headers: { 'X-Custom': 'value' }
});
```

### Cookies
```javascript
// Obter todos
const cookies = await client.send('Network.getAllCookies');

// Definir cookie
await client.send('Network.setCookie', {
  name: 'test',
  value: '123',
  domain: '.example.com',
  path: '/'
});

// Deletar cookie
await client.send('Network.deleteCookies', {
  name: 'test',
  domain: '.example.com'
});
```

## DOM Domain

### Query
```javascript
await client.send('DOM.enable');

// Obter documento
const doc = await client.send('DOM.getDocument');

// Query selector
const nodeId = await client.send('DOM.querySelector', {
  nodeId: doc.root.nodeId,
  selector: '#myElement'
});

// Query all
const nodeIds = await client.send('DOM.querySelectorAll', {
  nodeId: doc.root.nodeId,
  selector: '.items'
});
```

### Manipulação
```javascript
// Obter atributos
const attrs = await client.send('DOM.getAttributes', { nodeId });

// Definir atributo
await client.send('DOM.setAttributeValue', {
  nodeId,
  name: 'class',
  value: 'active'
});

// Obter HTML
const html = await client.send('DOM.getOuterHTML', { nodeId });
```

## Input Domain

### Teclado
```javascript
// Digitar texto
for (const char of 'Hello') {
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyDown',
    text: char
  });
  await client.send('Input.dispatchKeyEvent', {
    type: 'keyUp',
    text: char
  });
}

// Teclas especiais
await client.send('Input.dispatchKeyEvent', {
  type: 'keyDown',
  key: 'Enter',
  code: 'Enter'
});
```

### Mouse
```javascript
// Mover
await client.send('Input.dispatchMouseEvent', {
  type: 'mouseMoved',
  x: 100,
  y: 200
});

// Clicar
await client.send('Input.dispatchMouseEvent', {
  type: 'mousePressed',
  x: 100,
  y: 200,
  button: 'left',
  clickCount: 1
});

await client.send('Input.dispatchMouseEvent', {
  type: 'mouseReleased',
  x: 100,
  y: 200,
  button: 'left',
  clickCount: 1
});
```

## Performance Domain

```javascript
await client.send('Performance.enable');

// Obter métricas
const metrics = await client.send('Performance.getMetrics');

// Procurar métrica específica
const jsHeap = metrics.metrics.find(m => m.name === 'JSHeapUsedSize').value;
```

## Debugger Domain

```javascript
await client.send('Debugger.enable');

// Breakpoint
await client.send('Debugger.setBreakpointByUrl', {
  lineNumber: 10,
  url: 'https://example.com/script.js'
});

// Pausar em exceções
await client.send('Debugger.setPauseOnExceptions', {
  state: 'all' // 'none', 'uncaught', 'all'
});

// Eventos
client.on('Debugger.paused', async (params) => {
  console.log('Paused at:', params.callFrames[0].location);
  await client.send('Debugger.resume');
});
```

## Profiler Domain

```javascript
await client.send('Profiler.enable');

// CPU Profile
await client.send('Profiler.start');
// ... código para profile
const profile = await client.send('Profiler.stop');

// Code Coverage
await client.send('Profiler.startPreciseCoverage', {
  callCount: true,
  detailed: true
});
// ... executar código
const coverage = await client.send('Profiler.takePreciseCoverage');
await client.send('Profiler.stopPreciseCoverage');
```

## Storage Domain

```javascript
await client.send('Storage.enable');

// Limpar storage
await client.send('Storage.clearDataForOrigin', {
  origin: 'https://example.com',
  storageTypes: 'local_storage,session_storage,cookies,indexeddb'
});

// Quota
const quota = await client.send('Storage.getUsageAndQuota', {
  origin: 'https://example.com'
});
```

## Emulation Domain

### Device Emulation
```javascript
// Mobile
await client.send('Emulation.setDeviceMetricsOverride', {
  width: 375,
  height: 667,
  deviceScaleFactor: 2,
  mobile: true
});

// Desktop
await client.send('Emulation.setDeviceMetricsOverride', {
  width: 1920,
  height: 1080,
  deviceScaleFactor: 1,
  mobile: false
});

// Limpar override
await client.send('Emulation.clearDeviceMetricsOverride');
```

### User Agent
```javascript
await client.send('Emulation.setUserAgentOverride', {
  userAgent: 'Mozilla/5.0 Custom Bot'
});
```

### Geolocation
```javascript
await client.send('Emulation.setGeolocationOverride', {
  latitude: 40.7128,
  longitude: -74.0060,
  accuracy: 100
});
```

### Timezone
```javascript
await client.send('Emulation.setTimezoneOverride', {
  timezoneId: 'America/New_York'
});
```

## Padrões Úteis

### Aguardar Elemento
```javascript
async function waitForSelector(client, selector, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const exists = await client.send('Runtime.evaluate', {
      expression: `document.querySelector('${selector}') !== null`,
      returnByValue: true
    });
    if (exists.result.value) return true;
    await new Promise(r => setTimeout(r, 100));
  }
  throw new Error(`Timeout: ${selector}`);
}
```

### Click em Elemento
```javascript
async function click(client, selector) {
  await client.send('Runtime.evaluate', {
    expression: `document.querySelector('${selector}').click()`
  });
}
```

### Preencher Input
```javascript
async function fillInput(client, selector, text) {
  await client.send('Runtime.evaluate', {
    expression: `
      const el = document.querySelector('${selector}');
      el.focus();
      el.value = '${text}';
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    `
  });
}
```

### Obter Texto
```javascript
async function getText(client, selector) {
  const result = await client.send('Runtime.evaluate', {
    expression: `document.querySelector('${selector}')?.textContent`,
    returnByValue: true
  });
  return result.result.value;
}
```

### Aguardar Navegação
```javascript
async function waitForNavigation(client) {
  return new Promise(resolve => {
    client.on('Page.frameNavigated', resolve);
  });
}
```

## Referências

- [CDP Docs](https://chromedevtools.github.io/devtools-protocol/)
- [Protocol Viewer](https://vanilla.aslushnikov.com/)
- [Este Repositório](./README.md)

---

💡 **Dica**: Mantenha este arquivo aberto enquanto programa com CDP!
