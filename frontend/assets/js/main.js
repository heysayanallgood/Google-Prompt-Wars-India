/**
 * AuraVOS Main Application Logic - Refactored for Structural Integrity & WebGL
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Global Scroll & Nav Logic ---
    const navContainer = document.querySelector('.glass-nav-container');
    if (navContainer) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navContainer.style.transform = 'translate(-50%, 0) scale(0.95)';
                navContainer.style.opacity = '0.9';
            } else {
                navContainer.style.transform = 'translate(-50%, 0) scale(1)';
                navContainer.style.opacity = '1';
            }
        });
    }

    // --- WebGL Three.js Routing ---
    // Safely check if Three.js is loaded
    if (typeof THREE !== 'undefined') {
        initHeroWebGL();
        initQuantumLockWebGL();
        initCaseStudiesWebGL();
        initServerStackWebGL(); // New line
        
        // Cyberpunk Subpages
        initHeatmapWebGL();
        initTelemetryWebGL();
        initAlertsWebGL();
        initSettingsWebGL();
    }

    // --- Dashboard Specific Logic ---
    initDashboardWidgets();

    // --- Backend Developer Console Logic ---
    initBackendSimulation();

    // --- Biometric Kiosk Logic ---
    initBiometricScanner();

    // --- Auth Form Logic ---
    initAuthForms();

    // --- Main Universal Cursor ---
    initCustomCursor();

    // --- Global Keyboard Enter Key Implementation ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const activeElem = document.activeElement;
            if (activeElem) {
                // Handle input field specific enter behaviors
                if (activeElem.tagName === 'INPUT') {
                    if (activeElem.id === 'username-input') {
                        const submitBtn = document.getElementById('submit-registry-btn');
                        if (submitBtn) submitBtn.click();
                    }
                } 
                // Ensure all other focusable buttons/elements trigger click on Enter
                else if (typeof activeElem.click === 'function' && activeElem.tagName !== 'BODY') {
                    // Browsers handle buttons/anchors natively in most cases, but this guarantees it
                    // for any element that has focus and can be clicked.
                    if (activeElem.tagName === 'A' || activeElem.tagName === 'BUTTON') {
                         if (!activeElem.href) {
                             e.preventDefault(); 
                             activeElem.click();
                         }
                    } else {
                        e.preventDefault();
                        activeElem.click();
                    }
                }
            }
        }
    });
});

/**
 * Global Custom Cursor initialization
 */
function initCustomCursor() {
    // Only initialize on non-touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const cursorDot = document.createElement('div');
    cursorDot.className = 'custom-cursor-dot';
    
    document.body.appendChild(cursor);
    document.body.appendChild(cursorDot);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    let isHovering = false;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Immediate dot Follow
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    });

    // Smooth follow for the outer ring
    function loop() {
        cursorX += (mouseX - cursorX) * 0.15;
        cursorY += (mouseY - cursorY) * 0.15;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        requestAnimationFrame(loop);
    }
    loop();

    // Hover states for links and buttons using event delegation
    document.addEventListener('mouseover', (e) => {
        const interactable = e.target.closest('a, button, input, textarea, select, .nav-cta, .sso-btn');
        if (interactable) {
            isHovering = true;
            cursor.classList.add('active');
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursorDot.style.background = 'var(--accent-cyan)';
        }
    });

    document.addEventListener('mouseout', (e) => {
        const interactable = e.target.closest('a, button, input, textarea, select, .nav-cta, .sso-btn');
        if (interactable) {
            isHovering = false;
            cursor.classList.remove('active');
            cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorDot.style.background = 'var(--accent-orange)';
        }
    });
    
    document.addEventListener('mousedown', () => {
        if(!isHovering) cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        if(!isHovering) cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

/**
 * Hero Section 3D WebGL (Stadium + Robotic Structure)
 */
function initHeroWebGL() {
    const canvas = document.getElementById('hero-gl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    
    // We don't want a background color, we want it transparent to show the CSS background
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    
    const container = canvas.parentElement;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = 120;
    camera.position.y = 20;
    camera.lookAt(0, 0, 0);

    // ==========================================
    // 1. Enhanced Stadium Construct (Center)
    // ==========================================
    const stadium = new THREE.Group();
    stadium.position.set(-10, -10, 0); // Offset slightly left to balance the robot

    const cyanMaterial = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true, transparent: true, opacity: 0.25, blending: THREE.AdditiveBlending });
    const purpleMaterial = new THREE.MeshBasicMaterial({ color: 0x8A2BE2, wireframe: true, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const solidBlueMat = new THREE.MeshBasicMaterial({ color: 0x002244, transparent: true, opacity: 0.5 });

    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(35, 1.5, 8, 60), cyanMaterial);
    ring1.rotation.x = Math.PI / 2;
    stadium.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(25, 1, 6, 50), purpleMaterial);
    ring2.rotation.x = Math.PI / 2;
    stadium.add(ring2);

    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(15, 0.5, 4, 40), cyanMaterial);
    ring3.rotation.x = Math.PI / 2;
    stadium.add(ring3);

    // Add glowing core base to stadium
    const coreBase = new THREE.Mesh(new THREE.CylinderGeometry(14, 12, 4, 32), solidBlueMat);
    coreBase.position.y = -2;
    stadium.add(coreBase);

    // Flowing Data Particles in the center
    const particleGeo = new THREE.BufferGeometry();
    const particleCount = 400;
    const posArray = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i+=3) {
        posArray[i] = (Math.random() - 0.5) * 30;
        posArray[i+1] = (Math.random() - 0.5) * 20;
        posArray[i+2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.5, color: 0x00F0FF, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const stadiumParticles = new THREE.Points(particleGeo, particleMat);
    stadium.add(stadiumParticles);

    scene.add(stadium);

    // ==========================================
    // 2. Robotic Structure (Right Side Drone/Arm)
    // ==========================================
    const robot = new THREE.Group();
    // Position far right
    robot.position.set(45, 5, 10); 
    scene.add(robot);

    // Mechanical Core (Icosahedron)
    const mechMat = new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: false });
    const mechWireMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, wireframe: true, transparent: true, opacity: 0.8 });
    
    // The Drone Body
    const bodyGeo = new THREE.IcosahedronGeometry(6, 1);
    const droneBody = new THREE.Mesh(bodyGeo, mechMat);
    const droneWire = new THREE.Mesh(bodyGeo, mechWireMat);
    droneBody.add(droneWire);
    robot.add(droneBody);

    // The Robotic "Eye" (Sensor)
    const eyeGeo = new THREE.SphereGeometry(3, 16, 16);
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF }); // Cyan Sensor
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.z = 5;
    droneBody.add(eye);

    // Floating Armor Plates
    const armorPlates = [];
    const armorGeo = new THREE.CylinderGeometry(8, 8, 3, 4, 1, true, 0, Math.PI / 2);
    const armorMat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
    const armorWireMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true });
    
    for(let i=0; i<3; i++) {
        const p = new THREE.Mesh(armorGeo, armorMat);
        const pw = new THREE.Mesh(armorGeo, armorWireMat);
        p.add(pw);
        
        p.rotation.x = Math.PI / 2;
        p.rotation.z = (Math.PI*2/3) * i;
        robot.add(p);
        armorPlates.push(p);
    }

    // Scanning Laser Beam from the eye targeting the stadium
    const laserGeo = new THREE.CylinderGeometry(0.1, 0.4, 60, 8);
    // Move geometry origin to the base so it scales/rotates from the eye correctly
    laserGeo.translate(0, 30, 0); 
    const laserMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const laser = new THREE.Mesh(laserGeo, laserMat);
    
    // Point laser slightly down and left towards the stadium core
    laser.rotation.x = Math.PI / 2 + 0.2;
    laser.rotation.z = Math.PI / 2 + 0.3;
    eye.add(laser); // Attach laser to eye

    // ==========================================
    // Responsive Canvas Resizing
    // ==========================================
    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    let time = 0;
    // Animation Loop
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;

        // Animate Stadium
        stadium.rotation.y += 0.002;
        ring1.rotation.z += 0.001;
        ring2.rotation.z -= 0.002;
        stadiumParticles.rotation.y -= 0.003;
        
        // Jitter particles
        const pArray = stadiumParticles.geometry.attributes.position.array;
        for(let i=1; i < pArray.length; i+=3) {
            pArray[i] += Math.sin(time*5 + i)*0.05;
        }
        stadiumParticles.geometry.attributes.position.needsUpdate = true;

        // Animate Robotic Structure
        // Drone bobbing hover effect
        robot.position.y = 5 + Math.sin(time * 1.5) * 3;
        robot.position.x = 45 + Math.cos(time * 0.8) * 2;
        
        // Drone body slow internal rotation
        droneBody.rotation.y = Math.sin(time * 0.5) * 0.5;
        droneBody.rotation.x = Math.sin(time * 0.7) * 0.3;

        // Rotating armor plates protecting the core
        armorPlates.forEach((plate, index) => {
            plate.rotation.z -= 0.01;
            // Expand/contract slightly
            const scale = 1 + Math.sin(time * 2 + index) * 0.1;
            plate.scale.set(scale, scale, scale);
        });

        // Laser flicker
        laser.material.opacity = 0.2 + Math.random() * 0.2;
        // Make the eye track continuously around the stadium
        laser.rotation.z = (Math.PI / 2 + 0.3) + Math.sin(time) * 0.2;
        laser.rotation.x = (Math.PI / 2 + 0.2) + Math.cos(time * 1.2) * 0.1;

        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Technology Section WebGL (Quantum Lock)
 */
function initQuantumLockWebGL() {
    const canvas = document.getElementById('lock-gl-canvas');
    if (!canvas) return;

    // Use a fixed smaller rendering area for the bento box to ensure it fits and scales correctly
    const container = canvas.parentElement;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 12);
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);

    // Group for entire lock
    const lockGroup = new THREE.Group();

    // 1. Central Cubes (The "Data Bank")
    const boxGeo = new THREE.BoxGeometry(2, 2, 2);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true, transparent: true, opacity: 0.5 });
    const innerBox = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshBasicMaterial({ color: 0x00A0FF, transparent: true, opacity: 0.2 }));
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.add(innerBox);
    lockGroup.add(box);

    // 2. The Locking Shackle (Torus)
    const shackleGeo = new THREE.TorusGeometry(1.5, 0.2, 16, 50, Math.PI); // Half torus
    const shackleMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, wireframe: true });
    const shackle = new THREE.Mesh(shackleGeo, shackleMat);
    shackle.position.y = 1;
    lockGroup.add(shackle);

    // 3. Floating Security Rings
    const rings = [];
    const ringGeo = new THREE.TorusGeometry(3.5, 0.05, 16, 64);
    for(let i=0; i<3; i++) {
        const rMaterial = new THREE.MeshBasicMaterial({ 
            color: (i%2===0) ? 0x00F0FF : 0x8A2BE2, 
            transparent: true, 
            opacity: 0.6 
        });
        const r = new THREE.Mesh(ringGeo, rMaterial);
        r.rotation.x = Math.PI / 2 + (i * 0.5);
        lockGroup.add(r);
        rings.push({ mesh: r, speed: 0.01 + (i*0.005) });
    }

    // 4. Energy Core
    const coreGeo = new THREE.SphereGeometry(0.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
    const core = new THREE.Mesh(coreGeo, coreMat);
    lockGroup.add(core);

    scene.add(lockGroup);

    // Interaction (Rotate on drag)
    let isDragging = false;
    let prevM = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', () => isDragging = true);
    canvas.addEventListener('mousemove', (e) => {
        if(isDragging) {
            lockGroup.rotation.y += (e.offsetX - prevM.x) * 0.01;
            lockGroup.rotation.x += (e.offsetY - prevM.y) * 0.01;
        }
        prevM = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    // Resize Handler
    window.addEventListener('resize', () => {
        if(!canvas.parentElement) return;
        const width = canvas.parentElement.clientWidth;
        const height = canvas.parentElement.clientHeight;
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;

        if(!isDragging) {
            lockGroup.rotation.y += 0.005;
        }

        // Inner Box pulsing
        box.rotation.x += 0.001;
        box.rotation.y += 0.002;

        // Animate Rings
        rings.forEach((r, idx) => {
            r.mesh.rotation.y += r.speed;
            r.mesh.rotation.z += (idx % 2 === 0 ? 0.005 : -0.005);
        });

        // Core pulsing
        const scale = 1 + Math.sin(time * 3) * 0.1;
        core.scale.set(scale, scale, scale);

        // Shackle bobbing
        shackle.position.y = 1 + Math.sin(time) * 0.1;

        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Case Studies Section WebGL (Global Node Map)
 */
function initCaseStudiesWebGL() {
    const canvas = document.getElementById('globe-gl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const container = canvas.parentElement;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 0, 60);

    const globeGroup = new THREE.Group();
    // Offset globe to the right side of the screen
    globeGroup.position.set(20, 0, 0); 
    
    // Check if mobile to center it instead
    if(container.clientWidth < 800) {
        globeGroup.position.set(0, -10, 0);
    }

    // 1. The Wireframe Globe
    const globeGeo = new THREE.SphereGeometry(18, 32, 32);
    const globeMat = new THREE.MeshBasicMaterial({ color: 0x222222, wireframe: true, transparent: true, opacity: 0.6 });
    const globe = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globe);

    // Inner Solid Core
    const coreGeo = new THREE.SphereGeometry(17.5, 32, 32);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0x050505 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    globeGroup.add(core);

    // 2. Data Nodes (Cities)
    const nodeGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00 });
    const cyanNodeMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });

    const numNodes = 40;
    const nodes = [];
    for(let i=0; i<numNodes; i++) {
        const phi = Math.acos(-1 + (2 * i) / numNodes);
        const theta = Math.sqrt(numNodes * Math.PI) * phi;
        
        const mesh = new THREE.Mesh(nodeGeo, Math.random() > 0.5 ? nodeMat : cyanNodeMat);
        
        // Radius = 18 (surface of globe)
        mesh.position.x = 18 * Math.cos(theta) * Math.sin(phi);
        mesh.position.y = 18 * Math.sin(theta) * Math.sin(phi);
        mesh.position.z = 18 * Math.cos(phi);
        
        globeGroup.add(mesh);
        
        // Add ping circle
        if (Math.random() > 0.7) {
            const ringGeo = new THREE.RingGeometry(0.5, 0.6, 16);
            const ringMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
            const ring = new THREE.Mesh(ringGeo, ringMat);
            ring.position.copy(mesh.position);
            ring.lookAt(new THREE.Vector3(0,0,0)); // Look at center
            globeGroup.add(ring);
            nodes.push({ ring: ring, scale: 1 });
        }
    }

    // 3. Orbital Data Rings
    const orbitGeo = new THREE.TorusGeometry(25, 0.05, 16, 100);
    const orbitMat = new THREE.MeshBasicMaterial({ color: 0x8A2BE2, transparent: true, opacity: 0.3 });
    const orbit = new THREE.Mesh(orbitGeo, orbitMat);
    orbit.rotation.x = Math.PI / 2;
    globeGroup.add(orbit);
    
    const orbit2Geo = new THREE.TorusGeometry(22, 0.05, 16, 100);
    const orbit2Mat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.2 });
    const orbit2 = new THREE.Mesh(orbit2Geo, orbit2Mat);
    orbit2.rotation.x = Math.PI / 3;
    orbit2.rotation.y = Math.PI / 4;
    globeGroup.add(orbit2);

    scene.add(globeGroup);

    // Interaction
    let isDragging = false;
    let preM = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', () => isDragging = true);
    canvas.addEventListener('mousemove', (e) => {
        if(isDragging) {
            globeGroup.rotation.x += (e.offsetY - preM.y) * 0.01;
            globeGroup.rotation.y += (e.offsetX - preM.x) * 0.01;
        }
        preM = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('resize', () => {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        
        // Reposition based on screen size
        if(container.clientWidth < 800) {
            globeGroup.position.set(0, -10, 0);
        } else {
            globeGroup.position.set(20, 0, 0);
        }
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.02;

        if(!isDragging) {
            globeGroup.rotation.y += 0.002;
            globeGroup.rotation.x = Math.sin(time * 0.5) * 0.1; // Gentle wobble
        }

        // Animate pings
        nodes.forEach(n => {
            n.scale += 0.05;
            n.ring.scale.set(n.scale, n.scale, n.scale);
            n.ring.material.opacity = 1 - (n.scale / 3);
            if(n.scale > 3) n.scale = 1;
        });

        // Orbit controls for the vault gear
        orbit.rotation.z -= 0.005;
        orbit2.rotation.z += 0.008;

        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Backend Console: WebGL Server Stack
 */
function initServerStackWebGL() {
    const canvas = document.getElementById('server-gl-canvas');
    if (!canvas) return;

    const scene = new THREE.Scene();
    const container = canvas.parentElement;
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(0, 5, 25);
    camera.lookAt(0, -2, 0);

    const serverGroup = new THREE.Group();

    // The Server Rack base
    const rackGeo = new THREE.BoxGeometry(8, 20, 6);
    const rackMat = new THREE.MeshBasicMaterial({ color: 0x111111, wireframe: true, transparent: true, opacity: 0.3 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    serverGroup.add(rack);

    // Individual Server Blades
    const blades = [];
    const bladeGeo = new THREE.BoxGeometry(7.5, 1.5, 5);
    const bladeMatNormal = new THREE.MeshBasicMaterial({ color: 0x050505 });
    
    for(let i=0; i<8; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMatNormal);
        blade.position.y = 8 - (i * 2.2);
        
        // Add glowing led line to front of blade
        const ledGeo = new THREE.PlaneGeometry(6, 0.2);
        const ledMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.8 });
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.set(0, 0, 2.51); // slightly protruding
        blade.add(led);

        serverGroup.add(blade);
        blades.push({ mesh: blade, led: led });
    }

    // Floating Data particles orbiting the rack
    const dataRingGroup = new THREE.Group();
    const particleGeo = new THREE.SphereGeometry(0.1, 4, 4);
    const particleMat = new THREE.MeshBasicMaterial({ color: 0x00F0FF });
    
    for(let i=0; i<30; i++) {
        const p = new THREE.Mesh(particleGeo, particleMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 6 + Math.random() * 4;
        const height = (Math.random() - 0.5) * 25;
        p.position.set(Math.cos(angle)*radius, height, Math.sin(angle)*radius);
        dataRingGroup.add(p);
    }
    serverGroup.add(dataRingGroup);

    scene.add(serverGroup);

    // Mouse Interaction
    let isDragging = false;
    let preM = { x: 0, y: 0 };
    canvas.addEventListener('mousedown', () => isDragging = true);
    canvas.addEventListener('mousemove', (e) => {
        if(isDragging) {
            serverGroup.rotation.x += (e.offsetY - preM.y) * 0.01;
            serverGroup.rotation.y += (e.offsetX - preM.x) * 0.01;
        }
        preM = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    window.addEventListener('resize', () => {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    let time = 0;
    function animate() {
        requestAnimationFrame(animate);
        time += 0.05;

        if(!isDragging) {
            serverGroup.rotation.y += 0.005;
        }

        // Animate server blades activity
        blades.forEach((b, idx) => {
            // Randomly flash LEDs orange to simulate data bursts
            if (Math.random() > 0.98) {
                b.led.material.color.setHex(0xFF5E00);
                setTimeout(() => b.led.material.color.setHex(0x00F0FF), 100);
            }
            // Continuous breathing opacity
            b.led.material.opacity = 0.4 + Math.abs(Math.sin(time + idx)) * 0.6;
        });

        // Rotate data particles
        dataRingGroup.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    animate();
}

/**
 * Backend Console: Live API JSON simulation
 */
function initBackendSimulation() {
    const term = document.getElementById('terminal-output');
    if(!term) return;

    let isPaused = false;
    document.getElementById('pause-stream')?.addEventListener('click', (e) => {
        isPaused = !isPaused;
        e.target.innerText = isPaused ? 'Resume' : 'Pause';
    });
    document.getElementById('clear-stream')?.addEventListener('click', () => {
        term.innerHTML = '';
    });

    function syntaxHighlight(json) {
        if (typeof json != 'string') { json = JSON.stringify(json, undefined, 2); }
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) { cls = 'json-key'; }
                else { cls = 'json-string'; }
            } else if (/true|false/.test(match)) { cls = 'json-boolean'; }
            else if (/null/.test(match)) { cls = 'json-boolean'; }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }

    let wsUrl;
    if (window.location.protocol === 'file:') {
        wsUrl = 'ws://127.0.0.1:8000/api/v1/ws/telemetry';
    } else {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/telemetry`;
    }
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
        if (isPaused) return;

        const data = JSON.parse(event.data);
        const ts = new Date().toISOString().slice(11, 23);
        
        let statusClass = 'ok';
        if (data.status >= 400 && data.status < 500) statusClass = 'warn';
        if (data.status >= 500) statusClass = 'err';

        const jsonStr = syntaxHighlight(data.payload);
        const headerHtml = `> <span class="log-time">[${ts}]</span> <span class="log-ip">${data.ip}</span> <span style="color:#bbb">${data.verb} ${data.endpoint}</span> <span class="log-status ${statusClass}">${data.status}</span>`;
        
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `${headerHtml}<br/><pre style="margin: 0.5rem 0 0 1rem; font-family: var(--font-mono);">${jsonStr}</pre>`;
        
        term.appendChild(entry);
        term.scrollTop = term.scrollHeight;

        if (term.children.length > 50) {
            term.removeChild(term.firstChild);
        }
    };
}

/**
 * Biometric Kiosk: WebRTC Camera & AI Scan Simulation
 */
function initBiometricScanner() {
    const video = document.getElementById('webcam-feed');
    if(!video) return;

    const cameraPrompt = document.getElementById('camera-prompt');
    const overrideBtn = document.getElementById('start-scan-btn');
    const hud = document.getElementById('scanner-hud');
    const statusText = document.getElementById('hud-status-text');
    const zkHash = document.getElementById('zk-hash');
    const pingText = document.getElementById('ltcy-ping');
    const topoContainer = document.getElementById('topo-dots');
    const rescanBtn = document.getElementById('re-scan-btn');

    // Attempt Camera Access
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
            .then((stream) => {
                video.srcObject = stream;
                cameraPrompt.style.display = 'none';
                // Start scan sequence after short delay to let video play
                setTimeout(startBiometricSequence, 1000);
            })
            .catch((err) => {
                console.warn("Camera access denied or unavailable", err);
                cameraPrompt.querySelector('h2').innerText = "Optics Offline";
                cameraPrompt.querySelector('p').innerText = "Webcam access denied. Proceeding with simulated override module.";
                cameraPrompt.querySelector('.spinner').style.display = 'none';
                overrideBtn.style.display = 'block';
            });
    } else {
        console.warn("navigator.mediaDevices.getUserMedia not supported in this context.");
        cameraPrompt.querySelector('h2').innerText = "Optics Offline";
        cameraPrompt.querySelector('p').innerText = "Webcam access unavailable. Proceeding with simulated override module.";
        cameraPrompt.querySelector('.spinner').style.display = 'none';
        overrideBtn.style.display = 'block';
    }

    overrideBtn.addEventListener('click', () => {
        cameraPrompt.style.display = 'none';
        video.style.background = 'radial-gradient(circle at center, #111, #000)'; // Placeholder bg
        startBiometricSequence();
    });

    rescanBtn.addEventListener('click', () => {
        // Reset states
        rescanBtn.style.display = 'none';
        hud.className = 'scanner-hud';
        topoContainer.innerHTML = '';
        zkHash.innerText = '00000000';
        statusText.innerText = 'AWAITING SUBJECT';
        setTimeout(startBiometricSequence, 500);
    });

    // Handle Username Submission
    document.getElementById('submit-registry-btn')?.addEventListener('click', async () => {
        const input = document.getElementById('username-input');
        if(!input.value.trim()) return;
        
        const contestant = {
            name: input.value.trim(),
            image: window.latestScanDataUrl,
            hash: zkHash.innerText, // e.g. V-4F9A2B
            timestamp: new Date().toISOString()
        };
        
        // Store locally so it displays in Contestant Registry
        const db = JSON.parse(localStorage.getItem('aura_contestants') || '[]');
        db.push(contestant);
        localStorage.setItem('aura_contestants', JSON.stringify(db));

        try {
            let apiEndpoint = '/api/v1/contestants';
            if (window.location.protocol === 'file:') apiEndpoint = 'http://127.0.0.1:8000' + apiEndpoint;
            
            await fetch(apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(contestant)
            });
        } catch (e) {
            console.error("Transmission failed to secure vault", e);
        }
        
        window.location.href = 'contestant-registry.html';
    });

    function startBiometricSequence() {
        hud.style.display = 'block';
        statusText.innerText = "ACQUIRING TARGET...";
        pingText.innerText = "12";

        // Generate static topo dots randomly across center area
        for(let i=0; i<40; i++) {
            const dot = document.createElement('div');
            dot.className = 'topo-dot';
            dot.style.top = (30 + Math.random()*40) + '%';
            dot.style.left = (35 + Math.random()*30) + '%';
            topoContainer.appendChild(dot);
        }

        // Phase 1: Scanning Topology (Fast)
        setTimeout(() => {
            hud.classList.add('scanning');
            statusText.innerText = "EXTRACTING TOPOLOGY...";
            
            // Pop in dots rapidly
            const dots = document.querySelectorAll('.topo-dot');
            dots.forEach((d, i) => {
                setTimeout(() => { d.style.opacity = '1'; }, i * 20);
            });
            
            // Simulate changing latency
            let pingT = setInterval(() => pingText.innerText = Math.floor(Math.random()*15 + 2), 100);
            
            // Phase 2: ZKP Validation (Fast)
            setTimeout(() => {
                statusText.innerText = "VERIFYING ZKP DATABASE...";
                
                // Rapidly cycle hash
                let hashPhase = setInterval(() => {
                    zkHash.innerText = Math.random().toString(16).slice(2, 10).toUpperCase();
                }, 30);

                // Phase 3: Access Granted
                setTimeout(() => {
                    clearInterval(pingT);
                    clearInterval(hashPhase);
                    zkHash.innerText = "V-4F9A2B";
                    pingText.innerText = "4"; // Super low latency
                    
                    hud.classList.remove('scanning');
                    hud.classList.add('verified');
                    statusText.innerText = "IDENTITY CONFIRMED";
                    rescanBtn.style.display = 'block';

                    // Capture Snapshot & Show Prompt
                    setTimeout(() => {
                        const canvas = document.getElementById('snapshot-canvas');
                        canvas.width = video.videoWidth || 640;
                        canvas.height = video.videoHeight || 480;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        window.latestScanDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                        
                        document.getElementById('username-prompt-overlay').style.display = 'flex';
                        document.getElementById('username-input').focus();
                    }, 1000); // Wait 1 second after VIP badge appears to show prompt

                }, 800); // 0.8s verification

            }, 800); // 0.8s scanning

        }, 400); // 0.4s initial acquire
    }
}

/**
 * Dashboard Mockup Tickers and Logic
 */
function initDashboardWidgets() {
    const latencyTicker = document.getElementById('latencyTicker');
    if (latencyTicker) {
        for (let i = 0; i < 10; i++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${Math.floor(Math.random() * 40) + 10}%`;
            latencyTicker.appendChild(bar);
        }

        setInterval(() => {
            const bars = latencyTicker.querySelectorAll('.bar');
            bars.forEach(bar => {
                const isSpike = Math.random() > 0.9;
                const newHeight = isSpike ? Math.floor(Math.random() * 40) + 60 : Math.floor(Math.random() * 40) + 10;
                bar.style.height = `${newHeight}%`;
                
                if (newHeight > 60) {
                    bar.style.background = 'var(--accent-orange)';
                } else {
                    bar.style.background = 'var(--accent-cyan)';
                }
            });
        }, 1500);
    }

    const capacityNum = document.querySelector('.huge-number');
    const capacityFill = document.querySelector('.progress-fill');
    if (capacityNum && capacityFill) {
        let currentCap = 84;
        setInterval(() => {
            const drift = Math.random() > 0.5 ? 1 : -1;
            let newCap = currentCap + drift;
            if (newCap > 88) newCap = 88;
            if (newCap < 80) newCap = 80;
            currentCap = newCap;

            capacityNum.innerHTML = `${currentCap}<span class="symbol">%</span>`;
            capacityFill.style.width = `${currentCap}%`;
        }, 3000);
    }
}

/**
 * Cyberpunk Subpages WebGL Renderers
 */

function setupSubpageWebGL(canvasId, cameraZ) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return null;

    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    const container = canvas.parentElement;
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.z = cameraZ || 50;

    window.addEventListener('resize', () => {
        if (!container) return;
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    return { scene, camera, renderer, container };
}

// 1. Heatmaps (Topographical Grid)
function initHeatmapWebGL() {
    const setup = setupSubpageWebGL('heatmap-gl-canvas', 60);
    if(!setup) return;
    const { scene, camera, renderer } = setup;

    camera.position.set(0, 45, 65);
    camera.lookAt(0, 5, 0);

    const group = new THREE.Group();
    
    // Add grid helper at bottom
    const gridHelper = new THREE.GridHelper(120, 40, 0xff5e00, 0xff5e00);
    gridHelper.position.y = -8;
    gridHelper.material.opacity = 0.15;
    gridHelper.material.transparent = true;
    group.add(gridHelper);

    const geometry = new THREE.PlaneGeometry(100, 100, 60, 60);
    const vertices = geometry.attributes.position.array;
    const colors = new Float32Array(vertices.length);

    // Initial noise displacement
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = (Math.random() * 2 - 1) * 2;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Points Material with Vertex Colors
    const material = new THREE.PointsMaterial({ 
        size: 0.35, 
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
    });
    
    const points = new THREE.Points(geometry, material);
    points.rotation.x = -Math.PI / 2;
    group.add(points);

    // Wireframe Mesh overlay for that cyber-topography feel
    const wireMaterial = new THREE.MeshBasicMaterial({
        color: 0xFF3300,
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    wireMesh.rotation.x = -Math.PI / 2;
    group.add(wireMesh);

    scene.add(group);

    const color = new THREE.Color();
    let time = 0;

    // Interaction controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    setup.renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    setup.renderer.domElement.addEventListener('mousemove', (e) => {
        if(isDragging) {
            group.rotation.x += (e.offsetY - prevMouse.y) * 0.01;
            group.rotation.y += (e.offsetX - prevMouse.x) * 0.01;
        }
        prevMouse = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    function animate() {
        requestAnimationFrame(animate);
        time += 0.03;
        
        const positions = geometry.attributes.position.array;
        const colorArray = geometry.attributes.color.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            
            // Complex wave generation
            const wave1 = Math.sin(x * 0.15 + time) * 2.5;
            const wave2 = Math.cos(y * 0.1 + time * 0.8) * 2.5;
            const wave3 = Math.sin(Math.sqrt(x*x + y*y) * 0.2 - time * 1.5) * 3;
            
            const z = wave1 + wave2 + wave3;
            positions[i+2] = z;

            // Height-based coloring (Heatmap: Deep red, orange, yellow, white)
            // z ranges roughly -8 to 8
            const normalizedHeight = Math.max(0, Math.min(1, (z + 6) / 12));
            
            if (normalizedHeight < 0.4) {
                // Deep dark red
                color.setRGB(0.3 + normalizedHeight, 0, 0);
            } else if (normalizedHeight < 0.7) {
                // Orange to Bright Orange
                const t = (normalizedHeight - 0.4) / 0.3;
                color.setRGB(0.7 + t*0.3, t*0.4, 0);
            } else {
                // Yellow to White peaks
                const t = (normalizedHeight - 0.7) / 0.3;
                color.setRGB(1, 0.4 + t*0.6, t);
            }

            colorArray[i] = color.r;
            colorArray[i+1] = color.g;
            colorArray[i+2] = color.b;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.color.needsUpdate = true;
        
        if(!isDragging) {
            group.rotation.y += 0.002;
        }
        
        renderer.render(scene, camera);
    }
    animate();
}

// 2. Node Telemetry (Networked Nodes)
function initTelemetryWebGL() {
    const setup = setupSubpageWebGL('telemetry-gl-canvas', 60);
    if(!setup) return;
    const { scene, camera, renderer } = setup;

    camera.position.set(0, 10, 60);

    const group = new THREE.Group();
    
    // Add grid wire box for bounding context
    const boxGeo = new THREE.BoxGeometry(60, 60, 60);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, wireframe: true, transparent: true, opacity: 0.05 });
    const boundingBox = new THREE.Mesh(boxGeo, boxMat);
    group.add(boundingBox);

    // Nodes (Spheres with glowing auras)
    const nodeCount = 50;
    const nodes = [];
    const nodeMeshes = [];
    
    const nodeGeo = new THREE.SphereGeometry(1, 16, 16);
    const nodeMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00 });
    
    const auraGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const auraMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });

    for(let i = 0; i < nodeCount; i++) {
        const mesh = new THREE.Mesh(nodeGeo, nodeMat);
        const aura = new THREE.Mesh(auraGeo, auraMat);
        
        // Random sizes
        const scale = 0.5 + Math.random() * 0.8;
        mesh.scale.set(scale, scale, scale);
        aura.scale.set(scale, scale, scale);
        
        mesh.add(aura); // Parent aura to mesh

        mesh.position.set(
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 50
        );
        nodes.push(mesh.position);
        nodeMeshes.push({ mesh, aura, phase: Math.random() * Math.PI * 2 });
        group.add(mesh);
    }

    // Lines & Data Packets
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFF5E00, transparent: true, opacity: 0.15 });
    const packets = [];
    const packetGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });

    for(let i = 0; i < nodes.length; i++) {
        for(let j = i + 1; j < nodes.length; j++) {
            const distance = nodes[i].distanceTo(nodes[j]);
            if(distance < 20) {
                // Draw line segment
                const lineGeo = new THREE.BufferGeometry().setFromPoints([nodes[i], nodes[j]]);
                const line = new THREE.Line(lineGeo, lineMat);
                group.add(line);
                
                // Spawn a few packets on some lines
                if (Math.random() > 0.7) {
                    const pkt = new THREE.Mesh(packetGeo, packetMat);
                    group.add(pkt);
                    packets.push({ mesh: pkt, start: nodes[i], end: nodes[j], progress: Math.random(), speed: 0.005 + Math.random() * 0.01 });
                }
            }
        }
    }

    scene.add(group);

    // Filter/Post-process emulation (bloom hack)
    const ambientGlowGeo = new THREE.SphereGeometry(40, 32, 32);
    const ambientGlowMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, transparent: true, opacity: 0.02, side: THREE.BackSide, blending: THREE.AdditiveBlending });
    const ambientGlow = new THREE.Mesh(ambientGlowGeo, ambientGlowMat);
    scene.add(ambientGlow);

    // Interaction
    let isDragging = false;
    let preM = { x: 0, y: 0 };
    setup.renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    setup.renderer.domElement.addEventListener('mousemove', (e) => {
        if(isDragging) {
            group.rotation.y += (e.offsetX - preM.x) * 0.01;
            group.rotation.x += (e.offsetY - preM.y) * 0.01;
        }
        preM = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.05;

        // Auto rotation
        if(!isDragging) {
            group.rotation.y += 0.001;
            group.rotation.x += 0.0005;
        }

        // Pulse nodes
        nodeMeshes.forEach(n => {
            const s = 1 + Math.sin(t + n.phase) * 0.2;
            n.aura.scale.set(s, s, s);
            n.aura.material.opacity = 0.1 + Math.sin(t + n.phase) * 0.1;
        });

        // Move packets along edges
        packets.forEach(p => {
            p.progress += p.speed;
            if(p.progress > 1) p.progress = 0;
            p.mesh.position.lerpVectors(p.start, p.end, p.progress);
        });

        renderer.render(scene, camera);
    }
    animate();
}

// 3. Alerts (Radar/Beacon)
function initAlertsWebGL() {
    const setup = setupSubpageWebGL('alerts-gl-canvas', 60);
    if(!setup) return;
    const { scene, camera, renderer } = setup;

    camera.position.set(0, 35, 45);
    camera.lookAt(0, 0, 0);

    const group = new THREE.Group();

    // Radar Base Grid Rings
    const ringMat = new THREE.LineBasicMaterial({ color: 0xFF1100, transparent: true, opacity: 0.3 });
    for (let i = 1; i <= 4; i++) {
        const ringGeo = new THREE.RingGeometry(i * 8, i * 8 + 0.1, 64);
        const ring = new THREE.LineLoop(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        group.add(ring);
    }

    // Radar Axis Lines
    const axisGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-40, 0, 0), new THREE.Vector3(40, 0, 0),
        new THREE.Vector3(0, 0, -40), new THREE.Vector3(0, 0, 40)
    ]);
    const axisMat = new THREE.LineBasicMaterial({ color: 0xFF1100, transparent: true, opacity: 0.2 });
    const axis = new THREE.LineSegments(axisGeo, axisMat);
    group.add(axis);

    // Glowing Core
    const coreGeo = new THREE.SphereGeometry(2, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xFF2200 });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Dynamic Sweeping Radar Beam (Triangular Fan)
    const beamShape = new THREE.Shape();
    beamShape.moveTo(0, 0);
    beamShape.lineTo(35, 10);
    beamShape.lineTo(35, -10);
    beamShape.lineTo(0, 0);

    const beamGeo = new THREE.ShapeGeometry(beamShape);
    const beamMat = new THREE.MeshBasicMaterial({ 
        color: 0xFF1100, 
        transparent: true, 
        opacity: 0.2, 
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending 
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.position.y = 0.5; // Slightly above floor
    group.add(beam);

    // Threat Blips
    const blipGeo = new THREE.SphereGeometry(1, 16, 16);
    const blipMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const blips = [];

    // Spawn random blips
    for(let i = 0; i < 8; i++) {
        const blip = new THREE.Mesh(blipGeo, blipMat);
        const angle = Math.random() * Math.PI * 2;
        const radius = 5 + Math.random() * 25;
        blip.position.set(Math.cos(angle) * radius, 1, Math.sin(angle) * radius);
        
        // Initial state is invisible
        blip.material.transparent = true;
        blip.material.opacity = 0;
        
        group.add(blip);
        blips.push({ mesh: blip, angle: angle });
    }

    scene.add(group);

    // Interaction
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    setup.renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    setup.renderer.domElement.addEventListener('mousemove', (e) => {
        if(isDragging) {
            group.rotation.x += (e.offsetY - prevMouse.y) * 0.01;
            group.rotation.y += (e.offsetX - prevMouse.x) * 0.01;
        }
        prevMouse = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    let radarAngle = 0;
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Sweep radar
        radarAngle -= 0.03;
        beam.rotation.z = radarAngle;
        
        // Normalize angle to 0 - 2PI for comparison
        let normalizedRadarDir = (-radarAngle) % (Math.PI * 2);
        if (normalizedRadarDir < 0) normalizedRadarDir += Math.PI * 2;

        // Check blips against radar sweep and fade them out
        blips.forEach(blip => {
            // Distance checking logic (simplified angle check)
            let blipAngle = blip.angle % (Math.PI * 2);
            if(blipAngle < 0) blipAngle += Math.PI * 2;
            
            // If radar passes over blip, flash it
            const diff = Math.abs(normalizedRadarDir - blipAngle);
            if (diff < 0.2 || diff > Math.PI * 2 - 0.2) {
                blip.mesh.material.opacity = 1; // Flash!
                blip.mesh.scale.set(1.5, 1.5, 1.5);
            }
            
            // Fade out
            if (blip.mesh.material.opacity > 0) {
                blip.mesh.material.opacity -= 0.02;
                const s = Math.max(1, blip.mesh.scale.x - 0.05);
                blip.mesh.scale.set(s, s, s);
            }
        });

        if(!isDragging) {
            // subtle wobble
            group.rotation.x = Math.sin(Date.now() * 0.0005) * 0.1;
        }

        renderer.render(scene, camera);
    }
    animate();
}

// 4. Settings (Gear Mechanism -> Encryptor Vault)
function initSettingsWebGL() {
    const setup = setupSubpageWebGL('settings-gl-canvas', 40);
    if(!setup) return;
    const { scene, camera, renderer } = setup;

    const group = new THREE.Group();

    // Central Icosahedron Core (The "Key")
    const coreGeo = new THREE.IcosahedronGeometry(4, 0);
    const coreMat = new THREE.MeshStandardMaterial({ 
        color: 0xFFB347, 
        wireframe: true, 
        emissive: 0xFF5E00, 
        emissiveIntensity: 0.5 
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Inner glowing sphere
    const glowGeo = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, transparent: true, opacity: 0.3, blending: THREE.AdditiveBlending });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    group.add(glow);

    // Gyroscopic Rings (The "Vault Dials")
    const rings = [];
    const ringMat = new THREE.LineBasicMaterial({ color: 0xFFB347, transparent: true, opacity: 0.5 });
    
    // Ring 1
    const r1Geo = new THREE.TorusGeometry(8, 0.05, 16, 64);
    const r1 = new THREE.Mesh(r1Geo, ringMat);
    group.add(r1);
    rings.push({ mesh: r1, axis: 'x', speed: 0.01 });

    // Ring 2
    const r2Geo = new THREE.TorusGeometry(12, 0.05, 16, 64);
    const r2 = new THREE.Mesh(r2Geo, ringMat);
    group.add(r2);
    rings.push({ mesh: r2, axis: 'y', speed: -0.008 });

    // Ring 3 (Outer cage)
    const r3Geo = new THREE.CylinderGeometry(16, 16, 2, 32, 1, true);
    const r3Mat = new THREE.MeshBasicMaterial({ color: 0xFF5E00, wireframe: true, transparent: true, opacity: 0.2 });
    const r3 = new THREE.Mesh(r3Geo, r3Mat);
    group.add(r3);
    rings.push({ mesh: r3, axis: 'z', speed: 0.005 });

    // Floating cryptographic data blocks
    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
    const boxMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
    const blocks = [];
    
    for(let i=0; i<15; i++) {
        const block = new THREE.Mesh(boxGeo, boxMat);
        const radius = 10 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        block.position.set(
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        );
        group.add(block);
        blocks.push({ mesh: block, radius, theta, phi, speed: 0.002 + Math.random() * 0.01 });
    }

    // Add some ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    scene.add(group);

    // Interaction
    let isDragging = false;
    let preM = { x: 0, y: 0 };
    setup.renderer.domElement.addEventListener('mousedown', () => isDragging = true);
    setup.renderer.domElement.addEventListener('mousemove', (e) => {
        if(isDragging) {
            group.rotation.y += (e.offsetX - preM.x) * 0.01;
            group.rotation.x += (e.offsetY - preM.y) * 0.01;
        }
        preM = { x: e.offsetX, y: e.offsetY };
    });
    window.addEventListener('mouseup', () => isDragging = false);

    let t = 0;
    function animate() {
        requestAnimationFrame(animate);
        t += 0.05;
        
        if(!isDragging) {
            group.rotation.y += 0.002;
            group.rotation.x += 0.001;
        }

        // Animate Core
        core.rotation.x += 0.005;
        core.rotation.y += 0.01;
        glow.scale.set(1 + Math.sin(t)*0.05, 1 + Math.sin(t)*0.05, 1 + Math.sin(t)*0.05);

        // Animate Rings
        rings.forEach(ringObj => {
            if (ringObj.axis === 'x') ringObj.mesh.rotation.x += ringObj.speed;
            if (ringObj.axis === 'y') ringObj.mesh.rotation.y += ringObj.speed;
            if (ringObj.axis === 'z') ringObj.mesh.rotation.z += ringObj.speed;
        });

        // Orbit blocks along sphere perimeter
        blocks.forEach(b => {
            b.theta += b.speed;
            b.mesh.position.set(
                b.radius * Math.sin(b.phi) * Math.cos(b.theta),
                b.radius * Math.sin(b.phi) * Math.sin(b.theta),
                b.radius * Math.cos(b.phi)
            );
            b.mesh.lookAt(core.position);
        });
        
        renderer.render(scene, camera);
    }
    animate();
}
/**
 * Authentication Forms Logic: Toggle & Validation
 */
function initAuthForms() {
    const card = document.getElementById('authCard');
    if (!card) return;

    const toggleLogin = document.getElementById('toggleLogin');
    const toggleRegister = document.getElementById('toggleRegister');
    const registerFields = document.getElementById('registerOnlyFields');
    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const authForm = document.getElementById('authForm');
    const emailInput = document.getElementById('email');

    // Toggle Modes
    toggleLogin.addEventListener('click', () => {
        card.classList.remove('register-mode');
        toggleLogin.classList.add('active');
        toggleRegister.classList.remove('active');
        registerFields.style.display = 'none';
        authTitle.innerText = "Vault Access";
        authSubtitle.innerText = "Secure entry to AuraVOS ecosystem.";
    });

    toggleRegister.addEventListener('click', () => {
        card.classList.add('register-mode');
        toggleRegister.classList.add('active');
        toggleLogin.classList.remove('active');
        registerFields.style.display = 'flex';
        authTitle.innerText = "Create Identity";
        authSubtitle.innerText = "Join the next-generation venue network.";
    });

    // Email Validation Logic
    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    emailInput.addEventListener('input', () => {
        if (emailInput.value.length > 0) {
            if (validateEmail(emailInput.value)) {
                emailInput.classList.remove('invalid');
                emailInput.classList.add('valid');
            } else {
                emailInput.classList.remove('valid');
                emailInput.classList.add('invalid');
            }
        } else {
            emailInput.classList.remove('valid', 'invalid');
        }
    });

    // Form Submission
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateEmail(emailInput.value)) {
            emailInput.classList.add('invalid');
            return;
        }

        const passwordInput = document.getElementById('password');
        const submitBtn = authForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = "AUTHENTICATING...";
        submitBtn.style.opacity = "0.7";
        submitBtn.disabled = true;

        const isRegister = card.classList.contains('register-mode');
        let endpoint = isRegister ? '/api/v1/auth/register' : '/api/v1/auth/login';
        if (window.location.protocol === 'file:') {
            endpoint = 'http://127.0.0.1:8000' + endpoint;
        }

        try {
            const resp = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailInput.value, password: passwordInput.value })
            });
            
            if (resp.ok) {
                alert(isRegister ? "Identity successfully created." : "AuraVOS Access Granted.");
                if(!isRegister) window.location.href = 'dashboard.html';
            } else {
                const err = await resp.json();
                alert(err.detail || "Authentication sequence failed.");
            }
        } catch (error) {
            alert("Secure vault connection offline.");
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.style.opacity = "1";
            submitBtn.disabled = false;
        }
    });
}
