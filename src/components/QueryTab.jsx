import React from 'react';
import { ListOrdered, SearchCode, Sparkles, Terminal, RefreshCw, Code, Stethoscope, Play, Loader2, Wand2, Info, Check, X, LayoutDashboard, FileSpreadsheet, ChevronRight, Settings2, Filter, Eye, EyeOff, Trophy, Clock, TrendingUp, ChevronUp, ChevronDown, Database, GitMerge, BrainCircuit, AlertTriangle, RotateCcw, CheckCircle2 } from 'lucide-react';
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
    executionError,
    isSelfHealing,
    handleSelfHealSql,
    pendingFixedSql,
    fixedSqlExplanation,
    handleApplyFixedSql,
    handleDownloadExcel,
    setActiveTab,
    scenarios,
    setScenarios,
    history,
    selectedHistoryId,
    setSelectedHistoryId,
    generationSteps,
    currentStepIndex,
    analysisHistory,
    successfulRetryCount,
    originalSqlBeforeFix
}) => {
    const [visibleRows, setVisibleRows] = React.useState(10);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const [hiddenColumns, setHiddenColumns] = React.useState([]);
    const [columnOrder, setColumnOrder] = React.useState([]);
    const [isColumnPanelOpen, setIsColumnPanelOpen] = React.useState(false);
    const [showTrending, setShowTrending] = React.useState(false);
    const [showFixDiff, setShowFixDiff] = React.useState(false);
    const tableLoaderRef = React.useRef(null);
    const trendingRef = React.useRef(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (trendingRef.current && !trendingRef.current.contains(event.target)) {
                setShowTrending(false);
            }
        };

        if (showTrending) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showTrending]);

    const allColumns = React.useMemo(() => {
        if (queryResult && queryResult.length > 0) {
            return Object.keys(queryResult[0]);
        }
        return [];
    }, [queryResult]);

    React.useEffect(() => {
        if (allColumns.length > 0) {
            setColumnOrder(allColumns);
        } else {
            setColumnOrder([]);
        }
    }, [allColumns]);

    const visibleColumns = React.useMemo(() => {
        const order = columnOrder.length > 0 ? columnOrder : allColumns;
        return order.filter(col => !hiddenColumns.includes(col));
    }, [allColumns, hiddenColumns, columnOrder]);

    const moveColumn = (index, direction) => {
        const newOrder = [...columnOrder];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newOrder.length) return;
        
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setColumnOrder(newOrder);
    };

    const toggleColumn = (column) => {
        setHiddenColumns(prev => 
            prev.includes(column) 
                ? prev.filter(c => c !== column) 
                : [...prev, column]
        );
    };

    React.useEffect(() => {
        setHiddenColumns([]);
    }, [queryResult]);

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

    const sortedScenarios = React.useMemo(() => {
        return [...scenarios].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 10);
    }, [scenarios]);

    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-6 text-left">
            <div className="max-w-[1400px] mx-auto space-y-6 pb-24 text-left">
                {/* 최근 분석 히스토리 영역 */}
                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between mb-2 pl-2 text-left">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20">
                                <Sparkles size={18} />
                            </div>
                            <div>
                                <h3 className="text-blue-500/60 font-black text-[10px] uppercase tracking-[0.3em] mb-0.5">Recent Questions</h3>
                                <h2 className="text-white font-black text-xl uppercase tracking-tighter">최근 질문 내용</h2>
                            </div>
                        </div>
                        <div className="relative" ref={trendingRef}>
                            <button 
                                onClick={() => setShowTrending(!showTrending)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all active:scale-95 ${showTrending ? 'bg-amber-500 text-black border-amber-600 font-black' : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10'}`}
                            >
                                <Trophy size={16} />
                                <span className="text-[11px] uppercase tracking-widest">인기 분석 순위</span>
                            </button>

                            {showTrending && (
                                <div className="absolute right-0 mt-3 w-[600px] bg-[#0F172A] border border-amber-500/30 rounded-2xl shadow-2xl z-[100] p-6 animate-in fade-in zoom-in duration-200">
                                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/5">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                                                <Trophy size={18} />
                                            </div>
                                            <span className="text-[12px] font-black text-white uppercase tracking-widest">
                                                가장 많이 질문하는 분석 순위
                                            </span>
                                        </div>
                                        <button onClick={() => setShowTrending(false)} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded-lg">
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                        {sortedScenarios.map((rec, idx) => (
                                            <button 
                                                key={idx} 
                                                onClick={() => {
                                                    setPrompt(rec.prompt);
                                                }} 
                                                className={`relative group w-full text-left p-4 rounded-xl border transition-all active:scale-95 flex flex-col gap-3 min-h-[100px] ${prompt === rec.prompt ? 'bg-amber-500/20 border-amber-500 shadow-lg' : 'border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10'}`}
                                            >
                                                <div className="flex justify-between items-start w-full">
                                                    <span className={`w-6 h-6 rounded-md flex items-center justify-center font-black text-xs ${idx < 3 ? 'bg-amber-500 text-black shadow-lg shadow-amber-900/20' : 'bg-white/10 text-slate-400'}`}>
                                                        {idx + 1}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 group-hover:text-amber-400 transition-colors">
                                                        <TrendingUp size={10} /> {rec.count?.toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="flex-1 flex flex-col gap-1.5">
                                                    <span className="text-[12px] font-black text-white group-hover:text-amber-400 transition-colors leading-tight">
                                                        {rec.title}
                                                    </span>
                                                    <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                                                        {rec.prompt}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 text-left">
                        {analysisHistory && analysisHistory.length > 0 ? (
                            analysisHistory.slice(0, 5).map((item) => (
                                <button 
                                    key={item.id} 
                                    onClick={() => setPrompt(item.prompt)} 
                                    className={`relative group w-full text-left p-3 rounded-xl border transition-all active:scale-95 flex flex-col gap-2 h-[90px] ${prompt === item.prompt ? 'bg-blue-600/10 border-blue-500/50 shadow-lg scale-[1.02] z-10' : 'bg-white/[0.02] border-white/5 hover:bg-white/5'}`}
                                >
                                    <div className="flex justify-between items-start w-full">
                                        <span className="text-[7px] font-black text-blue-500/50 uppercase tracking-widest italic">AI Analysis Card</span>
                                        <Sparkles size={10} className={prompt === item.prompt ? 'text-blue-400' : 'text-slate-700'} />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-start gap-1 overflow-hidden">
                                        <p className={`text-[11px] font-bold leading-snug line-clamp-1 transition-colors ${prompt === item.prompt ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}`}>
                                            {item.summary}
                                        </p>
                                        <p className="text-[10px] text-slate-600 line-clamp-2 leading-relaxed opacity-60">
                                            {item.prompt}
                                        </p>
                                    </div>
                                </button>
                            ))
                        ) : (
                            <div className="col-span-full py-8 border border-dashed border-white/5 rounded-xl flex flex-col items-center justify-center gap-2 opacity-30">
                                <Sparkles size={20} />
                                <span className="text-[10px] font-black uppercase tracking-widest">분석 카드가 없습니다</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI 추론 및 계획 과정 시각화 */}
                {currentStepIndex >= 0 && (
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-900/40">
                                    <BrainCircuit size={20} className="text-white animate-pulse" />
                                </div>
                                <div className="group relative flex items-center gap-3">
                                    <div className="flex flex-col">
                                        <h3 className="text-white font-black text-sm uppercase tracking-tighter whitespace-nowrap">AI SQL Synthesis Planning</h3>
                                        <p className="text-[10px] text-blue-400 font-mono uppercase tracking-[0.2em] cursor-help whitespace-nowrap">지능형 쿼리 생성 엔진 가동 중</p>
                                    </div>
                                    
                                    {/* 엔진 상세 정보 호버 툴팁 */}
                                    <div className="absolute top-full left-0 mt-2 w-80 p-5 bg-[#0F172A] border border-blue-500/30 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 pointer-events-none">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-white uppercase tracking-wider">Engine Status: Active</span>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                                                        <SearchCode size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Metadata Matching</p>
                                                        <p className="text-[10px] text-slate-300 font-bold">자연어 의도 - 테이블 스키마 매핑 완료</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                                                        <GitMerge size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Join Inference</p>
                                                        <p className="text-[10px] text-slate-300 font-bold">댐코드(dam_cd) 기준 1:N 관계 추론</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-white/5">
                                                <p className="text-[9px] text-slate-500 leading-relaxed font-medium italic">
                                                    Gemini 1.5 Pro 모델이 실시간으로 쿼리 최적화 계획을 수립하고 있습니다.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Progress</span>
                                <div className="w-32 h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                    <div 
                                        className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_8px_rgba(59,130,246,1)]" 
                                        style={{ width: `${((currentStepIndex + 1) / generationSteps.length) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-5 gap-4 relative">
                            {/* 배경 연결 선 */}
                            <div className="absolute top-6 left-0 w-full h-0.5 bg-white/5 z-0" />
                            
                            {generationSteps.map((step, idx) => {
                                const isActive = idx === currentStepIndex;
                                const isCompleted = idx < currentStepIndex;
                                
                                return (
                                    <div key={step.id} className="relative z-10 flex flex-col items-center text-center gap-3 group">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                                            isActive 
                                                ? 'bg-blue-600 border-blue-400 scale-110 shadow-[0_0_20px_rgba(59,130,246,0.5)] text-white' 
                                                : isCompleted 
                                                    ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                                                    : 'bg-black/40 border-white/5 text-slate-700'
                                        }`}>
                                            {isCompleted ? <Check size={20} /> : (
                                                <>
                                                    {step.icon === 'search' && <SearchCode size={20} />}
                                                    {step.icon === 'database' && <Database size={20} />}
                                                    {step.icon === 'git-merge' && <GitMerge size={20} />}
                                                    {step.icon === 'brain-circuit' && <BrainCircuit size={20} />}
                                                    {step.icon === 'code' && <Code size={20} />}
                                                </>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className={`text-[11px] font-black transition-colors ${isActive ? 'text-white' : isCompleted ? 'text-blue-400/80' : 'text-slate-600'}`}>
                                                {step.label}
                                            </p>
                                            <div className="h-4 flex items-center justify-center relative">
                                                <p className={`text-[9px] font-medium leading-tight max-w-[120px] transition-all duration-300 ${isActive ? 'text-slate-400' : 'text-slate-500 opacity-0 group-hover:opacity-100'}`}>
                                                    {step.detail}
                                                </p>

                                                {/* 단계별 상세 데이터 호버 팝업 */}
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 p-4 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[60] pointer-events-none text-left">
                                                    <div className="space-y-3">
                                                        <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-500 animate-pulse' : 'bg-slate-500'}`} />
                                                            <span className="text-[9px] font-black text-white uppercase tracking-wider">{step.label} 상세</span>
                                                        </div>

                                                        {step.id === 1 && step.data && (
                                                            <div className="space-y-3">
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">키워드</p>
                                                                    <div className="flex flex-wrap gap-1">
                                                                        {step.data.keywords.map(k => (
                                                                            <span key={k} className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded border border-blue-500/10">
                                                                                - {k}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1.5 tracking-widest">확장 문장</p>
                                                                    <ul className="space-y-1">
                                                                        {step.data.expanded.map((e, i) => (
                                                                            <li key={i} className="text-[9px] text-slate-400 font-medium leading-tight flex gap-1.5">
                                                                                <span className="text-blue-500">-</span> {e}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {step.id === 2 && step.data && (
                                                            <div className="space-y-2">
                                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">참조 메타 정보</p>
                                                                <div className="overflow-hidden rounded border border-white/5">
                                                                    <table className="w-full text-[9px]">
                                                                        <thead className="bg-white/5 text-slate-500">
                                                                            <tr>
                                                                                <th className="px-2 py-1 text-left font-black">Table</th>
                                                                                <th className="px-2 py-1 text-left font-black">Comment</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody className="divide-y divide-white/5 text-slate-300">
                                                                            {step.data.tables.map(t => (
                                                                                <tr key={t.name}>
                                                                                    <td className="px-2 py-1.5 font-bold text-blue-400">{t.name}</td>
                                                                                    <td className="px-2 py-1.5 leading-tight">{t.comment}</td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {step.id === 3 && step.data && (
                                                            <div className="space-y-2">
                                                                <div>
                                                                    <p className="text-[8px] font-black text-slate-500 uppercase mb-1 tracking-widest">Relation Mapping</p>
                                                                    <p className="text-[10px] text-blue-400 font-bold">{step.data.mapping}</p>
                                                                </div>
                                                                <div className="p-2 bg-black/40 rounded border border-white/5">
                                                                    <code className="text-[9px] text-emerald-400 font-mono">{step.data.joinType} Optimized</code>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {step.id > 3 && (
                                                            <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">
                                                                {step.detail} 단계가 성공적으로 완료되었습니다.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {isActive && isGenerating && (
                                            <div className="absolute -top-1 -right-1">
                                                <span className="relative flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 쿼리 생성기 영역 */}
                <div className="bg-white/[0.02] backdrop-blur-2xl p-6 rounded-2xl border border-white/5 shadow-2xl text-left relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600/50" />
                    <div className="flex items-center gap-2 mb-2 text-blue-400 opacity-80 text-left">
                        <Sparkles size={18} />
                        <h3 className="text-[12px] font-black uppercase tracking-[0.4em]">질문 입력</h3>
                    </div>
                    <textarea 
                        value={prompt} 
                        onChange={(e) => setPrompt(e.target.value)} 
                        placeholder="데이터 분석 의도를 입력하십시오..." 
                        className="w-full h-12 bg-transparent border-none focus:ring-0 text-xl font-black text-white placeholder:text-slate-800 resize-none outline-none leading-tight tracking-tighter" 
                    />
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-2 text-left">
                        <div className="flex flex-wrap gap-2 flex-1 text-left">
                            {selectedTables.map(id => {
                                const table = tables.find(t => t.id === id);
                                return (
                                    <span key={id} className="px-2.5 py-1 bg-blue-500/5 text-blue-400 text-[9px] font-black rounded-lg border border-blue-500/10 uppercase tracking-widest whitespace-nowrap h-fit">
                                        {table ? table.name : id}
                                    </span>
                                );
                            })}
                        </div>
                        <button 
                            onClick={handleGenerateSql} 
                            disabled={isGenerating || !prompt} 
                            className="bg-white text-black px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-blue-600 hover:text-white transition-all text-[11px] uppercase shadow-xl active:scale-95 shadow-blue-500/10 shrink-0"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Terminal size={16} />} SQL 생성
                        </button>
                    </div>
                </div>

                {generatedSql && (
                    <div className="space-y-6 animate-in slide-in-from-top-4 text-left">
                        {!isComparing ? (
                            <div className="bg-[#020617] rounded-2xl overflow-hidden shadow-2xl border border-white/10 text-left relative">
                                <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex justify-between items-center text-slate-400 text-[12px] font-mono font-black tracking-[0.2em] uppercase relative">
                                    {isExecuting && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900/10 overflow-hidden z-30"><div className="h-full bg-blue-500 animate-progress origin-left" /></div>}
                                    <div className="flex items-center gap-4">
                                        <span className="flex items-center gap-3 text-white"><Code size={18} /> 데이터 추출 쿼리</span>
                                        {originalSqlBeforeFix && !isComparing && (
                                            <button 
                                                onClick={() => setShowFixDiff(!showFixDiff)}
                                                className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all text-[9px] font-black uppercase ${showFixDiff ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'}`}
                                            >
                                                <GitMerge size={12} />
                                                {showFixDiff ? '비교 끄기' : '재시도 쿼리 비교'}
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleAuditSql} disabled={isAuditing} className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-full border border-indigo-500/20 transition-all text-[9px] font-black uppercase flex items-center gap-2 shadow-lg active:scale-95">{isAuditing ? <RefreshCw className="animate-spin" size={12} /> : <Stethoscope size={12} />} ✨ 쿼리 진단</button>
                                        <button onClick={handleExecuteQuery} disabled={isExecuting} className="bg-blue-600 text-white px-6 py-2 rounded-full text-[10px] font-black hover:bg-blue-500 flex items-center gap-2 transition-all shadow-blue-500/20 shadow-lg active:scale-95">{isExecuting ? <Loader2 className="animate-spin" size={12} /> : <Play size={12} fill="currentColor" />} 실행</button>
                                    </div>
                                </div>
                                <div className="p-6 overflow-x-auto min-h-[150px] text-left relative">
                                    {showFixDiff && originalSqlBeforeFix && (
                                        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4 duration-300">
                                            <div className="space-y-2 relative">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[8px] font-black text-red-500/70 uppercase tracking-widest flex items-center gap-1.5">
                                                        <AlertTriangle size={10} /> 이전 쿼리 (오류 발생)
                                                    </span>
                                                </div>
                                                <div className="p-4 bg-red-500/5 rounded-xl border border-red-500/10 opacity-70">
                                                    <SqlHighlighter code={originalSqlBeforeFix} isOriginal={true} />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between px-2">
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5">
                                                        <CheckCircle2 size={10} /> 수정된 쿼리 (동작 완료)
                                                    </span>
                                                </div>
                                                <div className="p-4 bg-blue-600/10 rounded-xl border border-blue-500/30 shadow-inner">
                                                    <SqlHighlighter code={generatedSql} />
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 border-t border-white/5 pt-4">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">최종 적용 쿼리 (수정 가능)</span>
                                            </div>
                                        </div>
                                    )}
                                    <SqlHighlighter code={generatedSql} />
                                </div>
                                {sqlAudit && (
                                    <div className="p-6 bg-indigo-500/5 border-t border-white/5 animate-in slide-in-from-top-2 text-left">
                                        <div className="flex gap-4 text-left">
                                            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg font-black text-xs">{sqlAudit.score}</div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1 pl-1">신경망 쿼리 진단 보고서</h4>
                                                <p className="text-slate-300 text-[12px] font-bold mb-3 italic whitespace-normal leading-relaxed text-left">"{sqlAudit.analysis}"</p>
                                                <div className="flex flex-wrap gap-1.5 text-left">
                                                    {sqlAudit.suggestions.map((s, i) => (<span key={i} className="bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[10px] font-bold">{s}</span>))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="p-4 bg-white/5 border-t border-white/5 relative">
                                    {isRefining && <div className="absolute top-0 left-0 w-full h-0.5 bg-blue-900/10 overflow-hidden"><div className="h-full bg-blue-500 animate-progress origin-left" /></div>}
                                    <div className="flex items-center gap-4 bg-black/60 p-2 rounded-xl border border-white/10 shadow-inner">
                                        <Wand2 size={16} className="text-emerald-400 shrink-0 ml-3" />
                                        <input value={refineInstruction} onChange={(e) => setRefineInstruction(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleRefineSql()} placeholder="정교화 피드백을 입력하십시오..." className="flex-1 bg-transparent border-none text-white focus:ring-0 text-sm font-bold placeholder:text-slate-800 text-left" />
                                        <button onClick={handleRefineSql} disabled={isRefining || !refineInstruction} className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white px-4 py-2 rounded-lg font-black uppercase text-[9px] transition-all active:scale-95 flex items-center gap-2">
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
                                        <button onClick={handleApplyRefinedSql} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-black hover:bg-blue-500 text-[10px] uppercase shadow-lg active:scale-95 transition-all"><Check size={12} /> 적용</button>
                                        <button onClick={handleDiscardRefinedSql} className="bg-white/5 text-slate-500 px-4 py-1.5 rounded-lg font-black hover:bg-red-500/20 hover:text-red-400 text-[10px] uppercase active:scale-95 transition-all"><X size={12} /> 취소</button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-white/5 text-left">
                                    <div className="p-3 bg-black/20 text-left">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-slate-800 mb-1 block ml-3">이전 아키텍처</span>
                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-x-auto min-h-[120px] text-left">
                                            <SqlHighlighter code={previousSql} isOriginal={true} />
                                        </div>
                                    </div>
                                    <div className="p-3 bg-blue-600/5 relative text-left">
                                        <span className="text-[7px] font-black uppercase tracking-widest text-blue-500 mb-1 block ml-3 text-left">신경망 정교화</span>
                                        <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-500/20 shadow-inner overflow-x-auto min-h-[120px] text-left">
                                            <SqlHighlighter code={tempRefinedSql} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {/* 쿼리 실행 에러 및 AI 복구 영역 */}
                        {(executionError || pendingFixedSql) && (
                            <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-8 animate-in slide-in-from-bottom-4 duration-500 shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-2 h-full bg-red-500/50" />
                                <div className="flex flex-col gap-8 relative z-10">
                                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                                        <div className="flex gap-6 items-start">
                                            <div className="p-4 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 group-hover:scale-110 transition-transform">
                                                {isSelfHealing ? <RefreshCw size={32} className="animate-spin" /> : (pendingFixedSql ? <Wand2 size={32} className="text-blue-500" /> : <AlertTriangle size={32} />)}
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <h3 className={`${pendingFixedSql ? 'text-blue-500' : 'text-red-500'} font-black text-lg uppercase tracking-tight`}>
                                                        {isSelfHealing ? 'AI 자가 복구 진행 중...' : (pendingFixedSql ? 'AI 쿼리 수정 제안' : 'SQL Execution Failed')}
                                                    </h3>
                                                    <span className={`px-2 py-0.5 ${isSelfHealing || pendingFixedSql ? 'bg-blue-600' : 'bg-red-500'} text-white text-[8px] font-black rounded uppercase`}>
                                                        {isSelfHealing || pendingFixedSql ? 'Auto Healing' : 'Critical Error'}
                                                    </span>
                                                </div>
                                                
                                                {executionError && !pendingFixedSql && (
                                                    <div className="p-4 bg-black/40 rounded-xl border border-white/5 font-mono text-[12px] text-red-400/80 leading-relaxed shadow-inner">
                                                        {executionError}
                                                    </div>
                                                )}

                                                {pendingFixedSql && (
                                                    <div className="space-y-4">
                                                        <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-500/30 font-mono text-[12px] text-blue-200 leading-relaxed shadow-inner">
                                                            <div className="flex items-center justify-between mb-4 border-b border-blue-500/20 pb-2">
                                                                <div className="flex items-center gap-2 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                                                                    <Code size={12} /> Suggested Fix
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[9px] font-black text-slate-500 uppercase">Diff View</span>
                                                                    <button 
                                                                        onClick={() => setShowFixDiff(!showFixDiff)}
                                                                        className={`w-10 h-5 rounded-full transition-all relative ${showFixDiff ? 'bg-blue-600' : 'bg-slate-700'}`}
                                                                    >
                                                                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showFixDiff ? 'left-6' : 'left-1'}`} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {showFixDiff ? (
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <span className="text-[8px] font-black text-red-500/70 uppercase">Original (Error)</span>
                                                                        <div className="p-3 bg-red-500/5 rounded-lg border border-red-500/10 opacity-70">
                                                                            <SqlHighlighter code={generatedSql} isOriginal={true} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <span className="text-[8px] font-black text-emerald-500 uppercase">Suggested Fix</span>
                                                                        <div className="p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                                                                            <SqlHighlighter code={pendingFixedSql} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <SqlHighlighter code={pendingFixedSql} />
                                                            )}
                                                        </div>
                                                        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/5">
                                                            <Info size={16} className="text-blue-400 shrink-0 mt-0.5" />
                                                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed italic">
                                                                {fixedSqlExplanation || '오류 원인을 분석하여 쿼리를 수정했습니다. 내용을 확인 후 승인해 주세요.'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <p className="text-slate-500 text-[11px] font-medium italic">
                                                    {isSelfHealing 
                                                        ? 'AI 엔진이 오류 원인을 분석하여 쿼리를 수정하고 있습니다. 잠시만 기다려주세요.' 
                                                        : (pendingFixedSql ? '수정된 쿼리를 승인하면 자동으로 재실행됩니다.' : 'SQL 실행 중 오류가 발생했습니다. AI 수정을 시도하거나 쿼리를 직접 수정해 주세요.')}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        {!isSelfHealing && !pendingFixedSql && (
                                            <button 
                                                onClick={() => handleSelfHealSql()}
                                                className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 group/btn"
                                            >
                                                <Wand2 size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                                <span>AI 쿼리 수정 요청</span>
                                            </button>
                                        )}

                                        {pendingFixedSql && (
                                            <div className="flex flex-col gap-3">
                                                <button 
                                                    onClick={handleApplyFixedSql}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-[12px] uppercase flex items-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all active:scale-95 group/btn"
                                                >
                                                    <Check size={18} />
                                                    <span>수정 쿼리 승인</span>
                                                </button>
                                                <button 
                                                    onClick={() => handleSelfHealSql()}
                                                    className="bg-white/5 hover:bg-white/10 text-slate-400 px-8 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 transition-all active:scale-95"
                                                >
                                                    <RefreshCw size={14} />
                                                    <span>다시 생성 요청</span>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {isSelfHealing && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-900/20 overflow-hidden">
                                        <div className="h-full bg-blue-500 animate-progress origin-left shadow-[0_0_10px_rgba(59,130,246,1)]" />
                                    </div>
                                )}
                            </div>
                        )}
                        {queryResult && (
                            <div className="bg-white/[0.01] backdrop-blur-3xl rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-in fade-in text-left">
                                <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex justify-between items-center relative">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-3 font-black text-slate-600 text-[10px] uppercase tracking-[0.6em] text-left">
                                            <LayoutDashboard size={18} /> 분석 결과 노드
                                        </div>
                                        
                                        {successfulRetryCount > 0 && (
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-lg animate-in zoom-in">
                                                    <RotateCcw size={12} className="text-amber-500" />
                                                    <span className="text-amber-500 text-[9px] font-black uppercase tracking-wider">
                                                        AI 쿼리 수정 적용됨 (재시도: {successfulRetryCount}회)
                                                    </span>
                                                </div>
                                                
                                                {originalSqlBeforeFix && (
                                                    <div className="relative group/diff">
                                                        <button 
                                                            className={`flex items-center gap-2 px-3 py-1 border rounded-lg transition-all ${showFixDiff ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-400 hover:bg-blue-500/20'}`}
                                                            onClick={() => setShowFixDiff(!showFixDiff)}
                                                        >
                                                            <GitMerge size={12} />
                                                            <span className="text-[9px] font-black uppercase">{showFixDiff ? '비교 닫기' : '수정 내역 확인'}</span>
                                                        </button>
                                                        
                                                        {showFixDiff && (
                                                            <div className="absolute bottom-full left-0 mb-2 w-[600px] bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl z-[60] p-6 animate-in slide-in-from-bottom-2">
                                                                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                                                                    <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                                        <BrainCircuit size={14} className="text-blue-500" /> SQL 변경 사항 비교
                                                                    </span>
                                                                    <button onClick={() => setShowFixDiff(false)} className="text-slate-500 hover:text-white">
                                                                        <X size={16} />
                                                                    </button>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-2">
                                                                        <span className="text-[8px] font-black text-red-500/70 uppercase">이전 쿼리 (오류 발생)</span>
                                                                        <div className="p-4 bg-black/40 rounded-xl border border-white/5 overflow-x-auto min-h-[150px]">
                                                                            <SqlHighlighter code={originalSqlBeforeFix} isOriginal={true} />
                                                                        </div>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        <span className="text-[8px] font-black text-emerald-500 uppercase">최종 수정 쿼리</span>
                                                                        <div className="p-4 bg-blue-950/40 rounded-xl border border-blue-500/20 overflow-x-auto min-h-[150px]">
                                                                            <SqlHighlighter code={generatedSql} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className="relative">
                                            <button 
                                                onClick={() => setIsColumnPanelOpen(!isColumnPanelOpen)} 
                                                className={`px-3 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all active:scale-95 ${isColumnPanelOpen ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                            >
                                                <Settings2 size={16} className={isColumnPanelOpen ? 'text-white' : 'text-blue-500'} />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-left">컬럼 설정</span>
                                                {hiddenColumns.length > 0 && (
                                                    <span className="bg-red-500 text-white text-[8px] px-1.5 rounded-full font-black">{hiddenColumns.length}</span>
                                                )}
                                            </button>
                                            
                                            {isColumnPanelOpen && (
                                                <div className="absolute left-0 mt-3 w-64 bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl z-50 p-4 animate-in fade-in zoom-in duration-200">
                                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                                                        <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                                            <Filter size={14} className="text-blue-500" /> 컬럼 필터
                                                        </span>
                                                        <button onClick={() => setIsColumnPanelOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pr-1.5">
                                                        {columnOrder.map((col, idx) => (
                                                            <div 
                                                                key={col} 
                                                                className={`w-full flex items-center gap-2 p-1.5 rounded-lg transition-all text-left ${hiddenColumns.includes(col) ? 'bg-white/5 opacity-50' : 'bg-blue-600/10 border border-blue-500/20'}`}
                                                            >
                                                                <div className="flex flex-col gap-0.5 shrink-0">
                                                                    <button 
                                                                        onClick={() => moveColumn(idx, 'up')} 
                                                                        disabled={idx === 0}
                                                                        className={`p-0.5 rounded hover:bg-white/10 transition-colors ${idx === 0 ? 'text-slate-800' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        <ChevronUp size={12} />
                                                                    </button>
                                                                    <button 
                                                                        onClick={() => moveColumn(idx, 'down')} 
                                                                        disabled={idx === columnOrder.length - 1}
                                                                        className={`p-0.5 rounded hover:bg-white/10 transition-colors ${idx === columnOrder.length - 1 ? 'text-slate-800' : 'text-slate-400 hover:text-white'}`}
                                                                    >
                                                                        <ChevronDown size={12} />
                                                                    </button>
                                                                </div>

                                                                <button 
                                                                    onClick={() => toggleColumn(col)}
                                                                    className="flex-1 flex items-center justify-between overflow-hidden"
                                                                >
                                                                    <span className={`text-[10px] font-bold truncate ${hiddenColumns.includes(col) ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                                        {col}
                                                                    </span>
                                                                    {hiddenColumns.includes(col) ? <EyeOff size={12} className="text-slate-600" /> : <Eye size={12} className="text-blue-400" />}
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {(hiddenColumns.length > 0 || columnOrder.join(',') !== allColumns.join(',')) && (
                                                        <button 
                                                            onClick={() => {
                                                                setHiddenColumns([]);
                                                                setColumnOrder(allColumns);
                                                            }}
                                                            className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all border border-white/5"
                                                        >
                                                            설정 초기화
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button onClick={handleDownloadExcel} className="bg-white/5 hover:bg-emerald-500/10 text-slate-400 px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2 transition-all active:scale-95 shadow-sm"><FileSpreadsheet size={16} className="text-emerald-500" /><span className="text-[9px] font-black uppercase tracking-widest text-left">엑셀 내보내기</span></button>
                                        <button onClick={() => setActiveTab('visualize')} className="bg-blue-600 text-white px-5 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg transition-all active:scale-95 shadow-blue-900/20 text-left">시각화 분석 <ChevronRight size={14} /></button>
                                    </div>
                                </div>
                                <div className="overflow-x-auto text-[11px] text-left border-t border-white/5">
                                    <table className="w-full border-collapse text-left table-fixed min-w-[1000px]">
                                        <thead className="bg-black/40">
                                            <tr>{visibleColumns.map(key => (<th key={key} className="px-6 py-4 font-black text-slate-700 uppercase tracking-widest text-left border-r border-white/5 last:border-r-0">{key}</th>))}</tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {queryResult.slice(0, visibleRows).map((row, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 transition-all duration-300 group">
                                                    {visibleColumns.map((key, i) => (
                                                        <td key={i} className="px-6 py-4 font-bold text-slate-400 border-r border-white/5 group-hover:border-white/10 last:border-r-0 transition-colors">
                                                            {row[key] !== null && typeof row[key] === 'object' ? JSON.stringify(row[key]) : String(row[key] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {/* 인피니티 스크롤 로더 */}
                                <div ref={tableLoaderRef} className="flex justify-center py-8 border-t border-white/5 bg-black/20">
                                    {visibleRows < queryResult.length && (
                                        <div className="flex items-center gap-2 text-slate-600 font-black text-[9px] uppercase tracking-[0.2em]">
                                            <Loader2 className="animate-spin" size={14} />
                                            <span>대용량 데이터 로드 중...</span>
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
