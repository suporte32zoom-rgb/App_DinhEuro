# Guia de Publicação Hostinger - DinhEuro (dinheuro.com / dinheuro.com.br)

Este guia resolve de forma definitiva o problema da "tela azul" na Hostinger após deploy via GitHub.

---

## 🔍 Por que ocorria a "Tela Azul"?

1. **Repositório Git Direto:** Na Hostinger, ao conectar um repositório via GitHub (Git Deployment), o servidor LiteSpeed/Apache busca por padrão o arquivo `index.html` na raiz da pasta `public_html`.
2. **Arquivos Fontes vs. Compilados:** O arquivo `index.html` da raiz de desenvolvimento aponta para `/src/main.tsx`. Navegadores web **não conseguem** executar arquivos TypeScript/JSX brutos sem um servidor de compilação ativo, disparando um erro de script imediato.
3. **Plano de Fundo:** Como o `<body>` possui a cor `#0B1320` (azul escuro elegante da identidade visual do DinhEuro), o travamento do script deixava apenas a tela azul visível sem renderizar os componentes.

---

## ✅ O que foi corrigido no projeto:

1. **Inclusão da pasta `/dist` rastreada:** Agora a pasta `/dist` contém todos os arquivos JavaScript e CSS empacotados, minificados e prontos para produção.
2. **Arquivos `.htaccess` configurados:**
   - Na pasta `/dist` (e `/public`): gerencia rotas SPA (ex: `/mercados`, `/carteiras`, `/termos-de-uso`) e define tipos MIME corretos para ES Modules e PWA.
   - Na raiz do projeto: caso o repositório seja clonado na raiz `public_html`, ele reescreve automaticamente as requisições para a pasta `/dist/`.
3. **Preloader Visual no `index.html`:** Adicionado logotipo, anel animado esmeralda e indicador de carregamento. O usuário nunca mais verá uma tela azul vazia.
4. **Fallback Inteligente:** O `index.html` da raiz detecta se o ambiente não possui Vite e redireciona de imediato para `/dist/`.
5. **Fallback Direto via Navegador:** Caso a hospedagem seja estática (sem backend Node ativo), o frontend busca cotações em tempo real diretamente das APIs públicas com CORS liberado (Coinbase e AwesomeAPI).
6. **Servidor Standalone `server.js`:** Para hospedagens VPS ou Node.js na Hostinger, o arquivo compilado `server.js` funciona diretamente via `node server.js` sem requerer dependências de desenvolvimento.

---

## 🚀 Como Configurar na Hostinger (Escolha uma das opções):

### Opção 1: Hospedagem Compartilhada / Cloud (Mais comum e recomendada)
1. Acesse o **hPanel da Hostinger** (`hpanel.hostinger.com`).
2. Vá em **Sites** > clique no seu site (`dinheuro.com.br`).
3. No menu lateral, acesse **Avançado** > **Git** (ou Gerenciador de Arquivos):
   - Conecte ou sincronize seu repositório GitHub (`git pull`).
4. Em **Configurações do Site** ou **Domínios**:
   - Altere o **Diretório Raiz (Document Root)** do domínio para:
     `public_html/dist`
   - Salve as alterações.
5. Pronto! O site abrirá instantaneamente em alta velocidade com SSL, PWA e todas as rotas funcionando.

> *Nota: Se você mantiver o diretório raiz como `public_html`, o arquivo `.htaccess` da raiz que criamos também fará o redirecionamento automático para a pasta `dist`.*

---

### Opção 2: Hospedagem com Node.js Ativo (hPanel > Node.js)
1. Acesse o **hPanel** > **Avançado** > **Node.js**.
2. Configure:
   - **Versão do Node:** 18.x, 20.x ou 22.x.
   - **Raiz do Aplicativo:** `public_html`
   - **Arquivo de Inicialização:** `server.js` (ou comando `npm start`)
   - **Modo do Aplicativo:** `production`
3. Clique em **Salvar** e **Iniciar / Reiniciar**.
4. Neste modo, os webhooks (`/api/webhook/finnhub`) e o proxy de cotações em tempo real estarão 100% ativos com Express.

---

## 🛠️ Comandos de Build Local:

Caso faça novas alterações no código no futuro e queira subir ao GitHub:
```bash
npm run build
git add .
git commit -m "Atualizacao de producao com dist"
git push origin main
```
Ao fazer o push, a Hostinger atualizará automaticamente via Webhook Git e o site continuará funcionando perfeitamente!
