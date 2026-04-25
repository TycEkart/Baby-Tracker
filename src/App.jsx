/**
 * This is the main application component.
 *
 * As a "container" or "smart" component, its primary responsibilities are:
 * 1. Managing the application's state (e.g., user authentication, logs, settings).
 * 2. Handling business logic and data fetching (e.g., interacting with Firebase).
 * 3. Passing state and callback functions down to "presentational" child components.
 *
 * By centralizing state management here, we make the child components simpler and more reusable.
 * They receive data as props and notify the parent of events via callback functions. This is a
 * common and effective pattern in React development.
 */
import React, { useState, useEffect, useMemo, useRef, Component } from 'react';
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
    getFirestore, collection, addDoc, onSnapshot, doc, getDoc,
    setDoc, deleteDoc, updateDoc, Timestamp, getDocs, writeBatch, runTransaction,
    query, where
} from 'firebase/firestore';
import {
    getAuth, onAuthStateChanged,
    GoogleAuthProvider, signInWithPopup, signOut
} from 'firebase/auth';
import {
    Baby, History, BarChart3, Trash2, Clock, Milk, Info, X, Droplets, Calendar,
    Download, Upload, Database, Plus, Minus, AlertTriangle, TrendingUp, Hash,
    Tag, Zap, Filter, Utensils, Settings, ShieldCheck, Heart, RefreshCw,
    ArrowLeft, ArrowRight, Moon, Sun, ChevronLeft, ChevronRight, FlaskConical,
    CheckCircle2, FileCode2, ChevronDown, ChevronUp, Eraser, Sparkles, AlertCircle,
    Eye, EyeOff, Bug, LogOut, Copy, Users, Bath, Bed
} from 'lucide-react';

import { isEveningTime, toSafeDate, toLocalDateString, formatDuration, getDiffMinutes, getLocalDateTimeString, formatDurationInDays } from './utils/helpers';
import { LoginScreen } from './components/LoginScreen';
import { UnauthorizedScreen } from './components/UnauthorizedScreen';
import { Header } from './components/Header';
import { LogForm } from './components/LogForm';
import { LogList } from './components/LogList';
import { TrendsTab } from './components/TrendsTab';
import { SettingsTab } from './components/SettingsTab';
import iconUrl from './assets/icon.svg';

// --- CONFIGURATIE ---
const APP_VERSION = '1.81.4';

const VERSION_HISTORY = [
    { version: '1.81.4', notes: ['Refactored account creation to use a transaction for reliability.'] },
    { version: '1.81.3', notes: ['Improved logging and error handling for account creation.'] },
    { version: '1.81.2', notes: ['Fixed TypeError when accountId is undefined in user profile.'] },
];

// Your web app's Firebase configuration
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
    const [account, setAccount] = useState(null);
    const [authAttempt, setAuthAttempt] = useState(0);
    const [activeTab, setActiveTab] = useState(window.location.hash.substring(1) || 'log');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbStatus, setDbStatus] = useState('initializing');
    const [dbError, setDbError] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(isEveningTime());
    const [toast, setToast] = useState(null);
    const [now, setNow] = useState(new Date());
    const [newMemberUid, setNewMemberUid] = useState('');

    // Settings
    const [fontSize, setFontSize] = useState(2);
    const [vitRequirements, setVitRequirements] = useState({ d: false, k: false });
    const [bathGoal, setBathGoal] = useState({ enabled: false, intervalDays: 3 });
    const [poopGoal, setPoopGoal] = useState({ enabled: false, intervalDays: 2 });
    const [alertThresholds, setAlertThresholds] = useState({ feeding: 20, plas: 20, poep: 20 });
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
    const [vitamins, setVitamins] = useState({ d: false, k: false });
    const [hasBath, setHasBath] = useState(false);
    const [isSleep, setIsSleep] = useState(false);
    const [sleepEndTime, setSleepEndTime] = useState('');
    const [isPlanned, setIsPlanned] = useState(false);
    const [timestamp, setTimestamp] = useState(getLocalDateTimeString());
    const [isSubmitting, setIsSubmitting] = useState(false);

    // UI States
    const [highlightedId, setHighlightedId] = useState(null);
    const [actionTargetId, setActionTargetId] = useState(null);
    const [actionType, setActionType] = useState(null);
    const [selectedDayId, setSelectedDayId] = useState(toLocalDateString(new Date()));
    const [itemToDelete, setItemToDelete] = useState(null);

    const fileInputRef = useRef(null);

    // --- BROWSER HISTORY & VISIBILITY INTEGRATION ---
    useEffect(() => {
        const handleHashChange = () => {
            setActiveTab(window.location.hash.substring(1) || 'log');
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                const lastHiddenTime = localStorage.getItem('appLastHiddenTime');
                const now = Date.now();
                const fiveMinutes = 5 * 60 * 1000;

                if (!lastHiddenTime || (now - parseInt(lastHiddenTime, 10)) > fiveMinutes) {
                    setTimestamp(getLocalDateTimeString());
                }
            } else {
                localStorage.setItem('appLastHiddenTime', Date.now().toString());
            }
        };

        window.addEventListener('popstate', handleHashChange);
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            window.removeEventListener('popstate', handleHashChange);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    useEffect(() => {
        if (window.location.hash.substring(1) !== activeTab) {
            window.location.hash = activeTab;
        }
    }, [activeTab]);


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
        if (!user || !db || isSubmitting || !account) return;
        setIsSubmitting(true);
        try {
            const isFuture = getDiffMinutes(new Date(), timestamp) > 15;
            const payload = {
                timestamp: new Date(timestamp).toISOString(),
                feedType,
                amount: feedType === 'Borst' ? (parseInt(amountLeft || 0) + parseInt(amountRight || 0)) : (feedType === 'Vitamines' ? 0 : parseInt(amount || 0)),
                amountLeft: feedType === 'Borst' ? parseInt(amountLeft || 0) : 0,
                amountRight: feedType === 'Borst' ? parseInt(amountRight || 0) : 0,
                firstBreast: feedType === 'Borst' ? firstBreast : null,
                hasPlas,
                hasPoep,
                vitamins,
                hasBath,
                isSleep,
                sleepEndTime: isSleep && sleepEndTime ? new Date(sleepEndTime).toISOString() : null,
                isPlanned: !!(editingId ? isPlanned : isFuture),
                updatedAt: Timestamp.now()
            };

            let finalId = editingId;
            if (editingId) {
                await updateDoc(doc(db, 'accounts', account.id, 'baby_logs', editingId), payload);
            } else {
                payload.createdAt = Timestamp.now();
                const docRef = await addDoc(collection(db, 'accounts', account.id, 'baby_logs'), payload);
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
        setVitamins({ d: false, k: false });
        setHasBath(false);
        setIsSleep(false);
        setSleepEndTime('');
        setIsPlanned(false);

        if (!keep) {
            setFeedType(null);
            setAmount(0);
            setAmountLeft(0);
            setAmountRight(0);
            setFirstBreast('Links');
        }
    };

    const startEdit = (log) => {
        const isFuture = getDiffMinutes(new Date(), log.timestamp) > 15;
        setEditingId(log.id);
        setFeedType(log.feedType || null);
        setAmount(log.amount || 0);
        setAmountLeft(log.amountLeft || 0);
        setAmountRight(log.amountRight || 0);
        setFirstBreast(log.firstBreast || 'Links');
        setHasPlas(!!log.hasPlas);
        setHasPoep(!!log.hasPoep);
        setVitamins(log.vitamins || { d: false, k: false });
        setHasBath(!!log.hasBath);
        setIsSleep(!!log.isSleep);
        setSleepEndTime(log.sleepEndTime ? getLocalDateTimeString(toSafeDate(log.sleepEndTime)) : '');
        setIsPlanned(!!(log.isPlanned && isFuture));
        setTimestamp(getLocalDateTimeString(toSafeDate(log.timestamp)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const confirmDelete = async () => {
        if (!itemToDelete || !db || !user || !account) return;
        try {
            await deleteDoc(doc(db, 'accounts', account.id, 'baby_logs', itemToDelete));
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

    const adjustSleepEndTime = (mins) => {
        const startTime = new Date(timestamp);
        startTime.setMinutes(startTime.getMinutes() + mins);
        setSleepEndTime(getLocalDateTimeString(startTime));
    };

    const toggleDarkMode = async () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'appearance'), { isDarkMode: newVal }, { merge: true });
        }
    };

    const handleFontSizeChange = async (size) => {
        setFontSize(size);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'appearance'), { fontSize: size }, { merge: true });
        }
    };

    const toggleVisibility = async (key) => {
        const newVis = { ...visibilitySettings, [key]: !visibilitySettings[key] };
        setVisibilitySettings(newVis);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'visibility'), newVis, { merge: true });
        }
    };

    const toggleRequirement = async (key) => {
        const newReqs = { ...vitRequirements, [key]: !vitRequirements[key] };
        setVitRequirements(newReqs);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'vitamin_requirements'), newReqs, { merge: true });
        }
    };

    const handleBathGoalChange = async (newGoal) => {
        setBathGoal(newGoal);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'bath_goal'), newGoal, { merge: true });
        }
    };

    const handlePoopGoalChange = async (newGoal) => {
        setPoopGoal(newGoal);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'poop_goal'), newGoal, { merge: true });
        }
    };

    const handleAlertThresholdChange = async (type, value) => {
        const newThresholds = { ...alertThresholds, [type]: value };
        setAlertThresholds(newThresholds);
        if (user && db && account) {
            await setDoc(doc(db, 'accounts', account.id, 'settings', 'alert_thresholds'), newThresholds, { merge: true });
        }
    };

    const handleExport = () => {
        const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `baby-tracker-backup-${account.id}.json`;
        link.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file || !db || !user || !account) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const data = JSON.parse(ev.target.result);
                if (!Array.isArray(data)) return;
                setIsSubmitting(true);
                for (const item of data) {
                    if (item.timestamp) {
                        const { id, ...rest } = item;
                        await addDoc(collection(db, 'accounts', account.id, 'baby_logs'), { ...rest, createdAt: Timestamp.now() });
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

    const handleSignOut = async () => {
        if (auth) {
            await signOut(auth);
        }
    };

    const handleAddMember = async () => {
        if (!db || !account || !newMemberUid) return;
        setIsSubmitting(true);
        try {
            const accountRef = doc(db, 'accounts', account.id);
            await updateDoc(accountRef, {
                [`members.${newMemberUid}`]: 'member'
            });
            setNewMemberUid('');
            showToast('Member added successfully!');
        } catch (err) {
            setDbError(`Failed to add member: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // --- FIREBASE INIT & AUTH ---
    useEffect(() => {
        if (!auth || !db) return;

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                try {
                    // Query the 'accounts' collection to find the account the user belongs to.
                    const accountsRef = collection(db, 'accounts');
                    const q = query(accountsRef, where(`members.${currentUser.uid}`, '!=', null));
                    const querySnapshot = await getDocs(q);

                    if (!querySnapshot.empty) {
                        // Assuming a user can only be a member of one account.
                        const accountDoc = querySnapshot.docs[0];
                        const accountId = accountDoc.id;
                        setAccount({ id: accountId, ...accountDoc.data() });

                        // Load user-specific settings
                        const loadSet = async (path, setter, defaultValue) => {
                            const snap = await getDoc(doc(db, 'accounts', accountId, 'settings', path));
                            if (snap.exists()) {
                                setter(snap.data());
                            } else if (defaultValue) {
                                setter(defaultValue);
                            }
                        };
                        await Promise.all([
                            loadSet('appearance', (d) => {
                                setIsDarkMode(!!d.isDarkMode);
                                if (d.fontSize) setFontSize(d.fontSize);
                            }),
                            loadSet('visibility', (d) => setVisibilitySettings(v => ({ ...v, ...d }))),
                            loadSet('vitamin_requirements', (d) => setVitRequirements(d)),
                            loadSet('bath_goal', (d) => setBathGoal(g => ({...g, ...d})), { enabled: false, intervalDays: 3 }),
                            loadSet('poop_goal', (d) => setPoopGoal(g => ({...g, ...d})), { enabled: false, intervalDays: 2 }),
                            loadSet('alert_thresholds', (d) => setAlertThresholds(t => ({...t, ...d})), { feeding: 20, plas: 20, poep: 20 })
                        ]);
                    } else {
                        setAccount(null);
                    }
                } catch (err) {
                    console.error("Auth check failed:", err);
                    setDbError(`Auth Check Error: ${err.message}`);
                    setAccount(null);
                }
            } else {
                setUser(null);
                setAccount(null);
                setLogs([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [authAttempt]);

    const createInitialAccount = async () => {
        if (!user) {
            console.error("Create account called without a user.");
            return;
        }
        console.log("Attempting to create initial account for user:", user.uid);
        setLoading(true);
        setDbError(null);
        try {
            // With the new data model, we only need to create a single 'account' document.
            // The security rules for account creation are now simple and robust.
            const newAccountRef = doc(collection(db, 'accounts'));
            await setDoc(newAccountRef, {
                owner: user.uid,
                members: { [user.uid]: 'owner' },
                createdAt: Timestamp.now()
            });

            console.log("Account creation successful. Re-triggering auth check.");
            setAuthAttempt(c => c + 1);
        } catch (err) {
            console.error("Account Creation Error:", err);
            setDbError(`Account Creation Error: ${err.message}`);
        } finally {
            console.log("Finished create account attempt.");
            setLoading(false);
        }
    };


    // --- DATA SYNC ---
    useEffect(() => {
        if (!user || !db || !account) {
            setLogs([]);
            return;
        };
        const colRef = collection(db, 'accounts', account.id, 'baby_logs');
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
    }, [user, account]);

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    // --- MEMOS & COMPUTED STATE ---
    const isOwner = useMemo(() => user && account && account.owner === user.uid, [user, account]);

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
        const hist = trendsChartData.filter(d => d.items.length > 0 && d.id !== todayStr);
        const count = hist.length || 1;

        const calculateAvgInterval = (predicate) => {
            const items = hist.flatMap(d => d.items.filter(predicate)).sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
            if (items.length < 2) return 0;
            const intervals = [];
            for (let i = 1; i < items.length; i++) {
                intervals.push(getDiffMinutes(items[i - 1].timestamp, items[i].timestamp));
            }
            return intervals.reduce((a, b) => a + b, 0) / intervals.length;
        };

        const calculateBucketedAvg = (predicate) => {
            const items = hist.flatMap(d => d.items.filter(predicate)).sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
            const buckets = { night: [], morning: [], afternoon: [], evening: [] };
            if (items.length < 2) return { night: 0, morning: 0, afternoon: 0, evening: 0 };

            for (let i = 1; i < items.length; i++) {
                const interval = getDiffMinutes(items[i - 1].timestamp, items[i].timestamp);
                const hour = toSafeDate(items[i].timestamp).getHours();
                if (hour >= 0 && hour < 6) buckets.night.push(interval);
                else if (hour >= 6 && hour < 12) buckets.morning.push(interval);
                else if (hour >= 12 && hour < 18) buckets.afternoon.push(interval);
                else buckets.evening.push(interval);
            }

            return {
                night: buckets.night.length > 0 ? buckets.night.reduce((a, b) => a + b, 0) / buckets.night.length : 0,
                morning: buckets.morning.length > 0 ? buckets.morning.reduce((a, b) => a + b, 0) / buckets.morning.length : 0,
                afternoon: buckets.afternoon.length > 0 ? buckets.afternoon.reduce((a, b) => a + b, 0) / buckets.afternoon.length : 0,
                evening: buckets.evening.length > 0 ? buckets.evening.reduce((a, b) => a + b, 0) / buckets.evening.length : 0,
            };
        };

        return {
            avgFeedingIntervals: calculateBucketedAvg(i => i.feedType),
            avgPlasInterval: calculateAvgInterval(i => i.hasPlas),
            avgPoepInterval: calculateAvgInterval(i => i.hasPoep),
            totalVoedingen: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType).length, 0) / count).toFixed(1),
            flesCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Fles').length, 0) / count).toFixed(1),
            flesAmount: Math.round(hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Fles').reduce((acc, i) => acc + (Number(i.amount) || 0), 0), 0) / count),
            borstCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Borst').length, 0) / count).toFixed(1),
            borstL: Math.round(hist.reduce((s, d) => s + d.items.reduce((acc, i) => acc + (Number(i.amountLeft) || 0), 0), 0) / count),
            borstR: Math.round(hist.reduce((s, d) => s + d.items.reduce((acc, i) => acc + (Number(i.amountRight) || 0), 0), 0) / count),
            vastCount: (hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Vast').length, 0) / count).toFixed(1),
            vastAmount: Math.round(hist.reduce((s, d) => s + d.items.filter(i => i.feedType === 'Vast').reduce((acc, i) => acc + (Number(i.amount) || 0), 0), 0) / count)
        };
    }, [trendsChartData]);

    const dailyStats = useMemo(() => {
        const todayStr = toLocalDateString(new Date());
        const todaysLogs = logs.filter(l => toLocalDateString(l.timestamp) === todayStr);
        const todaysFeedings = todaysLogs
            .filter(l => l.feedType)
            .sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());

        const feedCount = todaysFeedings.length;

        let avgInterval = null;
        if (feedCount >= 2) {
            const intervals = [];
            for (let i = 1; i < todaysFeedings.length; i++) {
                const diff = getDiffMinutes(todaysFeedings[i - 1].timestamp, todaysFeedings[i].timestamp);
                intervals.push(diff);
            }
            const totalMinutes = intervals.reduce((sum, interval) => sum + interval, 0);
            const avgMinutes = totalMinutes / intervals.length;
            avgInterval = formatDuration(Math.round(avgMinutes));
        }

        const totalFles = todaysLogs
            .filter(l => l.feedType === 'Fles')
            .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

        const totalBorst = todaysLogs
            .filter(l => l.feedType === 'Borst')
            .reduce((sum, l) => sum + (Number(l.amountLeft) || 0) + (Number(l.amountRight) || 0), 0);

        const totalVast = todaysLogs
            .filter(l => l.feedType === 'Vast')
            .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

        return {
            feedCount,
            avgInterval,
            totalFles,
            totalBorst,
            totalVast,
        };
    }, [logs]);

    const typeIntervals = useMemo(() => {
        // Chronological sort: from oldest to newest
        const sorted = [...logs].sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
        const result = {};
        const lastSeen = {
            // Initialize lastSeen for all potential categories
            'Fles': null,
            'Borst': null,
            'Vast': null,
            'poep': null,
            'plas': null,
            'vitamins': null,
            'bath': null,
            'sleep': null,
        };

        sorted.forEach(log => {
            const ts = toSafeDate(log.timestamp);
            const logIntervals = [];

            // Check each category independently
            if (log.feedType) {
                if (lastSeen[log.feedType]) {
                    logIntervals.push({
                        text: formatDuration(getDiffMinutes(lastSeen[log.feedType], ts)),
                        category: log.feedType
                    });
                }
                lastSeen[log.feedType] = ts;
            }
            if (log.hasPoep) {
                if (lastSeen.poep) {
                    logIntervals.push({
                        text: formatDuration(getDiffMinutes(lastSeen.poep, ts)),
                        category: 'poep'
                    });
                }
                lastSeen.poep = ts;
            }
            if (log.hasPlas) {
                if (lastSeen.plas) {
                    logIntervals.push({
                        text: formatDuration(getDiffMinutes(lastSeen.plas, ts)),
                        category: 'plas'
                    });
                }
                lastSeen.plas = ts;
            }
            if (log.vitamins?.d || log.vitamins?.k) {
                if (lastSeen.vitamins) {
                    logIntervals.push({
                        text: formatDuration(getDiffMinutes(lastSeen.vitamins, ts)),
                        category: 'vitamins'
                    });
                }
                lastSeen.vitamins = ts;
            }
            if (log.hasBath) {
                if (lastSeen.bath) {
                    logIntervals.push({
                        text: formatDurationInDays(lastSeen.bath, ts),
                        category: 'bath'
                    });
                }
                lastSeen.bath = ts;
            }
            if (log.isSleep) {
                if (lastSeen.sleep) {
                    logIntervals.push({
                        text: formatDuration(getDiffMinutes(lastSeen.sleep, ts)),
                        category: 'sleep'
                    });
                }
                lastSeen.sleep = ts;
            }

            if (logIntervals.length > 0) {
                result[log.id] = logIntervals;
            }
        });
        return result;
    }, [logs]);

    const lastLogTimes = useMemo(() => {
        const findLast = (predicate) => {
            const log = logs.find(l => predicate(l) && !l.isPlanned);
            if (!log) return { text: '-', mins: 0 };
            const mins = getDiffMinutes(log.timestamp, now);
            return { text: formatDuration(mins), mins };
        };

        return {
            'Fles': findLast(l => l.feedType === 'Fles'),
            'Borst': findLast(l => l.feedType === 'Borst'),
            'Vast': findLast(l => l.feedType === 'Vast'),
            'plas': findLast(l => l.hasPlas),
            'poep': findLast(l => l.hasPoep),
            'vitaminsD': findLast(l => l.vitamins?.d),
            'vitaminsK': findLast(l => l.vitamins?.k),
            'bath': findLast(l => l.hasBath),
            'feeding': findLast(l => l.feedType),
            'sleep': findLast(l => l.isSleep),
        };
    }, [logs, now]);

    const isFormValid = useMemo(() => {
        const hasFeeding = (feedType === 'Borst')
            ? (parseInt(amountLeft || 0) > 0 || parseInt(amountRight || 0) > 0)
            : (feedType && parseInt(amount || 0) > 0);
        return hasFeeding || hasPlas || hasPoep || vitamins.d || vitamins.k || hasBath || isSleep;
    }, [amount, amountLeft, amountRight, feedType, hasPlas, hasPoep, vitamins, hasBath, isSleep]);

    const missingVitamins = useMemo(() => {
        const todayDs = toLocalDateString(new Date());
        const todayLogs = logs.filter(l => toLocalDateString(l.timestamp) === todayDs);
        const hasD = todayLogs.some(l => l.vitamins?.d);
        const hasK = todayLogs.some(l => l.vitamins?.k);
        const list = [];
        if (vitRequirements.d && !hasD) list.push("Vitamine D");
        if (vitRequirements.k && !hasK) list.push("Vitamine K");
        return list;
    }, [logs, vitRequirements]);

    const isBathOverdue = useMemo(() => {
        if (!bathGoal.enabled || logs.length === 0) {
            return false;
        }
        const lastBathLog = logs.find(log => log.hasBath);
        if (!lastBathLog) {
            return true; // No bath ever recorded
        }
        const lastBathDate = toSafeDate(lastBathLog.timestamp);
        lastBathDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceLastBath = (today.getTime() - lastBathDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceLastBath >= bathGoal.intervalDays;
    }, [logs, bathGoal]);

    const isPoopOverdue = useMemo(() => {
        if (!poopGoal.enabled || logs.length === 0) {
            return false;
        }
        const lastPoopLog = logs.find(log => log.hasPoep);
        if (!lastPoopLog) {
            return true; // No poop ever recorded
        }
        const lastPoopDate = toSafeDate(lastPoopLog.timestamp);
        lastPoopDate.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const daysSinceLastPoop = (today.getTime() - lastPoopDate.getTime()) / (1000 * 60 * 60 * 24);

        return daysSinceLastPoop >= poopGoal.intervalDays;
    }, [logs, poopGoal]);

    const feedingIntervalsMap = useMemo(() => {
        const sortedFeedings = logs.filter(l => l.feedType).sort((a, b) => toSafeDate(a.timestamp).getTime() - toSafeDate(b.timestamp).getTime());
        const map = {};
        sortedFeedings.forEach((log, i) => {
            if (i > 0) {
                const diff = getDiffMinutes(sortedFeedings[i - 1].timestamp, log.timestamp);
                map[log.id] = { text: formatDuration(diff), mins: diff };
            }
        });
        return map;
    }, [logs]);

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
            if (!groups[dk]) {
                groups[dk] = {
                    items: [],
                    totalFles: 0,
                    totalBorst: 0,
                    totalVast: 0,
                };
            }
            groups[dk].items.push(l);
            if (l.feedType === 'Fles') {
                groups[dk].totalFles += Number(l.amount) || 0;
            } else if (l.feedType === 'Borst') {
                groups[dk].totalBorst += (Number(l.amountLeft) || 0) + (Number(l.amountRight) || 0);
            } else if (l.feedType === 'Vast') {
                groups[dk].totalVast += Number(l.amount) || 0;
            }
        });
        const result = Object.keys(groups).sort().reverse().map(date => ({
            date,
            ...groups[date]
        }));

        const today = toLocalDateString(new Date());
        const todayGroup = result.find(g => g.date === today);

        if (todayGroup) {
            const nowIndex = todayGroup.items.findIndex(log => toSafeDate(log.timestamp) < now);
            if (nowIndex !== 0) {
                 todayGroup.items.splice(nowIndex, 0, { id: 'now-marker', type: 'now' });
            }
        }

        return result;
    }, [logs, now]);

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

    const handleSelectDay = (dayId) => {
        setSelectedDayId(dayId);
    };

    const handleNavigateDay = (direction) => {
        const currentIndex = trendsChartData.findIndex(d => d.id === selectedDayId);
        const newIndex = currentIndex + direction;
        if (newIndex >= 0 && newIndex < trendsChartData.length) {
            handleSelectDay(trendsChartData[newIndex].id);
        }
    };

    const fontSizeClass = useMemo(() => {
        const sizes = ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl'];
        return sizes[fontSize] || 'text-base';
    }, [fontSize]);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center text-indigo-500 animate-pulse bg-slate-950">
                <img src={iconUrl} className="w-24 h-24" alt="Loading" />
            </div>
        );
    }

    if (!user) {
        return <LoginScreen isDarkMode={isDarkMode} />;
    }

    if (!account) {
        return <UnauthorizedScreen user={user} isDarkMode={isDarkMode} onRetry={createInitialAccount} />;
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'} font-sans pb-10 overflow-x-hidden ${fontSizeClass}`}>
            {dbError && (
                <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between z-[100] sticky top-0 animate-in slide-in-from-top-full duration-300">
                    <div className="flex items-center gap-3"><Bug size={18} /><span className="text-[11px] font-bold opacity-90">{dbError}</span></div>
                    <button onClick={() => setDbError(null)}><X size={16} /></button>
                </div>
            )}

            <Header
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                dbStatus={dbStatus}
                editingId={editingId}
                resetForm={resetForm}
                isDarkMode={isDarkMode}
            />

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
                        {isPoopOverdue && (
                            <section className="bg-amber-600 text-white p-4 rounded-[1.8rem] shadow-lg flex items-center gap-4 border border-amber-500 animate-in fade-in duration-500">
                                <AlertCircle size={28} className="shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-black text-xs uppercase mb-0.5 tracking-wider">Tijd voor een poepje!</h4>
                                    <p className="text-[11px] font-bold opacity-90 leading-tight">Het is {poopGoal.intervalDays} dagen of langer geleden.</p>
                                </div>
                            </section>
                        )}
                        {isBathOverdue && (
                            <section className="bg-sky-500 text-white p-4 rounded-[1.8rem] shadow-lg flex items-center gap-4 border border-sky-400 animate-in fade-in duration-500">
                                <AlertCircle size={28} className="shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-black text-xs uppercase mb-0.5 tracking-wider">Tijd voor een bad!</h4>
                                    <p className="text-[11px] font-bold opacity-90 leading-tight">Het is {bathGoal.intervalDays} dagen of langer geleden.</p>
                                </div>
                            </section>
                        )}
                        {missingVitamins.length > 0 && (
                            <section className="bg-orange-500 text-white p-4 rounded-[1.8rem] shadow-lg flex items-center gap-4 border border-orange-400 animate-in fade-in duration-500">
                                <AlertCircle size={28} className="shrink-0" />
                                <div className="flex-1">
                                    <h4 className="font-black text-xs uppercase mb-0.5 tracking-wider">Vitamines nodig!</h4>
                                    <p className="text-[11px] font-bold opacity-90 leading-tight">Vandaag nog geen <span className="underline decoration-2">{missingVitamins.join(' & ')}</span> gelogd.</p>
                                </div>
                            </section>
                        )}

                        <LogForm
                            editingId={editingId}
                            isDarkMode={isDarkMode}
                            lastLogTimes={lastLogTimes}
                            dailyStats={dailyStats}
                            weeklyAvgs={weeklyAvgs}
                            alertThresholds={alertThresholds}
                            handleSave={handleSave}
                            isSubmitting={isSubmitting}
                            isFormValid={isFormValid}
                            feedType={feedType}
                            setFeedType={setFeedType}
                            handleFeedTypeToggle={handleFeedTypeToggle}
                            visibleFeedTypes={visibleFeedTypes}
                            timestamp={timestamp}
                            setTimestamp={setTimestamp}
                            adjustTime={adjustTime}
                            adjustSleepEndTime={adjustSleepEndTime}
                            firstBreast={firstBreast}
                            setFirstBreast={setFirstBreast}
                            amountLeft={amountLeft}
                            setAmountLeft={setAmountLeft}
                            amountRight={amountRight}
                            setAmountRight={setAmountRight}
                            amount={amount}
                            setAmount={setAmount}
                            hasPlas={hasPlas}
                            setHasPlas={setHasPlas}
                            hasPoep={hasPoep}
                            setHasPoep={setHasPoep}
                            vitamins={vitamins}
                            setVitamins={setVitamins}
                            hasBath={hasBath}
                            setHasBath={setHasBath}
                            isSleep={isSleep}
                            setIsSleep={setIsSleep}
                            sleepEndTime={sleepEndTime}
                            setSleepEndTime={setSleepEndTime}
                            isPlanned={isPlanned}
                            setIsPlanned={setIsPlanned}
                        />

                        <LogList
                            groupedLogsList={groupedLogsList}
                            highlightedId={highlightedId}
                            editingId={editingId}
                            actionType={actionType}
                            startEdit={startEdit}
                            setItemToDelete={setItemToDelete}
                            isDarkMode={isDarkMode}
                            typeIntervals={typeIntervals}
                            now={now}
                        />
                    </>
                ) : activeTab === 'trends' ? (
                    <TrendsTab
                        weeklyAvgs={weeklyAvgs}
                        trendsChartData={trendsChartData}
                        selectedDayId={selectedDayId}
                        handleSelectDay={handleSelectDay}
                        handleNavigateDay={handleNavigateDay}
                        selectedDayStats={selectedDayStats}
                        isDarkMode={isDarkMode}
                        feedingIntervalsMap={feedingIntervalsMap}
                        setActiveTab={setActiveTab}
                        startEdit={startEdit}
                    />
                ) : (
                    <SettingsTab
                        isDarkMode={isDarkMode}
                        toggleDarkMode={toggleDarkMode}
                        fontSize={fontSize}
                        onFontSizeChange={handleFontSizeChange}
                        visibilitySettings={visibilitySettings}
                        toggleVisibility={toggleVisibility}
                        vitRequirements={vitRequirements}
                        toggleRequirement={toggleRequirement}
                        bathGoal={bathGoal}
                        onBathGoalChange={handleBathGoalChange}
                        poopGoal={poopGoal}
                        onPoopGoalChange={handlePoopGoalChange}
                        alertThresholds={alertThresholds}
                        onAlertThresholdChange={handleAlertThresholdChange}
                        handleExport={handleExport}
                        fileInputRef={fileInputRef}
                        handleImport={handleImport}
                        isOwner={isOwner}
                        newMemberUid={newMemberUid}
                        setNewMemberUid={setNewMemberUid}
                        handleAddMember={handleAddMember}
                        isSubmitting={isSubmitting}
                        account={account}
                        handleSignOut={handleSignOut}
                        APP_VERSION={APP_VERSION}
                    />
                )}
            </main>

            {itemToDelete && (
                <div className="fixed inset-0 z-[100] bg-slate-900/80 flex items-center justify-center p-6 backdrop-blur-sm">
                    <div className={`p-6 rounded-[2rem] w-full max-w-xs text-center space-y-4 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
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