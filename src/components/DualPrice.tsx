import React from 'react';
import { CurrencyRates, getDualCurrencyDisplay } from '../utils/finance';

interface DualPriceProps {
  price: number;
  currency: string;
  rates: CurrencyRates;
  layout?: 'stacked' | 'inline' | 'compact' | 'tri-currency';
  primaryClassName?: string;
  secondaryClassName?: string;
  tertiaryClassName?: string;
  className?: string;
  showSecondaryBadge?: boolean;
  showEur?: boolean;
}

export const DualPrice: React.FC<DualPriceProps> = ({
  price,
  currency,
  rates,
  layout = 'stacked',
  primaryClassName = 'font-bold font-mono-numbers text-white',
  secondaryClassName = 'text-[11px] font-mono-numbers text-emerald-400/90 font-medium',
  tertiaryClassName = 'text-[10px] font-mono-numbers text-slate-400 font-medium',
  className = '',
  showSecondaryBadge = false,
  showEur = false,
}) => {
  const dual = getDualCurrencyDisplay(price, currency, rates);

  if (layout === 'inline') {
    return (
      <span className={`inline-flex items-baseline gap-1.5 ${className}`}>
        <span className={primaryClassName}>{dual.primaryFormatted}</span>
        <span className={secondaryClassName}>
          (≈ {dual.secondaryFormatted}{showEur ? ` · ${dual.tertiaryFormatted}` : ''})
        </span>
      </span>
    );
  }

  if (layout === 'tri-currency') {
    return (
      <div className={`flex flex-col leading-tight ${className}`}>
        <span className={primaryClassName}>{dual.primaryFormatted}</span>
        <div className="flex items-center gap-1.5 mt-0.5 text-[10px] font-mono-numbers">
          <span className={secondaryClassName}>≈ {dual.secondaryFormatted}</span>
          <span className="text-slate-600">|</span>
          <span className={tertiaryClassName}>{dual.tertiaryFormatted}</span>
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={`flex flex-col items-end leading-tight ${className}`}>
        <span className={primaryClassName}>{dual.primaryFormatted}</span>
        <span className={secondaryClassName}>
          ≈ {dual.secondaryFormatted}
        </span>
        {showEur && (
          <span className={tertiaryClassName}>
            ≈ {dual.tertiaryFormatted}
          </span>
        )}
      </div>
    );
  }

  // Default 'stacked'
  return (
    <div className={`flex flex-col leading-tight ${className}`}>
      <span className={primaryClassName}>{dual.primaryFormatted}</span>
      <div className="flex items-center gap-1 mt-0.5">
        <span className={secondaryClassName}>
          ≈ {dual.secondaryFormatted}
        </span>
        {showSecondaryBadge && (
          <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60">
            {dual.secondaryCurrency}
          </span>
        )}
      </div>
      {showEur && (
        <span className={`mt-0.5 ${tertiaryClassName}`}>
          ≈ {dual.tertiaryFormatted}
        </span>
      )}
    </div>
  );
};
