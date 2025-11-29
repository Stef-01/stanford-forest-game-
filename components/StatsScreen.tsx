
import React, { useState } from 'react';
import { CityStats, Mission, SchoolType, StatCategory } from '../types';
import { BUILDINGS, CAMPAIGN_GOAL } from '../constants';

interface StatsScreenProps {
    stats: CityStats;
    completedGoals: string[];
    onClose: () => void;
}

const RadarChart = ({
    data,
    labels,
    color = "#f59e0b",
    maxVal = 100
}: {
    data: number[],
    labels: string[],
    color?: string,
    maxVal?: number
}) => {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const sides = labels.length;
    const step = (Math.PI * 2) / sides;

    // Helper to calculate coordinates
    const getCoords = (value: number, index: number, max: number) => {
        const angle = index * step - Math.PI / 2; // Start at top
        const r = (Math.min(value, max) / max) * radius;
        return {
            x: center + r * Math.cos(angle),
            y: center + r * Math.sin(angle)
        };
    };

    // Calculate points for the data polygon
    const points = data.map((val, i) => {
        const { x, y } = getCoords(val, i, maxVal);
        return `${x},${y}`;
    }).join(" ");

    // Generate grid rings
    const rings = [0.25, 0.5, 0.75, 1.0];

    return (
        <div className="flex flex-col items-center justify-center p-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                {/* Background Grid */}
                {rings.map((r, ri) => (
                    <polygon
                        key={ri}
                        points={labels.map((_, i) => {
                            const { x, y } = getCoords(maxVal * r, i, maxVal);
                            return `${x},${y}`;
                        }).join(" ")}
                        fill="none"
                        stroke="#44403c" // stone-700
                        strokeWidth="1"
                    />
                ))}

                {/* Axis Lines */}
                {labels.map((_, i) => {
                    const { x, y } = getCoords(maxVal, i, maxVal);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={x}
                            y2={y}
                            stroke="#44403c"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                <polygon
                    points={points}
                    fill={color}
                    fillOpacity="0.4"
                    stroke={color}
                    strokeWidth="2"
                />

                {/* Labels */}
                {labels.map((label, i) => {
                    const angle = i * step - Math.PI / 2;
                    const labelRadius = radius + 25;
                    const x = center + labelRadius * Math.cos(angle);
                    const y = center + labelRadius * Math.sin(angle);
                    return (
                        <text
                            key={i}
                            x={x}
                            y={y}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#d6d3d1" // stone-300
                            fontSize="10"
                            fontWeight="bold"
                            className="uppercase tracking-widest"
                        >
                            {label}
                        </text>
                    );
                })}

                {/* Values */}
                {data.map((val, i) => {
                    const { x, y } = getCoords(val, i, maxVal);
                    return (
                        <circle key={i} cx={x} cy={y} r="3" fill="white" />
                    )
                })}
            </svg>
        </div>
    );
};

const OKRSection = ({ stats }: { stats: CityStats }) => {

    // Calculate Campaign Years
    const currentYear = Math.floor(stats.day / 365) + 1;
    const prevYear = currentYear - 1;
    const progressFactor = currentYear / 10; // 10 Year Campaign
    const prevProgressFactor = Math.max(0, (currentYear - 1) / 10);

    // Helper for formatting
    const format = (val: number, unit: string) => {
        if (unit === '$') {
            if (val >= 1000000000) return `$${(val / 1000000000).toFixed(2)}B`;
            if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
            if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
            return `$${val}`;
        }
        return `${Math.floor(val)}${unit}`;
    };

    // Define Data with Year Logic
    const STRATEGIC_PLAN = [
        {
            objective: "Global Impact",
            rows: [
                {
                    kr: "Academic Reputation",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Academic,
                    prevActual: Math.floor(stats.metrics.Academic * 0.9)
                },
                {
                    kr: "Entrepreneurial Output",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Entrepreneurial,
                    prevActual: Math.floor(stats.metrics.Entrepreneurial * 0.85)
                },
                {
                    kr: "AI Leadership",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.AI,
                    prevActual: Math.floor(stats.metrics.AI * 0.8)
                }
            ]
        },
        {
            objective: "Community & Values",
            rows: [
                {
                    kr: "Campus Culture",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Culture,
                    prevActual: Math.floor(stats.metrics.Culture * 0.9)
                },
                {
                    kr: "Equity & Access",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Equity,
                    prevActual: Math.floor(stats.metrics.Equity * 0.9)
                },
                {
                    kr: "Climate Action",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Climate,
                    prevActual: Math.floor(stats.metrics.Climate * 0.85)
                }
            ]
        },
        {
            objective: "Operational Strength",
            rows: [
                {
                    kr: "Donor Engagement",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Donor,
                    prevActual: Math.floor(stats.metrics.Donor * 0.9)
                },
                {
                    kr: "Execution Speed",
                    finalTarget: 100,
                    unit: "",
                    current: stats.metrics.Execution,
                    prevActual: Math.floor(stats.metrics.Execution * 0.9)
                }
            ]
        }
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-stone-800/50 p-6 rounded-lg border border-stone-700 flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-serif font-bold text-amber-100 mb-2">FY {2024 + currentYear - 1} Objectives & Key Results</h3>
                    <p className="text-stone-400 text-sm italic max-w-2xl">
                        "Tracking progress against the 10-Year Strategic Plan for the University. Focusing on research density, student welfare, and financial independence."
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Current Period</div>
                    <div className="text-xl font-mono font-bold text-white">Year {currentYear} of 10</div>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-stone-700 shadow-xl">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-stone-900 text-stone-400 uppercase tracking-wider text-xs border-b border-stone-700">
                            <th className="py-4 px-6 font-bold w-1/3">Objective</th>
                            <th className="py-4 px-6 font-bold w-1/3">Key Results (KRs)</th>
                            <th className="py-4 px-4 font-bold text-right text-stone-500 w-[10%]">
                                {2023 + currentYear - 1}<br />Actual
                            </th>
                            <th className="py-4 px-4 font-bold text-right text-amber-500/80 w-[10%]">
                                {2024 + currentYear - 1}<br />Goal
                            </th>
                            <th className="py-4 px-4 font-bold text-right text-white w-[10%]">
                                {2024 + currentYear - 1}<br />Actual
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-stone-950 divide-y divide-stone-800">
                        {STRATEGIC_PLAN.map((obj, i) => (
                            <React.Fragment key={i}>
                                {obj.rows.map((row, rIndex) => {
                                    // Calculate targets based on linear progression of campaign
                                    const yearGoal = Math.floor(row.finalTarget * progressFactor);

                                    // Status Check
                                    const performance = row.current / (yearGoal || 1); // Avoid div by 0
                                    let statusColor = "text-white";
                                    let bgStatus = "bg-transparent";

                                    if (performance >= 1.0) {
                                        statusColor = "text-green-400";
                                        bgStatus = "bg-green-900/10";
                                    } else if (performance >= 0.8) {
                                        statusColor = "text-yellow-400";
                                        bgStatus = "bg-yellow-900/10";
                                    } else {
                                        statusColor = "text-red-400";
                                        bgStatus = "bg-red-900/10";
                                    }

                                    return (
                                        <tr key={`${i}-${rIndex}`} className={`hover:bg-stone-900/50 transition-colors ${bgStatus}`}>
                                            {/* Objective Header - Merged Cell logic simulated visually */}
                                            {rIndex === 0 && (
                                                <td rowSpan={obj.rows.length} className="py-4 px-6 align-top border-r border-stone-800/50">
                                                    <div className="font-serif font-bold text-lg text-stone-200 mb-1">{obj.objective}</div>
                                                    <div className="text-xs text-stone-500 uppercase tracking-widest">Priority {i + 1}</div>
                                                </td>
                                            )}

                                            <td className="py-4 px-6 border-r border-stone-800/50">
                                                <div className="font-medium text-stone-300">{row.kr}</div>
                                                {/* Mini Progress Bar */}
                                                <div className="h-1 w-full bg-stone-800 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className={`h-full ${performance >= 1 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                        style={{ width: `${Math.min(100, (row.current / row.finalTarget) * 100)}%` }}
                                                    />
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 text-right font-mono text-stone-500">
                                                {prevYear > 0 ? format(row.prevActual, row.unit) : '-'}
                                            </td>
                                            <td className="py-4 px-4 text-right font-mono text-amber-200/70 font-bold bg-amber-900/5">
                                                {format(yearGoal, row.unit)}
                                            </td>
                                            <td className={`py-4 px-4 text-right font-mono font-black ${statusColor}`}>
                                                {format(row.current, row.unit)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center text-xs text-stone-500 font-mono mt-4">
                <div className="p-2 border border-stone-800 rounded bg-stone-900/30">
                    STATUS: <span className="text-green-400">● On Track</span>
                </div>
                <div className="p-2 border border-stone-800 rounded bg-stone-900/30">
                    STATUS: <span className="text-yellow-400">● At Risk</span>
                </div>
                <div className="p-2 border border-stone-800 rounded bg-stone-900/30">
                    STATUS: <span className="text-red-400">● Behind</span>
                </div>
            </div>
        </div>
    )
}

const StatsScreen: React.FC<StatsScreenProps> = ({ stats, completedGoals, onClose }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'okr'>('overview');

    const statLabels: StatCategory[] = ['Academic', 'Entrepreneurial', 'Donor', 'Climate', 'AI', 'Culture', 'Equity', 'Execution'];
    const statData = statLabels.map(l => stats.metrics[l]);

    const schoolLabels: SchoolType[] = ['Engineering', 'Medicine', 'Business', 'Law', 'Humanities', 'Sustainability', 'Education'];
    const schoolData = schoolLabels.map(l => stats.schools[l]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-6xl h-[90vh] bg-stone-950 rounded-2xl border border-stone-700 shadow-2xl flex flex-col overflow-hidden">

                {/* Header */}
                <div className="p-6 bg-stone-900 border-b border-stone-800 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-3xl font-serif font-black text-amber-100">Campus Analytics</h2>
                        <p className="text-stone-400 text-sm mt-1 uppercase tracking-widest">Office of the President</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors font-bold text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-stone-800 bg-stone-900/50 shrink-0">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all
                            ${activeTab === 'overview' ? 'bg-stone-950 text-amber-400 border-t-2 border-amber-400' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}
                        `}
                    >
                        📊 Metrics & Schools
                    </button>
                    <button
                        onClick={() => setActiveTab('okr')}
                        className={`flex-1 py-4 text-sm font-bold uppercase tracking-widest transition-all
                            ${activeTab === 'okr' ? 'bg-stone-950 text-blue-400 border-t-2 border-blue-400' : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900'}
                        `}
                    >
                        🎯 Strategic OKRs
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-stone-950">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                            {/* Overall Stats */}
                            <div className="flex flex-col items-center bg-stone-900/30 rounded-2xl border border-stone-800 p-6">
                                <h3 className="text-xl font-bold text-stone-200 mb-4 uppercase tracking-wide border-b border-stone-800 pb-2 w-full text-center">
                                    Core Indicators
                                </h3>
                                <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                                    <RadarChart
                                        labels={statLabels}
                                        data={statData}
                                        color="#fbbf24" // amber-400
                                        maxVal={100}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-2 w-full mt-4">
                                    {statLabels.map((l, i) => (
                                        <div key={i} className="text-center bg-stone-900/50 p-2 rounded">
                                            <div className="text-[10px] text-stone-500 uppercase">{l}</div>
                                            <div className="text-lg font-mono font-bold text-amber-100">{Math.floor(statData[i])}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Discipline Stats */}
                            <div className="flex flex-col items-center bg-stone-900/30 rounded-2xl border border-stone-800 p-6">
                                <h3 className="text-xl font-bold text-stone-200 mb-4 uppercase tracking-wide border-b border-stone-800 pb-2 w-full text-center">
                                    School Performance
                                </h3>
                                <div className="flex-1 flex items-center justify-center w-full min-h-[300px]">
                                    <RadarChart
                                        labels={schoolLabels}
                                        data={schoolData}
                                        color="#38bdf8" // sky-400
                                        maxVal={100}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2 w-full mt-4">
                                    {schoolLabels.map((l, i) => (
                                        <div key={i} className="flex justify-between items-center bg-stone-900/50 px-3 py-2 rounded">
                                            <div className="text-xs text-stone-400 font-bold">{l}</div>
                                            <div className="text-sm font-mono font-bold text-sky-200">{Math.floor(schoolData[i])}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'okr' && (
                        <div className="max-w-5xl mx-auto pb-10">
                            <OKRSection stats={stats} />
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default StatsScreen;
