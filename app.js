// ============================================================
//  CVPB ACADÉMIE — Application de gestion des formations
//  Rôles : Président, Vice-président, Secrétaires généraux, Responsable Formation,
//  Responsable Suivi & Accompagnement, Formateurs, Responsable des encaissements,
//  Responsable de la caisse, Étudiants (apprenants).
// ============================================================
import CONFIG from './config.js';

const DEMO = !CONFIG.firebase || !CONFIG.firebase.apiKey || CONFIG.firebase.apiKey === 'A_REMPLACER';
const $ = s => document.querySelector(s);
const S = { user: null, role: null, page: 'home', D: {}, fb: null };

// ------------------------------------------------------------
// 1. UTILITAIRES
// ------------------------------------------------------------
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const TODAY = () => ymd(new Date());
const curMonth = () => TODAY().slice(0, 7);
const toD = s => new Date(s + 'T00:00:00');
const fDate = s => s ? toD(s).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const fShort = s => s ? toD(s).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
const fMois = m => m ? new Date(m + '-01T00:00:00').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '—';
const fDT = iso => iso ? new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
const money = n => (Math.round(+n || 0)).toLocaleString('fr-FR').replace(/ | /g, ' ') + ' FCFA';
const initials = n => (n || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const sum = (arr, f) => arr.reduce((a, x) => a + (+f(x) || 0), 0);
const lower = s => (s || '').trim().toLowerCase();
const nextMonth = m => { const [y, mo] = m.split('-').map(Number); return mo === 12 ? `${y + 1}-01` : `${y}-${pad(mo + 1)}`; };
function monthsBetween(a, b) { const out = []; if (!a || !b || a > b) return out; let m = a; while (m <= b && out.length < 36) { out.push(m); m = nextMonth(m); } return out; }

const I = (p, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${p}</svg>`;
const IC = {
  home: I('<path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/>'),
  cal: I('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
  book: I('<path d="M2 4h6a4 4 0 0 1 4 4v13a3 3 0 0 0-3-3H2zM22 4h-6a4 4 0 0 0-4 4v13a3 3 0 0 1 3-3h7z"/>'),
  users: I('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  check: I('<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>'),
  star: I('<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>'),
  chart: I('<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/>'),
  alert: I('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01"/>'),
  money: I('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 12h.01M18 12h.01"/>'),
  safe: I('<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M12 9V7M15 12h2"/>'),
  mega: I('<path d="m3 11 18-5v12L3 13v-2zM11.6 16.8a3 3 0 1 1-5.8-1.6"/>'),
  bell: I('<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>'),
  shield: I('<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  gear: I('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'),
  plus: I('<path d="M12 5v14M5 12h14"/>'),
  edit: I('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>'),
  trash: I('<path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>'),
  eye: I('<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  down: I('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'),
  print: I('<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'),
  send: I('<path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/>'),
  x: I('<path d="M18 6 6 18M6 6l12 12"/>'),
  clock: I('<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>'),
  lock: I('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  info: I('<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>'),
  ok: I('<path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4 12 14l-3-3"/>'),
  more: I('<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'),
  user: I('<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  gavel: I('<path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10M16 16l6-6M8 8l6-6M9 7l8 8M21 11l-8-8"/>')
};

// ------------------------------------------------------------
// 2. RÔLES, DROITS ET MENUS
// ------------------------------------------------------------
const ROLES = {
  president: 'Président',
  vp: 'Vice-président',
  sg: 'Secrétaire général',
  resp_formation: 'Responsable Formation',
  resp_suivi: 'Responsable Suivi & Accompagnement',
  formateur: 'Formateur',
  encaissement: 'Responsable des encaissements',
  caisse: 'Responsable de la caisse',
  etudiant: 'Apprenant'
};
const FIN_ROLES = ['president', 'vp', 'encaissement', 'caisse'];
const PEDAGO = ['president', 'resp_formation', 'resp_suivi'];

// pages visibles par rôle
const NAV = {
  president: ['home', 'calendrier', '|Pédagogie', 'formations', 'apprenants', 'seances', 'exercices', 'assiduite', 'sanctions', '|Finances', 'paiements', '|Communication', 'annonces', 'notifications', '|Administration', 'utilisateurs', 'parametres'],
  vp: ['home', 'calendrier', '|Pédagogie', 'formations', 'apprenants', 'seances', 'exercices', 'assiduite', 'sanctions', '|Finances', 'paiements', '|Communication', 'annonces', 'notifications', '|Administration', 'utilisateurs', 'parametres'],
  sg: ['home', 'calendrier', '|Membres & activités', 'apprenants', 'formations', 'assiduite', 'sanctions', '|Communication', 'annonces', 'notifications'],
  resp_formation: ['home', 'calendrier', '|Pédagogie', 'formations', 'apprenants', 'seances', 'exercices', 'assiduite', 'sanctions', '|Communication', 'annonces', 'notifications'],
  resp_suivi: ['home', 'calendrier', '|Pédagogie', 'formations', 'apprenants', 'seances', 'exercices', 'assiduite', 'sanctions', '|Communication', 'annonces', 'notifications'],
  formateur: ['home', 'calendrier', '|Mes formations', 'seances', 'exercices', 'assiduite', '|Communication', 'notifications'],
  encaissement: ['home', 'calendrier', '|Finances', 'paiements', 'apprenants', '|Communication', 'notifications'],
  caisse: ['home', 'calendrier', '|Finances', 'paiements', 'apprenants', '|Communication', 'notifications'],
  etudiant: ['home', 'mesformations', 'mesnotes', 'mespaiements', 'discipline', 'calendrier', 'notifications']
};
// pages modifiables par rôle (le reste est en lecture seule)
const EDIT = {
  president: ['calendrier', 'formations', 'apprenants', 'seances', 'exercices', 'sanctions', 'paiements', 'annonces', 'parametres'],
  vp: [],
  sg: ['calendrier', 'apprenants', 'annonces'],
  resp_formation: ['calendrier', 'formations', 'apprenants', 'seances', 'exercices', 'sanctions', 'annonces'],
  resp_suivi: ['calendrier', 'formations', 'apprenants', 'seances', 'exercices', 'sanctions', 'annonces'],
  formateur: ['seances', 'exercices'],
  encaissement: ['paiements'],
  caisse: [],
  etudiant: []
};
const PAGE_META = {
  home: ['Tableau de bord', IC.home], calendrier: ['Calendrier', IC.cal], formations: ['Formations', IC.book],
  apprenants: ['Apprenants', IC.users], seances: ['Séances & appel', IC.check], exercices: ['Exercices & notes', IC.star],
  assiduite: ['Assiduité', IC.chart], sanctions: ['Discipline & sanctions', IC.gavel], paiements: ['Situation financière', IC.money],
  annonces: ['Annonces', IC.mega], notifications: ['Notifications', IC.bell],
  utilisateurs: ['Utilisateurs & accès', IC.shield], parametres: ['Paramètres', IC.gear],
  mesformations: ['Mes formations', IC.book], mesnotes: ['Mes notes', IC.star], mespaiements: ['Mes paiements', IC.money], discipline: ['Discipline', IC.gavel]
};
const SHORT = { home: 'Accueil', mesformations: 'Formations', mespaiements: 'Paiements', mesnotes: 'Notes', notifications: 'Alertes', seances: 'Appel', exercices: 'Notes', paiements: 'Finances', sanctions: 'Discipline' };
const can = page => (EDIT[S.role] || []).includes(page);
const seesFinance = () => FIN_ROLES.includes(S.role);
const isStudent = () => S.role === 'etudiant';

const DOMAINES = ['Intelligence artificielle & outils numériques', 'Bureautique & productivité', 'Programmation & développement web', 'Design graphique & communication visuelle', 'UI/UX Design & Figma', 'Audiovisuel & montage vidéo', 'Réseaux informatiques & cybersécurité', 'Développement personnel & compétences pro'];
const PRES_LABEL = { P: 'Présent', R: 'Retard', A: 'Absent', J: 'Absence justifiée' };
const PRES_BADGE = { P: 'b-v', R: 'b-o', A: 'b-r', J: 'b-b' };
const SANCTIONS = ['Avertissement', 'Blâme', 'Suspension temporaire', 'Exclusion de la formation'];
const MODES = ['Espèces', 'Orange Money', 'MTN MoMo', 'Moov Money', 'Wave'];
const NOTIF_CAT = { activite: ['Activité', IC.cal, 'v1'], paiement: ['Paiement', IC.money, 'v2'], sanction: ['Discipline', IC.gavel, 'v4'], note: ['Note', IC.star, 'v5'], assiduite: ['Assiduité', IC.check, 'v3'], annonce: ['Annonce', IC.mega, 'v1'] };
const DEFAULT_SETTINGS = { annee: '2026-2027', teeshirt: 5000, mensualite: 5000, moisDebut: '2026-11', moisFin: '2027-06', seuilAssiduite: 75, noteMin: 10 };

// ------------------------------------------------------------
// 3. ACCÈS AUX DONNÉES (Démo locale ou Firebase)
// ------------------------------------------------------------
// Comptes du personnel : ceux de CVPB Manager (collection users, rôle principal + rolesSup).
// Correspondance rôle CVPB Manager -> rôle dans l'Académie. Les autres rôles (tuteur, délégué…) n'ont pas accès.
const ROLE_MAP = { president: 'president', vicepresident: 'vp', secretaire: 'sg', formation: 'resp_formation', accompagnement: 'resp_suivi', pedagogie: 'formateur', encaissement: 'encaissement', caisse: 'caisse', tresorerie: 'caisse' };
const ROLE_PRIO = ['president', 'resp_formation', 'resp_suivi', 'sg', 'vp', 'encaissement', 'caisse', 'formateur'];
function acaRole(u) {
  if (!u || u.actif === false) return null;
  const rs = [u.role, ...(u.rolesSup || [])].map(r => ROLE_MAP[r]).filter(Boolean);
  return ROLE_PRIO.find(r => rs.includes(r)) || null;
}
// Dans Firebase, les collections de l'Académie sont préfixées « aca_ » pour ne jamais toucher
// celles de CVPB Manager. « etudiants » et « encaissements » sont LUES dans CVPB Manager (lecture seule).
const EXTERNES = ['etudiants', 'encaissements', 'users'];
const PHYS = c => EXTERNES.includes(c) ? c : 'aca_' + c;
const COLS = ['settings', 'users', 'formations', 'apprenants', 'seances', 'presences', 'exercices', 'notes', 'paiements', 'caisse', 'sanctions', 'activites', 'notifications', 'annonces'];

const DemoDB = {
  KEY: 'cvpba_demo_v2',
  data: null,
  load() { try { this.data = JSON.parse(localStorage.getItem(this.KEY)); } catch { this.data = null; } if (!this.data) { this.data = seedDemo(); this.save(); } },
  save() { try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); } catch { } },
  reset() { localStorage.removeItem(this.KEY); this.load(); },
  async list(col, f = {}) { const arr = this.data[col] || []; return arr.filter(x => Object.entries(f).every(([k, v]) => x[k] === v)).map(x => ({ ...x })); },
  async get(col, id) { const x = (this.data[col] || []).find(x => x.id === id); return x ? { ...x } : null; },
  async set(col, id, obj) { const arr = this.data[col] = this.data[col] || []; const i = arr.findIndex(x => x.id === id); const v = { ...(i >= 0 ? arr[i] : {}), ...obj, id }; if (i >= 0) arr[i] = v; else arr.push(v); this.save(); return id; },
  async add(col, obj) { const id = uid(); await this.set(col, id, obj); return id; },
  async update(col, id, patch) { return this.set(col, id, patch); },
  async remove(col, id) { this.data[col] = (this.data[col] || []).filter(x => x.id !== id); this.save(); }
};

const FireDB = {
  async list(col, f = {}) {
    const { collection, query, where, getDocs } = S.fb.fs;
    const cs = Object.entries(f).map(([k, v]) => where(k, '==', v));
    const snap = await getDocs(query(collection(S.fb.db, PHYS(col)), ...cs));
    return snap.docs.map(d => ({ ...d.data(), id: d.id }));
  },
  async get(col, id) { const { doc, getDoc } = S.fb.fs; const s = await getDoc(doc(S.fb.db, PHYS(col), id)); return s.exists() ? { ...s.data(), id: s.id } : null; },
  async set(col, id, obj) { const { doc, setDoc } = S.fb.fs; const o = { ...obj }; delete o.id; await setDoc(doc(S.fb.db, PHYS(col), id), o, { merge: true }); return id; },
  async add(col, obj) { const { collection, addDoc } = S.fb.fs; const o = { ...obj }; delete o.id; const r = await addDoc(collection(S.fb.db, PHYS(col)), o); return r.id; },
  async update(col, id, patch) { const { doc, updateDoc } = S.fb.fs; const o = { ...patch }; delete o.id; await updateDoc(doc(S.fb.db, PHYS(col), id), o); return id; },
  async remove(col, id) { const { doc, deleteDoc } = S.fb.fs; await deleteDoc(doc(S.fb.db, PHYS(col), id)); }
};
const DB = DEMO ? DemoDB : FireDB;

// Chargement des données selon le rôle (un étudiant ne charge QUE ses propres données)
function splitNom(full) { const w = String(full || '').trim().split(/\s+/).filter(Boolean); return { nom: (w[0] || '').toUpperCase(), prenoms: w.slice(1).join(' ') }; }
// Fusionne le dossier Académie (aca_apprenants/{email}) avec la fiche CVPB Manager (etudiants/{matricule})
function mergeApp(x, e) {
  const n = splitNom(e?.nom);
  return { ...x, nom: n.nom || '(hors liste)', prenoms: n.prenoms, niveau: e?.niveau || '', specialite: e?.specialite || '', statutCVPB: e ? (e.statut || '—') : 'Absent de CVPB Manager', surListe: !!e && e.statut === 'Actif', statut: x.statut || 'Actif' };
}
const VALIDE = e => !/annul/i.test(e.statut || '');

// Chargement des données selon le rôle (un étudiant ne charge QUE ses propres données)
async function loadData(force = false) {
  if (S.D.__ok && !force) return S.D;
  const me = S.user.email, r = S.role, D = {};
  const safe = async (p) => { try { return await p; } catch (e) { console.warn(e); return []; } };
  const st = await safe(DB.get('settings', 'general'));
  D.settings = { ...DEFAULT_SETTINGS, ...(st && !Array.isArray(st) ? st : {}) };
  const pub = ['formations', 'seances', 'exercices', 'activites'];
  await Promise.all(pub.map(async c => D[c] = await safe(DB.list(c))));
  if (r === 'etudiant') {
    const lk = await DB.get('apprenants', me).catch(() => null);
    const et = lk ? await DB.get('etudiants', lk.matricule).catch(() => null) : null;
    D.etudiants = et ? [et] : [];
    D.apprenants = lk ? [mergeApp(lk, et)] : [];
    for (const c of ['presences', 'notes', 'sanctions']) D[c] = await safe(DB.list(c, { email: me }));
    D.encaissements = lk ? (await safe(DB.list('encaissements', { matricule: lk.matricule }))).filter(VALIDE) : [];
    D.users = []; D.annonces = [];
  } else {
    for (const c of ['users', 'presences', 'notes', 'sanctions', 'annonces']) D[c] = await safe(DB.list(c));
    D.etudiants = await safe(DB.list('etudiants'));
    const aca = await safe(DB.list('apprenants'));
    D.apprenants = aca.map(x => mergeApp(x, D.etudiants.find(e => e.id === x.matricule)));
    D.encaissements = seesFinance() ? (await safe(DB.list('encaissements'))).filter(VALIDE) : [];
  }
  const n1 = await safe(DB.list('notifications', { dest: me }));
  const n2 = await safe(DB.list('notifications', { dest: 'all' }));
  // Les paiements sont saisis dans CVPB Manager : chaque encaissement devient une notification pour l'étudiant
  const n3 = r === 'etudiant' ? D.encaissements.map(e => ({ id: 'enc_' + e.id, local: true, dest: me, cat: 'paiement', titre: 'Paiement enregistré ✅', message: `${money(e.montant)} — ${e.nature || 'Paiement'}${e.mois ? ' (' + e.mois + ')' : ''} · ${e.mode || ''}${e.num ? ' · ' + e.num : ''}.`, date: (e.date || TODAY()) + 'T12:00:00' })) : [];
  D.notifications = [...n1, ...n2, ...n3].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  D.__ok = true;
  S.D = D;
  return D;
}
const refresh = async () => { S.D = {}; await loadData(true); updateBell(); };

// ------------------------------------------------------------
// 4. CALCULS (assiduité, moyennes, finances)
// ------------------------------------------------------------
const fName = (D, id) => (D.formations.find(f => f.id === id) || {}).titre || '—';
const aName = (D, email) => { const a = D.apprenants.find(a => a.id === email); return a ? `${a.nom} ${a.prenoms}` : email; };
const actifsAca = D => D.apprenants.filter(a => a.surListe && a.statut === 'Actif');
const enrolled = (D, fid) => D.apprenants.filter(a => a.surListe && (a.formations || []).includes(fid) && a.statut !== 'Abandon').sort((a, b) => (a.nom + a.prenoms).localeCompare(b.nom + b.prenoms));
const myFormations = D => S.role === 'formateur' ? D.formations.filter(f => lower(f.formateurEmail) === S.user.email) : D.formations;

function presStats(D, email, fid) {
  const app = D.apprenants.find(a => a.id === email); const fset = new Set(app?.formations || []);
  const sc = D.seances.filter(s => s.statut === 'Tenue' && fset.has(s.formationId) && (!fid || s.formationId === fid));
  const map = {}; D.presences.filter(p => p.email === email).forEach(p => map[p.seanceId] = p.statut);
  const r = { total: sc.length, P: 0, R: 0, A: 0, J: 0, NR: 0 };
  sc.forEach(s => { const st = map[s.id]; if (st && r[st] !== undefined) r[st]++; else r.NR++; });
  const base = r.P + r.R + r.A; r.taux = base ? Math.round((r.P + r.R) / base * 100) : null;
  return r;
}
function moyenne(D, email, fid) {
  const app = D.apprenants.find(a => a.id === email); const fset = new Set(app?.formations || []);
  let s = 0, c = 0;
  D.exercices.filter(e => fset.has(e.formationId) && (!fid || e.formationId === fid)).forEach(e => {
    const n = D.notes.find(n => n.exerciceId === e.id && n.email === email);
    if (n && n.note !== '' && n.note != null) { const co = +e.coef || 1; s += (+n.note / (+e.bareme || 20)) * 20 * co; c += co; }
  });
  return c ? Math.round(s / c * 100) / 100 : null;
}
// Situation financière calculée à partir du registre d'encaissement de CVPB Manager (mêmes règles) :
// inscription = T-shirt d'abord, le reste va aux cotisations ; cotisations affectées au plus ancien mois non soldé.
function finance(D, email) {
  const st = D.settings, a = D.apprenants.find(x => x.id === email) || {};
  const encs = D.encaissements.filter(e => e.matricule === a.matricule).sort((x, y) => (x.date || '').localeCompare(y.date || ''));
  let tee = 0, coti = 0, autres = 0;
  encs.forEach(e => {
    const m = +e.montant || 0, n = lower(e.nature);
    if (n.startsWith('inscription')) { const t = Math.min(m, Math.max(0, st.teeshirt - tee)); tee += t; coti += m - t; }
    else if (n.includes('t-shirt') || n.includes('tee-shirt')) tee += m;
    else if (n.includes('cotisation') || n.includes('mensualit')) coti += m;
    else autres += m;
  });
  const end = curMonth() < st.moisFin ? curMonth() : st.moisFin;
  let pool = coti;
  const parMois = monthsBetween(st.moisDebut, end).map((m, i) => { const paye = Math.min(+st.mensualite, pool); pool -= paye; return { mois: m, code: 'M' + (i + 1), du: +st.mensualite, paye, reste: st.mensualite - paye }; });
  const du = +st.teeshirt + parMois.length * st.mensualite;
  const paye = Math.min(tee, st.teeshirt) + sum(parMois, m => m.paye);
  return { tee, teeOk: tee >= st.teeshirt, parMois, du, paye, avance: pool, autres, reste: Math.max(0, du - paye), total: sum(encs, e => e.montant), encs: encs.slice().reverse() };
}
const tauxBadge = (t, seuil) => t == null ? '<span class="b b-g">—</span>' : `<span class="b ${t >= seuil ? 'b-v' : t >= seuil - 15 ? 'b-o' : 'b-r'}">${t} %</span>`;
const moyBadge = m => m == null ? '<span class="b b-g">—</span>' : `<span class="b ${m >= 12 ? 'b-v' : m >= 10 ? 'b-o' : 'b-r'}">${m.toFixed(2)}/20</span>`;
const prog = v => `<div class="prog"><i style="width:${Math.max(0, Math.min(100, v || 0))}%"></i></div>`;

// ------------------------------------------------------------
// 5. NOTIFICATIONS
// ------------------------------------------------------------
async function notify(dest, cat, titre, message) {
  try { await DB.add('notifications', { dest: lower(dest) === 'all' ? 'all' : lower(dest), cat, titre, message, date: new Date().toISOString(), lu: false, par: S.user.email }); } catch (e) { console.warn('notif', e); }
}
const readKey = () => 'cvpba_read_' + S.user.email;
const readAll = () => { try { return new Set(JSON.parse(localStorage.getItem(readKey()) || '[]')); } catch { return new Set(); } };
const isRead = n => n.dest === 'all' || n.local ? readAll().has(n.id) : !!n.lu;
function unreadCount() { return (S.D.notifications || []).filter(n => !isRead(n)).length; }
function updateBell() {
  const c = unreadCount(), d = $('#bellDot');
  d.textContent = c > 9 ? '9+' : c; d.classList.toggle('hidden', !c);
  document.querySelectorAll('[data-cnt=notifications]').forEach(e => { e.textContent = c; e.classList.toggle('hidden', !c); });
}
async function markRead(ids) {
  const set = readAll();
  for (const n of S.D.notifications.filter(n => ids.includes(n.id))) {
    if (n.dest === 'all' || n.local) set.add(n.id); else if (!n.lu) { n.lu = true; try { await DB.update('notifications', n.id, { lu: true }); } catch { } }
  }
  localStorage.setItem(readKey(), JSON.stringify([...set]));
  updateBell();
}

// ------------------------------------------------------------
// 6. INTERFACE : toast, modales, formulaires, export
// ------------------------------------------------------------
function toast(msg, type = '') { const t = document.createElement('div'); t.className = 'toast ' + type; t.textContent = msg; $('#toast').appendChild(t); setTimeout(() => t.remove(), 3200); }
function closeModal() { $('#modal').classList.add('hidden'); $('#modal').innerHTML = ''; }
function openModal({ title, body, ok = 'Enregistrer', okClass = 'btn-p', onOk, wide, noFooter }) {
  const m = $('#modal');
  m.innerHTML = `<div class="modal" style="${wide ? 'max-width:820px' : ''}"><div class="modal-h"><h3>${title}</h3><button class="icon-btn" data-close>${IC.x}</button></div>
  <div class="modal-b">${body}</div>${noFooter ? '' : `<div class="modal-f"><button class="btn btn-o" data-close>Annuler</button>${onOk ? `<button class="btn ${okClass}" data-ok>${ok}</button>` : ''}</div>`}</div>`;
  m.classList.remove('hidden');
  m.querySelectorAll('[data-close]').forEach(b => b.onclick = closeModal);
  m.onclick = e => { if (e.target === m) closeModal(); };
  const okb = m.querySelector('[data-ok]');
  if (okb) okb.onclick = async () => { okb.disabled = true; try { const r = await onOk(m); if (r !== false) closeModal(); } catch (e) { console.error(e); toast(e.message || 'Erreur', 'bad'); } finally { okb.disabled = false; } };
  return m;
}
function fieldHTML(f, v) {
  const id = 'f_' + f.k, req = f.req ? ' <span style="color:var(--rouge)">*</span>' : '';
  let input;
  if (f.type === 'select') input = `<select class="inp" id="${id}">${f.empty !== false ? '<option value="">— Choisir —</option>' : ''}${f.options.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(ov)}" ${String(v ?? '') === String(ov) ? 'selected' : ''}>${esc(ol)}</option>`; }).join('')}</select>`;
  else if (f.type === 'textarea') input = `<textarea class="inp" id="${id}" rows="${f.rows || 3}" placeholder="${esc(f.ph || '')}">${esc(v ?? '')}</textarea>`;
  else if (f.type === 'checks') input = `<div class="chk" id="${id}">${f.options.map(o => { const [ov, ol] = Array.isArray(o) ? o : [o, o]; return `<label><input type="checkbox" value="${esc(ov)}" ${(v || []).includes(ov) ? 'checked' : ''}> ${esc(ol)}</label>`; }).join('') || '<span class="muted small">Aucune option</span>'}</div>`;
  else input = `<input class="inp" id="${id}" type="${f.type || 'text'}" value="${esc(v ?? '')}" placeholder="${esc(f.ph || '')}" ${f.min != null ? `min="${f.min}"` : ''} ${f.max != null ? `max="${f.max}"` : ''} ${f.step ? `step="${f.step}"` : ''}>`;
  return `<div class="fld" data-k="${f.k}"><label for="${id}">${esc(f.label)}${req}</label>${input}${f.hint ? `<div class="hint">${f.hint}</div>` : ''}</div>`;
}
function readForm(m, fields) {
  const v = {};
  fields.forEach(f => {
    const el = m.querySelector('#f_' + f.k); if (!el) return;
    if (f.type === 'checks') v[f.k] = [...el.querySelectorAll('input:checked')].map(i => i.value);
    else if (f.type === 'number') v[f.k] = el.value === '' ? '' : Number(el.value);
    else v[f.k] = el.value.trim();
  });
  return v;
}
function formModal({ title, fields, values = {}, ok, onSubmit, intro = '' }) {
  const rows = []; for (let i = 0; i < fields.length; i++) { const f = fields[i]; if (f.half && fields[i + 1]?.half) { rows.push(`<div class="frow">${fieldHTML(f, values[f.k])}${fieldHTML(fields[i + 1], values[fields[i + 1].k])}</div>`); i++; } else rows.push(fieldHTML(f, values[f.k])); }
  const m = openModal({
    title, ok, body: intro + rows.join(''), onOk: async (m) => {
      const v = readForm(m, fields);
      for (const f of fields) { const box = m.querySelector(`[data-k="${f.k}"]`); if (f.req && box && box.style.display !== 'none' && (v[f.k] === '' || (Array.isArray(v[f.k]) && !v[f.k].length))) { toast(`Champ obligatoire : ${f.label}`, 'bad'); return false; } }
      return onSubmit(v, m);
    }
  });
  const apply = () => { const v = readForm(m, fields); fields.forEach(f => { if (f.when) { const box = m.querySelector(`[data-k="${f.k}"]`); if (box) box.style.display = f.when(v) ? '' : 'none'; } }); fields.forEach(f => f.onChange && f.onChange(v, m)); };
  m.querySelectorAll('input,select,textarea').forEach(el => el.addEventListener('change', apply));
  apply();
  return m;
}
function confirmBox(msg, onYes, ok = 'Confirmer', cls = 'btn-d') { openModal({ title: 'Confirmation', body: `<p>${msg}</p>`, ok, okClass: cls, onOk: onYes }); }
function exportCSV(name, headers, rows) {
  const q = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [headers.map(q).join(';'), ...rows.map(r => r.map(q).join(';'))].join('\n');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = `${name}_${TODAY()}.csv`; a.click();
}
const empty = (txt, icon = IC.info) => `<div class="empty">${icon}<div>${txt}</div></div>`;
const roBanner = () => can(S.page) || isStudent() ? '' : `<div class="ro-banner">${I('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>', 'width="16" height="16"')} Consultation seule : votre rôle ne permet pas de modifier cette rubrique.</div>`;
const kpi = (ic, cls, v, l) => `<div class="card kpi"><div class="ic ${cls}">${ic}</div><div><div class="v">${v}</div><div class="l">${l}</div></div></div>`;
const formationOpts = D => myFormations(D).map(f => [f.id, f.titre]);

// Délégation d'événements : chaque bouton porte data-act="nom" (+ data-id…)
const ACT = {};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  const fn = ACT[a.dataset.act]; if (fn) { e.preventDefault(); fn(a.dataset, a); }
});

// ------------------------------------------------------------
// 7. NAVIGATION
// ------------------------------------------------------------
function buildNav() {
  const items = NAV[S.role] || [];
  $('#nav').innerHTML = items.map(p => p.startsWith('|') ? `<div class="nav-sec">${p.slice(1)}</div>` :
    `<a class="nav-a" data-go="${p}">${PAGE_META[p][1]}<span>${PAGE_META[p][0]}</span>${p === 'notifications' ? '<span class="cnt hidden" data-cnt="notifications"></span>' : ''}</a>`).join('');
  const pages = items.filter(p => !p.startsWith('|'));
  const others = pages.filter(p => p !== 'home' && p !== 'notifications');
  const side = isStudent() ? ['mesformations', 'mesnotes', 'mespaiements'] : [others[0], others[1], 'notifications'].filter(Boolean);
  const link = p => `<a data-go="${p}">${PAGE_META[p][1]}<span>${SHORT[p] || PAGE_META[p][0].split(' ')[0]}</span>${p === 'notifications' ? '<span class="dot hidden" data-cnt="notifications"></span>' : ''}</a>`;
  $('#bottom').innerHTML = side.slice(0, 2).map(link).join('') + `<a class="fab" data-go="home"><i>${IC.home}</i><span>Accueil</span></a>` + side.slice(2).map(link).join('') + `<a data-menu>${IC.more}<span>Menu</span></a>`;
  document.querySelectorAll('[data-go]').forEach(a => a.onclick = () => go(a.dataset.go));
  document.querySelector('[data-menu]').onclick = toggleSide;
}
function toggleSide(force) { const open = typeof force === 'boolean' ? force : !$('#side').classList.contains('open'); $('#side').classList.toggle('open', open); $('#scrim').classList.toggle('hidden', !open); }
function go(p) { if (location.hash !== '#/' + p) location.hash = '#/' + p; else render(); toggleSide(false); }
window.addEventListener('hashchange', () => { if (S.user) render(); });

async function render() {
  const allowed = (NAV[S.role] || []).filter(p => !p.startsWith('|'));
  let p = (location.hash.match(/^#\/(\w+)/) || [])[1] || 'home';
  if (!allowed.includes(p)) p = 'home';
  S.page = p;
  document.body.classList.toggle('on-home', p === 'home');
  document.querySelectorAll('[data-go]').forEach(a => a.classList.toggle('on', a.dataset.go === p));
  $('#title').textContent = PAGE_META[p][0];
  const v = $('#view');
  v.innerHTML = '<div class="empty"><div class="spin" style="margin:auto"></div></div>';
  try {
    const D = await loadData();
    v.innerHTML = await PAGES[p](D);
    updateBell(); paintTheme();
    window.scrollTo(0, 0);
  } catch (e) { console.error(e); v.innerHTML = `<div class="alert bad">${IC.alert}<div>Impossible de charger cette page : ${esc(e.message)}</div></div>`; }
}
const rerender = async () => { await refresh(); render(); };

// ------------------------------------------------------------
// 8. PAGES
// ------------------------------------------------------------
const PAGES = {};

// ---------- ACCUEIL ----------
PAGES.home = D => isStudent() ? homeStudent(D) : homeStaff(D);

function upcoming(D, fids) {
  const t = TODAY();
  const s = D.seances.filter(x => x.date >= t && x.statut !== 'Annulée' && (!fids || fids.includes(x.formationId))).map(x => ({ date: x.date, heure: x.heure, titre: x.theme || 'Séance', sous: fName(D, x.formationId), type: 'Séance' }));
  const a = D.activites.filter(x => x.date >= t).map(x => ({ date: x.date, heure: x.heure, titre: x.titre, sous: x.lieu || x.type, type: x.type || 'Activité' }));
  return [...s, ...a].sort((x, y) => (x.date + (x.heure || '')).localeCompare(y.date + (y.heure || '')));
}
const evItem = e => { const d = toD(e.date); return `<div class="list-i"><div class="date-box"><b>${d.getDate()}</b><small>${d.toLocaleDateString('fr-FR', { month: 'short' })}</small></div><div style="flex:1;min-width:0"><div class="t">${esc(e.titre)}</div><div class="small muted">${esc(e.sous || '')}${e.heure ? ' · ' + esc(e.heure) : ''}</div></div><span class="b ${e.type === 'Séance' ? 'b-p' : 'b-v'}">${esc(e.type)}</span></div>`; };
const notifItem = n => { const c = NOTIF_CAT[n.cat] || NOTIF_CAT.annonce; return `<div class="list-i ${isRead(n) ? '' : 'unread'}"><div class="ic ${c[2]}" style="background:var(--${c[2] === 'v2' ? 'vert' : c[2] === 'v4' ? 'rouge' : c[2] === 'v3' ? 'orange' : c[2] === 'v5' ? 'bleu' : 'violet'}-l)">${c[1]}</div><div style="flex:1;min-width:0"><div class="t">${esc(n.titre)}</div><div class="small" style="color:var(--ink-2)">${esc(n.message)}</div><div class="small muted">${c[0]} · ${fDT(n.date)}</div></div>${isRead(n) ? '' : '<span class="b b-p">Nouveau</span>'}</div>`; };

// ---------- Composants visuels de l'accueil ----------
const ARROW_DN = I('<path d="M12 5v14M19 12l-7 7-7-7"/>'), ARROW_UP = I('<path d="M12 19V5M5 12l7-7 7 7"/>');
const TILE_COLORS = [['#FDECEC', '#D93838'], ['#FFF4DC', '#D08A00'], ['#E6F4EA', '#07792B'], ['#E2F6F8', '#0F8F9C'], ['#F1ECFB', '#6D28D9'], ['#E8F0FB', '#1565C0'], ['#FCE9F4', '#C2367F'], ['#EDE7F6', '#3C1776']];
function heroX({ name, label, value, sub }) {
  return `<section class="hx"><div class="hx-top"><div class="hx-av">${initials(name)}</div><div class="hx-who"><small>Bonjour 👋</small><b>${esc(name)}</b></div><button class="hx-bell theme-btn" data-theme></button><button class="hx-bell" data-act="goNotif" title="Notifications">${IC.bell}<span class="dot hidden" data-cnt="notifications"></span></button></div>
  <div class="hx-lab">${label}</div><div class="hx-val">${value}</div><div class="hx-sub">${sub}</div></section>`;
}
ACT.goNotif = () => go('notifications');
// ---------- Mode clair / sombre ----------
const MOON = I('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>'), SUN = I('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
function paintTheme() {
  const dark = document.body.classList.contains('dark');
  document.querySelectorAll('[data-theme]').forEach(b => { b.innerHTML = dark ? SUN : MOON; b.title = dark ? 'Passer en mode clair' : 'Passer en mode sombre'; });
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#14121C' : '#3C1776';
}
document.addEventListener('click', e => { if (!e.target.closest('[data-theme]')) return; const dark = document.body.classList.toggle('dark'); try { localStorage.setItem('cvpba_theme', dark ? 'dark' : 'light'); } catch { } paintTheme(); });
const quickBar = pages => `<div class="qa">${pages.slice(0, 4).map(p => `<a class="qa-i" href="#/${p}"><span>${PAGE_META[p][1]}</span>${SHORT[p] || PAGE_META[p][0].split(' ')[0]}</a>`).join('')}</div>`;
const tiles = (title, pages) => pages.length ? `<div class="sec-h"><h3>${title}</h3></div><div class="tiles">${pages.slice(0, 8).map((p, i) => { const c = TILE_COLORS[i % TILE_COLORS.length]; return `<a class="tile" href="#/${p}"><span style="background:${c[0]};color:${c[1]}">${PAGE_META[p][1]}</span>${PAGE_META[p][0]}</a>`; }).join('')}</div>` : '';
const statPair = (a, b) => `<div class="sp2" style="margin-top:18px"><div class="stc dark"><span class="stc-ic">${ARROW_DN}</span><div class="stc-wm">${ARROW_DN}</div><small>${a[0]}</small><b>${a[1]}</b></div><div class="stc vif"><span class="stc-ic">${ARROW_UP}</span><div class="stc-wm">${ARROW_UP}</div><small>${b[0]}</small><b>${b[1]}</b></div></div>`;
function barChart(title, pill, labels, series) {
  if (!labels.length) return '';
  const max = Math.max(1, ...series.flatMap(s => s.values));
  return `<div class="card chart"><div class="card-h"><h3>${title}</h3><span class="pill">${pill}</span></div><div class="card-b"><div class="bars">${labels.map((l, i) => `<div class="bcol"><div class="bstack">${series.map((s, k) => `<i class="s${k + 1}" style="height:${Math.round(s.values[i] / max * 100)}%" title="${esc(s.name)} : ${s.values[i]}"></i>`).join('')}</div><small>${esc(l)}</small></div>`).join('')}</div><div class="legend">${series.map((s, k) => `<span><i class="s${k + 1}"></i>${esc(s.name)}</span>`).join('')}</div></div></div>`;
}
const shortDate = d => toD(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }).replace('.', '');
function presChart(D, fids) {
  const dates = [...new Set(D.seances.filter(s => s.statut === 'Tenue' && (!fids || fids.includes(s.formationId))).map(s => s.date))].sort().slice(-6);
  const ids = d => new Set(D.seances.filter(s => s.date === d && s.statut === 'Tenue' && (!fids || fids.includes(s.formationId))).map(s => s.id));
  const P = dates.map(d => { const x = ids(d); return D.presences.filter(p => x.has(p.seanceId) && (p.statut === 'P' || p.statut === 'R')).length; });
  const A = dates.map(d => { const x = ids(d); return D.presences.filter(p => x.has(p.seanceId) && p.statut === 'A').length; });
  return barChart('Assiduité', '6 dernières séances', dates.map(shortDate), [{ name: 'Présents', values: P }, { name: 'Absents', values: A }]);
}
const promoFormation = (D, f, email) => { const p = presStats(D, email, f.id), m = moyenne(D, email, f.id); return `<a class="promo" href="#/mesformations"><h4>${esc(f.titre)}</h4><p>${esc(f.formateurNom || '')} · ${esc(f.jour || '')} ${esc(f.heure || '')}</p><div class="pm"><div><b>${p.taux == null ? '—' : p.taux + ' %'}</b><small>Assiduité</small></div><div><b>${m == null ? '—' : m.toFixed(2)}</b><small>Moyenne /20</small></div><div><b>${p.P + p.R}/${p.total}</b><small>Séances</small></div></div></a>`; };

function homeStudent(D) {
  const me = S.user.email, a = D.apprenants[0];
  if (!a) return `<div class="alert warn">${IC.alert}<div>Votre dossier d'apprenant est introuvable. Contactez le Responsable Formation.</div></div>`;
  const st = D.settings, ps = presStats(D, me), moy = moyenne(D, me), fin = finance(D, me);
  const sancA = D.sanctions.filter(s => s.statut === 'Active');
  const fs = D.formations.filter(f => (a.formations || []).includes(f.id));
  const alerts = [];
  if (fin.reste > 0) alerts.push(`<div class="alert warn">${IC.money}<div><b>Reste à payer : ${money(fin.reste)}.</b> ${fin.teeOk ? '' : 'Votre T-shirt n\'est pas encore soldé. '}Rapprochez-vous de la Responsable des encaissements.</div></div>`);
  if (ps.taux != null && ps.taux < st.seuilAssiduite) alerts.push(`<div class="alert bad">${IC.alert}<div><b>Assiduité insuffisante (${ps.taux} %).</b> Le minimum attendu est de ${st.seuilAssiduite} %.</div></div>`);
  if (sancA.length) alerts.push(`<div class="alert bad">${IC.gavel}<div><b>${sancA.length} sanction(s) en cours.</b> <a href="#/discipline">Voir la rubrique Discipline</a></div></div>`);
  const ex = D.exercices.filter(e => (a.formations || []).includes(e.formationId)).sort((x, y) => (x.date || '').localeCompare(y.date || '')).map(e => ({ e, n: D.notes.find(n => n.exerciceId === e.id && n.note !== '' && n.note != null) })).filter(x => x.n).slice(-7);
  return `${heroX({ name: `${a.prenoms || ''} ${a.nom}`.trim(), label: 'Assiduité globale', value: ps.taux == null ? '—' : ps.taux + ' %', sub: `Moyenne ${moy == null ? '—' : moy.toFixed(2) + '/20'} · ${esc(a.matricule)}` })}
  ${quickBar(['mesformations', 'mesnotes', 'mespaiements', 'calendrier'])}
  ${alerts.join('')}
  ${statPair(['Total versé', money(fin.total)], ['Reste à payer', money(fin.reste)])}
  <div class="sec-h"><h3>Mes formations</h3><a href="#/mesformations">Voir tout</a></div>
  ${fs.length ? `<div class="promos">${fs.map(f => promoFormation(D, f, me)).join('')}</div>` : `<div class="card">${empty('Vous n\'êtes inscrit à aucune formation.', IC.book)}</div>`}
  ${tiles('Mon espace', ['mesformations', 'mesnotes', 'mespaiements', 'discipline', 'calendrier', 'notifications'])}
  <div class="home-grid">
    ${barChart('Mes notes', 'Derniers exercices', ex.map((x, i) => 'Ex ' + (i + 1)), [{ name: 'Note sur 20', values: ex.map(x => Math.round(+x.n.note / (+x.e.bareme || 20) * 20 * 10) / 10) }]) || `<div class="card"><div class="card-h"><h3>Mes notes</h3></div>${empty('Aucune note pour le moment.', IC.star)}</div>`}
    <div class="card"><div class="card-h"><h3>Prochaines séances</h3></div>${upcoming(D, a.formations || []).slice(0, 5).map(evItem).join('') || empty('Rien de programmé pour le moment.', IC.cal)}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>Dernières notifications</h3><a class="btn btn-o btn-s" href="#/notifications">Tout voir</a></div>${D.notifications.slice(0, 4).map(notifItem).join('') || empty('Aucune notification.', IC.bell)}</div>`;
}

function alertRows(D) {
  const st = D.settings, rows = [];
  D.apprenants.filter(a => a.surListe && a.statut !== 'Abandon').forEach(a => {
    const p = presStats(D, a.id), m = moyenne(D, a.id), why = [];
    if (p.taux != null && p.taux < st.seuilAssiduite) why.push(`<span class="b b-r">Assiduité ${p.taux} %</span>`);
    if (m != null && m < st.noteMin) why.push(`<span class="b b-o">Moyenne ${m.toFixed(2)}</span>`);
    if (seesFinance()) { const f = finance(D, a.id); if (f.reste > 0) why.push(`<span class="b b-b">Reste ${money(f.reste)}</span>`); }
    if (D.sanctions.some(s => s.email === a.id && s.statut === 'Active')) why.push('<span class="b b-r">Sanction</span>');
    if (why.length) rows.push({ a, why });
  });
  return rows;
}

function homeStaff(D) {
  const st = D.settings, r = S.role, t = TODAY(), m = curMonth();
  const actifs = actifsAca(D), pages = (NAV[r] || []).filter(p => !p.startsWith('|') && p !== 'home');
  const tenues = D.seances.filter(s => s.statut === 'Tenue');
  const allP = D.presences.filter(p => tenues.some(s => s.id === p.seanceId));
  const base = allP.filter(p => p.statut !== 'J').length, tx = base ? Math.round(allP.filter(p => p.statut === 'P' || p.statut === 'R').length / base * 100) : null;
  const mats = new Set(actifs.map(a => a.matricule)), enc = D.encaissements.filter(e => mats.has(e.matricule));
  const fins = seesFinance() ? actifs.map(a => finance(D, a.id)) : [];
  const resteTot = sum(fins, f => f.reste), aJour = fins.filter(f => !f.reste).length, teeOk = fins.filter(f => f.teeOk).length;
  const encMois = sum(enc.filter(p => (p.date || '').startsWith(m)), p => p.montant);
  const sancA = D.sanctions.filter(s => s.statut === 'Active').length;
  const nom = S.user.nom || '';
  if (r === 'formateur') {
    const fs = myFormations(D), fids = fs.map(f => f.id), nbApp = new Set(fs.flatMap(f => enrolled(D, f.id).map(a => a.id))).size;
    const aFaire = D.seances.filter(s => fids.includes(s.formationId) && s.date <= t && s.statut === 'Programmée');
    return `${heroX({ name: nom, label: 'Apprenants suivis', value: nbApp, sub: `${ROLES[r]} · ${fs.length} formation(s)` })}
    ${quickBar(['seances', 'exercices', 'assiduite', 'calendrier'])}
    ${aFaire.length ? `<div class="alert warn">${IC.alert}<div><b>${aFaire.length} séance(s) passée(s) sans appel.</b> <a href="#/seances">Faire l'appel maintenant</a></div></div>` : ''}
    ${statPair(['Appels à faire', aFaire.length], ['Exercices créés', D.exercices.filter(e => fids.includes(e.formationId)).length])}
    <div class="home-grid">${presChart(D, fids) || `<div class="card">${empty('Aucune séance tenue.', IC.chart)}</div>`}
    <div class="card"><div class="card-h"><h3>Mes prochaines séances</h3></div>${upcoming(D, fids).filter(e => e.type === 'Séance').slice(0, 5).map(evItem).join('') || empty('Aucune séance programmée.', IC.cal)}</div></div>`;
  }
  const fin = r === 'encaissement' || r === 'caisse';
  const hero = fin ? { label: 'Reste à recouvrer', value: money(resteTot), sub: `${aJour}/${actifs.length} apprenant(s) à jour · ${teeOk} T-shirt(s) soldé(s)` }
    : { label: 'Apprenants actifs', value: actifs.length, sub: `Assiduité globale ${tx == null ? '—' : tx + ' %'} · ${D.formations.filter(f => f.statut === 'En cours').length} formation(s) en cours` };
  const pair = seesFinance() ? statPair(['Encaissé ce mois', money(encMois)], ['Reste à recouvrer', money(resteTot)]) : statPair(['Assiduité globale', tx == null ? '—' : tx + ' %'], ['Sanctions actives', sancA]);
  // Graphique : encaissements des 6 derniers mois (finances) ou présences des 6 dernières séances
  const months = []; { let x = curMonth(); for (let i = 0; i < 6; i++) { months.unshift(x); const [y, mo] = x.split('-').map(Number); x = mo === 1 ? `${y - 1}-12` : `${y}-${pad(mo - 1)}`; } }
  const chart = fin ? barChart('Encaissements', '6 derniers mois', months.map(mm => new Date(mm + '-01T00:00:00').toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')), [{ name: 'Montant encaissé (FCFA)', values: months.map(mm => sum(enc.filter(e => (e.date || '').startsWith(mm)), e => e.montant)) }]) : presChart(D);
  const al = alertRows(D);
  return `${heroX({ name: nom, ...hero, sub: `${ROLES[r]} · ${hero.sub}` })}
  ${quickBar(pages)}
  ${pair}
  ${tiles('Services', pages)}
  <div class="home-grid">
    ${chart || `<div class="card">${empty('Pas encore de données.', IC.chart)}</div>`}
    <div class="card"><div class="card-h"><h3>Prochaines séances & activités</h3><a class="btn btn-o btn-s" href="#/calendrier">Calendrier</a></div>${upcoming(D).slice(0, 5).map(evItem).join('') || empty('Rien de programmé.', IC.cal)}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>Apprenants à surveiller</h3><span class="b b-r">${al.length}</span></div>${al.slice(0, 8).map(x => `<div class="list-i"><div class="hx-av" style="width:40px;height:40px;font-size:13px;background:var(--violet-l);box-shadow:none">${initials(x.a.nom + ' ' + x.a.prenoms)}</div><div style="flex:1;min-width:0"><div class="t">${esc(x.a.nom)} ${esc(x.a.prenoms)}</div><div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">${x.why.join('')}</div></div><button class="btn btn-o btn-s" data-act="fiche" data-id="${esc(x.a.id)}">${IC.eye}</button></div>`).join('') || empty('Aucune alerte. Tout est en ordre.', IC.ok)}</div>`;
}

// ---------- CALENDRIER ----------
PAGES.calendrier = D => {
  const tab = S.calTab || 'avenir', t = TODAY();
  const fids = isStudent() ? (D.apprenants[0]?.formations || []) : S.role === 'formateur' ? myFormations(D).map(f => f.id) : null;
  const s = D.seances.filter(x => !fids || fids.includes(x.formationId)).map(x => ({ id: x.id, k: 'seance', date: x.date, heure: x.heure, titre: x.theme || 'Séance de formation', sous: fName(D, x.formationId), type: 'Séance', statut: x.statut }));
  const a = D.activites.map(x => ({ id: x.id, k: 'activite', date: x.date, heure: x.heure, titre: x.titre, sous: [x.lieu, x.description].filter(Boolean).join(' — '), type: x.type || 'Activité' }));
  let ev = [...s, ...a].filter(e => tab === 'avenir' ? e.date >= t : e.date < t).sort((x, y) => (x.date + (x.heure || '')).localeCompare(y.date + (y.heure || '')));
  if (tab === 'passe') ev.reverse();
  const groups = {}; ev.forEach(e => (groups[e.date] = groups[e.date] || []).push(e));
  return `${roBanner()}<div class="toolbar"><div class="tabs" style="margin:0"><button class="${tab === 'avenir' ? 'on' : ''}" data-act="calTab" data-t="avenir">À venir</button><button class="${tab === 'passe' ? 'on' : ''}" data-act="calTab" data-t="passe">Passés</button></div><span class="sp"></span>${can('calendrier') ? `<button class="btn btn-p" data-act="activiteForm">${IC.plus} Nouvelle activité</button>` : ''}</div>
  <div class="card">${Object.entries(groups).map(([d, es]) => { const dd = toD(d); return `<div class="cal-day"><div class="date-box"><b>${dd.getDate()}</b><small>${dd.toLocaleDateString('fr-FR', { month: 'short' })}</small></div><div style="flex:1;min-width:0"><div class="small muted strong" style="text-transform:capitalize">${dd.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>${es.map(e => `<div style="display:flex;gap:10px;align-items:center;padding:6px 0"><div style="flex:1;min-width:0"><div class="t strong">${esc(e.titre)}</div><div class="small muted">${e.heure ? esc(e.heure) + ' · ' : ''}${esc(e.sous || '')}</div></div><span class="b ${e.type === 'Séance' ? 'b-p' : 'b-v'}">${esc(e.type)}</span>${e.statut === 'Annulée' ? '<span class="b b-r">Annulée</span>' : ''}${e.k === 'activite' && can('calendrier') ? `<button class="icon-btn" data-act="activiteForm" data-id="${e.id}">${IC.edit}</button><button class="icon-btn" data-act="activiteDel" data-id="${e.id}" style="color:var(--rouge)">${IC.trash}</button>` : ''}</div>`).join('')}</div></div>`; }).join('') || empty(tab === 'avenir' ? 'Aucun événement à venir.' : 'Aucun événement passé.', IC.cal)}</div>`;
};
ACT.calTab = d => { S.calTab = d.t; render(); };
ACT.activiteForm = d => {
  const x = d.id ? S.D.activites.find(a => a.id === d.id) : {};
  formModal({
    title: d.id ? 'Modifier l\'activité' : 'Nouvelle activité', values: x,
    fields: [{ k: 'titre', label: 'Titre', req: true }, { k: 'type', label: 'Type', type: 'select', options: ['Activité', 'Réunion', 'Atelier', 'Événement', 'Évaluation', 'Sortie'], req: true, half: true }, { k: 'lieu', label: 'Lieu / lien', half: true }, { k: 'date', label: 'Date', type: 'date', req: true, half: true }, { k: 'heure', label: 'Heure', type: 'time', half: true }, { k: 'description', label: 'Description', type: 'textarea' }, ...(d.id ? [] : [{ k: 'notif', label: 'Notifier les apprenants', type: 'select', options: [['oui', 'Oui, envoyer une notification à tous'], ['non', 'Non']], empty: false }])],
    onSubmit: async v => {
      const { notif, ...data } = v;
      if (d.id) await DB.update('activites', d.id, data); else { await DB.add('activites', { ...data, creePar: S.user.email }); if (notif === 'oui') await notify('all', 'activite', `Nouvelle activité : ${data.titre}`, `${fDate(data.date)}${data.heure ? ' à ' + data.heure : ''}${data.lieu ? ' — ' + data.lieu : ''}.`); }
      toast('Activité enregistrée', 'ok'); rerender();
    }
  });
};
ACT.activiteDel = d => confirmBox('Supprimer cette activité du calendrier ?', async () => { await DB.remove('activites', d.id); toast('Activité supprimée'); rerender(); }, 'Supprimer');

// ---------- FORMATIONS ----------
PAGES.formations = D => {
  const st = D.settings;
  return `${roBanner()}<div class="toolbar"><span class="muted">${D.formations.length} formation(s) au catalogue</span><span class="sp"></span>${can('formations') ? `<button class="btn btn-p" data-act="formationForm">${IC.plus} Nouvelle formation</button>` : ''}</div>
  <div class="grid g3">${D.formations.map(f => {
    const ins = enrolled(D, f.id), tenues = D.seances.filter(s => s.formationId === f.id && s.statut === 'Tenue').length;
    const txs = ins.map(a => presStats(D, a.id, f.id).taux).filter(x => x != null), tx = txs.length ? Math.round(sum(txs, x => x) / txs.length) : null;
    return `<div class="card" style="display:flex;flex-direction:column"><div class="card-b" style="flex:1"><div style="display:flex;gap:8px;align-items:flex-start;margin-bottom:8px"><span class="b ${f.statut === 'En cours' ? 'b-v' : f.statut === 'Terminée' ? 'b-g' : 'b-o'}">${esc(f.statut || '—')}</span><span class="b b-p" style="white-space:normal">${esc(f.domaine || '')}</span></div>
    <h3 style="font-size:15px;margin-bottom:4px">${esc(f.titre)}</h3><div class="small muted">${IC.user.replace('<svg', '<svg width="13" height="13"')} ${esc(f.formateurNom || 'Formateur non affecté')}</div><div class="small muted">${esc(f.jour || '')} ${esc(f.heure || '')}${f.lieu ? ' · ' + esc(f.lieu) : ''}</div>
    <div style="display:flex;gap:14px;margin-top:12px"><div><b>${ins.length}</b><div class="small muted">inscrits</div></div><div><b>${tenues}</b><div class="small muted">séances tenues</div></div><div><b>${tx == null ? '—' : tx + ' %'}</b><div class="small muted">assiduité</div></div></div></div>
    <div style="display:flex;gap:6px;padding:12px 18px;border-top:1px solid var(--line)"><button class="btn btn-o btn-s" data-act="formationVoir" data-id="${f.id}">${IC.eye} Inscrits</button><span style="flex:1"></span>${can('formations') ? `<button class="btn btn-o btn-s" data-act="formationForm" data-id="${f.id}">${IC.edit}</button><button class="btn btn-d btn-s" data-act="formationDel" data-id="${f.id}">${IC.trash}</button>` : ''}</div></div>`;
  }).join('') || `<div class="card">${empty('Aucune formation. Créez la première formation du catalogue.', IC.book)}</div>`}</div>`;
};
ACT.formationForm = d => {
  const D = S.D, f = d.id ? D.formations.find(x => x.id === d.id) : { statut: 'À venir', jour: 'Samedi' };
  const formateurs = D.users.filter(u => ['formateur', 'president', 'resp_formation', 'resp_suivi'].includes(acaRole(u))).map(u => [u.id, `${u.nom} (${ROLES[acaRole(u)]})`]);
  formModal({
    title: d.id ? 'Modifier la formation' : 'Nouvelle formation', values: f,
    fields: [{ k: 'titre', label: 'Intitulé de la formation', req: true }, { k: 'domaine', label: 'Domaine', type: 'select', options: DOMAINES, req: true }, { k: 'formateurEmail', label: 'Formateur', type: 'select', options: formateurs, hint: 'Les formateurs sont ajoutés dans « Utilisateurs & accès ».' }, { k: 'jour', label: 'Jour', type: 'select', options: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'], half: true }, { k: 'heure', label: 'Horaire', ph: '09h00 – 11h00', half: true }, { k: 'lieu', label: 'Lieu / lien Meet' }, { k: 'debut', label: 'Date de début', type: 'date', half: true }, { k: 'fin', label: 'Date de fin', type: 'date', half: true }, { k: 'statut', label: 'Statut', type: 'select', options: ['À venir', 'En cours', 'Terminée'], req: true }, { k: 'objectifs', label: 'Objectifs pédagogiques', type: 'textarea' }],
    onSubmit: async v => {
      const u = D.users.find(u => u.id === v.formateurEmail); v.formateurNom = u ? u.nom : '';
      if (d.id) await DB.update('formations', d.id, v); else { await DB.add('formations', v); }
      if (v.formateurEmail && v.formateurEmail !== f.formateurEmail) await notify(v.formateurEmail, 'activite', 'Formation affectée', `Vous êtes formateur de « ${v.titre} ».`);
      toast('Formation enregistrée', 'ok'); rerender();
    }
  });
};
ACT.formationDel = d => { const D = S.D; if (enrolled(D, d.id).length || D.seances.some(s => s.formationId === d.id)) return toast('Impossible : des apprenants ou séances sont liés à cette formation. Passez-la en « Terminée ».', 'bad'); confirmBox('Supprimer définitivement cette formation ?', async () => { await DB.remove('formations', d.id); toast('Formation supprimée'); rerender(); }, 'Supprimer'); };
ACT.formationVoir = d => {
  const D = S.D, f = D.formations.find(x => x.id === d.id), ins = enrolled(D, d.id);
  openModal({ title: esc(f.titre), wide: true, noFooter: true, body: `<p class="small muted" style="margin-bottom:12px">${ins.length} inscrit(s) · Formateur : ${esc(f.formateurNom || '—')}</p><div class="tbl-wrap"><table><thead><tr><th>Apprenant</th><th>Matricule</th><th>Assiduité</th><th>Moyenne</th></tr></thead><tbody>${ins.map(a => { const p = presStats(D, a.id, f.id); return `<tr><td class="strong">${esc(a.nom)} ${esc(a.prenoms)}</td><td>${esc(a.matricule)}</td><td>${tauxBadge(p.taux, D.settings.seuilAssiduite)} <span class="small muted">${p.P + p.R}/${p.total}</span></td><td>${moyBadge(moyenne(D, a.id, f.id))}</td></tr>`; }).join('') || '<tr><td colspan="4" class="center muted">Aucun inscrit</td></tr>'}</tbody></table></div>` });
};

// ---------- APPRENANTS ----------
PAGES.apprenants = D => {
  const q = lower(S.qApp || ''), fl = S.fApp || '', st = D.settings, fin = seesFinance();
  const list = D.apprenants.filter(a => (!fl || (a.formations || []).includes(fl)) && (!q || lower(`${a.nom} ${a.prenoms} ${a.matricule} ${a.id} ${a.specialite}`).includes(q))).sort((a, b) => (a.nom + a.prenoms).localeCompare(b.nom + b.prenoms));
  const horsListe = D.apprenants.filter(a => !a.surListe).length, dispo = D.etudiants.filter(e => e.statut === 'Actif' && !D.apprenants.some(a => a.matricule === e.id)).length;
  return `${roBanner()}<div class="alert info">${IC.info}<div>La liste des étudiants vient de <b>CVPB Manager</b> (${D.etudiants.filter(e => e.statut === 'Actif').length} étudiant(s) actif(s)). Seul un étudiant de cette liste peut être inscrit à l'Académie et se connecter. ${dispo} étudiant(s) actif(s) ne sont pas encore inscrits à l'Académie.</div></div>
  ${horsListe ? `<div class="alert bad">${IC.lock}<div><b>${horsListe} apprenant(s) n'ont plus accès</b> : ils ne figurent plus comme « Actif » dans la liste de CVPB Manager. Leur dossier Académie est conservé mais la connexion leur est refusée.</div></div>` : ''}
  <div class="toolbar"><input class="inp search" placeholder="Rechercher (nom, matricule, e-mail)…" value="${esc(S.qApp || '')}" id="qApp"><select class="inp" style="max-width:240px" id="fApp"><option value="">Toutes les formations</option>${D.formations.map(f => `<option value="${f.id}" ${fl === f.id ? 'selected' : ''}>${esc(f.titre)}</option>`).join('')}</select><span class="sp"></span><button class="btn btn-o" data-act="appExport">${IC.down} Exporter</button>${can('apprenants') ? `<button class="btn btn-p" data-act="appForm">${IC.plus} Inscrire un étudiant</button>` : ''}</div>
  <div class="card tbl-wrap"><table><thead><tr><th>Apprenant</th><th class="hide-m">Spécialité</th><th class="hide-m">Formations</th><th>Assiduité</th><th>Moyenne</th>${fin ? '<th>Reste à payer</th>' : ''}<th>Accès</th><th></th></tr></thead><tbody>
  ${list.map(a => { const p = presStats(D, a.id), m = moyenne(D, a.id); return `<tr><td><div class="strong">${esc(a.nom)} ${esc(a.prenoms)}</div><div class="small muted">${esc(a.matricule)} · ${esc(a.id)}</div></td><td class="hide-m small">${esc(a.specialite)}<div class="muted">${esc(a.niveau)}</div></td><td class="hide-m">${(a.formations || []).map(fid => `<span class="b b-p" style="margin:1px">${esc((D.formations.find(f => f.id === fid) || {}).titre?.split(' ')[0] || '?')}</span>`).join('')}</td><td>${tauxBadge(p.taux, st.seuilAssiduite)}</td><td>${moyBadge(m)}</td>${fin ? `<td>${(r => r ? `<span class="b b-o">${money(r)}</span>` : '<span class="b b-v">À jour</span>')(finance(D, a.id).reste)}</td>` : ''}<td>${!a.surListe ? `<span class="b b-r" title="Statut CVPB Manager : ${esc(a.statutCVPB)}">Hors liste CVPB</span>` : `<span class="b ${a.statut === 'Actif' ? 'b-v' : a.statut === 'Suspendu' ? 'b-o' : 'b-g'}">${esc(a.statut)}</span>`}</td><td class="right" style="white-space:nowrap"><button class="icon-btn" data-act="fiche" data-id="${esc(a.id)}" title="Fiche">${IC.eye}</button>${can('apprenants') ? `<button class="icon-btn" data-act="appForm" data-id="${esc(a.id)}" title="Modifier">${IC.edit}</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="8">${empty('Aucun apprenant inscrit à l\'Académie.', IC.users)}</td></tr>`}
  </tbody></table></div>`;
};
document.addEventListener('input', e => { if (e.target.id === 'qApp') { S.qApp = e.target.value; clearTimeout(S._t); S._t = setTimeout(() => { render().then(() => { const i = $('#qApp'); if (i) { i.focus(); i.setSelectionRange(i.value.length, i.value.length); } }); }, 350); } });
document.addEventListener('change', e => { if (e.target.id === 'fApp') { S.fApp = e.target.value; render(); } if (e.target.id === 'fSel') { S.fSel = e.target.value; render(); } });
ACT.appExport = () => { const D = S.D, fin = seesFinance(); exportCSV('apprenants_cvpb_academie', ['Matricule CVPB', 'Nom', 'E-mail UVCI', 'Spécialité', 'Niveau', 'Formations', 'Assiduité %', 'Moyenne', ...(fin ? ['Reste à payer'] : []), 'Statut Académie', 'Statut CVPB Manager'], D.apprenants.map(a => [a.matricule, `${a.nom} ${a.prenoms}`, a.id, a.specialite, a.niveau, (a.formations || []).map(f => fName(D, f)).join(' | '), presStats(D, a.id).taux ?? '', moyenne(D, a.id) ?? '', ...(fin ? [finance(D, a.id).reste] : []), a.statut, a.statutCVPB])); };
ACT.appForm = d => {
  const D = S.D, a = d.id ? D.apprenants.find(x => x.id === d.id) : { statut: 'Actif', formations: [] };
  const libres = D.etudiants.filter(e => e.statut === 'Actif' && !D.apprenants.some(x => x.matricule === e.id)).sort((x, y) => (x.nom || '').localeCompare(y.nom || ''));
  const fields = [
    ...(d.id ? [] : [{ k: 'matricule', label: 'Étudiant (liste CVPB Manager)', type: 'select', req: true, options: libres.map(e => [e.id, `${e.nom} — ${e.id}${e.academie ? ' · Académie ✓' : ''}`]), hint: libres.length ? 'Seuls les étudiants « Actif » de CVPB Manager apparaissent ici.' : 'Aucun étudiant disponible : ajoutez-le d\'abord dans CVPB Manager (Responsable des encaissements).' },
      { k: 'email', label: `Son e-mail UVCI (@${CONFIG.allowedDomain})`, type: 'email', req: true, hint: "C'est cet e-mail qui lui permettra de se connecter." }]),
    { k: 'formations', label: 'Formations suivies', type: 'checks', options: D.formations.filter(f => f.statut !== 'Terminée' || (a.formations || []).includes(f.id)).map(f => [f.id, f.titre]) },
    { k: 'statut', label: 'Statut à l\'Académie', type: 'select', options: ['Actif', 'Suspendu', 'Abandon'], req: true }];
  formModal({
    title: d.id ? 'Modifier l\'inscription' : 'Inscrire un étudiant à l\'Académie', values: a, fields,
    intro: d.id ? `<div class="alert ${a.surListe ? 'info' : 'bad'}">${IC.info}<div><b>${esc(a.nom)} ${esc(a.prenoms)}</b> · ${esc(a.matricule)} · ${esc(a.id)}<br>Statut dans CVPB Manager : <b>${esc(a.statutCVPB)}</b>${a.surListe ? '' : ' — accès refusé tant qu\'il n\'est pas « Actif » dans CVPB Manager.'}</div></div>` : '',
    onSubmit: async v => {
      if (!d.id) {
        const email = lower(v.email), e = D.etudiants.find(x => x.id === v.matricule);
        if (!e || e.statut !== 'Actif') { toast('Cet étudiant n\'est pas « Actif » dans CVPB Manager.', 'bad'); return false; }
        if (!email.endsWith('@' + CONFIG.allowedDomain)) { toast(`L'e-mail doit se terminer par @${CONFIG.allowedDomain}`, 'bad'); return false; }
        if (D.apprenants.some(x => x.id === email)) { toast('Cet e-mail est déjà rattaché à un apprenant.', 'bad'); return false; }
        if (D.apprenants.some(x => x.matricule === v.matricule)) { toast('Cet étudiant est déjà inscrit à l\'Académie.', 'bad'); return false; }
        if (acaRole(D.users.find(x => x.id === email))) { toast('Cet e-mail appartient à un membre du personnel.', 'bad'); return false; }
        await DB.set('apprenants', email, { matricule: v.matricule, formations: v.formations, statut: v.statut, dateInscription: TODAY(), inscritPar: S.user.email });
        await notify(email, 'annonce', 'Bienvenue à la CVPB Académie 🎓', `Votre espace est ouvert. Matricule : ${v.matricule}.`);
        toast(`${e.nom} inscrit(e) à l'Académie`, 'ok');
      } else {
        const added = (v.formations || []).filter(f => !(a.formations || []).includes(f));
        await DB.update('apprenants', d.id, { formations: v.formations, statut: v.statut });
        for (const f of added) await notify(d.id, 'activite', 'Inscription à une formation', `Vous êtes inscrit(e) à « ${fName(D, f)} ».`);
        if (v.statut !== a.statut) await notify(d.id, 'annonce', 'Statut de votre dossier', `Votre statut à l'Académie est désormais : ${v.statut}.`);
        toast('Inscription mise à jour', 'ok');
      }
      rerender();
    }
  });
};
ACT.fiche = d => {
  const D = S.D, a = D.apprenants.find(x => x.id === d.id); if (!a) return;
  const st = D.settings, fs = D.formations.filter(f => (a.formations || []).includes(f.id)), fin = seesFinance() ? finance(D, a.id) : null;
  const sanc = D.sanctions.filter(s => s.email === a.id);
  openModal({
    title: 'Fiche apprenant', wide: true, noFooter: true, body: `<div id="ficheP">
    <div style="display:flex;gap:14px;align-items:center;margin-bottom:16px"><div class="hero" style="padding:0;margin:0;width:56px;height:56px;border-radius:50%;justify-content:center"><b style="font-size:20px">${initials(a.nom + ' ' + a.prenoms)}</b></div><div style="flex:1"><h3 style="font-size:17px">${esc(a.nom)} ${esc(a.prenoms)}</h3><div class="small muted">${esc(a.matricule)} · ${esc(a.id)} · ${esc(a.specialite)} · ${esc(a.niveau)}</div><span class="b ${a.statut === 'Actif' ? 'b-v' : 'b-o'}">Académie : ${esc(a.statut)}</span> <span class="b ${a.surListe ? 'b-v' : 'b-r'}">CVPB : ${esc(a.statutCVPB)}</span></div></div>
    <h4 style="margin:8px 0">Résultats par formation</h4><div class="tbl-wrap"><table><thead><tr><th>Formation</th><th>Séances</th><th>P</th><th>R</th><th>A</th><th>J</th><th>Assiduité</th><th>Moyenne</th></tr></thead><tbody>${fs.map(f => { const p = presStats(D, a.id, f.id); return `<tr><td class="strong">${esc(f.titre)}</td><td>${p.total}</td><td>${p.P}</td><td>${p.R}</td><td>${p.A}</td><td>${p.J}</td><td>${tauxBadge(p.taux, st.seuilAssiduite)}</td><td>${moyBadge(moyenne(D, a.id, f.id))}</td></tr>`; }).join('') || '<tr><td colspan="8" class="muted center">Aucune formation</td></tr>'}</tbody></table></div>
    ${fin ? `<h4 style="margin:16px 0 8px">Situation financière (registre CVPB Manager)</h4><div class="grid g3">${kpi(IC.money, 'v2', money(fin.paye), 'Payé (obligatoire)')}${kpi(IC.chart, 'v1', money(fin.du), 'Dû à ce jour')}${kpi(IC.alert, fin.reste ? 'v3' : 'v2', money(fin.reste), 'Reste à payer')}</div><p class="small" style="margin-top:8px">T-shirt : ${fin.teeOk ? '<span class="b b-v">Soldé</span>' : `<span class="b b-r">${money(fin.tee)} / ${money(st.teeshirt)}</span>`} · Cotisations : ${fin.parMois.map(m => `<span class="b ${m.reste ? (m.paye ? 'b-o' : 'b-r') : 'b-v'}" style="margin:1px">${m.code} ${fMois(m.mois)} : ${money(m.paye)}</span>`).join(' ')}</p>` : ''}
    <h4 style="margin:16px 0 8px">Discipline</h4>${sanc.map(s => `<div class="small" style="padding:4px 0"><span class="b ${s.statut === 'Active' ? 'b-r' : 'b-g'}">${esc(s.type)}</span> ${fShort(s.date)} — ${esc(s.motif)} (${esc(s.statut)})</div>`).join('') || '<p class="small muted">Aucune sanction.</p>'}</div>`
  });
};

// ---------- SÉANCES & APPEL ----------
function formationFilter(D) {
  const fs = myFormations(D); if (S.fSel && !fs.some(f => f.id === S.fSel)) S.fSel = '';
  return `<select class="inp" style="max-width:280px" id="fSel"><option value="">${S.role === 'formateur' ? 'Toutes mes formations' : 'Toutes les formations'}</option>${fs.map(f => `<option value="${f.id}" ${S.fSel === f.id ? 'selected' : ''}>${esc(f.titre)}</option>`).join('')}</select>`;
}
PAGES.seances = D => {
  const fids = myFormations(D).map(f => f.id), t = TODAY();
  const list = D.seances.filter(s => fids.includes(s.formationId) && (!S.fSel || s.formationId === S.fSel)).sort((a, b) => b.date.localeCompare(a.date));
  const late = list.filter(s => s.date <= t && s.statut === 'Programmée').length;
  return `${roBanner()}${late ? `<div class="alert warn">${IC.alert}<div><b>${late} séance(s) passée(s) sans appel.</b> Faites l'appel pour que l'assiduité des apprenants soit à jour.</div></div>` : ''}
  <div class="toolbar">${formationFilter(D)}<span class="sp"></span>${can('seances') ? `<button class="btn btn-p" data-act="seanceForm">${IC.plus} Programmer une séance</button>` : ''}</div>
  <div class="card tbl-wrap"><table><thead><tr><th>Date</th><th>Formation</th><th>Thème</th><th>Statut</th><th>Présences</th><th></th></tr></thead><tbody>
  ${list.map(s => { const pr = D.presences.filter(p => p.seanceId === s.id), np = pr.filter(p => p.statut === 'P' || p.statut === 'R').length; return `<tr><td><div class="strong">${fShort(s.date)}</div><div class="small muted">${esc(s.heure || '')}</div></td><td>${esc(fName(D, s.formationId))}</td><td>${esc(s.theme || '—')}</td><td><span class="b ${s.statut === 'Tenue' ? 'b-v' : s.statut === 'Annulée' ? 'b-r' : s.date <= t ? 'b-o' : 'b-p'}">${s.statut === 'Programmée' && s.date <= t ? 'Appel à faire' : esc(s.statut)}</span></td><td>${pr.length ? `${np}/${pr.length}` : '—'}</td><td class="right" style="white-space:nowrap">${can('seances') && s.statut !== 'Annulée' ? `<button class="btn ${s.statut === 'Tenue' ? 'btn-o' : 'btn-g'} btn-s" data-act="appel" data-id="${s.id}">${IC.check} ${s.statut === 'Tenue' ? 'Modifier l\'appel' : 'Faire l\'appel'}</button>` : `<button class="btn btn-o btn-s" data-act="appelVoir" data-id="${s.id}">${IC.eye}</button>`}${can('seances') ? ` <button class="icon-btn" data-act="seanceForm" data-id="${s.id}">${IC.edit}</button>` : ''}</td></tr>`; }).join('') || `<tr><td colspan="6">${empty('Aucune séance programmée.', IC.cal)}</td></tr>`}
  </tbody></table></div>`;
};
ACT.seanceForm = d => {
  const D = S.D, s = d.id ? D.seances.find(x => x.id === d.id) : { formationId: S.fSel || '', statut: 'Programmée', date: TODAY() };
  formModal({
    title: d.id ? 'Modifier la séance' : 'Programmer une séance', values: { ...s, heure: s.heure || (D.formations.find(f => f.id === s.formationId) || {}).heure },
    fields: [{ k: 'formationId', label: 'Formation', type: 'select', options: formationOpts(D), req: true }, { k: 'date', label: 'Date', type: 'date', req: true, half: true }, { k: 'heure', label: 'Horaire', ph: '09h00 – 11h00', half: true }, { k: 'theme', label: 'Thème / contenu de la séance', req: true }, { k: 'statut', label: 'Statut', type: 'select', options: d.id ? ['Programmée', 'Tenue', 'Annulée'] : ['Programmée', 'Annulée'], req: true }],
    onSubmit: async v => {
      if (d.id) { await DB.update('seances', d.id, v); if (v.statut === 'Annulée' && s.statut !== 'Annulée') for (const a of enrolled(D, v.formationId)) await notify(a.id, 'activite', 'Séance annulée', `La séance « ${v.theme} » (${fName(D, v.formationId)}) du ${fDate(v.date)} est annulée.`); }
      else { await DB.add('seances', { ...v, creePar: S.user.email }); for (const a of enrolled(D, v.formationId)) await notify(a.id, 'activite', 'Nouvelle séance programmée', `${fName(D, v.formationId)} — « ${v.theme} », ${fDate(v.date)}${v.heure ? ' · ' + v.heure : ''}.`); }
      toast('Séance enregistrée', 'ok'); rerender();
    }
  });
};
ACT.appelVoir = d => { const D = S.D, s = D.seances.find(x => x.id === d.id); openModal({ title: 'Feuille de présence', noFooter: true, body: `<p class="small muted">${esc(fName(D, s.formationId))} · ${fDate(s.date)}</p>${enrolled(D, s.formationId).map(a => { const p = D.presences.find(p => p.seanceId === s.id && p.email === a.id); return `<div class="appel-row"><div style="flex:1">${esc(a.nom)} ${esc(a.prenoms)}</div>${p ? `<span class="b ${PRES_BADGE[p.statut]}">${PRES_LABEL[p.statut]}</span>` : '<span class="b b-g">—</span>'}</div>`; }).join('')}` }); };
ACT.appel = d => {
  const D = S.D, s = D.seances.find(x => x.id === d.id), ins = enrolled(D, s.formationId);
  const cur = {}; ins.forEach(a => { const p = D.presences.find(p => p.seanceId === s.id && p.email === a.id); cur[a.id] = p ? p.statut : 'P'; });
  const m = openModal({
    title: `Appel — ${esc(fName(D, s.formationId))}`, ok: 'Valider l\'appel', okClass: 'btn-g', wide: true,
    body: `<div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;flex-wrap:wrap"><span class="small muted" style="flex:1">${fDate(s.date)} · ${esc(s.theme || '')} · ${ins.length} inscrit(s)</span><button class="btn btn-o btn-s" id="allP">Tous présents</button></div>
    <div class="small muted" style="margin-bottom:6px">P = Présent · R = Retard · A = Absent · J = Absence justifiée</div>
    ${ins.map(a => `<div class="appel-row"><div style="flex:1;min-width:0"><div class="strong">${esc(a.nom)} ${esc(a.prenoms)}</div><div class="small muted">${esc(a.matricule)}</div></div><div class="seg" data-email="${esc(a.id)}">${['P', 'R', 'A', 'J'].map(k => `<button type="button" class="${k} ${cur[a.id] === k ? 'on' : ''}" data-v="${k}">${k}</button>`).join('')}</div></div>`).join('') || empty('Aucun apprenant inscrit à cette formation.')}`,
    onOk: async () => {
      const prev = {}; D.presences.filter(p => p.seanceId === s.id).forEach(p => prev[p.email] = p.statut);
      for (const a of ins) {
        const st = cur[a.id];
        await DB.set('presences', `${s.id}_${a.id.replace(/[^a-z0-9]/gi, '_')}`, { seanceId: s.id, formationId: s.formationId, email: a.id, statut: st, date: s.date, par: S.user.email });
        if (st !== prev[a.id] && (st === 'A' || st === 'R')) await notify(a.id, 'assiduite', st === 'A' ? 'Absence enregistrée' : 'Retard enregistré', `${fName(D, s.formationId)} — séance du ${fDate(s.date)}. Si votre absence est justifiée, contactez le Responsable Suivi & Accompagnement.`);
      }
      await DB.update('seances', s.id, { statut: 'Tenue', appelPar: S.user.email, appelLe: new Date().toISOString() });
      toast('Appel enregistré', 'ok'); rerender();
    }
  });
  m.querySelectorAll('.seg').forEach(seg => seg.onclick = e => { const b = e.target.closest('button'); if (!b) return; cur[seg.dataset.email] = b.dataset.v; seg.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); });
  const ap = m.querySelector('#allP'); if (ap) ap.onclick = () => { ins.forEach(a => cur[a.id] = 'P'); m.querySelectorAll('.seg button').forEach(x => x.classList.toggle('on', x.dataset.v === 'P')); };
};

// ---------- EXERCICES & NOTES ----------
PAGES.exercices = D => {
  const fids = myFormations(D).map(f => f.id);
  const list = D.exercices.filter(e => fids.includes(e.formationId) && (!S.fSel || e.formationId === S.fSel)).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `${roBanner()}<div class="toolbar">${formationFilter(D)}<span class="sp"></span>${can('exercices') ? `<button class="btn btn-p" data-act="exoForm">${IC.plus} Nouvel exercice</button>` : ''}</div>
  <div class="card tbl-wrap"><table><thead><tr><th>Exercice</th><th>Formation</th><th>Date</th><th>Barème</th><th>Notés</th><th>Moy. classe</th><th></th></tr></thead><tbody>
  ${list.map(e => { const ins = enrolled(D, e.formationId), ns = D.notes.filter(n => n.exerciceId === e.id && n.note !== '' && n.note != null), mc = ns.length ? sum(ns, n => n.note) / ns.length : null; return `<tr><td><div class="strong">${esc(e.titre)}</div><div class="small muted">${esc(e.type || '')} · coef. ${esc(e.coef || 1)}</div></td><td>${esc(fName(D, e.formationId))}</td><td>${fShort(e.date)}</td><td>/${esc(e.bareme)}</td><td><span class="b ${ns.length >= ins.length && ins.length ? 'b-v' : 'b-o'}">${ns.length}/${ins.length}</span></td><td>${mc == null ? '—' : mc.toFixed(2) + '/' + e.bareme}</td><td class="right" style="white-space:nowrap">${can('exercices') ? `<button class="btn btn-g btn-s" data-act="notesForm" data-id="${e.id}">${IC.star} Saisir les notes</button> <button class="icon-btn" data-act="exoForm" data-id="${e.id}">${IC.edit}</button><button class="icon-btn" style="color:var(--rouge)" data-act="exoDel" data-id="${e.id}">${IC.trash}</button>` : `<button class="btn btn-o btn-s" data-act="notesVoir" data-id="${e.id}">${IC.eye}</button>`}</td></tr>`; }).join('') || `<tr><td colspan="7">${empty('Aucun exercice.', IC.star)}</td></tr>`}
  </tbody></table></div>`;
};
ACT.exoForm = d => {
  const D = S.D, e = d.id ? D.exercices.find(x => x.id === d.id) : { formationId: S.fSel || '', bareme: 20, coef: 1, date: TODAY(), type: 'Exercice pratique' };
  formModal({
    title: d.id ? 'Modifier l\'exercice' : 'Nouvel exercice', values: e,
    fields: [{ k: 'formationId', label: 'Formation', type: 'select', options: formationOpts(D), req: true }, { k: 'titre', label: 'Intitulé', req: true }, { k: 'type', label: 'Type', type: 'select', options: ['Exercice pratique', 'Devoir', 'Quiz', 'Projet', 'Évaluation finale'], req: true, half: true }, { k: 'date', label: 'Date / échéance', type: 'date', req: true, half: true }, { k: 'bareme', label: 'Noté sur', type: 'number', min: 1, req: true, half: true }, { k: 'coef', label: 'Coefficient', type: 'number', min: 1, step: 1, req: true, half: true }, { k: 'consigne', label: 'Consigne', type: 'textarea' }],
    onSubmit: async v => {
      if (d.id) await DB.update('exercices', d.id, v); else { await DB.add('exercices', { ...v, creePar: S.user.email }); for (const a of enrolled(D, v.formationId)) await notify(a.id, 'note', 'Nouvel exercice', `${fName(D, v.formationId)} — « ${v.titre} » (échéance : ${fDate(v.date)}).`); }
      toast('Exercice enregistré', 'ok'); rerender();
    }
  });
};
ACT.exoDel = d => { if (S.D.notes.some(n => n.exerciceId === d.id)) return toast('Des notes existent déjà pour cet exercice : suppression impossible.', 'bad'); confirmBox('Supprimer cet exercice ?', async () => { await DB.remove('exercices', d.id); rerender(); }, 'Supprimer'); };
ACT.notesVoir = d => { const D = S.D, e = D.exercices.find(x => x.id === d.id); openModal({ title: esc(e.titre), noFooter: true, body: enrolled(D, e.formationId).map(a => { const n = D.notes.find(n => n.exerciceId === e.id && n.email === a.id); return `<div class="appel-row"><div style="flex:1">${esc(a.nom)} ${esc(a.prenoms)}</div><b>${n && n.note !== '' ? n.note + '/' + e.bareme : '—'}</b></div>`; }).join('') }); };
ACT.notesForm = d => {
  const D = S.D, e = D.exercices.find(x => x.id === d.id), ins = enrolled(D, e.formationId);
  const nid = a => `${e.id}_${a.id.replace(/[^a-z0-9]/gi, '_')}`;
  openModal({
    title: `Notes — ${esc(e.titre)}`, ok: 'Enregistrer les notes', okClass: 'btn-g', wide: true,
    body: `<p class="small muted" style="margin-bottom:10px">${esc(fName(D, e.formationId))} · noté sur ${e.bareme} · coef. ${e.coef || 1}. Laissez vide si non rendu.</p>${ins.map(a => { const n = D.notes.find(n => n.exerciceId === e.id && n.email === a.id) || {}; return `<div class="appel-row" style="flex-wrap:wrap"><div style="flex:1;min-width:150px"><div class="strong">${esc(a.nom)} ${esc(a.prenoms)}</div><div class="small muted">${esc(a.matricule)}</div></div><input class="inp note-inp" type="number" min="0" max="${e.bareme}" step="0.25" data-n="${esc(a.id)}" value="${esc(n.note ?? '')}" placeholder="/${e.bareme}"><input class="inp" style="flex:1;min-width:150px" data-c="${esc(a.id)}" value="${esc(n.commentaire || '')}" placeholder="Appréciation (facultatif)"></div>`; }).join('') || empty('Aucun apprenant inscrit.')}`,
    onOk: async (m) => {
      for (const a of ins) {
        const raw = m.querySelector(`[data-n="${CSS.escape(a.id)}"]`).value, com = m.querySelector(`[data-c="${CSS.escape(a.id)}"]`).value.trim();
        const old = D.notes.find(n => n.exerciceId === e.id && n.email === a.id);
        if (raw === '' && !old) continue;
        const note = raw === '' ? '' : Number(raw);
        if (note !== '' && (note < 0 || note > e.bareme)) { toast(`Note invalide pour ${a.nom}`, 'bad'); return false; }
        if (old && old.note === note && (old.commentaire || '') === com) continue;
        await DB.set('notes', nid(a), { exerciceId: e.id, formationId: e.formationId, email: a.id, note, commentaire: com, date: TODAY(), par: S.user.email });
        if (note !== '') await notify(a.id, 'note', 'Nouvelle note disponible', `${fName(D, e.formationId)} — « ${e.titre} » : ${note}/${e.bareme}.`);
      }
      toast('Notes enregistrées', 'ok'); rerender();
    }
  });
};

// ---------- ASSIDUITÉ ----------
PAGES.assiduite = D => {
  const st = D.settings, fs = myFormations(D).filter(f => !S.fSel || f.id === S.fSel);
  const rows = []; fs.forEach(f => enrolled(D, f.id).forEach(a => rows.push({ a, f, p: presStats(D, a.id, f.id) })));
  rows.sort((x, y) => (x.p.taux ?? 101) - (y.p.taux ?? 101));
  const enAlerte = rows.filter(r => r.p.taux != null && r.p.taux < st.seuilAssiduite);
  return `<div class="alert info">${IC.info}<div><b>Méthode de calcul :</b> taux = (Présences + Retards) ÷ (Présences + Retards + Absences non justifiées). Les absences justifiées ne pénalisent pas. Seuil d'alerte : <b>${st.seuilAssiduite} %</b>.</div></div>
  <div class="toolbar">${formationFilter(D)}<span class="sp"></span><button class="btn btn-o" data-act="assExport">${IC.down} Exporter</button>${PEDAGO.includes(S.role) && enAlerte.length ? `<button class="btn btn-p" data-act="assRelance">${IC.send} Alerter les ${enAlerte.length} apprenant(s) sous le seuil</button>` : ''}</div>
  <div class="card tbl-wrap"><table><thead><tr><th>Apprenant</th><th>Formation</th><th class="center">Séances</th><th class="center">P</th><th class="center">R</th><th class="center">A</th><th class="center">J</th><th style="min-width:140px">Taux</th></tr></thead><tbody>
  ${rows.map(r => `<tr><td class="strong">${esc(r.a.nom)} ${esc(r.a.prenoms)}</td><td class="small">${esc(r.f.titre)}</td><td class="center">${r.p.total}</td><td class="center">${r.p.P}</td><td class="center">${r.p.R}</td><td class="center">${r.p.A}</td><td class="center">${r.p.J}</td><td><div style="display:flex;gap:8px;align-items:center">${prog(r.p.taux)}${tauxBadge(r.p.taux, st.seuilAssiduite)}</div></td></tr>`).join('') || `<tr><td colspan="8">${empty('Aucune donnée d\'assiduité.', IC.chart)}</td></tr>`}
  </tbody></table></div>`;
};
ACT.assExport = () => { const D = S.D, rows = []; myFormations(D).forEach(f => enrolled(D, f.id).forEach(a => { const p = presStats(D, a.id, f.id); rows.push([a.matricule, `${a.nom} ${a.prenoms}`, f.titre, p.total, p.P, p.R, p.A, p.J, p.taux ?? '']); })); exportCSV('assiduite_cvpb_academie', ['Matricule', 'Apprenant', 'Formation', 'Séances', 'Présent', 'Retard', 'Absent', 'Justifié', 'Taux %'], rows); };
ACT.assRelance = () => {
  const D = S.D, st = D.settings, rows = []; myFormations(D).forEach(f => enrolled(D, f.id).forEach(a => { const p = presStats(D, a.id, f.id); if (p.taux != null && p.taux < st.seuilAssiduite) rows.push({ a, f, p }); }));
  confirmBox(`Envoyer une alerte d'assiduité à ${rows.length} apprenant(s) ?`, async () => { for (const r of rows) await notify(r.a.id, 'assiduite', 'Alerte assiduité', `Votre taux de présence en « ${r.f.titre} » est de ${r.p.taux} % (minimum attendu : ${st.seuilAssiduite} %). Merci de régulariser votre présence.`); toast('Alertes envoyées', 'ok'); rerender(); }, 'Envoyer', 'btn-p');
};

// ---------- SANCTIONS ----------
PAGES.sanctions = D => {
  const list = D.sanctions.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `${roBanner()}<div class="toolbar"><span class="muted">${list.filter(s => s.statut === 'Active').length} sanction(s) active(s) · ${list.length} au total</span><span class="sp"></span>${can('sanctions') ? `<button class="btn btn-d" data-act="sanctionForm">${IC.gavel} Prononcer une sanction</button>` : ''}</div>
  <div class="card tbl-wrap"><table><thead><tr><th>Date</th><th>Apprenant</th><th>Sanction</th><th>Motif</th><th>Statut</th><th></th></tr></thead><tbody>
  ${list.map(s => `<tr><td>${fShort(s.date)}</td><td class="strong">${esc(aName(D, s.email))}</td><td><span class="b ${s.type === 'Avertissement' ? 'b-o' : 'b-r'}">${esc(s.type)}</span></td><td>${esc(s.motif)}${s.formationId ? `<div class="small muted">${esc(fName(D, s.formationId))}</div>` : ''}</td><td><span class="b ${s.statut === 'Active' ? 'b-r' : 'b-g'}">${esc(s.statut)}</span></td><td class="right">${can('sanctions') && s.statut === 'Active' ? `<button class="btn btn-o btn-s" data-act="sanctionLever" data-id="${s.id}">Lever</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="6">${empty('Aucune sanction prononcée.', IC.gavel)}</td></tr>`}
  </tbody></table></div>`;
};
ACT.sanctionForm = () => {
  const D = S.D;
  formModal({
    title: 'Prononcer une sanction', ok: 'Notifier la sanction', intro: `<div class="alert warn">${IC.alert}<div>L'apprenant recevra immédiatement une notification. Assurez-vous que les faits sont établis et que l'apprenant a été entendu.</div></div>`,
    values: { date: TODAY() },
    fields: [{ k: 'email', label: 'Apprenant', type: 'select', options: D.apprenants.filter(a => a.surListe && a.statut !== 'Abandon').map(a => [a.id, `${a.nom} ${a.prenoms} (${a.matricule})`]), req: true }, { k: 'type', label: 'Type de sanction', type: 'select', options: SANCTIONS, req: true, half: true }, { k: 'date', label: 'Date', type: 'date', req: true, half: true }, { k: 'formationId', label: 'Formation concernée (facultatif)', type: 'select', options: D.formations.map(f => [f.id, f.titre]) }, { k: 'motif', label: 'Motif (faits reprochés)', type: 'textarea', req: true }, { k: 'mesure', label: 'Mesure / conditions de levée', type: 'textarea', rows: 2 }],
    onSubmit: async v => {
      await DB.add('sanctions', { ...v, statut: 'Active', par: S.user.email });
      await notify(v.email, 'sanction', `Sanction : ${v.type}`, `Motif : ${v.motif}${v.mesure ? ' — ' + v.mesure : ''}`);
      if (v.type.startsWith('Suspension') || v.type.startsWith('Exclusion')) await DB.update('apprenants', v.email, { statut: 'Suspendu' });
      toast('Sanction enregistrée et notifiée', 'ok'); rerender();
    }
  });
};
ACT.sanctionLever = d => { const s = S.D.sanctions.find(x => x.id === d.id); confirmBox(`Lever la sanction « ${esc(s.type)} » de ${esc(aName(S.D, s.email))} ?`, async () => { await DB.update('sanctions', s.id, { statut: 'Levée', leveeLe: TODAY(), leveePar: S.user.email }); const a = S.D.apprenants.find(a => a.id === s.email); if (a && a.statut === 'Suspendu') await DB.update('apprenants', a.id, { statut: 'Actif' }); await notify(s.email, 'sanction', 'Sanction levée', `Votre sanction (${s.type}) a été levée.`); toast('Sanction levée', 'ok'); rerender(); }, 'Lever', 'btn-g'); };

// ---------- ENCAISSEMENTS ----------
const natureCourte = e => { const n = lower(e.nature); return n.startsWith('inscription') ? 'Inscription' : n.includes('t-shirt') ? 'T-shirt' : n.includes('cotisation') ? 'Cotisation' : (e.nature || 'Autre'); };
PAGES.paiements = D => {
  const tab = S.payTab || 'situation', st = D.settings, m = curMonth();
  const actifs = actifsAca(D), mats = new Set(D.apprenants.map(a => a.matricule));
  const enc = D.encaissements.filter(e => mats.has(e.matricule)).sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.num || '').localeCompare(a.num || ''));
  const fins = actifs.map(a => ({ a, f: finance(D, a.id) }));
  const head = `<div class="alert info">${IC.info}<div>Les paiements sont enregistrés <b>uniquement dans CVPB Manager</b> (registre d'encaissement). Cette page les lit automatiquement : il n'y a rien à ressaisir. Barème : T-shirt <b>${money(st.teeshirt)}</b> (une seule fois) · cotisation <b>${money(st.mensualite)}</b>/mois (échelonnable) · ${fMois(st.moisDebut)} → ${fMois(st.moisFin)}.</div></div>
  <div class="grid g4" style="margin-bottom:16px">${kpi(IC.chart, 'v1', money(sum(enc.filter(p => (p.date || '').startsWith(m)), p => p.montant)), 'Encaissé ce mois')}${kpi(IC.ok, 'v2', `${fins.filter(x => !x.f.reste).length}/${actifs.length}`, 'Apprenants à jour')}${kpi(IC.alert, 'v3', money(sum(fins, x => x.f.reste)), 'Reste à recouvrer')}${kpi(IC.user, 'v5', `${fins.filter(x => x.f.teeOk).length}/${actifs.length}`, 'T-shirts soldés')}</div>
  <div class="toolbar"><div class="tabs" style="margin:0"><button class="${tab === 'situation' ? 'on' : ''}" data-act="payTab" data-t="situation">Situation des apprenants</button><button class="${tab === 'historique' ? 'on' : ''}" data-act="payTab" data-t="historique">Encaissements</button></div><span class="sp"></span><button class="btn btn-o" data-act="payExport">${IC.down} Exporter</button>${can('paiements') ? `<button class="btn btn-p" data-act="payRelanceAll">${IC.send} Relancer les retardataires</button>` : ''}</div>`;
  if (tab === 'historique') return head + `<div class="card tbl-wrap"><table><thead><tr><th>N°</th><th>Date</th><th>Apprenant</th><th>Nature</th><th class="right">Montant</th><th class="hide-m">Mode</th><th class="hide-m">Encaissé par</th></tr></thead><tbody>${enc.map(p => `<tr><td class="small">${esc(p.num || p.id)}</td><td>${fShort(p.date)}</td><td class="strong">${esc(aName(D, (D.apprenants.find(a => a.matricule === p.matricule) || {}).id) || p.nom)}</td><td>${esc(natureCourte(p))}${p.mois ? ` <span class="small muted">${esc(p.mois)}</span>` : ''}</td><td class="right strong">${money(p.montant)}</td><td class="hide-m">${esc(p.mode || '')}</td><td class="hide-m small">${esc(p.encaissePar || '')}</td></tr>`).join('') || `<tr><td colspan="7">${empty('Aucun encaissement pour les apprenants de l\'Académie.', IC.money)}</td></tr>`}</tbody></table></div>`;
  return head + `<div class="card tbl-wrap"><table><thead><tr><th>Apprenant</th><th>T-shirt</th><th>Cotisations</th><th>Total payé</th><th>Reste à payer</th><th></th></tr></thead><tbody>${fins.sort((x, y) => y.f.reste - x.f.reste).map(({ a, f }) => `<tr><td><div class="strong">${esc(a.nom)} ${esc(a.prenoms)}</div><div class="small muted">${esc(a.matricule)}</div></td><td>${f.teeOk ? '<span class="b b-v">Soldé</span>' : `<span class="b b-r">${money(f.tee)}</span>`}</td><td>${f.parMois.map(x => `<span class="b ${x.reste ? (x.paye ? 'b-o' : 'b-r') : 'b-v'}" style="margin:1px" title="${fMois(x.mois)}">${x.code} ${x.paye ? Math.round(x.paye / 100) / 10 + 'k' : '0'}</span>`).join('')}${f.avance ? ` <span class="b b-b">+${money(f.avance)} d'avance</span>` : ''}</td><td>${money(f.total)}</td><td>${f.reste ? `<span class="b b-o">${money(f.reste)}</span>` : '<span class="b b-v">À jour</span>'}</td><td class="right">${can('paiements') && f.reste ? `<button class="btn btn-o btn-s" data-act="payRelance" data-email="${esc(a.id)}" title="Envoyer un rappel">${IC.send}</button>` : ''}</td></tr>`).join('') || `<tr><td colspan="6">${empty('Aucun apprenant actif.')}</td></tr>`}</tbody></table></div>`;
};
ACT.payTab = d => { S.payTab = d.t; render(); };
ACT.payExport = () => { const D = S.D; exportCSV('situation_financiere_academie', ['Matricule', 'Apprenant', 'T-shirt payé', 'Cotisations payées', 'Total payé', 'Dû à ce jour', 'Reste à payer'], actifsAca(D).map(a => { const f = finance(D, a.id); return [a.matricule, `${a.nom} ${a.prenoms}`, Math.min(f.tee, D.settings.teeshirt), sum(f.parMois, m => m.paye) + f.avance, f.total, f.du, f.reste]; })); };
ACT.payRelance = d => { const f = finance(S.D, d.email); confirmBox(`Envoyer un rappel de paiement (${money(f.reste)}) à ${esc(aName(S.D, d.email))} ?`, async () => { await notify(d.email, 'paiement', 'Rappel de paiement', `Votre reste à payer est de ${money(f.reste)}${f.teeOk ? '' : ' (dont le T-shirt)'}. Merci de régulariser auprès de la Responsable des encaissements.`); toast('Rappel envoyé', 'ok'); }, 'Envoyer', 'btn-p'); };
ACT.payRelanceAll = () => { const D = S.D, l = actifsAca(D).map(a => ({ a, f: finance(D, a.id) })).filter(x => x.f.reste > 0); if (!l.length) return toast('Tous les apprenants sont à jour.', 'ok'); confirmBox(`Envoyer un rappel de paiement à ${l.length} apprenant(s) non à jour ?`, async () => { for (const x of l) await notify(x.a.id, 'paiement', 'Rappel de paiement', `Votre reste à payer est de ${money(x.f.reste)}. Merci de régulariser auprès de la Responsable des encaissements.`); toast('Rappels envoyés', 'ok'); }, 'Envoyer', 'btn-p'); };

// ---------- ANNONCES ----------
PAGES.annonces = D => `${roBanner()}<div class="toolbar"><span class="muted">Envoyez une notification aux apprenants (tous, par formation ou individuellement).</span><span class="sp"></span>${can('annonces') ? `<button class="btn btn-p" data-act="annonceForm">${IC.send} Nouvelle annonce</button>` : ''}</div>
<div class="card">${D.annonces.slice().sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(a => `<div class="list-i"><div class="ic v1" style="background:var(--violet-l);color:var(--violet)">${IC.mega}</div><div style="flex:1;min-width:0"><div class="t">${esc(a.titre)}</div><div class="small" style="color:var(--ink-2)">${esc(a.message)}</div><div class="small muted">${esc(a.cible)} · ${fDT(a.date)} · ${esc((D.users.find(u => u.id === a.par) || {}).nom || a.par)}</div></div><span class="b b-p">${a.nb} dest.</span></div>`).join('') || empty('Aucune annonce envoyée.', IC.mega)}</div>`;
ACT.annonceForm = () => {
  const D = S.D;
  formModal({
    title: 'Nouvelle annonce', ok: 'Envoyer', values: { cible: 'all', cat: 'annonce' },
    fields: [{ k: 'cible', label: 'Destinataires', type: 'select', empty: false, options: [['all', 'Tous les apprenants'], ['formation', 'Les inscrits d\'une formation'], ['un', 'Un apprenant']], req: true }, { k: 'formationId', label: 'Formation', type: 'select', options: D.formations.map(f => [f.id, f.titre]), when: v => v.cible === 'formation' }, { k: 'email', label: 'Apprenant', type: 'select', options: actifsAca(D).map(a => [a.id, `${a.nom} ${a.prenoms}`]), when: v => v.cible === 'un' }, { k: 'cat', label: 'Catégorie', type: 'select', empty: false, options: [['annonce', 'Annonce'], ['activite', 'Activité'], ['paiement', 'Paiement'], ['assiduite', 'Assiduité']] }, { k: 'titre', label: 'Titre', req: true }, { k: 'message', label: 'Message', type: 'textarea', rows: 4, req: true }],
    onSubmit: async v => {
      let dests = [], cible = 'Tous les apprenants';
      if (v.cible === 'all') dests = ['all'];
      else if (v.cible === 'formation') { if (!v.formationId) { toast('Choisissez la formation.', 'bad'); return false; } dests = enrolled(D, v.formationId).map(a => a.id); cible = 'Formation : ' + fName(D, v.formationId); }
      else { if (!v.email) { toast('Choisissez l\'apprenant.', 'bad'); return false; } dests = [v.email]; cible = aName(D, v.email); }
      for (const d of dests) await notify(d, v.cat, v.titre, v.message);
      await DB.add('annonces', { titre: v.titre, message: v.message, cat: v.cat, cible, nb: v.cible === 'all' ? actifsAca(D).length : dests.length, date: new Date().toISOString(), par: S.user.email });
      toast('Annonce envoyée', 'ok'); rerender();
    }
  });
};

// ---------- NOTIFICATIONS ----------
PAGES.notifications = D => {
  const f = S.nTab || 'all', list = D.notifications.filter(n => f === 'all' || (f === 'unread' ? !isRead(n) : n.cat === f));
  setTimeout(() => markRead(list.slice(0, 30).map(n => n.id)), 1500);
  return `<div class="toolbar"><div class="tabs" style="margin:0">${[['all', 'Toutes'], ['unread', 'Non lues'], ['activite', 'Activités'], ['paiement', 'Paiements'], ['sanction', 'Discipline'], ['note', 'Notes'], ['assiduite', 'Assiduité']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-act="nTab" data-t="${k}">${l}</button>`).join('')}</div><span class="sp"></span><button class="btn btn-o btn-s" data-act="nAllRead">Tout marquer comme lu</button></div>
  <div class="card">${list.map(notifItem).join('') || empty('Aucune notification.', IC.bell)}</div>`;
};
ACT.nTab = d => { S.nTab = d.t; render(); };
ACT.nAllRead = async () => { await markRead(S.D.notifications.map(n => n.id)); render(); };

// ---------- ESPACE ÉTUDIANT ----------
PAGES.mesformations = D => {
  const me = S.user.email, a = D.apprenants[0] || {}, st = D.settings;
  const fs = D.formations.filter(f => (a.formations || []).includes(f.id));
  return fs.map(f => {
    const p = presStats(D, me, f.id), m = moyenne(D, me, f.id), ss = D.seances.filter(s => s.formationId === f.id).sort((x, y) => y.date.localeCompare(x.date));
    const map = {}; D.presences.forEach(x => map[x.seanceId] = x.statut);
    return `<div class="card" style="margin-bottom:16px"><div class="card-h"><div style="flex:1"><h3>${esc(f.titre)}</h3><div class="small muted">${esc(f.formateurNom || '')} · ${esc(f.jour || '')} ${esc(f.heure || '')}${f.lieu ? ' · ' + esc(f.lieu) : ''}</div></div>${tauxBadge(p.taux, st.seuilAssiduite)}</div>
    <div class="card-b"><div class="grid g4" style="margin-bottom:14px">${kpi(IC.check, 'v2', p.P, 'Présences')}${kpi(IC.clock, 'v3', p.R, 'Retards')}${kpi(IC.x, 'v4', p.A, 'Absences')}${kpi(IC.star, 'v5', m == null ? '—' : m.toFixed(2), 'Moyenne /20')}</div>${prog(p.taux)}<div class="small muted" style="margin-top:6px">${p.P + p.R} séance(s) suivie(s) sur ${p.total} · ${p.J} absence(s) justifiée(s)</div></div>
    <div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Thème</th><th>Ma présence</th></tr></thead><tbody>${ss.map(s => `<tr><td>${fShort(s.date)}</td><td>${esc(s.theme || '—')}</td><td>${s.statut === 'Tenue' ? (map[s.id] ? `<span class="b ${PRES_BADGE[map[s.id]]}">${PRES_LABEL[map[s.id]]}</span>` : '<span class="b b-g">Non inscrit</span>') : `<span class="b ${s.statut === 'Annulée' ? 'b-r' : 'b-p'}">${esc(s.statut)}</span>`}</td></tr>`).join('') || '<tr><td colspan="3" class="center muted">Aucune séance</td></tr>'}</tbody></table></div></div>`;
  }).join('') || `<div class="card">${empty('Vous n\'êtes inscrit à aucune formation. Rapprochez-vous du Responsable Formation.', IC.book)}</div>`;
};
PAGES.mesnotes = D => {
  const me = S.user.email, a = D.apprenants[0] || {};
  const fs = D.formations.filter(f => (a.formations || []).includes(f.id)), mg = moyenne(D, me);
  return `<div class="grid g3" style="margin-bottom:16px">${kpi(IC.star, 'v5', mg == null ? '—' : mg.toFixed(2) + '/20', 'Moyenne générale')}${kpi(IC.check, 'v2', D.notes.filter(n => n.note !== '').length, 'Exercices notés')}${kpi(IC.clock, 'v3', D.exercices.filter(e => (a.formations || []).includes(e.formationId) && !D.notes.some(n => n.exerciceId === e.id && n.note !== '')).length, 'En attente de note')}</div>` +
    fs.map(f => { const ex = D.exercices.filter(e => e.formationId === f.id).sort((x, y) => (y.date || '').localeCompare(x.date || '')), m = moyenne(D, me, f.id); return `<div class="card" style="margin-bottom:16px"><div class="card-h"><h3>${esc(f.titre)}</h3>${moyBadge(m)}</div><div class="tbl-wrap"><table><thead><tr><th>Exercice</th><th>Date</th><th>Coef.</th><th>Note</th><th>Appréciation</th></tr></thead><tbody>${ex.map(e => { const n = D.notes.find(n => n.exerciceId === e.id); const v = n && n.note !== '' ? +n.note : null; return `<tr><td><div class="strong">${esc(e.titre)}</div><div class="small muted">${esc(e.type || '')}</div></td><td>${fShort(e.date)}</td><td>${esc(e.coef || 1)}</td><td>${v == null ? '<span class="b b-g">Non noté</span>' : `<span class="b ${v / e.bareme >= .6 ? 'b-v' : v / e.bareme >= .5 ? 'b-o' : 'b-r'}">${v}/${e.bareme}</span>`}</td><td class="small">${esc(n?.commentaire || '')}</td></tr>`; }).join('') || '<tr><td colspan="5" class="center muted">Aucun exercice pour le moment</td></tr>'}</tbody></table></div></div>`; }).join('');
};
PAGES.mespaiements = D => {
  const me = S.user.email, st = D.settings, f = finance(D, me);
  return `<div class="grid g3" style="margin-bottom:16px">${kpi(IC.money, 'v2', money(f.total), 'Total versé')}${kpi(IC.chart, 'v1', money(f.du), 'Dû à ce jour')}${kpi(IC.alert, f.reste ? 'v3' : 'v2', money(f.reste), 'Reste à payer')}</div>
  <div class="grid g2"><div class="card"><div class="card-h"><h3>T-shirt CVPB</h3>${f.teeOk ? '<span class="b b-v">Soldé</span>' : '<span class="b b-r">Non soldé</span>'}</div><div class="card-b"><div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>${money(Math.min(f.tee, st.teeshirt))} payé</span><span class="muted">sur ${money(st.teeshirt)}</span></div>${prog(f.tee / st.teeshirt * 100)}<p class="small muted" style="margin-top:8px">Obligatoire, payable en une seule fois (compris dans l'inscription).</p></div></div>
  <div class="card"><div class="card-h"><h3>Cotisations mensuelles</h3><span class="small muted">${money(st.mensualite)} / mois</span></div>${f.parMois.map(m => `<div class="list-i"><div style="flex:1"><div class="t" style="text-transform:capitalize">${m.code} · ${fMois(m.mois)}</div>${prog(m.paye / m.du * 100)}</div><div class="right"><b>${money(m.paye)}</b><div>${m.reste ? `<span class="b ${m.paye ? 'b-o' : 'b-r'}">Reste ${money(m.reste)}</span>` : '<span class="b b-v">Soldé</span>'}</div></div></div>`).join('') || empty('Aucune cotisation due pour le moment.')}${f.avance ? `<div class="list-i"><div style="flex:1" class="small">Payé d'avance pour les mois suivants</div><b>${money(f.avance)}</b></div>` : ''}</div></div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>Historique de mes paiements</h3></div><div class="tbl-wrap"><table><thead><tr><th>Date</th><th>Objet</th><th>Mode</th><th class="right">Montant</th></tr></thead><tbody>${f.encs.map(p => `<tr><td>${fShort(p.date)}</td><td>${esc(p.nature || '')}${p.num ? `<div class="small muted">${esc(p.num)}</div>` : ''}</td><td>${esc(p.mode || '')}</td><td class="right strong">${money(p.montant)}</td></tr>`).join('') || '<tr><td colspan="4" class="center muted">Aucun paiement enregistré</td></tr>'}</tbody></table></div></div>
  <p class="small muted" style="margin-top:12px">Les cotisations sont affectées au plus ancien mois non soldé. En cas d'erreur, signalez-la à la Responsable des encaissements.</p>`;
};
PAGES.discipline = D => {
  const l = D.sanctions.slice().sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return `${l.some(s => s.statut === 'Active') ? '' : `<div class="alert ok">${IC.ok}<div>Aucune sanction en cours. Continuez ainsi !</div></div>`}<div class="card">${l.map(s => `<div class="list-i"><div class="ic" style="background:var(--rouge-l);color:var(--rouge)">${IC.gavel}</div><div style="flex:1"><div class="t">${esc(s.type)} <span class="b ${s.statut === 'Active' ? 'b-r' : 'b-g'}">${esc(s.statut)}</span></div><div class="small">${esc(s.motif)}</div>${s.mesure ? `<div class="small muted">Mesure : ${esc(s.mesure)}</div>` : ''}<div class="small muted">${fDate(s.date)}</div></div></div>`).join('') || empty('Aucune sanction dans votre dossier.', IC.ok)}</div>`;
};

// ---------- UTILISATEURS & ACCÈS ----------
PAGES.utilisateurs = D => {
  const staff = D.users.map(u => ({ u, r: acaRole(u) })).filter(x => x.r).sort((a, b) => ROLE_PRIO.indexOf(a.r) - ROLE_PRIO.indexOf(b.r));
  const nbSg = staff.filter(x => x.r === 'sg').length;
  return `<div class="alert info">${IC.info}<div>Les comptes du personnel sont ceux de <b>CVPB Manager</b> : on les crée et on les modifie dans CVPB Manager (Organigramme / Administration). L'Académie lit automatiquement le rôle de chacun.${nbSg !== 3 ? `<br><b>À vérifier :</b> ${nbSg} secrétaire(s) général(aux) actif(s) sur 3 prévus.` : ''}</div></div>
  <div class="card tbl-wrap"><table><thead><tr><th>Nom</th><th>E-mail</th><th>Rôle(s) CVPB Manager</th><th>Accès Académie</th></tr></thead><tbody>${staff.map(({ u, r }) => `<tr><td class="strong">${esc(u.nom)}</td><td class="small">${esc(u.id)}</td><td class="small">${esc([u.role, ...(u.rolesSup || [])].join(', '))}</td><td><span class="b b-p">${esc(ROLES[r])}</span></td></tr>`).join('') || `<tr><td colspan="4">${empty('Aucun compte avec un rôle Académie.')}</td></tr>`}</tbody></table></div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>Correspondance des rôles</h3></div><div class="tbl-wrap"><table><thead><tr><th>Rôle CVPB Manager</th><th>Espace Académie</th></tr></thead><tbody>${Object.entries(ROLE_MAP).map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(ROLES[v])}</td></tr>`).join('')}<tr><td>Étudiant « Actif » de la liste etudiants, rattaché à un e-mail UVCI</td><td>${ROLES.etudiant}</td></tr><tr><td class="muted">tuteur, délégué, membre d'équipe…</td><td class="muted">Pas d'accès</td></tr></tbody></table></div></div>
  <div class="card" style="margin-top:16px"><div class="card-h"><h3>Matrice des droits</h3></div><div class="tbl-wrap"><table><thead><tr><th>Rôle</th><th>Peut modifier</th><th>Consultation</th></tr></thead><tbody>${Object.keys(ROLES).map(r => `<tr><td class="strong">${ROLES[r]}</td><td class="small">${(EDIT[r] || []).map(p => PAGE_META[p][0]).join(', ') || '—'}</td><td class="small">${(NAV[r] || []).filter(p => !p.startsWith('|') && !(EDIT[r] || []).includes(p)).map(p => PAGE_META[p][0]).join(', ')}</td></tr>`).join('')}</tbody></table></div></div>`;
};

// ---------- PARAMÈTRES ----------
PAGES.parametres = D => {
  const st = D.settings;
  return `${roBanner()}<div class="card" style="max-width:720px"><div class="card-h"><h3>Paramètres de l'année académique</h3></div><div class="card-b">
  <div class="alert info">${IC.info}<div>Le T-shirt, la cotisation et les mois doivent être <b>identiques à ceux de CVPB Manager</b>, sinon le reste à payer affiché aux étudiants sera différent.</div></div>
  <div class="grid g2">${[['Année académique', st.annee], ['Prix du T-shirt', money(st.teeshirt)], ['Cotisation mensuelle', money(st.mensualite)], ['Premier mois (M1)', fMois(st.moisDebut)], ['Dernier mois', fMois(st.moisFin)], ['Seuil d\'assiduité', st.seuilAssiduite + ' %'], ['Moyenne minimale', st.noteMin + '/20']].map(([l, v]) => `<div><div class="small muted">${l}</div><div class="strong" style="text-transform:capitalize">${esc(v)}</div></div>`).join('')}</div>
  ${can('parametres') ? `<button class="btn btn-p" style="margin-top:18px" data-act="paramForm">${IC.edit} Modifier</button>` : ''}</div></div>
  ${DEMO && can('parametres') ? `<div class="card" style="max-width:720px;margin-top:16px"><div class="card-h"><h3>Mode démonstration</h3></div><div class="card-b"><p class="small muted" style="margin-bottom:10px">Les données de démonstration sont stockées sur cet appareil uniquement.</p><button class="btn btn-d" data-act="demoReset">Réinitialiser les données de démo</button></div></div>` : ''}`;
};
ACT.paramForm = () => formModal({
  title: 'Paramètres', values: S.D.settings,
  fields: [{ k: 'annee', label: 'Année académique', req: true, ph: '2026-2027' }, { k: 'teeshirt', label: 'Prix du T-shirt (FCFA)', type: 'number', req: true, half: true }, { k: 'mensualite', label: 'Cotisation mensuelle (FCFA)', type: 'number', req: true, half: true }, { k: 'moisDebut', label: 'Premier mois de cotisation (M1)', type: 'month', req: true, half: true }, { k: 'moisFin', label: 'Dernier mois de cotisation', type: 'month', req: true, half: true }, { k: 'seuilAssiduite', label: 'Seuil d\'assiduité (%)', type: 'number', min: 0, max: 100, req: true, half: true }, { k: 'noteMin', label: 'Moyenne minimale (/20)', type: 'number', min: 0, max: 20, req: true, half: true }],
  onSubmit: async v => { await DB.set('settings', 'general', v); toast('Paramètres enregistrés', 'ok'); rerender(); }
});
ACT.demoReset = () => confirmBox('Remettre les données de démonstration à zéro ?', async () => { DemoDB.reset(); localStorage.removeItem(readKey()); rerender(); });

// ------------------------------------------------------------
// 9. CONNEXION
// ------------------------------------------------------------
function showLogin(err) {
  $('#loader').classList.add('hidden'); $('#app').classList.add('hidden'); $('#login').classList.remove('hidden');
  $('#loginErr').innerHTML = err ? `<div class="err">${err}</div>` : '';
}
async function enterApp(user, role) {
  S.user = user; S.role = role; S.D = {};
  $('#whoName').textContent = user.nom; $('#whoRole').textContent = ROLES[role]; $('#rolePill').textContent = ROLES[role];
  $('#demoPill').classList.toggle('hidden', !DEMO);
  buildNav();
  $('#login').classList.add('hidden'); $('#loader').classList.add('hidden'); $('#app').classList.remove('hidden');
  await render();
  const n = unreadCount();
  if (n) toast(`Vous avez ${n} notification(s) non lue(s)`);
}
const REFUS_LISTE = `Accès refusé : vous ne figurez pas sur la liste des étudiants actifs de la CVPB. Rapprochez-vous de la Responsable des encaissements ou du Secrétariat général.`;
async function resolveRole(email, displayName) {
  email = lower(email);
  if (CONFIG.superAdmins.map(lower).includes(email)) return { user: { email, nom: displayName || 'Président' }, role: 'president' };
  // 1) Personnel : compte CVPB Manager avec un rôle Académie
  const u = await DB.get('users', email).catch(() => null);
  if (u) {
    const r = acaRole(u);
    if (r) return { user: { email, nom: u.nom || displayName }, role: r };
    if (u.actif === false) throw new Error('Votre compte CVPB Manager est désactivé.');
  }
  // 2) Étudiant : doit être rattaché à l'Académie ET figurer « Actif » dans la liste etudiants de CVPB Manager
  const a = await DB.get('apprenants', email).catch(() => null);
  if (!a) throw new Error(u ? 'Votre rôle dans CVPB Manager ne donne pas accès à la CVPB Académie.' : `Le compte <b>${esc(email)}</b> n'est rattaché à aucun étudiant de la CVPB Académie. ${REFUS_LISTE}`);
  const e = await DB.get('etudiants', a.matricule).catch(() => null);
  if (!e || e.statut !== 'Actif') throw new Error(REFUS_LISTE);
  if (a.statut === 'Abandon') throw new Error('Votre inscription à l\'Académie est clôturée. Contactez le Responsable Formation.');
  return { user: { email, nom: e.nom }, role: 'etudiant' };
}

async function initFirebase() {
  const v = '10.12.2', base = `https://www.gstatic.com/firebasejs/${v}/`;
  const [appM, authM, fsM] = await Promise.all([import(base + 'firebase-app.js'), import(base + 'firebase-auth.js'), import(base + 'firebase-firestore.js')]);
  const app = appM.initializeApp(CONFIG.firebase);
  S.fb = { app, auth: authM.getAuth(app), db: fsM.getFirestore(app), fs: fsM, authM };
  const { auth } = S.fb;
  const provider = new authM.GoogleAuthProvider(); provider.setCustomParameters({ hd: CONFIG.allowedDomain, prompt: 'select_account' });
  $('#btnGoogle').onclick = async () => {
    $('#loginErr').innerHTML = '';
    try { await authM.signInWithPopup(auth, provider); }
    catch (e) { if (['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/cancelled-popup-request'].includes(e.code)) await authM.signInWithRedirect(auth, provider); else if (e.code !== 'auth/popup-closed-by-user') showLogin('Connexion impossible : ' + esc(e.message)); }
  };
  $('#btnOut').onclick = () => authM.signOut(auth);
  authM.getRedirectResult(auth).catch(() => { });
  authM.onAuthStateChanged(auth, async user => {
    if (!user) { S.user = null; return showLogin(); }
    const email = lower(user.email);
    if (!email.endsWith('@' + lower(CONFIG.allowedDomain))) { await authM.signOut(auth); return showLogin(`Seuls les comptes <b>@${CONFIG.allowedDomain}</b> sont autorisés.`); }
    try { const r = await resolveRole(email, user.displayName); await enterApp(r.user, r.role); }
    catch (e) { await authM.signOut(auth); showLogin(e.message); }
  });
}

function initDemo() {
  DemoDB.load();
  const picks = [['president', 'Président'], ['vp', 'Vice-président'], ['sg', 'Secrétaire général'], ['resp_formation', 'Resp. Formation'], ['resp_suivi', 'Resp. Suivi & Accomp.'], ['formateur', 'Formateur'], ['encaissement', 'Resp. Encaissements'], ['caisse', 'Resp. Caisse'], ['etudiant', 'Étudiant'], ['horsliste', 'Étudiant retiré de la liste'], ['inconnu', 'Étudiant inconnu']];
  $('#demoBox').classList.remove('hidden');
  $('#demoGrid').innerHTML = picks.map(([r, l]) => `<button data-r="${r}">${l}</button>`).join('');
  $('#demoGrid').onclick = async e => {
    const b = e.target.closest('button'); if (!b) return;
    const r = b.dataset.r;
    const ROLE_DEMO = { president: 'president', vp: 'vicepresident', sg: 'secretaire', resp_formation: 'formation', resp_suivi: 'accompagnement', formateur: 'pedagogie', encaissement: 'encaissement', caisse: 'caisse' };
    const email = r === 'etudiant' ? DemoDB.data.apprenants[1].id : r === 'horsliste' ? DemoDB.data.apprenants[11].id : r === 'inconnu' ? 'etudiant.inconnu@' + CONFIG.allowedDomain : DemoDB.data.users.find(u => u.role === ROLE_DEMO[r]).id;
    try { const x = await resolveRole(email); localStorage.setItem('cvpba_demo_who', email); await enterApp(x.user, x.role); } catch (err) { localStorage.removeItem('cvpba_demo_who'); showLogin(err.message); }
  };
  $('#btnGoogle').onclick = () => showLogin('Mode démonstration : Firebase n\'est pas encore configuré (voir <b>config.js</b>). Choisissez un profil ci-dessous.');
  $('#btnOut').onclick = () => { localStorage.removeItem('cvpba_demo_who'); S.user = null; location.hash = ''; showLogin(); };
  const who = localStorage.getItem('cvpba_demo_who');
  if (who) resolveRole(who).then(x => enterApp(x.user, x.role)).catch(() => showLogin()); else showLogin();
}

$('#burger').onclick = () => toggleSide();
$('#scrim').onclick = () => toggleSide(false);
$('#btnBell').onclick = () => go(isStudent() || (NAV[S.role] || []).includes('notifications') ? 'notifications' : 'home');
if (DEMO) initDemo(); else initFirebase().catch(e => showLogin('Erreur de chargement de Firebase : ' + esc(e.message)));

// ------------------------------------------------------------
// 10. DONNÉES DE DÉMONSTRATION (fictives)
// ------------------------------------------------------------
function seedDemo() {
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const d = new Date(); const sats = []; const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 1) % 7)); // dernier samedi
  for (let i = -4; i <= 2; i++) { const y = new Date(x); y.setDate(x.getDate() + i * 7); sats.push(ymd(y)); }
  const past = sats.filter(s => s <= TODAY()).slice(-4), fut = sats.filter(s => s > TODAY());
  const dom = '@' + CONFIG.allowedDomain;
  // Comptes « CVPB Manager » (rôles au format de CVPB Manager)
  const users = [
    ['demo.president', 'Président CVPB (démo)', 'president'], ['demo.vp', 'Awa KONÉ', 'vicepresident'], ['demo.sg1', 'Serge N\'GUESSAN', 'secretaire'], ['demo.sg2', 'Mariam DIABATÉ', 'secretaire'], ['demo.sg3', 'Hervé KOUAMÉ', 'secretaire'],
    ['demo.formation', 'Fatou BAMBA', 'formation'], ['demo.suivi', 'Didier YAO', 'accompagnement'], ['demo.formateur', 'Koffi ASSI', 'pedagogie'], ['demo.formateur2', 'Aïcha TRAORÉ', 'pedagogie'],
    ['demo.encaissement', 'Christelle AKA', 'encaissement'], ['demo.caisse', 'Bintou OUATTARA', 'caisse'], ['demo.tuteur', 'Yves GNAMIEN', 'tuteur']
  ].map(([e, nom, role]) => ({ id: e + dom, nom, role, actif: true }));
  const formations = [
    { id: 'f1', titre: 'IA & outils numériques', domaine: DOMAINES[0], formateurEmail: 'demo.formateur' + dom, formateurNom: 'Koffi ASSI', jour: 'Samedi', heure: '09h00 – 11h00', lieu: 'Salle CVPB, Port-Bouët', statut: 'En cours' },
    { id: 'f2', titre: 'Bureautique : Word, Excel, PowerPoint', domaine: DOMAINES[1], formateurEmail: 'demo.formateur2' + dom, formateurNom: 'Aïcha TRAORÉ', jour: 'Samedi', heure: '11h30 – 13h30', lieu: 'Salle CVPB, Port-Bouët', statut: 'En cours' },
    { id: 'f3', titre: 'Design graphique avec Canva & Figma', domaine: DOMAINES[3], formateurEmail: 'demo.formateur' + dom, formateurNom: 'Koffi ASSI', jour: 'Samedi', heure: '14h00 – 16h00', lieu: 'Google Meet', statut: 'En cours' }
  ];
  // Liste « etudiants » de CVPB Manager (fictive)
  const noms = ['Kouassi Jean-Marc', 'Diallo Aminata', 'N\'Dri Paul Ézéchiel', 'Coulibaly Salimata', 'Gbagbo Ange', 'Touré Moussa', 'Adjoumani Prisca', 'Soro Ibrahim', 'Konan Grâce', 'Brou Emmanuel', 'Ouédraogo Rasmata', 'Essis Laetitia', 'Yapi Christ', 'Aka Rebecca', 'Bamba Issouf'];
  const specs = ['Développement d\'Application et e-Services (IAN-DAS)', 'Réseaux et Sécurité Informatique (IAN-RSI)', 'Multimédia et Arts Numériques (IAN-MMX)', 'Communication Digitale (HSN-COM)'];
  const etudiants = noms.map((n, i) => ({ id: `CVPB-26-${String(i + 1).padStart(4, '0')}`, matricule: `CVPB-26-${String(i + 1).padStart(4, '0')}`, nom: n, niveau: 'Licence 1', specialite: specs[i % 4], statut: i === 11 ? 'Inactif' : 'Actif', academie: i < 12 }));
  const slug = n => n.normalize('NFD').replace(/[̀-ͯ']/g, '').toLowerCase().split(/\s+/);
  // Rattachement à l'Académie : e-mail UVCI -> matricule CVPB (les 12 premiers ; le 12e a été passé « Inactif »)
  const apprenants = etudiants.slice(0, 12).map((e, i) => { const w = slug(e.nom); return { id: `${w[1].split('-')[0]}.${w[0]}${dom}`, matricule: e.id, formations: i % 3 === 0 ? ['f1', 'f2'] : i % 3 === 1 ? ['f2', 'f3'] : ['f1', 'f3'], statut: i === 10 ? 'Suspendu' : 'Actif', dateInscription: past[0] }; });
  const seances = [], presences = [], exercices = [], notes = [];
  const themes = { f1: ['Prise en main de ChatGPT & Claude', 'Rédiger de bons prompts', 'IA pour la recherche documentaire', 'IA & présentations', 'Projet : assistant d\'étude', 'Bilan & évaluation'], f2: ['Mise en forme Word', 'Tableaux Excel & formules', 'Graphiques Excel', 'PowerPoint efficace', 'Mini-projet bureautique', 'Évaluation'], f3: ['Bases du design', 'Canva : affiches', 'Typographie & couleurs', 'Figma : premiers écrans', 'Projet visuel', 'Présentation des projets'] };
  formations.forEach(f => {
    [...past, ...fut].forEach((dt, k) => {
      const sid = `${f.id}_s${k}`, tenue = dt < TODAY();
      seances.push({ id: sid, formationId: f.id, date: dt, heure: f.heure, theme: themes[f.id][k] || 'Séance', statut: tenue ? 'Tenue' : 'Programmée' });
      if (tenue && k < past.length - (f.id === 'f2' ? 1 : 0)) apprenants.filter(a => a.formations.includes(f.id)).forEach((a, j) => { const r = rnd(), lazy = j % 5 === 3; presences.push({ id: `${sid}_${j}`, seanceId: sid, formationId: f.id, email: a.id, date: dt, statut: lazy ? (r < .45 ? 'P' : r < .55 ? 'R' : 'A') : (r < .78 ? 'P' : r < .88 ? 'R' : r < .95 ? 'A' : 'J') }); });
      else if (tenue) seances[seances.length - 1].statut = 'Programmée';
    });
    [['Exercice pratique n°1', past[1]], ['Devoir maison n°1', past[2] || past[1]]].forEach(([t, dt], k) => {
      const eid = `${f.id}_e${k}`; exercices.push({ id: eid, formationId: f.id, titre: t, type: k ? 'Devoir' : 'Exercice pratique', date: dt, bareme: 20, coef: k ? 2 : 1 });
      apprenants.filter(a => a.formations.includes(f.id)).forEach((a, j) => { if (k === 1 && j % 4 === 2) return; notes.push({ id: `${eid}_${j}`, exerciceId: eid, formationId: f.id, email: a.id, note: Math.round((7 + rnd() * 12) * 4) / 4, commentaire: '', date: dt }); });
    });
  });
  // Registre « encaissements » de CVPB Manager (fictif, même format)
  const encaissements = []; let n = 0;
  const enc = (e, nature, montant, date, mode, mois) => { n++; encaissements.push({ id: 'ENC-' + String(n).padStart(4, '0'), num: 'ENC-' + String(n).padStart(4, '0'), matricule: e.id, nom: e.nom, niveau: e.niveau, nature, montant, date, mode, mois, encaissePar: 'Christelle', statut: 'Valide' }); };
  etudiants.forEach((e, i) => {
    if (i === 7) return; // aucun paiement
    if (i % 5 === 4) enc(e, 'Vente de T-shirt (hors inscription)', 5000, past[0], 'Wave', 'M1');
    else enc(e, 'Inscription (T-shirt inclus)', 7000, past[0], i % 2 ? 'Wave' : 'Espèces', 'M1');
    if (i % 3 !== 2) enc(e, 'Cotisation mensuelle', 3000, past[2] || past[1], i % 2 ? 'Orange Money' : 'Espèces', 'M1');
  });
  const s1 = apprenants[4], s2 = apprenants[10];
  const sanctions = [{ id: 'sa1', email: s1.id, type: 'Avertissement', motif: 'Trois absences non justifiées consécutives.', date: past[past.length - 1], statut: 'Active', par: 'demo.suivi' + dom }, { id: 'sa2', email: s2.id, type: 'Suspension temporaire', motif: 'Comportement irrespectueux envers un formateur.', mesure: 'Suspension de 2 séances, entretien avec le Responsable Suivi.', date: past[1], statut: 'Active', par: 'demo.suivi' + dom }];
  const activites = [{ id: 'a1', titre: 'Réunion générale des apprenants', type: 'Réunion', date: fut[0], heure: '16h30', lieu: 'Salle CVPB', description: 'Bilan du mois et présentation du planning.' }, { id: 'a2', titre: 'Atelier CV & LinkedIn', type: 'Atelier', date: fut[1] || fut[0], heure: '10h00', lieu: 'Google Meet' }, { id: 'a3', titre: 'Journée d\'intégration des nouveaux bacheliers', type: 'Événement', date: past[0], heure: '09h00', lieu: 'Port-Bouët' }];
  const now = new Date(), iso = h => new Date(now - h * 3600e3).toISOString(), me = apprenants[1].id;
  const notifications = [
    { id: 'n2', dest: me, cat: 'note', titre: 'Nouvelle note disponible', message: 'Design graphique avec Canva & Figma — « Exercice pratique n°1 ».', date: iso(30), lu: false },
    { id: 'n3', dest: 'all', cat: 'activite', titre: 'Nouvelle activité : Atelier CV & LinkedIn', message: 'Inscrivez-vous auprès de votre délégué.', date: iso(20) },
    { id: 'n4', dest: me, cat: 'assiduite', titre: 'Retard enregistré', message: 'Bureautique — séance de samedi dernier.', date: iso(10), lu: false },
    { id: 'n5', dest: s1.id, cat: 'sanction', titre: 'Sanction : Avertissement', message: 'Motif : Trois absences non justifiées consécutives.', date: iso(5), lu: false }
  ];
  return { settings: [{ id: 'general', ...DEFAULT_SETTINGS }], users, formations, etudiants, apprenants, seances, presences, exercices, notes, encaissements, sanctions, activites, notifications, annonces: [{ id: 'an1', titre: 'Nouvelle activité : Atelier CV & LinkedIn', message: 'Inscrivez-vous auprès de votre délégué.', cible: 'Tous les apprenants', nb: 11, date: iso(20), par: 'demo.sg1' + dom }] };
}
