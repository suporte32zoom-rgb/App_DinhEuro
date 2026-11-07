import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Remove explicitamente a tela de splash pré-renderizada para garantir que nunca fique travada
const splashEl = document.getElementById('dinheuro-splash');
if (splashEl) {
  splashEl.remove();
}

const rootEl = document.getElementById('root');
if (rootEl) {
  try {
    const root = createRoot(rootEl);
    root.render(<App />);
  } catch (err) {
    console.error('[DinhEuro] Falha crítica na renderização raiz:', err);
    rootEl.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0B1320;color:#F8FAFC;font-family:sans-serif;padding:20px;text-align:center;">
        <div>
          <h1 style="color:#10B981;font-size:24px;margin-bottom:8px;">DinhEuro</h1>
          <p style="color:#94A3B8;font-size:14px;margin-bottom:16px;">Ocorreu uma instabilidade na inicialização. Tentando reconectar...</p>
          <button onclick="window.location.reload()" style="background:#10B981;color:#0B1320;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;">Recarregar Portal</button>
        </div>
      </div>
    `;
  }
}
