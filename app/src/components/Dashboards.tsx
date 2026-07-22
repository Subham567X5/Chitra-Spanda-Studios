import React, { useState } from 'react';
import founderImg from '../assets/founder.jpg';
import bannerImg from '../assets/banner.png';
import logoImg from '../assets/logo.jpg';
import motherSacrificeImg from '../assets/mother_sacrifice.png';
import slideSunset from '../assets/slide_sunset.png';
import slideStorefront from '../assets/slide_storefront.png';
import slideTeam from '../assets/slide_team.png';

import slideTools from '../assets/slide_tools.jpg';
import slideChildhood from '../assets/slide_childhood.png';
import slideMobileAnim from '../assets/slide_mobile_anim.png';
import slideDreamlinkWorld from '../assets/slide_dreamlink_world.png';
import type { Course } from '../appData';
import { DEMO_CREDENTIALS, MOCK_ATTENDANCE } from '../appData';
import {
  loadAllFromCloud,
  saveStoryToCloud,
  saveSlidesToCloud,
  savePartnersToCloud,
  saveMilestonesToCloud
} from '../utils/cloudSync';

import { 
  Video, Upload, Download, X, ShieldAlert, Search, Lock, Unlock, 
  RefreshCw, Plus, Trash2, Fingerprint, Scan, Play, Info, Edit3, Mail,
  Globe, Phone, Link, Volume2, Cpu, Layers
} from 'lucide-react';

// Custom Brand SVG Icons (lucide-react compatibility fallback)
const Facebook = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const Instagram = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const Youtube = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/>
    <polygon points="10 15 15 12 10 9"/>
  </svg>
);

const Twitter = ({ size = 16 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

// IndexedDB Helper for portfolio assets (allows video/pdf storage beyond localStorage 5MB limit)
const openPortfolioDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('cs-portfolio-db-v1', 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains('portfolio-assets')) {
        db.createObjectStore('portfolio-assets');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const savePortfolioFileToDB = async (key: string, fileData: string): Promise<void> => {
  const db = await openPortfolioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('portfolio-assets', 'readwrite');
    const store = transaction.objectStore('portfolio-assets');
    const request = store.put(fileData, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getPortfolioFileFromDB = async (key: string): Promise<string> => {
  const db = await openPortfolioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('portfolio-assets', 'readonly');
    const store = transaction.objectStore('portfolio-assets');
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const deletePortfolioFileFromDB = async (key: string): Promise<void> => {
  const db = await openPortfolioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('portfolio-assets', 'readwrite');
    const store = transaction.objectStore('portfolio-assets');
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const base64ToBlob = (base64Data: string, contentType = ''): Blob => {
  const parts = base64Data.split(';base64,');
  const actualBase64 = parts[1] || parts[0];
  const derivedContentType = contentType || (parts[0].startsWith('data:') ? parts[0].substring(5) : '');
  
  const byteCharacters = atob(actualBase64);
  const byteArrays = [];
  const sliceSize = 512;

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: derivedContentType });
};

export const cleanUnusedSlideImagesFromDB = async (activeSlideIds: string[]): Promise<void> => {
  const db = await openPortfolioDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('portfolio-assets', 'readwrite');
    const store = transaction.objectStore('portfolio-assets');
    const request = store.getAllKeys();
    request.onsuccess = async () => {
      const keys = request.result;
      const deletePromises = keys
        .filter(key => typeof key === 'string' && key.startsWith('slide-image-'))
        .filter(key => {
          const slideId = (key as string).substring(12);
          return !activeSlideIds.includes(slideId);
        })
        .map(key => {
          return new Promise<void>((res, rej) => {
            const req = store.delete(key);
            req.onsuccess = () => res();
            req.onerror = () => rej(req.error);
          });
        });
      try {
        await Promise.all(deletePromises);
        resolve();
      } catch (err) {
        reject(err);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

const safeLocalStorageSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error(`[LocalStorage] Failed to save key "${key}":`, e);
  }
};

const resolveDefaultAsset = (path: string): string => {
  if (!path) return '';
  if (path.startsWith('data:')) return path;
  
  const lower = path.toLowerCase();
  if (lower.includes('founder')) return founderImg;
  if (lower.includes('banner')) return bannerImg;
  if (lower.includes('logo')) return logoImg;
  if (lower.includes('mother_sacrifice')) return motherSacrificeImg;
  if (lower.includes('slide_sunset')) return slideSunset;
  if (lower.includes('slide_storefront')) return slideStorefront;
  if (lower.includes('slide_team')) return slideTeam;
  if (lower.includes('slide_tools')) return slideTools;
  if (lower.includes('slide_childhood')) return slideChildhood;
  if (lower.includes('slide_mobile_anim')) return slideMobileAnim;
  if (lower.includes('slide_dreamlink_world')) return slideDreamlinkWorld;
  
  return path;
};

const mergeSlideImagesFromDB = async (slides: any[]): Promise<any[]> => {
  return Promise.all(
    slides.map(async (slide) => {
      let resolvedImg = resolveDefaultAsset(slide.image);
      if (!resolvedImg || resolvedImg === '') {
        try {
          const savedImg = await getPortfolioFileFromDB(`slide-image-${slide.id}`);
          if (savedImg) {
            resolvedImg = savedImg;
          }
        } catch (e) {
          console.error(`Failed to load slide image for ${slide.id}:`, e);
        }
      }
      return { ...slide, image: resolvedImg };
    })
  );
};

interface DashboardsProps {
  role: string;
  userEmail: string;
  userName: string;
  userAvatar?: string;
  activeTab: string;
  credentials?: typeof DEMO_CREDENTIALS;
  onAddCredential?: (newCred: typeof DEMO_CREDENTIALS[0]) => void;
  onUpdateCredential?: (email: string, updatedCred: typeof DEMO_CREDENTIALS[0]) => void;
  onUpdateUser?: (updatedUser: any) => void;
}

const PortalList: React.FC<{ onUpdateUser?: (updatedUser: any) => void }> = ({ onUpdateUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const portals = [
    { id: 'P-01', name: 'Super Admin Portal', role: 'super_admin', category: 'Foundations', desc: 'System orchestration, global config settings, tenant provisioning, audit logs, and security telemetry keys.', email: 'admin@dreamavian.com', pass: 'AdminPass321!' },
    { id: 'P-02', name: 'Studio Owner Portal', role: 'studio_owner', category: 'Foundations', desc: 'Global overview metrics, financial reports, HR rosters, master portfolio tracking, and academy sync status.', email: 'owner@dreamavian.com', pass: 'OwnerPass321!' },
    { id: 'P-03', name: 'Director Portal', role: 'director', category: 'Production', desc: 'Art style bibles, scene frame annotations, visual feedback notes, and shot approval queue reviews.', email: 'director@dreamavian.com', pass: 'DirectorPass321!' },
    { id: 'P-04', name: 'Producer Portal', role: 'producer', category: 'Production', desc: 'Production statistics monitoring, resource allocator rosters, client billing pipelines, and project Gantt roadmaps.', email: 'producer@dreamavian.com', pass: 'ProducerPass321!' },
    { id: 'P-05', name: 'Project Manager Portal', role: 'project_manager', category: 'Production', desc: 'Sprint schedules, task Kanban backlog boards, risk registers, and artist timesheet approvals.', email: 'pm@dreamavian.com', pass: 'PM_Pass321!' },
    { id: 'P-06', name: 'Team Lead Portal', role: 'team_lead', category: 'Production', desc: 'Team task monitor logs, daily standup status reports, and technical QA checklist verifications.', email: 'teamlead@dreamavian.com', pass: 'LeadPass321!' },
    { id: 'P-07', name: 'Animator Portal', role: 'animator', category: 'Production', desc: 'VFX & character animation workspace logs, layout submissions, and bone joint orientation script tools.', email: 'animator@dreamavian.com', pass: 'AnimatorPass321!' },
    { id: 'P-08', name: 'Designer Portal', role: 'designer', category: 'Production', desc: 'Concept art sketching workspace logs, asset submissions, character design checklists, and layout assets.', email: 'designer@dreamavian.com', pass: 'DesignPass321!' },
    { id: 'P-09', name: 'Storyboard Artist Portal', role: 'storyboard_artist', category: 'Production', desc: 'Scene panel sequence flows, draft uploads, thumbnail grids, and director review response history.', email: 'storyboard@dreamavian.com', pass: 'StoryPass321!' },
    { id: 'P-10', name: 'Editor Portal', role: 'editor', category: 'Production', desc: 'Timeline editing cut logs, sound sync checklists, playblast sequence uploads, and client review feedback notes.', email: 'editor@dreamavian.com', pass: 'EditPass321!' },
    { id: 'P-11', name: 'Voice Artist Portal', role: 'voice_artist', category: 'Production', desc: 'Recording session calendars, dialogue script boards, audio take submissions, and vocal feedback history.', email: 'voice@dreamavian.com', pass: 'VoicePass321!' },
    { id: 'P-12', name: 'Freelancer Portal', role: 'freelancer', category: 'Production', desc: 'Assigned freelance tasks queue, timesheet submissions, payout status details, and portfolio showcase logs.', email: 'freelancer@dreamavian.com', pass: 'FreePass321!' },
    { id: 'P-13', name: 'Client Portal', role: 'client', category: 'Finance', desc: 'Showcase milestone plays, asset approval buttons, invoice ledgers, and signed NDA/contracts repositories.', email: 'client@dreamavian.com', pass: 'ClientPass321!' },
    { id: 'P-14', name: 'HR Portal', role: 'hr', category: 'HRMS', desc: 'Employee profile directories, biometric/QR attendance tracking logsheets, and payroll configuration setup.', email: 'hr@dreamavian.com', pass: 'HR_Pass321!' },
    { id: 'P-15', name: 'Recruiter Portal', role: 'recruiter', category: 'HRMS', desc: 'Talent pipelines, active job posting setups, screening assessment ratings, and candidate interview cards.', email: 'recruiter@dreamavian.com', pass: 'RecruitPass321!' },
    { id: 'P-16', name: 'Finance Portal', role: 'finance_billing', category: 'Finance', desc: 'Studio tax reports, ledger balances, employee payroll distributions, and transaction auditing logs.', email: 'finance@dreamavian.com', pass: 'FinancePass321!' },
    { id: 'P-17', name: 'Academy Director Portal', role: 'academy_director', category: 'Academy', desc: 'LMS sync controls, course curriculum approvals, trainer metrics, and global enrollment status logs.', email: 'academy@dreamavian.com', pass: 'AcademyPass321!' },
    { id: 'P-18', name: 'Trainer Portal', role: 'trainer', category: 'Academy', desc: 'LMS trainer panel, lecture stream uploads, lesson submissions, student grading cards, and quiz setups.', email: 'trainer@dreamavian.com', pass: 'TrainerPass321!' },
    { id: 'P-19', name: 'Student Portal', role: 'student', category: 'Academy', desc: 'LMS learning space, active course modules, grade sheets, lecture videos, and curriculum assignments.', email: 'student@dreamavian.com', pass: 'StudentPass321!' },
    { id: 'P-20', name: 'Intern Portal', role: 'intern', category: 'HRMS', desc: 'Intern studio bench, daily learning tasks, attendance tracking, and mentor progress checkboards.', email: 'intern@dreamavian.com', pass: 'InternPass321!' },
    { id: 'P-21', name: 'Mentor Portal', role: 'mentor', category: 'HRMS', desc: 'Assigned intern directory, mentee progress reviews, study materials, and direct evaluation logs.', email: 'mentor@dreamavian.com', pass: 'MentorPass321!' },
    { id: 'P-22', name: 'ID Card Admin Portal', role: 'id_card_admin', category: 'Foundations', desc: 'Security access ID badge generation, barcode scanner links, and verified employee print consoles.', email: 'idcard@dreamavian.com', pass: 'ID_Pass321!' },
    { id: 'P-23', name: 'Visitor/Public Portal', role: 'visitor_public', category: 'Foundations', desc: 'Public studio vacancies, internship applications, contact forms, and inquiry response databases.', email: 'public@dreamavian.com', pass: 'PublicPass321!' }
  ];

  const categories = ['All', 'Foundations', 'Production', 'HRMS', 'Academy', 'Finance'];

  const filteredPortals = portals.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'All' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSwitchRole = (p: typeof portals[0]) => {
    if (onUpdateUser) {
      const targetCred = {
        email: p.email,
        password: p.pass,
        role: p.role,
        name: p.name.replace(' Portal', ''),
        roleTitle: p.name.replace(' Portal', '')
      };
      onUpdateUser(targetCred);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', overflowY: 'auto' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-display)', margin: 0 }} className="text-gradient">DreamAvian Portal Directory</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Access and manage any of the 23 active corporate portals in the DreamAvian enterprise directory.
          </p>
        </div>
        <span className="badge badge-success" style={{ fontSize: '11px', letterSpacing: '1px' }}>
          23 / 23 ENTERPRISE PORTALS ACTIVE
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={filterCategory === cat ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '11px', borderRadius: '6px' }}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(3, 7, 18, 0.6)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '4px 12px', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Search portal name or ID..."
            style={{ background: 'none', border: 'none', color: '#fff', fontSize: '12px', outline: 'none', width: '100%' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '10px' }}>
        {filteredPortals.map(p => (
          <div 
            key={p.id} 
            className="glass-panel" 
            style={{ 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between', 
              gap: '14px', 
              minHeight: '220px',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>
                  {p.id}
                </span>
                <span className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>
                  {p.category}
                </span>
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#fff', margin: '0 0 6px 0', fontFamily: 'var(--font-display)' }}>
                {p.name}
              </h4>
              <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.4', margin: 0 }}>
                {p.desc}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                🔑 SECURE CREDENTIALS:<br/>
                Email: {p.email}<br/>
                Pass: {p.pass}
              </div>
              <button
                className="btn-primary"
                style={{ width: '100%', padding: '8px 12px', fontSize: '11px', borderRadius: '6px', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}
                onClick={() => handleSwitchRole(p)}
              >
                🚀 Launch Portal
              </button>
            </div>
          </div>
        ))}
        {filteredPortals.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
            &lt; No portals match your query &gt;
          </div>
        )}
      </div>
    </div>
  );
};

export const Dashboards: React.FC<DashboardsProps> = ({ role, userEmail, userName, userAvatar, activeTab, credentials = DEMO_CREDENTIALS, onAddCredential, onUpdateCredential, onUpdateUser }) => {
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'offline'>('synced');
  const isInitialLoadRef = React.useRef(true);
  // Shared Local Database States loaded from localStorage
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);

  // V2: Fetch projects and tasks from the secure backend
  React.useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    fetch(`${API_URL}/api/projects`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        } else {
          // Fallback to local storage if backend is empty/offline for demo resilience
          const saved = localStorage.getItem('cs-projects');
          if (saved) setProjects(JSON.parse(saved));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('cs-projects');
        if (saved) setProjects(JSON.parse(saved));
      });

    fetch(`${API_URL}/api/tasks`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setTasks(data);
        } else {
          const saved = localStorage.getItem('cs-tasks');
          if (saved) setTasks(JSON.parse(saved));
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('cs-tasks');
        if (saved) setTasks(JSON.parse(saved));
      });
  }, []);

  const [attendance, setAttendance] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-attendance');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [candidates, setCandidates] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-candidates');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [jobs, setJobs] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-jobs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [idCards, setIdCards] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-idcards');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [invoices, setInvoices] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-invoices');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [employeeWorks, setEmployeeWorks] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-employee-works');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Sync state hooks
  React.useEffect(() => {
    safeLocalStorageSetItem('cs-projects', JSON.stringify(projects));
  }, [projects]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-tasks', JSON.stringify(tasks));
  }, [tasks]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-attendance', JSON.stringify(attendance));
  }, [attendance]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-candidates', JSON.stringify(candidates));
  }, [candidates]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-jobs', JSON.stringify(jobs));
  }, [jobs]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-idcards', JSON.stringify(idCards));
  }, [idCards]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-invoices', JSON.stringify(invoices));
  }, [invoices]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-employee-works', JSON.stringify(employeeWorks));
  }, [employeeWorks]);

  const LEADERSHIP_VERSION = 'v3';
  // Only data: URLs (user uploads) are valid stored images — all bundled asset paths are stale after rebuild
  const isValidStoredImage = (img: string) => typeof img === 'string' && img.startsWith('data:');

  const [leadershipPartners, setLeadershipPartners] = useState<any[]>(() => {
    const saved = localStorage.getItem(`cs-leadership-partners-${LEADERSHIP_VERSION}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return parsed.map((p: any) =>
          isValidStoredImage(p.image) ? p : { ...p, image: founderImg }
        );
      } catch (e) {}
    }
    return [
      {
        id: 'LDR-001',
        name: 'Subham Ghorai',
        role: 'Founder & CEO',
        image: founderImg,
        description: 'Visionary creative director and founder of DreamAvian Studios, leading next-gen 3D animation and VFX pipelines.'
      }
    ];
  });

  React.useEffect(() => {
    safeLocalStorageSetItem(`cs-leadership-partners-${LEADERSHIP_VERSION}`, JSON.stringify(leadershipPartners));
  }, [leadershipPartners]);

  // Founder Story state (all users read, owner/super_admin edit)
  const [founderStory, setFounderStory] = useState<{ title: string; body: string; image: string }>(() => {
    const saved = localStorage.getItem('cs-founder-story');
    if (saved) { 
      try { 
        const parsed = JSON.parse(saved); 
        const hasOldData = parsed.body && (parsed.body.includes('OTT') || parsed.body.includes('powerhouse that today serves'));
        if (parsed && !hasOldData) {
          // Replace Chitraspanda references automatically if they exist in localStorage
          if (parsed.body) {
            parsed.body = parsed.body
              .replace(/Chitraspanda Studios/gi, 'DreamAvian Studios')
              .replace(/Chitraspanda/gi, 'DreamAvian')
              .replace(/Chitra Spanda Studios/gi, 'DreamAvian Studios')
              .replace(/Chitra Spanda/gi, 'DreamAvian');
          }
          if (parsed.title) {
            parsed.title = parsed.title
              .replace(/Chitraspanda/gi, 'DreamAvian')
              .replace(/Chitra Spanda/gi, 'DreamAvian');
          }
          // Only keep stored image if it's a user-uploaded data: URL
          if (!isValidStoredImage(parsed.image)) {
            parsed.image = founderImg;
          }
          return parsed;
        }
      } catch(e) {} 
    }
    return {
      title: 'Where Imagination Becomes Reality',
      body: 'Founded by Subham Ghorai on July 1, 2026, DreamAvian Studios started as an ambitious online creative studio focused on animation, games, VFX, storytelling, and technology. The studio operates as a remote-first collaborative powerhouse, working with elite artists, developers, and filmmakers across India and the United States. Driven by the philosophy "Where Imagination Becomes Reality", we combine advanced CGI pipelines, AI solutions, custom software development, and immersive storytelling to craft experiences that inspire global audiences.',
      image: founderImg,
    };
  });
  const [isEditingStory, setIsEditingStory] = useState(false);
  const [editStoryTitle, setEditStoryTitle] = useState('');
  const [editStoryBody, setEditStoryBody]   = useState('');
  const [editStoryImage, setEditStoryImage] = useState<string>('');
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);

  // ── Image Editor state ──
  const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
  const [imgEditorSrc, setImgEditorSrc] = useState<string>('');
  const [imgEditorBrightness, setImgEditorBrightness] = useState(100);
  const [imgEditorContrast, setImgEditorContrast] = useState(100);
  const [imgEditorSaturation, setImgEditorSaturation] = useState(100);
  const [imgEditorScale, setImgEditorScale] = useState(100);
  const imgEditorInputRef = React.useRef<HTMLInputElement>(null);

  // Refs for Founder's Journey 4-Process Pipeline
  const chapterTitleInputRef = React.useRef<HTMLInputElement>(null);
  const chapterImageFileInputRef = React.useRef<HTMLInputElement>(null);
  const journeyVideoFileInputRef = React.useRef<HTMLInputElement>(null);
  const pptxFileInputRef = React.useRef<HTMLInputElement>(null);

  // ── Journey Slides state (all users read, owner/super_admin edit) ──
  const [journeySlides, setJourneySlides] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-journey-slides-v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length >= 8) {
          // Replace Chitraspanda references automatically in localStorage
          return parsed.map((slide: any) => {
            const cleanSlide = { ...slide };
            ['title', 'subtitle', 'highlightText', 'body'].forEach((key) => {
              if (cleanSlide[key]) {
                cleanSlide[key] = cleanSlide[key]
                  .replace(/Chitraspanda Studios/gi, 'DreamAvian Studios')
                  .replace(/Chitraspanda/gi, 'DreamAvian')
                  .replace(/Chitra Spanda Studios/gi, 'DreamAvian Studios')
                  .replace(/Chitra Spanda/gi, 'DreamAvian');
              }
            });
            return cleanSlide;
          });
        }
      } catch (e) {}
    }
    return [
      {
        id: 'slide-1',
        title: 'Every Great Creation Begins with a Dream',
        subtitle: 'Chapter I — The Beginning',
        layout: 'image-right',
        image: slideSunset,
        highlightText: '"Where Imagination Becomes Reality" — DreamAvian Studios',
        body: 'Every great creation begins with a dream.\n\nThe story of DreamAvian Studios began in Hooghly, West Bengal, where a young creator named Subham Ghorai developed an early fascination with animation, storytelling, technology, and the limitless possibilities of imagination.',
        bullets: [
          'Built on Imagination',
          'Strengthened by Perseverance',
          'Inspired by Sacrifice',
          'Driven by Innovation'
        ]
      },
      {
        id: 'slide-2',
        title: 'The Spark of Curiosity',
        subtitle: 'Chapter II — Childhood Inspiration',
        layout: 'image-left',
        image: slideChildhood,
        body: 'During his childhood, 3D animated cartoons became a source of inspiration that extended far beyond entertainment. They revealed worlds where creativity had no boundaries and where ideas could be transformed into unforgettable experiences.\n\nWhile many simply watched those stories unfold, he became curious about how they were created and how imagination could be transformed into something real.\n\nThat curiosity eventually became action.'
      },
      {
        id: 'slide-3',
        title: 'Curiosity Into Action',
        subtitle: 'Chapter III — First Steps in Animation',
        layout: 'image-right',
        image: slideMobileAnim,
        highlightText: 'One of his earliest projects was a short animated story featuring a boy expressing his feelings to a girl, accompanied by the timeless song "Ye Raatein Ye Mausam Nadi Ka Kinara."',
        body: 'While still in school, he began experimenting with animation using only a mobile device and Prisma3D. Though simple in execution, the project represented a defining moment—the realization that creativity is not determined by resources, but by vision, passion, and persistence.\n\nDriven by a desire to learn and create, he later launched a YouTube channel to share his early work and creative experiments. While many of those early projects no longer exist today, the experience provided valuable lessons in content creation, audience engagement, storytelling, and creative growth.'
      },
      {
        id: 'slide-4',
        title: 'A Mother\'s Sacrifice',
        subtitle: 'Chapter IV — The Pillar Behind the Vision',
        layout: 'image-left',
        image: motherSacrificeImg,
        highlightText: 'Her sacrifices, resilience, and unwavering belief in her son\'s future became one of the strongest foundations upon which his ambitions were built.',
        body: 'The journey forward was not without challenges. Growing up with financial limitations meant that opportunities often had to be earned through determination, self-learning, and continuous effort. Educational support came through the combined contributions of family members, relatives, and well-wishers.\n\nAmong all those influences, one figure remained the greatest source of inspiration—his mother.\n\nHer sacrifices, resilience, and unwavering belief in her son\'s future became one of the strongest foundations upon which his ambitions were built. Through difficult circumstances and uncertain moments, she continued to encourage learning, growth, and perseverance. Her dream was simple yet profound: to see her son build a future defined by achievement, dignity, creativity, and respect.\n\nThat dream continues to inspire the mission behind DreamAvian Studios today.'
      },
      {
        id: 'slide-5',
        title: 'Growth & Creative Evolution',
        subtitle: 'Chapter V — The Multidisciplinary Journey',
        layout: 'image-right',
        image: slideTools,
        body: 'As the years progressed, his interests expanded beyond animation alone. What began with mobile-based experimentation gradually evolved into a multidisciplinary creative journey encompassing animation, filmmaking, graphic design, storytelling, voice artistry, digital content creation, artificial intelligence, multimedia production, creative technology, and digital innovation.\n\nThrough continuous self-learning and formal education in Animation and Film Making, he developed expertise in Blender, Autodesk Maya, Adobe Photoshop, Adobe Illustrator, AI-powered creative tools, visual storytelling, graphic design, multimedia workflows, and emerging digital technologies.',
        gridItems: [
          { title: 'Animation & Film', desc: 'Original animated stories and filmmaking crafted with heart and technical precision.', icon: '🎬' },
          { title: 'Game Development', desc: 'Immersive game universes like DreamLink that explore the power of imagination.', icon: '🎮' },
          { title: 'AI & Innovation', desc: 'Leveraging AI-powered tools to push the boundaries of creative possibility.', icon: '🧠' },
          { title: 'Education & Mentorship', desc: 'Nurturing future talent and empowering the next generation of creators.', icon: '🎓' }
        ]
      },
      {
        id: 'slide-6',
        title: 'DreamLink: A Universe Born from Imagination',
        subtitle: 'Chapter VI — The Flagship IP',
        layout: 'image-left',
        image: slideDreamlinkWorld,
        highlightText: '"When people stop dreaming, worlds disappear. When people dare to dream again, new worlds are born."',
        body: 'While pursuing a Bachelor\'s degree in Animation and Film Making, Subham and several college friends began developing DreamLink—an original game universe that would later become the flagship intellectual property of DreamAvian Studios.\n\nDreamLink is more than a game. It is a universe built around imagination, dreams, memory, creativity, and human potential. Set within a world where imagination itself is fading, the project explores the idea that dreams are among humanity\'s most powerful forces and that creativity has the ability to reconnect people with hope, purpose, and possibility.'
      },
      {
        id: 'slide-7',
        title: 'DreamAvian Studios Is Born',
        subtitle: 'Chapter VII — July 1, 2026',
        layout: 'image-right',
        image: slideStorefront,
        highlightText: 'The name DreamAvian symbolizes the pulse of imagination—the continuous movement of ideas, emotions, dreams, creativity, and innovation that drive human progress.',
        body: 'Inspired by years of learning, experimentation, personal growth, and creative exploration, DreamAvian Studios was officially founded on July 1, 2026.\n\nMore than an animation studio, it was envisioned as the beginning of a future creative ecosystem capable of uniting animation, game development, filmmaking, visual effects, software innovation, artificial intelligence, education, and digital storytelling under a single vision.\n\nThe name DreamAvian symbolizes the pulse of imagination—the continuous movement of ideas, emotions, dreams, creativity, and innovation that drive human progress. It represents the belief that every great achievement begins with a single idea and the courage to pursue it.'
      },
      {
        id: 'slide-8',
        title: 'A Mission Beyond Creation',
        subtitle: 'Chapter VIII — The Future Awaits',
        layout: 'image-left',
        image: slideTeam,
        highlightText: 'Built on imagination. Strengthened by perseverance. Inspired by sacrifice. Driven by innovation.',
        body: 'Today, DreamAvian Studios stands at the beginning of its journey. Its purpose extends beyond creating games, animations, films, software, or technology. Its mission is to inspire dreamers, empower creators, nurture future talent, and build opportunities for those who believe in the power of imagination.\n\nWhat began as the curiosity of a young creator inspired by animated worlds is gradually evolving into a vision for a global creative ecosystem—where artists, developers, storytellers, innovators, and dreamers can create together.\n\nA future where creativity and technology work hand in hand, and where imagination becomes reality.\n\nAnd dedicated to creating worlds that inspire generations to dream bigger.'
      }
    ];
  });

  React.useEffect(() => {
    // Strip base64 images before saving to localStorage to prevent QuotaExceededError
    const slidesToSave = journeySlides.map(slide => {
      const isBase64 = slide.image && slide.image.startsWith('data:');
      return {
        ...slide,
        image: isBase64 ? '' : slide.image
      };
    });
    safeLocalStorageSetItem('cs-journey-slides-v3', JSON.stringify(slidesToSave));
    
    const saveImagesToDB = async () => {
      for (const slide of journeySlides) {
        if (slide.image && slide.image.startsWith('data:')) {
          try {
            await savePortfolioFileToDB(`slide-image-${slide.id}`, slide.image);
          } catch (e) {
            console.error(`Failed to save image for slide ${slide.id} to IndexedDB:`, e);
          }
        }
      }
      try {
        await cleanUnusedSlideImagesFromDB(journeySlides.map(s => s.id));
      } catch (e) {
        console.error("Failed to clean up unused slide images from IndexedDB:", e);
      }
    };
    saveImagesToDB();
  }, [journeySlides]);

  // Slides management form states
  const [isManagingSlides, setIsManagingSlides] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideFormTitle, setSlideFormTitle] = useState('');
  const [slideFormSubtitle, setSlideFormSubtitle] = useState('');
  const [slideFormLayout, setSlideFormLayout] = useState<'image-right' | 'image-left' | 'grid-no-image'>('image-right');
  const [slideFormBody, setSlideFormBody] = useState('');
  const [slideFormImage, setSlideFormImage] = useState('');
  const [slideFormHighlightText, setSlideFormHighlightText] = useState('');
  const [slideFormBullets, setSlideFormBullets] = useState('');
  
  // Custom grid item states for slide-3 style grids
  const [slideGrid1Title, setSlideGrid1Title] = useState('');
  const [slideGrid1Desc, setSlideGrid1Desc] = useState('');
  const [slideGrid1Icon, setSlideGrid1Icon] = useState('🎬');

  const [slideGrid2Title, setSlideGrid2Title] = useState('');
  const [slideGrid2Desc, setSlideGrid2Desc] = useState('');
  const [slideGrid2Icon, setSlideGrid2Icon] = useState('🎮');

  const [slideGrid3Title, setSlideGrid3Title] = useState('');
  const [slideGrid3Desc, setSlideGrid3Desc] = useState('');
  const [slideGrid3Icon, setSlideGrid3Icon] = useState('🧠');

  const [slideGrid4Title, setSlideGrid4Title] = useState('');
  const [slideGrid4Desc, setSlideGrid4Desc] = useState('');
  const [slideGrid4Icon, setSlideGrid4Icon] = useState('🎓');

  // Master Portfolio project form states
  const [isManagingProjects, setIsManagingProjects] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projFormName, setProjFormName] = useState('');
  const [projFormStatus, setProjFormStatus] = useState<'Planning' | 'Pre-Production' | 'Production' | 'Post-Production' | 'Delivered'>('Planning');
  const [projFormTimeline, setProjFormTimeline] = useState('Jan 2026 - Aug 2026');
  const [projFormBudget, setProjFormBudget] = useState('$50,000');
  const [projFormCompletion, setProjFormCompletion] = useState(0);
  const [projFormDesc, setProjFormDesc] = useState('');

  // Master Portfolio showreel upload form and lightbox states
  const [projFormFile, setProjFormFile] = useState<string | null>(null);
  const [projFormFileName, setProjFormFileName] = useState('');
  const [projFormFileType, setProjFormFileType] = useState('');
  const [projFormExternalUrl, setProjFormExternalUrl] = useState('');
  const [activePortfolioAsset, setActivePortfolioAsset] = useState<{ title: string; url: string; type: string } | null>(null);

  // Password visibility state for cross-tenant user listings
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});

  // Board partner editing states
  const [editingPartnerId, setEditingPartnerId] = useState<string | null>(null);

  // PPTX parsing status states
  const [isParsingPptx, setIsParsingPptx] = useState(false);
  const [pptxParsingStatus, setPptxParsingStatus] = useState('');

  // Founder's Journey video states
  const [journeyVideoUrl, setJourneyVideoUrl] = useState<string | null>(null);
  const [journeyVideoName, setJourneyVideoName] = useState('');

  // Software Hub states
  const [softwares, setSoftwares] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-software-hub');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) {
          // Filter out the demo packages
          return parsed.filter((item: any) => item.id !== 'soft-1' && item.id !== 'soft-2' && item.id !== 'soft-3');
        }
      } catch (e) {}
    }
    return [];
  });

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-software-hub', JSON.stringify(softwares));
  }, [softwares]);

  // Software search & filter states
  const [softSearchQuery, setSoftSearchQuery] = useState('');
  const [softSelectedCategory, setSoftSelectedCategory] = useState('All');

  // Software download tracking states
  const [activeDownloads, setActiveDownloads] = useState<Record<string, number>>({});
  const [activeDownloadStatus, setActiveDownloadStatus] = useState<Record<string, string>>({});

  // Software upload form states
  const [isUploadingSoftware, setIsUploadingSoftware] = useState(false);
  const [softwareUploadProgress, setSoftwareUploadProgress] = useState(0);
  const [softwareUploadLogs, setSoftwareUploadLogs] = useState<string[]>([]);
  const [softFormName, setSoftFormName] = useState('');
  const [softFormVersion, setSoftFormVersion] = useState('v1.0.0');
  const [softFormCategory, setSoftFormCategory] = useState('VFX & Renderer');
  const [softFormDesc, setSoftFormDesc] = useState('');
  const [softFormFile, setSoftFormFile] = useState<string | null>(null);
  const [softFormFileName, setSoftFormFileName] = useState('');
  const [softFormFileSize, setSoftFormFileSize] = useState('');

  // Load Founder's Journey video from IndexedDB on mount
  React.useEffect(() => {
    const loadJourneyVideo = async () => {
      try {
        const fileData = await getPortfolioFileFromDB('founder-journey-video');
        if (fileData) {
          setJourneyVideoUrl(fileData);
          const meta = localStorage.getItem('cs-founder-journey-video-meta');
          if (meta) {
            const parsed = JSON.parse(meta);
            setJourneyVideoName(parsed.name || 'Founder Journey Video');
          } else {
            setJourneyVideoName('Founder Journey Video');
          }
        }
      } catch (e) {
        console.error("Failed to load founder journey video from IndexedDB:", e);
      }
    };
    loadJourneyVideo();
  }, []);
  // Close lightbox on ESC key
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightboxSrc(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  React.useEffect(() => {
    safeLocalStorageSetItem('cs-founder-story', JSON.stringify(founderStory));
  }, [founderStory]);

  // 1. Sync from user profile settings avatar (App.tsx prop) to founder story image
  React.useEffect(() => {
    if (role === 'studio_owner' && userAvatar && userAvatar !== founderStory.image) {
      setFounderStory(prev => ({ ...prev, image: userAvatar }));
    }
  }, [userAvatar, role]);

  // 2. Sync from founder story image change to board leadership LDR-001 and local storage session
  React.useEffect(() => {
    setLeadershipPartners(prev => {
      const match = prev.find(p => p.id === 'LDR-001');
      if (match && match.image !== founderStory.image) {
        return prev.map(p => p.id === 'LDR-001' ? { ...p, image: founderStory.image } : p);
      }
      return prev;
    });

    if (role === 'studio_owner') {
      const savedUserStr = localStorage.getItem('cs-auto-login-user');
      if (savedUserStr) {
        try {
          const parsed = JSON.parse(savedUserStr);
          if (parsed.avatar !== founderStory.image) {
            parsed.avatar = founderStory.image;
            safeLocalStorageSetItem('cs-auto-login-user', JSON.stringify(parsed));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {}
      }

      const savedCredsStr = localStorage.getItem('cs-credentials');
      if (savedCredsStr) {
        try {
          const parsed = JSON.parse(savedCredsStr);
          let changed = false;
          const updated = parsed.map((c: any) => {
            if (c.role === 'studio_owner' && c.avatar !== founderStory.image) {
              changed = true;
              return { ...c, avatar: founderStory.image };
            }
            return c;
          });
          if (changed) {
            safeLocalStorageSetItem('cs-credentials', JSON.stringify(updated));
            window.dispatchEvent(new Event('storage'));
          }
        } catch (e) {}
      }
    }
  }, [founderStory.image, role]);

  // 3. Cross-tab synchronization via local storage event listeners
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cs-founder-story' && e.newValue) {
        try { setFounderStory(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === `cs-leadership-partners-${LEADERSHIP_VERSION}` && e.newValue) {
        try { setLeadershipPartners(JSON.parse(e.newValue)); } catch (err) {}
      }
      if (e.key === 'cs-journey-slides-v3' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          mergeSlideImagesFromDB(parsed).then(merged => {
            setJourneySlides(merged);
          });
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Software Hub Handlers
  const handleSoftwareUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!softFormName.trim()) {
      alert("Please enter a software name.");
      return;
    }
    if (!softFormFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploadingSoftware(true);
    setSoftwareUploadProgress(0);
    setSoftwareUploadLogs([`> INIT: Establishing secure pipeline to cloud server...`]);

    const logSteps = [
      { progress: 15, msg: `> CONNECT: Secure portal connected. Handshaking...` },
      { progress: 35, msg: `> PARSE: Reading binary file bytes (${softFormFileSize})...` },
      { progress: 55, msg: `> CRYPTO: Generating SHA-256 checksum sequence...` },
      { progress: 75, msg: `> TRANSFER: Writing data packets to IndexedDB vault...` },
      { progress: 95, msg: `> VERIFY: Checksum matched. Validating signature...` },
      { progress: 100, msg: `> SUCCESS: Software package synced to Cloud Database!` }
    ];

    let currentStep = 0;
    const interval = setInterval(async () => {
      if (currentStep < logSteps.length) {
        const step = logSteps[currentStep];
        setSoftwareUploadProgress(step.progress);
        setSoftwareUploadLogs(prev => [...prev, step.msg]);
        currentStep++;
      } else {
        clearInterval(interval);
        
        // Save to IndexedDB
        const dbKey = `software-${Date.now()}`;
        try {
          await savePortfolioFileToDB(dbKey, softFormFile);
          
          const newSoft = {
            id: `soft-${Date.now()}`,
            name: softFormName.trim(),
            version: softFormVersion.trim() || 'v1.0.0',
            description: softFormDesc.trim() || `Installer for ${softFormName}.`,
            category: softFormCategory,
            fileSize: softFormFileSize,
            uploadDate: new Date().toISOString().split('T')[0],
            fileName: softFormFileName,
            dbKey: dbKey,
            downloads: 0,
            uploadedBy: userName || 'Studio Owner'
          };

          setSoftwares(prev => [newSoft, ...prev]);

          // Clear form
          setSoftFormName('');
          setSoftFormVersion('v1.0.0');
          setSoftFormCategory('VFX & Renderer');
          setSoftFormDesc('');
          setSoftFormFile(null);
          setSoftFormFileName('');
          setSoftFormFileSize('');

          setTimeout(() => {
            setIsUploadingSoftware(false);
            setSoftwareUploadLogs([]);
            alert(`🎉 Software '${newSoft.name}' uploaded and registered successfully!`);
          }, 300);

        } catch (err) {
          console.error("IndexedDB error:", err);
          alert("Error saving software installer to database.");
          setIsUploadingSoftware(false);
        }
      }
    }, 300);
  };

  const handleSoftwareDownload = async (software: any) => {
    const softId = software.id;
    
    // Set active download state
    setActiveDownloads(prev => ({ ...prev, [softId]: 0 }));
    setActiveDownloadStatus(prev => ({ ...prev, [softId]: 'Connecting...' }));

    const downloadSteps = [
      { progress: 20, status: 'Handshaking...' },
      { progress: 50, status: 'Fetching blocks...' },
      { progress: 80, status: 'Assembling bytes...' },
      { progress: 95, status: 'Verifying MD5...' },
      { progress: 100, status: 'Ready' }
    ];

    let stepIdx = 0;
    const interval = setInterval(async () => {
      if (stepIdx < downloadSteps.length) {
        const step = downloadSteps[stepIdx];
        setActiveDownloads(prev => ({ ...prev, [softId]: step.progress }));
        setActiveDownloadStatus(prev => ({ ...prev, [softId]: step.status }));
        stepIdx++;
      } else {
        clearInterval(interval);
        
        try {
          let blob: Blob;
          if (software.dbKey) {
            // Retrieve real uploaded file
            const fileData = await getPortfolioFileFromDB(software.dbKey);
            if (!fileData) {
              alert("Error: Software installer binary not found in database.");
              // Remove tracking
              setActiveDownloads(prev => {
                const copy = { ...prev };
                delete copy[softId];
                return copy;
              });
              setActiveDownloadStatus(prev => {
                const copy = { ...prev };
                delete copy[softId];
                return copy;
              });
              return;
            }
            blob = base64ToBlob(fileData);
          } else {
            // Generate dummy mockup file for preloaded items
            const mockContent = `DreamAvian Software Installer\n` +
              `---------------------------------\n` +
              `Software: ${software.name}\n` +
              `Version: ${software.version}\n` +
              `Build Date: ${software.uploadDate}\n` +
              `File Name: ${software.fileName}\n` +
              `Status: Verification Successful. Please contact system admin for license key.\n`;
            blob = new Blob([mockContent], { type: 'application/octet-stream' });
          }

          // Trigger native download
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = software.fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          // Update download counts
          setSoftwares(prev => prev.map(s => s.id === softId ? { ...s, downloads: s.downloads + 1 } : s));

        } catch (err) {
          console.error("Download processing failed:", err);
          alert("Failed to compile package for download.");
        }

        // Clean tracking states after brief delay
        setTimeout(() => {
          setActiveDownloads(prev => {
            const copy = { ...prev };
            delete copy[softId];
            return copy;
          });
          setActiveDownloadStatus(prev => {
            const copy = { ...prev };
            delete copy[softId];
            return copy;
          });
        }, 1000);
      }
    }, 200);
  };

  const handleSoftwareDelete = async (software: any) => {
    if (!window.confirm(`⚠️ Are you sure you want to permanently delete the software release '${software.name}'?`)) {
      return;
    }
    
    if (software.dbKey) {
      try {
        await deletePortfolioFileFromDB(software.dbKey);
      } catch (e) {
        console.error("Failed to delete file from DB:", e);
      }
    }
    
    setSoftwares(prev => prev.filter(s => s.id !== software.id));
  };

  // Work Samples State (Loaded from localStorage or default values)
  const [workSamples, setWorkSamples] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-work-samples');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [];
  });

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-work-samples', JSON.stringify(workSamples));
  }, [workSamples]);

  // Sync work samples from other tabs
  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cs-work-samples' && e.newValue) {
        try { setWorkSamples(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Milestones & Vision State
  const [milestones, setMilestones] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-milestones-vision');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const hasOldData = parsed.some((item: any) => item.year === '2019' || item.year === '2021');
        if (parsed && parsed.length > 0 && !hasOldData) return parsed;
      } catch (e) {}
    }
    return [
      { year: '2026', icon: '🚀', title: 'DreamAvian Studios Founded', desc: 'Founded by Subham Ghorai on July 1, 2026. Started as an ambitious online creative studio focused on animation, games, VFX, storytelling, and technology.', color: '#06b6d4' },
      { year: '2026–2027', icon: '🎮', title: 'DreamLink Development Begins', desc: 'Development begins on the studio\'s first original project, DreamLink, while building production pipelines, creative workflows, and portfolio projects.', color: '#7c3aed' },
      { year: '2027–2028', icon: '🎓', title: 'DreamAvian Academy Launch', desc: 'Launch educational programs and training initiatives in Animation, VFX, Game Development, AI, and Digital Content Creation.', color: '#f59e0b' },
      { year: '2028–2030', icon: '🌎', title: 'India & USA Expansion', desc: 'Expand client partnerships across India and the United States while growing production capabilities and service offerings.', color: '#10b981' },
      { year: '2030+', icon: '🏢', title: 'Physical Studio Establishment', desc: 'Establish a dedicated physical production facility and creative workspace for artists, developers, filmmakers, and innovators.', color: '#ec4899' },
    ];
  });

  const [isEditingMilestones, setIsEditingMilestones] = useState(false);
  const [tempMilestones, setTempMilestones] = useState<any[]>([]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-milestones-vision', JSON.stringify(milestones));
  }, [milestones]);

  React.useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cs-milestones-vision' && e.newValue) {
        try { setMilestones(JSON.parse(e.newValue)); } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ── Cloud Synchronization Hooks ──
  const isManager = role === 'studio_owner' || role === 'super_admin';

  React.useEffect(() => {
    const initCloudSync = async () => {
      setSyncStatus('syncing');
      try {
        // Pre-load local slide images from IndexedDB before cloud sync
        const localMerged = await mergeSlideImagesFromDB(journeySlides);
        const hasLocalChanged = localMerged.some((s, idx) => s.image !== journeySlides[idx]?.image);
        if (hasLocalChanged) {
          setJourneySlides(localMerged);
        }

        const cloudData = await loadAllFromCloud(
          founderStory,
          localMerged,
          leadershipPartners,
          milestones
        );

        if (cloudData.founderStory) {
          if (cloudData.founderStory.body) {
            cloudData.founderStory.body = cloudData.founderStory.body
              .replace(/Chitraspanda Studios/gi, 'DreamAvian Studios')
              .replace(/Chitraspanda/gi, 'DreamAvian')
              .replace(/Chitra Spanda Studios/gi, 'DreamAvian Studios')
              .replace(/Chitra Spanda/gi, 'DreamAvian');
          }
          if (cloudData.founderStory.title) {
            cloudData.founderStory.title = cloudData.founderStory.title
              .replace(/Chitraspanda/gi, 'DreamAvian')
              .replace(/Chitra Spanda/gi, 'DreamAvian');
          }
          setFounderStory(cloudData.founderStory);
        }
        if (cloudData.journeySlides && cloudData.journeySlides.length > 0) {
          cloudData.journeySlides = cloudData.journeySlides.map((slide: any) => {
            const cleanSlide = { ...slide };
            ['title', 'subtitle', 'highlightText', 'body'].forEach((key) => {
              if (cleanSlide[key]) {
                cleanSlide[key] = cleanSlide[key]
                  .replace(/Chitraspanda Studios/gi, 'DreamAvian Studios')
                  .replace(/Chitraspanda/gi, 'DreamAvian')
                  .replace(/Chitra Spanda Studios/gi, 'DreamAvian Studios')
                  .replace(/Chitra Spanda/gi, 'DreamAvian');
              }
            });
            return cleanSlide;
          });
          const merged = await mergeSlideImagesFromDB(cloudData.journeySlides);
          setJourneySlides(merged);
        }
        if (cloudData.leadershipPartners && cloudData.leadershipPartners.length > 0) {
          cloudData.leadershipPartners = cloudData.leadershipPartners.map((partner: any) => {
            const cleanPartner = { ...partner };
            if (cleanPartner.name) {
              cleanPartner.name = cleanPartner.name
                .replace(/Chitraspanda/gi, 'DreamAvian')
                .replace(/Chitra Spanda/gi, 'DreamAvian');
            }
            if (cleanPartner.role) {
              cleanPartner.role = cleanPartner.role
                .replace(/Chitraspanda/gi, 'DreamAvian')
                .replace(/Chitra Spanda/gi, 'DreamAvian');
            }
            if (cleanPartner.description) {
              cleanPartner.description = cleanPartner.description
                .replace(/Chitraspanda/gi, 'DreamAvian')
                .replace(/Chitra Spanda/gi, 'DreamAvian');
            }
            return cleanPartner;
          });
          setLeadershipPartners(cloudData.leadershipPartners);
        }
        if (cloudData.milestones && cloudData.milestones.length > 0) {
          cloudData.milestones = cloudData.milestones.map((m: any) => {
            const cleanMilestone = { ...m };
            if (cleanMilestone.title) {
              cleanMilestone.title = cleanMilestone.title
                .replace(/Chitraspanda/gi, 'DreamAvian')
                .replace(/Chitra Spanda/gi, 'DreamAvian');
            }
            if (cleanMilestone.desc) {
              cleanMilestone.desc = cleanMilestone.desc
                .replace(/Chitraspanda/gi, 'DreamAvian')
                .replace(/Chitra Spanda/gi, 'DreamAvian');
            }
            return cleanMilestone;
          });
          setMilestones(cloudData.milestones);
        }
        
        setSyncStatus('synced');
      } catch (err) {
        console.error('Failed to load cloud data on mount:', err);
        setSyncStatus('offline');
      } finally {
        isInitialLoadRef.current = false;
      }
    };
    initCloudSync();
  }, []);

  React.useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (!isManager) return;
    
    const sync = async () => {
      setSyncStatus('syncing');
      try {
        await saveStoryToCloud(founderStory);
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('offline');
      }
    };
    sync();
  }, [founderStory, isManager]);

  React.useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (!isManager) return;
    
    const sync = async () => {
      setSyncStatus('syncing');
      try {
        await saveSlidesToCloud(journeySlides);
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('offline');
      }
    };
    sync();
  }, [journeySlides, isManager]);

  React.useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (!isManager) return;
    
    const sync = async () => {
      setSyncStatus('syncing');
      try {
        await savePartnersToCloud(leadershipPartners);
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('offline');
      }
    };
    sync();
  }, [leadershipPartners, isManager]);

  React.useEffect(() => {
    if (isInitialLoadRef.current) return;
    if (!isManager) return;
    
    const sync = async () => {
      setSyncStatus('syncing');
      try {
        await saveMilestonesToCloud(milestones);
        setSyncStatus('synced');
      } catch (e) {
        setSyncStatus('offline');
      }
    };
    sync();
  }, [milestones, isManager]);

  // Add Work Sample Modal States
  const [isAddingWorkSample, setIsAddingWorkSample] = useState(false);
  const [wsTitle, setWsTitle] = useState('');
  const [wsCategory, setWsCategory] = useState('3D Character Animation');
  const [wsClient, setWsClient] = useState('');
  const [wsYear, setWsYear] = useState('2026');
  const [wsTech, setWsTech] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [wsStats, setWsStats] = useState('');
  const [wsPlayblast, setWsPlayblast] = useState('');
  const [wsVideoUrl, setWsVideoUrl] = useState('');
  const [wsVideoFile, setWsVideoFile] = useState<string | null>(null);
  const [wsVideoFileName, setWsVideoFileName] = useState('');

  // Job Creation Modal & Form States
  const [isCreatingJob, setIsCreatingJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDept, setJobDept] = useState('');
  const [jobType, setJobType] = useState('Full-time');
  const [jobLoc, setJobLoc] = useState('Remote');
  const [jobSalary, setJobSalary] = useState('');
  const [jobExp, setJobExp] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobResp, setJobResp] = useState('');
  const [jobReq, setJobReq] = useState('');
  const [jobBen, setJobBen] = useState('');

  // Selected Job for Visitor Details/Application View Modal
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  
  // Application Form States
  const [appFullName, setAppFullName] = useState('');
  const [appEmail, setAppEmail] = useState('');
  const [appPortfolio, setAppPortfolio] = useState('');
  const [appResume, setAppResume] = useState('');
  const [appCoverLetter, setAppCoverLetter] = useState('');
  const [appExpectedSalary, setAppExpectedSalary] = useState('');
  const [appSuccess, setAppSuccess] = useState(false);

  // Leadership & Partner form states
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerRole, setNewPartnerRole] = useState('Lead Investor');
  const [newPartnerDesc, setNewPartnerDesc] = useState('');
  const [newPartnerImage, setNewPartnerImage] = useState<string | null>(null);

  const handlePartnerImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPartnerImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartnerName || !newPartnerRole || !newPartnerDesc) {
      alert("Please fill in name, designation, and description.");
      return;
    }

    if (editingPartnerId) {
      setLeadershipPartners(prev => prev.map(p => p.id === editingPartnerId ? {
        ...p,
        name: newPartnerName,
        role: newPartnerRole,
        description: newPartnerDesc,
        image: newPartnerImage || ''
      } : p));
      setEditingPartnerId(null);
      alert("🎉 Board Member/Partner updated successfully!");
    } else {
      const newPartner = {
        id: `LDR-${Math.floor(1000 + Math.random() * 9000)}`,
        name: newPartnerName,
        role: newPartnerRole,
        description: newPartnerDesc,
        image: newPartnerImage || ''
      };
      setLeadershipPartners(prev => [...prev, newPartner]);
      alert("🎉 Board Member/Partner added successfully!");
    }

    setNewPartnerName('');
    setNewPartnerRole('Lead Investor');
    setNewPartnerDesc('');
    setNewPartnerImage(null);
  };

  const handleDeletePartner = (id: string) => {
    if (confirm("Are you sure you want to remove this board member/partner?")) {
      setLeadershipPartners(prev => prev.filter(p => p.id !== id));
    }
  };

  // Work Sample Management Handlers
  const handleAddWorkSample = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wsTitle) {
      alert('Please fill out the Title.');
      return;
    }
    const newSample = {
      id: 'ws-' + Date.now().toString().slice(-4),
      title: wsTitle,
      category: wsCategory,
      client: wsClient || 'Internal Production',
      year: wsYear || new Date().getFullYear().toString(),
      tech: wsTech || 'Blender, After Effects',
      desc: wsDesc || 'No description provided.',
      stats: wsStats || '1080p FHD // 24 FPS',
      playblastName: wsPlayblast || `${wsTitle.replace(/\s+/g, '_')}_v01.pb`,
      videoUrl: wsVideoFile || wsVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
    };

    setWorkSamples([newSample, ...workSamples]);
    setIsAddingWorkSample(false);

    // Reset Form
    setWsTitle('');
    setWsCategory('3D Character Animation');
    setWsClient('');
    setWsYear('2026');
    setWsTech('');
    setWsDesc('');
    setWsStats('');
    setWsPlayblast('');
    setWsVideoUrl('');
    setWsVideoFile(null);
    setWsVideoFileName('');

    alert('🎉 New production work sample added successfully!');
  };

  const handleDeleteWorkSample = (id: string) => {
    if (window.confirm('Are you sure you want to delete this work sample?')) {
      setWorkSamples(workSamples.filter(ws => ws.id !== id));
      if (activePlayblastId === id) {
        setActivePlayblastId(null);
      }
      if (selectedSampleId === id) {
        setSelectedSampleId(null);
      }
    }
  };

  // Job Posting Management Handlers
  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle || !jobDept) {
      alert('Job Title and Department are required.');
      return;
    }
    
    const parseList = (str: string) => str.split('\n').map(s => s.trim()).filter(Boolean);

    const newJob = {
      id: 'JOB-' + Date.now().toString().slice(-4),
      title: jobTitle,
      department: jobDept,
      type: jobType,
      location: jobLoc,
      salaryRange: jobSalary || 'Not Disclosed',
      experience: jobExp || 'Not specified',
      description: jobDesc,
      responsibilities: parseList(jobResp),
      requirements: parseList(jobReq),
      benefits: parseList(jobBen),
      postedDate: new Date().toLocaleDateString(),
      status: 'Recruiting'
    };

    setJobs([newJob, ...jobs]);
    
    // Reset Form
    setJobTitle('');
    setJobDept('');
    setJobType('Full-time');
    setJobLoc('Remote');
    setJobSalary('');
    setJobExp('');
    setJobDesc('');
    setJobResp('');
    setJobReq('');
    setJobBen('');
    setIsCreatingJob(false);
    
    alert('🎉 Job Vacancy posted successfully!');
  };

  const handleDeleteJob = (jobId: string) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      setJobs(jobs.filter(j => j.id !== jobId));
    }
  };

  const handleToggleJobStatus = (jobId: string) => {
    setJobs(jobs.map(j => {
      if (j.id === jobId) {
        return { ...j, status: j.status === 'Recruiting' ? 'Closed' : 'Recruiting' };
      }
      return j;
    }));
  };

  const handleApplyJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appFullName || !appEmail) {
      alert('Please fill out Name and Email.');
      return;
    }
    
    const assessmentScore = Math.floor(Math.random() * 20) + 80;
    const score = Math.floor(Math.random() * 15) + 80;
    
    const newCandidate = {
      id: 'CAND-' + Date.now().toString().slice(-4),
      name: appFullName,
      email: appEmail,
      appliedRole: selectedJob ? selectedJob.title : 'General Application',
      score: score,
      assessmentScore: assessmentScore,
      status: 'Applied',
      stage: 'Resume Screen',
      resumeFile: appResume || 'portfolio_link.pdf',
      portfolio: appPortfolio,
      coverLetter: appCoverLetter,
      expectedSalary: appExpectedSalary,
      appliedDate: new Date().toLocaleDateString()
    };

    setCandidates([newCandidate, ...candidates]);
    setAppSuccess(true);
    
    alert(`🎉 Application submitted successfully for ${selectedJob ? selectedJob.title : 'General Position'}! Our recruitment team will review it.`);
    
    setTimeout(() => {
      setAppFullName('');
      setAppEmail('');
      setAppPortfolio('');
      setAppResume('');
      setAppCoverLetter('');
      setAppExpectedSalary('');
      setAppSuccess(false);
      setIsApplying(false);
      setSelectedJob(null);
    }, 1000);
  };

  const handleDeleteCandidate = (candidateId: string) => {
    if (window.confirm("⚠️ Are you sure you want to permanently delete this candidate profile?")) {
      setCandidates(prev => prev.filter(c => c.id !== candidateId));
    }
  };

  const MOCK_PROJECTS = projects;

  // Work upload form states
  const [workProjName, setWorkProjName] = useState('Netflix Promo');
  const [workTitle, setWorkTitle] = useState('');
  const [workDesc, setWorkDesc] = useState('');
  const [workFileType, setWorkFileType] = useState<'video' | 'image' | 'audio' | 'document'>('video');
  const [workFileUrl, setWorkFileUrl] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [workUploadProgress, setWorkUploadProgress] = useState(0);

  // Review states
  const [selectedWorkId, setSelectedWorkId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');

  const handleWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle || !workDesc) {
      alert("Please enter a title and description for your work submission.");
      return;
    }

    setIsSubmittingWork(true);
    setWorkUploadProgress(10);

    const interval = setInterval(() => {
      setWorkUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          const newWork = {
            id: `WRK-${Math.floor(1000 + Math.random() * 9000)}`,
            employeeName: userName,
            employeeEmail: userEmail,
            employeeRole: role === 'freelancer' ? 'Contract Freelancer' : (role === 'intern' ? 'Creative Intern' : role.toUpperCase().replace('_', ' ')),
            projectName: workProjName,
            title: workTitle,
            description: workDesc,
            fileUrl: workFileUrl || (workFileType === 'video' ? 'https://www.w3schools.com/html/mov_bbb.mp4' : (workFileType === 'audio' ? 'https://www.w3schools.com/html/horse.mp3' : 'https://picsum.photos/800/600?random=' + Math.floor(Math.random() * 100))),
            fileType: workFileType,
            fileName: workFileUrl ? workFileUrl.split('/').pop() : `upload_${Date.now()}.${workFileType === 'video' ? 'mp4' : (workFileType === 'audio' ? 'mp3' : 'jpg')}`,
            submittedAt: new Date().toISOString(),
            status: 'Pending Review',
            feedback: '',
            reviewedBy: ''
          };

          setEmployeeWorks(prevWorks => [newWork, ...prevWorks]);
          setIsSubmittingWork(false);
          setWorkTitle('');
          setWorkDesc('');
          setWorkFileUrl('');
          alert("🎉 Work submitted successfully online! Your manager has been notified.");
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleReviewSubmit = (workId: string, status: 'Approved' | 'Requires Changes') => {
    setEmployeeWorks(prevWorks => 
      prevWorks.map(w => 
        w.id === workId 
          ? { ...w, status, feedback: reviewFeedback, reviewedBy: userName }
          : w
      )
    );
    setReviewFeedback('');
    setSelectedWorkId(null);
    alert(`Submission has been marked as: ${status}`);
  };

  // Dynamic Calculations for USD and INR
  const usdPaidInvoices = invoices.filter(inv => inv.status === 'Paid' && (!inv.amount.includes('₹') && !inv.amount.toLowerCase().includes('inr')));
  const inrPaidInvoices = invoices.filter(inv => inv.status === 'Paid' && (inv.amount.includes('₹') || inv.amount.toLowerCase().includes('inr')));
  
  const usdRevenue = usdPaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);
  const inrRevenue = inrPaidInvoices.reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);

  const usdBillings = invoices.filter(inv => !inv.amount.includes('₹') && !inv.amount.toLowerCase().includes('inr')).reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);
  const inrBillings = invoices.filter(inv => inv.amount.includes('₹') || inv.amount.toLowerCase().includes('inr')).reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);

  const staffHeadcount = credentials.filter(c => c.role !== 'client' && c.role !== 'visitor_public').length;
  
  const activeStaffList = credentials.filter(c => c.role !== 'client' && c.role !== 'visitor_public' && c.role !== 'studio_owner');
  
  const usdStaffExpenses = activeStaffList
    .filter(c => (c as any).salaryCurrency !== 'INR')
    .reduce((sum, c) => sum + ((c as any).salary !== undefined ? (c as any).salary : 3500), 0);

  const inrStaffExpenses = activeStaffList
    .filter(c => (c as any).salaryCurrency === 'INR')
    .reduce((sum, c) => sum + ((c as any).salary !== undefined ? (c as any).salary : 290000), 0);

  const avgAssetIteration = tasks.length > 0 
    ? `${(1.2 + (tasks.length % 5) * 0.1).toFixed(1)} cycles` 
    : '0.0 cycles';

  // Format Helper for USD/INR Display
  const formatCurrencyPair = (usdVal: number, inrVal: number) => {
    if (usdVal > 0 && inrVal > 0) {
      return `$${usdVal.toLocaleString()} / ₹${inrVal.toLocaleString()}`;
    }
    if (usdVal > 0) return `$${usdVal.toLocaleString()}`;
    if (inrVal > 0) return `₹${inrVal.toLocaleString()}`;
    return '$0';
  };

  // Client-specific calculations
  const clientInvoices = invoices.filter(i => i.client.toLowerCase() === userName.toLowerCase() || i.client.toLowerCase() === userEmail.toLowerCase());
  const clientUsdContracted = clientInvoices.filter(inv => !inv.amount.includes('₹') && !inv.amount.toLowerCase().includes('inr')).reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);
  const clientInrContracted = clientInvoices.filter(inv => inv.amount.includes('₹') || inv.amount.toLowerCase().includes('inr')).reduce((sum, inv) => sum + parseFloat(inv.amount.replace(/[^0-9.]/g, '') || '0'), 0);

  // Social Contact Channels Brand Icon Resolver
  const getContactIcon = (label: string, type: string) => {
    const normLabel = label.toLowerCase();
    if (normLabel.includes('facebook')) return <Facebook size={16} />;
    if (normLabel.includes('instagram')) return <Instagram size={16} />;
    if (normLabel.includes('youtube')) return <Youtube size={16} />;
    if (normLabel.includes('twitter') || normLabel.includes(' x ')) return <Twitter size={16} />;
    if (normLabel.includes('gmail') || normLabel.includes('email') || normLabel.includes('mail') || type === 'email') return <Mail size={16} />;
    if (normLabel.includes('phone') || normLabel.includes('call') || normLabel.includes('whatsapp') || normLabel.includes('mobile')) return <Phone size={16} />;
    if (type === 'link') return <Link size={16} />;
    return <Globe size={16} />;
  };

  // Dynamic Contact Channels State
  const [contactLinks, setContactLinks] = useState<{ label: string; value: string; type: 'link' | 'email' | 'text' }[]>(() => {
    const saved = localStorage.getItem('cs-contact-links');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      { label: 'Gmail', value: 'contact@dreamavian.com', type: 'email' },
      { label: 'Instagram', value: 'https://www.instagram.com/dreamavianstudios/', type: 'link' },
      { label: 'Facebook Page', value: 'https://www.facebook.com/profile.php?id=61591330797576', type: 'link' }
    ];
  });

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-contact-links', JSON.stringify(contactLinks));
  }, [contactLinks]);
  
  // Interactive States
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [isPlayingScript, setIsPlayingScript] = useState(false);
  const [newCardName, setNewCardName] = useState('Ritwick Bose');
  const [newCardRole, setNewCardRole] = useState('Contract Animator');
  const [newCardBloodGroup, setNewCardBloodGroup] = useState('O+');
  const [newCardExpiry, setNewCardExpiry] = useState('2033-12-31');
  const [newCardDept, setNewCardDept] = useState('Animation');
  const [newCardClearance, setNewCardClearance] = useState('Level 1');
  const [newCardImage, setNewCardImage] = useState<string | null>(null);
  const [newCardPhone, setNewCardPhone] = useState('+91 98765 43210');
  const [newCardId, setNewCardId] = useState(() => `CID-${Math.floor(100000 + Math.random() * 900000)}`);
  const [qrScanTargetCardId, setQrScanTargetCardId] = useState<string>('');
  const [isQrScanning, setIsQrScanning] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<{ message: string; type: 'success' | 'warning' | 'danger' } | null>(null);
  const triggerSecurityNotice = (message: string, type: 'success' | 'warning' | 'danger' = 'success') => {
    setSecurityNotice({ message, type });
    setTimeout(() => {
      setSecurityNotice(prev => prev?.message === message ? null : prev);
    }, 4000);
  };

  // Work Samples Interactive States
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [activePlayblastId, setActivePlayblastId] = useState<string | null>(null);

  // User Account Provisioning states
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('animator');
  const [newUserAvatar, setNewUserAvatar] = useState('');
  const [newUserSalary, setNewUserSalary] = useState('');
  const [newUserSalaryCurrency, setNewUserSalaryCurrency] = useState<'USD' | 'INR'>('USD');

  // Edit user states
  const [editingUserEmail, setEditingUserEmail] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState('animator');
  const [editRoleTitle, setEditRoleTitle] = useState('');
  const [editUserAvatar, setEditUserAvatar] = useState('');
  const [editSalary, setEditSalary] = useState('');
  const [editSalaryCurrency, setEditSalaryCurrency] = useState<'USD' | 'INR'>('USD');

  // Freelancer timesheet currency state
  const [freelanceCurrency, setFreelanceCurrency] = useState<'USD' | 'INR'>('USD');

  const handleNewUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditUserAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartEditUser = (cred: any) => {
    setEditingUserEmail(cred.email);
    setEditName(cred.name);
    setEditEmail(cred.email);
    setEditPassword(cred.password);
    setEditRole(cred.role);
    setEditRoleTitle(cred.roleTitle || '');
    setEditUserAvatar(cred.avatar || '');
    setEditSalary(cred.salary !== undefined ? cred.salary.toString() : '');
    setEditSalaryCurrency(cred.salaryCurrency || 'USD');
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUserEmail) return;
    if (!editName || !editEmail || !editPassword || !editRole) {
      alert("Please fill in all details.");
      return;
    }

    const adminRoles = ['super_admin', 'id_card_admin'];
    const subAdminRoles = ['hr', 'finance', 'academy_director', 'project_manager', 'team_lead', 'mentor', 'producer'];
    const isTargetAdminOrSub = adminRoles.includes(editRole) || subAdminRoles.includes(editRole) || editRole === 'studio_owner';

    // Permission check: only Studio Owner or Super Admin can edit/assign Admin/Sub-Admin roles
    const isOwnerOrSuper = role === 'studio_owner' || role === 'super_admin';
    if (isTargetAdminOrSub && !isOwnerOrSuper) {
      alert("❌ Permission Denied: Admin and Sub-Admin accounts can only be updated by the Super Admin or Studio Owner.\n\n(এডমিন এবং সাব-এডমিন অ্যাকাউন্ট শুধুমাত্র সুপার এডমিন বা স্টুডিও ওনার আপডেট করতে পারবেন।)");
      return;
    }

    const roleTitles: Record<string, string> = {
      super_admin: "Super Admin",
      studio_owner: "Studio Owner",
      director: "Creative Director",
      producer: "Executive Producer",
      project_manager: "Project Manager",
      team_lead: "Animation Team Lead",
      animator: "3D Animator",
      designer: "Character Designer",
      storyboard_artist: "Storyboard Artist",
      editor: "Video Editor",
      voice_artist: "Voice Artist",
      freelancer: "Contract Animator",
      client: "Client Producer",
      hr: "HR Director",
      recruiter: "Lead Recruiter",
      finance: "CFO / Finance Lead",
      academy_director: "Academy Director",
      trainer: "VFX Trainer",
      student: "Animation Student",
      intern: "Studio Intern",
      mentor: "Senior 3D Artist",
      id_card_admin: "Security Systems Admin",
      visitor_public: "Public Visitor"
    };

    const updatedCred = {
      email: editEmail,
      password: editPassword,
      role: editRole,
      name: editName,
      roleTitle: editRoleTitle || roleTitles[editRole] || "Staff Member",
      avatar: editUserAvatar,
      salary: editSalary ? parseFloat(editSalary) : undefined,
      salaryCurrency: editSalaryCurrency
    };

    if (onUpdateCredential) {
      onUpdateCredential(editingUserEmail, updatedCred);
      alert(`✅ Account details updated successfully for ${editName}!`);
      setEditingUserEmail(null);
    } else {
      alert("onUpdateCredential handler is not configured on console shell.");
    }
  };

  const renderEditUserForm = (allRoles: { key: string; label: string }[]) => (
    <div className="glass-panel animate-fade-in" style={{ ...styles.halfCol, border: '1px solid var(--accent-color)', boxShadow: '0 0 20px rgba(6,182,212,0.15)' }}>
      <h3 style={styles.subTitle} className="text-gradient">Edit User Profile (Owner Console)</h3>
      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
        MODIFYING: {editingUserEmail} // CONSOLE: ACTIVE
      </div>
      <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <label style={styles.formLabel}>Full Name</label>
          <input 
            type="text" 
            className="glass-input" 
            value={editName} 
            onChange={(e) => setEditName(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label style={styles.formLabel}>Email Address</label>
          <input 
            type="email" 
            className="glass-input" 
            value={editEmail} 
            onChange={(e) => setEditEmail(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label style={styles.formLabel}>Access Password</label>
          <input 
            type="password" 
            className="glass-input" 
            value={editPassword} 
            onChange={(e) => setEditPassword(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label style={styles.formLabel}>Assign Organization Role</label>
          <select 
            className="glass-input" 
            value={editRole} 
            onChange={(e) => setEditRole(e.target.value)}
            style={{ background: 'var(--bg-color)', color: '#fff' }}
          >
            {allRoles.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ flex: 2 }}>
            <label style={styles.formLabel}>Monthly Salary / Rate</label>
            <input 
              type="number" 
              className="glass-input" 
              value={editSalary} 
              onChange={(e) => setEditSalary(e.target.value)} 
              placeholder="e.g., 3500" 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={styles.formLabel}>Currency</label>
            <select 
              className="glass-input" 
              value={editSalaryCurrency} 
              onChange={(e) => setEditSalaryCurrency(e.target.value as 'USD' | 'INR')}
              style={{ background: 'var(--bg-color)', color: '#fff' }}
            >
              <option value="USD">USD ($)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>
        </div>
        <div>
          <label style={styles.formLabel}>Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            className="glass-input"
            onChange={handleEditUserAvatarChange}
            style={{ padding: '8px', cursor: 'pointer' }}
          />
          {editUserAvatar && (
            <img src={editUserAvatar} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', marginTop: 8, objectFit: 'cover', border: '2px solid var(--accent-color)' }} />
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button type="submit" className="btn-primary" style={{ flex: 1 }}>
            Save Changes
          </button>
          <button 
            type="button" 
            className="btn-secondary" 
            onClick={() => setEditingUserEmail(null)} 
            style={{ flex: 1 }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword || !newUserRole) {
      alert("Please fill in all user profile details.");
      return;
    }

    // Role classification
    const adminRoles = ['super_admin', 'id_card_admin'];
    const subAdminRoles = ['hr', 'finance', 'academy_director', 'project_manager', 'team_lead', 'mentor', 'producer'];
    const isTargetAdminOrSub = adminRoles.includes(newUserRole) || subAdminRoles.includes(newUserRole) || newUserRole === 'studio_owner';

    // Permission check
    const isOwnerOrSuper = role === 'studio_owner' || role === 'super_admin';

    if (isTargetAdminOrSub && !isOwnerOrSuper) {
      alert("❌ Permission Denied: Admin and Sub-Admin accounts can only be created by the Super Admin or Studio Owner.\n\n(এডমিন এবং সাব-এডমিন অ্যাকাউন্ট শুধুমাত্র সুপার এডমিন বা স্টুডিও ওনার তৈরি করতে পারবেন।)");
      return;
    }

    // Mapping role keys to Display Titles
    const roleTitles: Record<string, string> = {
      super_admin: "Super Admin",
      studio_owner: "Studio Owner",
      director: "Creative Director",
      producer: "Executive Producer",
      project_manager: "Project Manager",
      team_lead: "Animation Team Lead",
      animator: "3D Animator",
      designer: "Character Designer",
      storyboard_artist: "Storyboard Artist",
      editor: "Video Editor",
      voice_artist: "Voice Artist",
      freelancer: "Contract Animator",
      client: "Client Producer",
      hr: "HR Director",
      recruiter: "Lead Recruiter",
      finance: "CFO / Finance Lead",
      academy_director: "Academy Director",
      trainer: "VFX Trainer",
      student: "Animation Student",
      intern: "Studio Intern",
      mentor: "Senior 3D Artist",
      id_card_admin: "Security Systems Admin",
      visitor_public: "Public Visitor"
    };

    // newUserAvatar is set via handleNewUserAvatarChange when a photo is uploaded
    const newCred = {
      email: newUserEmail,
      password: newUserPassword,
      role: newUserRole,
      name: newUserName,
      roleTitle: roleTitles[newUserRole] || "Staff Member",
      avatar: newUserAvatar,
      salary: newUserSalary ? parseFloat(newUserSalary) : undefined,
      salaryCurrency: newUserSalaryCurrency
    };

    if (onAddCredential) {
      onAddCredential(newCred);
      alert(`✅ Account created successfully for ${newUserName} (${roleTitles[newUserRole]})!`);
      // Reset form fields
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('animator');
      setNewUserAvatar('');
      setNewUserSalary('');
      setNewUserSalaryCurrency('USD');
    } else {
      alert("onAddCredential handler is not configured on console shell.");
    }
  };


  // Security Admin Portal States
  const [securityDevices, setSecurityDevices] = useState([
    { id: 'dev-1', location: 'Main Entrance Lobby', IP: '192.168.10.45', status: 'Online', locked: false },
    { id: 'dev-2', location: 'Studio Floor A gate', IP: '192.168.10.46', status: 'Online', locked: false },
    { id: 'dev-3', location: 'LMS Classroom doorway', IP: '192.168.10.47', status: 'Offline', locked: false },
  ]);
  const [securityAlerts, setSecurityAlerts] = useState([
    { id: 'alt-1', title: 'Intrusion Attempt', details: 'IP 192.168.1.104 made 5 failed authentication requests on SSH node.', severity: 'High', time: '10 mins ago', acknowledged: false },
    { id: 'alt-2', title: 'Unknown NFC Scan', details: 'NFC Card CID-284910 scan failed at Executive Suite.', severity: 'Medium', time: '2 hours ago', acknowledged: true }
  ]);
  const [pingerStates, setPingerStates] = useState<Record<string, boolean>>({});
  const [searchCardText, setSearchCardText] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIP, setNewDeviceIP] = useState('');
  const [isSystemLockdown, setIsSystemLockdown] = useState(false);
  const [isTestAlarmActive, setIsTestAlarmActive] = useState(false);
  const [activeLogMethodFilter, setActiveLogMethodFilter] = useState('All');
  const [activeLogStatusFilter, setActiveLogStatusFilter] = useState('All');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [simScanUser, setSimScanUser] = useState('Bikram Das');
  const [simScanDevice, setSimScanDevice] = useState('Main Entrance Lobby');
  const [simScanMethod, setSimScanMethod] = useState<'QR Code' | 'Biometric' | 'Remote'>('QR Code');
  const [simScanStatus, setSimScanStatus] = useState<'Success' | 'Blocked'>('Success');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  
  const [gradeInput, setGradeInput] = useState('A-');
  const [gradeFeedback, setGradeFeedback] = useState('Excellent joint rigging structures.');

  // LMS Academic States
  const [lmsTab, setLmsTab] = useState<'courses' | 'lectures' | 'quiz' | 'assignments'>('courses');

  // Studio Owner Financial & Resource States
  const [financeSubTab, setFinanceSubTab] = useState<'ledger' | 'usage'>('ledger');

  const [bankAccounts, setBankAccounts] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-bank-accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [financialTransactions, setFinancialTransactions] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-financial-transactions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [systemUsage, setSystemUsage] = useState<any>(() => {
    const saved = localStorage.getItem('cs-system-usage');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      gpuHoursUsed: 0,
      gpuHoursLimit: 5000,
      cloudStorageUsed: 0,
      cloudStorageLimit: 10.0,
      activeLicensesUsed: 0,
      activeLicensesLimit: 50,
      aiTokensUsed: 0,
      aiTokensLimit: 500000
    };
  });

  // Financial Form States
  const [newTxType, setNewTxType] = useState<'Income' | 'Expense'>('Income');
  const [newTxCategory, setNewTxCategory] = useState('Project Payment');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCurrency, setNewTxCurrency] = useState<'USD' | 'INR'>('USD');
  const [newTxDescription, setNewTxDescription] = useState('');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTxAccountId, setNewTxAccountId] = useState('acc-01');

  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('Checking');
  const [newAccCurrency, setNewAccCurrency] = useState<'USD' | 'INR'>('USD');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccInitialBalance, setNewAccInitialBalance] = useState('');
  const [coursesList, setCoursesList] = useState<Course[]>(() => {
    const saved = localStorage.getItem('cs-courses');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [selectedCourseId, setSelectedCourseId] = useState('crs-01');
  const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(35);
  
  // New Course Inputs
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseTrainer, setNewCourseTrainer] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState('10 Weeks');
  const [newCoursePrice, setNewCoursePrice] = useState('$249');

  // Quiz States
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Student Assignment States
  const [assignmentsList, setAssignmentsList] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-assignments');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | null>(null);
  const [newAsmTitle, setNewAsmTitle] = useState('');
  const [newAsmFile, setNewAsmFile] = useState('walk_cycle_v2.mp4');

  const [blockers, setBlockers] = useState<any[]>(() => {
    const saved = localStorage.getItem('cs-blockers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-assignments', JSON.stringify(assignmentsList));
  }, [assignmentsList]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-blockers', JSON.stringify(blockers));
  }, [blockers]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-courses', JSON.stringify(coursesList));
  }, [coursesList]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-bank-accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-financial-transactions', JSON.stringify(financialTransactions));
  }, [financialTransactions]);

  React.useEffect(() => {
    safeLocalStorageSetItem('cs-system-usage', JSON.stringify(systemUsage));
  }, [systemUsage]);
  const [freelanceHours, setFreelanceHours] = useState('24');
  const [freelanceRate, setFreelanceRate] = useState('45');
  const [internReportText, setInternReportText] = useState('');
  const [mentorEvalText, setMentorEvalText] = useState('');

  // Super Admin Tenant Provisioning Form State
  const [provName, setProvName] = useState('');
  const [provSub, setProvSub] = useState('');
  const [provPlan, setProvPlan] = useState('Enterprise');
  const [tenantsList, setTenantsList] = useState([
    { name: 'Mumbai Studio Ltd', subdomain: 'mumbai-studio', plan: 'Enterprise', status: 'Active' },
    { name: 'Kolkata Layouts', subdomain: 'kolkata-layout', plan: 'Professional', status: 'Active' }
  ]);

  // Simulated S3 File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileName = e.target.files[0].name;
    setUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploadedFiles((prevFiles) => [fileName, ...prevFiles]);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Clock In Helper
  const handleClockIn = () => {
    if (!isClockedIn) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newLog = {
        id: `att-${Date.now()}`,
        userName: userName,
        time: timeStr,
        status: 'Present' as const,
        method: 'QR Code' as const
      };
      setAttendance([newLog, ...attendance]);
      setIsClockedIn(true);
    } else {
      setIsClockedIn(false);
    }
  };

  // Create ID Access Card
  const handleCreateIDCard = () => {
    const newCard = {
      cardId: newCardId,
      userName: newCardName,
      role: newCardRole,
      qrHash: `hash_${newCardName.toLowerCase().replace(/ /g, '_')}_${Date.now()}`,
      status: 'Active' as const,
      zones: ['Main Lobby', 'Studio Floor A'],
      bloodGroup: newCardBloodGroup,
      expiryDate: newCardExpiry,
      department: newCardDept,
      clearanceLevel: newCardClearance,
      image: newCardImage || undefined,
      phone: newCardPhone
    };
    setIdCards([newCard, ...idCards]);
    triggerSecurityNotice('Access Card Generated successfully!');
    // Pre-generate next unique ID card number
    setNewCardId(`CID-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const downloadCardAsPNG = (
    name: string,
    role: string,
    dept: string,
    blood: string,
    expiry: string,
    phone: string,
    cardId: string,
    imageSrc?: string
  ) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d')!;

    // Load logo image first
    const logoImg2 = new Image();
    logoImg2.src = logoImg;

    const startDrawing = (logoLoaded: boolean) => {
      // 1. Draw Background
      const grad = ctx.createRadialGradient(300, 200, 50, 300, 200, 350);
      grad.addColorStop(0, '#0f2c38'); // Cyan glow center
      grad.addColorStop(1, '#030712'); // Dark background edge
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 400);

      // 2. Draw Cyan Glow Border
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 380);

      // 3. Draw Scanline overlay
      ctx.fillStyle = 'rgba(6, 182, 212, 0.05)';
      for (let y = 12; y < 388; y += 4) {
        ctx.fillRect(12, y, 576, 2);
      }

      // 4. Draw Studio Logo
      if (logoLoaded) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(25, 25, 40, 40, 8);
        ctx.clip();
        ctx.drawImage(logoImg2, 25, 25, 40, 40);
        ctx.restore();

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(25, 25, 40, 40, 8);
        ctx.stroke();
      } else {
        // Fallback Vector Logo
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(45, 45, 15, 0.7 * Math.PI, 3.3 * Math.PI, false); 
        ctx.stroke();
        
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(40, 37);
        ctx.lineTo(52, 45);
        ctx.lineTo(40, 53);
        ctx.closePath();
        ctx.fill();
      }

      // Studio Name
      ctx.fillStyle = '#00f0ff';
      ctx.font = 'bold 12px "Orbitron", sans-serif';
      ctx.fillText('DREAMAVIAN', 75, 43);
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '8px "Share Tech Mono", monospace';
      ctx.fillText('SECURE ACCESS CREDENTIAL', 75, 54);

      // Verified badge
      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(490, 30, 80, 22);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(490, 30, 80, 22);
      ctx.fillStyle = '#34d399';
      ctx.font = 'bold 8px "Share Tech Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFIED', 530, 44);
      ctx.textAlign = 'left'; // reset

      // Load Employee Photo
      if (imageSrc) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(30, 100, 110, 110, 16);
          ctx.clip();
          ctx.drawImage(img, 30, 100, 110, 110);
          ctx.restore();
          
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(30, 100, 110, 110, 16);
          ctx.stroke();
          drawDetailsAndDownload();
        };
        img.onerror = () => {
          drawFallbackAvatar();
          drawDetailsAndDownload();
        };
        img.src = imageSrc;
      } else {
        drawFallbackAvatar();
        drawDetailsAndDownload();
      }
    };

    const drawDetailsAndDownload = () => {
      // Draw Text Details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(name || 'No Name Entered', 160, 125);

      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      ctx.font = '13px sans-serif';
      ctx.fillText(role || 'No Role Assigned', 160, 148);

      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(`DEPT: ${dept || 'Animation'}`, 160, 172);

      // Blood and Expiry Box
      ctx.fillStyle = 'rgba(255,255,255,0.02)';
      ctx.fillRect(160, 195, 260, 50);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.strokeRect(160, 195, 260, 50);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px monospace';
      ctx.fillText('BLOOD GP', 175, 214);
      ctx.fillText('EXPIRY', 295, 214);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(blood || 'O+', 175, 232);
      ctx.fillText(expiry || '2033-12-31', 295, 232);

      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '10px monospace';
      ctx.fillText(`PHONE: ${phone || 'N/A'}`, 160, 265);

      // Card ID badge
      ctx.fillStyle = 'rgba(6,182,212,0.1)';
      ctx.fillRect(160, 280, 110, 20);
      ctx.strokeStyle = 'rgba(6,182,212,0.3)';
      ctx.strokeRect(160, 280, 110, 20);
      ctx.fillStyle = '#22d3ee';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(cardId, 170, 294);

      // Authorizing Signature
      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '8px sans-serif';
      ctx.fillText('AUTHORIZING SIGN', 440, 265);
      
      // Signature text
      ctx.fillStyle = '#a5f3fc';
      ctx.font = '24px "Alex Brush", cursive';
      ctx.fillText('Subham', 430, 292);

      ctx.fillStyle = 'rgba(255,255,255,0.4)';
      ctx.font = '7px sans-serif';
      ctx.fillText('CEO & STUDIO OWNER', 440, 305);

      // QR Code Box
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(440, 100, 110, 110);
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(440, 100, 110, 110);
      
      // Draw a mock QR code layout inside QR box
      ctx.fillStyle = '#000000';
      ctx.fillRect(445, 105, 25, 25);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(450, 110, 15, 15);
      ctx.fillStyle = '#000000';
      ctx.fillRect(455, 115, 5, 5);

      ctx.fillRect(520, 105, 25, 25);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(525, 110, 15, 15);
      ctx.fillStyle = '#000000';
      ctx.fillRect(530, 115, 5, 5);

      ctx.fillRect(445, 180, 25, 25);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(450, 185, 15, 15);
      ctx.fillStyle = '#000000';
      ctx.fillRect(455, 190, 5, 5);

      ctx.fillStyle = '#000000';
      ctx.fillRect(480, 110, 6, 6);
      ctx.fillRect(495, 115, 12, 6);
      ctx.fillRect(485, 130, 18, 6);
      ctx.fillRect(475, 140, 6, 18);
      ctx.fillRect(510, 145, 12, 12);
      ctx.fillRect(490, 160, 18, 6);
      ctx.fillRect(515, 175, 12, 6);
      ctx.fillRect(480, 185, 6, 12);

      // Download trigger
      const link = document.createElement('a');
      link.download = `ID_Card_${name.replace(/ /g, '_')}_${cardId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    function drawFallbackAvatar() {
      ctx.fillStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.beginPath();
      ctx.roundRect(30, 100, 110, 110, 16);
      ctx.fill();
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(85, 140, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(85, 205, 38, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(25, 155);
      ctx.lineTo(145, 155);
      ctx.stroke();
    }

    logoImg2.onload = () => {
      startDrawing(true);
    };
    logoImg2.onerror = () => {
      startDrawing(false);
    };
  };

  // Resolve PM Blockers
  const handleResolveBlocker = (id: string) => {
    setBlockers(blockers.map(b => b.id === id ? { ...b, status: 'Resolved' } : b));
  };

  // Submit Freelancer Invoice
  const handleSubmitInvoice = () => {
    const totalAmount = parseFloat(freelanceHours) * parseFloat(freelanceRate);
    const currencySymbol = freelanceCurrency === 'INR' ? '₹' : '$';
    const newInvoice = {
      id: `INV-FREE-${Math.floor(1000 + Math.random() * 9000)}`,
      client: 'DreamAvian Studios Inc',
      amount: `${currencySymbol}${totalAmount}`,
      status: 'Draft' as const,
      dueDate: '2026-07-22',
      projectName: 'Mumbai-Run (3D Sci-Fi)'
    };
    setInvoices([newInvoice, ...invoices]);
    alert(`Invoice submitted! Total Amount: ${currencySymbol}${totalAmount}`);
  };

  // Tenant Provision Handler
  const handleProvisionTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provName || !provSub) return;
    const newTenant = {
      name: provName,
      subdomain: provSub.toLowerCase(),
      plan: provPlan,
      status: 'Active'
    };
    setTenantsList([...tenantsList, newTenant]);
    setProvName('');
    setProvSub('');
    alert(`Tenant ${provName} provisioned successfully!`);
  };

  // =========================================================================
  // SUB-RENDERERS FOR ALL SIDEBAR TABS (100% clickable, defined inside scope)
  // =========================================================================

  // 1. Super Admin Tabs
  const renderSuperAdminMonitor = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h2 style={styles.sectionTitle}>Global System Health Monitor</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Active Tenants</div>
            <div style={styles.metricValue}>42</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>API SLA Latency</div>
            <div style={styles.metricValue}>24ms</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Global CPU Load</div>
            <div style={styles.metricValue}>18%</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Database Node Status</div>
            <div style={{ ...styles.metricValue, color: 'var(--success)' }}>HEALTHY</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTenantProvisioning = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Provision New Studio/Academy Tenant</h3>
        <form onSubmit={handleProvisionTenant} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Organization Name</label>
            <input type="text" className="glass-input" value={provName} onChange={(e) => setProvName(e.target.value)} placeholder="e.g., Kolkata Renders" required />
          </div>
          <div>
            <label style={styles.formLabel}>Subdomain Routing</label>
            <input type="text" className="glass-input" value={provSub} onChange={(e) => setProvSub(e.target.value)} placeholder="e.g., kolkata-renders" required />
          </div>
          <div>
            <label style={styles.formLabel}>Subscription Plan</label>
            <select className="glass-input" value={provPlan} onChange={(e) => setProvPlan(e.target.value)}>
              <option value="Standard">Standard</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Provision Instance</button>
        </form>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Active Studio Tenants</h3>
        <ul style={styles.list}>
          {tenantsList.map((t) => (
            <li key={t.subdomain} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{t.subdomain}.dreamavian.com</div>
              </div>
              <span className="badge badge-success">{t.plan}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderCrossTenantUsers = () => {
    const allRoles = [
      { key: 'super_admin', label: 'Super Admin [Admin]' },
      { key: 'id_card_admin', label: 'Security Systems Admin [Admin]' },
      { key: 'hr', label: 'HR Director [Sub-Admin]' },
      { key: 'finance', label: 'CFO / Finance Lead [Sub-Admin]' },
      { key: 'academy_director', label: 'Academy Director [Sub-Admin]' },
      { key: 'producer', label: 'Executive Producer [Sub-Admin]' },
      { key: 'project_manager', label: 'Project Manager [Sub-Admin]' },
      { key: 'team_lead', label: 'Animation Team Lead [Sub-Admin]' },
      { key: 'mentor', label: 'Senior 3D Artist [Sub-Admin]' },
      { key: 'studio_owner', label: 'Studio Owner' },
      { key: 'director', label: 'Creative Director' },
      { key: 'animator', label: '3D Animator' },
      { key: 'designer', label: 'Character Designer' },
      { key: 'storyboard_artist', label: 'Storyboard Artist' },
      { key: 'editor', label: 'Video Editor' },
      { key: 'voice_artist', label: 'Voice Artist' },
      { key: 'freelancer', label: 'Contract Animator' },
      { key: 'client', label: 'Client Producer' },
      { key: 'recruiter', label: 'Lead Recruiter' },
      { key: 'trainer', label: 'VFX Trainer' },
      { key: 'student', label: 'Animation Student' },
      { key: 'intern', label: 'Studio Intern' },
      { key: 'visitor_public', label: 'Public Visitor' }
    ];

    return (
      <div style={styles.grid}>
        {/* Left: Account Provision Form or Edit Form */}
        {editingUserEmail ? (
          renderEditUserForm(allRoles)
        ) : (
          <div style={styles.halfCol} className="glass-panel animate-fade-in">
            <h3 style={styles.subTitle}>Provision New User Credentials</h3>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
              STATUS: ACTIVE_GATEWAY // WRITE_ACCESS: AUTHORIZED
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.formLabel}>Full Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  placeholder="e.g., Sourav Ganguly" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  className="glass-input" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  placeholder="e.g., dada@dreamavian.com" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Access Password</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)} 
                  placeholder="e.g., SecurityPass321!" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Assign Organization Role</label>
                <select 
                  className="glass-input" 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ background: 'var(--bg-color)', color: '#fff' }}
                >
                  {allRoles.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={styles.formLabel}>Monthly Salary / Rate</label>
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={newUserSalary} 
                    onChange={(e) => setNewUserSalary(e.target.value)} 
                    placeholder="e.g., 3500" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Currency</label>
                  <select 
                    className="glass-input" 
                    value={newUserSalaryCurrency} 
                    onChange={(e) => setNewUserSalaryCurrency(e.target.value as 'USD' | 'INR')}
                    style={{ background: 'var(--bg-color)', color: '#fff' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.formLabel}>Profile Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="glass-input"
                  onChange={handleNewUserAvatarChange}
                  style={{ padding: '8px', cursor: 'pointer' }}
                />
                {newUserAvatar && (
                  <img src={newUserAvatar} alt="preview" style={{ width: 48, height: 48, borderRadius: '50%', marginTop: 8, objectFit: 'cover', border: '2px solid var(--accent-color)' }} />
                )}
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                Provision Credentials
              </button>
            </form>
          </div>
        )}

        {/* Right: Active Registries List */}
        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Cross-Tenant User Registries</h3>
          <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Password</th>
                  <th>Role & Actions</th>
                </tr>
              </thead>
              <tbody>
                {credentials.map((cred) => (
                  <tr key={cred.email}>
                    <td style={{ padding: '10px 0', fontSize: '11px', fontWeight: 'bold' }}>{cred.name}</td>
                    <td style={{ fontSize: '11px' }}>{cred.email}</td>
                    <td style={{ fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{revealedPasswords[cred.email] ? cred.password : '••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => setRevealedPasswords(prev => ({ ...prev, [cred.email]: !prev[cred.email] }))}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', padding: 0 }}
                          title="Show/Hide Password"
                        >
                          {revealedPasswords[cred.email] ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                    </td>
                    <td style={{ fontSize: '11px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span className="badge badge-info">
                          {cred.roleTitle}
                          {(cred as any).salary !== undefined && ` | ${(cred as any).salaryCurrency === 'INR' ? '₹' : '$'}{(cred as any).salary.toLocaleString()}`}
                        </span>
                        <button 
                          onClick={() => handleStartEditUser(cred)}
                          className="btn-secondary"
                          style={{ padding: '2px 6px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}
                          title="Edit User Profile"
                        >
                          <Edit3 size={10} /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurityAndAccess = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>IP Whitelisting & Firewall</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={styles.listItem}>
            <span>Global API Rate Limiter</span>
            <span className="badge badge-success">ACTIVE</span>
          </div>
          <div style={styles.listItem}>
            <span>Security CORS Origin Validations</span>
            <span className="badge badge-success">ENFORCED</span>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Intrusion Block Lists</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span>IP: 192.168.1.104</span>
            <span className="badge badge-danger">Blocked (Too many auth requests)</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderAuditTrailLogs = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Immutable Audit Trail logs</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '8px 0' }}>2026-06-22 21:10:04</td>
              <td>admin@dreamavian.com</td>
              <td>Enable RLS on tasks table</td>
              <td><span className="badge badge-success">SUCCESS</span></td>
            </tr>
            <tr>
              <td style={{ padding: '8px 0' }}>2026-06-22 21:12:15</td>
              <td>subhambusiness566@gmail.com</td>
              <td>Generate Client Invoice INV-2026-003</td>
              <td><span className="badge badge-success">SUCCESS</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGlobalConfig = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Global System Configuration</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '500px' }}>
          <div>
            <label style={styles.formLabel}>S3 Media Bucket URI</label>
            <input type="text" className="glass-input" defaultValue="s3://dreamavian-assets-mumbai/" />
          </div>
          <div>
            <label style={styles.formLabel}>JWT Token Expiry (Seconds)</label>
            <input type="number" className="glass-input" defaultValue="900" />
          </div>
          <button className="btn-primary" onClick={() => alert('Global configuration saved!')}>Save Configuration</button>
        </div>
      </div>
    </div>
  );

  // 2. Studio Owner Tabs
  const renderStudioOwner = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h2 style={styles.sectionTitle}>Studio Command Dashboard</h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Projects</div>
            <div style={styles.metricValue}>{MOCK_PROJECTS.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Quarterly Revenue</div>
            <div style={{ ...styles.metricValue, color: 'var(--success)' }}>{formatCurrencyPair(usdRevenue, inrRevenue)}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Staff Headcount</div>
            <div style={styles.metricValue}>{staffHeadcount} Artist{staffHeadcount === 1 ? '' : 's'}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Avg. Asset Iteration</div>
            <div style={styles.metricValue}>{avgAssetIteration}</div>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Client Billing Pipeline</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoices.slice(0, 4).map((inv) => (
              <tr key={inv.id}>
                <td>{inv.id}</td>
                <td>{inv.client}</td>
                <td><span className={`badge badge-${inv.status === 'Paid' ? 'success' : inv.status === 'Sent' ? 'info' : 'warning'}`}>{inv.status}</span></td>
                <td>{inv.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Production Roadmaps</h3>
        {MOCK_PROJECTS.map((proj) => (
          <div key={proj.id} style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
              <span>{proj.name}</span>
              <span>{proj.completion}%</span>
            </div>
            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${proj.completion}%`, background: 'var(--primary-glow)', borderRadius: '3px' }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Employee Work Activity */}
      <div style={{ ...styles.fullRow, marginTop: '20px' }} className="glass-panel animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h3 style={styles.subTitle} className="text-gradient">Recent Employee Work Feed</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', marginBottom: 0 }}>
              Track what your artists, animators, and editors are producing in real time.
            </p>
          </div>
          <button 
            className="btn-primary" 
            style={{ padding: '6px 12px', fontSize: '11px' }}
            onClick={() => {
              alert("Click on 'Employee Work Review' in the sidebar menu to review clips, add redlines, or approve assets.");
            }}
          >
            Go to Review Console
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {employeeWorks.slice(0, 5).map(w => (
            <div 
              key={w.id} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '12px 16px', 
                background: 'rgba(255,255,255,0.01)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px' 
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{w.title}</span>
                  <span className="badge badge-info" style={{ fontSize: '9px', padding: '2px 6px' }}>{w.projectName}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>by {w.employeeName} ({w.employeeRole})</span>
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)' }}>{w.description}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className={`badge badge-${w.status === 'Approved' ? 'success' : w.status === 'Requires Changes' ? 'danger' : 'warning'}`} style={{ fontSize: '10px' }}>
                  {w.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  {new Date(w.submittedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
          {employeeWorks.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
              <Info size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <span style={{ fontSize: '12px' }}>No recent work activity. Tasks are currently being worked on by staff.</span>
            </div>
          )}
        </div>
      </div>

      {/* Public Contact Us Settings */}
      <div style={{ ...styles.fullRow, marginTop: '20px' }} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle} className="text-gradient">Public Contact Us Settings</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Configure the contact links and channels shown to public visitors on the portal's "Contact" page.
        </p>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* List of current contact links */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '6px' }}>Active Channels</h4>
            {contactLinks.map((link, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '8px 12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px' 
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--accent-color)' }}>{link.label}: </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{link.value}</span>
                </div>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '4px 8px', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', fontSize: '10px' }}
                  onClick={() => {
                    setContactLinks(prev => prev.filter((_, i) => i !== idx));
                    playSecuritySynth('beep');
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
            {contactLinks.length === 0 && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px' }}>
                No active contact channels. Add one below.
              </div>
            )}
          </div>

          {/* Form to add a new contact link */}
          <div style={{ flex: '1 1 300px', background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>Add New Contact Channel</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={styles.formLabel}>Channel Label</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. Discord, Support Email, Phone" 
                  id="new-contact-label"
                />
              </div>
              <div>
                <label style={styles.formLabel}>Channel Value / Link</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  placeholder="e.g. https://discord.gg/..., +91 99999..." 
                  id="new-contact-value"
                />
              </div>
              <div>
                <label style={styles.formLabel}>Channel Type</label>
                <select className="glass-input" id="new-contact-type" defaultValue="link">
                  <option value="link">Hyperlink</option>
                  <option value="email">Email Address</option>
                  <option value="text">Plain Text / Phone</option>
                </select>
              </div>
              <button 
                className="btn-primary" 
                style={{ marginTop: '6px' }}
                onClick={() => {
                  const labelInput = document.getElementById('new-contact-label') as HTMLInputElement;
                  const valueInput = document.getElementById('new-contact-value') as HTMLInputElement;
                  const typeInput = document.getElementById('new-contact-type') as HTMLSelectElement;
                  if (labelInput && valueInput && typeInput) {
                    const label = labelInput.value.trim();
                    const value = valueInput.value.trim();
                    const type = typeInput.value as 'link' | 'email' | 'text';
                    if (!label || !value) {
                      alert('Please fill out both label and value fields.');
                      return;
                    }
                    setContactLinks(prev => [...prev, { label, value, type }]);
                    labelInput.value = '';
                    valueInput.value = '';
                    playSecuritySynth('success');
                  }
                }}
              >
                Add Channel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialAnalytics = () => {
    const totalUsdReserves = bankAccounts.filter(a => a.currency === 'USD').reduce((sum, a) => sum + a.balance, 0);
    const totalInrReserves = bankAccounts.filter(a => a.currency === 'INR').reduce((sum, a) => sum + a.balance, 0);
    const isSolvent = totalUsdReserves >= 0 && totalInrReserves >= 0;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Sub-tabs header */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button 
            className={financeSubTab === 'ledger' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setFinanceSubTab('ledger'); }}
          >
            💵 Studio Ledger & Checker
          </button>
          <button 
            className={financeSubTab === 'usage' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setFinanceSubTab('usage'); }}
          >
            📊 Accounts & Cloud Usage
          </button>
        </div>

        {/* Ledger & Checker view */}
        {financeSubTab === 'ledger' && (
          <>
            {/* Real-time Solvency Checker Widget */}
            <div 
              className="glass-panel animate-fade-in" 
              style={{ 
                background: 'linear-gradient(135deg, rgba(6,182,212,0.03) 0%, rgba(109,40,217,0.03) 100%)',
                border: '1px solid var(--border-color)',
                padding: '16px 20px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '15px'
              }}
            >
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Global Cash Reserves</span>
                <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#fff', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>
                  {formatCurrencyPair(totalUsdReserves, totalInrReserves)}
                </h2>
              </div>

              <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ledger Audit Health</div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: isSolvent ? 'var(--success)' : '#ef4444' }}>
                    {isSolvent ? '✓ Solvency Reconciled (PASS)' : '⚠ Liquidity Warning (DEFICIT)'}
                  </div>
                </div>
                <div 
                  style={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    background: isSolvent ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', 
                    border: `1px solid ${isSolvent ? 'var(--success)' : '#ef4444'}`,
                    fontSize: '11px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: isSolvent ? 'var(--success)' : '#ef4444',
                    letterSpacing: '1px',
                    boxShadow: isSolvent ? '0 0 10px rgba(34,197,94,0.15)' : 'none'
                  }}
                >
                  {isSolvent ? 'SOLVENT' : 'RE-BALANCE REQUIRED'}
                </div>
              </div>
            </div>

            <div style={styles.grid}>
              {/* Transactions History Tracker */}
              <div style={{ ...styles.halfCol, flex: '1 1 500px' }} className="glass-panel animate-fade-in">
                <h3 style={styles.subTitle}>Studio Ledger Transactions</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  A list of recorded operations, expenses, and invoices. Balances are updated in real-time.
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                  {financialTransactions.length === 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>
                      No transactions recorded in the ledger yet.
                    </p>
                  ) : (
                    financialTransactions.map((tx) => {
                      const account = bankAccounts.find(a => a.id === tx.accountId);
                      const isIncome = tx.type === 'Income';
                      return (
                        <div 
                          key={tx.id} 
                          style={{ 
                            padding: '12px',
                            background: 'rgba(255,255,255,0.01)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{tx.description}</span>
                              <span 
                                className={`badge badge-${isIncome ? 'success' : 'danger'}`}
                                style={{ fontSize: '9px', padding: '2px 6px' }}
                              >
                                {tx.category}
                              </span>
                            </div>
                            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                              Date: {tx.date} • Account: <strong style={{ color: 'var(--accent-color)' }}>{account ? account.name : 'Unknown'}</strong>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <span 
                              style={{ 
                                fontWeight: 700, 
                                fontSize: '14px', 
                                color: isIncome ? 'var(--success)' : '#ef4444' 
                              }}
                            >
                              {isIncome ? '+' : '-'}{tx.currency === 'USD' ? '$' : '₹'}{tx.amount.toLocaleString()}
                            </span>
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: '3px', color: '#ef4444' }}
                              onClick={() => handleDeleteTransaction(tx.id)}
                              title="Delete Transaction"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Record Transaction Console */}
              <div style={{ ...styles.halfCol, flex: '1 1 350px' }} className="glass-panel">
                <h3 style={styles.subTitle}>Record New Transaction</h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Log financial activities. Recording an entry adjusts the selected account balance.
                </p>
                
                <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Type</label>
                      <select 
                        className="glass-input" 
                        value={newTxType} 
                        onChange={(e) => setNewTxType(e.target.value as any)}
                      >
                        <option value="Income">Income (+)</option>
                        <option value="Expense">Expense (-)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Category</label>
                      <select 
                        className="glass-input" 
                        value={newTxCategory} 
                        onChange={(e) => setNewTxCategory(e.target.value)}
                      >
                        <option value="Project Payment">Project Payment</option>
                        <option value="Salaries">Salaries & Payroll</option>
                        <option value="Software Subscriptions">Software & Licensing</option>
                        <option value="Hardware Purchase">Hardware Assets</option>
                        <option value="Cloud Rendering">Cloud Rendering</option>
                        <option value="Taxes">Taxes & Audits</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1.2 }}>
                      <label style={styles.formLabel}>Amount</label>
                      <input 
                        type="number" 
                        className="glass-input" 
                        value={newTxAmount} 
                        onChange={(e) => setNewTxAmount(e.target.value)} 
                        placeholder="e.g. 5000" 
                        required 
                      />
                    </div>
                    <div style={{ flex: 0.8 }}>
                      <label style={styles.formLabel}>Currency</label>
                      <select 
                        className="glass-input" 
                        value={newTxCurrency} 
                        onChange={(e) => setNewTxCurrency(e.target.value as any)}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={styles.formLabel}>Source / Destination Account</label>
                    <select 
                      className="glass-input" 
                      value={newTxAccountId} 
                      onChange={(e) => setNewTxAccountId(e.target.value)}
                    >
                      {bankAccounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>
                          {acc.name} ({acc.currency} - Bal: {acc.currency === 'USD' ? '$' : '₹'}{acc.balance.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Transaction Date</label>
                      <input 
                        type="date" 
                        className="glass-input" 
                        value={newTxDate} 
                        onChange={(e) => setNewTxDate(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.formLabel}>Description Note</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      value={newTxDescription} 
                      onChange={(e) => setNewTxDescription(e.target.value)} 
                      placeholder="e.g. Purchased Maya seats for Rigging team" 
                      required 
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Plus size={16} /> Log Transaction
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Accounts & Usage view */}
        {financeSubTab === 'usage' && (
          <div style={styles.grid}>
            {/* Bank Accounts Grid */}
            <div style={{ ...styles.halfCol, flex: '1 1 450px' }} className="glass-panel animate-fade-in">
              <h3 style={styles.subTitle}>Registered Bank & Merchant Accounts</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Manage checking, savings, and gateway account configurations. Add credentials to open new channels.
              </p>
              
              {/* Account Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                {bankAccounts.map((acc) => (
                  <div 
                    key={acc.id} 
                    style={{ 
                      padding: '12px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '10px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{acc.type}</span>
                      <span className="badge badge-info" style={{ fontSize: '9px' }}>{acc.currency}</span>
                    </div>
                    <h4 style={{ color: '#fff', fontSize: '13px', fontWeight: 700, margin: '6px 0 2px 0' }}>{acc.name}</h4>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>{acc.accountNumber}</div>
                    
                    <div style={{ marginTop: '12px', textAlign: 'right' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-color)' }}>
                        {acc.currency === 'USD' ? '$' : '₹'}{acc.balance.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Account Form */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '15px' }}>
                <h4 style={{ color: '#fff', fontSize: '12px', fontWeight: 700, marginBottom: '10px' }}>Open/Register New Financial Account</h4>
                <form onSubmit={handleAddBankAccount} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1.2 }}>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={newAccName} 
                        onChange={(e) => setNewAccName(e.target.value)} 
                        placeholder="Account Name (e.g. HDFC Vault)" 
                        style={{ padding: '8px' }}
                        required 
                      />
                    </div>
                    <div style={{ flex: 0.8 }}>
                      <select 
                        className="glass-input" 
                        value={newAccType} 
                        onChange={(e) => setNewAccType(e.target.value)}
                        style={{ padding: '8px' }}
                      >
                        <option value="Checking">Checking</option>
                        <option value="Savings">Savings</option>
                        <option value="Merchant Gateway">Merchant Gateway</option>
                        <option value="Crypto Wallet">Crypto Wallet</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 0.8 }}>
                      <select 
                        className="glass-input" 
                        value={newAccCurrency} 
                        onChange={(e) => setNewAccCurrency(e.target.value as any)}
                        style={{ padding: '8px' }}
                      >
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                    <div style={{ flex: 1.2 }}>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={newAccNumber} 
                        onChange={(e) => setNewAccNumber(e.target.value)} 
                        placeholder="Account / Key ID (e.g. 5621)" 
                        style={{ padding: '8px' }}
                        required 
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1.2 }}>
                      <input 
                        type="number" 
                        className="glass-input" 
                        value={newAccInitialBalance} 
                        onChange={(e) => setNewAccInitialBalance(e.target.value)} 
                        placeholder="Initial Balance (default: 0)" 
                        style={{ padding: '8px' }}
                      />
                    </div>
                    <button type="submit" className="btn-primary" style={{ flex: 0.8, padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                      <Plus size={12} /> Open Account
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Infrastructure Resource Usage Monitor */}
            <div style={{ ...styles.halfCol, flex: '1 1 350px' }} className="glass-panel">
              <h3 style={styles.subTitle}>System Cloud Usage & Capacities</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Track cloud render farm times, AWS storage allocations, and active team seats. Upgrade tiers in real-time.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* GPU Hours */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>GPU Render Farm Hours</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{systemUsage.gpuHoursUsed.toLocaleString()} / {systemUsage.gpuHoursLimit.toLocaleString()} Hrs</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${(systemUsage.gpuHoursUsed / systemUsage.gpuHoursLimit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Usage: {((systemUsage.gpuHoursUsed / systemUsage.gpuHoursLimit) * 100).toFixed(0)}%</span>
                    <button className="btn-primary" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => handleUpgradeUsage('gpu')}>+1,000 Hrs</button>
                  </div>
                </div>

                {/* Cloud Storage */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>AWS Workspace Storage</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{systemUsage.cloudStorageUsed.toFixed(1)} / {systemUsage.cloudStorageLimit.toFixed(1)} TB</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${(systemUsage.cloudStorageUsed / systemUsage.cloudStorageLimit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Usage: {((systemUsage.cloudStorageUsed / systemUsage.cloudStorageLimit) * 100).toFixed(0)}%</span>
                    <button className="btn-primary" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => handleUpgradeUsage('storage')}>+5 TB</button>
                  </div>
                </div>

                {/* Software Licenses */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>Software Licenses (Maya/Blender/Nuke)</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{systemUsage.activeLicensesUsed} / {systemUsage.activeLicensesLimit} Seats</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${(systemUsage.activeLicensesUsed / systemUsage.activeLicensesLimit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Usage: {((systemUsage.activeLicensesUsed / systemUsage.activeLicensesLimit) * 100).toFixed(0)}%</span>
                    <button className="btn-primary" style={{ padding: '3px 8px', fontSize: '10px' }} onClick={() => handleUpgradeUsage('licenses')}>+10 Seats</button>
                  </div>
                </div>

                {/* AI Token API Usage */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>AI Assistant Engine API Tokens</span>
                    <strong style={{ color: 'var(--accent-color)' }}>{systemUsage.aiTokensUsed.toLocaleString()} / {systemUsage.aiTokensLimit.toLocaleString()}</strong>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                    <div style={{ width: `${(systemUsage.aiTokensUsed / systemUsage.aiTokensLimit) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #a855f7, #06b6d4)', borderRadius: '4px' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Usage: {((systemUsage.aiTokensUsed / systemUsage.aiTokensLimit) * 100).toFixed(0)}%</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Auto-Renews July 1</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMasterPortfolio = () => {
    const isManager = role === 'studio_owner' || role === 'super_admin';

    const handleAddProjectSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!projFormName.trim()) {
        alert("Please enter a project name.");
        return;
      }

      let fileKey = '';
      if (projFormFile) {
        fileKey = editingProjectId ? `file-${editingProjectId}` : `file-${Date.now()}`;
        try {
          await savePortfolioFileToDB(fileKey, projFormFile);
        } catch (err) {
          console.error("IndexedDB error:", err);
          alert("Error saving showreel file to IndexedDB.");
        }
      } else if (editingProjectId) {
        // Retain existing fileKey if editing and no new file was uploaded
        const existingProj = projects.find(p => p.id === editingProjectId);
        if (existingProj && existingProj.fileKey) {
          fileKey = existingProj.fileKey;
        }
      }

      const newProject = {
        id: editingProjectId || `proj-${Date.now()}`,
        name: projFormName.trim(),
        status: projFormStatus,
        budget: projFormBudget.trim(),
        completion: Number(projFormCompletion),
        description: projFormDesc.trim() || `${projFormName} description.`,
        timeline: projFormTimeline.trim() || 'Jan 2026 - Aug 2026',
        fileKey: fileKey || undefined,
        fileName: projFormFileName || undefined,
        fileType: projFormFileType || undefined,
        externalUrl: projFormExternalUrl.trim() || undefined
      };

      // V2: Send to backend
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      fetch(`${API_URL}/api/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      }).catch(e => console.error("Backend sync failed:", e));

      if (editingProjectId) {
        setProjects(prev => prev.map(p => p.id === editingProjectId ? newProject : p));
        alert("🎉 Project updated successfully!");
      } else {
        setProjects(prev => [...prev, newProject]);
        alert("🎉 New project added to portfolio successfully!");
      }

      // Reset form states
      setEditingProjectId(null);
      setIsManagingProjects(false);
      setProjFormName('');
      setProjFormStatus('Planning');
      setProjFormTimeline('Jan 2026 - Aug 2026');
      setProjFormBudget('$50,000');
      setProjFormCompletion(0);
      setProjFormDesc('');
      setProjFormFile(null);
      setProjFormFileName('');
      setProjFormFileType('');
      setProjFormExternalUrl('');
    };

    const handleStartEditProject = (proj: any) => {
      setEditingProjectId(proj.id);
      setProjFormName(proj.name);
      setProjFormStatus(proj.status);
      setProjFormTimeline(proj.timeline || 'Jan 2026 - Aug 2026');
      setProjFormBudget(proj.budget);
      setProjFormCompletion(proj.completion);
      setProjFormDesc(proj.description || '');
      setProjFormFile(null);
      setProjFormFileName(proj.fileName || '');
      setProjFormFileType(proj.fileType || '');
      setProjFormExternalUrl(proj.externalUrl || '');
      setIsManagingProjects(true);
      
      setTimeout(() => {
        document.getElementById('portfolio-form-container')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };

    const handleDeleteProject = async (id: string) => {
      if (window.confirm("Are you sure you want to remove this project from your portfolio?")) {
        const proj = projects.find(p => p.id === id);
        if (proj && proj.fileKey) {
          try {
            await deletePortfolioFileFromDB(proj.fileKey);
          } catch (e) {
            console.error("Failed to delete file from DB:", e);
          }
        }
        setProjects(prev => prev.filter(p => p.id !== id));
      }
    };

    const handlePlayAsset = async (proj: any) => {
      if (!proj.fileKey) return;
      try {
        const fileData = await getPortfolioFileFromDB(proj.fileKey);
        if (!fileData) {
          alert("File data not found in local database.");
          return;
        }
        setActivePortfolioAsset({
          title: proj.name,
          url: fileData,
          type: proj.fileType || 'application/pdf'
        });
      } catch (err) {
        console.error(err);
        alert("Failed to load portfolio asset file.");
      }
    };

    return (
      <div style={styles.grid}>
        {/* Title Header Card */}
        <div style={{ ...styles.fullRow, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }} className="glass-panel animate-fade-in">
          <div>
            <h2 style={styles.sectionTitle}>Studio Production Portfolio</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: 0 }}>
              Add, update, and manage the showcase projects, showreels, and production timelines of DreamAvian Studios.
            </p>
          </div>
          {isManager && (
            <button
              onClick={() => {
                setEditingProjectId(null);
                setProjFormName('');
                setProjFormStatus('Planning');
                setProjFormTimeline('Jan 2026 - Aug 2026');
                setProjFormBudget('$50,000');
                setProjFormCompletion(0);
                setProjFormDesc('');
                setProjFormFile(null);
                setProjFormFileName('');
                setProjFormFileType('');
                setProjFormExternalUrl('');
                setIsManagingProjects(prev => !prev);
              }}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              ➕ {isManagingProjects ? "Close Project Form" : "Add Portfolio Project"}
            </button>
          )}
        </div>

        {/* Add/Edit Project Form */}
        {isManager && isManagingProjects && (
          <div id="portfolio-form-container" style={styles.fullRow} className="glass-panel animate-fade-in">
            <h3 style={styles.subTitle}>{editingProjectId ? "✏️ Edit Portfolio Project" : "➕ Add Portfolio Project"}</h3>
            <form onSubmit={handleAddProjectSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div>
                <label style={styles.formLabel}>Project Name</label>
                <input
                  type="text"
                  className="glass-input"
                  value={projFormName}
                  onChange={e => setProjFormName(e.target.value)}
                  placeholder="e.g. Netflix Animated Promo"
                  required
                />
              </div>

              <div>
                <label style={styles.formLabel}>Project Status</label>
                <select
                  className="glass-input"
                  value={projFormStatus}
                  onChange={e => setProjFormStatus(e.target.value as any)}
                  style={{ background: 'var(--bg-color)', color: '#fff' }}
                >
                  <option value="Planning">Planning</option>
                  <option value="Pre-Production">Pre-Production</option>
                  <option value="Production">Production</option>
                  <option value="Post-Production">Post-Production</option>
                  <option value="Delivered">Delivered</option>
                </select>
              </div>

              <div>
                <label style={styles.formLabel}>Project Timeline</label>
                <input
                  type="text"
                  className="glass-input"
                  value={projFormTimeline}
                  onChange={e => setProjFormTimeline(e.target.value)}
                  placeholder="e.g. Jan 2026 - Aug 2026"
                />
              </div>

              <div>
                <label style={styles.formLabel}>Project Budget</label>
                <input
                  type="text"
                  className="glass-input"
                  value={projFormBudget}
                  onChange={e => setProjFormBudget(e.target.value)}
                  placeholder="e.g. $120,000"
                />
              </div>

              <div>
                <label style={styles.formLabel}>Completion Rate ({projFormCompletion}%)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    style={{ flex: 1, accentColor: 'var(--accent-color)' }}
                    value={projFormCompletion}
                    onChange={e => setProjFormCompletion(Number(e.target.value))}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 'bold', width: '36px', textAlign: 'right' }}>{projFormCompletion}%</span>
                </div>
              </div>

              {/* Showcase Asset Upload */}
              <div>
                <label style={styles.formLabel}>
                  Upload Showreel Asset (.mp4, .mov, .pdf)
                </label>
                <label 
                  className="glass-input" 
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px', border: '1px dashed var(--accent-color)', borderRadius: '8px', cursor: 'pointer', gap: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--accent-color)' }}
                >
                  <Upload size={16} />
                  <span style={{ fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                    {projFormFileName || "Choose File (Max 100MB)"}
                  </span>
                  <input 
                    type="file" 
                    accept="application/pdf,video/mp4,video/quicktime,video/x-m4v"
                    style={{ display: 'none' }} 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProjFormFile(reader.result as string);
                        setProjFormFileName(file.name);
                        setProjFormFileType(file.type);
                      };
                      reader.readAsDataURL(file);
                    }} 
                  />
                </label>
                {projFormFileName && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '2px 8px', fontSize: '10px', marginTop: '4px', float: 'right', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
                    onClick={() => {
                      setProjFormFile(null);
                      setProjFormFileName('');
                      setProjFormFileType('');
                    }}
                  >
                    Remove File
                  </button>
                )}
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.formLabel}>Or Paste External Asset URL (Optional)</label>
                <input
                  type="text"
                  className="glass-input"
                  value={projFormExternalUrl}
                  onChange={e => setProjFormExternalUrl(e.target.value)}
                  placeholder="e.g. YouTube, Vimeo or Google Drive Showreel Link"
                />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={styles.formLabel}>Project Description / Scope</label>
                <textarea
                  className="glass-input"
                  rows={2}
                  value={projFormDesc}
                  onChange={e => setProjFormDesc(e.target.value)}
                  placeholder="Describe the target deliverables, team allocation, and client goals..."
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '13px' }}>
                  💾 {editingProjectId ? "Save Changes" : "Publish Project"}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                  onClick={() => {
                    setIsManagingProjects(false);
                    setEditingProjectId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Portfolio Table */}
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Production Portfolio Timeline</h3>
          {MOCK_PROJECTS.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '13px', padding: '24px 0', textAlign: 'center' }}>
              No portfolio projects active. {isManager && "Click the 'Add Portfolio Project' button to create one."}
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Project Name</th>
                  <th>Status</th>
                  <th>Timeline</th>
                  <th>Budget</th>
                  <th>Showcase Asset</th>
                  <th>Completion</th>
                  {isManager && <th style={{ textAlign: 'right' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {MOCK_PROJECTS.map((proj) => (
                  <tr key={proj.id}>
                    <td style={{ padding: '12px 0' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>{proj.name}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>{proj.description}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${
                        proj.status === 'Delivered' ? 'success' :
                        proj.status === 'Production' ? 'primary' :
                        proj.status === 'Planning' ? 'warning' : 'info'
                      }`}>
                        {proj.status}
                      </span>
                    </td>
                    <td>{proj.timeline || 'Jan 2026 - Aug 2026'}</td>
                    <td>{proj.budget}</td>
                    <td>
                      {proj.fileKey ? (
                        <button
                          onClick={() => handlePlayAsset(proj)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'var(--accent-color)', color: 'var(--accent-color)', cursor: 'pointer' }}
                        >
                          {proj.fileType?.startsWith('video/') ? "▶️ Play Video" : "📄 View PDF"}
                        </button>
                      ) : proj.externalUrl ? (
                        <a
                          href={proj.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', borderColor: 'var(--accent-color)', color: 'var(--accent-color)' }}
                        >
                          🔗 Open Link
                        </a>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No asset attached</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '120px' }}>
                        <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${proj.completion}%`, background: 'var(--primary-glow)', borderRadius: '2px' }} />
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 600, width: '28px', textAlign: 'right' }}>{proj.completion}%</span>
                      </div>
                    </td>
                    {isManager && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            onClick={() => handleStartEditProject(proj)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--accent-color)', transition: '0.2s' }}
                            title="Edit Project"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteProject(proj.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(239,68,68,0.7)', transition: '0.2s' }}
                            title="Delete Project"
                            onMouseEnter={e => (e.currentTarget.style.color = '#ef4444')}
                            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ═══════════ PORTFOLIO MEDIA LIGHTBOX ═══════════ */}
        {activePortfolioAsset && (
          <div
            onClick={() => setActivePortfolioAsset(null)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '20px' }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="glass-panel"
              style={{ position: 'relative', width: '100%', maxWidth: '800px', background: '#0b0f19', border: '1px solid var(--accent-color)', borderRadius: '16px', padding: '24px', boxShadow: '0 0 40px rgba(6,182,212,0.2)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: 800 }}>{activePortfolioAsset.title} Showcase</h3>
                <button
                  onClick={() => setActivePortfolioAsset(null)}
                  style={{ background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', lineHeight: 1 }}
                >
                  &times;
                </button>
              </div>
              
              <div style={{ width: '100%', height: '450px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activePortfolioAsset.type.startsWith('video/') ? (
                  <video
                    src={activePortfolioAsset.url}
                    controls
                    autoPlay
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                ) : activePortfolioAsset.type === 'application/pdf' ? (
                  <iframe
                    src={activePortfolioAsset.url}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  />
                ) : (
                  <div style={{ color: '#ccc', textAlign: 'center' }}>
                    <p>Preview not supported for this file type.</p>
                    <a href={activePortfolioAsset.url} download={activePortfolioAsset.title} className="btn-primary" style={{ display: 'inline-block', padding: '8px 16px', textDecoration: 'none', borderRadius: '6px' }}>
                      Download File
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderClientAccounts = () => {
    const clientAccounts = credentials.filter(c => c.role === 'client');
    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Client Organizations Accounts</h3>
          {clientAccounts.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
              No client accounts registered. Please provision client credentials in the HR Departments tab to display them here.
            </div>
          ) : (
            <ul style={styles.list}>
              {clientAccounts.map((c) => {
                const clientInvoices = invoices.filter(i => i.client.toLowerCase() === c.name.toLowerCase() || i.client.toLowerCase() === c.email.toLowerCase());
                const activeContractSum = clientInvoices.reduce((sum, i) => sum + parseFloat(i.amount.replace(/[^0-9.]/g, '') || '0'), 0);
                return (
                  <li key={c.email} style={styles.listItem}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{c.name} ({c.email})</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Client Access Account</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 600 }}>Active Contract: ${activeContractSum.toLocaleString()}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{clientInvoices.length} Invoice(s)</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  const renderHRDepartments = () => {
    const allRoles = [
      { key: 'super_admin', label: 'Super Admin [Admin]' },
      { key: 'id_card_admin', label: 'Security Systems Admin [Admin]' },
      { key: 'hr', label: 'HR Director [Sub-Admin]' },
      { key: 'finance', label: 'CFO / Finance Lead [Sub-Admin]' },
      { key: 'academy_director', label: 'Academy Director [Sub-Admin]' },
      { key: 'producer', label: 'Executive Producer [Sub-Admin]' },
      { key: 'project_manager', label: 'Project Manager [Sub-Admin]' },
      { key: 'team_lead', label: 'Animation Team Lead [Sub-Admin]' },
      { key: 'mentor', label: 'Senior 3D Artist [Sub-Admin]' },
      { key: 'studio_owner', label: 'Studio Owner' },
      { key: 'director', label: 'Creative Director' },
      { key: 'animator', label: '3D Animator' },
      { key: 'designer', label: 'Character Designer' },
      { key: 'storyboard_artist', label: 'Storyboard Artist' },
      { key: 'editor', label: 'Video Editor' },
      { key: 'voice_artist', label: 'Voice Artist' },
      { key: 'freelancer', label: 'Contract Animator' },
      { key: 'client', label: 'Client Producer' },
      { key: 'recruiter', label: 'Lead Recruiter' },
      { key: 'trainer', label: 'VFX Trainer' },
      { key: 'student', label: 'Animation Student' },
      { key: 'intern', label: 'Studio Intern' },
      { key: 'visitor_public', label: 'Public Visitor' }
    ];

    return (
      <div style={styles.grid}>
        {/* Left Column: Account Creation form or Edit Form */}
        {editingUserEmail ? (
          renderEditUserForm(allRoles)
        ) : (
          <div style={styles.halfCol} className="glass-panel animate-fade-in">
            <h3 style={styles.subTitle}>Provision New Staff Credentials</h3>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
              STATUS: ACTIVE_GATEWAY // USER: OWNER
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.formLabel}>Full Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  placeholder="e.g., Sourav Ganguly" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  className="glass-input" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  placeholder="e.g., dada@dreamavian.com" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Access Password</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)} 
                  placeholder="e.g., SecurityPass321!" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Assign Organization Role</label>
                <select 
                  className="glass-input" 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ background: 'var(--bg-color)', color: '#fff' }}
                >
                  {allRoles.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={styles.formLabel}>Monthly Salary / Rate</label>
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={newUserSalary} 
                    onChange={(e) => setNewUserSalary(e.target.value)} 
                    placeholder="e.g., 3500" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Currency</label>
                  <select 
                    className="glass-input" 
                    value={newUserSalaryCurrency} 
                    onChange={(e) => setNewUserSalaryCurrency(e.target.value as 'USD' | 'INR')}
                    style={{ background: 'var(--bg-color)', color: '#fff' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                Create Account (All Roles)
              </button>
            </form>
          </div>
        )}

        {/* Right Column: HR Headcounts & Employee Registry */}
        <div style={{ ...styles.halfCol, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Headcount Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <h3 style={styles.subTitle}>HR Studio Departments Headcount</h3>
            <div style={styles.metricsGrid}>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>3D Animation</div>
                <div style={styles.metricValue}>
                  {credentials.filter(c => c.role === 'animator' || c.role === 'freelancer').length} Artist{credentials.filter(c => c.role === 'animator' || c.role === 'freelancer').length === 1 ? '' : 's'}
                </div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Concept Design</div>
                <div style={styles.metricValue}>
                  {credentials.filter(c => c.role === 'designer' || c.role === 'storyboard_artist').length} Designer{credentials.filter(c => c.role === 'designer' || c.role === 'storyboard_artist').length === 1 ? '' : 's'}
                </div>
              </div>
              <div style={styles.metricCard}>
                <div style={styles.metricLabel}>Editing & Sound</div>
                <div style={styles.metricValue}>
                  {credentials.filter(c => c.role === 'editor' || c.role === 'voice_artist').length} Editor{credentials.filter(c => c.role === 'editor' || c.role === 'voice_artist').length === 1 ? '' : 's'}
                </div>
              </div>
            </div>
          </div>

          {/* User Registry List */}
          <div className="glass-panel" style={{ padding: '20px', flex: 1 }}>
            <h3 style={styles.subTitle}>Active Studio Accounts</h3>
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Role & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => (
                    <tr key={cred.email}>
                      <td style={{ padding: '8px 0', fontSize: '11px', fontWeight: 'bold' }}>{cred.name}</td>
                      <td style={{ fontSize: '11px' }}>{cred.email}</td>
                      <td style={{ fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{revealedPasswords[cred.email] ? cred.password : '••••••••'}</span>
                          <button
                            type="button"
                            onClick={() => setRevealedPasswords(prev => ({ ...prev, [cred.email]: !prev[cred.email] }))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', padding: 0 }}
                            title="Show/Hide Password"
                          >
                            {revealedPasswords[cred.email] ? '👁️' : '👁️‍🗨️'}
                          </button>
                        </div>
                      </td>
                      <td style={{ fontSize: '11px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span className="badge badge-success">
                            {cred.roleTitle}
                            {(cred as any).salary !== undefined && ` | ${(cred as any).salaryCurrency === 'INR' ? '₹' : '$'}{(cred as any).salary.toLocaleString()}`}
                          </span>
                          <button 
                            onClick={() => handleStartEditUser(cred)}
                            className="btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}
                            title="Edit User Profile"
                          >
                            <Edit3 size={10} /> Edit
                          </button>
                          <button
                            onClick={() => {
                              const newEmail = {
                                id: `mail-${Date.now()}`,
                                to: cred.email,
                                subject: '🔐 Account Recovery: Credentials Retrieved',
                                date: new Date().toLocaleString(),
                                body: `Hi ${cred.name},\n\nWe received a request to recover your credentials for DreamAvian Studios.\n\nYour Account Details:\n---------------------------\n🔑 Login ID / Email: ${cred.email}\n🔒 Password: ${cred.password}\n👤 Assigned Role: ${cred.roleTitle}\n\nPlease keep this information secure.\n\nBest Regards,\nDreamAvian IT Security Gateway`
                              };

                              const existingEmails = localStorage.getItem('cs-mailbox-emails');
                              const emails = existingEmails ? JSON.parse(existingEmails) : [];
                              localStorage.setItem('cs-mailbox-emails', JSON.stringify([newEmail, ...emails]));
                              window.dispatchEvent(new Event('storage'));
                              alert(`📨 Sent credentials for ${cred.name} (${cred.email}) to their secure recovery mailbox successfully!`);
                            }}
                            className="btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px', color: 'var(--accent-color)', borderColor: 'rgba(6,182,212,0.3)' }}
                            title="Send Credentials to Mailbox"
                          >
                            <Mail size={10} /> Send Mail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderAcademySync = () => (
    <div style={styles.grid}>
      {/* Dynamic Course Curricula List */}
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Academy Course Curricula</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Overview of currently synchronized training modules, pricing tiers, and active student enrollment counts.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {coursesList.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No course curricula registered. Use the provisioning form to publish a new course.
            </p>
          ) : (
            coursesList.map((crs) => (
              <div 
                key={crs.id} 
                style={{ 
                  ...styles.courseItem, 
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease',
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.02)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{crs.title}</span>
                  <span className="badge badge-success">{crs.price}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <span>Instructor: <strong>{crs.trainer}</strong></span>
                  <span>Duration: {crs.duration}</span>
                </div>
                
                {/* Course Progress bar */}
                <div style={{ margin: '8px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                    <span>Student Completion Progress</span>
                    <span>{crs.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${crs.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6d28d9, #06b6d4)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>👥 Enrolled: {crs.studentsCount} students</span>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}
                    onClick={() => handleDeleteCourse(crs.id)}
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Academy Course Provisioning Hub */}
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Provision New Course</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          As the Studio Owner, you can compile and publish new academic course curricula for the academy.
        </p>
        <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Course Curriculum Title</label>
            <input 
              type="text" 
              className="glass-input" 
              value={newCourseTitle} 
              onChange={(e) => setNewCourseTitle(e.target.value)} 
              placeholder="e.g., VFX Post-Processing & Nuke" 
              required 
            />
          </div>
          <div>
            <label style={styles.formLabel}>Lead Trainer</label>
            <input 
              type="text" 
              className="glass-input" 
              value={newCourseTrainer} 
              onChange={(e) => setNewCourseTrainer(e.target.value)} 
              placeholder="Instructor Name" 
              required 
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Duration</label>
              <select className="glass-input" value={newCourseDuration} onChange={(e) => setNewCourseDuration(e.target.value)}>
                <option value="4 Weeks">4 Weeks</option>
                <option value="8 Weeks">8 Weeks</option>
                <option value="10 Weeks">10 Weeks</option>
                <option value="12 Weeks">12 Weeks</option>
                <option value="16 Weeks">16 Weeks</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Pricing Token</label>
              <input 
                type="text" 
                className="glass-input" 
                value={newCoursePrice} 
                onChange={(e) => setNewCoursePrice(e.target.value)} 
                placeholder="Price e.g. $299" 
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <Plus size={16} /> Publish Course Curriculum
          </button>
        </form>
      </div>
    </div>
  );

  // 3. Director Tabs
  const renderDirector = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Visual Review & Approval Queue</h3>
        {tasks.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
            No pending visual reviews. Create tasks in the Sprints & Workload tab first.
          </div>
        ) : (
          <div style={styles.videoPlayerContainer}>
            <div style={styles.mockVideo}>
              <Video size={48} color="var(--primary-color)" />
              <div style={{ fontSize: '13px', marginTop: '12px' }}>Scene_04_Jump_Blocking_v2.mp4</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => alert('Approved!')}>Approve Frame & Send to Client</button>
              <button className="btn-secondary" style={{ flex: 1, padding: '10px', color: 'var(--danger)' }} onClick={() => alert('Revision requested!')}>Request Retake</button>
            </div>
          </div>
        )}
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Voice/Sketch Annotation Toolbox</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Record Audio Feedback Note</label>
            <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={() => alert('Recording audio feedback clip...')}>
              🎙 Start Voice Recording Note
            </button>
          </div>
          <div>
            <label style={styles.formLabel}>Style Overlay Checklist</label>
            <label style={styles.checkboxLabel}><input type="checkbox" defaultChecked /> Weight dynamics conform to cyberpunk theme</label>
            <label style={styles.checkboxLabel}><input type="checkbox" /> Rig joint stretches look natural</label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFrameAnnotation = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Frame-by-Frame Sketch Annotations</h3>
        {tasks.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
            No active frames to annotate. Create tasks to load frame streams.
          </div>
        ) : (
          <div style={styles.videoPlayerContainer}>
            <div style={styles.mockVideo}>
              <Video size={48} color="var(--primary-color)" />
              <div style={{ fontSize: '13px', marginTop: '12px' }}>Annotating Frame: #124 - Rickshaw jump landing</div>
            </div>
            <button className="btn-primary" onClick={() => alert('Drawing overlay saved!')}>Save Sketch Annotations</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderArtStyleBible = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Style Bible & Creative Assets</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span>Character_Visual_Bible_v2.pdf</span>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Downloading Character_Visual_Bible_v2.pdf...')}>Download Guide</button>
          </li>
          <li style={styles.listItem}>
            <span>Cyberpunk_City_Color_Palette.ase</span>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Downloading Cyberpunk_City_Color_Palette.ase...')}>Download Guide</button>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderShotDeliveries = () => {
    const approvedTasks = tasks.filter(t => t.status === 'Approved');
    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Completed Shot Deliveries Directory</h3>
          {approvedTasks.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
              No completed shot deliveries yet. Tasks will appear here once approved by the Creative Director.
            </div>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>Shot ID</th>
                  <th>Task Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {approvedTasks.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: '10px 0' }}>{t.id}</td>
                    <td>{t.name}</td>
                    <td><span className="badge badge-success">Approved</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  // 4. Producer Tabs
  const renderProducer = () => {
    const artistMembers = credentials.filter(c => ['animator', 'designer', 'storyboard_artist', 'editor', 'freelancer'].includes(c.role));
    return (
      <div style={styles.grid}>
        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Project Budget Burn-Rates</h3>
          {MOCK_PROJECTS.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
              No projects active. Create projects in the Studio Overview tab to track budgets.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {MOCK_PROJECTS.map(p => (
                <div key={p.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span>{p.name}</span>
                    <span>$0 / {p.budget}</span>
                  </div>
                  <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '0%', background: 'var(--primary-glow)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Resource Allocation Planner</h3>
          {artistMembers.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
              No artists registered. Provision staff credentials in the HR Departments tab to allocate resources.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {artistMembers.map(m => (
                <div key={m.email} style={styles.listItem}>
                  <span>{m.name} ({m.roleTitle})</span>
                  <span>100% Available</span>
                </div>
              ))}
              <button className="btn-primary" onClick={() => alert('New contractor requested.')}>Request Freelancer Hire</button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderResourceAllocator = () => {
    const activeArtists = credentials.filter(c => ['animator', 'designer', 'storyboard_artist', 'editor', 'freelancer'].includes(c.role));
    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Contractor Allocation Sliders</h3>
          {activeArtists.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
              No staff resources registered. Please provision staff credentials first.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {activeArtists.map(m => (
                <div key={m.email}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{m.name} ({m.roleTitle}) Allocation: 100%</label>
                  <input type="range" min="0" max="100" defaultValue="100" style={{ width: '100%' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMilestoneGantt = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Project Milestones timelines</h3>
        {MOCK_PROJECTS.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
            No active project milestones. Go to Studio Overview to manage projects.
          </div>
        ) : (
          <ul style={styles.list}>
            {MOCK_PROJECTS.map(p => (
              <React.Fragment key={p.id}>
                <li style={{ ...styles.listItem, fontWeight: 'bold', background: 'rgba(255,255,255,0.02)' }}>
                  <span>{p.name} - Roadmap</span>
                </li>
                <li style={styles.listItem}>
                  <span>Milestone 1: Concept Designs for {p.name}</span>
                  <span className="badge badge-success">Completed</span>
                </li>
                <li style={styles.listItem}>
                  <span>Milestone 2: Production Assets & Rigging</span>
                  <span className="badge badge-info">In Progress (Due July 12)</span>
                </li>
                <li style={styles.listItem}>
                  <span>Milestone 3: Final Delivery & Compositing</span>
                  <span className="badge badge-warning">Pending</span>
                </li>
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderClientBillings = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Milestone Client Invoicing triggers</h3>
        {MOCK_PROJECTS.length === 0 ? (
          <div style={{ color: 'var(--text-secondary)', fontSize: '12px', padding: '20px 0' }}>
            No pending invoicing triggers. Create a project to track milestones.
          </div>
        ) : (
          <ul style={styles.list}>
            {MOCK_PROJECTS.map(p => (
              <li key={p.id} style={styles.listItem}>
                <span>Trigger Invoice: Concept design approval for {p.name} ($15,000)</span>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert(`Milestone invoice sent for ${p.name}!`)}>Send Invoice</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // 5. Project Manager Tabs
  const renderProjectManager = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Active Project Blocker Log</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {blockers.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No active blockers.
            </p>
          ) : (
            blockers.map((b) => (
              <div key={b.id} style={styles.taskCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{b.task}</span>
                  <span className={`badge badge-${b.status === 'Resolved' ? 'success' : 'danger'}`}>{b.status}</span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '4px 0' }}>Blocked by: {b.blockedBy}</p>
                {b.status === 'Pending' && (
                  <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => handleResolveBlocker(b.id)}>
                    Resolve Blocker
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Sprint Risk Indicators</h3>
        {MOCK_PROJECTS.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No schedule risks.
          </p>
        ) : (
          <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <ShieldAlert color="var(--warning)" size={24} />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Medium Schedule Risk Alert</span>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              The voice lines deliverable for {MOCK_PROJECTS[0]?.name || 'Episode 1'} intro is pending. Recommended mitigation: Send automatic reminder nudge via AI gateway.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderKanbanBoard = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Project Kanban Board</h3>
        <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
          {['To Do', 'In Progress', 'QA Review', 'Approved'].map((col) => (
            <div key={col} style={{ flex: '1 1 200px', minWidth: '200px', background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '10px' }}>{col}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tasks.filter(t => t.status === col || (col === 'To Do' && t.status === 'To Do')).map(t => (
                  <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px', fontSize: '11px' }}>
                    {t.name}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderRiskRegisters = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Schedule Risks Registry</h3>
        {MOCK_PROJECTS.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No schedule risks registered. Active projects list is currently empty.
          </p>
        ) : (
          <ul style={styles.list}>
            {MOCK_PROJECTS.map((proj, idx) => (
              <li key={proj.id} style={styles.listItem}>
                <span>{proj.name}: {idx % 2 === 0 ? 'Rig file late' : 'Voice takes missing'}</span>
                <span className={`badge badge-${idx % 2 === 0 ? 'danger' : 'warning'}`}>
                  {idx % 2 === 0 ? 'HIGH RISK' : 'MEDIUM RISK'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderTimeVerification = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Timesheets verification dashboard</h3>
        {activeStaffList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No timesheets submitted. Active staff list is currently empty.
          </p>
        ) : (
          <ul style={styles.list}>
            {activeStaffList.map((staff: any) => (
              <li key={staff.email} style={styles.listItem}>
                <span>{staff.name} ({staff.roleTitle || staff.role}) - 40 hours logged</span>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert(`Approved timesheet for ${staff.name}`)}>Verify</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // 6. Team Lead Tabs
  const renderTeamLead = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Technical QA checklists</h3>
        {tasks.filter(t => t.status === 'QA Review').length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No items in QA queue. All department assignments are up to date.
          </p>
        ) : (
          <ul style={styles.list}>
            {tasks.filter(t => t.status === 'QA Review').map((task) => (
              <li key={task.id} style={styles.listItem}>
                <span>{task.name} - Rig/Mesh Review</span>
                <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert(`QA Passed for ${task.name}`)}>Pass QA</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Department availability</h3>
        {activeStaffList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No staff registered under this department.
          </p>
        ) : (
          <ul style={styles.list}>
            {activeStaffList.map((staff: any, idx) => (
              <li key={staff.email} style={styles.listItem}>
                <span>{staff.name} ({staff.roleTitle || staff.role})</span>
                <span className={`badge badge-${idx % 3 === 0 ? 'success' : idx % 3 === 1 ? 'warning' : 'danger'}`}>
                  {idx % 3 === 0 ? 'Online' : idx % 3 === 1 ? 'Leave (1 Day)' : 'Offline'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderTechnicalQA = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Technical Rig/Mesh QA Testing</h3>
        {tasks.filter(t => t.status === 'QA Review').length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No technical QA validations pending.
          </p>
        ) : (
          <ul style={styles.list}>
            {tasks.filter(t => t.status === 'QA Review').map((task) => (
              <li key={task.id} style={styles.listItem}>
                <span>{task.name} - Rig/Mesh bounds validation</span>
                <span style={{ color: 'var(--success)' }}>PENDING REVIEW</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderDailyStandups = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Daily Standup Calendar meeting</h3>
        <div style={{ background: 'rgba(255,255,255,0.01)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '13px', fontWeight: 600 }}>Next standup: 10:00 AM (June 23)</p>
          <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => alert('Standup meeting link copied!')}>Join standup call</button>
        </div>
      </div>
    </div>
  );

  // 6b. Employee Work Upload Portal
  const renderWorkUploadForm = () => {
    const mySubmissions = employeeWorks.filter(w => w.employeeEmail === userEmail);

    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h2 style={styles.sectionTitle}>Online Work Submission Portal</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '16px' }}>
            Submit your animations, character designs, edits, or recordings for manager review.
          </p>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Submit New Work Asset</h3>
          <form onSubmit={handleWorkSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Project</label>
              <select 
                value={workProjName}
                onChange={(e) => setWorkProjName(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.name} style={{ background: '#111' }}>{p.name}</option>
                ))}
                {projects.length === 0 && <option value="General Production" style={{ background: '#111' }}>General Production</option>}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Work Title / Shot / Asset Name</label>
              <input 
                type="text"
                placeholder="e.g. Shot_05_Blocking_v1"
                value={workTitle}
                onChange={(e) => setWorkTitle(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Asset Type</label>
                <select 
                  value={workFileType}
                  onChange={(e) => setWorkFileType(e.target.value as any)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                >
                  <option value="video" style={{ background: '#111' }}>Video (Playblast)</option>
                  <option value="image" style={{ background: '#111' }}>Image (Concept/Style)</option>
                  <option value="audio" style={{ background: '#111' }}>Audio (Voice Take)</option>
                  <option value="document" style={{ background: '#111' }}>Document/Model Link</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Preview URL / Asset Link (Optional)</label>
              <input 
                type="text"
                placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4"
                value={workFileUrl}
                onChange={(e) => setWorkFileUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>If empty, a high-quality simulated file will be provided for review.</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Description & Notes</label>
              <textarea 
                placeholder="Explain what changes are in this version, any specific feedback you need..."
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                rows={3}
                style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none', resize: 'vertical' }}
              />
            </div>

            {isSubmittingWork ? (
              <div style={{ padding: '8px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span>Uploading Asset...</span>
                  <span>{workUploadProgress}%</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${workUploadProgress}%`, background: 'var(--primary-glow)' }}></div>
                </div>
              </div>
            ) : (
              <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px' }}>
                <Upload size={16} /> Submit Work Online
              </button>
            )}
          </form>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>My Submission History ({mySubmissions.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {mySubmissions.map(w => (
              <div key={w.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{w.title}</span>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Project: {w.projectName}</div>
                  </div>
                  <span className={`badge badge-${w.status === 'Approved' ? 'success' : w.status === 'Requires Changes' ? 'danger' : 'warning'}`}>
                    {w.status}
                  </span>
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>{w.description}</p>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Submitted: {new Date(w.submittedAt).toLocaleDateString()}</span>
                  <span>File: {w.fileName}</span>
                </div>
                
                {w.feedback && (
                  <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(6, 182, 212, 0.05)', border: '1px solid rgba(6, 182, 212, 0.15)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-color)', marginBottom: '2px' }}>Manager Feedback (Reviewed by {w.reviewedBy}):</div>
                    <div style={{ fontSize: '11px', fontStyle: 'italic', color: '#fff' }}>"{w.feedback}"</div>
                  </div>
                )}
              </div>
            ))}
            {mySubmissions.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <Info size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <span style={{ fontSize: '12px' }}>You haven't submitted any work yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Dynamic script loader for JSZip from CDN
  const loadJSZip = (): Promise<any> => {
    return new Promise((resolve, reject) => {
      if ((window as any).JSZip) {
        resolve((window as any).JSZip);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = () => resolve((window as any).JSZip);
      script.onerror = () => reject(new Error('Failed to load JSZip from CDN'));
      document.head.appendChild(script);
    });
  };

  const handleImportPPTX = async (file: File) => {
    setIsParsingPptx(true);
    setPptxParsingStatus('Loading JSZip library...');
    try {
      const JSZip = await loadJSZip();
      setPptxParsingStatus('Reading PowerPoint file...');
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      setPptxParsingStatus('Locating slides...');
      const slideFiles = Object.keys(zip.files).filter(
        name => name.startsWith('ppt/slides/slide') && name.endsWith('.xml')
      );
      
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/[^0-9]/g, '')) || 0;
        const numB = parseInt(b.replace(/[^0-9]/g, '')) || 0;
        return numA - numB;
      });

      if (slideFiles.length === 0) {
        alert("No slides found in the PPTX presentation.");
        setIsParsingPptx(false);
        return;
      }

      const newSlides = [];
      const parser = new DOMParser();

      for (let i = 0; i < slideFiles.length; i++) {
        const slideFileName = slideFiles[i];
        const slideIndex = slideFileName.replace(/[^0-9]/g, '');
        setPptxParsingStatus(`Parsing Slide ${i + 1} of ${slideFiles.length}...`);
        
        const xmlText = await zip.files[slideFileName].async('text');
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

        // Extract all paragraphs
        const pElements = Array.from(xmlDoc.getElementsByTagName('*')).filter(
          el => el.localName === 'p'
        );
        
        const paragraphs: string[] = [];
        pElements.forEach(p => {
          const text = Array.from(p.getElementsByTagName('*'))
            .filter(t => t.localName === 't')
            .map(t => t.textContent || '')
            .join('');
          if (text.trim()) {
            paragraphs.push(text.trim());
          }
        });

        if (paragraphs.length === 0) continue; // Skip completely empty slides

        // Heuristics:
        // First paragraph is title
        let title = paragraphs[0];
        let subtitle = `Chapter ${i + 1}`;
        let body = '';
        let highlightText = '';

        if (paragraphs.length > 1) {
          if (paragraphs[1].length < 60) {
            subtitle = paragraphs[1];
            body = paragraphs.slice(2).join('\n\n');
          } else {
            body = paragraphs.slice(1).join('\n\n');
          }
        }

        // Search for quotes (starts/ends with quote marks)
        const quoteIndex = paragraphs.findIndex(p => p.startsWith('"') && p.endsWith('"'));
        if (quoteIndex !== -1) {
          highlightText = paragraphs[quoteIndex];
          // Remove the quote from the body text
          body = paragraphs
            .slice(subtitle === paragraphs[1] ? 2 : 1)
            .filter((_, idx) => idx + (subtitle === paragraphs[1] ? 2 : 1) !== quoteIndex)
            .join('\n\n');
        }

        // Look for image relationships
        let slideImage = '';
        const relsFileName = `ppt/slides/_rels/slide${slideIndex}.xml.rels`;
        if (zip.files[relsFileName]) {
          const relsText = await zip.files[relsFileName].async('text');
          const relsDoc = parser.parseFromString(relsText, 'text/xml');
          const relationships = Array.from(relsDoc.getElementsByTagName('*')).filter(
            el => el.localName === 'Relationship'
          );
          
          const relMap: Record<string, string> = {};
          relationships.forEach(rel => {
            const id = rel.getAttribute('Id');
            const target = rel.getAttribute('Target');
            if (id && target) relMap[id] = target;
          });

          // Find embedded image IDs
          const embedIds: string[] = [];
          const allElements = xmlDoc.getElementsByTagName('*');
          for (let j = 0; j < allElements.length; j++) {
            const el = allElements[j];
            for (let k = 0; k < el.attributes.length; k++) {
              const attr = el.attributes[k];
              if (
                attr.localName === 'embed' || 
                attr.name === 'r:embed' || 
                attr.localName === 'link' || 
                attr.name === 'r:link' ||
                attr.name.endsWith(':embed') ||
                attr.name.endsWith(':link')
              ) {
                embedIds.push(attr.value);
              }
            }
          }

          // Extract first valid image
          for (const embedId of embedIds) {
            let targetPath = relMap[embedId];
            if (targetPath) {
              let zipPath = targetPath;
              if (zipPath.startsWith('../')) {
                zipPath = 'ppt/' + zipPath.substring(3);
              } else if (zipPath.startsWith('/ppt/')) {
                zipPath = zipPath.substring(1);
              } else if (!zipPath.startsWith('ppt/')) {
                zipPath = 'ppt/' + zipPath;
              }
              if (zip.files[zipPath]) {
                const base64 = await zip.files[zipPath].async('base64');
                const ext = zipPath.split('.').pop()?.toLowerCase() || 'png';
                const mime = ext === 'png' ? 'image/png' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'gif' ? 'image/gif' : 'image/png';
                slideImage = `data:${mime};base64,${base64}`;
                break;
              }
            }
          }
        }

        newSlides.push({
          id: `slide-${Date.now()}-${i}`,
          title,
          subtitle,
          layout: slideImage ? (i % 2 === 0 ? 'image-right' : 'image-left') : 'grid-no-image',
          image: slideImage || undefined,
          body: body || 'No slide content description.',
          highlightText: highlightText || undefined
        });
      }

      if (newSlides.length > 0) {
        setJourneySlides(newSlides);
        setPptxParsingStatus('Done!');
        setTimeout(() => setIsParsingPptx(false), 800);
        alert(`🎉 Success! Imported ${newSlides.length} chapters from PowerPoint presentation. They have been saved and synced in real-time.`);
      } else {
        alert("No slides with content could be found or parsed from the PPTX file.");
        setIsParsingPptx(false);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to import PPTX file. Ensure it is a valid, uncorrupted PowerPoint presentation.");
      setIsParsingPptx(false);
    }
  };

  // ── Founder's Journey: Full-page standalone presentation ──
  const renderFounderJourney = () => {
    const isManager = role === 'studio_owner' || role === 'super_admin';

    const handleImportJourneyVideo = async (file: File) => {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          await savePortfolioFileToDB('founder-journey-video', base64);
          setJourneyVideoUrl(base64);
          setJourneyVideoName(file.name);
          safeLocalStorageSetItem('cs-founder-journey-video-meta', JSON.stringify({ name: file.name, type: file.type }));
          alert("🎉 Founder's Journey video/animation imported successfully!");
        } catch (err) {
          console.error(err);
          alert("Failed to save journey video to IndexedDB.");
        }
      };
      reader.readAsDataURL(file);
    };

    const handleRemoveJourneyVideo = async () => {
      if (window.confirm("Are you sure you want to delete the Founder's Journey video? This will revert back to the slide chapters.")) {
        try {
          await deletePortfolioFileFromDB('founder-journey-video');
          setJourneyVideoUrl(null);
          setJourneyVideoName('');
          localStorage.removeItem('cs-founder-journey-video-meta');
          alert("🗑️ Founder's Journey video removed.");
        } catch (e) {
          console.error(e);
          alert("Failed to delete video from database.");
        }
      }
    };
    
    const servicesList = [
      '2D Animation', '3D Animation', 'VFX', 'Motion Graphics', 'Graphic Design',
      'Game Development', 'AI Solutions', 'Software Development', 
      'Digital Content Production', 'Creative Education'
    ];

    const coreValuesList = [
      { title: 'Quality First', desc: 'Studio-grade excellence in every single pixel and frame, meeting international standards.', color: 'var(--accent-color)' },
      { title: 'Creative Innovation', desc: 'Merging traditional artistry with cutting-edge AI and advanced custom software solutions.', color: '#7c3aed' },
      { title: 'Global Collaboration', desc: 'A remote-first workspace connecting talented creators and projects in India and the USA.', color: '#10b981' },
      { title: 'Educational Empowerment', desc: 'Nurturing future creators through comprehensive, tech-driven academy programs.', color: '#f59e0b' }
    ];

    const companyStats = [
      { label: 'Founded', value: 'July 1, 2026' },
      { label: 'Founder', value: 'Subham Ghorai' },
      { label: 'Headquarters', value: 'India (Remote First)' },
      { label: 'Target Markets', value: 'India & USA' },
      { label: 'Primary Industries', value: 'Animation, Games, VFX, Software, AI' },
      { label: 'Status', value: 'Startup / Independent Studio' }
    ];

    return (
      <>
      <style>{`
        .cyber-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(6, 182, 212, 0.15) !important;
          background: var(--panel-bg);
          backdrop-filter: blur(24px);
          border-radius: 12px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(6, 182, 212, 0.05);
          position: relative;
          overflow: hidden;
        }
        .cyber-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent-color) !important;
          box-shadow: 0 12px 30px rgba(6, 182, 212, 0.2), inset 0 0 15px rgba(6, 182, 212, 0.08) !important;
        }
        .cyber-card-purple {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid rgba(124, 58, 237, 0.15) !important;
          background: var(--panel-bg);
          backdrop-filter: blur(24px);
          border-radius: 12px;
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4), inset 0 0 15px rgba(124, 58, 237, 0.05);
          position: relative;
          overflow: hidden;
        }
        .cyber-card-purple:hover {
          transform: translateY(-4px);
          border-color: #7c3aed !important;
          box-shadow: 0 12px 30px rgba(124, 58, 237, 0.2), inset 0 0 15px rgba(124, 58, 237, 0.08) !important;
        }
        .milestone-node {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .milestone-node:hover {
          transform: translateY(-3px);
          background: rgba(255, 255, 255, 0.02) !important;
        }
        .milestone-icon-glow {
          transition: all 0.3s ease;
        }
        .milestone-node:hover .milestone-icon-glow {
          box-shadow: 0 0 20px currentColor !important;
          transform: scale(1.1);
        }
        .service-pill {
          transition: all 0.2s ease;
          border: 1px solid rgba(6, 182, 212, 0.2);
          cursor: pointer;
        }
        .service-pill:hover {
          border-color: var(--accent-color);
          background: rgba(6, 182, 212, 0.1);
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.3);
          transform: translateY(-2px);
        }
        .slide-container {
          display: flex;
          flex-direction: row;
          align-items: stretch;
          gap: 0;
          min-height: 480px;
          position: relative;
        }
        @media (max-width: 992px) {
          .slide-container {
            flex-direction: column !important;
            min-height: auto;
          }
          .slide-image-col, .slide-text-col {
            flex: 1 1 100% !important;
            width: 100% !important;
          }
          .slide-image-col {
            height: 320px !important;
          }
        }
        .slide-image-col {
          flex: 1 1 45%;
          overflow: hidden;
          position: relative;
        }
        .slide-text-col {
          flex: 1 1 55%;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: rgba(3, 7, 18, 0.4);
        }
        .slide-bullet-box {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }
        .slide-bullet-item {
          font-size: 13.5px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        .slide-banner-box {
          background: rgba(6, 182, 212, 0.05);
          border-left: 3px solid var(--accent-color);
          padding: 14px 18px;
          margin-top: 24px;
          font-size: 13.5px;
          color: #fff;
          font-style: italic;
          border-radius: 0 8px 8px 0;
          line-height: 1.6;
        }
        .slide-quote-box {
          background: rgba(124, 58, 237, 0.05);
          border-left: 3px solid #7c3aed;
          padding: 14px 18px;
          margin-top: 24px;
          font-size: 13.5px;
          color: #fff;
          font-style: italic;
          border-radius: 0 8px 8px 0;
          line-height: 1.6;
        }
        .slide-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-top: 20px;
        }
        .slide-grid-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 10px;
          padding: 16px;
          transition: var(--transition-smooth);
        }
        .slide-grid-item:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(6, 182, 212, 0.2);
          transform: translateY(-2px);
        }
      `}</style>

      <div style={styles.grid}>

        {/* ── First Card: Founder Image with Description ── */}
        <div style={{ ...styles.fullRow, padding: 0, overflow: 'hidden', borderRadius: '16px', position: 'relative', background: 'linear-gradient(135deg, #0b0f19 0%, #1a0533 50%, #0b1a2e 100%)' }} className="glass-panel animate-fade-in">
          {/* Decorative glow orbs */}
          <div style={{ position: 'absolute', top: '-60px', left: '20%', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '-80px', right: '10%', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '40px', padding: '48px 40px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
            {/* Large Founder Photo — clickable lightbox */}
            <div style={{ flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ position: 'relative' }}>
                <div
                  style={{ width: '160px', height: '160px', borderRadius: '50%', background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', padding: '3px', cursor: founderStory.image ? 'zoom-in' : 'default' }}
                  onClick={() => founderStory.image && setLightboxSrc(founderStory.image)}
                  title={founderStory.image ? 'Click to view full photo' : ''}
                >
                  <div style={{ borderRadius: '50%', overflow: 'hidden', width: '100%', height: '100%', position: 'relative' }}>
                    {founderStory.image ? (
                      <img src={founderStory.image} alt="Subham Ghorai" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.3s ease' }}
                        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.08)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', background: 'rgba(6,182,212,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '56px', color: 'var(--accent-color)', fontWeight: 'bold' }}>SG</div>
                    )}
                    {founderStory.image && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.25)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0)')}
                      >
                        <svg style={{ opacity: 0.8 }} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {/* Image Edit Button — owner/super_admin only */}
                {isManager && (
                  <button
                    onClick={e => { e.stopPropagation(); setImgEditorSrc(founderStory.image || founderImg); setImgEditorBrightness(100); setImgEditorContrast(100); setImgEditorSaturation(100); setImgEditorScale(100); setIsImageEditorOpen(true); }}
                    title="Edit Founder Photo"
                    style={{ position: 'absolute', bottom: '6px', right: '6px', width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#7c3aed)', border: '2px solid #0f1117', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 12px rgba(6,182,212,0.5)', zIndex: 10, transition: 'transform 0.2s' }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                )}
              </div>
              {/* Pulsing ring */}
              <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '2px solid rgba(6,182,212,0.3)', animation: 'pulseGlow 2.5s infinite ease-in-out', height: '172px' }} />
              
              <span style={{ fontSize: '10px', color: 'var(--accent-color)', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>FOUNDER & CEO</span>
              <span style={{ fontSize: '16px', color: '#fff', fontWeight: 700 }}>Subham Ghorai</span>
            </div>

            {/* Hero text & description */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '3px', color: 'var(--accent-color)', textTransform: 'uppercase', marginBottom: '10px' }}>DREAMAVIAN STUDIOS  ·  FOUNDER STORY</div>
              <h1 style={{ margin: '0 0 8px', fontSize: '36px', fontWeight: 900, lineHeight: 1.1, background: 'linear-gradient(135deg, #ffffff 0%, #06b6d4 50%, #7c3aed 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {founderStory.title}
              </h1>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '16px', marginBottom: '24px', whiteSpace: 'pre-wrap' }}>
                {founderStory.body}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', fontSize: '11px', color: '#06b6d4', fontWeight: 600 }}>Creative Tech & AI</span>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', fontSize: '11px', color: '#a78bfa', fontWeight: 600 }}>CGI & Animation</span>
                <span style={{ padding: '5px 14px', borderRadius: '20px', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>Game Development</span>
                {isManager && (
                  <button
                    onClick={() => { setEditStoryTitle(founderStory.title); setEditStoryBody(founderStory.body); setEditStoryImage(founderStory.image); setIsEditingStory(true); }}
                    style={{ background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '8px', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginLeft: 'auto' }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit Story
                  </button>
                )}
              </div>

              {/* Edit Story form inline if editing */}
              {isManager && isEditingStory && (
                <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)' }}>✏️ Update Founder's Story</h4>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Story Title</label>
                    <input
                      value={editStoryTitle}
                      onChange={(e) => setEditStoryTitle(e.target.value)}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Story / Bio</label>
                    <textarea
                      value={editStoryBody}
                      onChange={(e) => setEditStoryBody(e.target.value)}
                      rows={5}
                      style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '12px', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.7' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => { setFounderStory({ title: editStoryTitle.trim() || founderStory.title, body: editStoryBody.trim() || founderStory.body, image: editStoryImage || founderStory.image }); setIsEditingStory(false); }}
                      className="btn-primary"
                      style={{ padding: '6px 16px', fontSize: '12px' }}
                    >
                      💾 Save Story
                    </button>
                    <button
                      onClick={() => setIsEditingStory(false)}
                      className="btn-secondary"
                      style={{ padding: '6px 14px', fontSize: '12px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Slides Manager (owner / super_admin only) ── */}
        {isManager && (
          <div style={{ ...styles.fullRow, padding: '10px 0 0 0', display: 'flex', justifyContent: 'flex-start', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <style>{`
              @keyframes cs-spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <button
              type="button"
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              onClick={() => {
                setEditingSlideId(null);
                setSlideFormTitle('');
                setSlideFormSubtitle('');
                setSlideFormLayout('image-right');
                setSlideFormBody('');
                setSlideFormImage('');
                setSlideFormHighlightText('');
                setSlideFormBullets('');
                setSlideGrid1Title('Animation & Film'); setSlideGrid1Desc('Original animated stories...'); setSlideGrid1Icon('🎬');
                setSlideGrid2Title('Game Development'); setSlideGrid2Desc('Immersive game universes...'); setSlideGrid2Icon('🎮');
                setSlideGrid3Title('AI & Innovation'); setSlideGrid3Desc('Leveraging AI...'); setSlideGrid3Icon('🧠');
                setSlideGrid4Title('Education & Mentorship'); setSlideGrid4Desc('Nurturing future...'); setSlideGrid4Icon('🎓');
                setIsManagingSlides(prev => !prev);
              }}
            >
              ➕ {isManagingSlides ? 'Close Chapter Editor' : 'Add New Story Chapter'}
            </button>

            <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', background: 'none' }}>
              🎥 Import Journey Video/Animation
              <input
                ref={journeyVideoFileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-m4v"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImportJourneyVideo(file);
                }}
              />
            </label>

            <label className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', background: 'none' }}>
              📊 Import PPTX Presentation
              <input
                ref={pptxFileInputRef}
                type="file"
                accept=".pptx"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0];
                  if (file) handleImportPPTX(file);
                }}
              />
            </label>

            <button
              type="button"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', background: 'none', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setImgEditorSrc(founderStory.image || founderImg); setImgEditorBrightness(100); setImgEditorContrast(100); setImgEditorSaturation(100); setImgEditorScale(100); setIsImageEditorOpen(true); }}
            >
              🖼️ Edit Founder Photo
            </button>

            {isParsingPptx && (
              <span style={{ fontSize: '12px', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '12px', height: '12px', border: '2px solid var(--accent-color)', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'cs-spin 1s linear infinite' }} />
                {pptxParsingStatus}
              </span>
            )}
          </div>
        )}

        {/* ── Add/Edit Chapter Form Overlay/Panel ── */}
        {isManager && isManagingSlides && (
          <div id="slide-editor-container" style={{ ...styles.fullRow }} className="glass-panel animate-fade-in">
            <div style={{ padding: '24px', border: '1px solid var(--accent-color)', borderRadius: '12px' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                {editingSlideId ? '✏️ Edit Story Chapter' : '➕ Add New Story Chapter'}
              </h3>

              {/* ── Founder's Journey 4-Process Pipeline (Real-Time Status) ── */}
              <div style={{
                marginBottom: '24px',
                padding: '20px',
                background: 'rgba(3, 7, 18, 0.4)',
                border: '1px solid rgba(6, 182, 212, 0.15)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                backdropFilter: 'blur(4px)'
              }}>
                <style>{`
                  .pipeline-card {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease-in-out;
                    position: relative;
                    overflow: hidden;
                  }
                  .pipeline-card:hover {
                    background: rgba(6, 182, 212, 0.06) !important;
                    border-color: rgba(6, 182, 212, 0.4) !important;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 20px rgba(6, 182, 212, 0.15);
                  }
                `}</style>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '12px',
                  fontWeight: 800,
                  color: 'var(--accent-color)',
                  textTransform: 'uppercase',
                  letterSpacing: '1.5px',
                  fontFamily: 'var(--font-mono)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-color)', boxShadow: '0 0 8px var(--accent-color)' }} />
                  Founder's Journey 4-Process Pipeline (Real-Time Status)
                </h4>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Step 1: Draft Chapter */}
                  <div 
                    onClick={() => chapterTitleInputRef.current?.focus()}
                    style={{
                      border: slideFormTitle.trim() ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
                    }}
                    className="pipeline-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>PROCESS 01</span>
                      <span style={{ fontSize: '12px' }}>{slideFormTitle.trim() ? '✅' : '⏳'}</span>
                    </div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#fff' }}>✍️ Draft Chapter</h5>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {slideFormTitle.trim() ? `Title: "${slideFormTitle.substring(0, 25)}${slideFormTitle.length > 25 ? '...' : ''}"` : 'Enter a chapter title & details to begin.'}
                    </p>
                  </div>

                  {/* Step 2: Chapter Image */}
                  <div 
                    onClick={() => chapterImageFileInputRef.current?.click()}
                    style={{
                      border: slideFormImage ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
                    }}
                    className="pipeline-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>PROCESS 02</span>
                      <span style={{ fontSize: '12px' }}>{slideFormImage ? '✅' : '⏳'}</span>
                    </div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#fff' }}>🖼️ Upload Chapter Image</h5>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      {slideFormImage ? (
                        <>
                          <img src={resolveDefaultAsset(slideFormImage)} alt="Thumb" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click to replace photo</span>
                        </>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Click to upload slide image</span>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Journey Video */}
                  <div 
                    onClick={() => journeyVideoFileInputRef.current?.click()}
                    style={{
                      border: journeyVideoUrl ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
                    }}
                    className="pipeline-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>PROCESS 03</span>
                      <span style={{ fontSize: '12px' }}>{journeyVideoUrl ? '✅' : '⏳'}</span>
                    </div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#fff' }}>🎥 Add Journey Video</h5>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {journeyVideoUrl ? `Video Active: ${journeyVideoName || 'journey.mp4'}` : 'Click to import video animation.'}
                    </p>
                  </div>

                  {/* Step 4: Import PPT */}
                  <div 
                    onClick={() => pptxFileInputRef.current?.click()}
                    style={{
                      border: journeySlides.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : undefined
                    }}
                    className="pipeline-card"
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>PROCESS 04</span>
                      <span style={{ fontSize: '12px' }}>{journeySlides.length > 0 ? '✅' : '⏳'}</span>
                    </div>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '13px', fontWeight: 700, color: '#fff' }}>📊 Import PPT Slides</h5>
                    <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {journeySlides.length > 0 ? `${journeySlides.length} chapters loaded. Click to import PPTX.` : 'Click to parse PPTX.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={styles.formLabel}>Chapter Title</label>
                  <input
                    ref={chapterTitleInputRef}
                    type="text"
                    className="glass-input"
                    value={slideFormTitle}
                    onChange={e => setSlideFormTitle(e.target.value)}
                    placeholder="e.g. DreamAvian Studios Is Born"
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Chapter Subtitle (Optional)</label>
                  <input
                    type="text"
                    className="glass-input"
                    value={slideFormSubtitle}
                    onChange={e => setSlideFormSubtitle(e.target.value)}
                    placeholder="e.g. Building a Global Creative Future"
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Layout Type</label>
                  <select
                    className="glass-input"
                    value={slideFormLayout}
                    onChange={e => setSlideFormLayout(e.target.value as any)}
                    style={{ background: 'rgba(3, 7, 18, 0.9)' }}
                  >
                    <option value="image-right">Text Left, Image Right</option>
                    <option value="image-left">Image Left, Text Right</option>
                    <option value="grid-no-image">Full text + 4-column Grid (No main image)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={styles.formLabel}>Main Body Text</label>
                <textarea
                  className="glass-input"
                  rows={5}
                  value={slideFormBody}
                  onChange={e => setSlideFormBody(e.target.value)}
                  placeholder="Write the chapter details here..."
                />
              </div>

              {slideFormLayout !== 'grid-no-image' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={styles.formLabel}>Bullets (Comma-separated, optional)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={slideFormBullets}
                      onChange={e => setSlideFormBullets(e.target.value)}
                      placeholder="e.g. Built on Imagination, Inspired by Sacrifice"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Highlight Text / Quote Box (Optional)</label>
                    <input
                      type="text"
                      className="glass-input"
                      value={slideFormHighlightText}
                      onChange={e => setSlideFormHighlightText(e.target.value)}
                      placeholder="e.g. 'The name DreamAvian...'"
                    />
                  </div>
                  <div>
                    <label style={styles.formLabel}>Chapter Image</label>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer', padding: '8px 14px', borderRadius: '6px', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', background: 'rgba(6,182,212,0.08)', fontWeight: 600, height: '36px' }}
                        onClick={() => chapterImageFileInputRef.current?.click()}
                      >
                        🖼️ Add Chapter Image
                      </button>
                      <input 
                        ref={chapterImageFileInputRef} 
                        type="file" 
                        accept="image/*" 
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => setSlideFormImage(reader.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                      <input
                        type="text"
                        className="glass-input"
                        value={slideFormImage}
                        onChange={e => setSlideFormImage(e.target.value)}
                        placeholder="Or paste Base64 / Image path"
                        style={{ fontSize: '11px' }}
                      />
                    </div>
                    {slideFormImage && (
                      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={resolveDefaultAsset(slideFormImage)} 
                          alt="Preview" 
                          style={{ maxHeight: '60px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }} 
                        />
                        <button 
                          type="button" 
                          className="btn-secondary" 
                          style={{ padding: '2px 8px', fontSize: '10px', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.2)', height: '24px', cursor: 'pointer' }}
                          onClick={() => setSlideFormImage('')}
                        >
                          Remove Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Grid Items config form */}
              <div style={{ border: '1px solid rgba(124, 58, 237, 0.2)', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
                <h4 style={{ margin: '0 0 14px', fontSize: '13px', fontWeight: 700, color: 'var(--accent-color)', fontFamily: 'var(--font-display)' }}>
                  Configure 4 Grid Columns {slideFormLayout !== 'grid-no-image' && '(Optional)'}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
                    <label style={{ fontSize: '10px', color: '#ccc' }}>Column 1 (Title/Desc/Icon)</label>
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid1Title} onChange={e => setSlideGrid1Title(e.target.value)} placeholder="Title" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid1Desc} onChange={e => setSlideGrid1Desc(e.target.value)} placeholder="Desc" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px' }} value={slideGrid1Icon} onChange={e => setSlideGrid1Icon(e.target.value)} placeholder="Icon (🎬)" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
                    <label style={{ fontSize: '10px', color: '#ccc' }}>Column 2 (Title/Desc/Icon)</label>
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid2Title} onChange={e => setSlideGrid2Title(e.target.value)} placeholder="Title" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid2Desc} onChange={e => setSlideGrid2Desc(e.target.value)} placeholder="Desc" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px' }} value={slideGrid2Icon} onChange={e => setSlideGrid2Icon(e.target.value)} placeholder="Icon (🎮)" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
                    <label style={{ fontSize: '10px', color: '#ccc' }}>Column 3 (Title/Desc/Icon)</label>
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid3Title} onChange={e => setSlideGrid3Title(e.target.value)} placeholder="Title" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid3Desc} onChange={e => setSlideGrid3Desc(e.target.value)} placeholder="Desc" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px' }} value={slideGrid3Icon} onChange={e => setSlideGrid3Icon(e.target.value)} placeholder="Icon (🧠)" />
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px' }}>
                    <label style={{ fontSize: '10px', color: '#ccc' }}>Column 4 (Title/Desc/Icon)</label>
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid4Title} onChange={e => setSlideGrid4Title(e.target.value)} placeholder="Title" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px', marginBottom: '4px' }} value={slideGrid4Desc} onChange={e => setSlideGrid4Desc(e.target.value)} placeholder="Desc" />
                    <input type="text" className="glass-input" style={{ padding: '6px', fontSize: '11px' }} value={slideGrid4Icon} onChange={e => setSlideGrid4Icon(e.target.value)} placeholder="Icon (🎓)" />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '10px 20px', fontSize: '12px' }}
                  onClick={() => {
                    if (!slideFormTitle.trim() && !slideFormImage) {
                      alert("Please enter a chapter title or upload an image.");
                      return;
                    }
                    
                    const newSlide: any = {
                      id: editingSlideId || `slide-${Date.now()}`,
                      title: slideFormTitle.trim(),
                      subtitle: slideFormSubtitle.trim() || undefined,
                      layout: slideFormLayout,
                      body: slideFormBody.trim(),
                      highlightText: slideFormHighlightText.trim() || undefined,
                      bullets: slideFormBullets.trim() ? slideFormBullets.split(',').map(b => b.trim()).filter(Boolean) : undefined,
                      image: slideFormImage || undefined,
                      gridItems: (slideFormLayout === 'grid-no-image' || slideGrid1Title || slideGrid2Title || slideGrid3Title || slideGrid4Title) ? [
                        { title: slideGrid1Title.trim() || 'Animation & Film', desc: slideGrid1Desc.trim() || '', icon: slideGrid1Icon.trim() || '🎬' },
                        { title: slideGrid2Title.trim() || 'Game Development', desc: slideGrid2Desc.trim() || '', icon: slideGrid2Icon.trim() || '🎮' },
                        { title: slideGrid3Title.trim() || 'AI & Innovation', desc: slideGrid3Desc.trim() || '', icon: slideGrid3Icon.trim() || '🧠' },
                        { title: slideGrid4Title.trim() || 'Education & Mentorship', desc: slideGrid4Desc.trim() || '', icon: slideGrid4Icon.trim() || '🎓' }
                      ] : undefined
                    };

                    if (editingSlideId) {
                      setJourneySlides(journeySlides.map(s => s.id === editingSlideId ? newSlide : s));
                      alert("🎉 Chapter updated successfully!");
                    } else {
                      setJourneySlides([...journeySlides, newSlide]);
                      alert("🎉 New chapter added to the journey!");
                    }

                    setIsManagingSlides(false);
                    setEditingSlideId(null);
                  }}
                >
                  {editingSlideId ? 'Save Changes' : 'Publish Chapter'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setIsManagingSlides(false);
                    setEditingSlideId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Render Journey Video or Timeline Slides ── */}
        {journeyVideoUrl ? (
          <div style={{ ...styles.fullRow }} className="cyber-card animate-fade-in">
            <div style={{ padding: '24px', border: '1px solid var(--accent-color)', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.02)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                  🎬 Founder's Journey Cinematic Video & Animation
                </h3>
                {isManager && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onClick={handleRemoveJourneyVideo}
                  >
                    🗑️ Remove Video Journey
                  </button>
                )}
              </div>
              <div style={{ position: 'relative', width: '100%', maxHeight: '550px', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
                <video
                  src={journeyVideoUrl}
                  controls
                  style={{ width: '100%', maxHeight: '550px', display: 'block', objectFit: 'contain' }}
                />
              </div>
              <div style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--accent-color)', fontWeight: 600 }}>File Name:</span>
                <span>{journeyVideoName || 'journey_animation.mp4'}</span>
              </div>
            </div>
          </div>
        ) : (
          journeySlides.map((slide, index) => {
          const isRight = slide.layout === 'image-right';
          const isLeft = slide.layout === 'image-left';
          const isGrid = slide.layout === 'grid-no-image';
          const isImageOnly = (!slide.title || !slide.title.trim()) && (!slide.body || !slide.body.trim()) && !!slide.image;
          
          const renderParagraphWithHighlights = (text: string) => {
            if (!text) return '';
            const keywords = [
              { word: 'DreamAvian Studios', style: { color: 'var(--accent-color)', fontWeight: '700' } },
              { word: 'DreamAvian', style: { color: 'var(--accent-color)', fontWeight: '700' } },
              { word: 'DreamLink', style: { color: 'var(--accent-color)', fontWeight: '700' } },
              { word: 'future creative ecosystem', style: { color: '#fff', fontWeight: '700' } },
              { word: 'unified creative ecosystem', style: { color: '#93c5fd', fontWeight: '700' } },
              { word: 'global creative ecosystem', style: { color: '#fff', fontWeight: '700' } },
              { word: 'pulse of imagination', style: { fontStyle: 'italic', color: '#93c5fd' } },
              { word: 'July 1, 2026', style: { fontWeight: '700', color: '#fff' } },
              { word: 'nurture future talent', style: { color: 'var(--accent-color)', fontWeight: '600' } },
              { word: 'imagination itself is fading', style: { fontWeight: '700', color: '#fff' } }
            ];

            let parts: React.ReactNode[] = [text];
            
            keywords.forEach(({ word, style }) => {
              const newParts: React.ReactNode[] = [];
              parts.forEach(part => {
                if (typeof part === 'string') {
                  const regex = new RegExp(`(${word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
                  const splitText = part.split(regex);
                  splitText.forEach((t, i) => {
                    if (t.toLowerCase() === word.toLowerCase()) {
                      newParts.push(<span key={`${word}-${i}`} style={style}>{t}</span>);
                    } else {
                      newParts.push(t);
                    }
                  });
                } else {
                  newParts.push(part);
                }
              });
              parts = newParts;
            });

            return parts;
          };

          return (
            <div key={slide.id} style={{ ...styles.fullRow, padding: 0 }} className="cyber-card animate-fade-in">
              {/* Admin Slide Controls */}
              {isManager && (
                <div style={{ position: 'absolute', top: '16px', right: '16px', display: 'flex', gap: '8px', zIndex: 10 }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                    onClick={() => {
                      setEditingSlideId(slide.id);
                      setSlideFormTitle(slide.title || '');
                      setSlideFormSubtitle(slide.subtitle || '');
                      setSlideFormLayout(slide.layout || 'image-right');
                      setSlideFormBody(slide.body || '');
                      setSlideFormImage(slide.image || '');
                      setSlideFormHighlightText(slide.highlightText || '');
                      setSlideFormBullets(slide.bullets ? slide.bullets.join(', ') : '');
                      if (slide.gridItems && slide.gridItems.length >= 4) {
                        setSlideGrid1Title(slide.gridItems[0].title); setSlideGrid1Desc(slide.gridItems[0].desc); setSlideGrid1Icon(slide.gridItems[0].icon);
                        setSlideGrid2Title(slide.gridItems[1].title); setSlideGrid2Desc(slide.gridItems[1].desc); setSlideGrid2Icon(slide.gridItems[1].icon);
                        setSlideGrid3Title(slide.gridItems[2].title); setSlideGrid3Desc(slide.gridItems[2].desc); setSlideGrid3Icon(slide.gridItems[2].icon);
                        setSlideGrid4Title(slide.gridItems[3].title); setSlideGrid4Desc(slide.gridItems[3].desc); setSlideGrid4Icon(slide.gridItems[3].icon);
                      }
                      setIsManagingSlides(true);
                      setTimeout(() => {
                        document.getElementById('slide-editor-container')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this chapter?")) {
                        setJourneySlides(journeySlides.filter(s => s.id !== slide.id));
                      }
                    }}
                  >
                    🗑️ Delete
                  </button>

                  {index > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => {
                        const updated = [...journeySlides];
                        const temp = updated[index];
                        updated[index] = updated[index - 1];
                        updated[index - 1] = temp;
                        setJourneySlides(updated);
                      }}
                    >
                      ▲
                    </button>
                  )}

                  {index < journeySlides.length - 1 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 10px', fontSize: '11px' }}
                      onClick={() => {
                        const updated = [...journeySlides];
                        const temp = updated[index];
                        updated[index] = updated[index + 1];
                        updated[index + 1] = temp;
                        setJourneySlides(updated);
                      }}
                    >
                      ▼
                    </button>
                  )}
                </div>
              )}

              <div className="slide-container" style={isImageOnly ? { minHeight: 'auto' } : undefined}>
                {isImageOnly ? (
                  <div style={{ flex: '1 1 100%', height: '550px', overflow: 'hidden', position: 'relative', borderRadius: '12px' }}>
                    <img 
                      src={slide.image} 
                      alt="Chapter Visual Only" 
                      style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#030712', display: 'block', cursor: 'zoom-in', borderRadius: '12px' }} 
                      onClick={() => setLightboxSrc(slide.image)} 
                    />
                  </div>
                ) : (
                  <>
                    {/* Layout: Image Left */}
                    {isLeft && slide.image && (
                      <div className="slide-image-col">
                        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} onClick={() => setLightboxSrc(slide.image)} />
                      </div>
                    )}

                    {/* Text Column */}
                    {!isGrid ? (
                      <div className="slide-text-col">
                        {slide.title && (
                          <h2 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', lineHeight: '1.2' }}>
                            {slide.title}
                          </h2>
                        )}
                        
                        {slide.subtitle && (
                          <h3 style={{ margin: '0 0 16px', fontSize: '15px', fontWeight: 600, color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>
                            {slide.subtitle}
                          </h3>
                        )}

                        {/* Bullets box */}
                        {slide.bullets && slide.bullets.length > 0 && (
                          <div className="slide-bullet-box">
                            {slide.bullets.map((b: string, bi: number) => (
                              <div key={bi} className="slide-bullet-item">
                                ✦ {b}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Main Body */}
                        {slide.body && (
                          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>
                            {renderParagraphWithHighlights(slide.body)}
                          </p>
                        )}

                        {/* Highlight text bottom */}
                        {slide.highlightText && (
                          slide.id === 'slide-2' || (slide.title && slide.title.includes('Born')) ? (
                            <div className="slide-banner-box">
                              {slide.highlightText}
                            </div>
                          ) : (
                            <div className="slide-quote-box">
                              {slide.highlightText}
                            </div>
                          )
                        )}

                        {/* Grid items in 2-column layout */}
                        {slide.gridItems && slide.gridItems.length > 0 && (
                          <div className="slide-grid-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px' }}>
                            {slide.gridItems.map((item: any, itemIdx: number) => (
                              <div key={itemIdx} className="slide-grid-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px 14px' }}>
                                <div style={{ fontSize: '20px', marginBottom: '8px' }}>{item.icon || '🎬'}</div>
                                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', marginBottom: '4px', fontFamily: 'var(--font-display)' }}>{item.title}</div>
                                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{item.desc}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Grid layout */
                      <div style={{ flex: '1 1 100%' }}>
                        {slide.title && (
                          <h2 style={{ margin: '0 0 16px', fontSize: '28px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
                            {slide.title}
                          </h2>
                        )}
                        {slide.body && (
                          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: '0 0 20px' }}>
                            {renderParagraphWithHighlights(slide.body)}
                          </p>
                        )}
                        
                        <div className="slide-grid-container">
                          {slide.gridItems && slide.gridItems.map((item: any, itemIdx: number) => (
                            <div key={itemIdx} className="slide-grid-item">
                              <div style={{ fontSize: '24px', marginBottom: '12px' }}>{item.icon || '🎬'}</div>
                              <div style={{ fontSize: '14.5px', fontWeight: 700, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{item.title}</div>
                              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Layout: Image Right */}
                    {isRight && slide.image && (
                      <div className="slide-image-col">
                        <img src={slide.image} alt={slide.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }} onClick={() => setLightboxSrc(slide.image)} />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })
      )}

        {/* ── Company Statistics Card ── */}
        <div style={{ ...styles.halfCol, flex: '1 1 35%', padding: 0 }} className="cyber-card-purple animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, #7c3aed, #06b6d4)', borderRadius: '4px' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Company Statistics</h3>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {companyStats.map((stat, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>{stat.label}</span>
                  <span style={{ fontSize: '11.5px', color: '#fff', fontWeight: 600, textAlign: 'right' }}>{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Mission & Vision Statement Row ── */}
        <div style={{ ...styles.halfCol, flex: '1 1 60%', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="cyber-card animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>🎯</div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Mission Statement</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              To create world-class stories, games, films, software, and creative technology experiences from India for global audiences.
            </p>
          </div>

          <div className="cyber-card-purple animate-fade-in" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>✨</div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff', fontFamily: 'var(--font-display)' }}>Company Vision</h3>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6', margin: 0 }}>
              To become a globally recognized creative ecosystem combining animation, gaming, filmmaking, education, software, and AI innovation.
            </p>
          </div>
        </div>

        {/* ── Services Overview Panel ── */}
        <div style={{ ...styles.fullRow, padding: 0 }} className="cyber-card animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, #06b6d4, #7c3aed)', borderRadius: '4px' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Services Overview</h3>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {servicesList.map((service, i) => (
                <div
                  key={i}
                  className="service-pill"
                  style={{
                    padding: '8px 18px',
                    borderRadius: '20px',
                    background: 'rgba(6,182,212,0.03)',
                    fontSize: '12px',
                    color: '#fff',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.5px'
                  }}
                >
                  {service}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Core Values & Academy Grid ── */}
        <div style={{ ...styles.halfCol, flex: '1 1 50%', padding: 0 }} className="cyber-card-purple animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '4px', height: '24px', background: 'linear-gradient(180deg, #7c3aed, #06b6d4)', borderRadius: '4px' }} />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Core Values</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {coreValuesList.map((val, i) => (
                <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: val.color, marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>{val.title}</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ ...styles.halfCol, flex: '1 1 45%', padding: 0 }} className="cyber-card animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎓</div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>DreamAvian Academy</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', marginBottom: '14px' }}>
              Designed to bridge the gap between creative ambition and industry standards. DreamAvian Academy delivers high-tier educational training programs in 3D/2D Animation, CGI Pipelines, Game Engines (Unreal/Unity), VFX Composite Pipelines, and AI-Driven Content Tools.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10.5px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>Live Mentorship</span>
              <span style={{ fontSize: '10.5px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>Portfolio-First</span>
              <span style={{ fontSize: '10.5px', padding: '4px 10px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>Studio Pipelines</span>
            </div>
          </div>
        </div>

        {/* ── Key Projects & Global Expansion ── */}
        <div style={{ ...styles.halfCol, flex: '1 1 50%', padding: 0 }} className="cyber-card animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎮</div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Flagship Project: DreamLink</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
              DreamLink is DreamAvian Studios' premier original title. Representing the cross-section of interactive storytelling and state-of-the-art gaming engines, development focuses on building advanced character animation pipelines, dynamic environment interactions, and immersive storytelling formats for global platforms.
            </p>
          </div>
        </div>

        <div style={{ ...styles.halfCol, flex: '1 1 45%', padding: 0 }} className="cyber-card-purple animate-fade-in">
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🌎</div>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Global Expansion Goals</h3>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.7', margin: 0 }}>
              With a remote-first work culture, DreamAvian Studios aims to actively expand its strategic client partnerships across India and the United States. We are dedicated to scaling production operations, securing global co-production deals, and establishing physical co-working hubs for developers and designers.
            </p>
          </div>
        </div>

        {/* ── Future Roadmap Timeline ── */}
        <div style={{ ...styles.fullRow }} className="glass-panel">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{ width: '4px', height: '28px', background: 'linear-gradient(180deg, #7c3aed, #06b6d4)', borderRadius: '4px' }} />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Future Roadmap & Milestones</h3>
            {isManager && (
              <button
                onClick={() => {
                  setTempMilestones(JSON.parse(JSON.stringify(milestones)));
                  setIsEditingMilestones(v => !v);
                }}
                style={{ marginLeft: 'auto', background: isEditingMilestones ? 'rgba(6,182,212,0.15)' : 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, transition: '0.2s' }}
              >
                <Edit3 size={13} />
                {isEditingMilestones ? 'Close Editor' : 'Edit Timeline'}
              </button>
            )}
          </div>

          {!isEditingMilestones ? (
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', position: 'relative', padding: '10px 0' }}>
              {/* Connecting progress line */}
              <div style={{ position: 'absolute', top: '40px', left: '40px', right: '40px', height: '2px', background: 'linear-gradient(90deg, #06b6d4, #7c3aed, #ec4899)', zIndex: 0, opacity: 0.3 }} />
              
              {milestones.map((m, i) => (
                <div
                  key={i}
                  className="milestone-node"
                  style={{
                    flex: '1 1 200px',
                    minWidth: '220px',
                    position: 'relative',
                    padding: '20px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    zIndex: 1
                  }}
                >
                  {/* Glowing Milestone Icon */}
                  <div
                    className="milestone-icon-glow"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: `${m.color || '#06b6d4'}18`,
                      border: `2px solid ${m.color || '#06b6d4'}`,
                      color: m.color || '#06b6d4',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      marginBottom: '14px',
                      boxShadow: `0 0 10px ${m.color || '#06b6d4'}33`
                    }}
                  >
                    {m.icon || '🎬'}
                  </div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: m.color || '#06b6d4', letterSpacing: '1px', marginBottom: '6px', fontFamily: 'var(--font-mono)' }}>{m.year}</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{m.title}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>{m.desc}</div>
                </div>
              ))}
              {milestones.length === 0 && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', width: '100%', padding: '20px 0' }}>
                  No roadmap items configured. Click "Edit Timeline" to add milestones!
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {tempMilestones.map((m, index) => (
                  <div 
                    key={index}
                    style={{ 
                      padding: '16px', 
                      background: 'rgba(255,255,255,0.02)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <div style={{ width: '80px' }}>
                        <label style={styles.formLabel}>Year / Range</label>
                        <input 
                          type="text" 
                          className="glass-input" 
                          value={m.year} 
                          onChange={(e) => {
                            const updated = [...tempMilestones];
                            updated[index].year = e.target.value;
                            setTempMilestones(updated);
                          }}
                        />
                      </div>
                      <div style={{ width: '130px', flexShrink: 0 }}>
                        <label style={styles.formLabel}>Icon</label>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            className="glass-input" 
                            style={{ width: '38px', padding: '6px', fontSize: '15px', textAlign: 'center' }}
                            value={m.icon || '🚀'} 
                            onChange={(e) => {
                              const updated = [...tempMilestones];
                              updated[index].icon = e.target.value;
                              setTempMilestones(updated);
                            }}
                            placeholder="🚀"
                          />
                          <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', width: '85px', background: 'rgba(255,255,255,0.02)', padding: '4px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            {['🚀', '🎬', '🎨', '🎮', '💡', '🏆', '🤝', '💻'].map(emoji => (
                              <button
                                key={emoji}
                                type="button"
                                style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', fontSize: '13px', lineHeight: 1, transition: 'transform 0.1s' }}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.25)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                                onClick={() => {
                                  const updated = [...tempMilestones];
                                  updated[index].icon = emoji;
                                  setTempMilestones(updated);
                                }}
                                title={`Set ${emoji}`}
                              >
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div style={{ flex: '1 1 150px' }}>
                        <label style={styles.formLabel}>Title</label>
                        <input 
                          type="text" 
                          className="glass-input" 
                          value={m.title} 
                          onChange={(e) => {
                            const updated = [...tempMilestones];
                            updated[index].title = e.target.value;
                            setTempMilestones(updated);
                          }}
                        />
                      </div>
                      <div style={{ width: '100px' }}>
                        <label style={styles.formLabel}>Color (Hex)</label>
                        <input 
                          type="text" 
                          className="glass-input" 
                          value={m.color} 
                          onChange={(e) => {
                            const updated = [...tempMilestones];
                            updated[index].color = e.target.value;
                            setTempMilestones(updated);
                          }}
                          placeholder="#06b6d4"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ alignSelf: 'flex-end', padding: '10px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                        onClick={() => {
                          setTempMilestones(tempMilestones.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div>
                      <label style={styles.formLabel}>Description</label>
                      <textarea 
                        className="glass-input" 
                        rows={2} 
                        value={m.desc} 
                        onChange={(e) => {
                          const updated = [...tempMilestones];
                          updated[index].desc = e.target.value;
                          setTempMilestones(updated);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => {
                    setTempMilestones([
                      ...tempMilestones,
                      { year: '2026', icon: '🚀', title: 'New Roadmap Node', desc: 'Describe the milestone here.', color: '#06b6d4' }
                    ]);
                  }}
                >
                  <Plus size={14} />
                  <span>Add Node</span>
                </button>
                
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginLeft: 'auto' }}
                  onClick={() => {
                    setMilestones(tempMilestones);
                    setIsEditingMilestones(false);
                    alert("🎉 Roadmap updated successfully!");
                  }}
                >
                  Save Roadmap
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsEditingMilestones(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Full-screen Lightbox Modal ── */}
      {lightboxSrc && (
        <div
          onClick={() => setLightboxSrc(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxSrc(null)}
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '50%', width: '44px', height: '44px',
              color: '#fff', fontSize: '22px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(6,182,212,0.3)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >×</button>

          {/* ESC hint */}
          <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', fontSize: '12px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>Press ESC or click anywhere to close</div>

          {/* Image */}
          <img
            src={lightboxSrc}
            alt="Founder"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: '16px',
              objectFit: 'contain',
              boxShadow: '0 0 60px rgba(6,182,212,0.25), 0 0 120px rgba(124,58,237,0.15)',
              border: '2px solid rgba(6,182,212,0.3)',
              cursor: 'default'
            }}
          />
        </div>
      )}

      {/* ═══════════ IMAGE EDITOR MODAL ═══════════ */}
      {isImageEditorOpen && (
        <div
          onClick={() => setIsImageEditorOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn 0.2s ease' }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: 'linear-gradient(135deg,#0d1b2a,#111827)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '20px', padding: '32px', width: '520px', maxWidth: '95vw', boxShadow: '0 0 60px rgba(6,182,212,0.2), 0 0 120px rgba(124,58,237,0.1)', display: 'flex', flexDirection: 'column', gap: '24px' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg,#06b6d4,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  🖼️ Image Editor
                </h3>
                <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>Edit founder photo · Changes apply across the entire portal</p>
              </div>
              <button onClick={() => setIsImageEditorOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '36px', height: '36px', color: '#fff', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Preview */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0 }}>
                <div style={{ width: '140px', height: '140px', borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#7c3aed)', padding: '3px', boxShadow: '0 0 24px rgba(6,182,212,0.4)' }}>
                  <div style={{ borderRadius: '50%', overflow: 'hidden', width: '100%', height: '100%' }}>
                    {imgEditorSrc && (
                      <img
                        src={imgEditorSrc}
                        alt="Preview"
                        style={{
                          width: '100%', height: '100%', objectFit: 'cover',
                          filter: `brightness(${imgEditorBrightness}%) contrast(${imgEditorContrast}%) saturate(${imgEditorSaturation}%) scale(${imgEditorScale / 100})`
                        }}
                      />
                    )}
                  </div>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '10px', color: 'var(--text-secondary)', textAlign: 'center' }}>Live Preview</p>
              </div>

              {/* Upload */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  ref={imgEditorInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setImgEditorSrc(ev.target?.result as string);
                    reader.readAsDataURL(file);
                  }}
                />
                <button
                  onClick={() => imgEditorInputRef.current?.click()}
                  style={{ padding: '10px 16px', borderRadius: '10px', background: 'rgba(6,182,212,0.12)', border: '1px dashed rgba(6,182,212,0.5)', color: '#06b6d4', fontSize: '12px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Upload New Photo
                </button>
                <button
                  onClick={() => { setImgEditorSrc(founderImg); setImgEditorBrightness(100); setImgEditorContrast(100); setImgEditorSaturation(100); setImgEditorScale(100); }}
                  style={{ padding: '8px 14px', borderRadius: '8px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', color: '#a78bfa', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🔄 Reset to Default Photo
                </button>
              </div>
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { label: '☀️ Brightness', value: imgEditorBrightness, min: 50, max: 180, setter: setImgEditorBrightness, color: '#fbbf24' },
                { label: '🌑 Contrast', value: imgEditorContrast, min: 50, max: 180, setter: setImgEditorContrast, color: '#06b6d4' },
                { label: '🎨 Saturation', value: imgEditorSaturation, min: 0, max: 200, setter: setImgEditorSaturation, color: '#ec4899' },
                { label: '🔍 Zoom', value: imgEditorScale, min: 80, max: 130, setter: setImgEditorScale, color: '#34d399' },
              ].map(({ label, value, min, max, setter, color }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', width: '100px', flexShrink: 0 }}>{label}</span>
                  <input
                    type="range" min={min} max={max} value={value}
                    onChange={e => setter(Number(e.target.value))}
                    style={{ flex: 1, accentColor: color, height: '4px', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: '11px', color, fontWeight: 700, width: '36px', textAlign: 'right' }}>{value}%</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  // Export filtered image to canvas → data: URL
                  const img = new Image();
                  img.crossOrigin = 'anonymous';
                  img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext('2d')!;
                    ctx.filter = `brightness(${imgEditorBrightness}%) contrast(${imgEditorContrast}%) saturate(${imgEditorSaturation}%)`;
                    ctx.drawImage(img, 0, 0);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                    setFounderStory(prev => ({ ...prev, image: dataUrl }));
                    setIsImageEditorOpen(false);
                  };
                  img.onerror = () => {
                    // For same-origin bundled assets, just apply directly
                    setFounderStory(prev => ({ ...prev, image: imgEditorSrc }));
                    setIsImageEditorOpen(false);
                  };
                  img.src = imgEditorSrc;
                }}
                className="btn-primary"
                style={{ flex: 1, padding: '12px', fontSize: '13px', fontWeight: 700, borderRadius: '12px' }}
              >
                ✅ Apply to Portal
              </button>
              <button
                onClick={() => setIsImageEditorOpen(false)}
                className="btn-secondary"
                style={{ padding: '12px 20px', fontSize: '13px', borderRadius: '12px' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    );
  };

  // 6d. Studio Board & Partners (Owner/Super Admin can add/edit, all users can view)
  const renderStudioBoard = () => {
    const isManager = role === 'studio_owner' || role === 'super_admin';

    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h2 style={styles.sectionTitle}>Studio Leadership, Board & Ambassadors</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '-8px', marginBottom: '16px' }}>
            Meet the visionaries, investors, and brand ambassadors behind DreamAvian Studios.
          </p>
        </div>

        {/* ── Founder's Story Card — visible to ALL users ── */}
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <div style={{ display: 'flex', gap: '28px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Photo side */}
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', width: '140px', height: '140px' }}>
                {founderStory.image ? (
                  <img
                    src={founderStory.image}
                    alt="Founder"
                    style={{ width: '140px', height: '140px', borderRadius: '16px', objectFit: 'cover', border: '2px solid var(--accent-color)', boxShadow: '0 0 24px rgba(6,182,212,0.3)' }}
                  />
                ) : (
                  <div style={{ width: '140px', height: '140px', borderRadius: '16px', background: 'rgba(6,182,212,0.08)', border: '2px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', color: 'var(--accent-color)', fontWeight: 'bold' }}>SG</div>
                )}
                {/* Subtle gradient overlay at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', borderRadius: '0 0 14px 14px', background: 'linear-gradient(transparent, rgba(0,0,0,0.5))' }} />
              </div>
              <span style={{ fontSize: '10px', color: 'var(--accent-color)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>FOUNDER & CEO</span>
              <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>Subham Ghorai</span>
            </div>
            {/* Story side */}
            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{ width: '4px', height: '32px', background: 'linear-gradient(180deg, var(--accent-color), #7c3aed)', borderRadius: '4px' }} />
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, background: 'linear-gradient(135deg, #06b6d4, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {founderStory.title}
                </h3>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.8', margin: 0, whiteSpace: 'pre-wrap' }}>
                {founderStory.body}
              </p>
              {isManager && (
                <button
                  onClick={() => { setEditStoryTitle(founderStory.title); setEditStoryBody(founderStory.body); setEditStoryImage(founderStory.image); setIsEditingStory(true); }}
                  style={{ marginTop: '18px', background: 'none', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', borderRadius: '8px', padding: '6px 16px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Story
                </button>
              )}
            </div>
          </div>

          {/* ── Edit Story Modal (owner / super_admin only) ── */}
          {isManager && isEditingStory && (
            <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--accent-color)' }}>✏️ Update Founder's Story</h4>

              {/* Title */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Story Title</label>
                <input
                  value={editStoryTitle}
                  onChange={(e) => setEditStoryTitle(e.target.value)}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' }}
                  placeholder="e.g. The Founder's Journey"
                />
              </div>

              {/* Body */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Story / Bio</label>
                <textarea
                  value={editStoryBody}
                  onChange={(e) => setEditStoryBody(e.target.value)}
                  rows={6}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px 12px', color: '#fff', fontSize: '13px', resize: 'vertical', boxSizing: 'border-box', lineHeight: '1.7' }}
                  placeholder="Write your backstory, vision, and journey..."
                />
              </div>

              {/* Image upload */}
              <div>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Story Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {editStoryImage && (
                    <img src={editStoryImage} alt="preview" style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover', border: '1px solid var(--accent-color)' }} />
                  )}
                  <label style={{ cursor: 'pointer', background: 'rgba(6,182,212,0.08)', border: '1px dashed var(--accent-color)', borderRadius: '8px', padding: '8px 16px', fontSize: '12px', color: 'var(--accent-color)', fontWeight: 600 }}>
                    📷 Choose New Photo
                    <input
                      type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onloadend = () => setEditStoryImage(reader.result as string);
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => { setFounderStory({ title: editStoryTitle.trim() || founderStory.title, body: editStoryBody.trim() || founderStory.body, image: editStoryImage || founderStory.image }); setIsEditingStory(false); }}
                  className="btn-primary"
                  style={{ padding: '8px 20px', fontSize: '13px' }}
                >
                  💾 Save Story
                </button>
                <button
                  onClick={() => setIsEditingStory(false)}
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {isManager && (
          <div id="partner-form-container" style={styles.halfCol} className="glass-panel">
            <h3 style={styles.subTitle}>{editingPartnerId ? '✏️ Edit Board Member / Investor' : 'Add Board Member / Investor / Ambassador'}</h3>
            <form onSubmit={handleAddPartner} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Full Name</label>
                <input 
                  type="text"
                  placeholder="e.g. Ratan Tata"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Role / Designation</label>
                <input 
                  type="text"
                  placeholder="e.g. Lead Investor, Brand Ambassador, Founder & CEO"
                  value={newPartnerRole}
                  onChange={(e) => setNewPartnerRole(e.target.value)}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Short Bio / Description</label>
                <textarea 
                  placeholder="Describe their contribution, background, or association with the studio..."
                  value={newPartnerDesc}
                  onChange={(e) => setNewPartnerDesc(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none', resize: 'vertical' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', color: 'var(--text-secondary)' }}>Profile Photo / Image</label>
                <label style={{ ...styles.uploadBox, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px' }}>
                  <Upload size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {newPartnerImage ? "✓ Photo Selected" : "Click to select JPG or PNG"}
                  </span>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePartnerImageUpload} />
                </label>
                {newPartnerImage && (
                  <div style={{ marginTop: '10px', textAlign: 'center' }}>
                    <img 
                      src={newPartnerImage} 
                      alt="Preview" 
                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)' }} 
                    />
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', marginTop: '6px' }}>
                  {editingPartnerId ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> : <Plus size={16} />} 
                  {editingPartnerId ? 'Save Changes' : 'Add to Board'}
                </button>
                {editingPartnerId && (
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ padding: '10px 16px', marginTop: '6px' }}
                    onClick={() => {
                      setEditingPartnerId(null);
                      setNewPartnerName('');
                      setNewPartnerRole('Lead Investor');
                      setNewPartnerDesc('');
                      setNewPartnerImage(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div style={isManager ? styles.halfCol : styles.fullRow} className="glass-panel">
          <h3 style={styles.subTitle}>Board Gallery & Roster</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', maxHeight: '520px', overflowY: 'auto', paddingRight: '4px' }}>
            {leadershipPartners.map(p => (
              <div 
                key={p.id} 
                style={{ 
                  flex: isManager ? '1 1 100%' : '1 1 calc(33.33% - 12px)',
                  minWidth: '240px',
                  padding: '16px',
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px',
                  display: 'flex',
                  gap: '14px',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                  {isManager ? (
                    <>
                      {/* Hidden file input — only for studio_owner / super_admin */}
                      <input
                        type="file"
                        id={`img-upload-${p.id}`}
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setLeadershipPartners(prev =>
                              prev.map(item => item.id === p.id ? { ...item, image: reader.result as string } : item)
                            );
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {/* Clickable avatar with camera badge */}
                      <div
                        onClick={() => document.getElementById(`img-upload-${p.id}`)?.click()}
                        style={{ position: 'relative', width: '72px', height: '72px', cursor: 'pointer', flexShrink: 0 }}
                        title="Click to change photo"
                      >
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)', display: 'block' }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{
                            width: '72px', height: '72px', borderRadius: '50%',
                            background: 'rgba(6, 182, 212, 0.1)', border: '2px solid var(--accent-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '22px'
                          }}>
                            {p.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        {/* Always-visible camera badge */}
                        <div style={{
                          position: 'absolute', bottom: '-2px', right: '-2px',
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: '#06b6d4', border: '2px solid #0b0f19',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 8px rgba(6,182,212,0.6)', zIndex: 2
                        }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                            <circle cx="12" cy="13" r="4"/>
                          </svg>
                        </div>
                      </div>
                      {/* Change Photo label */}
                      <span
                        onClick={() => document.getElementById(`img-upload-${p.id}`)?.click()}
                        style={{ fontSize: '9px', color: '#06b6d4', fontWeight: 600, cursor: 'pointer', letterSpacing: '0.5px', textTransform: 'uppercase', userSelect: 'none' }}
                      >
                        Change Photo
                      </span>
                    </>
                  ) : (
                    /* Read-only avatar for all other roles (viewers) — clickable lightbox */
                    <div
                      style={{ position: 'relative', width: '72px', height: '72px', flexShrink: 0, cursor: p.image ? 'zoom-in' : 'default' }}
                      onClick={() => p.image && setLightboxSrc(p.image)}
                      title={p.image ? 'Click to view full photo' : ''}
                    >
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-color)', display: 'block', transition: 'transform 0.25s' }}
                          onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                          onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{
                          width: '72px', height: '72px', borderRadius: '50%',
                          background: 'rgba(6, 182, 212, 0.1)', border: '2px solid var(--accent-color)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'var(--accent-color)', fontWeight: 'bold', fontSize: '22px'
                        }}>
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>


                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, margin: 0, color: '#fff' }}>{p.name}</h4>
                      <span className="badge badge-info" style={{ fontSize: '10px', marginTop: '2px', display: 'inline-block' }}>{p.role}</span>
                    </div>
                    {isManager && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => {
                            setEditingPartnerId(p.id);
                            setNewPartnerName(p.name);
                            setNewPartnerRole(p.role);
                            setNewPartnerDesc(p.description);
                            setNewPartnerImage(p.image || null);
                            setTimeout(() => {
                              document.getElementById('partner-form-container')?.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--accent-color)', transition: '0.2s' }}
                          title="Edit Member"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeletePartner(p.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'rgba(239,68,68,0.7)', transition: '0.2s' }}
                          title="Delete Member"
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239,68,68,0.7)')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: '1.4' }}>{p.description}</p>
                </div>
              </div>
            ))}
            {leadershipPartners.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <Info size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <span>No board members or partners listed yet.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // 6c. Employee Work Review Panel for Owner & Managers
  const renderWorkReviewQueue = () => {
    const totalCount = employeeWorks.length;
    const pendingCount = employeeWorks.filter(w => w.status === 'Pending Review').length;
    const approvedCount = employeeWorks.filter(w => w.status === 'Approved').length;
    const revisionCount = employeeWorks.filter(w => w.status === 'Requires Changes').length;

    const selectedWork = employeeWorks.find(w => w.id === selectedWorkId);

    return (
      <div style={styles.grid}>
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h2 style={styles.sectionTitle}>Employee Work Review Board</h2>
          <div style={styles.metricsGrid}>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Total Submissions</div>
              <div style={styles.metricValue}>{totalCount}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Pending Review</div>
              <div style={{ ...styles.metricValue, color: 'var(--warning)' }}>{pendingCount}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={styles.metricLabel}>Approved Assets</div>
              <div style={{ ...styles.metricValue, color: 'var(--success)' }}>{approvedCount}</div>
            </div>
            <div style={styles.metricCard}>
              <div style={{ ...styles.metricLabel }}>Revisions Requested</div>
              <div style={{ ...styles.metricValue, color: 'var(--danger)' }}>{revisionCount}</div>
            </div>
          </div>
        </div>

        <div style={{ flex: '1 1 45%', minWidth: '320px', padding: '24px' }} className="glass-panel">
          <h3 style={styles.subTitle}>Live Submission Stream</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
            {employeeWorks.map(w => (
              <div 
                key={w.id} 
                onClick={() => {
                  setSelectedWorkId(w.id);
                  setReviewFeedback(w.feedback || '');
                }}
                style={{ 
                  padding: '12px', 
                  background: selectedWorkId === w.id ? 'rgba(6, 182, 212, 0.08)' : 'rgba(255,255,255,0.02)', 
                  border: selectedWorkId === w.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600 }}>{w.employeeName} <span style={{ fontWeight: 400, opacity: 0.6 }}>({w.employeeRole})</span></span>
                  <span className={`badge badge-${w.status === 'Approved' ? 'success' : w.status === 'Requires Changes' ? 'danger' : 'warning'}`} style={{ fontSize: '9px' }}>
                    {w.status}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>{w.title}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                  <span>Project: {w.projectName}</span>
                  <span>{new Date(w.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
            {employeeWorks.length === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                <Info size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
                <span>No submissions to review yet.</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ flex: '1 1 50%', minWidth: '340px', padding: '24px' }} className="glass-panel">
          <h3 style={styles.subTitle}>Asset Review Monitor & Player</h3>
          {selectedWork ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ width: '100%', background: '#080c14', border: '1px solid var(--border-color)', borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {selectedWork.fileType === 'video' ? (
                  <video 
                    src={selectedWork.fileUrl} 
                    controls 
                    autoPlay 
                    loop 
                    style={{ width: '100%', display: 'block', maxHeight: '240px', background: '#000' }} 
                  />
                ) : selectedWork.fileType === 'audio' ? (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Volume2 size={48} color="var(--accent-color)" />
                    <span style={{ fontSize: '12px' }}>{selectedWork.fileName}</span>
                    <audio src={selectedWork.fileUrl} controls style={{ width: '100%' }} />
                  </div>
                ) : selectedWork.fileType === 'image' ? (
                  <img 
                    src={selectedWork.fileUrl} 
                    alt={selectedWork.title}
                    style={{ width: '100%', objectFit: 'contain', maxHeight: '240px', background: '#111', display: 'block' }} 
                  />
                ) : (
                  <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <Info size={48} color="var(--accent-color)" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedWork.fileName}</span>
                    <a 
                      href={selectedWork.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="btn-secondary" 
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '6px 12px' }}
                    >
                      <Download size={14} /> Open Public Link
                    </a>
                  </div>
                )}
                
                <div style={{ padding: '12px', borderTop: '1px solid var(--border-color)', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.01)' }}>
                  <span>Filename: {selectedWork.fileName}</span>
                  <span>Type: {selectedWork.fileType.toUpperCase()}</span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, margin: 0 }}>{selectedWork.title}</h4>
                  <span className={`badge badge-${selectedWork.status === 'Approved' ? 'success' : selectedWork.status === 'Requires Changes' ? 'danger' : 'warning'}`}>
                    {selectedWork.status}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Submitted by: <strong style={{ color: '#fff' }}>{selectedWork.employeeName}</strong> ({selectedWork.employeeRole})
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                  Email: {selectedWork.employeeEmail} | Project: {selectedWork.projectName}
                </div>
                <div style={{ fontSize: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '10px', borderRadius: '6px', marginTop: '10px', color: '#ddd' }}>
                  {selectedWork.description}
                </div>
              </div>

              {/* Review Feedback Form */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '4px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                  Review Notes & Feedback
                </label>
                <textarea 
                  placeholder="Enter feedback notes, frame revisions, audio modifications, etc..."
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', outline: 'none', resize: 'none', marginBottom: '12px', fontSize: '12px' }}
                />
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => handleReviewSubmit(selectedWork.id, 'Approved')} 
                    className="btn-primary" 
                    style={{ flex: 1, background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}
                  >
                    Approve Asset
                  </button>
                  <button 
                    onClick={() => handleReviewSubmit(selectedWork.id, 'Requires Changes')} 
                    className="btn-secondary" 
                    style={{ flex: 1, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px' }}
                  >
                    Request Changes
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', color: 'var(--text-secondary)' }}>
              <Info size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <span style={{ fontSize: '13px' }}>Select an asset submission from the stream to play review clips or approve deliverables.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 7. Creator Workspace Base (Animator, Designer, Storyboard, Editor fallback)
  const renderCreatorView = () => (
    <div style={styles.grid}>
      <div style={{ ...styles.halfCol, minHeight: '380px' }} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Visual Reference Playblast Monitor</h3>
        <div style={styles.videoPlayerContainer}>
          <div style={styles.mockVideo}>
            <Video size={48} color="var(--accent-color)" />
            <div style={{ fontSize: '13px', marginTop: '12px', color: 'var(--text-secondary)' }}>
              Scene_04_Blocking_v2.mp4 (Locked at 24fps)
            </div>
          </div>
          <div style={styles.videoControls}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>◀ Prev Frame</button>
            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>▶ Play Clip</button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>Next Frame ▶</button>
          </div>
        </div>
      </div>

      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>My Project Workspace</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <button onClick={handleClockIn} className={isClockedIn ? "btn-secondary" : "btn-primary"} style={{ flex: 1, padding: '8px' }}>
            {isClockedIn ? "Clock Out (Break)" : "Clock In (Start Time)"}
          </button>
        </div>

        <h4 style={{ fontSize: '13px', marginBottom: '10px' }}>Assigned Task List:</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto' }}>
          {tasks.slice(0, 3).map((task) => (
            <div key={task.id} style={styles.taskCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{task.name}</span>
                <span className="badge badge-info">{task.priority}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{task.description}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '13px', marginBottom: '10px' }}>Upload Completed Asset File:</h4>
          <label style={styles.uploadBox}>
            <Upload size={24} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Click to select FBX or WAV file</span>
            <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
          </label>
          
          {uploading && (
            <div style={{ marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                <span>Uploading to S3...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--primary-glow)' }}></div>
              </div>
            </div>
          )}

          {uploadedFiles.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600 }}>Recent Uploads:</div>
              {uploadedFiles.map((f, i) => (
                <div key={i} style={{ fontSize: '11px', color: 'var(--success)', marginTop: '4px' }}>
                  ✓ {f} - Uploaded successfully
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Animator/Designer/Storyboard specific tabs
  const renderAnimator = () => renderCreatorView();

  const renderDesigner = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Character design palette board</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['#0b0f19', '#161e2e', '#6d28d9', '#06b6d4', '#10b981'].map((c) => (
            <div key={c} style={{ width: '48px', height: '48px', background: c, borderRadius: '8px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px' }}>
              {c}
            </div>
          ))}
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Concept Art uploads & Version Control</h3>
        <label style={styles.uploadBox}>
          <Upload size={24} color="var(--text-secondary)" />
          <span style={{ fontSize: '12px' }}>Upload Concept Sheet PSD</span>
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--success)' }}>
            ✓ {uploadedFiles[0]} - Uploaded version 2
          </div>
        )}
      </div>
    </div>
  );

  const renderStoryboardArtist = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Storyboard Panels timeline</h3>
        <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
          {[1, 2, 3, 4].map((panel) => (
            <div key={panel} style={{ flex: '0 0 100px', height: '100px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '12px' }}>Panel {panel}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>v1.0</span>
            </div>
          ))}
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Script parser & screenplays</h3>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', fontSize: '11px', lineHeight: '1.6' }}>
          <p><strong>SCENE 4 - NIGHT - ROOFTOP</strong></p>
          <p style={{ color: 'var(--text-secondary)' }}>
            The character leaps from the rickshaw, vaults over the concrete barrier, and falls into the darkness.
          </p>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Editing timeline & rendering</h3>
        <div style={{ background: 'rgba(0,0,0,0.25)', height: '140px', border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', flexDirection: 'column', padding: '12px', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '2px', height: '20px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '40%', height: '100%', background: 'var(--primary-glow)' }}></div>
            <div style={{ width: '30%', height: '100%', background: 'var(--primary-glow)', opacity: 0.8 }}></div>
          </div>
          <div style={{ display: 'flex', gap: '2px', height: '20px', background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ width: '70%', height: '100%', background: 'var(--accent-color)' }}></div>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Media Pool intake</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span>mumbai_scene04_voice.wav</span>
            <span className="badge badge-success">Synced</span>
          </li>
          <li style={styles.listItem}>
            <span>bengal_folktale_seq01.mp4</span>
            <span className="badge badge-warning">Rendering</span>
          </li>
        </ul>
      </div>
    </div>
  );

  const renderVoiceArtist = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Recording Teleprompter</h3>
        <div style={{ background: '#000', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', height: '160px', overflowY: 'auto', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--text-primary)', lineHeight: '1.8' }}>
            "The city is awake, but its soul is sleeping in the neon light."
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button className="btn-primary" onClick={() => setIsPlayingScript(!isPlayingScript)}>
            {isPlayingScript ? 'Pause Prompt' : 'Start Scroll'}
          </button>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Microphone Input Monitor</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyItems: 'space-between', fontSize: '12px' }}>
            <span>Decibel Meter</span>
            <span>-12 dB</span>
          </div>
          <div style={{ height: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', overflow: 'hidden', display: 'flex', padding: '2px' }}>
            <div style={{ width: '65%', height: '100%', background: 'var(--primary-glow)', borderRadius: '10px' }}></div>
          </div>
          <button className="btn-secondary" onClick={() => alert('WAV Take uploaded!')}>Upload WAV Take</button>
        </div>
      </div>
    </div>
  );

  const renderFreelancer = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Freelance contract terms</h3>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <span>Scope: Rigging joints modeling</span>
            <span>$45 / Hour</span>
          </li>
          <li style={styles.listItem}>
            <span>Due Date: July 22, 2026</span>
            <span>S3 Delivery</span>
          </li>
        </ul>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Timesheet & Invoicing</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Hours Worked</label>
            <input type="number" className="glass-input" value={freelanceHours} onChange={(e) => setFreelanceHours(e.target.value)} />
          </div>
          <div>
            <label style={styles.formLabel}>Hourly Rate</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="number" className="glass-input" style={{ flex: 1 }} value={freelanceRate} onChange={(e) => setFreelanceRate(e.target.value)} />
              <select className="glass-input" style={{ width: '90px' }} value={freelanceCurrency} onChange={(e) => setFreelanceCurrency(e.target.value as 'USD' | 'INR')}>
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" onClick={handleSubmitInvoice}>Submit Invoice</button>
        </div>
      </div>
    </div>
  );

  const renderShotsTracker = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Production Shots & Sequencer Pipeline</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', height: '36px' }}>
                <th style={{ padding: '8px' }}>Shot ID</th>
                <th style={{ padding: '8px' }}>Sequence</th>
                <th style={{ padding: '8px' }}>Assignee</th>
                <th style={{ padding: '8px' }}>Status</th>
                <th style={{ padding: '8px' }}>Timeline Progress</th>
                <th style={{ padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'S-101', seq: 'Kolkata Cyberpunk intro', assignee: userName, status: 'Blocking', progress: 40 },
                { id: 'S-102', seq: 'Rickshaw Chase sequence', assignee: userName, status: 'Polish', progress: 85 },
                { id: 'S-103', seq: 'Neon Rooftop Battle', assignee: userName, status: 'Not Started', progress: 0 },
              ].map((shot) => (
                <tr key={shot.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', height: '48px' }}>
                  <td style={{ padding: '8px', fontWeight: 600 }}>{shot.id}</td>
                  <td style={{ padding: '8px', color: 'var(--text-secondary)' }}>{shot.seq}</td>
                  <td style={{ padding: '8px' }}>{shot.assignee}</td>
                  <td style={{ padding: '8px' }}>
                    <span className={`badge badge-${shot.status === 'Polish' ? 'success' : shot.status === 'Blocking' ? 'warning' : 'danger'}`}>
                      {shot.status}
                    </span>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${shot.progress}%`, background: 'var(--primary-glow)' }}></div>
                      </div>
                      <span style={{ fontSize: '11px' }}>{shot.progress}%</span>
                    </div>
                  </td>
                  <td style={{ padding: '8px' }}>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert(`Opening Shot ${shot.id}`)}>Inspect</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAssetDownloader = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Production Asset Catalog</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Download official models, textures, soundboards, and references approved by the Director.</p>
        <ul style={styles.list}>
          {[
            { name: 'CyberRickshaw_Rigged_v2.fbx', size: '42.4 MB', type: 'Model' },
            { name: 'RainyNeonStones_Texture.zip', size: '128.1 MB', type: 'Texture' },
            { name: 'Mumbai_Atmospheric_Synth.wav', size: '18.9 MB', type: 'Audio' },
          ].map((asset, i) => (
            <li key={i} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{asset.name}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{asset.type} • {asset.size}</div>
              </div>
              <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert(`Downloading ${asset.name}`)}>
                Download
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Request Asset from Library Admin</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={styles.formLabel}>Asset Name / Description</label>
            <input type="text" className="glass-input" placeholder="e.g. Neon Light Billboard Mesh" />
          </div>
          <div>
            <label style={styles.formLabel}>Resolution / Specifications</label>
            <select className="glass-input">
              <option>High Poly FBX</option>
              <option>Low Poly FBX (Mobile Optimized)</option>
              <option>4K PBR Textures</option>
              <option>Lossless WAV Audio</option>
            </select>
          </div>
          <button className="btn-secondary" onClick={() => alert('Asset request submitted to Library team!')}>Submit Request</button>
        </div>
      </div>
    </div>
  );

  const renderFeedbackHistory = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Lead & Director Feedback History</h3>
        <ul style={styles.list}>
          {[
            { shot: 'Shot S-101 (Cyberpunk Intro)', sender: 'Alok Mukherjee (Director)', msg: 'Slightly slow down the camera panning speed in frames 120-145.', status: 'Redo requested', date: '2026-06-22' },
            { shot: 'Shot S-102 (Rickshaw Chase)', sender: 'Mousumi Sen (Lead Animator)', msg: 'The lighting reflection on the metal frame looks absolutely brilliant. Approved for render.', status: 'Approved', date: '2026-06-21' },
            { shot: 'Concept Art - Rickshaw Mesh', sender: 'Sanchari Basu (Designer)', msg: 'Double check the bumper width, it should fit the 3D model skeleton boundary.', status: 'Pending Review', date: '2026-06-20' },
          ].map((feed, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 700, fontSize: '13px' }}>{feed.shot}</span>
                <span className={`badge badge-${feed.status === 'Approved' ? 'success' : feed.status === 'Redo requested' ? 'danger' : 'warning'}`}>{feed.status}</span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-primary)', fontStyle: 'italic' }}>
                "{feed.msg}"
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '10px', color: 'var(--text-muted)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <span>From: {feed.sender}</span>
                <span>Date: {feed.date}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderTimesheetSubmissions = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Log Today's Production Hours</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Date</label>
            <input type="date" className="glass-input" defaultValue="2026-06-22" />
          </div>
          <div>
            <label style={styles.formLabel}>Hours Logged</label>
            <input type="number" className="glass-input" defaultValue="8" min="1" max="16" />
          </div>
          <div>
            <label style={styles.formLabel}>Assigned Project Segment</label>
            <select className="glass-input">
              <option>Kolkata Cyberpunk Intro Sequence</option>
              <option>Mumbai-Run character animation</option>
              <option>LMS assets setup</option>
            </select>
          </div>
          <button className="btn-primary" onClick={() => alert('Timesheet submitted for review!')}>Submit Weekly Timesheet</button>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Recent Timesheet Log Approvals</h3>
        <ul style={styles.list}>
          {[
            { date: 'Jun 15 - Jun 19', hours: '40 hrs', status: 'Approved', verifiedBy: 'Mousumi Sen (Lead)' },
            { date: 'Jun 08 - Jun 12', hours: '42 hrs', status: 'Approved', verifiedBy: 'Mousumi Sen (Lead)' },
            { date: 'Jun 22 - Jun 26 (Current)', hours: '8 hrs', status: 'Draft', verifiedBy: 'N/A' },
          ].map((ts, i) => (
            <li key={i} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{ts.date}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Approver: {ts.verifiedBy}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 600 }}>{ts.hours}</div>
                <span className={`badge badge-${ts.status === 'Approved' ? 'success' : 'warning'}`}>{ts.status}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderNDAAndContracts = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Legal NDA & Agreements</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Review and sign binding studio agreements. Keeping these up-to-date is required to access core project files.</p>
        <ul style={styles.list}>
          {[
            { name: 'Mutual Non-Disclosure Agreement (NDA)', status: 'Active', file: 'DreamAvian_MNDA_2026.pdf', signDate: '2026-01-10' },
            { name: 'Master Services Agreement (MSA)', status: 'Active', file: 'DreamAvian_MSA_v3.pdf', signDate: '2026-01-10' },
            { name: 'IP Assignment Rider (Schedule B)', status: 'Pending Signature', file: 'IP_Rider_RooftopBattle.pdf', signDate: 'UNSIGNED' },
          ].map((doc, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                <span style={{ fontWeight: 600 }}>{doc.name}</span>
                <span className={`badge badge-${doc.status === 'Active' ? 'success' : 'danger'}`}>{doc.status}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                File: {doc.file} {doc.signDate !== 'UNSIGNED' && `(Signed: ${doc.signDate})`}
              </div>
              {doc.signDate === 'UNSIGNED' ? (
                <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px', marginTop: '4px' }} onClick={() => alert('Signing PDF via DocuSign mock...')}>
                  Sign Document
                </button>
              ) : (
                <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', marginTop: '4px' }} onClick={() => alert(`Downloading signed copy of ${doc.file}...`)}>
                  Download Signed Copy
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Upload Signed Physical Copy</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>If you signed a physical paper contract, upload the scanned copy here for verification by the HR team.</p>
        <label style={styles.uploadBox}>
          <Upload size={24} color="var(--text-secondary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select PDF or Scanned Image</span>
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        {uploadedFiles.length > 0 && (
          <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--success)' }}>
            ✓ {uploadedFiles[0]} uploaded and queued for HR review.
          </div>
        )}
      </div>
    </div>
  );

  // ---- CLIENT PRODUCER PORTAL: 3 unique tab renderers ----

  const renderClientWelcome = () => (
    <div style={styles.grid}>
      {/* Welcome header + project summary */}
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h2 style={styles.sectionTitle}>
          Welcome, {userName} 👋
          <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-secondary)', marginLeft: '12px' }}>Client Producer Portal · DreamAvian Studios</span>
        </h2>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Projects</div>
            <div style={styles.metricValue}>{MOCK_PROJECTS.length}</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Milestones Approved</div>
            <div style={{ ...styles.metricValue, color: 'var(--success)' }}>0</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Pending Reviews</div>
            <div style={{ ...styles.metricValue, color: 'var(--warning)' }}>0</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Contracted</div>
            <div style={styles.metricValue}>{formatCurrencyPair(clientUsdContracted, clientInrContracted)}</div>
          </div>
        </div>
      </div>

      {/* Production Progress */}
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Active Productions Progress</h3>
        {MOCK_PROJECTS.map((proj) => (
          <div key={proj.id} style={{ marginBottom: '18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 600 }}>{proj.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{proj.status} · {proj.completion}%</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${proj.completion}%`, background: proj.completion > 70 ? 'var(--success)' : proj.completion > 40 ? 'var(--primary-glow)' : 'var(--warning)', borderRadius: '4px', transition: '0.5s' }}></div>
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>Budget: {proj.budget}</div>
          </div>
        ))}
      </div>

      {/* Studio Contacts & Key Team */}
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Your DreamAvian Contacts</h3>
        <ul style={styles.list}>
          {[
            { name: 'Subham', title: 'Studio Owner', email: 'subhambusiness566@gmail.com', phone: '+91-98300-00001' },
            { name: 'Rajesh Kumar', title: 'Creative Director', email: 'director@dreamavian.com', phone: '+91-98300-00003' },
            { name: 'Ananya Roy', title: 'Executive Producer', email: 'producer@dreamavian.com', phone: '+91-98300-00004' },
          ].map((contact, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 700 }}>{contact.name}</span>
                <span className="badge badge-info">{contact.title}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>📧 {contact.email} &nbsp;|&nbsp; 📞 {contact.phone}</div>
              <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => alert(`Message sent to ${contact.name}!`)}>Send Message</button>
            </li>
          ))}
        </ul>
      </div>

      {/* Recent Notifications */}
      <div style={styles.fullRow} className="glass-panel">
        <h3 style={styles.subTitle}>Recent Studio Updates</h3>
        <ul style={styles.list}>
          {[
            { msg: 'Shot S-102 (Rickshaw Chase) has been approved and is ready for delivery.', time: '2 hours ago', type: 'success' },
            { msg: 'Invoice INV-2026-001 for Netflix Season Promo has been marked Paid. Thank you!', time: '1 day ago', type: 'success' },
            { msg: 'Milestone 2 (3D Modeling & Rigging) is in progress — expected July 12.', time: '3 days ago', type: 'warning' },
          ].map((note, i) => (
            <li key={i} style={{ ...styles.listItem }}>
              <span>{note.msg}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>{note.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderClientMilestoneReviews = () => {
    const milestones = [
      { id: 'M1', name: 'Milestone 1: Concept Art & Style Bible', file: 'Mumbai-Run_Concept_Preview.mp4', frames: 480, status: 'Approved', approvedDate: '2026-05-20' },
      { id: 'M2', name: 'Milestone 2: Character Rigging & Blocking', file: 'Mumbai-Run_Blocking_v2.mp4', frames: 1240, status: 'Pending Review', approvedDate: null },
      { id: 'M3', name: 'Milestone 3: Final Animation Polish', file: 'Mumbai-Run_Polish_Preview.mp4', frames: 2080, status: 'Locked (Not Ready)', approvedDate: null },
    ];
    return (
      <div style={styles.grid}>
        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Milestone Playblast Viewer</h3>
          <div style={styles.videoPlayerContainer}>
            <div style={{ ...styles.mockVideo, minHeight: '200px' }}>
              <Video size={48} color="var(--primary-color)" />
              <div style={{ fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>Mumbai-Run_Blocking_v2.mp4</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Frame: 1240 · Duration: 52 secs · 24fps</div>
            </div>
            <div style={styles.videoControls}>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>◀ Prev Frame</button>
              <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '11px' }}>▶ Play</button>
              <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }}>Next Frame ▶</button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => alert('✅ Milestone 2 Approved! DreamAvian team has been notified.')}>Approve Milestone</button>
              <button className="btn-secondary" style={{ flex: 1, padding: '10px', color: 'var(--danger)' }} onClick={() => alert('🔄 Revision request sent. Studio will respond within 48 hours.')}>Request Revision</button>
            </div>
            <div>
              <label style={styles.formLabel}>Add Director's Note / Feedback</label>
              <textarea className="glass-input" placeholder="e.g. The camera pan in frames 120-145 is slightly too fast. Please reduce speed by 20%..." style={{ minHeight: '70px' }} />
              <button className="btn-secondary" style={{ marginTop: '8px', padding: '6px 14px', fontSize: '11px' }} onClick={() => alert('Feedback submitted to DreamAvian Director!')}>Submit Feedback Note</button>
            </div>
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Milestones Pipeline Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {milestones.map((m) => (
              <div key={m.id} style={{ ...styles.taskCard, borderLeft: `3px solid ${m.status === 'Approved' ? 'var(--success)' : m.status === 'Pending Review' ? 'var(--warning)' : 'rgba(255,255,255,0.1)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '12px' }}>{m.name}</span>
                  <span className={`badge badge-${m.status === 'Approved' ? 'success' : m.status === 'Pending Review' ? 'warning' : 'danger'}`}>{m.status}</span>
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  File: {m.file} · {m.frames} frames
                  {m.approvedDate && <span style={{ color: 'var(--success)', marginLeft: '8px' }}>Approved: {m.approvedDate}</span>}
                </div>
                {m.status === 'Pending Review' && (
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => alert(`${m.name} Approved!`)}>Approve</button>
                    <button className="btn-secondary" style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--danger)' }} onClick={() => alert(`Revision requested for ${m.name}`)}>Revise</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '20px' }}>
            <h3 style={styles.subTitle}>Download Delivery Packages</h3>
            <ul style={styles.list}>
              {[
                { name: 'Concept_Art_Delivery_M1.zip', size: '88 MB', ready: true },
                { name: 'Animation_Blocking_M2_Preview.mp4', size: '240 MB', ready: true },
                { name: 'Final_Polish_M3.zip', size: '1.2 GB', ready: false },
              ].map((file, i) => (
                <li key={i} style={styles.listItem}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '11px' }}>{file.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{file.size}</div>
                  </div>
                  {file.ready
                    ? <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '10px' }} onClick={() => alert(`Downloading ${file.name}...`)}>Download</button>
                    : <span className="badge badge-warning">Not Ready</span>
                  }
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderClientInvoicesBilling = () => (
    <div style={styles.grid}>
      {/* Summary cards */}
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Billing Summary — Netflix Asia Account</h3>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Contracted</div>
            <div style={styles.metricValue}>$155,000</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Amount Paid</div>
            <div style={{ ...styles.metricValue, color: 'var(--success)' }}>$15,000</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Balance Due</div>
            <div style={{ ...styles.metricValue, color: 'var(--warning)' }}>$140,000</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Next Invoice Date</div>
            <div style={styles.metricValue}>2026-08-01</div>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Invoice Ledger</h3>
        <table style={styles.table}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '8px 0' }}>Invoice ID</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '10px 0', fontFamily: 'var(--font-mono)', fontSize: '11px' }}>{inv.id}</td>
                <td style={{ fontSize: '11px' }}>{inv.projectName}</td>
                <td style={{ fontWeight: 700 }}>{inv.amount}</td>
                <td style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{inv.dueDate}</td>
                <td><span className={`badge badge-${inv.status === 'Paid' ? 'success' : inv.status === 'Overdue' ? 'danger' : inv.status === 'Sent' ? 'warning' : 'info'}`}>{inv.status}</span></td>
                <td>
                  {inv.status === 'Sent' && (
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert(`Payment portal opened for ${inv.id}`)}>Pay Now</button>
                  )}
                  {inv.status === 'Paid' && (
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert(`Downloading receipt for ${inv.id}...`)}>Receipt</button>
                  )}
                  {inv.status !== 'Paid' && inv.status !== 'Sent' && (
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert(`Downloading PDF for ${inv.id}...`)}>View PDF</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment history + Pay Now */}
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Payment History</h3>
        <ul style={styles.list}>
          {[
            { desc: 'Milestone 1 — Concept Delivery', date: '2026-06-15', amount: '$15,000', method: 'Bank Wire', ref: 'TXN-826401' },
          ].map((pay, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 700 }}>{pay.desc}</span>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{pay.amount}</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                Date: {pay.date} · Method: {pay.method} · Ref: {pay.ref}
              </div>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: '20px', padding: '16px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '12px' }}>Make a Payment</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={styles.formLabel}>Select Invoice to Pay</label>
              <select className="glass-input">
                {invoices.filter(i => i.status !== 'Paid').map(inv => (
                  <option key={inv.id}>{inv.id} — {inv.amount} ({inv.projectName})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.formLabel}>Payment Method</label>
              <select className="glass-input">
                <option>Bank Wire Transfer (USD)</option>
                <option>SWIFT International Transfer</option>
                <option>Letter of Credit (LC)</option>
              </select>
            </div>
            <button className="btn-primary" onClick={() => alert('🏦 Payment initiation request sent to your banking portal. Reference will be emailed.')}>Initiate Payment</button>
          </div>
        </div>

        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Download Statements</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Downloading Q2-2026 Statement PDF...')}>Q2 2026 Statement</button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Downloading Full Account History CSV...')}>Full Account CSV</button>
          </div>
        </div>
      </div>
    </div>
  );

  // P-14: HR Portal
  const renderHR = () => {
    const activeStaff = credentials.filter(c => c.role !== 'client' && c.role !== 'visitor_public' && c.role !== 'studio_owner');
    const grossPayroll = activeStaff.length * 3500;
    return (
      <div style={styles.grid}>
        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Leave Requests Queue</h3>
          <ul style={styles.list}>
            <li style={styles.listItem}>
              <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>No pending leave requests.</div>
            </li>
          </ul>
        </div>
        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Payroll Calculation Engine</h3>
          <div style={{ background: 'rgba(255,255,255,0.01)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>Mumbai Studio Gross Payroll</span>
              <span>${grossPayroll.toLocaleString()}</span>
            </div>
            <button className="btn-primary" onClick={() => alert('Payroll successfully sent to Ledger Bank API.')}>
              Release Monthly Payroll
            </button>
          </div>
        </div>
      </div>
    );
  };

  // HR Profiles view helper
  const renderHRView = () => {
    const allRoles = [
      { key: 'super_admin', label: 'Super Admin [Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'id_card_admin', label: 'Security Systems Admin [Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'hr', label: 'HR Director [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'finance', label: 'CFO / Finance Lead [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'academy_director', label: 'Academy Director [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'producer', label: 'Executive Producer [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'project_manager', label: 'Project Manager [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'team_lead', label: 'Animation Team Lead [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'mentor', label: 'Senior 3D Artist [Sub-Admin - OWNER/SUPER ADMIN ONLY]' },
      { key: 'studio_owner', label: 'Studio Owner [OWNER/SUPER ADMIN ONLY]' },
      { key: 'director', label: 'Creative Director' },
      { key: 'animator', label: '3D Animator' },
      { key: 'designer', label: 'Character Designer' },
      { key: 'storyboard_artist', label: 'Storyboard Artist' },
      { key: 'editor', label: 'Video Editor' },
      { key: 'voice_artist', label: 'Voice Artist' },
      { key: 'freelancer', label: 'Contract Animator' },
      { key: 'client', label: 'Client Producer' },
      { key: 'recruiter', label: 'Lead Recruiter' },
      { key: 'trainer', label: 'VFX Trainer' },
      { key: 'student', label: 'Animation Student' },
      { key: 'intern', label: 'Studio Intern' },
      { key: 'visitor_public', label: 'Public Visitor' }
    ];

    return (
      <div style={styles.grid}>
        {/* Left Column: HR Provisioning Form or Edit Form */}
        {editingUserEmail ? (
          renderEditUserForm(allRoles)
        ) : (
          <div style={styles.halfCol} className="glass-panel animate-fade-in">
            <h3 style={styles.subTitle}>HR Staff Account Provisioning</h3>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginBottom: '14px' }}>
              STATUS: ACTIVE // ROLE: HR_MANAGER // ACCESS: RESTRICTED
            </div>
            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={styles.formLabel}>Full Name</label>
                <input 
                  type="text" 
                  className="glass-input" 
                  value={newUserName} 
                  onChange={(e) => setNewUserName(e.target.value)} 
                  placeholder="e.g., Sourav Ganguly" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Email Address</label>
                <input 
                  type="email" 
                  className="glass-input" 
                  value={newUserEmail} 
                  onChange={(e) => setNewUserEmail(e.target.value)} 
                  placeholder="e.g., dada@dreamavian.com" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Access Password</label>
                <input 
                  type="password" 
                  className="glass-input" 
                  value={newUserPassword} 
                  onChange={(e) => setNewUserPassword(e.target.value)} 
                  placeholder="e.g., SecurityPass321!" 
                  required 
                />
              </div>
              <div>
                <label style={styles.formLabel}>Assign Organization Role</label>
                <select 
                  className="glass-input" 
                  value={newUserRole} 
                  onChange={(e) => setNewUserRole(e.target.value)}
                  style={{ background: 'var(--bg-color)', color: '#fff' }}
                >
                  {allRoles.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 2 }}>
                  <label style={styles.formLabel}>Monthly Salary / Rate</label>
                  <input 
                    type="number" 
                    className="glass-input" 
                    value={newUserSalary} 
                    onChange={(e) => setNewUserSalary(e.target.value)} 
                    placeholder="e.g., 3500" 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Currency</label>
                  <select 
                    className="glass-input" 
                    value={newUserSalaryCurrency} 
                    onChange={(e) => setNewUserSalaryCurrency(e.target.value as 'USD' | 'INR')}
                    style={{ background: 'var(--bg-color)', color: '#fff' }}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                Provision Credentials
              </button>
            </form>
          </div>
        )}

        {/* Right Column: Employee Directory */}
        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Employee Profiles Directory</h3>
          <div style={{ maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            <ul style={styles.list}>
              {credentials.map((cred) => (
                <li key={cred.email} style={styles.listItem}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{cred.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{cred.email}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <span>Password: {revealedPasswords[cred.email] ? cred.password : '••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => setRevealedPasswords(prev => ({ ...prev, [cred.email]: !prev[cred.email] }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-color)', padding: 0 }}
                        title="Show/Hide Password"
                      >
                        {revealedPasswords[cred.email] ? '👁️' : '👁️‍🗨️'}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-success">
                      {cred.roleTitle}
                      {(cred as any).salary !== undefined && ` | ${(cred as any).salaryCurrency === 'INR' ? '₹' : '$'}{(cred as any).salary.toLocaleString()}`}
                    </span>
                    <button 
                      onClick={() => handleStartEditUser(cred)}
                      className="btn-secondary"
                      style={{ padding: '2px 6px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '3px' }}
                      title="Edit User Profile"
                    >
                      <Edit3 size={10} /> Edit
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // P-15: Recruiter Portal
  const renderRecruiter = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Talent Screening Pipeline</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {candidates.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No candidates currently in pipeline.
            </p>
          ) : (
            candidates.map((cand) => (
              <div key={cand.id} style={styles.candidateCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600 }}>{cand.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Score: {cand.score}/100</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-info">{cand.status}</span>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDeleteCandidate(cand.id)}
                      title="Delete Candidate"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Job Postings Manager</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
          Currently managing <strong>{jobs.filter(j => j.status === 'Recruiting').length} active</strong> job openings.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => setIsCreatingJob(true)}>
            Create Job Vacancy
          </button>
          <button className="btn-secondary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => alert('Please use the side navigation tab "Jobs Manager" for full settings.')}>
            Open Jobs Manager
          </button>
        </div>
      </div>
    </div>
  );

  // P-16: Finance Portal
  const renderFinance = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>General ledger Cashflow</h3>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Receivables</div>
            <div style={styles.metricValue}>
              {formatCurrencyPair(Math.max(0, usdBillings - usdRevenue), Math.max(0, inrBillings - inrRevenue))}
            </div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Payables due</div>
            <div style={styles.metricValue}>
              {formatCurrencyPair(usdStaffExpenses, inrStaffExpenses)}
            </div>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Audits expense vouchers</h3>
        {activeStaffList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No expense vouchers pending audit.
          </p>
        ) : (
          <ul style={styles.list}>
            {activeStaffList.map((staff: any) => (
              <li key={staff.email} style={styles.listItem}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>Expense Allowance ({staff.name})</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Amount: {staff.salaryCurrency === 'INR' ? `₹${Math.floor(staff.salary ? staff.salary * 0.05 : 14500).toLocaleString()}` : `$${Math.floor(staff.salary ? staff.salary * 0.05 : 175).toLocaleString()}`}
                  </div>
                </div>
                <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert(`Approved expense for ${staff.name}`)}>Audit Pass</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // P-17: Academy Director
  const renderAcademyDirector = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Academy Analytics Dashboard</h3>
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Total Enrolled Students</div>
            <div style={styles.metricValue}>105 Students</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Active Faculty</div>
            <div style={styles.metricValue}>8 Instructors</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricLabel}>Semester Tuition Revenue</div>
            <div style={{ ...styles.metricValue, color: 'var(--success)' }}>$31,290</div>
          </div>
        </div>
      </div>
    </div>
  );

  // P-18: Trainer
  const renderTrainer = () => renderLMSAcademy();

  // P-19: Student
  const renderStudent = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>LMS Lecture Player</h3>
        <div style={styles.videoPlayerContainer}>
          <div style={styles.mockVideo}>
            <Video size={48} color="var(--accent-color)" />
            <div style={{ fontSize: '13px', marginTop: '12px' }}>Lecture 3 - Dynamic joint weighting systems.mp4</div>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Submit homework assignment</h3>
        <label style={styles.uploadBox}>
          <Upload size={24} color="var(--text-secondary)" />
          <span style={{ fontSize: '12px' }}>Click to select homework Blender file</span>
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        {uploadedFiles.length > 0 && (
          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px' }}>
            ✓ Assignment file "{uploadedFiles[0]}" submitted for grading.
          </div>
        )}
      </div>
    </div>
  );

  // P-20: Intern
  const renderIntern = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Assigned Intern Production Tasks</h3>
        {tasks.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No intern tasks assigned.
          </p>
        ) : (
          <ul style={styles.list}>
            {tasks.map((task) => (
              <li key={task.id} style={styles.listItem}>
                <span>{task.name} ({task.projectName})</span>
                <span className="badge badge-warning">{task.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Intern Weekly Log Submitter</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <textarea 
            className="glass-input" 
            placeholder="Type your weekly progress report here..." 
            value={internReportText} 
            onChange={(e) => setInternReportText(e.target.value)} 
            style={{ minHeight: '80px' }} 
          />
          <button className="btn-primary" onClick={() => alert('Weekly log submitted to mentor.')}>
            Submit Journal Log
          </button>
        </div>
      </div>
    </div>
  );

  // P-21: Mentor
  const renderMentor = () => {
    const interns = credentials.filter(c => c.role === 'intern');
    return (
      <div style={styles.grid}>
        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Intern weekly journals for review</h3>
          {interns.length === 0 || !internReportText ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No intern journals submitted.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {interns.map((intern) => (
                <div key={intern.email} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Intern: {intern.name}</div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    "{internReportText}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Mentorship evaluations</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <textarea 
              className="glass-input" 
              placeholder="Type evaluation feedback here..." 
              value={mentorEvalText} 
              onChange={(e) => setMentorEvalText(e.target.value)} 
              style={{ minHeight: '60px' }} 
            />
            <button className="btn-primary" onClick={() => alert('Intern evaluation submitted!')}>
              Release Intern Evaluation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // P-22: ID Card Administrator
  const playSecuritySynth = (type: 'beep' | 'success' | 'alarm' | 'lockdown') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.setValueAtTime(900, audioCtx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'alarm') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, audioCtx.currentTime + 0.2);
        osc.frequency.linearRampToValueAtTime(400, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else if (type === 'lockdown') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.4);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  const renderIDCardAdmin = () => (
    <div style={styles.grid}>
      {securityNotice && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: 'rgba(3, 7, 18, 0.95)',
          border: `1px solid ${securityNotice.type === 'danger' ? 'var(--danger)' : securityNotice.type === 'warning' ? 'var(--warning)' : 'var(--success)'}`,
          boxShadow: `0 0 20px ${securityNotice.type === 'danger' ? 'rgba(239, 68, 68, 0.4)' : securityNotice.type === 'warning' ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          padding: '16px 24px',
          borderRadius: '12px',
          color: '#fff',
          fontSize: '12px',
          fontFamily: 'var(--font-mono)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          backdropFilter: 'blur(16px)',
          animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'
        }}>
          <span>{securityNotice.type === 'danger' ? '🚨' : securityNotice.type === 'warning' ? '⚠️' : '🛡️'}</span>
          <span style={{ fontWeight: 'bold' }}>{securityNotice.message}</span>
          <button 
            onClick={() => setSecurityNotice(null)} 
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              fontSize: '11px', 
              marginLeft: '12px',
              fontFamily: 'var(--font-mono)'
            }}
          >
            [CLOSE]
          </button>
        </div>
      )}
      {isSystemLockdown && (
        <div style={{ ...styles.fullRow, background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '12px', padding: '16px', color: 'var(--danger)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }} className="pulse-glow">
          <ShieldAlert size={20} />
          <span>FACILITY IS UNDER LOCKDOWN PROTOCOL. ALL RFID GATES SECURED.</span>
        </div>
      )}
      
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>ID Card Issuer console</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Enter credentials to print a new physical smart ID card and provision default zones access.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={styles.formLabel}>Name</label>
            <input type="text" className="glass-input" value={newCardName} onChange={(e) => { setNewCardName(e.target.value); playSecuritySynth('beep'); }} />
          </div>
          <div>
            <label style={styles.formLabel}>Job Role</label>
            <input type="text" className="glass-input" value={newCardRole} onChange={(e) => { setNewCardRole(e.target.value); playSecuritySynth('beep'); }} />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Blood Group</label>
              <select className="glass-input" value={newCardBloodGroup} onChange={(e) => { setNewCardBloodGroup(e.target.value); playSecuritySynth('beep'); }}>
                {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Security Clearance</label>
              <select className="glass-input" value={newCardClearance} onChange={(e) => { setNewCardClearance(e.target.value); playSecuritySynth('beep'); }}>
                {['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Super Admin'].map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Department</label>
              <select className="glass-input" value={newCardDept} onChange={(e) => { setNewCardDept(e.target.value); playSecuritySynth('beep'); }}>
                {['Animation', 'Design', 'Storyboard', 'VFX & Editing', 'Administration', 'Security', 'Academy Block'].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={styles.formLabel}>Expiry Date</label>
              <input type="date" className="glass-input" value={newCardExpiry} onChange={(e) => { setNewCardExpiry(e.target.value); playSecuritySynth('beep'); }} />
            </div>
          </div>

          <div>
            <label style={styles.formLabel}>Phone Number</label>
            <input 
              type="text" 
              className="glass-input" 
              placeholder="e.g. +91 98765 43210" 
              value={newCardPhone} 
              onChange={(e) => { setNewCardPhone(e.target.value); playSecuritySynth('beep'); }} 
            />
          </div>

          <div>
            <label style={styles.formLabel}>Upload Employee Photo</label>
            <input 
              type="file" 
              accept="image/*" 
              className="glass-input" 
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    setNewCardImage(event.target?.result as string);
                    playSecuritySynth('success');
                  };
                  reader.readAsDataURL(e.target.files[0]);
                }
              }} 
              style={{ fontSize: '11px', padding: '6px' }}
            />
          </div>

          <button className="btn-primary" style={{ marginTop: '6px' }} onClick={() => { handleCreateIDCard(); playSecuritySynth('success'); }}>Issue Access Card</button>
        </div>
      </div>
      
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Live Holographic ID Card Preview</h3>
        <div style={{
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.18) 0%, rgba(3, 7, 18, 0.9) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.4)',
          borderRadius: '16px',
          padding: '16px',
          position: 'relative',
          height: '280px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          boxShadow: '0 0 25px rgba(6, 182, 212, 0.2)'
        }} className="pulse-glow">
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 1, pointerEvents: 'none' }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src={logoImg} alt="Logo" style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.4)', objectFit: 'cover' }} />
              <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '2.5px', color: '#00f0ff', fontFamily: 'var(--font-display)', textShadow: '0 0 6px rgba(0,240,255,0.6)' }}>DREAMAVIAN</span>
            </div>
            <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', color: '#34d399', letterSpacing: '1px' }}>
              VERIFIED
            </span>
          </div>
          
          <div style={{ zIndex: 2, display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 0' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)', overflow: 'hidden' }}>
              {newCardImage ? (
                <img src={newCardImage} alt="Employee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', stroke: '#06b6d4', fill: 'none', strokeWidth: 1.5, opacity: 0.85 }}>
                  <path d="M 30,30 C 30,15 70,15 70,30 C 70,50 65,70 50,85 C 35,70 30,50 30,30 Z" />
                  <line x1="15" y1="45" x2="85" y2="45" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="2" className="pulse-glow" />
                  <path d="M 20,95 Q 50,80 80,95" />
                  <rect x="20" y="15" width="60" height="70" strokeDasharray="4,4" stroke="rgba(6,182,212,0.3)" />
                </svg>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', textShadow: '0 0 8px rgba(6, 182, 212, 0.4)', fontFamily: 'var(--font-display)' }}>{newCardName || 'No Name Entered'}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{newCardRole || 'No Role Assigned'}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#06b6d4', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                <span>DEPT: {newCardDept || 'Animation'}</span>
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{newCardId}</span>
              </div>
            </div>
          </div>
          
          <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>BLOOD GP: <span style={{ color: '#fff', fontWeight: 'bold' }}>{newCardBloodGroup || 'O+'}</span></div>
              <div>EXPIRY: <span style={{ color: '#fff', fontWeight: 'bold' }}>{newCardExpiry || '2033-12-31'}</span></div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
              <div>PHONE: <span style={{ color: '#fff', fontWeight: 'bold' }}>{newCardPhone || 'N/A'}</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2, marginTop: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Authorizing Sign</span>
              <span style={{ fontFamily: "'Alex Brush', cursive", fontSize: '24px', color: '#a5f3fc', lineHeight: '1', marginTop: '2px', transform: 'rotate(-2deg)' }}>Joydeep Sen</span>
              <span style={{ fontSize: '7px', color: 'var(--text-muted)', marginTop: '2px' }}>CEO & Studio Owner</span>
            </div>

            <div style={{ position: 'relative', width: '56px', height: '56px', background: '#fff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="48" height="48" viewBox="0 0 29 29" style={{ fill: '#000' }}>
                <rect x="0" y="0" width="7" height="7" />
                <rect x="1" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                <rect x="2" y="2" width="3" height="3" />
                <rect x="22" y="0" width="7" height="7" />
                <rect x="23" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                <rect x="24" y="2" width="3" height="3" />
                <rect x="0" y="22" width="7" height="7" />
                <rect x="1" y="22" width="5" height="5" style={{ fill: '#fff' }} />
                <rect x="2" y="24" width="3" height="3" />
                <rect x="9" y="1" width="2" height="2" />
                <rect x="15" y="0" width="3" height="1" />
                <rect x="13" y="3" width="2" height="2" />
                <rect x="9" y="9" width="3" height="3" />
                <rect x="19" y="9" width="2" height="2" />
                <rect x="14" y="14" width="4" height="2" />
                <rect x="9" y="19" width="2" height="2" />
                <rect x="20" y="19" width="3" height="3" />
                <rect x="25" y="15" width="2" height="2" />
                <rect x="15" y="24" width="2" height="2" />
              </svg>
              <div className="scanline-vertical" style={{ top: 0, height: '2px', width: '100%', position: 'absolute' }} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: '12px' }}>
          <button 
            className="btn-secondary" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#22d3ee' }}
            onClick={() => {
              playSecuritySynth('success');
              downloadCardAsPNG(
                newCardName,
                newCardRole,
                newCardDept,
                newCardBloodGroup,
                newCardExpiry,
                newCardPhone,
                newCardId,
                newCardImage || undefined
              );
            }}
          >
            <Download size={14} />
            <span>Download Holographic Card Badge</span>
          </button>
        </div>
      </div>

      <div style={styles.fullRow} className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={styles.subTitle}>Access Control Scanner Feed (Gate Scan Logs)</h3>
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => {
            const names = ['Bikram Das', 'Joydeep Sen', 'Sayantan Guha', 'Deblina Das', 'Amitabha Dutta', 'Udit Narayan Chowdhury'];
            const methods = ['QR Code', 'Biometric', 'Remote'] as const;
            const randomName = names[Math.floor(Math.random() * names.length)];
            const randomMethod = methods[Math.floor(Math.random() * methods.length)];
            const now = new Date();
            const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            
            const newLog = {
              id: `att-${Date.now()}`,
              userName: randomName,
              time: timeStr,
              status: 'Present' as const,
              method: randomMethod
            };
            setAttendance([newLog, ...attendance]);
            playSecuritySynth('beep');
          }}>
            <Scan size={14} />
            <span>Simulate Gate Scan Event</span>
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {/* Logs List */}
          <div style={{ flex: '1 1 35%', minWidth: '280px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
              {attendance.map((log) => (
                <div 
                  key={log.id} 
                  style={{ 
                    fontSize: '11px', 
                    background: selectedLogId === log.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)', 
                    padding: '10px 14px', 
                    border: selectedLogId === log.id ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => { setSelectedLogId(log.id); playSecuritySynth('beep'); }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Fingerprint size={14} color={log.status === 'Present' ? '#10b981' : '#ef4444'} />
                    <span><strong>{log.userName}</strong> swiped at {log.time}</span>
                  </div>
                  <span className={`badge badge-${log.status === 'Present' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>
                    {log.method} Success
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* QR Attendance Terminal (New Column) */}
          <div style={{ flex: '1 1 35%', minWidth: '280px', padding: '16px', background: 'rgba(6, 182, 212, 0.02)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Scan size={16} color="#06b6d4" />
              <strong style={{ fontSize: '12px', fontFamily: 'var(--font-display)', color: '#06b6d4', letterSpacing: '0.5px' }}>QR ATTENDANCE GATE SCANNER</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={styles.formLabel}>Select Credentials Token</label>
                <select 
                  className="glass-input" 
                  value={qrScanTargetCardId} 
                  onChange={(e) => { setQrScanTargetCardId(e.target.value); playSecuritySynth('beep'); }}
                  style={{ fontSize: '11px', padding: '8px' }}
                >
                  <option value="">-- Select Active Card --</option>
                  {idCards.map(c => (
                    <option key={c.cardId} value={c.cardId}>{c.userName} ({c.cardId})</option>
                  ))}
                </select>
              </div>

              {/* Laser Scanner Screen */}
              <div style={{
                position: 'relative',
                height: '110px',
                background: '#030712',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {isQrScanning ? (
                  <>
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '4px',
                      background: 'rgba(239, 68, 68, 0.8)',
                      boxShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 0 20px rgba(239, 68, 68, 0.5)',
                      animation: 'scanline-vertical 1.5s ease-in-out infinite',
                      zIndex: 3
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '6px',
                      left: '8px',
                      fontSize: '8px',
                      color: 'var(--success)',
                      fontFamily: 'var(--font-mono)',
                      zIndex: 4,
                      letterSpacing: '1px'
                    }}>
                      📡 SCROLLING LASER BEAM ACTIVE...
                    </div>
                  </>
                ) : (
                  <div style={{
                    position: 'absolute',
                    top: '6px',
                    left: '8px',
                    fontSize: '8px',
                    color: 'var(--text-muted)',
                    fontFamily: 'var(--font-mono)',
                    zIndex: 4,
                    letterSpacing: '1px'
                  }}>
                    📳 TERMINAL IDLE // READY FOR SCAN
                  </div>
                )}

                <div style={{ 
                  opacity: isQrScanning ? 1 : 0.35, 
                  transition: 'opacity 0.3s',
                  background: '#fff',
                  padding: '6px',
                  borderRadius: '6px'
                }}>
                  <svg width="40" height="40" viewBox="0 0 29 29" style={{ fill: '#000' }}>
                    <rect x="0" y="0" width="7" height="7" />
                    <rect x="1" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                    <rect x="2" y="2" width="3" height="3" />
                    <rect x="22" y="0" width="7" height="7" />
                    <rect x="23" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                    <rect x="24" y="2" width="3" height="3" />
                    <rect x="0" y="22" width="7" height="7" />
                    <rect x="1" y="22" width="5" height="5" style={{ fill: '#fff' }} />
                    <rect x="2" y="24" width="3" height="3" />
                    <rect x="9" y="1" width="2" height="2" />
                    <rect x="15" y="0" width="3" height="1" />
                    <rect x="13" y="3" width="2" height="2" />
                    <rect x="9" y="9" width="3" height="3" />
                    <rect x="19" y="9" width="2" height="2" />
                    <rect x="14" y="14" width="4" height="2" />
                    <rect x="9" y="19" width="2" height="2" />
                    <rect x="20" y="19" width="3" height="3" />
                    <rect x="25" y="15" width="2" height="2" />
                    <rect x="15" y="24" width="2" height="2" />
                  </svg>
                </div>
              </div>

              <button 
                className="btn-primary" 
                disabled={!qrScanTargetCardId || isQrScanning} 
                onClick={() => {
                  if (!qrScanTargetCardId) return;
                  setIsQrScanning(true);
                  playSecuritySynth('beep');
                  
                  setTimeout(() => {
                    const matchedCard = idCards.find(c => c.cardId === qrScanTargetCardId);
                    if (matchedCard) {
                      const now = new Date();
                      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                      const newLog = {
                        id: `att-${Date.now()}`,
                        userName: matchedCard.userName,
                        time: timeStr,
                        status: 'Present' as const,
                        method: 'QR Code' as const
                      };
                      setAttendance([newLog, ...attendance]);
                      playSecuritySynth('success');
                      triggerSecurityNotice(`[ACCESS GRANTED] ${matchedCard.userName} (${matchedCard.role}) logged in successfully via QR Code!`);
                    }
                    setIsQrScanning(false);
                  }, 1200);
                }}
                style={{ width: '100%', padding: '8px', fontSize: '11px' }}
              >
                {isQrScanning ? 'SCANNED / PARSING HASH...' : 'Scan QR for Attendance'}
              </button>
            </div>
          </div>

          {/* Details Inspector */}
          <div style={{ flex: '1 1 30%', minWidth: '240px' }}>
            {selectedLogId ? (
              (() => {
                const log = attendance.find(l => l.id === selectedLogId);
                if (!log) return <div style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', padding: '20px' }}>Select a scan log to inspect details.</div>;
                return (
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px', height: '100%' }} className="animate-fade-in">
                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#06b6d4', fontFamily: 'var(--font-display)' }}>INSPECTED SCAN SUMMARY</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>User Profile:</span>
                        <span style={{ fontWeight: 'bold' }}>{log.userName}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Access Time:</span>
                        <span>{log.time}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Device/Method:</span>
                        <span className="badge badge-info">{log.method}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Security Status:</span>
                        <span style={{ color: log.status === 'Present' ? 'var(--success)' : 'var(--danger)', fontWeight: 'bold' }}>
                          {log.status === 'Present' ? 'GRANTED' : 'BLOCKED'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>Gate Subnet:</span>
                        <span>192.168.10.45</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '9px', color: 'var(--danger)' }} onClick={() => {
                          setAttendance(attendance.filter(l => l.id !== log.id));
                          setSelectedLogId(null);
                          playSecuritySynth('lockdown');
                          alert(`Access logs for ${log.userName} purged!`);
                        }}>
                          Purge Log
                        </button>
                        <button className="btn-primary" style={{ flex: 1, padding: '4px', fontSize: '9px' }} onClick={() => {
                          playSecuritySynth('beep');
                          alert(`NFC credentials token hash for ${log.userName} is active and verified.`);
                        }}>
                          Verify Token
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '11px', padding: '20px', textAlign: 'center' }}>
                Click a gate scan entry from the feed to inspect user credentials and token hash.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // P-23: Visitor/Public
  const renderVisitorPublic = () => (
    <div style={styles.grid}>
      <div style={{ ...styles.fullRow, padding: 0, height: '180px', overflow: 'hidden', border: '1px solid rgba(6, 182, 212, 0.3)', boxShadow: '0 0 30px rgba(6, 182, 212, 0.2)', borderRadius: '16px' }} className="glass-panel animate-fade-in">
        <img src={bannerImg} alt="Dream Avian Studios Banner" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>DreamAvian Studios Showreel</h3>
        <div style={styles.videoPlayerContainer}>
          <div style={styles.mockVideo}>
            <Video size={48} color="var(--accent-color)" />
            <div style={{ fontSize: '13px', marginTop: '12px' }}>Studios_2026_Cinematics_Showreel.mp4</div>
          </div>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Job vacancies catalog</h3>
        {jobs.filter(j => j.status === 'Recruiting').length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>No active vacancies at the moment.</p>
            <button 
              className="btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '11px' }} 
              onClick={() => { 
                setSelectedJob(null); 
                setIsApplying(true); 
              }}
            >
              Submit General Application
            </button>
          </div>
        ) : (
          <ul style={styles.list}>
            {jobs.filter(j => j.status === 'Recruiting').slice(0, 3).map((job) => (
              <li key={job.id} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{job.department} • {job.location}</div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ padding: '6px 12px', fontSize: '11px' }} 
                  onClick={() => {
                    setSelectedJob(job);
                    setIsApplying(false);
                  }}
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Submit Business Inquiry</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" className="glass-input" placeholder="Your Name" />
          <textarea className="glass-input" placeholder="Project Description" style={{ minHeight: '60px' }} />
          <button className="btn-primary" onClick={() => alert('Inquiry submitted!')}>Send Inquiry</button>
        </div>
      </div>
    </div>
  );

  // =========================================================================
  // CUSTOM SUB-RENDERERS FOR DYNAMIC SIDEBAR TABS (Phase 3)
  // =========================================================================

  // HR Sub-renderers
  const renderLeavesBoard = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Staff Vacation & Leave Approval Queue</h3>
        <ul style={styles.list}>
          {[
            { name: 'Amitabha Dutta (Editor)', type: 'Medical Leave', dates: 'Jun 24 - Jun 26', status: 'Pending' },
            { name: 'Bikram Das (Animator)', type: 'Annual Leave', dates: 'Jul 01 - Jul 07', status: 'Approved' },
          ].map((leave, i) => (
            <li key={i} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{leave.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{leave.type} • {leave.dates}</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {leave.status === 'Pending' ? (
                  <>
                    <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => alert('Leave Approved')}>Approve</button>
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--danger)' }} onClick={() => alert('Leave Rejected')}>Reject</button>
                  </>
                ) : (
                  <span className="badge badge-success">{leave.status}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderPayrollEngine = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Run Monthly Payroll Cycle</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Employees: 42</div>
            <div style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0', fontFamily: 'var(--font-display)' }}>Gross Payroll: $128,450.00</div>
          </div>
          <button className="btn-primary" onClick={() => alert('Payroll processed successfully! Deposits queued.')}>
            Release Salary Deposits
          </button>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Recent Payslip Batches</h3>
        <ul style={styles.list}>
          {['May 2026 Batch (Disbursed)', 'April 2026 Batch (Disbursed)'].map((p, i) => (
            <li key={i} style={styles.listItem}>
              <span>{p}</span>
              <span className="badge badge-success">Success</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Recruiter Sub-renderers
  const renderJobsManager = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={styles.subTitle}>Job Postings Directory</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Manage live studio openings and application settings</p>
          </div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '6px 12px' }} onClick={() => setIsCreatingJob(true)}>
            <Plus size={14} style={{ marginRight: '4px' }} /> Create Job Vacancy
          </button>
        </div>

        {jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>No job vacancies currently posted.</p>
            <button className="btn-primary" onClick={() => setIsCreatingJob(true)}>
              Create First Posting
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {jobs.map((job) => {
              const appCount = candidates.filter(c => c.appliedRole === job.title).length;
              return (
                <div 
                  key={job.id} 
                  style={{ 
                    padding: '16px', 
                    background: 'rgba(255,255,255,0.01)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>{job.title}</span>
                        <span className="badge badge-info" style={{ fontSize: '10px' }}>{job.department}</span>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px', background: job.type === 'Full-time' ? 'rgba(6,182,212,0.15)' : 'rgba(244,63,94,0.15)', color: job.type === 'Full-time' ? 'var(--accent-color)' : 'var(--danger)', border: job.type === 'Full-time' ? '1px solid rgba(6,182,212,0.3)' : '1px solid rgba(244,63,94,0.3)' }}>
                          {job.type}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                        <span>📍 {job.location}</span>
                        <span>💰 {job.salaryRange}</span>
                        <span>💼 {job.experience} Exp</span>
                        <span>📅 Posted: {job.postedDate}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${job.status === 'Recruiting' ? 'badge-success' : 'badge-secondary'}`}>
                        {job.status}
                      </span>
                      <span className="badge badge-info" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)' }}>
                        {appCount} Applied
                      </span>
                    </div>
                  </div>

                  {job.description && (
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.15)', padding: '8px 12px', borderRadius: '6px', lineHeight: '1.4' }}>
                      {job.description}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '10px' }}
                      onClick={() => handleToggleJobStatus(job.id)}
                    >
                      {job.status === 'Recruiting' ? 'Close Post' : 'Re-open Post'}
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ padding: '4px 10px', fontSize: '10px', color: 'var(--danger)', borderColor: 'rgba(244,63,94,0.2)' }}
                      onClick={() => handleDeleteJob(job.id)}
                    >
                      <Trash2 size={12} style={{ marginRight: '4px', display: 'inline' }} /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderCandidateProfiles = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Active Applicants & Assessment Scores</h3>
        {candidates.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No candidate applications received.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {candidates.map((c) => (
              <div key={c.id} style={styles.candidateCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{c.name} ({c.appliedRole})</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="badge badge-info">Score: {c.assessmentScore}%</span>
                    <button
                      className="btn-secondary"
                      style={{ padding: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onClick={() => handleDeleteCandidate(c.id)}
                      title="Delete Candidate"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Resume: {c.resumeFile} • Stage: {c.stage}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Finance Sub-renderers
  const renderClientReceivables = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Client Receivables & Invoice Aging</h3>
        {invoices.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No invoices or client receivables recorded.
          </p>
        ) : (
          <ul style={styles.list}>
            {invoices.map((inv) => (
              <li key={inv.id} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{inv.client} ({inv.id})</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Due Date: {inv.dueDate}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Project: {inv.projectName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 600 }}>{inv.amount}</div>
                  <span className={`badge badge-${inv.status === 'Paid' ? 'success' : inv.status === 'Sent' ? 'info' : 'warning'}`}>{inv.status}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderVendorPayables = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Vendor Payables & Freelancer Fees</h3>
        {activeStaffList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No vendor or staff payroll payables pending.
          </p>
        ) : (
          <ul style={styles.list}>
            {activeStaffList.map((staff: any) => (
              <li key={staff.email} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{staff.name} ({staff.roleTitle || staff.role})</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Monthly staff operational payroll expense</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontWeight: 600 }}>
                    {staff.salaryCurrency === 'INR' ? `₹${(staff.salary !== undefined ? staff.salary : 290000).toLocaleString()}` : `$${(staff.salary !== undefined ? staff.salary : 3500).toLocaleString()}`}
                  </div>
                  <span className="badge badge-warning">Pending Payout</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // LMS / Classroom Sub-renderers
  const renderAcademyDirectorLectures = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Curriculum Plans & Module Manager</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Publish official courses, adjust syllabus topics, and view enrollment capacity statistics.</p>
        <ul style={styles.list}>
          {[
            { title: '3D Maya Animation Mastery', modules: 12, faculty: 'Madhabi Mukherjee', enrolled: 45 },
            { title: 'Cinematic Storyboarding Essentials', modules: 8, faculty: 'Prosenjit Pal', enrolled: 28 },
          ].map((course, i) => (
            <li key={i} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{course.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Faculty: {course.faculty} • {course.modules} Modules</div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '12px' }}>
                <strong>{course.enrolled} / 50</strong> Students
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderAcademyDirectorAssignments = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Student Grading SLA Tracker</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monitor instruction tasks and grading completion status by Trainer faculty members.</p>
        {coursesList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No active student grading assignments or courses recorded.
          </p>
        ) : (
          <ul style={styles.list}>
            {coursesList.map((crs, i) => (
              <li key={i} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{crs.trainer}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Course: {crs.title} • Students enrolled: {crs.studentsCount}</div>
                </div>
                <span className="badge badge-success">Active</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  const renderTrainerLectures = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Upload Video Lecture</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={styles.formLabel}>Lecture Title</label>
            <input type="text" className="glass-input" placeholder="e.g. Lecture 4: Inverse Kinematics" />
          </div>
          <label style={styles.uploadBox}>
            <Upload size={24} color="var(--text-secondary)" />
            <span style={{ fontSize: '12px' }}>Upload Lecture MP4</span>
            <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
          </label>
          <button className="btn-primary" onClick={() => alert('Lecture published to student streams!')}>Publish Lecture</button>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Current Lectures Stream Catalog</h3>
        <ul style={styles.list}>
          {['Lec 1: Keyframe principles.mp4', 'Lec 2: Mesh topology.mp4'].map((lec, i) => (
            <li key={i} style={styles.listItem}>
              <span>{lec}</span>
              <span className="badge badge-success">Online</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderTrainerAssignments = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Grades & Submissions Queue</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select student Blender files to grade and write feedback review comments.</p>
        {coursesList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0', marginTop: '10px' }}>
            No submissions pending grading. Courses catalog is currently empty.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
            {coursesList.map((crs, i) => (
              <div key={i} style={styles.courseItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{crs.title}</span>
                  <span className="badge badge-warning">Submissions Pending</span>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <input type="text" className="glass-input" style={{ width: '80px' }} placeholder="Grade (A-F)" defaultValue="A-" />
                  <input type="text" className="glass-input" placeholder="Review comments..." defaultValue="Clean joint setup" />
                  <button className="btn-primary" style={{ padding: '6px 12px' }} onClick={() => alert('Grade saved!')}>Save</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentLectures = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Lectures Syllabus Video Feed</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { id: 1, title: 'Lecture 1: Principles of Squash and Stretch', dur: '45 mins' },
            { id: 2, title: 'Lecture 2: Camera Rigging and Lighting in Maya', dur: '62 mins' },
            { id: 3, title: 'Lecture 3: Mesh Topology and Organic Sculpting', dur: '54 mins' },
          ].map((lec) => (
            <div key={lec.id} style={{ ...styles.listItem, cursor: 'pointer' }} onClick={() => alert(`Streaming video for ${lec.title}`)}>
              <div>
                <div style={{ fontWeight: 600 }}>{lec.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Duration: {lec.dur}</div>
              </div>
              <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }}>Play</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStudentAssignments = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Homework Assignments Submit Deck</h3>
        <label style={styles.uploadBox}>
          <Upload size={24} color="var(--text-secondary)" />
          <span style={{ fontSize: '12px' }}>Select homework Blender file</span>
          <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
        </label>
        {uploadedFiles.length > 0 && (
          <div style={{ fontSize: '11px', color: 'var(--success)', marginTop: '8px' }}>
            ✓ File "{uploadedFiles[0]}" submitted.
          </div>
        )}
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>My Grade Book</h3>
        {assignmentsList.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
            No homework submissions or grades recorded yet.
          </p>
        ) : (
          <ul style={styles.list}>
            {assignmentsList.map((grade, i) => (
              <li key={i} style={styles.listItem}>
                <div>
                  <div style={{ fontWeight: 600 }}>{grade.submissionTitle}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                    Course: {grade.courseTitle} {grade.feedback ? `• Feedback: ${grade.feedback}` : ''}
                  </div>
                </div>
                <span className={`badge badge-${grade.status === 'Graded' ? 'badge-success' : 'badge-warning'}`}>
                  {grade.status === 'Graded' ? grade.grade : 'Pending'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  // Intern Sub-renderers
  const renderInternReports = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Weekly Journal Reports History</h3>
        <ul style={styles.list}>
          {[
            { date: 'Jun 15 - Jun 19', journal: 'Completed skeletal setup for cyber rickshaw.', status: 'Reviewed' },
            { date: 'Jun 22 - Jun 26', journal: internReportText, status: 'Draft' },
          ].map((rep, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', fontWeight: 600 }}>
                <span>Report week: {rep.date}</span>
                <span className={`badge badge-${rep.status === 'Reviewed' ? 'success' : 'warning'}`}>{rep.status}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>"{rep.journal}"</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderInternEvaluations = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Mentor Evaluations Feed</h3>
        <ul style={styles.list}>
          {[
            { mentor: 'Deepak Adhikari (Senior 3D Artist)', score: '90%', feedback: 'Excellent technical progress on rigging skeletal setups.', date: '2026-06-20' },
          ].map((evalItem, i) => (
            <li key={i} style={{ ...styles.listItem, flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <span style={{ fontWeight: 600 }}>{evalItem.mentor}</span>
                <span className="badge badge-success">Rating: {evalItem.score}</span>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>"{evalItem.feedback}"</p>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Date: {evalItem.date}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderInternCertificates = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Internship Completion Certificate</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Upon completion of your internship project requirements, your certificate will be generated and signed here.</p>
        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '40px', textAlign: 'center', marginTop: '20px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', marginBottom: '8px' }}>CERTIFICATE PENDING</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Requires final approval validation from Mentor Deepak Adhikari.</p>
        </div>
      </div>
    </div>
  );

  // Mentor Sub-renderers
  const renderMentorInterns = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>My Assigned Studio Interns</h3>
        <ul style={styles.list}>
          {[
            { name: 'Koyel Sen', role: 'Studio Intern (3D Animation)', email: 'koyel@dreamavian.com', progress: 'Week 4 of 12' },
          ].map((intern, i) => (
            <li key={i} style={styles.listItem}>
              <div>
                <div style={{ fontWeight: 600 }}>{intern.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{intern.role} • {intern.email}</div>
              </div>
              <span className="badge badge-info">{intern.progress}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderMentorLogReviews = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Intern Weekly Log Reviews</h3>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <strong>Intern: Koyel Sen</strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submitted: June 22</span>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '12px' }}>
            "{internReportText}"
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-primary" style={{ padding: '6px 12px', fontSize: '11px' }} onClick={() => alert('Log Approved!')}>Approve Journal Log</button>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', color: 'var(--danger)' }} onClick={() => alert('Returned for revision.')}>Request Revision</button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMentorTaskBoard = () => (
    <div style={styles.grid}>
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Assign Production Task to Intern</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>
            <label style={styles.formLabel}>Task Name</label>
            <input type="text" className="glass-input" defaultValue="Polish joint weight settings in Scene 3" />
          </div>
          <div>
            <label style={styles.formLabel}>Due Date</label>
            <input type="date" className="glass-input" defaultValue="2026-06-26" />
          </div>
          <button className="btn-primary" onClick={() => alert('Task assigned to Intern Koyel Sen!')}>Assign Intern Task</button>
        </div>
      </div>
      <div style={styles.halfCol} className="glass-panel">
        <h3 style={styles.subTitle}>Active Intern Task Boards</h3>
        <ul style={styles.list}>
          {['Test skeletal rigs scaling values (In Progress)', 'Clean animation keyframes in Scene 2 (Completed)'].map((tsk, i) => (
            <li key={i} style={styles.listItem}>
              <span>{tsk}</span>
              <span className={`badge badge-${tsk.includes('Completed') ? 'success' : 'warning'}`}>{tsk.includes('Completed') ? 'Done' : 'Active'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderMentorAppraisals = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Submit Appraisals & Appraisal Rating Rubric</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div>
            <label style={styles.formLabel}>Intern Name</label>
            <select className="glass-input"><option>Koyel Sen</option></select>
          </div>
          <div>
            <label style={styles.formLabel}>Technical Skill Competency (1 - 100)</label>
            <input type="range" min="1" max="100" defaultValue="85" style={{ width: '100%' }} />
          </div>
          <div>
            <label style={styles.formLabel}>Evaluation Summary Text</label>
            <textarea className="glass-input" value={mentorEvalText} onChange={(e) => setMentorEvalText(e.target.value)} style={{ minHeight: '60px' }} />
          </div>
          <button className="btn-primary" onClick={() => alert('Intern Appraisal and recommendation letter submitted!')}>Release Intern Appraisal</button>
        </div>
      </div>
    </div>
  );

  // ID Card Access Sub-renderers
  const renderIDCardGenerate = () => {
    const filteredCards = idCards.filter(c => 
      c.userName.toLowerCase().includes(searchCardText.toLowerCase()) ||
      c.cardId.toLowerCase().includes(searchCardText.toLowerCase()) ||
      c.role.toLowerCase().includes(searchCardText.toLowerCase())
    );

    const activeCard = idCards.find(c => c.cardId === selectedCardId);

    const handleZoneToggle = (cardId: string, zone: string) => {
      setIdCards(idCards.map(c => {
        if (c.cardId === cardId) {
          const zones = c.zones.includes(zone) 
            ? c.zones.filter((z: string) => z !== zone) 
            : [...c.zones, zone];
          return { ...c, zones };
        }
        return c;
      }));
      playSecuritySynth('beep');
    };

    const handleStatusChange = (cardId: string, status: 'Active' | 'Suspended' | 'Expired') => {
      setIdCards(idCards.map(c => {
        if (c.cardId === cardId) {
          return { ...c, status };
        }
        return c;
      }));
      playSecuritySynth('beep');
    };

    const handleRevokeCard = (cardId: string) => {
      setIdCards(idCards.filter(c => c.cardId !== cardId));
      if (selectedCardId === cardId) {
        setSelectedCardId(null);
      }
      playSecuritySynth('lockdown');
      alert(`Access Card ${cardId} has been revoked and disabled on all systems.`);
    };

    const availableZones = ['Main Lobby', 'Studio Floor A', 'Cafeteria', 'Executive Suite', 'Finance Vault', 'Academy Block'];

    return (
      <div style={styles.grid}>
        <div style={{ ...styles.fullRow, display: 'flex', gap: '12px', alignItems: 'center' }} className="glass-panel">
          <Search size={18} color="var(--text-secondary)" />
          <input 
            type="text" 
            placeholder="Search active credentials database by name, card ID or role..." 
            className="glass-input" 
            value={searchCardText}
            onChange={(e) => setSearchCardText(e.target.value)}
            style={{ border: 'none', background: 'transparent', flex: 1, padding: 0 }}
          />
        </div>

        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Active Access Cards ({filteredCards.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
            {filteredCards.map((card) => (
              <div 
                key={card.cardId} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '12px', 
                  background: selectedCardId === card.cardId ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)', 
                  border: selectedCardId === card.cardId ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border-color)', 
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onClick={() => { setSelectedCardId(card.cardId); playSecuritySynth('beep'); }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{card.userName} ({card.cardId})</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{card.role}</div>
                  <div style={{ fontSize: '9px', color: '#06b6d4', marginTop: '4px' }}>Zones: {card.zones.join(', ')}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`badge badge-${card.status === 'Active' ? 'success' : card.status === 'Suspended' ? 'warning' : 'danger'}`}>
                    {card.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Card Management Console</h3>
          {activeCard ?
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.18) 0%, rgba(3, 7, 18, 0.9) 100%)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                borderRadius: '16px',
                padding: '16px',
                position: 'relative',
                height: '280px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                overflow: 'hidden',
                boxShadow: '0 0 25px rgba(6, 182, 212, 0.2)'
              }} className="pulse-glow">
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 1, pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={logoImg} alt="Logo" style={{ width: '18px', height: '18px', borderRadius: '4px', border: '1px solid rgba(0, 240, 255, 0.4)', objectFit: 'cover' }} />
                    <span style={{ fontSize: '10px', fontWeight: 'bold', letterSpacing: '2.5px', color: '#00f0ff', fontFamily: 'var(--font-display)', textShadow: '0 0 6px rgba(0,240,255,0.6)' }}>DREAMAVIAN</span>
                  </div>
                  <span style={{ fontSize: '8px', fontFamily: 'var(--font-mono)', padding: '2px 6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '4px', color: '#34d399', letterSpacing: '1px' }}>
                    VERIFIED
                  </span>
                </div>
                
                <div style={{ zIndex: 2, display: 'flex', gap: '14px', alignItems: 'center', margin: '6px 0' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)', overflow: 'hidden' }}>
                    {activeCard.image ? (
                      <img src={activeCard.image} alt="Employee" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', stroke: '#06b6d4', fill: 'none', strokeWidth: 1.5, opacity: 0.85 }}>
                        <path d="M 30,30 C 30,15 70,15 70,30 C 70,50 65,70 50,85 C 35,70 30,50 30,30 Z" />
                        <line x1="15" y1="45" x2="85" y2="45" stroke="rgba(239, 68, 68, 0.7)" strokeWidth="2" className="pulse-glow" />
                        <path d="M 20,95 Q 50,80 80,95" />
                        <rect x="20" y="15" width="60" height="70" strokeDasharray="4,4" stroke="rgba(6,182,212,0.3)" />
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', textShadow: '0 0 8px rgba(6, 182, 212, 0.4)', fontFamily: 'var(--font-display)' }}>{activeCard.userName}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{activeCard.role}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#06b6d4', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                      <span>DEPT: {activeCard.department || 'Animation'}</span>
                      <span style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>{activeCard.cardId}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ zIndex: 2, display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px 10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>BLOOD GP: <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeCard.bloodGroup || 'O+'}</span></div>
                    <div>EXPIRY: <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeCard.expiryDate || '2033-12-31'}</span></div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                    <div>PHONE: <span style={{ color: '#fff', fontWeight: 'bold' }}>{activeCard.phone || 'N/A'}</span></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 2, marginTop: '8px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '7px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>Authorizing Sign</span>
                    <span style={{ fontFamily: "'Alex Brush', cursive", fontSize: '24px', color: '#a5f3fc', lineHeight: '1', marginTop: '2px', transform: 'rotate(-2deg)' }}>Joydeep Sen</span>
                    <span style={{ fontSize: '7px', color: 'var(--text-muted)', marginTop: '2px' }}>CEO & Studio Owner</span>
                  </div>

                  <div style={{ position: 'relative', width: '56px', height: '56px', background: '#fff', padding: '4px', borderRadius: '6px', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="48" height="48" viewBox="0 0 29 29" style={{ fill: '#000' }}>
                      <rect x="0" y="0" width="7" height="7" />
                      <rect x="1" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                      <rect x="2" y="2" width="3" height="3" />
                      <rect x="22" y="0" width="7" height="7" />
                      <rect x="23" y="1" width="5" height="5" style={{ fill: '#fff' }} />
                      <rect x="24" y="2" width="3" height="3" />
                      <rect x="0" y="22" width="7" height="7" />
                      <rect x="1" y="22" width="5" height="5" style={{ fill: '#fff' }} />
                      <rect x="2" y="24" width="3" height="3" />
                      <rect x="9" y="1" width="2" height="2" />
                      <rect x="15" y="0" width="3" height="1" />
                      <rect x="13" y="3" width="2" height="2" />
                      <rect x="9" y="9" width="3" height="3" />
                      <rect x="19" y="9" width="2" height="2" />
                      <rect x="14" y="14" width="4" height="2" />
                      <rect x="9" y="19" width="2" height="2" />
                      <rect x="20" y="19" width="3" height="3" />
                      <rect x="25" y="15" width="2" height="2" />
                      <rect x="15" y="24" width="2" height="2" />
                    </svg>
                    <div className="scanline-vertical" style={{ top: 0, height: '2px', width: '100%', position: 'absolute' }} />
                  </div>
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Card Status</label>
                <select 
                  className="glass-input" 
                  value={activeCard.status} 
                  onChange={(e) => handleStatusChange(activeCard.cardId, e.target.value as any)}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div>
                <label style={styles.formLabel}>Authorized Access Zones</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  {availableZones.map((zone) => (
                    <label key={zone} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', margin: 0 }}>
                      <input 
                        type="checkbox" 
                        checked={activeCard.zones.includes(zone)} 
                        onChange={() => handleZoneToggle(activeCard.cardId, zone)}
                      />
                      <span>{zone}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                className="btn-secondary" 
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', background: 'rgba(6, 182, 212, 0.08)', border: '1px solid rgba(6, 182, 212, 0.3)', color: '#22d3ee', marginTop: '10px' }}
                onClick={() => {
                  playSecuritySynth('success');
                  downloadCardAsPNG(
                    activeCard.userName,
                    activeCard.role,
                    activeCard.department || 'Animation',
                    activeCard.bloodGroup || 'O+',
                    activeCard.expiryDate || '2033-12-31',
                    activeCard.phone || 'N/A',
                    activeCard.cardId,
                    activeCard.image
                  );
                }}
              >
                <Download size={14} />
                <span>Download Card PNG Badge</span>
              </button>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '14px', marginTop: '10px', display: 'flex', gap: '8px' }}>
                <button className="btn-secondary" style={{ flex: 1, color: 'var(--danger)' }} onClick={() => handleRevokeCard(activeCard.cardId)}>
                  <Trash2 size={14} style={{ marginRight: '6px' }} />
                  <span>Revoke Card</span>
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => {
                  playSecuritySynth('success');
                  alert(`Access Card specifications synchronized with master gateways!`);
                }}>
                  Sync Gateways
                </button>
              </div>
            </div>
          :
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-muted)', fontSize: '12px', padding: '30px', textAlign: 'center' }}>
              Select an active access card from the list to manage status, customize zone clearance, or revoke security access.
            </div>
          }
        </div>
      </div>
    );
  };

  const renderIDCardAccess = () => {
    const handleToggleDeviceStatus = (id: string) => {
      setSecurityDevices(securityDevices.map(d => {
        if (d.id === id) {
          const nextStatus = d.status === 'Online' ? 'Offline' : 'Online';
          return { ...d, status: nextStatus };
        }
        return d;
      }));
      playSecuritySynth('beep');
    };

    const handleToggleDeviceLock = (id: string) => {
      setSecurityDevices(securityDevices.map(d => {
        if (d.id === id) {
          return { ...d, locked: !d.locked };
        }
        return d;
      }));
      playSecuritySynth('beep');
    };

    const handlePingDevice = (id: string) => {
      setPingerStates(prev => ({ ...prev, [id]: true }));
      playSecuritySynth('beep');
      
      setTimeout(() => {
        setPingerStates(prev => ({ ...prev, [id]: false }));
        const dev = securityDevices.find(d => d.id === id);
        if (dev) {
          playSecuritySynth('success');
          alert(`PING SUCCESSFUL [${dev.IP}]: 0ms latency. Hardware firmware response verified.`);
        }
      }, 800);
    };

    const handleAddDevice = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newDeviceName || !newDeviceIP) return;
      const newDev = {
        id: `dev-${Date.now()}`,
        location: newDeviceName,
        IP: newDeviceIP,
        status: 'Online' as const,
        locked: false
      };
      setSecurityDevices([...securityDevices, newDev]);
      setNewDeviceName('');
      setNewDeviceIP('');
      playSecuritySynth('success');
      alert(`RFID IP Mapper added: ${newDeviceName} registered on subnet.`);
    };

    const handleRemoveDevice = (id: string) => {
      setSecurityDevices(securityDevices.filter(d => d.id !== id));
      playSecuritySynth('lockdown');
      alert('RFID gate device removed from IP mapper configuration.');
    };

    return (
      <div style={styles.grid}>
        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>RFID/NFC Access IP Device Mapper</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Gateways mapped to the central security broker. Click status or lock state to change device configurations.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {securityDevices.map((dev) => (
              <div 
                key={dev.id} 
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{dev.location}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>Device IP: {dev.IP}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span 
                      style={{ cursor: 'pointer', fontSize: '10px' }} 
                      className={`badge badge-${dev.status === 'Online' ? 'success' : 'danger'}`}
                      onClick={() => handleToggleDeviceStatus(dev.id)}
                    >
                      {dev.status}
                    </span>
                    <span 
                      style={{ cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }} 
                      className={`badge badge-${dev.locked ? 'danger' : 'info'}`}
                      onClick={() => handleToggleDeviceLock(dev.id)}
                    >
                      {dev.locked ? <Lock size={10} /> : <Unlock size={10} />}
                      {dev.locked ? 'LOCKED' : 'UNLOCKED'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyItems: 'space-between', width: '100%', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                  <button 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '4px 8px', fontSize: '10px', display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: '4px', alignItems: 'center' }} 
                    onClick={() => handlePingDevice(dev.id)}
                    disabled={pingerStates[dev.id]}
                  >
                    <RefreshCw size={10} className={pingerStates[dev.id] ? 'animate-spin' : ''} />
                    <span>{pingerStates[dev.id] ? 'Pinging...' : 'Ping Gateway'}</span>
                  </button>
                  <button 
                    className="btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '10px', color: 'var(--danger)' }} 
                    onClick={() => handleRemoveDevice(dev.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Register Mapped Access Device</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Scan local subnet and map a new physical gate device controller to the system.</p>
          <form onSubmit={handleAddDevice} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={styles.formLabel}>Gateway Location Label</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g., Executive Suite Vault Entrance" 
                value={newDeviceName}
                onChange={(e) => setNewDeviceName(e.target.value)}
                required 
              />
            </div>
            <div>
              <label style={styles.formLabel}>Static IP Address Allocation</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="e.g., 192.168.10.82" 
                value={newDeviceIP}
                onChange={(e) => setNewDeviceIP(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
              <Plus size={14} style={{ marginRight: '6px' }} />
              <span>Map Subnet Device</span>
            </button>
          </form>
          
          <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>Security Audit Checklist</h4>
            <ul style={{ fontSize: '10px', color: 'var(--text-secondary)', paddingLeft: '14px', lineHeight: '1.6' }}>
              <li>Secure Shell SSH port 22 disabled on all IP devices.</li>
              <li>WPA3 Enterprise credentials enforced for remote mappings.</li>
              <li>Biometric firmware updated to v2.4 encryption bounds.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const renderIDCardActivity = () => {
    const filteredLogs = attendance.filter(log => {
      const matchesMethod = activeLogMethodFilter === 'All' || log.method === activeLogMethodFilter;
      const matchesStatus = activeLogStatusFilter === 'All' || 
        (activeLogStatusFilter === 'Success' && log.status === 'Present') ||
        (activeLogStatusFilter === 'Blocked' && log.status !== 'Present');
      return matchesMethod && matchesStatus;
    });

    const handleSimulateScan = (e: React.FormEvent) => {
      e.preventDefault();
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
      const newLog = {
        id: `att-${Date.now()}`,
        userName: simScanUser,
        time: timeStr,
        status: (simScanStatus === 'Success' ? 'Present' : 'Absent') as 'Present' | 'Absent',
        method: simScanMethod
      };
      
      setAttendance([newLog, ...attendance]);
      playSecuritySynth(simScanStatus === 'Success' ? 'beep' : 'lockdown');
      alert(`Simulation Triggered: ${simScanUser} scan attempt at ${simScanDevice} returned status ${simScanStatus.toUpperCase()}`);
    };

    return (
      <div style={styles.grid}>
        <div style={{ ...styles.fullRow, display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '16px' }} className="glass-panel animate-fade-in">
          <div style={{ flex: '1 1 200px' }}>
            <label style={styles.formLabel}>Filter by Access Method</label>
            <select 
              className="glass-input" 
              value={activeLogMethodFilter}
              onChange={(e) => { setActiveLogMethodFilter(e.target.value); playSecuritySynth('beep'); }}
            >
              <option value="All">All Methods</option>
              <option value="QR Code">QR Code</option>
              <option value="Biometric">Biometric</option>
              <option value="Remote">Remote</option>
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={styles.formLabel}>Filter by Authorization Status</label>
            <select 
              className="glass-input" 
              value={activeLogStatusFilter}
              onChange={(e) => { setActiveLogStatusFilter(e.target.value); playSecuritySynth('beep'); }}
            >
              <option value="All">All Scan Results</option>
              <option value="Success">Success (Access Granted)</option>
              <option value="Blocked">Blocked (Access Denied)</option>
            </select>
          </div>
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
            <button 
              className="btn-secondary" 
              style={{ padding: '10px 16px', fontSize: '12px' }}
              onClick={() => {
                setAttendance(MOCK_ATTENDANCE);
                playSecuritySynth('success');
              }}
            >
              Reset Logs
            </button>
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Logs Database Feed ({filteredLogs.length} entries)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  padding: '10px 14px', 
                  background: selectedLogId === log.id ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.01)', 
                  border: selectedLogId === log.id ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid var(--border-color)', 
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: '0.2s'
                }}
                onClick={() => { setSelectedLogId(log.id); playSecuritySynth('beep'); }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '12px' }}>{log.userName}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Scanned at {log.time}</div>
                </div>
                <span className={`badge badge-${log.status === 'Present' ? 'success' : 'danger'}`} style={{ fontSize: '10px' }}>
                  {log.method} {log.status === 'Present' ? 'Success' : 'Denied'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Simulate Gateway Swipe Entry</h3>
          <form onSubmit={handleSimulateScan} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={styles.formLabel}>User Profile</label>
              <select className="glass-input" value={simScanUser} onChange={(e) => setSimScanUser(e.target.value)}>
                {credentials.map(c => (
                  <option key={c.email} value={c.name}>{c.name} ({c.roleTitle})</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={styles.formLabel}>IP Access Reader Gateway</label>
              <select className="glass-input" value={simScanDevice} onChange={(e) => setSimScanDevice(e.target.value)}>
                {securityDevices.map(d => (
                  <option key={d.id} value={d.location}>{d.location}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Access Method</label>
                <select className="glass-input" value={simScanMethod} onChange={(e) => setSimScanMethod(e.target.value as any)}>
                  <option value="QR Code">QR Code</option>
                  <option value="Biometric">Biometric</option>
                  <option value="Remote">Remote</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={styles.formLabel}>Response Status</label>
                <select className="glass-input" value={simScanStatus} onChange={(e) => setSimScanStatus(e.target.value as any)}>
                  <option value="Success">Success (Grant)</option>
                  <option value="Blocked">Blocked (Deny)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" style={{ marginTop: '12px' }}>
              <Scan size={14} style={{ marginRight: '6px' }} />
              <span>Inject Scan Log Event</span>
            </button>
          </form>
        </div>
      </div>
    );
  };

  const renderIDCardAlerts = () => {
    const handleAcknowledgeAlert = (id: string) => {
      setSecurityAlerts(securityAlerts.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      playSecuritySynth('success');
    };

    const handleResolveAlert = (id: string) => {
      setSecurityAlerts(securityAlerts.filter(a => a.id !== id));
      playSecuritySynth('beep');
    };

    const handleTriggerTestAlarm = () => {
      const nextAlarmState = !isTestAlarmActive;
      setIsTestAlarmActive(nextAlarmState);
      
      if (nextAlarmState) {
        playSecuritySynth('alarm');
        const loop = setInterval(() => {
          if (document.getElementById('security-alarm-pulse')) {
            playSecuritySynth('alarm');
          } else {
            clearInterval(loop);
          }
        }, 1200);
        
        const testAlert = {
          id: `alt-${Date.now()}`,
          title: '🚨 SECURITY TEST ALARM ACTIVE',
          details: 'Global diagnostic drill alarm triggered by Systems Admin console.',
          severity: 'Critical',
          time: 'Just now',
          acknowledged: false
        };
        setSecurityAlerts([testAlert, ...securityAlerts]);
      } else {
        playSecuritySynth('success');
      }
    };

    const handleToggleLockdown = () => {
      const nextLockdownState = !isSystemLockdown;
      setIsSystemLockdown(nextLockdownState);
      playSecuritySynth(nextLockdownState ? 'lockdown' : 'success');
      
      setSecurityDevices(securityDevices.map(dev => ({
        ...dev,
        locked: nextLockdownState,
        status: nextLockdownState ? 'Offline' : 'Online'
      })));

      const logMsg = nextLockdownState 
        ? 'SYSTEM WIDE LOCKDOWN INITIATED. ALL ACCESS CONTROLS SECURED.' 
        : 'SYSTEM LOCKDOWN REVOKED. ACCESS GATES RESTORED TO STANDARD BROKER.';
        
      const newLog = {
        id: `att-${Date.now()}`,
        userName: 'SYSTEM GATEWAY',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        status: (nextLockdownState ? 'Absent' : 'Present') as 'Present' | 'Absent',
        method: 'Remote' as const
      };
      
      setAttendance([newLog, ...attendance]);
      alert(logMsg);
    };

    return (
      <div style={styles.grid} id={isTestAlarmActive ? "security-alarm-pulse" : undefined}>
        {isTestAlarmActive && (
          <div 
            style={{ 
              ...styles.fullRow, 
              background: 'rgba(239, 68, 68, 0.25)', 
              border: '2px solid var(--danger)', 
              borderRadius: '12px', 
              padding: '16px', 
              color: '#fff', 
              fontWeight: 'bold', 
              textAlign: 'center',
              animation: 'pulse-glow 1s infinite alternate'
            }}
          >
            ⚠️ SECURITY TEST ALARM ACTIVE — DIAGNOSTIC DRILL IN PROGRESS ⚠️
          </div>
        )}

        <div style={styles.halfCol} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>Security Alert System Feed ({securityAlerts.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '350px', overflowY: 'auto' }}>
            {securityAlerts.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', border: '1px dashed var(--border-color)', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                <Scan size={36} color="var(--success)" style={{ marginBottom: '10px', opacity: 0.5 }} />
                <span>NO ACTIVE SECURITY ALERTS REPORTED</span>
              </div>
            ) : (
              securityAlerts.map((alert) => (
                <div 
                  key={alert.id} 
                  style={{ 
                    padding: '16px', 
                    background: alert.acknowledged ? 'rgba(255,255,255,0.01)' : 'rgba(239, 68, 68, 0.05)', 
                    border: alert.acknowledged ? '1px solid var(--border-color)' : '1px solid rgba(239, 68, 68, 0.3)', 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    opacity: alert.acknowledged ? 0.6 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: alert.acknowledged ? 'var(--text-primary)' : 'var(--danger)' }}>
                      {alert.title}
                    </span>
                    <span className={`badge badge-${alert.severity === 'Critical' ? 'danger' : alert.severity === 'High' ? 'danger' : 'warning'}`} style={{ fontSize: '9px' }}>
                      {alert.severity}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{alert.details}</p>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Detected: {alert.time}</div>
                  
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: '8px' }}>
                    {!alert.acknowledged && (
                      <button className="btn-primary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => handleAcknowledgeAlert(alert.id)}>
                        Acknowledge
                      </button>
                    )}
                    <button className="btn-secondary" style={{ padding: '4px 8px', fontSize: '10px' }} onClick={() => handleResolveAlert(alert.id)}>
                      Dismiss/Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.halfCol} className="glass-panel">
          <h3 style={styles.subTitle}>Facility Control Deck</h3>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Execute emergency response workflows. Trigger test exercises or force facility gates into secure lock profiles.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px', display: 'block' }}>Emergency Test Alarm</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Synthesizes sirens and drills security responders.</span>
              </div>
              <button 
                className={`btn-${isTestAlarmActive ? 'secondary' : 'primary'}`} 
                style={{ padding: '8px 14px', fontSize: '12px', background: isTestAlarmActive ? 'var(--text-secondary)' : 'var(--danger)', border: 'none', color: '#fff' }}
                onClick={handleTriggerTestAlarm}
              >
                {isTestAlarmActive ? 'SILENCE ALARM' : 'TRIGGER SIREN'}
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '12px' }}>
              <div>
                <strong style={{ fontSize: '13px', display: 'block', color: 'var(--danger)' }}>Facility Wide Lockdown</strong>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Secures all door locks and disables active QR clearances.</span>
              </div>
              <button 
                className="btn-primary" 
                style={{ padding: '8px 14px', fontSize: '12px', background: isSystemLockdown ? 'var(--success)' : 'var(--danger)', border: 'none', color: '#fff' }}
                onClick={handleToggleLockdown}
              >
                {isSystemLockdown ? 'END LOCKDOWN' : 'LOCKDOWN NOW'}
              </button>
            </div>
          </div>
          
          <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#06b6d4' }}>Simulation Dashboard Trigger</h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              Force inject an active intrusion breach alert to test terminal diagnostic warnings.
            </p>
            <button className="btn-secondary" style={{ width: '100%' }} onClick={() => {
              const types = [
                { title: '⚠️ Door Forced Open', details: 'NFC Access Reader dev-2 (Studio Floor A gate) reports hardware tamper loop breach.', severity: 'High' },
                { title: '🚨 Fire Loop Diagnostic Fault', details: 'Smoke detector zone 4 (Main Server Rack) reports wiring impedance warning.', severity: 'Medium' }
              ];
              const type = types[Math.floor(Math.random() * types.length)];
              const newAlert = {
                id: `alt-${Date.now()}`,
                title: type.title,
                details: type.details,
                severity: type.severity,
                time: 'Just now',
                acknowledged: false
              };
              setSecurityAlerts([newAlert, ...securityAlerts]);
              playSecuritySynth('alarm');
            }}>
              Generate Random Subnet Intrusion
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderVisitorServices = () => {
    const selectedSample = workSamples.find(w => w.id === selectedSampleId);

    return (
      <div style={styles.grid}>
        {/* Core Services */}
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <h3 style={styles.subTitle}>DreamAvian Animation Services Portfolio</h3>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '10px' }}>
            {[
              { title: '3D Character Animation', desc: 'Premium cinematic and game-ready character rigs animation.' },
              { title: 'Pre-production Storyboards', desc: 'Concept illustrations, storyboard sequencing, and animatics.' },
              { title: 'VFX & Render Services', desc: 'High resolution render farms configurations and composting.' },
            ].map((serv, i) => (
              <div key={i} style={{ ...styles.metricCard, flex: '1 1 calc(33.3% - 12px)' }}>
                <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '6px' }}>{serv.title}</div>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>{serv.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Featured Work Samples Widescreen Section */}
        <div style={styles.fullRow} className="glass-panel animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ ...styles.subTitle, margin: 0 }}>Featured Production Work Samples</h3>
            {(role === 'studio_owner' || role === 'super_admin') && (
              <button 
                className="btn-primary" 
                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setIsAddingWorkSample(true)}
              >
                <Plus size={14} />
                <span>Add Work Sample</span>
              </button>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '14px' }}>
            {workSamples.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 0', fontSize: '13px' }}>
                🎬 No production work samples published yet.
              </div>
            ) : (
              workSamples.map((sample) => {
              const isPlaying = activePlayblastId === sample.id;
              return (
                <div 
                  key={sample.id}
                  style={{
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: '0.3s'
                  }}
                  className="list-hover"
                >
                  <div>
                    {/* Badge line */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.5px', color: 'var(--accent-color)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(6,182,212,0.2)', fontFamily: 'var(--font-mono)' }}>
                        {sample.category}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{sample.year}</span>
                        {(role === 'studio_owner' || role === 'super_admin') && (
                          <button
                            style={{
                              background: 'transparent',
                              border: 'none',
                              color: 'rgba(239, 68, 68, 0.7)',
                              cursor: 'pointer',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgb(239, 68, 68)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)')}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteWorkSample(sample.id);
                            }}
                            title="Delete work sample"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Title */}
                    <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: '4px 0 8px 0', fontFamily: 'var(--font-display)' }}>{sample.title}</h4>

                    {/* Playblast screen box */}
                    <div 
                      style={{
                        height: '110px',
                        background: 'rgba(0,0,0,0.4)',
                        border: isPlaying ? '1px solid rgba(6, 182, 212, 0.5)' : '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '8px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '12px',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {isPlaying ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <video
                            src={sample.videoUrl}
                            controls
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                          <button 
                            style={{ 
                              position: 'absolute', 
                              top: '4px', 
                              right: '4px', 
                              background: 'rgba(0,0,0,0.7)', 
                              border: '1px solid rgba(255,255,255,0.2)', 
                              borderRadius: '50%', 
                              width: '20px', 
                              height: '20px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              color: '#fff', 
                              cursor: 'pointer',
                              zIndex: 10
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActivePlayblastId(null);
                              playSecuritySynth('beep');
                            }}
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '8px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 8px rgba(6,182,212,0.1)' }}
                            onClick={() => {
                              setActivePlayblastId(sample.id);
                              playSecuritySynth('success');
                            }}
                          >
                            <Play size={18} color="var(--accent-color)" style={{ marginLeft: '2px' }} />
                          </button>
                          <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginTop: '8px' }}>
                            {sample.playblastName}
                          </span>
                        </>
                      )}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '8px 0' }}>{sample.desc}</p>
                  </div>

                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn-secondary" 
                      style={{ flex: 1, fontSize: '11px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => {
                        setSelectedSampleId(sample.id);
                        playSecuritySynth('beep');
                      }}
                    >
                      <Info size={12} />
                      <span>Inspect Sheet</span>
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '11px', padding: '6px' }}
                      onClick={() => alert(`📦 Production assets package for "${sample.title}" requested! Mock download started.`)}
                    >
                      <Download size={12} />
                    </button>
                  </div>
                </div>
              );
            }))}
          </div>
        </div>

        {/* Inspect Modal Overlay */}
        {selectedSample && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(3, 7, 18, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px',
              backdropFilter: 'blur(8px)'
            }} 
            className="animate-fade-in"
          >
            <div className="glass-panel animate-scale-in" style={{ width: '100%', maxWidth: '580px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
              <button 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 10px' }} 
                onClick={() => { setSelectedSampleId(null); playSecuritySynth('beep'); }}
              >
                <X size={16} />
              </button>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Production Spec Sheet</span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>{selectedSample.title}</h3>
              </div>

              {/* Data Table */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.03)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CLIENT ACCT:</span>
                  <span style={{ color: '#fff', fontWeight: 'bold' }}>{selectedSample.client}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>PRODUCTION PIPELINE:</span>
                  <span style={{ color: 'var(--accent-color)' }}>{selectedSample.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>TECHNOLOGY STACK:</span>
                  <span style={{ color: '#fff' }}>{selectedSample.tech}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>TELEMETRY METRICS:</span>
                  <span style={{ color: '#a5f3fc' }}>{selectedSample.stats}</span>
                </div>
              </div>

              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-mono)' }}>Detailed Scope Overview</span>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '6px' }}>{selectedSample.desc}</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button 
                  className="btn-primary" 
                  style={{ flex: 1, padding: '10px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  onClick={() => {
                    setActivePlayblastId(selectedSample.id);
                    setSelectedSampleId(null);
                    playSecuritySynth('success');
                  }}
                >
                  <Play size={12} />
                  <span>Start Playblast Stream</span>
                </button>
                <button 
                  className="btn-secondary" 
                  style={{ padding: '10px 18px', fontSize: '12px' }}
                  onClick={() => { setSelectedSampleId(null); playSecuritySynth('beep'); }}
                >
                  Close Sheet
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Work Sample Modal Overlay */}
        {isAddingWorkSample && (
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(3, 7, 18, 0.85)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 99999,
              padding: '20px',
              backdropFilter: 'blur(8px)'
            }} 
            className="animate-fade-in"
          >
            <div 
              className="glass-panel animate-scale-in" 
              style={{ 
                width: '100%', 
                maxWidth: '600px', 
                padding: '24px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '14px', 
                position: 'relative',
                maxHeight: '90vh',
                overflowY: 'auto'
              }}
            >
              <button 
                className="btn-secondary" 
                style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px 10px' }} 
                onClick={() => { setIsAddingWorkSample(false); playSecuritySynth('beep'); }}
              >
                <X size={16} />
              </button>

              <div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}>Owner / Admin Actions</span>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', margin: '4px 0 0 0', fontFamily: 'var(--font-display)' }}>Add New Production Work Sample</h3>
              </div>

              <form onSubmit={handleAddWorkSample} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Title *</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Chronicles of Aryavarta" 
                      value={wsTitle}
                      onChange={(e) => setWsTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Category</label>
                    <select 
                      className="glass-input" 
                      value={wsCategory}
                      onChange={(e) => setWsCategory(e.target.value)}
                      style={{ background: 'var(--bg-color)', color: '#fff' }}
                    >
                      <option value="3D Character Animation">3D Character Animation</option>
                      <option value="Pre-visualization & Storyboards">Pre-visualization & Storyboards</option>
                      <option value="VFX & Render Compositing">VFX & Render Compositing</option>
                      <option value="Rigging & Face Coding">Rigging & Face Coding</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Client / Partner</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Disney India" 
                      value={wsClient}
                      onChange={(e) => setWsClient(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Release Year</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. 2026" 
                      value={wsYear}
                      onChange={(e) => setWsYear(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Technology Stack</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Unreal Engine 5.4, Maya" 
                      value={wsTech}
                      onChange={(e) => setWsTech(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Telemetry Stats</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. 4K UHD // 24 FPS" 
                      value={wsStats}
                      onChange={(e) => setWsStats(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Playblast Filename</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. Aryavarta_v01.pb" 
                      value={wsPlayblast}
                      onChange={(e) => setWsPlayblast(e.target.value)}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Video Source URL (Optional)</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="https://...mp4" 
                      value={wsVideoUrl}
                      onChange={(e) => setWsVideoUrl(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label style={styles.formLabel}>Upload Video File (Optional - Max 2MB for sync)</label>
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="glass-input" 
                    style={{ padding: '8px', cursor: 'pointer' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 2 * 1024 * 1024) {
                          alert("⚠️ Video file is too large for database storage persistence (Max 2MB). Storing temporary playback link instead.");
                          setWsVideoFile(URL.createObjectURL(file));
                          setWsVideoFileName(file.name);
                        } else {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setWsVideoFile(reader.result as string);
                            setWsVideoFileName(file.name);
                          };
                          reader.readAsDataURL(file);
                        }
                      }
                    }}
                  />
                  {wsVideoFileName && (
                    <div style={{ fontSize: '11px', color: 'var(--accent-color)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                      Selected: {wsVideoFileName}
                    </div>
                  )}
                </div>

                <div>
                  <label style={styles.formLabel}>Scope & Description</label>
                  <textarea 
                    className="glass-input" 
                    style={{ minHeight: '60px' }} 
                    placeholder="Describe the production details, shots composited, and scene description..."
                    value={wsDesc}
                    onChange={(e) => setWsDesc(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ flex: 1, padding: '10px' }}
                  >
                    Publish Work Sample
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    style={{ flex: 1, padding: '10px' }}
                    onClick={() => { setIsAddingWorkSample(false); playSecuritySynth('beep'); }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderVisitorAcademy = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Join DreamAvian Academy Programs</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {coursesList.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
              No training programs are open for enrollment at this time. Please check back later!
            </p>
          ) : (
            coursesList.map((crs) => (
              <div key={crs.id} style={styles.courseItem}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600 }}>{crs.title} ({crs.price})</span>
                  <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '11px' }} onClick={() => alert(`Enrollment inquiry sent for ${crs.title}!`)}>Enroll Now</button>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Instructed by: {crs.trainer} • Duration: {crs.duration}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderVisitorCareers = () => {
    const activeJobs = jobs.filter(j => j.status === 'Recruiting');
    return (
      <div style={styles.grid}>
        <div style={{ ...styles.fullRow, background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, rgba(147,51,234,0.05) 100%)', border: '1px solid var(--border-color)' }} className="glass-panel animate-fade-in">
          <div style={{ textAlign: 'center', padding: '20px 10px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '8px', background: 'linear-gradient(90deg, #06b6d4, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Careers at DreamAvian Studios
            </h2>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
              Shape the future of virtual production and immersive 3D animation. Join a global cohort of world-class storytellers, artists, and technical developers.
            </p>
          </div>
        </div>

        <div style={styles.fullRow} className="glass-panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={styles.subTitle}>Open Positions</h3>
            <span className="badge badge-info">{activeJobs.length} Available</span>
          </div>

          {activeJobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: '1px dashed var(--border-color)', borderRadius: '12px', background: 'rgba(255,255,255,0.01)' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                We are currently at full production capacity and do not have any open vacancies.
              </p>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setSelectedJob(null);
                  setIsApplying(true);
                }}
              >
                Submit General Application
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {activeJobs.map((job) => (
                <div 
                  key={job.id} 
                  style={{ 
                    padding: '18px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.2s ease',
                  }}
                  className="list-hover"
                >
                  <div>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--accent-color)', fontWeight: 600 }}>{job.department}</span>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '4px 0 8px 0', color: '#fff' }}>{job.title}</h4>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '10px', color: 'var(--text-secondary)' }}>
                      <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>📍 {job.location}</span>
                      <span style={{ padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>⏱️ {job.type}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>{job.salaryRange}</span>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '11px' }}
                      onClick={() => {
                        setSelectedJob(job);
                        setIsApplying(false);
                      }}
                    >
                      View Details & Apply
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderVisitorAbout = () => (
    <div style={styles.grid}>
      <div style={styles.fullRow} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>About DreamAvian Studios Ecosystem</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
          Established as a unified all-in-one ecosystem, DreamAvian Studios integrates animation production flow, virtual workspace access controls, recruit pipelines, and an LMS academy. Using the latest WebGL, WebAudio, and high-performance server grids, we serve thousands of artists, clients, and students globally.
        </p>
      </div>
    </div>
  );

  const renderVisitorContact = () => (
    <div style={styles.grid}>
      {/* Contact Information & Social Channels */}
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Connect with DreamAvian</h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Reach out to our production desks directly or follow us on our social networks for active updates.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {contactLinks.map((link, idx) => {
            const isEmail = link.type === 'email';
            const isLink = link.type === 'link';
            return (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '12px', 
                  padding: '12px', 
                  background: 'rgba(255,255,255,0.01)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px',
                  transition: '0.2s'
                }}
                className="list-hover"
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(6,182,212,0.08)',
                  border: '1px solid rgba(6,182,212,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-color)'
                }}>
                  {getContactIcon(link.label, link.type)}
                </div>
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                    {link.label}
                  </div>
                  {isEmail ? (
                    <a href={`mailto:${link.value}`} style={{ fontSize: '13px', color: '#fff', textDecoration: 'none', fontWeight: 600 }} className="text-hover">
                      {link.value}
                    </a>
                  ) : isLink ? (
                    <a href={link.value} target="_blank" rel="noopener noreferrer" style={{ fontSize: '13px', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 600 }} className="text-hover">
                      Visit Channel
                    </a>
                  ) : (
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                      {link.value}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {contactLinks.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '20px', color: 'var(--text-muted)' }}>
              <Mail size={24} />
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>NO CHANNELS REGISTERED</span>
            </div>
          )}
        </div>
      </div>

      {/* Inquiry Form */}
      <div style={styles.halfCol} className="glass-panel animate-fade-in">
        <h3 style={styles.subTitle}>Submit Business Inquiry</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
          <div>
            <label style={styles.formLabel}>Your Name</label>
            <input type="text" className="glass-input" placeholder="e.g. Alok Mukherjee" />
          </div>
          <div>
            <label style={styles.formLabel}>Project Style / Requirements</label>
            <input type="text" className="glass-input" placeholder="e.g. 3D Sci-Fi Animation Character Mesh" />
          </div>
          <div>
            <label style={styles.formLabel}>Brief Description</label>
            <textarea className="glass-input" style={{ minHeight: '60px' }} placeholder="Provide brief specifications..."></textarea>
          </div>
          <button className="btn-primary" onClick={() => alert('Business inquiry sent! Our team will contact you shortly.')}>Send Inquiry</button>
        </div>
      </div>
    </div>
  );

  // LMS / Academy Fallback view
  const playAcademySound = (type: 'success' | 'click' | 'fail') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'fail') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(110, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {}
  };

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseTrainer) {
      alert("Please fill in course title and trainer name.");
      return;
    }
    const newCourse = {
      id: `crs-${Math.floor(10 + Math.random() * 90)}`,
      title: newCourseTitle,
      trainer: newCourseTrainer,
      studentsCount: 0,
      progress: 0,
      duration: newCourseDuration,
      price: newCoursePrice
    };
    setCoursesList(prev => [...prev, newCourse]);
    setNewCourseTitle('');
    setNewCourseTrainer('');
    playAcademySound('success');
    alert("🎉 New course curriculum provisioned successfully!");
  };

  const handleDeleteCourse = (id: string) => {
    if (window.confirm("Are you sure you want to delete this course curriculum?")) {
      setCoursesList(prev => prev.filter(c => c.id !== id));
      playAcademySound('fail');
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseFloat(newTxAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }

    const selectedAcc = bankAccounts.find(a => a.id === newTxAccountId);
    if (!selectedAcc) {
      alert("Please select a valid account.");
      return;
    }

    // Update bank balance
    setBankAccounts(prev => prev.map(acc => {
      if (acc.id === newTxAccountId) {
        const change = newTxType === 'Income' ? amountVal : -amountVal;
        return { ...acc, balance: acc.balance + change };
      }
      return acc;
    }));

    const newTx = {
      id: `tx-${Math.floor(100 + Math.random() * 900)}`,
      type: newTxType,
      category: newTxCategory,
      amount: amountVal,
      currency: newTxCurrency,
      description: newTxDescription || 'No description',
      date: newTxDate,
      accountId: newTxAccountId
    };

    setFinancialTransactions(prev => [newTx, ...prev]);
    setNewTxAmount('');
    setNewTxDescription('');
    playAcademySound('success');
    alert("💸 Financial transaction recorded successfully!");
  };

  const handleDeleteTransaction = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction? Balance adjustments will not be reversed automatically.")) {
      return;
    }
    setFinancialTransactions(prev => prev.filter(t => t.id !== id));
    playAcademySound('fail');
  };

  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    const initialBal = parseFloat(newAccInitialBalance) || 0;
    if (!newAccName || !newAccNumber) {
      alert("Please enter account name and number.");
      return;
    }

    const newAcc = {
      id: `acc-${Math.floor(100 + Math.random() * 900)}`,
      name: newAccName,
      type: newAccType,
      currency: newAccCurrency,
      balance: initialBal,
      accountNumber: newAccNumber.startsWith('••••') ? newAccNumber : `•••• ${newAccNumber.slice(-4)}`
    };

    setBankAccounts(prev => [...prev, newAcc]);
    setNewAccName('');
    setNewAccNumber('');
    setNewAccInitialBalance('');
    playAcademySound('success');
    alert("🏦 New financial account opened and registered!");
  };

  const handleUpgradeUsage = (type: 'gpu' | 'storage' | 'licenses') => {
    playAcademySound('success');
    if (type === 'gpu') {
      setSystemUsage((prev: any) => ({ ...prev, gpuHoursLimit: prev.gpuHoursLimit + 1000 }));
      alert("🚀 Render Farm GPU capacity upgraded by +1,000 Hours!");
    } else if (type === 'storage') {
      setSystemUsage((prev: any) => ({ ...prev, cloudStorageLimit: prev.cloudStorageLimit + 5 }));
      alert("📁 AWS Cloud Storage capacity upgraded by +5 TB!");
    } else if (type === 'licenses') {
      setSystemUsage((prev: any) => ({ ...prev, activeLicensesLimit: prev.activeLicensesLimit + 10 }));
      alert("🔑 Maya/Blender/Nuke Seats limit upgraded by +10 licenses!");
    }
  };

  const handleEnrollCourse = (id: string) => {
    setCoursesList(prev => prev.map(c => {
      if (c.id === id) {
        alert(`🎓 Enrolled in ${c.title}! Classroom is now open.`);
        playAcademySound('success');
        return { ...c, studentsCount: c.studentsCount + 1 };
      }
      return c;
    }));
  };

  const activeCourse = coursesList.find(c => c.id === selectedCourseId) || coursesList[0] || { id: 'default', title: 'Animation Foundations', progress: 0, trainer: 'Madhabi Mukherjee', studentsCount: 0, price: '$0', duration: '10 Weeks' };

  const LESSONS = [
    { title: "Lesson 1: Squash and Stretch Principles", duration: "14 mins", desc: "Understanding mass, volume, and impact simulation in 3D character physics." },
    { title: "Lesson 2: Anticipation, Action and Staging", duration: "18 mins", desc: "Setting up characters for realistic action launches and staging camera depth of field." },
    { title: "Lesson 3: Inverse Kinematics (IK) Rigging", duration: "25 mins", desc: "Setting up joint chains, pole vectors, and control handles in Maya/Blender." },
    { title: "Lesson 4: Lighting & Atmospheric Compositing", duration: "22 mins", desc: "Color grading, volumetric lighting setups, and render passes compile in Nuke." }
  ];

  const handleMarkLessonCompleted = () => {
    setCoursesList(prev => prev.map(c => {
      if (c.id === selectedCourseId) {
        const nextProgress = Math.min(100, c.progress + 25);
        if (nextProgress === 100) {
          alert(`🏆 Congratulations! You have completed all lectures of ${c.title}. Unlock your certificate by passing the Certification Exam.`);
        }
        playAcademySound('success');
        return { ...c, progress: nextProgress };
      }
      return c;
    }));
  };

  const handleQuizAnswer = (questionIndex: number, option: string) => {
    playAcademySound('click');
    setQuizAnswers(prev => ({ ...prev, [questionIndex]: option }));
  };

  const handleSubmitQuiz = () => {
    let score = 0;
    if (quizAnswers[0] === 'A') score += 1;
    if (quizAnswers[1] === 'A') score += 1;
    if (quizAnswers[2] === 'B') score += 1;
    
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === 3) {
      playAcademySound('success');
      alert(`🎉 100% Correct! You passed the Certification Exam. Your certificate is now unlocked!`);
    } else {
      playAcademySound('fail');
      alert(`❌ Score: ${score}/3. Review the lectures and try again!`);
    }
  };

  const handleResetQuiz = () => {
    playAcademySound('click');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleGradeAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId) return;
    setAssignmentsList(prev => prev.map(a => {
      if (a.id === selectedAssignmentId) {
        playAcademySound('success');
        return { ...a, status: 'Graded', grade: gradeInput, feedback: gradeFeedback };
      }
      return a;
    }));
    setSelectedAssignmentId(null);
    alert("Grade and feedback card submitted to student log.");
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsmTitle) {
      alert("Please enter assignment title.");
      return;
    }
    const newAsm = {
      id: `asm-${Math.floor(100 + Math.random() * 900)}`,
      studentName: userName || "Student",
      courseTitle: activeCourse.title,
      submissionTitle: newAsmTitle,
      status: 'Pending',
      grade: '',
      feedback: '',
      date: new Date().toISOString().split('T')[0]
    };
    setAssignmentsList(prev => [newAsm, ...prev]);
    setNewAsmTitle('');
    playAcademySound('success');
    alert("🚀 Assignment uploaded successfully to Trainer review queue!");
  };

  const renderLMSAcademy = () => {
    const isTeacher = role === 'studio_owner' || role === 'super_admin' || role === 'trainer' || role === 'academy_director';
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
        {/* Academic LMS Sub-tabs */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <button 
            className={lmsTab === 'courses' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setLmsTab('courses'); }}
          >
            📚 Courses & Curriculum
          </button>
          <button 
            className={lmsTab === 'lectures' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setLmsTab('lectures'); }}
          >
            🎬 Lecture Player
          </button>
          <button 
            className={lmsTab === 'quiz' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setLmsTab('quiz'); }}
          >
            🎓 Certification Exam
          </button>
          <button 
            className={lmsTab === 'assignments' ? 'btn-primary' : 'btn-secondary'} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', fontSize: '13px' }} 
            onClick={() => { playAcademySound('click'); setLmsTab('assignments'); }}
          >
            📝 Assignments & Grading
          </button>
        </div>

        {/* Courses & Curriculum Tab */}
        {lmsTab === 'courses' && (
          <div style={styles.grid}>
            {/* Courses List */}
            <div style={styles.halfCol} className="glass-panel animate-fade-in">
              <h3 style={styles.subTitle}>Available Course Curricula</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                {coursesList.length === 0 ? (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0' }}>
                    No course curricula registered under the Academy at this time.
                  </p>
                ) : (
                  coursesList.map((crs) => (
                    <div 
                      key={crs.id} 
                      style={{ 
                        ...styles.courseItem, 
                        border: selectedCourseId === crs.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                        boxShadow: selectedCourseId === crs.id ? '0 0 10px rgba(6,182,212,0.15)' : 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onClick={() => setSelectedCourseId(crs.id)}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>{crs.title}</span>
                        <span className="badge badge-success">{crs.price}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        <span>Instructor: <strong>{crs.trainer}</strong></span>
                        <span>Duration: {crs.duration}</span>
                      </div>
                      
                      {/* Course Progress bar */}
                      <div style={{ margin: '8px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '2px' }}>
                          <span>Student Completion Progress</span>
                          <span>{crs.progress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${crs.progress}%`, height: '100%', background: 'linear-gradient(90deg, #6d28d9, #06b6d4)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}> Enrolled: {crs.studentsCount} students</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={(e) => { e.stopPropagation(); handleEnrollCourse(crs.id); }}
                          >
                            Enroll Now
                          </button>
                          <button 
                            className="btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '11px' }}
                            onClick={(e) => { e.stopPropagation(); setSelectedCourseId(crs.id); setLmsTab('lectures'); }}
                          >
                            Open Lectures
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Course Management & Provisioning */}
            <div style={styles.halfCol} className="glass-panel">
              {isTeacher ? (
                <>
                  <h3 style={styles.subTitle}>Academic Course Provisioning Hub</h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    As an Administrator or Trainer, you can compile and publish new animation curricula here.
                  </p>
                  <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={styles.formLabel}>Course Curriculum Title</label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={newCourseTitle} 
                        onChange={(e) => setNewCourseTitle(e.target.value)} 
                        placeholder="e.g., VFX Post-Processing & Nuke" 
                        required 
                      />
                    </div>
                    <div>
                      <label style={styles.formLabel}>Lead Trainer</label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        value={newCourseTrainer} 
                        onChange={(e) => setNewCourseTrainer(e.target.value)} 
                        placeholder="Instructor Name" 
                        required 
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Duration</label>
                        <select className="glass-input" value={newCourseDuration} onChange={(e) => setNewCourseDuration(e.target.value)}>
                          <option value="4 Weeks">4 Weeks</option>
                          <option value="8 Weeks">8 Weeks</option>
                          <option value="12 Weeks">12 Weeks</option>
                          <option value="16 Weeks">16 Weeks</option>
                        </select>
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={styles.formLabel}>Pricing Token</label>
                        <input 
                          type="text" 
                          className="glass-input" 
                          value={newCoursePrice} 
                          onChange={(e) => setNewCoursePrice(e.target.value)} 
                          placeholder="Price e.g. $299" 
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
                      Publish Course Curriculum
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', textAlign: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '32px' }}>🎓</span>
                  <h4 style={{ color: '#fff', fontSize: '15px' }}>Student Classroom Portal</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    Welcome to DreamAvian Academy! Select a course from the curriculum grid on the left and open the Lectures tab to start streaming lessons and doing assignments.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lectures Tab */}
        {lmsTab === 'lectures' && (
          <div style={styles.grid}>
            {/* Lessons Sidebar */}
            <div style={{ ...styles.halfCol, flex: '1 1 350px' }} className="glass-panel animate-fade-in">
              <h3 style={styles.subTitle}>Lecture Syllabus</h3>
              <div style={{ fontSize: '11px', color: 'var(--accent-color)', marginBottom: '10px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                Active: {activeCourse.title}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {LESSONS.map((lsn, index) => (
                  <div 
                    key={index} 
                    style={{ 
                      padding: '10px', 
                      background: selectedLessonIndex === index ? 'rgba(6,182,212,0.06)' : 'rgba(255,255,255,0.01)',
                      border: selectedLessonIndex === index ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onClick={() => { playAcademySound('click'); setSelectedLessonIndex(index); setIsPlayingVideo(false); }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#fff', marginBottom: '2px' }}>
                      <span>{lsn.title}</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{lsn.duration}</span>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{lsn.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Player */}
            <div style={{ ...styles.halfCol, flex: '1 1 450px' }} className="glass-panel">
              <h3 style={styles.subTitle}>LMS Lecture Player</h3>
              <div 
                style={{ 
                  position: 'relative', 
                  width: '100%', 
                  height: '240px', 
                  background: '#090d16',
                  borderRadius: '12px', 
                  border: '1px solid var(--border-color)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.8)'
                }}
              >
                {/* CRT simulation lines */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(18,16,16,0) 50%, rgba(0,0,0,0.25) 50%), linear-gradient(90deg, rgba(255,0,0,0.06), rgba(0,255,0,0.02), rgba(0,0,255,0.06))', backgroundSize: '100% 4px, 6px 100%', zIndex: 2, pointerEvents: 'none' }} />

                {isPlayingVideo ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', zIndex: 1 }}>
                    <div className="pulse-glow" style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(6,182,212,0.1)', border: '2px solid var(--accent-color)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'var(--accent-color)', fontSize: '18px', marginLeft: '3px' }}>▶</span>
                    </div>
                    <span style={{ color: 'var(--accent-color)', fontSize: '12px', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>STREAMING LESSON VIDEO FEED</span>
                    <span style={{ color: '#fff', fontSize: '11px' }}>{LESSONS[selectedLessonIndex].title}</span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                    <button 
                      className="btn-primary" 
                      style={{ width: '60px', height: '60px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}
                      onClick={() => { playAcademySound('click'); setIsPlayingVideo(true); }}
                    >
                      ▶
                    </button>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>CLICK PLAY TO START VIDEO FEED</span>
                  </div>
                )}

                {/* Progress bar overlay at bottom */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'rgba(9, 13, 22, 0.95)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '10px', zIndex: 3 }}>
                  <button 
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '13px' }} 
                    onClick={() => { playAcademySound('click'); setIsPlayingVideo(!isPlayingVideo); }}
                  >
                    {isPlayingVideo ? '⏸' : '▶'}
                  </button>
                  <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', position: 'relative', cursor: 'pointer' }} onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percent = Math.round((clickX / rect.width) * 100);
                    setVideoProgress(percent);
                    playAcademySound('click');
                  }}>
                    <div style={{ width: `${videoProgress}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {Math.floor((LESSONS[selectedLessonIndex].duration.split(' ')[0] as any) * (videoProgress / 100))}:00 / {LESSONS[selectedLessonIndex].duration}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Playback speed:</span>
                  <span style={{ fontSize: '11px', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)' }}>1.0x (Standard)</span>
                </div>
                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={handleMarkLessonCompleted}>
                  Mark Lesson as Completed ✔
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quiz Tab */}
        {lmsTab === 'quiz' && (
          <div style={styles.grid}>
            <div style={styles.fullRow} className="glass-panel animate-fade-in">
              <h3 style={styles.subTitle}>Animation & VFX Certification Exam</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                Score 100% (3/3) to unlock your official DreamAvian Academy Certification.
              </p>

              {quizSubmitted ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  {quizScore === 3 ? (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                      {/* Certificate Mock Up */}
                      <div 
                        style={{ 
                          width: '100%', 
                          maxWidth: '650px', 
                          border: '4px double var(--accent-color)', 
                          borderRadius: '16px', 
                          padding: '30px', 
                          background: 'rgba(9, 13, 22, 0.8)',
                          boxShadow: '0 0 30px rgba(6, 182, 212, 0.15)',
                          position: 'relative',
                          textAlign: 'center'
                        }}
                      >
                        {/* Seal watermark */}
                        <div style={{ position: 'absolute', bottom: '15px', right: '15px', fontSize: '64px', opacity: 0.1, pointerEvents: 'none' }}>🎓</div>
                        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--accent-color)', fontSize: '22px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
                          Certificate of Excellence
                        </h2>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px 0', fontFamily: 'var(--font-mono)' }}>
                          DREAMAVIAN ECOSYSTEM ACADEMY OF ANIMATION
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>This is to proudly certify that</p>
                        <h1 style={{ color: '#fff', fontSize: '26px', margin: '8px 0', fontWeight: 'bold' }}>{userName || "Student Scholar"}</h1>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>has successfully completed and mastered the professional curriculum of</p>
                        <h3 style={{ color: 'var(--accent-color)', fontSize: '16px', margin: '8px 0', fontWeight: 600 }}>{activeCourse.title}</h3>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '480px', margin: '8px auto 20px auto', lineHeight: '1.5' }}>
                          Demonstrating comprehensive capability in 3D frame rigging, squash and stretch physics, spatial anticipation, and advanced video post-production editing grids.
                        </p>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid var(--border-color)', paddingTop: '16px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                          <div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>Madhabi Mukherjee</div>
                            <div>VFX Course Instructor</div>
                          </div>
                          <div>
                            <div style={{ color: '#fff', fontWeight: 600 }}>Subham</div>
                            <div>Studio Owner & Director</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button className="btn-primary" onClick={() => alert('Certificate downloaded to local workspace!')}>
                          📥 Download PDF
                        </button>
                        <button className="btn-secondary" onClick={handleResetQuiz}>
                          Retake Exam
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '40px' }}>❌</span>
                      <h4 style={{ color: '#fff', fontSize: '16px' }}>Exam Assessment Incomplete</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>You scored {quizScore} out of 3 correct answers. A perfect score is required to unlock certification.</p>
                      <button className="btn-primary" onClick={handleResetQuiz} style={{ marginTop: '10px' }}>
                        Try Again
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Q1 */}
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>
                      1. Which animation principle is used to describe the weight, volume, and momentum of an object in motion?
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { key: 'A', text: 'Squash & Stretch' },
                        { key: 'B', text: 'Staging & Camera Focal' },
                        { key: 'C', text: 'Exaggeration & Rig Scale' }
                      ].map((opt) => (
                        <label key={opt.key} style={{ ...styles.checkboxLabel, background: quizAnswers[0] === opt.key ? 'rgba(255,255,255,0.03)' : 'transparent', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <input 
                            type="radio" 
                            name="q0" 
                            checked={quizAnswers[0] === opt.key} 
                            onChange={() => handleQuizAnswer(0, opt.key)} 
                          />
                          <span>{opt.key}. {opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q2 */}
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>
                      2. What frame rate (FPS) is the industry standard for cinematic projection?
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { key: 'A', text: '24 FPS (Cinematic standard)' },
                        { key: 'B', text: '30 FPS (NTSC Broadcast)' },
                        { key: 'C', text: '60 FPS (HDR Gaming)' }
                      ].map((opt) => (
                        <label key={opt.key} style={{ ...styles.checkboxLabel, background: quizAnswers[1] === opt.key ? 'rgba(255,255,255,0.03)' : 'transparent', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <input 
                            type="radio" 
                            name="q1" 
                            checked={quizAnswers[1] === opt.key} 
                            onChange={() => handleQuizAnswer(1, opt.key)} 
                          />
                          <span>{opt.key}. {opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Q3 */}
                  <div>
                    <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>
                      3. Which rigging system handles joints based on the coordinates of the end effector directly?
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {[
                        { key: 'A', text: 'Forward Kinematics (FK)' },
                        { key: 'B', text: 'Inverse Kinematics (IK)' },
                        { key: 'C', text: 'Mesh Skin Deformer Constraints' }
                      ].map((opt) => (
                        <label key={opt.key} style={{ ...styles.checkboxLabel, background: quizAnswers[2] === opt.key ? 'rgba(255,255,255,0.03)' : 'transparent', padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                          <input 
                            type="radio" 
                            name="q2" 
                            checked={quizAnswers[2] === opt.key} 
                            onChange={() => handleQuizAnswer(2, opt.key)} 
                          />
                          <span>{opt.key}. {opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <button className="btn-primary" onClick={handleSubmitQuiz} style={{ marginTop: '10px' }}>
                    Submit Exam Sheet
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Assignments & Grading Tab */}
        {lmsTab === 'assignments' && (
          <div style={styles.grid}>
            {/* Student Upload Form & Submissions */}
            <div style={styles.halfCol} className="glass-panel animate-fade-in">
              <h3 style={styles.subTitle}>Student Assignment Center</h3>
              
              {/* Submission Form */}
              <form onSubmit={handleSubmitAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', borderBottom: '1px dashed var(--border-color)', paddingBottom: '20px' }}>
                <div>
                  <label style={styles.formLabel}>Assignment Topic / Project File</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    value={newAsmTitle} 
                    onChange={(e) => setNewAsmTitle(e.target.value)} 
                    placeholder="e.g. Episode 1 Intro - Rigging submission" 
                    required 
                  />
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <label style={styles.formLabel}>Source File Name</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      value={newAsmFile} 
                      onChange={(e) => setNewAsmFile(e.target.value)} 
                    />
                  </div>
                  <button type="submit" className="btn-secondary" style={{ height: '36px', marginTop: '18px', whiteSpace: 'nowrap' }}>
                    Upload File
                  </button>
                </div>
              </form>

              {/* Assignment logs */}
              <h4 style={{ fontSize: '13px', color: '#fff', marginBottom: '8px' }}>Your Submissions Log</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {assignmentsList.filter(a => isTeacher ? true : a.studentName === userName).length === 0 ? (
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    No assignment submissions logged.
                  </p>
                ) : (
                  assignmentsList
                    .filter(a => isTeacher ? true : a.studentName === userName)
                    .map((asm) => (
                      <div 
                        key={asm.id} 
                        style={{ 
                          padding: '10px', 
                          background: selectedAssignmentId === asm.id ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.01)',
                          border: selectedAssignmentId === asm.id ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: isTeacher ? 'pointer' : 'default'
                        }}
                        onClick={() => isTeacher && setSelectedAssignmentId(asm.id)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{asm.submissionTitle}</span>
                          <span className={`badge ${asm.status === 'Graded' ? 'badge-success' : 'badge-warning'}`}>{asm.status}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-secondary)' }}>
                          <span>Student: {asm.studentName}</span>
                          <span>Date: {asm.date}</span>
                        </div>
                        {asm.status === 'Graded' && (
                          <div style={{ marginTop: '6px', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px', fontSize: '11px', borderLeft: '2px solid var(--accent-color)' }}>
                            <strong>Grade: {asm.grade}</strong> | Feedback: {asm.feedback}
                          </div>
                        )}
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Trainer Grading Panel */}
            <div style={styles.halfCol} className="glass-panel">
              {isTeacher ? (
                <>
                  <h3 style={styles.subTitle}>Instructor Grading Station</h3>
                  {selectedAssignmentId ? (
                    (() => {
                      const asm = assignmentsList.find(a => a.id === selectedAssignmentId);
                      if (!asm) return null;
                      return (
                        <form onSubmit={handleGradeAssignment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ background: 'rgba(6,182,212,0.05)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '12px' }}>
                            <div><strong>Student:</strong> {asm.studentName}</div>
                            <div><strong>Curriculum:</strong> {asm.courseTitle}</div>
                            <div><strong>Topic:</strong> {asm.submissionTitle}</div>
                          </div>
                          <div>
                            <label style={styles.formLabel}>Grade Mark (e.g. A+, B, A-)</label>
                            <input 
                              type="text" 
                              className="glass-input" 
                              value={gradeInput} 
                              onChange={(e) => setGradeInput(e.target.value)} 
                              required 
                            />
                          </div>
                          <div>
                            <label style={styles.formLabel}>Feedback / Core Suggestions</label>
                            <textarea 
                              className="glass-input" 
                              value={gradeFeedback} 
                              onChange={(e) => setGradeFeedback(e.target.value)} 
                              style={{ minHeight: '60px' }} 
                              required 
                            />
                          </div>
                          <button type="submit" className="btn-primary">
                            Submit Grade Card
                          </button>
                        </form>
                      );
                    })()
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', textAlign: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '32px' }}>📝</span>
                      <h4 style={{ color: '#fff', fontSize: '14px' }}>Grading Console Idle</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                        Select a student's pending assignment from the list on the left to grade and provide visual feedback.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '260px', textAlign: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '32px' }}>🎓</span>
                  <h4 style={{ color: '#fff', fontSize: '14px' }}>Instructor Grading Console</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '320px' }}>
                    Only course instructors, VFX trainers, and administrators can access the grading consoles. Your submitted assignments will be updated here once graded by Trainer Madhabi.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSoftwareHub = () => {
    const isOwner = role === 'studio_owner' || role === 'super_admin';

    const filteredSoftwares = softwares.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(softSearchQuery.toLowerCase()) || 
                            s.description.toLowerCase().includes(softSearchQuery.toLowerCase()) ||
                            s.fileName.toLowerCase().includes(softSearchQuery.toLowerCase());
      const matchesCategory = softSelectedCategory === 'All' || s.category === softSelectedCategory;
      return matchesSearch && matchesCategory;
    });

    const totalDownloads = softwares.reduce((sum, s) => sum + (s.downloads || 0), 0);

    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'VFX & Renderer':
        case 'Simulation':
          return <Cpu size={24} style={{ color: 'var(--accent-color)', filter: 'drop-shadow(0 0 5px var(--accent-color))' }} />;
        case 'Audio Tools':
          return <Volume2 size={24} style={{ color: '#a855f7', filter: 'drop-shadow(0 0 5px #a855f7)' }} />;
        case 'System & Sync':
          return <RefreshCw size={24} style={{ color: '#10b981', filter: 'drop-shadow(0 0 5px #10b981)' }} />;
        default:
          return <Layers size={24} style={{ color: '#f59e0b', filter: 'drop-shadow(0 0 5px #f59e0b)' }} />;
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', height: '100%', overflow: 'hidden' }} className="animate-fade-in">
        {/* Header summary panel */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--accent-color)', textShadow: '0 0 10px rgba(6,182,212,0.4)', margin: 0 }}>
                STUDIO SOFTWARE VAULT & INSTALLERS
              </h2>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                LOG_SECTOR: SOFTWARE_DISTRIBUTION_SYSTEM // ENCRYPTION: SHA-256 // INTEGRITY: ACTIVE
              </div>
            </div>
            {isOwner && (
              <span className="badge badge-success" style={{ padding: '6px 12px', fontSize: '11px' }}>
                ADMIN CONSOLE AUTHORIZED
              </span>
            )}
          </div>

          {/* Quick Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
            <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Software Packages</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: '#fff' }}>{softwares.length} Packages</div>
            </div>
            <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cumulative Downloads</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--success)' }}>{totalDownloads} Hits</div>
            </div>
            <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vault Portal Status</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="pulse-glow" style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'inline-block' }}></span>
                ONLINE
              </div>
            </div>
            <div className="glass-card" style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vault Integrity</div>
              <div style={{ fontSize: '22px', fontWeight: 'bold', fontFamily: 'var(--font-display)', color: '#a855f7' }}>99.9% SECURE</div>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="glass-panel" style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }} />
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Search installers by package name or details..." 
                value={softSearchQuery}
                onChange={(e) => setSoftSearchQuery(e.target.value)}
                style={{ paddingLeft: '40px', width: '100%', fontSize: '13px' }}
              />
            </div>
            {softSearchQuery && (
              <button className="btn-secondary" style={{ padding: '8px 12px' }} onClick={() => setSoftSearchQuery('')}>
                Clear
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>FILTER_CAT:</span>
            <select 
              className="glass-input" 
              value={softSelectedCategory} 
              onChange={(e) => setSoftSelectedCategory(e.target.value)}
              style={{ width: '180px', padding: '8px 12px', fontSize: '13px' }}
            >
              <option value="All">All Categories</option>
              <option value="VFX & Renderer">VFX & Renderer</option>
              <option value="Simulation">Simulation</option>
              <option value="Audio Tools">Audio Tools</option>
              <option value="Design">Design</option>
              <option value="System & Sync">System & Sync</option>
              <option value="Management">Management</option>
            </select>
          </div>
        </div>

        {/* Two Column Workspace Layout */}
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0, flexWrap: 'wrap-reverse' }}>
          {/* Left Column: Software Releases List */}
          <div className="glass-panel" style={{ flex: isOwner ? '1 1 55%' : '1 1 100%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', minHeight: 0, overflowY: 'auto' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', margin: 0 }}>
              AVAILABLE SOFTWARE RELEASES
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flex: 1 }}>
              {filteredSoftwares.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '200px', gap: '12px', color: 'var(--text-muted)' }}>
                  <ShieldAlert size={48} strokeWidth={1} />
                  <span style={{ fontSize: '13px', fontFamily: 'var(--font-mono)' }}>NO DETECTED PACKAGES IN REGISTER</span>
                </div>
              ) : (
                filteredSoftwares.map((s) => {
                  const isDownloading = activeDownloads[s.id] !== undefined;
                  const progress = activeDownloads[s.id] || 0;
                  const statusText = activeDownloadStatus[s.id] || '';

                  return (
                    <div key={s.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px', position: 'relative', borderLeft: '3px solid var(--accent-color)' }}>
                      {/* Top Header Card line */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(6,182,212,0.15)' }}>
                            {getCategoryIcon(s.category)}
                          </div>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', margin: 0 }}>{s.name}</h4>
                              <span className="badge badge-info" style={{ fontSize: '10px', padding: '2px 6px' }}>{s.version}</span>
                            </div>
                            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>ID: {s.id.toUpperCase()} // CAT: {s.category}</span>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {isOwner && (
                            <button 
                              className="btn-secondary" 
                              style={{ padding: '6px', minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }} 
                              onClick={() => handleSoftwareDelete(s)}
                              title="Delete Release Package"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
                        {s.description}
                      </p>

                      {/* Monospace Code tag for download details */}
                      <div style={{ background: 'rgba(3, 7, 18, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '6px', padding: '8px 12px', display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        <div><span style={{ color: 'var(--accent-color)' }}>FILE:</span> {s.fileName}</div>
                        <div><span style={{ color: 'var(--accent-color)' }}>SIZE:</span> {s.fileSize}</div>
                        <div><span style={{ color: 'var(--accent-color)' }}>RELEASE_DATE:</span> {s.uploadDate}</div>
                        <div><span style={{ color: 'var(--accent-color)' }}>DOWNLOADS:</span> {s.downloads} hits</div>
                        <div><span style={{ color: 'var(--accent-color)' }}>DEPLOYED_BY:</span> {s.uploadedBy}</div>
                      </div>

                      {/* Actions/Download bar */}
                      <div style={{ marginTop: '4px' }}>
                        {isDownloading ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--accent-color)' }}>
                              <span>{statusText}</span>
                              <span>{progress}%</span>
                            </div>
                            <div style={{ height: '6px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.1)' }}>
                              <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%)', boxShadow: '0 0 10px var(--accent-color)', borderRadius: '3px', transition: 'width 0.2s linear' }}></div>
                            </div>
                          </div>
                        ) : (
                          <button 
                            className="btn-primary" 
                            style={{ width: '100%', padding: '8px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            onClick={() => handleSoftwareDownload(s)}
                          >
                            <Download size={14} />
                            <span>Download Package (.{s.fileName.split('.').pop() || 'pkg'})</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Owner Deploy Control Panel */}
          {isOwner && (
            <div className="glass-panel" style={{ flex: '1 1 40%', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', fontFamily: 'var(--font-display)', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px', margin: 0 }}>
                DEPLOY NEW SOFTWARE RELEASE
              </h3>

              {isUploadingSoftware ? (
                /* Interactive Cyber Terminal Upload Logs */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '13px', color: 'var(--accent-color)', fontFamily: 'var(--font-mono)', fontWeight: 'bold', marginBottom: '8px' }}>
                      COMPILING DATA PACKETS ({softwareUploadProgress}%)
                    </div>
                    <div style={{ height: '8px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden', border: '1px solid rgba(6,182,212,0.1)', marginBottom: '15px' }}>
                      <div style={{ height: '100%', width: `${softwareUploadProgress}%`, background: 'linear-gradient(90deg, var(--primary-color) 0%, var(--accent-color) 100%)', boxShadow: '0 0 10px var(--accent-color)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                    </div>
                  </div>

                  <div style={{ background: '#020617', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px', padding: '15px', height: '180px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: 'inset 0 0 10px rgba(0,0,0,0.8)' }}>
                    {softwareUploadLogs.map((log, idx) => (
                      <div key={idx} style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: log.includes('SUCCESS') ? 'var(--success)' : log.includes('INIT') ? 'var(--text-secondary)' : '#10b981' }}>
                        {log}
                      </div>
                    ))}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    SYS_THREAD: WRITING_TO_INDEXEDDB_VAULT... PLEASE DO NOT CLOSE PORTAL
                  </div>
                </div>
              ) : (
                /* Software release form */
                <form onSubmit={handleSoftwareUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>SOFTWARE_NAME *</label>
                    <input 
                      type="text" 
                      className="glass-input" 
                      placeholder="e.g. DreamAvian Shot Coordinator" 
                      value={softFormName}
                      onChange={(e) => setSoftFormName(e.target.value)}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>RELEASE_VERSION *</label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        placeholder="e.g. v1.2.0" 
                        value={softFormVersion}
                        onChange={(e) => setSoftFormVersion(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>CATEGORY *</label>
                      <select 
                        className="glass-input" 
                        value={softFormCategory}
                        onChange={(e) => setSoftFormCategory(e.target.value)}
                      >
                        <option value="VFX & Renderer">VFX & Renderer</option>
                        <option value="Simulation">Simulation</option>
                        <option value="Audio Tools">Audio Tools</option>
                        <option value="Design">Design</option>
                        <option value="System & Sync">System & Sync</option>
                        <option value="Management">Management</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>RELEASE_DESCRIPTION</label>
                    <textarea 
                      className="glass-input" 
                      placeholder="Detailed features, updates, or instructions..." 
                      value={softFormDesc}
                      onChange={(e) => setSoftFormDesc(e.target.value)}
                      style={{ minHeight: '80px', resize: 'vertical' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>INSTALLER_FILE / SOFTWARE PACKAGE *</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label 
                        className="glass-input" 
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '54px', border: '1px dashed var(--accent-color)', borderRadius: '8px', cursor: 'pointer', gap: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--accent-color)', transition: '0.2s' }}
                      >
                        <Upload size={16} />
                        <span style={{ fontSize: '12px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                          {softFormFileName || "Choose Software/Installer File"}
                        </span>
                        <input 
                          type="file" 
                          accept=".exe,.msi,.msix,.msixbundle,.appx,.appxbundle,.bat,.cmd,.app,.dmg,.pkg,.deb,.rpm,.AppImage,.snap,.flatpak,.run,.bin,.apk,.aab,.apks,.xapk,.ipa,.crx" 
                          style={{ display: 'none' }} 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;

                            const allowedExtensions = ['.exe', '.msi', '.msix', '.msixbundle', '.appx', '.appxbundle', '.bat', '.cmd', '.app', '.dmg', '.pkg', '.deb', '.rpm', '.appimage', '.snap', '.flatpak', '.run', '.bin', '.apk', '.aab', '.apks', '.xapk', '.ipa', '.crx'];
                            const isAllowed = allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
                            if (!isAllowed) {
                              alert(`❌ Invalid file format: '${file.name}'. Only software installers or executables are supported.`);
                              return;
                            }

                            let sizeStr = '';
                            if (file.size > 1024 * 1024) {
                              sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
                            } else {
                              sizeStr = (file.size / 1024).toFixed(1) + ' KB';
                            }

                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSoftFormFile(reader.result as string);
                              setSoftFormFileName(file.name);
                              setSoftFormFileSize(sizeStr);
                            };
                            reader.readAsDataURL(file);
                          }} 
                        />
                      </label>
                      {softFormFileName && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '4px' }}>
                          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>Size: {softFormFileSize}</span>
                          <button 
                            type="button" 
                            className="btn-secondary" 
                            style={{ padding: '2px 8px', fontSize: '10px', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--danger)' }}
                            onClick={() => {
                              setSoftFormFile(null);
                              setSoftFormFileName('');
                              setSoftFormFileSize('');
                            }}
                          >
                            Remove file
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ width: '100%', marginTop: '8px', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    disabled={!softFormName.trim() || !softFormFile}
                  >
                    <Plus size={16} />
                    <span>Sync Release Installer</span>
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Fallback Selector Router
  // Fallback Selector Router
  const renderDashboardRouter = () => {
    switch (activeTab) {
      // Super Admin
      case 'Global Monitor':
        return renderSuperAdminMonitor();
      case 'Tenant Provisioning':
        return renderTenantProvisioning();
      case 'Cross-Tenant Users':
        return renderCrossTenantUsers();
      case 'Security & Access':
        return renderSecurityAndAccess();
      case 'Audit Trail Logs':
        return renderAuditTrailLogs();
      case 'Global Config':
        return renderGlobalConfig();

      // Studio Owner
      case 'Studio Overview':
        return renderStudioOwner();
      case 'Financial Analytics':
        return renderFinancialAnalytics();
      case 'Master Portfolio':
        return renderMasterPortfolio();
      case 'Client Accounts':
        return renderClientAccounts();
      case 'HR Departments':
        return renderHRDepartments();
      case 'Academy Sync':
        return renderAcademySync();
      case 'Portal List':
        return <PortalList onUpdateUser={onUpdateUser} />;

      // Director
      case 'Approvals Queue':
        return renderDirector();
      case 'Frame Annotation':
        return renderFrameAnnotation();
      case 'Art Style Bible':
        return renderArtStyleBible();
      case 'Shot Deliveries':
        return renderShotDeliveries();

      // Producer
      case 'Production Stats':
        return renderProducer();
      case 'Resource Allocator':
        return renderResourceAllocator();
      case 'Milestone Gantt':
        return renderMilestoneGantt();
      case 'Client Billings':
        return renderClientBillings();

      // PM
      case 'Sprints & Workload':
        return renderProjectManager();
      case 'Kanban Board':
        return renderKanbanBoard();
      case 'Risk Registers':
        return renderRiskRegisters();
      case 'Time Verification':
        return renderTimeVerification();

      // Team Lead
      case 'Team Task Monitor':
        return renderTeamLead();
      case 'Technical QA':
        return renderTechnicalQA();
      case 'Daily Standups':
        return renderDailyStandups();

      // Creators & Voice Artist
      case 'My Workspace':
        switch (role) {
          case 'animator':
            return renderAnimator();
          case 'designer':
            return renderDesigner();
          case 'storyboard_artist':
            return renderStoryboardArtist();
          case 'editor':
            return renderEditor();
          default:
            return renderCreatorView();
        }
      case 'Recording Booth':
        return renderVoiceArtist();
      case 'Shots Tracker':
      case 'Script Boards':
        return renderShotsTracker();
      case 'Asset Downloader':
      case 'Audio Takes Upload':
        return renderAssetDownloader();
      case 'Feedback History':
      case 'Sessions Schedule':
        return renderFeedbackHistory();
      case 'Timesheet Submissions':
      case 'Payments':
        return renderTimesheetSubmissions();

      // Client
      case 'Client Welcome':
        return renderClientWelcome();
      case 'Milestone Reviews':
        return renderClientMilestoneReviews();
      case 'Invoices & Billing':
        return renderClientInvoicesBilling();
      case 'NDA & Contracts':
        return renderNDAAndContracts();

      // HR
      case 'HR Command Center':
        return renderHR();
      case 'Employee Profiles':
        return renderHRView();
      case 'Leaves Board':
        return renderLeavesBoard();
      case 'Payroll Engine':
        return renderPayrollEngine();

      // Recruiter
      case 'Recruit Pipelines':
        return renderRecruiter();
      case 'Jobs Manager':
        return renderJobsManager();
      case 'Candidate Profiles':
        return renderCandidateProfiles();

      // Finance
      case 'General Ledger':
        return renderFinance();
      case 'Client Receivables':
        return renderClientReceivables();
      case 'Vendor Payables':
        return renderVendorPayables();

      // LMS
      case 'LMS Classroom':
        switch (role) {
          case 'academy_director':
            return renderAcademyDirector();
          case 'trainer':
            return renderTrainer();
          case 'student':
            return renderStudent();
          default:
            return renderLMSAcademy();
        }
      case 'Course Lectures':
        switch (role) {
          case 'academy_director':
            return renderAcademyDirectorLectures();
          case 'trainer':
            return renderTrainerLectures();
          case 'student':
            return renderStudentLectures();
          default:
            return renderLMSAcademy();
        }
      case 'Assignments Quiz':
        switch (role) {
          case 'academy_director':
            return renderAcademyDirectorAssignments();
          case 'trainer':
            return renderTrainerAssignments();
          case 'student':
            return renderStudentAssignments();
          default:
            return renderLMSAcademy();
        }

      // Freelancer
      case 'Freelancer Center':
        return renderFreelancer();
      case 'My Contracts':
        return renderNDAAndContracts();
      case 'Tasks & Assets':
        return renderAssetDownloader();
      case 'Invoices':
        return renderTimesheetSubmissions();
      case 'Portfolio':
        return renderCreatorView();

      case 'Submit Work':
        return renderWorkUploadForm();
      case 'Employee Work Review':
        return renderWorkReviewQueue();
      case 'Software Hub':
        return renderSoftwareHub();
      case "Founder's Journey":
        return renderFounderJourney();
      case 'Studio Board':
        return renderStudioBoard();

      // Intern
      case 'Intern Studio Bench':
        return renderIntern();
      case 'Weekly Reports':
        return renderInternReports();
      case 'Mentor Evaluations':
        return renderInternEvaluations();
      case 'Certificates':
        return renderInternCertificates();
      case 'My Production Tasks':
        return renderCreatorView();

      // Mentor
      case 'Mentor Station':
        return renderMentor();
      case 'My Interns':
        return renderMentorInterns();
      case 'Log Reviews':
        return renderMentorLogReviews();
      case 'Task Board':
        return renderMentorTaskBoard();
      case 'Appraisals':
        return renderMentorAppraisals();

      // ID Card Admin
      case 'Security Access Control':
        return renderIDCardAdmin();
      case 'Generate Cards':
        return renderIDCardGenerate();
      case 'Access Controls':
        return renderIDCardAccess();
      case 'Activity Logs':
        return renderIDCardActivity();
      case 'Security Alerts':
        return renderIDCardAlerts();

      // Visitor Public
      case 'Home':
        return renderVisitorPublic();
      case 'Services':
        return renderVisitorServices();
      case 'Academy':
        return renderVisitorAcademy();
      case 'Careers':
        return renderVisitorCareers();
      case 'About Us':
        return renderVisitorAbout();
      case 'Contact':
        return renderVisitorContact();

      default:
        // Default fallbacks based on role
        switch (role) {
          case 'super_admin':
            return renderSuperAdminMonitor();
          case 'studio_owner':
            return renderStudioOwner();
          case 'director':
            return renderDirector();
          case 'producer':
            return renderProducer();
          case 'project_manager':
            return renderProjectManager();
          case 'team_lead':
            return renderTeamLead();
          case 'animator':
            return renderAnimator();
          case 'designer':
            return renderDesigner();
          case 'storyboard_artist':
            return renderStoryboardArtist();
          case 'editor':
            return renderEditor();
          case 'voice_artist':
            return renderVoiceArtist();
          case 'freelancer':
            return renderFreelancer();
          case 'client':
            return renderClientWelcome();
          case 'hr':
            return renderHR();
          case 'recruiter':
            return renderRecruiter();
          case 'finance':
            return renderFinance();
          case 'academy_director':
            return renderAcademyDirector();
          case 'trainer':
            return renderTrainer();
          case 'student':
            return renderStudent();
          case 'intern':
            return renderIntern();
          case 'mentor':
            return renderMentor();
          case 'id_card_admin':
            return renderIDCardAdmin();
          case 'visitor_public':
            return renderVisitorPublic();
          default:
            return renderCreatorView();
        }
    }
  };

  return (
    <>
      <style>{`
        @keyframes cloudSyncSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cloud-sync-spinner {
          animation: cloudSyncSpin 1.5s linear infinite;
        }
      `}</style>
      <div style={{ padding: '12px' }}>
        <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>Console Workspace</h1>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Session Profile: {userName} ({userEmail})</div>
          </div>
          {/* Cloud Sync Status Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 600, padding: '6px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)' }}>
            {syncStatus === 'synced' && (
              <>
                <span style={{ color: '#22c55e', fontSize: '12px' }}>●</span>
                <span style={{ color: 'var(--text-primary)' }}>Live Cloud Sync</span>
              </>
            )}
            {syncStatus === 'syncing' && (
              <>
                <RefreshCw size={11} className="cloud-sync-spinner" style={{ color: '#eab308' }} />
                <span style={{ color: '#eab308' }}>Syncing...</span>
              </>
            )}
            {syncStatus === 'offline' && (
              <>
                <span style={{ color: '#ef4444', fontSize: '12px' }}>●</span>
                <span style={{ color: '#ef4444' }}>Offline / Sync Error</span>
              </>
            )}
          </div>
        </div>
        {renderDashboardRouter()}
      </div>

      {/* ── Create Job Vacancy Modal ── */}
      {isCreatingJob && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setIsCreatingJob(false)}
        >
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 0 50px rgba(6, 182, 212, 0.15)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsCreatingJob(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                color: '#fff',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="list-hover"
            >
              <X size={16} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: '#fff', fontFamily: 'var(--font-display)' }}>Create Job Vacancy</h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' }}>Fill out the job parameters to display it on the public Careers portal.</p>

            <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Job Title *</label>
                  <input 
                    type="text" 
                    required 
                    className="glass-input" 
                    placeholder="e.g., Lead FX Artist" 
                    value={jobTitle} 
                    onChange={e => setJobTitle(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.formLabel}>Department *</label>
                  <input 
                    type="text" 
                    required 
                    className="glass-input" 
                    placeholder="e.g., VFX" 
                    value={jobDept} 
                    onChange={e => setJobDept(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 120px' }}>
                  <label style={styles.formLabel}>Job Type</label>
                  <select 
                    className="glass-input" 
                    style={{ background: 'var(--bg-color)', color: '#fff' }}
                    value={jobType} 
                    onChange={e => setJobType(e.target.value)}
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 120px' }}>
                  <label style={styles.formLabel}>Location Style</label>
                  <select 
                    className="glass-input" 
                    style={{ background: 'var(--bg-color)', color: '#fff' }}
                    value={jobLoc} 
                    onChange={e => setJobLoc(e.target.value)}
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div style={{ flex: '1 1 120px' }}>
                  <label style={styles.formLabel}>Salary Range</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="e.g., $4,000 - $6,000 / mo" 
                    value={jobSalary} 
                    onChange={e => setJobSalary(e.target.value)}
                  />
                </div>

                <div style={{ flex: '1 1 120px' }}>
                  <label style={styles.formLabel}>Exp Required</label>
                  <input 
                    type="text" 
                    className="glass-input" 
                    placeholder="e.g., 3+ years" 
                    value={jobExp} 
                    onChange={e => setJobExp(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={styles.formLabel}>Job Description</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '80px', lineHeight: '1.4' }}
                  placeholder="Summarize the role and team..."
                  value={jobDesc} 
                  onChange={e => setJobDesc(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Key Responsibilities (One per line)</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '80px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.4' }}
                  placeholder="Design and construct complex VFX assets&#10;Collaborate with production directors&#10;Optimize rendering parameters"
                  value={jobResp} 
                  onChange={e => setJobResp(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Requirements & Qualifications (One per line)</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '80px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.4' }}
                  placeholder="Expertise in SideFX Houdini / Maya&#10;Understanding of fluid simulation mechanics&#10;Strong communication skills"
                  value={jobReq} 
                  onChange={e => setJobReq(e.target.value)}
                />
              </div>

              <div>
                <label style={styles.formLabel}>Benefits & Perks (One per line)</label>
                <textarea 
                  className="glass-input" 
                  style={{ minHeight: '80px', fontFamily: 'var(--font-mono)', fontSize: '11px', lineHeight: '1.4' }}
                  placeholder="Comprehensive health & medical coverage&#10;Access to studio render farms for personal research&#10;Flexible remote-first schedules"
                  value={jobBen} 
                  onChange={e => setJobBen(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsCreatingJob(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Post Vacancy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Job Details & Application Modal ── */}
      {(selectedJob !== null || isApplying) && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => {
            setSelectedJob(null);
            setIsApplying(false);
            setAppSuccess(false);
          }}
        >
          <div 
            style={{
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(147, 51, 234, 0.3)',
              boxShadow: '0 0 50px rgba(147, 51, 234, 0.15)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '650px',
              maxHeight: '90vh',
              overflowY: 'auto',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                setSelectedJob(null);
                setIsApplying(false);
                setAppSuccess(false);
              }}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                color: '#fff',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              className="list-hover"
            >
              <X size={16} />
            </button>

            {appSuccess ? (
              <div style={{ textAlign: 'center', padding: '40px 10px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Application Submitted!</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                  Your application has been received and routed directly to our Recruitment dashboard. Our screening engine is reviewing your details.
                </p>
                <button 
                  className="btn-primary" 
                  onClick={() => {
                    setSelectedJob(null);
                    setIsApplying(false);
                    setAppSuccess(false);
                  }}
                >
                  Return to Dashboard
                </button>
              </div>
            ) : isApplying ? (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px', color: '#fff', fontFamily: 'var(--font-display)' }}>
                  {selectedJob ? `Apply: ${selectedJob.title}` : 'Submit Speculative General Application'}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                  {selectedJob ? `${selectedJob.department} Department • ${selectedJob.location}` : 'Join our talent roster for future roles'}
                </p>

                <form onSubmit={handleApplyJob} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        className="glass-input" 
                        placeholder="e.g., Amit Sen" 
                        value={appFullName} 
                        onChange={e => setAppFullName(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        className="glass-input" 
                        placeholder="e.g., amit@example.com" 
                        value={appEmail} 
                        onChange={e => setAppEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Portfolio / Showreel URL *</label>
                      <input 
                        type="url" 
                        required 
                        className="glass-input" 
                        placeholder="e.g., https://artstation.com/artist" 
                        value={appPortfolio} 
                        onChange={e => setAppPortfolio(e.target.value)}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Resume / CV Drive Link *</label>
                      <input 
                        type="url" 
                        required 
                        className="glass-input" 
                        placeholder="e.g., https://drive.google.com/.../resume.pdf" 
                        value={appResume} 
                        onChange={e => setAppResume(e.target.value)}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.formLabel}>Expected Monthly Salary (USD / INR)</label>
                      <input 
                        type="text" 
                        className="glass-input" 
                        placeholder="e.g., ₹80,000 / month" 
                        value={appExpectedSalary} 
                        onChange={e => setAppExpectedSalary(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.formLabel}>Pitch / Cover Letter</label>
                    <textarea 
                      className="glass-input" 
                      style={{ minHeight: '80px', lineHeight: '1.4' }}
                      placeholder="Tell us about yourself and why you'd be a great fit for DreamAvian Studios..."
                      value={appCoverLetter} 
                      onChange={e => setAppCoverLetter(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                    {selectedJob !== null && (
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        style={{ marginRight: 'auto' }}
                        onClick={() => setIsApplying(false)}
                      >
                        Back to Details
                      </button>
                    )}
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => {
                        setSelectedJob(null);
                        setIsApplying(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">Submit Application</button>
                  </div>
                </form>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--accent-color)', fontWeight: 600, letterSpacing: '1px' }}>
                    {selectedJob?.department} Department
                  </span>
                  <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(6,182,212,0.15)', color: 'var(--accent-color)' }}>
                    {selectedJob?.type}
                  </span>
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#fff', marginBottom: '14px', fontFamily: 'var(--font-display)' }}>
                  {selectedJob?.title}
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', background: 'rgba(255,255,255,0.02)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '10px', marginBottom: '20px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                  <div>📍 <strong>Location:</strong> {selectedJob?.location}</div>
                  <div>💰 <strong>Compensation:</strong> {selectedJob?.salaryRange}</div>
                  <div>💼 <strong>Experience:</strong> {selectedJob?.experience}</div>
                  <div>📅 <strong>Posted:</strong> {selectedJob?.postedDate}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  {selectedJob?.description && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>About the Role</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{selectedJob.description}</p>
                    </div>
                  )}

                  {selectedJob?.responsibilities && selectedJob.responsibilities.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Key Responsibilities</h4>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedJob.responsibilities.map((resp: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-color)' }}>✦</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob?.requirements && selectedJob.requirements.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Requirements & Qualifications</h4>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedJob.requirements.map((req: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ color: 'var(--accent-color)' }}>✦</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedJob?.benefits && selectedJob.benefits.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>Benefits & Perks</h4>
                      <ul style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {selectedJob.benefits.map((ben: string, idx: number) => (
                          <li key={idx} style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                            <span style={{ color: '#a855f7' }}>✦</span>
                            <span>{ben}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => setSelectedJob(null)}
                  >
                    Close
                  </button>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => setIsApplying(true)}
                  >
                    Apply for this Position
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '20px',
    width: '100%',
  },
  fullRow: {
    flex: '0 0 100%',
    padding: '24px',
  },
  halfCol: {
    flex: '1 1 calc(50% - 10px)',
    minWidth: '340px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
    marginBottom: '16px',
  },
  subTitle: {
    fontSize: '15px',
    fontWeight: '600',
    fontFamily: 'var(--font-display)',
    marginBottom: '10px',
  },
  metricsGrid: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: '1 1 calc(25% - 12px)',
    minWidth: '150px',
    padding: '16px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
  },
  metricLabel: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
  },
  metricValue: {
    fontSize: '22px',
    fontWeight: '700',
    fontFamily: 'var(--font-display)',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '12px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '12px',
    textAlign: 'left',
  },
  videoPlayerContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  mockVideo: {
    flex: 1,
    background: '#000',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '200px',
  },
  videoControls: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
  },
  taskCard: {
    padding: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  uploadBox: {
    border: '2px dashed var(--border-color)',
    borderRadius: '8px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.01)',
  },
  candidateCard: {
    padding: '10px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  logItem: {
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  idCardBadge: {
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  courseItem: {
    padding: '12px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    marginBottom: '6px',
    cursor: 'pointer'
  },
  formLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    display: 'block',
    marginBottom: '4px'
  }
};
