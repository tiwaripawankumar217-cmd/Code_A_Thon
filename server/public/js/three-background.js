document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('web3-canvas-container');
    if (!container) return;

    // Set up Scene
    const scene = new THREE.Scene();
    
    // Set up Camera
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 150;

    // Set up Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Crucial: make sure it doesn't block clicks!
    renderer.domElement.style.pointerEvents = 'none';
    container.appendChild(renderer.domElement);

    // Variables for the Transaction Web
    const particleCount = 120;
    const maxDistance = 40; // Max distance to draw a connecting line
    
    // Geometry for particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleVelocities = [];

    // Distribute particles randomly in a wide 3D space
    for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 400;     // x
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 400; // y
        particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 200; // z

        // Random velocities for drifting
        particleVelocities.push({
            x: (Math.random() - 0.5) * 0.2,
            y: (Math.random() - 0.5) * 0.2,
            z: (Math.random() - 0.5) * 0.2
        });
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    // Material for Particles (Nodes)
    // Using the brand orange color
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0xff6b35,
        size: 2.5,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Geometry and Material for Lines (Connections)
    const linesGeometry = new THREE.BufferGeometry();
    const linesMaterial = new THREE.LineBasicMaterial({
        color: 0xff8555,
        transparent: true,
        opacity: 0.15
    });

    const linesMesh = new THREE.LineSegments(linesGeometry, linesMaterial);
    scene.add(linesMesh);

    // Mouse Parallax Interaction
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

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Smoothly interpolate camera position based on mouse (Parallax)
        targetX = mouseX * 0.05;
        targetY = mouseY * 0.05;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (-targetY - camera.position.y) * 0.02;
        camera.lookAt(scene.position);

        // Update particle positions
        const positions = particlesGeometry.attributes.position.array;
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] += particleVelocities[i].x;
            positions[i * 3 + 1] += particleVelocities[i].y;
            positions[i * 3 + 2] += particleVelocities[i].z;

            // Bounce off boundaries to keep them on screen
            if (Math.abs(positions[i * 3]) > 200) particleVelocities[i].x *= -1;
            if (Math.abs(positions[i * 3 + 1]) > 200) particleVelocities[i].y *= -1;
            if (Math.abs(positions[i * 3 + 2]) > 100) particleVelocities[i].z *= -1;
        }
        particlesGeometry.attributes.position.needsUpdate = true;

        // Calculate distances to draw lines
        const linePositions = [];
        const lineOpacities = [];
        let connections = 0;

        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dx = positions[i * 3] - positions[j * 3];
                const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
                const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
                const distSq = dx * dx + dy * dy + dz * dz;

                if (distSq < maxDistance * maxDistance) {
                    // Add vertices for the line
                    linePositions.push(
                        positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
                        positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
                    );
                    connections++;
                }
            }
        }

        // Update lines geometry
        linesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        
        // Very slow ambient rotation of the entire network
        particlesMesh.rotation.y += 0.0005;
        linesMesh.rotation.y += 0.0005;
        particlesMesh.rotation.x += 0.0002;
        linesMesh.rotation.x += 0.0002;

        renderer.render(scene, camera);
    };

    animate();

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
