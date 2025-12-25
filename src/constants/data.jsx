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
    { 
        id: 'tb_dam_info', 
        name: '댐 시설물 정보', 
        description: '댐의 기본 마스터 정보 (댐 이름, 하천명, 수위 기준 등)', 
        columns: ['dam_cd', 'dam_nm', 'riv_nm', 'normal_lvl', 'flood_lvl', 'limit_lvl'],
        columnNames: { 'dam_cd': '댐코드', 'dam_nm': '댐명', 'riv_nm': '하천명', 'normal_lvl': '상시만수위', 'flood_lvl': '계획홍수위', 'limit_lvl': '제한수위' }
    },
    { 
        id: 'tb_dam_obs_h', 
        name: '댐 관측(시간별)', 
        description: '댐의 시간대별 수위 및 유입/방류량 관측 데이터', 
        columns: ['dam_cd', 'obs_dt', 'cur_lvl', 'inf_qty', 'otf_qty', 'tot_otf_qty'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'cur_lvl': '현재수위', 'inf_qty': '유입량', 'otf_qty': '방류량', 'tot_otf_qty': '총방류량' }
    },
    { 
        id: 'tb_dam_op_h', 
        name: '댐 운영(시간별)', 
        description: '댐의 저수량, 저수율, 발전량 및 방류 정보', 
        columns: ['dam_cd', 'obs_dt', 'rsv_qty', 'rsv_rate', 'gen_qty', 'spill_qty'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'rsv_qty': '저수량', 'rsv_rate': '저수율', 'gen_qty': '발전량', 'spill_qty': '수문방류량' }
    },
    { 
        id: 'rf_stn_info', 
        name: '강수 관측소 정보', 
        description: '강수량 관측소의 위치 및 소속 정보', 
        columns: ['stn_cd', 'stn_nm', 'basin_nm', 'office_nm', 'lat', 'lon'],
        columnNames: { 'stn_cd': '관측소코드', 'stn_nm': '관측소명', 'basin_nm': '유역명', 'office_nm': '관할지소', 'lat': '위도', 'lon': '경도' }
    },
    { 
        id: 'rf_obs_h', 
        name: '강수 관측(시간별)', 
        description: '관측소별 시간/일/누적 강수량 데이터', 
        columns: ['stn_cd', 'obs_dt', 'hr_rf', 'day_rf', 'acc_rf'],
        columnNames: { 'stn_cd': '관측소코드', 'obs_dt': '관측일시', 'hr_rf': '시강수량', 'day_rf': '일강수량', 'acc_rf': '누적강수량' }
    },
    { 
        id: 'wq_obs_h', 
        name: '수질 측정(일별)', 
        description: '댐별 수질 측정 데이터 (온도, PH, DO, BOD 등)', 
        columns: ['dam_cd', 'obs_dt', 'temp', 'ph', 'do', 'bod', 'cod', 'ss', 'tn', 'tp'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '측정일시', 'temp': '수온', 'ph': '수소이온농도', 'do': '용존산소', 'bod': '생물학적산소요구량', 'cod': '화학적산소요구량', 'ss': '부유물질', 'tn': '총질소', 'tp': '총인' }
    },
    { 
        id: 'wt_warn_h', 
        name: '기상 특보 이력', 
        description: '기상청 발령 기상 특보(주의보/경보) 이력 데이터', 
        columns: ['warn_id', 'stn_cd', 'warn_type', 'warn_lvl', 'start_dt', 'end_dt'],
        columnNames: { 'warn_id': '특보ID', 'stn_cd': '관측소코드', 'warn_type': '특보종류', 'warn_lvl': '특보등급', 'start_dt': '발효일시', 'end_dt': '해제일시' }
    },
    { 
        id: 'tb_basin_info', 
        name: '유역 기본 정보', 
        description: '유역별 명칭, 면적, 평균 강수량 정보', 
        columns: ['basin_cd', 'basin_nm', 'area_km2', 'avg_rf_mm'],
        columnNames: { 'basin_cd': '유역코드', 'basin_nm': '유역명', 'area_km2': '면적', 'avg_rf_mm': '평균강수량' }
    },
    { 
        id: 'dm_dam_stat_d', 
        name: '댐별 일일 집계 마트', 
        description: '댐별 주요 수문 지표의 일일 통계 및 집계 데이터', 
        columns: ['dam_cd', 'obs_date', 'avg_lvl', 'max_inf', 'sum_otf', 'avg_rsv_rate'], 
        isMart: true,
        columnNames: { 'dam_cd': '댐코드', 'obs_date': '관측일자', 'avg_lvl': '평균수위', 'max_inf': '최대유입량', 'sum_otf': '합계방류량', 'avg_rsv_rate': '평균저수율' }
    },
    { 
        id: 'dm_basin_rf_m', 
        name: '유역별 월간 강수 마트', 
        description: '유역 단위의 월별 평균 강수량 및 평년 대비 분석 데이터', 
        columns: ['basin_cd', 'obs_month', 'avg_rf', 'normal_rf', 'rf_ratio'], 
        isMart: true,
        columnNames: { 'basin_cd': '유역코드', 'obs_month': '관측월', 'avg_rf': '평균강수량', 'normal_rf': '평년강수량', 'rf_ratio': '강수비율' }
    },
    { 
        id: 'tb_dam_safety', 
        name: '댐 안전 점검 이력', 
        description: '정기/정밀 안전 점검 결과 및 등급 정보', 
        columns: ['dam_cd', 'insp_dt', 'insp_type', 'grade', 'opinion'],
        columnNames: { 'dam_cd': '댐코드', 'insp_dt': '점검일자', 'insp_type': '점검종류', 'grade': '점검등급', 'opinion': '종합의견' }
    },
    { 
        id: 'tb_hydro_power', 
        name: '수력 발전 실적', 
        description: '시간별/일별 수력 발전량 및 효율 지표', 
        columns: ['dam_cd', 'obs_dt', 'gen_qty', 'gen_time', 'efficiency'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'gen_qty': '발전량', 'gen_time': '발전시간', 'efficiency': '발전효율' }
    },
    { 
        id: 'tb_gate_status', 
        name: '수문 개폐 상태', 
        description: '댐 수문별 개방 상태 및 방류량 정보', 
        columns: ['dam_cd', 'gate_no', 'open_dt', 'open_height', 'discharge'],
        columnNames: { 'dam_cd': '댐코드', 'gate_no': '수문번호', 'open_dt': '개방일시', 'open_height': '개방높이', 'discharge': '수문방류량' }
    },
    { 
        id: 'tb_water_supply', 
        name: '용수 공급 현황', 
        description: '생활/공업/농업용수 공급량 실적', 
        columns: ['dam_cd', 'obs_dt', 'target_nm', 'supply_qty', 'supply_type'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'target_nm': '공급대상명', 'supply_qty': '공급량', 'supply_type': '용수타입' }
    },
    { 
        id: 'tb_evap_obs', 
        name: '증발량 관측 데이터', 
        description: '지점별 일일 증발량 및 기상 요소', 
        columns: ['stn_cd', 'obs_dt', 'evap_qty', 'temp', 'humidity'],
        columnNames: { 'stn_cd': '관측소코드', 'obs_dt': '관측일시', 'evap_qty': '증발량', 'temp': '기온', 'humidity': '습도' }
    },
    { 
        id: 'tb_sediment_obs', 
        name: '퇴사량 관측 정보', 
        description: '댐 저수지 내 퇴사 깊이 및 부유사 농도', 
        columns: ['dam_cd', 'obs_dt', 'sed_depth', 'ss_conc'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'sed_depth': '퇴사깊이', 'ss_conc': '부유사농도' }
    },
    { 
        id: 'tb_facility_maint', 
        name: '시설물 유지보수 기록', 
        description: '주요 수문 시설 점검 및 수리 이력', 
        columns: ['faci_id', 'maint_dt', 'maint_type', 'cost', 'worker'],
        columnNames: { 'faci_id': '시설물ID', 'maint_dt': '보수일자', 'maint_type': '보수종류', 'cost': '보수비용', 'worker': '작업자' }
    },
    { 
        id: 'tb_eco_monitor', 
        name: '생태계 모니터링', 
        description: '댐 주변 어류 및 조류 출현 현황', 
        columns: ['dam_cd', 'obs_dt', 'species_nm', 'count', 'location'],
        columnNames: { 'dam_cd': '댐코드', 'obs_dt': '관측일시', 'species_nm': '종명', 'count': '개체수', 'location': '관측위치' }
    },
    { 
        id: 'tb_land_use', 
        name: '상류 토지 이용 현황', 
        description: '댐 상류 유역별 토지 피복 분류 정보', 
        columns: ['basin_cd', 'land_type', 'area_sqm', 'update_dt'],
        columnNames: { 'basin_cd': '유역코드', 'land_type': '토지이용유형', 'area_sqm': '면적', 'update_dt': '갱신일자' }
    },
    { 
        id: 'tb_remote_sensing', 
        name: '원격 탐사 위성 이미지', 
        description: '위성 기반 수위 및 녹조 탐지 데이터', 
        columns: ['img_id', 'obs_dt', 'sensor_type', 'index_val', 'coord'],
        columnNames: { 'img_id': '이미지ID', 'obs_dt': '촬영일시', 'sensor_type': '센서종류', 'index_val': '탐지수치', 'coord': '좌표' }
    },
    { 
        id: 'tb_flood_warning', 
        name: '홍수 예보 발령 기록', 
        description: '하천별 홍수 주의보/경보 발령 이력', 
        columns: ['riv_nm', 'warn_lvl', 'issue_dt', 'expire_dt', 'max_lvl'],
        columnNames: { 'riv_nm': '하천명', 'warn_lvl': '특보등급', 'issue_dt': '발령일시', 'expire_dt': '해제일시', 'max_lvl': '최대수위' }
    },
    { 
        id: 'tb_water_rights', 
        name: '수리권 허가 현황', 
        description: '하천수 취수 허가량 및 이용 주체 정보', 
        columns: ['river_cd', 'user_nm', 'permit_qty', 'purpose', 'expire_dt'],
        columnNames: { 'river_cd': '하천코드', 'user_nm': '이용자명', 'permit_qty': '허가량', 'purpose': '이용목적', 'expire_dt': '만료일자' }
    },
];

export const tableRecommendations = [
    { label: "댐 운영 현황 분석", prompt: "댐 운영 및 관측 데이터 보여줘" },
    { label: "강수량 및 기상특보", prompt: "강수 관측 및 기상 특보 데이터 검색해줘" },
    { label: "수질 및 환경 모니터링", prompt: "댐 수질 측정 데이터 찾아줘" },
    { label: "유역별 수문 통계", prompt: "유역 정보와 강수량 데이터 선택해줘" }
];
