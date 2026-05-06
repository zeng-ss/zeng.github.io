// 动态几何形状背景 - 反弹效果
(function() {
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    canvas.style.pointerEvents = 'none';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.insertBefore(canvas, document.body.firstChild);

    var ctx = canvas.getContext('2d');
    var width = canvas.width;
    var height = canvas.height;

    // 形状数组
    var shapes = [];
    var shapeCount = 6; // 形状数量

    // 全局色相（用于颜色流动）
    var globalHue = 0;

    // 渐变背景
    var gradientAngle = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
        // 不重新初始化形状，只调整边界适应
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].adjustToBounds();
        }
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 形状类
    function Shape() {
        this.type = Math.floor(random(0, 4)); // 0:三角形, 1:矩形, 2:五边形, 3:六边形
        this.x = random(100, width - 100);
        this.y = random(100, height - 100);
        this.size = random(50, 120);

        // 速度
        this.vx = random(-2, 2);
        this.vy = random(-2, 2);

        // 旋转
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.01, 0.01);

        // 颜色
        this.hueOffset = random(0, 360);
        this.saturation = random(60, 80);
        this.lightness = random(55, 70);
        this.opacity = random(0.3, 0.6);

        // 线条宽度
        this.lineWidth = random(1.5, 3);

        // 脉动效果
        this.pulse = random(0, Math.PI * 2);
        this.pulseSpeed = random(0.02, 0.05);
    }

    // 获取形状的顶点坐标
    Shape.prototype.getVertices = function() {
        var vertices = [];
        var sides = [3, 4, 5, 6][this.type];
        var currentSize = this.size + Math.sin(this.pulse) * 8; // 脉动效果

        for (var i = 0; i < sides; i++) {
            var angle = (i / sides) * Math.PI * 2 + this.rotation;
            var x = this.x + Math.cos(angle) * currentSize;
            var y = this.y + Math.sin(angle) * currentSize;
            vertices.push({ x: x, y: y });
        }
        return vertices;
    };

    // 更新位置和状态
    Shape.prototype.update = function() {
        // 移动
        this.x += this.vx;
        this.y += this.vy;

        // 旋转
        this.rotation += this.rotationSpeed;

        // 脉动
        this.pulse += this.pulseSpeed;

        // 边界碰撞检测与反弹
        var vertices = this.getVertices();
        var isColliding = false;

        for (var i = 0; i < vertices.length; i++) {
            var v = vertices[i];

            // 左边界
            if (v.x < 0) {
                this.vx = Math.abs(this.vx);
                isColliding = true;
                break;
            }
            // 右边界
            if (v.x > width) {
                this.vx = -Math.abs(this.vx);
                isColliding = true;
                break;
            }
            // 上边界
            if (v.y < 0) {
                this.vy = Math.abs(this.vy);
                isColliding = true;
                break;
            }
            // 下边界
            if (v.y > height) {
                this.vy = -Math.abs(this.vy);
                isColliding = true;
                break;
            }
        }

        // 碰撞时微调位置，防止卡在边界
        if (isColliding) {
            this.x = Math.min(Math.max(this.x, 50), width - 50);
            this.y = Math.min(Math.max(this.y, 50), height - 50);
        }
    };

    // 边界适应（窗口大小变化时）
    Shape.prototype.adjustToBounds = function() {
        this.x = Math.min(Math.max(this.x, 50), width - 50);
        this.y = Math.min(Math.max(this.y, 50), height - 50);
    };

    // 绘制形状
    Shape.prototype.draw = function() {
        var vertices = this.getVertices();
        if (vertices.length < 3) return;

        ctx.beginPath();
        ctx.moveTo(vertices[0].x, vertices[0].y);
        for (var i = 1; i < vertices.length; i++) {
            ctx.lineTo(vertices[i].x, vertices[i].y);
        }
        ctx.closePath();

        // 动态颜色（色相随全局时间+自身偏移流动）
        var currentHue = (globalHue + this.hueOffset) % 360;

        // 渐变填充
        var centerX = this.x;
        var centerY = this.y;
        var gradient = ctx.createRadialGradient(
            centerX, centerY, 5,
            centerX, centerY, this.size
        );
        gradient.addColorStop(0, `hsla(${currentHue}, ${this.saturation}%, ${this.lightness + 10}%, ${this.opacity * 1.2})`);
        gradient.addColorStop(1, `hsla(${currentHue}, ${this.saturation}%, ${this.lightness - 15}%, ${this.opacity})`);

        ctx.fillStyle = gradient;
        ctx.fill();

        // 描边
        ctx.strokeStyle = `hsla(${currentHue}, ${this.saturation}%, 70%, ${this.opacity + 0.2})`;
        ctx.lineWidth = this.lineWidth;
        ctx.shadowBlur = 12;
        ctx.shadowColor = `hsla(${currentHue}, 80%, 60%, 0.4)`;
        ctx.stroke();
    };

    // 绘制连接线（形状之间的连线）
    function drawConnections() {
        ctx.shadowBlur = 0; // 连线不添加阴影以提升性能

        for (var i = 0; i < shapes.length; i++) {
            for (var j = i + 1; j < shapes.length; j++) {
                var dx = shapes[i].x - shapes[j].x;
                var dy = shapes[i].y - shapes[j].y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var maxDistance = 300;

                if (distance < maxDistance) {
                    // 距离越近线条越明显
                    var opacity = (1 - distance / maxDistance) * 0.3;
                    var midHue = (globalHue + (shapes[i].hueOffset + shapes[j].hueOffset) / 2) % 360;

                    ctx.beginPath();
                    ctx.moveTo(shapes[i].x, shapes[i].y);
                    ctx.lineTo(shapes[j].x, shapes[j].y);
                    ctx.strokeStyle = `hsla(${midHue}, 70%, 65%, ${opacity})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
    }

    // 绘制漂浮粒子（增加细节）
    var particles = [];
    var particleCount = 50;

    function Particle() {
        this.x = random(0, width);
        this.y = random(0, height);
        this.size = random(1, 3);
        this.vx = random(-0.3, 0.3);
        this.vy = random(-0.3, 0.3);
        this.hue = random(0, 360);
    }

    Particle.prototype.update = function() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
    };

    Particle.prototype.draw = function() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${(globalHue + this.hue) % 360}, 80%, 65%, 0.4)`;
        ctx.fill();
    };

    function initParticles() {
        particles = [];
        for (var i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function initShapes() {
        shapes = [];
        for (var i = 0; i < shapeCount; i++) {
            shapes.push(new Shape());
        }
    }

    // 绘制渐变背景
    function drawBackground() {
        // 深色渐变背景
        gradientAngle += 0.002;
        var grad = ctx.createLinearGradient(
            Math.sin(gradientAngle) * width * 0.2 + width / 2, 0,
            Math.cos(gradientAngle) * height * 0.2 + width / 2, height
        );
        grad.addColorStop(0, '#0a0a2a');
        grad.addColorStop(0.5, '#1a1a3a');
        grad.addColorStop(1, '#0a0a2a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
    }

    // 动画循环
    function animate() {
        drawBackground();

        // 更新全局色相
        globalHue = (globalHue + 0.5) % 360;

        // 更新并绘制所有形状
        for (var i = 0; i < shapes.length; i++) {
            shapes[i].update();
            shapes[i].draw();
        }

        // 绘制形状之间的连线
        drawConnections();

        // 更新并绘制粒子
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    initShapes();
    initParticles();
    animate();
})();