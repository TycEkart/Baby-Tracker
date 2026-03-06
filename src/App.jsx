import React, { useState, useEffect, useMemo, useRef, Component } from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
    getFirestore, collection, addDoc, onSnapshot, doc, getDoc,
    setDoc, deleteDoc, updateDoc, Timestamp
} from 'firebase/firestore';
import {
    getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged
} from 'firebase/auth';
import {
    Baby, History, BarChart3, Trash2, Clock, Milk, Info, X, Droplets, Calendar,
    Download, Upload, Database, Plus, Minus, AlertTriangle, TrendingUp, Hash,
    Tag, Zap, Filter, Utensils, Settings, ShieldCheck, Heart, RefreshCw,
    ArrowLeft, ArrowRight, Moon, Sun, ChevronLeft, ChevronRight, FlaskConical,
    CheckCircle2, FileCode2, ChevronDown, ChevronUp, Eraser, Sparkles, AlertCircle,
    Eye, EyeOff, Bug
} from 'lucide-react';

// --- CONFIGURATIE ---
const APP_VERSION = '1.77.0';

const VERSION_HISTORY = [
    { version: '1.77.0', notes: ['Groter contrast tussen de dagen in de daggrafiek', 'Nieuw overzicht met versiegeschiedenis in instellingen'] },
    { version: '1.76.0', notes: ['Stabiele lay-out volledig hersteld', 'Invoervelden, plus-knoppen en icoontjes strak uitgelijnd'] }
];




// Your web app's Firebase configuration
// IMPORTANT: 1. Create a new Firebase project. 2. Enable "Anonymous" Authentication. 3. Replace these values.
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBYWuxQuuQJAxm7W0nN85H1yGVewZwzi10",
    authDomain: "baby-tracker-2ee79.firebaseapp.com",
    projectId: "baby-tracker-2ee79",
    storageBucket: "baby-tracker-2ee79.firebasestorage.app",
    messagingSenderId: "929817901933",
    appId: "1:929817901933:web:13f51fb211f22c6b26b864",
    measurementId: "G-S1CWSK4ZR1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;

// Dynamische appId met persoonlijke fallback targetId
const appId = typeof __app_id !== 'undefined' ? __app_id : '1xGoR2vsd3kdZukzvzF9Y8RXxumMv_W7yX4TtMF2Zc4Y';

// --- HELPERS ---
const isEveningTime = () => {
    const hour = new Date().getHours();
    // Donker tussen 19:00 en 08:00
    return hour >= 19 || hour < 8;
};

const toSafeDate = (input) => {
    if (!input) return new Date();
    if (typeof input === 'object' && input !== null && 'seconds' in input) {
        return new Date(input.seconds * 1000);
    }
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
};

const toLocalDateString = (dateInput) => {
    const d = toSafeDate(dateInput);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const formatTime = (date) => {
    return toSafeDate(date).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
};

const formatDateTimeFull = (dateInput) => {
    const d = toSafeDate(dateInput);
    return `${d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}, ${formatTime(d)}`;
};

const getRelativeDateLabel = (dateStr) => {
    const today = toLocalDateString(new Date());
    const yesterday = toLocalDateString(new Date(Date.now() - 86400000));
    if (dateStr === today) return "Vandaag";
    if (dateStr === yesterday) return "Gisteren";
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
};

const getDiffMinutes = (start, end) => {
    const s = toSafeDate(start).getTime();
    const e = toSafeDate(end).getTime();
    return Math.floor((e - s) / 60000);
};

const formatDuration = (mins) => {
    if (mins < 0 || isNaN(mins)) return "0m";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}u ${m}m` : `${m}m`;
};

const getLocalDateTimeString = (date = new Date()) => {
    const d = toSafeDate(date);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
};

const PoopIcon = ({ className }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M7 15a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v6Z" />
        <path d="M17 10c.5-1 2.5-1 3 0M4 10c-.5-1-2.5-1-3 0M10 6c0-1.5 1-2.5 2-2.5s2 1 2 2.5" />
    </svg>
);

// --- ERROR BOUNDARY ---
class ErrorBoundary extends Component {
    state = { hasError: false, error: null };
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    render() {
        const isNight = isEveningTime();
        if (this.state.hasError) {
            return (
                <div className={`min-h-screen flex items-center justify-center p-6 text-center font-sans ${isNight ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
                    <div className={`p-8 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-4 border ${isNight ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                        <AlertTriangle className="text-red-500 mx-auto" size={48} />
                        <h1 className="text-lg font-black uppercase tracking-tight">Systeemfout</h1>
                        <p className="text-xs opacity-60">Er is een technisch probleem opgetreden.</p>
                        <div className={`p-3 rounded-xl text-left overflow-auto max-h-40 border ${isNight ? 'bg-slate-950 border-slate-800 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
                            <code className="text-[10px] break-all">{this.state.error?.toString()}</code>
                        </div>
                        <button onClick={() => window.location.reload()} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20">
                            <RefreshCw size={16} /> App Herstarten
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

function AppInternal() {
    // --- STATE ---
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('log');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbStatus, setDbStatus] = useState('initializing');
    const [dbError, setDbError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(isEveningTime());
    const [toast, setToast] = useState(null);
    const [now, setNow] = useState(new Date());

    // Settings
    const [vitRequirements, setVitRequirements] = useState({ d: false, k: false });
    const [visibilitySettings, setVisibilitySettings] = useState({ Fles: true, Borst: true, Vast: true });

    // Form states
    const [editingId, setEditingId] = useState(null);
    const [feedType, setFeedType] = useState(null);
    const [amount, setAmount] = useState(0);
    const [amountLeft, setAmountLeft] = useState(0);
    const [amountRight, setAmountRight] = useState(0);
    const [firstBreast, setFirstBreast] = useState('Links');
    const [hasPlas, setHasPlas] = useState(false);
    const [hasPoep, setHasPoep] = useState(false);
    const [hasVitamins, setHasVitamins] = useState(false);
    const [vitamins, setVitamins] = useState({ d: false, k: false });
    const [timestamp, setTimestamp] = useState(getLocalDateTimeString());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI States
    const [highlightedId, setHighlightedId] = useState(null);
    const [actionTargetId, setActionTargetId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [selectedDayId, setSelectedDayId] = useState(toLocalDateString(new Date()));
    const [itemToDelete, setItemToDelete] = useState(null);

    const timelineScrollRef = useRef(null);
    const isAutoScrollingRef = useRef(false);
    const fileInputRef = useRef(null);

    // --- UI UTILITIES ---
    const showToast = (msg, icon = 'success') => {
        setToast({ msg, icon });
        setTimeout(() => setToast(null), 3500);
    };

    // --- ACTIONS ---
    const handleFeedTypeToggle = (type) => {
        if (feedType === type) {
            setFeedType(null);
        } else {
            setFeedType(type);
            if (!editingId) {
                const last = logs.find(l => l.feedType === type);
                if (last) {
                    if (type === 'Borst') {
                        setAmountLeft(last.amountLeft || 0);
                        setAmountRight(last.amountRight || 0);
                        setFirstBreast(last.firstBreast === 'Links' ? 'Rechts' : 'Links');
                    } else {
                        setAmount(last.amount || 0);
                    }
                } else {
                    setAmount(type === 'Vast' ? 50 : 120);
                    setAmountLeft(10);
                    setAmountRight(10);
                }
            }
        }
    };

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        if (!user || !db || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const payload = {
                timestamp: new Date(timestamp).toISOString(),
                feedType,
                amount: feedType === 'Borst' ? (parseInt(amountLeft || 0) + parseInt(amountRight || 0)) : (feedType === 'Vitamines' ? 0 : parseInt(amount || 0)),
                amountLeft: feedType === 'Borst' ? parseInt(amountLeft || 0) : 0,
                amountRight: feedType === 'Borst' ? parseInt(amountRight || 0) : 0,
                firstBreast: feedType === 'Borst' ? firstBreast : null,
                hasPlas, hasPoep, hasVitamins, vitamins: hasVitamins ? vitamins : null,
                updatedAt: Timestamp.now()
            };

            let finalId = editingId;
            if (editingId) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'baby_logs', editingId), payload);
            } else {
                payload.createdAt = Timestamp.now();
                const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'baby_logs'), payload);
                finalId = docRef.id;
            }

            setActionType('save');
            setActionTargetId(finalId);
            resetForm(true, 'save');
            showToast("Gelukt!");
        } catch (err) {
            setDbError(`Save Error: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = (keep = false, type = 'cancel') => {
        if (editingId) {
            setActionTargetId(editingId);
            setActionType(type);
        }
        setEditingId(null);
        setTimestamp(getLocalDateTimeString());
        setHasPlas(false);
        setHasPoep(false);
        setHasVitamins(false);
        setVitamins({ d: false, k: false });

        if (!keep) {
            setFeedType(null);
            setAmount(0);
            setAmountLeft(0);
            setAmountRight(0);
            setFirstBreast('Links');
        }
    };

    const startEdit = (log) => {
        setEditingId(log.id);
        setFeedType(log.feedType || null);
        setAmount(log.amount || 0);
        setAmountLeft(log.amountLeft || 0);
        setAmountRight(log.amountRight || 0);
        setFirstBreast(log.firstBreast || 'Links');
        setHasPlas(!!log.hasPlas);
        setHasPoep(!!log.hasPoep);
        setHasVitamins(!!log.hasVitamins);
        setVitamins(log.vitamins || { d: false, k: false });
        setTimestamp(getLocalDateTimeString(toSafeDate(log.timestamp)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !db) return;
        try {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'baby_logs', itemToDelete));
            setItemToDelete(null);
            showToast("Verwijderd");
        } catch (err) {
            setDbError(`Delete Error: ${err.message}`);
        }
    };

    const adjustTime = (mins) => {
        const current = new Date(timestamp);
        current.setMinutes(current.getMinutes() + mins);
        setTimestamp(getLocalDateTimeString(current));
    };

    const toggleDarkMode = async () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        if (user && db) {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'appearance'), { isDarkMode: newVal }, { merge: true });
        }
    };

    const toggleVisibility = async (key) => {
        const newVis = { ...visibilitySettings, [key]: !visibilitySettings[key] };
        setVisibilitySettings(newVis);
        if (user && db) {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'visibility'), newVis, { merge: true });
        }
    };

    const toggleRequirement = async (key) => {
        const newReqs = { ...vitRequirements, [key]: !vitRequirements[key] };
        setVitRequirements(newReqs);
        if (user && db) {
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'settings', 'vitamin_requirements'), newReqs, { merge: true });
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'baby-tracker-backup.json';
        link.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file || !db) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) return;
                setIsSubmitting(true);
                for (const item of data) {
                    if (item.timestamp) {
                        const { id, ...rest } = item;
                        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'baby_logs'), { ...rest, createdAt: Timestamp.now() });
                    }
                }
                showToast("Import geslaagd");
            } catch (err) {
                setDbError(`Import Error: ${err.message}`);
            } finally {
                setIsSubmitting(false);
            }
        };
        reader.readAsText(file);
    };

    const handleInsertTestData = async () => {
        if (!user || !db || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'baby_logs');
            const baseDate = new Date();
            for (let i = 6; i >= 0; i--) {
                const d = new Date(baseDate); d.setDate(d.getDate() - i); d.setHours(7, 0, 0, 0);
                let time = d.getTime();
                for (let j = 0; j < 5; j++) {
                    const rand = Math.random();
                    const log = { timestamp: new Date(time).toISOString(), createdAt: Timestamp.now(), hasPlas: Math.random() > 0.3, hasPoep: Math.random() > 0.8, isTestData: true };
                    if (rand > 0.6) { log.feedType = 'Fles'; log.amount = 120; }
                    else if (rand > 0.2) { log.feedType = 'Borst'; log.amountLeft = 10; log.amountRight = 10; log.amount = 20; log.firstBreast = 'Links'; }
                    else { log.feedType = 'Vast'; log.amount = 60; }
                    await addDoc(colRef, log);
                    time += (4 * 60 * 60 * 1000);
                }
            }
            showToast("Testdata klaar!");
        } catch (e) {} finally { setIsSubmitting(false); }
    };

    const handleDeleteAllTestData = async () => {
        setIsSubmitting(true);
        const testLogs = logs.filter(l => l.isTestData);
        for (const t of testLogs) {
            await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'baby_logs', t.id));
        }
        showToast("Testdata verwijderd");
        setIsSubmitting(false);
    };

    const handleTimelineScroll = (e) => {
        if (isAutoScrollingRef.current) return;
        const index = Math.round(e.target.scrollLeft / 960);
        const day = trendsChartData[index];
        if (day && day.id !== selectedDayId) setSelectedDayId(day.id);
    };

    const handleSelectDay = (id) => {
        setSelectedDayId(id);
        const index = trendsChartData.findIndex(d => d.id === id);
        if (index !== -1 && timelineScrollRef.current) {
            isAutoScrollingRef.current = true;
            timelineScrollRef.current.scrollTo({ left: index * 960, behavior: 'smooth' });
            setTimeout(() => isAutoScrollingRef.current = false, 600);
        }
    };

    const handleNavigateDay = (dir) => {
        const curIdx = trendsChartData.findIndex(d => d.id === selectedDayId);
        const nextIdx = curIdx + dir;
        if (nextIdx >= 0 && nextIdx < trendsChartData.length) handleSelectDay(trendsChartData[nextIdx].id);
    };

    // --- FIREBASE INIT ---
    useEffect(() => {
        if (!auth || !db) return;
        const initApp = async () => {
            try {
                let u;
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    u = (await signInWithCustomToken(auth, __initial_auth_token)).user;
                } else {
                    u = (await signInAnonymously(auth)).user;
                }
                setUser(u);
                const loadSet = async (path, setter) => {
                    const snap = await getDoc(doc(db, 'artifacts', appId, 'users', u.uid, 'settings', path));
                    if (snap.exists()) setter(snap.data());
                };
                await Promise.all([
                    loadSet('appearance', (d) => setIsDarkMode(!!d.isDarkMode)),
                    loadSet('visibility', (d) => setVisibilitySettings(v => ({ ...v, ...d }))),
                    loadSet('vitamin_requirements', (d) => setVitRequirements(d))
                ]);
            } catch (err) {
                console.error("Firebase Init Error:", err);
                if (err.code === 'auth/configuration-not-found' || err.code === 'auth/operation-not-allowed') {
                    setDbError("Setup Required: Enable 'Anonymous' authentication in Firebase Console.");
                } else {
                    setDbError(`Auth Error: ${err.message}`);
                }
            } finally {
                setLoading(false);
            }
        };
        initApp();
    }, []);

    // --- DATA SYNC ---
    useEffect(() => {
        if (!user || !db) return;
        const colRef = collection(db, 'artifacts', appId, 'public', 'data', 'baby_logs');
        const unsub = onSnapshot(colRef, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
                .filter(l => l && l.timestamp)
                .sort((a, b) => toSafeDate(b.timestamp).getTime() - toSafeDate(a.timestamp).getTime());
            setLogs(data);
            setDbStatus('online');
        }, (err) => {
            setDbError(`Database Error: ${err.message}`);
            setDbStatus('offline');
        });
        return () => unsub();
    }, [user]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- MEMOS & COMPUTED STATE ---
    const typeIntervals = useMemo(() => {
        const sorted = [...logs].sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
        const result = {};
        const lastSeen = { feeding: null, poep: null, plas: null, vitamins: null };

        sorted.forEach(log => {
            const ts = toSafeDate(log.timestamp);
            let data = null;

            if (log.feedType) {
                if (lastSeen.feeding) data = { text: formatDuration(getDiffMinutes(lastSeen.feeding, ts)), category: log.feedType };
            } else if (log.hasPoep) {
                if (lastSeen.poep) data = { text: formatDuration(getDiffMinutes(lastSeen.poep, ts)), category: 'poep' };
            } else if (log.hasPlas) {
                if (lastSeen.plas) data = { text: formatDuration(getDiffMinutes(lastSeen.plas, ts)), category: 'plas' };
            } else if (log.hasVitamins) {
                if (lastSeen.vitamins) data = { text: formatDuration(getDiffMinutes(lastSeen.vitamins, ts)), category: 'vitamins' };
            }

            result[log.id] = data;

            if (log.feedType) lastSeen.feeding = ts;
            if (log.hasPoep) lastSeen.poep = ts;
            if (log.hasPlas) lastSeen.plas = ts;
            if (log.hasVitamins) lastSeen.vitamins = ts;
        });
        return result;
    }, [logs]);

    const feedingIntervalsMap = useMemo(() => {
        const sortedFeedings = logs.filter(l => l.feedType).sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
        const map = {};
        sortedFeedings.forEach((log, i) => {
            if (i > 0) map[log.id] = formatDuration(getDiffMinutes(sortedFeedings[i-1].timestamp, log.timestamp));
        });
        return map;
    }, [logs]);

    const lastFeedingLabel = useMemo(() => {
        const feedings = logs.filter(l => l.feedType);
        if (feedings.length === 0) return "Geen logs";
        return formatDuration(getDiffMinutes(feedings[0].timestamp, now));
    }, [logs, now]);

    const isFormValid = useMemo(() => {
        const hasFeeding = (feedType === 'Borst')
            ? (parseInt(amountLeft || 0) > 0 || parseInt(amountRight || 0) > 0)
            : (feedType && parseInt(amount || 0) > 0);
        const hasVita = hasVitamins && (vitamins.d || vitamins.k);
        return hasFeeding || hasPlas || hasPoep || hasVita;
    }, [amount, amountLeft, amountRight, feedType, hasPlas, hasPoep, hasVitamins, vitamins]);

    const missingVitamins = useMemo(() => {
        const todayDs = toLocalDateString(new Date());
        const todayLogs = logs.filter(l => toLocalDateString(l.timestamp) === todayDs);
        const hasD = todayLogs.some(l => l.hasVitamins && l.vitamins?.d);
        const hasK = todayLogs.some(l => l.hasVitamins && l.vitamins?.k);
        const list = [];
        if (vitRequirements.d && !hasD) list.push("Vitamine D");
        if (vitRequirements.k && !hasK) list.push("Vitamine K");
        return list;
    }, [logs, vitRequirements]);

    const trendsChartData = useMemo(() => {
        return [...Array(7)].map((_, i) => {
            const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - i);
            const ds = toLocalDateString(d);
            const dayLogs = logs.filter(l => toLocalDateString(l.timestamp) === ds);
            const totalVolume = dayLogs.reduce((s, l) => s + (Number(l.amount) || (Number(l.amountLeft || 0) + Number(l.amountRight || 0)) || 0), 0);
            const hasBreastfeeding = dayLogs.some(l => l.feedType === 'Borst');
            return {
                id: ds, date: d,
                label: d.toLocaleDateString('nl-NL', { weekday: 'short' }),
                ml: totalVolume,
                hasBreastfeeding,
                items: dayLogs,
                plas: dayLogs.filter(l => l.hasPlas).length,
                poep: dayLogs.filter(l => l.hasPoep).length
            };
        }).reverse();
    }, [logs]);

    const weeklyAvgs = useMemo(() => {
        const todayStr = toLocalDateString(new Date());
        // Filter dagen met data EN sluit vandaag uit
        const hist = trendsChartData.filter(d => d.items.length > 0 && d.id !== todayStr);
        const count = hist.length || 1;
        return {
            totalVoedingen: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType).length, 0) / count).toFixed(1),
            flesCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Fles').length, 0) / count).toFixed(1),
            flesAmount: Math.round(hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Fles').reduce((acc, i) => acc + (Number(i.amount) || 0), 0), 0) / count),
            borstCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Borst').length, 0) / count).toFixed(1),
            borstL: Math.round(hist.reduce((s, d) => s + d.items.reduce((acc, i) => acc + (Number(i.amountLeft) || 0), 0), 0) / count),
            borstR: Math.round(hist.reduce((s, d) => s + d.items.reduce((acc, i) => acc + (Number(i.amountRight) || 0), 0), 0) / count),
            vastCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Vast').length, 0) / count).toFixed(1),
            vastAmount: Math.round(hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Vast').reduce((acc, i) => acc + (Number(i.amount) || 0), 0), 0) / count),
        };
    }, [trendsChartData]);

    // NIEUW: Specifieke dagstatistieken berekenen voor de actieve grafiek
    const selectedDayStats = useMemo(() => {
        const dayData = trendsChartData.find(d => d.id === selectedDayId);
        if (!dayData) return null;

        const dFles = dayData.items.filter(i => i.feedType === 'Fles');
        const dBorst = dayData.items.filter(i => i.feedType === 'Borst');
        const dVast = dayData.items.filter(i => i.feedType === 'Vast');

        return {
            plas: dayData.plas,
            poep: dayData.poep,
            fles: {
                count: dFles.length,
                total: dFles.reduce((s, i) => s + (Number(i.amount) || 0), 0),
                avg: dFles.length ? Math.round(dFles.reduce((s, i) => s + (Number(i.amount) || 0), 0) / dFles.length) : 0
            },
            borst: {
                count: dBorst.length,
                totL: dBorst.reduce((s, i) => s + (Number(i.amountLeft) || 0), 0),
                totR: dBorst.reduce((s, i) => s + (Number(i.amountRight) || 0), 0),
                avgL: dBorst.length ? Math.round(dBorst.reduce((s, i) => s + (Number(i.amountLeft) || 0), 0) / dBorst.length) : 0,
                avgR: dBorst.length ? Math.round(dBorst.reduce((s, i) => s + (Number(i.amountRight) || 0), 0) / dBorst.length) : 0
            },
            vast: {
                count: dVast.length,
                total: dVast.reduce((s, i) => s + (Number(i.amount) || 0), 0),
                avg: dVast.length ? Math.round(dVast.reduce((s, i) => s + (Number(i.amount) || 0), 0) / dVast.length) : 0
            }
        };
    }, [trendsChartData, selectedDayId]);

    const getIntervalStyle = (cat, isDark) => {
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

    const visibleFeedTypes = useMemo(() => {
        const list = [];
        if (visibilitySettings.Fles) list.push({ id: 'Fles', label: 'Fles', icon: <Milk size={14} />, activeColor: 'bg-indigo-600' });
        if (visibilitySettings.Borst) list.push({ id: 'Borst', label: 'Borst', icon: <Baby size={14} />, activeColor: 'bg-pink-500' });
        if (visibilitySettings.Vast) list.push({ id: 'Vast', label: 'Vast', icon: <Utensils size={14} />, activeColor: 'bg-orange-600' });
        return list;
    }, [visibilitySettings]);

    const groupedLogsList = useMemo(() => {
        const groups = {};
        logs.forEach(l => {
            const dk = toLocalDateString(l.timestamp);
            if (!groups[dk]) groups[dk] = [];
            groups[dk].push(l);
        });
        return Object.keys(groups).sort().reverse().map(date => ({ date, items: groups[date] }));
    }, [logs]);

    // Effects
    useEffect(() => {
        if (actionTargetId && activeTab === 'log') {
            const t = setTimeout(() => {
                const el = document.getElementById(`log-item-${actionTargetId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setHighlightedId(actionTargetId);
                    setTimeout(() => { setHighlightedId(null); setActionType(null); }, 3000);
                }
                setActionTargetId(null);
            }, 300);
            return () => clearTimeout(t);
        }
    }, [actionTargetId, activeTab]);

    if (loading) {
        return (
            <div className={`h-screen flex items-center justify-center text-indigo-500 animate-pulse ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
                <Baby size={64} />
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-10 overflow-x-hidden`}>
            {dbError && (
                <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between z-[100] sticky top-0 animate-in slide-in-from-top-full duration-300">
                    <div className="flex items-center gap-3"><Bug size={18} /><span className="text-[11px] font-bold opacity-90">{dbError}</span></div>
                    <button onClick={() => setDbError(null)}><X size={16} /></button>
                </div>
            )}

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

            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[200] animate-in slide-in-from-top-full duration-500">
                    <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${isDarkMode ? 'bg-indigo-900 border-indigo-500' : 'bg-indigo-600 border-indigo-500'} text-white`}>
                        <CheckCircle2 size={20} className="text-indigo-200" />
                        <span className="font-black text-[11px] uppercase tracking-widest">{toast.msg}</span>
                    </div>
                </div>
            )}

            <main className="px-3 max-w-2xl mx-auto space-y-4 pt-4">
                {activeTab === 'log' ? (
                    <>
                        {missingVitamins.length > 0 && (
                            <section className="bg-orange-500 text-white p-4 rounded-[1.8rem] shadow-lg flex items-center gap-4 border border-orange-400 animate-in fade-in duration-500">
                                <AlertCircle size={28} className="shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-black text-xs uppercase mb-0.5 tracking-wider">Vitamines nodig!</h4>
                                    <p className="text-[11px] font-bold opacity-90 leading-tight">Vandaag nog geen <span className="underline decoration-2">{missingVitamins.join(' & ')}</span> gelogd.</p>
                                </div>
                            </section>
                        )}

                        <section className={`p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'} ${editingId ? 'border-indigo-400 shadow-xl' : ''}`}>
                            <div className="flex items-center gap-2 mb-6 px-1 text-slate-700">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-indigo-50'}`}><Clock size={18} /></div>
                                <div className="flex flex-col">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Laatste voeding</span>
                                    <span className={`text-sm font-black ${isDarkMode ? 'text-slate-100' : 'text-slate-700'}`}>{lastFeedingLabel} geleden</span>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="space-y-2">
                                    <div className={`relative group overflow-hidden rounded-2xl border p-4 shadow-inner ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                                        <label className={`absolute top-2 left-4 text-[9px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-200' : 'text-slate-400'}`}>Datum & Tijd</label>
                                        <div className="flex items-center justify-between pt-3 text-slate-800 dark:text-white">
                                            <span className="text-sm font-black uppercase">{formatDateTimeFull(timestamp)}</span>
                                            <Calendar size={18} className="text-indigo-500" />
                                        </div>
                                        <input type="datetime-local" value={timestamp} onChange={(e) => setTimestamp(e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                                    </div>

                                    <div className="grid grid-cols-4 gap-1.5 px-0.5">
                                        {[
                                            { label: '-1u', val: -60 }, { label: '-10m', val: -10 }, { label: '-5m', val: -5 }, { label: '-1m', val: -1 },
                                            { label: '+1u', val: 60 }, { label: '+10m', val: 10 }, { label: '+5m', val: 5 }, { label: '+1m', val: 1 }
                                        ].map((btn, idx) => (
                                            <button key={idx} type="button" onClick={() => adjustTime(btn.val)} className={`py-1.5 rounded-lg text-[10px] font-black uppercase border transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-indigo-400' : 'bg-slate-50 border-slate-200 text-indigo-600'}`}>{btn.label}</button>
                                        ))}
                                    </div>
                                </div>

                                <div className={`grid gap-2 ${visibleFeedTypes.length === 1 ? 'grid-cols-1' : visibleFeedTypes.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                                    {visibleFeedTypes.map(type => (
                                        <button key={type.id} type="button" onClick={() => handleFeedTypeToggle(type.id)} className={`py-3.5 rounded-xl font-black text-[10px] uppercase border flex flex-col items-center justify-center gap-1 transition-all ${feedType === type.id ? `${type.activeColor} text-white border-transparent shadow-md` : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-50 border-transparent text-slate-500')}`}>
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
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-50'}`}>Startkant</span>
                                                    <div className="flex gap-2">
                                                        {['Links', 'Rechts'].map(side => (
                                                            <button key={side} type="button" onClick={() => setFirstBreast(side)} className={`flex-1 py-2.5 rounded-xl font-black text-[10px] uppercase border flex items-center justify-center gap-2 transition-all ${firstBreast === side ? 'bg-pink-500 text-white border-transparent shadow-md' : (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')}`}>
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
                                                            <div className={`flex items-center justify-between p-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                                                <button type="button" onClick={() => b.s(v => Math.max(0, Number(v) - 5))} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 shadow-sm active:scale-90 transition-transform">
                                                                    <Minus size={14} />
                                                                </button>
                                                                <input type="number" value={b.v} onChange={(e) => b.s(e.target.value)} className="w-full text-center font-black text-xl bg-transparent border-0 focus:ring-0 p-0" />
                                                                <button type="button" onClick={() => b.s(v => Number(v) + 5)} className="w-10 h-10 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 shadow-sm active:scale-90 transition-transform">
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
                                                    <span className="text-[10px] font-bold uppercase text-slate-400">Hoeveelheid</span>
                                                    <span className="text-[10px] font-bold uppercase text-slate-300">{feedType === 'Vast' ? 'Gram' : 'Milliliter'}</span>
                                                </div>
                                                <div className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden`}>
                                                    <button type="button" onClick={() => setAmount(v => Math.max(0, Number(v) - 10))} className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 shadow-sm active:scale-95 transition-transform">
                                                        <Minus size={22} />
                                                    </button>
                                                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 text-center font-black text-3xl bg-transparent border-0 focus:ring-0 p-0 dark:text-white min-w-0" />
                                                    <button type="button" onClick={() => setAmount(v => Number(v) + 10)} className="w-14 h-14 shrink-0 flex items-center justify-center rounded-xl bg-white dark:bg-slate-700 shadow-sm active:scale-95 transition-transform">
                                                        <Plus size={22} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        <button type="button" onClick={() => setHasPlas(!hasPlas)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasPlas ? 'bg-yellow-400 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-50 border-transparent text-slate-500')}`}>
                                            <Droplets size={14} /> Plas
                                        </button>
                                        <button type="button" onClick={() => setHasPoep(!hasPoep)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasPoep ? 'bg-amber-900 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-50 border-transparent text-slate-500')}`}>
                                            <PoopIcon className="w-3.5 h-3.5" /> Poep
                                        </button>
                                        <button type="button" onClick={() => setHasVitamins(!hasVitamins)} className={`py-3.5 rounded-xl border font-black text-[9px] uppercase flex items-center justify-center gap-1.5 transition-all ${hasVitamins ? 'bg-purple-600 text-white border-transparent shadow-sm' : (isDarkMode ? 'bg-slate-800 border-transparent text-slate-100' : 'bg-slate-50 border-transparent text-slate-500')}`}>
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

                                <button type="submit" disabled={isSubmitting || !isFormValid} className={`w-full py-4.5 rounded-2xl text-white font-black uppercase text-sm shadow-lg active:scale-[0.98] transition-all ${isSubmitting || !isFormValid ? 'bg-slate-300 shadow-none grayscale opacity-50' : (feedType === 'Borst' ? 'bg-pink-500 shadow-pink-500/20' : 'bg-indigo-600 shadow-indigo-600/20')}`}>
                                    {isSubmitting ? 'Bezig...' : 'Gebeurtenis Loggen'}
                                </button>
                            </form>
                        </section>

                        <div className="space-y-6 mt-8 pb-10">
                            {groupedLogsList.map(group => (
                                <div key={group.date} className="space-y-2">
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
                                        <span className="text-[11px] font-bold uppercase text-slate-500">{getRelativeDateLabel(group.date)}</span>
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
                                        if (log.feedType === 'Borst') icons.push(<Heart size={20} className="text-pink-500" />);
                                        else if (log.feedType === 'Fles') icons.push(<Milk size={20} className="text-indigo-500" />);
                                        else if (log.feedType === 'Vast') icons.push(<Utensils size={20} className="text-orange-500" />);

                                        if (log.hasPlas || log.hasPoep) icons.push(<Droplets size={18} className={log.hasPoep ? 'text-amber-700' : 'text-yellow-400'} />);
                                        if (log.hasVitamins) icons.push(<Sparkles size={18} className="text-purple-500" />);
                                        if (icons.length === 0) icons.push(<Baby size={20} className="text-slate-400" />);

                                        const intervalObj = typeIntervals[log.id];

                                        return (
                                            <div key={log.id} id={`log-item-${log.id}`} onClick={() => startEdit(log)} className={`p-4 rounded-[1.8rem] border flex items-center gap-4 transition-all duration-700 cursor-pointer border-slate-100 dark:border-slate-800 ${getBg()}`}>
                                                <div className={`flex flex-wrap items-center justify-center gap-1 p-3 rounded-2xl w-16 h-16 shrink-0 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                                    {icons.map((icon, idx) => <div key={idx} className="animate-in zoom-in duration-300">{icon}</div>)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className="text-xs font-black opacity-60">{formatTime(log.timestamp)}</span>
                                                        <div className="flex items-center gap-3">
                                                            {intervalObj && (
                                                                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition-colors ${getIntervalStyle(intervalObj.category, isDarkMode)}`}>
                                                                    <Clock size={10} />
                                                                    <span className="text-[10px] font-black">+{intervalObj.text}</span>
                                                                </div>
                                                            )}
                                                            <button onClick={(e) => { e.stopPropagation(); setItemToDelete(log.id); }} className="text-slate-300 hover:text-red-500 transition-colors">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <h3 className="font-black text-sm">
                                                        {log.feedType === 'Borst' ? `L: ${log.amountLeft}m | R: ${log.amountRight}m` : log.feedType ? `${log.amount}${log.feedType === 'Vast' ? 'g' : 'ml'} ${log.feedType}` : 'Gebeurtenis'}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                        {log.feedType === 'Borst' && log.firstBreast && <div className="text-[9px] font-black uppercase text-pink-600 bg-pink-500/10 px-1.5 py-0.5 rounded-md">Start: {log.firstBreast}</div>}
                                                        {log.hasPlas && <div className="text-[9px] font-black uppercase text-yellow-600">Plas</div>}
                                                        {log.hasPoep && <div className="text-[9px] font-black uppercase text-amber-900">Poep</div>}
                                                        {log.hasVitamins && <div className="text-[9px] font-black uppercase text-purple-600">Vita: {log.vitamins?.d ? 'D' : ''}{log.vitamins?.k ? '+K' : ''}</div>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </>
                ) : activeTab === 'trends' ? (
                    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
                        <div className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <h3 className="text-xs font-black uppercase mb-4 opacity-50 tracking-widest">Weekoverzicht (Gemiddeld per dag)</h3>
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                {Number(weeklyAvgs.totalVoedingen) > 0 && (
                                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-1">
                                            <Clock size={14} /><span className="text-[10px] font-black uppercase">Totaal Voedingen</span>
                                        </div>
                                        <p className="text-lg font-black">{weeklyAvgs.totalVoedingen}x</p>
                                    </div>
                                )}
                                {Number(weeklyAvgs.flesCount) > 0 && (
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2 text-indigo-500 mb-1">
                                            <Milk size={14} /><span className="text-[10px] font-black uppercase">Fles</span>
                                        </div>
                                        <p className="text-lg font-black">{weeklyAvgs.flesCount}x <span className="text-[10px] font-bold opacity-50">({weeklyAvgs.flesAmount}ml)</span></p>
                                    </div>
                                )}
                                {Number(weeklyAvgs.borstCount) > 0 && (
                                    <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-2xl text-slate-800 dark:text-white">
                                        <div className="flex items-center gap-2 text-pink-500 mb-1">
                                            <Heart size={14} /><span className="text-[10px] font-black uppercase">Borst ({weeklyAvgs.borstCount}x)</span>
                                        </div>
                                        <p className="text-xs font-black truncate mt-1">L:{weeklyAvgs.borstL}m | R:{weeklyAvgs.borstR}m</p>
                                    </div>
                                )}
                                {Number(weeklyAvgs.vastCount) > 0 && (
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl text-slate-800 dark:text-white">
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
                                    const hPct = hasData ? Math.max(12, (day.ml/max)*100) : 0;
                                    return (
                                        <div key={day.id} onClick={() => handleSelectDay(day.id)} className="flex-1 flex flex-col items-center gap-2 cursor-pointer group">
                                            <div className="w-full flex justify-center items-end h-20">
                                                <div style={{ height: `${hPct}%` }} className={`w-3 sm:w-4 rounded-full transition-all duration-300 ${isSelected ? 'bg-indigo-600 shadow-lg' : (hasData ? (day.hasBreastfeeding ? 'bg-pink-400 dark:bg-pink-500/50' : 'bg-indigo-300 dark:bg-slate-700') : 'bg-slate-50 dark:bg-slate-900 opacity-20')}`} />
                                            </div>
                                            <span className={`text-[9px] font-black uppercase ${isSelected ? 'text-indigo-600' : 'opacity-40'}`}>{day.label}</span>
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

                                {/* NIEUW: Dagelijkse totalen boven de grafiek */}
                                {selectedDayStats && (
                                    <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2">
                                        <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[5rem] ${isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-50 text-slate-700'}`}>
                                            <div className="flex items-center gap-1.5 mb-1 opacity-50"><Droplets size={12}/><span className="text-[9px] font-black uppercase">Luiers</span></div>
                                            <div className="text-xs font-black">{selectedDayStats.plas}x <span className="opacity-40 font-normal">/</span> {selectedDayStats.poep}x💩</div>
                                        </div>
                                        {selectedDayStats.fles.count > 0 && (
                                            <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[6rem] ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                                                <div className="flex items-center gap-1.5 mb-1 opacity-80"><Milk size={12}/><span className="text-[9px] font-black uppercase">Fles ({selectedDayStats.fles.count}x)</span></div>
                                                <div className="text-xs font-black">{selectedDayStats.fles.total}ml <span className="opacity-60 font-bold text-[9px]">~{selectedDayStats.fles.avg}/k</span></div>
                                            </div>
                                        )}
                                        {selectedDayStats.borst.count > 0 && (
                                            <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[7rem] ${isDarkMode ? 'bg-pink-500/10 text-pink-400' : 'bg-pink-50 text-pink-600'}`}>
                                                <div className="flex items-center gap-1.5 mb-1 opacity-80"><Heart size={12}/><span className="text-[9px] font-black uppercase">Borst ({selectedDayStats.borst.count}x)</span></div>
                                                <div className="text-xs font-black">L:{selectedDayStats.borst.totL}m R:{selectedDayStats.borst.totR}m</div>
                                                <div className="text-[9px] font-bold opacity-60">~ L:{selectedDayStats.borst.avgL}m R:{selectedDayStats.borst.avgR}m</div>
                                            </div>
                                        )}
                                        {selectedDayStats.vast.count > 0 && (
                                            <div className={`shrink-0 p-3 rounded-2xl flex flex-col justify-center min-w-[6rem] ${isDarkMode ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>
                                                <div className="flex items-center gap-1.5 mb-1 opacity-80"><Utensils size={12}/><span className="text-[9px] font-black uppercase">Vast ({selectedDayStats.vast.count}x)</span></div>
                                                <div className="text-xs font-black">{selectedDayStats.vast.total}g <span className="opacity-60 font-bold text-[9px]">~{selectedDayStats.vast.avg}/k</span></div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* HOOGTE FIX: h-[220px] naar de scroll container verplaatst zodat stats niet afkappen */}
                                <div className="overflow-x-auto overflow-y-hidden custom-scrollbar h-[220px]" ref={timelineScrollRef} onScroll={handleTimelineScroll} style={{ touchAction: 'pan-x' }}>
                                    <div className="flex relative h-full" style={{ width: `${trendsChartData.length * 960}px` }}>
                                        {trendsChartData.map((day, idx) => {
                                            const bgClass = day.id === selectedDayId
                                                ? (isDarkMode ? 'bg-slate-800/80' : 'bg-indigo-50/80')
                                                : (idx % 2 === 0 ? (isDarkMode ? 'bg-slate-900' : 'bg-slate-200/60') : (isDarkMode ? 'bg-slate-950' : 'bg-slate-50'));

                                            return (
                                                <div key={day.id} className={`relative w-[960px] h-full transition-colors ${bgClass}`}>
                                                    {/* DATUM UITLIJNING FIX: Sticky en top-0 */}
                                                    <div className={`sticky top-0 left-0 inline-block px-4 py-2 font-black text-[10px] text-indigo-500 uppercase tracking-widest z-20 backdrop-blur-md rounded-br-xl ${isDarkMode ? 'bg-slate-900/80' : 'bg-white/80'}`}>
                                                        {getRelativeDateLabel(day.id)}
                                                    </div>

                                                    {[...Array(25)].map((_, h) => (
                                                        <div key={h} className="absolute top-0 h-full border-l border-slate-100 dark:border-slate-800 flex flex-col justify-end pb-8" style={{ left: `${(h/24)*100}%` }}>
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
                                                            const barH = Math.min(50, (amt/160)*50);
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
                ) : (
                    <div className="space-y-6 animate-in slide-in-from-right-3 duration-300 pb-12 text-slate-800 dark:text-slate-100">
                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <Moon size={20} className="text-indigo-500" />
                                <h3 className="font-black uppercase text-sm tracking-tight">Weergave</h3>
                            </div>
                            <button onClick={toggleDarkMode} className={`w-full p-4 rounded-2xl flex items-center justify-between border active:scale-95 transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 text-slate-800'}`}>
                                <div className="flex items-center gap-3">{isDarkMode ? <Sun className="text-amber-400" /> : <Moon />} <span>{isDarkMode ? 'Lichte Modus' : 'Donkere Modus'}</span></div>
                                <div className={`w-12 h-6 rounded-full relative transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} /></div>
                            </button>
                        </section>

                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Eye size={20} className="text-indigo-600" />
                                <h3 className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-white">Zichtbaarheid</h3>
                            </div>
                            <div className="space-y-2">
                                {['Fles', 'Borst', 'Vast'].map(key => (
                                    <div key={key} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-800">
                                        <span className="text-[11px] font-black uppercase opacity-60">{key}</span>
                                        <button onClick={() => toggleVisibility(key)} className={`w-10 h-5 rounded-full relative transition-all ${visibilitySettings[key] ? 'bg-indigo-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${visibilitySettings[key] ? 'left-5.5' : 'left-0.5'}`} /></button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-6 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <ShieldCheck size={20} className="text-purple-600" />
                                <h3 className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-white">Doelen</h3>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-800">
                                    <span className="text-[11px] font-black uppercase opacity-60">Vitamine D</span>
                                    <button onClick={() => toggleRequirement('d')} className={`w-10 h-5 rounded-full relative ${vitRequirements.d ? 'bg-purple-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${vitRequirements.d ? 'left-5.5' : 'left-0.5'}`} /></button>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-xl border border-slate-50 dark:border-slate-800">
                                    <span className="text-[11px] font-black uppercase opacity-60">Vitamine K</span>
                                    <button onClick={() => toggleRequirement('k')} className={`w-10 h-5 rounded-full relative ${vitRequirements.k ? 'bg-purple-600' : 'bg-slate-200'}`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${vitRequirements.k ? 'left-5.5' : 'left-0.5'}`} /></button>
                                </div>
                            </div>
                        </section>

                        {/* VERSCHIL UIT VORIGE UPDATE: Versiegeschiedenis Overzicht */}
                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <History size={20} className="text-blue-500" />
                                <h3 className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-white">Versiegeschiedenis</h3>
                            </div>
                            <div className="space-y-3">
                                {VERSION_HISTORY.map((v, i) => (
                                    <div key={v.version} className={`p-3 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[11px] font-black text-blue-500">v{v.version}</span>
                                            {i === 0 && <span className="text-[8px] font-bold uppercase bg-blue-500 text-white px-1.5 py-0.5 rounded-md">Nieuw</span>}
                                        </div>
                                        <ul className="space-y-1">
                                            {v.notes.map((note, idx) => (
                                                <li key={idx} className="text-[10px] text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                                    <span className="opacity-50 mt-0.5">•</span> {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-2">
                                <FlaskConical size={20} className="text-orange-500" />
                                <h3 className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-white">Testen</h3>
                            </div>
                            <div className="grid gap-2">
                                <button onClick={handleInsertTestData} className={`p-4 rounded-xl border active:scale-95 transition-all font-black text-[10px] uppercase border-slate-50 dark:border-slate-800 text-indigo-600`}>Genereer Test Data (1 week)</button>
                                <button onClick={handleDeleteAllTestData} className="p-4 rounded-xl border border-rose-100 dark:border-rose-900/30 bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center gap-2 text-[10px] font-black uppercase active:scale-95" disabled={isSubmitting}><Eraser size={16} /> Wis alle testdata</button>
                            </div>
                        </section>

                        <section className={`p-6 rounded-[2rem] border shadow-sm space-y-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <Database size={20} className="text-emerald-500" />
                                <h3 className="font-black uppercase text-sm tracking-tight text-slate-700 dark:text-white">Gegevens</h3>
                            </div>
                            <div className="grid gap-2 text-indigo-600 dark:text-indigo-400">
                                <button onClick={handleExport} className="p-4 rounded-xl border border-slate-50 dark:border-slate-800 flex items-center justify-between active:scale-95 transition-all text-indigo-600 dark:text-indigo-400">
                                    <div className="flex items-center gap-3"><Download size={18} /><span className="text-xs font-black uppercase tracking-widest">Backup maken</span></div>
                                    <ArrowRight size={14} />
                                </button>
                                <button onClick={() => fileInputRef.current?.click()} className="p-4 rounded-xl border border-slate-50 dark:border-slate-800 flex items-center justify-between active:scale-95 transition-all text-emerald-600 dark:text-emerald-400">
                                    <div className="flex items-center gap-3"><Upload size={18} /><span className="text-xs font-black uppercase tracking-widest">Importeer backup</span></div>
                                    <ArrowRight size={14} />
                                </button>
                            </div>
                        </section>

                        <section className="text-center opacity-30 mt-6"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">v{APP_VERSION}</p></section>
                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                    </div>
                )}
            </main>

            {itemToDelete && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className={`p-6 rounded-[2rem] w-full max-w-xs text-center space-y-4 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-100 text-slate-900'}`}>
                        <Trash2 className="text-red-500 mx-auto" size={32} />
                        <h3 className="font-black text-lg uppercase tracking-tight">Verwijderen?</h3>
                        <div className="grid grid-cols-2 gap-2 pt-2">
                            <button onClick={() => setItemToDelete(null)} className={`py-3 rounded-xl font-black text-xs uppercase bg-slate-100 dark:bg-slate-800`}>Nee</button>
                            <button onClick={confirmDelete} className="py-3 bg-red-500 text-white rounded-xl font-black text-xs uppercase shadow-lg">Ja</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() { return ( <ErrorBoundary><AppInternal /></ErrorBoundary> ); }