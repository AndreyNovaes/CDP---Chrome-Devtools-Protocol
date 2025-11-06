# Exercícios Práticos - Chrome DevTools Protocol

Este guia contém exercícios práticos progressivos para você dominar o CDP. Cada exercício tem objetivos claros, dicas e solução.

## Como Usar Este Guia

1. **Leia o objetivo** do exercício
2. **Tente implementar sozinho** antes de ver as dicas
3. **Use as dicas** se ficar travado
4. **Consulte a solução** apenas depois de tentar
5. **Experimente variações** para aprofundar o aprendizado

## Pré-requisitos

- Chrome instalado e rodando com `--remote-debugging-port=9222`
- Node.js 16+
- Dependências instaladas (`npm install`)

---

## 🟢 Nível Básico

### Exercício 1: Monitor de Título
**Objetivo**: Criar um script que monitora mudanças no título da página em tempo real.

**Requisitos**:
1. Conecte ao Chrome
2. Navegue para uma página
3. Monitore o título da página a cada 2 segundos
4. Exiba quando o título mudar

**Dicas**:
- Use `Runtime.evaluate` com `document.title`
- Use `setInterval` para verificar periodicamente
- Compare o título anterior com o novo

**Arquivo**: `exercises/exercise-01.js`

**Desafio Extra**:
- Detecte automaticamente quando o título muda usando eventos
- Adicione timestamp das mudanças
- Salve histórico de títulos em arquivo

---

### Exercício 2: Extrator de Links
**Objetivo**: Extrair todos os links de uma página e salvar em JSON.

**Requisitos**:
1. Navegue para uma página (ex: https://news.ycombinator.com)
2. Extraia todos os links `<a href="...">`
3. Para cada link, capture:
   - URL
   - Texto do link
   - Se abre em nova aba (target="_blank")
4. Salve em `links.json`

**Dicas**:
- Use `document.querySelectorAll('a')`
- Use `Array.from()` para converter NodeList
- Use `JSON.stringify(data, null, 2)` para formatar
- Use `fs.writeFileSync()` para salvar

**Arquivo**: `exercises/exercise-02.js`

**Desafio Extra**:
- Categorize links (internos vs externos)
- Verifique links quebrados (status 404)
- Crie um relatório HTML

---

### Exercício 3: Screenshot Automático
**Objetivo**: Criar um script que tira screenshots de múltiplas páginas automaticamente.

**Requisitos**:
1. Receba uma lista de URLs via argumento ou arquivo
2. Para cada URL:
   - Navegue para a página
   - Aguarde carregamento completo
   - Tire screenshot
   - Salve com nome baseado no domínio
3. Exiba progresso no console

**Dicas**:
- Use `process.argv` para argumentos
- Use `new URL(url).hostname` para nome do arquivo
- Use `Page.loadEventFired` para aguardar carregamento

**Arquivo**: `exercises/exercise-03.js`

**Desafio Extra**:
- Adicione opções: viewport size, formato (PNG/JPG)
- Tire screenshots mobile e desktop
- Crie thumbnails menores

---

## 🟡 Nível Intermediário

### Exercício 4: Analisador de Performance
**Objetivo**: Criar uma ferramenta de análise de performance de sites.

**Requisitos**:
1. Navegue para um site
2. Colete as seguintes métricas:
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)
   - Total de requisições
   - Tamanho total transferido
   - DOM nodes count
3. Gere um relatório formatado
4. Dê nota (A-F) baseada nas métricas

**Dicas**:
- Use `Performance.enable` e `Performance.getMetrics`
- Use `Navigation Timing API` via `Runtime.evaluate`
- Use `Network` domain para contar requisições

**Arquivo**: `exercises/exercise-04.js`

**Desafio Extra**:
- Compare múltiplos sites
- Gere gráfico visual (ASCII art ou imagem)
- Teste com diferentes velocidades de rede

---

### Exercício 5: Bloqueador de Anúncios
**Objetivo**: Implementar um bloqueador de anúncios básico usando CDP.

**Requisitos**:
1. Crie uma lista de padrões de URLs de anúncios
2. Bloqueie essas URLs antes de carregar
3. Navegue para um site com anúncios
4. Conte quantos anúncios foram bloqueados
5. Compare tempo de carregamento com/sem bloqueio

**Dicas**:
- Use `Network.setBlockedURLs`
- Padrões comuns: `*doubleclick*`, `*googlesyndication*`, `*ads*`
- Use `Network.loadingFailed` para contar bloqueios

**Arquivo**: `exercises/exercise-05.js`

**Desafio Extra**:
- Carregue lista de filtros de arquivo (EasyList format)
- Mostre economia de banda
- Gere relatório de privacidade

---

### Exercício 6: Cookie Inspector
**Objetivo**: Criar uma ferramenta para inspecionar e analisar cookies.

**Requisitos**:
1. Navegue para um site (ex: e-commerce)
2. Liste todos os cookies
3. Para cada cookie, exiba:
   - Nome e valor
   - Domínio e path
   - Flags (Secure, HttpOnly, SameSite)
   - Expiração
4. Identifique cookies de tracking (terceiros)
5. Calcule "privacy score"

**Dicas**:
- Use `Network.getAllCookies`
- Cookie de tracking geralmente tem domínio diferente do site
- Cookies sem expiração são de sessão

**Arquivo**: `exercises/exercise-06.js`

**Desafio Extra**:
- Detecte violações GDPR
- Simule aceitação/rejeição de cookies
- Compare antes/depois de aceitar cookies

---

## 🔴 Nível Avançado

### Exercício 7: Crawler com JavaScript Rendering
**Objetivo**: Criar um web crawler que executa JavaScript e extrai dados estruturados.

**Requisitos**:
1. Implemente crawler que:
   - Navega para uma seed URL
   - Extrai links da página
   - Segue links até N níveis de profundidade
   - Extrai dados estruturados (título, descrição, etc)
2. Respeite robots.txt
3. Implemente rate limiting
4. Salve dados em JSON Lines format

**Dicas**:
- Use fila (array) para URLs a visitar
- Use Set para URLs já visitadas
- Use `setTimeout` para rate limiting
- Trate erros de navegação

**Arquivo**: `exercises/exercise-07.js`

**Desafio Extra**:
- Adicione suporte a sitemap.xml
- Implemente retry com exponential backoff
- Detecte e evite spider traps
- Adicione suporte a JavaScript infinito scroll

---

### Exercício 8: E2E Test Framework
**Objetivo**: Criar um mini framework de testes E2E usando CDP.

**Requisitos**:
1. Implemente funções:
   - `describe(name, fn)` - agrupa testes
   - `it(name, fn)` - define teste
   - `expect(value).toBe(expected)` - asserção
2. Suporte a:
   - Setup/teardown (beforeEach, afterEach)
   - Test isolation (limpar estado entre testes)
   - Screenshots on failure
3. Relatório de resultados colorido

**Exemplo de uso**:
```javascript
describe('Login Flow', () => {
  beforeEach(async () => {
    await navigate('https://example.com/login');
  });

  it('should login successfully', async () => {
    await fillInput('#email', 'user@example.com');
    await fillInput('#password', 'password123');
    await click('#login-btn');
    await waitForSelector('.dashboard');
    const title = await getText('h1');
    expect(title).toBe('Dashboard');
  });
});
```

**Arquivo**: `exercises/exercise-08.js`

**Desafio Extra**:
- Adicione parallel execution
- Gere relatório HTML
- Integre com CI/CD
- Adicione code coverage

---

### Exercício 9: Real User Monitoring (RUM)
**Objetivo**: Implementar sistema de monitoramento real de usuários.

**Requisitos**:
1. Injete script de monitoramento na página
2. Colete métricas:
   - Page load time
   - Resource timing
   - JavaScript errors
   - User interactions (clicks, scrolls)
   - Rage clicks (múltiplos clicks rápidos)
3. Envie dados para servidor (mock)
4. Gere dashboard com agregados

**Dicas**:
- Use `Runtime.evaluate` para injetar script
- Use `PerformanceObserver` para métricas
- Use eventos DOM para interações
- Use `Runtime.exceptionThrown` para erros

**Arquivo**: `exercises/exercise-09.js`

**Desafio Extra**:
- Implemente session replay
- Detecte performance regressions
- Implemente alertas automáticos
- Adicione heatmap de cliques

---

### Exercício 10: Visual Regression Testing
**Objetivo**: Criar ferramenta de teste de regressão visual.

**Requisitos**:
1. Tire screenshots de páginas (baseline)
2. Em execuções futuras, compare com baseline
3. Detecte diferenças visuais pixel-a-pixel
4. Gere diff image mostrando diferenças
5. Suporte a thresholds de tolerância

**Dicas**:
- Use biblioteca como `pixelmatch` para comparação
- Salve baselines em pasta separada
- Use PNG para comparação (sem compressão)
- Normalize rendering (aguarde fonts, imagens)

**Arquivo**: `exercises/exercise-10.js`

**Desafio Extra**:
- Ignore áreas dinâmicas (timestamps, ads)
- Teste múltiplos viewports
- Integre com Git (baseline por branch)
- Gere relatório HTML interativo

---

## 🏆 Projetos Finais

### Projeto 1: Lighthouse Clone
Crie sua própria versão simplificada do Lighthouse que audita:
- Performance
- Acessibilidade
- SEO
- Best Practices

### Projeto 2: Web Scraping API
Crie uma API REST que aceita URL e retorna dados estruturados:
```
POST /scrape
{
  "url": "https://example.com",
  "selectors": {
    "title": "h1",
    "price": ".price",
    "description": ".desc"
  }
}
```

### Projeto 3: Browser Automation Platform
Crie uma plataforma web onde usuários podem:
- Criar workflows de automação (sem código)
- Agendar execuções
- Ver histórico e logs
- Receber notificações

---

## Recursos Adicionais

### Debugging
Se algo não funcionar:
1. Verifique se Chrome está rodando (`lsof -i :9222`)
2. Veja logs detalhados (adicione `console.log` no cliente CDP)
3. Use Chrome DevTools para inspecionar a página
4. Consulte documentação oficial

### Comunidade
- [Discord CDP](https://discord.gg/...) (fictício)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-devtools-protocol)
- [GitHub Issues](https://github.com/ChromeDevTools/devtools-protocol/issues)

### Próximos Passos
1. Complete todos os exercícios
2. Implemente um dos projetos finais
3. Contribua com exemplos para a comunidade
4. Explore domínios avançados (Tracing, WebAudio, WebAuthn)

---

**Boa sorte e bom aprendizado! 🚀**

Dúvidas ou sugestões? Abra uma issue no repositório.
