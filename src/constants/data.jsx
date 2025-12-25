import React from 'react';
import { Trophy, TrendingUp, ArrowDownUp, AlertCircle } from 'lucide-react';

export const visualPresets = [
    { id: 'rank', label: '상위 TOP 10 순위 분석', prompt: '선택된 데이터에서 주요 측정값을 기준으로 상위 10개 항목의 랭킹을 막대 차트로 시각화하고 요약 표를 보여줘', icon: <Trophy size={12} /> },
    { id: 'trend', label: '시간별 변동 추이 가시화', prompt: '선택된 관측 데이터의 시간 흐름에 따른 변동 양상을 영역 차트로 구성하고 추세를 분석해줘', icon: <TrendingUp size={12} /> },
    { id: 'compare', label: '지표 간 상관성 비교', prompt: '서로 다른 두 지표를 하나의 차트에 배치하여 상관관계를 비교 시각화해줘', icon: <ArrowDownUp size={12} /> },
    { id: 'risk', label: '임계치 기반 위험 식별', prompt: '제한 수위 대비 현재 상태의 근접 위험도를 분석하고 경고가 필요한 항목을 지능형 차트로 보여줘', icon: <AlertCircle size={12} /> }
];

export const scenarioList = [
    { title: "최근 24시간 수위 변동", prompt: "지난 24시간 동안 소양강댐과 충주댐의 수위 변화 비교 분석" },
    { title: "위험 수위 도달 분석", prompt: "현재 수위가 제한 수위(limit_lvl) 95% 이상인 댐 현황" },
    { title: "강수량-유입량 상관관계", prompt: "최근 일주일간의 관측소 강수량과 주요 댐 유입량 상관관계" },
    { title: "전국 댐 저수율 현황", prompt: "전국 다목적댐 현재 저수율 계산 리스트" }
];

export const tables = [
    { id: 'tb_dam_info', name: '댐 시설물 정보', columns: ['dam_cd', 'dam_nm', 'riv_nm', 'normal_lvl', 'flood_lvl', 'limit_lvl'] },
    { id: 'tb_dam_obs_h', name: '댐 관측(시간별)', columns: ['dam_cd', 'obs_dt', 'cur_lvl', 'inf_qty', 'otf_qty'] },
    { id: 'rf_stn_info', name: '강수 관측소 정보', columns: ['stn_cd', 'stn_nm', 'basin_nm', 'office_nm'] },
    { id: 'rf_obs_h', name: '강수 관측(시간별)', columns: ['stn_cd', 'obs_dt', 'hr_rf', 'day_rf', 'acc_rf'] },
];
