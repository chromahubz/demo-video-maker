// Demo Video Maker - Frontend Logic

// Global State
const state = {
    screenshots: [],
    currentStep: 1,
    productInfo: {},
    generatedScript: '',
    selectedTemplate: 'product-hunt-launcher',
    selectedVoice: 'female-excited',
    voiceSpeed: 1.0,
    selectedMusic: 'startup-energy',
    selectedFormats: ['16:9'],
    captions: true,
    watermark: false,
    templates: [],
    voices: [],
    music: [],
    examples: [],
    jobId: null,
    scriptLength: 60
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeEventListeners();
    setupStepIndicators();
});

// ====================================
// DATA LOADING
// ====================================

async function loadData() {
    try {
        // Load templates
        const templatesRes = await fetch('templates.json');
        state.templates = (await templatesRes.json()).templates;
        renderTemplates();

        // Load voices
        const voicesRes = await fetch('voices.json');
        const voicesData = await voicesRes.json();
        state.voices = voicesData.voices;
        renderVoices();

        // Load music
        const musicRes = await fetch('music-library.json');
        state.music = (await musicRes.json()).tracks;
        renderMusic();

        // Load examples
        const examplesRes = await fetch('examples.json');
        const examplesData = await examplesRes.json();
        state.examples = examplesData.examples;
        renderExamples();

        console.log('[LOADED] All data loaded successfully');
    } catch (error) {
        console.error('[ERROR] Failed to load data:', error);
        showNotification('Failed to load configuration files', 'error');
    }
}

// ====================================
// EVENT LISTENERS
// ====================================

function initializeEventListeners() {
    // Upload area
    const uploadArea = document.getElementById('upload-area');
    const screenshotInput = document.getElementById('screenshot-input');

    uploadArea.addEventListener('click', () => screenshotInput.click());

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-purple-500', 'bg-purple-100');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('border-purple-500', 'bg-purple-100');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-purple-500', 'bg-purple-100');
        handleFiles(e.dataTransfer.files);
    });

    screenshotInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // Step navigation
    document.getElementById('continue-to-script').addEventListener('click', () => goToStep(2));
    document.getElementById('back-to-upload').addEventListener('click', () => goToStep(1));
    document.getElementById('continue-to-customize').addEventListener('click', () => goToStep(3));
    document.getElementById('back-to-script').addEventListener('click', () => goToStep(2));
    document.getElementById('create-another').addEventListener('click', () => resetAndStart());

    // Script generation
    document.getElementById('generate-script-btn').addEventListener('click', generateScript);
    document.getElementById('edit-script-btn').addEventListener('click', toggleScriptEdit);

    // Script length buttons
    document.querySelectorAll('.script-length-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.script-length-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.scriptLength = parseInt(btn.dataset.length);
        });
    });

    // Voice controls
    document.getElementById('voice-select').addEventListener('change', (e) => {
        state.selectedVoice = e.target.value;
        updateVoicePreview();
    });

    document.getElementById('voice-speed').addEventListener('input', (e) => {
        state.voiceSpeed = parseFloat(e.target.value);
        document.getElementById('speed-value').textContent = `${state.voiceSpeed}x`;
    });

    // Music selection
    document.getElementById('music-select').addEventListener('change', (e) => {
        state.selectedMusic = e.target.value;
        updateMusicPreview();
    });

    // Format checkboxes
    document.querySelectorAll('.format-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedFormats);
    });

    // Options
    document.getElementById('captions-toggle').addEventListener('change', (e) => {
        state.captions = e.target.checked;
    });

    document.getElementById('watermark-toggle').addEventListener('change', (e) => {
        state.watermark = e.target.checked;
    });

    // Generate video
    document.getElementById('generate-video-btn').addEventListener('click', generateVideo);

    // Gallery toggle
    document.getElementById('toggle-gallery').addEventListener('click', toggleGallery);

    // Email capture
    document.getElementById('email-capture-form').addEventListener('submit', handleEmailCapture);
}

// ====================================
// SCREENSHOT HANDLING
// ====================================

function handleFiles(files) {
    const fileArray = Array.from(files);

    if (state.screenshots.length + fileArray.length > 10) {
        showNotification('Maximum 10 screenshots allowed', 'warning');
        return;
    }

    fileArray.forEach(file => {
        if (file.size > 5 * 1024 * 1024) {
            showNotification(`${file.name} is too large (max 5MB)`, 'warning');
            return;
        }

        if (!file.type.startsWith('image/')) {
            showNotification(`${file.name} is not an image`, 'warning');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            state.screenshots.push({
                id: Date.now() + Math.random(),
                data: e.target.result,
                name: file.name
            });
            renderScreenshots();
        };
        reader.readAsDataURL(file);
    });
}

function renderScreenshots() {
    const grid = document.getElementById('screenshots-grid');
    const count = document.getElementById('screenshots-count');
    const continueBtn = document.getElementById('continue-to-script');

    if (state.screenshots.length === 0) {
        grid.classList.add('hidden');
        count.classList.add('hidden');
        continueBtn.disabled = true;
        return;
    }

    grid.classList.remove('hidden');
    count.classList.remove('hidden');
    continueBtn.disabled = false;

    grid.innerHTML = state.screenshots.map((screenshot, index) => `
        <div class="screenshot-item relative bg-white rounded-lg shadow-md overflow-hidden cursor-move" data-id="${screenshot.id}">
            <img src="${screenshot.data}" alt="${screenshot.name}" class="w-full h-32 object-cover">
            <div class="absolute top-2 left-2 bg-purple-600 text-white px-2 py-1 rounded text-sm font-bold">
                ${index + 1}
            </div>
            <button class="absolute top-2 right-2 bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-all" onclick="removeScreenshot('${screenshot.id}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');

    document.getElementById('count-text').textContent = `${state.screenshots.length}/10 screenshots uploaded`;

    // Make sortable
    new Sortable(grid, {
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function(evt) {
            const item = state.screenshots.splice(evt.oldIndex, 1)[0];
            state.screenshots.splice(evt.newIndex, 0, item);
            renderScreenshots();
        }
    });
}

window.removeScreenshot = function(id) {
    state.screenshots = state.screenshots.filter(s => s.id !== id);
    renderScreenshots();
};

// ====================================
// TEMPLATE RENDERING
// ====================================

function renderTemplates() {
    const container = document.getElementById('templates-container');

    container.innerHTML = state.templates.map(template => `
        <div class="template-card border-2 border-gray-200 rounded-lg p-4 ${template.id === state.selectedTemplate ? 'selected' : ''}" onclick="selectTemplate('${template.id}')">
            <div class="flex items-start">
                <div class="text-3xl mr-4">
                    <i class="fas fa-${template.icon}"></i>
                </div>
                <div class="flex-1">
                    <div class="flex items-center justify-between mb-2">
                        <h4 class="font-bold text-lg">${template.name}</h4>
                        ${template.popular ? '<span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Popular</span>' : ''}
                    </div>
                    <p class="text-sm text-gray-600 mb-2">${template.description}</p>
                    <div class="flex items-center space-x-2 text-xs text-gray-500">
                        <span><i class="fas fa-clock mr-1"></i>${template.duration}</span>
                        <span>•</span>
                        <span><i class="fas fa-expand mr-1"></i>${template.aspectRatio.join(', ')}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

window.selectTemplate = function(templateId) {
    state.selectedTemplate = templateId;
    renderTemplates();

    const template = state.templates.find(t => t.id === templateId);
    if (template && template.captionsDefault !== undefined) {
        document.getElementById('captions-toggle').checked = template.captionsDefault;
        state.captions = template.captionsDefault;
    }
};

// ====================================
// VOICE RENDERING
// ====================================

function renderVoices() {
    const select = document.getElementById('voice-select');

    select.innerHTML = state.voices.map(voice => `
        <option value="${voice.id}" ${voice.id === state.selectedVoice ? 'selected' : ''}>
            ${voice.name} ${voice.popular ? '⭐' : ''}
        </option>
    `).join('');

    updateVoicePreview();
}

function updateVoicePreview() {
    const voice = state.voices.find(v => v.id === state.selectedVoice);
    const preview = document.getElementById('voice-preview');

    if (voice) {
        preview.classList.remove('hidden');
        preview.innerHTML = `
            <i class="fas fa-info-circle mr-2"></i>
            ${voice.description}<br>
            <span class="text-xs text-purple-600 mt-1 block">${voice.sample}</span>
        `;
    }
}

// ====================================
// MUSIC RENDERING
// ====================================

function renderMusic() {
    const select = document.getElementById('music-select');

    select.innerHTML = state.music.map(track => `
        <option value="${track.id}" ${track.id === state.selectedMusic ? 'selected' : ''}>
            ${track.name} ${track.popular ? '⭐' : ''} (${track.mood})
        </option>
    `).join('');

    updateMusicPreview();
}

function updateMusicPreview() {
    const track = state.music.find(m => m.id === state.selectedMusic);
    const preview = document.getElementById('music-preview');

    if (track && track.id !== 'none') {
        preview.classList.remove('hidden');
        preview.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <p class="font-semibold">${track.name}</p>
                    <p class="text-xs text-gray-500">${track.description}</p>
                </div>
                <div class="text-right text-xs">
                    <p><i class="fas fa-music mr-1"></i>${track.bpm} BPM</p>
                    <p><i class="fas fa-clock mr-1"></i>${track.duration}</p>
                </div>
            </div>
        `;
    } else if (track && track.id === 'none') {
        preview.classList.add('hidden');
    }
}

// ====================================
// EXAMPLES GALLERY
// ====================================

function renderExamples() {
    const container = document.getElementById('examples-container');

    if (!state.examples || state.examples.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-500 col-span-full">No examples available yet</p>';
        return;
    }

    container.innerHTML = state.examples.map(example => `
        <div class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div class="relative">
                <img src="${example.thumbnail}" alt="${example.productName}" class="w-full h-48 object-cover">
                <div class="absolute top-3 right-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                    <i class="fas fa-play mr-1"></i> ${example.duration}
                </div>
            </div>
            <div class="p-5">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-bold text-lg text-gray-800">${example.productName}</h3>
                    <span class="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">${example.category}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${example.description}</p>
                <div class="flex items-center justify-between text-sm text-gray-500 border-t pt-3">
                    <div class="flex items-center space-x-3">
                        <span><i class="fas fa-eye mr-1"></i> ${example.views.toLocaleString()}</span>
                        <span><i class="fas fa-thumbs-up mr-1"></i> ${example.upvotes.toLocaleString()}</span>
                    </div>
                    <span class="text-xs text-purple-600">${example.template}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleGallery() {
    const gallery = document.getElementById('gallery-grid');
    const toggleBtn = document.getElementById('toggle-gallery');
    const toggleText = document.getElementById('toggle-text');
    const icon = toggleBtn.querySelector('i');

    if (gallery.classList.contains('hidden')) {
        gallery.classList.remove('hidden');
        toggleText.textContent = 'Hide Examples';
        icon.classList.remove('fa-chevron-down');
        icon.classList.add('fa-chevron-up');
    } else {
        gallery.classList.add('hidden');
        toggleText.textContent = 'Show Examples';
        icon.classList.remove('fa-chevron-up');
        icon.classList.add('fa-chevron-down');
    }
}

// ====================================
// SCRIPT GENERATION
// ====================================

async function generateScript() {
    const productName = document.getElementById('product-name').value.trim();
    const productDescription = document.getElementById('product-description').value.trim();
    const productFeatures = document.getElementById('product-features').value.trim();
    const category = document.getElementById('product-category').value;

    if (!productName || !productDescription) {
        showNotification('Please fill in product name and description', 'warning');
        return;
    }

    // Store product info
    state.productInfo = {
        name: productName,
        description: productDescription,
        features: productFeatures.split('\n').filter(f => f.trim()),
        category,
        length: state.scriptLength
    };

    // Show loading
    const btn = document.getElementById('generate-script-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating Script...';
    btn.disabled = true;

    try {
        // Simulate AI script generation (in production, call your AI API)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate script based on product info
        state.generatedScript = generateAIScript(state.productInfo);

        // Show generated script
        document.getElementById('script-preview').textContent = state.generatedScript;
        document.getElementById('word-count').textContent = state.generatedScript.split(' ').length;
        document.getElementById('read-time').textContent = `${Math.ceil(state.generatedScript.split(' ').length / 150 * 60)}s`;
        document.getElementById('generated-script-container').classList.remove('hidden');

        showNotification('Script generated successfully!', 'success');
    } catch (error) {
        showNotification('Failed to generate script', 'error');
        console.error(error);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function generateAIScript(info) {
    const { name, description, features, length } = info;

    let script = `Meet ${name} - ${description}\n\n`;

    if (features.length > 0) {
        script += `Here's what makes it amazing:\n`;
        features.forEach((feature, i) => {
            script += `${i + 1}. ${feature}\n`;
        });
        script += `\n`;
    }

    if (length === 30) {
        script += `Get started today and see the difference immediately. ${name} - making your life easier.`;
    } else if (length === 60) {
        script += `Whether you're a beginner or a pro, ${name} adapts to your needs. Join thousands of satisfied users who've already made the switch.\n\nReady to transform how you work? Try ${name} now!`;
    } else {
        script += `Our users report saving an average of 10 hours per week. That's more time for what really matters.\n\n${name} integrates seamlessly with your existing workflow. No complex setup, no learning curve - just results from day one.\n\nThousands of professionals trust ${name}. Now it's your turn to experience the difference. Start your journey today!`;
    }

    return script;
}

function toggleScriptEdit() {
    const preview = document.getElementById('script-preview');
    const editBtn = document.getElementById('edit-script-btn');
    const isEditing = preview.contentEditable === 'true';

    if (isEditing) {
        // Save mode
        preview.contentEditable = 'false';
        preview.classList.remove('border-2', 'border-purple-300', 'p-3', 'rounded', 'bg-white');
        editBtn.innerHTML = '<i class="fas fa-edit mr-1"></i> Edit';
        state.generatedScript = preview.textContent;

        // Update word count and read time
        document.getElementById('word-count').textContent = state.generatedScript.split(' ').length;
        document.getElementById('read-time').textContent = `${Math.ceil(state.generatedScript.split(' ').length / 150 * 60)}s`;

        showNotification('Script updated successfully', 'success');
    } else {
        // Edit mode
        preview.contentEditable = 'true';
        preview.classList.add('border-2', 'border-purple-300', 'p-3', 'rounded', 'bg-white');
        preview.focus();
        editBtn.innerHTML = '<i class="fas fa-save mr-1"></i> Save';
    }
}

// ====================================
// FORMAT SELECTION
// ====================================

function updateSelectedFormats() {
    state.selectedFormats = Array.from(document.querySelectorAll('.format-checkbox:checked')).map(cb => cb.value);
}

// ====================================
// VIDEO GENERATION
// ====================================

async function generateVideo() {
    if (state.selectedFormats.length === 0) {
        showNotification('Please select at least one export format', 'warning');
        return;
    }

    // Move to step 4
    goToStep(4);

    // Prepare payload
    const payload = {
        screenshots: state.screenshots.map(s => s.data),
        script: state.generatedScript,
        productInfo: state.productInfo,
        voiceSettings: {
            voice: state.selectedVoice,
            speed: state.voiceSpeed
        },
        template: state.selectedTemplate,
        music: state.selectedMusic,
        formats: state.selectedFormats,
        captions: state.captions,
        watermark: state.watermark
    };

    try {
        // Call n8n webhook
        const n8nWebhook = 'https://your-n8n-instance.com/webhook/generate-demo';  // This would be from .env in production

        // For demo purposes, simulate the process
        await simulateVideoGeneration();

        // In production, you would do:
        // const response = await fetch(n8nWebhook, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(payload)
        // });
        // const data = await response.json();
        // state.jobId = data.jobId;
        // pollJobStatus(data.jobId);

    } catch (error) {
        console.error('[ERROR] Video generation failed:', error);
        showNotification('Video generation failed', 'error');
    }
}

async function simulateVideoGeneration() {
    const messages = [
        'Initializing video processor...',
        'Processing screenshots...',
        'Generating AI voiceover...',
        'Adding background music...',
        'Applying transitions...',
        'Rendering video formats...',
        'Finalizing exports...'
    ];

    for (let i = 0; i < messages.length; i++) {
        document.getElementById('processing-message').textContent = messages[i];

        const progress = ((i + 1) / messages.length) * 100;
        updateProgress(progress);

        await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Show download state
    showDownloads();
}

function updateProgress(percent) {
    const circle = document.getElementById('progress-circle');
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (percent / 100) * circumference;

    circle.style.strokeDashoffset = offset;
    document.getElementById('progress-percentage').textContent = `${Math.round(percent)}%`;

    if (percent < 100) {
        const remaining = Math.ceil((100 - percent) / 100 * 60);
        document.getElementById('estimated-time').textContent = `${remaining} seconds`;
    } else {
        document.getElementById('estimated-time').textContent = 'Complete!';
    }
}

function showDownloads() {
    document.getElementById('processing-state').classList.add('hidden');
    document.getElementById('download-state').classList.remove('hidden');

    const downloadCards = document.getElementById('download-cards');

    downloadCards.innerHTML = state.selectedFormats.map(format => {
        const formatNames = {
            '16:9': { name: 'Landscape', icon: 'desktop', size: '1080p' },
            '9:16': { name: 'Vertical', icon: 'mobile-alt', size: '1080x1920' },
            '1:1': { name: 'Square', icon: 'square', size: '1080x1080' }
        };

        const info = formatNames[format];

        return `
            <div class="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 text-center">
                <div class="text-5xl text-purple-600 mb-4">
                    <i class="fas fa-${info.icon}"></i>
                </div>
                <h3 class="font-bold text-lg mb-2">${info.name} (${format})</h3>
                <p class="text-sm text-gray-600 mb-4">${info.size}</p>
                <button class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all">
                    <i class="fas fa-download mr-2"></i> Download MP4
                </button>
            </div>
        `;
    }).join('');

    showNotification('Videos generated successfully!', 'success');
}

// ====================================
// STEP MANAGEMENT
// ====================================

function goToStep(step) {
    // Hide all steps
    for (let i = 1; i <= 4; i++) {
        document.getElementById(`step-${i}`).classList.add('hidden');
        document.querySelector(`[data-step="${i}"]`).classList.remove('active', 'completed');
    }

    // Show current step
    document.getElementById(`step-${step}`).classList.remove('hidden');
    document.querySelector(`[data-step="${step}"]`).classList.add('active');

    // Mark previous steps as completed
    for (let i = 1; i < step; i++) {
        document.querySelector(`[data-step="${i}"]`).classList.add('completed');
    }

    state.currentStep = step;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupStepIndicators() {
    const style = document.createElement('style');
    style.textContent = `
        .step-indicator {
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 10;
        }

        .step-circle {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-center;
            font-size: 24px;
            color: #6b7280;
            transition: all 0.3s;
        }

        .step-indicator.active .step-circle {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            transform: scale(1.1);
        }

        .step-indicator.completed .step-circle {
            background: #10b981;
            color: white;
        }

        .step-label {
            margin-top: 8px;
            font-size: 14px;
            font-weight: 600;
            color: #6b7280;
        }

        .step-indicator.active .step-label {
            color: #667eea;
        }

        .step-line {
            flex: 1;
            height: 2px;
            background: #e5e7eb;
            margin: 0 16px;
            margin-top: -30px;
        }

        .script-length-btn {
            padding: 12px 24px;
            border: 2px solid #d1d5db;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.2s;
            cursor: pointer;
            background: white;
            color: #374151;
        }

        .script-length-btn:hover {
            border-color: #667eea;
            background: #f9fafb;
        }

        .script-length-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: #667eea;
            transform: scale(1.05);
        }
    `;
    document.head.appendChild(style);
}

function resetAndStart() {
    state.screenshots = [];
    state.generatedScript = '';
    state.jobId = null;
    state.productInfo = {};

    document.getElementById('screenshot-input').value = '';
    document.getElementById('product-name').value = '';
    document.getElementById('product-description').value = '';
    document.getElementById('product-features').value = '';
    document.getElementById('product-category').value = '';
    document.getElementById('generated-script-container').classList.add('hidden');

    renderScreenshots();
    goToStep(1);
}

// ====================================
// UTILITIES
// ====================================

function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-4 rounded-lg shadow-lg z-50 transform transition-all duration-300`;
    notification.innerHTML = `
        <div class="flex items-center space-x-3">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleEmailCapture(e) {
    e.preventDefault();

    const emailInput = document.getElementById('email-input');
    const email = emailInput.value.trim();

    if (!email) {
        showNotification('Please enter a valid email', 'warning');
        return;
    }

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Show loading state
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Submitting...';
    submitBtn.disabled = true;

    // Simulate API call (replace with actual API endpoint)
    setTimeout(() => {
        // In production, send to your email service (Mailchimp, ConvertKit, etc.)
        console.log('[EMAIL CAPTURE]', email);

        // Show success message
        showNotification('🎉 Welcome! Check your email for early access details.', 'success');

        // Reset form
        emailInput.value = '';
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> You\'re In!';

        // Reset button after 3 seconds
        setTimeout(() => {
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }, 3000);
    }, 1500);
}

console.log('[INIT] Demo Video Maker loaded successfully');
