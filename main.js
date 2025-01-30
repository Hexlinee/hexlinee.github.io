body {
    margin: 0;
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    background: #121212;
    color: #ffffff;
}

.controls {
    position: fixed;
    left: 20px;
    top: 20px;
    background: rgba(32, 32, 32, 0.95);
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
    z-index: 1000;
    cursor: move;
    user-select: none;
    border: 1px solid #404040;
}

button {
    margin: 5px;
    padding: 8px 15px;
    cursor: pointer;
    background: #2a2a2a;
    color: #fff;
    border: 1px solid #4a4a4a;
    border-radius: 5px;
    transition: all 0.2s ease;
}

button:hover {
    background: #363636;
    transform: translateY(-1px);
}

.object-control {
    margin: 10px 0;
    padding: 12px;
    border: 1px solid #404040;
    border-radius: 6px;
    background: #1f1f1f;
}

.slider-container {
    margin: 8px 0;
}

input[type="range"] {
    width: 160px;
    height: 4px;
    background: #404040;
    border-radius: 2px;
}

canvas {
    position: fixed;
    top: 0;
    left: 0;
    cursor: crosshair;
}
