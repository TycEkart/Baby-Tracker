/**
 * This component renders the list of all baby log entries.
 * It groups them by day and provides functionality to edit or delete entries.
 */
import React from 'react';
import { Heart, Milk, Utensils, Droplets, Sparkles, Baby, Clock, Trash2, Bath, Bed } from 'lucide-react';
import { getRelativeDateLabel, formatTime, getIntervalStyle, formatDuration, getDiffMinutes, toSafeDate } from '../utils/helpers';

// Helper to get the icon for a given category
const getCategoryIcon = (category) => {
    switch (category) {
        case 'Borst': return <Heart size={10} />;
        case 'Fles': return <Milk size={10} />;
        case 'Vast': return <Utensils size={10} />;
        case 'poep': return <Droplets size={10} />;
        case 'plas': return <Droplets size={10} />;
        case 'vitamins': return <Sparkles size={10} />;
        case 'bath': return <Bath size={10} />;
        case 'sleep': return <Bed size={10} />;
        default: return <Clock size={10} />;
    }
};

export function LogList({
    groupedLogsList,
    highlightedId,
    editingId,
    actionType,
    startEdit,
    setItemToDelete,
    isDarkMode,
    typeIntervals
}) {
    return (
        <div className="space-y-6 mt-8 pb-10">
            {groupedLogsList.map(group => (
                <div key={group.date} className="space-y-2">
                    <div className="flex items-center justify-between gap-3 py-2">
                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                        <div className="text-center">
                            <span className="font-bold uppercase text-slate-500">{getRelativeDateLabel(group.date)}</span>
                            <div className="opacity-70">
                                {group.totalFles > 0 && <span>{group.totalFles}ml fles </span>}
                                {group.totalBorst > 0 && <span>{group.totalBorst}m borst </span>}
                                {group.totalVast > 0 && <span>{group.totalVast}g vast</span>}
                            </div>
                        </div>
                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                    </div>
                    {group.items.map(log => {
                        const isT = highlightedId === log.id;
                        const isEditing = editingId === log.id;
                        const getBg = () => {
                            if (isEditing) return isDarkMode ? 'bg-indigo-900/30 border-indigo-500 ring-2 ring-indigo-500 shadow-lg shadow-indigo-500/20' : 'bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400 shadow-md shadow-indigo-500/10';
                            if (!isT) return isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100';
                            return actionType === 'save' ? (isDarkMode ? 'bg-emerald-900/50 ring-emerald-500 ring-2' : 'bg-emerald-50 ring-emerald-400 ring-2') : (isDarkMode ? 'bg-rose-900/50 ring-rose-500 ring-2' : 'bg-rose-50 ring-rose-400 ring-2');
                        };

                        const icons = [];
                        if (log.isSleep) icons.push(<Bed size={20} className="text-green-500" />);
                        if (log.feedType === 'Borst') icons.push(<Heart size={20} className="text-pink-500" />);
                        else if (log.feedType === 'Fles') icons.push(<Milk size={20} className="text-indigo-500" />);
                        else if (log.feedType === 'Vast') icons.push(<Utensils size={20} className="text-orange-500" />);

                        if (log.hasPlas || log.hasPoep) icons.push(<Droplets size={18} className={log.hasPoep ? 'text-amber-700' : 'text-yellow-400'} />);
                        if (log.vitamins?.d || log.vitamins?.k) icons.push(<Sparkles size={18} className="text-purple-500" />);
                        if (log.hasBath) icons.push(<Bath size={18} className="text-sky-500" />);
                        if (icons.length === 0) icons.push(<Baby size={20} className="text-slate-400" />);

                        const intervalArray = typeIntervals[log.id] || [];

                        const groupedIntervals = intervalArray.reduce((acc, interval) => {
                            if (!acc[interval.text]) {
                                acc[interval.text] = { ...interval, categories: [interval.category] };
                            } else {
                                acc[interval.text].categories.push(interval.category);
                            }
                            return acc;
                        }, {});

                        return (
                            <div key={log.id} id={`log-item-${log.id}`} onClick={() => startEdit(log)} className={`p-4 rounded-[1.8rem] border flex items-start gap-4 transition-all duration-700 cursor-pointer border-slate-100 dark:border-slate-800 ${getBg()}`}>
                                <div className={`flex flex-wrap items-center justify-center gap-1 p-3 rounded-2xl w-16 h-16 shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                    {icons.map((icon, idx) => <div key={idx} className="animate-in zoom-in duration-300">{icon}</div>)}
                                </div>
                                <div className="flex-1 min-w-0 flex justify-between items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <span className="font-black opacity-60">{formatTime(log.timestamp)}</span>
                                        <h3 className="font-black">
                                            {log.isSleep ? (
                                                log.sleepEndTime ? `Slaap: ${formatDuration(getDiffMinutes(log.timestamp, log.sleepEndTime))}` : 'Slaapt...'
                                            ) : log.feedType === 'Borst' ? `L: ${log.amountLeft}m | R: ${log.amountRight}m` : log.feedType ? `${log.amount}${log.feedType === 'Vast' ? 'g' : 'ml'} ${log.feedType}` : 'Gebeurtenis'}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-1">
                                            {log.feedType === 'Borst' && log.firstBreast && <div className="font-black uppercase text-pink-600 bg-pink-500/10 px-1.5 py-0.5 rounded-md">Start: {log.firstBreast}</div>}
                                            {log.hasPlas && <div className="font-black uppercase text-yellow-600">Plas</div>}
                                            {log.hasPoep && <div className="font-black uppercase text-amber-900">Poep</div>}
                                            {(log.vitamins?.d || log.vitamins?.k) && <div className="font-black uppercase text-purple-600">Vita: {log.vitamins.d ? 'D' : ''}{log.vitamins.k ? (log.vitamins.d ? '+K' : 'K') : ''}</div>}
                                            {log.hasBath && <div className="font-black uppercase text-sky-600">Bad</div>}
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="flex flex-col items-end gap-1">
                                            {Object.values(groupedIntervals).map((intervalObj, idx) => (
                                                <div key={idx} className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${getIntervalStyle(intervalObj.category, isDarkMode)}`}>
                                                    {intervalObj.categories.map((cat, i) => <div key={i}>{getCategoryIcon(cat)}</div>)}
                                                    <span className="font-black">{intervalObj.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <button onClick={(e) => { e.stopPropagation(); setItemToDelete(log.id); }} className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
