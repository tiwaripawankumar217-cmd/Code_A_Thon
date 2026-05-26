document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('web3-canvas-container');
    if (!container) return;

    // Set up Scene
    const scene = new THREE.Scene();
    
    // Set up Camera
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 250;
    // Shift globe slightly to the right on desktop, center on mobile
    camera.position.x = window.innerWidth > 768 ? -50 : 0; 

    // Set up Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // ==========================================
    // 1. DIGITAL GLOBE (Dotted Outer Shell)
    // ==========================================
    const globeGeometry = new THREE.SphereGeometry(80, 48, 48);
    // Remove some vertices to make it look like a data mesh rather than a solid ball
    const globeMaterial = new THREE.PointsMaterial({
        color: 0xff6b35,
        size: 1.5,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending
    });
    const globe = new THREE.Points(globeGeometry, globeMaterial);
    scene.add(globe);

    // ==========================================
    // 2. WIREFRAME CORE (Security Vault)
    // ==========================================
    const coreGeometry = new THREE.IcosahedronGeometry(70, 2);
    const coreMaterial = new THREE.LineBasicMaterial({
        color: 0xff8555,
        transparent: true,
        opacity: 0.15
    });
    const core = new THREE.LineSegments(
        new THREE.WireframeGeometry(coreGeometry), 
        coreMaterial
    );
    scene.add(core);

    // ==========================================
    // 3. HOLOGRAPHIC RUPEE SIGN
    // ==========================================
    // Create a 2D canvas to draw the Rupee sign
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Draw glowing Rupee
    ctx.clearRect(0, 0, 256, 256);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 160px sans-serif';
    
    // Core text
    ctx.fillStyle = '#ff6b35';
    // Glow effect
    ctx.shadowColor = '#ff8555';
    ctx.shadowBlur = 20;
    ctx.fillText('₹', 128, 128);
    // Double draw for stronger glow
    ctx.fillText('₹', 128, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
        map: texture, 
        color: 0xffffff,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    const rupeeSprite = new THREE.Sprite(spriteMaterial);
    rupeeSprite.scale.set(60, 60, 1);
    scene.add(rupeeSprite);

    // ==========================================
    // 4. DATA PARTICLES ORBITING
    // ==========================================
    const orbitParticleCount = 100;
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPositions = new Float32Array(orbitParticleCount * 3);
    const orbitAngles = [];

    for (let i = 0; i < orbitParticleCount; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos((Math.random() * 2) - 1);
        const radius = 90 + Math.random() * 20; // orbit outside the globe

        orbitPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        orbitPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        orbitPositions[i * 3 + 2] = radius * Math.cos(phi);

        orbitAngles.push({
            speed: (Math.random() - 0.5) * 0.02,
            radius: radius,
            theta: theta,
            phi: phi
        });
    }

    orbitGeometry.setAttribute('position', new THREE.BufferAttribute(orbitPositions, 3));
    const orbitMaterial = new THREE.PointsMaterial({
        color: 0xffb59d,
        size: 2,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    const orbitParticles = new THREE.Points(orbitGeometry, orbitMaterial);
    scene.add(orbitParticles);

    // ==========================================
    // ANIMATION & INTERACTION
    // ==========================================
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    let time = 0;

    const animate = () => {
        requestAnimationFrame(animate);
        time += 0.01;

        // Smooth mouse parallax
        targetX = mouseX * 0.05;
        targetY = mouseY * 0.05;
        scene.position.x += (targetX - scene.position.x) * 0.02;
        scene.position.y += (-targetY - scene.position.y) * 0.02;

        // Rotate globe and core
        globe.rotation.y += 0.002;
        globe.rotation.x += 0.001;
        
        core.rotation.y -= 0.003;
        core.rotation.z += 0.001;

        // Pulse the Rupee sprite slightly
        const pulse = 1 + Math.sin(time * 2) * 0.05;
        rupeeSprite.scale.set(60 * pulse, 60 * pulse, 1);

        // Update orbiting particles
        const positions = orbitGeometry.attributes.position.array;
        for (let i = 0; i < orbitParticleCount; i++) {
            const data = orbitAngles[i];
            data.theta += data.speed;
            
            positions[i * 3] = data.radius * Math.sin(data.phi) * Math.cos(data.theta);
            positions[i * 3 + 1] = data.radius * Math.sin(data.phi) * Math.sin(data.theta);
            positions[i * 3 + 2] = data.radius * Math.cos(data.phi);
        }
        orbitGeometry.attributes.position.needsUpdate = true;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.position.x = window.innerWidth > 768 ? -50 : 0; 
    });
});
