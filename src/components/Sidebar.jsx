import React from 'react';
import { Clock } from 'lucide-react';

const Sidebar = ({ history, selectedHistoryId, setSelectedHistoryId, activeTab, setGeneratedSql }) => {
    return (
        <div className="flex flex-col h-full overflow-hidden text-left">
            <div className="p-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <h3 className="text-[11px] font-black text-white flex items-center gap-4 uppercase tracking-[0.4em] truncate">
                    <Clock size={16} className="text-blue-400" /> 검색 히스토리
                </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setSelectedHistoryId(item.id);
                        }}
                        className={`w-full text-left p-4 rounded-xl transition-all border ${
                            selectedHistoryId === item.id
                                ? 'bg-blue-600/10 border-blue-500/50 shadow-lg scale-[1.02]'
                                : 'border-white/5 hover:bg-white/5'
                        }`}
                    >
                        <span className="text-[9px] font-black text-slate-700 block mb-1 uppercase tracking-widest">
                            {item.timestamp}
                        </span>
                        <p className="text-[11px] font-bold text-slate-400 leading-tight whitespace-normal break-words">
                            {item.prompt}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
