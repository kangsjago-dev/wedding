var RUNWAY_DEFAULT_LOGO_SVG = window.RUNWAY_DEFAULT_LOGO_SVG;

// STATE APLIKASI UTAMA
var APP_STATE = {
    config: {
        configId: 'CFG-0001',
        appName: 'SatuAlbum',
        appTagline: 'Platform Live Camera & Galeri Foto Event Interaktif',
        woName: 'Runway Wedding & Event Organizer',
        woLogoUrl: '',
        woContact: '0812-3456-7890 | @runway.wo',
        customFooter: 'Official Digital Album Platform • Runway Wedding Organizer',
        globalDriveFolderUrl: 'https://drive.google.com/drive/folders/1GlobalDriveFolderExampleID999',
        globalDriveFolderId: '1GlobalDriveFolderExampleID999',
        voteCategories: [
            { name: 'Terfavorit ❤️', desc: 'Foto paling disukai oleh seluruh tamu undangan' },
            { name: 'Terkeren 🔥', desc: 'Gaya, pose, dan komposisi foto paling keren' },
            { name: 'Terlucu & Heboh 😂', desc: 'Ekspresi paling seru, kocak, dan menghibur' },
            { name: 'Kostum Terbaik 👗', desc: 'Busana dan penampilan paling serasi & menawan' }
        ],
        photoCategories: [
            { name: 'Selfie Tamu', icon: '🤳' },
            { name: 'Momen Pengantin', icon: '💍' },
            { name: 'Best Grup', icon: '👯' },
            { name: 'Candid Acara', icon: '📸' },
            { name: 'Keluarga & VIP', icon: '👨‍👩‍👧‍👦' }
        ],
        uploadLimits: {
            maxLiveUsers: 0,
            maxUploadsPerUser: 10,
            idleTimeoutMinutes: 60
        },
        frameConfig: {
            style: 'royal_wedding_floral',
            textMode: 'default',
            primaryColor: '#f5c542',
            accentColor: '#00ffaa',
            titleColor: '#f5c542',
            customHeaderTitle: '',
            customGreetingText: 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
            customFooterText: 'Runway Wedding Organizer',
            customOverlayUrl: '',
            votesLedger: {}
        }
    },
    events: [],
    users: [],
    photos: [],
    allEventPhotos: [],
    guestbook: [],
    activeEventId: 'EVT-0001',
    galleryCategory: 'ALL',
    gallerySearch: '',
    galleryOffset: 0,
    galleryLimit: 24,
    galleryHasMore: false,
    gbOffset: 0,
    gbLimit: 10,
    gbHasMore: false,
    currentUser: null,
    cameraStream: null,
    cameraFacingMode: 'environment',
    cameraMirrored: false,
    cameraFilterCss: 'none',
    cameraFilterName: 'Normal',
    capturedDataUrl: '',
    selectedVotePhotoId: '',
    selectedVoteCategoryChoice: '',
    activeVoteFilterCat: 'ALL',
    customFrameOverlayImg: null,
    uploadedFrameOverlayDataUrl: '',
    backgroundUploadQueue: [],
    isBackgroundUploading: false,
    votesLedger: {},
    awardsLedger: {},
    deviceQuotaMap: {},
    deviceLogs: [],
    eventDriveConfigMap: {},
    eventSettingsMap: {},
    uploadedCustomWoLogoDataUrl: '',
    hasAutoSyncedLocalVotes: false,
    remoteGasUrl: 'https://script.google.com/macros/s/AKfycby_rqWwEjq2Nfrg4L6jJnVMUJwDDc11dTBkFaZw7QHoPMSBjVKkBf0tl7Gz86CFxVIEhA/exec'
};

var savedEndpoint = localStorage.getItem('SATUALBUM_REMOTE_GAS_URL');
if (savedEndpoint) {
    APP_STATE.remoteGasUrl = savedEndpoint;
}

// DATA FALLBACK SIMULASI
var MOCK_INITIAL_BUNDLE = {
    status: 'success',
    config: APP_STATE.config,
    users: [
        { userId: 'USR-0001', username: 'superadmin', fullName: 'Super Admin Dispocam', userPin: '000000', roleLevel: 'Super Admin', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
        { userId: 'USR-0002', username: 'adminevent', fullName: 'Admin Acara Dimas & Karyn', userPin: '123456', roleLevel: 'Admin Event', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
        { userId: 'USR-0003', username: 'operator', fullName: 'Operator Stan Foto', userPin: '112233', roleLevel: 'Operator', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
        { userId: 'USR-0004', username: 'ilham', fullName: 'Ilham', userPin: '123456', roleLevel: 'Super Admin', accountStatus: 'Active', createdAt: '08/11/2026 07:11:00' }
    ],
    events: [
        {
            eventId: 'EVT-0001',
            eventName: 'The Wedding of Karyn & Dimas',
            eventDate: '29/10/2026',
            targetDriveFolderUrl: 'https://drive.google.com/drive/folders/1WeddingKarynDimasFolderID888',
            targetDriveFolderId: '1WeddingKarynDimasFolderID888',
            backgroundMusicUrl: '',
            eventStatus: 'Active'
        },
        {
            eventId: 'EVT-0002',
            eventName: 'Engagement Night Rania & Putra',
            eventDate: '30/10/2026',
            targetDriveFolderUrl: 'https://drive.google.com/drive/folders/1EngagementRaniaPutraFolderID777',
            targetDriveFolderId: '1EngagementRaniaPutraFolderID777',
            backgroundMusicUrl: '',
            eventStatus: 'Active'
        },
        {
            eventId: 'EVT-0003',
            eventName: 'olala dan minas',
            eventDate: '30/10/2026',
            targetDriveFolderUrl: 'https://drive.google.com/drive/folders/1ZQaO3hu6n_TGajA-6Y7AJZIP8_0_1234',
            targetDriveFolderId: '1ZQaO3hu6n_TGajA-6Y7AJZIP8_0_1234',
            backgroundMusicUrl: '',
            eventStatus: 'Active'
        },
        {
            eventId: 'EVT-0004',
            eventName: 'Jeddika & Gracia',
            eventDate: '01/11/2026',
            targetDriveFolderUrl: 'https://drive.google.com/drive/folders/1FZoLfD0fczTX2N6y-xAl-G4KgVDnEfQk',
            targetDriveFolderId: '1FZoLfD0fczTX2N6y-xAl-G4KgVDnEfQk',
            backgroundMusicUrl: '',
            eventStatus: 'Active'
        }
    ],
    photos: [
        {
            photoId: 'PHT-0001',
            eventId: 'EVT-0001',
            category: 'Momen Pengantin',
            fileName: 'The_Wedding_of_Karyn_Dimas_Momen_Pengantin_1901.jpg',
            directImageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
            uploadedBy: 'Official Photographer',
            uploadedAt: '29/10/2026 19:01:00',
            awardTitle: 'Foto Teromantis 🏆',
            votes: 5,
            votesByCategory: { 'Terfavorit ❤️': 3, 'Terkeren 🔥': 2 },
            deviceId: 'DEV-OFFICIAL-01'
        },
        {
            photoId: 'PHT-0002',
            eventId: 'EVT-0001',
            category: 'Selfie Tamu',
            fileName: 'The_Wedding_of_Karyn_Dimas_Selfie_Tamu_1915.jpg',
            directImageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80',
            uploadedBy: 'Sahabat Kampus',
            uploadedAt: '29/10/2026 19:15:00',
            awardTitle: '',
            votes: 3,
            votesByCategory: { 'Terlucu & Heboh 😂': 3 },
            deviceId: 'DEV-GUEST-02'
        },
        {
            photoId: 'PHT-0003',
            eventId: 'EVT-0001',
            category: 'Best Grup',
            fileName: 'The_Wedding_of_Karyn_Dimas_Best_Grup_1930.jpg',
            directImageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=900&q=80',
            uploadedBy: 'Grup Bridesmaids',
            uploadedAt: '29/10/2026 19:30:00',
            awardTitle: 'Grup Paling Heboh ✨',
            votes: 4,
            votesByCategory: { 'Terfavorit ❤️': 2, 'Terlucu & Heboh 😂': 2 },
            deviceId: 'DEV-GUEST-03'
        },
        {
            photoId: 'PHT-0004',
            eventId: 'EVT-0001',
            category: 'Candid Acara',
            fileName: 'The_Wedding_of_Karyn_Dimas_Candid_1945.jpg',
            directImageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=900&q=80',
            uploadedBy: 'Budi Santoso',
            uploadedAt: '29/10/2026 19:45:00',
            awardTitle: '',
            votes: 2,
            votesByCategory: { 'Terkeren 🔥': 2 },
            deviceId: 'DEV-GUEST-04'
        },
        {
            photoId: 'PHT-0005',
            eventId: 'EVT-0001',
            category: 'Keluarga & VIP',
            fileName: 'The_Wedding_of_Karyn_Dimas_Keluarga_2000.jpg',
            directImageUrl: 'https://images.unsplash.com/photo-1544078751-58fee2d8a03b?auto=format&fit=crop&w=900&q=80',
            uploadedBy: 'Keluarga Besar',
            uploadedAt: '29/10/2026 20:00:00',
            awardTitle: 'Keluarga Paling Kompak 👨‍👩‍👧‍👦',
            votes: 6,
            votesByCategory: { 'Terfavorit ❤️': 4, 'Kostum Terbaik 👗': 2 },
            deviceId: 'DEV-GUEST-05'
        }
    ]
};

// HELPER: DEVICE ID & REKAM JEJAK VOTING + KUOTA PERANGKAT
function getOrCreateDeviceId() {
    var devId = localStorage.getItem('SATUALBUM_DEVICE_ID');
    if (!devId) {
        devId = 'DEV-' + Math.random().toString(36).substring(2, 10).toUpperCase() + '-' + Date.now().toString(36).toUpperCase();
        localStorage.setItem('SATUALBUM_DEVICE_ID', devId);
    }
    return devId;
}

function getDeviceVotedMapForActiveEvent() {
    var key = 'SATUALBUM_VOTED_' + APP_STATE.activeEventId;
    var raw = localStorage.getItem(key);
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
}

function saveDeviceVoteForCategory(categoryName, photoId) {
    var key = 'SATUALBUM_VOTED_' + APP_STATE.activeEventId;
    var map = getDeviceVotedMapForActiveEvent();
    map[categoryName] = {
        photoId: photoId,
        votedAt: new Date().toLocaleTimeString('id-ID')
    };
    localStorage.setItem(key, JSON.stringify(map));
}

// =====================================================================
// ISOLASI KONFIGURASI SPESIFIK PER-EVENT (TANPA REKURSI / BEBAS FREEZE)
// =====================================================================
function getDefaultEventScopedSettings(eventId) {
    var isSecondMock = (eventId === 'EVT-0002');
    return {
        _updatedAt: Date.now(),
        frameConfig: {
            style: isSecondMock ? 'rustic_botanical' : 'royal_wedding_floral',
            textMode: 'default',
            primaryColor: '#f5c542',
            accentColor: '#00ffaa',
            titleColor: '#f5c542',
            customHeaderTitle: '',
            customGreetingText: 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
            customFooterText: 'Runway Wedding Organizer',
            customOverlayUrl: '',
            _updatedAt: Date.now()
        },
        uploadLimits: {
            maxLiveUsers: 0,
            maxUploadsPerUser: 10,
            idleTimeoutMinutes: 60,
            _updatedAt: Date.now()
        },
        photoCategories: [
            { name: 'Selfie Tamu', icon: '🤳' },
            { name: 'Momen Pengantin', icon: '💍' },
            { name: 'Best Grup', icon: '👯' },
            { name: 'Candid Acara', icon: '📸' },
            { name: 'Keluarga & VIP', icon: '👨‍👩‍👧‍👦' }
        ],
        voteCategories: [
            { name: 'Terfavorit ❤️', desc: 'Foto paling disukai oleh seluruh tamu undangan' },
            { name: 'Terkeren 🔥', desc: 'Gaya, pose, dan komposisi foto paling keren' },
            { name: 'Terlucu & Heboh 😂', desc: 'Ekspresi paling seru, kocak, dan menghibur' },
            { name: 'Kostum Terbaik 👗', desc: 'Busana dan penampilan paling serasi & menawan' }
        ],
        deviceQuotaMap: {},
        deviceLogs: []
    };
}

function buildLightweightFrameConfigForStorage(rawFrameCfg, evId) {
    var fCfg = rawFrameCfg || {};
    var overlayUrl = String(fCfg.customOverlayUrl || '');
    if (overlayUrl.indexOf('data:image') === 0 && overlayUrl.length > 25000) {
        try {
            localStorage.setItem('SATUALBUM_CUSTOM_FRAME_PNG_' + evId, overlayUrl);
        } catch (e) { }
        overlayUrl = '';
    }
    return {
        style: fCfg.style || 'royal_wedding_floral',
        textMode: fCfg.textMode || 'default',
        primaryColor: fCfg.primaryColor || '#f5c542',
        accentColor: fCfg.accentColor || '#00ffaa',
        titleColor: fCfg.titleColor || '#f5c542',
        customHeaderTitle: fCfg.customHeaderTitle || '',
        customGreetingText: (fCfg.customGreetingText !== undefined) ? fCfg.customGreetingText : 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
        customFooterText: (fCfg.customFooterText !== undefined) ? fCfg.customFooterText : 'Runway Wedding Organizer',
        customOverlayUrl: overlayUrl,
        _updatedAt: fCfg._updatedAt || Date.now()
    };
}

function saveActiveEventScopedSettings(markModified) {
    var evId = APP_STATE.activeEventId || 'EVT-0001';
    if (!APP_STATE.eventSettingsMap) APP_STATE.eventSettingsMap = {};

    var cur = APP_STATE.eventSettingsMap[evId] || getDefaultEventScopedSettings(evId);
    var nowTs = Date.now();

    var fCfgCopy = buildLightweightFrameConfigForStorage((APP_STATE.config && APP_STATE.config.frameConfig) || cur.frameConfig, evId);
    var limSource = (APP_STATE.config && APP_STATE.config.uploadLimits) || cur.uploadLimits || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 };
    var limCopy = {
        maxLiveUsers: parseInt(limSource.maxLiveUsers, 10) || 0,
        maxUploadsPerUser: parseInt(limSource.maxUploadsPerUser, 10) || 0,
        idleTimeoutMinutes: (limSource.idleTimeoutMinutes !== undefined) ? (parseInt(limSource.idleTimeoutMinutes, 10) || 0) : 60,
        _updatedAt: markModified ? nowTs : (limSource._updatedAt || nowTs)
    };

    if (markModified) {
        cur._updatedAt = nowTs;
        fCfgCopy._updatedAt = nowTs;
    }

    cur.frameConfig = fCfgCopy;
    cur.uploadLimits = limCopy;
    cur.photoCategories = getNormalizedPhotoCategories();
    cur.voteCategories = getNormalizedVoteCategories();
    cur.deviceQuotaMap = APP_STATE.deviceQuotaMap || {};
    cur.deviceLogs = (APP_STATE.deviceLogs || []).slice(0, 20);

    APP_STATE.eventSettingsMap[evId] = cur;
    try {
        localStorage.setItem('SATUALBUM_EVENT_SCOPED_' + evId, JSON.stringify(cur));
    } catch (ignoreStorageErr) { }
}

// PEMUAT GAMBAR BINGKAI KUSTOM (PNG OVERLAY) DENGAN AUTO RETRY & CACHE LOKAL
function loadCustomFrameOverlayImage(url, onLoaded) {
    var evId = APP_STATE.activeEventId || 'EVT-0001';
    var rawUrl = url || (APP_STATE.config && APP_STATE.config.frameConfig && APP_STATE.config.frameConfig.customOverlayUrl) || APP_STATE.uploadedFrameOverlayDataUrl || localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + evId) || '';
    if (!rawUrl || !String(rawUrl).trim()) {
        APP_STATE.customFrameOverlayImg = null;
        if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
        if (typeof onLoaded === 'function') onLoaded(null);
        return;
    }
    var cleanUrl = resolveLogoImageUrl(rawUrl);
    var img = new Image();
    if (String(cleanUrl).indexOf('data:') !== 0) {
        img.crossOrigin = 'Anonymous';
    }
    img.onload = function () {
        APP_STATE.customFrameOverlayImg = img;
        if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
        if (typeof onLoaded === 'function') onLoaded(img);
    };
    img.onerror = function () {
        if (img.crossOrigin) {
            var retryImg = new Image();
            retryImg.onload = function () {
                APP_STATE.customFrameOverlayImg = retryImg;
                if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
                if (typeof onLoaded === 'function') onLoaded(retryImg);
            };
            retryImg.onerror = function () {
                APP_STATE.customFrameOverlayImg = null;
                if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
                if (typeof onLoaded === 'function') onLoaded(null);
            };
            retryImg.src = cleanUrl;
        } else {
            APP_STATE.customFrameOverlayImg = null;
            if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
            if (typeof onLoaded === 'function') onLoaded(null);
        }
    };
    img.src = cleanUrl;
}

function loadActiveEventScopedSettings(eventId) {
    var evId = eventId || APP_STATE.activeEventId || 'EVT-0001';
    if (!APP_STATE.eventSettingsMap) APP_STATE.eventSettingsMap = {};

    var def = getDefaultEventScopedSettings(evId);

    var evObj = null;
    if (Array.isArray(APP_STATE.events)) {
        for (var k = 0; k < APP_STATE.events.length; k++) {
            if (APP_STATE.events[k].eventId === evId) { evObj = APP_STATE.events[k]; break; }
        }
    }

    var serverSettings = null;
    if (evObj && (evObj.frameConfig || evObj.uploadLimits || evObj.photoCategories || evObj.voteCategories)) {
        serverSettings = {
            frameConfig: evObj.frameConfig,
            uploadLimits: evObj.uploadLimits,
            photoCategories: evObj.photoCategories,
            voteCategories: evObj.voteCategories,
            _updatedAt: evObj._updatedAt || 1
        };
    }

    var localSettings = null;
    try {
        var rawLocalScoped = localStorage.getItem('SATUALBUM_EVENT_SCOPED_' + evId);
        if (rawLocalScoped) {
            localSettings = JSON.parse(rawLocalScoped);
        }
    } catch (e) { }

    var chosen = def;
    if (serverSettings && localSettings) {
        // SERVER ADALAH SINGLE SOURCE OF TRUTH UNTUK LIMITASI & PENGATURAN EVENT
        chosen = {
            frameConfig: serverSettings.frameConfig || localSettings.frameConfig || def.frameConfig,
            uploadLimits: serverSettings.uploadLimits || localSettings.uploadLimits || def.uploadLimits,
            photoCategories: (serverSettings.photoCategories && serverSettings.photoCategories.length > 0) ? serverSettings.photoCategories : (localSettings.photoCategories || def.photoCategories),
            voteCategories: (serverSettings.voteCategories && serverSettings.voteCategories.length > 0) ? serverSettings.voteCategories : (localSettings.voteCategories || def.voteCategories),
            deviceQuotaMap: localSettings.deviceQuotaMap || {},
            deviceLogs: localSettings.deviceLogs || [],
            _updatedAt: Math.max(serverSettings._updatedAt || 0, localSettings._updatedAt || 0)
        };
    } else if (serverSettings) {
        chosen = serverSettings;
    } else if (localSettings) {
        chosen = localSettings;
    } else if (APP_STATE.eventSettingsMap[evId]) {
        chosen = APP_STATE.eventSettingsMap[evId];
    }

    APP_STATE.eventSettingsMap[evId] = chosen;

    APP_STATE.config.frameConfig = JSON.parse(JSON.stringify(chosen.frameConfig || def.frameConfig));
    var localEventPng = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + evId);
    if (!APP_STATE.config.frameConfig.customOverlayUrl && localEventPng) {
        APP_STATE.config.frameConfig.customOverlayUrl = localEventPng;
    }
    APP_STATE.uploadedFrameOverlayDataUrl = APP_STATE.config.frameConfig.customOverlayUrl || '';

    APP_STATE.config.uploadLimits = JSON.parse(JSON.stringify(chosen.uploadLimits || def.uploadLimits));
    APP_STATE.config.photoCategories = JSON.parse(JSON.stringify((chosen.photoCategories && chosen.photoCategories.length > 0) ? chosen.photoCategories : def.photoCategories));
    APP_STATE.config.voteCategories = JSON.parse(JSON.stringify((chosen.voteCategories && chosen.voteCategories.length > 0) ? chosen.voteCategories : def.voteCategories));
    APP_STATE.deviceQuotaMap = JSON.parse(JSON.stringify(chosen.deviceQuotaMap || {}));
    APP_STATE.deviceLogs = JSON.parse(JSON.stringify(chosen.deviceLogs || []));

    if (typeof loadCustomFrameOverlayImage === 'function') {
        loadCustomFrameOverlayImage(APP_STATE.config.frameConfig.customOverlayUrl || '');
    }
}

// CACHE SINKRONISASI PENGATURAN LOKAL & DATABASE (AMAN TANPA LOOP REKURSIF)
function saveExtendedConfigCache(markModified) {
    try {
        saveActiveEventScopedSettings(Boolean(markModified));
        var evId = APP_STATE.activeEventId || 'EVT-0001';
        var lightFrame = buildLightweightFrameConfigForStorage(APP_STATE.config.frameConfig, evId);
        var safeLogo = String(APP_STATE.config.woLogoUrl || '');
        if (safeLogo.length > 25000) safeLogo = '';

        var cacheObj = {
            uploadLimits: APP_STATE.config.uploadLimits,
            frameConfig: lightFrame,
            voteCategories: APP_STATE.config.voteCategories,
            photoCategories: APP_STATE.config.photoCategories,
            deviceQuotaMap: APP_STATE.deviceQuotaMap,
            deviceLogs: (APP_STATE.deviceLogs || []).slice(0, 20),
            eventDriveConfigMap: APP_STATE.eventDriveConfigMap,
            eventSettingsMap: APP_STATE.eventSettingsMap,
            woLogoUrl: safeLogo
        };
        localStorage.setItem('SATUALBUM_EXT_CONFIG_CACHE', JSON.stringify(cacheObj));
    } catch (e) { }
}

function loadExtendedConfigCache() {
    try {
        var raw = localStorage.getItem('SATUALBUM_EXT_CONFIG_CACHE');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        return null;
    }
}

function syncConfigToBackend(successToastMsg, onCompleteCallback) {
    saveActiveEventScopedSettings(true);
    saveExtendedConfigCache(true);
    renderAdminEventScopeSummary();

    var safeFrameConfig = JSON.parse(JSON.stringify(APP_STATE.config.frameConfig || {}));
    if (safeFrameConfig.customOverlayUrl && safeFrameConfig.customOverlayUrl.length > 42000) {
        try {
            localStorage.setItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId, safeFrameConfig.customOverlayUrl);
        } catch (e) { }
        safeFrameConfig.customOverlayUrl = '';
    }

    var safeWoLogoUrl = APP_STATE.config.woLogoUrl || '';
    if (safeWoLogoUrl.length > 42000) {
        try {
            localStorage.setItem('SATUALBUM_CUSTOM_WO_LOGO', safeWoLogoUrl);
        } catch (e) { }
        safeWoLogoUrl = '';
    }

    var cleanFooterBase = String(APP_STATE.config.customFooter || '').split('||DBSYNC:')[0].trim();
    APP_STATE.config.customFooter = cleanFooterBase;
    var packedFooterWithDbSync = packCustomFooterWithDbSync(cleanFooterBase);

    var payload = {
        appName: APP_STATE.config.appName,
        appTagline: APP_STATE.config.appTagline,
        woName: APP_STATE.config.woName,
        woLogoUrl: safeWoLogoUrl,
        woContact: APP_STATE.config.woContact,
        customFooter: packedFooterWithDbSync,
        globalDriveFolderUrl: APP_STATE.config.globalDriveFolderUrl,
        globalDriveFolderId: extractDriveFolderIdClient(APP_STATE.config.globalDriveFolderUrl),
        voteCategories: getNormalizedVoteCategories(),
        uploadLimits: APP_STATE.config.uploadLimits || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 },
        frameConfig: safeFrameConfig
    };

    // PENTING: Simpan juga ke baris event di Sheet EVENTS lewat saveEventSettings
    var ev = getActiveEventObject();
    if (ev && ev.eventId) {
        callBackendApi('saveEventSettings', {
            eventId: ev.eventId,
            frameConfig: safeFrameConfig,
            uploadLimits: APP_STATE.config.uploadLimits,
            photoCategories: getNormalizedPhotoCategories(),
            voteCategories: getNormalizedVoteCategories()
        });
    }

    callBackendApi('saveAppConfig', payload, function (res) {
        if (res && res.status === 'success') {
            if (res.config) {
                res.config.customFooter = unpackCustomFooterAndRestoreDbSync(res.config.customFooter, res.config);
                APP_STATE.config = mergeServerConfigWithLocalExt(res.config);
                loadActiveEventScopedSettings(APP_STATE.activeEventId);
                saveExtendedConfigCache();
            }
            applyBrandingToDom();
            updateHeroCounters();
            if (successToastMsg) showToast(successToastMsg);
        } else {
            if (successToastMsg) showToast(successToastMsg, false);
        }
        if (typeof onCompleteCallback === 'function') onCompleteCallback(true);
    }, function () {
        if (successToastMsg) showToast(successToastMsg, false);
        if (typeof onCompleteCallback === 'function') onCompleteCallback(false);
    });
}

function appendDeviceActivityLog(deviceId, userName, actionTitle, detailInfo) {
    if (!Array.isArray(APP_STATE.deviceLogs)) APP_STATE.deviceLogs = [];
    var nowStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var dateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit' });
    var devKey = String(deviceId || getOrCreateDeviceId()).trim();
    var uName = String(userName || 'Tamu').trim();

    APP_STATE.deviceLogs.unshift({
        t: dateStr + ' ' + nowStr,
        d: devKey,
        u: uName,
        a: String(actionTitle || 'Aktivitas'),
        m: String(detailInfo || '')
    });

    if (APP_STATE.deviceLogs.length > 40) {
        APP_STATE.deviceLogs = APP_STATE.deviceLogs.slice(0, 40);
    }

    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
    if (!APP_STATE.deviceQuotaMap[devKey]) {
        APP_STATE.deviceQuotaMap[devKey] = { bonusQuota: 0, resetOffset: 0, lastUser: uName, lastActive: dateStr + ' ' + nowStr };
    } else {
        if (uName && uName !== 'Tamu' && uName !== 'Admin') APP_STATE.deviceQuotaMap[devKey].lastUser = uName;
        APP_STATE.deviceQuotaMap[devKey].lastActive = dateStr + ' ' + nowStr;
    }

    saveExtendedConfigCache();
    renderAdminDeviceManagementAndLogs();
}

function getMyUploadedPhotoIdsForActiveEvent() {
    var key = 'SATUALBUM_MY_PHOTOS_' + APP_STATE.activeEventId;
    var raw = localStorage.getItem(key);
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
}

function recordMyUploadedPhotoId(photoId, uploaderName) {
    var key = 'SATUALBUM_MY_PHOTOS_' + APP_STATE.activeEventId;
    var map = getMyUploadedPhotoIdsForActiveEvent();
    if (photoId) map[photoId] = uploaderName || true;
    localStorage.setItem(key, JSON.stringify(map));
}

// =====================================================================
// ENGINE SINKRONISASI DATABASE MULTI-CHANNEL (ADMIN_CONFIG, EVENTS, PHOTOS)
// Memastikan seluruh hasil voting dari localhost tersimpan permanen di
// Google Sheets meskipun Web App belum di-redeploy ke versi baru.
// =====================================================================
function setVoteDbSyncIndicator(statusText, isSyncing) {
    var el = document.getElementById('voteDbSyncStatusText');
    if (!el) return;
    if (isSyncing) {
        el.style.color = 'var(--accent-gold)';
        el.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> ' + escapeHtml(statusText);
    } else {
        el.style.color = 'var(--accent-neon)';
        el.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + escapeHtml(statusText);
    }
}

function mergeIntoGlobalVotesLedger(incomingLedger) {
    if (!incomingLedger || typeof incomingLedger !== 'object') return false;
    if (!APP_STATE.votesLedger) APP_STATE.votesLedger = {};
    var hasHigherLocalOrIncoming = false;

    for (var pid in incomingLedger) {
        if (!incomingLedger.hasOwnProperty(pid) || !pid) continue;
        var inc = incomingLedger[pid];
        if (!inc || typeof inc !== 'object') continue;
        var incCats = inc.votesByCategory || inc.c || {};
        var curEntry = APP_STATE.votesLedger[pid] || { votes: 0, votesByCategory: {} };
        if (!curEntry.votesByCategory) curEntry.votesByCategory = {};

        for (var cName in incCats) {
            if (incCats.hasOwnProperty(cName)) {
                var incVal = parseInt(incCats[cName], 10) || 0;
                var curVal = parseInt(curEntry.votesByCategory[cName], 10) || 0;
                if (incVal > curVal) {
                    curEntry.votesByCategory[cName] = incVal;
                    hasHigherLocalOrIncoming = true;
                }
            }
        }

        var sumC = 0;
        for (var k in curEntry.votesByCategory) {
            if (curEntry.votesByCategory.hasOwnProperty(k)) {
                sumC += (parseInt(curEntry.votesByCategory[k], 10) || 0);
            }
        }
        var incTotal = parseInt(inc.votes !== undefined ? inc.votes : inc.v, 10) || 0;
        var nextTotal = Math.max(curEntry.votes || 0, incTotal, sumC);
        if (nextTotal > (curEntry.votes || 0)) {
            hasHigherLocalOrIncoming = true;
        }
        curEntry.votes = nextTotal;
        if (inc.uploadedBy) curEntry.uploadedBy = inc.uploadedBy;
        APP_STATE.votesLedger[pid] = curEntry;
    }
    return hasHigherLocalOrIncoming;
}

function buildCompactVotesLedgerForDb() {
    var compact = {};
    var ledger = APP_STATE.votesLedger || {};
    for (var pid in ledger) {
        if (ledger.hasOwnProperty(pid) && pid && pid.indexOf('PHT-TEMP-') !== 0) {
            var item = ledger[pid];
            if (item && ((item.votes && item.votes > 0) || (item.votesByCategory && Object.keys(item.votesByCategory).length > 0))) {
                compact[pid] = {
                    v: parseInt(item.votes, 10) || 0,
                    c: item.votesByCategory || {}
                };
                if (item.uploadedBy) compact[pid].u = item.uploadedBy;
            }
        }
    }
    return compact;
}

function packCustomFooterWithDbSync(cleanFooterText) {
    saveActiveEventScopedSettings(false);
    var baseFooter = String(cleanFooterText || '').split('||DBSYNC:')[0].trim();
    if (!baseFooter) baseFooter = 'Official Digital Album Platform • Runway Wedding Organizer';
    var fCfg = (APP_STATE.config && APP_STATE.config.frameConfig) || {};

    // Buat salinan ringkas eventSettingsMap agar ukuran karakter selalu aman di bawah batas sel Google Sheets
    var compactEsm = {};
    if (APP_STATE.eventSettingsMap) {
        for (var evKey in APP_STATE.eventSettingsMap) {
            if (APP_STATE.eventSettingsMap.hasOwnProperty(evKey) && APP_STATE.eventSettingsMap[evKey]) {
                var srcEs = APP_STATE.eventSettingsMap[evKey];
                compactEsm[evKey] = {
                    _updatedAt: srcEs._updatedAt || Date.now(),
                    frameConfig: buildLightweightFrameConfigForStorage(srcEs.frameConfig, evKey),
                    uploadLimits: srcEs.uploadLimits || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 },
                    photoCategories: srcEs.photoCategories || [],
                    voteCategories: srcEs.voteCategories || [],
                    deviceQuotaMap: srcEs.deviceQuotaMap || {}
                };
            }
        }
    }

    var syncObj = {
        vl: buildCompactVotesLedgerForDb(),
        al: APP_STATE.awardsLedger || {},
        ul: (APP_STATE.config && APP_STATE.config.uploadLimits) || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 },
        fc: {
            style: fCfg.style || 'royal_wedding_floral',
            textMode: fCfg.textMode || 'default',
            primaryColor: fCfg.primaryColor || '#f5c542',
            accentColor: fCfg.accentColor || '#00ffaa',
            titleColor: fCfg.titleColor || '#f5c542',
            customHeaderTitle: fCfg.customHeaderTitle || '',
            customGreetingText: (fCfg.customGreetingText !== undefined) ? fCfg.customGreetingText : 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
            customFooterText: (fCfg.customFooterText !== undefined) ? fCfg.customFooterText : 'Runway Wedding Organizer'
        },
        vc: getNormalizedVoteCategories(),
        pc: getNormalizedPhotoCategories(),
        dq: APP_STATE.deviceQuotaMap || {},
        dl: (APP_STATE.deviceLogs || []).slice(0, 15),
        edm: APP_STATE.eventDriveConfigMap || {},
        esm: compactEsm
    };
    return baseFooter + ' ||DBSYNC:' + JSON.stringify(syncObj);
}

function unpackCustomFooterAndRestoreDbSync(rawFooterStr, configObj) {
    if (!rawFooterStr) return 'Official Digital Album Platform • Runway Wedding Organizer';
    var parts = String(rawFooterStr).split('||DBSYNC:');
    var cleanFooter = parts[0].trim();
    if (parts.length > 1 && parts[1]) {
        try {
            var parsed = JSON.parse(parts[1].trim());
            if (parsed && typeof parsed === 'object') {
                if (parsed.vl) mergeIntoGlobalVotesLedger(parsed.vl);
                if (parsed.al && typeof parsed.al === 'object') {
                    for (var ak in parsed.al) {
                        if (parsed.al.hasOwnProperty(ak)) APP_STATE.awardsLedger[ak] = parsed.al[ak];
                    }
                }
                if (parsed.esm && typeof parsed.esm === 'object') {
                    if (!APP_STATE.eventSettingsMap) APP_STATE.eventSettingsMap = {};
                    for (var evKey in parsed.esm) {
                        if (parsed.esm.hasOwnProperty(evKey)) {
                            var localExisting = APP_STATE.eventSettingsMap[evKey];
                            var srvScoped = parsed.esm[evKey];
                            var srvTs = (srvScoped && (srvScoped._updatedAt || (srvScoped.frameConfig && srvScoped.frameConfig._updatedAt))) || 0;
                            var locTs = (localExisting && (localExisting._updatedAt || (localExisting.frameConfig && localExisting.frameConfig._updatedAt))) || 0;
                            if (!localExisting || srvTs > locTs) {
                                APP_STATE.eventSettingsMap[evKey] = srvScoped;
                            }
                        }
                    }
                }
                if (parsed.ul && configObj) {
                    configObj.uploadLimits = parsed.ul;
                }
                if (parsed.fc && configObj) {
                    var prevOverlay = (configObj.frameConfig && configObj.frameConfig.customOverlayUrl) || '';
                    configObj.frameConfig = parsed.fc;
                    if (prevOverlay && !configObj.frameConfig.customOverlayUrl) {
                        configObj.frameConfig.customOverlayUrl = prevOverlay;
                    }
                }
                if (Array.isArray(parsed.vc) && parsed.vc.length > 0 && configObj) {
                    configObj.voteCategories = parsed.vc;
                }
                if (Array.isArray(parsed.pc) && parsed.pc.length > 0 && configObj) {
                    configObj.photoCategories = parsed.pc;
                }
                if (parsed.dq && typeof parsed.dq === 'object') {
                    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
                    for (var dk in parsed.dq) {
                        if (parsed.dq.hasOwnProperty(dk)) {
                            APP_STATE.deviceQuotaMap[dk] = parsed.dq[dk];
                        }
                    }
                }
                if (Array.isArray(parsed.dl) && parsed.dl.length > 0) {
                    if (!APP_STATE.deviceLogs || APP_STATE.deviceLogs.length === 0) {
                        APP_STATE.deviceLogs = parsed.dl;
                    }
                }
                if (parsed.edm && typeof parsed.edm === 'object') {
                    if (!APP_STATE.eventDriveConfigMap) APP_STATE.eventDriveConfigMap = {};
                    for (var ek in parsed.edm) {
                        if (parsed.edm.hasOwnProperty(ek)) {
                            APP_STATE.eventDriveConfigMap[ek] = parsed.edm[ek];
                        }
                    }
                }
            }
        } catch (err) { }
    }
    return cleanFooter;
}

function unpackEventBgMusicDbSync(eventsArray) {
    var list = eventsArray || [];
    if (!APP_STATE.eventDriveConfigMap) APP_STATE.eventDriveConfigMap = {};
    if (!APP_STATE.eventSettingsMap) APP_STATE.eventSettingsMap = {};
    for (var i = 0; i < list.length; i++) {
        var bgRaw = String(list[i].backgroundMusicUrl || '');
        if (bgRaw.indexOf('||EVDB:') !== -1) {
            var parts = bgRaw.split('||EVDB:');
            list[i].backgroundMusicUrl = parts[0].trim();
            if (parts[1]) {
                try {
                    var evData = JSON.parse(parts[1].trim());
                    if (evData && evData.vl) mergeIntoGlobalVotesLedger(evData.vl);
                    if (evData && evData.al) {
                        for (var k in evData.al) {
                            if (evData.al.hasOwnProperty(k)) APP_STATE.awardsLedger[k] = evData.al[k];
                        }
                    }
                    if (evData && evData.dc && list[i].eventId) {
                        APP_STATE.eventDriveConfigMap[list[i].eventId] = evData.dc;
                    }
                    if (evData && evData.es && list[i].eventId) {
                        var locEs = APP_STATE.eventSettingsMap[list[i].eventId];
                        var srvEsTs = (evData.es && (evData.es._updatedAt || (evData.es.frameConfig && evData.es.frameConfig._updatedAt))) || 0;
                        var locEsTs = (locEs && (locEs._updatedAt || (locEs.frameConfig && locEs.frameConfig._updatedAt))) || 0;
                        if (!locEs || srvEsTs > locEsTs) {
                            APP_STATE.eventSettingsMap[list[i].eventId] = evData.es;
                        }
                    }
                } catch (e) { }
            }
        }
        // Gabungkan info Master Drive & Subfolder ke objek event
        var edc = APP_STATE.eventDriveConfigMap[list[i].eventId] || {};
        list[i].masterDriveFolderUrl = edc.masterDriveUrl || list[i].targetDriveFolderUrl || '';
        list[i].subfolderMode = edc.subfolderMode || 'auto';
        list[i].subfolderName = edc.subfolderName || '';
        list[i].customEventId = edc.customEventId || list[i].customEventId || list[i].eventId;
    }
}

function getEventDisplayId(evObj) {
    if (!evObj) return '';
    var edc = (APP_STATE.eventDriveConfigMap && APP_STATE.eventDriveConfigMap[evObj.eventId]) || {};
    return edc.customEventId || evObj.customEventId || evObj.eventId || '';
}

function resolveEventIdFromInputOrQuery(rawIdStr) {
    if (!rawIdStr) return '';
    var clean = String(rawIdStr).trim();
    var list = APP_STATE.events || [];
    for (var i = 0; i < list.length; i++) {
        var dispId = getEventDisplayId(list[i]);
        if (list[i].eventId === clean || dispId === clean || list[i].eventId.toLowerCase() === clean.toLowerCase() || dispId.toLowerCase() === clean.toLowerCase()) {
            return list[i].eventId;
        }
    }
    return clean;
}

function packPhotoAwardWithVotes(cleanAwardTitle, votesTotal, votesByCatObj) {
    var baseAward = String(cleanAwardTitle || '').split('||VOTES:')[0].trim();
    var vData = {
        v: parseInt(votesTotal, 10) || 0,
        c: votesByCatObj || {}
    };
    return baseAward + ' ||VOTES:' + JSON.stringify(vData);
}

function unpackPhotoAwardAndVotes(rawAwardStr) {
    if (!rawAwardStr) return { cleanAward: '', votes: 0, votesByCategory: null };
    var str = String(rawAwardStr);
    if (str.indexOf('||VOTES:') === -1) {
        return { cleanAward: str.trim(), votes: 0, votesByCategory: null };
    }
    var parts = str.split('||VOTES:');
    var cleanAward = parts[0].trim();
    var vTotal = 0;
    var vCats = null;
    if (parts[1]) {
        try {
            var parsed = JSON.parse(parts[1].trim());
            vTotal = parseInt(parsed.v, 10) || 0;
            vCats = parsed.c || {};
        } catch (e) { }
    }
    return { cleanAward: cleanAward, votes: vTotal, votesByCategory: vCats };
}

// CACHE SINKRONISASI VOTE LOKAL & DATABASE LEDGER
function getLocalPhotoVoteCacheMap() {
    var key = 'SATUALBUM_PHOTO_VOTES_CACHE_' + APP_STATE.activeEventId;
    var raw = localStorage.getItem(key);
    if (!raw) return {};
    try { return JSON.parse(raw) || {}; } catch (e) { return {}; }
}

function saveLocalPhotoVoteCache(photoId, votesTotal, votesByCategoryObj, uploaderName) {
    var key = 'SATUALBUM_PHOTO_VOTES_CACHE_' + APP_STATE.activeEventId;
    var map = getLocalPhotoVoteCacheMap();
    map[photoId] = {
        votes: votesTotal,
        votesByCategory: votesByCategoryObj || {},
        uploadedBy: uploaderName || ''
    };
    localStorage.setItem(key, JSON.stringify(map));

    var singleObj = {};
    singleObj[photoId] = {
        votes: votesTotal,
        votesByCategory: votesByCategoryObj || {},
        uploadedBy: uploaderName || ''
    };
    mergeIntoGlobalVotesLedger(singleObj);
    saveExtendedConfigCache();
}

function mergePhotosWithLocalVoteCache(photoList) {
    var cacheMap = getLocalPhotoVoteCacheMap();
    var votedMap = getDeviceVotedMapForActiveEvent();
    var myPhotosMap = getMyUploadedPhotoIdsForActiveEvent();
    var myDevId = getOrCreateDeviceId();
    var list = photoList || [];
    var foundUnsyncedLocalVotes = false;

    // 1. Gabungkan cache lokal dari perangkat ini ke dalam Global Votes Ledger terlebih dahulu
    if (mergeIntoGlobalVotesLedger(cacheMap)) {
        foundUnsyncedLocalVotes = true;
    }

    // 2. Pastikan setiap vote yang pernah dilakukan perangkat ini tercatat pada objek foto terkait
    for (var catKey in votedMap) {
        if (votedMap.hasOwnProperty(catKey)) {
            var vInfo = votedMap[catKey];
            if (vInfo && vInfo.photoId) {
                for (var m = 0; m < list.length; m++) {
                    if (list[m].photoId === vInfo.photoId) {
                        if (!list[m].votesByCategory) list[m].votesByCategory = {};
                        if (!list[m].votesByCategory[catKey] || list[m].votesByCategory[catKey] < 1) {
                            list[m].votesByCategory[catKey] = 1;
                            foundUnsyncedLocalVotes = true;
                        }
                    }
                }
            }
        }
    }

    var cats = getNormalizedVoteCategories();
    var defaultFirstCat = (cats.length > 0 && cats[0].name) ? cats[0].name : 'Terfavorit ❤️';

    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (!p.deviceId && myPhotosMap[p.photoId]) {
            p.deviceId = myDevId;
        }
        if (!p.votesByCategory || typeof p.votesByCategory !== 'object') {
            p.votesByCategory = {};
        }

        // Simpan catatan nilai asli dari server sebelum digabung dengan cache localhost
        var rawServerVotes = parseInt(p.votes, 10) || 0;
        var rawServerCats = JSON.parse(JSON.stringify(p.votesByCategory || {}));

        // Unpack ||VOTES: yang tersimpan di kolom Award_Title pada Sheet PHOTOS
        var unpackedAward = unpackPhotoAwardAndVotes(p.awardTitle);
        p.awardTitle = unpackedAward.cleanAward;
        if (!p.awardTitle && APP_STATE.awardsLedger && APP_STATE.awardsLedger[p.photoId]) {
            p.awardTitle = APP_STATE.awardsLedger[p.photoId];
        } else if (p.awardTitle) {
            APP_STATE.awardsLedger[p.photoId] = p.awardTitle;
        }

        var dbServerLedgerEntry = (APP_STATE.votesLedger && APP_STATE.votesLedger[p.photoId]) || null;
        var localCacheEntry = cacheMap[p.photoId] || null;

        var sources = [
            unpackedAward.votesByCategory ? { votesByCategory: unpackedAward.votesByCategory, votes: unpackedAward.votes } : null,
            dbServerLedgerEntry,
            localCacheEntry
        ];

        for (var s = 0; s < sources.length; s++) {
            var src = sources[s];
            if (src) {
                var srcCats = src.votesByCategory || src.c || {};
                for (var cName in srcCats) {
                    if (srcCats.hasOwnProperty(cName)) {
                        var srcVal = parseInt(srcCats[cName], 10) || 0;
                        var curVal = parseInt(p.votesByCategory[cName], 10) || 0;
                        if (srcVal > curVal) {
                            p.votesByCategory[cName] = srcVal;
                        }
                    }
                }
            }
        }

        var sumBreakdown = 0;
        for (var k in p.votesByCategory) {
            if (p.votesByCategory.hasOwnProperty(k)) {
                sumBreakdown += (parseInt(p.votesByCategory[k], 10) || 0);
            }
        }
        var rawTotal = Math.max(
            rawServerVotes,
            unpackedAward.votes || 0,
            (dbServerLedgerEntry && parseInt(dbServerLedgerEntry.votes, 10)) || 0,
            (localCacheEntry && parseInt(localCacheEntry.votes, 10)) || 0
        );
        p.votes = Math.max(rawTotal, sumBreakdown);

        // Jika foto memiliki total suara > 0 tetapi rincian kategorinya masih kosong, masukkan ke kategori pertama agar tampil di Hasil Voting
        if (p.votes > 0 && sumBreakdown === 0) {
            p.votesByCategory[defaultFirstCat] = p.votes;
        }

        // Deteksi apabila suara di localhost lebih tinggi dari kolom Vote_Count di Sheet PHOTOS
        if (p.votes > rawServerVotes && p.photoId && p.photoId.indexOf('PHT-TEMP-') !== 0) {
            foundUnsyncedLocalVotes = true;
            p._unsyncedCatsDelta = {};
            for (var ck in p.votesByCategory) {
                if (p.votesByCategory.hasOwnProperty(ck)) {
                    var mergedVal = parseInt(p.votesByCategory[ck], 10) || 0;
                    var srvVal = parseInt(rawServerCats[ck], 10) || 0;
                    if (mergedVal > srvVal) {
                        p._unsyncedCatsDelta[ck] = mergedVal - srvVal;
                    }
                }
            }
        }

        // Simpan kembali ke Global Votes Ledger & Local Cache
        if (p.votes > 0) {
            APP_STATE.votesLedger[p.photoId] = {
                votes: p.votes,
                votesByCategory: p.votesByCategory,
                uploadedBy: p.uploadedBy || ''
            };
        }
    }

    // Validasi pengaman: jika foto yang dulu pernah di-vote sudah dihapus dari galeri, buka kembali kunci vote kategori tersebut
    var existingPhotoIds = {};
    for (var idx = 0; idx < list.length; idx++) {
        existingPhotoIds[list[idx].photoId] = true;
    }
    var mapChanged = false;
    for (var vCat in votedMap) {
        if (votedMap.hasOwnProperty(vCat) && votedMap[vCat] && votedMap[vCat].photoId) {
            if (list.length > 0 && !existingPhotoIds[votedMap[vCat].photoId]) {
                delete votedMap[vCat];
                mapChanged = true;
            }
        }
    }
    if (mapChanged) {
        localStorage.setItem('SATUALBUM_VOTED_' + APP_STATE.activeEventId, JSON.stringify(votedMap));
    }

    // Jika terdeteksi ada vote di localhost yang belum masuk ke Sheet PHOTOS, otomatis dorong ke database
    if (foundUnsyncedLocalVotes && !APP_STATE.hasAutoSyncedLocalVotes && list.length > 0) {
        APP_STATE.hasAutoSyncedLocalVotes = true;
        setTimeout(function () {
            pushAllVotesToDatabase(false);
        }, 400);
    }

    return list;
}

// MENDORONG SELURUH DATA VOTING DARI LOCALHOST KE DATABASE GOOGLE SHEETS
function pushAllVotesToDatabase(showFeedbackToast) {
    var list = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    for (var i = 0; i < list.length; i++) {
        var p = list[i];
        if (p.votes && p.votes > 0 && p.photoId && p.photoId.indexOf('PHT-TEMP-') !== 0) {
            APP_STATE.votesLedger[p.photoId] = {
                votes: p.votes,
                votesByCategory: p.votesByCategory || {},
                uploadedBy: p.uploadedBy || ''
            };

            // Jika ada selisih suara di localhost yang belum tercatat di kolom Vote_Count Sheet PHOTOS, kirim via castPhotoVote
            if (p._unsyncedCatsDelta) {
                for (var dCat in p._unsyncedCatsDelta) {
                    if (p._unsyncedCatsDelta.hasOwnProperty(dCat)) {
                        var deltaCount = Math.min(parseInt(p._unsyncedCatsDelta[dCat], 10) || 0, 5);
                        for (var d = 0; d < deltaCount; d++) {
                            callBackendApi('castPhotoVote', {
                                photoId: p.photoId,
                                eventId: APP_STATE.activeEventId,
                                voteCategory: dCat,
                                deviceId: getOrCreateDeviceId()
                            });
                        }
                    }
                }
                delete p._unsyncedCatsDelta;
            }

            // Update juga ke Sheet PHOTOS via awardPhoto (menyimpan backup JSON vote di kolom Award_Title)
            var packedAward = packPhotoAwardWithVotes(p.awardTitle || '', p.votes, p.votesByCategory || {});
            callBackendApi('awardPhoto', {
                photoId: p.photoId,
                awardTitle: packedAward
            });
        }
    }

    // 1. Simpan ke Sheet EVENTS (Kolom Background_Music_URL) agar terikat pada Event Aktif
    var ev = getActiveEventObject();
    if (ev && ev.eventId) {
        saveActiveEventScopedSettings();
        var baseBgUrl = String(ev.backgroundMusicUrl || '').split('||EVDB:')[0].trim();
        var evDriveMeta = (APP_STATE.eventDriveConfigMap && APP_STATE.eventDriveConfigMap[ev.eventId]) || {
            masterDriveUrl: ev.masterDriveFolderUrl || ev.targetDriveFolderUrl || '',
            subfolderMode: ev.subfolderMode || 'auto',
            subfolderName: ev.subfolderName || ''
        };
        var evDbPayload = baseBgUrl + ' ||EVDB:' + JSON.stringify({
            vl: buildCompactVotesLedgerForDb(),
            al: APP_STATE.awardsLedger || {},
            dc: evDriveMeta,
            es: (APP_STATE.eventSettingsMap && APP_STATE.eventSettingsMap[ev.eventId]) || null
        });
        callBackendApi('saveEventItem', {
            eventId: ev.eventId,
            eventName: ev.eventName,
            eventDate: ev.eventDate,
            targetDriveFolderUrl: ev.targetDriveFolderUrl || '',
            targetDriveFolderId: ev.targetDriveFolderId || '',
            backgroundMusicUrl: evDbPayload,
            eventStatus: ev.eventStatus || 'Active',
            createdBy: ev.createdBy || 'system'
        });
    }

    // 2. Simpan ke Sheet ADMIN_CONFIG (Kolom Custom_Footer + Vote_Categories_JSON)
    syncConfigToBackend(showFeedbackToast ? 'Seluruh hasil voting berhasil disinkronkan ke Database!' : '', function () {
        setVoteDbSyncIndicator('Tersinkronisasi dengan Database (LIVE)', false);
    });
}

function syncVotesWithDatabase(showFeedbackToast) {
    if (showFeedbackToast) {
        showToast('Menyinkronkan hasil voting dengan Database Google Sheets...');
    }
    setVoteDbSyncIndicator('Menyinkronkan dengan Database...', true);

    // Pastikan seluruh vote lokal di-push terlebih dahulu, lalu tarik data terbaru dari server
    pushAllVotesToDatabase(false);

    callBackendApi('getInitialAppBundle', {}, function (res) {
        if (res && res.status === 'success') {
            if (res.events) {
                unpackEventBgMusicDbSync(res.events);
                APP_STATE.events = res.events;
            }
            if (res.config) {
                res.config.customFooter = unpackCustomFooterAndRestoreDbSync(res.config.customFooter, res.config);
                APP_STATE.config = mergeServerConfigWithLocalExt(res.config);
            }
        }
        reloadGalleryFeed(true);
        setVoteDbSyncIndicator('Tersinkronisasi dengan Database (LIVE)', false);
        if (showFeedbackToast) {
            showToast('Hasil voting berhasil disinkronkan dengan Database & ditampilkan!');
        }
    }, function () {
        reloadGalleryFeed(true);
        setVoteDbSyncIndicator('Mode Lokal Aktif', false);
    });
}

// HELPER: NORMALISASI URL LOGO & GOOGLE DRIVE
function extractDriveFolderIdClient(urlOrId) {
    if (!urlOrId) return '';
    var raw = String(urlOrId).trim();
    var m1 = raw.match(/\/folders\/([a-zA-Z0-9_-]{10,})/);
    if (m1 && m1[1]) return m1[1];
    var m2 = raw.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
    if (m2 && m2[1]) return m2[1];
    var m3 = raw.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
    if (m3 && m3[1]) return m3[1];
    if (/^[a-zA-Z0-9_-]{10,}$/.test(raw) && raw.indexOf('http') === -1) return raw;
    return '';
}

function buildGoogleDriveFolderUrl(folderId, folderUrl) {
    var idFromUrl = extractDriveFolderIdClient(folderUrl);
    var idFromField = extractDriveFolderIdClient(folderId);
    var finalId = idFromUrl || idFromField;
    if (finalId) {
        return 'https://drive.google.com/drive/folders/' + finalId;
    }
    if (folderUrl && String(folderUrl).trim().indexOf('http') === 0) {
        return String(folderUrl).trim();
    }
    return 'https://drive.google.com';
}

function resolveLogoImageUrl(rawUrl) {
    if (!rawUrl || !String(rawUrl).trim()) {
        return RUNWAY_DEFAULT_LOGO_SVG;
    }
    var clean = String(rawUrl).trim();
    var driveId = extractDriveFolderIdClient(clean);
    if (driveId && clean.indexOf('drive.google.com') !== -1) {
        return 'https://drive.google.com/thumbnail?id=' + driveId + '&sz=w1920';
    }
    return clean;
}

// INISIALISASI SAAT HALAMAN DIMUAT (AUTO RESET VIEWPORT ZOOM 100%)
function resetPageZoomToInitial() {
    var vpMeta = document.querySelector('meta[name="viewport"]');
    if (vpMeta) {
        vpMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
    }
    try {
        if (document.documentElement) {
            document.documentElement.style.zoom = '100%';
        }
        if (document.body) {
            document.body.style.zoom = '100%';
        }
    } catch (e) { }
    window.scrollTo(0, 0);
}

window.addEventListener('pageshow', function () {
    resetPageZoomToInitial();
});

window.addEventListener('DOMContentLoaded', function () {
    resetPageZoomToInitial();
    getOrCreateDeviceId();

    // Pulihkan nama tamu terakhir jika ada agar tidak perlu mengetik ulang saat ambil foto beruntun
    var savedGuestUploader = localStorage.getItem('SATUALBUM_LAST_UPLOADER_NAME');
    var uploaderInput = document.getElementById('uploadUploaderName');
    if (savedGuestUploader && uploaderInput) {
        uploaderInput.value = savedGuestUploader;
    }

    // Cek parameter ?event=EVT-xxxx dari Barcode Undangan atau URL
    var urlParams = new URLSearchParams(window.location.search);
    var qrEventId = urlParams.get('event');
    if (qrEventId) {
        APP_STATE.activeEventId = qrEventId;
        localStorage.setItem('SATUALBUM_LOCKED_EVENT_ID', qrEventId);
    } else {
        var lockedEv = localStorage.getItem('SATUALBUM_LOCKED_EVENT_ID');
        if (lockedEv) APP_STATE.activeEventId = lockedEv;
    }

    var remoteParam = urlParams.get('backend') || urlParams.get('api') || urlParams.get('gas');
    if (remoteParam && remoteParam.indexOf('https://script.google.com') === 0) {
        APP_STATE.remoteGasUrl = remoteParam;
        localStorage.setItem('SATUALBUM_REMOTE_GAS_URL', remoteParam);
    }

    // INSTANT CACHE RENDER (STALE-WHILE-REVALIDATE): Muat cache event lokal seketika
    try {
        var cachedEventsRaw = localStorage.getItem('SATUALBUM_EVENTS_CACHE');
        if (cachedEventsRaw) {
            var parsedEvents = JSON.parse(cachedEventsRaw);
            if (Array.isArray(parsedEvents) && parsedEvents.length > 0) {
                APP_STATE.events = parsedEvents;
            }
        }
    } catch (eCache) { }

    if (!APP_STATE.events || APP_STATE.events.length === 0) {
        APP_STATE.events = MOCK_INITIAL_BUNDLE.events.slice();
    }

    // Muat cache user seketika agar tabel manajemen user tidak kosong
    try {
        var cachedUsersRaw = localStorage.getItem('SATUALBUM_USERS_CACHE');
        if (cachedUsersRaw) {
            var parsedUsers = JSON.parse(cachedUsersRaw);
            if (Array.isArray(parsedUsers) && parsedUsers.length > 0) {
                APP_STATE.users = parsedUsers;
            }
        }
    } catch (eUCache) { }

    if (!APP_STATE.users || APP_STATE.users.length === 0) {
        APP_STATE.users = (MOCK_INITIAL_BUNDLE.users || []).slice();
    }

    // Muat cache galeri foto seketika agar galeri foto langsung terisi
    try {
        var cachedPhotosRaw = localStorage.getItem('SATUALBUM_PHOTOS_CACHE');
        if (cachedPhotosRaw) {
            var parsedPhotos = JSON.parse(cachedPhotosRaw);
            if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
                APP_STATE.allEventPhotos = parsedPhotos;
                APP_STATE.photos = parsedPhotos.filter(function (p) {
                    return !p.eventId || p.eventId === 'ALL' || p.eventId === APP_STATE.activeEventId;
                });
            }
        }
    } catch (ePCache) { }

    if (!APP_STATE.allEventPhotos || APP_STATE.allEventPhotos.length === 0) {
        APP_STATE.allEventPhotos = (MOCK_INITIAL_BUNDLE.photos || []).slice();
        APP_STATE.photos = APP_STATE.allEventPhotos.filter(function (p) {
            return !p.eventId || p.eventId === 'ALL' || p.eventId === APP_STATE.activeEventId;
        });
    }

    // Muat cache konfigurasi lanjutan sebelum jaringan selesai
    var extCache = loadExtendedConfigCache();
    if (extCache) {
        if (extCache.eventSettingsMap && typeof extCache.eventSettingsMap === 'object') {
            APP_STATE.eventSettingsMap = extCache.eventSettingsMap;
        }
        if (extCache.uploadLimits) APP_STATE.config.uploadLimits = extCache.uploadLimits;
        if (extCache.frameConfig) APP_STATE.config.frameConfig = extCache.frameConfig;
        if (extCache.voteCategories && extCache.voteCategories.length > 0) {
            APP_STATE.config.voteCategories = extCache.voteCategories;
        }
        if (extCache.photoCategories && extCache.photoCategories.length > 0) {
            APP_STATE.config.photoCategories = extCache.photoCategories;
        }
        if (extCache.deviceQuotaMap && typeof extCache.deviceQuotaMap === 'object') {
            APP_STATE.deviceQuotaMap = extCache.deviceQuotaMap;
        }
        if (Array.isArray(extCache.deviceLogs)) {
            APP_STATE.deviceLogs = extCache.deviceLogs;
        }
        if (extCache.eventDriveConfigMap && typeof extCache.eventDriveConfigMap === 'object') {
            APP_STATE.eventDriveConfigMap = extCache.eventDriveConfigMap;
        }
        if (extCache.woLogoUrl && !APP_STATE.config.woLogoUrl) {
            APP_STATE.config.woLogoUrl = extCache.woLogoUrl;
        }
    }
    var savedCustomLogoLocal = localStorage.getItem('SATUALBUM_CUSTOM_WO_LOGO');
    if (savedCustomLogoLocal && !APP_STATE.config.woLogoUrl) {
        APP_STATE.config.woLogoUrl = savedCustomLogoLocal;
    }

    // 1. Pulihkan sesi login admin terlebih dahulu agar status login aktif seketika
    checkAdminIdleSession();
    setInterval(checkAdminIdleSession, 5000);

    // 2. Tampilkan UI awal secara instan dari cache
    if (APP_STATE.events && APP_STATE.events.length > 0) {
        loadActiveEventScopedSettings(APP_STATE.activeEventId);
        executeUiUpdates();
    }

    applyRoleBasedAdminView();

    // Pulihkan tab terakhir dari hash URL, sessionStorage, atau localStorage
    var hashView = (window.location.hash || '').replace('#', '').trim();
    var lastView = hashView || sessionStorage.getItem('SATUALBUM_LAST_VIEW') || localStorage.getItem('SATUALBUM_LAST_VIEW') || 'camera';
    if (document.getElementById('viewPanel-' + lastView)) {
        switchMainView(lastView);
    } else {
        switchMainView('camera');
    }

    var lastVoteSub = localStorage.getItem('SATUALBUM_LAST_VOTE_SUBTAB');
    if (lastVoteSub === 'leaderboard' || lastVoteSub === 'gallery') {
        switchVoteTab(lastVoteSub);
    }

    var lastAdminSub = localStorage.getItem('SATUALBUM_LAST_ADMIN_SUBTAB');
    if (lastAdminSub && document.getElementById('adminTabBtn-' + lastAdminSub)) {
        switchAdminSubTab(lastAdminSub, document.getElementById('adminTabBtn-' + lastAdminSub));
    }

    // Sinkronisasi data server di latar belakang
    loadInitialApplicationData();
});

function getConfiguredIdleTimeoutMinutes() {
    var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || {};
    if (lim.idleTimeoutMinutes !== undefined) {
        var parsed = parseInt(lim.idleTimeoutMinutes, 10);
        if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    var cachedIdle = localStorage.getItem('SATUALBUM_IDLE_TIMEOUT_MIN');
    if (cachedIdle !== null) {
        var cVal = parseInt(cachedIdle, 10);
        if (!isNaN(cVal) && cVal >= 0) return cVal;
    }
    return 60;
}

function checkAdminIdleSession() {
    var sessionJson = null;
    try { sessionJson = localStorage.getItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
    if (!sessionJson) {
        try { sessionJson = sessionStorage.getItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
    }

    if (!sessionJson) {
        if (APP_STATE.currentUser) {
            APP_STATE.currentUser = null;
            applyRoleBasedAdminView();
        }
        return;
    }

    try {
        var sess = JSON.parse(sessionJson);
        var user = sess.user || (sess.userId ? sess : null);
        if (!user || !user.userId) {
            try { localStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
            try { sessionStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
            if (APP_STATE.currentUser) {
                APP_STATE.currentUser = null;
                applyRoleBasedAdminView();
            }
            return;
        }

        var idleMinutes = getConfiguredIdleTimeoutMinutes();
        var nowTime = new Date().getTime();
        var sessTime = (typeof sess.timestamp === 'number' && sess.timestamp > 0) ? sess.timestamp : nowTime;

        if (idleMinutes > 0) {
            var timeoutMs = idleMinutes * 60 * 1000;
            if (nowTime - sessTime > timeoutMs) {
                try { localStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
                try { sessionStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
                APP_STATE.currentUser = null;
                applyRoleBasedAdminView();
                showToast('Sesi login admin berakhir karena tidak ada aktivitas selama ' + idleMinutes + ' menit. Silakan login kembali.', true);
                return;
            }
        }

        // Perbarui timestamp agar sesi tetap segar saat halaman direfresh
        sess.timestamp = nowTime;
        sess.user = user;
        var refreshedJson = JSON.stringify(sess);
        try { localStorage.setItem('SATUALBUM_ADMIN_SESSION', refreshedJson); } catch (e) { }
        try { sessionStorage.setItem('SATUALBUM_ADMIN_SESSION', refreshedJson); } catch (e) { }

        var wasNull = !APP_STATE.currentUser;
        APP_STATE.currentUser = user;
        if (wasNull && APP_STATE.currentUser) {
            applyRoleBasedAdminView();
        }
    } catch (err) {
        try { localStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
        try { sessionStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
        if (APP_STATE.currentUser) {
            APP_STATE.currentUser = null;
            applyRoleBasedAdminView();
        }
    }
}

function refreshAdminActivityTimestamp() {
    if (APP_STATE.currentUser) {
        var nowTime = new Date().getTime();
        var sessData = JSON.stringify({
            user: APP_STATE.currentUser,
            timestamp: nowTime
        });
        try { localStorage.setItem('SATUALBUM_ADMIN_SESSION', sessData); } catch (e) { }
        try { sessionStorage.setItem('SATUALBUM_ADMIN_SESSION', sessData); } catch (e) { }
    }
}

document.addEventListener('click', refreshAdminActivityTimestamp);
document.addEventListener('keydown', refreshAdminActivityTimestamp);
document.addEventListener('touchstart', refreshAdminActivityTimestamp, { passive: true });

function mergeServerConfigWithLocalExt(serverCfg) {
    var extCache = loadExtendedConfigCache() || {};
    var merged = serverCfg || APP_STATE.config;

    if (!Array.isArray(merged.voteCategories) || merged.voteCategories.length === 0) {
        merged.voteCategories = extCache.voteCategories || MOCK_INITIAL_BUNDLE.config.voteCategories;
    }

    if (!Array.isArray(merged.photoCategories) || merged.photoCategories.length === 0) {
        merged.photoCategories = extCache.photoCategories || MOCK_INITIAL_BUNDLE.config.photoCategories || [
            { name: 'Selfie Tamu', icon: '🤳' },
            { name: 'Momen Pengantin', icon: '💍' },
            { name: 'Best Grup', icon: '👯' },
            { name: 'Candid Acara', icon: '📸' },
            { name: 'Keluarga & VIP', icon: '👨‍👩‍👧‍👦' }
        ];
    }

    if (!merged.uploadLimits || typeof merged.uploadLimits !== 'object') {
        merged.uploadLimits = extCache.uploadLimits || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 };
    } else if (extCache.uploadLimits && extCache.uploadLimits._updatedAt && (!merged.uploadLimits._updatedAt || extCache.uploadLimits._updatedAt > merged.uploadLimits._updatedAt)) {
        merged.uploadLimits = extCache.uploadLimits;
    }

    var defaultFrame = {
        style: 'royal_wedding_floral',
        textMode: 'default',
        primaryColor: '#f5c542',
        accentColor: '#00ffaa',
        titleColor: '#f5c542',
        customHeaderTitle: '',
        customGreetingText: 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
        customFooterText: 'Runway Wedding Organizer',
        customOverlayUrl: '',
        votesLedger: {}
    };

    if (!merged.frameConfig || typeof merged.frameConfig !== 'object') {
        merged.frameConfig = extCache.frameConfig || defaultFrame;
    } else {
        // Prioritaskan pengaturan lokal jika baru saja disimpan agar textMode (default/custom/none) & titleColor tidak pernah hilang oleh respon server
        if (extCache.frameConfig && extCache.frameConfig._updatedAt && (!merged.frameConfig._updatedAt || extCache.frameConfig._updatedAt >= merged.frameConfig._updatedAt)) {
            var srvOverlay = merged.frameConfig.customOverlayUrl;
            merged.frameConfig = JSON.parse(JSON.stringify(extCache.frameConfig));
            if (!merged.frameConfig.customOverlayUrl && srvOverlay) {
                merged.frameConfig.customOverlayUrl = srvOverlay;
            }
        } else {
            if (!merged.frameConfig.textMode) {
                merged.frameConfig.textMode = (extCache.frameConfig && extCache.frameConfig.textMode) || 'default';
            }
            if (!merged.frameConfig.titleColor) {
                merged.frameConfig.titleColor = (extCache.frameConfig && extCache.frameConfig.titleColor) || '#f5c542';
            }
        }
        // Pastikan PNG kustom lokal resolusi tinggi tetap terjaga jika tersimpan
        var localHighResPng = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_GLOBAL');
        if (!merged.frameConfig.customOverlayUrl && localHighResPng) {
            merged.frameConfig.customOverlayUrl = localHighResPng;
        }
    }

    return merged;
}

function setLiveSyncIndicator(isLive) {
    var badge = document.getElementById('syncStatusBadge');
    if (!badge) return;
    if (isLive === 'SYNCING...') {
        badge.textContent = 'SYNCING...';
        badge.style.background = 'rgba(0,217,255,0.15)';
        badge.style.color = '#00d9ff';
        badge.style.borderColor = '#00d9ff';
    } else if (isLive) {
        badge.textContent = 'LIVE SYNC';
        badge.style.background = 'rgba(0,255,170,0.15)';
        badge.style.color = 'var(--accent-neon)';
        badge.style.borderColor = 'var(--accent-neon)';
    } else {
        badge.textContent = 'OFFLINE CACHE';
        badge.style.background = 'rgba(245,197,66,0.15)';
        badge.style.color = 'var(--accent-gold)';
        badge.style.borderColor = 'var(--accent-gold)';
    }
}

function useMockDataFallback() {
    APP_STATE.config = mergeServerConfigWithLocalExt(MOCK_INITIAL_BUNDLE.config);
    APP_STATE.events = MOCK_INITIAL_BUNDLE.events.slice();
    if (!APP_STATE.users || APP_STATE.users.length === 0) {
        APP_STATE.users = (MOCK_INITIAL_BUNDLE.users || []).slice();
    }
    if (!APP_STATE.allEventPhotos || APP_STATE.allEventPhotos.length === 0) {
        APP_STATE.allEventPhotos = (MOCK_INITIAL_BUNDLE.photos || []).slice();
        APP_STATE.photos = APP_STATE.allEventPhotos.filter(function (p) {
            return !p.eventId || p.eventId === 'ALL' || p.eventId === APP_STATE.activeEventId;
        });
    }
    setLiveSyncIndicator(false);
}

function loadInitialApplicationData() {
    setLiveSyncIndicator('SYNCING...');

    callBackendApi('getInitialAppBundle', {}, function (res) {
        showLoadingOverlay(false);
        if (res && res.status === 'success') {
            if (res.events && res.events.length > 0) {
                unpackEventBgMusicDbSync(res.events);
                APP_STATE.events = res.events;
                try {
                    localStorage.setItem('SATUALBUM_EVENTS_CACHE', JSON.stringify(res.events));
                } catch (eEv) { }
            }
            if (res.config) {
                res.config.customFooter = unpackCustomFooterAndRestoreDbSync(res.config.customFooter, res.config);
                APP_STATE.config = mergeServerConfigWithLocalExt(res.config);
                try {
                    localStorage.setItem('SATUALBUM_CONFIG_CACHE', JSON.stringify(res.config));
                } catch (eCf) { }
            }
            if (res.users && Array.isArray(res.users) && res.users.length > 0) {
                APP_STATE.users = res.users;
                try {
                    localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(res.users));
                } catch (eU) { }
                if (typeof renderAdminUsersTable === 'function') {
                    renderAdminUsersTable();
                }
            }
            if (res.photos && Array.isArray(res.photos) && res.photos.length > 0) {
                APP_STATE.allEventPhotos = res.photos;
                APP_STATE.photos = res.photos.filter(function (p) {
                    return !p.eventId || p.eventId === 'ALL' || p.eventId === APP_STATE.activeEventId;
                });
                try {
                    localStorage.setItem('SATUALBUM_PHOTOS_CACHE', JSON.stringify(res.photos));
                } catch (eP) { }
                if (typeof renderGalleryGrid === 'function') {
                    renderGalleryGrid();
                }
            }
            if (APP_STATE.events.length > 0) {
                var resolvedActive = resolveEventIdFromInputOrQuery(APP_STATE.activeEventId);
                var exists = false;
                for (var i = 0; i < APP_STATE.events.length; i++) {
                    if (APP_STATE.events[i].eventId === resolvedActive) {
                        APP_STATE.activeEventId = APP_STATE.events[i].eventId;
                        exists = true; break;
                    }
                }
                if (!exists) APP_STATE.activeEventId = APP_STATE.events[0].eventId;
            }
            loadActiveEventScopedSettings(APP_STATE.activeEventId);
            if (APP_STATE.config.uploadLimits && APP_STATE.config.uploadLimits.idleTimeoutMinutes !== undefined) {
                localStorage.setItem('SATUALBUM_IDLE_TIMEOUT_MIN', String(APP_STATE.config.uploadLimits.idleTimeoutMinutes));
            }
            setLiveSyncIndicator(true);
            setVoteDbSyncIndicator('Tersinkronisasi dengan Database (LIVE)', false);
        } else {
            if (APP_STATE.events.length === 0) {
                useMockDataFallback();
            } else {
                setLiveSyncIndicator(false);
            }
        }
        executeUiUpdates();
    }, function () {
        showLoadingOverlay(false);
        // JANGAN timpa data riil dengan mock data jika sudah ada cache
        if (APP_STATE.events.length === 0) {
            useMockDataFallback();
        } else {
            setLiveSyncIndicator(false);
            showToast('Mode offline: Menggunakan data tersimpan terakhir.');
        }
        executeUiUpdates();

        // Re-attempt auto sync after 12s
        setTimeout(function () {
            if (!document.hidden) {
                loadInitialApplicationData();
            }
        }, 12000);
    });
}

function executeUiUpdates() {
    loadActiveEventScopedSettings(APP_STATE.activeEventId);
    if (typeof applyBrandingToDom === 'function') applyBrandingToDom();
    if (typeof populateUploadLimitsFormAdmin === 'function') populateUploadLimitsFormAdmin();
    if (typeof populateFrameConfigFormAdmin === 'function') populateFrameConfigFormAdmin();
    if (typeof renderEventSelectorDropdown === 'function') renderEventSelectorDropdown();
    if (typeof updateActiveEventHeroBanner === 'function') updateActiveEventHeroBanner();
    if (typeof renderPhotoMomentCategoriesUI === 'function') renderPhotoMomentCategoriesUI();
    if (typeof updateAutoRenamePreview === 'function') updateAutoRenamePreview();
    if (typeof renderAdminEventsTable === 'function') renderAdminEventsTable();
    if (typeof renderVoteCategoryPills === 'function') renderVoteCategoryPills();
    if (typeof renderCustomVoteCategoriesAdmin === 'function') renderCustomVoteCategoriesAdmin();
    if (typeof renderAdminDeviceManagementAndLogs === 'function') renderAdminDeviceManagementAndLogs();
    if (typeof renderAdminEventScopeSummary === 'function') renderAdminEventScopeSummary();
    if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();
    if (typeof renderGalleryGrid === 'function') renderGalleryGrid();
    if (typeof reloadGalleryFeed === 'function') reloadGalleryFeed(true);
    if (typeof reloadGuestbookFeed === 'function') reloadGuestbookFeed(true);
    if (APP_STATE.currentUser) {
        if (typeof applyBrandingToDom === 'function') applyBrandingToDom();
        if (typeof populateUploadLimitsFormAdmin === 'function') populateUploadLimitsFormAdmin();
        if (typeof populateFrameConfigFormAdmin === 'function') populateFrameConfigFormAdmin();
        if (typeof renderEventSelectorDropdown === 'function') renderEventSelectorDropdown();
        if (typeof updateActiveEventHeroBanner === 'function') updateActiveEventHeroBanner();
        if (typeof renderPhotoMomentCategoriesUI === 'function') renderPhotoMomentCategoriesUI();
        if (typeof updateAutoRenamePreview === 'function') updateAutoRenamePreview();
        if (typeof renderAdminEventsTable === 'function') renderAdminEventsTable();
        if (typeof renderVoteCategoryPills === 'function') renderVoteCategoryPills();
        if (typeof renderCustomVoteCategoriesAdmin === 'function') renderCustomVoteCategoriesAdmin();
        if (typeof renderAdminDeviceManagementAndLogs === 'function') renderAdminDeviceManagementAndLogs();
        if (typeof renderAdminEventScopeSummary === 'function') renderAdminEventScopeSummary();
        if (typeof reloadGalleryFeed === 'function') reloadGalleryFeed(true);
        if (typeof reloadGuestbookFeed === 'function') reloadGuestbookFeed(true);
        if (typeof renderVoteSection === 'function') renderVoteSection();
        if (typeof renderLiveLeaderboard === 'function') renderLiveLeaderboard();
        if (typeof loadAdminUsersList === 'function') {
            loadAdminUsersList();
        }
    }
}

function applyBrandingToDom() {
    var cfg = APP_STATE.config;
    var headerTitle = document.getElementById('headerAppNameText');
    if (headerTitle) headerTitle.textContent = cfg.appName || 'SatuAlbum';

    var headerSub = document.getElementById('headerWoNameText');
    if (headerSub) headerSub.textContent = cfg.woName || 'Runway Wedding & Event Organizer';

    var customLogoSaved = localStorage.getItem('SATUALBUM_CUSTOM_WO_LOGO') || '';
    var effectiveLogoRaw = cfg.woLogoUrl || customLogoSaved || '';
    var resolvedLogo = resolveLogoImageUrl(effectiveLogoRaw);

    var logoImg = document.getElementById('mainHeaderLogo');
    if (logoImg) {
        logoImg.src = resolvedLogo;
    }
    var adminLoginLogo = document.getElementById('adminLoginLogoImg');
    if (adminLoginLogo) {
        adminLoginLogo.src = resolvedLogo;
    }

    var wmLabel = document.getElementById('cameraWatermarkLabel');
    if (wmLabel) {
        wmLabel.textContent = (cfg.appName || 'SatuAlbum') + ' • ' + (cfg.woName || 'Runway WO');
    }

    var footers = document.querySelectorAll('.footer-text');
    for (var f = 0; f < footers.length; f++) footers[f].textContent = cfg.customFooter || '';

    var contacts = document.querySelectorAll('.footer-contact');
    for (var c = 0; c < contacts.length; c++) contacts[c].textContent = cfg.woContact || '';

    var globalDriveInput = document.getElementById('adminGlobalDriveFolderUrl') || document.getElementById('adminGlobalDriveUrl');
    if (globalDriveInput) {
        globalDriveInput.value = cfg.globalDriveFolderUrl || '';
        var testBtn = document.getElementById('adminMasterDriveTestBtn');
        if (testBtn) {
            if (cfg.globalDriveFolderUrl) {
                testBtn.style.display = 'inline-flex';
                testBtn.href = buildGoogleDriveFolderUrl(cfg.globalDriveFolderId, cfg.globalDriveFolderUrl);
            } else {
                testBtn.style.display = 'none';
            }
        }
    }

    var appNameInput = document.getElementById('adminAppName');
    if (appNameInput) appNameInput.value = cfg.appName || '';
    var appTagInput = document.getElementById('adminAppTagline');
    if (appTagInput) appTagInput.value = cfg.appTagline || '';
    var woNameInput = document.getElementById('adminWoName');
    if (woNameInput) woNameInput.value = cfg.woName || '';
    var woLogoInput = document.getElementById('adminWoLogoUrl');
    if (woLogoInput) {
        if (effectiveLogoRaw.indexOf('data:image') === 0) {
            woLogoInput.value = '[File Custom Logo Aktif]';
        } else {
            woLogoInput.value = effectiveLogoRaw;
        }
    }
    var woContactInput = document.getElementById('adminWoContact');
    if (woContactInput) woContactInput.value = cfg.woContact || '';
    var customFooterInput = document.getElementById('adminCustomFooter');
    if (customFooterInput) customFooterInput.value = cfg.customFooter || '';
    var remoteEndpointInput = document.getElementById('adminRemoteEndpointUrl');
    if (remoteEndpointInput) remoteEndpointInput.value = APP_STATE.remoteGasUrl || '';

    document.title = (cfg.appName || 'SatuAlbum') + ' • ' + (cfg.woName || 'Runway Wedding Organizer');
    applyRoleBasedAdminView();
}

function onAdminLogoUrlInput(val) {
    var clean = String(val || '').trim();
    if (clean.indexOf('[File Custom Logo') === 0) return;
    APP_STATE.uploadedCustomWoLogoDataUrl = '';
    localStorage.removeItem('SATUALBUM_CUSTOM_WO_LOGO');
    APP_STATE.config.woLogoUrl = clean;
    var resolved = resolveLogoImageUrl(clean);
    var logoImg = document.getElementById('mainHeaderLogo');
    if (logoImg) logoImg.src = resolved;
    var adminLoginLogo = document.getElementById('adminLoginLogoImg');
    if (adminLoginLogo) adminLoginLogo.src = resolved;
}

function handleCustomWoLogoUpload(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    var file = inputEl.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
        var rawDataUrl = e.target.result;
        var img = new Image();
        img.onload = function () {
            var canvas = document.createElement('canvas');
            var maxW = 420, maxH = 280;
            var scale = Math.min(maxW / (img.width || 320), maxH / (img.height || 220), 1);
            canvas.width = Math.max(1, Math.round((img.width || 320) * scale));
            canvas.height = Math.max(1, Math.round((img.height || 220) * scale));
            var ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            var compactDataUrl = canvas.toDataURL('image/png');
            if (compactDataUrl.length > 35000) {
                compactDataUrl = canvas.toDataURL('image/webp', 0.86);
            }

            APP_STATE.uploadedCustomWoLogoDataUrl = compactDataUrl;
            APP_STATE.config.woLogoUrl = compactDataUrl;
            try {
                localStorage.setItem('SATUALBUM_CUSTOM_WO_LOGO', compactDataUrl);
            } catch (err) { }

            var woLogoInput = document.getElementById('adminWoLogoUrl');
            if (woLogoInput) woLogoInput.value = '[File Custom Logo Aktif: ' + file.name + ']';
            applyBrandingToDom();
            showToast('Custom Logo berhasil dimuat untuk Header & Login Admin! Klik Simpan Branding untuk menyinkronkan.');
        };
        img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
}

function resetToRunwayLogo() {
    var woLogoInput = document.getElementById('adminWoLogoUrl');
    if (woLogoInput) woLogoInput.value = '';
    var fileInput = document.getElementById('adminCustomLogoFileInput');
    if (fileInput) fileInput.value = '';
    APP_STATE.uploadedCustomWoLogoDataUrl = '';
    APP_STATE.config.woLogoUrl = '';
    localStorage.removeItem('SATUALBUM_CUSTOM_WO_LOGO');
    applyBrandingToDom();
    showToast('Logo direset ke Logo Resmi Runway Wedding Organizer. Klik Simpan untuk menyinkronkan.');
}

function applyRoleBasedAdminView() {
    var badgeEl = document.getElementById('adminUserRoleBadge');
    var idleLabelEl = document.getElementById('adminIdleStatusLabel');
    var containerEl = document.getElementById('adminLoggedInContainer');
    var loginBoxEl = document.getElementById('adminLoginBox');
    var heroAdminBtns = document.getElementById('heroAdminActionGroup');

    var idleMin = getConfiguredIdleTimeoutMinutes();
    if (idleLabelEl) {
        idleLabelEl.textContent = 'Login Aktif (Idle Timeout: ' + (idleMin === 0 ? 'Unlimited' : (idleMin + ' Menit')) + '):';
    }

    var headerLoginBtn = document.getElementById('headerLoginBtn');
    var headerCapsule = document.getElementById('headerUserSessionCapsule');
    var headerName = document.getElementById('headerUserName');
    var headerRole = document.getElementById('headerUserRole');
    var headerAvatar = document.getElementById('headerUserAvatar');
    var fullNameBadge = document.getElementById('adminUserFullNameBadge');

    if (APP_STATE.currentUser) {
        if (loginBoxEl) loginBoxEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'block';
        if (heroAdminBtns) heroAdminBtns.style.display = 'inline-flex';
        if (badgeEl) badgeEl.textContent = APP_STATE.currentUser.roleLevel;
        if (fullNameBadge) fullNameBadge.textContent = APP_STATE.currentUser.fullName || APP_STATE.currentUser.username;

        // Tampilkan bilah tempat penyimpanan galeri Google Drive khusus untuk kru/admin yang login
        var galleryStoragePills = document.querySelectorAll('.gallery-storage-pill');
        for (var gp = 0; gp < galleryStoragePills.length; gp++) {
            galleryStoragePills[gp].style.display = 'flex';
        }

        if (headerLoginBtn) headerLoginBtn.style.display = 'none';
        if (headerCapsule) {
            headerCapsule.style.display = 'inline-flex';
            if (headerName) headerName.textContent = APP_STATE.currentUser.fullName || APP_STATE.currentUser.username;
            if (headerRole) headerRole.textContent = APP_STATE.currentUser.roleLevel || 'Crew';
            if (headerAvatar) {
                var initial = (APP_STATE.currentUser.fullName || APP_STATE.currentUser.username || 'U').charAt(0).toUpperCase();
                headerAvatar.textContent = initial;
            }
        }

        var role = APP_STATE.currentUser.roleLevel;
        var tabDrive = document.getElementById('adminTabBtn-driveEvents');
        var tabFrame = document.getElementById('adminTabBtn-frameStudio');
        var tabQuota = document.getElementById('adminTabBtn-quotaDevices');
        var tabMod = document.getElementById('adminTabBtn-mod');
        var tabSystem = document.getElementById('adminTabBtn-systemConfig');
        var tabProfile = document.getElementById('adminTabBtn-accountProfile');
        // Tab 6 Ganti Password disembunyikan secara bawaan agar bar menu tetap bersih 5 tab
        if (tabProfile) tabProfile.style.display = 'none';

        if (role === 'Operator') {
            if (tabDrive) tabDrive.style.display = 'none';
            if (tabFrame) tabFrame.style.display = 'none';
            if (tabQuota) tabQuota.style.display = 'inline-flex';
            if (tabMod) tabMod.style.display = 'inline-flex';
            if (tabSystem) tabSystem.style.display = 'none';
            var curOpSub = localStorage.getItem('SATUALBUM_LAST_ADMIN_SUBTAB') || 'mod';
            if (curOpSub !== 'mod' && curOpSub !== 'quotaDevices' && curOpSub !== 'accountProfile') {
                curOpSub = 'mod';
            }
            switchAdminSubTab(curOpSub, document.getElementById('adminTabBtn-' + curOpSub) || tabMod);
        } else if (role === 'Admin Event') {
            if (tabDrive) tabDrive.style.display = 'inline-flex';
            if (tabFrame) tabFrame.style.display = 'inline-flex';
            if (tabQuota) tabQuota.style.display = 'inline-flex';
            if (tabMod) tabMod.style.display = 'inline-flex';
            if (tabSystem) tabSystem.style.display = 'none';
            var curSub = localStorage.getItem('SATUALBUM_LAST_ADMIN_SUBTAB') || 'driveEvents';
            if (curSub === 'systemConfig') curSub = 'driveEvents';
            switchAdminSubTab(curSub, document.getElementById('adminTabBtn-' + curSub) || tabDrive);
        } else {
            if (tabDrive) tabDrive.style.display = 'inline-flex';
            if (tabFrame) tabFrame.style.display = 'inline-flex';
            if (tabQuota) tabQuota.style.display = 'inline-flex';
            if (tabMod) tabMod.style.display = 'inline-flex';
            if (tabSystem) tabSystem.style.display = 'inline-flex';
            var lastSub = localStorage.getItem('SATUALBUM_LAST_ADMIN_SUBTAB') || 'driveEvents';
            switchAdminSubTab(lastSub, document.getElementById('adminTabBtn-' + lastSub) || tabDrive);
        }
        renderEventSelectorDropdown();
        if (typeof populateActiveEventDriveForm === 'function') {
            populateActiveEventDriveForm();
        }
        renderAdminEventsTable();
        if (typeof startAdminSessionHeartbeat === 'function') {
            startAdminSessionHeartbeat();
        }
    } else {
        if (typeof stopAdminSessionHeartbeat === 'function') {
            stopAdminSessionHeartbeat();
        }
        if (headerLoginBtn) headerLoginBtn.style.display = 'inline-flex';
        if (headerCapsule) headerCapsule.style.display = 'none';

        if (loginBoxEl) loginBoxEl.style.display = 'block';
        if (containerEl) containerEl.style.display = 'none';
        if (heroAdminBtns) heroAdminBtns.style.display = 'none';

        // Sembunyikan bilah tempat penyimpanan galeri Google Drive bagi tamu publik yang belum login
        var galleryStoragePillsOff = document.querySelectorAll('.gallery-storage-pill');
        for (var gpo = 0; gpo < galleryStoragePillsOff.length; gpo++) {
            galleryStoragePillsOff[gpo].style.display = 'none';
        }

        renderEventSelectorDropdown();
    }
}

function openVotingLeaderboardResult() {
    switchMainView('awards');
    switchVoteTab('leaderboard');
    var leadEl = document.getElementById('voteSectionLeaderboard');
    if (leadEl && leadEl.scrollIntoView) {
        leadEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function renderEventSelectorDropdown() {
    var selects = document.querySelectorAll('.event-selector-dropdown');
    if (!selects || selects.length === 0) return;
    var html = '';
    for (var i = 0; i < APP_STATE.events.length; i++) {
        var ev = APP_STATE.events[i];
        var dispId = getEventDisplayId(ev);
        var sel = (ev.eventId === APP_STATE.activeEventId) ? ' selected' : '';
        html += '<option value="' + escapeHtml(ev.eventId) + '"' + sel + '>📅 ' + escapeHtml(ev.eventName) + ' (' + escapeHtml(dispId) + ')</option>';
    }
    for (var j = 0; j < selects.length; j++) {
        selects[j].innerHTML = html;
        selects[j].value = APP_STATE.activeEventId;
        if (!APP_STATE.currentUser) {
            selects[j].style.display = 'none';
            selects[j].disabled = true;
        } else {
            selects[j].style.display = 'inline-block';
            selects[j].disabled = false;
            selects[j].title = 'Pilih event aktif (Mode Admin)';
        }
    }
    renderAdminEventScopeSummary();
}

function getFrameStyleReadableLabel(styleKey) {
    var map = {
        'royal_wedding_floral': '💍 Royal Wedding Floral',
        'minimalist_wedding_vow': '🕊️ Minimalist White & Rose',
        'emerald_islamic_walimah': '🌙 Emerald Walimatul Ursy',
        'rustic_botanical': '🌿 Rustic Botanical Garden',
        'gold_luxury': '👑 Gold Luxury Runway',
        'neon_party': '⚡ Neon Cyber Glow',
        'polaroid_classic': '📸 Polaroid Classic',
        'custom_png': '🎨 Custom PNG Overlay'
    };
    return map[styleKey] || '💍 Royal Wedding Floral';
}

function renderAdminEventScopeSummary() {
    var pillsContainer = document.getElementById('adminEventQuickPills');
    var summaryGrid = document.getElementById('adminEventScopeSummaryGrid');
    var copySelect = document.getElementById('adminCopyFromEventSelect');
    var events = APP_STATE.events || [];

    if (pillsContainer) {
        var pillsHtml = '';
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            var isAct = (ev.eventId === APP_STATE.activeEventId);
            var dispId = getEventDisplayId(ev);
            pillsHtml += '<button type="button" class="event-pill-btn' + (isAct ? ' active' : '') + '" onclick="setActiveEventByAdmin(\'' + escapeHtml(ev.eventId) + '\')">';
            pillsHtml += '<i class="fa-solid ' + (isAct ? 'fa-circle-check' : 'fa-calendar-day') + '" style="color:' + (isAct ? 'var(--accent-neon)' : 'var(--accent-gold)') + ';"></i>';
            pillsHtml += '<span>' + escapeHtml(ev.eventName) + '</span>';
            pillsHtml += '<span class="mono-badge" style="font-size:0.65rem; padding:1px 6px; color:' + (isAct ? 'var(--accent-gold)' : 'var(--text-muted)') + ';">' + escapeHtml(dispId) + '</span>';
            pillsHtml += '</button>';
        }
        pillsHtml += '<button type="button" class="event-pill-btn" style="border-style:dashed; color:var(--accent-neon);" onclick="openEventModal()">';
        pillsHtml += '<i class="fa-solid fa-plus"></i> Event Baru</button>';
        pillsContainer.innerHTML = pillsHtml;
    }

    if (copySelect) {
        var copyHtml = '<option value="">-- Pilih Event Sumber --</option>';
        for (var c = 0; c < events.length; c++) {
            if (events[c].eventId !== APP_STATE.activeEventId) {
                copyHtml += '<option value="' + escapeHtml(events[c].eventId) + '">' + escapeHtml(events[c].eventName) + ' (' + escapeHtml(getEventDisplayId(events[c])) + ')</option>';
            }
        }
        copySelect.innerHTML = copyHtml;
    }

    if (summaryGrid) {
        var fCfg = (APP_STATE.config && APP_STATE.config.frameConfig) || {};
        var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || {};
        var photoCats = getNormalizedPhotoCategories();
        var voteCats = getNormalizedVoteCategories();
        var activeSubTab = localStorage.getItem('SATUALBUM_LAST_ADMIN_SUBTAB') || 'driveEvents';

        var frameLabel = getFrameStyleReadableLabel(fCfg.style);
        var textModeLabel = fCfg.textMode === 'none' ? 'Polos Tanpa Teks' : (fCfg.textMode === 'custom' ? 'Teks Kustom' : 'Harmoni Otomatis');
        var maxU = parseInt(lim.maxLiveUsers, 10) || 0;
        var maxP = parseInt(lim.maxUploadsPerUser, 10) || 0;
        var quotaLabel = (maxU === 0 ? 'User: Unl' : ('Max ' + maxU + ' User')) + ' • ' + (maxP === 0 ? 'Foto: Unl' : (maxP + ' Foto/HP'));
        var totalEventPhotos = (APP_STATE.allEventPhotos || []).length;
        var totalGuestbook = (APP_STATE.guestbook || []).length;

        var cardsHtml = '';
        // Kartu 1 -> Menu 1. Event & Drive Acara
        cardsHtml += '<div class="event-scope-card' + (activeSubTab === 'driveEvents' ? ' active-scope-card' : '') + '" onclick="switchAdminSubTab(\'driveEvents\', document.getElementById(\'adminTabBtn-driveEvents\'))" title="Buka Menu 1: Event & Drive Acara">';
        cardsHtml += '<div class="event-scope-card-icon"><i class="fa-solid fa-calendar-check"></i></div>';
        cardsHtml += '<div style="min-width:0;"><div style="font-size:0.66rem; color:var(--accent-neon); font-weight:700;">1. Event & Drive</div>';
        cardsHtml += '<div style="font-size:0.78rem; font-weight:700; color:#fff;">' + photoCats.length + ' Momen • ' + voteCats.length + ' Vote</div>';
        cardsHtml += '<div style="font-size:0.65rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Drive & Kategori Event</div></div></div>';

        // Kartu 2 -> Menu 2. Bingkai Foto
        cardsHtml += '<div class="event-scope-card' + (activeSubTab === 'frameStudio' ? ' active-scope-card' : '') + '" onclick="switchAdminSubTab(\'frameStudio\', document.getElementById(\'adminTabBtn-frameStudio\'))" title="Buka Menu 2: Studio Bingkai Foto">';
        cardsHtml += '<div class="event-scope-card-icon"><i class="fa-solid fa-crop-simple"></i></div>';
        cardsHtml += '<div style="min-width:0;"><div style="font-size:0.66rem; color:var(--accent-neon); font-weight:700;">2. Bingkai Foto</div>';
        cardsHtml += '<div style="font-size:0.78rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(frameLabel) + '</div>';
        cardsHtml += '<div style="font-size:0.65rem; color:var(--text-muted);">Mode: ' + escapeHtml(textModeLabel) + '</div></div></div>';

        // Kartu 3 -> Menu 3. Batas & Kuota
        cardsHtml += '<div class="event-scope-card' + (activeSubTab === 'quotaDevices' ? ' active-scope-card' : '') + '" onclick="switchAdminSubTab(\'quotaDevices\', document.getElementById(\'adminTabBtn-quotaDevices\'))" title="Buka Menu 3: Batas Upload & Kuota Device">';
        cardsHtml += '<div class="event-scope-card-icon" style="color:var(--accent-gold); background:rgba(245,197,66,0.12);"><i class="fa-solid fa-mobile-screen-button"></i></div>';
        cardsHtml += '<div style="min-width:0;"><div style="font-size:0.66rem; color:var(--accent-gold); font-weight:700;">3. Batas & Kuota</div>';
        cardsHtml += '<div style="font-size:0.78rem; font-weight:700; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">' + escapeHtml(quotaLabel) + '</div>';
        cardsHtml += '<div style="font-size:0.65rem; color:var(--text-muted);">Reset & Bonus Kuota HP</div></div></div>';

        // Kartu 4 -> Menu 4. Moderasi Galeri
        cardsHtml += '<div class="event-scope-card' + (activeSubTab === 'mod' ? ' active-scope-card' : '') + '" onclick="switchAdminSubTab(\'mod\', document.getElementById(\'adminTabBtn-mod\'))" title="Buka Menu 4: Moderasi Galeri & Buku Tamu">';
        cardsHtml += '<div class="event-scope-card-icon" style="color:var(--accent-gold); background:rgba(245,197,66,0.12);"><i class="fa-solid fa-list-check"></i></div>';
        cardsHtml += '<div style="min-width:0;"><div style="font-size:0.66rem; color:var(--accent-gold); font-weight:700;">4. Moderasi Galeri</div>';
        cardsHtml += '<div style="font-size:0.78rem; font-weight:700; color:#fff;">' + totalEventPhotos + ' Foto • ' + totalGuestbook + ' Tamu</div>';
        cardsHtml += '<div style="font-size:0.65rem; color:var(--text-muted);">Kelola Foto & Status Tampil</div></div></div>';

        // Kartu 5 -> Menu 5. Branding & Sistem
        cardsHtml += '<div class="event-scope-card' + (activeSubTab === 'systemConfig' ? ' active-scope-card' : '') + '" onclick="switchAdminSubTab(\'systemConfig\', document.getElementById(\'adminTabBtn-systemConfig\'))" title="Buka Menu 5: Branding & Sistem">';
        cardsHtml += '<div class="event-scope-card-icon"><i class="fa-solid fa-gear"></i></div>';
        cardsHtml += '<div style="min-width:0;"><div style="font-size:0.66rem; color:var(--accent-neon); font-weight:700;">5. Branding & Sistem</div>';
        cardsHtml += '<div style="font-size:0.78rem; font-weight:700; color:#fff;">Role, Crew & Sync Server</div>';
        cardsHtml += '<div style="font-size:0.65rem; color:var(--text-muted);">Akun Crew & Endpoint</div></div></div>';

        summaryGrid.innerHTML = cardsHtml;
    }
}

function copyEventSettingsFromOtherEvent() {
    var copySelect = document.getElementById('adminCopyFromEventSelect');
    var sourceEvId = copySelect ? copySelect.value : '';
    if (!sourceEvId) {
        showToast('Pilih Event Sumber yang ingin disalin pengaturannya terlebih dahulu.', true);
        return;
    }
    if (!APP_STATE.eventSettingsMap || !APP_STATE.eventSettingsMap[sourceEvId]) {
        loadActiveEventScopedSettings(sourceEvId);
        loadActiveEventScopedSettings(APP_STATE.activeEventId);
    }
    var sourceSettings = (APP_STATE.eventSettingsMap && APP_STATE.eventSettingsMap[sourceEvId]) || getDefaultEventScopedSettings(sourceEvId);
    var targetEvId = APP_STATE.activeEventId;

    var cloned = JSON.parse(JSON.stringify(sourceSettings));
    cloned._updatedAt = Date.now();
    if (cloned.frameConfig) cloned.frameConfig._updatedAt = Date.now();
    if (cloned.uploadLimits) cloned.uploadLimits._updatedAt = Date.now();
    // Reset log & kuota device agar khusus untuk event target
    cloned.deviceQuotaMap = {};
    cloned.deviceLogs = [];

    var sourcePng = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + sourceEvId);
    if (sourcePng) {
        try {
            localStorage.setItem('SATUALBUM_CUSTOM_FRAME_PNG_' + targetEvId, sourcePng);
        } catch (e) { }
    }

    APP_STATE.eventSettingsMap[targetEvId] = cloned;
    try {
        localStorage.setItem('SATUALBUM_EVENT_SCOPED_' + targetEvId, JSON.stringify(cloned));
    } catch (e) { }

    loadActiveEventScopedSettings(targetEvId);
    populateUploadLimitsFormAdmin();
    populateFrameConfigFormAdmin();
    renderPhotoMomentCategoriesUI();
    renderVoteCategoryPills();
    renderCustomVoteCategoriesAdmin();
    renderAdminDeviceManagementAndLogs();
    renderAdminEventScopeSummary();
    syncConfigToBackend('Pengaturan Bingkai, Kuota & Kategori berhasil disalin ke event ini!');
}

function saveCurrentEventAllSettingsManual() {
    // Ambil nilai terbaru dari form Bingkai & Kuota yang sedang tampil
    if (document.getElementById('adminFrameStyleSelect')) {
        APP_STATE.config.frameConfig = getCurrentAdminFrameConfigFromInputs();
    }
    saveExtendedConfigCache(true);
    renderAdminEventScopeSummary();
    var ev = getActiveEventObject();
    syncConfigToBackend('Seluruh konfigurasi spesifik untuk event "' + (ev ? ev.eventName : APP_STATE.activeEventId) + '" berhasil disimpan & disinkronkan!');
}

function onEventDropdownChange(selectEl) {
    var newId = selectEl.value;
    setActiveEventByAdmin(newId);
}

function setActiveEventByAdmin(eventId) {
    if (!eventId) return;
    // Simpan state event sebelumnya secara utuh
    saveActiveEventScopedSettings(false);

    APP_STATE.activeEventId = eventId;
    localStorage.setItem('SATUALBUM_LOCKED_EVENT_ID', eventId);

    // Sinkronkan URL Address Bar ke event yang dipilih (?event=EVT-XXXX) agar saat di-refresh tidak kembali ke event sebelumnya
    try {
        var currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('event', eventId);
        window.history.replaceState(null, '', currentUrl.toString());
    } catch (eUrl) { }

    // Muat konfigurasi spesifik untuk event yang baru dipilih
    loadActiveEventScopedSettings(eventId);

    var selects = document.querySelectorAll('.event-selector-dropdown');
    for (var i = 0; i < selects.length; i++) selects[i].value = eventId;

    updateActiveEventHeroBanner();
    populateUploadLimitsFormAdmin();
    populateFrameConfigFormAdmin();
    renderPhotoMomentCategoriesUI();
    renderVoteCategoryPills();
    renderCustomVoteCategoriesAdmin();
    renderAdminDeviceManagementAndLogs();
    renderAdminEventScopeSummary();
    if (typeof populateActiveEventDriveForm === 'function') populateActiveEventDriveForm();
    updateAutoRenamePreview();
    renderAdminEventsTable();
    if (typeof updateActiveEventHeroBanner === 'function') updateActiveEventHeroBanner();
    if (typeof populateUploadLimitsFormAdmin === 'function') populateUploadLimitsFormAdmin();
    if (typeof populateFrameConfigFormAdmin === 'function') populateFrameConfigFormAdmin();
    if (typeof renderPhotoMomentCategoriesUI === 'function') renderPhotoMomentCategoriesUI();
    if (typeof renderVoteCategoryPills === 'function') renderVoteCategoryPills();
    if (typeof renderCustomVoteCategoriesAdmin === 'function') renderCustomVoteCategoriesAdmin();
    if (typeof renderAdminDeviceManagementAndLogs === 'function') renderAdminDeviceManagementAndLogs();
    if (typeof renderAdminEventScopeSummary === 'function') renderAdminEventScopeSummary();
    if (typeof updateAutoRenamePreview === 'function') updateAutoRenamePreview();
    if (typeof renderAdminEventsTable === 'function') renderAdminEventsTable();
    if (typeof renderAdminFrameLivePreview === 'function') renderAdminFrameLivePreview();
    if (typeof renderVoteSection === 'function') renderVoteSection();
    if (typeof renderLiveLeaderboard === 'function') renderLiveLeaderboard();
    reloadGalleryFeed(true);
    reloadGuestbookFeed(true);
    if (typeof reloadGalleryFeed === 'function') reloadGalleryFeed(true);
    if (typeof reloadGuestbookFeed === 'function') reloadGuestbookFeed(true);

    var evObj = getActiveEventObject();
    showToast('Berpindah ke Event: ' + (evObj ? evObj.eventName : eventId));
}

function getActiveEventObject() {
    for (var i = 0; i < APP_STATE.events.length; i++) {
        if (APP_STATE.events[i].eventId === APP_STATE.activeEventId) {
            return APP_STATE.events[i];
        }
    }
    return APP_STATE.events[0] || {
        eventId: 'EVT-0001',
        eventName: 'SatuAlbum Event',
        eventDate: '-',
        targetDriveFolderUrl: '',
        targetDriveFolderId: ''
    };
}

function updateActiveEventHeroBanner() {
    var ev = getActiveEventObject();
    var titleEls = document.querySelectorAll('.active-event-title');
    for (var i = 0; i < titleEls.length; i++) titleEls[i].textContent = ev.eventName;

    var dateEls = document.querySelectorAll('.active-event-date');
    for (var j = 0; j < dateEls.length; j++) dateEls[j].textContent = ev.eventDate;

    var edc = (APP_STATE.eventDriveConfigMap && APP_STATE.eventDriveConfigMap[ev.eventId]) || {};
    var masterUrl = edc.masterDriveUrl || ev.masterDriveFolderUrl || APP_STATE.config.globalDriveFolderUrl || '';
    var targetUrl = buildGoogleDriveFolderUrl(ev.targetDriveFolderId, ev.targetDriveFolderUrl || masterUrl);
    var driveBtns = document.querySelectorAll('.active-event-drive-btn');
    for (var k = 0; k < driveBtns.length; k++) {
        driveBtns[k].href = targetUrl;
    }
}

// PERHITUNGAN AKURAT KUOTA PARTISIPAN LIVE PHOTO & KUOTA UPLOAD PER DEVICE/USER
function getEventUploadQuotaStats(candidateUploaderName) {
    var photos = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var myDevId = getOrCreateDeviceId();
    var myPhotosMap = getMyUploadedPhotoIdsForActiveEvent();
    var uploaderInputEl = document.getElementById('uploadUploaderName');
    var currentName = (candidateUploaderName !== undefined ? candidateUploaderName : (uploaderInputEl ? uploaderInputEl.value : '')).trim().toLowerCase();

    var uniqueParticipantsMap = {};
    var uniqueParticipantsCount = 0;
    var myPhotoCountInGallery = 0;

    for (var i = 0; i < photos.length; i++) {
        var p = photos[i];
        if (p.eventId && p.eventId !== APP_STATE.activeEventId) continue;

        var pNameClean = String(p.uploadedBy || '').trim().toLowerCase();
        var pDevClean = String(p.deviceId || '').trim();
        var participantKey = pDevClean || (pNameClean ? ('NAME_' + pNameClean) : ('PHOTO_' + i));

        if (!uniqueParticipantsMap[participantKey]) {
            uniqueParticipantsMap[participantKey] = true;
            uniqueParticipantsCount++;
        }
        if (pNameClean) {
            uniqueParticipantsMap['NAME_' + pNameClean] = true;
        }
        if (pDevClean) {
            uniqueParticipantsMap[pDevClean] = true;
        }

        var isMine = false;
        if (pDevClean && pDevClean === myDevId) isMine = true;
        else if (p.photoId && myPhotosMap[p.photoId]) isMine = true;
        else if (currentName && pNameClean === currentName) isMine = true;

        if (isMine) {
            myPhotoCountInGallery++;
        }
    }

    var localCount = parseInt(localStorage.getItem('SATUALBUM_UPLOAD_COUNT_' + APP_STATE.activeEventId), 10) || 0;
    var rawMyUploads = Math.max(myPhotoCountInGallery, localCount);

    // Cek data manajemen device (Reset Offset & Bonus Kuota)
    var devQuotaInfo = (APP_STATE.deviceQuotaMap && APP_STATE.deviceQuotaMap[myDevId]) || { bonusQuota: 0, resetOffset: 0 };
    if (currentName && APP_STATE.deviceQuotaMap && APP_STATE.deviceQuotaMap['NAME_' + currentName]) {
        var byNameInfo = APP_STATE.deviceQuotaMap['NAME_' + currentName];
        devQuotaInfo = {
            bonusQuota: Math.max(parseInt(devQuotaInfo.bonusQuota, 10) || 0, parseInt(byNameInfo.bonusQuota, 10) || 0),
            resetOffset: Math.max(parseInt(devQuotaInfo.resetOffset, 10) || 0, parseInt(byNameInfo.resetOffset, 10) || 0)
        };
    }

    var resetOffsetVal = parseInt(devQuotaInfo.resetOffset, 10) || 0;
    var bonusQuotaVal = parseInt(devQuotaInfo.bonusQuota, 10) || 0;
    var effectiveMyUploads = Math.max(0, rawMyUploads - resetOffsetVal);

    var isAlreadyParticipant = Boolean(
        uniqueParticipantsMap[myDevId] ||
        (currentName && uniqueParticipantsMap['NAME_' + currentName]) ||
        rawMyUploads > 0
    );

    return {
        uniqueParticipantsCount: uniqueParticipantsCount,
        rawMyUploads: rawMyUploads,
        myUploadCount: effectiveMyUploads,
        bonusQuota: bonusQuotaVal,
        resetOffset: resetOffsetVal,
        isAlreadyParticipant: isAlreadyParticipant
    };
}

function updateHeroCounters() {
    var photos = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var totalVotes = 0;
    for (var i = 0; i < photos.length; i++) {
        totalVotes += (parseInt(photos[i].votes, 10) || 0);
    }

    var quotaStats = getEventUploadQuotaStats();
    var uniqueCount = quotaStats.uniqueParticipantsCount;
    var myUploadCount = quotaStats.myUploadCount;
    var myBonusQuota = quotaStats.bonusQuota || 0;

    var pEl = document.getElementById('heroTotalPhotosCount');
    if (pEl) pEl.textContent = photos.length;
    var vEl = document.getElementById('heroTotalVotesCount');
    if (vEl) vEl.textContent = totalVotes;
    var bEl = document.getElementById('badgeTotalVoteCount');
    if (bEl) bEl.textContent = totalVotes;

    var adminUniqueEl = document.getElementById('adminCurrentUniqueUsersCount');
    if (adminUniqueEl) adminUniqueEl.textContent = uniqueCount;

    var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || { maxLiveUsers: 0, maxUploadsPerUser: 0 };
    var maxUsers = parseInt(lim.maxLiveUsers, 10) || 0;
    var baseMaxPerUser = parseInt(lim.maxUploadsPerUser, 10) || 0;
    var effectiveMaxPerUser = baseMaxPerUser > 0 ? (baseMaxPerUser + myBonusQuota) : 0;

    var quotaBadge = document.getElementById('userQuotaBadgeInfo');
    if (quotaBadge) {
        if (effectiveMaxPerUser > 0) {
            var rem = Math.max(0, effectiveMaxPerUser - myUploadCount);
            var bonusTag = myBonusQuota > 0 ? (' [+' + myBonusQuota + ' Bonus]') : '';
            quotaBadge.textContent = 'Kuota Upload Anda: ' + myUploadCount + ' / ' + effectiveMaxPerUser + ' (Sisa ' + rem + ')' + bonusTag;
            quotaBadge.style.color = rem === 0 ? 'var(--accent-danger)' : 'var(--accent-gold)';
        } else {
            quotaBadge.textContent = 'Kuota Upload: Unlimited (' + quotaStats.rawMyUploads + ' Foto)';
            quotaBadge.style.color = 'var(--accent-gold)';
        }
    }

    var liveUserQuotaText = document.getElementById('cameraLiveUserQuotaText');
    if (liveUserQuotaText) {
        if (maxUsers > 0) {
            var remUsers = Math.max(0, maxUsers - uniqueCount);
            liveUserQuotaText.textContent = uniqueCount + ' / ' + maxUsers + ' User (Sisa ' + remUsers + ')';
            liveUserQuotaText.style.color = (remUsers === 0 && !quotaStats.isAlreadyParticipant) ? 'var(--accent-danger)' : 'var(--accent-neon)';
        } else {
            liveUserQuotaText.textContent = uniqueCount + ' User Aktif (Unlimited)';
            liveUserQuotaText.style.color = 'var(--accent-neon)';
        }
    }

    renderAdminDeviceManagementAndLogs();
}

function resetDeviceUploadQuotaCounter() {
    var myDevId = getOrCreateDeviceId();
    var quotaStats = getEventUploadQuotaStats();
    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
    var cur = APP_STATE.deviceQuotaMap[myDevId] || { bonusQuota: 0, resetOffset: 0 };
    cur.resetOffset = quotaStats.rawMyUploads;
    APP_STATE.deviceQuotaMap[myDevId] = cur;

    localStorage.removeItem('SATUALBUM_UPLOAD_COUNT_' + APP_STATE.activeEventId);
    localStorage.removeItem('SATUALBUM_MY_PHOTOS_' + APP_STATE.activeEventId);
    appendDeviceActivityLog(myDevId, 'Device Ini (Admin)', 'Reset Kuota', 'Kuota upload direset kembali ke 0');
    updateHeroCounters();
    syncConfigToBackend('Hitungan kuota upload pada perangkat ini berhasil direset ke 0.');
}

// =====================================================================
// MANAJEMEN DEVICE (RESET KUOTA, TAMBAH KUOTA FOTO) & LOG DEVICE
// =====================================================================
function collectAllDetectedDevices() {
    var photos = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var map = {};
    var myDevId = getOrCreateDeviceId();
    var savedUploader = localStorage.getItem('SATUALBUM_LAST_UPLOADER_NAME') || 'Perangkat Ini';

    // Pastikan perangkat saat ini selalu terdaftar di tabel manajemen device
    map[myDevId] = {
        deviceId: myDevId,
        userName: savedUploader,
        rawCount: 0,
        lastActive: 'Aktif Sekarang'
    };

    for (var i = 0; i < photos.length; i++) {
        var p = photos[i];
        if (p.eventId && p.eventId !== APP_STATE.activeEventId) continue;
        var dKey = String(p.deviceId || '').trim() || ('NAME_' + String(p.uploadedBy || 'Tamu').trim().toLowerCase());
        if (!map[dKey]) {
            map[dKey] = {
                deviceId: dKey,
                userName: p.uploadedBy || 'Tamu',
                rawCount: 0,
                lastActive: p.uploadedAt || '-'
            };
        }
        map[dKey].rawCount++;
        if (p.uploadedBy) map[dKey].userName = p.uploadedBy;
        if (p.uploadedAt) map[dKey].lastActive = p.uploadedAt;
    }

    var qMap = APP_STATE.deviceQuotaMap || {};
    for (var k in qMap) {
        if (qMap.hasOwnProperty(k) && k) {
            if (!map[k]) {
                map[k] = {
                    deviceId: k,
                    userName: qMap[k].lastUser || 'Tamu Terdaftar',
                    rawCount: 0,
                    lastActive: qMap[k].lastActive || '-'
                };
            } else if (qMap[k].lastUser && map[k].userName === 'Perangkat Ini') {
                map[k].userName = qMap[k].lastUser;
            }
        }
    }

    var result = [];
    for (var dev in map) {
        if (map.hasOwnProperty(dev)) result.push(map[dev]);
    }
    return result;
}

function renderAdminDeviceManagementAndLogs() {
    var tbodyDev = document.getElementById('adminDeviceManagerTableBody');
    var tbodyLog = document.getElementById('adminDeviceLogsTableBody');
    if (!tbodyDev && !tbodyLog) return;

    var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || { maxLiveUsers: 0, maxUploadsPerUser: 0 };
    var baseMaxPerUser = parseInt(lim.maxUploadsPerUser, 10) || 0;
    var myDevId = getOrCreateDeviceId();

    if (tbodyDev) {
        var devices = collectAllDetectedDevices();
        var devHtml = '';
        if (devices.length === 0) {
            devHtml = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Belum ada perangkat yang terdeteksi.</td></tr>';
        } else {
            for (var i = 0; i < devices.length; i++) {
                var d = devices[i];
                var qInfo = (APP_STATE.deviceQuotaMap && APP_STATE.deviceQuotaMap[d.deviceId]) || { bonusQuota: 0, resetOffset: 0 };
                var bonusVal = parseInt(qInfo.bonusQuota, 10) || 0;
                var offsetVal = parseInt(qInfo.resetOffset, 10) || 0;
                var effectiveUsed = Math.max(0, d.rawCount - offsetVal);
                var effectiveMax = baseMaxPerUser > 0 ? (baseMaxPerUser + bonusVal) : 0;
                var isThisDevice = (d.deviceId === myDevId);

                var statusBadgeHtml = '';
                if (effectiveMax > 0) {
                    var rem = Math.max(0, effectiveMax - effectiveUsed);
                    var col = rem === 0 ? 'var(--accent-danger)' : 'var(--accent-neon)';
                    statusBadgeHtml = '<span class="mono-badge" style="color:' + col + '; font-weight:700;">Terpakai: ' + effectiveUsed + ' / ' + effectiveMax + ' (Sisa ' + rem + ')</span>';
                } else {
                    statusBadgeHtml = '<span class="mono-badge" style="color:var(--accent-gold);">Unlimited (' + effectiveUsed + ' Aktif)</span>';
                }

                devHtml += '<tr>';
                devHtml += '<td><span class="mono-badge" style="cursor:pointer;" onclick="selectDeviceIdToInput(\'' + escapeHtml(d.deviceId) + '\')" title="Klik untuk menyalin ke kolom input">' + escapeHtml(d.deviceId) + '</span>' + (isThisDevice ? ' <span class="brand-badge">DEVICE INI</span>' : '') + '</td>';
                devHtml += '<td style="font-weight:700;">' + escapeHtml(d.userName) + '</td>';
                devHtml += '<td>' + d.rawCount + ' Foto</td>';
                devHtml += '<td>' + statusBadgeHtml + '</td>';
                devHtml += '<td><strong style="color:var(--accent-gold);">+' + bonusVal + ' Foto</strong></td>';
                devHtml += '<td style="display:flex; gap:6px; flex-wrap:wrap;">';
                devHtml += '<button type="button" class="btn btn-neon btn-sm" onclick="addBonusQuotaForDevice(\'' + escapeHtml(d.deviceId) + '\', 3, \'' + escapeHtml(d.userName) + '\')" title="Tambah +3 Kuota Foto"><i class="fa-solid fa-plus"></i> 3 Kuota</button>';
                devHtml += '<button type="button" class="btn btn-secondary btn-sm" onclick="addBonusQuotaForDevice(\'' + escapeHtml(d.deviceId) + '\', 1, \'' + escapeHtml(d.userName) + '\')" title="Tambah +1 Kuota Foto">+1</button>';
                devHtml += '<button type="button" class="btn btn-gold btn-sm" onclick="resetQuotaForSpecificDevice(\'' + escapeHtml(d.deviceId) + '\', ' + d.rawCount + ', \'' + escapeHtml(d.userName) + '\')" title="Reset Kuota Terpakai Menjadi 0"><i class="fa-solid fa-rotate-left"></i> Reset Kuota</button>';
                devHtml += '</td></tr>';
            }
        }
        tbodyDev.innerHTML = devHtml;
    }

    if (tbodyLog) {
        var logs = APP_STATE.deviceLogs || [];
        var logHtml = '';
        if (logs.length === 0) {
            logHtml = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada riwayat aktivitas perangkat.</td></tr>';
        } else {
            for (var j = 0; j < logs.length; j++) {
                var lg = logs[j];
                logHtml += '<tr>';
                logHtml += '<td style="font-size:0.72rem; color:var(--text-muted); white-space:nowrap;">' + escapeHtml(lg.t || '-') + '</td>';
                logHtml += '<td><span class="mono-badge">' + escapeHtml(lg.d || '-') + '</span></td>';
                logHtml += '<td style="font-weight:600;">' + escapeHtml(lg.u || '-') + '</td>';
                logHtml += '<td><span style="color:var(--accent-neon); font-weight:700; font-size:0.76rem;">' + escapeHtml(lg.a || '-') + '</span></td>';
                logHtml += '<td style="font-size:0.76rem;">' + escapeHtml(lg.m || '-') + '</td>';
                logHtml += '</tr>';
            }
        }
        tbodyLog.innerHTML = logHtml;
    }
}

function selectDeviceIdToInput(devId) {
    var inp = document.getElementById('adminManualDeviceIdInput');
    if (inp) {
        inp.value = devId;
        inp.focus();
    }
}

function addBonusQuotaForDevice(deviceId, addAmount, userName) {
    if (!deviceId) return;
    var amount = parseInt(addAmount, 10) || 1;
    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
    var cur = APP_STATE.deviceQuotaMap[deviceId] || { bonusQuota: 0, resetOffset: 0, lastUser: userName || 'Tamu' };
    cur.bonusQuota = Math.max(0, (parseInt(cur.bonusQuota, 10) || 0) + amount);
    if (userName) cur.lastUser = userName;
    APP_STATE.deviceQuotaMap[deviceId] = cur;

    appendDeviceActivityLog(deviceId, userName || 'Admin', 'Tambah Kuota (+' + amount + ')', 'Total bonus kuota device: +' + cur.bonusQuota + ' foto');
    updateHeroCounters();
    syncConfigToBackend('Berhasil menambahkan +' + amount + ' kuota foto untuk perangkat ' + deviceId + '!');
}

function resetQuotaForSpecificDevice(deviceId, currentRawCount, userName) {
    if (!deviceId) return;
    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
    var cur = APP_STATE.deviceQuotaMap[deviceId] || { bonusQuota: 0, resetOffset: 0, lastUser: userName || 'Tamu' };
    cur.resetOffset = parseInt(currentRawCount, 10) || 0;
    cur.bonusQuota = 0;
    if (userName) cur.lastUser = userName;
    APP_STATE.deviceQuotaMap[deviceId] = cur;

    if (deviceId === getOrCreateDeviceId()) {
        localStorage.removeItem('SATUALBUM_UPLOAD_COUNT_' + APP_STATE.activeEventId);
    }

    appendDeviceActivityLog(deviceId, userName || 'Admin', 'Reset Kuota Device', 'Kuota terpakai direset kembali ke 0');
    updateHeroCounters();
    syncConfigToBackend('Kuota upload untuk perangkat ' + deviceId + ' berhasil direset menjadi 0!');
}

function addCustomQuotaToDeviceFromInput() {
    var devInp = document.getElementById('adminManualDeviceIdInput');
    var numInp = document.getElementById('adminManualBonusQuotaInput');
    var rawTarget = devInp ? devInp.value.trim() : '';
    var addVal = numInp ? (parseInt(numInp.value, 10) || 1) : 1;
    if (!rawTarget) {
        showToast('Pilih atau ketik ID Device / Nama Tamu terlebih dahulu.', true);
        return;
    }
    var targetKey = rawTarget;
    if (rawTarget.indexOf('DEV-') !== 0 && rawTarget.indexOf('NAME_') !== 0) {
        // Cek apakah cocok dengan nama tamu yang ada
        var devs = collectAllDetectedDevices();
        var matchedDev = null;
        for (var i = 0; i < devs.length; i++) {
            if (devs[i].userName.toLowerCase() === rawTarget.toLowerCase() || devs[i].deviceId.toLowerCase() === rawTarget.toLowerCase()) {
                matchedDev = devs[i];
                break;
            }
        }
        targetKey = matchedDev ? matchedDev.deviceId : ('NAME_' + rawTarget.toLowerCase());
    }
    addBonusQuotaForDevice(targetKey, addVal, rawTarget);
    if (devInp) devInp.value = '';
}

function resetSpecificDeviceQuotaFromInput() {
    var devInp = document.getElementById('adminManualDeviceIdInput');
    var rawTarget = devInp ? devInp.value.trim() : '';
    if (!rawTarget) {
        showToast('Pilih atau ketik ID Device / Nama Tamu yang ingin direset.', true);
        return;
    }
    var devs = collectAllDetectedDevices();
    var foundCount = 0;
    var targetKey = rawTarget;
    for (var i = 0; i < devs.length; i++) {
        if (devs[i].deviceId.toLowerCase() === rawTarget.toLowerCase() || devs[i].userName.toLowerCase() === rawTarget.toLowerCase()) {
            targetKey = devs[i].deviceId;
            foundCount = devs[i].rawCount;
            break;
        }
    }
    resetQuotaForSpecificDevice(targetKey, foundCount, rawTarget);
    if (devInp) devInp.value = '';
}

function resetAllDevicesQuotaAdmin() {
    var devs = collectAllDetectedDevices();
    if (!APP_STATE.deviceQuotaMap) APP_STATE.deviceQuotaMap = {};
    for (var i = 0; i < devs.length; i++) {
        var d = devs[i];
        APP_STATE.deviceQuotaMap[d.deviceId] = {
            bonusQuota: 0,
            resetOffset: d.rawCount,
            lastUser: d.userName,
            lastActive: d.lastActive
        };
    }
    localStorage.removeItem('SATUALBUM_UPLOAD_COUNT_' + APP_STATE.activeEventId);
    appendDeviceActivityLog('ALL-DEVICES', 'Admin', 'Reset Semua Device', 'Seluruh kuota perangkat direset kembali ke 0');
    updateHeroCounters();
    syncConfigToBackend('Seluruh kuota perangkat tamu berhasil direset ke 0!');
}

function clearDeviceActivityLogsAdmin() {
    APP_STATE.deviceLogs = [];
    saveExtendedConfigCache();
    renderAdminDeviceManagementAndLogs();
    syncConfigToBackend('Log aktivitas perangkat berhasil dibersihkan.');
}

// =====================================================================
// KATEGORI MOMEN FOTO (CUSTOM, TAMBAH, EDIT, HAPUS & RESET DEFAULT)
// =====================================================================
function getNormalizedPhotoCategories() {
    var raw = (APP_STATE.config && APP_STATE.config.photoCategories) || [];
    var result = [];
    for (var i = 0; i < raw.length; i++) {
        if (typeof raw[i] === 'string') {
            result.push({ name: raw[i], icon: '📸' });
        } else if (raw[i] && raw[i].name) {
            result.push({ name: String(raw[i].name).trim(), icon: String(raw[i].icon || '📸').trim() });
        }
    }
    if (result.length === 0) {
        result = [
            { name: 'Selfie Tamu', icon: '🤳' },
            { name: 'Momen Pengantin', icon: '💍' },
            { name: 'Best Grup', icon: '👯' },
            { name: 'Candid Acara', icon: '📸' },
            { name: 'Keluarga & VIP', icon: '👨‍👩‍👧‍👦' }
        ];
    }
    return result;
}

function renderPhotoMomentCategoriesUI() {
    var cats = getNormalizedPhotoCategories();

    // 1. Render dropdown #uploadCategorySelect pada form kamera
    var selectEl = document.getElementById('uploadCategorySelect');
    if (selectEl) {
        var prevVal = selectEl.value;
        var optHtml = '';
        var hasPrev = false;
        for (var i = 0; i < cats.length; i++) {
            var c = cats[i];
            if (c.name === prevVal) hasPrev = true;
            optHtml += '<option value="' + escapeHtml(c.name) + '">' + escapeHtml((c.icon ? c.icon + ' ' : '') + c.name) + '</option>';
        }
        selectEl.innerHTML = optHtml;
        if (hasPrev) selectEl.value = prevVal;
    }

    // 2. Render filter pills #galleryCategoryPills pada halaman Galeri Foto
    var pillsEl = document.getElementById('galleryCategoryPills');
    if (pillsEl) {
        var isAllActive = (!APP_STATE.galleryCategory || APP_STATE.galleryCategory === 'ALL');
        var pillsHtml = '<button type="button" class="filter-chip' + (isAllActive ? ' active' : '') + '" onclick="filterGalleryCategoryByIndex(-1, this)">Semua Foto</button>';
        for (var j = 0; j < cats.length; j++) {
            var gc = cats[j];
            var isAct = (APP_STATE.galleryCategory === gc.name) ? ' active' : '';
            pillsHtml += '<button type="button" class="filter-chip' + isAct + '" onclick="filterGalleryCategoryByIndex(' + j + ', this)">' + escapeHtml((gc.icon ? gc.icon + ' ' : '') + gc.name) + '</button>';
        }
        pillsEl.innerHTML = pillsHtml;
    }

    // 3. Render daftar manajemen di Admin Panel (#customPhotoCategoriesList)
    var adminListEl = document.getElementById('customPhotoCategoriesList');
    if (adminListEl) {
        var listHtml = '';
        for (var k = 0; k < cats.length; k++) {
            var item = cats[k];
            listHtml += '<div style="display:flex; justify-content:space-between; align-items:center; gap:8px; background:rgba(255,255,255,0.04); padding:8px 12px; border-radius:10px; border:1px solid var(--border-subtle);">';
            listHtml += '<div><span style="font-size:1rem; margin-right:6px;">' + escapeHtml(item.icon || '📸') + '</span><strong style="font-size:0.86rem; color:var(--accent-neon);">' + escapeHtml(item.name) + '</strong></div>';
            listHtml += '<div style="display:flex; gap:6px;">';
            listHtml += '<button type="button" class="btn btn-secondary btn-sm" onclick="startEditPhotoMomentCategory(' + k + ')" title="Edit Kategori"><i class="fa-solid fa-pen"></i> Edit</button>';
            listHtml += '<button type="button" class="btn btn-danger btn-sm" onclick="removePhotoMomentCategory(' + k + ')" title="Hapus Kategori"><i class="fa-solid fa-trash"></i></button>';
            listHtml += '</div></div>';
        }
        adminListEl.innerHTML = listHtml;
    }
}

function filterGalleryCategoryByIndex(idx, btnEl) {
    var cats = getNormalizedPhotoCategories();
    if (idx < 0 || !cats[idx]) {
        filterGalleryCategory('ALL', btnEl);
    } else {
        filterGalleryCategory(cats[idx].name, btnEl);
    }
}

function addOrUpdatePhotoMomentCategory() {
    var iconInp = document.getElementById('newPhotoCatIconInput');
    var nameInp = document.getElementById('newPhotoCatNameInput');
    var editIdxInp = document.getElementById('editPhotoCatIndexInput');

    var iconVal = iconInp ? iconInp.value.trim() : '📸';
    if (!iconVal) iconVal = '📸';
    var nameVal = nameInp ? nameInp.value.trim() : '';
    var editIdx = editIdxInp ? parseInt(editIdxInp.value, 10) : -1;

    if (!nameVal) {
        showToast('Masukkan Nama Kategori Momen Foto terlebih dahulu.', true);
        if (nameInp) nameInp.focus();
        return;
    }

    var cats = getNormalizedPhotoCategories();
    if (editIdx >= 0 && editIdx < cats.length) {
        cats[editIdx] = { name: nameVal, icon: iconVal };
        APP_STATE.config.photoCategories = cats;
        saveActiveEventScopedSettings(true);
        cancelEditPhotoMomentCategory();
        renderPhotoMomentCategoriesUI();
        renderAdminEventScopeSummary();
        updateAutoRenamePreview();
        syncConfigToBackend('Kategori momen foto untuk event ini berhasil diperbarui!');
    } else {
        cats.push({ name: nameVal, icon: iconVal });
        APP_STATE.config.photoCategories = cats;
        saveActiveEventScopedSettings(true);
        if (iconInp) iconInp.value = '';
        if (nameInp) nameInp.value = '';
        renderPhotoMomentCategoriesUI();
        renderAdminEventScopeSummary();
        updateAutoRenamePreview();
        syncConfigToBackend('Kategori momen foto "' + nameVal + '" berhasil ditambahkan ke event ini!');
    }
}

function startEditPhotoMomentCategory(idx) {
    var cats = getNormalizedPhotoCategories();
    if (!cats[idx]) return;
    var iconInp = document.getElementById('newPhotoCatIconInput');
    var nameInp = document.getElementById('newPhotoCatNameInput');
    var editIdxInp = document.getElementById('editPhotoCatIndexInput');
    var btnSave = document.getElementById('btnSavePhotoMomentCat');
    var btnCancel = document.getElementById('btnCancelEditPhotoMomentCat');

    if (iconInp) iconInp.value = cats[idx].icon || '📸';
    if (nameInp) {
        nameInp.value = cats[idx].name || '';
        nameInp.focus();
    }
    if (editIdxInp) editIdxInp.value = String(idx);
    if (btnSave) btnSave.innerHTML = '<i class="fa-solid fa-check"></i> Simpan Edit';
    if (btnCancel) btnCancel.style.display = 'inline-flex';
}

function cancelEditPhotoMomentCategory() {
    var iconInp = document.getElementById('newPhotoCatIconInput');
    var nameInp = document.getElementById('newPhotoCatNameInput');
    var editIdxInp = document.getElementById('editPhotoCatIndexInput');
    var btnSave = document.getElementById('btnSavePhotoMomentCat');
    var btnCancel = document.getElementById('btnCancelEditPhotoMomentCat');

    if (iconInp) iconInp.value = '';
    if (nameInp) nameInp.value = '';
    if (editIdxInp) editIdxInp.value = '-1';
    if (btnSave) btnSave.innerHTML = '<i class="fa-solid fa-plus"></i> Tambah';
    if (btnCancel) btnCancel.style.display = 'none';
}

function removePhotoMomentCategory(idx) {
    var cats = getNormalizedPhotoCategories();
    if (cats.length <= 1) {
        showToast('Minimal harus terdapat 1 kategori momen foto aktif.', true);
        return;
    }
    var removed = cats.splice(idx, 1);
    APP_STATE.config.photoCategories = cats;
    saveActiveEventScopedSettings(true);
    cancelEditPhotoMomentCategory();
    renderPhotoMomentCategoriesUI();
    renderAdminEventScopeSummary();
    if (typeof populateActiveEventDriveForm === 'function') populateActiveEventDriveForm();
    updateAutoRenamePreview();
    syncConfigToBackend('Kategori momen foto "' + (removed[0] ? removed[0].name : '') + '" dihapus dari event ini.');
}

function resetPhotoMomentCategoriesToDefault() {
    APP_STATE.config.photoCategories = [
        { name: 'Selfie Tamu', icon: '🤳' },
        { name: 'Momen Pengantin', icon: '💍' },
        { name: 'Best Grup', icon: '👯' },
        { name: 'Candid Acara', icon: '📸' },
        { name: 'Keluarga & VIP', icon: '👨‍👩‍👧‍👦' }
    ];
    saveActiveEventScopedSettings(true);
    cancelEditPhotoMomentCategory();
    renderPhotoMomentCategoriesUI();
    renderAdminEventScopeSummary();
    if (typeof populateActiveEventDriveForm === 'function') populateActiveEventDriveForm();
    updateAutoRenamePreview();
    syncConfigToBackend('Kategori momen foto event ini dikembalikan ke pengaturan default.');
}

// KOMUNIKASI API BACKEND (MENDUKUNG GAS INTERNAL & FETCH REMOTE GITHUB PAGES DENGAN TIMEOUT)
function callBackendApi(actionName, payloadObj, onSuccess, onError, timeoutMs) {
    if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run
            .withSuccessHandler(function (res) { if (onSuccess) onSuccess(res); })
            .withFailureHandler(function (err) {
                if (onError) onError(err);
                else showToast('Gagal memproses di server: ' + err, true);
            })[actionName](payloadObj);
        return;
    }

    if (APP_STATE.remoteGasUrl && APP_STATE.remoteGasUrl.indexOf('https://script.google.com') === 0) {
        var controller = null;
        var signal = undefined;
        var timeoutId = null;
        var maxWait = timeoutMs || 12000;

        if (typeof AbortController !== 'undefined') {
            controller = new AbortController();
            signal = controller.signal;
            timeoutId = setTimeout(function () {
                if (controller) controller.abort();
            }, maxWait);
        }

        fetch(APP_STATE.remoteGasUrl, {
            method: 'POST',
            mode: 'cors',
            redirect: 'follow',
            headers: { 'Content-Type': 'text/plain' },
            body: JSON.stringify({ action: actionName, payload: payloadObj }),
            signal: signal
        })
            .then(function (r) {
                if (timeoutId) clearTimeout(timeoutId);
                return r.json();
            })
            .then(function (data) {
                setLiveSyncIndicator(true);
                if (onSuccess) onSuccess(data);
            })
            .catch(function (err) {
                if (timeoutId) clearTimeout(timeoutId);
                setLiveSyncIndicator(false);
                if (onError) onError(err);
            });
        return;
    }

    if (onError) onError(new Error('Simulasi Lokal'));
}

function showLoadingOverlay(show, textMsg) {
    var overlay = document.getElementById('loadingOverlay');
    var txt = document.getElementById('loadingText');
    if (txt && textMsg) txt.textContent = textMsg;
    if (overlay) overlay.style.display = show ? 'flex' : 'none';
}

function showToast(msg, isError) {
    if (!msg) return;
    var container = document.getElementById('toastContainer');
    if (!container) return;
    var toast = document.createElement('div');
    toast.className = 'toast-msg' + (isError ? ' error' : '');
    toast.innerHTML = '<i class="fa-solid ' + (isError ? 'fa-circle-exclamation' : 'fa-circle-check') + '" style="color:' + (isError ? 'var(--accent-danger)' : 'var(--accent-neon)') + ';"></i> <span>' + escapeHtml(msg) + '</span>';
    container.appendChild(toast);
    setTimeout(function () {
        toast.style.opacity = '0';
        setTimeout(function () { toast.remove(); }, 300);
    }, 3400);
}

function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// NAVIGASI UTAMA & AUTO-START LIVE CAMERA
function switchMainView(viewKey) {
    try {
        sessionStorage.setItem('SATUALBUM_LAST_VIEW', viewKey);
        localStorage.setItem('SATUALBUM_LAST_VIEW', viewKey);
        if (window.history && window.history.replaceState) {
            var curHash = '#' + viewKey;
            if (window.location.hash !== curHash) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search + curHash);
            }
        }
    } catch (e) { }

    resetPageZoomToInitial();

    var panels = document.querySelectorAll('.view-panel');
    for (var i = 0; i < panels.length; i++) panels[i].classList.remove('active');

    var targetPanel = document.getElementById('viewPanel-' + viewKey);
    if (targetPanel) targetPanel.classList.add('active');

    var navBtns = document.querySelectorAll('.bottom-nav-btn');
    for (var j = 0; j < navBtns.length; j++) navBtns[j].classList.remove('active');

    var activeNavBtn = document.getElementById('navBtn-' + viewKey);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    if (viewKey === 'camera') {
        if (typeof updateHeroCounters === 'function') updateHeroCounters();
        if (!APP_STATE.cameraStream && !APP_STATE.capturedDataUrl) {
            if (typeof startCameraStream === 'function') startCameraStream(true);
        }
    } else {
        if (typeof stopCameraStream === 'function') stopCameraStream();
    }

    if (viewKey === 'gallery') {
        if (typeof startGalleryAutoPolling === 'function') {
            startGalleryAutoPolling();
        }
    }

    if (viewKey === 'awards') {
        if (typeof renderDeviceVoteStatusBanner === 'function') renderDeviceVoteStatusBanner();
        if (typeof renderVoteCategoryPills === 'function') renderVoteCategoryPills();
        if (typeof mergePhotosWithLocalVoteCache === 'function') {
            APP_STATE.allEventPhotos = mergePhotosWithLocalVoteCache(APP_STATE.allEventPhotos || APP_STATE.photos || []);
            APP_STATE.photos = APP_STATE.allEventPhotos.slice();
        }
        if (typeof renderVoteSection === 'function') renderVoteSection();
        if (typeof renderLiveLeaderboard === 'function') renderLiveLeaderboard();
        if (typeof updateHeroCounters === 'function') updateHeroCounters();
    }

    if (viewKey === 'admin') {
        if (typeof applyRoleBasedAdminView === 'function') applyRoleBasedAdminView();
    }
}
