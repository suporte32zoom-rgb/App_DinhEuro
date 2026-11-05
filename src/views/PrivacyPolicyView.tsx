import React from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  Database,
  UserCheck,
  Mail,
  ArrowLeft,
  FileCheck2,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const PrivacyPolicyView: React.FC = () => {
  const { setActiveTab } = useMarket();

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Início</span>
        </button>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md">
          Em conformidade com a LGPD (Lei 13.709/2018) & GDPR
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#071a1c] via-[#091522] to-[#060c16] border border-emerald-500/30 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transparência absoluta sobre o tratamento de informações, retenção local, segurança criptográfica e exercício dos direitos do titular no portal e PWA DinhEuro.
            </p>
          </div>
        </div>
      </div>

      {/* DPO Highlight Card */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <UserCheck className="w-4 h-4" />
            <span>Encarregado de Proteção de Dados (DPO)</span>
          </span>
          <p className="text-xs sm:text-sm text-slate-300">
            Canal direto para solicitações de privacidade, revogação de consentimento e esclarecimentos sobre a LGPD:
          </p>
        </div>
        <a
          href="mailto:admin@dinheuro.com.br"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-lg shrink-0 cursor-pointer"
        >
          <Mail className="w-4 h-4" />
          <span>admin@dinheuro.com.br</span>
        </a>
      </div>

      {/* Detailed Legal Sections */}
      <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        {/* 1. Compromisso e Princípios */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>1. Nosso Compromisso com a sua Privacidade</span>
          </h2>
          <p>
            O <strong>DinhEuro</strong> preza pelo respeito irrestrito à intimidade, honra e autodeterminação informativa dos seus usuários, operando em rigorosa conformidade com a Lei Geral de Proteção de Dados Pessoais do Brasil (<strong>Lei nº 13.709/2018 - LGPD</strong>), com o Marco Civil da Internet (Lei nº 12.965/2014) e, subsidiariamente para usuários internacionais, com o Regulamento Geral sobre a Proteção de Dados da União Europeia (<strong>GDPR - Regulamento UE 2016/679</strong>).
          </p>
          <p>
            Adotamos o princípio de <em>Privacy by Design</em> e <em>Privacy by Default</em>: o DinhEuro foi concebido para funcionar com o mínimo de dados possível, priorizando o processamento em tempo de execução no próprio navegador do usuário (Client-Side).
          </p>
        </div>

        {/* 2. Dados Coletados e Finalidades */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>2. Dados Coletados e Finalidades do Tratamento</span>
          </h2>
          <p>
            Diferenciamos os dados operados em dois níveis de armazenamento:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-emerald-400 block">
                A. Dados Locais no Dispositivo (Armazenamento Exclusivo do Usuário)
              </span>
              <p className="text-slate-400 text-xs">
                Suas simulações de câmbio, ativos da carteira de investimentos (`dinheuro_user_portfolio_v1`), preferências e escolhas de tema visual (`dinheuro_theme`) são gravados <strong>unicamente no localStorage do seu próprio navegador</strong>. Esses dados nunca são enviados ou armazenados em servidores centrais do DinhEuro.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-400 block">
                B. Dados de Telemetria Técnica e Desempenho
              </span>
              <p className="text-slate-400 text-xs">
                Registros de conexão estritamente necessários para entrega de conteúdo HTTP/HTTPS e segurança (endereço IP anonimizado, User-Agent, data/hora e páginas visitadas) coletados por infraestrutura de CDN e servidores em nuvem de alta segurança para prevenção de fraudes e mitigação de ataques cibernéticos (Art. 7º, IX da LGPD - Legítimo Interesse).
              </p>
            </div>
          </div>
        </div>

        {/* 3. Bases Legais LGPD */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>3. Hipóteses Legais para o Tratamento (Bases Legais)</span>
          </h2>
          <p>
            Todo tratamento de dados realizado pelo DinhEuro possui fundamento jurídico expressamente previsto no Artigo 7º da LGPD:
          </p>
          <ul className="space-y-2 pl-2">
            <li>
              <strong className="text-white">Consentimento (Art. 7º, I):</strong> obtido mediante aceite inequívoco no Banner LGPD para utilização de cookies funcionais e de análise.
            </li>
            <li>
              <strong className="text-white">Cumprimento de Obrigação Legal (Art. 7º, II):</strong> guarda de registros de acesso a aplicações de internet pelo prazo mínimo de 6 meses, nos termos do Art. 15 do Marco Civil da Internet.
            </li>
            <li>
              <strong className="text-white">Legítimo Interesse (Art. 7º, IX):</strong> monitoramento de estabilidade, desempenho do PWA, caching de cotações em tempo real e proteção contra acessos automatizados hostis.
            </li>
          </ul>
        </div>

        {/* 4. Compartilhamento com Terceiros */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>4. Compartilhamento de Dados com Terceiros</span>
          </h2>
          <p>
            O DinhEuro <strong>NÃO comercializa, não aluga e não repassa</strong> dados pessoais ou históricos de navegação para anunciantes, corretores de leads ou birôs de crédito. O compartilhamento ocorre estritamente com provedores de infraestrutura essencial:
          </p>
          <ul className="space-y-1.5 list-disc pl-5 text-slate-400">
            <li><strong>Provedores de Infraestrutura de Nuvem e CDN:</strong> servidores web seguros, nós de borda (edge) e balanceamento de carga com certificação SSL/TLS de ponta a ponta.</li>
            <li><strong>Provedores de Feeds de Mercado Financeiro:</strong> consultas de cotações e taxas interbancárias realizadas via canais anônimos sem qualquer vinculação à identidade civil do usuário.</li>
          </ul>
        </div>

        {/* 5. Direitos do Titular (Art. 18 LGPD) */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-400" />
            <span>5. Direitos do Titular de Dados Pessoais</span>
          </h2>
          <p>
            Em observância ao Artigo 18 da LGPD, o usuário titular pode, a qualquer tempo e sem qualquer custo, solicitar:
          </p>
          <ul className="space-y-1.5 list-disc pl-5 text-slate-400">
            <li>Confirmação da existência de tratamento e acesso aos dados.</li>
            <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
            <li>Anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade.</li>
            <li>Revogação do consentimento concedido anteriormente para cookies e preferências.</li>
            <li>Informação sobre as entidades públicas e privadas com as quais o controlador compartilhou dados.</li>
          </ul>
          <p className="pt-2">
            Para exercer qualquer um desses direitos, basta enviar uma mensagem formal ao Encarregado (DPO) através do endereço <a href="mailto:admin@dinheuro.com.br" className="text-emerald-400 hover:underline font-mono">admin@dinheuro.com.br</a>. Respondemos a todas as solicitações no prazo legal aplicável.
          </p>
        </div>

        {/* 6. Segurança da Informação */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-emerald-400" />
            <span>6. Medidas de Segurança Cibernética</span>
          </h2>
          <p>
            Implementamos protocolos modernos de segurança da informação, incluindo criptografia ponta a ponta via TLS 1.3 / HTTPS, cabeçalhos HTTP de segurança (HSTS, Content Security Policy, X-Frame-Options), isolamento de variáveis de ambiente no servidor e armazenamento modular sem sessões vulneráveis no cliente.
          </p>
        </div>
      </div>
    </div>
  );
};
