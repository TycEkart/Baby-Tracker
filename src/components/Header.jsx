/**
 * The Header component displays the top bar of the application.
 * It shows the current database status, provides navigation between tabs,
 * and includes a button to cancel editing.
 */
import React from 'react';
import { ArrowLeft, BarChart3, Settings, X } from 'lucide-react';

export function Header({ activeTab, setActiveTab, dbStatus, editingId, resetForm, isDarkMode }) {
    return (
        <header className={`px-4 py-3 sticky top-0 z-30 transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} backdrop-blur-md border-b flex justify-between items-center`}>
            <div className="flex items-center gap-2">
                {activeTab !== 'log' ? (
                    <button onClick={() => setActiveTab('log')} className="p-2 text-indigo-500 active:scale-95 transition-transform">
                        <ArrowLeft size={20} />
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-500 shadow-emerald-500/20 shadow-lg' : 'bg-red-400'}`} />
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Database</span>
                    </div>
                )}
            </div>
            <div className="flex items-center gap-2">
                {activeTab === 'log' && (
                    editingId ? (
                        <button onClick={() => resetForm()} className="bg-rose-500 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase active:scale-95">Annuleren</button>
                    ) : (
                        <>
                            <button onClick={() => setActiveTab('trends')} className={`p-2.5 rounded-full border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-white border-slate-100 text-indigo-600'} active:scale-90`}><BarChart3 size={20} /></button>
                            <button onClick={() => setActiveTab('settings')} className={`p-2.5 rounded-full shadow-sm border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-100 text-slate-500'} active:scale-90`}><Settings size={20} /></button>
                        </>
                    )
                )}
                {activeTab !== 'log' && <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{activeTab === 'trends' ? 'Tijdlijn' : 'Opties'}</span>}
            </div>
        </header>
    );
}
