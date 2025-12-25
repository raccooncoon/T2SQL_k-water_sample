import React, { useState, useEffect, useMemo } from 'react';
import {
    Database,
    Table,
    Play,
    BarChart2,
    Plus,
    CheckCircle2,
    MessageSquare,
    ChevronRight,
    Zap,
    Sparkles,
    RefreshCw,
    GitMerge,
    ArrowRightLeft,
    ShieldCheck,
    Wand2,
    Terminal,
    Clock,
    TrendingUp,
    Activity,
    Droplets,
    Layers,
    Search,
    Maximize2,
    Cpu,
    Settings2,
    LayoutDashboard,
    Code,
    ListOrdered,
    Info,
    Download,
    FileSpreadsheet,
    Check,
    RotateCcw,
    X,
    FileCode,
    ArrowRight,
    ChevronLeft,
    BrainCircuit,
    Copy,
    Lightbulb,
    AlertTriangle,
    Activity as ActivityIcon,
    Settings,
    LineChart as LineChartIcon,
    BarChart3,
    AreaChart as AreaChartIcon,
    MousePointer2,
    PanelLeftClose,
    PanelLeftOpen,
    FileText,
    Stethoscope,
    Trophy,
    Waves,
    ArrowDownUp,
    AlertCircle,
    SearchCode,
    Calendar,
    LayoutList,
    Loader2
} from 'lucide-react';

import Sidebar from './components/Sidebar';
import ExplorerTab from './components/ExplorerTab';
import QueryTab from './components/QueryTab';
import VisualizeTab from './components/VisualizeTab';
import RelationshipsTab from './components/RelationshipsTab';
import { tables, scenarioList, visualPresets } from './constants/data.jsx';

const App = () => {
    const [activeTab, setActiveTab] = useState('query');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [generatedSql, setGeneratedSql] = useState('');
    const [previousSql, setPreviousSql] = useState('');
    const [tempRefinedSql, setTempRefinedSql] = useState('');
    const [isComparing, setIsComparing] = useState(false);
    const [refineExplanation, setRefineExplanation] = useState('');
    const [refineInstruction, setRefineInstruction] = useState('');
    const [queryResult, setQueryResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [visualizePrompt, setVisualizePrompt] = useState('');
    const [chartConfig, setChartConfig] = useState({ type: 'area', xAxis: 'obs_dt', yAxis: 'cur_lvl', title: '데이터 변화 실시간 분석' });
    const [aiInsight, setAiInsight] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isQuerySidebarOpen, setIsQuerySidebarOpen] = useState(false);
    const [sqlAudit, setSqlAudit] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [analysisReport, setAnalysisReport] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const [selectedTables, setSelectedTables] = useState(['tb_dam_info', 'tb_dam_obs_h']);
    const [tableSearchPrompt, setTableSearchPrompt] = useState('');
    const [isTableSearching, setIsTableSearching] = useState(false);
    const [joinRules, setJoinRules] = useState([{ id: 'r1', leftTable: 'tb_dam_info', leftCol: 'dam_cd', type: 'INNER JOIN', rightTable: 'tb_dam_obs_h', rightCol: 'dam_cd' }]);
    const [isRelationshipSearching, setIsRelationshipSearching] = useState(false);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key should be handled securely

    const getTableColumns = (tableId) => tables.find(t => t.id === tableId)?.columns || [];
    const currentChartData = useMemo(() => history.find(h => h.id === selectedHistoryId)?.results || queryResult, [history, selectedHistoryId, queryResult]);
    const availableColumns = useMemo(() => currentChartData?.length ? Object.keys(currentChartData[0]) : [], [currentChartData]);

    useEffect(() => {
        const item = history.find(h => h.id === selectedHistoryId);
        if (item) {
            setGeneratedSql(item.sql);
            setQueryResult(item.results);
            setPrompt(item.prompt);
        }
    }, [selectedHistoryId, history]);

    const callGemini = async (userQuery, systemPrompt, isJson = false) => {
        if (!apiKey) {
            console.warn("API Key is missing. Please set VITE_GEMINI_API_KEY in your environment.");
        }
        const maxRetries = 3;
        for (let i = 0; i < maxRetries; i++) {
            try {
                const payload = { contents: [{ parts: [{ text: userQuery }] }], systemInstruction: { parts: [{ text: systemPrompt }] } };
                if (isJson) payload.generationConfig = { responseMimeType: "application/json" };
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error('API Error');
                const result = await response.json();
                return result.candidates?.[0]?.content?.parts?.[0]?.text;
            } catch (error) { if (i === maxRetries - 1) throw error; await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i))); }
        }
    };

    const handleAiRelationshipSuggestion = async (targetTableIds = selectedTables) => {
        if (targetTableIds.length < 2) return;
        setIsRelationshipSearching(true);
        const tableContext = tables.filter(t => targetTableIds.includes(t.id)).map(t => `${t.id}: [${t.columns.join(', ')}]`).join('\n');
        try {
            const res = await callGemini(`스키마 분석:\n${tableContext}`, `JOIN 관계 제안 JSON: [{"leftTable": "ID", "leftCol": "KEY", "type": "INNER JOIN", "rightTable": "ID", "rightCol": "KEY"}]`, true);
            const data = JSON.parse(res);
            setJoinRules(data.map((s, i) => ({ ...s, id: `ai-${Date.now()}-${i}` })));
        } catch (e) {} finally { setIsRelationshipSearching(false); }
    };

    const handleAiTableSelection = async () => {
        if (!tableSearchPrompt) return;
        setIsTableSearching(true);
        try {
            const res = await callGemini(tableSearchPrompt, `관련 테이블 ID JSON 배열 응답. [tb_dam_info, tb_dam_obs_h, rf_stn_info, rf_obs_h]`, true);
            const newIds = JSON.parse(res);
            setSelectedTables(newIds);
            if (newIds.length >= 2) await handleAiRelationshipSuggestion(newIds);
            setTableSearchPrompt("");
        } catch (e) {} finally { setIsTableSearching(false); }
    };

    const handleGenerateSql = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setQueryResult(null);
        setIsComparing(false);
        const tableContext = tables.filter(t => selectedTables.includes(t.id)).map(t => `${t.name}(${t.id}): [${t.columns.join(',')}]`).join('\n');
        const manualJoins = joinRules.map(r => `${r.leftTable}.${r.leftCol} ${r.type} ${r.rightTable}.${r.rightCol}`).join('\n');
        try {
            const sql = await callGemini(prompt, `Pretty SQL 코드만 출력. 스키마:\n${tableContext}\n조인 가이드:\n${manualJoins}`);
            const cleanedSql = (sql || "").replace(/```sql|```/g, '').trim();
            setGeneratedSql(cleanedSql);
            const newItem = { id: Date.now(), prompt, sql: cleanedSql, timestamp: new Date().toLocaleTimeString(), results: null };
            setHistory(prev => [newItem, ...prev]);
            setSelectedHistoryId(newItem.id);
        } catch (e) {} finally { setIsGenerating(false); }
    };

    const handleRefineSql = async () => {
        if (!refineInstruction || !generatedSql) return;
        setIsRefining(true);
        try {
            const res = await callGemini(`[SQL] ${generatedSql}\n[요청] ${refineInstruction}`, `SQL 전문가. JSON: {"explanation": "이유", "refinedSql": "수정된SQL"}`, true);
            const data = JSON.parse(res);
            setPreviousSql(generatedSql);
            setTempRefinedSql(data.refinedSql);
            setRefineExplanation(data.explanation);
            setIsComparing(true);
            setRefineInstruction('');
        } catch (e) {} finally { setIsRefining(false); }
    };

    const handleExecuteQuery = async () => {
        if (!generatedSql) return;
        setIsExecuting(true);
        try {
            const res = await callGemini("데이터 시뮬레이션.", `질문 [${prompt}] 부합 수문 데이터 10행 JSON 배열 생성. 필드명 엄수: dam_nm, obs_dt, cur_lvl, inf_qty, otf_qty.`, true);
            const data = JSON.parse(res);
            setQueryResult(data);
            setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, results: data } : h));
        } catch (e) {
            const mock = Array.from({ length: 10 }).map((_, i) => ({ dam_nm: '샘플댐', obs_dt: `12-26 ${i}:00`, cur_lvl: 185.0 + i, inf_qty: 400.0, otf_qty: 300.0 }));
            setQueryResult(mock);
            setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, results: mock } : h));
        } finally { setIsExecuting(false); }
    };

    const handleVisualizeInsight = async () => {
        if (!currentChartData?.length || !visualizePrompt) return;
        setIsAnalyzing(true);
        setAnalysisReport('');
        try {
            const res = await callGemini(`요청: ${visualizePrompt}.`, `시각화 전문가. JSON 응답: {"chartType": "line|bar|area", "xAxis": "컬럼명", "yAxis": "컬럼명", "title": "제목", "insight": "해석"}`, true);
            const config = JSON.parse(res);
            setChartConfig({ type: config.chartType, xAxis: config.xAxis, yAxis: config.yAxis, title: config.title });
            setAiInsight(config.insight);
            setVisualizePrompt("");
        } catch (e) {} finally { setIsAnalyzing(false); }
    };

    const handleAuditSql = async () => {
        if (!generatedSql) return;
        setIsAuditing(true);
        try {
            const res = await callGemini(`진단:\n${generatedSql}`, `SQL 진단 전문가. JSON 응답: {"score": 0~100, "analysis": "요약", "suggestions": ["건의"]}`, true);
            setSqlAudit(JSON.parse(res));
        } catch (e) {} finally { setIsAuditing(false); }
    };

    const handleGenerateReport = async () => {
        if (!currentChartData) return;
        setIsGeneratingReport(true);
        try {
            const report = await callGemini(`데이터: ${JSON.stringify(currentChartData.slice(0, 10))}`, `K-water 분석가. 마크다운으로 실제 데이터 표를 포함한 경영진 전략 보고서 작성.`);
            setAnalysisReport(report);
        } catch (e) {} finally { setIsGeneratingReport(false); }
    };

    const handleDownloadExcel = () => {
        if (!queryResult?.length) return;
        const headers = Object.keys(queryResult[0]).join(',');
        const rows = queryResult.map(row => Object.values(row).map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `KWATER_EXPORT.csv`);
        document.body.appendChild(link); link.click(); document.body.removeChild(link);
    };

    const handleApplyRefinedSql = () => { setGeneratedSql(tempRefinedSql); setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, sql: tempRefinedSql } : h)); setIsComparing(false); setQueryResult(null); };
    const handleDiscardRefinedSql = () => { setIsComparing(false); setTempRefinedSql(''); };
    const updateJoinRule = (id, field, value) => setJoinRules(joinRules.map(r => r.id === id ? { ...r, [field]: value } : r));

    return (
        <div className="flex h-screen bg-[#0B0F1A] text-slate-400 font-sans overflow-hidden text-[11px] selection:bg-blue-500/30">
            <aside className="w-16 bg-black/40 backdrop-blur-3xl flex flex-col items-center py-6 gap-6 z-30 shrink-0 border-r border-white/5">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95 shadow-blue-900/20"><Droplets size={20} className="text-white" /></div>
                <nav className="flex flex-col gap-6">
                    <button onClick={() => setActiveTab('explorer')} className={`p-3 rounded-xl transition-all ${activeTab === 'explorer' ? 'bg-blue-500/10 text-blue-400 shadow-inner' : 'text-slate-600 hover:text-slate-300'}`} title="데이터 탐색"><Layers size={18} /></button>
                    <button onClick={() => setActiveTab('relationships')} className={`p-3 rounded-xl transition-all ${activeTab === 'relationships' ? 'bg-blue-500/10 text-blue-400 shadow-inner' : 'text-slate-600 hover:text-slate-300'}`} title="관계 설계"><GitMerge size={18} /></button>
                    <button onClick={() => setActiveTab('query')} className={`p-3 rounded-xl transition-all ${activeTab === 'query' ? 'bg-blue-500/10 text-blue-400 shadow-inner' : 'text-slate-600 hover:text-slate-300'}`} title="질의 생성"><MessageSquare size={18} /></button>
                    <button onClick={() => setActiveTab('visualize')} className={`p-3 rounded-xl transition-all ${activeTab === 'visualize' ? 'bg-blue-500/10 text-blue-400 shadow-inner' : 'text-slate-600 hover:text-slate-300'}`} title="시각화 분석"><BarChart2 size={18} /></button>
                </nav>
            </aside>

            <main className="flex-1 flex flex-col bg-[#0B0F1A] overflow-hidden">
                <header className="h-10 bg-white/[0.01] backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20 font-mono">
                    <div className="flex items-center gap-3 font-black text-white italic tracking-tighter uppercase opacity-80">K-WATER AI 플랫폼</div>
                    <div className="flex items-center gap-2 font-black text-slate-500 uppercase tracking-widest text-[8px]"><div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(59,130,246,1)]" /><span>{activeTab} active</span></div>
                </header>

                <div className="flex-1 overflow-hidden flex flex-col relative">
                    {activeTab === 'explorer' && (
                        <ExplorerTab 
                            tableSearchPrompt={tableSearchPrompt}
                            setTableSearchPrompt={setTableSearchPrompt}
                            handleAiTableSelection={handleAiTableSelection}
                            isTableSearching={isTableSearching}
                            selectedTables={selectedTables}
                            setSelectedTables={setSelectedTables}
                        />
                    )}

                    {activeTab === 'query' && (
                        <div className="flex h-full w-full overflow-hidden text-left relative">
                            <aside className={`bg-black/30 backdrop-blur-3xl border-r border-white/5 flex flex-col shrink-0 transition-all duration-500 relative ${isQuerySidebarOpen ? 'w-72' : 'w-0'}`}>
                                <div className={`overflow-hidden transition-opacity duration-300 h-full ${isQuerySidebarOpen ? 'opacity-100' : 'opacity-0 invisible'}`}>
                                    <Sidebar 
                                        history={history}
                                        selectedHistoryId={selectedHistoryId}
                                        setSelectedHistoryId={setSelectedHistoryId}
                                        activeTab={activeTab}
                                        setGeneratedSql={setGeneratedSql}
                                    />
                                </div>
                                <button onClick={() => setIsQuerySidebarOpen(!isQuerySidebarOpen)} className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg flex items-center justify-center shadow-xl active:scale-95 transition-all">
                                    {isQuerySidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                                </button>
                            </aside>

                            <QueryTab 
                                prompt={prompt}
                                setPrompt={setPrompt}
                                selectedTables={selectedTables}
                                handleGenerateSql={handleGenerateSql}
                                isGenerating={isGenerating}
                                generatedSql={generatedSql}
                                isComparing={isComparing}
                                handleAuditSql={handleAuditSql}
                                isAuditing={isAuditing}
                                handleExecuteQuery={handleExecuteQuery}
                                isExecuting={isExecuting}
                                sqlAudit={sqlAudit}
                                refineInstruction={refineInstruction}
                                setRefineInstruction={setRefineInstruction}
                                handleRefineSql={handleRefineSql}
                                isRefining={isRefining}
                                refineExplanation={refineExplanation}
                                handleApplyRefinedSql={handleApplyRefinedSql}
                                handleDiscardRefinedSql={handleDiscardRefinedSql}
                                previousSql={previousSql}
                                tempRefinedSql={tempRefinedSql}
                                queryResult={currentChartData}
                                handleDownloadExcel={handleDownloadExcel}
                                setActiveTab={setActiveTab}
                            />
                        </div>
                    )}

                    {activeTab === 'visualize' && (
                        <div className="flex h-full w-full overflow-hidden text-left relative">
                            <aside className={`bg-black/30 backdrop-blur-3xl border-r border-white/5 flex flex-col shrink-0 transition-all duration-500 relative ${isSidebarOpen ? 'w-72' : 'w-0'}`}>
                                <div className={`overflow-hidden transition-opacity duration-300 h-full ${isSidebarOpen ? 'opacity-100' : 'opacity-0 invisible'}`}>
                                    <Sidebar 
                                        history={history}
                                        selectedHistoryId={selectedHistoryId}
                                        setSelectedHistoryId={setSelectedHistoryId}
                                        activeTab={activeTab}
                                        setGeneratedSql={setGeneratedSql}
                                    />
                                </div>
                                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-6 h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-r-lg flex items-center justify-center shadow-xl active:scale-95 transition-all">
                                    {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                                </button>
                            </aside>

                            <VisualizeTab 
                                isAnalyzing={isAnalyzing}
                                isGeneratingReport={isGeneratingReport}
                                visualizePrompt={visualizePrompt}
                                setVisualizePrompt={setVisualizePrompt}
                                handleVisualizeInsight={handleVisualizeInsight}
                                currentChartData={currentChartData}
                                chartConfig={chartConfig}
                                setChartConfig={setChartConfig}
                                availableColumns={availableColumns}
                                handleGenerateReport={handleGenerateReport}
                                analysisReport={analysisReport}
                                aiInsight={aiInsight}
                            />
                        </div>
                    )}

                    {activeTab === 'relationships' && (
                        <RelationshipsTab 
                            handleAiRelationshipSuggestion={handleAiRelationshipSuggestion}
                            isRelationshipSearching={isRelationshipSearching}
                            joinRules={joinRules}
                            updateJoinRule={updateJoinRule}
                            getTableColumns={getTableColumns}
                        />
                    )}
                </div>
            </main>

            <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.7); }
          100% { transform: scaleX(1); }
        }
        .animate-progress {
          animation: progress 2s infinite ease-in-out;
        }
      `}</style>
        </div>
    );
};

export default App
