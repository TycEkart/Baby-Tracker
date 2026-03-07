/**
 * This file contains utility functions that are used throughout the application.
 * Separating these into their own file makes the main component cleaner and
 * allows these functions to be easily reused in other parts of the app if needed.
 */

export const isEveningTime = () => {
    const hour = new Date().getHours();
    return hour >= 19 || hour < 8;
};

export const toSafeDate = (input) => {
    if (!input) return new Date();
    if (typeof input === 'object' && input !== null && 'seconds' in input) {
        return new Date(input.seconds * 1000);
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
};

export const toLocalDateString = (dateInput) => {
    const d = toSafeDate(dateInput);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

export const formatTime = (date) => {
    return toSafeDate(date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTimeFull = (dateInput) => {
    const d = toSafeDate(dateInput);
    return `${d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}, ${formatTime(d)}`;
};

export const getRelativeDateLabel = (dateStr) => {
    const today = toLocalDateString(new Date());
    const yesterday = toLocalDateString(new Date(Date.now() - 86400000));
    if (dateStr === today) return "Vandaag";
    if (dateStr === yesterday) return "Gisteren";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
};

export const getDiffMinutes = (start, end) => {
    const s = toSafeDate(start).getTime();
    const e = toSafeDate(end).getTime();
    return Math.floor((e - s) / 60000);
};

export const formatDuration = (mins) => {
    if (mins < 0 || isNaN(mins)) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}u ${m}m` : `${m}m`;
};

export const getLocalDateTimeString = (date = new Date()) => {
    const d = toSafeDate(date);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
};

export const getIntervalStyle = (cat, isDark) => {
    switch(cat) {
        case 'Borst': return isDark ? 'text-pink-400 bg-pink-500/10 border-pink-500/20' : 'text-pink-600 bg-pink-50 border-pink-100';
        case 'Fles': return isDark ? 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' : 'text-indigo-600 bg-indigo-50 border-indigo-100';
        case 'Vast': return isDark ? 'text-orange-400 bg-orange-500/10 border-orange-500/20' : 'text-orange-600 bg-orange-50 border-orange-100';
        case 'poep': return isDark ? 'text-amber-400 bg-amber-500/10 border-amber-500/20' : 'text-amber-700 bg-amber-50 border-amber-100';
        case 'plas': return isDark ? 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20' : 'text-yellow-600 bg-yellow-50 border-yellow-100';
        case 'vitamins': return isDark ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-purple-600 bg-purple-50 border-purple-100';
        default: return 'text-slate-400 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
    }
};
