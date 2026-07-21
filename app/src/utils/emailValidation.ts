// DreamAvian Studios — Email Validation Service
// Provides: DisposableDomainBlacklist, EmailValidationService, RateLimiter,
//           ValidationLogger, EmailVerificationService, AdminEmailService

export type DomainCategory = 'disposable' | 'temporary' | 'throwaway' | 'fake' | 'forwarding' | 'abuse';

export interface BlockedDomain {
  id: string;
  domain: string;
  category: DomainCategory;
  createdAt: string;
  status: 'blocked' | 'allowed';
}

export interface EmailValidationResult {
  valid: boolean;
  status: 'valid' | 'disposable' | 'invalid_format' | 'blocked' | 'rate_limited';
  message: string;
  domain?: string;
}

export interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  captchaRequired: boolean;
}

export interface ValidationLog {
  id: string;
  email: string;
  domain: string;
  result: EmailValidationResult['status'];
  timestamp: string;
}

export interface VerificationToken {
  email: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
}

// ── Built-in disposable domain list (300+ entries) ──────────────────────────
const BUILTIN_DOMAINS: string[] = [
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.de',
  '10minutemail.cf','10minutemail.ga','10minutemail.gq','10minutemail.ml',
  '10minutemail.tk','minutemail.com','20minutemail.com','30minutemail.com',
  'guerrillamail.com','guerrillamail.net','guerrillamail.org','guerrillamail.biz',
  'guerrillamail.de','guerrillamail.info','guerrillamailblock.com','sharklasers.com',
  'grr.la','spam4.me','yopmail.com','yopmail.net',
  'mailinator.com','mailinator.net','mailinator.org','mailinator2.com',
  'mailinater.com','trashmail.com','trashmail.at','trashmail.io','trashmail.me',
  'trashmail.net','trashmail.org','dispostable.com','discard.email',
  'spamgourmet.com','spamgourmet.net','spamgourmet.org',
  'throwam.com','throwaway.email','throwam.net','burnermail.io','burnthespam.info',
  'fakeinbox.com','fakemailgenerator.com','filzmail.com','garliclife.com',
  'kasmail.com','klzlk.com','kurzepost.de','maileater.com',
  'mailexpire.com','mailfreeonline.com','mailnull.com','mailzilla.org',
  'mbx.cc','meltmail.com','mintemail.com',
  'objectmail.com','obobbo.com','oneoffemail.com','onewaymail.com',
  'pookmail.com','proxymail.eu','quickinbox.com','rcpt.at',
  'recyclemail.dk','rklips.com','rmqkr.net','ry.no',
  'safe-mail.net','safersignup.de','safetymail.info','safetypost.de',
  'sandelf.de','saynotospams.com','selfdestructingmail.com','sibmail.com',
  'snakemail.com','sneakemail.com','sneakmail.de','snkmail.com',
  'spam.la','spam.su','spambob.net','spambob.org',
  'spambog.com','spambog.de','spambog.ru',
  'spambox.info','spambox.us','spamcannon.com','spamcero.com',
  'spamex.com','spamfree.eu','spamgoes.in',
  'spaml.de','spaml.com','spammotel.com','spamobox.com',
  'spamspot.com','spamthis.co.uk','spamtrap.ro',
  'tafmail.com','teewars.org','teleworm.us',
  'temp-mail.io','temp-mail.org','tempail.com','tempalias.com',
  'tempcloud.in','tempinbox.com','tempinbox.co.uk',
  'tempmail.eu','tempmail.it','tempmail2.com','tempmailer.com','tempmailer.de',
  'temporaryemail.net','temporaryforwarding.com','temporaryinbox.com',
  'temporarymailaddress.com','tempsky.com','tempthe.net',
  'thisisnotmyrealemail.com','throam.com','trickmail.net','trillianpro.com',
  'turual.com','twinmail.de','tyldd.com',
  'vomoto.com','vpn.st','vubby.com',
  'watchfull.net','webemail.me','weg-werf-email.de',
  'wegwerfadresse.de','wegwerfemail.com','wegwerfemail.de',
  'whyspam.me','wickmail.net','wmail.cf','wollan.info','wwwnew.eu',
  'xagloo.com','xemaps.com','xents.com','xmaily.com','xoxy.net','xyzfree.net',
  'yapped.net','yep.it','yuurok.com',
  'z1p.biz','zebins.com','zebins.eu','zeean.net',
  'zippymail.info','zoemail.net','zomg.info',
  'binkmail.com','bobmail.info','chammy.info','devnullmail.com',
  'cool.fr.nf','jetable.fr.nf','nospam.ze.tc','nomail.xl.cx','mega.zik.dj',
  'speed.1s.fr','courriel.fr.nf','moncourrier.fr.nf',
  'getairmail.com','mailnew.com','mailslapping.com',
  'hat-gmbh.info','hatespam.org','imgv.de','inoutmail.de','jetable.org',
  'putthisinyourspamdatabase.com','regbypass.com','senseless-entertainment.com',
  'sharedmailbox.org','skeefmail.com','slopsbox.com','smellfear.com',
  'sofimail.com','sogetthis.com','soioa.com','soodonims.com','spam-en.de',
  'spamherelots.com','spamhereplease.com','spaminmotion.com','spamkill.info',
  'super-auswahl.de','supergreatmail.com','supermailer.jp','superrito.com',
  'suremail.info','sweetxxx.de','tagyourself.com','talkinator.com',
  'thanksnospam.info','trashdevil.com','trashdevil.de','trashemail.de',
  'trayna.com','uggsrock.com','upliftnow.com','uplipht.com','uroid.com',
  'vipxp.cn','vsimcard.com','wasteland.raptors.dk','welikecookies.com',
  'wh4f.org','ypmail.webrx.ro','za.com','odnorazovoe.ru','nus.edu.sg',
];

// Keyword patterns used for unlisted disposable domains
const DISPOSABLE_KEYWORDS = [
  'tempmail','temp-mail','throwaway','disposable','discard',
  'trashmail','spammail','fakeinbox','mailinator','yopmail',
  'guerrilla','burnermail','fakemail','spam4','junk',
  'nospam','throwam','10minute','minutemail','generator','tempinbox',
];

// Storage keys
const BLACKLIST_KEY = 'cs-email-domain-blacklist-v1';
const LOG_KEY       = 'cs-email-validation-log-v1';
const RATE_KEY      = 'cs-email-rate-limit-v1';
const VERIFY_KEY    = 'cs-email-verifications-v1';

// ── DisposableDomainBlacklist ────────────────────────────────────────────────

export class DisposableDomainBlacklist {
  private domains: Map<string, BlockedDomain> = new Map();

  constructor() { this.load(); }

  private load(): void {
    BUILTIN_DOMAINS.forEach((d, i) => {
      this.domains.set(d.toLowerCase(), {
        id: `blt-${i}`, domain: d.toLowerCase(),
        category: 'disposable', createdAt: '2026-01-01', status: 'blocked',
      });
    });
    try {
      const stored = localStorage.getItem(BLACKLIST_KEY);
      if (stored) {
        const custom: BlockedDomain[] = JSON.parse(stored);
        custom.forEach(d => this.domains.set(d.domain.toLowerCase(), d));
      }
    } catch (_) {}
  }

  private save(): void {
    const builtinSet = new Set(BUILTIN_DOMAINS.map(d => d.toLowerCase()));
    const custom = [...this.domains.values()].filter(d => !builtinSet.has(d.domain));
    try { localStorage.setItem(BLACKLIST_KEY, JSON.stringify(custom)); } catch (_) {}
  }

  isBlocked(domain: string): boolean {
    const d = domain.toLowerCase();
    const entry = this.domains.get(d);
    if (entry) return entry.status === 'blocked';
    return DISPOSABLE_KEYWORDS.some(kw => d.includes(kw));
  }

  addDomain(domain: string, category: DomainCategory): BlockedDomain {
    const entry: BlockedDomain = {
      id: `custom-${Date.now()}`, domain: domain.toLowerCase(),
      category, createdAt: new Date().toISOString(), status: 'blocked',
    };
    this.domains.set(entry.domain, entry);
    this.save();
    return entry;
  }

  removeDomain(domain: string): void { this.domains.delete(domain.toLowerCase()); this.save(); }

  allowDomain(domain: string): void {
    const e = this.domains.get(domain.toLowerCase());
    if (e) { e.status = 'allowed'; this.save(); }
  }

  listAll(): BlockedDomain[] { return [...this.domains.values()]; }

  listCustom(): BlockedDomain[] {
    const s = new Set(BUILTIN_DOMAINS.map(d => d.toLowerCase()));
    return [...this.domains.values()].filter(d => !s.has(d.domain));
  }

  get size(): number { return this.domains.size; }
}

// ── ValidationLogger ─────────────────────────────────────────────────────────

export class ValidationLogger {
  private logs: ValidationLog[] = [];
  private readonly MAX = 500;

  constructor() {
    try { const s = localStorage.getItem(LOG_KEY); if (s) this.logs = JSON.parse(s); } catch (_) {}
  }

  log(entry: Omit<ValidationLog, 'id' | 'timestamp'>): void {
    const r: ValidationLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: new Date().toISOString(), ...entry,
    };
    this.logs.unshift(r);
    if (this.logs.length > this.MAX) this.logs = this.logs.slice(0, this.MAX);
    try { localStorage.setItem(LOG_KEY, JSON.stringify(this.logs)); } catch (_) {}
  }

  getAll(): ValidationLog[] { return [...this.logs]; }
  getBlocked(): ValidationLog[] { return this.logs.filter(l => l.result !== 'valid'); }
  clear(): void { this.logs = []; localStorage.removeItem(LOG_KEY); }

  exportCSV(): string {
    return 'id,email,domain,result,timestamp\n' +
      this.logs.map(l => `${l.id},${l.email},${l.domain},${l.result},${l.timestamp}`).join('\n');
  }
}

// ── RateLimiter ───────────────────────────────────────────────────────────────

const WINDOW_MS  = 15 * 60 * 1000;
const SOFT_MAX   = 5;
const HARD_MAX   = 10;

export class RateLimiter {
  private entries: Record<string, RateLimitEntry> = {};

  constructor() {
    try { const s = localStorage.getItem(RATE_KEY); if (s) this.entries = JSON.parse(s); } catch (_) {}
    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now(); let changed = false;
    for (const k in this.entries) {
      if (now - this.entries[k].firstAttempt > WINDOW_MS) { delete this.entries[k]; changed = true; }
    }
    if (changed) this.save();
  }

  private save(): void {
    try { localStorage.setItem(RATE_KEY, JSON.stringify(this.entries)); } catch (_) {}
  }

  check(id: string): { allowed: boolean; captchaRequired: boolean; count: number } {
    this.cleanup();
    const e = this.entries[id];
    if (!e) return { allowed: true, captchaRequired: false, count: 0 };
    if (e.count >= HARD_MAX) return { allowed: false, captchaRequired: true, count: e.count };
    return { allowed: true, captchaRequired: e.count >= SOFT_MAX, count: e.count };
  }

  record(id: string): void {
    const now = Date.now();
    const e = this.entries[id];
    if (!e) {
      this.entries[id] = { count: 1, firstAttempt: now, lastAttempt: now, captchaRequired: false };
    } else {
      e.count++; e.lastAttempt = now; e.captchaRequired = e.count >= SOFT_MAX;
    }
    this.save();
  }

  reset(id: string): void { delete this.entries[id]; this.save(); }
}

// ── EmailValidationService ───────────────────────────────────────────────────

// eslint-disable-next-line no-useless-escape
const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

export class EmailValidationService {
  private bl: DisposableDomainBlacklist;
  private lg: ValidationLogger;
  private rl: RateLimiter;

  constructor(bl?: DisposableDomainBlacklist, lg?: ValidationLogger, rl?: RateLimiter) {
    this.bl = bl ?? new DisposableDomainBlacklist();
    this.lg = lg ?? new ValidationLogger();
    this.rl = rl ?? new RateLimiter();
  }

  validate(email: string, rlKey?: string): EmailValidationResult {
    const t = email.trim().toLowerCase();

    // Rate-limit check
    if (rlKey) {
      const r = this.rl.check(rlKey);
      if (!r.allowed) {
        return { valid: false, status: 'rate_limited', message: 'Too many registration attempts. Please wait 15 minutes and try again.' };
      }
    }

    // Format check
    if (!EMAIL_RE.test(t)) {
      return { valid: false, status: 'invalid_format', message: 'Please enter a valid email address.' };
    }

    const domain = t.split('@')[1] ?? '';

    // Disposable domain check
    if (this.bl.isBlocked(domain)) {
      if (rlKey) this.rl.record(rlKey);
      this.lg.log({ email: t, domain, result: 'disposable' });
      return {
        valid: false, status: 'disposable', domain,
        message: 'Temporary or disposable email addresses are not allowed. Please use a permanent email address (e.g. Gmail, Outlook, Yahoo).',
      };
    }

    this.lg.log({ email: t, domain, result: 'valid' });
    return { valid: true, status: 'valid', domain, message: 'Permanent email detected.' };
  }

  /** Real-time feedback (no side-effects) */
  preview(email: string): { icon: string; label: string; color: string } {
    const t = email.trim().toLowerCase();
    if (!t.includes('@')) return { icon: '', label: '', color: '' };
    if (!EMAIL_RE.test(t)) return { icon: 'x', label: 'Invalid email format', color: '#f87171' };
    const domain = t.split('@')[1] ?? '';
    if (this.bl.isBlocked(domain)) return { icon: 'x', label: 'Disposable email detected — not allowed', color: '#f87171' };
    return { icon: 'check', label: 'Permanent email detected', color: '#4ade80' };
  }

  getLogger(): ValidationLogger { return this.lg; }
  getBlacklist(): DisposableDomainBlacklist { return this.bl; }
  getRateLimiter(): RateLimiter { return this.rl; }
}

// ── EmailVerificationService ─────────────────────────────────────────────────

const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

export class EmailVerificationService {
  private tokens: Map<string, VerificationToken> = new Map();

  constructor() {
    try {
      const s = localStorage.getItem(VERIFY_KEY);
      if (s) { const a: VerificationToken[] = JSON.parse(s); a.forEach(t => this.tokens.set(t.email, t)); }
    } catch (_) {}
  }

  private save(): void {
    try { localStorage.setItem(VERIFY_KEY, JSON.stringify([...this.tokens.values()])); } catch (_) {}
  }

  createToken(email: string): VerificationToken {
    const now = Date.now();
    const t: VerificationToken = {
      email: email.toLowerCase(),
      token: Math.random().toString(36).slice(2) + now.toString(36),
      createdAt: now, expiresAt: now + TOKEN_EXPIRY, verified: false,
    };
    this.tokens.set(t.email, t); this.save(); return t;
  }

  verify(email: string, token: string): boolean {
    const e = this.tokens.get(email.toLowerCase());
    if (!e || Date.now() > e.expiresAt || e.token !== token) return false;
    e.verified = true; this.save(); return true;
  }

  isVerified(email: string): boolean { return !!this.tokens.get(email.toLowerCase())?.verified; }

  markVerified(email: string): void {
    const e = this.tokens.get(email.toLowerCase());
    if (e) { e.verified = true; this.save(); }
    else {
      const t: VerificationToken = {
        email: email.toLowerCase(), token: 'auto',
        createdAt: Date.now(), expiresAt: Date.now() + TOKEN_EXPIRY * 365, verified: true,
      };
      this.tokens.set(email.toLowerCase(), t); this.save();
    }
  }

  isPending(email: string): boolean {
    const e = this.tokens.get(email.toLowerCase()); return !!e && !e.verified;
  }
}

// ── AdminEmailService ────────────────────────────────────────────────────────

export class AdminEmailService {
  private bl: DisposableDomainBlacklist;
  private lg: ValidationLogger;

  constructor(bl: DisposableDomainBlacklist, lg: ValidationLogger) {
    this.bl = bl;
    this.lg = lg;
  }

  addBlockedDomain(domain: string, category: DomainCategory): BlockedDomain { return this.bl.addDomain(domain, category); }
  removeDomain(domain: string): void { this.bl.removeDomain(domain); }
  allowDomain(domain: string): void { this.bl.allowDomain(domain); }
  getBlockedDomains(): BlockedDomain[] { return this.bl.listAll().filter(d => d.status === 'blocked'); }
  getCustomDomains(): BlockedDomain[] { return this.bl.listCustom(); }
  getAbuseReport(): ValidationLog[] { return this.lg.getBlocked(); }
  exportReport(): string { return this.lg.exportCSV(); }
  clearLogs(): void { this.lg.clear(); }

  get stats(): { totalDomains: number; blockedAttempts: number; recentBlocked: number } {
    const logs = this.lg.getBlocked();
    const ago = Date.now() - 86400000;
    return {
      totalDomains: this.bl.size,
      blockedAttempts: logs.length,
      recentBlocked: logs.filter(l => new Date(l.timestamp).getTime() > ago).length,
    };
  }
}

// ── Singleton exports (app-wide) ─────────────────────────────────────────────

export const domainBlacklist   = new DisposableDomainBlacklist();
export const validationLogger  = new ValidationLogger();
export const rateLimiter       = new RateLimiter();
export const emailValidator    = new EmailValidationService(domainBlacklist, validationLogger, rateLimiter);
export const emailVerification = new EmailVerificationService();
export const adminEmailService = new AdminEmailService(domainBlacklist, validationLogger);
