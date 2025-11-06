# Guia de Início Rápido - CDP

Este guia te leva do zero ao primeiro exemplo em 5 minutos!

## 1. Instalar Dependências

```bash
npm install
```

## 2. Iniciar o Chrome com Debug

Você precisa iniciar o Chrome com o modo de debug remoto ativo. Escolha o comando para seu sistema operacional:

### Windows

```bash
"C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-debug"
```

### macOS

```bash
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

### Linux

```bash
google-chrome --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-debug"
```

> **Dica**: Uma janela do Chrome vai abrir. Deixe ela aberta!

## 3. Verificar Conexão

Abra seu navegador normal e acesse:
```
http://localhost:9222/json/list
```

Você deve ver um JSON com informações das páginas abertas. Se ver isso, está tudo certo! ✅

## 4. Executar Primeiro Exemplo

```bash
npm run example:01-basic
```

Você deve ver:
```
✅ Conectado ao Chrome via CDP
🔗 Conectando à página: ...
📄 Habilitando domínio Page...
🌐 Navegando para: https://example.com
...
✅ Exemplo concluído com sucesso!
```

## 5. Experimentar Outros Exemplos

```bash
# Screenshot
npm run example:02-screenshot

# Executar JavaScript
npm run example:03-execute-js

# Interceptar rede
npm run example:04-network

# Métricas de performance
npm run example:05-performance

# Cookies e storage
npm run example:06-cookies

# Debugging
npm run example:07-debugging

# Automação de formulários
npm run example:08-automation

# Geração de PDF
npm run example:09-pdf
```

## 6. Fazer Exercícios

```bash
# Exercício 1: Monitor de título
npm run exercise:01

# Exercício 2: Extrator de links
npm run exercise:02

# Exercício 3: Screenshots automáticos
npm run exercise:03
```

## Estrutura do Projeto

```
CDP---Chrome-Devtools-Protocol/
├── examples/
│   ├── 01-basic/          # Exemplos básicos
│   ├── 02-intermediate/   # Exemplos intermediários
│   └── 03-advanced/       # Exemplos avançados
├── exercises/             # Exercícios para praticar
├── utils/
│   └── cdp-client.js     # Cliente CDP reutilizável
├── README.md             # Documentação principal
├── ARTICLE.md            # Artigo completo sobre CDP
├── EXERCISES.md          # Guia de exercícios
└── QUICKSTART.md         # Este arquivo
```

## Troubleshooting

### "Failed to connect to Chrome"

**Problema**: O script não consegue conectar ao Chrome.

**Solução**:
1. Verifique se o Chrome está rodando com `--remote-debugging-port=9222`
2. Acesse `http://localhost:9222/json/list` no navegador para confirmar
3. Se a porta estiver em uso, tente outra porta (ex: 9223)

### "No pages found"

**Problema**: Chrome está rodando mas sem páginas abertas.

**Solução**: Abra uma aba manualmente no Chrome ou adicione `about:blank` ao comando de inicialização.

### "WebSocket connection failed"

**Problema**: Conexão WebSocket falhou.

**Solução**:
1. Verifique se a porta 9222 está livre: `lsof -i :9222` (Mac/Linux)
2. Desative firewall temporariamente para testar
3. Reinicie o Chrome

### Módulo não encontrado

**Problema**: `Error: Cannot find module 'ws'`

**Solução**: Execute `npm install` novamente

## Próximos Passos

1. ✅ Execute todos os exemplos básicos
2. ✅ Leia o [ARTICLE.md](./ARTICLE.md) para entender conceitos
3. ✅ Complete os exercícios em [EXERCISES.md](./EXERCISES.md)
4. ✅ Implemente seu próprio caso de uso
5. ✅ Compartilhe com a comunidade!

## Recursos Úteis

- [Documentação Oficial do CDP](https://chromedevtools.github.io/devtools-protocol/)
- [Protocol Viewer](https://vanilla.aslushnikov.com/)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)

## Dúvidas?

- Abra uma issue no repositório
- Consulte a documentação oficial
- Pergunte na comunidade

---

**Divirta-se aprendendo CDP! 🚀**
