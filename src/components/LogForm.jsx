/**
 * This component contains the form for adding and editing baby logs.
 * It's a complex component with its own state for managing form inputs.
 * It receives many props from the main App component to handle state changes and submissions.
 */
import React, { useRef } from 'react';
import {
    Clock, Milk, Baby, Utensils, Heart, Plus, Minus, Droplets, Sparkles, Calendar
} from 'lucide-react';
import { formatDateTimeFull } from '../utils/helpers';
import { PoopIcon } from './PoopIcon';

export function LogForm({
    editingId,
    isDarkMode,
    lastFeedingLabel,
    dailyStats,
    handleSave,
    isSubmitting,
    isFormValid,
    feedType,
    setFeedType,
    handleFeedTypeToggle,
    visibleFeedTypes,
    timestamp,
    setTimestamp,
    adjustTime,
    firstBreast,
    setFirstBreast,
    amountLeft,
    setAmountLeft,
    amountRight,
    setAmountRight,
    amount,
    setAmount,
    hasPlas,
    setHasPlas,
    hasPoep,
    setHasPoep,
    hasVitamins,
    setHasVitamins,
    vitamins,
    setVitamins
}) {
    const dateTimeInputRef = useRef(null);

    const getButtonStyles = () => {
        if (editingId) {
            return { background: 'linear-gradient(to bottom right, #f59e0b, #ea580c)', boxShadow: '0 10px 15px -3px rgba(234, 88, 12, 0.2), 0 4px 6px -2px rgba(234, 88, 12, 0.1)' };
        }

        const colors = [];
        if (feedType === 'Borst') colors.push('#ec4899', '#db2777');
        if (feedType === 'Fles') colors.push('#6366f1', '#3b82f6');
        if (feedType === 'Vast') colors.push('#f97316', '#f59e0b');
        if (hasPlas) colors.push('#eab308');
        if (hasPoep) colors.push('#78350f');
        if (hasVitamins) colors.push('#9333ea');

        if (colors.length === 0) {
            return { background: 'linear-gradient(to bottom right, #6366f1, #8b5cf6)', boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.2), 0 4px 6px -2px rgba(139, 92, 246, 0.1)' };
        }
        if (colors.length === 1) {
            return { background: `linear-gradient(to bottom right, ${colors[0]}, ${colors[0]})` };
        }
        return { background: `linear-gradient(to bottom right, ${colors.join(', ')})` };
    };

    const [datePart, timePart] = formatDateTimeFull(timestamp).split(', ');

    return (
        <section className={`p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${editingId ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}>
            <div className="flex items-start justify-between gap-4 mb-6 px-1">
                <div className="flex items-center gap-2">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'}`}><Clock size={18} /></div>
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Laatste voeding</span>
                        <span className={`text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{lastFeedingLabel} geleden</span>
                    </div>
                </div>
                {dailyStats.feedCount > 0 && (
                    <div className="text-right">
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Vandaag</span>
                        <p className={`text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>
                            {dailyStats.feedCount} voedingen
                            {dailyStats.avgInterval && <span className="text-xs opacity-60"> (~{dailyStats.avgInterval})</span>}
                        </p>
                        <div className="text-xs opacity-70">
                            {dailyStats.totalFles > 0 && <span>{dailyStats.totalFles}ml fles </span>}
                            {dailyStats.totalBorst > 0 && <span>{dailyStats.totalBorst}m borst </span>}
                            {dailyStats.totalVast > 0 && <span>{dailyStats.totalVast}g vast</span>}
                        </div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="space-y-2">
                    <div className="grid grid-cols-4 gap-1.5 px-0.5">
                        {[{ label: '+1u', val: 60 }, { label: '+10m', val: 10 }, { label: '+5m', val: 5 }, { label: '+1m', val: 1 }
                        ].map((btn, idx) => (
                            <button key={idx} type="button" onClick={() => adjustTime(btn.val)} className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-600'}`}>{btn.label}</button>
                        ))}
                    </div>

                    <button type="button" onClick={() => dateTimeInputRef.current.showPicker()} className={`w-full text-center relative group overflow-hidden rounded-2xl border p-4 shadow-inner cursor-pointer ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'}`}>
                        <div className={`flex flex-col items-center justify-center pointer-events-none ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            <span className="text-xs font-semibold uppercase opacity-70">{datePart}</span>
                            <span className="text-3xl font-black">{timePart}</span>
                        </div>
                        <Calendar size={18} className="absolute top-3 right-3 text-indigo-500 opacity-50" />
                    </button>
                    <input ref={dateTimeInputRef} type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="hidden" />

                    <div className="grid grid-cols-4 gap-1.5 px-0.5">
                        {[{ label: '-1u', val: -60 }, { label: '-10m', val: -10 }, { label: '-5m', val: -5 }, { label: '-1m', val: -1 }
                        ].map((btn, idx) => (
                            <button key={idx} type="button" onClick={() => adjustTime(btn.val)} className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-600'}`}>{btn.label}</button>
                        ))}
                    </div>
                </div>

                <div className={`grid gap-2 ${visibleFeedTypes.length === 1 ? 'grid-cols-1' : visibleFeedTypes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {visibleFeedTypes.map(type => (
                        <button key={type.id} type="button" onClick={() => handleFeedTypeToggle(type.id)} className={`py-3.5 rounded-xl font-black text-[10px] uppercase border flex flex-col items-center justify-center gap-1 transition-all ${feedType === type.id ? `${type.activeColor} text-white border-transparent shadow-md` : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-100 border-transparent text-slate-500')}`}>
                            {type.icon}
                            {type.label}
                        </button>
                    ))}
                </div>

                {feedType && (
                    <div className="space-y-4 animate-in slide-in-from-top-2 overflow-hidden">
                        {feedType === 'Borst' ? (
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Startkant</span>
                                    <div className="flex gap-2">
                                        {['Links', 'Rechts'].map(side => (
                                            <button key={side} type="button" onClick={() => setFirstBreast(side)} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase border flex items-center justify-center gap-2 transition-all ${firstBreast === side ? 'bg-pink-500 text-white border-transparent shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-500')}`}>
                                                {firstBreast === side && <Heart size={12} fill="currentColor" />} {side} eerst
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[{ l: 'Links', v: amountLeft, s: setAmountLeft, side: 'Links' }, { l: 'Rechts', v: amountRight, s: setAmountRight, side: 'Rechts' }].map(b => (
                                        <div key={b.side} className="space-y-1.5 min-w-0">
                                            <div className="flex justify-between items-center px-1">
                                                <label className={`text-[10px] font-bold uppercase flex items-center gap-1 ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{b.l}</label>
                                                <span className="text-[9px] font-black uppercase text-pink-500">Minuten</span>
                                            </div>
                                            <div className={`flex items-center justify-between p-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                                                <button type="button" onClick={() => b.s(v => Math.max(0, Number(v) - 5))} className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm active:scale-90 transition-transform ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                                    <Minus size={14} />
                                                </button>
                                                <input type="number" value={b.v} onChange={(e) => b.s(e.target.value)} className={`w-full text-center font-black text-xl bg-transparent border-0 focus:ring-0 p-0 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
                                                <button type="button" onClick={() => b.s(v => Number(v) + 5)} className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-sm active:scale-90 transition-transform ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2 w-full">
                                <div className="flex justify-between px-1">
                                    <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Hoeveelheid</span>
                                    <span className={`text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{feedType === 'Vast' ? 'Gram' : 'Milliliter'}</span>
                                </div>
                                <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 rounded-2xl border ${isDarkMode ? 'dark:border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'} overflow-hidden`}>
                                    <button type="button" onClick={() => setAmount(v => Math.max(0, Number(v) - 10))} className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl shadow-sm active:scale-95 transition-transform ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                        <Minus size={22} />
                                    </button>
                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className={`flex-1 text-center font-black text-3xl bg-transparent border-0 focus:ring-0 p-0 min-w-0 ${isDarkMode ? 'text-white' : 'text-slate-800'}`} />
                                    <button type="button" onClick={() => setAmount(v => Number(v) + 10)} className={`w-14 h-14 shrink-0 flex items-center justify-center rounded-xl shadow-sm active:scale-95 transition-transform ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                                        <Plus size={22} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                        <button type="button" onClick={() => setHasPlas(!hasPlas)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasPlas ? 'bg-yellow-400 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-100 border-transparent text-slate-500')}`}>
                            <Droplets size={14} /> Plas
                        </button>
                        <button type="button" onClick={() => setHasPoep(!hasPoep)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasPoep ? 'bg-amber-900 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-100 border-transparent text-slate-500')}`}>
                            <PoopIcon className="w-3.5 h-3.5" /> Poep
                        </button>
                        <button type="button" onClick={() => setHasVitamins(!hasVitamins)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasVitamins ? 'bg-purple-600 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-100 border-transparent text-slate-500')}`}>
                            <Sparkles size={14} /> Vita
                        </button>
                    </div>
                    {hasVitamins && (
                        <div className="flex gap-2 animate-in slide-in-from-top-2 duration-300">
                            <button type="button" onClick={() => setVitamins(v => ({ ...v, d: !v.d }))} className={`flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase border ${vitamins.d ? 'bg-purple-500 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400')}`}>Vitamine D</button>
                            <button type="button" onClick={() => setVitamins(v => ({ ...v, k: !v.k }))} className={`flex-1 py-2.5 rounded-xl font-black text-[9px] uppercase border ${vitamins.k ? 'bg-purple-500 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200 text-slate-400')}`}>Vitamine K</button>
                        </div>
                    )}
                </div>

                <button type="submit" disabled={isSubmitting || !isFormValid} style={getButtonStyles()} className={`w-full py-4.5 rounded-2xl text-white font-black uppercase text-sm shadow-lg active:scale-[0.98] transition-all ${isSubmitting || !isFormValid ? 'bg-slate-300 shadow-none grayscale opacity-50' : ''}`}>
                    {isSubmitting ? 'Bezig...' : (editingId ? 'Wijziging Opslaan' : 'Gebeurtenis Loggen')}
                </button>
            </form>
        </section>
    );
}
