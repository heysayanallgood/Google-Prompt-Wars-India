/**
 * stadium-map.js
 * Live Stadium Map (Interactive Digital Twin)
 */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof THREE === 'undefined') {
        console.error("Three.js not loaded.");
        return;
    }
    
    initStadiumMap();
});

function initStadiumMap() {
    const canvas = document.getElementById('stadium-gl-canvas');
    if (!canvas) return;
    
    const container = canvas.parentElement;
    
    // -----------------------------------------------------
    // 1. Scene, Camera, Renderer Setup
    // -----------------------------------------------------
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x000000, 50, 200);
    
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Camera Setup (Start in 2D Top-Down Mode)
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    
    let is3DMode = false;
    const pos2D = { x: 0, y: 150, z: 0 };
    const pos3D = { x: 0, y: 80, z: 120 };
    
    camera.position.set(pos2D.x, pos2D.y, pos2D.z);
    camera.lookAt(0, 0, 0);

    // Mouse Dragging (Custom Orbit basically)
    let isDragging = false;
    let prevM = { x: 0, y: 0 };
    
    canvas.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = (e.clientX - prevM.x) * 0.1;
        const deltaY = (e.clientY - prevM.y) * 0.1;
        
        if (is3DMode) {
            // Rotate around center
            const radius = Math.sqrt(camera.position.x**2 + camera.position.z**2);
            let angle = Math.atan2(camera.position.z, camera.position.x);
            angle += deltaX * 0.05;
            camera.position.x = radius * Math.cos(angle);
            camera.position.z = radius * Math.sin(angle);
            camera.lookAt(0, 0, 0);
        } else {
            // Pan in 2D
            camera.position.x -= deltaX;
            camera.position.z -= deltaY; // Since camera looks down -Y
        }
        prevM = { x: e.clientX, y: e.clientY };
    });
    
    canvas.addEventListener('mousedown', (e) => { prevM = { x: e.clientX, y: e.clientY }; });
    
    // Zoom handling
    canvas.addEventListener('wheel', (e) => {
        const zoomSpeed = 0.1;
        if(is3DMode) {
            camera.position.y += e.deltaY * zoomSpeed;
            camera.position.z += e.deltaY * zoomSpeed;
        } else {
            camera.position.y += e.deltaY * zoomSpeed;
        }
        
        // Clamp Y to prevent going underground or too high
        camera.position.y = Math.max(20, Math.min(camera.position.y, 300));
    });

    // -----------------------------------------------------
    // 2. The Stadium Graph Structure
    // -----------------------------------------------------
    const stadiumGraph = {
        'n1': { x: 0, z: -40, edges: ['n2', 'n8', 'g1'], type: 'concourse' }, // North
        'n2': { x: 28, z: -28, edges: ['n1', 'n3', 'f1'], type: 'concourse' }, // NE
        'n3': { x: 40, z: 0, edges: ['n2', 'n4', 'r1'], type: 'concourse' }, // East
        'n4': { x: 28, z: 28, edges: ['n3', 'n5', 'm1'], type: 'concourse' }, // SE
        'n5': { x: 0, z: 40, edges: ['n4', 'n6', 'g2'], type: 'concourse' }, // South
        'n6': { x: -28, z: 28, edges: ['n5', 'n7', 'f2'], type: 'concourse' }, // SW
        'n7': { x: -40, z: 0, edges: ['n6', 'n8', 'r2'], type: 'concourse' }, // West
        'n8': { x: -28, z: -28, edges: ['n7', 'n1'], type: 'concourse' }, // NW
        
        'f1': { x: 45, z: -45, edges: ['n2'], type: 'food', label: 'Food 1' },
        'f2': { x: -45, z: 45, edges: ['n6'], type: 'food', label: 'Food 2' },
        'r1': { x: 60, z: 0, edges: ['n3'], type: 'restroom', label: 'Restroom 1' },
        'r2': { x: -60, z: 0, edges: ['n7'], type: 'restroom', label: 'Restroom 2' },
        'g1': { x: 0, z: -60, edges: ['n1'], type: 'gate', label: 'Gate N' },
        'g2': { x: 0, z: 60, edges: ['n5'], type: 'gate', label: 'Gate S' },
        'm1': { x: 45, z: 45, edges: ['n4'], type: 'medic', label: 'Medic' },
    };
    
    // State variables
    let crowdHeatState = {}; // node id -> heat value (1-10)
    let isAvoidCrowdMode = false;
    let currentTargetNode = null;
    let nodeMeshes = {};
    let edgeLines = {}; // key format: "n1-n2" or "n2-n1" (sorted)
    let currentPathLine = null; // THREE.Line for active route
    
    // -----------------------------------------------------
    // 3. Build WebGL Geometry
    // -----------------------------------------------------
    const stadiumGroup = new THREE.Group();
    
    // Ground Grid
    const gridHelper = new THREE.GridHelper(200, 50, 0x00F0FF, 0x002244);
    gridHelper.position.y = -1;
    stadiumGroup.add(gridHelper);

    // Decorative Outer Stadium Ring
    const outerRingGeo = new THREE.TorusGeometry(75, 2, 16, 100);
    const outerRingMat = new THREE.MeshBasicMaterial({ color: 0x8A2BE2, wireframe: true, transparent: true, opacity: 0.15 });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    outerRing.rotation.x = Math.PI / 2;
    stadiumGroup.add(outerRing);

    // Materials
    const matConcourse = new THREE.MeshBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.6 });
    const matFood = new THREE.MeshBasicMaterial({ color: 0xFFB347, transparent: true, opacity: 0.8 });
    const matRestroom = new THREE.MeshBasicMaterial({ color: 0x00ffaa, transparent: true, opacity: 0.8 });
    const matGate = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.8 });
    const matMedic = new THREE.MeshBasicMaterial({ color: 0xFF0055, transparent: true, opacity: 0.8 });
    
    // Create Node Meshes
    Object.keys(stadiumGraph).forEach(nodeId => {
        const data = stadiumGraph[nodeId];
        let geo, mat;
        
        // Size based on type
        if (data.type === 'concourse') {
            geo = new THREE.CylinderGeometry(2, 2, 1, 16);
            mat = matConcourse;
        } else {
            geo = new THREE.BoxGeometry(4, 4, 4);
            if(data.type === 'food') mat = matFood;
            if(data.type === 'restroom') mat = matRestroom;
            if(data.type === 'gate') mat = matGate;
            if(data.type === 'medic') mat = matMedic;
        }
        
        const mesh = new THREE.Mesh(geo, mat.clone()); // clone so we can safely modify color uniquely later
        mesh.position.set(data.x, 2, data.z);
        
        // Aura glow for node
        const glowGeo = new THREE.CylinderGeometry(4, 4, 0.1, 16);
        const glowMat = new THREE.MeshBasicMaterial({ color: mat.color.getHex(), transparent: true, opacity: 0.2, blending: THREE.AdditiveBlending });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        glow.position.y = -1;
        mesh.add(glow);
        
        nodeMeshes[nodeId] = { core: mesh, aura: glow, baseColor: mat.color.getHex() };
        stadiumGroup.add(mesh);
    });
    
    // Create Edges (Hallways)
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x00F0FF, transparent: true, opacity: 0.2, linewidth: 2 });
    
    const drawnEdges = new Set();
    Object.keys(stadiumGraph).forEach(nodeId => {
        const startNode = stadiumGraph[nodeId];
        startNode.edges.forEach(targetId => {
            const edgeKey = [nodeId, targetId].sort().join("-");
            if (!drawnEdges.has(edgeKey)) {
                drawnEdges.add(edgeKey);
                const targetNode = stadiumGraph[targetId];
                
                const points = [
                    new THREE.Vector3(startNode.x, 0.5, startNode.z),
                    new THREE.Vector3(targetNode.x, 0.5, targetNode.z)
                ];
                const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
                const line = new THREE.Line(lineGeo, edgeMaterial.clone());
                edgeLines[edgeKey] = line;
                stadiumGroup.add(line);
            }
        });
    });

    scene.add(stadiumGroup);

    // -----------------------------------------------------
    // 4. WebSocket Telemetry Integration
    // -----------------------------------------------------
    let wsUrl;
    if (window.location.protocol === 'file:') {
        wsUrl = 'ws://127.0.0.1:8000/api/v1/ws/stadium';
    } else {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/stadium`;
    }
    
    // We will attempt connection, if backend not ready, it will fail silently
    let ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
        try {
            const msg = JSON.parse(event.data);
            
            // 1. Update Crowd Heatmaps
            if (msg.crowd_heat) {
                crowdHeatState = msg.crowd_heat;
                updateNodeHeatColors();
                
                // If Avoid Crowd Mode is active and we have a target, recalc seamlessly!
                if(isAvoidCrowdMode && currentTargetNode) {
                    calculateAndDrawPath(document.getElementById('start-node').value, currentTargetNode);
                }
            }
            
            // 2. Update Facility Queues
            if (msg.facility_queues) {
                Object.keys(msg.facility_queues).forEach(qKey => {
                    const el = document.getElementById(`q-${qKey}`);
                    // Only update existing elements
                    if(el) {
                        el.innerText = msg.facility_queues[qKey];
                    }
                });
            }
            
            // 3. Update Live Events Ticker
            if (msg.live_event) {
                document.querySelector('.ticker-msg').innerText = msg.live_event;
            }
            
        } catch(e) { console.error("WS Parse Error", e); }
    };

    function updateNodeHeatColors() {
        Object.keys(crowdHeatState).forEach(nodeId => {
            if(!nodeMeshes[nodeId]) return;
            const heat = crowdHeatState[nodeId]; // 1 to 10
            
            let targetColor = nodeMeshes[nodeId].baseColor; // default
            
            // Apply heat colors specifically to concourse nodes since they hold crowds
            if (stadiumGraph[nodeId].type === 'concourse') {
                if (heat >= 8) {
                    targetColor = 0xff0055; // Red (High Crowd)
                } else if (heat >= 5) {
                    targetColor = 0xffcc00; // Yellow (Medium)
                } else {
                    targetColor = 0x00ffaa; // Green (Low)
                }
            }
            
            // Note: ThreeJS materials need .color.setHex()
            nodeMeshes[nodeId].aura.material.color.setHex(targetColor);
            
            // Adjust aura opacity based on heat
            nodeMeshes[nodeId].aura.material.opacity = 0.2 + (heat * 0.05);
            nodeMeshes[nodeId].aura.scale.set(1 + heat*0.1, 1, 1 + heat*0.1);
        });
        
        // Also update edge lines based on highest heat node
        Object.keys(edgeLines).forEach(key => {
            const [n1, n2] = key.split("-");
            const h1 = crowdHeatState[n1] || 1;
            const h2 = crowdHeatState[n2] || 1;
            const maxHeat = Math.max(h1, h2);
            
            if (maxHeat >= 8) {
                edgeLines[key].material.color.setHex(0xff0055);
                edgeLines[key].material.opacity = 0.8;
            } else if (maxHeat >= 5) {
                edgeLines[key].material.color.setHex(0xffcc00);
                edgeLines[key].material.opacity = 0.5;
            } else {
                edgeLines[key].material.color.setHex(0x00F0FF);
                edgeLines[key].material.opacity = 0.2;
            }
        });
    }

    // -----------------------------------------------------
    // 5. Intelligent Pathfinding (A* / Dijkstra)
    // -----------------------------------------------------
    function calculateAndDrawPath(startId, endId) {
        if (!stadiumGraph[startId] || !stadiumGraph[endId]) return;
        
        const path = findShortestPath(startId, endId);
        if (!path || path.length === 0) return;
        
        drawPathLine(path); // Visualise
        
        // Update stats UI
        document.getElementById('path-stats').style.display = 'flex';
        // Compute rough time: 1 min per hop + crowd penalty
        let estTime = 0;
        let hasCongestion = false;
        
        for(let i=0; i<path.length-1; i++) {
            const heat = crowdHeatState[path[i]] || 1;
            estTime += 1 + (heat * 0.2); // Add time for heat
            if (heat >= 8) hasCongestion = true;
        }
        
        document.getElementById('est-time').innerText = Math.round(estTime);
        document.getElementById('route-type').innerText = isAvoidCrowdMode ? "Smart A.I. Route" : "Direct Route";
        document.getElementById('route-type').style.color = isAvoidCrowdMode ? "var(--accent-orange)" : "var(--accent-cyan)";
    }
    
    function getDistance(n1, n2) {
        const dx = stadiumGraph[n1].x - stadiumGraph[n2].x;
        const dz = stadiumGraph[n1].z - stadiumGraph[n2].z;
        return Math.sqrt(dx*dx + dz*dz);
    }

    function findShortestPath(startGoal, endGoal) {
        const distances = {};
        const prev = {};
        const unvisited = new Set(Object.keys(stadiumGraph));
        
        unvisited.forEach(n => distances[n] = Infinity);
        distances[startGoal] = 0;
        
        while(unvisited.size > 0) {
            // Find node with min distance
            let current = null;
            let minDistance = Infinity;
            unvisited.forEach(n => {
                if(distances[n] < minDistance) {
                    minDistance = distances[n];
                    current = n;
                }
            });
            
            if (current === null || current === endGoal) break;
            unvisited.delete(current);
            
            // Check neighbors
            stadiumGraph[current].edges.forEach(neighbor => {
                if(!unvisited.has(neighbor)) return;
                
                let weight = getDistance(current, neighbor);
                
                // --- THE AVOID CROWD MAGIC ---
                if (isAvoidCrowdMode) {
                    const currentHeat = crowdHeatState[current] || 1;
                    const neighborHeat = crowdHeatState[neighbor] || 1;
                    // If heat >= 8, multiply weight massively so algorithm avoids it
                    if (currentHeat >= 8 || neighborHeat >= 8) {
                        weight += 1000; // Heavy penalty
                    } else if (currentHeat >= 5 || neighborHeat >= 5) {
                        weight += 200; // Medium penalty
                    }
                }
                
                const alt = distances[current] + weight;
                if (alt < distances[neighbor]) {
                    distances[neighbor] = alt;
                    prev[neighbor] = current;
                }
            });
        }
        
        // Reconstruct path
        const path = [];
        let u = endGoal;
        while(u) {
            path.unshift(u);
            u = prev[u];
        }
        
        return path[0] === startGoal ? path : null;
    }
    
    function drawPathLine(pathArr) {
        if (currentPathLine) {
            scene.remove(currentPathLine);
            currentPathLine.geometry.dispose();
            currentPathLine.material.dispose();
        }
        
        const pathPoints = [];
        pathArr.forEach(nodeId => {
            const data = stadiumGraph[nodeId];
            // Raise path height so it floats visibly above ground and edges
            pathPoints.push(new THREE.Vector3(data.x, 3, data.z));
        });

        // Use a glowing tube for highly visible path finding
        class CustomSinCurve extends THREE.Curve {
            constructor(points) { super(); this.points = points; }
            getPoint(t, optionalTarget = new THREE.Vector3()) {
                const p = this.points;
                const index = t * (p.length - 1);
                const i = Math.floor(index);
                const frac = index - i;
                if (i >= p.length - 1) return optionalTarget.copy(p[p.length - 1]);
                return optionalTarget.copy(p[i]).lerp(p[i + 1], frac);
            }
        }

        const pathCurve = new CustomSinCurve(pathPoints);
        const tubeGeo = new THREE.TubeGeometry(pathCurve, pathArr.length * 4, 0.8, 8, false);
        const tubeMat = new THREE.MeshBasicMaterial({ color: isAvoidCrowdMode ? 0xFF5E00 : 0x00F0FF, transparent: true, opacity: 0.8 });
        
        currentPathLine = new THREE.Mesh(tubeGeo, tubeMat);
        scene.add(currentPathLine);
        
        // Optional: Animate a pulse along the path if time permits
    }

    // -----------------------------------------------------
    // 6. UI Interactions
    // -----------------------------------------------------
    
    // View Perspective Toggle
    document.getElementById('btn-2d').addEventListener('click', (e) => {
        is3DMode = false;
        e.target.classList.add('active');
        document.getElementById('btn-3d').classList.remove('active');
        
        // Tween camera position
        camera.position.set(pos2D.x, Math.max(camera.position.y, 100), pos2D.z);
        camera.lookAt(0,0,0);
    });
    
    document.getElementById('btn-3d').addEventListener('click', (e) => {
        is3DMode = true;
        e.target.classList.add('active');
        document.getElementById('btn-2d').classList.remove('active');
        
        camera.position.set(pos3D.x, pos3D.y, pos3D.z);
        camera.lookAt(0,0,0);
    });
    
    // Avoid Crowd Toggle
    document.getElementById('btn-avoid-crowd').addEventListener('click', (e) => {
        const btn = e.target;
        isAvoidCrowdMode = !isAvoidCrowdMode;
        
        if(isAvoidCrowdMode) {
            btn.classList.add('active');
            btn.innerHTML = '<span class="icon">⚡</span> Avoid Crowd Mode (ON)';
        } else {
            btn.classList.remove('active');
            btn.innerHTML = '<span class="icon">⚡</span> Avoid Crowd Mode (OFF)';
        }
        
        // Recalculate if there is an active target!
        if (currentTargetNode) {
            calculateAndDrawPath(document.getElementById('start-node').value, currentTargetNode);
        }
    });
    
    // Find Nearest Facility
    document.querySelectorAll('.fac-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetId = e.target.getAttribute('data-target');
            currentTargetNode = targetId;
            const startNode = document.getElementById('start-node').value;
            calculateAndDrawPath(startNode, currentTargetNode);
        });
    });
    
    // Start Node Changed
    document.getElementById('start-node').addEventListener('change', (e) => {
        if(currentTargetNode) {
            calculateAndDrawPath(e.target.value, currentTargetNode);
        }
    });

    document.getElementById('btn-clear-path').addEventListener('click', () => {
        currentTargetNode = null;
        document.getElementById('path-stats').style.display = 'none';
        if (currentPathLine) {
            scene.remove(currentPathLine);
            currentPathLine.geometry.dispose();
            currentPathLine.material.dispose();
            currentPathLine = null;
        }
    });

    // -----------------------------------------------------
    // 7. Animation Loop & Resize
    // -----------------------------------------------------
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
        
        // Pulse standard nodes slightly
        Object.keys(nodeMeshes).forEach(nodeId => {
            const mesh = nodeMeshes[nodeId].core;
            if (stadiumGraph[nodeId].type !== 'concourse') {
                mesh.position.y = 2 + Math.sin(time + mesh.position.x) * 0.5;
            }
        });

        // Pulsing Path line
        if (currentPathLine) {
            currentPathLine.material.opacity = 0.6 + Math.sin(time*2)*0.4;
        }

        renderer.render(scene, camera);
    }
    
    animate();
}
