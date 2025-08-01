// Holographic 3D Globe Animation
import * as THREE from 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.module.js';

class HolographicGlobe {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.dataPoints = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.isHovering = false;
        this.rotationSpeed = 0.001;
        
        this.init();
        this.animate();
    }

    init() {
        // Create scene
        this.scene = new THREE.Scene();
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 3;

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true 
        });
        this.renderer.setSize(300, 300);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create globe container with loading indicator
        const globeContainer = document.createElement('div');
        globeContainer.id = 'globe-container';
        globeContainer.style.cssText = `
            position: absolute;
            top: 50%;
            right: 10%;
            transform: translateY(-50%);
            width: 300px;
            height: 300px;
            z-index: 1;
            pointer-events: auto;
            transition: all 0.3s ease;
            background: radial-gradient(circle, rgba(0,255,255,0.1) 0%, transparent 70%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        // Add loading text
        const loadingText = document.createElement('div');
        loadingText.textContent = 'Loading...';
        loadingText.style.cssText = `
            color: var(--primary-color);
            font-size: 0.8rem;
            text-shadow: 0 0 5px var(--glow-color);
        `;
        globeContainer.appendChild(loadingText);
        
        // Remove loading text when ready
        setTimeout(() => {
            if (loadingText && loadingText.parentNode) {
                loadingText.remove();
            }
            globeContainer.style.background = 'transparent';
        }, 500);
        
        // Add to hero section
        const heroContainer = document.querySelector('.hero-container');
        if (heroContainer) {
            heroContainer.style.position = 'relative';
            heroContainer.appendChild(globeContainer);
        }

        globeContainer.appendChild(this.renderer.domElement);

        // Create holographic globe
        this.createGlobe();
        this.createDataPoints();
        this.addEventListeners();
    }

    createGlobe() {
        // Create low-poly sphere
        const geometry = new THREE.IcosahedronGeometry(1, 3);
        
        // Create holographic material
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3,
            wireframe: true,
            side: THREE.DoubleSide
        });

        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);

        // Add glow effect
        const glowGeometry = new THREE.IcosahedronGeometry(1.1, 3);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);

        // Add grid lines
        const gridGeometry = new THREE.SphereGeometry(1.05, 16, 16);
        const gridMaterial = new THREE.LineBasicMaterial({
            color: 0x8a2be2,
            transparent: true,
            opacity: 0.2
        });

        const grid = new THREE.LineSegments(
            new THREE.WireframeGeometry(gridGeometry),
            gridMaterial
        );
        this.scene.add(grid);

        // Store grid for animation
        this.grid = grid;
    }

    createDataPoints() {
        const dataGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const dataMaterial = new THREE.MeshBasicMaterial({
            color: 0x00bfff,
            transparent: true,
            opacity: 0.8
        });

        // Create random data points around globe
        for (let i = 0; i < 50; i++) {
            const dataPoint = new THREE.Mesh(dataGeometry, dataMaterial);
            
            // Random position on sphere surface
            const phi = Math.random() * Math.PI * 2;
            const theta = Math.random() * Math.PI;
            const radius = 1.2 + Math.random() * 0.3;
            
            dataPoint.position.x = radius * Math.sin(theta) * Math.cos(phi);
            dataPoint.position.y = radius * Math.sin(theta) * Math.sin(phi);
            dataPoint.position.z = radius * Math.cos(theta);
            
            dataPoint.userData = {
                originalOpacity: 0.8,
                pulseSpeed: 0.02 + Math.random() * 0.03,
                baseRadius: radius
            };
            
            this.dataPoints.push(dataPoint);
            this.scene.add(dataPoint);
        }
    }

    addEventListeners() {
        const container = document.getElementById('globe-container');
        
        container.addEventListener('mouseenter', () => {
            this.isHovering = true;
            this.rotationSpeed = 0.003;
        });

        container.addEventListener('mouseleave', () => {
            this.isHovering = false;
            this.rotationSpeed = 0.001;
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            const width = window.innerWidth < 768 ? 200 : 300;
            const height = window.innerWidth < 768 ? 200 : 300;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate globe
        this.globe.rotation.y += this.rotationSpeed;
        if (this.grid) this.grid.rotation.y += this.rotationSpeed * 0.5;

        // Animate data points
        this.dataPoints.forEach((point, index) => {
            // Pulse effect
            const pulse = Math.sin(Date.now() * point.userData.pulseSpeed + index) * 0.3 + 0.7;
            point.material.opacity = point.userData.originalOpacity * pulse;

            // Orbital motion
            const time = Date.now() * 0.0001;
            const radius = point.userData.baseRadius + Math.sin(time + index) * 0.1;
            
            const phi = Math.atan2(point.position.z, point.position.x) + 0.001;
            const theta = Math.acos(point.position.y / radius);
            
            point.position.x = radius * Math.sin(theta) * Math.cos(phi);
            point.position.z = radius * Math.sin(theta) * Math.sin(phi);
        });

        // Scan line effect
        const scanLine = Math.sin(Date.now() * 0.002) * 0.5 + 0.5;
        this.globe.material.opacity = 0.2 + scanLine * 0.2;

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if Three.js is available
    if (typeof THREE !== 'undefined') {
        new HolographicGlobe();
    } else {
        // Fallback: Load Three.js dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = () => {
            new HolographicGlobe();
        };
        document.head.appendChild(script);
    }
});