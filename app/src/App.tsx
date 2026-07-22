import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { DashboardShell } from './components/DashboardShell';
import { Dashboards } from './components/Dashboards';
import { AIAssistant } from './components/AIAssistant';
import { DEMO_CREDENTIALS } from './appData';


const APP_VERSION = '9.0.1';


function App() {
  const [credentials, setCredentials] = useState<typeof DEMO_CREDENTIALS>(() => {
    // Force-clear localStorage if version changed (removes all old demo data)
    const storedVersion = localStorage.getItem('cs-app-version');
    if (storedVersion !== APP_VERSION) {
      localStorage.clear();
      localStorage.setItem('cs-app-version', APP_VERSION);
      return DEMO_CREDENTIALS;
    }

    const saved = localStorage.getItem('cs-credentials');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed;
      } catch (e) {}
    }
    return DEMO_CREDENTIALS;
  });

  const [user, setUser] = useState<(typeof DEMO_CREDENTIALS[0] & { avatar?: string; phone?: string }) | null>(() => {
    const saved = localStorage.getItem('cs-auto-login-user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });
  const [aiOpen, setAIOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    localStorage.setItem('cs-credentials', JSON.stringify(credentials));
  }, [credentials]);

  // Cross-tab sync for active user session & credentials
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cs-auto-login-user') {
        if (e.newValue) {
          try { setUser(JSON.parse(e.newValue)); } catch (err) {}
        } else {
          setUser(null);
        }
      }
      if (e.key === 'cs-credentials' && e.newValue) {
        try { setCredentials(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Futuristic Web Audio Synthesizer + speech feedback
  const playPortalSound = (message: string, isLogin: boolean = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Synthesize high-tech login sweep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const filter = audioCtx.createBiquadFilter();
      
      osc.type = isLogin ? 'sawtooth' : 'sine';
      filter.type = 'lowpass';
      
      if (isLogin) {
        // High-tech portal login noise
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15);
        osc.frequency.linearRampToValueAtTime(300, audioCtx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.5);
        
        filter.frequency.setValueAtTime(300, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
      } else {
        // Subtle boot sweep
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.4);
        
        filter.frequency.setValueAtTime(200, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(1500, audioCtx.currentTime + 0.4);
        
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      }
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioCtx.destination);
      
      osc.start();
      osc.stop(audioCtx.currentTime + 0.6);
    } catch (e) {
      console.log("Audio Context blocked or not supported", e);
    }

    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.pitch = 0.45; // Low robotic tone
        utterance.rate = 1.05;  // Cyber rhythm
        utterance.volume = 0.9;
        
        const voices = window.speechSynthesis.getVoices();
        const engVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Microsoft') || v.name.includes('Natural') || v.name.includes('Zira') || v.name.includes('David')));
        if (engVoice) {
          utterance.voice = engVoice;
        }
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.log("SpeechSynthesis error: ", e);
    }
  };

  // Play system sound on first page interaction
  useEffect(() => {
    let initialized = false;
    const handleFirstInteraction = () => {
      if (initialized) return;
      initialized = true;
      playPortalSound("DreamAvian Systems initialized. Security protocols online.");
      
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const getDefaultTabForRole = (role: string) => {
    if (role === 'super_admin') return 'Global Monitor';
    if (role === 'studio_owner') return 'Studio Overview';
    if (role === 'director') return 'Approvals Queue';
    if (role === 'producer') return 'Production Stats';
    if (role === 'project_manager') return 'Sprints & Workload';
    if (role === 'team_lead') return 'Team Task Monitor';
    if (['animator', 'designer', 'storyboard_artist', 'editor'].includes(role)) return 'My Workspace';
    if (role === 'voice_artist') return 'Recording Booth';
    if (role === 'freelancer') return 'Freelancer Center';
    if (role === 'client') return 'Client Welcome';
    if (role === 'hr') return 'HR Command Center';
    if (role === 'recruiter') return 'Recruit Pipelines';
    if (role === 'finance') return 'General Ledger';
    if (['academy_director', 'trainer', 'student'].includes(role)) return 'LMS Classroom';
    if (role === 'intern') return 'Intern Studio Bench';
    if (role === 'mentor') return 'Mentor Station';
    if (role === 'id_card_admin') return 'Security Access Control';
    if (role === 'visitor_public') return 'Home';
    return 'Dashboard';
  };

  const handleLogin = (loggedInUser: typeof DEMO_CREDENTIALS[0]) => {
    setUser(loggedInUser);
    setActiveTab(getDefaultTabForRole(loggedInUser.role));
    
    // Play role-specific robotic welcome sound
    let welcomeMsg = `Access granted. Welcome back, ${loggedInUser.name}.`;
    if (loggedInUser.role === 'super_admin') {
      welcomeMsg = `Access granted. Welcome back, Administrator Mukherjee. Systems under full console control.`;
    } else if (loggedInUser.role === 'voice_artist') {
      welcomeMsg = `Access granted. Vocal booth initialized. Recording feedback stream is online.`;
    } else if (['academy_director', 'trainer', 'student', 'intern'].includes(loggedInUser.role)) {
      welcomeMsg = `Access granted. DreamAvian LMS database loaded. Welcome to learning space.`;
    } else if (loggedInUser.role === 'client') {
      welcomeMsg = `Access granted. Client dashboard online. High resolution render deliveries ready for review.`;
    }
    
    // Slight delay to allow UI transition
    setTimeout(() => {
      playPortalSound(welcomeMsg, true);
    }, 150);
  };

  const handleUpdateCurrentUser = (updatedUser: typeof DEMO_CREDENTIALS[0] & { avatar?: string; phone?: string }) => {
    const oldEmail = user?.email;
    setUser(updatedUser);
    if (localStorage.getItem('cs-auto-login-user')) {
      localStorage.setItem('cs-auto-login-user', JSON.stringify(updatedUser));
    }
    if (oldEmail) {
      setCredentials(prev => prev.map(c => c.email.toLowerCase() === oldEmail.toLowerCase() ? updatedUser : c));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('cs-auto-login-user');
    setUser(null);
    setAIOpen(false);
    playPortalSound("Terminal session terminated. Goodbye.", false);
  };

  return (
    <>
      <div className="advanced-orb-1"></div>
      <div className="advanced-orb-2"></div>
      {!user ? (
        <Login 
          credentials={credentials} 
          onLoginSuccess={handleLogin} 
          onRegisterAccount={(newCred) => setCredentials(prev => [...prev, newCred])}
        />
      ) : (
        <DashboardShell 
          user={user} 
          onLogout={handleLogout} 
          onToggleAI={() => setAIOpen(!aiOpen)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onUpdateUser={handleUpdateCurrentUser}
        >
          <div style={styles.mainLayout}>
            <div style={{ ...styles.dashboardContainer, marginRight: aiOpen ? '380px' : '0px' }}>
              <Dashboards 
                role={user.role} 
                userEmail={user.email} 
                userName={user.name} 
                userAvatar={user.avatar}
                activeTab={activeTab} 
                credentials={credentials}
                onAddCredential={(newCred) => setCredentials(prev => [...prev, newCred])}
                onUpdateCredential={(email, updatedCred) => setCredentials(prev => prev.map(c => c.email.toLowerCase() === email.toLowerCase() ? updatedCred : c))}
                onUpdateUser={handleUpdateCurrentUser}
              />
            </div>
            
            <AIAssistant 
              role={user.role} 
              roleTitle={user.roleTitle} 
              isOpen={aiOpen} 
              onClose={() => setAIOpen(false)} 
            />
          </div>
        </DashboardShell>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  mainLayout: {
    display: 'flex',
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  dashboardContainer: {
    flex: 1,
    transition: 'margin-right 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflowY: 'auto',
    height: '100%',
  }
};

export default App;
