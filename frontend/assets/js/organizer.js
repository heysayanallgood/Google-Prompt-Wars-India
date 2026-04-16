/* organizer.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const rosterContainer = document.getElementById('staff-roster');
    const aiContainer = document.getElementById('ai-recs-container');
    const incContainer = document.getElementById('incident-container');
    const incidentLayer = document.getElementById('incident-layer');
    const dropZones = document.querySelectorAll('.drop-zone');
    const emergencyGlow = document.getElementById('emergency-glow');
    const auditContainer = document.getElementById('audit-trail-container');

    // Make logAction global so inline onclick handlers can reach it
    window.logAction = function(message) {
        if (!auditContainer) return;
        const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.innerHTML = `<span class="log-time">[${now}]</span> ${message}`;
        auditContainer.prepend(entry);
        
        if (auditContainer.children.length > 20) {
            auditContainer.lastChild.remove();
        }
    };

    // State
    const maxDataPoints = 30; // approx 30 minutes of history for demo
    const timeLabels = [];
    const flowDataA = [];
    const flowDataB = [];
    let chartInstance = null;

    // --- 1. Init Chart.js ---
    function initChart() {
        const ctx = document.getElementById('flowChart').getContext('2d');
        
        Chart.defaults.color = 'rgba(255,255,255,0.5)';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";
        
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Concourse A',
                        data: flowDataA,
                        borderColor: '#00f0ff',
                        backgroundColor: 'rgba(0,240,255,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    },
                    {
                        label: 'Concourse B',
                        data: flowDataB,
                        borderColor: '#ff5e00',
                        backgroundColor: 'rgba(255,94,0,0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 0
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 0 },
                scales: {
                    x: { grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true, suggestedMax: 2.0 }
                },
                plugins: {
                    legend: { display: true, position: 'top' }
                }
            }
        });
    }
    
    // --- 2. WebSocket Connection ---
    function initWebSocket() {
        let wsUrl;
        if (window.location.protocol === 'file:') {
            wsUrl = 'ws://127.0.0.1:8000/api/v1/ws/organizer';
        } else {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/organizer`;
        }
        const ws = new WebSocket(wsUrl);
        
        ws.onopen = () => { window.logAction("SYS: Encrypted Telemetry Active."); };
        ws.onerror = (e) => { window.logAction("SYS ERROR: Connection to core failed."); console.error(e); };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                processTelemetry(data);
            } catch(e) {
                console.error("WS parse error", e);
            }
        };
    }

    function processTelemetry(data) {
        // Update Chart
        if (data.crowd_analytics) {
            const now = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            timeLabels.push(now);
            
            // Assume Concourse A and B exist
            const spdA = data.crowd_analytics['Concourse A'] ? data.crowd_analytics['Concourse A'].flow_speed : 0;
            const spdB = data.crowd_analytics['Concourse B'] ? data.crowd_analytics['Concourse B'].flow_speed : 0;
            
            flowDataA.push(spdA);
            flowDataB.push(spdB);
            
            if (timeLabels.length > maxDataPoints) {
                timeLabels.shift();
                flowDataA.shift();
                flowDataB.shift();
            }
            if(chartInstance) chartInstance.update();

            // Highlight congested dropzones
            dropZones.forEach(zone => {
                const zoneName = zone.getAttribute('data-zone');
                if (data.crowd_analytics[zoneName]) {
                    const density = parseInt(data.crowd_analytics[zoneName].density);
                    if (density > 85) {
                        zone.classList.add('congested');
                        zone.innerHTML = `${zoneName}<br><span style="color:#ff5e00">CONGESTED</span>`;
                    } else {
                        zone.classList.remove('congested');
                        zone.innerHTML = zoneName;
                    }
                }
            });
        }

        // Update Staff Roster
        if (data.staff_locations) {
            renderStaffRoster(data.staff_locations);
        }

        // Update AI Recs
        if (data.ai_recommendations && data.ai_recommendations.length > 0) {
            renderAIRecs(data.ai_recommendations);
        }

        // Update Incidents
        if (data.incidents) {
            renderIncidents(data.incidents);
        }
    }

    // --- 3. Render Helpers ---
    function renderStaffRoster(staffArray) {
        // Only re-render if dragged staff isn't actively being dragged
        if (document.querySelector('.staff-card.dragging')) return;

        rosterContainer.innerHTML = '';
        staffArray.forEach(staff => {
            const el = document.createElement('div');
            el.className = `staff-card ${staff.id.includes('Medic') ? 'medic' : 'sec'} ${staff.status === 'Busy' ? 'busy' : ''}`;
            el.draggable = staff.status !== 'Busy';
            el.dataset.id = staff.id;
            el.innerHTML = `<span class="icon">${staff.id.includes('Medic') ? '⚕️' : '🛡️'}</span> ${staff.id} [${staff.zone}]`;
            
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', staff.id);
                el.classList.add('dragging');
            });
            el.addEventListener('dragend', () => {
                el.classList.remove('dragging');
            });

            rosterContainer.appendChild(el);
        });
    }

    function renderAIRecs(recs) {
        aiContainer.innerHTML = '';
        recs.forEach(rec => {
            const el = document.createElement('div');
            el.className = 'rec-card';
            el.innerHTML = `
                <div class="rec-text">${rec.text}</div>
                <div class="rec-actions">
                    <button class="execute-btn" onclick="this.innerText='Executing...'; window.logAction('AI REC EXECUTED: ${rec.text.replace(/'/g, "\\'")}'); setTimeout(() => this.parentElement.parentElement.remove(), 1000)">Execute Action</button>
                </div>
            `;
            aiContainer.appendChild(el);
        });
    }

    function renderIncidents(incs) {
        if (incs.length === 0) {
            incContainer.innerHTML = '<div class="empty-state">System Nomad. All Clear.</div>';
            incidentLayer.innerHTML = '';
            document.body.classList.remove('emergency-state');
            emergencyGlow.style.display = 'none';
            return;
        }

        // Only flash if critical
        if (incs.some(i => i.severity === 'Critical')) {
            document.body.classList.add('emergency-state');
            emergencyGlow.style.display = 'block';
        } else {
            document.body.classList.remove('emergency-state');
            emergencyGlow.style.display = 'none';
        }

        incContainer.innerHTML = '';
        incidentLayer.innerHTML = '';

        incs.forEach(inc => {
            // Add sidebar card
            const el = document.createElement('div');
            el.className = 'inc-card';
            el.innerHTML = `
                <div class="inc-details">
                    <h4>${inc.type}</h4>
                    <p>Loc: ${inc.zone} | Sev: ${inc.severity}</p>
                </div>
                <div class="inc-actions">
                    <button onclick="this.parentElement.parentElement.remove(); document.body.classList.remove('emergency-state'); document.getElementById('emergency-glow').style.display='none';">Resolve</button>
                </div>
            `;
            incContainer.appendChild(el);

            // Add map marker
            const zoneEl = document.querySelector(`.drop-zone[data-zone="${inc.zone}"]`);
            if(zoneEl) {
                const marker = document.createElement('div');
                marker.className = 'incident-marker';
                marker.style.left = zoneEl.style.left;
                marker.style.top = zoneEl.style.top;
                
                // Add minor offset relative to zone
                const pLeft = parseFloat(marker.style.left);
                const pTop = parseFloat(marker.style.top);
                marker.style.left = (pLeft + 10) + '%';
                marker.style.top = (pTop + 10) + '%';
                incidentLayer.appendChild(marker);
            }
        });
    }

    // --- 4. Drag & Drop Map Integration ---
    dropZones.forEach(zone => {
        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const staffId = e.dataTransfer.getData('text/plain');
            const targetZone = zone.getAttribute('data-zone');
            
            window.logAction(`DISPATCH: ${staffId} manually routed to ${targetZone}.`);
            console.log(`Dispatched ${staffId} to ${targetZone}`);
            zone.innerHTML = `${targetZone}<br><span style="color:#00ffaa; font-size:0.7rem;">+${staffId} En Route</span>`;
            
            // Visual feedback reset after 2s
            setTimeout(() => {
                zone.innerHTML = targetZone;
            }, 2000);
        });
    });

    // --- 5. Global Lockdown ---
    const lockdownBtn = document.getElementById('global-lockdown-btn');
    let isLockdown = false;
    lockdownBtn.addEventListener('click', () => {
        isLockdown = !isLockdown;
        if(isLockdown) {
            document.body.classList.add('global-lockdown');
            lockdownBtn.innerText = 'LIFT LOCKDOWN';
            window.logAction('CRITICAL: PROTOCOL 0 GLOBAL LOCKDOWN INITIATED.');
        } else {
            document.body.classList.remove('global-lockdown');
            lockdownBtn.innerText = 'Global Lockdown';
            window.logAction('CRITICAL: LOCKDOWN LIFTED. System returning to nominal.');
        }
    });

    // Start
    initChart();
    initWebSocket();
});
