/**
 * This component displays the "Trends" tab, which includes weekly averages
 * and a daily timeline chart. It's a data-heavy component that does a lot
 * of calculations to visualize the baby's activity over time.
 */
import React, { useRef } from 'react';
import { Clock, Milk, Heart, Utensils, ChevronLeft, ChevronRight, Droplets } from 'lucide-react';
import { getRelativeDateLabel, formatTime, toSafeDate } from '../utils/helpers';

export function TrendsTab({
    weeklyAvgs,
    trendsChartData,
    selectedDayId,
    handleSelectDay,
    handleNavigateDay,
    selectedDayStats,
    isDarkMode,
    feedingIntervalsMap,
    setActiveTab,
    startEdit
}) {
    const timelineScrollRef = useRef(null);
    const isAutoScrollingRef = useRef(false);

    const handleTimelineScroll = () => {
        if (isAutoScrollingRef.current) return;
        const scrollLeft = timelineScrollRef.current.scrollLeft;
        const dayWidth = 960;
        const newDayIndex = Math.round(scrollLeft / dayWidth);
        const newDayId = trendsChartData[newDayIndex]?.id;
        if (newDayId && newDayId !== selectedDayId) {
            handleSelectDay(newDayId, false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 pb-12">
            <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <h3 className="text-xs font-black uppercase mb-4 opacity-50 tracking-widest">Weekoverzicht (Gemiddeld per dag)</h3>
                <div className="grid grid-cols-2 gap-2 mb-6">
                    {Number(weeklyAvgs.totalVoedingen) > 0 && (
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-emerald-900/20 text-white' : 'bg-emerald-50 text-slate-800'}`}>
                            <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                <Clock size={14} /><span className="text-[10px] font-black uppercase">Totaal Voedingen</span>
                            </div>
                            <p className="text-lg font-black">{weeklyAvgs.totalVoedingen}x</p>
                        </div>
                    )}
                    {Number(weeklyAvgs.flesCount) > 0 && (
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-indigo-900/20 text-white' : 'bg-indigo-50 text-slate-800'}`}>
                            <div className="flex items-center gap-2 text-indigo-500 mb-1">
                                <Milk size={14} /><span className="text-[10px] font-black uppercase">Fles</span>
                            </div>
                            <p className="text-lg font-black">{weeklyAvgs.flesCount}x <span className="text-[10px] font-bold opacity-50">({weeklyAvgs.flesAmount}ml)</span></p>
                        </div>
                    )}
                    {Number(weeklyAvgs.borstCount) > 0 && (
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-pink-900/20 text-white' : 'bg-pink-50 text-slate-800'}`}>
                            <div className="flex items-center gap-2 text-pink-500 mb-1">
                                <Heart size={14} /><span className="text-[10px] font-black uppercase">Borst ({weeklyAvgs.borstCount}x)</span>
                            </div>
                            <p className="text-xs font-black truncate mt-1">L:{weeklyAvgs.borstL}m | R:{weeklyAvgs.borstR}m</p>
                        </div>
                    )}
                    {Number(weeklyAvgs.vastCount) > 0 && (
                        <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-orange-900/20 text-white' : 'bg-orange-50 text-slate-800'}`}>
                            <div className="flex items-center gap-2 text-orange-500 mb-1">
                                <Utensils size={14} /><span className="text-[10px] font-black uppercase">Vast</span>
                            </div>
                            <p className="text-lg font-black">{weeklyAvgs.vastCount}x <span className="text-[10px] font-bold opacity-50">({weeklyAvgs.vastAmount}g)</span></p>
                        </div>
                    )}
                </div>
                <div className="flex items-end justify-between h-32 gap-2 border-t pt-4 border-slate-100 dark:border-slate-800 px-1">
                    {trendsChartData.map(day => {
                        const max = Math.max(...trendsChartData.map(d => d.ml), 500);
                        const isSelected = selectedDayId === day.id;
                        const hasData = day.items.length > 0;
                        const hPct = hasData ? Math.max(12, (day.ml / max) * 100) : 0;
                        return (
                            <div key={day.id} onClick={() => handleSelectDay(day.id)} className="flex-1 flex flex-col items-center gap-2 cursor-pointer group">
                                <div className="w-full flex justify-center items-end h-20">
                                    <div style={{ height: `${hPct}%` }} className={`w-3 sm:w-4 rounded-full transition-all duration-300 ${isSelected ? 'bg-indigo-600 shadow-lg' : (hasData ? (day.hasBreastfeeding ? 'bg-pink-400 dark:bg-pink-500/50' : 'bg-indigo-300 dark:bg-slate-700') : 'bg-slate-50 dark:bg-slate-900 opacity-20')}`} />
                                </div>
                                <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'opacity-40'}`}>{day.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {selectedDayId && (
                <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} overflow-hidden`}>
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-[10px] font-black uppercase opacity-50 tracking-widest">Dagtijdlijn</h4>
                        <div className="flex gap-2">
                            <button onClick={() => handleNavigateDay(-1)} className="p-1 active:scale-90 transition-transform"><ChevronLeft size={18} /></button>
                            <button onClick={() => handleNavigateDay(1)} className="p-1 active:scale-90 transition-transform"><ChevronRight size={18} /></button>
                        </div>
                    </div>

                    {selectedDayStats && (
                        <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
                            <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[5rem] ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                                <div className="flex items-center gap-1.5 mb-1 opacity-50"><Droplets size={12} /><span className="text-[9px] font-black uppercase">Luiers</span></div>
                                <div className="text-xs font-black">{selectedDayStats.plas}x <span className="opacity-40 font-normal">/</span> {selectedDayStats.poep}x💩</div>
                            </div>
                            {selectedDayStats.fles.count > 0 && (
                                <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[6rem] ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                    <div className="flex items-center gap-1.5 mb-1 opacity-80"><Milk size={12} /><span className="text-[9px] font-black uppercase">Fles ({selectedDayStats.fles.count}x)</span></div>
                                    <div className="text-xs font-black">{selectedDayStats.fles.total}ml <span className="opacity-60 font-bold text-[9px]">~{selectedDayStats.fles.avg}/k</span></div>
                                </div>
                            )}
                            {selectedDayStats.borst.count > 0 && (
                                <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[7rem] ${isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
                                    <div className="flex items-center gap-1.5 mb-1 opacity-80"><Heart size={12} /><span className="text-[9px] font-black uppercase">Borst ({selectedDayStats.borst.count}x)</span></div>
                                    <div className="text-xs font-black">L:{selectedDayStats.borst.totL}m R:{selectedDayStats.borst.totR}m</div>
                                    <div className="text-[9px] font-bold opacity-60">~ L:{selectedDayStats.borst.avgL}m R:{selectedDayStats.borst.avgR}m</div>
                                </div>
                            )}
                            {selectedDayStats.vast.count > 0 && (
                                <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[6rem] ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                    <div className="flex items-center gap-1.5 mb-1 opacity-80"><Utensils size={12} /><span className="text-[9px] font-black uppercase">Vast ({selectedDayStats.vast.count}x)</span></div>
                                    <div className="text-xs font-black">{selectedDayStats.vast.total}g <span className="opacity-60 font-bold text-[9px]">~{selectedDayStats.vast.avg}/k</span></div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="overflow-x-auto overflow-y-hidden custom-scrollbar h-[220px]" ref={timelineScrollRef} onScroll={handleTimelineScroll} style={{ touchAction: 'pan-x' }}>
                        <div className="flex relative h-full" style={{ width: `${trendsChartData.length * 960}px` }}>
                            {trendsChartData.map((day, idx) => {
                                const bgClass = day.id === selectedDayId
                                    ? (isDarkMode ? 'bg-slate-800/80' : 'bg-indigo-50/80')
                                    : (idx % 2 === 0 ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-200/60') : (isDarkMode ? 'bg-slate-950' : 'bg-slate-50'));

                                return (
                                    <div key={day.id} className={`relative w-[960px] h-full transition-colors ${bgClass}`}>
                                        <div className={`sticky top-0 left-0 inline-block px-4 py-2 font-black text-[10px] text-indigo-500 uppercase tracking-widest z-20 backdrop-blur-md rounded-br-xl ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'}`}>
                                            {getRelativeDateLabel(day.id)}
                                        </div>

                                        {[...Array(25)].map((_, h) => (
                                            <div key={h} className="absolute top-0 h-full border-l border-slate-100 dark:border-slate-800 flex flex-col justify-end pb-8" style={{ left: `${(h / 24) * 100}%` }}>
                                                {h % 6 === 0 && <span className="text-[9px] font-black opacity-30 -translate-x-1/2">{h}:00</span>}
                                            </div>
                                        ))}

                                        {day.items.filter(f => (Number(f.amount) || Number(f.amountLeft) + Number(f.amountRight) > 0)).map(f => {
                                            const date = toSafeDate(f.timestamp);
                                            const pos = ((date.getHours() * 60 + date.getMinutes()) / 1440) * 100;
                                            const isB = f.feedType === 'Borst';
                                            const amt = Number(f.amount) || (Number(f.amountLeft || 0) + Number(f.amountRight || 0)) || 0;
                                            const col = f.feedType === 'Vast' ? 'bg-orange-600' : (isB ? 'bg-pink-500' : 'bg-indigo-600');
                                            const interval = feedingIntervalsMap[f.id];

                                            if (isB) {
                                                const barW = Math.max(1.5, (amt / 1440) * 100);
                                                return (
                                                    <div key={f.id} onDoubleClick={() => { setActiveTab('log'); startEdit(f); }} className="absolute z-10 flex flex-col items-center cursor-pointer group" style={{ left: `${pos}%`, bottom: '2.5rem', width: `${barW}%` }}>
                                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center z-50">
                                                            {interval && <span className={`text-[6px] font-black mb-0.5 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>+{interval}</span>}
                                                            <div className="bg-pink-600 text-white text-[8px] font-black px-1 rounded whitespace-nowrap shadow-sm">{amt}m</div>
                                                        </div>
                                                        <div className={`h-2.5 w-full rounded-full ${col} shadow-sm border border-white/20`} />
                                                        <span className="text-[7px] font-black mt-1 opacity-50 whitespace-nowrap">{formatTime(f.timestamp)}</span>
                                                    </div>
                                                );
                                            } else {
                                                const barH = Math.min(50, (amt / 160) * 50);
                                                return (
                                                    <div key={f.id} onDoubleClick={() => { setActiveTab('log'); startEdit(f); }} className="absolute z-10 flex flex-col items-center cursor-pointer" style={{ left: `${pos}%`, bottom: '2.5rem', width: '40px', transform: 'translateX(-50%)' }}>
                                                        <div className="flex flex-col items-center mb-1">
                                                            {interval && <span className={`text-[6px] font-black mb-0.5 whitespace-nowrap ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>+{interval}</span>}
                                                            <div className={`px-1.5 py-0.5 rounded-md text-white font-black text-[8px] shadow-sm ${col}`}>{amt}{f.feedType === 'Vast' ? 'g' : 'ml'}</div>
                                                        </div>
                                                        <div className={`w-2.5 rounded-full ${col} shadow-sm`} style={{ height: `${barH}px` }} />
                                                        <span className="text-[7px] font-black mt-1 opacity-50">{formatTime(f.timestamp)}</span>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
