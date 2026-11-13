/* ==========================================================================
   DIGITAL PORTFOLIO — ĐỖ NGUYỄN PHƯƠNG ANH (USSH · K70 · 2026)
   Pure Vanilla JavaScript (Tương thích 100% với GitHub Pages)
   ========================================================================== */

(function () {
  'use strict';

  var TOTAL_PAGES = 8;
  var STORAGE_THEME_KEY = 'portfolio_phuonganh_theme_v1';
  var STORAGE_EDITS_KEY = 'portfolio_phuonganh_edits_v1';
  var STORAGE_LINKS_KEY = 'portfolio_phuonganh_links_v1';

  /* ---------- Các hàm logic thuần (có thể kiểm thử độc lập) ---------- */
  function clampPageIndex(index, totalPages) {
    var total = typeof totalPages === 'number' && totalPages > 0 ? totalPages : TOTAL_PAGES;
    var parsed = Number(index);
    if (!Number.isFinite(parsed)) return 0;
    return Math.max(0, Math.min(total - 1, Math.trunc(parsed)));
  }

  function computeReadingProgress(currentIndex, totalPages) {
    var total = typeof totalPages === 'number' && totalPages > 0 ? totalPages : TOTAL_PAGES;
    var safeIndex = clampPageIndex(currentIndex, total);
    return Math.round(((safeIndex + 1) / total) * 100);
  }

  function getActiveChapterKey(viewMode, pageIndex) {
    if (viewMode === 'cover') return 'cover';
    var idx = clampPageIndex(pageIndex, TOTAL_PAGES);
    if (idx === 0) return '0';
    if (idx >= 1 && idx <= 6) return '1';
    return '7';
  }

  function normalizeTheme(theme) {
    return theme === 'dark' ? 'dark' : 'light';
  }

  function isSafeExternalUrl(url) {
    if (typeof url !== 'string') return false;
    var trimmed = url.trim();
    if (!trimmed) return false;
    return /^https?:\/\/.+/i.test(trimmed);
  }

  /* Export cho môi trường Node test (không ảnh hưởng trình duyệt) */
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      TOTAL_PAGES: TOTAL_PAGES,
      clampPageIndex: clampPageIndex,
      computeReadingProgress: computeReadingProgress,
      getActiveChapterKey: getActiveChapterKey,
      normalizeTheme: normalizeTheme,
      isSafeExternalUrl: isSafeExternalUrl
    };
  }

  if (typeof document === 'undefined') {
    return;
  }

  /* ---------- Khởi tạo ứng dụng khi DOM sẵn sàng ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    var state = {
      viewMode: 'cover',
      pageIndex: 0,
      editMode: false,
      confirmResetPending: false,
      localObjectUrls: {}
    };

    var coverView = document.getElementById('cover-view');
    var magazineView = document.getElementById('magazine-view');
    var topbarLinks = document.querySelectorAll('.topbar__link');
    var brandHomeLink = document.getElementById('brand-home-link');
    var openPortfolioBtn = document.getElementById('open-portfolio-btn');
    var coverTocBtn = document.getElementById('cover-toc-btn');
    var backToCoverBtn = document.getElementById('back-to-cover-btn');
    var printPortfolioBtn = document.getElementById('print-portfolio-btn');

    var tocSidebar = document.getElementById('toc-sidebar');
    var mobileTocToggle = document.getElementById('mobile-toc-toggle');
    var mobileTocClose = document.getElementById('mobile-toc-close');
    var drawerScrim = document.getElementById('drawer-scrim');
    var tocButtons = document.querySelectorAll('[data-goto-page]');

    var pages = document.querySelectorAll('.magazine-page');
    var prevPageBtn = document.getElementById('prev-page-btn');
    var nextPageBtn = document.getElementById('next-page-btn');
    var pagerIndicator = document.getElementById('pager-indicator');
    var readingPageCounter = document.getElementById('reading-page-counter');
    var mobilePageStatus = document.getElementById('mobile-page-status');
    var currentChapterLabel = document.getElementById('current-chapter-label');
    var readingProgressFill = document.getElementById('reading-progress-fill');
    var readingProgressBar = document.querySelector('.reading-progress');

    var themeToggleBtn = document.getElementById('theme-toggle-btn');
    var themeIcon = document.getElementById('theme-icon');
    var themeLabel = document.getElementById('theme-label');

    var backToTopBtn = document.getElementById('back-to-top-btn');

    var toggleEditModeBtn = document.getElementById('toggle-edit-mode-btn');
    var editModeLabel = document.getElementById('edit-mode-label');
    var resetEditsBtn = document.getElementById('reset-edits-btn');
    var editModeBanner = document.getElementById('edit-mode-banner');
    var editableBlocks = document.querySelectorAll('.editable-block[data-edit-id]');
    var defaultBlockHtml = {};

    var lightboxModal = document.getElementById('lightbox-modal');
    var lightboxTitle = document.getElementById('lightbox-title');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxEmpty = document.getElementById('lightbox-empty');
    var lightboxEmptyPath = document.getElementById('lightbox-empty-path');
    var lightboxCloseBtn = document.getElementById('lightbox-close-btn');

    var pdfModal = document.getElementById('pdf-modal');
    var pdfModalTitle = document.getElementById('pdf-modal-title');
    var pdfModalPath = document.getElementById('pdf-modal-path');
    var pdfModalDownload = document.getElementById('pdf-modal-download');
    var pdfIframe = document.getElementById('pdf-iframe');
    var pdfEmpty = document.getElementById('pdf-empty');
    var pdfEmptyHint = document.getElementById('pdf-empty-hint');
    var pdfCloseBtn = document.getElementById('pdf-close-btn');
    var localPdfInput = document.getElementById('local-pdf-input');

    /* ---------- 1. Giao diện Sáng / Tối ---------- */
    function applyTheme(theme) {
      var safeTheme = normalizeTheme(theme);
      document.documentElement.setAttribute('data-theme', safeTheme);
      var isDark = safeTheme === 'dark';
      if (themeToggleBtn) themeToggleBtn.setAttribute('aria-pressed', String(isDark));
      if (themeIcon) themeIcon.textContent = isDark ? '☾' : '☀';
      if (themeLabel) themeLabel.textContent = isDark ? 'Giao diện sáng' : 'Giao diện tối';
      try {
        localStorage.setItem(STORAGE_THEME_KEY, safeTheme);
      } catch (e) {
        /* Bỏ qua nếu trình duyệt chặn localStorage */
      }
    }

    function initTheme() {
      var saved = null;
      try {
        saved = localStorage.getItem(STORAGE_THEME_KEY);
      } catch (e) {
        saved = null;
      }
      if (saved) {
        applyTheme(saved);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
      } else {
        applyTheme('light');
      }
    }

    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', function () {
        var current = document.documentElement.getAttribute('data-theme');
        applyTheme(current === 'dark' ? 'light' : 'dark');
      });
    }

    /* ---------- 2. Điều hướng Trang bìa & Các trang tạp chí ---------- */
    function updateTopbarActive() {
      var activeKey = getActiveChapterKey(state.viewMode, state.pageIndex);
      topbarLinks.forEach(function (link) {
        var target = link.getAttribute('data-nav-target');
        var pageIdx = link.getAttribute('data-page-index');
        var isMatch =
          (activeKey === 'cover' && target === 'cover') ||
          (activeKey !== 'cover' && target === 'page' && pageIdx === activeKey);
        link.classList.toggle('is-active', isMatch);
      });
    }

    function renderView() {
      var isCover = state.viewMode === 'cover';
      if (coverView) coverView.hidden = !isCover;
      if (magazineView) magazineView.hidden = isCover;

      if (!isCover) {
        state.pageIndex = clampPageIndex(state.pageIndex, pages.length);

        pages.forEach(function (pageEl, idx) {
          pageEl.classList.toggle('is-active', idx === state.pageIndex);
        });

        tocButtons.forEach(function (btn) {
          var targetIdx = Number(btn.getAttribute('data-goto-page'));
          var active = targetIdx === state.pageIndex;
          btn.classList.toggle('is-active', active);
          if (active) {
            btn.setAttribute('aria-current', 'page');
          } else {
            btn.removeAttribute('aria-current');
          }
        });

        var pageText = 'Trang ' + (state.pageIndex + 1) + ' / ' + pages.length;
        var pct = computeReadingProgress(state.pageIndex, pages.length);
        var activePage = pages[state.pageIndex];
        var chapterTitle = activePage ? activePage.getAttribute('data-chapter-label') : '';

        if (pagerIndicator) pagerIndicator.textContent = pageText;
        if (readingPageCounter) readingPageCounter.textContent = pageText + ' · ' + pct + '%';
        if (mobilePageStatus) mobilePageStatus.textContent = pageText;
        if (currentChapterLabel && chapterTitle) currentChapterLabel.textContent = chapterTitle;
        if (readingProgressFill) readingProgressFill.style.width = pct + '%';
        if (readingProgressBar) readingProgressBar.setAttribute('aria-valuenow', String(pct));

        if (prevPageBtn) prevPageBtn.disabled = state.pageIndex === 0;
        if (nextPageBtn) nextPageBtn.disabled = state.pageIndex === pages.length - 1;
      }

      updateTopbarActive();
    }

    function showCover() {
      state.viewMode = 'cover';
      closeMobileToc();
      renderView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        history.replaceState(null, '', '#trang-bia');
      } catch (e) {}
    }

    function goToPage(index) {
      state.viewMode = 'magazine';
      state.pageIndex = clampPageIndex(index, pages.length);
      closeMobileToc();
      renderView();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        history.replaceState(null, '', '#trang-' + (state.pageIndex + 1));
      } catch (e) {}
    }

    if (brandHomeLink) {
      brandHomeLink.addEventListener('click', function (e) {
        e.preventDefault();
        showCover();
      });
    }

    if (openPortfolioBtn) {
      openPortfolioBtn.addEventListener('click', function () {
        goToPage(0);
      });
    }

    if (coverTocBtn) {
      coverTocBtn.addEventListener('click', function () {
        goToPage(0);
        if (window.innerWidth <= 1024) {
          openMobileToc();
        }
      });
    }

    if (backToCoverBtn) {
      backToCoverBtn.addEventListener('click', showCover);
    }

    topbarLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        var target = link.getAttribute('data-nav-target');
        if (target === 'cover') {
          showCover();
        } else {
          goToPage(Number(link.getAttribute('data-page-index') || 0));
        }
      });
    });

    tocButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        goToPage(Number(btn.getAttribute('data-goto-page') || 0));
      });
    });

    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', function () {
        if (state.pageIndex > 0) goToPage(state.pageIndex - 1);
      });
    }

    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', function () {
        if (state.pageIndex < pages.length - 1) goToPage(state.pageIndex + 1);
      });
    }

    /* ---------- 3. Menu Mục lục trên thiết bị di động ---------- */
    function openMobileToc() {
      if (!tocSidebar) return;
      tocSidebar.classList.add('is-open');
      if (drawerScrim) drawerScrim.hidden = false;
      if (mobileTocToggle) mobileTocToggle.setAttribute('aria-expanded', 'true');
    }

    function closeMobileToc() {
      if (!tocSidebar) return;
      tocSidebar.classList.remove('is-open');
      if (drawerScrim) drawerScrim.hidden = true;
      if (mobileTocToggle) mobileTocToggle.setAttribute('aria-expanded', 'false');
    }

    if (mobileTocToggle) mobileTocToggle.addEventListener('click', openMobileToc);
    if (mobileTocClose) mobileTocClose.addEventListener('click', closeMobileToc);
    if (drawerScrim) drawerScrim.addEventListener('click', closeMobileToc);

    /* ---------- 4. Quản lý Ảnh & Placeholder + Thử ảnh từ máy ---------- */
    function setImageReadyState(slot, isLoaded) {
      var img = document.querySelector('img[data-managed-img="' + slot + '"]');
      var placeholder = document.querySelector('[data-placeholder-for="' + slot + '"]');
      if (img) {
        img.classList.toggle('is-hidden', !isLoaded);
      }
      if (placeholder) {
        placeholder.classList.toggle('is-visible', !isLoaded);
      }
    }

    function initManagedImages() {
      var imgs = document.querySelectorAll('img[data-managed-img]');
      imgs.forEach(function (img) {
        var slot = img.getAttribute('data-managed-img');
        img.addEventListener('load', function () {
          if (img.naturalWidth > 0) {
            setImageReadyState(slot, true);
          } else {
            setImageReadyState(slot, false);
          }
        });
        img.addEventListener('error', function () {
          setImageReadyState(slot, false);
        });

        /* Kiểm tra trạng thái ngay khi DOM vừa tải xong */
        if (img.complete) {
          setImageReadyState(slot, img.naturalWidth > 0);
        }

        /* Nhấn trực tiếp vào ảnh minh chứng để phóng to */
        if (slot.indexOf('bai') === 0) {
          img.addEventListener('click', function () {
            var zoomBtn = document.querySelector('[data-zoom-slot="' + slot + '"]');
            var title = zoomBtn ? zoomBtn.getAttribute('data-zoom-title') : 'Ảnh minh chứng';
            openLightbox(slot, title);
          });
        }
      });

      var uploadInputs = document.querySelectorAll('input[data-preview-upload]');
      uploadInputs.forEach(function (input) {
        input.addEventListener('change', function () {
          var file = input.files && input.files[0];
          if (!file) return;
          var slot = input.getAttribute('data-preview-upload');
          var targetImg = document.querySelector('img[data-managed-img="' + slot + '"]');
          if (!targetImg) return;
          if (state.localObjectUrls[slot]) {
            URL.revokeObjectURL(state.localObjectUrls[slot]);
          }
          var objectUrl = URL.createObjectURL(file);
          state.localObjectUrls[slot] = objectUrl;
          targetImg.src = objectUrl;
        });
      });
    }

    /* ---------- 5. Modal Phóng to ảnh minh chứng (Lightbox) ---------- */
    function openLightbox(slot, title) {
      if (!lightboxModal) return;
      var img = document.querySelector('img[data-managed-img="' + slot + '"]');
      var hasImage = img && !img.classList.contains('is-hidden') && img.naturalWidth > 0;

      if (lightboxTitle) lightboxTitle.textContent = title || 'Ảnh minh chứng';

      if (hasImage) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt || title || 'Ảnh minh chứng phóng to';
        lightboxImg.hidden = false;
        if (lightboxEmpty) lightboxEmpty.hidden = true;
      } else {
        lightboxImg.hidden = true;
        if (lightboxEmpty) {
          lightboxEmpty.hidden = false;
          if (lightboxEmptyPath) {
            lightboxEmptyPath.textContent = 'Hãy đặt ảnh minh chứng vào thư mục images/' + slot + '.jpg hoặc dùng nút "Thử ảnh từ máy".';
          }
        }
      }

      lightboxModal.hidden = false;
      if (lightboxCloseBtn) lightboxCloseBtn.focus();
    }

    function closeLightbox() {
      if (!lightboxModal) return;
      lightboxModal.hidden = true;
      if (lightboxImg) lightboxImg.src = '';
    }

    document.querySelectorAll('[data-zoom-slot]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var slot = btn.getAttribute('data-zoom-slot');
        var title = btn.getAttribute('data-zoom-title');
        openLightbox(slot, title);
      });
    });

    if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
    if (lightboxModal) {
      lightboxModal.addEventListener('click', function (e) {
        if (e.target === lightboxModal) closeLightbox();
      });
    }

    /* ---------- 6. Modal Xem & Tải tài liệu PDF ---------- */
    function showPdfInIframe(url) {
      if (!pdfIframe || !pdfEmpty) return;
      pdfIframe.src = url;
      pdfIframe.hidden = false;
      pdfEmpty.hidden = true;
    }

    function showPdfMissingState(pdfPath) {
      if (!pdfIframe || !pdfEmpty) return;
      pdfIframe.hidden = true;
      pdfIframe.src = '';
      pdfEmpty.hidden = false;
      if (pdfEmptyHint) {
        pdfEmptyHint.textContent =
          'Hãy đặt tệp PDF của bạn vào đường dẫn "' +
          pdfPath +
          '" trong thư mục dự án, hoặc mở thử tệp PDF từ máy tính ngay bên dưới.';
      }
    }

    function verifyPdfExists(pdfPath) {
      if (window.location.protocol === 'file:' || typeof fetch !== 'function') {
        return Promise.resolve(true);
      }
      return fetch(pdfPath, { method: 'HEAD' })
        .then(function (res) {
          if (!res.ok) return false;
          var contentType = (res.headers.get('content-type') || '').toLowerCase();
          /* Tránh trường hợp server trả về fallback index.html (text/html) thay vì tệp PDF thật */
          if (contentType && contentType.indexOf('text/html') !== -1) {
            return false;
          }
          return true;
        })
        .catch(function () {
          return false;
        });
    }

    function openPdfModal(pdfPath, title) {
      if (!pdfModal) return;
      if (pdfModalTitle) pdfModalTitle.textContent = title || 'Tài liệu PDF';
      if (pdfModalPath) pdfModalPath.textContent = pdfPath;
      if (pdfModalDownload) {
        pdfModalDownload.href = pdfPath;
        pdfModalDownload.setAttribute('download', pdfPath.split('/').pop() || 'tailieu.pdf');
      }

      pdfModal.hidden = false;
      if (pdfCloseBtn) pdfCloseBtn.focus();

      verifyPdfExists(pdfPath).then(function (exists) {
        if (exists) {
          showPdfInIframe(pdfPath);
        } else {
          showPdfMissingState(pdfPath);
        }
      });
    }

    function closePdfModal() {
      if (!pdfModal) return;
      pdfModal.hidden = true;
      if (pdfIframe) pdfIframe.src = '';
    }

    document.querySelectorAll('[data-open-pdf]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var path = btn.getAttribute('data-open-pdf');
        var title = btn.getAttribute('data-pdf-title');
        openPdfModal(path, title);
      });
    });

    document.querySelectorAll('[data-download-pdf]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.location.protocol === 'file:') return;
        e.preventDefault();
        var pdfPath = link.getAttribute('data-download-pdf');
        verifyPdfExists(pdfPath).then(function (exists) {
          if (exists) {
            var tempA = document.createElement('a');
            tempA.href = pdfPath;
            tempA.download = pdfPath.split('/').pop() || 'tailieu.pdf';
            document.body.appendChild(tempA);
            tempA.click();
            document.body.removeChild(tempA);
          } else {
            openPdfModal(pdfPath, 'Chưa có tệp PDF để tải xuống');
          }
        });
      });
    });

    if (localPdfInput) {
      localPdfInput.addEventListener('change', function () {
        var file = localPdfInput.files && localPdfInput.files[0];
        if (!file) return;
        if (state.localObjectUrls.pdfPreview) {
          URL.revokeObjectURL(state.localObjectUrls.pdfPreview);
        }
        var url = URL.createObjectURL(file);
        state.localObjectUrls.pdfPreview = url;
        if (pdfModalDownload) {
          pdfModalDownload.href = url;
          pdfModalDownload.setAttribute('download', file.name);
        }
        showPdfInIframe(url);
      });
    }

    if (pdfCloseBtn) pdfCloseBtn.addEventListener('click', closePdfModal);
    if (pdfModal) {
      pdfModal.addEventListener('click', function (e) {
        if (e.target === pdfModal) closePdfModal();
      });
    }

    /* ---------- 7. Chế độ chỉnh sửa nhanh & Lưu cục bộ ---------- */
    function loadSavedEdits() {
      var savedBlocks = {};
      var savedLinks = {};
      try {
        savedBlocks = JSON.parse(localStorage.getItem(STORAGE_EDITS_KEY) || '{}');
        savedLinks = JSON.parse(localStorage.getItem(STORAGE_LINKS_KEY) || '{}');
      } catch (e) {
        savedBlocks = {};
        savedLinks = {};
      }

      editableBlocks.forEach(function (block) {
        var id = block.getAttribute('data-edit-id');
        defaultBlockHtml[id] = block.innerHTML;
        if (savedBlocks && typeof savedBlocks[id] === 'string') {
          block.innerHTML = savedBlocks[id];
        }
        block.addEventListener('input', function () {
          try {
            var current = JSON.parse(localStorage.getItem(STORAGE_EDITS_KEY) || '{}');
            current[id] = block.innerHTML;
            localStorage.setItem(STORAGE_EDITS_KEY, JSON.stringify(current));
          } catch (e) {}
        });
      });

      document.querySelectorAll('[data-link-id]').forEach(function (wrap) {
        var linkId = wrap.getAttribute('data-link-id');
        var anchor = wrap.querySelector('[data-product-link]');
        if (anchor && savedLinks && isSafeExternalUrl(savedLinks[linkId])) {
          anchor.href = savedLinks[linkId];
          anchor.textContent = savedLinks[linkId];
          anchor.classList.remove('is-empty');
        }
        if (anchor) {
          anchor.addEventListener('click', function (e) {
            if (anchor.classList.contains('is-empty')) {
              e.preventDefault();
            }
          });
        }
      });
    }

    function setEditMode(enabled) {
      state.editMode = Boolean(enabled);
      document.body.classList.toggle('is-editing', state.editMode);
      if (toggleEditModeBtn) toggleEditModeBtn.setAttribute('aria-pressed', String(state.editMode));
      if (editModeLabel) editModeLabel.textContent = state.editMode ? 'Hoàn tất chỉnh sửa' : 'Chỉnh sửa nhanh';
      if (editModeBanner) editModeBanner.hidden = !state.editMode;
      if (resetEditsBtn) {
        resetEditsBtn.hidden = !state.editMode;
        resetEditsBtn.textContent = 'Khôi phục mẫu';
        state.confirmResetPending = false;
      }

      editableBlocks.forEach(function (block) {
        block.setAttribute('contenteditable', state.editMode ? 'true' : 'false');
      });

      document.querySelectorAll('[data-link-id]').forEach(function (wrap) {
        var existingInputRow = wrap.querySelector('.link-inline-editor');
        if (state.editMode && !existingInputRow) {
          var linkId = wrap.getAttribute('data-link-id');
          var anchor = wrap.querySelector('[data-product-link]');
          var editor = document.createElement('div');
          editor.className = 'link-inline-editor';

          var input = document.createElement('input');
          input.type = 'url';
          input.className = 'link-inline-input';
          input.placeholder = 'Dán đường dẫn https://...';
          input.value = anchor && !anchor.classList.contains('is-empty') ? anchor.href : '';

          var saveBtn = document.createElement('button');
          saveBtn.type = 'button';
          saveBtn.className = 'link-edit-btn';
          saveBtn.textContent = 'Lưu liên kết';

          saveBtn.addEventListener('click', function () {
            var val = input.value.trim();
            if (isSafeExternalUrl(val)) {
              anchor.href = val;
              anchor.textContent = val;
              anchor.classList.remove('is-empty');
              try {
                var savedLinks = JSON.parse(localStorage.getItem(STORAGE_LINKS_KEY) || '{}');
                savedLinks[linkId] = val;
                localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(savedLinks));
              } catch (e) {}
            } else if (!val) {
              anchor.href = '#';
              anchor.textContent = '[Chưa gắn liên kết — Chỉnh sửa trong HTML hoặc Chế độ chỉnh sửa nhanh]';
              anchor.classList.add('is-empty');
              try {
                var linksObj = JSON.parse(localStorage.getItem(STORAGE_LINKS_KEY) || '{}');
                delete linksObj[linkId];
                localStorage.setItem(STORAGE_LINKS_KEY, JSON.stringify(linksObj));
              } catch (e) {}
            }
          });

          editor.appendChild(input);
          editor.appendChild(saveBtn);
          wrap.appendChild(editor);
        } else if (!state.editMode && existingInputRow) {
          existingInputRow.remove();
        }
      });
    }

    if (toggleEditModeBtn) {
      toggleEditModeBtn.addEventListener('click', function () {
        setEditMode(!state.editMode);
      });
    }

    if (resetEditsBtn) {
      resetEditsBtn.addEventListener('click', function () {
        if (!state.confirmResetPending) {
          state.confirmResetPending = true;
          resetEditsBtn.textContent = 'Nhấn lần nữa để khôi phục';
          return;
        }
        state.confirmResetPending = false;
        resetEditsBtn.textContent = 'Khôi phục mẫu';
        try {
          localStorage.removeItem(STORAGE_EDITS_KEY);
          localStorage.removeItem(STORAGE_LINKS_KEY);
        } catch (e) {}
        editableBlocks.forEach(function (block) {
          var id = block.getAttribute('data-edit-id');
          if (defaultBlockHtml[id]) {
            block.innerHTML = defaultBlockHtml[id];
          }
        });
        document.querySelectorAll('[data-product-link]').forEach(function (anchor) {
          anchor.href = '#';
          anchor.textContent = '[Chưa gắn liên kết — Chỉnh sửa trong HTML hoặc Chế độ chỉnh sửa nhanh]';
          anchor.classList.add('is-empty');
        });
        setEditMode(false);
      });
    }

    /* ---------- 8. Nút Quay về đầu trang, In PDF & Phím tắt ---------- */
    function updateBackToTop() {
      if (!backToTopBtn) return;
      backToTopBtn.hidden = window.scrollY < 260;
    }

    window.addEventListener('scroll', updateBackToTop, { passive: true });

    if (backToTopBtn) {
      backToTopBtn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    if (printPortfolioBtn) {
      printPortfolioBtn.addEventListener('click', function () {
        window.print();
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        if (lightboxModal && !lightboxModal.hidden) closeLightbox();
        if (pdfModal && !pdfModal.hidden) closePdfModal();
        closeMobileToc();
        return;
      }

      var isModalOpen =
        (lightboxModal && !lightboxModal.hidden) ||
        (pdfModal && !pdfModal.hidden);
      var targetTag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
      var isTyping =
        targetTag === 'input' ||
        targetTag === 'textarea' ||
        (e.target && e.target.isContentEditable);

      if (isModalOpen || isTyping || state.viewMode !== 'magazine') return;

      if (e.key === 'ArrowLeft' && state.pageIndex > 0) {
        goToPage(state.pageIndex - 1);
      } else if (e.key === 'ArrowRight' && state.pageIndex < pages.length - 1) {
        goToPage(state.pageIndex + 1);
      }
    });

    /* ---------- 9. Khởi chạy ban đầu ---------- */
    initTheme();
    loadSavedEdits();
    initManagedImages();

    var urlParams = new URLSearchParams(window.location.search);
    var hash = window.location.hash || '';
    if (/^#trang-(\d+)$/.test(hash)) {
      var pageNum = Number(hash.replace('#trang-', ''));
      state.viewMode = 'magazine';
      state.pageIndex = clampPageIndex(pageNum - 1, pages.length);
    } else if (urlParams.get('autostart') === '1') {
      state.viewMode = 'magazine';
      state.pageIndex = 0;
    }

    renderView();
    updateBackToTop();
  });
})();
