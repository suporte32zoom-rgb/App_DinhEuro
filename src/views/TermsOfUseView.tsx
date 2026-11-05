import React from 'react';
import {
  FileText,
  ShieldCheck,
  AlertTriangle,
  Scale,
  ExternalLink,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Building2,
} from 'lucide-react';
import { useMarket } from '../context/MarketContext';

export const TermsOfUseView: React.FC = () => {
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
          Vigência: Março/2026 • Versão 2.4
        </span>
      </div>

      {/* Main Title Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c182c] via-[#091322] to-[#060c16] border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Termos de Uso e Serviço
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Condições gerais de navegação, licença de uso da plataforma DinhEuro, propriedade intelectual e diretrizes regulatórias no mercado financeiro brasileiro e internacional.
            </p>
          </div>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-6 text-slate-300 text-xs sm:text-sm leading-relaxed">
        {/* 1. Natureza da Plataforma */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>1. Natureza Jurídica e Definição da Plataforma</span>
          </h2>
          <p>
            O <strong>DinhEuro</strong> (acessível pelo domínio <span className="text-emerald-400 font-mono">dinheuro.com</span> e <span className="text-emerald-400 font-mono">dinheuro.com.br</span>) é um portal digital, agregador de dados econômicos públicos, provedor de ferramentas analíticas e simuladores financeiros de uso estritamente informativo e educacional.
          </p>
          <p>
            O DinhEuro atua exclusivamente como plataforma de tecnologia e inteligência de dados, operando sob o modelo de correspondente digital, canal de mídia econômica e parceiro de divulgação tecnológica. O DinhEuro <strong>NÃO</strong> é uma instituição financeira, não realiza intermediação de câmbio direta, não efetua custódia de recursos ou valores mobiliários, e não atua como corretora de valores credenciada pela CVM (Comissão de Valores Mobiliários) ou Banco Central do Brasil.
          </p>
        </div>

        {/* 2. Isenção de Responsabilidade (Disclaimer Financeiro) */}
        <div className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>2. Isenção de Responsabilidade Financeira (Disclaimer de Investimentos)</span>
          </h2>
          <p className="text-slate-200">
            <strong>NENHUMA INFORMAÇÃO, GRÁFICO, COTAÇÃO OU CONTEÚDO DISPONIBILIZADO NESTE SITE CONSTITUI RECOMENDAÇÃO, CONSULTORIA, ANÁLISE OU OFERTA DE COMPRA OU VENDA DE ATIVOS FINANCEIROS.</strong>
          </p>
          <p>
            As cotações de moedas (Euro, Dólar, Real, Libra), ações da B3 e de bolsas internacionais (Wall Street, Frankfurt, Londres), criptoativos, taxas de juros e commodities são transmitidas via integrações com feeds institucionais de mercado, câmbio interbancário e livros públicos de negociação. O DinhEuro não se responsabiliza por eventuais latências de rede, atrasos na atualização de cotações, variações de spread de terceiros ou decisões de investimento tomadas pelo usuário com base nas informações visualizadas.
          </p>
          <p>
            Investimentos em ativos de renda variável, Forex, contratos por diferença (CFDs) e criptomoedas envolvem elevado risco de volatilidade e perda de capital. O investidor deve sempre consultar profissionais certificados (CNPI, CFP, CGA) antes de qualquer aporte.
          </p>
        </div>

        {/* 3. Regras de Navegação e Uso Aceitável */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>3. Regras de Conduta e Uso Aceitável</span>
          </h2>
          <p>
            Ao utilizar o DinhEuro, você concorda em:
          </p>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Utilizar os recursos para finalidades lícitas, pessoais ou de pesquisa de mercado.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Não empregar robôs maliciosos, técnicas de web scraping abusivo, engenharia reversa ou ataques de negação de serviço (DDoS) contra a infraestrutura do portal.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Reconhecer que simulações tributárias ou de câmbio são aproximações algorítmicas e podem sofrer variações conforme IOF, spreads comerciais e regulamentação vigente da Receita Federal do Brasil.</span>
            </li>
          </ul>
        </div>

        {/* 4. Propriedade Intelectual */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <span>4. Propriedade Intelectual da Marca DinhEuro</span>
          </h2>
          <p>
            A marca nominativa e figurativa <strong>DinhEuro</strong>, o logotipo oficial com o anel de câmbio Euro/Real, layouts, paleta de cores, código-fonte, arquitetura PWA, motores de gráficos customizados e algoritmos proprietários de paridade são de titularidade exclusiva de seus desenvolvedores e fundadores, protegidos pela Lei de Propriedade Industrial (Lei nº 9.279/1996) e Lei de Software (Lei nº 9.609/1998).
          </p>
          <p>
            É expressamente vedada a reprodução total ou parcial, cópia ou distribuição sem autorização prévia por escrito.
          </p>
        </div>

        {/* 5. Links para Terceiros e Afiliados */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-emerald-400" />
            <span>5. Links Externos, Corretoras e Parceiros Comerciais</span>
          </h2>
          <p>
            O portal pode exibir links para serviços financeiros, casas de câmbio, corretoras internacionais reguladas (ex: Interactive Brokers, Nomad, Avenue, Wise) e fontes jornalísticas de notícias (ex: Reuters, Bloomberg, Valor Econômico). O DinhEuro não responde pelos termos, políticas de privacidade, solidez ou operações contratadas diretamente em plataformas de terceiros.
          </p>
        </div>

        {/* 6. Modificações e Foro */}
        <div className="rounded-2xl bg-[#0b1322] border border-slate-800 p-6 shadow-xl space-y-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>6. Alterações nos Termos e Foro Competente</span>
          </h2>
          <p>
            Estes Termos podem ser atualizados periodicamente para refletir mudanças regulatórias ou lançamentos de novos módulos. A data de última revisão será sempre informada no topo desta página.
          </p>
          <p>
            Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Para a resolução de quaisquer controvérsias decorrentes deste instrumento, fica eleito o Foro da Comarca de São Paulo/SP, com renúncia expressa a qualquer outro.
          </p>
          <p className="text-slate-400 text-xs pt-2 border-t border-slate-800/80">
            Dúvidas ou solicitações jurídicas: envie e-mail diretamente para <a href="mailto:admin@dinheuro.com.br" className="text-emerald-400 hover:underline font-mono">admin@dinheuro.com.br</a>.
          </p>
        </div>
      </div>
    </div>
  );
};
