const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const WAVE_SPEED = 200;
const GRID_SIZE = 50;
const DARK_GRID_COLOR = 'rgba(255, 255, 255, 0.1)';

let objects = [];
let selectedObject = null;
let hoveredPerceiver = null;
let lastTimestamp = 0;
let isDraggingControls = false;
let controlsStartPos = { x: 20, y: 20 };

// Initialize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('load', resizeCanvas);
window.addEventListener('resize', resizeCanvas);

class Wave {
    constructor(source, startTime) {
        this.source = source;
        this.startTime = startTime;
        this.radius = 0;
    }
}

class DopplerObject {
    constructor(type) {
        this.id = Date.now();
        this.type = type;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.velocity = { x: 0, y: 0 };
        this.acceleration = { x: 0, y: 0 };
        this.frequency = type === 'source' ? 1 : 0;
        this.waves = [];
        this.baseColor = type === 'source' ? [255, 85, 85] : [85, 170, 255];
        this.radius = 16;
        this.lastWaveTime = 0;
    }

    update(deltaTime) {
        // Update velocity with acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        
        // Update position
        this.x += this.velocity.x * deltaTime;
        this.y += this.velocity.y * deltaTime;
        
        if(this.type === 'source' && this.frequency > 0) {
            const waveInterval = 1000 / this.frequency;
            if(Date.now() - this.lastWaveTime > waveInterval) {
                this.waves.push(new Wave(this, Date.now()));
                this.lastWaveTime = Date.now();
            }
        }
    }

    getColor() {
        // Color changes based on speed magnitude
        const speed = Math.hypot(this.velocity.x, this.velocity.y);
        const [r, g, b] = this.baseColor;
        const intensity = Math.min(0.5 + speed/400, 1);
        return `rgba(${r}, ${g}, ${b}, ${intensity})`;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.getColor();
        ctx.fill();

        // Velocity vector
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.velocity.x * 25, this.y + this.velocity.y * 25);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function createControls(object) {
    const controls = document.createElement('div');
    controls.className = 'object-control';
    controls.innerHTML = `
        <h4>${object.type.charAt(0).toUpperCase() + object.type.slice(1)} #${object.id}
            <div class="color-indicator" style="background: ${object.getColor()}"></div>
        </h4>
        ${object.type === 'source' ? `
            <div class="slider-container">
                <label>Frequency (1-5Hz):</label>
                <input type="range" min="1" max="5" value="${object.frequency}" class="frequency">
                <span class="frequency-value">${object.frequency}Hz</span>
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
            <input type="range" min="0" max="200" 
                   value="${Math.hypot(object.velocity.x, object.velocity.y).toFixed(0)}" 
                   class="speed">
        </div>
        <div class="slider-container">
            <label>Direction:</label>
            <input type="range" min="0" max="360" 
                   value="${(Math.atan2(object.velocity.y, object.velocity.x) * 180/Math.PI).toFixed(0)}" 
                   class="direction">
        </div>
        <button class="delete">🗑️ Delete</button>
    `;

    // Acceleration controls
    controls.querySelector('.accel-x').addEventListener('input', (e) => {
        object.acceleration.x = parseFloat(e.target.value);
        controls.querySelector('.color-indicator').style.background = object.getColor();
    });
    
    controls.querySelector('.accel-y').addEventListener('input', (e) => {
        object.acceleration.y = parseFloat(e.target.value);
        controls.querySelector('.color-indicator').style.background = object.getColor();
    });

    // Existing controls with color updates
    if(object.type === 'source') {
        controls.querySelector('.frequency').addEventListener('input', (e) => {
            object.frequency = parseInt(e.target.value);
            e.target.nextElementSibling.textContent = `${object.frequency}Hz`;
            controls.querySelector('.color-indicator').style.background = object.getColor();
        });
    }

    const updateVelocity = () => {
        const speed = parseFloat(controls.querySelector('.speed').value);
        const angle = parseFloat(controls.querySelector('.direction').value) * Math.PI/180;
        object.velocity.x = speed * Math.cos(angle);
        object.velocity.y = speed * Math.sin(angle);
        controls.querySelector('.color-indicator').style.background = object.getColor();
    };

    controls.querySelector('.speed').addEventListener('input', updateVelocity);
    controls.querySelector('.direction').addEventListener('input', updateVelocity);
    controls.querySelector('.delete').addEventListener('click', () => {
        objects = objects.filter(o => o.id !== object.id);
        controls.remove();
    });

    document.getElementById('objectControls').appendChild(controls);
}

// Improved frequency display with angled text placement
function drawAngledText(text, x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillText(text, 10, 5);
    ctx.restore();
}

function calculatePerceivedFrequency(source, perceiver) {
    const toObserver = { x: perceiver.x - source.x, y: perceiver.y - source.y };
    const distance = Math.hypot(toObserver.x, toObserver.y);
    if(distance === 0) return source.frequency;
    
    const direction = { x: toObserver.x/distance, y: toObserver.y/distance };
    const vs = source.velocity.x * direction.x + source.velocity.y * direction.y;
    const vo = perceiver.velocity.x * direction.x + perceiver.velocity.y * direction.y;
    
    return source.frequency * (WAVE_SPEED + vo) / (WAVE_SPEED + vs);
}

// Rest of the code remains similar until animate function:

function animate(timestamp) {
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    
    const deltaTime = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    objects.forEach(obj => {
        obj.update(deltaTime);
        obj.waves.forEach(wave => {
            wave.radius = (Date.now() - wave.startTime) * (WAVE_SPEED / 1000);
        });
        obj.waves = obj.waves.filter(wave => wave.radius < Math.max(canvas.width, canvas.height));
    });

    // Draw waves
    objects.forEach(obj => {
        if(obj.type === 'source') {
            obj.waves.forEach(wave => {
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, wave.radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 80, 80, ${1 - wave.radius/1000})`;
                ctx.stroke();
            });
        }
    });

    // Draw objects
    objects.forEach(obj => obj.draw());

    // Improved frequency display
    if(hoveredPerceiver) {
        const sources = objects.filter(o => o.type === 'source');
        sources.forEach((source, index) => {
            const perceivedFreq = calculatePerceivedFrequency(source, hoveredPerceiver);
            const angle = (index * Math.PI*2)/sources.length; // Radial distribution
            
            ctx.save();
            ctx.translate(hoveredPerceiver.x, hoveredPerceiver.y);
            ctx.rotate(angle);
            
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.fillText(`${perceivedFreq.toFixed(1)}Hz`, 20, 5);
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(50, 0);
            ctx.strokeStyle = source.getColor();
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.restore();
        });
    }

    requestAnimationFrame(animate);
}

// Rest of the event listeners remain unchanged
