/* social.js */
document.addEventListener('DOMContentLoaded', () => {

    const avatarsLayer = document.getElementById('avatars-layer');
    const chatMessages = document.getElementById('chat-messages');
    const routePath = document.getElementById('route-path');
    const avatarYou = document.getElementById('avatar-you');
    const aiMeetupText = document.getElementById('ai-meetup-text');
    const aiMeetupReasoning = document.getElementById('ai-meetup-reasoning');
    
    // Privacy toggle
    const privacyToggle = document.getElementById('privacy-toggle');
    let isBroadcasting = true;
    privacyToggle.addEventListener('change', (e) => {
        isBroadcasting = e.target.checked;
        if (!isBroadcasting) {
            avatarYou.style.display = 'none';
            logSystemMessage("Location broadcast disabled. Ghost mode active.");
        } else {
            avatarYou.style.display = 'block';
            logSystemMessage("Location broadcast enabled.");
        }
    });

    let friendsData = {};
    let isFindFriendsActive = false;

    // --- WebSocket Logic ---
    function initSocialSocket() {
        let wsUrl;
        if (window.location.protocol === 'file:') {
            wsUrl = 'ws://127.0.0.1:8000/api/v1/ws/social';
        } else {
            const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
            wsUrl = `${wsProtocol}//${window.location.host}/api/v1/ws/social`;
        }
        
        const ws = new WebSocket(wsUrl);

        ws.onopen = () => { logSystemMessage("Connected to Aura Social API."); };
        ws.onerror = () => { logSystemMessage("API Disconnected. Retrying..."); };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            
            // 1. Update Friends Realtime Locations
            if (data.friends) {
                friendsData = data.friends;
                updateAvatars();
                if (isFindFriendsActive) drawPaths();
            }

            // 2. Chat Injection
            if (data.chat) appendFriendMessage(data.chat.sender, data.chat.text);

            // 3. AI Meetup Suggestions
            if (data.ai_meetup) {
                aiMeetupText.innerText = data.ai_meetup.suggestion;
                aiMeetupReasoning.innerText = data.ai_meetup.reasoning;
                
                // Show meetup marker on map
                plotMeetupMarker(data.ai_meetup.zone_x, data.ai_meetup.zone_y);
            }
        };
    }

    // --- UI Draw Logic ---
    function updateAvatars() {
        Object.keys(friendsData).forEach(name => {
            let el = document.getElementById(`avatar-${name}`);
            if (!el) {
                el = document.createElement('div');
                el.className = 'avatar-marker';
                el.id = `avatar-${name}`;
                el.innerText = name;
                avatarsLayer.appendChild(el);
            }
            // Animate to new position
            el.style.left = `${friendsData[name].x}%`;
            el.style.top = `${friendsData[name].y}%`;
        });
    }

    let meetupMarker = null;
    function plotMeetupMarker(x, y) {
        if (!meetupMarker) {
            meetupMarker = document.createElement('div');
            meetupMarker.className = 'avatar-marker meetup';
            meetupMarker.innerHTML = '🎯 MEETUP POINT';
            avatarsLayer.appendChild(meetupMarker);
        }
        meetupMarker.style.left = `${x}%`;
        meetupMarker.style.top = `${y}%`;
    }

    // SVG routing path
    function drawPaths() {
        if (!isBroadcasting) { routePath.setAttribute('d', ''); return; }
        
        // Find nearest friend
        let myX = parseFloat(avatarYou.style.left) || 50;
        let myY = parseFloat(avatarYou.style.top) || 60;
        
        let dStr = "";
        
        // Just draw lines to everyone for group coordination visual
        Object.keys(friendsData).forEach(name => {
            const fx = friendsData[name].x;
            const fy = friendsData[name].y;
            dStr += `M ${myX} ${myY} L ${fx} ${fy} `;
        });

        routePath.setAttribute('d', dStr);
    }

    // Find friends button
    document.getElementById('find-friends-btn').addEventListener('click', (e) => {
        isFindFriendsActive = !isFindFriendsActive;
        const btn = e.target;
        if (isFindFriendsActive) {
            btn.classList.add('active');
            btn.innerText = "Tracking Friends Mode...";
            drawPaths();
            logSystemMessage("Tracking active. Calculating group distances.");
        } else {
            btn.classList.remove('active');
            btn.innerText = "Find My Friends";
            routePath.setAttribute('d', '');
        }
    });

    // Accept Meetup button
    document.getElementById('accept-meetup-btn').addEventListener('click', (e) => {
        const aiText = document.getElementById('ai-meetup-text').innerText;
        appendMyMessage(`I agree: ${aiText}. See you all there!`);
        logSystemMessage("Meetup Point locked. Location broadcast boosted.");
        
        if (!isFindFriendsActive) document.getElementById('find-friends-btn').click();
    });

    // --- Chat Logic ---
    function logSystemMessage(msg) {
        const el = document.createElement('div');
        el.className = 'chat-bubble system';
        el.innerText = msg;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendFriendMessage(name, text) {
        const el = document.createElement('div');
        el.className = 'chat-bubble friend fade-in';
        el.innerHTML = `<span class="sender-name">${name}</span>${text}`;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendMyMessage(text) {
        const el = document.createElement('div');
        el.className = 'chat-bubble me fade-in';
        el.innerText = text;
        chatMessages.appendChild(el);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Input form
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    
    function handleSend() {
        const text = chatInput.value.trim();
        if (text) {
            appendMyMessage(text);
            chatInput.value = '';
        }
    }

    sendBtn.addEventListener('click', handleSend);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });

    // Start
    initSocialSocket();

});
