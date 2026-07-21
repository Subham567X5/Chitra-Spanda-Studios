import React, { useState, useEffect, useRef } from 'react';
import { DEMO_CREDENTIALS, registerUser } from '../appData';

import { emailValidator } from '../utils/emailValidation';
import { Lock, Mail, User, Eye, EyeOff, ChevronDown, ArrowLeft, Sparkles } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

interface LoginProps {
  credentials?: typeof DEMO_CREDENTIALS;
  onLoginSuccess: (user: typeof DEMO_CREDENTIALS[0]) => void;
  onRegisterAccount?: (newCred: typeof DEMO_CREDENTIALS[0]) => void;
}

// Floating particle component
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div style={{
    position: 'absolute', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168,85,247,0.6) 0%, transparent 70%)',
    animation: 'floatParticle 8s ease-in-out infinite',
    ...style,
  }} />
);

export const Login: React.FC<LoginProps> = ({ credentials = DEMO_CREDENTIALS, onLoginSuccess, onRegisterAccount }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [pendingUser, setPendingUser] = useState<typeof DEMO_CREDENTIALS[0] | null>(null);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpRole, setSignUpRole] = useState('client');
  const [forgotEmail, setForgotEmail] = useState('');
  const [emailPreview, setEmailPreview] = useState<{ icon: string; label: string; color: string }>({ icon: '', label: '', color: '' });
  const [roleOpen, setRoleOpen] = useState(false);
  const [simulatedEmails, setSimulatedEmails] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-mailbox-emails');
    return saved ? JSON.parse(saved) : [];
  });
  const [shake, setShake] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('cs-mailbox-emails');
      setSimulatedEmails(saved ? JSON.parse(saved) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const roleTitles: Record<string, string> = {
    client: 'Client Producer', animator: '3D Animator', designer: 'Character Designer',
    storyboard_artist: 'Storyboard Artist', editor: 'Video Editor', voice_artist: 'Voice Artist',
    freelancer: 'Contract Animator', student: 'Animation Student', intern: 'Studio Intern',
    visitor_public: 'Public Visitor',
  };

  const roleIcons: Record<string, string> = {
    client: '🎬', animator: '✨', designer: '🎨', storyboard_artist: '📐',
    editor: '🎞️', voice_artist: '🎙️', freelancer: '🖊️', student: '🎓',
    intern: '🚀', visitor_public: '👁️',
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 700));
    const match = credentials.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    setIsLoading(false);
    if (match) {
      setError('');
      setPendingUser(match);
      setMfaStep(true);
    } else {
      setError('Invalid email or password. Please check your credentials.');
      triggerShake();
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaCode) return;
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setIsLoading(false);
    
    if (mfaCode === '123456') {
      setError('');
      if (pendingUser) {
        if (rememberMe) localStorage.setItem('cs-auto-login-user', JSON.stringify(pendingUser));
        else localStorage.removeItem('cs-auto-login-user');
        onLoginSuccess(pendingUser);
      }
    } else {
      setError('Invalid authentication code. Please try again.');
      triggerShake();
      setMfaCode('');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signUpName || !signUpEmail || !signUpPassword || !signUpRole) {
      setError('Please fill in all registration fields.'); triggerShake(); return;
    }
    const result = emailValidator.validate(signUpEmail, 'signup-' + (navigator.userAgent || 'ua').slice(0, 40));
    if (!result.valid) { setError(result.message); triggerShake(); return; }
    if (signUpPassword.length < 6) { setError('Password must be at least 6 characters long.'); triggerShake(); return; }
    const exists = credentials.some(c => c.email.toLowerCase() === signUpEmail.toLowerCase());
    if (exists) { setError('An account with this email already exists.'); triggerShake(); return; }

    setIsLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);

    const newCred = { email: signUpEmail, password: signUpPassword, role: signUpRole, name: signUpName, roleTitle: roleTitles[signUpRole] || 'Staff Member' };
    // Persist to localStorage via appData
    registerUser(newCred);
    if (onRegisterAccount) onRegisterAccount(newCred);
    setError('');
    setSuccess(`🎉 Welcome, ${signUpName}! Your account is ready.`);
    setTimeout(() => {
      setEmail(signUpEmail); setPassword(signUpPassword);
      setIsSignUp(false); setSuccess('');
      setSignUpName(''); setSignUpEmail(''); setSignUpPassword(''); setSignUpRole('client');
    }, 2000);
  };


  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    const match = credentials.find(c => c.email.toLowerCase() === forgotEmail.toLowerCase());
    if (match) {
      const newEmail = {
        id: `mail-${Date.now()}`, to: match.email,
        subject: '🔐 Account Recovery: Credentials Retrieved',
        date: new Date().toLocaleString(),
        body: `Hi ${match.name},\n\nWe received a request to recover your credentials for DreamAvian Studios.\n\nYour Account Details:\n---------------------------\n🔑 Login ID / Email: ${match.email}\n🔒 Password: ${match.password}\n👤 Assigned Role: ${match.roleTitle}\n\nPlease keep this information secure.\n\nBest Regards,\nDreamAvian IT Security Gateway`,
      };
      const existing = localStorage.getItem('cs-mailbox-emails');
      const emails = existing ? JSON.parse(existing) : [];
      localStorage.setItem('cs-mailbox-emails', JSON.stringify([newEmail, ...emails]));
      window.dispatchEvent(new Event('storage'));
      setSuccess('📨 Recovery details sent to your secure mailbox below!');
      setIsForgot(false); setForgotEmail('');
      setTimeout(() => setSuccess(''), 4000);
    } else {
      setError('No account found with this email address.'); triggerShake();
    }
  };

  const view = mfaStep ? 'mfa' : isSignUp ? 'signup' : isForgot ? 'forgot' : 'login';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px) scale(1); opacity: 0.4; }
          50% { transform: translateY(-30px) scale(1.1); opacity: 0.8; }
        }
        @keyframes orb-drift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.97); }
        }
        @keyframes login-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes bird-float {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50% { transform: translateY(-18px) rotate(2deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(168,85,247,0.3), 0 0 40px rgba(168,85,247,0.1); }
          50% { box-shadow: 0 0 30px rgba(168,85,247,0.5), 0 0 60px rgba(168,85,247,0.2); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dot-pulse {
          0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        .fresh-login-page {
          font-family: 'Inter', 'Space Grotesk', sans-serif;
          min-height: 100vh;
          display: flex;
          background: #06060f;
        }

        /* LEFT PANEL */
        .fresh-left {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #06060f 0%, #0d0720 40%, #130a2e 70%, #1a0a3e 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px;
          min-height: 100vh;
        }
        @media (max-width: 900px) { .fresh-left { display: none; } }

        .fresh-left-orb1 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%);
          top: -100px; left: -100px; animation: orb-drift 12s ease-in-out infinite;
        }
        .fresh-left-orb2 {
          position: absolute; width: 350px; height: 350px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.2) 0%, transparent 70%);
          bottom: -50px; right: -50px; animation: orb-drift 15s ease-in-out infinite reverse;
        }
        .fresh-left-orb3 {
          position: absolute; width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.15) 0%, transparent 70%);
          top: 40%; right: 80px; animation: orb-drift 10s ease-in-out infinite 3s;
        }

        .fresh-bird {
          width: 180px;
          height: 180px;
          border-radius: 50%;
          border: 2px solid rgba(168, 85, 247, 0.4);
          background: radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(13, 7, 32, 0.6) 80%);
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.3), inset 0 0 20px rgba(168, 85, 247, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: bird-float 6s ease-in-out infinite;
          margin-bottom: 32px;
          z-index: 1;
          position: relative;
        }

        .fresh-brand-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 38px; font-weight: 800; letter-spacing: -1.5px;
          background: linear-gradient(135deg, #ffffff 0%, #d8b4fe 50%, #f59e0b 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin-bottom: 12px; z-index: 1; position: relative;
          text-align: center;
        }

        .fresh-tagline {
          font-size: 16px; color: rgba(255,255,255,0.5); font-weight: 400;
          text-align: center; max-width: 280px; line-height: 1.6;
          z-index: 1; position: relative; margin-bottom: 48px;
        }

        .fresh-pills {
          display: flex; flex-direction: column; gap: 12px; z-index: 1; position: relative;
        }
        .fresh-pill {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 100px; padding: 10px 18px;
          font-size: 13px; color: rgba(255,255,255,0.6);
        }
        .fresh-pill-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          flex-shrink: 0;
        }

        /* RIGHT PANEL */
        .fresh-right {
          width: 480px;
          flex-shrink: 0;
          background: #0d0d1a;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
          border-left: 1px solid rgba(255,255,255,0.06);
          overflow-y: auto;
          min-height: 100vh;
        }
        @media (max-width: 900px) {
          .fresh-right { width: 100%; border-left: none; }
        }

        .fresh-card-inner {
          width: 100%; max-width: 380px;
          animation: slide-up 0.5s ease forwards;
        }
        .fresh-card-inner.shake { animation: login-shake 0.5s ease; }

        .fresh-logo-ring {
          width: 64px; height: 64px; border-radius: 20px;
          overflow: hidden; margin: 0 auto 24px;
          animation: glow-pulse 3s ease-in-out infinite;
          border: 2px solid rgba(168,85,247,0.4);
        }
        .fresh-logo-ring img { width: 100%; height: 100%; object-fit: cover; }

        .fresh-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 28px; font-weight: 700;
          color: #fff; text-align: center;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .fresh-subheading {
          font-size: 13px; color: rgba(255,255,255,0.4);
          text-align: center; margin-bottom: 36px;
        }

        /* Error / Success banners */
        .fresh-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #f87171;
          margin-bottom: 20px; animation: fadeInDown 0.3s ease;
          display: flex; align-items: flex-start; gap: 8px;
        }
        .fresh-success {
          background: rgba(74,222,128,0.08); border: 1px solid rgba(74,222,128,0.2);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #4ade80;
          margin-bottom: 20px; animation: fadeInDown 0.3s ease;
        }

        /* Inputs */
        .fresh-field { margin-bottom: 16px; }
        .fresh-field label {
          display: block; font-size: 11px; font-weight: 600;
          color: rgba(255,255,255,0.35); letter-spacing: 0.8px;
          text-transform: uppercase; margin-bottom: 6px;
        }
        .fresh-input-wrap {
          position: relative;
        }
        .fresh-input-wrap .fi-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.25); pointer-events: none; z-index: 1;
          transition: color 0.2s;
        }
        .fresh-input-wrap:focus-within .fi-icon { color: #a855f7; }
        .fresh-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 13px 14px 13px 44px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          color: #fff; outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .fresh-input::placeholder { color: rgba(255,255,255,0.2); }
        .fresh-input:focus {
          border-color: rgba(168,85,247,0.6);
          background: rgba(168,85,247,0.05);
          box-shadow: 0 0 0 3px rgba(168,85,247,0.1);
        }
        .fresh-input.has-right { padding-right: 44px; }
        .fresh-input-right-btn {
          position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.25); padding: 4px; display: flex;
          transition: color 0.2s;
        }
        .fresh-input-right-btn:hover { color: #a855f7; }

        /* Email preview badge */
        .fresh-email-hint {
          display: flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 500;
          margin-top: 5px; padding-left: 2px;
          transition: color 0.2s;
        }

        /* Role picker */
        .fresh-role-btn {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 13px 14px;
          font-size: 14px; font-family: 'Inter', sans-serif;
          color: #fff; outline: none; cursor: pointer;
          display: flex; align-items: center; justify-content: space-between;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
        }
        .fresh-role-btn:hover, .fresh-role-btn.open {
          border-color: rgba(168,85,247,0.6);
          background: rgba(168,85,247,0.05);
        }
        .fresh-role-menu {
          position: absolute; top: calc(100% + 6px); left: 0; right: 0;
          background: #1a1a2e; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px; padding: 6px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          z-index: 100; animation: fadeInDown 0.2s ease;
          max-height: 250px; overflow-y: auto;
        }
        .fresh-role-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 10px;
          cursor: pointer; transition: background 0.15s;
          font-size: 13px; color: rgba(255,255,255,0.75);
        }
        .fresh-role-item:hover { background: rgba(168,85,247,0.12); color: #fff; }
        .fresh-role-item.active { background: rgba(168,85,247,0.18); color: #d8b4fe; }

        /* Remember me row */
        .fresh-row {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .fresh-checkbox-label {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: rgba(255,255,255,0.4);
          cursor: pointer; user-select: none;
        }
        .fresh-checkbox-label input { accent-color: #a855f7; cursor: pointer; }
        .fresh-link-btn {
          background: none; border: none; cursor: pointer;
          font-size: 13px; color: #a855f7; font-weight: 500;
          padding: 0; transition: color 0.2s;
        }
        .fresh-link-btn:hover { color: #d8b4fe; }

        /* Submit button */
        .fresh-submit {
          width: 100%; padding: 14px;
          border-radius: 14px; border: none; cursor: pointer;
          font-size: 15px; font-weight: 700; font-family: 'Space Grotesk', sans-serif;
          letter-spacing: 0.3px; color: #fff;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #7c3aed 100%);
          background-size: 200% 100%;
          transition: background-position 0.4s ease, transform 0.15s, box-shadow 0.3s;
          box-shadow: 0 4px 20px rgba(124,58,237,0.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          margin-top: 8px;
        }
        .fresh-submit:hover:not(:disabled) {
          background-position: 100% 0;
          box-shadow: 0 6px 28px rgba(124,58,237,0.6);
          transform: translateY(-1px);
        }
        .fresh-submit:active:not(:disabled) { transform: translateY(0); }
        .fresh-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Loading dots */
        .fresh-dots { display: flex; gap: 5px; align-items: center; }
        .fresh-dots span {
          width: 6px; height: 6px; border-radius: 50%;
          background: #fff; animation: dot-pulse 1.2s ease-in-out infinite;
        }
        .fresh-dots span:nth-child(2) { animation-delay: 0.2s; }
        .fresh-dots span:nth-child(3) { animation-delay: 0.4s; }

        /* Divider */
        .fresh-divider {
          display: flex; align-items: center; gap: 12px; margin: 24px 0;
        }
        .fresh-divider-line {
          flex: 1; height: 1px; background: rgba(255,255,255,0.06);
        }
        .fresh-divider-text {
          font-size: 11px; color: rgba(255,255,255,0.2);
          letter-spacing: 1px; font-weight: 600;
        }

        /* Bottom link */
        .fresh-bottom {
          text-align: center; margin-top: 20px;
          font-size: 13px; color: rgba(255,255,255,0.3);
        }
        .fresh-bottom .fresh-link-btn { font-size: 13px; }

        /* Mailbox */
        .fresh-mailbox {
          margin-top: 32px; padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
          width: 100%; max-width: 380px;
        }
        .fresh-mailbox-title {
          font-size: 11px; font-weight: 700; letter-spacing: 1px;
          color: rgba(168,85,247,0.7); text-transform: uppercase;
          margin-bottom: 10px;
        }
        .fresh-mailbox-inner {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 12px;
          max-height: 180px; overflow-y: auto;
          font-size: 11px;
        }
        .fresh-mail-item {
          padding: 10px; border-radius: 8px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.04);
          margin-bottom: 6px;
        }
        .fresh-mail-meta {
          display: flex; justify-content: space-between;
          font-size: 10px; margin-bottom: 4px;
          border-bottom: 1px solid rgba(255,255,255,0.04); padding-bottom: 4px;
        }
        .fresh-mail-subject { font-weight: 600; color: #fff; margin-bottom: 4px; }
        .fresh-mail-body {
          white-space: pre-wrap; color: rgba(255,255,255,0.4);
          font-family: monospace; font-size: 10px; line-height: 1.5;
        }
        .fresh-empty-mail {
          text-align: center; padding: 20px;
          color: rgba(255,255,255,0.2); font-size: 11px;
        }

        /* Back button */
        .fresh-back-btn {
          display: flex; align-items: center; gap: 6px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.35); font-size: 13px;
          padding: 0; margin-bottom: 28px; transition: color 0.2s;
        }
        .fresh-back-btn:hover { color: #a855f7; }

        /* Security badge */
        .fresh-security-note {
          margin-top: 6px; font-size: 10px;
          color: rgba(255,255,255,0.15);
          display: flex; align-items: center; gap: 4px;
          justify-content: center;
        }
      `}</style>

      <div className="fresh-login-page">
        {/* LEFT decorative panel */}
        <div className="fresh-left">
          <div className="fresh-left-orb1" />
          <div className="fresh-left-orb2" />
          <div className="fresh-left-orb3" />

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <Particle key={i} style={{
              width: `${4 + Math.random() * 8}px`,
              height: `${4 + Math.random() * 8}px`,
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${5 + Math.random() * 6}s`,
            }} />
          ))}

          <div className="fresh-bird">
            <img src="https://www.animatedimages.org/data/media/238/animated-eagle-image-0036.gif" alt="DreamAvian Eagle" style={{ width: '120px', height: 'auto', display: 'block', margin: '0 auto', filter: 'drop-shadow(0 0 15px rgba(168,85,247,0.4))', transform: 'scaleX(-1)' }} />
          </div>



          <div className="fresh-brand-name">DreamAvian Studios</div>
          <div className="fresh-tagline">Where Imagination Takes Flight — A Creative Animation Studio</div>

          <div className="fresh-pills">
            {['World-class animation production', 'Collaborative studio portal', 'Secure enterprise access'].map((t, i) => (
              <div className="fresh-pill" key={i}>
                <div className="fresh-pill-dot" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT auth panel */}
        <div className="fresh-right">
          <div ref={cardRef} className={`fresh-card-inner${shake ? ' shake' : ''}`}>

            {/* Back button (for forgot/signup/mfa views) */}
            {(isForgot || isSignUp || mfaStep) && (
              <button className="fresh-back-btn" onClick={() => { setIsForgot(false); setIsSignUp(false); setMfaStep(false); setError(''); setSuccess(''); }}>
                <ArrowLeft size={15} /> Back to Sign In
              </button>
            )}

            {/* Logo */}
            <div className="fresh-logo-ring">
              <img src={logoImg} alt="DreamAvian Studios" />
            </div>

            {/* Heading */}
            <div className="fresh-heading">
              {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Create account' : view === 'mfa' ? 'Security Check' : 'Recover access'}
            </div>
            <div className="fresh-subheading">
              {view === 'login' ? 'Sign in to your DreamAvian Studios portal'
                : view === 'signup' ? 'Join the DreamAvian Studios team'
                : view === 'mfa' ? 'Enter your 6-digit authenticator code'
                : 'Enter your email to retrieve your credentials'}
            </div>

            {/* Error / Success */}
            {error && <div className="fresh-error">⚠️ {error}</div>}
            {success && <div className="fresh-success">{success}</div>}

            {/* ── LOGIN FORM ── */}
            {view === 'login' && (
              <form onSubmit={handleManualLogin}>
                <div className="fresh-field">
                  <label>Email address</label>
                  <div className="fresh-input-wrap">
                    <Mail size={16} className="fi-icon" />
                    <input type="email" className="fresh-input" placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="fresh-field">
                  <label>Password</label>
                  <div className="fresh-input-wrap">
                    <Lock size={16} className="fi-icon" />
                    <input type={showPassword ? 'text' : 'password'} className="fresh-input has-right"
                      placeholder="Enter your password"
                      value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="button" className="fresh-input-right-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="fresh-row">
                  <label className="fresh-checkbox-label">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    Remember me
                  </label>
                  <button type="button" className="fresh-link-btn" onClick={() => { setIsForgot(true); setError(''); setSuccess(''); }}>
                    Forgot password?
                  </button>
                </div>

                <button type="submit" className="fresh-submit" disabled={isLoading}>
                  {isLoading ? <div className="fresh-dots"><span /><span /><span /></div> : <><Sparkles size={16} /> Sign In</>}
                </button>
                <div className="fresh-security-note">🔒 256-bit encrypted secure session</div>

                <div className="fresh-divider">
                  <div className="fresh-divider-line" />
                  <span className="fresh-divider-text">OR</span>
                  <div className="fresh-divider-line" />
                </div>

                <div className="fresh-bottom">
                  Don't have an account?{' '}
                  <button type="button" className="fresh-link-btn" onClick={() => { setIsSignUp(true); setError(''); setSuccess(''); }}>
                    Create one free
                  </button>
                </div>
              </form>
            )}

            {/* ── MFA FORM ── */}
            {view === 'mfa' && (
              <form onSubmit={handleMfaSubmit}>
                <div className="fresh-field">
                  <label>MFA Code</label>
                  <div className="fresh-input-wrap">
                    <Lock size={16} className="fi-icon" />
                    <input type="text" className="fresh-input" placeholder="123456"
                      value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required autoFocus />
                  </div>
                  <div className="fresh-email-hint" style={{ color: 'rgba(255,255,255,0.3)', marginTop: '8px', justifyContent: 'center' }}>
                    💡 In development environment, use code: 123456
                  </div>
                </div>

                <button type="submit" className="fresh-submit" disabled={isLoading || mfaCode.length !== 6}>
                  {isLoading ? <div className="fresh-dots"><span /><span /><span /></div> : <><Sparkles size={16} /> Verify Identity</>}
                </button>
              </form>
            )}

            {/* ── SIGNUP FORM ── */}
            {view === 'signup' && (
              <form onSubmit={handleRegisterSubmit}>
                <div className="fresh-field">
                  <label>Full name</label>
                  <div className="fresh-input-wrap">
                    <User size={16} className="fi-icon" />
                    <input type="text" className="fresh-input" placeholder="Your full name"
                      value={signUpName} onChange={e => setSignUpName(e.target.value)} required />
                  </div>
                </div>

                <div className="fresh-field">
                  <label>Email address</label>
                  <div className="fresh-input-wrap">
                    <Mail size={16} className="fi-icon" />
                    <input type="email" className="fresh-input" placeholder="your@email.com"
                      value={signUpEmail}
                      onChange={e => { setSignUpEmail(e.target.value); setEmailPreview(emailValidator.preview(e.target.value)); }}
                      required />
                  </div>
                  {emailPreview.icon && (
                    <div className="fresh-email-hint" style={{ color: emailPreview.color }}>
                      {emailPreview.icon === 'check' ? '✓' : '✗'} {emailPreview.label}
                    </div>
                  )}
                  {!emailPreview.icon && (
                    <div className="fresh-email-hint" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      🚫 Disposable email addresses are blocked
                    </div>
                  )}
                </div>

                <div className="fresh-field">
                  <label>Password</label>
                  <div className="fresh-input-wrap">
                    <Lock size={16} className="fi-icon" />
                    <input type={showSignUpPassword ? 'text' : 'password'} className="fresh-input has-right"
                      placeholder="Min. 6 characters"
                      value={signUpPassword} onChange={e => setSignUpPassword(e.target.value)} required />
                    <button type="button" className="fresh-input-right-btn" onClick={() => setShowSignUpPassword(!showSignUpPassword)}>
                      {showSignUpPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="fresh-field">
                  <label>Account type</label>
                  <div className="fresh-input-wrap" style={{ position: 'relative' }}>
                    <button type="button" className={`fresh-role-btn${roleOpen ? ' open' : ''}`} onClick={() => setRoleOpen(!roleOpen)}>
                      <span>{roleIcons[signUpRole]} {roleTitles[signUpRole]}</span>
                      <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)', transform: roleOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </button>
                    {roleOpen && (
                      <div className="fresh-role-menu">
                        {Object.entries(roleTitles).map(([val, label]) => (
                          <div key={val} className={`fresh-role-item${signUpRole === val ? ' active' : ''}`}
                            onClick={() => { setSignUpRole(val); setRoleOpen(false); }}>
                            <span>{roleIcons[val]}</span> {label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.2)', marginTop: '5px' }}>
                    Admin roles must be assigned by a System Administrator
                  </div>
                </div>

                <button type="submit" className="fresh-submit" disabled={isLoading}>
                  {isLoading ? <div className="fresh-dots"><span /><span /><span /></div> : <><Sparkles size={16} /> Create Account</>}
                </button>
              </form>
            )}

            {/* ── FORGOT FORM ── */}
            {view === 'forgot' && (
              <form onSubmit={handleForgotSubmit}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', marginBottom: '24px', lineHeight: '1.6' }}>
                  Enter your registered email and we'll send your recovery credentials to the secure mailbox below.
                </p>
                <div className="fresh-field">
                  <label>Registered email</label>
                  <div className="fresh-input-wrap">
                    <Mail size={16} className="fi-icon" />
                    <input type="email" className="fresh-input" placeholder="your@email.com"
                      value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                  </div>
                </div>
                <button type="submit" className="fresh-submit">
                  Send Recovery Credentials
                </button>
              </form>
            )}

            {/* Recovery Mailbox */}
            <div className="fresh-mailbox">
              <div className="fresh-mailbox-title">📬 Secure Recovery Mailbox</div>
              <div className="fresh-mailbox-inner">
                {simulatedEmails.length === 0 ? (
                  <div className="fresh-empty-mail">No recovery emails yet</div>
                ) : simulatedEmails.map((mail: any) => (
                  <div key={mail.id} className="fresh-mail-item">
                    <div className="fresh-mail-meta">
                      <span style={{ color: '#a855f7' }}>{mail.to}</span>
                      <span style={{ color: 'rgba(255,255,255,0.2)' }}>{mail.date}</span>
                    </div>
                    <div className="fresh-mail-subject">{mail.subject}</div>
                    <pre className="fresh-mail-body">{mail.body}</pre>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

