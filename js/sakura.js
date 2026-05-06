// 樱花飘落特效
(function() {
    var sakura = {};
    var canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '999';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);

    var ctx = canvas.getContext('2d');
    var particles = [];
    var width = canvas.width;
    var height = canvas.height;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        width = canvas.width;
        height = canvas.height;
    }

    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    function Particle() {
        this.x = random(0, width);
        this.y = random(-height, 0);
        this.size = random(2, 5);
        this.speedY = random(1, 3);
        this.speedX = random(-0.5, 0.5);
        this.rotation = random(0, Math.PI * 2);
        this.rotationSpeed = random(-0.03, 0.03);
        this.opacity = random(0.5, 1);

        // 樱花颜色（浅粉色到白色）
        this.color = `rgba(255, ${random(180, 220)}, ${random(200, 230)}, ${this.opacity})`;
    }

    Particle.prototype.update = function() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        if (this.y > height + 50 || this.x < -50 || this.x > width + 50) {
            this.reset();
        }
    };

    Particle.prototype.reset = function() {
        this.x = random(0, width);
        this.y = random(-height, -50);
        this.speedY = random(1, 3);
        this.speedX = random(-0.5, 0.5);
    };

    Particle.prototype.draw = function() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.beginPath();
        ctx.fillStyle = this.color;

        // 绘制樱花花瓣（五瓣）
        for (var i = 0; i < 5; i++) {
            var angle = (i * 72) * Math.PI / 180;
            var x1 = Math.cos(angle) * this.size;
            var y1 = Math.sin(angle) * this.size;
            ctx.moveTo(0, 0);
            ctx.lineTo(x1, y1);
            ctx.arc(x1, y1, this.size / 1.5, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
    };

    function init() {
        for (var i = 0; i < 15; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (var i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
})();