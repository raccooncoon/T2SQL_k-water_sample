import React from 'react';
import { Sparkles, RefreshCw, Table, CheckCircle2 } from 'lucide-react';
import { tables } from '../constants/data';

const ExplorerTab = ({ 
    tableSearchPrompt, 
    setTableSearchPrompt, 
    handleAiTableSelection, 
    isTableSearching, 
    selectedTables, 
    setSelectedTables 
}) => {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-12 text-left">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in pb-24">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase leading-tight">
                    지능형 데이터 <span className="text-slate-600">카탈로그</span>
                </h2>
                <div className="bg-[#111827]/90 backdrop-blur-3xl rounded-2xl p-6 flex items-center gap-6 border border-white/10 border-l-8 border-l-blue-600 mb-8 shadow-2xl">
                    <div className="p-4 bg-blue-600 text-white rounded-xl shadow-lg">
                        <Sparkles size={24} />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-1 pl-1">
                            지능형 컨텍스트 구성기
                        </h3>
                        <div className="flex gap-4 text-left">
                            <input 
                                value={tableSearchPrompt} 
                                onChange={(e) => setTableSearchPrompt(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleAiTableSelection()} 
                                placeholder="데이터 특징 기술 (예: 강수데이터 보여줘)..." 
                                className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-white placeholder:text-slate-800 text-left" 
                            />
                            <button 
                                onClick={handleAiTableSelection} 
                                disabled={isTableSearching} 
                                className="bg-blue-600 text-white px-10 py-2 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all"
                            >
                                {isTableSearching ? <RefreshCw className="animate-spin" size={14} /> : "Context 탐색"}
                            </button>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                    {tables.map(table => (
                        <div 
                            key={table.id} 
                            onClick={() => setSelectedTables(prev => prev.includes(table.id) ? prev.filter(t => t !== table.id) : [...prev, table.id])} 
                            className={`p-6 rounded-2xl transition-all border ${selectedTables.includes(table.id) ? 'bg-blue-600/10 border-blue-500/50 shadow-lg scale-[1.02]' : 'bg-white/[0.03] border-white/5 hover:bg-white/10 shadow-none'}`}
                        >
                            <div className="flex justify-between mb-6 text-left">
                                <div className={`p-4 rounded-xl ${selectedTables.includes(table.id) ? 'bg-blue-600 text-white shadow-md' : 'bg-white/5 text-slate-600'}`}>
                                    <Table size={24} />
                                </div>
                                {selectedTables.includes(table.id) && <CheckCircle2 size={20} className="text-blue-500" />}
                            </div>
                            <h3 className="font-black text-sm text-white truncate uppercase tracking-tight text-left">
                                {table.name}
                            </h3>
                            <p className="text-[9px] text-slate-700 font-mono mb-4 uppercase tracking-widest text-left">
                                {table.id}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExplorerTab;
