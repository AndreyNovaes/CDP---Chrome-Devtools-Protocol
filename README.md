# Chrome DevTools Protocol (CDP) - Guia Prático

Este repositório contém exemplos práticos e progressivos para aprender o Chrome DevTools Protocol (CDP) do zero, usando Node.js puro e WebSocket, sem frameworks como Puppeteer ou Playwright.

## 🎯 Objetivo

Entender como o CDP funciona "por baixo dos panos" e como frameworks como Playwright e Puppeteer o utilizam para automatizar navegadores.

## 🚀 Como Começar

### Pré-requisitos

- Node.js 16+ instalado
- Google Chrome instalado
- Terminal/Command Prompt

### Instalação

```bash
# Clone o repositório
git clone <seu-repositorio>
cd CDP---Chrome-Devtools-Protocol

# Instale as dependências
npm install
```

### Iniciando o Chrome com CDP habilitado

Para usar o CDP, você precisa iniciar o Chrome com o modo de debug remoto ativo:

#### Windows
```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-debug"
```

#### macOS
```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

#### Linux
```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

Depois de executar o comando, você verá uma instância do Chrome abrir. Deixe essa janela aberta enquanto executa os exemplos.

## 📚 Estrutura do Repositório

```
CDP---Chrome-Devtools-Protocol/
├── README.md                          # Este arquivo
├── ARTICLE.md                         # Artigo completo sobre CDP
├── EXERCISES.md                       # Guia de exercícios
├── package.json
├── examples/
│   ├── 01-basic/                      # Exemplos básicos
│   │   ├── 01-connect.js              # Conectar ao Chrome
│   │   ├── 02-screenshot.js           # Tirar screenshots
│   │   └── 03-execute-javascript.js   # Executar JavaScript
│   ├── 02-intermediate/               # Exemplos intermediários
│   │   ├── 01-network-interception.js # Interceptar requisições
│   │   ├── 02-performance-metrics.js  # Métricas de performance
│   │   └── 03-cookies-storage.js      # Manipular cookies
│   └── 03-advanced/                   # Exemplos avançados
│       ├── 01-debugging.js            # Debugging com CDP
│       ├── 02-form-automation.js      # Automação de formulários
│       └── 03-pdf-generation.js       # Gerar PDFs
├── exercises/                         # Exercícios práticos
│   ├── exercise-01.js
│   ├── exercise-02.js
│   └── exercise-03.js
└── utils/
    └── cdp-client.js                  # Cliente CDP reutilizável
```

## 🎓 Roteiro de Aprendizado

### Nível 1: Básico
1. **Conexão**: Aprenda a conectar ao Chrome via WebSocket
2. **Navegação**: Navegue entre páginas
3. **Screenshots**: Capture imagens da página
4. **JavaScript**: Execute código JavaScript na página

### Nível 2: Intermediário
5. **Network**: Intercepte e modifique requisições HTTP
6. **Performance**: Colete métricas de performance
7. **Storage**: Manipule cookies, localStorage e sessionStorage

### Nível 3: Avançado
8. **Debugging**: Use breakpoints e debug JavaScript
9. **Automação**: Automatize interações complexas
10. **PDF**: Gere PDFs de páginas web

## 🏃 Executando os Exemplos

```bash
# Exemplo básico - Conectar ao Chrome
npm run example:01-basic

# Tirar screenshot
npm run example:02-screenshot

# Executar JavaScript
npm run example:03-execute-js

# Interceptar rede
npm run example:04-network

# Métricas de performance
npm run example:05-performance

# E assim por diante...
```

## 💡 O que é o CDP?

O Chrome DevTools Protocol (CDP) é um protocolo que permite que ferramentas externas instrumentem, inspecionem, depurem e criem perfis de navegadores baseados em Chromium (Chrome, Edge, Brave, etc.).

### Como funciona?

1. **WebSocket Connection**: O Chrome expõe um servidor WebSocket
2. **JSON Messages**: Comandos e eventos são trocados via JSON
3. **Domains**: O protocolo é organizado em "domínios" (Page, Network, DOM, etc.)
4. **Async/Event-driven**: Baseado em promises e eventos

### Por que aprender CDP?

- 🔍 **Entender frameworks**: Veja como Playwright/Puppeteer funcionam internamente
- ⚡ **Performance**: Crie soluções mais eficientes
- 🛠️ **Customização**: Vá além do que frameworks oferecem
- 🎯 **Debug avançado**: Técnicas profissionais de debugging

## 📖 Recursos Adicionais

- [CDP Official Documentation](https://chromedevtools.github.io/devtools-protocol/)
- [Chrome DevTools Protocol Viewer](https://vanilla.aslushnikov.com/)
- [Artigo completo neste repo](./ARTICLE.md)
- [Exercícios práticos](./EXERCISES.md)

## 🤝 Contribuindo

Sinta-se à vontade para adicionar mais exemplos, melhorar a documentação ou corrigir bugs!

## 📝 Licença

MIT
