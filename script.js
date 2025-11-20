const canvas = document.getElementById('matrixCanvas');
const ctx = canvas.getContext('2d');
const terminalContainer = document.getElementById('terminalContainer');
const startOverlay = document.getElementById('startOverlay');
const terminalBody = document.getElementById('terminalBody');
const commandInput = document.getElementById('commandInput');

// --- Sound Manager & Voice Synthesis ---
class SoundManager {
    constructor() {
        this.ctx = null;
        this.gainNode = null;
        this.initialized = false;
        this.voiceEnabled = true;
    }

    init() {
        if (this.initialized) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        this.gainNode = this.ctx.createGain();
        this.gainNode.connect(this.ctx.destination);
        this.gainNode.gain.value = 0.1;
        this.initialized = true;
    }

    unlockMobile() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        // Play silent buffer to unlock iOS audio
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);

        // Unlock Speech Synthesis
        if (window.speechSynthesis) {
            const utterance = new SpeechSynthesisUtterance('');
            window.speechSynthesis.speak(utterance);
        }
    }

    playTone(freq, type, duration) {
        if (!this.initialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.gainNode);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
    }

    playKeySound() {
        const freq = 600 + Math.random() * 200;
        this.playTone(freq, 'square', 0.05);
    }

    playEnterSound() {
        this.playTone(400, 'sawtooth', 0.1);
        setTimeout(() => this.playTone(800, 'sine', 0.15), 100);
    }

    playBootSound() {
        this.playTone(100, 'square', 0.5);
        setTimeout(() => this.playTone(200, 'square', 0.5), 200);
        setTimeout(() => this.playTone(400, 'square', 0.5), 400);
    }

    speak(text) {
        if (!this.voiceEnabled || !window.speechSynthesis) return;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1;
        utterance.pitch = 0.8;
        const voices = window.speechSynthesis.getVoices();
        const robotVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David'));
        if (robotVoice) utterance.voice = robotVoice;
        window.speechSynthesis.speak(utterance);
    }
}

const soundManager = new SoundManager();

// --- Particle System ---
const particleCanvas = document.createElement('canvas');
particleCanvas.id = 'particleCanvas';
particleCanvas.style.position = 'absolute';
particleCanvas.style.top = '0';
particleCanvas.style.left = '0';
particleCanvas.style.width = '100%';
particleCanvas.style.height = '100%';
particleCanvas.style.pointerEvents = 'none';
particleCanvas.style.zIndex = '30'; // Above terminal
document.body.appendChild(particleCanvas);

const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticleCanvas);
resizeParticleCanvas();

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = getComputedStyle(document.body).getPropertyValue('--terminal-text').trim();
        this.life = 1.0;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= 0.02;
    }
    draw() {
        pCtx.fillStyle = this.color;
        pCtx.globalAlpha = this.life;
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fill();
        pCtx.globalAlpha = 1.0;
    }
}

function handleParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }
    requestAnimationFrame(handleParticles);
}
handleParticles();

function spawnParticlesAtInput() {
    const rect = commandInput.getBoundingClientRect();
    // Approximate cursor position at end of input
    const x = rect.left + Math.min(rect.width, commandInput.value.length * 10) + 20;
    const y = rect.top + rect.height / 2;

    for (let i = 0; i < 5; i++) {
        particles.push(new Particle(x, y));
    }
}


// --- Matrix Rain ---
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
const fontSize = 14;
let columns = canvas.width / fontSize;
let drops = [];

function initMatrix() {
    columns = canvas.width / fontSize;
    drops = [];
    for (let i = 0; i < columns; i++) {
        drops[i] = 1;
    }
}
initMatrix();

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const computedStyle = getComputedStyle(document.body);
    ctx.fillStyle = computedStyle.getPropertyValue('--terminal-text').trim();
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

// --- File System ---
const fileSystem = {
    'root': {
        type: 'dir',
        children: {
            'about.txt': { type: 'file', content: "Syazmi Hafiz\nCybersecurity Specialist | Offensive Security Researcher\nLocation: [REDACTED]\nMission: Securing digital ecosystems through ethical hacking, threat analysis, and secure engineering." },
            'skills.txt': { type: 'file', content: "SKILLS:\n- Penetration Testing (Web, Network, API)\n- Red Teaming & Adversary Simulation\n- Threat Intelligence & Malware Analysis\n- Secure Code Review\n\nTOOLS:\n- Burp Suite, OWASP ZAP, Metasploit, Nmap\n- Wireshark, tcpdump, Sysmon\n- John the Ripper, Hashcat\n- Splunk, ELK, Zeek\n- Docker, Kubernetes (for secure deployments)\n\nLANGUAGES:\n- Python (automation & tooling)\n- Bash (offensive scripting)\n- Go (security tooling)" },
            'research.txt': { type: 'file', content: "- Discovered vulnerabilities in web apps (SQL Injection, XSS, IDOR, SSRF)\n- Studying malware C2 communication patterns\n- Building custom recon automation tools" },
            'contact.txt': { type: 'file', content: "Email: muhammadsyazmihafiz@gmail.com\nWebsite: syazmi.com" },
            'projects': {
                type: 'dir',
                children: {
                    'redteam_lab.txt': { type: 'file', content: "Adversary simulation environment featuring custom payloads,\nprivilege escalation paths, and detection evasion techniques." },
                    'recon_automator.txt': { type: 'file', content: "Automated reconnaissance tool integrating subdomain enumeration, port scanning, and screenshotting." },
                    'vuln_scanner.txt': { type: 'file', content: "Lightweight scanner for detecting common OWASP Top 10 issues." },
                    'malware_sandbox.txt': { type: 'file', content: "Isolated environment for analyzing suspicious binaries and behavioral patterns." }
                }
            },
            'writeups': {
                type: 'dir',
                children: {
                    'cve_research_01.txt': { type: 'file', content: "Analysis of a critical RCE vulnerability in a popular web framework." },
                    'ctf_web_2024.txt': { type: 'file', content: "Walkthrough of the 'CyberDome' CTF web challenges." },
                    'ctf_rev_2023.txt': { type: 'file', content: "Reverse engineering a custom ransomware binary from the 'HackTheBox' event." },
                    'bug_bounty_notes.txt': { type: 'file', content: "Methodology for hunting logic flaws in financial applications." }
                }
            },
            'toolkit': {
                type: 'dir',
                children: {
                    'recon_tool.py': { type: 'file', content: "import requests\n# Custom recon logic..." },
                    'payload_generator.py': { type: 'file', content: "def generate_payload(type):\n    # Payload generation logic..." },
                    'log_analyzer.py': { type: 'file', content: "import re\n# Log analysis pattern matching..." }
                }
            },
            'secrets': {
                type: 'dir',
                children: {
                    'passwords.txt': { type: 'file', content: "ENCRYPTED FILE. USE 'decrypt' COMMAND." }
                }
            }
        }
    }
};

let currentPath = ['root'];
let currentDir = fileSystem['root'];

function getDir(pathArray) {
    let dir = fileSystem['root'];
    for (let i = 1; i < pathArray.length; i++) {
        dir = dir.children[pathArray[i]];
    }
    return dir;
}

// --- Hacker Typer Mode ---
let hackerTyperMode = false;
const hackerCode = `
#include <iostream>
#include <vector>
#include <string>

using namespace std;

// Syazmi Security Protocol v4.2
class Firewall {
public:
    void bypass() {
        cout << "Bypassing main gateway..." << endl;
        inject_packet("0x909090");
    }
private:
    void inject_packet(string payload) {
        // Buffer overflow exploit
        char buffer[512];
        strcpy(buffer, payload.c_str());
    }
};

int main() {
    Firewall fw;
    fw.bypass();
    return 0;
}
`;
let hackerCodeIndex = 0;

// --- Terminal Logic ---
let commandHistory = [];
let historyIndex = -1;

const asciiBanner = `
  ██████  ██    ██  █████  ███████ ███    ███ ██ 
  ██      ██    ██ ██   ██    ███  ████  ████ ██ 
  ███████  ██  ██  ███████   ███   ██ ████ ██ ██ 
       ██   ████   ██   ██  ███    ██  ██  ██ ██ 
  ██████     ██    ██   ██ ███████ ██      ██ ██ 
`;

const mobileBanner = `
  SYAZMI.COM
  [SYSTEM ONLINE]
`;

async function typeText(element, text, speed = 20) {
    element.textContent = '';
    for (let i = 0; i < text.length; i++) {
        if (text.charAt(i) === '\n') {
            element.innerHTML += '<br>';
        } else {
            element.textContent += text.charAt(i);
        }
        terminalBody.scrollTop = terminalBody.scrollHeight;
        soundManager.playKeySound();
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}

async function runBootSequence() {
    terminalContainer.classList.add('terminal-on');
    soundManager.playBootSound();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const bannerText = window.innerWidth < 600 ? mobileBanner : asciiBanner;

    const banner = document.createElement('pre');
    banner.style.lineHeight = '1';
    banner.style.marginBottom = '20px';
    banner.className = 'glitch';
    banner.setAttribute('data-text', bannerText);
    banner.textContent = bannerText;
    terminalBody.appendChild(banner);

    soundManager.speak("Welcome to my Website. System initialized.");

    addOutput("Type 'help' to see available commands.");
    commandInput.focus();
}

startOverlay.addEventListener('click', () => {
    soundManager.init();
    soundManager.unlockMobile();
    startOverlay.classList.add('hidden');
    runBootSequence();
});

commandInput.addEventListener('keydown', function (e) {
    // Hacker Typer Mode
    if (hackerTyperMode) {
        e.preventDefault();
        soundManager.playKeySound();
        spawnParticlesAtInput();

        const chunkSize = Math.floor(Math.random() * 5) + 2;
        const chunk = hackerCode.substring(hackerCodeIndex, hackerCodeIndex + chunkSize);
        hackerCodeIndex = (hackerCodeIndex + chunkSize) % hackerCode.length;

        this.value += chunk;
        terminalBody.scrollTop = terminalBody.scrollHeight;

        // Auto-submit if line break (simulated)
        if (chunk.includes('\n')) {
            const cmdLine = document.createElement('div');
            cmdLine.className = 'output-line';
            cmdLine.style.color = '#0f0';
            cmdLine.textContent = this.value;
            terminalBody.appendChild(cmdLine);
            this.value = '';
        }
        return;
    }

    if (e.key.length === 1) {
        soundManager.playKeySound();
        spawnParticlesAtInput();
    }

    if (e.key === 'Enter') {
        const rawCommand = this.value.trim();
        const args = rawCommand.split(' ');
        const cmd = args[0].toLowerCase();

        soundManager.playEnterSound();
        if (rawCommand) {
            commandHistory.push(rawCommand);
            historyIndex = commandHistory.length;
        }

        const cmdLine = document.createElement('div');
        cmdLine.className = 'output-line';
        cmdLine.innerHTML = `<span class="prompt">root@syazmi:${currentPath.join('/')}$</span> ${this.value}`;
        terminalBody.appendChild(cmdLine);

        this.value = '';
        processCommand(cmd, args.slice(1));
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            this.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            this.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            this.value = '';
        }
    } else if (e.key === 'Tab') {
        e.preventDefault();
        const input = this.value.split(' ').pop();
        if (currentDir.children) {
            const matches = Object.keys(currentDir.children).filter(f => f.startsWith(input));
            if (matches.length === 1) {
                this.value = this.value.substring(0, this.value.lastIndexOf(' ') + 1) + matches[0];
            }
        }
    }
});

async function processCommand(cmd, args) {
    switch (cmd) {
        case 'help':
            addOutput("AVAILABLE COMMANDS:<br>" +
                "- ls              : List directory contents<br>" +
                "- cd              : Change directory<br>" +
                "- cat (file)      : Read file content<br>" +
                "- clear           : Clear terminal screen<br>" +
                "- color (theme)   : Change UI theme (green, amber, red, blue)<br>" +
                "- hack (url website)   : Simulate hacking a target<br>" +
                "- voice (on/off)  : Toggle voice synthesis<br>" +
                "- snake           : Play Snake game<br>" +
                "- typer           : Toggle Hacker Typer mode (ESC to exit)<br>" +
                "- whoami          : Display current user info<br>" +
                "- motd            : Message of the Day<br>" +
                "- decrypt (file)  : Decrypt a file");
            break;
        case 'ls':
            if (currentDir.children) {
                const files = Object.keys(currentDir.children).map(name => {
                    const isDir = currentDir.children[name].type === 'dir';
                    return `<span style="color: ${isDir ? '#fff' : 'inherit'}">${name}${isDir ? '/' : ''}</span>`;
                }).join('  ');
                addOutput(files);
            }
            break;
        case 'cd':
            if (!args[0]) {
                currentPath = ['root'];
                currentDir = fileSystem['root'];
            } else if (args[0] === '..') {
                if (currentPath.length > 1) {
                    currentPath.pop();
                    currentDir = getDir(currentPath);
                }
            } else if (currentDir.children && currentDir.children[args[0]] && currentDir.children[args[0]].type === 'dir') {
                currentPath.push(args[0]);
                currentDir = currentDir.children[args[0]];
            } else {
                addOutput(`<span class="error">Directory not found: ${args[0]}</span>`);
            }
            break;
        case 'cat':
            if (!args[0]) {
                addOutput("Usage: cat <filename>");
            } else if (currentDir.children && currentDir.children[args[0]] && currentDir.children[args[0]].type === 'file') {
                addOutput(currentDir.children[args[0]].content.replace(/\n/g, '<br>'));
            } else {
                addOutput(`<span class="error">File not found: ${args[0]}</span>`);
            }
            break;
        case 'clear':
            terminalBody.innerHTML = '';
            break;
        case 'color':
            const theme = args[0];
            if (['green', 'amber', 'red', 'blue'].includes(theme)) {
                document.body.className = '';
                if (theme === 'amber') document.body.classList.add('theme-retro');
                if (theme === 'red') document.body.classList.add('theme-sith');
                if (theme === 'blue') document.body.classList.add('theme-scifi');
                addOutput(`Theme changed to ${theme}.`);
            } else {
                addOutput("Available themes: green, amber, red, blue");
            }
            break;
        case 'voice':
            if (args[0] === 'on') {
                soundManager.voiceEnabled = true;
                addOutput("Voice synthesis enabled.");
                soundManager.speak("Voice enabled.");
            } else if (args[0] === 'off') {
                soundManager.voiceEnabled = false;
                addOutput("Voice synthesis disabled.");
            }
            break;
        case 'hack':
            if (!args[0]) {
                addOutput("Usage: hack <target>");
            } else {
                await simulateHack(args[0]);
            }
            break;
        case 'snake':
            startSnakeGame();
            break;
        case 'typer':
            hackerTyperMode = !hackerTyperMode;
            addOutput(hackerTyperMode ? "HACKER TYPER ENGAGED. MASH KEYS." : "HACKER TYPER DISENGAGED.");
            break;
        case 'whoami':
            addOutput("Syazmi Hafiz — Cybersecurity Specialist & Red Team Enthusiast.");
            break;
        case 'motd':
            addOutput("\"Security isn't a product — it's a constant mindset.\"");
            break;
        case 'decrypt':
            if (!args[0]) {
                addOutput("Usage: decrypt <filename>");
            } else if (args[0] === 'passwords.txt' && (currentPath.includes('secrets') || (currentDir.children && currentDir.children['passwords.txt']))) {
                addOutput("<span class='success'>ACCESS GRANTED.</span><br>But true security is knowing what not to reveal.");
            } else {
                addOutput("<span class='error'>DECRYPTION FAILED. INVALID KEY OR FILE.</span>");
            }
            break;
        default:
            addOutput(`<span class="error">Command not found: ${cmd}</span>`);
    }
}

async function simulateHack(target) {
    const steps = [
        `Targeting ${target}...`,
        "Bypassing firewall...",
        "Brute-forcing credentials...",
        "Injecting payload...",
        "Escalating privileges...",
        "Downloading data..."
    ];

    for (const step of steps) {
        addOutput(step);
        const barLine = document.createElement('div');
        barLine.className = 'output-line';
        terminalBody.appendChild(barLine);
        for (let i = 0; i <= 20; i++) {
            barLine.textContent = `[${'='.repeat(i)}${'.'.repeat(20 - i)}]`;
            await new Promise(r => setTimeout(r, 50));
        }
        await new Promise(r => setTimeout(r, 200));
    }
    addOutput(`<span class="success">HACK COMPLETE. ACCESS GRANTED TO ${target.toUpperCase()}.</span>`);
    soundManager.speak(`Access granted to ${target}`);
}

function addOutput(html) {
    const output = document.createElement('div');
    output.className = 'output-line';
    output.innerHTML = html;
    terminalBody.appendChild(output);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

// --- Konami Code & Snake Game ---
const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
let konamiIndex = 0;

document.addEventListener('keydown', (e) => {
    // Exit Typer Mode
    if (e.key === 'Escape' && hackerTyperMode) {
        hackerTyperMode = false;
        addOutput("HACKER TYPER DISENGAGED.");
        return;
    }

    if (e.key === konamiCode[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiCode.length) {
            startSnakeGame();
            konamiIndex = 0;
        }
    } else {
        konamiIndex = 0;
    }
});

function startSnakeGame() {
    const overlay = document.createElement('div');
    overlay.id = 'gameOverlay';
    overlay.innerHTML = `
        <div class="game-score">SCORE: <span id="score">0</span></div>
        <canvas id="gameCanvas" width="300" height="300"></canvas>
        <div style="margin-top: 10px; color: #fff; font-size: 0.8rem;">
            DESKTOP: ARROW KEYS | MOBILE: SWIPE<br>
            PRESS ESC / DOUBLE TAP TO EXIT
        </div>
    `;
    document.body.appendChild(overlay);

    const gCanvas = document.getElementById('gameCanvas');
    const gCtx = gCanvas.getContext('2d');

    // Responsive Canvas
    if (window.innerWidth < 400) {
        gCanvas.width = 280;
        gCanvas.height = 280;
    }

    const gridSize = 20;
    let snake = [{ x: 10, y: 10 }];
    let food = { x: 5, y: 5 };
    let dx = 0;
    let dy = 0;
    let score = 0;
    let gameInterval;

    function drawGame() {
        gCtx.fillStyle = '#000';
        gCtx.fillRect(0, 0, gCanvas.width, gCanvas.height);

        const head = { x: snake[0].x + dx, y: snake[0].y + dy };

        // Wrap around logic (optional, but easier for mobile) or Wall collision
        // Let's do Wall Collision for classic feel
        if (head.x < 0 || head.x >= gCanvas.width / gridSize || head.y < 0 || head.y >= gCanvas.height / gridSize || snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
            endGame();
            return;
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('score').textContent = score;
            soundManager.playKeySound();
            food = {
                x: Math.floor(Math.random() * (gCanvas.width / gridSize)),
                y: Math.floor(Math.random() * (gCanvas.height / gridSize))
            };
        } else {
            snake.pop();
        }

        gCtx.fillStyle = '#0f0';
        snake.forEach(segment => {
            gCtx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
        });

        gCtx.fillStyle = '#f00';
        gCtx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
    }

    function endGame() {
        clearInterval(gameInterval);
        alert(`GAME OVER! Score: ${score}`);
        if (document.body.contains(overlay)) document.body.removeChild(overlay);
        document.removeEventListener('keydown', gameControl);
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
    }

    // Controls
    document.addEventListener('keydown', gameControl);
    function gameControl(e) {
        if (e.key === 'ArrowUp' && dy === 0) { dx = 0; dy = -1; }
        if (e.key === 'ArrowDown' && dy === 0) { dx = 0; dy = 1; }
        if (e.key === 'ArrowLeft' && dx === 0) { dx = -1; dy = 0; }
        if (e.key === 'ArrowRight' && dx === 0) { dx = 1; dy = 0; }
        if (e.key === 'Escape') endGame();
    }

    // Touch Controls (Swipe)
    let xDown = null;
    let yDown = null;

    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    function handleTouchStart(evt) {
        const firstTouch = evt.touches[0];
        xDown = firstTouch.clientX;
        yDown = firstTouch.clientY;
    }

    function handleTouchMove(evt) {
        if (!xDown || !yDown) return;

        let xUp = evt.touches[0].clientX;
        let yUp = evt.touches[0].clientY;

        let xDiff = xDown - xUp;
        let yDiff = yDown - yUp;

        if (Math.abs(xDiff) > Math.abs(yDiff)) {
            if (xDiff > 0 && dx === 0) { dx = -1; dy = 0; } // Left
            else if (dx === 0) { dx = 1; dy = 0; } // Right
        } else {
            if (yDiff > 0 && dy === 0) { dx = 0; dy = -1; } // Up
            else if (dy === 0) { dx = 0; dy = 1; } // Down
        }
        xDown = null;
        yDown = null;
        evt.preventDefault(); // Prevent scrolling
    }

    // Double tap to exit
    let lastTap = 0;
    overlay.addEventListener('touchend', function (e) {
        let currentTime = new Date().getTime();
        let tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            endGame();
            e.preventDefault();
        }
        lastTap = currentTime;
    });

    gameInterval = setInterval(drawGame, 150); // Slower speed for mobile playability
}

// --- 3D Tilt ---
document.addEventListener('mousemove', (e) => {
    if (window.innerWidth <= 768) return;
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;
    terminalContainer.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});

// Focus input
document.addEventListener('click', () => {
    if (startOverlay.classList.contains('hidden') && !document.getElementById('gameOverlay')) {
        commandInput.focus();
    }
});

