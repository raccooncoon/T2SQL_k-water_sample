import React from 'react';
import { RefreshCw, Wand2, Database, ArrowRightLeft } from 'lucide-react';
import { tables } from '../constants/data';

const RelationshipsTab = ({
    handleAiRelationshipSuggestion,
    isRelationshipSearching,
    joinRules,
    updateJoinRule,
    getTableColumns
}) => {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-12 text-left">
            <div className="max-w-5xl mx-auto p-12 space-y-8 animate-in fade-in duration-700 pb-24 text-left">
                <h2 className="text-3xl font-black text-white tracking-tight uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 text-left">
                    데이터 관계 설계
                </h2>
                <button 
                    onClick={() => handleAiRelationshipSuggestion()} 
                    disabled={isRelationshipSearching} 
                    className="bg-emerald-600 text-white px-10 py-3 rounded-xl font-black flex items-center gap-3 hover:bg-emerald-500 shadow-xl transition-all text-[10px] uppercase tracking-widest mx-auto active:scale-95 text-left"
                >
                    {isRelationshipSearching ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />} AI 시냅스 매핑
                </button>
                <div className="grid grid-cols-1 gap-6 pt-8 text-left">
                    {joinRules.map((rule) => (
                        <div key={rule.id} className="bg-white/[0.02] p-8 rounded-2xl border border-white/5 flex items-center justify-between gap-8 shadow-xl backdrop-blur-3xl text-left">
                            <div className="flex-1 text-left space-y-3">
                                <div className="flex items-center gap-3 text-left">
                                    <Database size={14} className="text-blue-500" />
                                    <select 
                                        value={rule.leftTable} 
                                        onChange={(e) => updateJoinRule(rule.id, 'leftTable', e.target.value)} 
                                        className="bg-blue-500/10 text-blue-400 font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-lg border border-blue-500/20 outline-none cursor-pointer appearance-none text-left"
                                    >
                                        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <select 
                                    value={rule.leftCol} 
                                    onChange={(e) => updateJoinRule(rule.id, 'leftCol', e.target.value)} 
                                    className="w-full bg-black/40 border border-white/10 text-lg font-bold text-slate-200 outline-none p-3 rounded-xl cursor-pointer hover:border-blue-500/50 transition-all shadow-inner font-mono text-sm text-left"
                                >
                                    <option value="">기본 키 선택</option>
                                    {getTableColumns(rule.leftTable).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col items-center gap-3 text-left">
                                <div className="p-4 bg-blue-600/10 rounded-full border border-blue-500/20 text-blue-500 shadow-md text-left">
                                    <ArrowRightLeft size={24} />
                                </div>
                                <select 
                                    value={rule.type} 
                                    onChange={(e) => updateJoinRule(rule.id, 'type', e.target.value)} 
                                    className="bg-black/60 text-[8px] font-black text-slate-400 uppercase border border-slate-800 px-3 py-1 rounded-full outline-none cursor-pointer hover:text-white transition-colors text-center shadow-lg text-left"
                                >
                                    <option value="INNER JOIN">INNER JOIN</option>
                                    <option value="LEFT JOIN">LEFT JOIN</option>
                                </select>
                            </div>
                            <div className="flex-1 text-right space-y-3 text-left">
                                <div className="flex items-center gap-3 justify-end text-left">
                                    <select 
                                        value={rule.rightTable} 
                                        onChange={(e) => updateJoinRule(rule.id, 'rightTable', e.target.value)} 
                                        className="bg-emerald-500/10 text-emerald-400 font-black text-[9px] uppercase tracking-widest px-4 py-2 rounded-xl border border-emerald-500/20 outline-none cursor-pointer appearance-none ml-auto text-left"
                                    >
                                        {tables.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    <Database size={14} className="text-emerald-500" />
                                </div>
                                <select 
                                    value={rule.rightCol} 
                                    onChange={(e) => updateJoinRule(rule.id, 'rightCol', e.target.value)} 
                                    className="w-full bg-black/40 border border-white/10 text-lg font-bold text-slate-200 outline-none p-3 rounded-xl text-right cursor-pointer hover:border-emerald-500/50 transition-all shadow-inner font-mono text-sm text-left"
                                >
                                    <option value="">외래 키 선택</option>
                                    {getTableColumns(rule.rightTable).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RelationshipsTab;
