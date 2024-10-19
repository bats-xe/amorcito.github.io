var kissSettings = {
    particles: {
        length: 500, // Number of kisses
        duration: 3, // Particle duration in seconds
        velocity: 50, // Particle velocity in pixels per second
        size: 20, // Particle size in pixels
    },
};

// Clases Point y Particle se mantienen igual

var KissParticle = (function() { // Nueva clase para partículas de besos
    function KissParticle() {
        this.position = new Point();
        this.velocity = new Point();
        this.age = 0;
    }
    KissParticle.prototype.initialize = function(x, y) { // Inicializa la partícula de beso
        this.position.x = x;
        this.position.y = y;
        this.velocity.x = (Math.random() - 0.5) * kissSettings.particles.velocity; // Velocidad aleatoria
        this.velocity.y = -kissSettings.particles.velocity; // Sube hacia arriba
        this.age = 0;
    };
    KissParticle.prototype.update = function(deltaTime) { // Actualiza la partícula
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.age += deltaTime;
    };
    KissParticle.prototype.draw = function(context, image) { // Dibuja la partícula
        context.globalAlpha = 1 - this.age / kissSettings.particles.duration;
        context.drawImage(image, this.position.x, this.position.y, kissSettings.particles.size, kissSettings.particles.size);
    };

    return KissParticle;
})();

var KissParticlePool = (function() { // Nueva clase para el pool de partículas de besos
    var particles, firstActive = 0, firstFree = 0, duration = kissSettings.particles.duration;

    function KissParticlePool(length) {
        particles = new Array(length);
        for (var i = 0; i < particles.length; i++)
            particles[i] = new KissParticle();
    }
    KissParticlePool.prototype.add = function(x, y) {
        particles[firstFree].initialize(x, y);
        firstFree++;

        if (firstFree == particles.length) {
            firstFree = 0;
        }
        if (firstActive == firstFree) {
            firstActive++;
        }
        if (firstActive == particles.length) {
            firstActive = 0;
        }
    };
    KissParticlePool.prototype.update = function(deltaTime) {
        var i;
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) {
                particles[i].update(deltaTime);
            }
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) {
                particles[i].update(deltaTime);
            }
            for (i = 0; i < firstFree; i++) {
                particles[i].update(deltaTime);
            }
        }
        while (particles[firstActive].age >= duration && firstActive != firstFree) {
            firstActive++;
            if (firstActive == particles.length) {
                firstActive = 0;
            }
        }
    };
    KissParticlePool.prototype.draw = function(context, image) {
        if (firstActive < firstFree) {
            for (i = firstActive; i < firstFree; i++) {
                particles[i].draw(context, image);
            }
        }
        if (firstFree < firstActive) {
            for (i = firstActive; i < particles.length; i++) {
                particles[i].draw(context, image);
            }
            for (i = 0; i < firstFree; i++) {
                particles[i].draw(context, image);
            }
        }
    };

    return KissParticlePool;
})();

(function(canvas) {
    var context = canvas.getContext('2d'), kissParticles = new KissParticlePool(kissSettings.particles.length), particleRate = kissSettings.particles.length / kissSettings.particles.duration, time;

    var kissImage = new Image();
    kissImage.src = './kiss.png'; // Asegúrate de tener la imagen de beso en esta ruta

    function render() {
        requestAnimationFrame(render);
        var newTime = new Date().getTime() / 1000, deltaTime = newTime - (time || newTime);
        time = newTime;
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        var amount = particleRate * deltaTime;
        for (var i = 0; i < amount; i++) { // Agregar partículas de besos desde la parte inferior
            kissParticles.add(Math.random() * canvas.width, canvas.height); // Generar desde la parte inferior
        }

        kissParticles.update(deltaTime);
        kissParticles.draw(context, kissImage);
    }

    function onResize() {
        canvas.width  = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    window.onresize = onResize;
    
    setTimeout(function() {
        onResize();
        render();
    }, 10);
})(document.getElementById('pinkboard'));
