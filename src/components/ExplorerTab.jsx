import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, RefreshCw, Table, CircleCheckBig, MessageSquare, Loader2 } from 'lucide-react';
import { tables, tableRecommendations } from '../constants/data';

const ExplorerTab = ({ 
    tableSearchPrompt, 
    setTableSearchPrompt, 
    handleAiTableSelection, 
    isTableSearching, 
    selectedTables, 
    setSelectedTables 
}) => {
    const [visibleCount, setVisibleCount] = useState(8);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const loaderRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < tables.length && !isLoadingMore) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

        return () => {
            if (loaderRef.current) {
                observer.unobserve(loaderRef.current);
            }
        };
    }, [visibleCount, isLoadingMore]);

    const loadMore = () => {
        setIsLoadingMore(true);
        // 인피니티 스크롤 효과를 위해 약간의 지연 추가
        setTimeout(() => {
            setVisibleCount(prev => Math.min(prev + 4, tables.length));
            setIsLoadingMore(false);
        }, 500);
    };

    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-12 text-left">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-24">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight">
                    지능형 데이터 <span className="text-slate-600">카탈로그</span>
                </h2>

                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {tableRecommendations.map((rec, idx) => (
                            <button
                                key={idx}
                                onClick={() => {
                                    setTableSearchPrompt(rec.prompt);
                                    handleAiTableSelection(rec.prompt);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 hover:text-white transition-all active:scale-95"
                            >
                                <MessageSquare size={12} className="text-blue-500" />
                                {rec.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-[#111827]/90 backdrop-blur-3xl rounded-2xl p-6 flex items-center gap-6 border border-white/10 border-l-8 border-l-blue-600 mb-8 shadow-2xl">
                        <div className="p-4 bg-blue-600 text-white rounded-xl shadow-lg">
                            <Sparkles size={24} />
                        </div>
                        <div className="flex-1 text-left">
                            <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1 pl-1">
                                지능형 데이터 선택기
                            </h3>
                            <div className="flex gap-4 text-left">
                                <input 
                                    value={tableSearchPrompt} 
                                    onChange={(e) => setTableSearchPrompt(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleAiTableSelection()} 
                                    placeholder="데이터 특징 기술 (예: 강수데이터 보여줘)..." 
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-2xl font-bold text-white placeholder:text-slate-800 text-left" 
                                />
                                <button 
                                    onClick={handleAiTableSelection} 
                                    disabled={isTableSearching} 
                                    className="bg-blue-600 text-white px-10 py-2 rounded-xl font-black text-[11px] uppercase shadow-md active:scale-95 transition-all"
                                >
                                    {isTableSearching ? <RefreshCw className="animate-spin" size={16} /> : "데이터 선택"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {tables.slice(0, visibleCount).map(table => (
                        <div 
                            key={table.id} 
                            onClick={() => setSelectedTables(prev => prev.includes(table.id) ? prev.filter(t => t !== table.id) : [...prev, table.id])} 
                            className={`p-6 rounded-2xl transition-all border relative overflow-hidden group cursor-pointer ${selectedTables.includes(table.id) ? 'bg-blue-600/10 border-blue-500/50 shadow-lg scale-[1.02]' : 'bg-white/[0.03] border-white/5 hover:bg-white/10 shadow-none'} ${table.isMart ? 'border-l-4 border-l-amber-500/50' : ''}`}
                        >
                            {table.isMart && (
                                <div className="absolute top-0 right-0 bg-amber-500/20 text-amber-500 px-3 py-1 rounded-bl-xl text-[8px] font-black uppercase tracking-widest border-b border-l border-amber-500/20">
                                    Data Mart
                                </div>
                            )}
                            <div className="flex justify-between mb-6 text-left">
                                <div className={`p-4 rounded-xl transition-colors ${selectedTables.includes(table.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-slate-600 group-hover:text-slate-300'} ${table.isMart && !selectedTables.includes(table.id) ? 'text-amber-500/50' : ''}`}>
                                    <Table size={24} />
                                </div>
                                {selectedTables.includes(table.id) && <CircleCheckBig size={20} className="text-blue-500 animate-in zoom-in" />}
                            </div>
                            <h3 className="font-black text-base text-white truncate uppercase tracking-tight text-left flex items-center gap-2">
                                {table.name}
                            </h3>
                            <p className="text-[10px] text-slate-700 font-mono mb-4 uppercase tracking-widest text-left group-hover:text-slate-500 transition-colors">
                                {table.id}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity">
                                {table.description}
                            </p>
                        </div>
                    ))}
                </div>
                
                {/* 인피니티 스크롤 로더 */}
                <div ref={loaderRef} className="flex justify-center py-10">
                    {visibleCount < tables.length && (
                        <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase tracking-widest">
                            <Loader2 className="animate-spin" size={16} />
                            <span>데이터 카탈로그 로딩 중...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExplorerTab;
