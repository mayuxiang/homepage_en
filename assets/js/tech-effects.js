/**
 * Tech Effects for Yuxiang MA's Homepage
 * - Particle constellation background
 * - Matrix rain (dark mode + desktop only)
 * - Dark mode toggle (manual, localStorage)
 * - Sidebar typing effect
 * - External link security
 * - Email obfuscation
 */
(function() {
    'use strict';

    // ============================================
    // Reduced Motion check
    // ============================================
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // ============================================
    // Dark Mode — default light, manual toggle only
    // ============================================
    function initDarkMode() {
        var saved = localStorage.getItem('dark-mode');
        if (saved === 'dark') {
            document.body.classList.add('dark-mode');
        }

        var btn = document.createElement('button');
        btn.className = 'dark-mode-toggle';
        btn.setAttribute('aria-label', 'Toggle dark mode');
        btn.setAttribute('aria-pressed', document.body.classList.contains('dark-mode') ? 'true' : 'false');
        btn.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
        btn.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            var isDark = document.body.classList.contains('dark-mode');
            btn.innerHTML = isDark ? '☀️' : '🌙';
            btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            localStorage.setItem('dark-mode', isDark ? 'dark' : 'light');
        });
        document.body.appendChild(btn);
    }

    initDarkMode();

    // ============================================
    // Particle Constellation Background
    // ============================================
    var particleCanvas = document.createElement('canvas');
    particleCanvas.id = 'particle-canvas';
    particleCanvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(particleCanvas);
    var pCtx = particleCanvas.getContext('2d');
    var particles = [];
    var paused = false;

    function resizeCanvas() {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        var count = Math.floor((window.innerWidth * window.innerHeight) / 18000);
        count = Math.max(40, Math.min(count, 120));
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * particleCanvas.width,
                y: Math.random() * particleCanvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                r: Math.random() * 1.5 + 0.5
            });
        }
    }

    function drawParticles() {
        if (!pCtx || paused) return;
        // Skip particle drawing in light mode to save CPU
        var isDark = document.body.classList.contains('dark-mode');
        if (!isDark) { requestAnimationFrame(drawParticles); return; }
        pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
        var dotColor = '0,180,216';
        var lineColor = '0,180,216';

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > particleCanvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > particleCanvas.height) p.vy *= -1;

            pCtx.fillStyle = 'rgba(' + dotColor + ',0.6)';
            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            pCtx.fill();

            for (var j = i + 1; j < particles.length; j++) {
                var p2 = particles[j];
                var dx = p.x - p2.x;
                var dy = p.y - p2.y;
                var dist = dx * dx + dy * dy;
                if (dist < 16000) {
                    pCtx.strokeStyle = 'rgba(' + lineColor + ',' + (0.15 * (1 - dist / 16000)) + ')';
                    pCtx.lineWidth = 0.5;
                    pCtx.beginPath();
                    pCtx.moveTo(p.x, p.y);
                    pCtx.lineTo(p2.x, p2.y);
                    pCtx.stroke();
                }
            }
        }
        requestAnimationFrame(drawParticles);
    }

    // ============================================
    // Matrix Rain — dark mode + desktop only
    // ============================================
    var matrixCanvas = document.createElement('canvas');
    matrixCanvas.id = 'matrix-canvas';
    matrixCanvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(matrixCanvas);
    var mCtx = matrixCanvas.getContext('2d');
    var matrixDrops = [];
    var lastMatrixTime = 0;

    function resizeMatrix() {
        matrixCanvas.width = window.innerWidth;
        matrixCanvas.height = window.innerHeight;
        matrixDrops = [];
        var cols = Math.floor(matrixCanvas.width / 18);
        for (var i = 0; i < cols; i++) {
            matrixDrops.push(Math.random() * -100);
        }
    }

    var matrixChars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

    function drawMatrix() {
        if (!mCtx || paused) return;
        mCtx.fillStyle = 'rgba(0,0,0,0.06)';
        mCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        mCtx.fillStyle = 'rgba(0,180,216,0.12)';
        mCtx.font = '13px monospace';

        for (var i = 0; i < matrixDrops.length; i++) {
            var char = matrixChars[Math.floor(Math.random() * matrixChars.length)];
            mCtx.fillText(char, i * 18, matrixDrops[i] * 18);
            if (matrixDrops[i] * 18 > matrixCanvas.height && Math.random() > 0.985) {
                matrixDrops[i] = 0;
            }
            matrixDrops[i] += 0.5;
        }
    }

    function animateMatrix(timestamp) {
        if (paused) return;
        // Only run matrix rain in dark mode AND on desktop
        var isDark = document.body.classList.contains('dark-mode');
        var isDesktop = window.innerWidth > 768;
        if (isDark && isDesktop) {
            if (timestamp - lastMatrixTime >= 65) {
                drawMatrix();
                lastMatrixTime = timestamp;
            }
        } else {
            // Clear canvas when not active
            if (mCtx) mCtx.clearRect(0, 0, matrixCanvas.width, matrixCanvas.height);
        }
        requestAnimationFrame(animateMatrix);
    }

    // ============================================
    // Typing Effect — Sidebar (all pages)
    // ============================================
    var myPhrases = [
        'Cybersecurity',
        'Trustworthy AI',
        'Embodied AI',
        'Mobile Computing',
        'Intelligent Networked Systems'
    ];

    var henuPhrases = [
        'One of the oldest universities in China'
    ];

    function initTyping() {
        var el = document.getElementById('sidebar-typing-text');
        if (!el) return;

        var isHenu = window.location.pathname.indexOf('/henu/') !== -1;
        var phrases = isHenu ? henuPhrases : myPhrases;
        var pi = 0, ci = 0, deleting = false;

        function type() {
            var phrase = phrases[pi];
            if (deleting) {
                el.textContent = phrase.substring(0, ci - 1);
                ci--;
            } else {
                el.textContent = phrase.substring(0, ci + 1);
                ci++;
            }

            var delay = deleting ? 35 : 70;

            if (!deleting && ci === phrase.length) {
                delay = phrases.length === 1 ? 5000 : 2200;
                deleting = true;
            } else if (deleting && ci === 0) {
                deleting = false;
                pi = (pi + 1) % phrases.length;
                delay = 400;
            }

            setTimeout(type, delay);
        }

        setTimeout(type, 800);
    }

    // ============================================
    // Visibility API — pause animations when hidden
    // ============================================
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            paused = true;
        } else {
            paused = false;
            requestAnimationFrame(animateMatrix);
            requestAnimationFrame(drawParticles);
        }
    });

    // ============================================
    // Init with error handling
    // ============================================
    if (!prefersReducedMotion) {
        try {
            resizeCanvas();
            resizeMatrix();
            createParticles();
            drawParticles();
            requestAnimationFrame(animateMatrix);
        } catch(e) {
            console.warn('Canvas animations unavailable:', e);
        }

        var resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(function() {
                resizeCanvas();
                resizeMatrix();
                createParticles();
            }, 200);
        });
    }

    try {
        initTyping();
    } catch(e) {
        console.warn('Typing effect unavailable:', e);
    }

    // ============================================
    // External links — open in new tab, security attrs
    // ============================================
    try {
        var links = document.querySelectorAll('a[href^="http"]');
        var host = window.location.hostname;
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            if (link.hostname !== host) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        }
    } catch(e) {
        console.warn('External link handling unavailable:', e);
    }

    // ============================================
    // Email obfuscation — construct at runtime
    // ============================================
    try {
        var el = document.getElementById('contact-info');
        if (el) {
            var p1 = el.getAttribute('data-domain');
            var p2 = el.getAttribute('data-tld');
            var p3 = el.getAttribute('data-user');
            var email = p3 + '@' + p1 + '.' + p2;
            var a = document.createElement('a');
            a.href = 'mailto:' + email;
            a.textContent = email;
            a.style.color = 'inherit';
            a.style.textDecoration = 'none';
            a.id = 'contact-info-link';
            el.parentNode.replaceChild(a, el);
        }
    } catch(e) {
        console.warn('Email obfuscation unavailable:', e);
    }
})();
