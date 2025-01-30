const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
const WAVE_SPEED = 200;
let objects = [];
let selectedObject = null;

// Initialize canvas
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Wave {
    constructor(source) {
        this.source = source;
        this.created = Date.now();
    }
}

class DopplerObject {
    constructor(type) {
        this.id = Date.now();
        this.type = type;
        this.x = canvas.width/2;
        this.y = canvas.height/2;
        this.velocity = { x: 0, y: 0 };
        this.frequency = type === 'source' ? 2 : 0;
        this.waves = [];
        this.color = type === 'source' ? '#ff4444' : '#44aaff';
        this.radius = 15;
    }

    update() {
        if(this.type === 'source') {
            if(Date.now() - (this.waves[0]?.created || 0) > 1000/this.frequency) {
                this.waves.push(new Wave(this));
            }
        }
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    objects.forEach(obj => {
        obj.update();
        obj.draw();
        
        if(obj.type === 'source') {
            obj.waves.forEach(wave => {
                const radius = (Date.now() - wave.created) * (WAVE_SPEED/1000);
                ctx.beginPath();
                ctx.arc(wave.source.x, wave.source.y, radius, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 100, 100, ${1 - radius/1000})`;
                ctx.stroke();
            });
        }
    });

    requestAnimationFrame(animate);
}

// Event Listeners
document.getElementById('addSource').addEventListener('click', () => {
    const source = new DopplerObject('source');
    objects.push(source);
});

document.getElementById('addPerceiver').addEventListener('click', () => {
    const perceiver = new DopplerObject('perceiver');
    objects.push(perceiver);
});

canvas.addEventListener('mousedown', (e) => {
    selectedObject = objects.find(obj => 
        Math.hypot(obj.x - e.clientX, obj.y - e.clientY) < obj.radius
    );
});

canvas.addEventListener('mousemove', (e) => {
    if(selectedObject) {
        selectedObject.x = e.clientX;
        selectedObject.y = e.clientY;
    }
});

canvas.addEventListener('mouseup', () => {
    selectedObject = null;
});

// Start animation
animate();
