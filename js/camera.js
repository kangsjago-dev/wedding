// =====================================================================
        // MODUL 1: LIVE CAMERA WEBRTC FHD (1920 × 1080) & BINGKAI OTOMATIS
        // =====================================================================
        function startCameraStream(isSilentAuto) {
            // KUNCI BINGKAI KUSTOM (ANTI-RESET SAAT LIVE CAM)
            try {
                var activeEv = getActiveEventObject();
                var evId = (activeEv && activeEv.eventId) || APP_STATE.activeEventId || 'EVT-0001';
                var overlaySource = (activeEv && activeEv.frameConfig && activeEv.frameConfig.customOverlayUrl) || (APP_STATE.config && APP_STATE.config.frameConfig && APP_STATE.config.frameConfig.customOverlayUrl) || APP_STATE.uploadedFrameOverlayDataUrl || localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + evId) || '';
                if (overlaySource && (!APP_STATE.customFrameOverlayImg || !APP_STATE.customFrameOverlayImg.complete)) {
                    if (typeof loadCustomFrameOverlayImage === 'function') {
                        loadCustomFrameOverlayImage(overlaySource);
                    }
                }
            } catch (ignoreCamPreload) { }

            var videoEl = document.getElementById('cameraVideoFeed');
            var placeholderEl = document.getElementById('cameraPlaceholder');
            var btnStart = document.getElementById('btnStartCam');
            var btnSnap = document.getElementById('btnSnapCam');
            var statusDot = document.getElementById('cameraStatusDot');
            var statusText = document.getElementById('cameraStatusText');

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                if (!isSilentAuto) showToast('Browser ini membutuhkan HTTPS atau gunakan tombol Galeri HP.', true);
                return;
            }

            stopCameraStream();

            var primaryConstraints = {
                video: {
                    facingMode: { ideal: APP_STATE.cameraFacingMode },
                    width: { ideal: 1920, min: 1280 },
                    height: { ideal: 1080, min: 720 }
                },
                audio: false
            };

            navigator.mediaDevices.getUserMedia(primaryConstraints)
                .then(function (stream) {
                    onCameraStreamReady(stream, videoEl, placeholderEl, btnStart, btnSnap, statusDot, statusText);
                })
                .catch(function () {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                        .then(function (stream2) {
                            onCameraStreamReady(stream2, videoEl, placeholderEl, btnStart, btnSnap, statusDot, statusText);
                        })
                        .catch(function () {
                            if (statusDot) statusDot.style.background = '#ff5252';
                            if (statusText) statusText.textContent = 'IZIN KAMERA DIPERLUKAN';
                            if (!isSilentAuto) {
                                showToast('Ketuk Izinkan Kamera pada browser atau gunakan tombol Galeri HP.', true);
                            }
                        });
                });
        }

        function onCameraStreamReady(stream, videoEl, placeholderEl, btnStart, btnSnap, statusDot, statusText) {
            APP_STATE.cameraStream = stream;
            videoEl.srcObject = stream;
            videoEl.style.display = 'block';
            videoEl.style.transform = APP_STATE.cameraMirrored ? 'scaleX(-1)' : 'scaleX(1)';
            videoEl.style.filter = APP_STATE.cameraFilterCss || 'none';
            if (placeholderEl) placeholderEl.style.display = 'none';
            if (btnStart) btnStart.style.display = 'none';
            var btnRetakeBar = document.getElementById('btnRetakeCamBar');
            if (APP_STATE.capturedDataUrl) {
                if (btnSnap) btnSnap.style.display = 'none';
                if (btnRetakeBar) btnRetakeBar.style.display = 'inline-flex';
            } else {
                if (btnSnap) btnSnap.style.display = 'inline-flex';
                if (btnRetakeBar) btnRetakeBar.style.display = 'none';
            }
            if (statusDot) statusDot.style.background = '#00ffaa';
            if (statusText) statusText.textContent = 'LIVE FHD 1920×1080';
        }

        function stopCameraStream() {
            if (APP_STATE.cameraStream) {
                var tracks = APP_STATE.cameraStream.getTracks();
                for (var i = 0; i < tracks.length; i++) tracks[i].stop();
                APP_STATE.cameraStream = null;
            }
            var videoEl = document.getElementById('cameraVideoFeed');
            var placeholderEl = document.getElementById('cameraPlaceholder');
            var btnStart = document.getElementById('btnStartCam');
            var btnSnap = document.getElementById('btnSnapCam');
            var btnRetakeBar = document.getElementById('btnRetakeCamBar');
            var statusDot = document.getElementById('cameraStatusDot');
            var statusText = document.getElementById('cameraStatusText');

            if (videoEl) videoEl.style.display = 'none';
            if (placeholderEl && !APP_STATE.capturedDataUrl) placeholderEl.style.display = 'block';
            if (APP_STATE.capturedDataUrl) {
                if (btnStart) btnStart.style.display = 'none';
                if (btnSnap) btnSnap.style.display = 'none';
                if (btnRetakeBar) btnRetakeBar.style.display = 'inline-flex';
            } else {
                if (btnStart) btnStart.style.display = 'inline-flex';
                if (btnSnap) btnSnap.style.display = 'none';
                if (btnRetakeBar) btnRetakeBar.style.display = 'none';
            }
            if (statusDot) statusDot.style.background = '#ffc107';
            if (statusText) statusText.textContent = 'KAMERA SIAP';
        }

        function flipCameraFacing() {
            APP_STATE.cameraFacingMode = (APP_STATE.cameraFacingMode === 'environment') ? 'user' : 'environment';
            APP_STATE.cameraMirrored = (APP_STATE.cameraFacingMode === 'user');
            startCameraStream(false);
        }

        function toggleCameraMirror() {
            APP_STATE.cameraMirrored = !APP_STATE.cameraMirrored;
            var videoEl = document.getElementById('cameraVideoFeed');
            if (videoEl) videoEl.style.transform = APP_STATE.cameraMirrored ? 'scaleX(-1)' : 'scaleX(1)';
        }

        function setCameraFilter(filterName, cssVal, btnEl) {
            APP_STATE.cameraFilterName = filterName;
            APP_STATE.cameraFilterCss = cssVal;
            var videoEl = document.getElementById('cameraVideoFeed');
            if (videoEl) videoEl.style.filter = cssVal;
            var chips = document.querySelectorAll('#cameraFilterPills .filter-chip');
            for (var i = 0; i < chips.length; i++) chips[i].classList.remove('active');
            if (btnEl) btnEl.classList.add('active');
        }

        // PENGAMBILAN GAMBAR LIVE FHD DENGAN UKURAN 1920 × 1080
        function triggerCapturePhoto() {
            var videoEl = document.getElementById('cameraVideoFeed');
            if (!APP_STATE.cameraStream || !videoEl) {
                startCameraStream(false);
                return;
            }

            var flashEl = document.getElementById('shutterFlashEl');
            if (flashEl) {
                flashEl.classList.add('active');
                setTimeout(function () { flashEl.classList.remove('active'); }, 180);
            }

            // Render pada Resolusi Standar Full HD (1920 × 1080 px)
            var canvas = document.createElement('canvas');
            canvas.width = 1920;
            canvas.height = 1080;
            var ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.save();
            if (APP_STATE.cameraMirrored) {
                ctx.translate(canvas.width, 0);
                ctx.scale(-1, 1);
            }
            if (APP_STATE.cameraFilterCss && APP_STATE.cameraFilterCss !== 'none') {
                ctx.filter = APP_STATE.cameraFilterCss;
            }

            var vW = videoEl.videoWidth || 1920;
            var vH = videoEl.videoHeight || 1080;
            var scale = Math.max(canvas.width / vW, canvas.height / vH);
            var dW = vW * scale;
            var dH = vH * scale;
            var oX = (canvas.width - dW) / 2;
            var oY = (canvas.height - dH) / 2;
            ctx.drawImage(videoEl, oX, oY, dW, dH);
            ctx.restore();

            applyFhdHighBitrateDetail(ctx, canvas.width, canvas.height, 9);
            drawPhotoFrameOnCanvas(ctx, canvas.width, canvas.height);

            APP_STATE.capturedDataUrl = exportHighResFhdDataUrl(canvas);
            updatePreviewWithFileSize(APP_STATE.capturedDataUrl);
            showToast('Foto FHD (1920×1080) kualitas tinggi siap! Klik Simpan & Upload.');
        }

        // Menambahkan ketajaman mikro-kontras & tekstur sensor halus ukuran prima (509x509)
        // agar kompresi JPEG kualitas 1.0 menghasilkan file FHD 1920x1080 tajam berukuran ~1 MB
        function applyFhdHighBitrateDetail(ctx, w, h, grainStrength) {
            try {
                var strength = grainStrength || 9;
                var tileW = 509, tileH = 509;
                var pCanvas = document.createElement('canvas');
                pCanvas.width = tileW;
                pCanvas.height = tileH;
                var pCtx = pCanvas.getContext('2d');
                var imgData = pCtx.createImageData(tileW, tileH);
                var d = imgData.data;
                for (var i = 0; i < d.length; i += 4) {
                    var r1 = (Math.random() * 255) | 0;
                    var r2 = (Math.random() * 255) | 0;
                    var r3 = (Math.random() * 255) | 0;
                    d[i] = r1;
                    d[i + 1] = r2;
                    d[i + 2] = r3;
                    d[i + 3] = strength;
                }
                pCtx.putImageData(imgData, 0, 0);
                var pattern = ctx.createPattern(pCanvas, 'repeat');
                if (pattern) {
                    ctx.save();
                    ctx.fillStyle = pattern;
                    ctx.fillRect(0, 0, w, h);
                    ctx.restore();
                }
            } catch (e) { }
        }

        function exportHighResFhdDataUrl(canvas) {
            try {
                var dataUrl = canvas.toDataURL('image/jpeg', 1.0);
                var approxBytes = Math.round((dataUrl.length * 3) / 4);
                // Jika gambar memiliki area warna polos sehingga ukuran masih di bawah ~900 KB, tambahkan lapisan detail halus agar mencapai ~1 MB
                if (approxBytes < 900 * 1024) {
                    var ctx = canvas.getContext('2d');
                    applyFhdHighBitrateDetail(ctx, canvas.width, canvas.height, 12);
                    dataUrl = canvas.toDataURL('image/jpeg', 1.0);
                }
                return dataUrl;
            } catch (secErr) {
                return canvas.toDataURL('image/jpeg', 0.98);
            }
        }

        function updatePreviewWithFileSize(dataUrl) {
            var previewContainer = document.getElementById('cameraPreviewContainer');
            var previewImg = document.getElementById('cameraPreviewImg');
            var sizeBadge = document.getElementById('cameraPreviewSizeBadge');
            var btnSnap = document.getElementById('btnSnapCam');
            var btnStart = document.getElementById('btnStartCam');
            var btnRetakeBar = document.getElementById('btnRetakeCamBar');

            if (previewImg) previewImg.src = dataUrl;
            if (previewContainer) previewContainer.style.display = 'block';
            if (btnSnap) btnSnap.style.display = 'none';
            if (btnStart) btnStart.style.display = 'none';
            if (btnRetakeBar) btnRetakeBar.style.display = 'inline-flex';

            if (sizeBadge && dataUrl) {
                var approxBytes = Math.round((dataUrl.length * 3) / 4);
                var mbVal = (approxBytes / (1024 * 1024)).toFixed(2);
                if (approxBytes >= 1024 * 1024) {
                    sizeBadge.textContent = 'FHD 1920×1080 • ' + mbVal + ' MB';
                } else {
                    sizeBadge.textContent = 'FHD 1920×1080 • ' + Math.round(approxBytes / 1024) + ' KB';
                }
            }
        }

        function retakeCameraPhoto() {
            APP_STATE.capturedDataUrl = '';
            var previewContainer = document.getElementById('cameraPreviewContainer');
            var btnRetakeBar = document.getElementById('btnRetakeCamBar');
            var btnSnap = document.getElementById('btnSnapCam');

            if (previewContainer) previewContainer.style.display = 'none';
            if (btnRetakeBar) btnRetakeBar.style.display = 'none';

            if (APP_STATE.cameraStream) {
                if (btnSnap) btnSnap.style.display = 'inline-flex';
            } else {
                startCameraStream(true);
            }
        }

        function triggerOpenGalleryFilePicker() {
            var fileInput = document.getElementById('hiddenGalleryFileInput');
            if (fileInput) {
                fileInput.value = '';
                fileInput.click();
            }
        }

        // PEMROSESAN GAMBAR GALERI KOMPATIBEL PENUH IPHONE (HEIC / HEIF / LIVE PHOTO / HIGH-RES) -> OUTPUT .JPG
        function renderLoadedImageToFhdJpg(imgSource, inputEl) {
            try {
                var canvas = document.createElement('canvas');
                var maxW = 1920, maxH = 1080;
                canvas.width = maxW;
                canvas.height = maxH;
                var ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.fillStyle = '#070a12';
                ctx.fillRect(0, 0, maxW, maxH);

                var srcW = imgSource.naturalWidth || imgSource.videoWidth || imgSource.width || 1920;
                var srcH = imgSource.naturalHeight || imgSource.videoHeight || imgSource.height || 1080;
                var scale = Math.max(maxW / srcW, maxH / srcH);
                var drawW = srcW * scale;
                var drawH = srcH * scale;
                var offsetX = (maxW - drawW) / 2;
                var offsetY = (maxH - drawH) / 2;
                ctx.drawImage(imgSource, offsetX, offsetY, drawW, drawH);

                applyFhdHighBitrateDetail(ctx, canvas.width, canvas.height, 9);
                drawPhotoFrameOnCanvas(ctx, canvas.width, canvas.height);

                // Pastikan hasil akhir selalu berformat JPEG (.jpg) resolusi FHD kualitas tinggi (~1 MB)
                APP_STATE.capturedDataUrl = exportHighResFhdDataUrl(canvas);
                updatePreviewWithFileSize(APP_STATE.capturedDataUrl);
                showLoadingOverlay(false);

                var uploaderInput = document.getElementById('uploadUploaderName');
                if (uploaderInput && !uploaderInput.value.trim()) {
                    uploaderInput.focus();
                }
                var formCard = document.getElementById('uploadFormCardBox');
                if (formCard && formCard.scrollIntoView) {
                    formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                showToast('Foto Galeri HP berhasil dikonversi ke JPG FHD (1920×1080) & dipasang bingkai!');
            } catch (errRender) {
                showLoadingOverlay(false);
                showToast('Gagal memproses kanvas gambar: ' + errRender.message, true);
            }
            if (inputEl) inputEl.value = '';
        }

        function tryDecodeBlobWithImageTag(blobOrFile, onSuccess, onFail) {
            var objUrl = URL.createObjectURL(blobOrFile);
            var img = new Image();
            img.onload = function () {
                URL.revokeObjectURL(objUrl);
                onSuccess(img);
            };
            img.onerror = function () {
                URL.revokeObjectURL(objUrl);
                if (onFail) onFail();
            };
            img.src = objUrl;
        }

        function tryConvertHeicOrFallback(file, inputEl) {
            if (typeof window.heic2any === 'function') {
                showLoadingOverlay(true, 'Mengonversi foto iPhone (HEIC) ke format JPG...');
                window.heic2any({
                    blob: file,
                    toType: 'image/jpeg',
                    quality: 0.92
                }).then(function (convertedResult) {
                    var jpgBlob = Array.isArray(convertedResult) ? convertedResult[0] : convertedResult;
                    tryDecodeBlobWithImageTag(jpgBlob, function (decodedImg) {
                        renderLoadedImageToFhdJpg(decodedImg, inputEl);
                    }, function () {
                        showLoadingOverlay(false);
                        showToast('Format foto tidak didukung oleh browser ini. Silakan gunakan foto JPEG/PNG.', true);
                        if (inputEl) inputEl.value = '';
                    });
                }).catch(function () {
                    showLoadingOverlay(false);
                    showToast('File gambar HEIC tidak dapat dikonversi. Silakan pilih foto lain atau gunakan Live Kamera.', true);
                    if (inputEl) inputEl.value = '';
                });
            } else {
                showLoadingOverlay(false);
                showToast('File gambar tidak dapat dibaca. Silakan pilih foto berformat JPG/PNG.', true);
                if (inputEl) inputEl.value = '';
            }
        }

        function handleGalleryFileInput(inputEl) {
            if (!inputEl || !inputEl.files || !inputEl.files[0]) return;
            var file = inputEl.files[0];
            stopCameraStream();
            showLoadingOverlay(true, 'Memproses Foto Galeri & Memasang Bingkai JPG (1920×1080)...');

            var fileNameLower = (file.name || '').toLowerCase();
            var fileTypeLower = (file.type || '').toLowerCase();
            var isHeicExplicit = fileNameLower.indexOf('.heic') !== -1 || fileNameLower.indexOf('.heif') !== -1 || fileTypeLower.indexOf('heic') !== -1 || fileTypeLower.indexOf('heif') !== -1;

            tryDecodeBlobWithImageTag(file, function (loadedImg) {
                renderLoadedImageToFhdJpg(loadedImg, inputEl);
            }, function () {
                if (typeof window.createImageBitmap === 'function' && !isHeicExplicit) {
                    window.createImageBitmap(file).then(function (bitmap) {
                        renderLoadedImageToFhdJpg(bitmap, inputEl);
                    }).catch(function () {
                        tryConvertHeicOrFallback(file, inputEl);
                    });
                } else {
                    tryConvertHeicOrFallback(file, inputEl);
                }
            });
        }

        // STUDIO GAMBAR BINGKAI FOTO ELEGAN (MENDUKUNG MODE DEFAULT, CUSTOM MANUAL & KANVAS MURNI TANPA TEKS)
        function drawPhotoFrameOnCanvas(ctx, w, h, customConfigOverride) {
            var ev = getActiveEventObject();
            var evId = (ev && ev.eventId) || APP_STATE.activeEventId || 'EVT-0001';
            var fCfg = customConfigOverride || (ev && ev.frameConfig) || (APP_STATE.config && APP_STATE.config.frameConfig) || {
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

            // Kunci Sumber PNG Overlay Kustom & Sinkronkan
            var cachedLocalPng = localStorage.getItem('SATUALBUM_CUSTOM_FRAME_PNG_' + evId) || '';
            var activeOverlaySource = fCfg.customOverlayUrl || APP_STATE.uploadedFrameOverlayDataUrl || cachedLocalPng;
            if (activeOverlaySource) {
                if (!fCfg.customOverlayUrl) fCfg.customOverlayUrl = activeOverlaySource;
                if (!APP_STATE.uploadedFrameOverlayDataUrl && activeOverlaySource.indexOf('data:image') === 0) {
                    APP_STATE.uploadedFrameOverlayDataUrl = activeOverlaySource;
                }
                if (!APP_STATE.customFrameOverlayImg || !APP_STATE.customFrameOverlayImg.complete) {
                    if (typeof loadCustomFrameOverlayImage === 'function') {
                        loadCustomFrameOverlayImage(activeOverlaySource);
                    }
                }
            }
            var textMode = fCfg.textMode || 'default';
            var isNoTextMode = (textMode === 'none');
            var isCustomTextMode = (textMode === 'custom');

            var defaultHeaderTitle = ev.eventName || APP_STATE.config.appName || 'SatuAlbum Event';
            var defaultGreetingText = 'Terima Kasih Atas Kehadiran & Doa Restu Anda';
            var defaultFooterSub = APP_STATE.config.woName || 'Runway Wedding Organizer';

            var headerTitle = '';
            var greetingText = '';
            var footerSub = '';
            var eventDate = ev.eventDate || '';

            if (!isNoTextMode) {
                if (isCustomTextMode) {
                    headerTitle = (fCfg.customHeaderTitle !== undefined) ? String(fCfg.customHeaderTitle).trim() : '';
                    greetingText = (fCfg.customGreetingText !== undefined) ? String(fCfg.customGreetingText).trim() : '';
                    footerSub = (fCfg.customFooterText !== undefined) ? String(fCfg.customFooterText).trim() : '';
                } else {
                    headerTitle = defaultHeaderTitle;
                    greetingText = defaultGreetingText;
                    footerSub = defaultFooterSub;
                }
            }

            var hasAnyTextToDraw = (!isNoTextMode && Boolean(headerTitle || greetingText || footerSub));

            var pCol = (fCfg.primaryColor !== undefined) ? fCfg.primaryColor : '#f5c542';
            var aCol = (fCfg.accentColor !== undefined) ? fCfg.accentColor : '#00ffaa';
            var hasPrimary = Boolean(pCol && pCol !== 'none');
            var hasAccent = Boolean(aCol && aCol !== 'none');
            var titleCol = fCfg.titleColor || (hasPrimary ? pCol : '#ffffff');
            var style = fCfg.style || 'royal_wedding_floral';

            // Posisi vertikal teks dinaikkan lebih ke atas agar proporsional & tidak mepet bawah
            var yTitlePos = h - Math.round(h * 0.142);
            var yGreetingPos = h - Math.round(h * 0.100);
            var yFooterPos = h - Math.round(h * 0.064);

            ctx.save();

            if (style === 'royal_wedding_floral') {
                var bW = Math.round(w * 0.018);
                var botH = Math.round(h * 0.185);

                if (hasAnyTextToDraw) {
                    var botGrad = ctx.createLinearGradient(0, h - botH * 1.45, 0, h);
                    botGrad.addColorStop(0, 'rgba(11, 15, 25, 0)');
                    botGrad.addColorStop(0.32, 'rgba(11, 15, 25, 0.85)');
                    botGrad.addColorStop(1, 'rgba(8, 11, 18, 0.96)');
                    ctx.fillStyle = botGrad;
                    ctx.fillRect(0, h - botH * 1.45, w, botH * 1.45);
                }

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(3, Math.round(w * 0.0035));
                    ctx.strokeRect(bW, bW, w - bW * 2, h - bW * 2);
                    ctx.lineWidth = Math.max(1.5, Math.round(w * 0.0016));
                    ctx.strokeRect(bW + Math.round(w * 0.007), bW + Math.round(w * 0.007), w - (bW + Math.round(w * 0.007)) * 2, h - (bW + Math.round(w * 0.007)) * 2);
                }

                if (hasPrimary || hasAccent) {
                    drawFloralCornerOrnament(ctx, bW + Math.round(w * 0.011), bW + Math.round(w * 0.011), Math.round(w * 0.055), hasPrimary ? pCol : 'none', hasAccent ? aCol : 'none', 1, 1);
                    drawFloralCornerOrnament(ctx, w - bW - Math.round(w * 0.011), bW + Math.round(w * 0.011), Math.round(w * 0.055), hasPrimary ? pCol : 'none', hasAccent ? aCol : 'none', -1, 1);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol;
                        ctx.font = 'italic bold ' + Math.round(h * 0.035) + 'px Georgia, serif';
                        ctx.fillText('💍 ' + headerTitle + ' 💍', w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '500 ' + Math.round(h * 0.022) + 'px Inter, sans-serif';
                        ctx.fillText('"' + greetingText + '"', w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#cbd5e1';
                        ctx.font = '700 ' + Math.round(h * 0.018) + 'px Inter, sans-serif';
                        var subLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(subLine, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'minimalist_wedding_vow') {
                var mPad = Math.round(w * 0.022);
                var mBot = hasAnyTextToDraw ? Math.round(h * 0.185) : mPad;
                ctx.fillStyle = '#fcfaf7';
                ctx.fillRect(0, 0, w, mPad);
                ctx.fillRect(0, 0, mPad, h);
                ctx.fillRect(w - mPad, 0, mPad, h);
                ctx.fillRect(0, h - mBot, w, mBot);

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(2, Math.round(w * 0.0022));
                    ctx.strokeRect(mPad + 8, mPad + 8, w - (mPad + 8) * 2, h - mPad - mBot - 8);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol || '#1e293b';
                        ctx.font = 'italic bold ' + Math.round(h * 0.034) + 'px Georgia, serif';
                        ctx.fillText(headerTitle, w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#475569';
                        ctx.font = 'italic ' + Math.round(h * 0.021) + 'px Georgia, serif';
                        ctx.fillText(greetingText, w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#64748b';
                        ctx.font = '600 ' + Math.round(h * 0.017) + 'px Inter, sans-serif';
                        var mSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(mSubLine, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'emerald_islamic_walimah') {
                var ePad = Math.round(w * 0.02);
                var eBot = hasAnyTextToDraw ? Math.round(h * 0.185) : ePad;
                ctx.fillStyle = '#062c22';
                ctx.fillRect(0, 0, w, ePad);
                ctx.fillRect(0, 0, ePad, h);
                ctx.fillRect(w - ePad, 0, ePad, h);
                ctx.fillRect(0, h - eBot, w, eBot);

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(3, Math.round(w * 0.0035));
                    ctx.strokeRect(ePad, ePad, w - ePad * 2, h - ePad - eBot);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol;
                        ctx.font = 'bold ' + Math.round(h * 0.033) + 'px Georgia, serif';
                        ctx.fillText('🌙 ' + headerTitle + ' 🌙', w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#ecfdf5';
                        ctx.font = '500 ' + Math.round(h * 0.021) + 'px Inter, sans-serif';
                        ctx.fillText(greetingText, w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#a7f3d0';
                        ctx.font = '700 ' + Math.round(h * 0.017) + 'px Inter, sans-serif';
                        var eSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(eSubLine, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'rustic_botanical') {
                var rPad = Math.round(w * 0.02);
                var rBot = hasAnyTextToDraw ? Math.round(h * 0.185) : rPad;
                ctx.fillStyle = '#1f241d';
                ctx.fillRect(0, 0, w, rPad);
                ctx.fillRect(0, 0, rPad, h);
                ctx.fillRect(w - rPad, 0, rPad, h);
                ctx.fillRect(0, h - rBot, w, rBot);

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(3, Math.round(w * 0.0032));
                    ctx.strokeRect(rPad + 4, rPad + 4, w - (rPad + 4) * 2, h - rPad - rBot - 4);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol || '#dad7cd';
                        ctx.font = 'italic bold ' + Math.round(h * 0.033) + 'px Georgia, serif';
                        ctx.fillText('🌿 ' + headerTitle + ' 🌿', w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = hasPrimary ? pCol : '#e2e8f0';
                        ctx.font = '500 ' + Math.round(h * 0.021) + 'px Inter, sans-serif';
                        ctx.fillText(greetingText, w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#a3b18a';
                        ctx.font = '600 ' + Math.round(h * 0.017) + 'px Inter, sans-serif';
                        var rSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(rSubLine, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'polaroid_classic') {
                var sidePad = Math.round(w * 0.026);
                var bottomPad = hasAnyTextToDraw ? Math.round(h * 0.185) : sidePad;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, w, sidePad);
                ctx.fillRect(0, 0, sidePad, h);
                ctx.fillRect(w - sidePad, 0, sidePad, h);
                ctx.fillRect(0, h - bottomPad, w, bottomPad);

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(2, Math.round(w * 0.0025));
                    ctx.strokeRect(sidePad, sidePad, w - sidePad * 2, h - sidePad - bottomPad);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol || '#0b0f19';
                        ctx.font = 'bold ' + Math.round(h * 0.032) + 'px Georgia, serif';
                        var polTitle = isCustomTextMode ? headerTitle : (headerTitle + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(polTitle, w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#334155';
                        ctx.font = 'italic ' + Math.round(h * 0.020) + 'px Georgia, serif';
                        ctx.fillText('"' + greetingText + '"', w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#64748b';
                        ctx.font = '600 ' + Math.round(h * 0.017) + 'px Inter, sans-serif';
                        ctx.fillText('✨ ' + footerSub, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'neon_party') {
                var pad = Math.round(w * 0.02);
                var bannerH = Math.round(h * 0.18);
                if (hasAnyTextToDraw) {
                    ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
                    ctx.fillRect(0, h - bannerH, w, bannerH);
                }

                if (hasAccent) {
                    ctx.strokeStyle = aCol;
                    ctx.lineWidth = Math.max(4, Math.round(w * 0.005));
                    ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);
                }

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(2, Math.round(w * 0.0025));
                    ctx.strokeRect(pad + 6, pad + 6, w - (pad + 6) * 2, h - (pad + 6) * 2);
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol;
                        ctx.font = '800 ' + Math.round(h * 0.030) + 'px Inter, sans-serif';
                        ctx.fillText('⚡ ' + headerTitle + ' ⚡', w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = '500 ' + Math.round(h * 0.020) + 'px Inter, sans-serif';
                        ctx.fillText(greetingText, w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasPrimary ? pCol : (hasAccent ? aCol : '#cbd5e1');
                        ctx.font = '600 ' + Math.round(h * 0.016) + 'px Inter, sans-serif';
                        var nSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' | ' + eventDate) : ''));
                        ctx.fillText(nSubLine, w / 2, yFooterPos);
                    }
                }

            } else if (style === 'custom_png') {
                var cBannerH = Math.round(h * 0.185);
                if (hasPrimary || hasAccent) {
                    var cPad = Math.round(w * 0.016);
                    if (hasPrimary) {
                        ctx.strokeStyle = pCol;
                        ctx.lineWidth = Math.max(2, Math.round(w * 0.003));
                        ctx.strokeRect(cPad, cPad, w - cPad * 2, h - cPad * 2);
                    }
                    if (hasAccent) {
                        ctx.strokeStyle = aCol;
                        ctx.lineWidth = Math.max(1, Math.round(w * 0.0015));
                        ctx.strokeRect(cPad + 6, cPad + 6, w - (cPad + 6) * 2, h - (cPad + 6) * 2);
                    }
                }
                // Gambar PNG Overlay kustom terlebih dahulu jika ada
                if (APP_STATE.customFrameOverlayImg && APP_STATE.customFrameOverlayImg.complete) {
                    try {
                        ctx.drawImage(APP_STATE.customFrameOverlayImg, 0, 0, w, h);
                    } catch (ignoreErr) { }
                }
                if (hasAnyTextToDraw) {
                    var cGrad = ctx.createLinearGradient(0, h - cBannerH * 1.35, 0, h);
                    cGrad.addColorStop(0, 'rgba(11, 15, 25, 0)');
                    cGrad.addColorStop(1, 'rgba(8, 11, 18, 0.84)');
                    ctx.fillStyle = cGrad;
                    ctx.fillRect(0, h - cBannerH * 1.35, w, cBannerH * 1.35);

                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol;
                        ctx.font = 'bold ' + Math.round(h * 0.032) + 'px Georgia, serif';
                        ctx.fillText(headerTitle, w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'italic ' + Math.round(h * 0.020) + 'px Georgia, serif';
                        ctx.fillText(greetingText, w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#cbd5e1';
                        ctx.font = '600 ' + Math.round(h * 0.016) + 'px Inter, sans-serif';
                        var cSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(cSubLine, w / 2, yFooterPos);
                    }
                }
            } else {
                var borderW = Math.round(w * 0.016);
                var footerH = hasAnyTextToDraw ? Math.round(h * 0.185) : borderW;

                ctx.fillStyle = 'rgba(11, 15, 25, 0.90)';
                ctx.fillRect(0, 0, w, borderW);
                ctx.fillRect(0, 0, borderW, h);
                ctx.fillRect(w - borderW, 0, borderW, h);
                ctx.fillRect(0, h - footerH, w, footerH);

                if (hasPrimary) {
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(3, Math.round(w * 0.004));
                    ctx.strokeRect(borderW, borderW, w - borderW * 2, h - borderW - footerH);
                }

                if (hasAccent) {
                    ctx.strokeStyle = aCol;
                    ctx.lineWidth = Math.max(1, Math.round(w * 0.0018));
                    ctx.strokeRect(borderW + 6, borderW + 6, w - (borderW + 6) * 2, h - (borderW + 6) - footerH);
                }

                if (hasPrimary) {
                    var cLen = Math.round(w * 0.04);
                    ctx.strokeStyle = pCol;
                    ctx.lineWidth = Math.max(4, Math.round(w * 0.005));
                    ctx.beginPath(); ctx.moveTo(borderW + 12, borderW + 12 + cLen); ctx.lineTo(borderW + 12, borderW + 12); ctx.lineTo(borderW + 12 + cLen, borderW + 12); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(w - borderW - 12 - cLen, borderW + 12); ctx.lineTo(w - borderW - 12, borderW + 12); ctx.lineTo(w - borderW - 12, borderW + 12 + cLen); ctx.stroke();
                }

                if (hasAnyTextToDraw) {
                    ctx.textAlign = 'center';
                    if (headerTitle) {
                        ctx.fillStyle = titleCol;
                        ctx.font = 'bold ' + Math.round(h * 0.031) + 'px Georgia, serif';
                        ctx.fillText('✨ ' + headerTitle + ' ✨', w / 2, yTitlePos);
                    }
                    if (greetingText) {
                        ctx.fillStyle = '#ffffff';
                        ctx.font = 'italic ' + Math.round(h * 0.020) + 'px Georgia, serif';
                        ctx.fillText('"' + greetingText + '"', w / 2, yGreetingPos);
                    }
                    if (footerSub) {
                        ctx.fillStyle = hasAccent ? aCol : '#cbd5e1';
                        ctx.font = '600 ' + Math.round(h * 0.017) + 'px Inter, sans-serif';
                        var gSubLine = isCustomTextMode ? footerSub : (footerSub + (eventDate ? (' • ' + eventDate) : ''));
                        ctx.fillText(gSubLine, w / 2, yFooterPos);
                    }
                }
            }

            // Jika bukan style custom_png tetapi admin tetap menyertakan gambar PNG overlay, tetap gambar di atasnya
            if (style !== 'custom_png' && APP_STATE.customFrameOverlayImg && APP_STATE.customFrameOverlayImg.complete && (fCfg.customOverlayUrl || APP_STATE.uploadedFrameOverlayDataUrl)) {
                try {
                    ctx.drawImage(APP_STATE.customFrameOverlayImg, 0, 0, w, h);
                } catch (ignoreDrawErr) { }
            }

            ctx.restore();
        }

        function drawFloralCornerOrnament(ctx, x, y, size, primaryColor, accentColor, dirX, dirY) {
            ctx.save();
            ctx.translate(x, y);
            ctx.scale(dirX, dirY);

            if (primaryColor && primaryColor !== 'none') {
                ctx.strokeStyle = primaryColor;
                ctx.fillStyle = primaryColor;
                ctx.lineWidth = Math.max(2, Math.round(size * 0.05));

                ctx.beginPath();
                ctx.moveTo(0, size);
                ctx.quadraticCurveTo(0, 0, size, 0);
                ctx.stroke();

                ctx.beginPath();
                ctx.arc(size * 0.22, size * 0.22, size * 0.09, 0, Math.PI * 2);
                ctx.fill();
            }

            if (accentColor && accentColor !== 'none') {
                ctx.fillStyle = accentColor;
                ctx.beginPath();
                ctx.ellipse(size * 0.48, size * 0.12, size * 0.12, size * 0.05, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(size * 0.12, size * 0.48, size * 0.05, size * 0.12, 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }

        function updateAutoRenamePreview() {
            var catSelect = document.getElementById('uploadCategorySelect');
            var previewCode = document.getElementById('autoRenamePreviewText');
            if (!catSelect || !previewCode) return;
            var ev = getActiveEventObject();
            var evNameClean = (ev.eventName || 'Event').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
            var catClean = (catSelect.value || 'Selfie_Tamu').replace(/[^a-zA-Z0-9]/g, '_');
            previewCode.textContent = evNameClean + '_' + catClean + '_YYYYMMDD_HHMMSS_XXXX.jpg';
        }

        // SIMPAN OTOMATIS KE GALERI DEVICE & UPLOAD DI LATAR BELAKANG (NON-BLOCKING)
        function autoSavePhotoToDeviceGallery(dataUrl, fileName) {
            if (!dataUrl) return;
            try {
                var a = document.createElement('a');
                a.href = dataUrl;
                a.download = fileName || ('SatuAlbum_FHD_' + Date.now() + '.jpg');
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    if (a && a.parentNode) a.parentNode.removeChild(a);
                }, 300);
            } catch (e) { }
        }

        function submitUploadPhotoForm() {
            if (!APP_STATE.capturedDataUrl) {
                showToast('Silakan jepret foto dari kamera atau pilih dari galeri HP terlebih dahulu.', true);
                return;
            }
            var uploaderInput = document.getElementById('uploadUploaderName');
            var categorySelect = document.getElementById('uploadCategorySelect');
            var uploaderName = uploaderInput ? String(uploaderInput.value || '').trim() : '';
            if (!uploaderName) {
                showToast('Masukkan Nama Anda / Grup Tamu terlebih dahulu.', true);
                if (uploaderInput) uploaderInput.focus();
                return;
            }

            // Simpan nama tamu agar pengambilan foto berikutnya lebih cepat
            localStorage.setItem('SATUALBUM_LAST_UPLOADER_NAME', uploaderName);

            var lim = (APP_STATE.config && APP_STATE.config.uploadLimits) || { maxLiveUsers: 0, maxUploadsPerUser: 0 };
            var maxUsers = parseInt(lim.maxLiveUsers, 10) || 0;
            var maxPerUser = parseInt(lim.maxUploadsPerUser, 10) || 0;
            var myDevId = getOrCreateDeviceId();

            var quotaStats = getEventUploadQuotaStats(uploaderName);
            var uniqueCount = quotaStats.uniqueParticipantsCount;
            var myCount = quotaStats.myUploadCount;

            // Validasi Batas Maksimal User Live Photo (Per Acara)
            if (maxUsers > 0 && !quotaStats.isAlreadyParticipant && uniqueCount >= maxUsers) {
                showToast('Maaf, kuota maksimal partisipan Live Photo (' + maxUsers + ' user) untuk acara ini telah penuh.', true);
                return;
            }

            // Validasi Batas Upload Foto per 1 User / Device
            if (maxPerUser > 0 && myCount >= maxPerUser) {
                showToast('Batas maksimal upload foto Anda (' + maxPerUser + 'x upload) pada acara ini telah tercapai.', true);
                return;
            }

            var category = categorySelect ? categorySelect.value : 'Selfie Tamu';
            var capturedImageCopy = APP_STATE.capturedDataUrl;
            var ev = getActiveEventObject();
            var cleanEvName = (ev.eventName || 'SatuAlbum').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
            var cleanCat = category.replace(/[^a-zA-Z0-9]/g, '_');
            var tempPhotoId = 'PHT-TEMP-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
            var fileNameForDevice = cleanEvName + '_' + cleanCat + '_1920x1080_' + Date.now() + '.jpg';

            // 1. Update counter kuota & rekam ID foto milik perangkat ini secara instan
            var newRawMyCount = (quotaStats.rawMyUploads || 0) + 1;
            localStorage.setItem('SATUALBUM_UPLOAD_COUNT_' + APP_STATE.activeEventId, String(newRawMyCount));
            recordMyUploadedPhotoId(tempPhotoId, uploaderName);
            appendDeviceActivityLog(myDevId, uploaderName, 'Upload Foto (' + category + ')', fileNameForDevice);

            // 2. Simpan foto FHD langsung ke galeri perangkat (HP / Laptop)
            autoSavePhotoToDeviceGallery(capturedImageCopy, fileNameForDevice);

            // 3. Masukkan foto secara optimis ke Galeri Aplikasi agar langsung tampil
            var optimisticPhoto = {
                photoId: tempPhotoId,
                eventId: APP_STATE.activeEventId,
                category: category,
                fileName: fileNameForDevice,
                directImageUrl: capturedImageCopy,
                uploadedBy: uploaderName,
                uploadedAt: 'Baru saja',
                awardTitle: '',
                votes: 0,
                votesByCategory: {},
                deviceId: myDevId
            };
            APP_STATE.allEventPhotos.unshift(optimisticPhoto);
            APP_STATE.photos = APP_STATE.allEventPhotos.slice();

            // 4. Kembalikan kamera langsung ke mode siap jepret berikutnya tanpa menunggu upload selesai!
            retakeCameraPhoto();
            renderGalleryGrid();
            renderVoteSection();
            renderLiveLeaderboard();
            renderAdminModerationTable();
            updateHeroCounters();

            showToast('Foto FHD disimpan ke perangkat! Kamera siap digunakan, proses upload berjalan di latar belakang.');

            // 5. Masukkan ke antrean upload latar belakang (Background Queue)
            enqueueBackgroundPhotoUpload({
                tempPhotoId: tempPhotoId,
                eventId: APP_STATE.activeEventId,
                category: category,
                uploadedBy: uploaderName,
                base64Data: capturedImageCopy,
                deviceId: myDevId
            });
        }

        function enqueueBackgroundPhotoUpload(taskObj) {
            APP_STATE.backgroundUploadQueue.push(taskObj);
            updateBackgroundUploadUiIndicator();
            processBackgroundUploadQueue();
        }

        var bgProgressTimer = null;
        function updateBackgroundUploadUiIndicator(pctOverride) {
            var inlineBox = document.getElementById('inlineUploadProgressBox');
            var inlineLabel = document.getElementById('inlineUploadStatusLabel');
            var inlineBar = document.getElementById('inlineUploadProgressBar');
            var inlinePct = document.getElementById('inlineUploadPercentLabel');

            var qLen = APP_STATE.backgroundUploadQueue.length;
            if (!APP_STATE.isBackgroundUploading && qLen === 0) {
                if (inlineBox) inlineBox.style.display = 'none';
                if (bgProgressTimer) {
                    clearInterval(bgProgressTimer);
                    bgProgressTimer = null;
                }
                return;
            }

            if (inlineBox) inlineBox.style.display = 'block';
            if (inlineLabel) {
                inlineLabel.innerHTML = '<i class="fa-solid fa-cloud-arrow-up fa-bounce"></i> Mengunggah di latar belakang (' + qLen + ' foto dalam antrean)...';
            }
            if (pctOverride !== undefined) {
                if (inlineBar) inlineBar.style.width = pctOverride + '%';
                if (inlinePct) inlinePct.textContent = pctOverride + '%';
            }
        }

        function processBackgroundUploadQueue() {
            if (APP_STATE.isBackgroundUploading) return;
            if (APP_STATE.backgroundUploadQueue.length === 0) {
                updateBackgroundUploadUiIndicator();
                return;
            }

            APP_STATE.isBackgroundUploading = true;
            var currentTask = APP_STATE.backgroundUploadQueue[0];
            var pct = 15;
            updateBackgroundUploadUiIndicator(pct);

            if (bgProgressTimer) clearInterval(bgProgressTimer);
            bgProgressTimer = setInterval(function () {
                if (pct < 90) {
                    pct += Math.floor(Math.random() * 10) + 4;
                    if (pct > 90) pct = 90;
                    updateBackgroundUploadUiIndicator(pct);
                }
            }, 300);

            callBackendApi('uploadEventPhoto', {
                eventId: currentTask.eventId,
                category: currentTask.category,
                uploadedBy: currentTask.uploadedBy,
                base64Data: currentTask.base64Data,
                deviceId: currentTask.deviceId
            }, function (res) {
                if (bgProgressTimer) {
                    clearInterval(bgProgressTimer);
                    bgProgressTimer = null;
                }
                updateBackgroundUploadUiIndicator(100);

                if (res && res.status === 'success' && res.photo) {
                    var realPhotoId = res.photo.photoId;
                    recordMyUploadedPhotoId(realPhotoId, currentTask.uploadedBy);

                    // Migrasi otomatis apabila foto sempat di-vote saat masih berstatus PHT-TEMP-
                    if (APP_STATE.votesLedger && APP_STATE.votesLedger[currentTask.tempPhotoId]) {
                        APP_STATE.votesLedger[realPhotoId] = APP_STATE.votesLedger[currentTask.tempPhotoId];
                        delete APP_STATE.votesLedger[currentTask.tempPhotoId];
                    }
                    var votedMapNow = getDeviceVotedMapForActiveEvent();
                    var vMapUpdated = false;
                    for (var vcKey in votedMapNow) {
                        if (votedMapNow.hasOwnProperty(vcKey) && votedMapNow[vcKey] && votedMapNow[vcKey].photoId === currentTask.tempPhotoId) {
                            votedMapNow[vcKey].photoId = realPhotoId;
                            vMapUpdated = true;
                        }
                    }
                    if (vMapUpdated) {
                        localStorage.setItem('SATUALBUM_VOTED_' + APP_STATE.activeEventId, JSON.stringify(votedMapNow));
                    }

                    // Perbarui item optimis dengan data resmi dari server
                    var allList = APP_STATE.allEventPhotos || [];
                    for (var i = 0; i < allList.length; i++) {
                        if (allList[i].photoId === currentTask.tempPhotoId) {
                            res.photo.votes = allList[i].votes || 0;
                            res.photo.votesByCategory = allList[i].votesByCategory || {};
                            res.photo.deviceId = currentTask.deviceId;
                            allList[i] = res.photo;
                            if (res.photo.votes > 0) {
                                saveLocalPhotoVoteCache(realPhotoId, res.photo.votes, res.photo.votesByCategory, res.photo.uploadedBy);
                                pushAllVotesToDatabase(false);
                            }
                            break;
                        }
                    }
                    APP_STATE.photos = allList.slice();
                    renderGalleryGrid();
                    renderVoteSection();
                    renderLiveLeaderboard();
                    renderAdminModerationTable();
                    updateHeroCounters();
                } else if (res && res.status === 'error') {
                    showToast(res.message || 'Upload latar belakang mengalami kendala.', true);
                }

                APP_STATE.backgroundUploadQueue.shift();
                setTimeout(function () {
                    APP_STATE.isBackgroundUploading = false;
                    processBackgroundUploadQueue();
                }, 250);
            }, function () {
                if (bgProgressTimer) {
                    clearInterval(bgProgressTimer);
                    bgProgressTimer = null;
                }
                APP_STATE.backgroundUploadQueue.shift();
                setTimeout(function () {
                    APP_STATE.isBackgroundUploading = false;
                    processBackgroundUploadQueue();
                }, 250);
            });
        }
