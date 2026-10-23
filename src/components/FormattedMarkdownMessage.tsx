import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Info, AlertTriangle, Lightbulb, CheckCircle2 } from 'lucide-react';

interface FormattedMarkdownMessageProps {
  content: string;
  variant?: 'light' | 'dark';
}

/**
 * Normaliza o markdown bruto para garantir que tabelas e quebras de linha
 * sejam perfeitamente interpretadas pelo remark-gfm sem colapsar em texto corrido.
 */
function normalizeMarkdown(raw: string): string {
  if (!raw) return '';

  let text = raw;

  // Garante linha vazia antes de tabelas que começam diretamente após texto
  text = text.replace(/([^\n])\n(\|[\s\S]*?\|)/g, '$1\n\n$2');

  // Garante linha vazia após o término de tabelas se houver texto colado
  text = text.replace(/(\|\n)([^\n|#\-\*\d])/g, '$1\n\n$2');

  // Garante que títulos com # tenham linha vazia antes
  text = text.replace(/([^\n])\n(#{1,4}\s)/g, '$1\n\n$2');

  return text;
}

export const FormattedMarkdownMessage: React.FC<FormattedMarkdownMessageProps> = ({
  content,
  variant = 'light',
}) => {
  const normalizedContent = useMemo(() => normalizeMarkdown(content), [content]);
  const isDark = variant === 'dark';

  return (
    <div
      className={`formatted-markdown-message text-xs leading-relaxed ${
        isDark ? 'text-slate-200' : 'text-slate-800'
      }`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // =========================================================
          // TABELAS FINANCEIRAS DE ALTA FIDELIDADE (ESTILO NOTION / STRIPE)
          // =========================================================
          table: ({ children }) => (
            <div
              className={`my-3.5 overflow-x-auto rounded-xl border shadow-2xs transition-all ${
                isDark
                  ? 'border-white/10 bg-[#161922]'
                  : 'border-slate-200/90 bg-white'
              }`}
            >
              <table className="w-full text-left text-xs border-collapse min-w-[340px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              className={`text-[10px] font-black uppercase tracking-wider border-b select-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-300'
                  : 'bg-slate-50 border-slate-200/80 text-slate-600'
              }`}
            >
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3.5 py-2.5 font-black whitespace-nowrap">
              {children}
            </th>
          ),
          tbody: ({ children }) => (
            <tbody
              className={`divide-y text-xs ${
                isDark
                  ? 'divide-white/5 text-slate-200'
                  : 'divide-slate-100 text-slate-800'
              }`}
            >
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr
              className={`transition-colors ${
                isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50/70'
              }`}
            >
              {children}
            </tr>
          ),
          td: ({ children }) => (
            <td className="px-3.5 py-2 text-[11px] leading-snug align-middle">
              {children}
            </td>
          ),

          // =========================================================
          // PARÁGRAFOS E CAIXAS INTELIGENTES DE DESTAQUE (CALLOUTS)
          // =========================================================
          p: ({ children }) => {
            // Analisa se o primeiro nó de texto indica uma nota ou alerta operacional
            const rawFirstChild = Array.isArray(children) ? children[0] : children;
            let firstStr = '';
            if (typeof rawFirstChild === 'string') {
              firstStr = rawFirstChild;
            } else if (
              rawFirstChild &&
              typeof rawFirstChild === 'object' &&
              'props' in rawFirstChild &&
              typeof (rawFirstChild as any).props?.children === 'string'
            ) {
              firstStr = (rawFirstChild as any).props.children;
            }

            const lower = firstStr.trim().toLowerCase();
            const isNote = lower.startsWith('nota') || lower.startsWith('observação') || lower.startsWith('obs:');
            const isWarning = lower.startsWith('atenção') || lower.startsWith('cuidado') || lower.startsWith('alerta');
            const isTip = lower.startsWith('dica') || lower.startsWith('estratégia') || lower.startsWith('diretriz');

            if (isNote || isWarning || isTip) {
              return (
                <div
                  className={`my-3 p-3 rounded-xl border text-xs leading-relaxed shadow-2xs flex items-start gap-2.5 ${
                    isWarning
                      ? isDark
                        ? 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        : 'bg-amber-50/80 border-amber-200 text-amber-900'
                      : isTip
                      ? isDark
                        ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
                        : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                      : isDark
                      ? 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
                      : 'bg-cyan-50/80 border-cyan-200/90 text-cyan-950'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {isWarning ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : isTip ? (
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Info className="w-4 h-4 text-[#007A87]" />
                    )}
                  </div>
                  <div className="flex-1 font-medium">{children}</div>
                </div>
              );
            }

            return (
              <p
                className={`mb-3 last:mb-0 leading-relaxed font-normal text-xs ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {children}
              </p>
            );
          },

          // =========================================================
          // HIERARQUIA TIPOGRÁFICA (TÍTULOS E SUBTÍTULOS)
          // =========================================================
          h1: ({ children }) => (
            <h1
              className={`text-sm font-black mt-4 mb-2 pb-1.5 border-b flex items-center gap-2 tracking-tight ${
                isDark
                  ? 'text-white border-white/10'
                  : 'text-slate-900 border-slate-200/80'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#007A87]" />
              <span>{children}</span>
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-xs font-black mt-3.5 mb-1.5 flex items-center gap-1.5 tracking-tight ${
                isDark ? 'text-[#25F4EE]' : 'text-[#007A87]'
              }`}
            >
              <span>{children}</span>
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-xs font-black mt-3 mb-1.5 tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {children}
            </h3>
          ),

          // =========================================================
          // LISTAS COM ESPAÇAMENTO E PONTOS DE DESTAQUE
          // =========================================================
          ul: ({ children }) => (
            <ul className="my-2.5 space-y-1.5 pl-1 list-none">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-2.5 space-y-1.5 pl-1 list-none">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-xs leading-relaxed flex items-start gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 ${
                  isDark ? 'bg-[#25F4EE]' : 'bg-[#007A87]'
                }`}
              />
              <div
                className={`flex-1 ${
                  isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                {children}
              </div>
            </li>
          ),

          // =========================================================
          // DESTAQUES (STRONG / NEGRIFOS) E CITAÇÕES (BLOCKQUOTES)
          // =========================================================
          strong: ({ children }) => (
            <strong
              className={`font-black tracking-tight ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}
            >
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`my-3 p-3 rounded-xl border-l-4 text-xs leading-relaxed shadow-2xs italic ${
                isDark
                  ? 'bg-white/5 border-[#25F4EE] text-slate-300'
                  : 'bg-slate-50 border-[#007A87] text-slate-700'
              }`}
            >
              {children}
            </blockquote>
          ),

          // =========================================================
          // CÓDIGO INLINE E BLOCOS DE CÓDIGO
          // =========================================================
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] border font-bold ${
                  isDark
                    ? 'bg-white/10 text-[#25F4EE] border-white/15'
                    : 'bg-slate-100 text-[#007A87] border-slate-200'
                }`}
              >
                {children}
              </code>
            ) : (
              <div className="my-3 overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] p-3 text-slate-100 text-[11px] font-mono shadow-sm">
                <code className="block overflow-x-auto">{children}</code>
              </div>
            );
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  );
};
