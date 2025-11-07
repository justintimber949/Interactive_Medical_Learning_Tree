// ========================================
// INTERACTIVE MEDICAL LEARNING TREE
// Frontend Application Logic - Part 1
// ========================================

// ========================================
// CONFIGURATION
// ========================================
const API_BASE_URL = 'http://localhost:3000';

// Global State
const appState = {
    treeData: null,
    selectedNode: null,
    currentSessionId: null,
    currentTopic: null,
    zoom: null,
    svg: null
};

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Show toast notification
 */
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-header">
            <span class="toast-title">${type.toUpperCase()}</span>
            <button class="btn-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Show error modal
 */
function showErrorModal(message) {
    const modal = document.getElementById('errorModal');
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = message;
    modal.style.display = 'flex';
}

/**
 * Close error modal
 */
function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
}

/**
 * Show/hide loading indicator
 */
function setProcessingState(isProcessing, status = '') {
    const indicator = document.getElementById('processingIndicator');
    const statusText = document.getElementById('processingStatus');
    
    if (isProcessing) {
        indicator.style.display = 'block';
        statusText.textContent = status;
    } else {
        indicator.style.display = 'none';
    }
}

/**
 * Show/hide feature loading
 */
function setFeatureLoading(isLoading) {
    const loading = document.getElementById('featureLoading');
    loading.style.display = isLoading ? 'block' : 'none';
}

// ========================================
// FILE UPLOAD HANDLING
// ========================================

// Get DOM elements
const uploadArea = document.getElementById('uploadArea');
const pdfInput = document.getElementById('pdfInput');
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const uploadBtn = document.getElementById('uploadBtn');

let selectedFile = null;

// Click to select file
selectFileBtn.addEventListener('click', () => {
    pdfInput.click();
});

// Handle file selection
pdfInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

// Drag and drop handlers
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleFileSelect(file);
    } else {
        showToast('Please drop a PDF file', 'error');
    }
});

/**
 * Handle file selection
 */
function handleFileSelect(file) {
    selectedFile = file;
    fileName.textContent = file.name;
    fileInfo.style.display = 'block';
    showToast(`File selected: ${file.name}`, 'success');
}

/**
 * Upload and analyze PDF
 */
uploadBtn.addEventListener('click', async () => {
    if (!selectedFile) {
        showToast('Please select a file first', 'error');
        return;
    }
    
    // Prepare form data
    const formData = new FormData();
    formData.append('pdfFile', selectedFile);
    
    try {
        // Show processing state
        setProcessingState(true, 'Uploading PDF...');
        uploadBtn.disabled = true;
        
        // Send request
        const response = await fetch(`${API_BASE_URL}/upload-pdf`, {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        setProcessingState(true, 'Analyzing structure...');
        
        const data = await response.json();
        
        if (data.success && data.tree) {
            // Store tree data
            appState.treeData = data.tree;
            
            // Hide processing, show success
            setProcessingState(false);
            showToast('PDF analyzed successfully!', 'success');
            
            // Render tree
            renderTree(data.tree);
            
            // Show controls
            document.getElementById('treeControls').style.display = 'block';
            document.getElementById('legend').style.display = 'block';
            
            // Hide welcome state
            document.getElementById('welcomeState').style.display = 'none';
            document.getElementById('treeSvg').style.display = 'block';
            
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Upload error:', error);
        setProcessingState(false);
        showErrorModal(`Failed to analyze PDF: ${error.message}`);
    } finally {
        uploadBtn.disabled = false;
    }
});

// ========================================
// TREE VISUALIZATION (D3.js)
// ========================================

/**
 * Render tree using D3.js
 */
function renderTree(data) {
    // Clear existing SVG content
    d3.select('#treeSvg').selectAll('*').remove();
    
    const svg = d3.select('#treeSvg');
    const container = svg.node().getBoundingClientRect();
    const width = container.width;
    const height = container.height;
    
    // Create zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    appState.zoom = zoom;
    
    // Create main group
    const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, 50)`);
    
    // Create tree layout
    const treeLayout = d3.tree()
        .size([width - 200, height - 150])
        .separation((a, b) => (a.parent === b.parent ? 1 : 1.2));
    
    // Create hierarchy
    const root = d3.hierarchy(data);
    
    // Apply layout
    treeLayout(root);
    
    // Draw links (connections between nodes)
    g.selectAll('.link')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y))
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('stroke-width', 2);
    
    // Draw nodes
    const nodes = g.selectAll('.node')
        .data(root.descendants())
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .style('cursor', 'pointer')
        .on('click', (event, d) => handleNodeClick(event, d));
    
    // Add circles to nodes
    nodes.append('circle')
        .attr('r', 8)
        .attr('fill', d => getNodeColor(d.depth))
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .on('mouseover', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 12);
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 8);
        });
    
    // Add labels to nodes
    nodes.append('text')
        .attr('dy', -15)
        .attr('text-anchor', 'middle')
        .text(d => d.data.name)
        .style('font-size', '12px')
        .style('font-weight', d => d.depth === 0 ? 'bold' : 'normal')
        .style('fill', '#2C3E50');
    
    // Center the tree
    const bounds = g.node().getBBox();
    const fullWidth = bounds.width;
    const fullHeight = bounds.height;
    const midX = bounds.x + fullWidth / 2;
    const midY = bounds.y + fullHeight / 2;
    
    svg.call(
        zoom.transform,
        d3.zoomIdentity
            .translate(width / 2, 50)
            .scale(Math.min(width / fullWidth, height / fullHeight) * 0.9)
            .translate(-midX, -midY)
    );
    
    appState.svg = svg;
}

/**
 * Get node color based on depth
 */
function getNodeColor(depth) {
    const colors = ['#4A90E2', '#7B68EE', '#50C878', '#F39C12'];
    return colors[depth % colors.length];
}

/**
 * Handle node click
 */
function handleNodeClick(event, d) {
    event.stopPropagation();
    
    const nodeName = d.data.name;
    
    // Update selected node
    appState.selectedNode = d;
    appState.currentTopic = nodeName;
    
    // Highlight selected node
    d3.selectAll('.node circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    
    d3.select(event.currentTarget).select('circle')
        .attr('stroke', '#E74C3C')
        .attr('stroke-width', 4);
    
    // Show sidebar
    const sidebar = document.getElementById('sidebarRight');
    sidebar.style.display = 'flex';
    
    // Update panel title
    document.getElementById('panelTitle').textContent = nodeName;
    
    // Clear previous content
    document.getElementById('analogyContent').innerHTML = '<p class="placeholder-text">Click the button above to generate an analogy</p>';
    document.getElementById('clinicalContent').innerHTML = '<p class="placeholder-text">Click the button above to get clinical context</p>';
    
    // Reset chat
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<div class="chat-welcome"><p>💬 Start chatting about this topic!</p></div>';
    
    showToast(`Selected: ${nodeName}`, 'info');
}

// ========================================
// TREE CONTROLS
// ========================================

document.getElementById('zoomInBtn').addEventListener('click', () => {
    const svg = appState.svg;
    const zoom = appState.zoom;
    if (svg && zoom) {
        svg.transition().duration(300).call(zoom.scaleBy, 1.3);
    }
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    const svg = appState.svg;
    const zoom = appState.zoom;
    if (svg && zoom) {
        svg.transition().duration(300).call(zoom.scaleBy, 0.7);
    }
});

document.getElementById('resetViewBtn').addEventListener('click', () => {
    if (appState.treeData) {
        renderTree(appState.treeData);
        showToast('View reset', 'info');
    }
});

document.getElementById('expandAllBtn').addEventListener('click', () => {
    showToast('Expand all feature coming soon!', 'info');
});

document.getElementById('collapseAllBtn').addEventListener('click', () => {
    showToast('Collapse all feature coming soon!', 'info');
});

document.getElementById('downloadJsonBtn').addEventListener('click', () => {
    if (!appState.treeData) {
        showToast('No data to download', 'error');
        return;
    }
    
    const dataStr = JSON.stringify(appState.treeData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'learning-tree.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON downloaded', 'success');
});

// ========================================
// SIDEBAR CONTROLS
// ========================================

document.getElementById('closePanelBtn').addEventListener('click', () => {
    document.getElementById('sidebarRight').style.display = 'none';
    
    // Remove highlight from selected node
    d3.selectAll('.node circle')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
    
    appState.selectedNode = null;
    appState.currentTopic = null;
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${targetTab}Tab`).classList.add('active');
    });
});

// ========================================
// INITIALIZATION
// ========================================
console.log('🏥 Interactive Medical Learning Tree initialized');
console.log(`📡 API Base URL: ${API_BASE_URL}`);

// ========================================
// INTERACTIVE MEDICAL LEARNING TREE
// Frontend Application Logic - Part 2
// API Interactions for Features
// ========================================

// ========================================
// ANALOGY FEATURE
// ========================================

document.getElementById('getAnalogyBtn').addEventListener('click', async () => {
    if (!appState.currentTopic) {
        showToast('Please select a node first', 'error');
        return;
    }
    
    const btn = document.getElementById('getAnalogyBtn');
    const contentDiv = document.getElementById('analogyContent');
    
    try {
        // Show loading
        btn.disabled = true;
        btn.textContent = 'Generating...';
        contentDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner-small" style="margin: 0 auto;"></div><p>Generating analogy...</p></div>';
        
        // Make API request
        const response = await fetch(`${API_BASE_URL}/get-analogy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: appState.currentTopic
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.analogy) {
            // Display analogy
            contentDiv.innerHTML = formatTextContent(data.analogy);
            showToast('Analogy generated!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Analogy error:', error);
        contentDiv.innerHTML = `
            <div style="color: var(--danger-color); text-align: center; padding: 2rem;">
                <p>❌ Failed to generate analogy</p>
                <small>${error.message}</small>
            </div>
        `;
        showToast('Failed to generate analogy', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Generate Analogy';
    }
});

// ========================================
// CLINICAL RELEVANCE FEATURE
// ========================================

document.getElementById('getClinicalBtn').addEventListener('click', async () => {
    if (!appState.currentTopic) {
        showToast('Please select a node first', 'error');
        return;
    }
    
    const btn = document.getElementById('getClinicalBtn');
    const contentDiv = document.getElementById('clinicalContent');
    
    try {
        // Show loading
        btn.disabled = true;
        btn.textContent = 'Loading...';
        contentDiv.innerHTML = '<div style="text-align: center; padding: 2rem;"><div class="spinner-small" style="margin: 0 auto;"></div><p>Getting clinical context...</p></div>';
        
        // Make API request
        const response = await fetch(`${API_BASE_URL}/get-clinical`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: appState.currentTopic
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.clinical) {
            // Display clinical content
            contentDiv.innerHTML = formatTextContent(data.clinical);
            showToast('Clinical context loaded!', 'success');
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Clinical error:', error);
        contentDiv.innerHTML = `
            <div style="color: var(--danger-color); text-align: center; padding: 2rem;">
                <p>❌ Failed to get clinical context</p>
                <small>${error.message}</small>
            </div>
        `;
        showToast('Failed to get clinical context', 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Get Clinical Context';
    }
});

// ========================================
// CHATBOT FEATURE
// ========================================

/**
 * Initialize chat session
 */
async function initChatSession() {
    if (!appState.currentTopic) {
        showToast('Please select a node first', 'error');
        return false;
    }
    
    // If session already exists for this topic, don't reinitialize
    if (appState.currentSessionId) {
        return true;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/start-chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                topic: appState.currentTopic
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.sessionId) {
            appState.currentSessionId = data.sessionId;
            
            // Add welcome message to chat
            const chatMessages = document.getElementById('chatMessages');
            chatMessages.innerHTML = '';
            addMessageToChat('bot', data.message);
            
            return true;
        } else {
            throw new Error('Failed to start chat session');
        }
        
    } catch (error) {
        console.error('Chat init error:', error);
        showToast('Failed to start chat', 'error');
        return false;
    }
}

/**
 * Send chat message
 */
async function sendChatMessage(message) {
    if (!message.trim()) return;
    
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    
    try {
        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input and disable
        chatInput.value = '';
        chatInput.disabled = true;
        sendBtn.disabled = true;
        
        // Show typing indicator
        const typingId = addTypingIndicator();
        
        // Make API request
        const response = await fetch(`${API_BASE_URL}/chat-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: appState.currentSessionId,
                message: message
            })
        });
        
        // Remove typing indicator
        removeTypingIndicator(typingId);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.response) {
            // Add bot response to chat
            addMessageToChat('bot', data.response);
        } else {
            throw new Error('Invalid response from server');
        }
        
    } catch (error) {
        console.error('Chat error:', error);
        addMessageToChat('bot', '❌ Sorry, I encountered an error. Please try again.');
        showToast('Failed to send message', 'error');
    } finally {
        chatInput.disabled = false;
        sendBtn.disabled = false;
        chatInput.focus();
    }
}

/**
 * Add message to chat UI
 */
function addMessageToChat(sender, message) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove welcome message if exists
    const welcome = chatMessages.querySelector('.chat-welcome');
    if (welcome) {
        welcome.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    const messageBubble = document.createElement('div');
    messageBubble.className = sender === 'user' ? 'message-user' : 'message-bot';
    messageBubble.innerHTML = formatTextContent(message);
    
    messageDiv.appendChild(messageBubble);
    chatMessages.appendChild(messageDiv);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/**
 * Add typing indicator
 */
function addTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    const typingId = 'typing-' + Date.now();
    typingDiv.id = typingId;
    typingDiv.className = 'chat-message';
    typingDiv.innerHTML = `
        <div class="message-bot" style="opacity: 0.7;">
            <span>●</span> <span>●</span> <span>●</span>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return typingId;
}

/**
 * Remove typing indicator
 */
function removeTypingIndicator(typingId) {
    const indicator = document.getElementById(typingId);
    if (indicator) {
        indicator.remove();
    }
}

/**
 * Format text content (preserve line breaks, add basic formatting)
 */
function formatTextContent(text) {
    return text
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^(.+)$/, '<p>$1</p>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
}

// ========================================
// CHAT EVENT LISTENERS
// ========================================

// Send message on button click
document.getElementById('sendChatBtn').addEventListener('click', async () => {
    // Initialize session if needed
    if (!appState.currentSessionId) {
        const initialized = await initChatSession();
        if (!initialized) return;
    }
    
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    
    if (message) {
        await sendChatMessage(message);
    }
});

// Send message on Enter key
document.getElementById('chatInput').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        
        // Initialize session if needed
        if (!appState.currentSessionId) {
            const initialized = await initChatSession();
            if (!initialized) return;
        }
        
        const message = e.target.value.trim();
        
        if (message) {
            await sendChatMessage(message);
        }
    }
});

// Focus chat input when tab is activated
document.querySelector('[data-tab="chatbot"]').addEventListener('click', () => {
    setTimeout(() => {
        document.getElementById('chatInput').focus();
    }, 100);
});

// ========================================
// RESET CHAT SESSION WHEN NODE CHANGES
// ========================================

// Store original handleNodeClick
const originalHandleNodeClick = window.handleNodeClick;

// Override handleNodeClick to reset chat
window.handleNodeClick = function(event, d) {
    // Reset chat session when switching nodes
    appState.currentSessionId = null;
    
    // Call original function
    if (originalHandleNodeClick) {
        originalHandleNodeClick(event, d);
    }
};

// ========================================
// KEYBOARD SHORTCUTS
// ========================================

document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search (future feature)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Future: Focus search input
    }
    
    // Escape: Close sidebar
    if (e.key === 'Escape') {
        const sidebar = document.getElementById('sidebarRight');
        if (sidebar.style.display !== 'none') {
            document.getElementById('closePanelBtn').click();
        }
    }
});

console.log('✅ API Features initialized');