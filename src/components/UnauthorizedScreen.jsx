/**
 * This component is shown when a user is logged in but doesn't have an account
 * associated with the app yet. It provides instructions on how to gain access.
 */
import React from 'react';
import { AlertTriangle, Copy } from 'lucide-react';
import { getAuth, signOut } from 'firebase/auth';

export function UnauthorizedScreen({ user, isDarkMode, onRetry }) {
    const showToast = (msg) => {
        const toastEl = document.createElement('div');
        toastEl.className = "fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-full duration-500";
        toastEl.innerHTML = `<div class="px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${isDarkMode ? 'bg-indigo-900 border-indigo-500' : 'bg-indigo-600 border-indigo-500'} text-white"><span class="font-black text-[11px] uppercase tracking-widest">${msg}</span></div>`;
        document.body.appendChild(toastEl);
        setTimeout(() => document.body.removeChild(toastEl), 3500);
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 text-center font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            <div className={`p-8 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-4 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <AlertTriangle className="text-orange-500 mx-auto" size={48} />
                <h1 className="text-lg font-black uppercase tracking-tight">Access Required</h1>
                <p className="text-xs opacity-60">To use this app, you must be invited by an existing account owner. Please provide them with your User ID to request access. If you are the first user, click "Create Account".</p>
                <div className="text-xs p-3 rounded-lg bg-slate-100 dark:bg-slate-800 break-all flex items-center justify-between">
                    <code>{user.uid}</code>
                    <button onClick={() => navigator.clipboard.writeText(user.uid).then(() => showToast('UID Copied!'))} className="p-2 active:scale-90 transition-transform"><Copy size={14} /></button>
                </div>
                <button onClick={onRetry} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                    Create Account / Retry
                </button>
                <button onClick={() => signOut(getAuth())} className="w-full py-3 text-xs text-slate-500 font-bold uppercase">
                    Sign Out
                </button>
            </div>
        </div>
    );
}
