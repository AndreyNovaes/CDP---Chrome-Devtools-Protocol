import WebSocket from 'ws';

/**
 * Cliente CDP (Chrome DevTools Protocol) simplificado
 * Demonstra como frameworks como Playwright/Puppeteer funcionam internamente
 */
export class CDPClient {
  constructor() {
    this.ws = null;
    this.messageId = 0;
    this.callbacks = new Map();
    this.eventListeners = new Map();
  }

  /**
   * Conecta ao Chrome via WebSocket
   * @param {string} wsUrl - URL do WebSocket (ex: ws://localhost:9222/devtools/page/...)
   */
  async connect(wsUrl) {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(wsUrl);

      this.ws.on('open', () => {
        console.log('✅ Conectado ao Chrome via CDP');
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data.toString()));
      });

      this.ws.on('error', (error) => {
        console.error('❌ Erro no WebSocket:', error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        console.log('🔌 Conexão fechada');
      });
    });
  }

  /**
   * Processa mensagens recebidas do Chrome
   */
  handleMessage(message) {
    // Resposta a um comando enviado
    if (message.id !== undefined) {
      const callback = this.callbacks.get(message.id);
      if (callback) {
        if (message.error) {
          callback.reject(new Error(message.error.message));
        } else {
          callback.resolve(message.result);
        }
        this.callbacks.delete(message.id);
      }
    }

    // Evento do Chrome
    if (message.method) {
      const listeners = this.eventListeners.get(message.method) || [];
      listeners.forEach(listener => listener(message.params));
    }
  }

  /**
   * Envia um comando para o Chrome
   * @param {string} method - Método CDP (ex: 'Page.navigate')
   * @param {object} params - Parâmetros do método
   * @returns {Promise} Resultado do comando
   */
  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.messageId;
      const message = { id, method, params };

      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify(message));
    });
  }

  /**
   * Registra um listener para eventos CDP
   * @param {string} event - Nome do evento (ex: 'Network.requestWillBeSent')
   * @param {function} callback - Função a ser chamada quando o evento ocorrer
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Remove um listener de evento
   */
  off(event, callback) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Fecha a conexão
   */
  close() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

/**
 * Obtém a lista de páginas/tabs abertas no Chrome
 * @param {string} host - Host do Chrome (padrão: localhost:9222)
 * @returns {Promise<Array>} Lista de páginas
 */
export async function getChromePages(host = 'localhost:9222') {
  const response = await fetch(`http://${host}/json/list`);
  return response.json();
}

/**
 * Cria um cliente CDP conectado à primeira página disponível
 * @param {string} host - Host do Chrome
 * @returns {Promise<CDPClient>} Cliente conectado
 */
export async function createCDPClient(host = 'localhost:9222') {
  const pages = await getChromePages(host);

  if (pages.length === 0) {
    throw new Error('Nenhuma página encontrada. Certifique-se de que o Chrome está rodando com --remote-debugging-port=9222');
  }

  const page = pages.find(p => p.type === 'page') || pages[0];
  console.log(`🔗 Conectando à página: ${page.title || page.url}`);

  const client = new CDPClient();
  await client.connect(page.webSocketDebuggerUrl);

  return client;
}

/**
 * Aguarda um tempo específico
 * @param {number} ms - Milissegundos
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
