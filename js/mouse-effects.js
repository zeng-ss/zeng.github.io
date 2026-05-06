// 鼠标拖尾 + 点击星星爆炸效果
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

    // ========== 鼠标拖尾效果 ==========
    var trailDots = [];
    var maxTrailLength = 25; // 拖尾长度
    var mouseX = width / 2;
    var mouseY = height / 2;
    var lastMouseX = mouseX;
    var lastMouseY = mouseY;
    var mouseMoving = false;
    var moveTimer = null;

    // 拖尾点类
    function TrailDot(x, y) {
        this.x = x;
        this.y = y;
        this.size = 8;
        this.opacity = 0.8;
        this.life = 1.0;
        this.decay = 0.05;
    }

    TrailDot.prototype.update = function() {
        this.life -= this.decay;
        this.opacity = this.life * 0.6;
        this.size = 8 * this.life;
        return this.life > 0;
    };

    TrailDot.prototype.draw = function() {
        ctx.beginPath();

        // 彩虹渐变色
        var hue = (Date.now() * 0.005 + this.x * 0.5) % 360;
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `hsla(${hue}, 90%, 65%, ${this.opacity})`);
        gradient.addColorStop(0.5, `hsla(${hue + 30}, 85%, 60%, ${this.opacity * 0.6})`);
        gradient.addColorStop(1, `hsla(${hue + 60}, 80%, 55%, 0)`);

        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // 内层亮光
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${hue}, 95%, 75%, ${this.opacity})`;
        ctx.fill();
    };

    // 更新拖尾
    function updateTrail() {
        if (mouseMoving && (mouseX !== lastMouseX || mouseY !== lastMouseY)) {
            trailDots.unshift(new TrailDot(mouseX, mouseY));
            if (trailDots.length > maxTrailLength) {
                trailDots.pop();
            }
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }

        // 更新所有拖尾点
        for (var i = trailDots.length - 1; i >= 0; i--) {
            if (!trailDots[i].update()) {
                trailDots.splice(i, 1);
            }
        }
    }

    // 绘制拖尾
    function drawTrail() {
        for (var i = 0; i < trailDots.length; i++) {
            trailDots[i].draw();
        }
    }

    // ========== 星星爆炸效果 ==========
    var explosions = [];

    // 星星粒子类
    function StarParticle(x, y, vx, vy, size, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.size = size;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    StarParticle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.08; // 重力效果
        this.life -= 0.02;
        this.rotation += this.rotationSpeed;
        return this.life > 0;
    };

    StarParticle.prototype.draw = function() {
        var opacity = this.life / this.maxLife;
        var currentSize = this.size * opacity;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // 绘制星星形状（四角星）
        ctx.beginPath();
        var spikes = 5;
        var outerRadius = currentSize;
        var innerRadius = currentSize * 0.5;

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

        // 添加光晕
        ctx.beginPath();
        ctx.arc(0, 0, currentSize * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 200, ${opacity * 0.6})`;
        ctx.fill();

        ctx.restore();
    };

    // 爆炸类
    function Explosion(x, y) {
        this.particles = [];
        this.x = x;
        this.y = y;
        this.particleCount = 24; // 星星粒子数量

        // 主色调（随机暖色）
        this.mainHue = Math.random() * 60 + 20; // 20-80 之间的暖色（红橙黄）

        for (var i = 0; i < this.particleCount; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 5 + 2;
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var size = Math.random() * 4 + 2;

            // 颜色变化
            var hue = this.mainHue + (Math.random() - 0.5) * 40;
            var saturation = 85 + Math.random() * 15;
            var lightness = 55 + Math.random() * 25;
            var color = `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`;

            var life = Math.random() * 0.8 + 0.6;
            this.particles.push(new StarParticle(x, y, vx, vy, size, color, life));
        }

        // 额外添加小光点
        for (var i = 0; i < 12; i++) {
            var angle = Math.random() * Math.PI * 2;
            var speed = Math.random() * 8 + 3;
            var vx = Math.cos(angle) * speed;
            var vy = Math.sin(angle) * speed;
            var color = `hsla(${this.mainHue + 20}, 90%, 70%, 1)`;
            this.particles.push(new StarParticle(x, y, vx, vy, 2, color, 0.5));
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

    // 添加爆炸效果
    function addExplosion(x, y) {
        explosions.push(new Explosion(x, y));

        // 限制同时存在的爆炸数量
        if (explosions.length > 8) {
            explosions.shift();
        }
    }

    // 更新所有爆炸
    function updateExplosions() {
        for (var i = explosions.length - 1; i >= 0; i--) {
            if (!explosions[i].update()) {
                explosions.splice(i, 1);
            }
        }
    }

    // 绘制所有爆炸
    function drawExplosions() {
        for (var i = 0; i < explosions.length; i++) {
            explosions[i].draw();
        }
    }

    // ========== 鼠标事件监听 ==========

    // 记录鼠标位置
    function onMouseMove(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (!mouseMoving) {
            mouseMoving = true;
        }

        // 鼠标停止移动后逐渐淡化拖尾
        clearTimeout(moveTimer);
        moveTimer = setTimeout(function() {
            mouseMoving = false;
        }, 50);
    }

    // 鼠标点击星星爆炸
    function onMouseClick(e) {
        var x = e.clientX;
        var y = e.clientY;
        addExplosion(x, y);

        // 添加点击震动效果
        /*document.body.style.transform = 'translate(1px, 1px)';
        setTimeout(function() {
            document.body.style.transform = '';
        }, 50);*/
    }

    // 触摸屏支持
    function onTouchMove(e) {
        e.preventDefault();
        var touch = e.touches[0];
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        mouseMoving = true;

        clearTimeout(moveTimer);
        moveTimer = setTimeout(function() {
            mouseMoving = false;
        }, 50);
    }

    function onTouchStart(e) {
        e.preventDefault();
        var touch = e.touches[0];
        addExplosion(touch.clientX, touch.clientY);
    }

    // ========== 窗口大小适配 ==========
    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    }

    // ========== 动画循环 ==========
    function animate() {
        // 清空画布（使用透明背景清除，让效果叠加）
        ctx.clearRect(0, 0, width, height);

        // 更新和绘制拖尾
        updateTrail();
        drawTrail();

        // 更新和绘制爆炸
        updateExplosions();
        drawExplosions();

        requestAnimationFrame(animate);
    }

    // 监听事件
    window.addEventListener('resize', resize);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', onMouseClick);
    document.addEventListener('touchmove', onTouchMove);
    document.addEventListener('touchstart', onTouchStart);

    // 初始化
    resize();
    animate();
})();