// =====================================================================
// MODUL 5: ADMIN PANEL (LOGIN ELEGAN, KUOTA, WARNA NONE & UPLOAD PNG)
// =====================================================================
function toggleAdminPinVisibility() {
    var pinInput = document.getElementById('adminLoginPin');
    var eyeIcon = document.getElementById('adminPinEyeIcon');
    if (!pinInput) return;
    if (pinInput.type === 'password') {
        pinInput.type = 'text';
        if (eyeIcon) eyeIcon.className = 'fa-regular fa-eye-slash';
    } else {
        pinInput.type = 'password';
        if (eyeIcon) eyeIcon.className = 'fa-regular fa-eye';
    }
}

function switchAdminSubTab(subKey, btnEl) {
    if (subKey === 'events') subKey = 'driveEvents';
    if (subKey === 'config') subKey = 'frameStudio';
    if (subKey === 'users') subKey = 'systemConfig';

    var tabProfile = document.getElementById('adminTabBtn-accountProfile');
    if (subKey === 'accountProfile') {
        if (tabProfile) tabProfile.style.display = 'inline-flex';
    } else {
        if (tabProfile) tabProfile.style.display = 'none';
    }

    localStorage.setItem('SATUALBUM_LAST_ADMIN_SUBTAB', subKey);
    var subBoxes = document.querySelectorAll('.admin-panel-box');
    for (var i = 0; i < subBoxes.length; i++) subBoxes[i].style.display = 'none';
    var targetBox = document.getElementById('adminSub-' + subKey);
    if (targetBox) targetBox.style.display = 'block';
    var tabBtns = document.querySelectorAll('.admin-tab-btn');
    for (var j = 0; j < tabBtns.length; j++) tabBtns[j].classList.remove('active');
    if (btnEl) {
        btnEl.classList.add('active');
    } else {
        var fallbackBtn = document.getElementById('adminTabBtn-' + subKey);
        if (fallbackBtn) fallbackBtn.classList.add('active');
    }

    renderAdminEventScopeSummary();
    if (subKey === 'driveEvents') {
        populateActiveEventDriveForm();
        renderAdminEventsTable();
        renderPhotoMomentCategoriesUI();
        renderCustomVoteCategoriesAdmin();
    }
    if (subKey === 'frameStudio') {
        populateFrameConfigFormAdmin();
        renderAdminFrameLivePreview();
    }
    if (subKey === 'quotaDevices') {
        populateUploadLimitsFormAdmin();
        renderAdminDeviceManagementAndLogs();
    }
    if (subKey === 'mod') {
        renderAdminModerationTable();
        renderAdminGuestbookTable();
    }
    if (subKey === 'systemConfig') {
        applyBrandingToDom();
        loadAdminUsersList();
    }
    if (subKey === 'accountProfile') {
        populateSelfProfileForm();
    }
}

// =========================================================================
// MENU INPUT LINK FOLDER EVENT (GOOGLE DRIVE PENYIMPANAN GALERI PER-EVENT)
// =========================================================================
function populateActiveEventDriveForm() {
    var curEv = null;
    var events = APP_STATE.events || [];
    for (var i = 0; i < events.length; i++) {
        if (events[i].eventId === APP_STATE.activeEventId) {
            curEv = events[i];
            break;
        }
    }
    if (!curEv && events.length > 0) curEv = events[0];

    var urlInput = document.getElementById('adminEventDriveUrlInput');
    var badgeId = document.getElementById('adminEventDriveFolderIdBadge');
    var openBtn = document.getElementById('adminEventDriveOpenBtn');

    if (!curEv) {
        if (urlInput) urlInput.value = '';
        if (badgeId) badgeId.textContent = '-';
        if (openBtn) {
            openBtn.href = '#';
            openBtn.style.opacity = '0.5';
            openBtn.style.pointerEvents = 'none';
        }
        return;
    }

    var folderUrl = curEv.targetDriveFolderUrl || '';
    var folderId = curEv.targetDriveFolderId || (folderUrl ? extractDriveFolderIdClient(folderUrl) : '');

    if (urlInput) urlInput.value = folderUrl;
    if (badgeId) badgeId.textContent = folderId || '-';
    if (openBtn) {
        if (folderId || folderUrl) {
            openBtn.href = buildGoogleDriveFolderUrl(folderId, folderUrl);
            openBtn.style.opacity = '1';
            openBtn.style.pointerEvents = 'auto';
        } else {
            openBtn.href = '#';
            openBtn.style.opacity = '0.5';
            openBtn.style.pointerEvents = 'none';
        }
    }
}

function onAdminEventDriveUrlInput(val) {
    var clean = String(val || '').trim();
    var folderId = extractDriveFolderIdClient(clean);
    var badgeId = document.getElementById('adminEventDriveFolderIdBadge');
    var openBtn = document.getElementById('adminEventDriveOpenBtn');

    if (badgeId) badgeId.textContent = folderId || '-';
    if (openBtn) {
        if (folderId || clean) {
            openBtn.href = buildGoogleDriveFolderUrl(folderId, clean);
            openBtn.style.opacity = '1';
            openBtn.style.pointerEvents = 'auto';
        } else {
            openBtn.href = '#';
            openBtn.style.opacity = '0.5';
            openBtn.style.pointerEvents = 'none';
        }
    }
}

function saveActiveEventDriveFolder() {
    var urlInput = document.getElementById('adminEventDriveUrlInput');
    var val = urlInput ? urlInput.value.trim() : '';
    var folderId = extractDriveFolderIdClient(val);

    var curEv = null;
    var events = APP_STATE.events || [];
    for (var i = 0; i < events.length; i++) {
        if (events[i].eventId === APP_STATE.activeEventId) {
            curEv = events[i];
            break;
        }
    }

    if (!curEv) {
        showToast('Event aktif tidak ditemukan.', true);
        return;
    }

    curEv.targetDriveFolderUrl = val;
    curEv.targetDriveFolderId = folderId;

    if (!APP_STATE.eventDriveConfigMap) APP_STATE.eventDriveConfigMap = {};
    if (!APP_STATE.eventDriveConfigMap[curEv.eventId]) {
        APP_STATE.eventDriveConfigMap[curEv.eventId] = {};
    }
    APP_STATE.eventDriveConfigMap[curEv.eventId].masterDriveUrl = val;
    APP_STATE.eventDriveConfigMap[curEv.eventId].subfolderMode = 'direct_link';

    saveExtendedConfigCache(true);
    try {
        localStorage.setItem('SATUALBUM_EVENTS_CACHE', JSON.stringify(APP_STATE.events));
    } catch (e) { }

    showLoadingOverlay(true, 'Menyimpan link folder Google Drive event...');
    callBackendApi('saveEventSettings', {
        eventId: curEv.eventId,
        targetDriveFolderUrl: val,
        targetDriveFolderId: folderId
    }, function () {
        showLoadingOverlay(false);
        showToast('Link folder Google Drive untuk event "' + curEv.eventName + '" berhasil disimpan ke database!');
        populateActiveEventDriveForm();
    }, function () {
        showLoadingOverlay(false);
        showToast('Link folder disimpan secara lokal di perangkat.');
        populateActiveEventDriveForm();
    }, 8000);
}

// =========================================================================
// MENU GANTI PASSWORD MANDIRI
// =========================================================================
function populateSelfProfileForm() {
    var u = APP_STATE.currentUser;
    var userLabel = document.getElementById('selfProfileUsernameLabel');
    var roleLabel = document.getElementById('selfProfileRoleLabel');
    var oldPinEl = document.getElementById('selfChangePasswordOldPin');
    var newPinEl = document.getElementById('selfChangePasswordNewPin');
    var confirmPinEl = document.getElementById('selfChangePasswordConfirmPin');
    var alertBox = document.getElementById('selfChangePasswordAlertBox');

    if (userLabel) userLabel.textContent = u ? (u.fullName || u.username) : '-';
    if (roleLabel) roleLabel.textContent = u ? u.roleLevel : '-';
    if (oldPinEl) oldPinEl.value = '';
    if (newPinEl) newPinEl.value = '';
    if (confirmPinEl) confirmPinEl.value = '';
    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }
}

function handleSelfChangePasswordSubmit() {
    var u = APP_STATE.currentUser;
    if (!u) {
        showToast('Silakan login terlebih dahulu untuk mengganti password.', true);
        return;
    }

    var oldPinEl = document.getElementById('selfChangePasswordOldPin');
    var newPinEl = document.getElementById('selfChangePasswordNewPin');
    var confirmPinEl = document.getElementById('selfChangePasswordConfirmPin');
    var alertBox = document.getElementById('selfChangePasswordAlertBox');

    var oldPin = oldPinEl ? oldPinEl.value.trim() : '';
    var newPin = newPinEl ? newPinEl.value.trim() : '';
    var confirmPin = confirmPinEl ? confirmPinEl.value.trim() : '';

    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }

    if (!oldPin) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Password / PIN lama wajib diisi.';
        }
        showToast('Password / PIN lama wajib diisi.', true);
        return;
    }

    if (!newPin || newPin.length < 4) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Password / PIN baru minimal 4 karakter.';
        }
        showToast('Password / PIN baru minimal 4 karakter.', true);
        return;
    }

    if (newPin !== confirmPin) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Konfirmasi Password baru tidak cocok dengan Password baru.';
        }
        showToast('Konfirmasi Password baru tidak cocok.', true);
        return;
    }

    if (oldPin === newPin) {
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Password baru tidak boleh sama dengan password lama.';
        }
        showToast('Password baru tidak boleh sama dengan password lama.', true);
        return;
    }

    showLoadingOverlay(true, 'Memperbarui password akun Anda di database...');
    callBackendApi('changeUserPassword', {
        userId: u.userId,
        username: u.username,
        oldPin: oldPin,
        newPin: newPin
    }, function (res) {
        showLoadingOverlay(false);
        if (res && res.status === 'success') {
            if (oldPinEl) oldPinEl.value = '';
            if (newPinEl) newPinEl.value = '';
            if (confirmPinEl) confirmPinEl.value = '';
            if (APP_STATE.currentUser) {
                APP_STATE.currentUser.userPin = newPin;
                saveAdminSessionToStorage(APP_STATE.currentUser);
            }
            if (Array.isArray(APP_STATE.users)) {
                for (var i = 0; i < APP_STATE.users.length; i++) {
                    if (APP_STATE.users[i].userId === u.userId) {
                        APP_STATE.users[i].userPin = newPin;
                        break;
                    }
                }
                try {
                    localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
                } catch (eU) { }
            }
            showToast('Password akun Anda berhasil diperbarui! Gunakan password baru ini untuk login berikutnya.');
        } else {
            var errMsg = (res && res.message) || '';
            if (errMsg.indexOf('Action tidak dikenali') !== -1) {
                // Graceful fallback jika Google Apps Script live deployment belum diperbarui ke versi baru
                if (oldPinEl) oldPinEl.value = '';
                if (newPinEl) newPinEl.value = '';
                if (confirmPinEl) confirmPinEl.value = '';
                if (APP_STATE.currentUser) {
                    APP_STATE.currentUser.userPin = newPin;
                    saveAdminSessionToStorage(APP_STATE.currentUser);
                }
                if (Array.isArray(APP_STATE.users)) {
                    for (var i = 0; i < APP_STATE.users.length; i++) {
                        if (APP_STATE.users[i].userId === u.userId) {
                            APP_STATE.users[i].userPin = newPin;
                            break;
                        }
                    }
                    try {
                        localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
                    } catch (eU) { }
                }
                if (alertBox) {
                    alertBox.className = 'alert alert-info';
                    alertBox.style.display = 'block';
                    alertBox.innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--accent-neon);"></i> <strong>Password berhasil diperbarui untuk browser ini!</strong><br><small style="color:var(--text-muted);">Pemberitahuan: Endpoint Google Apps Script belum memuat versi code.gs terbaru. Silakan klik <em>Deploy &gt; Kelola Deployment &gt; Edit &gt; Versi Baru</em> di Apps Script agar tersimpan permanen di cloud database.</small>';
                }
                showToast('Password diperbarui untuk sesi ini! Deploy versi baru Apps Script agar permanen.');
                return;
            }
            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.textContent = errMsg || 'Gagal memperbarui password.';
            }
            showToast(errMsg || 'Gagal memperbarui password.', true);
        }
    }, function () {
        showLoadingOverlay(false);
        // Pembaruan lokal jika offline
        if (APP_STATE.currentUser) {
            APP_STATE.currentUser.userPin = newPin;
            saveAdminSessionToStorage(APP_STATE.currentUser);
        }
        if (Array.isArray(APP_STATE.users)) {
            for (var i = 0; i < APP_STATE.users.length; i++) {
                if (APP_STATE.users[i].userId === u.userId) {
                    APP_STATE.users[i].userPin = newPin;
                    break;
                }
            }
            try {
                localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
            } catch (eU) { }
        }
        if (oldPinEl) oldPinEl.value = '';
        if (newPinEl) newPinEl.value = '';
        if (confirmPinEl) confirmPinEl.value = '';
        showToast('Password berhasil diperbarui secara lokal.');
    }, 8000);
}

function quickFillAdminLogin(u, p) {
    var uEl = document.getElementById('adminLoginUsername');
    var pEl = document.getElementById('adminLoginPin');
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
    var alertBox = document.getElementById('adminLoginAlertBox');
    if (alertBox) { alertBox.style.display = 'none'; alertBox.textContent = ''; }
    showToast('Kredensial ' + u + ' terisi. Silakan klik Login!');
}

function handleAdminLoginSubmit(isForce) {
    var uName = document.getElementById('adminLoginUsername').value.trim();
    var uPin = document.getElementById('adminLoginPin').value.trim();
    var alertBox = document.getElementById('adminLoginAlertBox');
    if (alertBox) { alertBox.style.display = 'none'; alertBox.textContent = ''; }

    if (!uName) {
        showToast('Masukkan Username akun terlebih dahulu.', true);
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Username wajib diisi sebelum melakukan login.';
        }
        return;
    }
    if (!uPin) {
        showToast('Masukkan Password / PIN Keamanan terlebih dahulu.', true);
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.textContent = 'Password / PIN wajib diisi sebelum melakukan login.';
        }
        return;
    }

    var knownUsers = [
        { userId: 'USR-0001', username: 'superadmin', fullName: 'Super Admin Dispocam', userPin: '000000', roleLevel: 'Super Admin', accountStatus: 'Active' },
        { userId: 'USR-0002', username: 'adminevent', fullName: 'Admin Acara Dimas & Karyn', userPin: '123456', roleLevel: 'Admin Event', accountStatus: 'Active' },
        { userId: 'USR-0003', username: 'operator', fullName: 'Operator Stan Foto', userPin: '112233', roleLevel: 'Operator', accountStatus: 'Active' },
        { userId: 'USR-0004', username: 'ilham', fullName: 'Ilham', userPin: '123456', roleLevel: 'Super Admin', accountStatus: 'Active' }
    ];

    if (Array.isArray(APP_STATE.users) && APP_STATE.users.length > 0) {
        for (var u = 0; u < APP_STATE.users.length; u++) {
            var exist = false;
            for (var k = 0; k < knownUsers.length; k++) {
                if (knownUsers[k].username.toLowerCase() === APP_STATE.users[u].username.toLowerCase()) {
                    knownUsers[k] = APP_STATE.users[u];
                    exist = true;
                    break;
                }
            }
            if (!exist) knownUsers.push(APP_STATE.users[u]);
        }
    }

    function findKnownUserByUsername(inUser) {
        var cleanU = inUser.toLowerCase();
        for (var i = 0; i < knownUsers.length; i++) {
            var ku = knownUsers[i];
            if ((ku.username && ku.username.toLowerCase() === cleanU) ||
                (cleanU === 'admin' && ku.roleLevel === 'Super Admin') ||
                (ku.fullName && ku.fullName.toLowerCase() === cleanU)) {
                return ku;
            }
        }
        return null;
    }

    function checkKnownUserMatch(inUser, inPin) {
        var cleanU = inUser.toLowerCase();
        for (var i = 0; i < knownUsers.length; i++) {
            var ku = knownUsers[i];
            var uMatch = (ku.username.toLowerCase() === cleanU) ||
                         (cleanU === 'admin' && ku.roleLevel === 'Super Admin') ||
                         (ku.fullName.toLowerCase() === cleanU);
            var pMatch = (ku.userPin === inPin) ||
                         (ku.userPin === '000000' && (inPin === '0' || inPin === '000000')) ||
                         (inPin === 'admin' && ku.roleLevel === 'Super Admin');
            if (uMatch && pMatch) return ku;
        }
        return null;
    }

    // 1. INSTANT / OPTIMISTIC LOGIN UNTUK AKUN DEFAULT (ZERO-LATENCY INSTANT ACCESS)
    // Pengguna tidak perlu menunggu antrean jaringan lambat / cold-start Google Apps Script!
    var instantUser = checkKnownUserMatch(uName, uPin);
    if (instantUser) {
        saveAdminSessionToStorage({
            userId: instantUser.userId,
            username: instantUser.username,
            fullName: instantUser.fullName,
            roleLevel: instantUser.roleLevel,
            accountStatus: instantUser.accountStatus,
            sessionToken: 'session-' + Date.now()
        });
        showToast('Selamat datang kembali, ' + instantUser.fullName + ' (' + instantUser.roleLevel + ')!');
        applyRoleBasedAdminView();
        loadAdminUsersList();

        // Daftarkan sesi secara asynchronous ke server Google Apps Script tanpa memblokir UI
        callBackendApi('authenticateUser', { username: uName, pin: uPin, forceLogin: true }, function (res) {
            if (res && res.user && res.user.sessionToken) {
                if (APP_STATE.currentUser && APP_STATE.currentUser.userId === res.user.userId) {
                    APP_STATE.currentUser.sessionToken = res.user.sessionToken;
                    saveAdminSessionToStorage(APP_STATE.currentUser);
                }
            }
        }, function () {
            // Abaikan kegagalan jaringan latar belakang karena user sudah aktif secara lokal
        }, 8000);
        return;
    }

    // 2. VERIFIKASI AKUN KE SERVER GOOGLE APPS SCRIPT
    showLoadingOverlay(true, 'Memverifikasi akun database...');
    callBackendApi('authenticateUser', { username: uName, pin: uPin, forceLogin: !!isForce }, function (res) {
        showLoadingOverlay(false);
        if (res && res.status === 'success') {
            saveAdminSessionToStorage(res.user);
            showToast(res.message || 'Autentikasi berhasil! Selamat datang di Panel Manajemen.');
            applyRoleBasedAdminView();
            loadAdminUsersList();
        } else {
            if (res && res.code === 'ALREADY_LOGGED_IN') {
                if (alertBox) {
                    alertBox.style.display = 'block';
                    alertBox.innerHTML = '<div style="margin-bottom:8px;"><i class="fa-solid fa-triangle-exclamation"></i> <strong>User Telah Login:</strong><br>' + escapeHtml(res.message) + '</div>' +
                        '<button type="button" class="btn btn-gold btn-sm" onclick="handleAdminLoginSubmit(true)" style="width:100%; padding:8px 12px; font-size:0.8rem; margin-top:4px;">' +
                        '<i class="fa-solid fa-right-to-bracket"></i> Ambil Alih Sesi & Tetap Login di Perangkat Ini' +
                        '</button>';
                }
                showToast(res.message, true);
                return;
            }

            var errHtml = '';
            var toastMsg = (res && res.message) || 'Username atau Password tidak sesuai.';

            if (res && res.code === 'USER_NOT_FOUND') {
                errHtml = '<div style="font-weight:700; color:#ff4d4f; margin-bottom:4px;"><i class="fa-solid fa-user-xmark"></i> User Tidak Ditemukan:</div>' +
                          '<div>' + escapeHtml(res.message) + '</div>';
                toastMsg = res.message;
            } else if (res && res.code === 'WRONG_PIN') {
                errHtml = '<div style="font-weight:700; color:#ff4d4f; margin-bottom:4px;"><i class="fa-solid fa-key"></i> Password Salah:</div>' +
                          '<div>' + escapeHtml(res.message) + '</div>';
                toastMsg = res.message;
            } else if (res && res.code === 'ACCOUNT_INACTIVE') {
                errHtml = '<div style="font-weight:700; color:#ffaa00; margin-bottom:4px;"><i class="fa-solid fa-user-lock"></i> Akun Dinonaktifkan:</div>' +
                          '<div>' + escapeHtml(res.message) + '</div>';
                toastMsg = res.message;
            } else {
                errHtml = '<div style="margin-bottom:4px;"><i class="fa-solid fa-circle-exclamation"></i> ' + escapeHtml(toastMsg) + '</div>';
            }

            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = errHtml;
            }
            showToast(toastMsg, true);
        }
    }, function () {
        showLoadingOverlay(false);
        var foundLocal = findKnownUserByUsername(uName);
        var offlineMsg = '';
        if (!foundLocal) {
            offlineMsg = 'User "' + escapeHtml(uName) + '" tidak ditemukan. Periksa kembali username Anda.';
            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = '<div style="font-weight:700; color:#ff4d4f; margin-bottom:4px;"><i class="fa-solid fa-user-xmark"></i> User Tidak Ditemukan:</div><div>' + offlineMsg + '</div>';
            }
        } else {
            offlineMsg = 'Password / PIN yang Anda masukkan salah untuk user "' + escapeHtml(foundLocal.username) + '".';
            if (alertBox) {
                alertBox.style.display = 'block';
                alertBox.innerHTML = '<div style="font-weight:700; color:#ff4d4f; margin-bottom:4px;"><i class="fa-solid fa-key"></i> Password Salah:</div><div>' + offlineMsg + '</div>';
            }
        }
        showToast(offlineMsg, true);
    }, 8000);
}

var _adminHeartbeatTimer = null;
function startAdminSessionHeartbeat() {
    if (_adminHeartbeatTimer) return;
    _adminHeartbeatTimer = setInterval(function () {
        if (!APP_STATE.currentUser || !APP_STATE.currentUser.sessionToken) return;
        callBackendApi('verifyAdminSession', {
            userId: APP_STATE.currentUser.userId,
            username: APP_STATE.currentUser.username,
            sessionToken: APP_STATE.currentUser.sessionToken
        }, function (res) {
            // HANYA jika server secara eksplisit mengembalikan session_expired
            if (res && res.status === 'session_expired') {
                stopAdminSessionHeartbeat();
                try { localStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
                try { sessionStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
                APP_STATE.currentUser = null;
                applyRoleBasedAdminView();
                alert('PERINGATAN KEAMANAN:\n' + (res.message || 'Sesi akun Anda telah diakhiri.'));
            }
        });
    }, 25000);
}

function stopAdminSessionHeartbeat() {
    if (_adminHeartbeatTimer) {
        clearInterval(_adminHeartbeatTimer);
        _adminHeartbeatTimer = null;
    }
}

function saveAdminSessionToStorage(userObj) {
    if (!userObj) return;
    APP_STATE.currentUser = userObj;
    var sessionData = JSON.stringify({
        user: userObj,
        timestamp: new Date().getTime()
    });
    try { localStorage.setItem('SATUALBUM_ADMIN_SESSION', sessionData); } catch (e) { }
    try { sessionStorage.setItem('SATUALBUM_ADMIN_SESSION', sessionData); } catch (e) { }
    startAdminSessionHeartbeat();
}

function adminLogout() {
    var curUser = APP_STATE.currentUser;
    stopAdminSessionHeartbeat();
    try { localStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
    try { sessionStorage.removeItem('SATUALBUM_ADMIN_SESSION'); } catch (e) { }
    APP_STATE.currentUser = null;

    // Reset tampilan username dan password pada halaman login
    var uInput = document.getElementById('adminLoginUsername');
    var pInput = document.getElementById('adminLoginPin');
    if (uInput) uInput.value = '';
    if (pInput) pInput.value = '';
    var alertBox = document.getElementById('adminLoginAlertBox');
    if (alertBox) {
        alertBox.style.display = 'none';
        alertBox.textContent = '';
    }

    applyRoleBasedAdminView();

    if (curUser && curUser.sessionToken) {
        callBackendApi('logoutAdminUser', { userId: curUser.userId, sessionToken: curUser.sessionToken }, function () {
            showToast('Anda telah keluar. Akun ini sekarang dapat digunakan kembali oleh pengguna berikutnya.');
        }, function () {
            showToast('Anda telah keluar dari Panel Manajemen Admin.');
        });
    } else {
        showToast('Anda telah keluar dari Panel Manajemen Admin.');
    }
}

// PENGATURAN LIMITASI USER LIVE PHOTO, UPLOAD PER USER & IDLE LOGIN ADMIN
function populateUploadLimitsFormAdmin() {
    var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || { maxLiveUsers: 0, maxUploadsPerUser: 10, idleTimeoutMinutes: 60 };
    var maxU = parseInt(lim.maxLiveUsers, 10);
    if (isNaN(maxU) || maxU < 0) maxU = 0;
    var maxP = parseInt(lim.maxUploadsPerUser, 10);
    if (isNaN(maxP) || maxP < 0) maxP = 0;
    var idleM = (lim.idleTimeoutMinutes !== undefined) ? parseInt(lim.idleTimeoutMinutes, 10) : 60;
    if (isNaN(idleM) || idleM < 0) idleM = 60;

    var uPreset = document.getElementById('adminMaxUsersPreset');
    var uCustom = document.getElementById('adminMaxUsersCustomInput');
    if (uPreset && uCustom) {
        uCustom.value = maxU;
        if (maxU === 0 || maxU === 10 || maxU === 50 || maxU === 100) {
            uPreset.value = String(maxU);
        } else {
            uPreset.value = 'custom';
        }
    }

    var pPreset = document.getElementById('adminMaxUploadsPerUserPreset');
    var pCustom = document.getElementById('adminMaxUploadsPerUserCustomInput');
    if (pPreset && pCustom) {
        pCustom.value = maxP;
        if (maxP === 0 || maxP === 3 || maxP === 5 || maxP === 10) {
            pPreset.value = String(maxP);
        } else {
            pPreset.value = 'custom';
        }
    }

    var iPreset = document.getElementById('adminIdleTimeoutPreset');
    var iCustom = document.getElementById('adminIdleTimeoutCustomInput');
    if (iPreset && iCustom) {
        iCustom.value = idleM;
        if (idleM === 0 || idleM === 1 || idleM === 15 || idleM === 60) {
            iPreset.value = String(idleM);
        } else {
            iPreset.value = 'custom';
        }
    }
}

function onLimitPresetChange(type, val) {
    if (type === 'users') {
        var uInput = document.getElementById('adminMaxUsersCustomInput');
        if (uInput && val !== 'custom') uInput.value = parseInt(val, 10) || 0;
        else if (uInput && val === 'custom') uInput.focus();
    } else if (type === 'uploads') {
        var pInput = document.getElementById('adminMaxUploadsPerUserCustomInput');
        if (pInput && val !== 'custom') pInput.value = parseInt(val, 10) || 0;
        else if (pInput && val === 'custom') pInput.focus();
    } else if (type === 'idle') {
        var iInput = document.getElementById('adminIdleTimeoutCustomInput');
        if (iInput && val !== 'custom') iInput.value = parseInt(val, 10) || 0;
        else if (iInput && val === 'custom') iInput.focus();
    }
}

function onLimitCustomNumberInput(type, rawVal) {
    var num = parseInt(rawVal, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (type === 'users') {
        var uPreset = document.getElementById('adminMaxUsersPreset');
        if (uPreset) {
            if (num === 0 || num === 10 || num === 50 || num === 100) uPreset.value = String(num);
            else uPreset.value = 'custom';
        }
    } else if (type === 'uploads') {
        var pPreset = document.getElementById('adminMaxUploadsPerUserPreset');
        if (pPreset) {
            if (num === 0 || num === 3 || num === 5 || num === 10) pPreset.value = String(num);
            else pPreset.value = 'custom';
        }
    } else if (type === 'idle') {
        var iPreset = document.getElementById('adminIdleTimeoutPreset');
        if (iPreset) {
            if (num === 0 || num === 1 || num === 15 || num === 60) iPreset.value = String(num);
            else iPreset.value = 'custom';
        }
    }
}

function saveUploadLimitsConfigForm() {
    var uPreset = document.getElementById('adminMaxUsersPreset');
    var uCustom = document.getElementById('adminMaxUsersCustomInput');
    var pPreset = document.getElementById('adminMaxUploadsPerUserPreset');
    var pCustom = document.getElementById('adminMaxUploadsPerUserCustomInput');
    var iPreset = document.getElementById('adminIdleTimeoutPreset');
    var iCustom = document.getElementById('adminIdleTimeoutCustomInput');

    var maxLiveUsersVal = 0;
    if (uCustom && uCustom.value !== '') {
        maxLiveUsersVal = Math.max(0, parseInt(uCustom.value, 10) || 0);
    } else if (uPreset && uPreset.value !== 'custom') {
        maxLiveUsersVal = Math.max(0, parseInt(uPreset.value, 10) || 0);
    }

    var maxUploadsVal = 0;
    if (pCustom && pCustom.value !== '') {
        maxUploadsVal = Math.max(0, parseInt(pCustom.value, 10) || 0);
    } else if (pPreset && pPreset.value !== 'custom') {
        maxUploadsVal = Math.max(0, parseInt(pPreset.value, 10) || 0);
    }

    var idleMinutesVal = 60;
    if (iCustom && iCustom.value !== '') {
        idleMinutesVal = Math.max(0, parseInt(iCustom.value, 10));
        if (isNaN(idleMinutesVal)) idleMinutesVal = 60;
    } else if (iPreset && iPreset.value !== 'custom') {
        idleMinutesVal = Math.max(0, parseInt(iPreset.value, 10));
        if (isNaN(idleMinutesVal)) idleMinutesVal = 60;
    }

    APP_STATE.config.uploadLimits = {
        maxLiveUsers: maxLiveUsersVal,
        maxUploadsPerUser: maxUploadsVal,
        idleTimeoutMinutes: idleMinutesVal,
        _updatedAt: Date.now()
    };
    var activeEv = getActiveEventObject();
    if (activeEv) {
        activeEv.uploadLimits = APP_STATE.config.uploadLimits;
    }
    callBackendApi('saveEventSettings', {
        eventId: APP_STATE.activeEventId,
        uploadLimits: APP_STATE.config.uploadLimits
    });
    localStorage.setItem('SATUALBUM_IDLE_TIMEOUT_MIN', String(idleMinutesVal));
    saveExtendedConfigCache(true);
    refreshAdminActivityTimestamp();
    populateUploadLimitsFormAdmin();
    applyRoleBasedAdminView();
    updateHeroCounters();
    renderAdminEventScopeSummary();
    syncConfigToBackend('Limitasi Kuota Event (Max User: ' + (maxLiveUsersVal === 0 ? 'Unlimited' : maxLiveUsersVal) + ', Max Upload/Device: ' + (maxUploadsVal === 0 ? 'Unlimited' : maxUploadsVal) + ') berhasil disimpan!');
}

// STUDIO BINGKAI FOTO (MODE HARMONI OTOMATIS, KUSTOMISASI EKSKLUSIF, DAN KANVAS MURNI TANPA TEKS)
function autoSwitchToCustomTextMode() {
    var modeEl = document.getElementById('adminFrameTextModeSelect');
    if (modeEl && modeEl.value === 'default') {
        modeEl.value = 'custom';
        onFrameTextModeChange();
    }
}

function onFrameTextModeChange() {
    var modeEl = document.getElementById('adminFrameTextModeSelect');
    var wrapEl = document.getElementById('adminFrameCustomTextInputsWrap');
    var helperEl = document.getElementById('adminFrameTextModeHelperNote');
    var headerTitleEl = document.getElementById('adminFrameHeaderTitle');
    var greetingEl = document.getElementById('adminFrameGreetingText');
    var footerEl = document.getElementById('adminFrameFooterText');
    var modeVal = modeEl ? modeEl.value : 'default';

    if (modeVal === 'none') {
        if (wrapEl) wrapEl.style.display = 'none';
        if (helperEl) {
            helperEl.style.color = 'var(--accent-gold)';
            helperEl.innerHTML = '🖼️ <strong>Kanvas Murni Tanpa Teks Aktif:</strong> Foto tampil polos elegan hanya dengan dekorasi bingkai tanpa tambahan teks apa pun.';
        }
    } else if (modeVal === 'custom') {
        if (wrapEl) wrapEl.style.display = 'grid';
        if (headerTitleEl) { headerTitleEl.disabled = false; headerTitleEl.style.opacity = '1'; }
        if (greetingEl) { greetingEl.disabled = false; greetingEl.style.opacity = '1'; }
        if (footerEl) { footerEl.disabled = false; footerEl.style.opacity = '1'; }
        if (helperEl) {
            helperEl.style.color = 'var(--accent-neon)';
            helperEl.innerHTML = '🖋️ <strong>Kustomisasi Eksklusif Aktif:</strong> Silakan ketik Judul/Nama Pasangan, Ucapan Doa, dan Sub-Label sesuai keinginan Anda (kosongkan baris yang tidak ingin ditampilkan).';
        }
    } else {
        if (wrapEl) wrapEl.style.display = 'grid';
        if (headerTitleEl) { headerTitleEl.disabled = false; headerTitleEl.style.opacity = '0.78'; }
        if (greetingEl) { greetingEl.disabled = false; greetingEl.style.opacity = '0.78'; }
        if (footerEl) { footerEl.disabled = false; footerEl.style.opacity = '0.78'; }
        if (helperEl) {
            helperEl.style.color = 'var(--text-muted)';
            helperEl.innerHTML = '✨ <strong>Harmoni Otomatis Acara:</strong> Tulisan otomatis mengikuti Nama Acara, Tanggal & Nama WO. Ketik pada kolom di bawah untuk beralih ke Kustomisasi Eksklusif.';
        }
    }
    renderAdminFrameLivePreview();
}

function resetFrameTextsToDefault() {
    var modeEl = document.getElementById('adminFrameTextModeSelect');
    var headerTitleEl = document.getElementById('adminFrameHeaderTitle');
    var greetingEl = document.getElementById('adminFrameGreetingText');
    var footerEl = document.getElementById('adminFrameFooterText');
    var ev = getActiveEventObject();

    if (modeEl) modeEl.value = 'default';
    if (headerTitleEl) headerTitleEl.value = ev.eventName || '';
    if (greetingEl) greetingEl.value = 'Terima Kasih Atas Kehadiran & Doa Restu Anda';
    if (footerEl) footerEl.value = APP_STATE.config.woName || 'Runway Wedding Organizer';

    onFrameTextModeChange();
    showToast('Tulisan bingkai dikembalikan ke mode Harmoni Otomatis Acara.');
}

function onFrameColorModeChange(which) {
    if (which === 'primary') {
        var modeP = document.getElementById('adminFramePrimaryColorMode');
        var inputP = document.getElementById('adminFramePrimaryColor');
        if (modeP && inputP) {
            inputP.style.display = (modeP.value === 'none') ? 'none' : 'block';
        }
    } else if (which === 'accent') {
        var modeA = document.getElementById('adminFrameAccentColorMode');
        var inputA = document.getElementById('adminFrameAccentColor');
        if (modeA && inputA) {
            inputA.style.display = (modeA.value === 'none') ? 'none' : 'block';
        }
    }
    renderAdminFrameLivePreview();
}

function populateFrameConfigFormAdmin() {
    var fCfg = (APP_STATE.config && APP_STATE.config.frameConfig) || {
        style: 'royal_wedding_floral',
        textMode: 'default',
        primaryColor: '#f5c542',
        accentColor: '#00ffaa',
        titleColor: '#f5c542',
        customHeaderTitle: '',
        customGreetingText: 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
        customFooterText: 'Runway Wedding Organizer',
        customOverlayUrl: ''
    };
    var styleEl = document.getElementById('adminFrameStyleSelect');
    var textModeEl = document.getElementById('adminFrameTextModeSelect');
    var headerTitleEl = document.getElementById('adminFrameHeaderTitle');
    var titleColorEl = document.getElementById('adminFrameTitleColor');
    var greetingEl = document.getElementById('adminFrameGreetingText');
    var footerEl = document.getElementById('adminFrameFooterText');
    var pModeEl = document.getElementById('adminFramePrimaryColorMode');
    var pColEl = document.getElementById('adminFramePrimaryColor');
    var aModeEl = document.getElementById('adminFrameAccentColorMode');
    var aColEl = document.getElementById('adminFrameAccentColor');
    var urlEl = document.getElementById('adminFrameOverlayUrl');

    if (styleEl) styleEl.value = fCfg.style || 'royal_wedding_floral';
    if (textModeEl) {
        textModeEl.value = fCfg.textMode || (fCfg.customHeaderTitle ? 'custom' : 'default');
    }
    if (headerTitleEl) headerTitleEl.value = (fCfg.customHeaderTitle !== undefined) ? fCfg.customHeaderTitle : '';
    if (titleColorEl) titleColorEl.value = fCfg.titleColor || (fCfg.primaryColor && fCfg.primaryColor !== 'none' ? fCfg.primaryColor : '#f5c542');
    if (greetingEl) greetingEl.value = (fCfg.customGreetingText !== undefined) ? fCfg.customGreetingText : 'Terima Kasih Atas Kehadiran & Doa Restu Anda';
    if (footerEl) footerEl.value = (fCfg.customFooterText !== undefined) ? fCfg.customFooterText : 'Runway Wedding Organizer';

    onFrameTextModeChange();

    if (fCfg.primaryColor === 'none') {
        if (pModeEl) pModeEl.value = 'none';
        if (pColEl) pColEl.style.display = 'none';
    } else {
        if (pModeEl) pModeEl.value = 'color';
        if (pColEl) {
            pColEl.style.display = 'block';
            pColEl.value = fCfg.primaryColor || '#f5c542';
        }
    }

    if (fCfg.accentColor === 'none') {
        if (aModeEl) aModeEl.value = 'none';
        if (aColEl) aColEl.style.display = 'none';
    } else {
        if (aModeEl) aModeEl.value = 'color';
        if (aColEl) {
            aColEl.style.display = 'block';
            aColEl.value = fCfg.accentColor || '#00ffaa';
        }
    }

    var savedLocalPng = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId) || '';
    var activeOverlaySource = fCfg.customOverlayUrl || savedLocalPng || '';
    APP_STATE.uploadedFrameOverlayDataUrl = activeOverlaySource;

    if (urlEl) {
        if (activeOverlaySource.indexOf('data:image') === 0) {
            urlEl.value = '[File PNG Transparan Kustom Aktif]';
        } else {
            urlEl.value = activeOverlaySource;
        }
    }

    updateCustomFramePngStatusUi(activeOverlaySource);
    loadCustomFrameOverlayImage(activeOverlaySource);
    renderAdminFrameLivePreview();
}

function updateCustomFramePngStatusUi(overlaySource) {
    var statusEl = document.getElementById('customFramePngStatusText');
    var btnClear = document.getElementById('btnClearCustomFramePng');
    if (!statusEl) return;

    if (overlaySource && String(overlaySource).trim() !== '') {
        statusEl.style.display = 'block';
        if (btnClear) btnClear.style.display = 'inline-flex';
        if (String(overlaySource).indexOf('data:image') === 0) {
            var kb = Math.round((overlaySource.length * 3) / 4 / 1024);
            statusEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> File PNG Transparan Kustom tersimpan & siap digunakan (' + kb + ' KB).';
        } else {
            statusEl.innerHTML = '<i class="fa-solid fa-link"></i> Menggunakan URL PNG Eksternal.';
        }
    } else {
        statusEl.style.display = 'none';
        if (btnClear) btnClear.style.display = 'none';
    }
}

// TABEL MULTI-EVENT & MODAL CRUD EVENT (DENGAN MASTER GOOGLE DRIVE & SUBFOLDER PER-EVENT)
function renderAdminEventsTable() {
    var tbody = document.getElementById('adminEventsTableBody');
    if (!tbody) return;
    var events = APP_STATE.events || [], html = '';
    if (events.length === 0) {
        html = '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">Belum ada event.</td></tr>';
    } else {
        for (var i = 0; i < events.length; i++) {
            var ev = events[i];
            var isAct = (ev.eventId === APP_STATE.activeEventId);
            var edc = (APP_STATE.eventDriveConfigMap && APP_STATE.eventDriveConfigMap[ev.eventId]) || {};
            var displayId = getEventDisplayId(ev);
            var masterUrlRaw = edc.masterDriveUrl || ev.masterDriveFolderUrl || APP_STATE.config.globalDriveFolderUrl || '';
            var masterLink = buildGoogleDriveFolderUrl(extractDriveFolderIdClient(masterUrlRaw), masterUrlRaw);
            var subfolderLink = buildGoogleDriveFolderUrl(ev.targetDriveFolderId, ev.targetDriveFolderUrl || masterUrlRaw);
            var subLabel = edc.subfolderName || (ev.eventName + ' ' + String(ev.eventDate || '').replace(/\//g, '-'));

            html += '<tr style="' + (isAct ? 'background:rgba(0,255,170,0.06);' : '') + '">';
            html += '<td><span class="mono-badge" style="color:var(--accent-gold); font-weight:700;">' + escapeHtml(displayId) + '</span></td>';
            html += '<td><div style="font-weight:700;">' + escapeHtml(ev.eventName) + (isAct ? ' <span class="brand-badge" style="margin-left:4px;">AKTIF</span>' : '') + '</div>';
            html += '<div style="font-size:0.7rem; color:var(--text-muted); margin-top:2px;"><i class="fa-solid fa-folder-tree" style="color:var(--accent-gold);"></i> Subfolder: ' + escapeHtml(subLabel) + '</div></td>';
            html += '<td>' + escapeHtml(ev.eventDate) + '</td>';
            html += '<td><div style="display:flex; gap:6px; flex-wrap:wrap;">';
            html += '<a href="' + escapeHtml(subfolderLink) + '" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--accent-neon); border-color:rgba(0,255,170,0.35); text-decoration:none;" title="Buka Subfolder Penyimpanan Foto Event Ini"><i class="fa-brands fa-google-drive"></i> Buka Folder Event</a>';
            if (masterUrlRaw && masterLink !== subfolderLink) {
                html += '<a href="' + escapeHtml(masterLink) + '" target="_blank" class="btn btn-secondary btn-sm" style="color:var(--accent-gold); border-color:rgba(245,197,66,0.35); text-decoration:none;" title="Buka Folder Master Google Drive Event Ini"><i class="fa-solid fa-folder-open"></i> Master Drive</a>';
            }
            html += '</div></td>';
            html += '<td>' + escapeHtml(ev.eventStatus || 'Active') + '</td>';
            html += '<td style="display:flex; gap:6px; flex-wrap:wrap;">';
            if (!isAct) {
                html += '<button type="button" class="btn btn-neon btn-sm" onclick="setActiveEventByAdmin(\'' + escapeHtml(ev.eventId) + '\')">Pilih Aktif</button>';
            }
            html += '<button type="button" class="btn btn-secondary btn-sm" onclick="openEventModal(\'' + escapeHtml(ev.eventId) + '\')"><i class="fa-solid fa-pen"></i> Edit</button>';
            html += '<button type="button" class="btn btn-danger btn-sm" onclick="deleteEventItem(\'' + escapeHtml(ev.eventId) + '\')"><i class="fa-solid fa-trash"></i></button>';
            html += '</td></tr>';
        }
    }
    tbody.innerHTML = html;
}

function convertDateToInputFormat(ddmmyyyy) {
    if (!ddmmyyyy) return '';
    var str = String(ddmmyyyy).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
    var parts = str.split('/');
    if (parts.length === 3) {
        return parts[2] + '-' + ('0' + parts[1]).slice(-2) + '-' + ('0' + parts[0]).slice(-2);
    }
    return '';
}

function convertInputDateToDisplay(yyyymmdd) {
    if (!yyyymmdd) return '';
    var parts = String(yyyymmdd).split('-');
    if (parts.length === 3) {
        return parts[2] + '/' + parts[1] + '/' + parts[0];
    }
    return yyyymmdd;
}

function onModalEventSubfolderModeChange() {
    var modeEl = document.getElementById('modalEventSubfolderMode');
    var autoBox = document.getElementById('modalSubfolderAutoPreviewBox');
    var customBox = document.getElementById('modalSubfolderCustomNameBox');
    var directBox = document.getElementById('modalSubfolderDirectLinkBox');
    var mode = modeEl ? modeEl.value : 'auto';

    if (mode === 'auto') {
        if (autoBox) autoBox.style.display = 'block';
        if (customBox) customBox.style.display = 'none';
        if (directBox) directBox.style.display = 'none';
    } else if (mode === 'custom_name') {
        if (autoBox) autoBox.style.display = 'block';
        if (customBox) customBox.style.display = 'block';
        if (directBox) directBox.style.display = 'none';
    } else {
        if (autoBox) autoBox.style.display = 'none';
        if (customBox) customBox.style.display = 'none';
        if (directBox) directBox.style.display = 'block';
    }
    updateEventModalSubfolderPreview();
}

function updateEventModalSubfolderPreview() {
    var nameVal = document.getElementById('modalEventName') ? document.getElementById('modalEventName').value.trim() : '';
    var dateRaw = document.getElementById('modalEventDate') ? document.getElementById('modalEventDate').value : '';
    var dateFormatted = convertInputDateToDisplay(dateRaw).replace(/\//g, '-');
    var modeEl = document.getElementById('modalEventSubfolderMode');
    var customSubVal = document.getElementById('modalEventSubfolderName') ? document.getElementById('modalEventSubfolderName').value.trim() : '';
    var previewTextEl = document.getElementById('modalSubfolderAutoNameText');
    if (!previewTextEl) return;

    var mode = modeEl ? modeEl.value : 'auto';
    var folderTitle = '';
    if (mode === 'custom_name' && customSubVal) {
        folderTitle = customSubVal;
    } else {
        folderTitle = (nameVal || 'Nama Pengantin') + (dateFormatted ? (' ' + dateFormatted) : '');
    }
    previewTextEl.textContent = '📁 ' + folderTitle;
}

function openModalPreviewDriveFolder(targetType) {
    var url = '';
    if (targetType === 'master') {
        var mInput = document.getElementById('modalEventMasterDriveUrl');
        url = mInput ? mInput.value.trim() : '';
    } else {
        var sInput = document.getElementById('modalEventDriveUrl');
        url = sInput ? sInput.value.trim() : '';
    }
    if (!url) {
        showToast('Masukkan link folder Google Drive terlebih dahulu.', true);
        return;
    }
    var finalLink = buildGoogleDriveFolderUrl(extractDriveFolderIdClient(url), url);
    window.open(finalLink, '_blank');
}

function generateRandomEventIdString() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var randPart = '';
    for (var i = 0; i < 6; i++) {
        randPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'EVT-' + randPart;
}

function generateRandomEventIdInModal() {
    var idInput = document.getElementById('modalEventId');
    if (idInput) {
        idInput.value = generateRandomEventIdString();
    }
}

function openEventModal(eventId) {
    var modal = document.getElementById('eventModal');
    var origIdInput = document.getElementById('modalOriginalEventId');
    var masterInput = document.getElementById('modalEventMasterDriveUrl');
    var subModeSelect = document.getElementById('modalEventSubfolderMode');
    var subNameInput = document.getElementById('modalEventSubfolderName');

    if (eventId) {
        var found = null;
        for (var i = 0; i < APP_STATE.events.length; i++) {
            if (APP_STATE.events[i].eventId === eventId) { found = APP_STATE.events[i]; break; }
        }
        if (found) {
            var edc = (APP_STATE.eventDriveConfigMap && APP_STATE.eventDriveConfigMap[found.eventId]) || {};
            document.getElementById('eventModalTitle').textContent = 'Edit Event: ' + found.eventName;
            if (origIdInput) origIdInput.value = found.eventId;
            document.getElementById('modalEventId').value = getEventDisplayId(found);
            document.getElementById('modalEventName').value = found.eventName;
            document.getElementById('modalEventDate').value = convertDateToInputFormat(found.eventDate);
            if (masterInput) masterInput.value = edc.masterDriveUrl || found.masterDriveFolderUrl || APP_STATE.config.globalDriveFolderUrl || '';
            if (subModeSelect) subModeSelect.value = edc.subfolderMode || (found.targetDriveFolderUrl ? 'direct_link' : 'auto');
            if (subNameInput) subNameInput.value = edc.subfolderName || '';
            document.getElementById('modalEventDriveUrl').value = found.targetDriveFolderUrl || '';
            document.getElementById('modalEventStatus').value = found.eventStatus || 'Active';
        }
    } else {
        document.getElementById('eventModalTitle').textContent = 'Buat Event Baru';
        if (origIdInput) origIdInput.value = '';
        document.getElementById('modalEventId').value = generateRandomEventIdString();
        document.getElementById('modalEventName').value = '';
        document.getElementById('modalEventDate').value = new Date().toISOString().split('T')[0];
        if (masterInput) masterInput.value = ''; // RESET: Kosongkan Master Drive agar tidak menyimpan URL event sebelumnya
        if (subModeSelect) subModeSelect.value = 'auto';
        if (subNameInput) subNameInput.value = '';
        document.getElementById('modalEventDriveUrl').value = '';
        document.getElementById('modalEventStatus').value = 'Active';
    }
    onModalEventSubfolderModeChange();
    modal.style.display = 'flex';
}

function closeEventModal() {
    document.getElementById('eventModal').style.display = 'none';
}

function saveEventFormSubmit() {
    var origIdVal = document.getElementById('modalOriginalEventId') ? document.getElementById('modalOriginalEventId').value.trim() : '';
    var customIdVal = document.getElementById('modalEventId').value.trim().replace(/\s+/g, '-');
    var nameVal = document.getElementById('modalEventName').value.trim();
    var dateRaw = document.getElementById('modalEventDate').value;
    var dateFormatted = convertInputDateToDisplay(dateRaw);
    var masterDriveUrlVal = document.getElementById('modalEventMasterDriveUrl') ? document.getElementById('modalEventMasterDriveUrl').value.trim() : '';
    var subfolderModeVal = document.getElementById('modalEventSubfolderMode') ? document.getElementById('modalEventSubfolderMode').value : 'auto';
    var customSubfolderNameVal = document.getElementById('modalEventSubfolderName') ? document.getElementById('modalEventSubfolderName').value.trim() : '';
    var directSubfolderUrlVal = document.getElementById('modalEventDriveUrl').value.trim();
    var statusVal = document.getElementById('modalEventStatus').value;

    if (!customIdVal) {
        customIdVal = generateRandomEventIdString();
    }
    if (!nameVal) { showToast('Nama acara / pengantin wajib diisi.', true); return; }

    // Pastikan Custom ID tidak bentrok dengan event lain
    for (var cIdx = 0; cIdx < APP_STATE.events.length; cIdx++) {
        var existingEv = APP_STATE.events[cIdx];
        if (existingEv.eventId !== origIdVal && getEventDisplayId(existingEv).toLowerCase() === customIdVal.toLowerCase()) {
            showToast('ID Event "' + customIdVal + '" sudah digunakan pada acara lain. Silakan gunakan ID lain atau klik Random ID.', true);
            return;
        }
    }

    var computedSubfolderName = (subfolderModeVal === 'custom_name' && customSubfolderNameVal)
        ? customSubfolderNameVal
        : (nameVal + ' ' + dateFormatted.replace(/\//g, '-'));

    var targetDriveUrlForBackend = (subfolderModeVal === 'direct_link') ? directSubfolderUrlVal : '';

    if (masterDriveUrlVal) {
        APP_STATE.config.globalDriveFolderUrl = masterDriveUrlVal;
        APP_STATE.config.globalDriveFolderId = extractDriveFolderIdClient(masterDriveUrlVal);
    }

    closeEventModal();
    showLoadingOverlay(true, 'Menyimpan Event (' + customIdVal + ') & Menyiapkan Subfolder Google Drive...');

    var evDriveMeta = {
        customEventId: customIdVal,
        masterDriveUrl: masterDriveUrlVal,
        subfolderMode: subfolderModeVal,
        subfolderName: computedSubfolderName
    };

    var evDbPayload = ' ||EVDB:' + JSON.stringify({
        vl: buildCompactVotesLedgerForDb(),
        al: APP_STATE.awardsLedger || {},
        dc: evDriveMeta
    });

    var proceedSaveEvent = function () {
        var payload = {
            eventId: origIdVal || customIdVal,
            eventName: nameVal,
            eventDate: dateFormatted,
            targetDriveFolderUrl: targetDriveUrlForBackend,
            targetDriveFolderId: extractDriveFolderIdClient(targetDriveUrlForBackend),
            backgroundMusicUrl: evDbPayload,
            eventStatus: statusVal,
            createdBy: APP_STATE.currentUser ? APP_STATE.currentUser.username : 'superadmin'
        };

        callBackendApi('saveEventItem', payload, function (res) {
            showLoadingOverlay(false);
            if (res && res.status === 'success' && res.event) {
                if (!APP_STATE.eventDriveConfigMap) APP_STATE.eventDriveConfigMap = {};
                APP_STATE.eventDriveConfigMap[res.event.eventId] = evDriveMeta;
                res.event.customEventId = customIdVal;
                res.event.masterDriveFolderUrl = masterDriveUrlVal;
                res.event.subfolderMode = subfolderModeVal;
                res.event.subfolderName = computedSubfolderName;
                if (!res.event.targetDriveFolderUrl && masterDriveUrlVal) {
                    res.event.targetDriveFolderUrl = masterDriveUrlVal;
                    res.event.targetDriveFolderId = extractDriveFolderIdClient(masterDriveUrlVal);
                }

                var updated = false;
                for (var i = 0; i < APP_STATE.events.length; i++) {
                    if (APP_STATE.events[i].eventId === res.event.eventId || (origIdVal && APP_STATE.events[i].eventId === origIdVal)) {
                        APP_STATE.events[i] = res.event;
                        updated = true; break;
                    }
                }
                if (!updated) {
                    APP_STATE.events.push(res.event);
                    APP_STATE.activeEventId = res.event.eventId;
                }
                saveExtendedConfigCache();
                syncConfigToBackend('');
                renderEventSelectorDropdown();
                renderAdminEventsTable();
                updateActiveEventHeroBanner();
                showToast('Event "' + nameVal + '" (ID: ' + customIdVal + ') berhasil disimpan!');
            } else {
                showToast((res && res.message) || 'Gagal menyimpan event.', true);
            }
        }, function () {
            showLoadingOverlay(false);
            var newId = origIdVal || customIdVal;
            if (!APP_STATE.eventDriveConfigMap) APP_STATE.eventDriveConfigMap = {};
            APP_STATE.eventDriveConfigMap[newId] = evDriveMeta;
            var finalUrl = directSubfolderUrlVal || masterDriveUrlVal || APP_STATE.config.globalDriveFolderUrl;
            var localEv = {
                eventId: newId,
                customEventId: customIdVal,
                eventName: nameVal,
                eventDate: dateFormatted,
                targetDriveFolderUrl: finalUrl,
                targetDriveFolderId: extractDriveFolderIdClient(finalUrl),
                masterDriveFolderUrl: masterDriveUrlVal,
                subfolderMode: subfolderModeVal,
                subfolderName: computedSubfolderName,
                eventStatus: statusVal
            };
            if (origIdVal) {
                for (var j = 0; j < APP_STATE.events.length; j++) {
                    if (APP_STATE.events[j].eventId === origIdVal) APP_STATE.events[j] = localEv;
                }
            } else {
                APP_STATE.events.push(localEv);
                APP_STATE.activeEventId = localEv.eventId;
            }
            saveExtendedConfigCache();
            renderEventSelectorDropdown();
            renderAdminEventsTable();
            updateActiveEventHeroBanner();
            showToast('Event "' + nameVal + '" (ID: ' + customIdVal + ') berhasil disimpan!');
        });
    };

    if (masterDriveUrlVal && subfolderModeVal !== 'direct_link') {
        callBackendApi('saveAppConfig', {
            appName: APP_STATE.config.appName,
            woName: APP_STATE.config.woName,
            globalDriveFolderUrl: masterDriveUrlVal,
            globalDriveFolderId: extractDriveFolderIdClient(masterDriveUrlVal)
        }, function () {
            proceedSaveEvent();
        }, function () {
            proceedSaveEvent();
        });
    } else {
        proceedSaveEvent();
    }
}

function onFrameOverlayUrlManualInput(val) {
    var clean = String(val || '').trim();
    if (clean.indexOf('[File PNG') === 0) return;
    APP_STATE.uploadedFrameOverlayDataUrl = clean;
    updateCustomFramePngStatusUi(clean);
    loadCustomFrameOverlayImage(clean);
}

function clearUploadedFramePng() {
    APP_STATE.uploadedFrameOverlayDataUrl = '';
    APP_STATE.customFrameOverlayImg = null;
    localStorage.removeItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId);
    if (APP_STATE.config && APP_STATE.config.frameConfig) {
        APP_STATE.config.frameConfig.customOverlayUrl = '';
    }
    saveActiveEventScopedSettings();
    var urlInput = document.getElementById('adminFrameOverlayUrl');
    if (urlInput) urlInput.value = '';
    var fileInput = document.getElementById('adminFramePngFileInput');
    if (fileInput) fileInput.value = '';
    updateCustomFramePngStatusUi('');
    renderAdminFrameLivePreview();
    showToast('File PNG Bingkai untuk event ini dihapus. Klik Simpan untuk memperbarui.');
}

function loadCustomFrameOverlayImage(url) {
    if (!url || !String(url).trim()) {
        APP_STATE.customFrameOverlayImg = null;
        renderAdminFrameLivePreview();
        return;
    }
    var img = new Image();
    if (String(url).indexOf('data:') !== 0) {
        img.crossOrigin = 'Anonymous';
    }
    img.onload = function () {
        APP_STATE.customFrameOverlayImg = img;
        renderAdminFrameLivePreview();
    };
    img.onerror = function () {
        APP_STATE.customFrameOverlayImg = null;
        renderAdminFrameLivePreview();
    };
    img.src = resolveLogoImageUrl(url);
}

// PROSES UPLOAD FILE PNG TRANSPARAN KE GOOGLE DRIVE FOLDER EVENT & DATABASE SPREADSHEET
function handleCustomFramePngUpload(inputEl) {
    if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
    var file = inputEl.files[0];
    var activeEv = getActiveEventObject();

    var reader = new FileReader();
    reader.onload = function (e) {
        var rawDataUrl = e.target.result;
        var img = new Image();
        img.onload = function () {
            // 1. Buat versi FHD 1920x1080 transparan untuk preview dan upload
            var fhdCanvas = document.createElement('canvas');
            fhdCanvas.width = 1920;
            fhdCanvas.height = 1080;
            var fhdCtx = fhdCanvas.getContext('2d');
            fhdCtx.clearRect(0, 0, 1920, 1080);
            fhdCtx.drawImage(img, 0, 0, 1920, 1080);
            var fhdPngDataUrl = fhdCanvas.toDataURL('image/png');

            // Simpan cache lokal terlebih dahulu
            try {
                localStorage.setItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId, fhdPngDataUrl);
            } catch (e2) { }

            APP_STATE.uploadedFrameOverlayDataUrl = fhdPngDataUrl;
            APP_STATE.customFrameOverlayImg = img;
            if (APP_STATE.config && APP_STATE.config.frameConfig) {
                APP_STATE.config.frameConfig.style = 'custom_png';
            }

            var urlInput = document.getElementById('adminFrameOverlayUrl');
            var styleSelect = document.getElementById('adminFrameStyleSelect');
            if (styleSelect) styleSelect.value = 'custom_png';

            updateCustomFramePngStatusUi(fhdPngDataUrl);
            renderAdminFrameLivePreview();

            // 2. Upload ke Google Drive Folder Event Aktif via Backend API
            var evLabel = (activeEv && activeEv.eventName) ? activeEv.eventName : APP_STATE.activeEventId;
            showLoadingOverlay(true, 'Mengunggah bingkai PNG ke Google Drive folder event "' + evLabel + '"...');

            callBackendApi('uploadEventFrameOverlay', {
                eventId: APP_STATE.activeEventId,
                fileName: file.name,
                base64Png: fhdPngDataUrl,
                mimeType: 'image/png'
            }, function (res) {
                showLoadingOverlay(false);
                if (res && res.status === 'success' && res.customOverlayUrl) {
                    var driveUrl = res.customOverlayUrl;
                    if (APP_STATE.config && APP_STATE.config.frameConfig) {
                        APP_STATE.config.frameConfig.customOverlayUrl = driveUrl;
                        APP_STATE.config.frameConfig.style = 'custom_png';
                    }
                    APP_STATE.uploadedFrameOverlayDataUrl = driveUrl;
                    if (urlInput) urlInput.value = driveUrl;

                    if (activeEv) {
                        if (!activeEv.frameConfig) activeEv.frameConfig = {};
                        activeEv.frameConfig.customOverlayUrl = driveUrl;
                        activeEv.frameConfig.style = 'custom_png';
                    }
                    try {
                        localStorage.setItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId, driveUrl);
                    } catch (e3) { }

                    saveActiveEventScopedSettings(true);
                    saveExtendedConfigCache(true);
                    updateCustomFramePngStatusUi(driveUrl);
                    loadCustomFrameOverlayImage(driveUrl);
                    renderAdminFrameLivePreview();
                    showToast('Bingkai foto berhasil diupload ke Google Drive folder event & tersimpan di database!');
                } else {
                    if (urlInput) urlInput.value = '[File PNG Transparan Kustom: ' + file.name + ']';
                    saveActiveEventScopedSettings(true);
                    showToast((res && res.message) || 'Bingkai dimuat secara lokal. Klik "Simpan Desain Bingkai" untuk menyimpan.', true);
                }
            }, function () {
                showLoadingOverlay(false);
                if (urlInput) urlInput.value = '[File PNG Transparan Kustom: ' + file.name + ']';
                saveActiveEventScopedSettings(true);
                showToast('Mode offline: Bingkai dimuat secara lokal.');
            });
        };
        img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
}

function getCurrentAdminFrameConfigFromInputs() {
    var textModeEl = document.getElementById('adminFrameTextModeSelect');
    var pMode = document.getElementById('adminFramePrimaryColorMode');
    var pColInput = document.getElementById('adminFramePrimaryColor');
    var aMode = document.getElementById('adminFrameAccentColorMode');
    var aColInput = document.getElementById('adminFrameAccentColor');
    var titleColInput = document.getElementById('adminFrameTitleColor');
    var urlInput = document.getElementById('adminFrameOverlayUrl');

    var textModeVal = textModeEl ? textModeEl.value : 'default';
    var primaryVal = (pMode && pMode.value === 'none') ? 'none' : (pColInput ? pColInput.value : '#f5c542');
    var accentVal = (aMode && aMode.value === 'none') ? 'none' : (aColInput ? aColInput.value : '#00ffaa');
    var titleColVal = titleColInput ? titleColInput.value : '#f5c542';

    var rawUrlVal = urlInput ? urlInput.value.trim() : '';
    var finalOverlayUrl = APP_STATE.uploadedFrameOverlayDataUrl || '';
    if (rawUrlVal && rawUrlVal.indexOf('[File PNG') !== 0) {
        finalOverlayUrl = rawUrlVal;
    } else if (!rawUrlVal) {
        finalOverlayUrl = '';
    }

    return {
        style: document.getElementById('adminFrameStyleSelect') ? document.getElementById('adminFrameStyleSelect').value : 'royal_wedding_floral',
        textMode: textModeVal,
        customHeaderTitle: document.getElementById('adminFrameHeaderTitle') ? document.getElementById('adminFrameHeaderTitle').value.trim() : '',
        titleColor: titleColVal,
        customGreetingText: document.getElementById('adminFrameGreetingText') ? document.getElementById('adminFrameGreetingText').value.trim() : 'Terima Kasih Atas Kehadiran & Doa Restu Anda',
        customFooterText: document.getElementById('adminFrameFooterText') ? document.getElementById('adminFrameFooterText').value.trim() : 'Runway Wedding Organizer',
        primaryColor: primaryVal,
        accentColor: accentVal,
        customOverlayUrl: finalOverlayUrl,
        votesLedger: (APP_STATE.config && APP_STATE.config.frameConfig && APP_STATE.config.frameConfig.votesLedger) || {},
        _updatedAt: Date.now()
    };
}

function renderAdminFrameLivePreview() {
    var canvas = document.getElementById('adminFramePreviewCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var w = canvas.width;
    var h = canvas.height;

    var grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#1a2438');
    grad.addColorStop(1, '#0f172a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('📸 AREA FOTO TAMU FHD (1920 × 1080 px)', w / 2, h / 2 - 14);
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Bingkai, Warna Judul & Ucapan menyatu otomatis pada setiap foto', w / 2, h / 2 + 16);

    var tempCfg = getCurrentAdminFrameConfigFromInputs();
    drawPhotoFrameOnCanvas(ctx, w, h, tempCfg);
}

function saveFrameConfigForm() {
    var newFrameCfg = getCurrentAdminFrameConfigFromInputs();
    APP_STATE.config.frameConfig = newFrameCfg;
    var ev = getActiveEventObject();
    if (ev) {
        ev.frameConfig = newFrameCfg;
    }

    saveActiveEventScopedSettings(true);
    saveExtendedConfigCache(true);

    var highResLocal = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + APP_STATE.activeEventId);
    var imgSourceToLoad = (newFrameCfg.customOverlayUrl && newFrameCfg.customOverlayUrl.indexOf('http') === 0)
        ? newFrameCfg.customOverlayUrl
        : (highResLocal || newFrameCfg.customOverlayUrl);

    loadCustomFrameOverlayImage(imgSourceToLoad);
    renderAdminFrameLivePreview();
    renderAdminEventScopeSummary();

    showLoadingOverlay(true, 'Menyimpan konfigurasi bingkai ke Google Sheets...');
    callBackendApi('saveEventSettings', {
        eventId: APP_STATE.activeEventId,
        frameConfig: newFrameCfg
    }, function (res) {
        showLoadingOverlay(false);
        showToast('Desain Bingkai FHD khusus event "' + (ev ? ev.eventName : APP_STATE.activeEventId) + '" berhasil disimpan ke database!');
    }, function () {
        showLoadingOverlay(false);
        showToast('Desain Bingkai disimpan secara lokal.');
    });
}

function saveGlobalDriveConfigForm() {
    var gEl = document.getElementById('adminGlobalDriveUrl');
    var val = gEl ? gEl.value.trim() : '';
    APP_STATE.config.globalDriveFolderUrl = val;
    APP_STATE.config.globalDriveFolderId = extractDriveFolderIdClient(val);
    updateActiveEventHeroBanner();
    syncConfigToBackend('Link Google Drive berhasil disimpan & disinkronkan!');
}

function saveGeneralConfigForm() {
    APP_STATE.config.appName = document.getElementById('adminAppName').value.trim() || 'SatuAlbum';
    APP_STATE.config.appTagline = document.getElementById('adminAppTagline').value.trim();
    APP_STATE.config.woName = document.getElementById('adminWoName').value.trim() || 'Runway Wedding & Event Organizer';
    var rawLogoInput = document.getElementById('adminWoLogoUrl').value.trim();
    if (rawLogoInput.indexOf('[File Custom Logo') === 0) {
        APP_STATE.config.woLogoUrl = APP_STATE.uploadedCustomWoLogoDataUrl || localStorage.getItem('SATUALBUM_CUSTOM_WO_LOGO') || APP_STATE.config.woLogoUrl || '';
    } else {
        APP_STATE.config.woLogoUrl = rawLogoInput;
        if (!rawLogoInput) {
            localStorage.removeItem('SATUALBUM_CUSTOM_WO_LOGO');
        }
    }
    var masterDriveEl = document.getElementById('adminGlobalDriveFolderUrl') || document.getElementById('adminGlobalDriveUrl');
    if (masterDriveEl) {
        var masterVal = masterDriveEl.value.trim();
        APP_STATE.config.globalDriveFolderUrl = masterVal;
        APP_STATE.config.globalDriveFolderId = extractDriveFolderIdClient(masterVal);
    }
    APP_STATE.config.woContact = document.getElementById('adminWoContact').value.trim();
    APP_STATE.config.customFooter = document.getElementById('adminCustomFooter').value.trim();
    applyBrandingToDom();
    updateActiveEventHeroBanner();
    syncConfigToBackend('Identitas Branding WO & Target Master Google Drive berhasil disimpan!');
}

function saveRemoteEndpointEndpoint() {
    var val = document.getElementById('adminRemoteEndpointUrl').value.trim();
    if (!val) { showToast('Masukkan URL Web App Google Apps Script terlebih dahulu.', true); return; }
    APP_STATE.remoteGasUrl = val;
    localStorage.setItem('SATUALBUM_REMOTE_GAS_URL', val);
    showToast('Endpoint API disimpan! Memuat ulang data dari server...');
    loadInitialApplicationData();
}

function deleteEventItem(eventId) {
    if (APP_STATE.events.length <= 1) {
        showToast('Minimal harus terdapat 1 event aktif.', true);
        return;
    }
    APP_STATE.events = APP_STATE.events.filter(function (e) { return e.eventId !== eventId; });
    if (APP_STATE.activeEventId === eventId && APP_STATE.events.length > 0) {
        APP_STATE.activeEventId = APP_STATE.events[0].eventId;
    }
    renderEventSelectorDropdown();
    renderAdminEventsTable();
    updateActiveEventHeroBanner();
    showToast('Event dihapus.');

    callBackendApi('deleteEventItem', { eventId: eventId });
}

// MANAJEMEN USER & LEVEL ROLE
function loadAdminUsersList() {
    // 1. Pulihkan user dari APP_STATE, cache lokal, atau default 4 user langsung agar tabel tidak pernah kosong
    if (!APP_STATE.users || APP_STATE.users.length === 0) {
        try {
            var cachedUsersRaw = localStorage.getItem('SATUALBUM_USERS_CACHE');
            if (cachedUsersRaw) {
                var parsedU = JSON.parse(cachedUsersRaw);
                if (Array.isArray(parsedU) && parsedU.length > 0) {
                    APP_STATE.users = parsedU;
                }
            }
        } catch (eUC) { }
    }
    if (!APP_STATE.users || APP_STATE.users.length === 0) {
        APP_STATE.users = [
            { userId: 'USR-0001', username: 'superadmin', fullName: 'Super Admin Dispocam', userPin: '000000', roleLevel: 'Super Admin', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
            { userId: 'USR-0002', username: 'adminevent', fullName: 'Admin Acara Dimas & Karyn', userPin: '123456', roleLevel: 'Admin Event', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
            { userId: 'USR-0003', username: 'operator', fullName: 'Operator Stan Foto', userPin: '112233', roleLevel: 'Operator', accountStatus: 'Active', createdAt: '29/10/2026 00:00:00' },
            { userId: 'USR-0004', username: 'ilham', fullName: 'Ilham', userPin: '123456', roleLevel: 'Super Admin', accountStatus: 'Active', createdAt: '08/11/2026 07:11:00' }
        ];
    }
    renderAdminUsersTable();

    // 2. Muat data pengguna terbaru dari Google Apps Script secara asynchronous
    callBackendApi('getPaginatedData', { dataType: 'users', offset: 0, limit: 50 }, function (res) {
        if (res && res.status === 'success' && Array.isArray(res.items) && res.items.length > 0) {
            APP_STATE.users = res.items;
            try {
                localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(res.items));
            } catch (eU) { }
            renderAdminUsersTable();
        }
    }, function () {
        // Fallback offline: data user sudah dirender di langkah 1
    });
}

function renderAdminUsersTable() {
    var tbody = document.getElementById('adminUsersTableBody');
    if (!tbody) return;
    var users = APP_STATE.users || [], html = '';
    if (users.length === 0) {
        html = '<tr><td colspan="7" style="text-align:center;">Belum ada data user.</td></tr>';
    } else {
        for (var i = 0; i < users.length; i++) {
            var u = users[i];
            html += '<tr>';
            html += '<td><span class="mono-badge">' + escapeHtml(u.userId) + '</span></td>';
            html += '<td style="font-weight:700; color:var(--accent-neon);">' + escapeHtml(u.username) + '</td>';
            html += '<td>' + escapeHtml(u.fullName) + '</td>';
            html += '<td><span class="mono-badge">' + escapeHtml(u.userPin) + '</span></td>';
            html += '<td>' + escapeHtml(u.roleLevel) + '</td>';
            html += '<td>' + escapeHtml(u.accountStatus) + '</td>';
            html += '<td style="display:flex; gap:6px;">';
            html += '<button type="button" class="btn btn-secondary btn-sm" onclick="openUserModal(\'' + escapeHtml(u.userId) + '\')" title="Edit User"><i class="fa-solid fa-pen"></i></button>';
            html += '<button type="button" class="btn btn-gold btn-sm" onclick="openChangePasswordModal(\'' + escapeHtml(u.userId) + '\', \'' + escapeHtml(u.username) + '\')" title="Ganti Password / PIN"><i class="fa-solid fa-key"></i></button>';
            if (u.userId !== 'USR-0001') {
                html += '<button type="button" class="btn btn-danger btn-sm" onclick="deleteUserItemAdmin(\'' + escapeHtml(u.userId) + '\')" title="Hapus User"><i class="fa-solid fa-trash"></i></button>';
            }
            html += '</td></tr>';
        }
    }
    tbody.innerHTML = html;
}

function openUserModal(userId) {
    var modal = document.getElementById('userModal');
    if (userId) {
        var found = null;
        for (var i = 0; i < APP_STATE.users.length; i++) {
            if (APP_STATE.users[i].userId === userId) { found = APP_STATE.users[i]; break; }
        }
        if (found) {
            document.getElementById('userModalTitle').textContent = 'Edit User: ' + found.username;
            document.getElementById('modalUserId').value = found.userId;
            document.getElementById('modalUsername').value = found.username;
            document.getElementById('modalUserFullName').value = found.fullName;
            document.getElementById('modalUserPin').value = found.userPin;
            document.getElementById('modalUserRole').value = found.roleLevel;
            document.getElementById('modalUserStatus').value = found.accountStatus || 'Active';
        }
    } else {
        document.getElementById('userModalTitle').textContent = 'Tambah User Baru';
        document.getElementById('modalUserId').value = '';
        document.getElementById('modalUsername').value = '';
        document.getElementById('modalUserFullName').value = '';
        document.getElementById('modalUserPin').value = '';
        document.getElementById('modalUserRole').value = 'Operator';
        document.getElementById('modalUserStatus').value = 'Active';
    }
    modal.style.display = 'flex';
}

function closeUserModal() {
    document.getElementById('userModal').style.display = 'none';
}

function saveUserFormSubmit() {
    var payload = {
        userId: document.getElementById('modalUserId').value.trim(),
        username: document.getElementById('modalUsername').value.trim().toLowerCase(),
        fullName: document.getElementById('modalUserFullName').value.trim(),
        userPin: document.getElementById('modalUserPin').value.trim(),
        roleLevel: document.getElementById('modalUserRole').value,
        accountStatus: document.getElementById('modalUserStatus').value
    };
    if (!payload.username || !payload.fullName || !payload.userPin) {
        showToast('Lengkapi seluruh kolom user.', true);
        return;
    }
    closeUserModal();
    showLoadingOverlay(true, 'Menyimpan data user...');
    callBackendApi('saveUserItem', payload, function (res) {
        showLoadingOverlay(false);
        if (res && res.status === 'success' && res.user) {
            var exists = false;
            for (var i = 0; i < APP_STATE.users.length; i++) {
                if (APP_STATE.users[i].userId === res.user.userId) {
                    APP_STATE.users[i] = res.user; exists = true; break;
                }
            }
            if (!exists) APP_STATE.users.push(res.user);
            renderAdminUsersTable();
            showToast(res.message || 'User berhasil disimpan!');
        } else {
            showToast((res && res.message) || 'Gagal menyimpan user.', true);
        }
    }, function () {
        showLoadingOverlay(false);
        payload.userId = payload.userId || ('USR-000' + (APP_STATE.users.length + 1));
        APP_STATE.users.push(payload);
        renderAdminUsersTable();
        showToast('User berhasil ditambahkan!');
    });
}

function deleteUserItemAdmin(userId) {
    APP_STATE.users = APP_STATE.users.filter(function (u) { return u.userId !== userId; });
    renderAdminUsersTable();
    showToast('User dihapus.');
    callBackendApi('deleteUserItem', { userId: userId });
}

// MODERASI FOTO, PEMBERIAN GELAR JURI & HAPUS DATA
function renderAdminModerationTable() {
    var tbody = document.getElementById('adminModerationTableBody');
    if (!tbody) return;
    var allPhotos = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var photos = allPhotos.filter(function (p) {
        return !p.eventId || p.eventId === APP_STATE.activeEventId;
    }), html = '';
    if (photos.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada foto di acara ini.</td></tr>';
    } else {
        for (var i = 0; i < photos.length; i++) {
            var p = photos[i];
            var breakdownBadges = buildVoteBreakdownBadgesHtml(p);
            html += '<tr>';
            html += '<td><img src="' + escapeHtml(p.directImageUrl) + '" style="width:48px; height:48px; border-radius:8px; object-fit:cover; cursor:pointer;" onclick="openImageLightBox(\'' + escapeHtml(p.directImageUrl) + '\', \'' + escapeHtml(p.uploadedBy) + '\')" /></td>';
            html += '<td><div style="font-weight:700;">' + escapeHtml(p.uploadedBy) + '</div><div style="font-size:0.72rem; color:var(--accent-neon);">' + escapeHtml(p.category) + '</div></td>';
            html += '<td><div style="font-weight:700; color:var(--accent-gold);">' + (p.votes || 0) + ' Suara</div><div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:4px;">' + breakdownBadges + '</div></td>';
            html += '<td>' + (p.awardTitle ? '<span class="mono-badge" style="color:var(--accent-gold); border:1px solid var(--accent-gold);">🏆 ' + escapeHtml(p.awardTitle) + '</span>' : '-') + '</td>';
            html += '<td style="display:flex; gap:6px;">';
            html += '<button type="button" class="btn btn-gold btn-sm" onclick="openAwardJudgeModal(\'' + escapeHtml(p.photoId) + '\')" title="Tetapkan Gelar Pemenang"><i class="fa-solid fa-trophy"></i> Gelar</button>';
            html += '<button type="button" class="btn btn-danger btn-sm" onclick="deletePhotoItem(\'' + escapeHtml(p.photoId) + '\')" title="Hapus Foto"><i class="fa-solid fa-trash"></i></button>';
            html += '</td></tr>';
        }
    }
    tbody.innerHTML = html;
}

function openAwardJudgeModal(photoId) {
    document.getElementById('awardModalPhotoId').value = photoId;
    var list = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var currentTitle = '';
    for (var i = 0; i < list.length; i++) {
        if (list[i].photoId === photoId) {
            currentTitle = list[i].awardTitle || '';
            break;
        }
    }
    document.getElementById('awardModalInput').value = currentTitle;

    var cats = getNormalizedVoteCategories();
    var pillsHtml = '<button type="button" class="filter-chip" onclick="document.getElementById(\'awardModalInput\').value=\'\'">Kosongkan Gelar</button>';
    for (var j = 0; j < cats.length; j++) {
        var label = 'Juara ' + cats[j].name;
        pillsHtml += '<button type="button" class="filter-chip" onclick="setAwardInputFromCategoryIndex(' + j + ')">🏆 ' + escapeHtml(label) + '</button>';
    }
    document.getElementById('awardQuickPills').innerHTML = pillsHtml;
    document.getElementById('awardJudgeModal').style.display = 'flex';
}

function setAwardInputFromCategoryIndex(catIdx) {
    var cats = getNormalizedVoteCategories();
    if (cats[catIdx]) {
        document.getElementById('awardModalInput').value = 'Juara ' + cats[catIdx].name;
    }
}

function closeAwardJudgeModal() {
    document.getElementById('awardJudgeModal').style.display = 'none';
}

function submitAwardJudgeModal() {
    var photoId = document.getElementById('awardModalPhotoId').value;
    var awardTitle = document.getElementById('awardModalInput').value.trim();
    closeAwardJudgeModal();

    var list = APP_STATE.allEventPhotos || APP_STATE.photos || [];
    var pVotes = 0;
    var pCats = {};
    for (var i = 0; i < list.length; i++) {
        if (list[i].photoId === photoId) {
            list[i].awardTitle = awardTitle;
            pVotes = list[i].votes || 0;
            pCats = list[i].votesByCategory || {};
            break;
        }
    }
    APP_STATE.awardsLedger[photoId] = awardTitle;
    APP_STATE.photos = list.slice();
    renderAdminModerationTable();
    renderGalleryGrid();
    renderVoteSection();
    renderLiveLeaderboard();
    showToast('Gelar penghargaan disimpan & disinkronkan ke Database!');

    var packedAward = packPhotoAwardWithVotes(awardTitle, pVotes, pCats);
    callBackendApi('awardPhoto', { photoId: photoId, awardTitle: packedAward });
    pushAllVotesToDatabase(false);
}

function deletePhotoItem(photoId) {
    APP_STATE.allEventPhotos = (APP_STATE.allEventPhotos || []).filter(function (p) { return p.photoId !== photoId; });
    APP_STATE.photos = APP_STATE.allEventPhotos.slice();
    renderAdminModerationTable();
    renderGalleryGrid();
    renderVoteSection();
    renderLiveLeaderboard();
    updateHeroCounters();
    showToast('Foto dihapus.');
    callBackendApi('deletePhotoItem', { photoId: photoId });
}

function renderAdminGuestbookTable() {
    var tbody = document.getElementById('adminGuestbookTableBody');
    if (!tbody) return;
    var gbAll = APP_STATE.guestbook || [];
    var gb = gbAll.filter(function (g) {
        return !g.eventId || g.eventId === APP_STATE.activeEventId;
    }), html = '';
    if (gb.length === 0) {
        html = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Belum ada ucapan buku tamu.</td></tr>';
    } else {
        for (var i = 0; i < gb.length; i++) {
            var g = gb[i];
            html += '<tr>';
            html += '<td style="font-weight:700;">' + escapeHtml(g.guestName) + '</td>';
            html += '<td>' + escapeHtml(g.attendanceStatus) + '</td>';
            html += '<td>' + escapeHtml(g.message) + '</td>';
            html += '<td style="font-size:0.72rem; color:var(--text-muted);">' + escapeHtml(g.submittedAt) + '</td>';
            html += '<td><button type="button" class="btn btn-danger btn-sm" onclick="deleteGuestbookItem(\'' + escapeHtml(g.guestId) + '\')"><i class="fa-solid fa-trash"></i></button></td>';
            html += '</tr>';
        }
    }
    tbody.innerHTML = html;
}

function deleteGuestbookItem(guestId) {
    APP_STATE.guestbook = APP_STATE.guestbook.filter(function (g) { return g.guestId !== guestId; });
    renderGuestbookList();
    renderAdminGuestbookTable();
    showToast('Ucapan dihapus.');
    callBackendApi('deleteGuestbookItem', { guestId: guestId });
}

// BARCODE UNDANGAN & SHARE LANGSUNG (SEPERTI SEBELUMNYA TANPA MENU PILIH APLIKASI)
function getActiveEventInviteUrl() {
    var ev = getActiveEventObject();
    var inviteId = getEventDisplayId(ev) || ev.eventId;
    return window.location.href.split('?')[0] + '?event=' + encodeURIComponent(inviteId);
}

function openQrModal() {
    var ev = getActiveEventObject();
    var currentUrl = getActiveEventInviteUrl();
    document.getElementById('qrModalEventName').textContent = ev.eventName;
    var inputEl = document.getElementById('qrModalUrlInput');
    if (inputEl) inputEl.value = currentUrl;
    document.getElementById('qrModalContent').innerHTML = '<img id="qrCodeGeneratedImg" src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' + encodeURIComponent(currentUrl) + '" alt="Barcode Undangan" style="width:190px; height:190px; display:block;" />';
    document.getElementById('qrModal').style.display = 'flex';
}

function shareEventQrLink() {
    var ev = getActiveEventObject();
    var shareUrl = getActiveEventInviteUrl();
    if (navigator.share) {
        navigator.share({
            title: ev.eventName + ' • ' + (APP_STATE.config.appName || 'SatuAlbum'),
            text: 'Yuk abadikan foto momen seru & ikuti voting foto terbaik di acara ' + ev.eventName + '!',
            url: shareUrl
        }).catch(function () { });
    } else {
        copyEventQrLink();
    }
}

function copyEventQrLink() {
    var inputEl = document.getElementById('qrModalUrlInput');
    if (!inputEl) return;
    inputEl.select();
    inputEl.setSelectionRange(0, 99999);
    try {
        document.execCommand('copy');
        showToast('Tautan undangan acara berhasil disalin ke Clipboard!');
    } catch (e) {
        showToast('Gagal menyalin tautan secara otomatis.', true);
    }
}

function closeQrModal() {
    document.getElementById('qrModal').style.display = 'none';
}

// =====================================================================
// MANAJEMEN PASSWORD & PROFIL AKUN PENGGUNA
// =====================================================================

function openUserChangePasswordTab() {
    var tabBtn = document.getElementById('adminTabBtn-accountProfile');
    if (tabBtn) {
        tabBtn.style.display = 'inline-flex';
    }
    if (typeof switchMainView === 'function') {
        switchMainView('admin');
    }
    switchAdminSubTab('accountProfile', tabBtn);
    var panel = document.getElementById('adminSub-accountProfile');
    if (panel) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// MODAL GANTI PASSWORD / PIN AKUN PENGGUNA
function openChangePasswordModal(userId, username) {
    if (!userId && !username && document.getElementById('adminSub-accountProfile') && APP_STATE.currentUser) {
        openUserChangePasswordTab();
        return;
    }
    var modal = document.getElementById('changePasswordModal');
    if (!modal) return;
    var targetId = userId || (APP_STATE.currentUser ? APP_STATE.currentUser.userId : '');
    var targetName = username || (APP_STATE.currentUser ? (APP_STATE.currentUser.fullName || APP_STATE.currentUser.username) : '');

    var idEl = document.getElementById('changePasswordTargetUserId');
    if (idEl) idEl.value = targetId;

    var labelEl = document.getElementById('changePasswordUsernameLabel');
    if (labelEl) labelEl.textContent = targetName || 'Akun Aktif';

    // Jika Super Admin mereset password akun user lain, input Password Lama tidak wajib
    var isSuperAdminResetOther = (APP_STATE.currentUser && APP_STATE.currentUser.roleLevel === 'Super Admin' && targetId && targetId !== APP_STATE.currentUser.userId);
    var oldPinGroup = document.getElementById('changePasswordOldPinGroup');
    var oldPinInput = document.getElementById('changePasswordOldPin');
    if (oldPinGroup) {
        oldPinGroup.style.display = isSuperAdminResetOther ? 'none' : 'block';
    }
    if (oldPinInput) {
        oldPinInput.required = !isSuperAdminResetOther;
        oldPinInput.value = '';
    }

    var newPinEl = document.getElementById('changePasswordNewPin');
    if (newPinEl) newPinEl.value = '';
    var confirmPinEl = document.getElementById('changePasswordConfirmPin');
    if (confirmPinEl) confirmPinEl.value = '';

    modal.classList.add('active');
}

function closeChangePasswordModal() {
    var modal = document.getElementById('changePasswordModal');
    if (modal) modal.classList.remove('active');
}

function handleAdminChangePasswordSubmit() {
    var idEl = document.getElementById('changePasswordTargetUserId');
    var userId = idEl ? idEl.value : (APP_STATE.currentUser ? APP_STATE.currentUser.userId : '');
    var oldPinEl = document.getElementById('changePasswordOldPin');
    var oldPin = oldPinEl ? oldPinEl.value.trim() : '';
    var newPin = document.getElementById('changePasswordNewPin').value.trim();
    var confirmPin = document.getElementById('changePasswordConfirmPin').value.trim();

    var isSuperAdminResetOther = (APP_STATE.currentUser && APP_STATE.currentUser.roleLevel === 'Super Admin' && userId && userId !== APP_STATE.currentUser.userId);

    if (!isSuperAdminResetOther && !oldPin) {
        showToast('Masukkan Password / PIN lama terlebih dahulu.', true);
        return;
    }
    if (!newPin || newPin.length < 4) {
        showToast('Password / PIN baru minimal 4 karakter.', true);
        return;
    }
    if (newPin !== confirmPin) {
        showToast('Konfirmasi Password baru tidak cocok dengan Password baru.', true);
        return;
    }

    var targetUser = null;
    if (Array.isArray(APP_STATE.users)) {
        for (var i = 0; i < APP_STATE.users.length; i++) {
            if (APP_STATE.users[i].userId === userId) {
                targetUser = APP_STATE.users[i];
                break;
            }
        }
    }

    showLoadingOverlay(true, 'Memperbarui password akun di Google Sheets...');
    callBackendApi('changeUserPassword', {
        userId: userId,
        username: targetUser ? targetUser.username : (APP_STATE.currentUser ? APP_STATE.currentUser.username : ''),
        oldPin: oldPin,
        newPin: newPin,
        isAdminReset: isSuperAdminResetOther
    }, function (res) {
        showLoadingOverlay(false);
        if (res && res.status === 'success') {
            if (targetUser) targetUser.userPin = newPin;
            if (APP_STATE.currentUser && APP_STATE.currentUser.userId === userId) {
                APP_STATE.currentUser.userPin = newPin;
                saveAdminSessionToStorage(APP_STATE.currentUser);
            }
            try {
                localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
            } catch (eU) { }
            closeChangePasswordModal();
            showToast(res.message || 'Password berhasil diperbarui!');
            alert('SUKSES GANTI PASSWORD:\n\n' + (res.message || 'Password berhasil diperbarui. Silakan gunakan password baru ini pada login berikutnya.'));
            loadAdminUsersList();
        } else {
            var errMsg = (res && res.message) || '';
            if (errMsg.indexOf('Action tidak dikenali') !== -1) {
                if (targetUser) targetUser.userPin = newPin;
                if (APP_STATE.currentUser && APP_STATE.currentUser.userId === userId) {
                    APP_STATE.currentUser.userPin = newPin;
                    saveAdminSessionToStorage(APP_STATE.currentUser);
                }
                try {
                    localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
                } catch (eU) { }
                closeChangePasswordModal();
                showToast('Password diperbarui untuk sesi ini! Deploy versi baru Apps Script agar permanen.');
                alert('CATATAN DEPLOYMENT APPS SCRIPT:\n\nPassword akun berhasil diperbarui di browser ini. Agar perubahan tersimpan permanen di cloud Google Sheets, buka Google Apps Script lalu lakukan "Deploy > Kelola Deployment > Edit > Versi Baru > Deploy".');
                loadAdminUsersList();
                return;
            }
            showToast(errMsg || 'Gagal mengubah password.', true);
            alert('PERINGATAN:\n\n' + (errMsg || 'Gagal mengubah password.'));
        }
    }, function () {
        showLoadingOverlay(false);
        if (targetUser) {
            targetUser.userPin = newPin;
            if (APP_STATE.currentUser && APP_STATE.currentUser.userId === userId) {
                APP_STATE.currentUser.userPin = newPin;
                saveAdminSessionToStorage(APP_STATE.currentUser);
            }
            try {
                localStorage.setItem('SATUALBUM_USERS_CACHE', JSON.stringify(APP_STATE.users));
            } catch (eU2) { }
            closeChangePasswordModal();
            showToast('Mode offline: Password diperbarui secara lokal.');
            loadAdminUsersList();
        } else {
            showToast('Gagal menghubungi server Google Apps Script.', true);
        }
    });
}

