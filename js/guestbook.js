// =====================================================================
        // MODUL 4: BUKU TAMU & RSVP
        // =====================================================================
        function reloadGuestbookFeed(reset) {
            if (reset) { APP_STATE.gbOffset = 0; APP_STATE.guestbook = []; }
            var payload = { dataType: 'guestbook', eventId: APP_STATE.activeEventId, offset: APP_STATE.gbOffset, limit: APP_STATE.gbLimit };
            callBackendApi('getPaginatedData', payload, function (res) {
                if (res && res.status === 'success') {
                    if (reset) APP_STATE.guestbook = res.items || [];
                    else APP_STATE.guestbook = APP_STATE.guestbook.concat(res.items || []);
                    APP_STATE.gbHasMore = res.hasMore;
                    renderGuestbookList();
                    renderAdminGuestbookTable();
                    var hadirEl = document.getElementById('statHadirCount'), absenEl = document.getElementById('statAbsenCount');
                    if (res.summary && hadirEl) hadirEl.textContent = res.summary.hadir;
                    if (res.summary && absenEl) absenEl.textContent = res.summary.berhalangan;
                } else {
                    renderGuestbookList();
                }
            }, function () {
                renderGuestbookList();
                renderAdminGuestbookTable();
            });
        }

        function submitGuestbookForm() {
            var nameInput = document.getElementById('guestNameInput');
            var statusSelect = document.getElementById('guestAttendanceSelect');
            var msgInput = document.getElementById('guestMessageInput');
            var guestName = nameInput ? String(nameInput.value || '').trim() : '';
            var attendanceStatus = statusSelect ? statusSelect.value : 'Hadir';
            var message = msgInput ? String(msgInput.value || '').trim() : '';
            if (!guestName || !message) {
                showToast('Mohon isi nama dan ucapan Anda.', true);
                return;
            }

            var tempEntry = {
                guestId: 'GST-' + Math.floor(Math.random() * 9000 + 1000),
                eventId: APP_STATE.activeEventId,
                guestName: guestName,
                attendanceStatus: attendanceStatus,
                message: message,
                submittedAt: 'Baru saja'
            };
            APP_STATE.guestbook.unshift(tempEntry);
            renderGuestbookList();
            renderAdminGuestbookTable();
            if (nameInput) nameInput.value = '';
            if (msgInput) msgInput.value = '';
            showToast('Ucapan Anda berhasil dikirim!');

            callBackendApi('submitGuestbookEntry', {
                eventId: APP_STATE.activeEventId,
                guestName: guestName,
                attendanceStatus: attendanceStatus,
                message: message
            }, function (res) {
                if (res && res.status === 'success') {
                    reloadGuestbookFeed(true);
                }
            });
        }

        function renderGuestbookList() {
            var container = document.getElementById('guestbookListContainer');
            var loadMoreBtn = document.getElementById('gbLoadMoreBtn');
            if (!container) return;
            var html = '', list = APP_STATE.guestbook || [];
            if (list.length === 0) {
                html = '<div style="text-align:center; padding:26px; color:var(--text-muted);">Belum ada ucapan untuk acara ini.</div>';
            } else {
                for (var i = 0; i < list.length; i++) {
                    var g = list[i];
                    var badgeColor = (g.attendanceStatus === 'Hadir')
                        ? 'background:rgba(0,255,170,0.14); color:var(--accent-neon);'
                        : 'background:rgba(255,82,82,0.14); color:#ff5252;';
                    html += '<div style="background:rgba(255,255,255,0.03); border:1px solid var(--border-subtle); border-radius:12px; padding:12px 14px;">';
                    html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">';
                    html += '<div style="font-weight:700; font-size:0.88rem;"><i class="fa-solid fa-user-pen" style="color:var(--accent-neon); margin-right:6px;"></i>' + escapeHtml(g.guestName) + '</div>';
                    html += '<span style="font-size:0.68rem; font-weight:700; padding:2px 8px; border-radius:6px; ' + badgeColor + '">' + escapeHtml(g.attendanceStatus) + '</span></div>';
                    html += '<p style="font-size:0.82rem; color:#e2e8f0; margin-bottom:6px;">' + escapeHtml(g.message) + '</p>';
                    html += '<div style="font-size:0.68rem; color:var(--text-muted); text-align:right;">' + escapeHtml(g.submittedAt) + '</div></div>';
                }
            }
            container.innerHTML = html;
            if (loadMoreBtn) loadMoreBtn.style.display = APP_STATE.gbHasMore ? 'inline-flex' : 'none';
        }

        function loadMoreGuestbookEntries() {
            APP_STATE.gbOffset += APP_STATE.gbLimit;
            reloadGuestbookFeed(false);
        }
