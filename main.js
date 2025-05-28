// JavaScript code extracted from index.html
// Global variables
let currentTab = 'text';
let qr = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    generateQR();
    // Initialize AdSense
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
});

// Theme toggle functionality
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    showNotification(`Switched to ${newTheme} theme`);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.body.setAttribute('data-theme', savedTheme);
}

// Tab switching functionality
function switchTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    currentTab = tabName;
    generateQR();
}

// QR Code generation
function generateQR() {
    let text = '';
    const canvas = document.getElementById('qrCanvas');
    const size = parseInt(document.getElementById('qrSize').value);
    const fgColor = document.getElementById('fgColor').value;
    const bgColor = document.getElementById('bgColor').value;
    // Get text based on current tab
    switch(currentTab) {
        case 'text':
            text = document.getElementById('textInput').value;
            break;
        case 'url':
            text = document.getElementById('urlInput').value;
            break;
        case 'email':
            const email = document.getElementById('emailInput').value;
            const subject = document.getElementById('emailSubject').value;
            const body = document.getElementById('emailBody').value;
            if (email) {
                text = `mailto:${email}`;
                if (subject) text += `?subject=${encodeURIComponent(subject)}`;
                if (body) text += `${subject ? '&' : '?'}body=${encodeURIComponent(body)}`;
            }
            break;
        case 'phone':
            const phone = document.getElementById('phoneInput').value;
            if (phone) text = `tel:${phone}`;
            break;
        case 'wifi':
            const ssid = document.getElementById('wifiSSID').value;
            const password = document.getElementById('wifiPassword').value;
            const security = document.getElementById('wifiSecurity').value;
            if (ssid) {
                text = `WIFI:T:${security};S:${ssid};P:${password};;`;
            }
            break;
        case 'sms':
            const smsNumber = document.getElementById('smsNumber').value;
            const smsMessage = document.getElementById('smsMessage').value;
            if (smsNumber) {
                text = `sms:${smsNumber}`;
                if (smsMessage) text += `?body=${encodeURIComponent(smsMessage)}`;
            }
            break;
    }
    if (text.trim()) {
        try {
            qr = new QRious({
                element: canvas,
                value: text,
                size: size,
                foreground: fgColor,
                background: bgColor,
                level: 'M'
            });
        } catch (error) {
            console.error('Error generating QR code:', error);
            showNotification('Error generating QR code', 'error');
        }
    } else {
        // Clear canvas if no text
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Download functionality
function downloadQR(format) {
    if (!qr) {
        showNotification('Please generate a QR code first', 'error');
        return;
    }
    const canvas = document.getElementById('qrCanvas');
    const link = document.createElement('a');
    if (format === 'png') {
        link.download = `qr-code-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
    } else if (format === 'svg') {
        const svgString = canvasToSVG(canvas);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        link.download = `qr-code-${Date.now()}.svg`;
        link.href = url;
        link.addEventListener('click', () => {
            setTimeout(() => URL.revokeObjectURL(url), 100);
        });
    }
    link.click();
    showNotification(`QR code downloaded as ${format.toUpperCase()}`);
}

function canvasToSVG(canvas) {
    const width = canvas.width;
    const height = canvas.height;
    // Canvas ma'lumotlarini olish
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, width, height);
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
    svg += `<rect width="100%" height="100%" fill="white"/>`;
    // Piksellarni tekshirish va qora kvadratlar yaratish
    const pixelSize = 1;
    for (let y = 0; y < height; y += pixelSize) {
        for (let x = 0; x < width; x += pixelSize) {
            const index = (y * width + x) * 4;
            const r = imageData.data[index];
            const g = imageData.data[index + 1];
            const b = imageData.data[index + 2];
            // Qora piksellar uchun to'rtburchak yaratish
            if (r < 128 && g < 128 && b < 128) {
                svg += `<rect x="${x}" y="${y}" width="${pixelSize}" height="${pixelSize}" fill="black"/>`;
            }
        }
    }
    svg += '</svg>';
    return svg;
}

// Batch generation
function generateBatch() {
    const input = document.getElementById('batchInput').value;
    const lines = input.split('\n').filter(line => line.trim());
    if (lines.length === 0) {
        showNotification('Please enter some text for batch generation', 'error');
        return;
    }
    const resultsContainer = document.getElementById('batchResults');
    resultsContainer.innerHTML = '';
    lines.forEach((line, index) => {
        const canvas = document.createElement('canvas');
        const container = document.createElement('div');
        container.className = 'batch-item';
        try {
            new QRious({
                element: canvas,
                value: line.trim(),
                size: 200,
                foreground: document.getElementById('fgColor').value,
                background: document.getElementById('bgColor').value
            });
            container.innerHTML = `
                <canvas style="max-width: 100%;"></canvas>
                <p style="font-size: 0.875rem; margin-top: 0.5rem; word-break: break-all;">${line}</p>
                <button class="btn btn-primary" style="margin-top: 0.5rem; padding: 0.25rem 0.5rem; font-size: 0.75rem;" 
                        onclick="downloadBatchItem(this, '${line}', ${index})">
                    Download
                </button>
            `;
            container.querySelector('canvas').replaceWith(canvas);
            resultsContainer.appendChild(container);
        } catch (error) {
            console.error('Error generating batch QR code:', error);
        }
    });
    showNotification(`Generated ${lines.length} QR codes`);
}

function downloadBatchItem(button, text, index) {
    const canvas = button.parentElement.querySelector('canvas');
    const link = document.createElement('a');
    link.download = `batch-qr-${index + 1}-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Service Worker for offline functionality
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('data:text/javascript;base64,c2VsZi5hZGRFdmVudExpc3RlbmVyKCdpbnN0YWxsJywgZnVuY3Rpb24oZXZlbnQpIHsKICBldmVudC53YWl0VW50aWwoc2VsZi5za2lwV2FpdGluZygpKTsKfSk7');
} 