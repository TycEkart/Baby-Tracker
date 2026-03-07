/**
 * This component is displayed when the user is not logged in.
 * It provides a simple interface for the user to sign in with their Google account.
 */
import React from 'react';
import { Baby } from 'lucide-react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function LoginScreen({ isDarkMode }) {
    const handleGoogleSignIn = async () => {
        const auth = getAuth();
        if (!auth) return;
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Google Sign-In Error:", error);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-6 text-center font-sans ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            <div className={`p-8 rounded-[2rem] shadow-2xl max-w-sm w-full space-y-6 border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex flex-col items-center gap-2">
                    <Baby size={48} className="text-indigo-500" />
                    <h1 className="text-2xl font-black tracking-tight">Baby Tracker</h1>
                    <p className="text-sm opacity-60">Log and track your baby's activities.</p>
                </div>
                <button
                    onClick={handleGoogleSignIn}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20"
                >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
                        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.218,44,30.668,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                    </svg>
                    Sign In with Google
                </button>
            </div>
        </div>
    );
}
