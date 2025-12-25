import React from 'react';
import { ListOrdered, SearchCode, Sparkles, Terminal, RefreshCw, Code, Stethoscope, Play, Loader2, Wand2, Info, Check, X, LayoutDashboard, FileSpreadsheet, ChevronRight } from 'lucide-react';
import SqlHighlighter from './SqlHighlighter';
import { tables, scenarioList } from '../constants/data';

const QueryTab = ({
    prompt,
    setPrompt,
    selectedTables,
    handleGenerateSql,
    isGenerating,
    generatedSql,
    isComparing,
    handleAuditSql,
    isAuditing,
    handleExecuteQuery,
    isExecuting,
    sqlAudit,
    refineInstruction,
    setRefineInstruction,
    handleRefineSql,
    isRefining,
    refineExplanation,
    handleApplyRefinedSql,
    handleDiscardRefinedSql,
    previousSql,
    tempRefinedSql,
    queryResult,
    handleDownloadExcel,
    setActiveTab
}) => {
    const [visibleRows, setVisibleRows] = React.useState(10);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const tableLoaderRef = React.useRef(null);

    React.useEffect(() => {
        if (!queryResult) {
            setVisibleRows(10);
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && queryResult && visibleRows < queryResult.length && !isLoadingMore) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (tableLoaderRef.current) {
            observer.observe(tableLoaderRef.current);
        }

        return () => {
            if (tableLoaderRef.current) {
                observer.unobserve(tableLoaderRef.current);
            }
        };
    }, [visibleRows, isLoadingMore, queryResult]);

    const loadMore = () => {
        setIsLoadingMore(true);
        setTimeout(() => {
            setVisibleRows(prev => Math.min(prev + 10, queryResult.length));
            setIsLoadingMore(false);
        }, 500);
    };

    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6 text-left">
            <div className="max-w-[1200px] mx-auto space-y-6 pb-24 text-left">
                <div className="bg-white/[0.01] p-2 rounded-xl border border-white/5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2 pl-2 text-left">
                        <ListOrdered size={12} className="text-emerald-500/60" />
                        <h3 className="text-emerald-500/60 font-black text-[8px] uppercase tracking-[0.2em]">시나리오 탐색</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-left">
                        {scenarioList.map((rec, idx) => (
                            <button key={idx} onClick={() => setPrompt(rec.prompt)} className="text-left p-2.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-emerald-500/10 transition-all text-[10px] font-bold text-slate-500 hover:text-white flex items-center gap-2 group active:scale-95 whitespace-normal leading-tight h-auto">
                                <SearchCode size={10} className="opacity-30 group-hover:opacity-100 shrink-0" /> {rec.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white/[0.02] backdrop-blur-2xl p-6 rounded-2xl border border-white/5 shadow-xl text-left">
                    <div className="flex items-center gap-3 mb-4 text-blue-400 opacity-60 text-left">
                        <Sparkles size={16} />
                        <h3 className="text-[8px] font-black uppercase tracking-[0.4em]">쿼리 생성기</h3>
                    </div>
                    <textarea 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        placeholder="데이터 분석 의도를 입력하십시오..." 
                        className="w-full h-16 bg-transparent border-none focus:ring-0 text-lg font-black text-white placeholder:text-slate-800 resize-none outline-none leading-tight tracking-tighter" 
                    />
                    <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-2 text-left">
                        <div className="flex flex-wrap gap-1 flex-1 text-left">
                            {selectedTables.map(id => {
                                const table = tables.find(t => t.id === id);
                                return (
                                    <span key={id} className="px-2 py-0.5 bg-blue-500/5 text-blue-400 text-[8px] font-black rounded-lg border border-blue-500/10 uppercase tracking-widest whitespace-nowrap h-fit">
                                        {table ? table.name : id}
                                    </span>
                                );
                            })}
                        </div>
                        <button 
                            onClick={handleGenerateSql} 
                            disabled={isGenerating || !prompt} 
                            className="bg-white text-black px-6 py-2 rounded-xl font-black flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all text-[9px] uppercase shadow-md active:scale-95 shadow-blue-500/10 shrink-0"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={14} /> : <Terminal size={14} />} SQL 생성
                        </button>
                    </div>
                </div>

                {generatedSql && (
                    <div className="space-y-4 animate-in slide-in-from-top-4 text-left">
                        {!isComparing ? (
                            <div className="bg-[#020617] rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-left relative">
                                <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex justify-between items-center text-slate-600 text-[8px] font-mono font-black tracking-[0.6em] uppercase relative">
                                    {isExecuting && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900/10 overflow-hidden z-30"><div className="h-full bg-blue-500 animate-progress origin-left" /></div>}
                                    <span className="flex items-center gap-2"><Code size={12} /> 활성 로직 노드</span>
                                    <div className="flex gap-2">
                                        <button onClick={handleAuditSql} disabled={isAuditing} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-500/20 transition-all text-[8px] font-black uppercase flex items-center gap-2 shadow-lg active:scale-95">{isAuditing ? <RefreshCw className="animate-spin" size={10} /> : <Stethoscope size={10} />} ✨ 쿼리 진단</button>
                                        <button onClick={handleExecuteQuery} disabled={isExecuting} className="bg-blue-600 text-white px-5 py-2 rounded-full text-[9px] font-black hover:bg-blue-500 flex items-center gap-2 transition-all shadow-blue-500/20 shadow-lg active:scale-95">{isExecuting ? <Loader2 className="animate-spin" size={10} /> : <Play size={10} fill="currentColor" />} 실행</button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-x-auto min-h-[160px] text-left"><SqlHighlighter code={generatedSql} /></div>
                                {sqlAudit && (
                                    <div className="p-5 bg-indigo-500/5 border-t border-white/5 animate-in slide-in-from-top-2 text-left">
                                        <div className="flex gap-4 text-left">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg font-black text-xs">{sqlAudit.score}</div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">신경망 쿼리 진단 보고서</h4>
                                                <p className="text-slate-300 text-[11px] font-bold mb-2 italic whitespace-normal leading-relaxed text-left">"{sqlAudit.analysis}"</p>
                                                <div className="flex flex-wrap gap-2 text-left">
                                                    {sqlAudit.suggestions.map((s, i) => (<span key={i} className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20 text-[9px]">{s}</span>))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-white/5 border-t border-white/5 relative">
                                    {isRefining && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-900/10 overflow-hidden"><div className="h-full bg-blue-500 animate-progress origin-left" /></div>}
                                    <div className="flex items-center gap-4 bg-black/60 p-2 rounded-xl border border-white/10 shadow-inner">
                                        <Wand2 size={16} className="text-emerald-400 shrink-0 ml-2" />
                                        <input value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefineSql()} placeholder="정교화 피드백을 입력하십시오..." className="flex-1 bg-transparent border-none text-white focus:ring-0 text-sm font-bold placeholder:text-slate-800 text-left" />
                                        <button onClick={handleRefineSql} disabled={isRefining || !refineInstruction} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-xl font-black uppercase text-[8px] transition-all active:scale-95 flex items-center gap-2">
                                            {isRefining && <Loader2 size={10} className="animate-spin" />} 튜닝
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-[#0F172A]/98 backdrop-blur-3xl rounded-2xl border border-blue-500/20 overflow-hidden shadow-2xl text-left">
                                <div className="px-6 py-3 bg-blue-600/5 border-b border-blue-500/10 flex items-center justify-between gap-4 text-left">
                                    <div className="flex items-center gap-3 flex-1 text-left">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md"><Info size={16} /></div>
                                        <p className="text-blue-100 text-[11px] font-bold leading-relaxed italic whitespace-normal text-left">{refineExplanation}</p>
                                    </div>
                                    <div className="flex gap-2 shrink-0">
                                        <button onClick={handleApplyRefinedSql} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-black hover:bg-blue-500 text-[9px] uppercase shadow-lg active:scale-95 transition-all"><Check size={12} /> 적용</button>
                                        <button onClick={handleDiscardRefinedSql} className="bg-white/5 text-slate-500 px-4 py-1.5 rounded-lg font-black hover:bg-red-500/20 hover:text-red-400 text-[9px] uppercase active:scale-95 transition-all"><X size={12} /> 취소</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-white/5 text-left">
                                    <div className="p-2 bg-black/20 text-left">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-800 mb-1 block ml-2">이전 아키텍처</span>
                                        <div className="p-3 bg-black/40 rounded-xl border border-white/5 overflow-x-auto min-h-[120px] text-left">
                                            <SqlHighlighter code={previousSql} isOriginal={true} />
                                        </div>
                                    </div>
                                    <div className="p-2 bg-blue-600/5 relative text-left">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-blue-500 mb-1 block ml-2 text-left">신경망 정교화</span>
                                        <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/20 shadow-inner overflow-x-auto min-h-[120px] text-left">
                                            <SqlHighlighter code={tempRefinedSql} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {queryResult && (
                            <div className="bg-white/[0.01] backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-in fade-in text-left">
                                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-4 font-black text-slate-600 text-[8px] uppercase tracking-[0.6em] text-left"><LayoutDashboard size={14} /> 분석 결과 노드</div>
                                    <div className="flex gap-2">
                                        <button onClick={handleDownloadExcel} className="bg-white/5 hover:bg-emerald-500/10 text-slate-400 px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all active:scale-95"><FileSpreadsheet size={14} className="text-emerald-500" /><span className="text-[8px] font-black uppercase tracking-widest">엑셀 내보내기</span></button>
                                        <button onClick={() => setActiveTab('visualize')} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black text-[8px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 shadow-blue-900/20 text-left">시각화 분석 <ChevronRight size={12} /></button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto text-[10px] text-left border-t border-white/5">
                                    <table className="w-full border-collapse text-left table-fixed min-w-[800px]">
                                        <thead className="bg-black/40">
                                            <tr>{queryResult[0] && Object.keys(queryResult[0]).map(key => (<th key={key} className="px-6 py-4 font-black text-slate-700 uppercase tracking-widest text-left border-r border-white/5 last:border-r-0">{key}</th>))}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {queryResult.slice(0, visibleRows).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-all duration-300 group">
                                                    {Object.values(row).map((val, i) => (
                                                        <td key={i} className="px-6 py-4 font-bold text-slate-400 border-r border-white/5 group-hover:border-white/10 last:border-r-0 transition-colors">
                                                            {val !== null && typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* 인피니티 스크롤 로더 */}
                                <div ref={tableLoaderRef} className="flex justify-center py-6 border-t border-white/5 bg-black/20">
                                    {visibleRows < queryResult.length && (
                                        <div className="flex items-center gap-2 text-slate-600 font-black text-[9px] uppercase tracking-[0.2em]">
                                            <Loader2 className="animate-spin" size={12} />
                                            <span>데이터 로드 중...</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QueryTab;
