// 鼠标拖尾 + 水波能量环 + 光柱特效
(function() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    // ========== 鼠标拖尾效果（简化版，更柔和）==========
    var trailDots = [];
    var maxTrailLength = 15;
    var mouseX = width / 2;
    var mouseY = height / 2;
    var lastMouseX = mouseX;
    var lastMouseY = mouseY;
    var mouseMoving = false;
    var moveTimer = null;

    function TrailDot(x, y) {
        this.x = x;
        this.y = y;
        this.size = 6;
        this.life = 1.0;
        this.decay = 0.06;
    }

    TrailDot.prototype.update = function() {
        this.life -= this.decay;
        this.size = 8 * this.life;
        return this.life > 0;
    };

    TrailDot.prototype.draw = function() {
        ctx.beginPath();
        var hue = (Date.now() * 0.005 + this.x * 0.3) % 360;
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 70%, ${this.life * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue + 40}, 85%, 60%, 0)`);
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    };

    function updateTrail() {
        if (mouseMoving && (mouseX !== lastMouseX || mouseY !== lastMouseY)) {
            trailDots.unshift(new TrailDot(mouseX, mouseY));
            if (trailDots.length > maxTrailLength) trailDots.pop();
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        for (var i = trailDots.length - 1; i >= 0; i--) {
            if (!trailDots[i].update()) trailDots.splice(i, 1);
        }
    }

    function drawTrail() {
        for (var i = 0; i < trailDots.length; i++) trailDots[i].draw();
    }

    // ========== 全新特效：水波 + 能量环 + 光柱 ==========
    var effects = [];

    // 水波环
    function RippleWave(x, y, radius, hue, maxRadius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.hue = hue;
        this.maxRadius = maxRadius;
        this.life = 1.0;
        this.decay = 0.025;
        this.lineWidth = 4;
    }

    RippleWave.prototype.update = function() {
        this.life -= this.decay;
        this.radius = this.maxRadius * (1 - this.life);
        this.lineWidth = 5 * this.life;
        return this.life > 0;
    };

    RippleWave.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this.hue}, 90%, 65%, ${this.life * 0.8})`;
        ctx.lineWidth = this.lineWidth;
        ctx.stroke();

        // 内圈
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 0.6, 0, Math.PI * 2);
        ctx.strokeStyle = `hsla(${this.hue + 30}, 85%, 70%, ${this.life * 0.5})`;
        ctx.lineWidth = this.lineWidth * 0.6;
        ctx.stroke();
    };

    // 能量粒子（向上飘）
    function EnergyParticle(x, y, vx, vy, size, hue, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.hue = hue;
        this.life = life;
        this.maxLife = life;
    }

    EnergyParticle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy -= 0.15;
        this.life -= 0.02;
        return this.life > 0;
    };

    EnergyParticle.prototype.draw = function() {
        var opacity = this.life / this.maxLife;
        var currentSize = this.size * opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 95%, 65%, ${opacity * 0.8})`;
        ctx.fill();

        // 拖尾光晕
        ctx.beginPath();
        ctx.arc(this.x, this.y, currentSize * 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.hue}, 90%, 70%, ${opacity * 0.3})`;
        ctx.fill();
    };

    // 光柱（从点击点向上爆发）
    function LightBeam(x, y, hue) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.height = 0;
        this.width = 12;
        this.life = 1.0;
        this.decay = 0.04;
        this.maxHeight = 120;
    }

    LightBeam.prototype.update = function() {
        this.life -= this.decay;
        this.height = this.maxHeight * (1 - this.life);
        this.width = 14 * this.life;
        return this.life > 0;
    };

    LightBeam.prototype.draw = function() {
        var grad = ctx.createLinearGradient(this.x, this.y, this.x, this.y - this.height);
        grad.addColorStop(0, `hsla(${this.hue}, 95%, 60%, ${this.life * 0.7})`);
        grad.addColorStop(1, `hsla(${this.hue + 40}, 90%, 70%, 0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(this.x - this.width / 2, this.y - this.height, this.width, this.height);
    };

    // 主特效类
    function ClickEffect(x, y) {
        var baseHue = Math.random() * 360;

        this.particles = [];

        // 1. 3个水波环（不同大小、不同颜色）
        for (var i = 0; i < 3; i++) {
            var radius = 5 + i * 8;
            var maxRadius = 60 + i * 30;
            var hue = (baseHue + i * 40) % 360;
            this.particles.push(new RippleWave(x, y, radius, hue, maxRadius));
        }

        // 2. 光柱
        this.particles.push(new LightBeam(x, y, baseHue));

        // 3. 向上飘散的能量粒子（8-12个）
        var particleCount = Math.floor(Math.random() * 5) + 8;
        for (var i = 0; i < particleCount; i++) {
            var angle = Math.random() * Math.PI - Math.PI / 2;
            var speed = Math.random() * 4 + 2;
            var vx = Math.cos(angle) * speed * (Math.random() - 0.5) * 1.5;
            var vy = Math.sin(angle) * speed + 2;
            var size = Math.random() * 5 + 3;
            var hue = (baseHue + (Math.random() - 0.5) * 60) % 360;
            var life = Math.random() * 0.6 + 0.5;
            this.particles.push(new EnergyParticle(x, y, vx, vy, size, hue, life));
        }
    }

    ClickEffect.prototype.update = function() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
        return this.particles.length > 0;
    };

    ClickEffect.prototype.draw = function() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
        }
    };

    var activeEffects = [];

    function addEffect(x, y) {
        activeEffects.push(new ClickEffect(x, y));
        if (activeEffects.length > 6) activeEffects.shift();
    }

    function updateEffects() {
        for (var i = activeEffects.length - 1; i >= 0; i--) {
            if (!activeEffects[i].update()) activeEffects.splice(i, 1);
        }
    }

    function drawEffects() {
        for (var i = 0; i < activeEffects.length; i++) {
            activeEffects[i].draw();
        }
    }

    // ========== 鼠标事件 ==========
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!mouseMoving) mouseMoving = true;
        clearTimeout(moveTimer);
        moveTimer = setTimeout(function() { mouseMoving = false; }, 50);
    }

    function onMouseClick(e) {
        addEffect(e.clientX, e.clientY);
    }

    function onTouchMove(e) {
        e.preventDefault();
        var touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        mouseMoving = true;
        clearTimeout(moveTimer);
        moveTimer = setTimeout(function() { mouseMoving = false; }, 50);
    }

    function onTouchStart(e) {
        e.preventDefault();
        var touch = e.touches[0];
        addEffect(touch.clientX, touch.clientY);
    }

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        updateTrail();
        drawTrail();
        updateEffects();
        drawEffects();
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchstart', onTouchStart);

    resize();
    animate();
})();