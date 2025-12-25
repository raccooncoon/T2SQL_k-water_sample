import React from 'react';

/**
 * SQL 신택스 하이라이팅 컴포넌트
 */
const SqlHighlighter = ({ code, isOriginal = false }) => {
    if (!code) return null;
    const highlight = (text) => {
        const tokenRegex = /('(?:''|[^'])*'|--.*$|\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP BY|ORDER BY|LIMIT|AS|AND|OR|IN|NOT|NULL|DESC|ASC|OVER|PARTITION BY|UNION|ALL|WITH|CASE|WHEN|THEN|ELSE|END|DISTINCT|ROW_NUMBER|TOP|CAST|COALESCE)\b|\b(COUNT|SUM|AVG|MIN|MAX|ROUND|NOW|DATE_TRUNC|TO_CHAR|TO_DATE)\b|\b\d+(\.\d+)?\b|[(),.;=<>!*+-/]|[^\s(),.;=<>!*+-/']+)/gi;
        const keywords = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|ON|GROUP BY|ORDER BY|LIMIT|AS|AND|OR|IN|NOT|NULL|DESC|ASC|OVER|PARTITION BY|UNION|ALL|WITH|CASE|WHEN|THEN|ELSE|END|DISTINCT|ROW_NUMBER|TOP|CAST|COALESCE)\b/gi;
        const functions = /\b(COUNT|SUM|AVG|MIN|MAX|ROUND|NOW|DATE_TRUNC|TO_CHAR|TO_DATE)\b/gi;
        return text.split('\n').map((line, lineIdx) => (
            <div key={lineIdx} className="min-h-[1.4rem] flex items-start group/line text-left">
                <span className="w-10 text-slate-700 select-none text-[10px] pr-3 text-right border-r border-white/5 mr-4 font-mono shrink-0 pt-1">{lineIdx + 1}</span>
                <div className="flex flex-wrap items-center">
                    {line.split(/(\s+)/).map((part, i) => {
                        if (!part.trim()) return <span key={i} className="inline-block">&nbsp;</span>;
                        if (part.startsWith('--')) return <span key={i} className="text-slate-600 italic">{part}</span>;
                        const subTokens = part.match(tokenRegex) || [part];
                        return subTokens.map((st, si) => {
                            let colorClass = isOriginal ? 'text-slate-500' : 'text-slate-300';
                            if (st.match(keywords)) colorClass = 'text-blue-400 font-bold uppercase';
                            else if (st.match(functions)) colorClass = 'text-yellow-200 font-medium uppercase';
                            else if (st.startsWith("'")) colorClass = 'text-emerald-400';
                            else if (st.match(/[(),.;=<>!*+-/]/)) colorClass = 'text-slate-500 font-bold';
                            return <span key={`${i}-${si}`} className={`${colorClass} inline-block leading-tight`}>{st}</span>;
                        });
                    })}
                </div>
            </div>
        ));
    };
    return <div className="font-mono text-[11px] leading-relaxed py-2 overflow-x-auto custom-scrollbar">{highlight(code)}</div>;
};

export default SqlHighlighter;
