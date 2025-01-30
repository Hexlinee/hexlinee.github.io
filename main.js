const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const WAVE_SPEED = 200;
const GRID_SIZE = 40;

let objects = [];
let selectedObject = null;
let hoveredPerceiver = null;
let lastTimestamp = performance.now();
let isDraggingControls = false;
let controlsStartPos = { x: 0, y: 0 };

// Initialize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

class Wave {
    constructor(source) {
        this.source = source;
        this.createdAt = performance.now();
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
        this.baseHue = type === 'source' ? 0 : 200;
        this.radius = 16;
    }

    update(deltaTime) {
        // Apply acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        // Generate waves
        if(this.type === 'source' && this.frequency > 0) {
            const waveInterval = 1000 / this.frequency;
            if(performance.now() - (this.waves[0]?.createdAt || 0) > waveInterval) {
                this.waves.push(new Wave(this));
            }
        }
    }

    getColor() {
        const speed = Math.min(Math.hypot(this.velocity.x, this.velocity.y), 200);
        const saturation = 80 + (speed / 200 * 20);
        const lightness = 50 - (speed / 200 * 10);
        return `hsl(${this.baseHue}, ${saturation}%, ${lightness}%)`;
    }

    draw() {
        // Draw object
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();

        // Draw velocity vector
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x * 25, this.y + this.velocity.y * 25);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function createControls(object) {
    const controls = document.createElement('div');
    controls.className = 'object-control';
    controls.innerHTML = `
        <h4>${object.type.toUpperCase()} #${object.id}
            <div class="color-indicator" style="background: ${object.getColor()}"></div>
        </h4>
        ${object.type === 'source' ? `
            <div class="slider-container">
                <label>Frequency (1-5Hz):</label>
                <input type="range" min="1" max="5" value="${object.frequency}" class="frequency">
                <span>${object.frequency}Hz</span>
            </div>
        ` : ''}
        <div class="slider-container">
            <label>Accel X: (-100 to 100)</label>
            <input type="range" min="-100" max="100" value="${object.acceleration.x}" class="accel-x">
        </div>
        <div class="slider-container">
            <label>Accel Y: (-100 to 100)</label>
            <input type="range" min="-100" max="100" value="${object.acceleration.y}" class="accel-y">
        </div>
        <div class="slider-container">
            <label>Speed (0-200px/s):</label>
            <input type="range" min="0" max="200" value="${Math.hypot(object.velocity.x, object.velocity.y).toFixed(0)}" class="speed">
        </div>
        <button class="delete">🗑️ Delete</button>
    `;

    const updateColor = () => {
        controls.querySelector('.color-indicator').style.background = object.getColor();
    };

    // Acceleration controls
    controls.querySelector('.accel-x').addEventListener('input', e => {
        object.acceleration.x = Number(e.target.value);
        updateColor();
    });
    controls.querySelector('.accel-y').addEventListener('input', e => {
        object.acceleration.y = Number(e.target.value);
        updateColor();
    });

    // Frequency control
    if(object.type === 'source') {
        controls.querySelector('.frequency').addEventListener('input', e => {
            object.frequency = Number(e.target.value);
            e.target.nextElementSibling.textContent = `${object.frequency}Hz`;
            updateColor();
        });
    }

    // Velocity controls
    controls.querySelector('.speed').addEventListener('input', e => {
        const speed = Number(e.target.value);
        const angle = Math.atan2(object.velocity.y, object.velocity.x);
        object.velocity.x = speed * Math.cos(angle);
        object.velocity.y = speed * Math.sin(angle);
        updateColor();
    });

    // Delete button
    controls.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== object.id);
        controls.remove();
    });

    document.getElementById('objectControls').appendChild(controls);
}

function calculatePerceivedFrequency(source, perceiver) {
    const relativePos = { x: perceiver.x - source.x, y: perceiver.y - source.y };
    const distance = Math.hypot(relativePos.x, relativePos.y);
    if(distance === 0) return source.frequency;
    
    const direction = { x: relativePos.x/distance, y: relativePos.y/distance };
    const sourceSpeed = source.velocity.x * direction.x + source.velocity.y * direction.y;
    const perceiverSpeed = perceiver.velocity.x * direction.x + perceiver.velocity.y * direction.y;
    
    return source.frequency * (WAVE_SPEED + perceiverSpeed) / (WAVE_SPEED + sourceSpeed);
}

function animate(timestamp) {
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw objects
    objects.forEach(obj => {
        obj.update(deltaTime);
        
        // Draw waves
        if(obj.type === 'source') {
            obj.waves.forEach(wave => {
                const age = (timestamp - wave.createdAt) / 1000;
                const radius = age * WAVE_SPEED;
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `hsla(0, 80%, 50%, ${1 - radius/1000})`;
                ctx.stroke();
            });
            obj.waves = obj.waves.filter(wave => 
                (timestamp - wave.createdAt) / 1000 * WAVE_SPEED < Math.max(canvas.width, canvas.height)
            );
        }
        
        obj.draw();
    });

    // Draw frequency indicators
    if(hoveredPerceiver) {
        const sources = objects.filter(o => o.type === 'source');
        const angleStep = (Math.PI * 2) / sources.length;
        
        sources.forEach((source, index) => {
            const angle = angleStep * index;
            const perceivedFreq = calculatePerceivedFrequency(source, hoveredPerceiver);
            const text = `${perceivedFreq.toFixed(1)}Hz`;
            
            ctx.save();
            ctx.translate(hoveredPerceiver.x, hoveredPerceiver.y);
            ctx.rotate(angle);
            
            // Draw line
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(60, 0);
            ctx.strokeStyle = source.getColor();
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw text
            ctx.fillStyle = '#fff';
            ctx.font = '14px Arial';
            ctx.fillText(text, 65, 5);
            
            ctx.restore();
        });
    }

    requestAnimationFrame(animate);
