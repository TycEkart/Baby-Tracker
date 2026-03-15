/**
 * This component renders the "Settings" tab, allowing users to configure
 * various aspects of the application, such as theme, visibility of feeding types,
 * vitamin requirements, and data import/export.
 */
import React from 'react';
import {
    Moon, Sun, Eye, ShieldCheck, Database, Download, Upload, ArrowRight, Users, Plus, LogOut, Bath, CaseSensitive
} from 'lucide-react';

export function SettingsTab({
    isDarkMode,
    toggleDarkMode,
    fontSize,
    onFontSizeChange,
    visibilitySettings,
    toggleVisibility,
    vitRequirements,
    toggleRequirement,
    bathGoal,
    onBathGoalChange,
    handleExport,
    fileInputRef,
    handleImport,
    isOwner,
    newMemberUid,
    setNewMemberUid,
    handleAddMember,
    isSubmitting,
    account,
    handleSignOut,
    APP_VERSION
}) {
    return (
        <div className="space-y-6 animate-in slide-in-from-right-3 duration-300 pb-12">
            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-2">
                    <Moon size={20} className="text-indigo-500" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Weergave</h3>
                </div>
                <button onClick={toggleDarkMode} className={`w-full p-4 rounded-2xl flex items-center justify-between border active:scale-95 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 text-slate-800'}`}>
                    <div className="flex items-center gap-3">{isDarkMode ? <Sun className="text-amber-400" /> : <Moon />} <span>{isDarkMode ? 'Lichte Modus' : 'Donkere Modus'}</span></div>
                    <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} /></div>
                </button>
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <CaseSensitive size={20} className="text-indigo-500" />
                        <h4 className="font-black uppercase text-sm tracking-tight">Tekstgrootte</h4>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="5"
                        value={fontSize}
                        onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                    />
                </div>
            </section>

            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <Eye size={20} className="text-indigo-600" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Zichtbaarheid</h3>
                </div>
                <div className="space-y-2">
                    {['Fles', 'Borst', 'Vast'].map(key => (
                        <div key={key} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                            <span className="text-[11px] font-black uppercase opacity-60">{key}</span>
                            <button onClick={() => toggleVisibility(key)} className={`w-10 h-5 rounded-full relative transition-all ${visibilitySettings[key] ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${visibilitySettings[key] ? 'left-5.5' : 'left-0.5'}`} /></button>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <ShieldCheck size={20} className="text-purple-600" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Doelen</h3>
                </div>
                <div className="space-y-2">
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                        <span className="text-[11px] font-black uppercase opacity-60">Vitamine D</span>
                        <button onClick={() => toggleRequirement('d')} className={`w-10 h-5 rounded-full relative ${vitRequirements.d ? 'bg-purple-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${vitRequirements.d ? 'left-5.5' : 'left-0.5'}`} /></button>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                        <span className="text-[11px] font-black uppercase opacity-60">Vitamine K</span>
                        <button onClick={() => toggleRequirement('k')} className={`w-10 h-5 rounded-full relative ${vitRequirements.k ? 'bg-purple-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${vitRequirements.k ? 'left-5.5' : 'left-0.5'}`} /></button>
                    </div>
                    <div className={`p-3 rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-black uppercase opacity-60 flex items-center gap-2"><Bath size={14} />Bad</span>
                            <button onClick={() => onBathGoalChange({ ...bathGoal, enabled: !bathGoal.enabled })} className={`w-10 h-5 rounded-full relative ${bathGoal.enabled ? 'bg-sky-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${bathGoal.enabled ? 'left-5.5' : 'left-0.5'}`} /></button>
                        </div>
                        {bathGoal.enabled && (
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-xs opacity-60">Elke</span>
                                <input
                                    type="number"
                                    value={bathGoal.intervalDays}
                                    onChange={(e) => onBathGoalChange({ ...bathGoal, intervalDays: Number(e.target.value) })}
                                    className={`w-16 text-center rounded-lg p-1 text-sm ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}
                                />
                                <span className="text-xs opacity-60">dagen</span>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <Users size={20} className="text-cyan-500" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Account Members</h3>
                </div>
                {isOwner && (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMemberUid}
                            onChange={(e) => setNewMemberUid(e.target.value)}
                            placeholder="Enter new member's UID"
                            className={`flex-grow p-2 rounded-lg text-xs border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`}
                        />
                        <button onClick={handleAddMember} disabled={isSubmitting} className="p-2 bg-cyan-600 text-white rounded-lg active:scale-95 transition-transform disabled:opacity-50">
                            <Plus size={16} />
                        </button>
                    </div>
                )}
                <div className="space-y-2">
                    {Object.entries(account.members).map(([uid, role]) => (
                        <div key={uid} className={`flex items-center justify-between p-2 rounded-lg ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                            <span className="text-xs font-mono truncate opacity-70">{uid}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${role === 'owner' ? 'bg-amber-500 text-white' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-200')}`}>{role}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <Database size={20} className="text-emerald-500" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Gegevens</h3>
                </div>
                <div className="grid gap-2">
                    <button onClick={handleExport} className={`p-4 rounded-xl border flex items-center justify-between active:scale-95 transition-all ${isDarkMode ? 'border-slate-800 text-indigo-400' : 'border-slate-50 text-indigo-600'}`}>
                        <div className="flex items-center gap-3"><Download size={18} /><span className="text-xs font-black uppercase tracking-widest">Backup maken</span></div>
                        <ArrowRight size={14} />
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className={`p-4 rounded-xl border flex items-center justify-between active:scale-95 transition-all ${isDarkMode ? 'border-slate-800 text-emerald-400' : 'border-slate-50 text-emerald-600'}`}>
                        <div className="flex items-center gap-3"><Upload size={18} /><span className="text-xs font-black uppercase tracking-widest">Importeer backup</span></div>
                        <ArrowRight size={14} />
                    </button>
                </div>
            </section>

            <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex items-center gap-3 mb-4">
                    <LogOut size={20} className="text-red-500" />
                    <h3 className="font-black uppercase text-sm tracking-tight">Account</h3>
                </div>
                <button onClick={handleSignOut} className="p-4 rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-between w-full active:scale-95 transition-all">
                    <div className="flex items-center gap-3"><span className="text-xs font-black uppercase tracking-widest">Uitloggen</span></div>
                    <ArrowRight size={14} />
                </button>
            </section>

            <section className="text-center opacity-30 mt-6"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">v{APP_VERSION}</p></section>
            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
        </div>
    );
}
