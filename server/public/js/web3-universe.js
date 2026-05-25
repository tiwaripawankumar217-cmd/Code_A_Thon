
// Three.js 3D Universe Logic
let scene, camera, renderer;
let coreSphere, particlesMesh;
let isDistorting = false;

function initThreeJS() {
    const container = document.getElementById('web3-canvas-container');
    if (!container) return;

    // Scene setup
    scene = new THREE.Scene();
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15;
    camera.position.y = 2;

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffaa55, 0.8); // Warm orange ambient
    scene.add(ambientLight);

    // Directional Core Light
    const dirLight = new THREE.DirectionalLight(0xffddaa, 2);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Create the "Financial Sun" Core
    const coreGeometry = new THREE.SphereGeometry(3, 64, 64);
    const coreMaterial = new THREE.MeshStandardMaterial({
        color: 0xff6b35, // Primary orange brand color
        emissive: 0xab3500,
        emissiveIntensity: 0.5,
        roughness: 0.2,
        metalness: 0.8,
        wireframe: true // Makes it look techy/Web3
    });
    coreSphere = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(coreSphere);

    // Add glowing aura
    const auraGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const auraMaterial = new THREE.MeshBasicMaterial({
        color: 0xffb59d,
        transparent: true,
        opacity: 0.1,
        blending: THREE.AdditiveBlending
    });
    const auraSphere = new THREE.Mesh(auraGeometry, auraMaterial);
    scene.add(auraSphere);

    // Add orbiting particles (transactions)
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 300;
    const posArray = new Float32Array(particlesCount * 3);
    
    for(let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 40;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.1,
        color: 0xffddaa,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Handle Window Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate();
}

function animate() {
    requestAnimationFrame(animate);

    // Gentle rotation
    if (coreSphere) {
        coreSphere.rotation.y += 0.002;
        coreSphere.rotation.x += 0.001;
        
        // If distortion (fraud alert) is active, make it chaotic
        if (isDistorting) {
            coreSphere.rotation.y += 0.05;
            coreSphere.rotation.x += 0.05;
            coreSphere.scale.setScalar(1 + Math.random() * 0.2); // Glitch scale
            coreSphere.material.color.setHex(0xff0000); // Turn red
            coreSphere.material.emissive.setHex(0xaa0000);
        } else {
            // Smoothly return to normal scale
            coreSphere.scale.lerp(new THREE.Vector3(1, 1, 1), 0.05);
            coreSphere.material.color.lerp(new THREE.Color(0xff6b35), 0.05);
            coreSphere.material.emissive.lerp(new THREE.Color(0xab3500), 0.05);
        }
    }

    if (particlesMesh) {
        particlesMesh.rotation.y -= 0.001;
        if (isDistorting) {
            particlesMesh.material.color.setHex(0xff4444); // Particles turn angry red
        } else {
            particlesMesh.material.color.lerp(new THREE.Color(0xffddaa), 0.05);
        }
    }

    renderer.render(scene, camera);
}


function triggerFraudAlert3D() {
    isDistorting = true;
    setTimeout(() => {
        isDistorting = false;
    }, 3000);
}

// Hook into the existing SSE toast system if present
const originalShowFraudToast = window.showFraudToast;
window.showFraudToast = function(data) {
    if (typeof originalShowFraudToast === 'function') {
        originalShowFraudToast(data);
    }
    // Also trigger the 3D visual alert!
    triggerFraudAlert3D();
};

// Initialize
document.addEventListener('DOMContentLoaded', initThreeJS);
