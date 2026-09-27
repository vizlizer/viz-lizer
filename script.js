document.addEventListener("DOMContentLoaded", () => {
    
    // --- PRELOADER & HERO VIDEO SYNC LOGIC ---
    const preloader = document.getElementById('preloader');
    const heroVideo = document.getElementById('hero-video');

    function removePreloader() {
        if (preloader) {
            preloader.classList.add('loaded');
            setTimeout(() => { preloader.style.display = 'none'; }, 800);
        }
    }

    window.addEventListener('load', () => {
        if (heroVideo) {
            if (heroVideo.readyState >= 3) {
                removePreloader();
            } else {
                heroVideo.addEventListener('canplaythrough', removePreloader, { once: true });
                setTimeout(removePreloader, 4000); 
            }
        } else {
            removePreloader();
        }
    });

    // --- SCROLL-TRIGGERED POP-UP BUTTON FOR FEATURED PROJECT ---
    const projectWrapper = document.getElementById('project-wrapper');
    const popupBtnContainer = document.getElementById('popup-btn-container');

    if (projectWrapper && popupBtnContainer) {
        const observerOptions = { root: null, threshold: 0.6 };
        const projectObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    popupBtnContainer.classList.add('show');
                } else {
                    popupBtnContainer.classList.remove('show');
                }
            });
        }, observerOptions);
        projectObserver.observe(projectWrapper);
    }

    // --- PAGE TRANSITION FOR GUMROAD & EXPLORE LINKS ---
    const transitionLinks = document.querySelectorAll('a[href*="gumroad.com"], a[href="explore.html"]');
    const transitionOverlay = document.createElement('div');
    transitionOverlay.id = 'page-transition-overlay';
    transitionOverlay.innerHTML = `
        <div class="transition-content">
            <i class="fas fa-compass"></i>
            <div>Loading Experience...</div>
        </div>
    `;
    document.body.appendChild(transitionOverlay);

    transitionLinks.forEach(link => {
        if(link.href.includes('gumroad.com')) {
            link.removeAttribute('target');
            link.removeAttribute('data-gumroad-overlay-checkout');
        }
        link.addEventListener('click', (e) => {
            if (e.ctrlKey || e.metaKey) return; 
            e.preventDefault();
            const targetUrl = link.getAttribute('href');
            transitionOverlay.classList.add('active');
            setTimeout(() => { window.location.href = targetUrl; }, 600); 
        });
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted || transitionOverlay.classList.contains('active')) {
            transitionOverlay.classList.remove('active');
        }
    });

    let global3DMaterial = null;

    // --- REALTIME VFX CURSOR ---
    const canvas = document.getElementById('vfx-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    let particles = [];
    let mouse = { x: width/2, y: height/2, moved: false };
    let currentVfx = localStorage.getItem('vfxType') || 'fire';

    function updateVfxDropdownUI() {
        document.querySelectorAll('.vfx-option').forEach(opt => {
            if (opt.getAttribute('data-vfx') === currentVfx) {
                opt.classList.add('active-vfx');
            } else {
                opt.classList.remove('active-vfx');
            }
        });
    }
    updateVfxDropdownUI();

    document.querySelectorAll('.vfx-option').forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.preventDefault();
            currentVfx = e.target.getAttribute('data-vfx');
            localStorage.setItem('vfxType', currentVfx);
            updateVfxDropdownUI();
            if(currentVfx === 'none') { ctx.clearRect(0, 0, width, height); particles = []; }
        });
    });

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX; mouse.y = e.clientY; mouse.moved = true;
        if (currentVfx !== 'none') {
            for(let i = 0; i < 3; i++) particles.push(new Particle(mouse.x, mouse.y, currentVfx));
        }
    });

    class Particle {
        constructor(x, y, type) {
            this.x = x; this.y = y; this.type = type;
            if (type === 'fire') {
                this.colors = ['#ff5722', '#e64a19', '#ff9800', '#ffcc80'];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.vx = (Math.random() - 0.5) * 2; this.vy = (Math.random() - 0.5) * 2;
                this.life = Math.random() * 0.5 + 0.5; this.size = Math.random() * 15 + 5;
            } else if (type === 'magic') {
                this.colors = ['#00ffff', '#ffffff', '#e0ffff', '#87ceeb'];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.vx = (Math.random() - 0.5) * 4; this.vy = (Math.random() - 0.5) * 4;
                this.life = Math.random() * 0.8 + 0.2; this.size = Math.random() * 5 + 2;
            } else if (type === 'plasma') {
                this.colors = ['#ff00ff', '#8a2be2', '#4b0082', '#ff1493'];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.vx = (Math.random() - 0.5) * 1; this.vy = (Math.random() - 0.5) * 1;
                this.life = Math.random() * 0.6 + 0.4; this.size = Math.random() * 25 + 10;
            } else if (type === 'matrix') {
                this.colors = ['#0f0', '#00ff00', '#32cd32', '#006400'];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.vx = 0; this.vy = Math.random() * 2 + 1; 
                this.life = Math.random() * 0.8 + 0.2; this.size = Math.random() * 6 + 4; 
            } else if (type === 'cyber-blue') {
                this.colors = ['#00a8ff', '#00d2ff', '#0055ff', '#ffffff'];
                this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
                this.vx = (Math.random() - 0.5) * 2.5; this.vy = (Math.random() - 0.5) * 2.5;
                this.life = Math.random() * 0.5 + 0.5; this.size = Math.random() * 12 + 4;
            }
        }
        update() {
            this.x += this.vx; this.y += this.vy;
            if (this.type === 'fire' || this.type === 'cyber-blue') {
                this.vy -= 0.05; this.life -= 0.02; this.size *= 0.95;
            } else if (this.type === 'magic') {
                this.life -= 0.03; this.size *= 0.92;
            } else if (this.type === 'plasma') {
                this.life -= 0.015; this.size *= 0.98;
            } else if (this.type === 'matrix') {
                this.life -= 0.02;
            }
        }
        draw() {
            if(this.type === 'matrix') {
                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = this.color; ctx.globalAlpha = this.life;
                ctx.fillRect(this.x, this.y, this.size, this.size);
            } else {
                ctx.globalCompositeOperation = 'lighter';
                let gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, this.color); gradient.addColorStop(1, 'rgba(0,0,0,0)');
                ctx.fillStyle = gradient; ctx.globalAlpha = this.life;
                ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
            }
        }
    }

    function animateVFX() {
        if (currentVfx === 'none' && particles.length === 0) { requestAnimationFrame(animateVFX); return; }
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update(); particles[i].draw();
            if (particles[i].life <= 0 || particles[i].size <= 0.1) { particles.splice(i, 1); i--; }
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; 
        requestAnimationFrame(animateVFX);
    }
    animateVFX();

    // --- THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('i') : null;
    const currentTheme = localStorage.getItem('theme');
    let isBlueTheme = localStorage.getItem('blueTheme') === 'true';

    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-adjust', 'fa-moon');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            let theme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            if (theme === 'light') {
                if (themeIcon) themeIcon.classList.replace('fa-adjust', 'fa-moon');
            } else {
                if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-adjust');
            }
            localStorage.setItem('theme', theme);
        });
    }

    const secretLogoBtn = document.getElementById('secret-theme-trigger');
    function applySecretTheme(active) {
        if (active) {
            document.body.classList.add('blue-theme');
            if (global3DMaterial) global3DMaterial.color.setHex(0x00a8ff);
            currentVfx = 'cyber-blue'; localStorage.setItem('vfxType', currentVfx);
            updateVfxDropdownUI(); localStorage.setItem('blueTheme', 'true');
        } else {
            document.body.classList.remove('blue-theme');
            if (global3DMaterial) global3DMaterial.color.setHex(0xff5722);
            currentVfx = 'fire'; localStorage.setItem('vfxType', currentVfx);
            updateVfxDropdownUI(); localStorage.setItem('blueTheme', 'false');
        }
    }
    if (isBlueTheme) applySecretTheme(true);
    if (secretLogoBtn) {
        secretLogoBtn.addEventListener('click', () => {
            isBlueTheme = !isBlueTheme; applySecretTheme(isBlueTheme);
        });
    }

    // --- HERO VIDEO PLAYBACK CONTROL ---
    if (heroVideo) {
        heroVideo.currentTime = 0;
        heroVideo.play().catch(error => console.log("Autoplay blocked:", error));
        heroVideo.addEventListener('ended', () => { heroVideo.pause(); heroVideo.currentTime = heroVideo.duration; });
    }

    // --- THREE.JS 3D BACKGROUND ---
    const globalCanvas = document.getElementById('global-3d-canvas');
    if (globalCanvas && typeof THREE !== 'undefined') {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 8;
        const renderer = new THREE.WebGLRenderer({ canvas: globalCanvas, alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        global3DMaterial = new THREE.MeshStandardMaterial({
            color: isBlueTheme ? 0x00a8ff : 0xff5722,
            roughness: 0.3, metalness: 0.7, wireframe: true
        });

        let currentMesh = null;
        let currentBgType = localStorage.getItem('bgType') || 'shape1';

        function set3DGeometry(type) {
            if (currentMesh) { scene.remove(currentMesh); currentMesh.geometry.dispose(); currentMesh = null; }
            let geometry;
            if (type === 'shape1') { geometry = new THREE.IcosahedronGeometry(3.5, 1); global3DMaterial.wireframe = true; }
            else if (type === 'shape2') { geometry = new THREE.TorusKnotGeometry(2.5, 0.8, 100, 16); global3DMaterial.wireframe = true; }
            else if (type === 'shape3') { geometry = new THREE.TorusKnotGeometry(3, 1, 200, 32, 2, 3); global3DMaterial.wireframe = false; }
            else if (type === 'shape4') { geometry = new THREE.TorusGeometry(3.5, 1, 16, 100); global3DMaterial.wireframe = true; }
            else if (type === 'none') return;
            if (geometry) { currentMesh = new THREE.Mesh(geometry, global3DMaterial); scene.add(currentMesh); }
        }
        set3DGeometry(currentBgType);

        function updateBgDropdownUI() {
            document.querySelectorAll('.bg-option').forEach(opt => {
                if (opt.getAttribute('data-bg') === currentBgType) opt.classList.add('active-vfx');
                else opt.classList.remove('active-vfx');
            });
        }
        updateBgDropdownUI();

        document.querySelectorAll('.bg-option').forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.preventDefault();
                currentBgType = e.target.getAttribute('data-bg');
                localStorage.setItem('bgType', currentBgType);
                updateBgDropdownUI(); set3DGeometry(currentBgType);
            });
        });

        scene.add(new THREE.AmbientLight(0xffffff, 1.2));
        const pointLight = new THREE.PointLight(0xffffff, 3);
        pointLight.position.set(5, 5, 5); scene.add(pointLight);

        let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
        window.addEventListener('mousemove', (e) => {
            mouseX = ((e.clientX / window.innerWidth) - 0.5) * Math.PI * 2;
            mouseY = ((e.clientY / window.innerHeight) - 0.5) * Math.PI * 2;
        });
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight);
        });

        function animateGlobal3D() {
            requestAnimationFrame(animateGlobal3D);
            targetX += (mouseX - targetX) * 0.05;
            targetY += (mouseY - targetY) * 0.05;
            if (currentMesh) {
                currentMesh.rotation.x = targetY + Date.now() * 0.0002;
                currentMesh.rotation.y = targetX + Date.now() * 0.0003;
            }
            renderer.render(scene, camera);
        }
        animateGlobal3D();
    }

    // --- CAROUSEL ---
    const track = document.querySelector(".carousel-track");
    const slides = document.querySelectorAll(".carousel-slide");
    const dots = document.querySelectorAll(".dot");
    const prevBtn = document.querySelector(".prev-btn");
    const nextBtn = document.querySelector(".next-btn");
    let currentSlide = 0, slideInterval;

    function showSlide(index) {
        currentSlide = (index + slides.length) % slides.length;
        if(track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
        dots.forEach(dot => dot.classList.remove("active"));
        if(dots[currentSlide]) dots[currentSlide].classList.add("active");
    }
    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }
    function startSlideTimer() { slideInterval = setInterval(nextSlide, 3000); }
    function resetSlideTimer() { clearInterval(slideInterval); startSlideTimer(); }

    if (nextBtn && prevBtn && track) {
        nextBtn.addEventListener("click", () => { nextSlide(); resetSlideTimer(); });
        prevBtn.addEventListener("click", () => { prevSlide(); resetSlideTimer(); });
        dots.forEach((dot, idx) => dot.addEventListener("click", () => { showSlide(idx); resetSlideTimer(); }));
        const container = document.querySelector(".carousel-container");
        if(container) {
            container.addEventListener("mouseenter", () => clearInterval(slideInterval));
            container.addEventListener("mouseleave", () => startSlideTimer());
        }
        startSlideTimer();
    }

    // --- ASSET STORE FILTERS & SEARCH ---
    const filterButtons = document.querySelectorAll(".filter-btn");
    const storeCards = document.querySelectorAll(".store-card");
    const searchInput = document.getElementById("asset-search");
    let currentCategoryFilter = "all";

    function filterAssets() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";
        storeCards.forEach(card => {
            const categories = card.getAttribute("data-category").split(" ");
            const title = card.querySelector("h5").innerText.toLowerCase();
            const matchesCategory = (currentCategoryFilter === "all" || categories.includes(currentCategoryFilter));
            const matchesSearch = title.includes(searchTerm);
            if (matchesCategory && matchesSearch) {
                card.classList.remove("hide");
            } else {
                card.classList.add("hide");
            }
        });
    }

    filterButtons.forEach(button => {
        button.addEventListener("click", () => {
            filterButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
            currentCategoryFilter = button.getAttribute("data-filter");
            filterAssets();
        });
    });
    if (searchInput) searchInput.addEventListener("input", filterAssets);

    // --- MOBILE HAMBURGER MENU ---
    const hamburgerBtn = document.getElementById('hamburger-icon');
    const mainMenu = document.getElementById('main-menu');
    if (hamburgerBtn && mainMenu) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mainMenu.classList.toggle('active');
            const icon = hamburgerBtn.querySelector('i');
            icon.classList.toggle('fa-bars');
            icon.classList.toggle('fa-times');
        });
        document.addEventListener('click', (e) => {
            if (!mainMenu.contains(e.target) && e.target !== hamburgerBtn && !hamburgerBtn.contains(e.target)) {
                mainMenu.classList.remove('active');
                hamburgerBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
            }
        });
    }

    // --- VIZ AI CHATBOT INTERACTION LOGIC ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatUserInput = document.getElementById('chat-user-input');
    const chatMessages = document.getElementById('chat-messages');

    if (chatToggleBtn && chatWindow) {
        chatToggleBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('active');
            if (chatWindow.classList.contains('active')) chatUserInput.focus();
        });
        chatCloseBtn.addEventListener('click', () => chatWindow.classList.remove('active'));

        async function handleUserMessage() {
            const text = chatUserInput.value.trim();
            if (!text) return;
            appendMessage(text, 'user-msg');
            chatUserInput.value = '';
            const typingId = appendMessage('Thinking...', 'bot-msg typing');

            try {
                const response = await fetch('/.netlify/functions/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await response.json();
                document.getElementById(typingId)?.remove();
                if (response.ok) appendMessage(data.reply, 'bot-msg');
                else appendMessage("Sorry, I encountered an error answering that.", 'bot-msg');
            } catch (err) {
                document.getElementById(typingId)?.remove();
                appendMessage("Network error. Please try again later.", 'bot-msg');
            }
        }

        function appendMessage(text, className) {
            const msgDiv = document.createElement('div');
            msgDiv.className = `chat-message ${className}`;
            
            // Converts Markdown links [Text](URL) and raw URLs into clickable HTML links
            let formattedText = text
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: var(--accent-color); text-decoration: underline;">$1</a>')
                .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--accent-color); text-decoration: underline;">$1</a>');
            
            msgDiv.innerHTML = formattedText;
            
            const uniqueId = 'msg-' + Date.now();
            msgDiv.id = uniqueId;
            chatMessages.appendChild(msgDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;
            return uniqueId;
        }

        chatSendBtn.addEventListener('click', handleUserMessage);
        chatUserInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserMessage(); });
    }

    // --- VIDEO LIGHTBOX LOGIC ---
    const videoLightbox = document.getElementById('video-lightbox');
    const lightboxIframe = document.getElementById('lightbox-iframe');
    const videoLightboxContent = document.getElementById('video-lightbox-content');
    const videoRotateBtn = document.querySelector('.video-rotate-btn');
    const carouselSlides = document.querySelectorAll('.carousel-slide');

    // 1. Open Video Lightbox when clicking a slide
    carouselSlides.forEach(slide => {
        slide.addEventListener('click', (e) => {
            const videoId = slide.getAttribute('data-video-id');
            if (videoId) {
                // Construct URL with autoplay
                const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
                lightboxIframe.src = embedUrl;
                videoLightbox.classList.add('active');
            }
        });
    });

    // 2. Close Lightbox when clicking the dark background outside the video
    if (videoLightbox) {
        videoLightbox.addEventListener('click', (e) => {
            if (e.target === videoLightbox) {
                closeVideoLightbox();
            }
        });
    }

    // Function to safely close and reset the video player
    function closeVideoLightbox() {
        videoLightbox.classList.remove('active');
        
        // Wait for fade-out animation to finish, then kill the video & reset rotation
        setTimeout(() => {
            lightboxIframe.src = ""; 
            videoLightboxContent.classList.remove('rotated');
            videoRotateBtn.classList.remove('rotated');
        }, 400);
    }

    // 3. Rotate Button Logic
    if (videoRotateBtn && videoLightboxContent) {
        videoRotateBtn.addEventListener('click', () => {
            videoLightboxContent.classList.toggle('rotated');
            videoRotateBtn.classList.toggle('rotated');
        });
    }
});