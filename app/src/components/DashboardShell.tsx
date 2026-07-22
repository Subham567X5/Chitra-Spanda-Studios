import React, { useState } from 'react';
import { DEMO_CREDENTIALS, MOCK_NOTIFICATIONS } from '../appData';


import { Bell, Sparkles, LogOut, Cpu, Menu, User, Settings, FolderKanban, CheckSquare, Layers, BookOpen, UserCheck, Shield, FileText, ShieldAlert, Mail, AlertTriangle, Search, Trash2, CheckCircle, Inbox, Clock, Activity, Volume2, Lock, Monitor, RefreshCw, Database, Upload, Users, Download } from 'lucide-react';
import logoImg from '../assets/logo.jpg';

interface DashboardShellProps {
  user: typeof DEMO_CREDENTIALS[0] & { avatar?: string; phone?: string };
  onLogout: () => void;
  onToggleAI: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateUser?: (updatedUser: typeof DEMO_CREDENTIALS[0] & { avatar?: string; phone?: string }) => void;
  children: React.ReactNode;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (val: boolean) => void;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange }) => {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{
        width: '40px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255,255,255,0.05)',
        border: checked ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
        position: 'relative',
        cursor: 'pointer',
        transition: '0.2s',
        display: 'inline-block'
      }}
    >
      <div style={{
        width: '14px',
        height: '14px',
        borderRadius: '50%',
        background: checked ? 'var(--accent-color)' : '#9ca3af',
        position: 'absolute',
        top: '2px',
        left: checked ? '22px' : '2px',
        transition: '0.2s',
        boxShadow: checked ? '0 0 8px var(--accent-color)' : 'none'
      }} />
    </div>
  );
};

export const DashboardShell: React.FC<DashboardShellProps> = ({ user, onLogout, onToggleAI, activeTab, setActiveTab, onUpdateUser, children }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedNotifId, setSelectedNotifId] = useState<string | null>(null);

  const playBeep = (freq = 880, duration = 0.1) => {
    try {
      if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.warn(e);
    }
  };

  // Helper to mark a notification as read
  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    playBeep(1200, 0.15);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setSelectedNotifId(null);
    playBeep(440, 0.2);
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    if (selectedNotifId === id) {
      setSelectedNotifId(null);
    }
    playBeep(600, 0.1);
  };

  const toggleReadStatus = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: !n.read } : n));
    playBeep(880, 0.05);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Settings State Hooks
  const [themeName, setThemeName] = useState(() => localStorage.getItem('cs-settings-theme') || 'cyan');
  const [scanlinesEnabled, setScanlinesEnabled] = useState(() => localStorage.getItem('cs-settings-scanlines') !== 'false');
  const [gridEnabled, setGridEnabled] = useState(() => localStorage.getItem('cs-settings-grid') !== 'false');
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem('cs-settings-voice') !== 'false');
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem('cs-settings-sound') !== 'false');
  const [logoutTimer, setLogoutTimer] = useState(() => localStorage.getItem('cs-settings-logout') || 'never');
  const [simulatedLatency, setSimulatedLatency] = useState(() => parseInt(localStorage.getItem('cs-settings-latency') || '0'));

  const changeTheme = (theme: string) => {
    const colors = {
      cyan: { accent: '#06b6d4', primaryGlow: 'linear-gradient(135deg, #7c3aed 0%, #0891b2 100%)', primary: '#7c3aed' },
      red: { accent: '#ef4444', primaryGlow: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', primary: '#b91c1c' },
      green: { accent: '#10b981', primaryGlow: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', primary: '#047857' },
      purple: { accent: '#a855f7', primaryGlow: 'linear-gradient(135deg, #a855f7 0%, #6d28d9 100%)', primary: '#6d28d9' }
    };
    const c = colors[theme as keyof typeof colors] || colors.cyan;
    document.documentElement.style.setProperty('--accent-color', c.accent);
    document.documentElement.style.setProperty('--primary-glow', c.primaryGlow);
    document.documentElement.style.setProperty('--primary-color', c.primary);
    setThemeName(theme);
    localStorage.setItem('cs-settings-theme', theme);
  };

  const toggleScanlines = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.remove('no-scanlines');
    } else {
      document.body.classList.add('no-scanlines');
    }
    setScanlinesEnabled(enabled);
    localStorage.setItem('cs-settings-scanlines', enabled ? 'true' : 'false');
  };

  const toggleGrid = (enabled: boolean) => {
    if (enabled) {
      document.body.classList.remove('no-grid');
    } else {
      document.body.classList.add('no-grid');
    }
    setGridEnabled(enabled);
    localStorage.setItem('cs-settings-grid', enabled ? 'true' : 'false');
  };

  const handlePurgeCache = () => {
    if (window.confirm('⚠️ Are you sure you want to purge all local mock data? This will reset all issues, attendance logs, and invoice forms to their default states.')) {
      localStorage.clear();
      playBeep(440, 0.4);
      alert('Local storage purged. Reloading page...');
      window.location.reload();
    }
  };  const toggleVoice = (enabled: boolean) => {
    setVoiceEnabled(enabled);
    localStorage.setItem('cs-settings-voice', enabled ? 'true' : 'false');
    if (enabled) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Voice feedback activated");
        utterance.rate = 1.1;
        utterance.volume = 0.6;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn(e);
      }
    }
  };

  const toggleSound = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('cs-settings-sound', enabled ? 'true' : 'false');
    if (enabled) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    }
  };

  const changeLogoutTimer = (timer: string) => {
    setLogoutTimer(timer);
    localStorage.setItem('cs-settings-logout', timer);
    playBeep(700, 0.1);
  };

  const changeLatency = (latency: number) => {
    setSimulatedLatency(latency);
    localStorage.setItem('cs-settings-latency', latency.toString());
  };

  // Profile Editor States
  const [profileName, setProfileName] = useState(user.name);
  const [profileEmail, setProfileEmail] = useState(user.email);
  const [profilePhone, setProfilePhone] = useState(user.phone || '');
  const [profileRoleTitle, setProfileRoleTitle] = useState(user.roleTitle);
  const [profileAvatar, setProfileAvatar] = useState(user.avatar || '');
  const [profilePassword, setProfilePassword] = useState(user.password || '');

  React.useEffect(() => {
    setProfileName(user.name);
    setProfileEmail(user.email);
    setProfilePhone(user.phone || '');
    setProfileRoleTitle(user.roleTitle);
    setProfileAvatar(user.avatar || '');
    setProfilePassword(user.password || '');
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileAvatar(reader.result as string);
        playBeep(980, 0.08);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profileEmail,
          password: profilePassword,
          name: profileName,
          roleTitle: profileRoleTitle
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile on server');
      }
      
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          name: profileName,
          email: profileEmail,
          phone: profilePhone,
          roleTitle: profileRoleTitle,
          avatar: profileAvatar,
          password: profilePassword
        });
        playBeep(1200, 0.25);
        
        if (voiceEnabled) {
          try {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance("Profile updated successfully.");
            utterance.rate = 1.1;
            utterance.volume = 0.6;
            window.speechSynthesis.speak(utterance);
          } catch (e) {}
        }
        
        alert('💾 Profile settings committed successfully!');
      }
    } catch (err) {
      console.error(err);
      alert('⚠️ Error updating profile settings.');
    }
  };

  React.useEffect(() => {
    // Apply saved theme on mount
    changeTheme(themeName);
    // Apply saved scanlines on mount
    if (!scanlinesEnabled) document.body.classList.add('no-scanlines');
    // Apply saved grid on mount
    if (!gridEnabled) document.body.classList.add('no-grid');
  }, []);

  React.useEffect(() => {
    if (logoutTimer === 'never') return;

    let timeoutMinutes = 5;
    if (logoutTimer === '15m') timeoutMinutes = 15;
    else if (logoutTimer === '30m') timeoutMinutes = 30;
    else if (logoutTimer === '1h') timeoutMinutes = 60;

    const timeoutMs = timeoutMinutes * 60 * 1000;
    let timerId: any;

    const resetTimer = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        try {
          const speech = new SpeechSynthesisUtterance("Session expired due to inactivity. Logging out.");
          speech.rate = 1.1;
          speech.volume = 0.6;
          window.speechSynthesis.speak(speech);
        } catch (e) {}
        alert('🛡️ Session expired due to inactivity. Logging out...');
        onLogout();
      }, timeoutMs);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const resetHandler = () => resetTimer();
    events.forEach(e => document.addEventListener(e, resetHandler));

    resetTimer();

    return () => {
      clearTimeout(timerId);
      events.forEach(e => document.removeEventListener(e, resetHandler));
    };
  }, [logoutTimer, onLogout]);

  // Render navigation links based on role (matching 02_dashboard_layouts.md navigation specs)
  const getNavLinks = () => {
    const getBaseLinks = () => {
      switch (user.role) {
      case 'super_admin':
        return [
          { label: 'Global Monitor', icon: <Cpu size={18} /> },
          { label: 'Tenant Provisioning', icon: <Layers size={18} /> },
          { label: 'Cross-Tenant Users', icon: <User size={18} /> },
          { label: 'Security & Access', icon: <Shield size={18} /> },
          { label: 'Audit Trail Logs', icon: <FileText size={18} /> },
          { label: 'Global Config', icon: <Settings size={18} /> }
        ];
      case 'studio_owner':
        return [
          { label: 'Studio Overview', icon: <Layers size={18} /> },
          { label: 'Financial Analytics', icon: <FileText size={18} /> },
          { label: 'Master Portfolio', icon: <FolderKanban size={18} /> },
          { label: 'Client Accounts', icon: <User size={18} /> },
          { label: 'HR Departments', icon: <UserCheck size={18} /> },
          { label: 'Academy Sync', icon: <BookOpen size={18} /> },
          { label: 'Employee Work Review', icon: <Inbox size={18} /> },
          { label: 'Portal List', icon: <Users size={18} /> }
        ];
      case 'director':
        return [
          { label: 'Approvals Queue', icon: <CheckSquare size={18} /> },
          { label: 'Frame Annotation', icon: <Layers size={18} /> },
          { label: 'Art Style Bible', icon: <BookOpen size={18} /> },
          { label: 'Shot Deliveries', icon: <FolderKanban size={18} /> },
          { label: 'Employee Work Review', icon: <Inbox size={18} /> }
        ];
      case 'producer':
        return [
          { label: 'Production Stats', icon: <Layers size={18} /> },
          { label: 'Resource Allocator', icon: <UserCheck size={18} /> },
          { label: 'Milestone Gantt', icon: <FolderKanban size={18} /> },
          { label: 'Client Billings', icon: <FileText size={18} /> },
          { label: 'Employee Work Review', icon: <Inbox size={18} /> }
        ];
      case 'project_manager':
        return [
          { label: 'Sprints & Workload', icon: <Layers size={18} /> },
          { label: 'Kanban Board', icon: <CheckSquare size={18} /> },
          { label: 'Risk Registers', icon: <Shield size={18} /> },
          { label: 'Time Verification', icon: <FileText size={18} /> },
          { label: 'Employee Work Review', icon: <Inbox size={18} /> }
        ];
      case 'team_lead':
        return [
          { label: 'Team Task Monitor', icon: <UserCheck size={18} /> },
          { label: 'Technical QA', icon: <Shield size={18} /> },
          { label: 'Daily Standups', icon: <FolderKanban size={18} /> },
          { label: 'Employee Work Review', icon: <Inbox size={18} /> }
        ];
      case 'animator':
      case 'designer':
      case 'storyboard_artist':
      case 'editor':
        return [
          { label: 'My Workspace', icon: <Layers size={18} /> },
          { label: 'Submit Work', icon: <Upload size={18} /> },
          { label: 'Shots Tracker', icon: <FolderKanban size={18} /> },
          { label: 'Asset Downloader', icon: <Layers size={18} /> },
          { label: 'Feedback History', icon: <CheckSquare size={18} /> },
          { label: 'Timesheet Submissions', icon: <FileText size={18} /> }
        ];
      case 'voice_artist':
        return [
          { label: 'Recording Booth', icon: <Layers size={18} /> },
          { label: 'Submit Work', icon: <Upload size={18} /> },
          { label: 'Script Boards', icon: <FileText size={18} /> },
          { label: 'Audio Takes Upload', icon: <Layers size={18} /> },
          { label: 'Sessions Schedule', icon: <FolderKanban size={18} /> }
        ];
      case 'client':
        return [
          { label: 'Client Welcome', icon: <Layers size={18} /> },
          { label: 'Milestone Reviews', icon: <CheckSquare size={18} /> },
          { label: 'Invoices & Billing', icon: <FileText size={18} /> },
          { label: 'NDA & Contracts', icon: <FileText size={18} /> }
        ];
      case 'hr':
        return [
          { label: 'HR Command Center', icon: <Layers size={18} /> },
          { label: 'Employee Profiles', icon: <User size={18} /> },
          { label: 'Leaves Board', icon: <CheckSquare size={18} /> },
          { label: 'Payroll Engine', icon: <FileText size={18} /> }
        ];
      case 'recruiter':
        return [
          { label: 'Recruit Pipelines', icon: <FolderKanban size={18} /> },
          { label: 'Jobs Manager', icon: <Layers size={18} /> },
          { label: 'Candidate Profiles', icon: <User size={18} /> }
        ];
      case 'finance':
        return [
          { label: 'General Ledger', icon: <Layers size={18} /> },
          { label: 'Client Receivables', icon: <FileText size={18} /> },
          { label: 'Vendor Payables', icon: <FileText size={18} /> }
        ];
      case 'academy_director':
      case 'trainer':
      case 'student':
        return [
          { label: 'LMS Classroom', icon: <BookOpen size={18} /> },
          { label: 'Course Lectures', icon: <Layers size={18} /> },
          { label: 'Assignments Quiz', icon: <CheckSquare size={18} /> }
        ];
      case 'freelancer':
        return [
          { label: 'Freelancer Center', icon: <Layers size={18} /> },
          { label: 'Submit Work', icon: <Upload size={18} /> },
          { label: 'My Contracts', icon: <FileText size={18} /> },
          { label: 'Tasks & Assets', icon: <FolderKanban size={18} /> },
          { label: 'Invoices', icon: <FileText size={18} /> },
          { label: 'Portfolio', icon: <CheckSquare size={18} /> }
        ];
      case 'intern':
        return [
          { label: 'Intern Studio Bench', icon: <Layers size={18} /> },
          { label: 'Submit Work', icon: <Upload size={18} /> },
          { label: 'My Production Tasks', icon: <FolderKanban size={18} /> },
          { label: 'Weekly Reports', icon: <FileText size={18} /> },
          { label: 'Mentor Evaluations', icon: <CheckSquare size={18} /> },
          { label: 'Certificates', icon: <FileText size={18} /> }
        ];
      case 'mentor':
        return [
          { label: 'Mentor Station', icon: <Layers size={18} /> },
          { label: 'My Interns', icon: <UserCheck size={18} /> },
          { label: 'Log Reviews', icon: <CheckSquare size={18} /> },
          { label: 'Task Board', icon: <FolderKanban size={18} /> },
          { label: 'Appraisals', icon: <FileText size={18} /> }
        ];
      case 'id_card_admin':
        return [
          { label: 'Security Access Control', icon: <Shield size={18} /> },
          { label: 'Generate Cards', icon: <Layers size={18} /> },
          { label: 'Access Controls', icon: <Shield size={18} /> },
          { label: 'Activity Logs', icon: <FileText size={18} /> },
          { label: 'Security Alerts', icon: <ShieldAlert size={18} /> }
        ];
      case 'visitor_public':
        return [
          { label: 'Home', icon: <Layers size={18} /> },
          { label: 'Services', icon: <FolderKanban size={18} /> },
          { label: 'Academy', icon: <BookOpen size={18} /> },
          { label: 'Careers', icon: <User size={18} /> },
          { label: 'About Us', icon: <FileText size={18} /> },
          { label: 'Contact', icon: <Mail size={18} /> }
        ];
      default:
        return [
          { label: 'Dashboard', icon: <Layers size={18} /> },
          { label: 'Tasks', icon: <CheckSquare size={18} /> }
        ];
    }
    };
    return [
      ...getBaseLinks(), 
      { label: 'Software Hub', icon: <Download size={18} /> },
      { label: "Founder's Journey", icon: <BookOpen size={18} /> },
      { label: 'Studio Board', icon: <Users size={18} /> },
      { label: 'Notifications', icon: <Bell size={18} /> },
      { label: 'Settings', icon: <Settings size={18} /> }
    ];
  };

  const renderNotificationsView = () => {
    const filteredNotifs = notifications.filter(n => 
      n.title.toLowerCase().includes(searchText.toLowerCase()) || 
      n.body.toLowerCase().includes(searchText.toLowerCase())
    );

    const selectedNotif = notifications.find(n => n.id === selectedNotifId) || filteredNotifs[0] || null;

    const getSeverityDetails = (title: string) => {
      const lower = title.toLowerCase();
      if (lower.includes('alert') || lower.includes('warning') || lower.includes('leave') || lower.includes('blocker')) {
        return { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.3)', icon: <AlertTriangle size={18} color="var(--danger)" /> };
      }
      if (lower.includes('paid') || lower.includes('success') || lower.includes('approved')) {
        return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', border: 'rgba(16, 185, 129, 0.3)', icon: <CheckCircle size={18} color="#10b981" /> };
      }
      return { color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.08)', border: 'rgba(6, 182, 212, 0.3)', icon: <Bell size={18} color="#06b6d4" /> };
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', overflow: 'hidden' }} className="animate-fade-in">
        {/* Header Bar */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--accent-color)', textShadow: '0 0 10px rgba(6,182,212,0.4)', margin: 0 }}>
              SYSTEM NOTIFICATION LOG PANEL
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              LOG_FEED_STATUS: ACTIVE // METRICS: {notifications.length} TOTAL // {unreadCount} UNREAD
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }} onClick={markAllAsRead}>
              <CheckCircle size={14} />
              <span>Mark All Read</span>
            </button>
            <button className="btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', border: '1px solid rgba(239, 68, 68, 0.4)', color: 'var(--danger)' }} onClick={clearAllNotifications}>
              <Trash2 size={14} />
              <span>Purge All Logs</span>
            </button>
          </div>
        </div>

        {/* Main Split Grid */}
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          {/* Left Feed Column */}
          <div className="glass-panel" style={{ flex: '1 1 55%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', minHeight: 0 }}>
            {/* Search Box */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Search alert logs by keyword..." 
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* List Box */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>
              {filteredNotifs.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', color: 'var(--text-muted)' }}>
                  <Inbox size={48} strokeWidth={1} />
                  <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>NO SYSTEM ALERTS IN REGISTER</span>
                </div>
              ) : (
                filteredNotifs.map((n) => {
                  const severity = getSeverityDetails(n.title);
                  const isSelected = selectedNotif?.id === n.id;
                  return (
                    <div 
                      key={n.id}
                      onClick={() => {
                        setSelectedNotifId(n.id);
                        markAsRead(n.id);
                        playBeep(880, 0.08);
                        if (voiceEnabled) {
                          try {
                            window.speechSynthesis.cancel();
                            const utterance = new SpeechSynthesisUtterance(n.title + ". " + n.body);
                            utterance.rate = 1.1;
                            utterance.volume = 0.6;
                            window.speechSynthesis.speak(utterance);
                          } catch (e) {
                            console.warn(e);
                          }
                        }
                      }}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255, 255, 255, 0.01)',
                        border: isSelected ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.04)',
                        cursor: 'pointer',
                        transition: '0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        position: 'relative',
                        boxShadow: isSelected ? '0 0 15px rgba(6, 182, 212, 0.1)' : 'none',
                      }}
                      className="list-hover"
                    >
                      {/* Left Side: Icon & text */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                        <div style={{ padding: '8px', borderRadius: '8px', background: severity.bg, border: `1px solid ${severity.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {severity.icon}
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff' }}>{n.title}</span>
                            {!n.read && (
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--danger)', boxShadow: '0 0 6px var(--danger)' }} />
                            )}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{n.body}</div>
                        </div>
                      </div>

                      {/* Right Side: Timestamp & Scope */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={10} />
                          {n.time}
                        </span>
                        <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: severity.color, background: severity.bg, padding: '2px 6px', borderRadius: '4px', border: `1px solid ${severity.border}`, textTransform: 'uppercase' }}>
                          {n.id}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Inspector Column */}
          <div className="glass-panel" style={{ flex: '1 1 45%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px', minHeight: 0 }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '1px', margin: 0, paddingBottom: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-primary)' }}>
              LOG METADATA INSPECTOR
            </h3>

            {selectedNotif ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, minHeight: 0, overflowY: 'auto' }} className="animate-fade-in">
                {/* Header Badge */}
                <div style={{ padding: '14px', borderRadius: '10px', background: getSeverityDetails(selectedNotif.title).bg, border: `1px solid ${getSeverityDetails(selectedNotif.title).border}`, display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {getSeverityDetails(selectedNotif.title).icon}
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{selectedNotif.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>ALERT_CLASS: {selectedNotif.id.toUpperCase()} // STATUS: {selectedNotif.read ? 'PROCESSED' : 'UNREAD'}</div>
                  </div>
                </div>

                {/* Message Body */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Payload Message</span>
                  <div style={{ fontSize: '13px', color: '#fff', lineHeight: '1.6', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px' }}>
                    {selectedNotif.body}
                  </div>
                </div>

                {/* Tech Telemetry */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Telemetry Logs</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>TRANSACTION_ID:</span>
                      <span style={{ color: '#fff' }}>TXN-50392-4820-{selectedNotif.id}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ORIGIN_SCOPE:</span>
                      <span style={{ color: '#22d3ee' }}>DREAMAVIAN_CORE_NET</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>ROUTE_GATEWAY:</span>
                      <span style={{ color: '#fff' }}>GW-MUMBAI-01</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>RECEIVER_HASH:</span>
                      <span style={{ color: '#a5f3fc' }}>SHA256: 4fbc87a1...</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>LOGGED_TIME:</span>
                      <span style={{ color: '#fff' }}>{selectedNotif.time}</span>
                    </div>
                  </div>
                </div>

                {/* Inspector Actions */}
                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '10px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => toggleReadStatus(selectedNotif.id)}
                  >
                    <CheckCircle size={14} />
                    <span>{selectedNotif.read ? 'Mark Unread' : 'Mark Read'}</span>
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)' }}
                    onClick={() => deleteNotification(selectedNotif.id)}
                  >
                    <Trash2 size={14} />
                    <span>Delete Record</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', gap: '12px' }}>
                <Activity size={32} className="pulse-glow" style={{ color: 'var(--accent-color)' }} />
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)' }}>SELECT A REGISTER TO INSPECT</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderSettingsView = () => {
    const themesList = [
      { id: 'cyan', label: 'CYAN GRID', color: '#06b6d4', glow: 'rgba(6,182,212,0.4)' },
      { id: 'red', label: 'RED ALARM', color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
      { id: 'green', label: 'GREEN BIOS', color: '#10b981', glow: 'rgba(16,185,129,0.4)' },
      { id: 'purple', label: 'NEON PURPLE', color: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    ];

    const triggerTestSpeech = () => {
      if (!voiceEnabled) return;
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("System alert: Dream Avian core systems running at normal levels.");
        utterance.rate = 1.1;
        utterance.volume = 0.6;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn(e);
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', overflowY: 'auto' }} className="animate-fade-in">
        {/* Header Bar */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--accent-color)', textShadow: '0 0 10px rgba(6,182,212,0.4)', margin: 0 }}>
              SYSTEM TERMINAL SETTINGS
            </h2>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
              CONFIG_INTERFACE: OPERATIONAL // LAST_SYNC: SECURE // INSTANT_COMMIT: ON
            </div>
          </div>
          <Activity size={24} className="pulse-glow" style={{ color: 'var(--accent-color)' }} />
        </div>
        {/* User Profile Console Editor */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(6, 182, 212, 0.1)', border: '2px solid var(--accent-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(6,182,212,0.3)', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={24} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: 'var(--accent-color)', margin: 0, textShadow: '0 0 10px rgba(6,182,212,0.5)' }}>
                ⭐ UPDATE YOUR PROFILE (ID, PASSWORD, IMAGE) ⭐
              </h3>
            </div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)', background: 'var(--accent-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold', color: '#000' }}>
              ACCESS GRANTED
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            {/* Avatar Uploader Section (Left Column) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', flexShrink: 0, width: '130px' }}>
              <div style={{
                width: '100px',
                height: '100px',
                borderRadius: '16px',
                border: '2px solid var(--accent-color)',
                boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
                background: 'rgba(0,0,0,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {profileAvatar ? (
                  <img src={profileAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '36px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--accent-color)' }}>
                    {profileName.charAt(0)}
                  </span>
                )}
              </div>
              <label className="btn-secondary" style={{ padding: '6px 12px', fontSize: '10px', cursor: 'pointer', textAlign: 'center', width: '100%' }}>
                <span>CHANGE IMAGE</span>
                <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Profile Inputs Section (Right Column) */}
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', minWidth: '280px' }}>
              
              {/* Field: Full Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>FULL NAME</span>
                </div>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profileName} 
                  onChange={(e) => setProfileName(e.target.value)}
                  style={{ 
                    fontSize: '13px', 
                    opacity: 1,
                    cursor: 'text'
                  }}
                />
              </div>

              {/* Field: Role Title */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ROLE TITLE</span>
                </div>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profileRoleTitle} 
                  onChange={(e) => setProfileRoleTitle(e.target.value)}
                  style={{ 
                    fontSize: '13px', 
                    opacity: 1,
                    cursor: 'text'
                  }}
                />
              </div>

              {/* Field: Email */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CHANGE ID (EMAIL)</span>
                </div>
                <input 
                  type="email" 
                  className="glass-input" 
                  value={profileEmail} 
                  onChange={(e) => setProfileEmail(e.target.value)}
                  style={{ 
                    fontSize: '13px', 
                    opacity: 1,
                    cursor: 'text'
                  }}
                />
              </div>

              {/* Field: Phone */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>PHONE / CONTACT</span>
                </div>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={profilePhone} 
                  placeholder="No contact registered"
                  onChange={(e) => setProfilePhone(e.target.value)}
                  style={{ 
                    fontSize: '13px', 
                    opacity: 1,
                    cursor: 'text'
                  }}
                />
              </div>

              {/* Field: Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CHANGE PASSWORD</span>
                </div>
                <input 
                  type="password" 
                  className="glass-input" 
                  value={profilePassword} 
                  onChange={(e) => setProfilePassword(e.target.value)}
                  style={{ 
                    fontSize: '13px', 
                    opacity: 1,
                    cursor: 'text'
                  }}
                />
              </div>

            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleSaveProfile}
            style={{ alignSelf: 'flex-end', padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}
          >
            <span>COMMIT PROFILE CHANGES</span>
          </button>
        </div>

        {/* Settings Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          
          {/* Card 1: Visual Overlay Options */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <Monitor size={18} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: '#fff', margin: 0 }}>
                VISUAL HUD & CORE OVERLAYS
              </h3>
            </div>

            {/* Theme Accents */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Accent Palette Selection</span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {themesList.map((t) => {
                  const isSelected = themeName === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        changeTheme(t.id);
                        playBeep(880, 0.05);
                      }}
                      style={{
                        padding: '12px',
                        background: isSelected ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.2)',
                        border: isSelected ? `1px solid ${t.color}` : '1px solid rgba(255,255,255,0.04)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        justifyContent: 'flex-start',
                        transition: '0.2s',
                        boxShadow: isSelected ? `0 0 10px ${t.glow}` : 'none'
                      }}
                    >
                      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: t.color, boxShadow: `0 0 6px ${t.color}`, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isSelected ? '#fff' : 'var(--text-secondary)', fontWeight: isSelected ? 'bold' : 'normal' }}>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CRT Scanline Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>CRT Monitor Scanlines</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Enable vintage glass scanline filter</div>
              </div>
              <ToggleSwitch checked={scanlinesEnabled} onChange={(val) => { toggleScanlines(val); playBeep(val ? 880 : 440, 0.05); }} />
            </div>

            {/* Holographic Background Grid Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Holographic Grid Gridlines</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Render vector lines in page background</div>
              </div>
              <ToggleSwitch checked={gridEnabled} onChange={(val) => { toggleGrid(val); playBeep(val ? 880 : 440, 0.05); }} />
            </div>
          </div>

          {/* Card 2: Audio Config */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <Volume2 size={18} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: '#fff', margin: 0 }}>
                AUDIO LEVELS & VOICE COMMANDS
              </h3>
            </div>

            {/* Sound FX Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Cybernetic Beeps & FX</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Play synthesized feedback tones on click</div>
              </div>
              <ToggleSwitch checked={soundEnabled} onChange={toggleSound} />
            </div>

            {/* Voice Alerts Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.02)' }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Text-To-Speech Narrator</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Speak alerts and notification logs aloud</div>
              </div>
              <ToggleSwitch checked={voiceEnabled} onChange={toggleVoice} />
            </div>

            {/* Audio Speech Test Button */}
            <button
              onClick={triggerTestSpeech}
              disabled={!voiceEnabled}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: voiceEnabled ? 'pointer' : 'not-allowed',
                opacity: voiceEnabled ? 1 : 0.4
              }}
            >
              <Activity size={14} />
              <span>TEST NARRATION SYSTEM</span>
            </button>
          </div>

          {/* Card 3: Tunnel & Optimizer Settings */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
              <Lock size={18} style={{ color: 'var(--accent-color)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: '#fff', margin: 0 }}>
                SECURITY & TUNNEL INTEGRATIONS
              </h3>
            </div>

            {/* Auto Logout dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Session Auto-Logout</span>
                <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)' }}>SECURE_DAEMON</span>
              </div>
              <select
                value={logoutTimer}
                onChange={(e) => changeLogoutTimer(e.target.value)}
                className="glass-input"
                style={{ width: '100%', cursor: 'pointer', background: 'var(--bg-color)', color: '#fff', border: '1px solid rgba(6, 182, 212, 0.2)' }}
              >
                <option value="never">Never Logout (Default)</option>
                <option value="5m">5 Minutes Inactivity</option>
                <option value="15m">15 Minutes Inactivity</option>
                <option value="30m">30 Minutes Inactivity</option>
                <option value="1h">1 Hour Inactivity</option>
              </select>
            </div>

            {/* Network Latency Optimizer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Connection Latency Optimizer</span>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>Dynamic connection delay optimizer for cloud sync actions</div>
                </div>
                <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: simulatedLatency > 1000 ? 'var(--danger)' : simulatedLatency > 400 ? 'var(--warning)' : 'var(--success)', fontWeight: 'bold' }}>
                  {simulatedLatency} ms
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="2000"
                step="50"
                value={simulatedLatency}
                onChange={(e) => changeLatency(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: 'var(--accent-color)',
                  background: 'rgba(255,255,255,0.05)',
                  height: '6px',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  border: 'none',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Card 4: Local Storage Purge */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)', paddingBottom: '12px' }}>
              <Database size={18} style={{ color: 'var(--danger)' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: 'var(--danger)', margin: 0 }}>
                LOCAL CACHE & MEMORY DESTRUCT
              </h3>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              ⚠️ Purging memory resets all tenant instances, user databases, invoices, timesheets, and portfolio mock records back to their factory default settings. This action is irreversible.
            </div>

            <button
              onClick={handlePurgeCache}
              className="btn-secondary"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                borderColor: 'rgba(239, 68, 68, 0.5)',
                color: 'var(--danger)',
                background: 'rgba(239, 68, 68, 0.05)'
              }}
            >
              <RefreshCw size={14} />
              <span>PURGE & RESET ENTIRE SYSTEM</span>
            </button>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Sidebar Navigation */}
      {sidebarOpen && (
        <div className="glass-panel animate-fade-in" style={styles.sidebar}>
          <div style={styles.logoArea}>
            <img src={logoImg} alt="DreamAvian Logo" style={{ width: '28px', height: '28px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.4)', objectFit: 'cover' }} />
            <span style={styles.logoText}>DA Portal</span>
          </div>

          <div style={styles.userSection}>
            <div style={styles.avatar}>
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userRole}>{user.roleTitle}</div>
            </div>
          </div>

          <nav style={styles.nav}>
            {getNavLinks().map((link, idx) => (
              <div 
                key={idx} 
                className="sidebar-nav-link"
                onClick={() => setActiveTab(link.label)}
                style={{ ...styles.navLink, ...(link.label === activeTab ? styles.navActive : {}), display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {link.icon}
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{link.label}</span>
                </div>
                {link.label === 'Notifications' && unreadCount > 0 && (
                  <span style={{
                    background: 'var(--danger)',
                    color: '#fff',
                    fontSize: '9px',
                    fontWeight: '700',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    boxShadow: '0 0 8px var(--danger)'
                  }}>{unreadCount}</span>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div style={styles.mainContent}>
        {/* Top Header Bar */}
        <header className="glass-panel" style={styles.header}>
          <button 
            className="btn-secondary" 
            style={styles.toggleBtn}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={18} />
          </button>

          <div style={styles.headerActions}>
            {/* AI Assistant Toggle Button */}
            <button className="btn-primary" style={styles.aiToggle} onClick={onToggleAI}>
              <Sparkles size={16} style={{ marginRight: '6px' }} />
              <span>Ask AI Assistant</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button 
                className="btn-secondary" 
                style={styles.actionBtn}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="pulse-glow" style={styles.badge}>{unreadCount}</span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notifOpen && (
                <div className="glass-panel" style={styles.notifDropdown}>
                  <div style={styles.notifHeader}>Notifications</div>
                  <div style={styles.notifList}>
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        style={{ ...styles.notifItem, opacity: n.read ? 0.6 : 1 }}
                        onClick={() => markAsRead(n.id)}
                      >
                        <div style={styles.notifTitle}>{n.title}</div>
                        <div style={styles.notifBody}>{n.body}</div>
                        <div style={styles.notifTime}>{n.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button className="btn-secondary" style={styles.logoutBtn} onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main style={styles.body}>
          {activeTab === 'Notifications' ? renderNotificationsView() : activeTab === 'Settings' ? renderSettingsView() : children}
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
  },
  sidebar: {
    width: '260px',
    height: 'calc(100vh - 24px)',
    margin: '12px',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 16px',
    borderRight: '1px solid var(--border-color)',
    borderRadius: '16px',
    flexShrink: 0,
  },
  logoArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '18px',
    letterSpacing: '-0.5px',
    background: 'var(--primary-glow)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    marginBottom: '20px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'var(--primary-glow)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  userInfo: {
    overflow: 'hidden',
  },
  userName: {
    fontSize: '13px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userRole: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    flex: 1,
    overflowY: 'auto',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 14px',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: '0.2s',
  },
  navActive: {
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-primary)',
    borderLeft: '3px solid var(--accent-color)',
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    padding: '12px',
  },
  header: {
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    borderRadius: '12px',
    marginBottom: '12px',
    overflow: 'visible',
    position: 'relative',
    zIndex: 100,
  },
  toggleBtn: {
    padding: '8px',
    borderRadius: '8px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  aiToggle: {
    padding: '8px 16px',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
  },
  actionBtn: {
    padding: '8px',
    borderRadius: '8px',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: 'var(--danger)',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '320px',
    maxHeight: '360px',
    overflowY: 'auto',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
    padding: '16px',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
  },
  notifHeader: {
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid var(--border-color)',
  },
  notifList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  notifItem: {
    padding: '8px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.02)',
    cursor: 'pointer',
    transition: '0.2s',
  },
  notifTitle: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text-primary)',
  },
  notifBody: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    margin: '4px 0',
  },
  notifTime: {
    fontSize: '9px',
    color: 'var(--text-muted)',
  },
  logoutBtn: {
    padding: '8px',
    borderRadius: '8px',
    color: 'var(--danger)',
  },
  body: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
  }
};
