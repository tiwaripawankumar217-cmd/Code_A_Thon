document.addEventListener('DOMContentLoaded', () => {
    // Check if we already have the Three.js canvas in boilerplate
    const canvas = document.getElementById('global-transition-canvas');
    if (!canvas) return;

    // We only want this on internal dashboard navigation, not login/logout
    if (window.location.pathname.includes('/auth')) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Create chaotic scribble lines
    const material = new THREE.LineBasicMaterial({ 
        color: 0xFF6B35, 
        transparent: true, 
        opacity: 0.9,
    });

    const linesCount = 200;
    const lines = [];

    // Pre-generate glitch/scribble lines
    for (let i = 0; i < linesCount; i++) {
        const points = [];
        const segments = 15 + Math.random() * 25;
        
        // Start randomly on the screen
        let currentPoint = new THREE.Vector3(
            (Math.random() - 0.5) * 200,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 50
        );
        
        points.push(currentPoint);

        // Generate jagged path
        for (let j = 0; j < segments; j++) {
            currentPoint = new THREE.Vector3(
                currentPoint.x + (Math.random() - 0.5) * 40,
                currentPoint.y + (Math.random() - 0.5) * 40,
                currentPoint.z + (Math.random() - 0.5) * 20
            );
            points.push(currentPoint);
        }

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, material);
        
        // Start them scaled down
        line.scale.set(0, 0, 0); 
        scene.add(line);
        lines.push(line);
    }

    let mode = 'entrance'; // 'entrance' or 'exit'
    let progress = 0;
    let targetUrl = null;
    let isAnimating = true;

    function animate() {
        if (!isAnimating) return;
        requestAnimationFrame(animate);

        if (mode === 'entrance') {
            // Lines start big and shrink/fade out rapidly to reveal the new page
            progress += 0.035;
            const scale = Math.max(0, 1 - progress);
            material.opacity = Math.max(0, 1 - progress);
            
            lines.forEach((line, index) => {
                line.scale.set(scale, scale, scale);
                // Rotate erratically
                line.rotation.z += 0.05 * (index % 2 === 0 ? 1 : -1);
                line.rotation.x += 0.02 * (index % 3 === 0 ? 1 : -1);
            });

            if (progress >= 1) {
                isAnimating = false;
                canvas.style.pointerEvents = 'none';
                scene.remove(...lines); // Cleanup
            }
        } else if (mode === 'exit') {
            // Lines start small and rapidly expand to obscure the screen
            progress += 0.06;
            const scale = Math.min(1.5, progress);
            material.opacity = Math.min(1, progress);

            lines.forEach((line, index) => {
                line.scale.set(scale, scale, scale);
                line.rotation.z += 0.1 * (index % 2 === 0 ? 1 : -1);
                line.rotation.x += 0.08 * (index % 3 === 0 ? 1 : -1);
            });

            if (progress >= 1.5) {
                isAnimating = false;
                if (targetUrl) {
                    window.location.href = targetUrl;
                }
            }
        }

        renderer.render(scene, camera);
    }

    // Set initial entrance state
    lines.forEach(line => line.scale.set(1, 1, 1));
    canvas.style.pointerEvents = 'auto'; // Block clicks during entrance
    canvas.style.zIndex = '99999';
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Intercept clicks on navigation links (sidebar & standard links)
    const links = document.querySelectorAll('nav a, a[href^="/"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Ignore external, logout, login, or anchor links
            if (!href || href.startsWith('http') || href.includes('logout') || href.includes('login') || href === '#') return;
            
            // Ignore if going to the exact same page
            if (href === window.location.pathname) return;

            e.preventDefault();
            targetUrl = href;
            
            // Reset for exit
            lines.forEach(line => scene.add(line));
            progress = 0;
            mode = 'exit';
            isAnimating = true;
            canvas.style.pointerEvents = 'auto'; // Block interaction
            animate();
        });
    });
});
