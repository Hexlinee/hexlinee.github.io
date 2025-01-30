// app.js
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const WAVE_SPEED = 300;
const GRID_SIZE = 50;

let objects = [];
let selectedObj = null;
let hoveredPerceiver = null;
let isDraggingControls = false;
let controlsPos = { x: 20, y: 20 };

class Wave {
    constructor(source) {
        this.source = source;
        this.created = performance.now();
    }
}

class DopplerObject {
    constructor(type) {
        this.id = Date.now();
        this.type = type;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.frequency = type === 'source' ? 1 : 0;
        this.waves = [];
        this.hue = type === 'source' ? 0 : 200;
        this.radius = 15;
    }

    update(dt) {
        // Apply acceleration
        this.velocity.x += this.acceleration.x * dt;
        this.velocity.y += this.acceleration.y * dt;
        
        // Update position
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        // Generate waves
        if(this.type === 'source' && this.frequency > 0) {
            const interval = 1000 / this.frequency;
            if(performance.now() - (this.waves[0]?.created || 0) > interval) {
                this.waves.push(new Wave(this));
            }
        }
    }

    getColor() {
        const speed = Math.min(Math.hypot(this.velocity.x, this.velocity.y), 200);
        return `hsl(${this.hue}, 80%, ${50 - (speed/4)}%)`;
    }

    draw() {
        // Draw object
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.fillStyle = this.getColor();
        ctx.fill();

        // Draw velocity arrow
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x * 20, this.y + this.velocity.y * 20);
        ctx.strokeStyle = 'rgba(255,255,255,0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

// Initialize
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function createControls(obj) {
    const panel = document.createElement('div');
    panel.className = 'object-control';
    panel.innerHTML = `
        <h4>${obj.type} #${obj.id}</h4>
        ${obj.type === 'source' ? `
            <div class="slider-container">
                Frequency (1-5Hz): 
                <input type="range" min="1" max="5" value="${obj.frequency}" class="freq">
                <output>${obj.frequency}Hz</output>
            </div>
        ` : ''}
        <div class="slider-container">
            Accel X: <input type="range" min="-100" max="100" value="${obj.acceleration.x}" class="accelX">
        </div>
        <div class="slider-container">
            Accel Y: <input type="range" min="-100" max="100" value="${obj.acceleration.y}" class="accelY">
        </div>
        <button class="delete">🗑️ Delete</button>
    `;

    if(obj.type === 'source') {
        const freqInput = panel.querySelector('.freq');
        const freqOutput = freqInput.nextElementSibling;
        freqInput.addEventListener('input', e => {
            obj.frequency = +e.target.value;
            freqOutput.textContent = `${obj.frequency}Hz`;
        });
    }

    panel.querySelector('.accelX').addEventListener('input', e => {
        obj.acceleration.x = +e.target.value;
    });

    panel.querySelector('.accelY').addEventListener('input', e => {
        obj.acceleration.y = +e.target.value;
    });

    panel.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== obj.id);
        panel.remove();
    });

    document.getElementById('objectControls').appendChild(panel);
}

function calculateFrequency(source, perceiver) {
    const dx = perceiver.x - source.x;
    const dy = perceiver.y - source.y;
    const distance = Math.hypot(dx, dy);
    if(distance === 0) return source.frequency;

    const dir = { x: dx/distance, y: dy/distance };
    const vs = source.velocity.x * dir.x + source.velocity.y * dir.y;
    const vo = perceiver.velocity.x * dir.x + perceiver.velocity.y * dir.y;
    
    return source.frequency * (WAVE_SPEED + vo) / (WAVE_SPEED + vs);
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    
    // Vertical lines
    for(let x = 0; x < canvas.width; x += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for(let y = 0; y < canvas.height; y += GRID_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function animate(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    const dt = (timestamp - lastFrame) / 1000;
    lastFrame = timestamp;

    objects.forEach(obj => {
        obj.update(dt);
        
        // Draw waves
        if(obj.type === 'source') {
            obj.waves.forEach(wave => {
                const age = (timestamp - wave.created)/1000;
                const radius = age * WAVE_SPEED;
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, radius, 0, Math.PI*2);
                ctx.strokeStyle = `hsla(0, 80%, 50%, ${1 - radius/1000})`;
                ctx.stroke();
            });
            obj.waves = obj.waves.filter(wave => 
                (timestamp - wave.created)/1000 * WAVE_SPEED < 1000
            );
        }
        
        obj.draw();
    });

    // Draw frequency display
    if(hoveredPerceiver) {
        const sources = objects.filter(o => o.type === 'source');
        const angleStep = (Math.PI*2) / sources.length;
        
        sources.forEach((source, i) => {
            const angle = angleStep * i;
            const freq = calculateFrequency(source, hoveredPerceiver);
            
            ctx.save();
            ctx.translate(hoveredPerceiver.x, hoveredPerceiver.y);
            ctx.rotate(angle);
            
            // Line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(60, 0);
            ctx.strokeStyle = source.getColor();
            ctx.stroke();
            
            // Text
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText(`${freq.toFixed(1)}Hz`, 65, 5);
            
            ctx.restore();
        });
    }

    requestAnimationFrame(animate);
}

// Event listeners
document.getElementById('addSource').addEventListener('click', () => {
    const source = new DopplerObject('source');
    objects.push(source);
    createControls(source);
});

document.getElementById('addPerceiver').addEventListener('click', () => {
    const perceiver = new DopplerObject('perceiver');
    objects.push(perceiver);
    createControls(perceiver);
});

canvas.addEventListener('mousemove', e => {
    // Control panel drag
    if(isDraggingControls) {
        const dx = e.clientX - dragStart.x;
        const dy = e.clientY - dragStart.y;
        document.querySelector('.controls').style.left = `${dx}px`;
        document.querySelector('.controls').style.top = `${dy}px`;
        return;
    }

    // Object hover
    hoveredPerceiver = objects.find(obj => 
        obj.type === 'perceiver' &&
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

document.querySelector('.controls').addEventListener('mousedown', e => {
    isDraggingControls = true;
    dragStart = {
        x: e.clientX - parseInt(document.querySelector('.controls').style.left || 20),
        y: e.clientY - parseInt(document.querySelector('.controls').style.top || 20)
    };
});

document.addEventListener('mouseup', () => isDraggingControls = false);

canvas.addEventListener('mousedown', e => {
    selectedObj = objects.find(obj => 
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

canvas.addEventListener('mousemove', e => {
    if(selectedObj) {
        selectedObj.x = e.clientX;
        selectedObj.y = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => selectedObj = null);

// Start animation
let lastFrame = performance.now();
requestAnimationFrame(animate);
