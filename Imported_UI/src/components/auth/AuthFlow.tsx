import React, { useState, useEffect, useRef } from 'react';
import {
  Ship,
  Shield,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Building2,
  User,
  Phone,
  FileCheck,
  MapPin,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';

export interface UserSession {
  email: string;
  firmName: string;
  contactPerson: string;
  mobile: string;
  gstin?: string;
  city: string;
  opsPhone?: string;
}

interface AuthFlowProps {
  onLoginSuccess: (user: UserSession) => void;
  initialScreen?: 'login' | 'register';
}

type AuthScreen =
  | 'login'
  | 'register-step1-email'
  | 'register-step2-password'
  | 'register-step3-firm'
  | 'register-success'
  | 'forgot-password';

export const AuthFlow: React.FC<AuthFlowProps> = ({
  onLoginSuccess,
  initialScreen = 'login',
}) => {
  const [screen, setScreen] = useState<AuthScreen>(
    initialScreen === 'register' ? 'register-step1-email' : 'login'
  );

  // Login Form States
  const [loginEmail, setLoginEmail] = useState('aman@riddhisiddhi.com');
  const [loginPassword, setLoginPassword] = useState('Demurrage@2026');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Registration Form States
  const [regEmail, setRegEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Step 2: Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Step 3: Firm Details
  const [firmName, setFirmName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [gstin, setGstin] = useState('');
  const [city, setCity] = useState('Gandhidham');
  const [opsPhone, setOpsPhone] = useState('');
  const [firmError, setFirmError] = useState('');

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpSent, otpTimer]);

  // Password strength calculation
  const getPasswordStrength = (pass: string): { strength: 'Weak' | 'Medium' | 'Strong'; score: number; color: string; width: string } => {
    if (!pass) return { strength: 'Weak', score: 0, color: 'bg-zinc-700', width: '0%' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) {
      return { strength: 'Weak', score: 1, color: 'bg-rose-500', width: '33%' };
    } else if (score <= 3) {
      return { strength: 'Medium', score: 2, color: 'bg-amber-400', width: '66%' };
    } else {
      return { strength: 'Strong', score: 3, color: 'bg-emerald-400', width: '100%' };
    }
  };

  const passStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword.length > 0 && confirmPassword.length > 0 && newPassword === confirmPassword;

  // Handler: Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    setTimeout(() => {
      setIsLoggingIn(false);
      // Construct user session
      let firm = 'Riddhi Siddhi Freight Forwarders';
      let contact = 'Ramesh Agarwal';
      let phone = '8160024858';
      let userCity = 'Gandhidham';

      if (loginEmail.toLowerCase().includes('kutch')) {
        firm = 'Kutch Logistics & Clearing Pvt Ltd';
        contact = 'Harish Patel';
        userCity = 'Mundra';
      } else if (loginEmail.toLowerCase().includes('apex')) {
        firm = 'Apex Maritime India Agency';
        contact = 'Deepak Mehta';
        userCity = 'Mumbai';
      }

      onLoginSuccess({
        email: loginEmail,
        firmName: firm,
        contactPerson: contact,
        mobile: phone,
        city: userCity,
        opsPhone: '+91 98765 43210',
      });
    }, 600);
  };

  // Handler: Send OTP (Step 1)
  const handleSendOtp = () => {
    setOtpError('');
    if (!regEmail || !regEmail.includes('@') || !regEmail.includes('.')) {
      setOtpError('Please enter a valid email address.');
      return;
    }
    setOtpSent(true);
    setOtpTimer(30);
    // Autofill demo code helper for testing
    setOtpDigits(['8', '1', '6', '0', '0', '2']);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  // Handler: OTP Input digit change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste of full 6-digit OTP
      const pasted = value.replace(/[^0-9]/g, '').slice(0, 6).split('');
      if (pasted.length > 0) {
        const nextDigits = [...otpDigits];
        pasted.forEach((char, idx) => {
          if (idx < 6) nextDigits[idx] = char;
        });
        setOtpDigits(nextDigits);
        const focusTarget = Math.min(pasted.length, 5);
        otpInputRefs.current[focusTarget]?.focus();
        return;
      }
    }

    const cleanChar = value.slice(-1).replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];
    newDigits[index] = cleanChar;
    setOtpDigits(newDigits);

    // Auto-focus next input if digit entered
    if (cleanChar && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setOtpError('Please enter all 6 digits of the OTP.');
      return;
    }
    setOtpError('');
    setScreen('register-step2-password');
  };

  // Handler: Password continue (Step 2)
  const handleContinuePassword = () => {
    setPasswordError('');
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }
    setScreen('register-step3-firm');
  };

  // Handler: Complete Registration (Step 3)
  const handleCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    setFirmError('');

    if (!firmName.trim()) {
      setFirmError('Please enter your Firm / Company Name.');
      return;
    }
    if (!contactPerson.trim()) {
      setFirmError('Please enter the Contact Person name.');
      return;
    }
    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (cleanMobile.length !== 10) {
      setFirmError('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Success Screen
    setScreen('register-success');

    const newUser: UserSession = {
      email: regEmail || 'user@company.com',
      firmName: firmName.trim(),
      contactPerson: contactPerson.trim(),
      mobile: cleanMobile,
      gstin: gstin.trim().toUpperCase() || undefined,
      city: city,
      opsPhone: opsPhone.trim() || undefined,
    };

    // Auto redirect after 3 seconds
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 3000);
  };

  // Quick Demo Account Autofills
  const fillDemoAccount = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div className="min-h-screen bg-[#060a10] text-[#dfe6f0] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-[#f97316]/30 selection:text-white">
      {/* Background Decorative Ambient Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#161f30_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Main Centered Authentication Card */}
      <div className="w-full max-w-md bg-[#0d131f] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in transition-all">
        {/* Card Header Branding */}
        <div className="pt-8 pb-6 px-6 sm:px-8 text-center border-b border-[var(--border)]/60 bg-gradient-to-b from-[#131b2b] to-[#0d131f]">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-xl shadow-orange-500/25 mb-3.5 border border-orange-400/30">
            <Shield className="w-7 h-7 text-white" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <h1 className="font-heading font-black text-white text-xl sm:text-2xl tracking-tight">
              MAPS D&D Alert Engine
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-[10px] font-extrabold font-mono-data text-orange-400 uppercase">
              BENTO v1.0
            </span>
          </div>

          <p className="text-xs text-[var(--muted)] mt-1.5 font-medium">
            Container Detention & Demurrage Automation Platform
          </p>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 1: LOGIN */}
        {/* ------------------------------------------------------------- */}
        {screen === 'login' && (
          <div className="p-6 sm:p-8 space-y-5">
            {loginError && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@firm.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setScreen('forgot-password')}
                    className="text-xs text-zinc-400 hover:text-orange-400 font-medium transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-white cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Autofill Helpers */}
            <div className="bg-[#121927] border border-[var(--border)]/70 p-3 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono-data text-[var(--dim)] uppercase font-bold">
                <span className="flex items-center gap-1 text-orange-400">
                  <Zap className="w-3 h-3" /> Quick Demo Fill
                </span>
                <span>Click to Autofill</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('aman@riddhisiddhi.com', 'Demurrage@2026')}
                  className="bg-[#162032] hover:bg-orange-500/20 hover:border-orange-500/40 border border-[var(--border)] text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl font-medium text-left truncate transition-colors cursor-pointer"
                >
                  🏢 Riddhi Siddhi CHA
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('ops@kutchlogistics.in', 'Demurrage@2026')}
                  className="bg-[#162032] hover:bg-orange-500/20 hover:border-orange-500/40 border border-[var(--border)] text-[11px] text-zinc-300 hover:text-white px-2.5 py-1.5 rounded-xl font-medium text-left truncate transition-colors cursor-pointer"
                >
                  🚢 Kutch Logistics
                </button>
              </div>
            </div>

            {/* Divider "OR" */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-[var(--border)] w-full" />
              <span className="bg-[#0d131f] px-3 text-[10px] font-mono-data uppercase text-[var(--dim)] font-extrabold absolute">
                OR
              </span>
            </div>

            {/* Register link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setRegEmail('');
                  setOtpSent(false);
                  setOtpDigits(['', '', '', '', '', '']);
                  setScreen('register-step1-email');
                }}
                className="text-xs text-[#f97316] hover:text-orange-400 font-bold transition-colors cursor-pointer inline-flex items-center gap-1 group"
              >
                <span>New here? Register your firm</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 2: REGISTER (Step 1 of 3: Verify Email) */}
        {/* ------------------------------------------------------------- */}
        {screen === 'register-step1-email' && (
          <div className="p-6 sm:p-8 space-y-5">
            {/* Step Progress Indicator (1 of 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-data font-bold">
                <span className="text-orange-400 uppercase tracking-wider">Step 1 of 3</span>
                <span className="text-[var(--muted)]">Email Verification</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-1.5 rounded-full bg-orange-500" />
                <div className="h-1.5 rounded-full bg-zinc-800" />
                <div className="h-1.5 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-heading font-black text-white">
                Register Your Firm
              </h2>
              <p className="text-xs text-[var(--muted)] font-medium">
                Start tracking containers in 2 minutes
              </p>
            </div>

            {otpError && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{otpError}</span>
              </div>
            )}

            {/* Step 1 Email Input */}
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="operations@yourfirm.com"
                    disabled={otpSent}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors disabled:opacity-70"
                  />
                </div>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                /* OTP Verification Section */
                <div className="space-y-4 pt-2 animate-fade-in">
                  <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3.5 py-2 rounded-xl text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>OTP sent to <strong>{regEmail}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-[10px] text-zinc-400 hover:text-white underline cursor-pointer"
                    >
                      Change
                    </button>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-center text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                      Enter 6-Digit Verification Code
                    </label>

                    {/* 6 OTP Digit Boxes */}
                    <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                      {otpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          ref={(el) => {
                            otpInputRefs.current[idx] = el;
                          }}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono font-black text-lg sm:text-xl text-white bg-[#162032] border border-[var(--border)] focus:border-orange-500 focus:bg-orange-500/10 rounded-2xl outline-none transition-all shadow-inner"
                        />
                      ))}
                    </div>
                  </div>

                  {/* Resend OTP */}
                  <div className="flex items-center justify-between text-xs font-mono-data pt-1">
                    <span className="text-[var(--dim)]">Didn&apos;t receive code?</span>
                    {otpTimer > 0 ? (
                      <span className="text-zinc-400 font-bold">
                        Resend in <strong className="text-orange-400">{otpTimer}s</strong>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-orange-400 hover:text-orange-300 font-bold hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* Verify OTP Button */}
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Verify OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Back to login */}
            <div className="text-center pt-2 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 3: SET PASSWORD (Step 2 of 3) */}
        {/* ------------------------------------------------------------- */}
        {screen === 'register-step2-password' && (
          <div className="p-6 sm:p-8 space-y-5">
            {/* Step Progress Indicator (2 of 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-data font-bold">
                <span className="text-orange-400 uppercase tracking-wider">Step 2 of 3</span>
                <span className="text-[var(--muted)]">Set Password</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <div className="h-1.5 rounded-full bg-orange-500" />
                <div className="h-1.5 rounded-full bg-zinc-800" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-heading font-black text-white">
                Set Your Password
              </h2>
              <p className="text-xs text-[var(--muted)] font-medium">
                Create a secure password for your firm account
              </p>
            </div>

            {passwordError && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{passwordError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Strength Indicator Bar */}
                {newPassword.length > 0 && (
                  <div className="space-y-1 pt-1 animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] font-mono-data font-bold">
                      <span className="text-[var(--dim)]">Password Strength:</span>
                      <span className={
                        passStrength.strength === 'Weak' ? 'text-rose-400' :
                        passStrength.strength === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        {passStrength.strength}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passStrength.color}`}
                        style={{ width: passStrength.width }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                    Confirm Password
                  </label>
                  {confirmPassword.length > 0 && (
                    <span className={`text-[11px] font-mono-data font-bold flex items-center gap-1 ${
                      passwordsMatch ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {passwordsMatch ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Passwords match
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" /> Passwords do not match
                        </>
                      )}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--muted)] hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="button"
                onClick={handleContinuePassword}
                disabled={!newPassword || newPassword.length < 6 || !passwordsMatch}
                className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Back to Step 1 */}
            <div className="text-center pt-2 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setScreen('register-step1-email')}
                className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Email</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 4: FIRM DETAILS (Step 3 of 3) */}
        {/* ------------------------------------------------------------- */}
        {screen === 'register-step3-firm' && (
          <div className="p-6 sm:p-8 space-y-5">
            {/* Step Progress Indicator (3 of 3) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono-data font-bold">
                <span className="text-orange-400 uppercase tracking-wider">Step 3 of 3</span>
                <span className="text-[var(--muted)]">Firm Details</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <div className="h-1.5 rounded-full bg-emerald-500" />
                <div className="h-1.5 rounded-full bg-orange-500" />
              </div>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-heading font-black text-white">
                Tell us about your firm
              </h2>
              <p className="text-xs text-[var(--muted)] font-medium">
                Set up your freight forwarder or CHA workspace
              </p>
            </div>

            {firmError && (
              <div className="bg-rose-500/15 border border-rose-500/40 text-rose-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{firmError}</span>
              </div>
            )}

            <form onSubmit={handleCompleteRegistration} className="space-y-3.5">
              {/* Firm Name */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Firm Name <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    placeholder="Riddhi Siddhi Freight Forwarders"
                    className="w-full pl-10 pr-4 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Contact Person */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Contact Person Name <span className="text-orange-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="Ramesh Agarwal"
                    className="w-full pl-10 pr-4 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Mobile Number with +91 Prefix */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Mobile Number <span className="text-orange-400">*</span>
                </label>
                <div className="relative flex">
                  <span className="inline-flex items-center px-3 rounded-l-2xl border border-r-0 border-[var(--border)] bg-[#101826] text-orange-400 font-mono-data font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="98765 43210"
                    className="w-full px-3 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-r-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors font-mono"
                  />
                </div>
              </div>

              {/* GSTIN (optional) & City (dropdown) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* GSTIN */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                    GSTIN <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={15}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="24AAXYZ1234A1Z5"
                      className="w-full px-3 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs text-white placeholder-zinc-500 outline-none uppercase font-mono"
                    />
                  </div>
                </div>

                {/* City dropdown */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                    City <span className="text-orange-400">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="Gandhidham">Gandhidham</option>
                      <option value="Mundra">Mundra</option>
                      <option value="Bhuj">Bhuj</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ops Team Phone (optional) */}
              <div className="space-y-1">
                <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                  Ops Team Phone <span className="text-zinc-500 text-[10px] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={opsPhone}
                    onChange={(e) => setOpsPhone(e.target.value)}
                    placeholder="For alerts to your ops team"
                    className="w-full pl-10 pr-4 py-2 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs text-white placeholder-zinc-500 outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Complete Registration</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>

            {/* Back to Step 2 */}
            <div className="text-center pt-1 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setScreen('register-step2-password')}
                className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Password</span>
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SCREEN 5: REGISTRATION SUCCESS */}
        {/* ------------------------------------------------------------- */}
        {screen === 'register-success' && (
          <div className="p-8 sm:p-10 text-center space-y-5 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-xl shadow-emerald-500/20 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-white">
                Registration Complete!
              </h2>
              <p className="text-sm text-emerald-300 font-medium">
                Welcome aboard, <strong className="text-white">{contactPerson || 'Partner'}</strong>!
              </p>
              <p className="text-xs text-[var(--muted)]">
                Firm: <strong className="text-zinc-200">{firmName}</strong> ({city})
              </p>
            </div>

            <div className="pt-4 border-t border-[var(--border)]/60 flex items-center justify-center gap-2 text-xs font-mono-data text-orange-400">
              <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
              <span>Redirecting to dashboard in 3 seconds...</span>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* FORGOT PASSWORD MODAL/SCREEN */}
        {/* ------------------------------------------------------------- */}
        {screen === 'forgot-password' && (
          <div className="p-6 sm:p-8 space-y-5">
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-heading font-black text-white">
                Reset Password
              </h2>
              <p className="text-xs text-[var(--muted)] font-medium">
                Enter your registered email to receive a password reset OTP
              </p>
            </div>

            {!forgotSubmitted ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (forgotEmail) setForgotSubmitted(true);
                }}
                className="space-y-4"
              >
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono-data uppercase tracking-wider text-[var(--dim)] font-bold">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--muted)]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="aman@riddhisiddhi.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-[#162032] border border-[var(--border)] focus:border-orange-500 rounded-2xl text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-extrabold py-3 px-4 rounded-2xl text-sm transition-all shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Send Reset Instructions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="text-xs text-zinc-300">
                  Password reset link & OTP have been sent to <strong className="text-orange-400">{forgotEmail}</strong>. Please check your inbox.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setForgotSubmitted(false);
                    setScreen('login');
                  }}
                  className="w-full bg-[#162032] hover:bg-[#1f2d47] text-white font-bold py-2.5 px-4 rounded-2xl text-xs border border-[var(--border)] transition-colors cursor-pointer"
                >
                  Return to Login
                </button>
              </div>
            )}

            <div className="text-center pt-2 border-t border-[var(--border)]/60">
              <button
                type="button"
                onClick={() => setScreen('login')}
                className="text-xs text-zinc-400 hover:text-white font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </div>
        )}

        {/* Card Footer Brand Note */}
        <div className="py-3.5 px-6 bg-[#090e17] border-t border-[var(--border)]/40 text-center">
          <p className="text-[11px] text-[var(--dim)] font-mono-data font-medium">
            MAPS Tech & AI | <a href="https://mapsai.in" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-orange-400 transition-colors">mapsai.in</a>
          </p>
        </div>
      </div>
    </div>
  );
};
