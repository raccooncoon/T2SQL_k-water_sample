import React from 'react';

/**
 * ✨ 고성능 마크다운 & 테이블 렌더러
 * AI가 생성한 마크다운을 분석하여 실제 표와 제목으로 변환합니다.
 */
const MarkdownViewer = ({ content }) => {
    if (!content) return null;
    const lines = String(content).split('\n');
    const renderedElements = [];
    let tableRows = [];
    let isInsideTable = false;

    const parseText = (text) => {
        if (typeof text !== 'string') return String(text ?? '');
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) =>
            part.startsWith('**') && part.endsWith('**')
                ? <strong key={i} className="text-blue-200 font-bold">{String(part).replace(/\*\*/g, '')}</strong>
                : String(part)
        );
    };

    lines.forEach((line, idx) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('|') && trimmedLine.includes('|')) {
            if (!isInsideTable) { isInsideTable = true; tableRows = []; }
            if (!trimmedLine.includes('---')) {
                const cells = trimmedLine.split('|').filter((c, i, arr) => (i > 0 && i < arr.length - 1) || c.trim() !== '');
                if (cells.length > 0) tableRows.push(cells.map(c => c.trim()));
            }
            return;
        } else if (isInsideTable) {
            isInsideTable = false;
            const currentRows = [...tableRows];
            renderedElements.push(
                <div key={`table-${idx}`} className="my-5 overflow-hidden rounded-xl border border-white/10 bg-black/40 shadow-2xl text-left">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-blue-600/20 text-left">
                        <tr>{currentRows[0]?.map((cell, i) => (<th key={i} className="p-3 text-[10px] font-black text-blue-400 uppercase tracking-widest border-b border-white/5">{cell}</th>))}</tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-left">
                        {currentRows.slice(1).map((row, ri) => (<tr key={ri} className="hover:bg-white/5 transition-colors">{row.map((cell, ci) => (<td key={ci} className="p-3 text-[11px] text-slate-300 font-medium">{parseText(cell)}</td>))}</tr>))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
        }
        if (trimmedLine.startsWith('# ')) renderedElements.push(<h1 key={idx} className="text-2xl font-black text-white mt-10 mb-5 tracking-tighter border-l-4 border-blue-500 pl-4 italic uppercase text-left">{trimmedLine.replace('# ', '')}</h1>);
        else if (trimmedLine.startsWith('## ')) renderedElements.push(<h2 key={idx} className="text-sm font-black text-blue-400 mt-8 mb-3 tracking-widest uppercase flex items-center gap-2 text-left"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> {trimmedLine.replace('## ', '')}</h2>);
        else if (trimmedLine.startsWith('- ')) renderedElements.push(<div key={idx} className="ml-4 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2 mb-2 text-left"><span className="text-blue-500 mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {parseText(trimmedLine.replace('- ', ''))}</div>);
        else if (trimmedLine !== '') renderedElements.push(<p key={idx} className="text-[11px] text-slate-400 leading-relaxed mb-4 text-left">{parseText(trimmedLine)}</p>);
    });
    return <div className="space-y-1">{renderedElements}</div>;
};

export default MarkdownViewer;
