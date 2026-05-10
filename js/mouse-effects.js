// 鼠标拖尾 + 点击炫酷爆炸效果（大星星 + 花瓣 + 闪光）
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

    // ========== 鼠标拖尾效果（保持不变）==========
    var trailDots = [];
    var maxTrailLength = 20;
    var mouseX = width / 2;
    var mouseY = height / 2;
    var lastMouseX = mouseX;
    var lastMouseY = mouseY;
    var mouseMoving = false;
    var moveTimer = null;

    function TrailDot(x, y) {
        this.x = x;
        this.y = y;
        this.size = 10;
        this.opacity = 0.8;
        this.life = 1.0;
        this.decay = 0.06;
    }

    TrailDot.prototype.update = function() {
        this.life -= this.decay;
        this.opacity = this.life * 0.7;
        this.size = 12 * this.life;
        return this.life > 0;
    };

    TrailDot.prototype.draw = function() {
        ctx.beginPath();
        var hue = (Date.now() * 0.008 + this.x * 0.5) % 360;
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${hue}, 95%, 70%, ${this.opacity})`);
        gradient.addColorStop(0.6, `hsla(${hue + 40}, 90%, 60%, ${this.opacity * 0.5})`);
        gradient.addColorStop(1, `hsla(${hue + 80}, 85%, 50%, 0)`);
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

    // ========== 全新爆炸效果 ==========
    var explosions = [];

    // 大星星粒子
    function BigStar(x, y, vx, vy, size, color, life, rotationSpeed) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = rotationSpeed || (Math.random() - 0.5) * 0.15;
    }

    BigStar.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.04;
        this.life -= 0.018;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    };

    BigStar.prototype.draw = function() {
        var opacity = this.life / this.maxLife;
        var currentSize = this.size * opacity;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 绘制大五角星
        ctx.beginPath();
        var spikes = 5;
        var outerRadius = currentSize;
        var innerRadius = currentSize * 0.4;

        for (var i = 0; i < spikes * 2; i++) {
            var radius = i % 2 === 0 ? outerRadius : innerRadius;
            var angle = (i * Math.PI) / spikes;
            var x = Math.cos(angle) * radius;
            var y = Math.sin(angle) * radius;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();

        ctx.fillStyle = this.color;
        ctx.fill();

        // 星星中心高光
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${opacity * 0.9})`;
        ctx.fill();

        ctx.restore();
    };

    // 花瓣粒子
    function Petal(x, y, vx, vy, size, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    Petal.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.02;
        this.life -= 0.015;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    };

    Petal.prototype.draw = function() {
        var opacity = this.life / this.maxLife;
        var currentSize = this.size * opacity;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 绘制花瓣形状
        ctx.beginPath();
        ctx.ellipse(0, 0, currentSize, currentSize * 0.7, 0, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    };

    // 闪光粒子
    function Flash(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.life = 0.3;
        this.maxLife = 0.3;
    }

    Flash.prototype.update = function() {
        this.life -= 0.03;
        return this.life > 0;
    };

    Flash.prototype.draw = function() {
        var opacity = this.life / this.maxLife;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * (1 - opacity), 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();

        // 外圈光晕
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 1.5 * (1 - opacity), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 100, ${opacity * 0.4})`;
        ctx.fill();
    };

    // 主爆炸类
    function Explosion(x, y) {
        this.particles = [];

        // 爆炸主色调（随机暖色）
        var mainHue = Math.random() * 360;

        // 1. 3-5颗大星星（核心效果）
        var starCount = Math.floor(Math.random() * 3) + 3; // 3-5颗
        for (var i = 0; i < starCount; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 4 + 1.5;
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var size = Math.random() * 12 + 10; // 10-22px 大星星
            var hue = (mainHue + (Math.random() - 0.5) * 60) % 360;
            var color = `hsla(${hue}, 95%, 65%, 1)`;
            var life = Math.random() * 0.8 + 0.7;
            var rotSpeed = (Math.random() - 0.5) * 0.12;
            this.particles.push(new BigStar(x, y, vx, vy, size, color, life, rotSpeed));
        }

        // 2. 6-10片花瓣飘散
        var petalCount = Math.floor(Math.random() * 5) + 6;
        for (var i = 0; i < petalCount; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 6 + 2;
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var size = Math.random() * 6 + 4;
            // 粉色/红色/橙色系
            var hue = (mainHue + 80 + Math.random() * 60) % 360;
            var color = `hsla(${hue}, 85%, 65%, 0.9)`;
            var life = Math.random() * 0.7 + 0.5;
            this.particles.push(new Petal(x, y, vx, vy, size, color, life));
        }

        // 3. 1-2道闪光（爆炸中心）
        var flashCount = Math.floor(Math.random() * 2) + 1;
        for (var i = 0; i < flashCount; i++) {
            var size = Math.random() * 25 + 20;
            var color = `rgba(255, ${Math.floor(150 + Math.random() * 105)}, 80, 0.9)`;
            this.particles.push(new Flash(x, y, size, color));
        }

        // 4. 少量小星尘（增加丰富度）
        var dustCount = 8;
        for (var i = 0; i < dustCount; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 8 + 3;
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var size = Math.random() * 4 + 2;
            var color = `hsl(${mainHue + 30}, 90%, 70%)`;
            var life = Math.random() * 0.5 + 0.3;
            this.particles.push(new BigStar(x, y, vx, vy, size, color, life, 0.2));
        }
    }

    Explosion.prototype.update = function() {
        for (var i = this.particles.length - 1; i >= 0; i--) {
            if (!this.particles[i].update()) {
                this.particles.splice(i, 1);
            }
        }
        return this.particles.length > 0;
    };

    Explosion.prototype.draw = function() {
        for (var i = 0; i < this.particles.length; i++) {
            this.particles[i].draw();
        }
    };

    function addExplosion(x, y) {
        explosions.push(new Explosion(x, y));
        if (explosions.length > 5) explosions.shift();
    }

    function updateExplosions() {
        for (var i = explosions.length - 1; i >= 0; i--) {
            if (!explosions[i].update()) explosions.splice(i, 1);
        }
    }

    function drawExplosions() {
        for (var i = 0; i < explosions.length; i++) explosions[i].draw();
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
        addExplosion(e.clientX, e.clientY);
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
        addExplosion(touch.clientX, touch.clientY);
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
        updateExplosions();
        drawExplosions();
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