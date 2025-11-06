import { createCDPClient, sleep } from '../../utils/cdp-client.js';

/**
 * EXEMPLO 8: Automação de Formulários
 *
 * Este exemplo demonstra:
 * - Como interagir com formulários
 * - Como preencher inputs
 * - Como clicar em elementos
 * - Como simular eventos do usuário
 * - Como esperar por elementos
 *
 * Execute: npm run example:08-automation
 */

async function main() {
  console.log('🤖 Exemplo 8: Automação de Formulários\n');

  try {
    const client = await createCDPClient();

    await client.send('Page.enable');
    await client.send('Runtime.enable');
    await client.send('Input.enable');
    await client.send('DOM.enable');

    // 1. Criar uma página de teste com formulário
    console.log('📝 Criando página de teste com formulário...\n');

    await client.send('Page.navigate', { url: 'about:blank' });
    await sleep(1000);

    // Injetar HTML com formulário
    await client.send('Runtime.evaluate', {
      expression: `
        document.body.innerHTML = \`
          <style>
            body { font-family: Arial; padding: 20px; }
            form { max-width: 400px; }
            input, select, textarea {
              width: 100%;
              padding: 8px;
              margin: 8px 0;
              border: 1px solid #ddd;
              border-radius: 4px;
            }
            button {
              padding: 10px 20px;
              background: #007bff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
            .result {
              margin-top: 20px;
              padding: 10px;
              background: #f0f0f0;
              border-radius: 4px;
            }
          </style>

          <h1>Formulário de Teste</h1>
          <form id="testForm">
            <label>Nome:</label>
            <input type="text" id="nome" name="nome" required>

            <label>Email:</label>
            <input type="email" id="email" name="email" required>

            <label>Idade:</label>
            <input type="number" id="idade" name="idade" min="1" max="120">

            <label>País:</label>
            <select id="pais" name="pais">
              <option value="">Selecione...</option>
              <option value="brasil">Brasil</option>
              <option value="portugal">Portugal</option>
              <option value="eua">Estados Unidos</option>
            </select>

            <label>Comentários:</label>
            <textarea id="comentarios" name="comentarios" rows="3"></textarea>

            <label>
              <input type="checkbox" id="aceito" name="aceito">
              Aceito os termos
            </label>

            <button type="submit">Enviar</button>
          </form>

          <div id="resultado" class="result" style="display:none;"></div>

          <script>
            document.getElementById('testForm').addEventListener('submit', (e) => {
              e.preventDefault();

              const formData = new FormData(e.target);
              const data = Object.fromEntries(formData.entries());

              document.getElementById('resultado').innerHTML =
                '<h3>Dados do Formulário:</h3>' +
                '<pre>' + JSON.stringify(data, null, 2) + '</pre>';
              document.getElementById('resultado').style.display = 'block';

              console.log('Formulário submetido:', data);
            });
          </script>
        \`;
      `
    });

    console.log('✅ Formulário criado\n');
    await sleep(500);

    // 2. Método 1: Preencher usando Runtime.evaluate
    console.log('✏️  Método 1: Preenchendo com Runtime.evaluate...\n');

    await client.send('Runtime.evaluate', {
      expression: `
        document.getElementById('nome').value = 'João Silva';
        document.getElementById('email').value = 'joao@example.com';
        document.getElementById('idade').value = '30';
        document.getElementById('pais').value = 'brasil';
        document.getElementById('comentarios').value = 'Teste automatizado via CDP!';
        document.getElementById('aceito').checked = true;
      `
    });

    console.log('   ✅ Campos preenchidos');
    await sleep(500);

    // 3. Verificar valores
    console.log('\n📋 Verificando valores preenchidos...\n');

    const valores = await client.send('Runtime.evaluate', {
      expression: `({
        nome: document.getElementById('nome').value,
        email: document.getElementById('email').value,
        idade: document.getElementById('idade').value,
        pais: document.getElementById('pais').value,
        comentarios: document.getElementById('comentarios').value,
        aceito: document.getElementById('aceito').checked
      })`,
      returnByValue: true
    });

    console.log('   Valores:', JSON.stringify(valores.result.value, null, 2));

    // 4. Método 2: Usar DOM domain para encontrar elementos
    console.log('\n🔍 Método 2: Usando DOM domain...\n');

    // Obter documento
    const doc = await client.send('DOM.getDocument');
    const rootNodeId = doc.root.nodeId;

    // Encontrar elemento por selector
    const nomeNodeId = await client.send('DOM.querySelector', {
      nodeId: rootNodeId,
      selector: '#nome'
    });

    console.log(`   ✅ Elemento #nome encontrado (nodeId: ${nomeNodeId.nodeId})`);

    // 5. Método 3: Simular digitação realista
    console.log('\n⌨️  Método 3: Simulando digitação realista...\n');

    // Limpar campo
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('nome').value = ''`
    });

    // Focar no campo
    await client.send('Runtime.evaluate', {
      expression: `document.getElementById('nome').focus()`
    });

    // Digitar caractere por caractere
    const texto = 'Maria Santos';
    console.log(`   Digitando: "${texto}"`);

    for (const char of texto) {
      // Simular keydown
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyDown',
        text: char
      });

      // Simular keyup
      await client.send('Input.dispatchKeyEvent', {
        type: 'keyUp',
        text: char
      });

      await sleep(50); // Delay entre teclas
    }

    console.log('   ✅ Texto digitado');

    // Verificar
    const nomeAtual = await client.send('Runtime.evaluate', {
      expression: `document.getElementById('nome').value`,
      returnByValue: true
    });
    console.log(`   Valor atual: "${nomeAtual.result.value}"`);

    // 6. Simular clique no botão
    console.log('\n🖱️  Simulando clique no botão submit...\n');

    // Método 1: Click via JavaScript
    await client.send('Runtime.evaluate', {
      expression: `document.querySelector('button[type="submit"]').click()`
    });

    console.log('   ✅ Botão clicado');
    await sleep(500);

    // 7. Verificar resultado
    console.log('\n📊 Verificando resultado da submissão...\n');

    const resultadoVisivel = await client.send('Runtime.evaluate', {
      expression: `
        document.getElementById('resultado').style.display !== 'none'
      `,
      returnByValue: true
    });

    if (resultadoVisivel.result.value) {
      const conteudoResultado = await client.send('Runtime.evaluate', {
        expression: `document.getElementById('resultado').textContent`,
        returnByValue: true
      });
      console.log('   ✅ Formulário submetido com sucesso!');
      console.log('   Resultado:', conteudoResultado.result.value.trim().substring(0, 100) + '...');
    }

    // 8. Método 4: Usar Input.dispatchMouseEvent para clique preciso
    console.log('\n🎯 Método 4: Clique preciso com coordenadas...\n');

    // Obter posição do botão
    const btnBox = await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btn = document.querySelector('button[type="submit"]');
          const rect = btn.getBoundingClientRect();
          return {
            x: rect.left + rect.width / 2,
            y: rect.top + rect.height / 2
          };
        })()
      `,
      returnByValue: true
    });

    const { x, y } = btnBox.result.value;
    console.log(`   Posição do botão: (${x}, ${y})`);

    // Simular mousemove, mousedown, mouseup
    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x,
      y
    });

    await client.send('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x,
      y,
      button: 'left',
      clickCount: 1
    });

    await client.send('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x,
      y,
      button: 'left',
      clickCount: 1
    });

    console.log('   ✅ Clique simulado com coordenadas');

    // 9. Aguardar elemento aparecer (polling)
    console.log('\n⏳ Aguardando elemento...\n');

    const aguardarElemento = async (selector, timeout = 5000) => {
      const start = Date.now();
      while (Date.now() - start < timeout) {
        const exists = await client.send('Runtime.evaluate', {
          expression: `document.querySelector('${selector}') !== null`,
          returnByValue: true
        });

        if (exists.result.value) {
          return true;
        }

        await sleep(100);
      }
      return false;
    };

    const encontrado = await aguardarElemento('#resultado');
    console.log(`   Elemento #resultado ${encontrado ? 'encontrado' : 'não encontrado'}`);

    // 10. Screenshot final
    console.log('\n📸 Tirando screenshot do resultado...\n');

    const screenshot = await client.send('Page.captureScreenshot', {
      format: 'png'
    });

    const { writeFileSync } = await import('fs');
    writeFileSync('form-automation-result.png', Buffer.from(screenshot.data, 'base64'));
    console.log('   ✅ Screenshot salvo: form-automation-result.png');

    console.log('\n✅ Exemplo concluído!');
    console.log('\n💡 O que você aprendeu:');
    console.log('   - 3 métodos de preencher formulários:');
    console.log('     1. Runtime.evaluate (rápido, simples)');
    console.log('     2. DOM.querySelector (mais estruturado)');
    console.log('     3. Input.dispatchKeyEvent (mais realista)');
    console.log('   - Input.dispatchMouseEvent para cliques precisos');
    console.log('   - Como aguardar elementos com polling');
    console.log('   - Como simular interações do usuário');
    console.log('   - Como validar resultados de submissão');

    console.log('\n🎯 Casos de uso:');
    console.log('   - Testes automatizados de formulários');
    console.log('   - Preenchimento automático de dados');
    console.log('   - Web scraping com interação');
    console.log('   - Automação de workflows complexos');

    client.close();

  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

main();
