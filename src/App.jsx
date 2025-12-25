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
    const [activeTab, setActiveTab] = useState('explorer');
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExecuting, setIsExecuting] = useState(false);
    const [isRefining, setIsRefining] = useState(false);
    const [generatedSql, setGeneratedSql] = useState('');
    const [previousSql, setPreviousSql] = useState('');
    const [tempRefinedSql, setTempRefinedSql] = useState('');
    const [isComparing, setIsComparing] = useState(false);
    const [originalSqlBeforeFix, setOriginalSqlBeforeFix] = useState('');
    const [refineExplanation, setRefineExplanation] = useState('');
    const [refineInstruction, setRefineInstruction] = useState('');
    const [queryResult, setQueryResult] = useState(null);
    const [history, setHistory] = useState([]);
    const [analysisHistory, setAnalysisHistory] = useState([
        { id: 'sample-1', prompt: '소양강댐 수위 변동 분석', summary: '소양강댐 수위 변동' },
        { id: 'sample-2', prompt: '저수율 90% 이상 댐 현황', summary: '고저수율 댐 현황' },
        { id: 'sample-3', prompt: '최근 일주일 강수량 순위', summary: '주간 강수량 순위' }
    ]);
    const [selectedHistoryId, setSelectedHistoryId] = useState(null);
    const [visualizePrompt, setVisualizePrompt] = useState('');
    const [chartConfig, setChartConfig] = useState({ type: 'area', xAxis: 'obs_dt', yAxis: 'cur_lvl', title: '데이터 변화 실시간 분석' });
    const [aiInsight, setAiInsight] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isQuerySidebarOpen, setIsQuerySidebarOpen] = useState(true);
    const [sqlAudit, setSqlAudit] = useState(null);
    const [isAuditing, setIsAuditing] = useState(false);
    const [analysisReport, setAnalysisReport] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);
    const [executionError, setExecutionError] = useState(null);
    const [isSelfHealing, setIsSelfHealing] = useState(false);
    const [pendingFixedSql, setPendingFixedSql] = useState('');
    const [fixedSqlExplanation, setFixedSqlExplanation] = useState('');
    const [successfulRetryCount, setSuccessfulRetryCount] = useState(0);
    const [generationSteps, setGenerationSteps] = useState([]);
    const [currentStepIndex, setCurrentStepIndex] = useState(-1);

    const [selectedTables, setSelectedTables] = useState([]);
    const [tableSearchPrompt, setTableSearchPrompt] = useState('');
    const [isTableSearching, setIsTableSearching] = useState(false);
    const [joinRules, setJoinRules] = useState([]);
    const [isRelationshipSearching, setIsRelationshipSearching] = useState(false);
    const [scenarios, setScenarios] = useState(scenarioList);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ""; // API Key should be handled securely

    const getTableColumns = (tableId) => tables.find(t => t.id === tableId)?.columns || [];
    const currentChartData = useMemo(() => history.find(h => h.id === selectedHistoryId)?.results || queryResult, [history, selectedHistoryId, queryResult]);
    const availableColumns = useMemo(() => currentChartData?.length ? Object.keys(currentChartData[0]) : [], [currentChartData]);

    useEffect(() => {
        // 테이블 선택 변경에 따른 JOIN 규칙 자동 동기화
        setJoinRules(prev => {
            // 1. 선택 해제된 테이블과 관련된 규칙 제거
            let updatedRules = prev.filter(rule => 
                selectedTables.includes(rule.leftTable) && selectedTables.includes(rule.rightTable)
            );

            // 2. 새롭게 추가된 테이블에 대해 가능한 관계 자동 생성
            selectedTables.forEach(t1Id => {
                selectedTables.forEach(t2Id => {
                    if (t1Id === t2Id) return;

                    // 이미 관계가 정의되어 있는지 확인
                    const exists = updatedRules.some(r => 
                        (r.leftTable === t1Id && r.rightTable === t2Id) || 
                        (r.leftTable === t2Id && r.rightTable === t1Id)
                    );
                    if (exists) return;

                    const t1 = tables.find(t => t.id === t1Id);
                    const t2 = tables.find(t => t.id === t2Id);
                    if (!t1 || !t2) return;

                    // 공통 컬럼 찾기 (예: dam_cd, stn_cd, obs_dt 등)
                    const commonCols = t1.columns.filter(c => t2.columns.includes(c) && (c.endsWith('_cd') || c.endsWith('_id')));
                    
                    if (commonCols.length > 0) {
                        updatedRules.push({
                            id: `auto-${t1Id}-${t2Id}`,
                            leftTable: t1Id,
                            leftCol: commonCols[0],
                            type: 'INNER JOIN',
                            rightTable: t2Id,
                            rightCol: commonCols[0]
                        });
                    }
                });
            });

            return [...updatedRules];
        });
    }, [selectedTables]);

    useEffect(() => {
        const item = history.find(h => h.id === selectedHistoryId);
        if (item) {
            setGeneratedSql(item.sql);
            setQueryResult(item.results);
            setPrompt(item.prompt);
        }
    }, [selectedHistoryId, history]);

    const callGemini = async (userQuery, systemPrompt, isJson = false) => {
        // API 호출 대신 샘플 데이터를 반환하는 시뮬레이션 모드로 전환
        console.log("Running in Simulation Mode (No API Key used)");
        await new Promise(r => setTimeout(r, 800)); // 실제 AI처럼 약간의 지연 시간

        // 1. SQL 진단 (Audit) 요청인 경우
        if (systemPrompt.includes("SQL 진단 전문가")) {
            return JSON.stringify({
                score: 92,
                analysis: "작성된 쿼리는 인덱스를 효율적으로 사용하며 표준 SQL 문법을 준수하고 있습니다.",
                suggestions: ["JOIN 성능 최적화를 위한 조건 추가", "가독성 향상을 위한 별칭 사용 권장"]
            });
        }

        // 2. JOIN 관계 제안 요청인 경우
        if (systemPrompt.includes("JOIN 관계 제안")) {
            return JSON.stringify([
                { leftTable: "tb_dam_info", leftCol: "dam_cd", type: "INNER JOIN", rightTable: "tb_dam_obs_h", rightCol: "dam_cd" }
            ]);
        }

        // 3. 테이블 선택 요청인 경우
        if (systemPrompt.includes("관련 테이블 ID JSON")) {
            if (userQuery.includes("강수")) return JSON.stringify(["rf_stn_info", "rf_obs_h"]);
            if (userQuery.includes("수질")) return JSON.stringify(["tb_dam_info", "wq_obs_h"]);
            if (userQuery.includes("운영") || userQuery.includes("발전")) return JSON.stringify(["tb_dam_info", "tb_dam_op_h"]);
            if (userQuery.includes("유역")) return JSON.stringify(["tb_basin_info"]);
            return JSON.stringify(["tb_dam_info", "tb_dam_obs_h"]);
        }

        // 4. SQL 정교화 (Refine) 요청인 경우
        if (systemPrompt.includes("SQL 전문가. JSON")) {
            return JSON.stringify({
                explanation: "요청하신 필터 조건을 추가하고 시간 정렬을 최적화했습니다.",
                refinedSql: "SELECT t1.dam_nm AS '댐명', t2.obs_dt AS '관측일시', t2.cur_lvl AS '현재수위'\nFROM tb_dam_info t1\nJOIN tb_dam_obs_h t2 ON t1.dam_cd = t2.dam_cd\nWHERE t1.dam_nm LIKE '%댐%'\nORDER BY t2.obs_dt DESC\nLIMIT 10;"
            });
        }

        // 5. 데이터 시뮬레이션 요청인 경우
        if (systemPrompt.includes("데이터 시뮬레이션")) {
            const mockData = Array.from({ length: 50 }).map((_, i) => ({
                '댐명': i % 2 === 0 ? '소양강댐' : '충주댐',
                '관측일시': `2025-12-26 ${String(Math.floor(i/2)).padStart(2, '0')}:00`,
                '현재수위': 185.0 + (Math.random() * 5),
                '유입량': 400.0 + (Math.random() * 100),
                '방류량': 300.0 + (Math.random() * 50)
            }));
            return JSON.stringify(mockData);
        }

        // 6. 시각화 인사이트 요청인 경우
        if (systemPrompt.includes("시각화 전문가")) {
            return JSON.stringify({
                chartType: "area",
                xAxis: "관측일시",
                yAxis: "현재수위",
                title: "시간대별 수위 변동 추이",
                insight: "최근 12시간 동안 수위가 완만하게 상승하는 추세이며, 임계치 도달까지 여유가 있습니다."
            });
        }

        // 7. 보고서 생성 요청인 경우
        if (systemPrompt.includes("경영진 전략 보고서")) {
            return "# K-WATER 수문 데이터 분석 보고서\n\n## 1. 분석 개요\n본 보고서는 현재 주요 댐의 수위 및 유입량을 기반으로 전략적 의사결정을 지원하기 위해 작성되었습니다.\n\n| 댐 이름 | 평균 수위 | 최대 유입량 | 상태 |\n| :--- | :--- | :--- | :--- |\n| 소양강댐 | 187.5m | 520.0 | 정상 |\n| 충주댐 | 142.2m | 480.0 | 주의 |\n\n## 2. 주요 통찰\n- **소양강댐**의 유입량이 전주 대비 15% 증가했습니다.\n- **방류량 조절**을 통해 하류 수위를 안정적으로 유지 중입니다.\n\n## 3. 향후 권고 사항\n- 집중호우 대비 예비 방류 검토 필요.\n- 실시간 모니터링 강화.";
        }

        // 8. 기본 SQL 생성 요청 (마지막 순서)
        if (userQuery.includes("강수") || userQuery.includes("기상")) {
            return "SELECT \n  t1.stn_nm AS '관측소명', \n  t2.obs_dt AS '관측일시', \n  t2.hr_rf AS '시강수량', \n  t2.acc_rf AS '누적강수량', \n  t3.warn_type AS '특보종류', \n  t3.warn_lvl AS '특보등급'\nFROM rf_stn_info t1\nJOIN rf_obs_h t2 ON t1.stn_cd = t2.stn_cd\nLEFT JOIN wt_warn_h t3 ON t1.stn_cd = t3.stn_cd AND t2.obs_dt BETWEEN t3.start_dt AND t3.end_dt\nWHERE t2.hr_rf > 0\nORDER BY t2.obs_dt DESC\nLIMIT 10;";
        }

        if (userQuery.includes("수질") || userQuery.includes("BOD")) {
            return "SELECT \n  t1.dam_nm AS '댐명', \n  t2.obs_dt AS '측정일시', \n  t2.temp AS '수온', \n  t2.ph AS '수소이온농도', \n  t2.bod AS 'BOD', \n  t2.cod AS 'COD'\nFROM tb_dam_info t1\nJOIN wq_obs_h t2 ON t1.dam_cd = t2.dam_cd\nWHERE t2.bod > 2.0\nORDER BY t2.obs_dt DESC\nLIMIT 10;";
        }

        return "SELECT \n  t1.dam_nm AS '댐명', \n  t2.obs_dt AS '관측일시', \n  t2.cur_lvl AS '현재수위', \n  t2.inf_qty AS '유입량', \n  t2.otf_qty AS '방류량', \n  t3.rsv_rate AS '저수율'\nFROM tb_dam_info t1\nJOIN tb_dam_obs_h t2 ON t1.dam_cd = t2.dam_cd\nLEFT JOIN tb_dam_op_h t3 ON t1.dam_cd = t3.dam_cd AND t2.obs_dt = t3.obs_dt\nORDER BY t2.obs_dt DESC\nLIMIT 10;";
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

    const handleAiTableSelection = async (overridePrompt) => {
        const targetPrompt = overridePrompt || tableSearchPrompt;
        if (!targetPrompt) return;
        setIsTableSearching(true);
        try {
            // "랜덤" 또는 "random" 키워드가 포함된 경우에만 랜덤 선택 유지
            if (targetPrompt.includes('랜덤') || targetPrompt.includes('random')) {
                const shuffled = [...tables].sort(() => 0.5 - Math.random());
                const count = Math.floor(Math.random() * 3) + 2; // 2~4개
                const newIds = shuffled.slice(0, count).map(t => t.id);
                setSelectedTables(newIds);
                if (newIds.length >= 2) await handleAiRelationshipSuggestion(newIds);
                setTableSearchPrompt("");
                return;
            }

            const tableContext = tables.map(t => `${t.id}: ${t.name} - ${t.description} (${t.columns.join(', ')})`).join('\n');
            const res = await callGemini(
                `사용자 요청: ${targetPrompt}\n\n사용 가능한 테이블 정보:\n${tableContext}`, 
                `관련 테이블 ID JSON: 사용자 요청과 가장 관련이 높은 테이블들을 위 목록에서 선택하여 ID들을 JSON 배열로 응답하세요. 예: ["tb_dam_info", "tb_dam_obs_h"]`, 
                true
            );
            const newIds = JSON.parse(res);
            if (Array.isArray(newIds)) {
                setSelectedTables(newIds);
                if (newIds.length >= 2) await handleAiRelationshipSuggestion(newIds);
            }
            setTableSearchPrompt("");
        } catch (e) {
            console.error("Table selection error:", e);
        } finally { setIsTableSearching(false); }
    };

    const handleGenerateSql = async () => {
        if (!prompt) return;
        setIsGenerating(true);
        setQueryResult(null);
        setSelectedHistoryId(null); // 새로운 SQL 생성 시 기존 선택된 히스토리 초기화
        setIsComparing(false);
        setSqlAudit(null);

        // AI 추론 단계 정의
        const steps = [
            { 
                id: 1, 
                label: "질문 분석", 
                detail: "자연어 질의의 의도 및 핵심 키워드 추출", 
                icon: "search",
                data: {
                    keywords: ["댐", "수위", "변동", "분석", "최근 24시간"],
                    expanded: [
                        "최근 24시간 동안의 시간별 수위 데이터 조회",
                        "선택된 댐(소양강, 충주)에 대한 필터링 조건 생성",
                        "시간 흐름에 따른 변동 추이 계산 준비"
                    ]
                }
            },
            { 
                id: 2, 
                label: "메타데이터 로딩", 
                detail: "선택된 테이블 및 컬럼 정의 분석", 
                icon: "database",
                data: {
                    tables: [
                        { name: "tb_dam_info", comment: "댐의 기본 마스터 정보 (이름, 하천명 등)" },
                        { name: "tb_dam_obs_h", comment: "댐의 시간대별 수위 및 유입/방류량 관측 데이터" }
                    ]
                }
            },
            { 
                id: 3, 
                label: "스키마 관계 매핑", 
                detail: "JOIN 규칙 및 데이터 계보 확인", 
                icon: "git-merge",
                data: {
                    mapping: "tb_dam_info.dam_cd = tb_dam_obs_h.dam_cd (1:N 관계)",
                    joinType: "INNER JOIN"
                }
            },
            { 
                id: 4, 
                label: "쿼리 실행 계획 수립", 
                detail: "SQL 구조 설계 및 최적화 전략", 
                icon: "brain-circuit",
                data: {
                    strategy: "Index scan on obs_dt",
                    optimization: "Column-wise aggregation for performance"
                }
            },
            { 
                id: 5, 
                label: "SQL 구문 합성", 
                detail: "Dialect 최적화 및 최종 구문 생성", 
                icon: "code",
                data: {
                    dialect: "Standard SQL",
                    formatting: "Pretty Print with AS Aliases"
                }
            }
        ];
        setGenerationSteps(steps);
        setCurrentStepIndex(0);

        const tableContext = tables.filter(t => selectedTables.includes(t.id)).map(t => {
            const colsWithNames = t.columns.map(c => `${c}(${t.columnNames[c] || ''})`).join(',');
            return `${t.name}(${t.id}): [${colsWithNames}]`;
        }).join('\n');
        const manualJoins = joinRules.map(r => `${r.leftTable}.${r.leftCol} ${r.type} ${r.rightTable}.${r.rightCol}`).join('\n');
        
        try {
            // 단계별 시뮬레이션
            for (let i = 0; i < steps.length; i++) {
                setCurrentStepIndex(i);
                await new Promise(r => setTimeout(r, 600));
            }

            const sql = await callGemini(prompt, `Pretty SQL 코드만 출력. 
            [제약사항] 모든 SELECT 컬럼에는 반드시 'AS'를 사용하여 한글 별칭을 붙이세요. 예: SELECT t1.dam_nm AS '댐명'
            스키마:
            ${tableContext}
            조인 가이드:
            ${manualJoins}`);
            const cleanedSql = (sql || "").replace(/```sql|```/g, '').trim();
            setGeneratedSql(cleanedSql);
            
            const timestamp = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
            
            // 사이드바 전용 검색 히스토리
            const newHistoryItem = { 
                id: Date.now(), 
                prompt, 
                sql: cleanedSql, 
                timestamp, 
                results: null 
            };
            
            // 상단 카드 전용 요약 히스토리 (중복 제거 및 최신화)
            const newAnalysisItem = {
                id: Date.now() + 1,
                prompt,
                summary: prompt.length > 20 ? prompt.substring(0, 20) + "..." : prompt
            };

            setHistory(prev => [newHistoryItem, ...prev]);
            setAnalysisHistory(prev => {
                const filtered = prev.filter(item => item.prompt !== prompt);
                return [newAnalysisItem, ...filtered].slice(0, 10);
            });
            
            setSelectedHistoryId(newHistoryItem.id);
            // setCurrentStepIndex(-1); // 완료 후에도 상태를 유지하기 위해 주석 처리하거나 제거
            setCurrentStepIndex(steps.length - 1); // 마지막 단계 완료 상태로 유지
        } catch (e) {
            setCurrentStepIndex(-1);
        } finally { setIsGenerating(false); }
    };

    const handleRefineSql = async () => {
        if (!refineInstruction || !generatedSql) return;
        setIsRefining(true);
        setSqlAudit(null);
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
        
        // 시뮬레이션을 위한 에러 트리거 조건 (정확히 이 질문일 때만)
        const isErrorScenario = prompt.trim() === '최근 일주일 강수량 순위';
        
        setIsExecuting(true);
        setExecutionError(null);
        setPendingFixedSql('');
        setFixedSqlExplanation('');
        
        try {
            // 특정 시나리오에서만 의도적으로 에러 발생
            if (isErrorScenario && !successfulRetryCount && !originalSqlBeforeFix) {
                await new Promise(r => setTimeout(r, 600)); // 지연 효과
                throw new Error(`[데이터베이스 응답 오류]: 'RSV_RATE' 컬럼을 찾을 수 없습니다. (ORA-00904)`);
            }

            const res = await callGemini("데이터 시뮬레이션", `질문 [${prompt}] 부합 수문 데이터 50행 JSON 배열 생성. 필드명 엄수: dam_nm, obs_dt, cur_lvl, inf_qty, otf_qty.`, true);
            let data;
            try {
                data = JSON.parse(res);
            } catch (parseError) {
                // JSON 파싱 실패 시 기본 데이터 생성
                data = Array.from({ length: 50 }).map((_, i) => ({
                    '댐명': i % 2 === 0 ? '소양강댐' : '충주댐',
                    '관측일시': `2025-12-26 ${String(Math.floor(i/2)).padStart(2, '0')}:00`,
                    '현재수위': 185.0 + (Math.random() * 5),
                    '유입량': 400.0 + (Math.random() * 100),
                    '방류량': 300.0 + (Math.random() * 50)
                }));
            }
            
            setQueryResult(data);
            setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, results: data } : h));
            
            setSuccessfulRetryCount(prev => prev + 1);
            setIsExecuting(false);
            setIsSelfHealing(false);
        } catch (e) {
            const errorMsg = e.message || "쿼리 실행 중 알 수 없는 오류가 발생했습니다.";
            console.error("Query Execution Error:", errorMsg);
            
            setExecutionError(errorMsg);
            setQueryResult(null);
            setIsExecuting(false);
            
            // 자동 재시도 대신 AI에게 수정 요청
            handleSelfHealSql();
        }
    };

    const handleSelfHealSql = async () => {
        if (!generatedSql || !executionError) {
            setIsSelfHealing(false);
            return;
        }
        setIsSelfHealing(true);
        
        try {
            const tableContext = tables.filter(t => selectedTables.includes(t.id)).map(t => {
                const colsWithNames = t.columns.map(c => `${c}(${t.columnNames[c] || ''})`).join(',');
                return `${t.name}(${t.id}): [${colsWithNames}]`;
            }).join('\n');

            const res = await callGemini(
                `[SQL] ${generatedSql}\n[오류 메시지] ${executionError}\n[사용 가능 스키마]\n${tableContext}`, 
                `SQL 복구 전문가. 발생한 오류를 분석하여 올바른 SQL로 수정하세요. JSON 응답: {"explanation": "오류 원인 및 수정 내용", "fixedSql": "수정된SQL"}`, 
                true
            );
            const data = JSON.parse(res);
            
            // 즉시 적용하지 않고 승인 대기 상태로 설정
            setPendingFixedSql(data.fixedSql);
            setFixedSqlExplanation(data.explanation);
            
            setIsSelfHealing(false);

        } catch (e) {
            setExecutionError("AI 복구 시도 중 오류가 발생했습니다: " + e.message);
            setIsSelfHealing(false);
        }
    };

    useEffect(() => {
        if (selectedHistoryId) {
            const item = history.find(h => h.id === selectedHistoryId);
            if (item) {
                setGeneratedSql(item.sql || '');
                setOriginalSqlBeforeFix(item.originalSql || '');
                setSuccessfulRetryCount(item.retryCount || 0);
                setQueryResult(item.results || null);
                setPrompt(item.prompt || '');
            }
        }
    }, [selectedHistoryId]);

    const handleApplyFixedSql = () => {
        if (!pendingFixedSql) return;
        
        const fixedSql = pendingFixedSql;
        const originalSql = generatedSql;
        setOriginalSqlBeforeFix(originalSql); // 수정 전 쿼리 저장
        setGeneratedSql(fixedSql);
        setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, sql: fixedSql, originalSql: originalSql, retryCount: (h.retryCount || 0) + 1 } : h));
        
        // 상태 초기화
        setPendingFixedSql('');
        setFixedSqlExplanation('');
        setExecutionError(null);
        
        // 수정된 쿼리로 재실행
        handleExecuteQuery();
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

    const handleApplyRefinedSql = () => { setGeneratedSql(tempRefinedSql); setHistory(prev => prev.map(h => h.id === selectedHistoryId ? { ...h, sql: tempRefinedSql } : h)); setIsComparing(false); setQueryResult(null); setSqlAudit(null); };
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
                                originalSqlBeforeFix={originalSqlBeforeFix}
                                queryResult={currentChartData}
                                executionError={executionError}
                                isSelfHealing={isSelfHealing}
                                handleSelfHealSql={handleSelfHealSql}
                                pendingFixedSql={pendingFixedSql}
                                fixedSqlExplanation={fixedSqlExplanation}
                                handleApplyFixedSql={handleApplyFixedSql}
                                handleDownloadExcel={handleDownloadExcel}
                                setActiveTab={setActiveTab}
                                successfulRetryCount={successfulRetryCount}
                                scenarios={scenarios}
                                setScenarios={setScenarios}
                                history={history}
                                selectedHistoryId={selectedHistoryId}
                                setSelectedHistoryId={setSelectedHistoryId}
                                generationSteps={generationSteps}
                                currentStepIndex={currentStepIndex}
                                analysisHistory={analysisHistory}
                                successfulRetryCount={successfulRetryCount}
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
