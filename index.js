 // State values
    let uploadedFile = null;
    let uploadedFileType = null;
    let uploadedFileUrl = null;

    // Element references
    const dropzone = document.getElementById('dropzone');
    const mediaInput = document.getElementById('mediaInput');
    const dropzonePlaceholder = document.getElementById('dropzonePlaceholder');
    const previewContainer = document.getElementById('previewContainer');
    const previewMediaWrapper = document.getElementById('previewMediaWrapper');
    const previewMeta = document.getElementById('previewMeta');
    const removeMediaBtn = document.getElementById('removeMediaBtn');
    
    const createBtn = document.getElementById('createBtn');
    const dialogOverlay = document.getElementById('dialogOverlay');
    const dialogBox = document.getElementById('dialogBox');
    const closeDialogBtn = document.getElementById('closeDialogBtn');
    const confirmLaunchBtn = document.getElementById('confirmLaunchBtn');
    const nativeSizeDisplay = document.getElementById('nativeSizeDisplay');
    const customRadio = document.getElementById('customRadio');
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');

    const customAlert = document.getElementById('customAlert');
    const alertMessage = document.getElementById('alertMessage');
    const dismissAlertBtn = document.getElementById('dismissAlertBtn');

    const wallpaperOutputLayer = document.getElementById('wallpaperOutputLayer');
    const wallpaperMediaContainer = document.getElementById('wallpaperMediaContainer');
    const escapeOverlayBanner = document.getElementById('escapeOverlayBanner');

    // Display current Native screen size inside selection label
    function updateNativeSizeLabel() {
      const w = window.screen.width || window.innerWidth;
      const h = window.screen.height || window.innerHeight;
      nativeSizeDisplay.textContent = `${w} x ${h}`;
    }
    updateNativeSizeLabel();
    window.addEventListener('resize', updateNativeSizeLabel);

    // Dynamic file handling functions
    function handleSelectedFile(file) {
      if (!file) return;

      // Revoke any previous URL to prevent memory leaks
      if (uploadedFileUrl) {
        URL.revokeObjectURL(uploadedFileUrl);
      }

      uploadedFile = file;
      uploadedFileType = file.type;
      uploadedFileUrl = URL.createObjectURL(file);

      // Display size meta or name
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      previewMeta.textContent = `${file.name} (${sizeMB} MB)`;

      // Clear last preview content
      previewMediaWrapper.innerHTML = '';

      if (uploadedFileType.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = uploadedFileUrl;
        img.className = 'max-w-full max-h-full object-contain shadow-lg rounded-2xl no-drag';
        img.draggable = false;
        previewMediaWrapper.appendChild(img);
      } else if (uploadedFileType.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = uploadedFileUrl;
        video.className = 'max-w-full max-h-full object-contain shadow-lg rounded-2xl no-drag';
        video.muted = true;
        video.loop = true;
        video.playsInline = true;
        video.autoplay = true;
        video.draggable = false;
        previewMediaWrapper.appendChild(video);
      } else {
        // Fallback or alert
        showAlert("Unsupported file format detected. Please select an image or video asset.");
        resetUpload();
        return;
      }

      // Hide default icon state, show preview state
      dropzonePlaceholder.classList.add('hidden');
      previewContainer.classList.remove('hidden');
    }

    function resetUpload() {
      if (uploadedFileUrl) {
        URL.revokeObjectURL(uploadedFileUrl);
      }
      uploadedFile = null;
      uploadedFileType = null;
      uploadedFileUrl = null;
      mediaInput.value = '';

      previewMediaWrapper.innerHTML = '';
      dropzonePlaceholder.classList.remove('hidden');
      previewContainer.classList.add('hidden');
    }

    // Interactive Drag and Drop Bindings
    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.add('border-[#d0bcff]', 'bg-[#381e72]/10');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        dropzone.classList.remove('border-[#d0bcff]', 'bg-[#381e72]/10');
      }, false);
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleSelectedFile(files[0]);
      }
    });

    mediaInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files.length > 0) {
        handleSelectedFile(e.target.files[0]);
      }
    });

    removeMediaBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Avoid triggering file selection window
      resetUpload();
    });

    // Custom Alert logic
    function showAlert(msg) {
      alertMessage.textContent = msg;
      customAlert.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
      customAlert.classList.add('translate-y-0', 'opacity-100');
      
      // Auto close after 5 seconds
      setTimeout(() => {
        hideAlert();
      }, 5000);
    }

    function hideAlert() {
      customAlert.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
      customAlert.classList.remove('translate-y-0', 'opacity-100');
    }

    dismissAlertBtn.addEventListener('click', hideAlert);

    // Create Wallpaper Button trigger -> Pop modal selection
    createBtn.addEventListener('click', () => {
      if (!uploadedFile) {
        showAlert("Before executing Backdrop, you must upload or drop a valid wallpaper image or loop video.");
        return;
      }
      // Open Material You Dialog
      dialogOverlay.classList.remove('opacity-0', 'pointer-events-none');
      dialogBox.classList.remove('scale-95', 'opacity-0');
      dialogBox.classList.add('scale-100', 'opacity-100');
    });

    // Close Dialog Modal
    function closeDialog() {
      dialogOverlay.classList.add('opacity-0', 'pointer-events-none');
      dialogBox.classList.add('scale-95', 'opacity-0');
      dialogBox.classList.remove('scale-100', 'opacity-100');
    }

    closeDialogBtn.addEventListener('click', closeDialog);
    dialogOverlay.addEventListener('click', (e) => {
      if (e.target === dialogOverlay) {
        closeDialog();
      }
    });

    // Confirm Backdrop Wallpaper and Launch
    confirmLaunchBtn.addEventListener('click', () => {
      closeDialog();
      initiateWallpaperDisplay();
    });

    // Primary Wallpaper Engine Execution
    function initiateWallpaperDisplay() {
      // Clear host contents
      wallpaperMediaContainer.innerHTML = '';

      // Get selected size option
      const selectedRadio = document.querySelector('input[name="screen_size"]:checked');
      const selectionType = selectedRadio ? selectedRadio.value : 'fit';

      let targetWidth = window.screen.width || window.innerWidth;
      let targetHeight = window.screen.height || window.innerHeight;

      if (selectionType === '1920x1080') {
        targetWidth = 1920;
        targetHeight = 1080;
      } else if (selectionType === '1366x768') {
        targetWidth = 1366;
        targetHeight = 768;
      } else if (selectionType === 'custom') {
        targetWidth = parseInt(customWidth.value) || window.screen.width;
        targetHeight = parseInt(customHeight.value) || window.screen.height;
      }

      // Generate dynamic element containing chosen asset
      let displayEl;
      if (uploadedFileType.startsWith('image/')) {
        displayEl = document.createElement('img');
        displayEl.src = uploadedFileUrl;
        displayEl.style.objectFit = 'cover';
      } else if (uploadedFileType.startsWith('video/')) {
        displayEl = document.createElement('video');
        displayEl.src = uploadedFileUrl;
        displayEl.muted = false; // Allow sound if they want, but default controls hide it. Can toggle back to muted for clean backgrounds
        displayEl.autoplay = true;
        displayEl.loop = true;
        displayEl.playsInline = true;
        displayEl.style.objectFit = 'cover';
      }

      // Configure sizing boundary style explicitly based on selections
      displayEl.className = 'w-full h-full select-none no-drag pointer-events-none';
      displayEl.draggable = false;
      displayEl.style.width = '100vw';
      displayEl.style.height = '100vh';
      
      // Handle drag prevention overrides completely
      displayEl.addEventListener('dragstart', (e) => e.preventDefault());
      displayEl.addEventListener('contextmenu', (e) => e.preventDefault());

      // Inject wallpaper inside wrapper target
      wallpaperMediaContainer.appendChild(displayEl);

      // Attempt browser standard HTML5 Fullscreen to hide all menu bars and borders
      if (wallpaperOutputLayer.requestFullscreen) {
        wallpaperOutputLayer.requestFullscreen().catch(err => {
          console.warn("Fullscreen request declined or blocked: ", err);
        });
      } else if (wallpaperOutputLayer.webkitRequestFullscreen) { /* Safari */
        wallpaperOutputLayer.webkitRequestFullscreen();
      }

      // Activate active state view block
      wallpaperOutputLayer.classList.remove('hidden');
      wallpaperOutputLayer.classList.add('flex');

      // Present temporary exit guidance banner on start, then fade
      escapeOverlayBanner.style.opacity = '1';
      escapeOverlayBanner.style.transform = 'translateY(0px) translateX(-50%)';

      setTimeout(() => {
        escapeOverlayBanner.style.opacity = '0';
        escapeOverlayBanner.style.transform = 'translateY(-20px) translateX(-50%)';
      }, 5000);
    }

    // Function to gracefully close wallpaper display & exit Fullscreen
    function exitWallpaperDisplay() {
      // Exit browser fullscreen mode if enabled
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      } else if (document.webkitFullscreenElement) {
        document.webkitExitFullscreen();
      }

      // Hide display layers
      wallpaperOutputLayer.classList.add('hidden');
      wallpaperOutputLayer.classList.remove('flex');
      wallpaperMediaContainer.innerHTML = '';
    }

    // Keyboard Controller Hook (Ctrl + Alt + S) to Exit display mode
    window.addEventListener('keydown', (e) => {
      // Monitor combinations
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exitWallpaperDisplay();
      }
    });

    // Ensure exit triggers clean UI states even if exited via Esc key natively
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) {
        // Exit triggered from outside shortcut (e.g. Escape key)
        exitWallpaperDisplay();
      }
    });
    document.addEventListener('webkitfullscreenchange', () => {
      if (!document.webkitFullscreenElement) {
        exitWallpaperDisplay();
      }
    });

    // Auto focus Custom inputs when selection changes
    customWidth.addEventListener('focus', () => {
      customRadio.checked = true;
    });
    customHeight.addEventListener('focus', () => {
      customRadio.checked = true;
    });

      tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Google Sans"', '"Roboto Flex"', 'sans-serif'],
          },
          borderRadius: {
            '4xl': '2rem',
            '5xl': '2.5rem',
          }
        }
      }
    }