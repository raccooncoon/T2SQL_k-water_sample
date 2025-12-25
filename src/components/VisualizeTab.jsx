import React from 'react';
import { Sparkles, RefreshCw, AreaChart as AreaChartIcon, LineChart as LineChartIcon, BarChart3, FileText, Database, FileText as FileTextIcon, BrainCircuit, Calendar, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, LineChart, Line, AreaChart, Area } from 'recharts';
import MarkdownViewer from './MarkdownViewer';
import { visualPresets } from '../constants/data';

const VisualizeTab = ({
    isAnalyzing,
    isGeneratingReport,
    visualizePrompt,
    setVisualizePrompt,
    handleVisualizeInsight,
    currentChartData,
    chartConfig,
    setChartConfig,
    availableColumns,
    handleGenerateReport,
    analysisReport,
    aiInsight
}) => {
    return (
        <div className="flex-1 overflow-auto custom-scrollbar p-6 space-y-4 text-left">
            <div className="w-full max-w-6xl mx-auto space-y-3 animate-in slide-in-from-top-2 text-left">
                <div className="flex flex-wrap gap-2 px-2 text-left">
                    {visualPresets.map((preset) => (
                        <button 
                            key={preset.id} 
                            onClick={() => setVisualizePrompt(preset.prompt)} 
                            className={`px-3 py-1.5 rounded-full border transition-all text-[10px] font-bold flex items-center gap-2 active:scale-95 group shadow-sm ${visualizePrompt === preset.prompt ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/20 hover:bg-emerald-500/10'}`}
                        >
                            <span className={`opacity-50 group-hover:opacity-100 ${visualizePrompt === preset.prompt ? 'opacity-100' : ''} text-left`}>
                                {preset.icon}
                            </span>
                            {preset.label}
                        </button>
                    ))}
                </div>

                <div className="bg-white/[0.01] p-3 rounded-2xl border border-white/5 relative group shadow-sm text-left overflow-hidden">
                    {isAnalyzing && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-900/20 overflow-hidden">
                            <div className="h-full bg-emerald-500 animate-progress origin-left shadow-[0_0_8px_rgba(16,185,129,1)]" />
                        </div>
                    )}
                    <div className="flex items-center gap-3 px-2 text-left">
                        <div className="p-2.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0 shadow-inner">
                            <Sparkles size={18} />
                        </div>
                        <div className="flex-1 relative flex items-center text-left">
                            <input 
                                value={visualizePrompt} 
                                onChange={(e) => setVisualizePrompt(e.target.value)} 
                                onKeyDown={(e) => e.key === 'Enter' && handleVisualizeInsight()} 
                                placeholder="시각화 분석 요청을 입력하거나 위에 있는 프리셋을 선택하십시오..."
                                className="w-full bg-transparent border-none text-slate-200 outline-none focus:ring-0 text-[13px] font-bold pr-32 py-2 text-left" 
                            />
                            <button 
                                onClick={() => handleVisualizeInsight()} 
                                disabled={isAnalyzing || !currentChartData || !visualizePrompt} 
                                className="absolute right-0 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg text-[11px] font-black uppercase flex items-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-900/20 text-left"
                            >
                                {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />} 분석 추천
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 shadow-2xl w-full max-w-6xl mx-auto flex flex-col gap-6 text-left relative overflow-hidden">
                <div className="flex flex-wrap items-end justify-between gap-6 pb-6 border-b border-white/5 text-left relative">
                    {isGeneratingReport && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-900/20 overflow-hidden z-10">
                            <div className="h-full bg-blue-500 animate-progress origin-left shadow-[0_0_8px_rgba(59,130,246,1)]" />
                        </div>
                    )}
                    <div className="flex items-end gap-6 text-left">
                        <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1 text-left">차트 유형</label>
                            <div className="flex gap-1.5 bg-black/40 p-1.5 rounded-xl border border-white/5 h-[32px] items-center shadow-inner text-left">
                                {['area', 'line', 'bar'].map(t => (
                                    <button 
                                        key={t} 
                                        onClick={() => setChartConfig({...chartConfig, type: t})} 
                                        className={`p-1.5 rounded-lg transition-all ${chartConfig.type === t ? 'bg-blue-600 text-white shadow-md shadow-blue-900/40' : 'text-slate-600 hover:text-slate-400'}`}
                                    >
                                        {t === 'area' && <AreaChartIcon size={14} />}
                                        {t === 'line' && <LineChartIcon size={14} />}
                                        {t === 'bar' && <BarChart3 size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="h-10 w-px bg-white/5 mb-0.5" />
                        <div className="flex items-end gap-4 text-left">
                            <div className="flex flex-col gap-1.5 min-w-[110px] text-left">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1 text-left">차원 (X축)</label>
                                <select 
                                    value={chartConfig.xAxis} 
                                    onChange={(e) => setChartConfig({...chartConfig, xAxis: e.target.value})} 
                                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1 text-[11px] font-bold uppercase text-slate-200 outline-none cursor-pointer hover:border-blue-500/40 transition-all h-[32px] shadow-inner text-left"
                                >
                                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-col gap-1.5 min-w-[110px] text-left">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1 text-left">측정값 (Y축)</label>
                                <select 
                                    value={chartConfig.yAxis} 
                                    onChange={(e) => setChartConfig({...chartConfig, yAxis: e.target.value})} 
                                    className="bg-black/60 border border-white/10 rounded-xl px-3 py-1 text-[11px] font-bold uppercase text-slate-200 outline-none cursor-pointer hover:border-blue-500/40 transition-all h-[32px] shadow-inner text-left"
                                >
                                    {availableColumns.map(col => <option key={col} value={col}>{col}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end text-left h-fit">
                        <label className="text-[10px] font-black text-transparent select-none uppercase tracking-widest text-left">작업</label>
                        <button 
                            onClick={handleGenerateReport} 
                            disabled={isGeneratingReport || !currentChartData} 
                            className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 h-[32px] rounded-xl border border-blue-500/20 transition-all text-[11px] font-black uppercase flex items-center gap-2 shadow-lg active:scale-95 whitespace-nowrap shadow-blue-900/10 text-left"
                        >
                            {isGeneratingReport ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />} 종합 보고서 생성
                        </button>
                    </div>
                </div>

                <div className="flex flex-col text-left">
                    <div className="h-[450px] w-full bg-black/40 rounded-xl p-6 border border-white/5 shadow-inner relative flex items-center justify-center overflow-hidden text-left">
                        {currentChartData && currentChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                {chartConfig.type === 'bar' ? (
                                    <BarChart data={currentChartData}>
                                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                        <XAxis dataKey={chartConfig.xAxis} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <Tooltip contentStyle={{backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'}} />
                                        <Bar dataKey={chartConfig.yAxis} fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={30} />
                                    </BarChart>
                                ) : chartConfig.type === 'line' ? (
                                    <LineChart data={currentChartData}>
                                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                        <XAxis dataKey={chartConfig.xAxis} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <Tooltip contentStyle={{backgroundColor: '#0F172A', borderRadius: '16px', border: 'none'}} />
                                        <Line type="monotone" dataKey={chartConfig.yAxis} stroke="#3B82F6" strokeWidth={5} dot={{r: 5, fill: '#0B0F1A', strokeWidth: 2, stroke: '#3B82F6'}} activeDot={{r: 8}} />
                                    </LineChart>
                                ) : (
                                    <AreaChart data={currentChartData}>
                                        <defs>
                                            <linearGradient id="areaG" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="rgba(255,255,255,0.02)" />
                                        <XAxis dataKey={chartConfig.xAxis} axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                                        <Tooltip contentStyle={{backgroundColor: '#0F172A', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'}} />
                                        <Area type="monotone" dataKey={chartConfig.yAxis} stroke="#3B82F6" strokeWidth={6} fill="url(#areaG)" />
                                    </AreaChart>
                                )}
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center gap-3 text-slate-800 font-black uppercase tracking-widest italic text-sm text-left">
                                <Database size={48} className="opacity-10" /> 데이터 스트림 대기 중
                            </div>
                        )}
                    </div>

                    {aiInsight && (
                        <div className="mt-8 p-6 bg-blue-600/5 border border-white/5 rounded-xl flex gap-6 animate-in slide-in-from-bottom-2 text-left shadow-sm">
                            <BrainCircuit size={28} className="text-blue-500 shrink-0" />
                            <p className="text-slate-400 text-[11px] font-medium leading-relaxed italic">{aiInsight}</p>
                        </div>
                    )}
                    {analysisReport && (
                        <div className="mt-8 p-10 bg-gradient-to-br from-blue-900/10 to-transparent border border-white/10 rounded-2xl animate-in fade-in slide-in-from-bottom-4 shadow-2xl relative overflow-hidden text-left pb-20">
                            <div className="absolute top-0 right-0 p-6 opacity-10">
                                <FileTextIcon size={160} className="text-blue-400" />
                            </div>
                            <div className="relative z-10 space-y-6 text-left">
                                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                                    <div className="flex items-center gap-4 text-left">
                                        <div className="p-3 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/40">
                                            <BrainCircuit size={32} className="text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">전략 분석 보고서</h3>
                                            <p className="text-[10px] text-blue-400 font-mono uppercase tracking-[0.3em]">Neural Intelligence Synthesis</p>
                                        </div>
                                    </div>
                                    <div className="text-[10px] font-mono text-slate-500 flex items-center gap-2 uppercase tracking-widest">
                                        <Calendar size={12} /> {new Date().toLocaleDateString()} // K-WATER
                                    </div>
                                </div>
                                <div className="p-6 bg-black/40 rounded-xl border border-white/5 shadow-inner text-left">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                            <BarChart2 size={12} /> 참조 데이터 통찰
                                        </span>
                                    </div>
                                    <div className="h-48 w-full opacity-70 pointer-events-none text-left">
                                        <ResponsiveContainer width="100%" height="100%">
                                            {chartConfig.type === 'bar' ? (
                                                <BarChart data={currentChartData}>
                                                    <Bar dataKey={chartConfig.yAxis} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                                                </BarChart>
                                            ) : (
                                                <AreaChart data={currentChartData}>
                                                    <Area type="monotone" dataKey={chartConfig.yAxis} stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                                                </AreaChart>
                                            )}
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <MarkdownViewer content={analysisReport} />
                                <div className="pt-8 flex justify-end">
                                    <div className="px-4 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] text-slate-600 italic font-medium">분석 무결성 검증 완료: K-water AI Engine v2.5</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VisualizeTab;
