"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SocketProvider, useGame } from '../context/SocketContext';

/* ─── Language Translation Dictionary ─── */
const t = {
  ar: {
    gameTitle: 'لعبة القضية',
    subTitle: 'DECEPTION: MURDER IN HONG KONG',
    logoLive: '🔴 بث مباشر',
    logoPlayers: '👥 4–10 لاعبين',
    logoModes: '🧩 3 أنماط',
    logoMultiplayer: '🎮 لعب جماعي',
    createRoom: 'إنشاء غرفة',
    createRoomDesc: 'أنشئ غرفة جديدة وشارك الكود مع اللاعبين',
    joinRoom: '# انضم للغرفة',
    joinRoomDesc: 'انضم للعبة باستخدام كود الغرفة',
    playerNameLabel: 'اسم اللاعب / Player Name',
    playerNamePlaceholder: 'أدخل اسمك...',
    roomCodeLabel: 'كود الغرفة / Room Code',
    roomCodePlaceholder: 'XXXX',
    createRoomBtn: '👑 إنشاء الغرفة',
    joinRoomBtn: '👥 دخول الغرفة',
    howToPlay: '❓ كيف تلعب؟',
    roomCodeHeader: 'رمز الغرفة',
    leaveBtn: 'خروج',
    gameSettings: '⚙️ إعدادات اللعبة',
    roleDistribution: 'طريقة توزيع الأدوار',
    roleAutomated: '🎲 توزيع عشوائي سري',
    rolePractical: '⚖️ النمط الواقعي',
    roleManual: '✋ توزيع يدوي',
    addBots: '🤖 إضافة بوتات للتجربة',
    startGameBtn: '🚀 ابدأ اللعبة',
    needMinPlayers: '* تحتاج 4 لاعبين على الأقل',
    playersTitle: 'اللاعبون',
    chooseRole: 'اختر دوراً...',
    roleForensic: '🔬 عالم الجنايات',
    roleMurderer: '😈 القاتل / المخادع',
    roleAccomplice: '🤝 المساعد / الخوي',
    roleInvestigator: '🕵️ محقق',
    waiting: 'انتظار...',
    creatorTag: 'المنشئ',
    meTag: 'أنت',
    botTag: '🤖 بوت',
    cardRevealTitle: '👁️ مرحلة كشف الكروت',
    allPlayersSeeCards: 'الجميع يفتح عينيه — اقرأ الكروت!',
    studyCardsDesc: 'أدلة الجريمة ظاهرة للجميع سراً. ادرسوها قبل بدء الليل.',
    startNightBtn: '🌙 ابدأ الليل',
    nightPhaseTitle: 'مرحلة الليل — التخطيط للجريمة',
    nightPhaseDescMurderer: 'القاتل يختار الآن دليل الجريمة الأحمر ووسيلة القتل الزرقاء.',
    nightPhaseDescOthers: 'القاتل يقوم بارتكاب الجريمة. يرجى الانتظار بهدوء...',
    secretRoleLabel: 'دورك السري',
    roleDescForensic: 'تساعد المحققين بالإشارة على لوحات الأدلة بدون كلام.',
    roleDescMurderer: 'اختر دليل أحمر ووسيلة زرقاء. تجنب كشف نفسك!',
    roleDescAccomplice: 'تساعد القاتل في تضليل المحققين وحمايته.',
    roleDescInvestigator: 'ابحث عن الأدلة الصحيحة واتهم القاتل الحقيقي.',
    murdererSelectEvidence: 'اختر أدلة الجريمة:',
    clueLabel: 'دليل',
    meansLabel: 'وسيلة',
    confirmSelection: '✅ تأكيد الاختيار',
    chosenCrimeEvidence: 'أدلة الجريمة المحددة:',
    clueRed: 'الدليل الأحمر',
    meansBlue: 'الوسيلة الزرقاء',
    startForensicPhaseBtn: '🔬 ابدأ وضع القرائن',
    waitForensicScientist: '⏳ انتظر عالم الجنايات ليبدأ وضع القرائن...',
    preparingCrimeScene: 'جاري تجهيز مسرح الجريمة...',
    forensicPhaseTitle: '🔬 مرحلة عالم الجنايات',
    forensicPhaseDescForensic: 'ضع القرائن على اللوحات (خطوة بخطوة)!',
    forensicPhaseDescOthers: 'عالم الجنايات يختار القرائن...',
    startInvestigationBtn: '✅ ابدأ التحقيق',
    crimeKey: '🎯 مفتاح الجريمة',
    forensicClueDescForensic: 'أدلة الجريمة ظاهرة لك فقط. اقرأ الكرت الظاهر أمامك، اختر القرينة الأنسب، ثم أكد اختيارك.',
    forensicClueDescOthers: 'عالم الجنايات يضع القرائن الآن. راقب الكروت لتستنتج أدلة الجريمة.',
    currentTileTitle: 'اللوحة الحالية',
    changeBtn: 'تغيير',
    confirmBtn: '✅ تأكيد',
    placementComplete: 'اكتمل وضع القرائن!',
    placementCompleteDescForensic: 'الآن يمكنك بدء التحقيق من الزر بالأعلى.',
    placementCompleteDescOthers: 'في انتظار عالم الجنايات لبدء التحقيق...',
    invWinTitle: 'انتصار المحققين! 🎉',
    murdererWinTitle: 'انتصار القاتل! 💀',
    caseSolvedDesc: 'تم حل القضية والقبض على القاتل!',
    murdererEscapedDesc: 'نجح القاتل في التضليل والهروب!',
    realCrimeEvidence: 'أدلة الجريمة الحقيقية',
    playerRoles: 'أدوار اللاعبين:',
    backToLobby: '🔄 العودة للانتظار',
    spectatorBanner: '👁️ وضع المشاهدة الشاملة — ترى جميع الأدوار والأدلة السرية!',
    investigationPhase: '🕵️ مرحلة التحقيق',
    accusedTag: '🚫 اتهم',
    availableTag: '🛡️ متاح',
    clueCardsTitle: 'كروت اللاعبين',
    sceneTilesTitle: 'لوحات الأدلة',
    forensicCluesDesc: 'استنتج من اختيارات عالم الجنايات.',
    forensicCluesDescForensic: '🔬 انقر لوضع قرينة.',
    officialAccusationBtn: '🚨 تقديم اتهام رسمي',
    accusationWarning: '* اتهام واحد فقط! الفشل = مستبعد فوراً.',
    chatTitle: '💬 نقاش المحققين',
    spectatorsCantChat: '👻 المشاهدون لا يمكنهم الكتابة.',
    forensicCantChat: '🔬 عالم الجنايات لا يمكنه الكتابة.',
    chatPlaceholder: 'اكتب رسالة...',
    sendBtn: 'إرسال',
    eventLogTitle: '📋 سجل الأحداث',
    suspectChooseLabel: '1. اختر المشتبه به:',
    clueRedSuspect: '2. الدليل الأحمر المشتبه:',
    meansBlueSuspect: '3. الوسيلة الزرقاء المشتبه:',
    cancelBtn: 'إلغاء',
    submitFinalAccusation: '⚖️ تقديم الاتهام النهائي',
    spectatorTag: 'مشاهد',
    replacementTokens: 'محاولات الاستبدال المتبقية',
    noReplacementsLeft: 'لا يوجد محاولات استبدال متبقية',
    victimTag: 'الضحية',
    mugshotLabel: 'ملف مشتبه به',
    deadBodyDesc: 'مشهد الجريمة',
  },
  en: {
    gameTitle: 'The Case Game',
    subTitle: 'DECEPTION: MURDER IN HONG KONG',
    logoLive: '🔴 Live Session',
    logoPlayers: '👥 4–10 Players',
    logoModes: '🧩 3 Modes',
    logoMultiplayer: '🎮 Multiplayer',
    createRoom: 'Create Room',
    createRoomDesc: 'Create a new room and share the code with players',
    joinRoom: '# Join Room',
    joinRoomDesc: 'Join a game using a room code',
    playerNameLabel: 'Player Name',
    playerNamePlaceholder: 'Enter your name...',
    roomCodeLabel: 'Room Code',
    roomCodePlaceholder: 'XXXX',
    createRoomBtn: '👑 Create Room',
    joinRoomBtn: '👥 Enter Room',
    howToPlay: '❓ How to Play?',
    roomCodeHeader: 'Room Code',
    leaveBtn: 'Leave',
    gameSettings: '⚙️ Game Settings',
    roleDistribution: 'Role Distribution Mode',
    roleAutomated: '🎲 Secret Random',
    rolePractical: '⚖️ Practical Mode',
    roleManual: '✋ Manual Distribution',
    addBots: '🤖 Add Bots for Testing',
    startGameBtn: '🚀 Start Game',
    needMinPlayers: '* Need at least 4 players',
    playersTitle: 'Players',
    chooseRole: 'Choose a role...',
    roleForensic: '🔬 Forensic Scientist',
    roleMurderer: '😈 Murderer',
    roleAccomplice: '🤝 Accomplice',
    roleInvestigator: '🕵️ Investigator',
    waiting: 'Waiting...',
    creatorTag: 'Host',
    meTag: 'You',
    botTag: '🤖 Bot',
    cardRevealTitle: '👁️ Card Reveal Phase',
    allPlayersSeeCards: 'Everyone opens their eyes — Read the cards!',
    studyCardsDesc: 'Crime evidence is secret to the murderer. Study them before night.',
    startNightBtn: '🌙 Start Night',
    nightPhaseTitle: 'Night Phase — Crime Planning',
    nightPhaseDescMurderer: 'The Murderer chooses the red Clue Card and the blue Means Card.',
    nightPhaseDescOthers: 'The Murderer is committing the crime. Please wait quietly...',
    secretRoleLabel: 'Your Secret Role',
    roleDescForensic: 'Help investigators by marking scene tiles silently.',
    roleDescMurderer: 'Choose 1 red Clue and 1 blue Means. Avoid getting caught!',
    roleDescAccomplice: 'Help the murderer mislead investigators and protect them.',
    roleDescInvestigator: 'Find the correct evidence and accuse the real murderer.',
    murdererSelectEvidence: 'Select Crime Evidence:',
    clueLabel: 'Clue',
    meansLabel: 'Means',
    confirmSelection: '✅ Confirm Selection',
    chosenCrimeEvidence: 'Selected Crime Evidence:',
    clueRed: 'Clue Card (Red)',
    meansBlue: 'Means Card (Blue)',
    startForensicPhaseBtn: '🔬 Place Clues',
    waitForensicScientist: '⏳ Waiting for Forensic Scientist to place clues...',
    preparingCrimeScene: 'Preparing the crime scene...',
    forensicPhaseTitle: '🔬 Forensic Scientist Phase',
    forensicPhaseDescForensic: 'Place clues on tiles step-by-step!',
    forensicPhaseDescOthers: 'Forensic Scientist is choosing clues...',
    startInvestigationBtn: '✅ Start Investigation',
    crimeKey: '🎯 Crime Key',
    forensicClueDescForensic: 'Crime evidence is only visible to you. Read the card, select the best clue, then confirm.',
    forensicClueDescOthers: 'Forensic Scientist is placing clues now. Watch the cards to deduce.',
    currentTileTitle: 'Current Tile',
    changeBtn: 'Replace',
    confirmBtn: '✅ Confirm',
    placementComplete: 'Clue placement complete!',
    placementCompleteDescForensic: 'Now you can start the investigation from the button above.',
    placementCompleteDescOthers: 'Waiting for the Forensic Scientist to start the investigation...',
    invWinTitle: 'Investigators Win! 🎉',
    murdererWinTitle: 'Murderer Wins! 💀',
    caseSolvedDesc: 'The case has been solved and the murderer arrested!',
    murdererEscapedDesc: 'The murderer successfully misled everyone and escaped!',
    realCrimeEvidence: 'Real Crime Evidence',
    playerRoles: 'Player Roles:',
    backToLobby: '🔄 Back to Lobby',
    spectatorBanner: '👁️ Spectator Mode — You see all roles and secret evidence!',
    investigationPhase: '🕵️ Investigation Phase',
    accusedTag: '🚫 Accused',
    availableTag: '🛡️ Available',
    clueCardsTitle: 'Players Cards',
    sceneTilesTitle: 'Scene Tiles',
    forensicCluesDesc: 'Deduce from the Forensic Scientist\'s choices.',
    forensicCluesDescForensic: '🔬 Click to place a clue.',
    officialAccusationBtn: '🚨 Submit Official Accusation',
    accusationWarning: '* Only one accusation! Failure = Spectator.',
    chatTitle: '💬 Investigators Chat',
    spectatorsCantChat: '👻 Spectators cannot chat.',
    forensicCantChat: '🔬 Forensic Scientist cannot chat.',
    chatPlaceholder: 'Type a message...',
    sendBtn: 'Send',
    eventLogTitle: '📋 Event Log',
    suspectChooseLabel: '1. Choose Suspect:',
    clueRedSuspect: '2. Suspected Red Clue:',
    meansBlueSuspect: '3. Suspected Blue Means:',
    cancelBtn: 'Cancel',
    submitFinalAccusation: '⚖️ Submit Final Accusation',
    spectatorTag: 'Spectator',
    replacementTokens: 'Remaining Replacements',
    noReplacementsLeft: 'No replacements left',
    victimTag: 'Victim',
    mugshotLabel: 'Suspect File',
    deadBodyDesc: 'Crime Scene',
  }
};

const HOWTO_STEPS = {
  ar: [
    'المنشئ ينشئ غرفة ويشارك الكود مع اللاعبين.',
    'اللاعبون (4+) ينضمون وتُوزَّع الأدوار سراً.',
    'الليل: القاتل يختار دليل الجريمة ووسيلة القتل.',
    'الكشف: عالم الجنايات يضع قرائن على لوحات المشهد.',
    'التحقيق: نقاش مستمر. حاول تحديد القاتل والقرائن.',
    'الاتهام: كل محقق لديه اتهام واحد فقط. خطأ = مستبعد ومشاهِد!',
  ],
  en: [
    'The host creates a room and shares the code.',
    'Players (4+) join and roles are assigned secretly.',
    'Night: Murderer selects the clue and means cards.',
    'Reveal: Forensic Scientist marks clues on scene tiles.',
    'Investigation: Discuss and try to identify the murderer.',
    'Accuse: Each investigator has only 1 accusation. Fail = Spectator!',
  ]
};

const THEMES = [
  { id: 'default', label: 'افتراضي', colors: ['#6c63ff', '#c5283d'] },
  { id: 'pink',    label: 'وردي',    colors: ['#f06292', '#7b1fa2'] },
  { id: 'ocean',   label: 'محيط',    colors: ['#00b4d8', '#0077b6'] },
  { id: 'sunset',  label: 'غروب',    colors: ['#ff6b35', '#ff8f00'] },
  { id: 'forest',  label: 'غابة',    colors: ['#43a047', '#1b5e20'] },
  { id: 'neon',    label: 'نيون',    colors: ['#39ff14', '#d500f9'] },
  { id: 'night',   label: 'ليل',     colors: ['#7986cb', '#1a237e'] },
  { id: 'sky',     label: 'سماوي',   colors: ['#29b6f6', '#0277bd'] },
  { id: 'crimson', label: 'قرمزي',  colors: ['#ef5350', '#b71c1c'] },
  { id: 'gold',    label: 'ذهبي',    colors: ['#ffd700', '#e65100'] },
];

/* ─── Role Label Helper ─── */
const ROLE_LABELS = {
  forensic:     { ar: '🔬 عالم الجنايات', en: 'Forensic Scientist', cls: 'forensic' },
  murderer:     { ar: '😈 القاتل / المخادع',  en: 'Murderer',          cls: 'murderer'  },
  accomplice:   { ar: '🤝 المساعد / الخوي',  en: 'Accomplice',        cls: 'accomplice'},
  investigator: { ar: '🕵️ محقق',           en: 'Investigator',      cls: 'investigator'},
};

const roleLabel = (role, type = 'ar') => ROLE_LABELS[role]?.[type] ?? '—';
const roleCls   = (role) => ROLE_LABELS[role]?.cls ?? '';

/* ═══════════════════════════════════════════════
   Codenames Style Suspect Avatar
   ═══════════════════════════════════════════════ */
function SuspectAvatar({ role, isDead, isForensic, lang }) {
  let color = 'var(--theme-primary)';
  if (role === 'forensic') color = '#e040fb';
  if (role === 'murderer') color = '#ff4757';
  if (role === 'accomplice') color = 'var(--color-gold)';
  if (role === 'investigator') color = '#64b5f6';

  return (
    <div className="polaroid-frame" style={{ borderColor: role ? color : 'rgba(255,255,255,0.08)' }}>
      <div className="photo-screen" style={{ color }}>
        {isForensic ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="suspect-avatar-svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            <path d="M9 13.5h6v1.2H9z" fill="#fff" opacity="0.8" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="suspect-avatar-svg">
            <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 12c-4.42 0-8 2.24-8 5v3h16v-3c0-2.76-3.58-5-8-5z"/>
          </svg>
        )}
      </div>
      <div className="photo-label">{t[lang]?.mugshotLabel ?? 'SUSPECT'}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   SIDEBAR COMPONENT
   ═══════════════════════════════════════════════ */
function Sidebar({ open, onClose, activeTheme, onTheme, isDevMode, onToggleDevMode, showDevMode, lang }) {
  return (
    <>
      <div className={`sidebar-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`sidebar-drawer ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">{lang === 'ar' ? '⚙️ الإعدادات' : '⚙️ Settings'}</span>
          <button className="sidebar-close" onClick={onClose}>✕</button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">{lang === 'ar' ? '🎨 الثيم' : '🎨 Theme'}</div>
          <div className="themes-grid">
            {THEMES.map(t => (
              <div
                key={t.id}
                className={`theme-swatch ${activeTheme === t.id ? 'active' : ''}`}
                onClick={() => onTheme(t.id)}
              >
                <div
                  className="theme-dot"
                  style={{ background: `linear-gradient(135deg, ${t.colors[0]}, ${t.colors[1]})` }}
                />
                <span className="theme-label">{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {showDevMode && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">{lang === 'ar' ? '🛠️ وضع المطور' : '🛠️ Developer Mode'}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
              <span style={{ fontSize: '0.82rem' }}>{lang === 'ar' ? 'وضع المطور (الرؤية الشاملة)' : 'Dev Mode (Omniscient)'}</span>
              <label className="switch" style={{ position: 'relative', display: 'inline-block', width: 40, height: 20 }}>
                <input 
                  type="checkbox" 
                  checked={!!isDevMode} 
                  onChange={(e) => onToggleDevMode(e.target.checked)} 
                  style={{ opacity: 0, width: 0, height: 0 }} 
                />
                <span className="slider round" style={{ 
                  position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                  backgroundColor: isDevMode ? 'var(--theme-primary)' : '#ccc', transition: '.4s', borderRadius: 20 
                }}>
                  <span style={{
                    position: 'absolute', height: 16, width: 16, left: isDevMode ? 20 : 2, bottom: 2,
                    backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                  }}/>
                </span>
              </label>
            </div>
            <p style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.4 }}>
              {lang === 'ar' 
                ? 'يسمح لك برؤية أدوار جميع اللاعبين والأدلة في أي وقت للاختبار.'
                : 'Allows you to see all player roles and secret evidence for testing.'}
            </p>
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-label">{lang === 'ar' ? 'ℹ️ حول اللعبة' : 'ℹ️ About'}</div>
          <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            {lang === 'ar' ? (
              <>
                لعبة القضية مبنية على <strong>Deception: Murder in Hong Kong</strong>.
                يلعب اللاعبون دور المحقق وعالم الجنايات والقاتل في مباراة مشوقة من الخداع والاستنتاج.
              </>
            ) : (
              <>
                Mystery Case is based on <strong>Deception: Murder in Hong Kong</strong>.
                Players assume the roles of investigators, forensic scientist, and murderer in a thrilling match of deduction.
              </>
            )}
          </p>
        </div>
      </aside>
    </>
  );
}

/* ═══════════════════════════════════════════════
   MAIN GAME APP
   ═══════════════════════════════════════════════ */
function GameApp() {
  const {
    socket,
    gameState,
    chatMessages,
    error,
    createRoom,
    joinRoom,
    addMockPlayers,
    leaveRoom,
    setRoleMode,
    assignManualRole,
    toggleDevMode,
    startGame,
    startNight,
    submitEvidence,
    placeMarker,
    replaceTile,
    submitAccusation,
    resetToLobby,
    sendMessage,
    startForensicPhase,
  } = useGame();

  /* ── UI State ── */
  const [mounted,       setMounted]       = useState(false);
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [theme,         setTheme]         = useState('default');
  const [howtoOpen,     setHowtoOpen]     = useState(false);
  const [entryView,     setEntryView]     = useState('home');   // 'home' | 'create' | 'join'
  const [name,          setName]          = useState('');
  const [roomInput,     setRoomInput]     = useState('');
  const [lang,          setLang]          = useState('ar');

  /* ── Game State ── */
  const [selectedClue,  setSelectedClue]  = useState(null);
  const [selectedMeans, setSelectedMeans] = useState(null);
  const [chatInput,     setChatInput]     = useState('');
  const [showAccuse,    setShowAccuse]    = useState(false);
  const [accuseTarget,  setAccuseTarget]  = useState(null);
  const [accuseClue,    setAccuseClue]    = useState(null);
  const [accuseMeans,   setAccuseMeans]   = useState(null);
  const [localForensicOption, setLocalForensicOption] = useState(null);

  const chatEndRef = useRef(null);

  /* ── Effects ── */
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme === 'default' ? '' : theme);
  }, [theme]);

  // Handle HTML document direction
  useEffect(() => {
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }, [lang]);

  // Load name and language
  useEffect(() => {
    const savedName = typeof window !== 'undefined' ? sessionStorage.getItem('deception_player_name') : '';
    if (savedName) setName(savedName);
    const savedLang = typeof window !== 'undefined' ? sessionStorage.getItem('deception_game_lang') : '';
    if (savedLang) setLang(savedLang);
  }, []);

  const handleTheme = useCallback((t) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t === 'default' ? '' : t);
  }, []);

  const handleLang = (l) => {
    setLang(l);
    sessionStorage.setItem('deception_game_lang', l);
  };

  const txt = (key) => t[lang]?.[key] ?? key;

  if (!mounted) return null;

  /* ── Derived ── */
  const myId   = socket?.id;
  const me     = gameState?.players?.[myId];
  const isHost = me?.isHost;

  /* ─── Background ─── */
  const Bg = () => (
    <div className="background-wrapper">
      <div className="stars-layer" />
      <div className="glow-blob blob-red" />
      <div className="glow-blob blob-blue" />
    </div>
  );

  /* ─── Floating lang selector ─── */
  const LangToggle = () => (
    <div className="header-actions" style={{ position: 'fixed', top: 16, left: 16, display: 'flex', gap: 10, zIndex: 200 }}>
      <div className="lang-selector">
        <button className={`lang-btn ${lang === 'ar' ? 'active' : ''}`} onClick={() => handleLang('ar')}>العربية</button>
        <button className={`lang-btn ${lang === 'en' ? 'active' : ''}`} onClick={() => handleLang('en')}>English</button>
      </div>
    </div>
  );

  /* ════════════════════════════════════════════════
     1. ENTRY — HOME SCREEN
     ════════════════════════════════════════════════ */
  if (!gameState) {
    return (
      <div className="app-container">
        <Bg />
        <LangToggle />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTheme={theme} onTheme={handleTheme} isDevMode={me?.isDevMode} onToggleDevMode={toggleDevMode} showDevMode={true} lang={lang} />
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>

        <div className="lobby-logo">⚖️</div>
        <h1 className="lobby-main-title">{txt('gameTitle')}</h1>
        <p className="lobby-sub-title">{txt('subTitle')}</p>

        <div className="pill-bar">
          <span className="pill pill-live">{txt('logoLive')}</span>
          <span className="pill pill-players">{txt('logoPlayers')}</span>
          <span className="pill pill-modes">{txt('logoModes')}</span>
          <span className="pill pill-multiplayer">{txt('logoMultiplayer')}</span>
        </div>

        {error && <div className="error-alert" style={{ marginBottom: 16, maxWidth: 480, width: '100%' }}>{error}</div>}

        {/* ─ Home View ─ */}
        {entryView === 'home' && (
          <div className="action-cards-list">
            <div className="action-card" onClick={() => setEntryView('create')}>
              <span className="action-card-arrow">←</span>
              <div className="action-card-left">
                <div className="action-card-icon create">👑</div>
                <div className="action-card-text">
                  <div className="action-card-title">{txt('createRoom')}</div>
                  <div className="action-card-desc">{txt('createRoomDesc')}</div>
                </div>
              </div>
            </div>

            <div className="action-card" onClick={() => setEntryView('join')}>
              <span className="action-card-arrow">←</span>
              <div className="action-card-left">
                <div className="action-card-icon join">👥</div>
                <div className="action-card-text">
                  <div className="action-card-title">{txt('joinRoom')}</div>
                  <div className="action-card-desc">{txt('joinRoomDesc')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─ Create Room View ─ */}
        {entryView === 'create' && (
          <div className="glass-card glass-card-heavy action-cards-list" style={{ padding: 24, gap: 16, display: 'flex', flexDirection: 'column' }}>
            <div className="inner-entry-header">
              <button className="inner-back-btn" onClick={() => setEntryView('home')}>←</button>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{txt('createRoom')}</span>
            </div>
            <div className="form-group">
              <label className="form-label">{txt('playerNameLabel')}</label>
              <input
                type="text"
                className="input-field"
                placeholder={txt('playerNamePlaceholder')}
                value={name}
                onChange={e => { setName(e.target.value); sessionStorage.setItem('deception_player_name', e.target.value); }}
                autoFocus
              />
            </div>
            <button
              className="btn-primary"
              disabled={!name.trim()}
              onClick={() => createRoom(name.trim())}
            >
              {txt('createRoomBtn')}
            </button>
          </div>
        )}

        {/* ─ Join Room View ─ */}
        {entryView === 'join' && (
          <div className="glass-card glass-card-heavy action-cards-list" style={{ padding: 24, gap: 16, display: 'flex', flexDirection: 'column' }}>
            <div className="inner-entry-header">
              <button className="inner-back-btn" onClick={() => setEntryView('home')}>←</button>
              <span style={{ fontWeight: 700, fontSize: '1rem' }}>{txt('joinRoom')}</span>
            </div>
            <div className="form-group">
              <label className="form-label">{txt('playerNameLabel')}</label>
              <input
                type="text"
                className="input-field"
                placeholder={txt('playerNamePlaceholder')}
                value={name}
                onChange={e => { setName(e.target.value); sessionStorage.setItem('deception_player_name', e.target.value); }}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{txt('roomCodeLabel')}</label>
              <input
                type="text"
                className="input-field"
                placeholder={txt('roomCodePlaceholder')}
                value={roomInput}
                onChange={e => setRoomInput(e.target.value.toUpperCase())}
                maxLength={4}
                style={{ letterSpacing: '0.3em', fontSize: '1.4rem' }}
                autoFocus
              />
            </div>
            <button
              className="btn-primary"
              disabled={!name.trim() || roomInput.length < 4}
              onClick={() => joinRoom(roomInput, name.trim())}
            >
              {txt('joinRoomBtn')}
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="howto-section" style={{ marginTop: 24, maxWidth: 480, width: '100%' }}>
          <div className="howto-header" onClick={() => setHowtoOpen(v => !v)}>
            <span>{txt('howToPlay')}</span>
            <span className={`howto-toggle ${howtoOpen ? 'open' : ''}`}>⌄</span>
          </div>
          <div className={`howto-body ${howtoOpen ? 'open' : ''}`}>
            {(HOWTO_STEPS[lang] ?? HOWTO_STEPS['ar']).map((s, i) => (
              <div key={i} className="howto-step">
                <div className="howto-num">{i + 1}</div>
                <div className="howto-text">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     2. ROOM LOBBY
     ════════════════════════════════════════════════ */
  if (gameState.status === 'lobby') {
    const playerCount = Object.keys(gameState.players).length;
    return (
      <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
        <Bg />
        <LangToggle />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTheme={theme} onTheme={handleTheme} isDevMode={me?.isDevMode} onToggleDevMode={toggleDevMode} showDevMode={true} lang={lang} />
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>

        <div className="lobby-room-container">
          <div className="glass-card lobby-header">
            <div>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.8rem' }}>{txt('roomCodeHeader')}</span>
              <h2 className="title-font" style={{ color: 'var(--color-gold)', fontSize: '2.4rem', letterSpacing: '0.2em', marginTop: 2 }}>
                {gameState.roomId}
              </h2>
            </div>
            <button className="btn-danger" onClick={leaveRoom}>{txt('leaveBtn')}</button>
          </div>

          <div className="lobby-grid">
            {/* Settings Panel */}
            <div className="glass-card lobby-panel" style={{ height: 'fit-content' }}>
              <h3 className="panel-title">⚙️ {txt('gameSettings')}</h3>

              <div className="form-group">
                <label className="form-label">{txt('roleDistribution')}</label>
                {isHost ? (
                  <select
                    className="input-field"
                    value={gameState.roleMode}
                    onChange={e => setRoleMode(e.target.value)}
                  >
                    <option value="automated">🎲 {txt('roleAutomated')}</option>
                    <option value="practical">⚖️ {txt('rolePractical')}</option>
                    <option value="manual">✋ {txt('roleManual')}</option>
                  </select>
                ) : (
                  <div className="input-field" style={{ color: 'var(--color-gold)', fontWeight: 700 }}>
                    {gameState.roleMode === 'automated' && `🎲 ${txt('roleAutomated')}`}
                    {gameState.roleMode === 'practical' && `⚖️ ${txt('rolePractical')}`}
                    {gameState.roleMode === 'manual'    && `✋ ${txt('roleManual')}`}
                  </div>
                )}
              </div>

              {isHost && playerCount < 4 && (
                <button
                  className="btn-secondary"
                  style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)' }}
                  onClick={addMockPlayers}
                >
                  {txt('addBots')}
                </button>
              )}

              {error && <div className="error-alert">{error}</div>}

              {isHost && (
                <button
                  className="btn-primary"
                  style={{ padding: '16px', marginTop: 8 }}
                  disabled={playerCount < 4}
                  onClick={startGame}
                >
                  {txt('startGameBtn')}
                </button>
              )}

              {playerCount < 4 && (
                <p style={{ fontSize: '0.75rem', color: '#ff7675', textAlign: 'center' }}>
                  {txt('needMinPlayers')}
                </p>
              )}
            </div>

            {/* Players Panel */}
            <div className="glass-card lobby-panel">
              <h3 className="panel-title">
                👥 {txt('playersTitle')} ({playerCount})
              </h3>
              <div className="player-list">
                {Object.values(gameState.players).map(player => (
                  <div key={player.id} className="player-item">
                    <div className="player-meta">
                      <span className="player-name">{player.name}</span>
                      {player.isHost && <span className="tag tag-host">{txt('creatorTag')}</span>}
                      {player.id === myId && <span className="tag tag-me">{txt('meTag')}</span>}
                      {player.isBot && <span className="tag tag-bot">{txt('botTag')}</span>}
                    </div>

                    {gameState.roleMode === 'manual' && (
                      <div>
                        {isHost ? (
                          <select
                            className="input-field"
                            style={{ padding: '7px 12px', fontSize: '0.8rem', width: 170 }}
                            value={player.role || ''}
                            onChange={e => assignManualRole(player.id, e.target.value)}
                          >
                            <option value="">{txt('chooseRole')}</option>
                            <option value="forensic">{txt('roleForensic')}</option>
                            <option value="murderer">{txt('roleMurderer')}</option>
                            <option value="accomplice">{txt('roleAccomplice')}</option>
                            <option value="investigator">{txt('roleInvestigator')}</option>
                          </select>
                        ) : (
                          <span className={`role-badge ${roleCls(player.role)}`}>
                            {player.role ? roleLabel(player.role, lang) : txt('waiting')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     3. REVEAL CARDS PHASE
     ════════════════════════════════════════════════ */
  if (gameState.status === 'reveal_cards') {
    return (
      <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: 24 }}>
        <Bg />
        <LangToggle />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTheme={theme} onTheme={handleTheme} isDevMode={me?.isDevMode} onToggleDevMode={toggleDevMode} showDevMode={true} lang={lang} />
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>

        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card lobby-header">
            <div>
              <span className="phase-label reveal">👁️ {txt('cardRevealTitle')}</span>
              <h2 className="title-font" style={{ color: 'var(--color-gold)', fontSize: '1.8rem', marginTop: 6 }}>
                {txt('allPlayersSeeCards')}
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', marginTop: 4 }}>
                {txt('studyCardsDesc')}
              </p>
            </div>
            {isHost && (
              <button className="btn-primary" style={{ width: 'auto', padding: '14px 28px' }} onClick={startNight}>
                {txt('startNightBtn')}
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="glass-card players-grid-panel">
            <h3 className="title-font" style={{ fontSize: '1rem', color: 'var(--color-gold)', borderBottom: '1px solid var(--border-glass)', paddingBottom: 10, marginBottom: 18 }}>
              {txt('clueCardsTitle')}
            </h3>
            <div className="players-grid">
              {Object.values(gameState.players).map(player => (
                <div key={player.id} className={`player-board-card ${player.role === 'forensic' ? 'forensic-active' : ''}`}>
                  <div className="player-card-header">
                    <div className="player-card-info">
                      <span style={{ fontWeight: 700 }}>{player.name}</span>
                      {player.id === myId && <span className="tag tag-me">{txt('meTag')}</span>}
                    </div>
                    <span className={`role-badge ${roleCls(me?.role)}`}>
                      {player.id === myId ? roleLabel(me?.role, lang) : '???'}
                    </span>
                  </div>
                  {player.role !== 'forensic' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                        {player.clueCards.map(card => (
                          <div key={card.id} className="game-card clue" style={{ padding: '5px 3px', minHeight: 48 }}>
                            <div className="card-emoji-wrapper" style={{ width: 26, height: 26, fontSize: '1rem', marginBottom: 2 }}>{card.emoji}</div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                              {lang === 'ar' ? card.nameAr : card.name}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                        {player.meansCards.map(card => (
                          <div key={card.id} className="game-card means" style={{ padding: '5px 3px', minHeight: 48 }}>
                            <div className="card-emoji-wrapper" style={{ width: 26, height: 26, fontSize: '1rem', marginBottom: 2 }}>{card.emoji}</div>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                              {lang === 'ar' ? card.nameAr : card.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-gold)', textAlign: 'center', padding: 14, border: '1px dashed var(--border-gold)', borderRadius: 10 }}>
                      {txt('roleForensic')} — {lang === 'ar' ? 'لا يملك كروت أدلة' : 'No clue cards'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     4. NIGHT PHASE
     ════════════════════════════════════════════════ */
  if (gameState.status === 'night_reveal' || gameState.status === 'night_selection') {
    const isMurderer  = me?.role === 'murderer';
    const isAccomplice = me?.role === 'accomplice';
    const isForensicN  = me?.role === 'forensic';
    const canSeeCrime  = isMurderer || isAccomplice || isForensicN;
    const evidenceSelected = gameState.crimeEvidence?.clueCardId && gameState.crimeEvidence?.meansCardId;

    return (
      <div className="night-mask">
        <Bg />
        <div className="fog-bg" />
        <div style={{ zIndex: 10, maxWidth: 820, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="heartbeat-logo">👁️</div>
          <h2 className="title-font" style={{ fontSize: '2rem', marginBottom: 10 }}>
            {canSeeCrime ? txt('nightPhaseTitle') : txt('nightPhaseDescOthers')}
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', marginBottom: 30, maxWidth: 520, lineHeight: 1.6, textAlign: 'center' }}>
            {canSeeCrime ? txt('nightPhaseDescMurderer') : txt('nightPhaseDescOthers')}
          </p>

          {/* Role Card */}
          <div className="glass-card" style={{ padding: 22, maxWidth: 360, width: '100%', marginBottom: 36, borderTop: '2px solid var(--color-crimson)' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}>
              {txt('secretRoleLabel')}
            </span>
            <h3 className="title-font" style={{ fontSize: '1.6rem', color: me?.role === 'murderer' ? 'var(--color-crimson)' : 'var(--color-gold)' }}>
              {roleLabel(me?.role, lang)}
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
              {me?.role === 'forensic'     && txt('roleDescForensic')}
              {me?.role === 'murderer'     && txt('roleDescMurderer')}
              {me?.role === 'accomplice'   && txt('roleDescAccomplice')}
              {me?.role === 'investigator' && txt('roleDescInvestigator')}
            </p>
          </div>

          {/* Murderer Selection */}
          {isMurderer && !evidenceSelected && (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h4 className="title-font" style={{ color: 'var(--color-gold)', textAlign: 'center' }}>
                {txt('murdererSelectEvidence')}
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {me.clueCards.map(card => (
                  <div
                    key={card.id}
                    className={`game-card clue ${selectedClue === card.id ? 'selected' : ''}`}
                    onClick={() => setSelectedClue(card.id)}
                  >
                    <div className="card-emoji-wrapper">{card.emoji}</div>
                    <span className="card-type">{txt('clueLabel')}</span>
                    <span className="card-title">{lang === 'ar' ? card.nameAr : card.name}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
                {me.meansCards.map(card => (
                  <div
                    key={card.id}
                    className={`game-card means ${selectedMeans === card.id ? 'selected' : ''}`}
                    onClick={() => setSelectedMeans(card.id)}
                  >
                    <div className="card-emoji-wrapper">{card.emoji}</div>
                    <span className="card-type">{txt('meansLabel')}</span>
                    <span className="card-title">{lang === 'ar' ? card.nameAr : card.name}</span>
                  </div>
                ))}
              </div>
              <button
                className="btn-primary"
                style={{ alignSelf: 'center', width: 'auto', padding: '14px 50px', marginTop: 10 }}
                disabled={!selectedClue || !selectedMeans}
                onClick={() => submitEvidence(selectedClue, selectedMeans)}
              >
                {txt('confirmSelection')}
              </button>
            </div>
          )}

          {/* Forensic/Accomplice see crime cards */}
          {canSeeCrime && evidenceSelected && (() => {
            const murdererPlayer = Object.values(gameState.players).find(p => p.role === 'murderer');
            const clue  = murdererPlayer?.clueCards.find(c => c.id === gameState.crimeEvidence.clueCardId);
            const means = murdererPlayer?.meansCards.find(m => m.id === gameState.crimeEvidence.meansCardId);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <h4 className="title-font" style={{ color: 'var(--color-crimson)' }}>{txt('chosenCrimeEvidence')}</h4>
                <div style={{ display: 'flex', gap: 20 }}>
                  {clue && (
                    <div className="game-card clue" style={{ width: 150, cursor: 'default' }}>
                      <div className="card-emoji-wrapper">{clue.emoji}</div>
                      <span className="card-type">{txt('clueRed')}</span>
                      <span className="card-title" style={{ fontSize: '1rem' }}>{lang === 'ar' ? clue.nameAr : clue.name}</span>
                    </div>
                  )}
                  {means && (
                    <div className="game-card means" style={{ width: 150, cursor: 'default' }}>
                      <div className="card-emoji-wrapper">{means.emoji}</div>
                      <span className="card-type">{txt('meansBlue')}</span>
                      <span className="card-title" style={{ fontSize: '1rem' }}>{lang === 'ar' ? means.nameAr : means.name}</span>
                    </div>
                  )}
                </div>
                {isForensicN && (
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '14px 36px', marginTop: 10 }}
                    onClick={() => startForensicPhase && startForensicPhase()}
                  >
                    {txt('startForensicPhaseBtn')}
                  </button>
                )}
                {!isForensicN && (
                  <p style={{ fontSize: '0.9rem', color: 'var(--color-gold)', animation: 'pulse 2s infinite' }}>
                    {txt('waitForensicScientist')}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Investigator wait screen */}
          {!canSeeCrime && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 14 }}>{txt('preparingCrimeScene')}</div>
              <div style={{ width: 220, height: 4, backgroundColor: 'rgba(255,255,255,.06)', borderRadius: 4, overflow: 'hidden', margin: '0 auto' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--color-crimson)', animation: 'pulse 1.5s infinite' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     5. FORENSIC CLUE PLACEMENT PHASE
     ═══════════════════════════════════════════════ */
  if (gameState.status === 'forensic_selection') {
    const isForensicPhase = me?.role === 'forensic';
    const murdererPlayer = Object.values(gameState.players).find(p => p.role === 'murderer');
    const clue  = murdererPlayer?.clueCards.find(c => c.id === gameState.crimeEvidence?.clueCardId);
    const means = murdererPlayer?.meansCards.find(m => m.id === gameState.crimeEvidence?.meansCardId);

    const confirmedTiles = gameState.tiles.filter(t => t.selectedOptionIndex !== undefined && t.selectedOptionIndex !== null);
    const unconfirmedTiles = gameState.tiles.filter(t => t.selectedOptionIndex === undefined || t.selectedOptionIndex === null);
    const activeTile = unconfirmedTiles[0];

    return (
      <div className="app-container" style={{ alignItems: 'flex-start', paddingTop: 24, position: 'relative' }}>
        <Bg />
        <LangToggle />
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTheme={theme} onTheme={handleTheme} isDevMode={me?.isDevMode} onToggleDevMode={toggleDevMode} showDevMode={true} lang={lang} />
        <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>

        {/* Confirmed Tiles Container */}
        {confirmedTiles.length > 0 && (
          <div className="confirmed-tiles-container">
            {confirmedTiles.map((t, idx) => {
              const optionName = lang === 'ar' ? (t.optionsAr?.[t.selectedOptionIndex] ?? t.options[t.selectedOptionIndex]) : t.options[t.selectedOptionIndex];
              return (
                <div key={t.id + idx} className="confirmed-tile-mini">
                  <div className="confirmed-tile-mini-header">{lang === 'ar' ? t.titleAr : t.title}</div>
                  <div className="confirmed-tile-mini-value">✅ {optionName}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card lobby-header">
            <div>
              <span className="phase-label forensic">{txt('forensicPhaseTitle')}</span>
              <h2 className="title-font" style={{ color: '#e040fb', fontSize: '1.7rem', marginTop: 6 }}>
                {isForensicPhase ? txt('forensicPhaseDescForensic') : txt('forensicPhaseDescOthers')}
              </h2>
            </div>
            {isForensicPhase && !activeTile && (
              <button
                className="btn-primary"
                style={{ width: 'auto', padding: '14px 28px', background: 'linear-gradient(135deg, #9c27b0, #6a1b9a)' }}
                onClick={() => resetToLobby && resetToLobby()} // fallback or server transition trigger
              >
                {txt('startInvestigationBtn')}
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
            {/* Left: Crime evidence summary */}
            <div className="glass-card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16, height: 'fit-content' }}>
              <h3 className="panel-title" style={{ borderColor: 'rgba(156,39,176,.4)', color: '#e040fb' }}>{txt('crimeKey')}</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {isForensicPhase ? txt('forensicClueDescForensic') : txt('forensicClueDescOthers')}
              </p>
              {isForensicPhase && clue && means && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div className="game-card clue" style={{ flex: 1, cursor: 'default' }}>
                    <div className="card-emoji-wrapper">{clue.emoji}</div>
                    <span className="card-type">{txt('clueLabel')}</span>
                    <span className="card-title" style={{ fontSize: '0.85rem' }}>{lang === 'ar' ? clue.nameAr : clue.name}</span>
                  </div>
                  <div className="game-card means" style={{ flex: 1, cursor: 'default' }}>
                    <div className="card-emoji-wrapper">{means.emoji}</div>
                    <span className="card-type">{txt('meansLabel')}</span>
                    <span className="card-title" style={{ fontSize: '0.85rem' }}>{lang === 'ar' ? means.nameAr : means.name}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Active Scene Tile */}
            <div className="glass-card" style={{ padding: 20, minHeight: 400 }}>
              <h3 className="panel-title" style={{ borderColor: 'rgba(156,39,176,.4)', color: '#e040fb' }}>
                {txt('currentTileTitle')} — {isForensicPhase ? txt('confirmBtn') : txt('waiting')}
              </h3>
              <div className="tiles-column" style={{ maxHeight: 'none', alignItems: 'center', paddingTop: 20 }}>
                {activeTile ? (() => {
                  const isLocation = activeTile.id === 't_loc';
                  const isCause    = activeTile.id === 't_cause';
                  let headerClass = '';
                  if (isLocation) headerClass = 'location';
                  if (isCause)    headerClass = 'cause';
                  
                  return (
                    <div key={activeTile.id} className="scene-tile flip-in" style={{ width: '100%', maxWidth: 450, transformOrigin: 'center' }}>
                      <div className={`scene-tile-header ${headerClass}`}>
                        <span>{lang === 'ar' ? activeTile.titleAr : activeTile.title}</span>
                        {isForensicPhase && !isLocation && !isCause && (
                          <button
                            style={{ fontSize: '9px', background: 'rgba(255,255,255,.08)', border: 'none', padding: '3px 8px', borderRadius: 4, color: 'var(--color-gold)', cursor: 'pointer' }}
                            onClick={() => {
                              setLocalForensicOption(null);
                              replaceTile(activeTile.id);
                            }}
                          >
                            {txt('changeBtn')}
                          </button>
                        )}
                      </div>
                      <div className="scene-tile-body">
                        {activeTile.options.map((option, idx) => {
                          const isLocallySelected = localForensicOption === idx;
                          return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column' }}>
                              <div
                                className={`scene-tile-option ${isLocallySelected ? 'marked' : ''}`}
                                onClick={() => isForensicPhase && setLocalForensicOption(idx)}
                                style={{ cursor: isForensicPhase ? 'pointer' : 'default' }}
                              >
                                <span style={{ fontWeight: 600 }}>{lang === 'ar' ? (activeTile.optionsAr?.[idx] ?? option) : option}</span>
                                {lang === 'ar' && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{option}</span>}
                              </div>
                              {isForensicPhase && isLocallySelected && (
                                <div className="confirm-btn-wrapper">
                                  <button
                                    className="confirm-btn-mini"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      placeMarker(activeTile.id, idx);
                                      setLocalForensicOption(null);
                                    }}
                                  >
                                    {txt('confirmBtn')}
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })() : (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '40px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: 10 }}>✅</div>
                    <h3 style={{ color: 'var(--color-gold)', marginBottom: 8 }}>{txt('placementComplete')}</h3>
                    <p>{isForensicPhase ? txt('placementCompleteDescForensic') : txt('placementCompleteDescOthers')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     6. GAME OVER
     ════════════════════════════════════════════════ */
  if (gameState.status === 'game_over') {
    const isInvWin = gameState.winner === 'investigators';
    const murdererPlayer = Object.values(gameState.players).find(p => p.role === 'murderer');
    const clue  = murdererPlayer?.clueCards.find(c => c.id === gameState.crimeEvidence?.clueCardId);
    const means = murdererPlayer?.meansCards.find(m => m.id === gameState.crimeEvidence?.meansCardId);

    return (
      <div className="app-container">
        <Bg />
        <LangToggle />
        <div className="glass-card glass-card-heavy game-over-card corkboard-card">
          <div className="pin red-pin" />
          <h2 className={`game-over-title title-font ${isInvWin ? 'win' : 'lose'}`} style={{ color: isInvWin ? '#2ecc71' : '#ff4757', WebkitTextFillColor: 'initial' }}>
            {isInvWin ? txt('invWinTitle') : txt('murdererWinTitle')}
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', marginBottom: 28 }}>
            {isInvWin ? txt('caseSolvedDesc') : txt('murdererEscapedDesc')}
          </p>

          <div style={{ background: 'rgba(0,0,0,.4)', border: '1px solid var(--border-glass)', padding: 22, borderRadius: 14, marginBottom: 24, position: 'relative' }}>
            <div className="tape" />
            <h3 className="title-font" style={{ color: 'var(--color-gold)', fontSize: '1.05rem', marginBottom: 14 }}>
              {txt('realCrimeEvidence')}
            </h3>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              {clue && (
                <div className="game-card clue selected" style={{ width: 140, cursor: 'default' }}>
                  <div className="card-emoji-wrapper">{clue.emoji}</div>
                  <span className="card-type">{txt('clueRed')}</span>
                  <span className="card-title" style={{ fontSize: '0.9rem' }}>{lang === 'ar' ? clue.nameAr : clue.name}</span>
                </div>
              )}
              {means && (
                <div className="game-card means selected" style={{ width: 140, cursor: 'default' }}>
                  <div className="card-emoji-wrapper">{means.emoji}</div>
                  <span className="card-type">{txt('meansBlue')}</span>
                  <span className="card-title" style={{ fontSize: '0.9rem' }}>{lang === 'ar' ? means.nameAr : means.name}</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: 10 }}>{txt('playerRoles')}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {Object.values(gameState.players).map(p => (
                <div key={p.id} className="player-item" style={{ padding: '10px 16px', background: 'rgba(0,0,0,0.2)' }}>
                  <span style={{ fontWeight: 700 }}>{p.name}</span>
                  <span className={`role-badge ${roleCls(p.role)}`}>{roleLabel(p.role, lang)}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: 20 }}>
            {isHost && (
              <button className="btn-primary" style={{ width: 'auto', padding: '13px 30px' }} onClick={resetToLobby}>
                {txt('backToLobby')}
              </button>
            )}
            <button className="btn-secondary" style={{ padding: '13px 30px' }} onClick={leaveRoom}>
              {txt('leaveBtn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════
     7. MAIN INVESTIGATION BOARD (CORKBOARD THEME)
     ════════════════════════════════════════════════ */
  const isSpectator = !me?.isAlive;
  const isForensic  = me?.role === 'forensic';
  const hasAccused  = me?.hasAccused;

  const murdererBoardPlayer = Object.values(gameState.players).find(p => p.role === 'murderer');
  const crimeClue  = murdererBoardPlayer?.clueCards.find(c => c.id === gameState.crimeEvidence?.clueCardId);
  const crimeMeans = murdererBoardPlayer?.meansCards.find(m => m.id === gameState.crimeEvidence?.meansCardId);
  const canSeeSecret = isSpectator || isForensic || me?.role === 'murderer' || me?.role === 'accomplice';

  const locationTile = gameState.tiles.find(t => t.id === 't_loc');
  const causeTile    = gameState.tiles.find(t => t.id === 't_cause');
  const envTiles     = gameState.tiles.filter(t => t.id !== 't_loc' && t.id !== 't_cause');

  // Custom tile rendering
  const renderTileCard = (tile, pinClass = '') => {
    if (!tile) return null;
    const isLocation = tile.id === 't_loc';
    const isCause    = tile.id === 't_cause';
    let headerClass = '';
    if (isLocation) headerClass = 'location';
    if (isCause)    headerClass = 'cause';

    return (
      <div key={tile.id} className="scene-tile" style={{ background: 'rgba(5, 8, 16, 0.5)' }}>
        <div className={`scene-tile-header ${headerClass}`}>
          <span>{lang === 'ar' ? tile.titleAr : tile.title}</span>
          {isForensic && !isLocation && !isCause && gameState.tileReplacementsLeft > 0 && (
            <button
              style={{ fontSize: '9px', background: 'rgba(255,255,255,.08)', border: 'none', padding: '3px 8px', borderRadius: 4, color: 'var(--color-gold)', cursor: 'pointer' }}
              onClick={() => replaceTile(tile.id)}
            >
              {txt('changeBtn')}
            </button>
          )}
        </div>
        <div className="scene-tile-body">
          {tile.options.map((option, idx) => {
            const isMarked = tile.selectedOptionIndex === idx;
            return (
              <div
                key={idx}
                className={`scene-tile-option ${isMarked ? 'marked' : ''}`}
                onClick={() => isForensic && placeMarker(tile.id, idx)}
                style={{ cursor: isForensic ? 'pointer' : 'default' }}
              >
                <span style={{ fontWeight: 600 }}>{lang === 'ar' ? (tile.optionsAr?.[idx] ?? option) : option}</span>
                {lang === 'ar' && <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{option}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="board-container">
      <Bg />
      <LangToggle />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} activeTheme={theme} onTheme={handleTheme} isDevMode={me?.isDevMode} onToggleDevMode={toggleDevMode} showDevMode={true} lang={lang} />
      <button className="hamburger-btn" onClick={() => setSidebarOpen(true)}>☰</button>

      {isSpectator && (
        <div className="omniscient-banner">
          {txt('spectatorBanner')}
        </div>
      )}

      {/* Header */}
      <header className="glass-card board-header" style={{ margin: '16px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div>
            <h1 className="title-font" style={{ fontSize: '1.4rem', color: 'var(--color-gold)' }}>{txt('gameTitle')}</h1>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginTop: 1 }}>CASE #{gameState.roomId}</span>
          </div>
          <span className="phase-label investigate">{txt('investigationPhase')}</span>
          <span className={`role-badge ${roleCls(me?.role)}`}>{roleLabel(me?.role, lang)}</span>
        </div>

        {canSeeSecret && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,56,56,.08)', border: '1px solid rgba(255,56,56,.2)', padding: '7px 14px', borderRadius: 8, fontSize: '0.78rem' }}>
            <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>{txt('crimeKey')}:</span>
            <span style={{ color: '#eee', fontWeight: 600 }}>
              {lang === 'ar' 
                ? `${crimeClue?.nameAr ?? '?'} + ${crimeMeans?.nameAr ?? '?'}`
                : `${crimeClue?.name ?? '?'} + ${crimeMeans?.name ?? '?'}`
              }
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-danger" style={{ padding: '8px 16px', fontSize: '0.82rem' }} onClick={leaveRoom}>
            {txt('leaveBtn')}
          </button>
        </div>
      </header>

      {/* Unified Board Layout */}
      <div className="board-layout" style={{ gridTemplateColumns: '1fr' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, width: '100%' }}>
          
          <div className="corkboard-section">
            {/* SVG Connecting Thread */}
            <svg className="evidence-web-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <line x1="83" y1="20" x2="50" y2="20" />
              <line x1="50" y1="20" x2="16" y2="20" />
              <line x1="50" y1="35" x2="35" y2="85" />
              <line x1="50" y1="35" x2="65" y2="85" />
            </svg>

            {/* Top Three Themed Columns */}
            <div className="evidence-board-columns">
              
              {/* 1. LEFT COLUMN: Investigators/Suspects */}
              <div>
                <h3 className="cork-column-header red-title">🕵️ {txt('playersTitle')}</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {Object.values(gameState.players)
                    .filter(p => p.role !== 'forensic')
                    .map(player => (
                      <div key={player.id} className={`corkboard-card player-board-card ${!player.isAlive ? 'dead-spectator' : ''}`} style={{ minHeight: 180 }}>
                        <div className="pin blue-pin" />
                        <div className="tape" />
                        
                        {!player.isAlive && (
                          <div className="spectator-stamp">
                            {txt('spectatorTag')}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 12 }}>
                          <SuspectAvatar role={player.role} isDead={!player.isAlive} isForensic={false} lang={lang} />
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                              <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{player.name}</span>
                              <span style={{ fontSize: '0.68rem' }}>
                                {player.hasAccused ? (
                                  <span style={{ color: 'var(--color-crimson)', fontWeight: 700 }}>{txt('accusedTag')}</span>
                                ) : (
                                  <span style={{ color: '#2ecc71', fontWeight: 700 }}>{txt('availableTag')}</span>
                                )}
                              </span>
                            </div>
                            <div style={{ marginTop: 6, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                              {player.id === myId && <span className="tag tag-me">{txt('meTag')}</span>}
                              {player.role && (
                                <span className={`role-badge ${roleCls(player.role)}`}>
                                  {roleLabel(player.role, lang)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Clue/Means lists */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                            {player.clueCards.map(card => {
                              const isRevealed = canSeeSecret && player.role === 'murderer' && card.id === gameState.crimeEvidence?.clueCardId;
                              return (
                                <div key={card.id} className={`game-card clue ${isRevealed ? 'selected' : ''}`} style={{ padding: '4px 2px', minHeight: 46 }}>
                                  <div className="card-emoji-wrapper" style={{ width: 22, height: 22, fontSize: '0.85rem', marginBottom: 1 }}>{card.emoji}</div>
                                  <span style={{ fontWeight: 700, fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                    {lang === 'ar' ? card.nameAr : card.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                            {player.meansCards.map(card => {
                              const isRevealed = canSeeSecret && player.role === 'murderer' && card.id === gameState.crimeEvidence?.meansCardId;
                              return (
                                <div key={card.id} className={`game-card means ${isRevealed ? 'selected' : ''}`} style={{ padding: '4px 2px', minHeight: 46 }}>
                                  <div className="card-emoji-wrapper" style={{ width: 22, height: 22, fontSize: '0.85rem', marginBottom: 1 }}>{card.emoji}</div>
                                  <span style={{ fontWeight: 700, fontSize: '0.62rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                                    {lang === 'ar' ? card.nameAr : card.name}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* 2. CENTER COLUMN: Victim File */}
              <div>
                <h3 className="cork-column-header gold-title">🩸 {txt('victimTag')}</h3>
                <div className="corkboard-card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div className="pin red-pin" />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '14px 0', borderBottom: '1px dashed rgba(255,255,255,0.05)', position: 'relative' }}>
                    <div className="tape" />
                    <div style={{ width: 72, height: 92, border: '2px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', borderRadius: 6, display: 'flex', alignItems: 'center', justifycontent: 'center', marginBottom: 8 }}>
                      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 44, height: 44, opacity: 0.15 }}>
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: 700 }}>{txt('deadBodyDesc')}</span>
                  </div>
                  {renderTileCard(locationTile)}
                  {renderTileCard(causeTile)}
                </div>
              </div>

              {/* 3. RIGHT COLUMN: Forensic Scientist */}
              <div>
                <h3 className="cork-column-header">🔬 {txt('roleForensic')}</h3>
                {(() => {
                  const forensicPlayer = Object.values(gameState.players).find(p => p.role === 'forensic');
                  if (!forensicPlayer) return null;
                  return (
                    <div className="corkboard-card">
                      <div className="pin gold-pin" />
                      <div className="tape tape-tr" />
                      <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
                        <SuspectAvatar role="forensic" isDead={false} isForensic={true} lang={lang} />
                        <div>
                          <span style={{ fontWeight: 700, fontSize: '1rem', display: 'block' }}>{forensicPlayer.name}</span>
                          <span className="role-badge forensic" style={{ marginTop: 4 }}>{txt('roleForensic')}</span>
                          {forensicPlayer.id === myId && <span className="tag tag-me" style={{ marginLeft: 6 }}>{txt('meTag')}</span>}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.02)' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                          {txt('replacementTokens')}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-gold)' }}>
                            {gameState.tileReplacementsLeft ?? 0}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                            / 2
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Bottom Row: Environment Clues */}
            <div>
              <h3 className="cork-column-header" style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                📂 {txt('sceneTilesTitle')}
              </h3>
              <div className="evidence-board-bottom">
                {envTiles.map(tile => (
                  <div key={tile.id} className="corkboard-card" style={{ padding: 12 }}>
                    <div className="pin" />
                    {renderTileCard(tile)}
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Notebook / chat controls column */}
          <div className="notebook-layout" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginTop: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
              {/* Accuse Controls */}
              {!isSpectator && !isForensic && !hasAccused && (
                <div className="glass-card corkboard-card" style={{ padding: 16, border: '1px solid rgba(255,56,56,.25)' }}>
                  <div className="pin red-pin" />
                  <button
                    className="btn-danger"
                    style={{ padding: 12, width: '100%' }}
                    onClick={() => { setShowAccuse(true); setAccuseTarget(null); setAccuseClue(null); setAccuseMeans(null); }}
                  >
                    {txt('officialAccusationBtn')}
                  </button>
                  <p style={{ fontSize: '0.68rem', color: 'var(--color-text-secondary)', textAlign: 'center', marginTop: 6 }}>
                    {txt('accusationWarning')}
                  </p>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
                {/* Chat Panel */}
                <div className="glass-card chat-panel corkboard-card">
                  <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-gold)', borderBottom: '1px solid var(--border-glass)', paddingBottom: 8, marginBottom: 10 }}>
                    {txt('chatTitle')}
                  </h3>
                  <div className="chat-messages" style={{ maxHeight: 180 }}>
                    {chatMessages.map((msg, idx) => (
                      <div key={idx} className="chat-bubble" style={{ background: 'rgba(0,0,0,0.3)' }}>
                        <div className="chat-sender">{msg.senderName}</div>
                        <div style={{ color: '#eee' }}>{msg.message}</div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  {isSpectator || isForensic ? (
                    <div className="chat-muted-banner">
                      {isForensic ? txt('forensicCantChat') : txt('spectatorsCantChat')}
                    </div>
                  ) : (
                    <form
                      onSubmit={e => { e.preventDefault(); if (chatInput.trim()) { sendMessage(chatInput); setChatInput(''); } }}
                      className="chat-input-row"
                    >
                      <input
                        type="text"
                        className="input-field"
                        placeholder={txt('chatPlaceholder')}
                        value={chatInput}
                        onChange={e => setChatInput(e.target.value)}
                        style={{ textAlign: lang === 'ar' ? 'right' : 'left' }}
                      />
                      <button type="submit" className="btn-primary">{txt('sendBtn')}</button>
                    </form>
                  )}
                </div>

                {/* Event Logs */}
                <div className="glass-card log-panel corkboard-card" style={{ height: 160 }}>
                  <h3 style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                    {txt('eventLogTitle')}
                  </h3>
                  {gameState.logs?.map((log, idx) => (
                    <div key={idx} className="log-item">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ─── ACCUSATION MODAL ─── */}
      {showAccuse && (
        <div className="modal-overlay">
          <div className="glass-card glass-card-heavy modal-content corkboard-card">
            <div className="pin red-pin" />
            <div className="modal-header">
              <h3 className="modal-title title-font">{txt('officialAccusationBtn')}</h3>
              <button className="modal-close" onClick={() => setShowAccuse(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label className="form-label">{txt('suspectChooseLabel')}</label>
                <div className="suspects-grid">
                  {Object.values(gameState.players)
                    .filter(p => p.role !== 'forensic' && p.id !== myId)
                    .map(p => (
                      <button
                        key={p.id}
                        className={`suspect-btn ${accuseTarget === p.id ? 'selected' : ''}`}
                        onClick={() => { setAccuseTarget(p.id); setAccuseClue(null); setAccuseMeans(null); }}
                      >
                        {p.name}
                      </button>
                    ))}
                </div>
              </div>

              {accuseTarget && (
                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label className="form-label">{txt('clueRedSuspect')}</label>
                    <div className="modal-cards-grid">
                      {gameState.players[accuseTarget]?.clueCards.map(card => (
                        <div
                          key={card.id}
                          className={`game-card clue ${accuseClue === card.id ? 'selected' : ''}`}
                          style={{ padding: '5px 3px', minHeight: 50 }}
                          onClick={() => setAccuseClue(card.id)}
                        >
                          <div className="card-emoji-wrapper" style={{ width: 28, height: 28, fontSize: '1rem', marginBottom: 2 }}>{card.emoji}</div>
                          <span style={{ fontWeight: 700, fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            {lang === 'ar' ? card.nameAr : card.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="form-label">{txt('meansBlueSuspect')}</label>
                    <div className="modal-cards-grid">
                      {gameState.players[accuseTarget]?.meansCards.map(card => (
                        <div
                          key={card.id}
                          className={`game-card means ${accuseMeans === card.id ? 'selected' : ''}`}
                          style={{ padding: '5px 3px', minHeight: 50 }}
                          onClick={() => setAccuseMeans(card.id)}
                        >
                          <div className="card-emoji-wrapper" style={{ width: 28, height: 28, fontSize: '1rem', marginBottom: 2 }}>{card.emoji}</div>
                          <span style={{ fontWeight: 700, fontSize: '0.68rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                            {lang === 'ar' ? card.nameAr : card.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border-glass)', paddingTop: 16, marginTop: 18 }}>
              <button className="btn-secondary" onClick={() => setShowAccuse(false)}>{txt('cancelBtn')}</button>
              <button
                className="btn-danger"
                style={{ width: 'auto' }}
                disabled={!accuseTarget || !accuseClue || !accuseMeans}
                onClick={() => { submitAccusation(accuseTarget, accuseClue, accuseMeans); setShowAccuse(false); }}
              >
                {txt('submitFinalAccusation')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <SocketProvider>
      <GameApp />
    </SocketProvider>
  );
}
