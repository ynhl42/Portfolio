/* -------------------------------------------------------
 I WAS BORED AND IT ALREADY GOT "BIGGER" THAN IT SHOULD.
                     HOPE YOU ENJOY :)
------------------------------------------------------- */

(() => {
    const container = document.querySelector('.lava-lamp-container');
    const canvas = document.querySelector('.lava-lamp-canvas');
  
    const dimensions = { width: 0, height: 0 };
  
    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        dimensions.width = cr.width;
        dimensions.height = cr.height;
        initAnimation();
      }
    });
    resizeObserver.observe(container);
  
    let animationFrameId;
    const color = 'rgb(30, 30, 30)';
    const devicePixelRatio = window.devicePixelRatio || 1;
    const ctx = canvas.getContext('2d');
  
    function ensureOpaqueColor(inputColor) {
      const tempDiv = document.createElement('div');
      tempDiv.style.color = inputColor;
      document.body.appendChild(tempDiv);
      const computedColor = getComputedStyle(tempDiv).color;
      document.body.removeChild(tempDiv);
      return computedColor;
    }
  
    function initAnimation() {
      if (dimensions.width === 0 || dimensions.height === 0) return;
      canvas.width = dimensions.width * devicePixelRatio;
      canvas.height = dimensions.height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
  
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
  
      let time = 0;
      const seed = 'lava-lamp-seed';
      const prng = Alea(seed);
      const simplex = new SimplexNoise(prng);
      function noise2D(x, y) { return simplex.noise2D(x, y); }
      function random(min, max) { return Math.random() * (max - min) + min; }
  
      const MAX_MASS = 210;
      const INITIAL_RADIUS_MIN = 10;
      const INITIAL_RADIUS_MAX = 20;
      const GROWTH_RATE = 24;
      const MOVE_SPEED_MIN = 8;
      const MOVE_SPEED_MAX = 24;
      const NUM_POINTS = 100;
      const NOISE_SCALE = 0.005;
      const NOISE_STRENGTH = 14;
      const MORPH_SPEED_MIN = 0.2;
      const MORPH_SPEED_MAX = 0.3;
      const NOISE_REDUCTION_RATE = 0.05;
      const MIN_MAX_MASS = 100;
      const SMALL_BUBBLE_CHANCE = 0.01;
      const SMALL_BUBBLE_MAX_MASS_MIN = 20;
      const SMALL_BUBBLE_MAX_MASS_MAX = 80;
      const blobBaseColor = ensureOpaqueColor(color) || 'rgb(30, 30, 30)';
      const MIN_BUBBLES = 10;
      const MAX_BUBBLES = 20;
      const FAILSAFE_TIMEOUT = 10;
  
      function Blob(options) {
        this.id = options.id || ('blob-' + Math.random().toString(36).substr(2, 9));
        this.numPoints = options.numPoints || NUM_POINTS;
        this.initialRadius = options.radius || random(INITIAL_RADIUS_MIN, INITIAL_RADIUS_MAX);
        this.mass = this.initialRadius * 0.1;
        this.massGrowthRate = options.massGrowthRate || GROWTH_RATE;
        this.maxMass = options.maxMass || MAX_MASS;
        this.origin = options.origin || 'top';
        this.direction = this.origin === 'top' ? 1 : -1;
        this.centerX = options.centerX || random(dimensions.width * 0.2, dimensions.width * 0.8);
        this.centerY = options.centerY || (this.origin === 'top' ? random(-this.initialRadius, 0) : random(dimensions.height, dimensions.height + this.initialRadius));
        this.color = options.color || blobBaseColor;
        this.speed = options.speed || random(MOVE_SPEED_MIN, MOVE_SPEED_MAX);
        this.morphSpeed = options.morphSpeed || random(MORPH_SPEED_MIN, MORPH_SPEED_MAX);
        this.noiseScale = options.noiseScale || NOISE_SCALE;
        this.noiseStrength = options.noiseStrength || NOISE_STRENGTH;
        this.initialNoiseStrength = this.noiseStrength;
        this.vx = 0;
        this.vy = 0;
        this.state = 'growing';
        this.radius = this.initialRadius;
        this.movingStartTime = null;
        this.targetMass = null;
        this.initPoints();
      }
  
      Blob.prototype.initPoints = function() {
        this.points = [];
        const angleStep = (Math.PI * 2) / this.numPoints;
        for (let i = 0; i < this.numPoints; i++) {
          const angle = i * angleStep;
          this.points.push({ angle: angle, offset: 0 });
        }
      };
  
      Blob.prototype.isOutOfBounds = function(width, height) {
        return ((this.direction === 1 && this.centerY - this.radius > height) || (this.direction === -1 && this.centerY + this.radius < 0));
      };
  
      Blob.prototype.update = function(deltaTime, globalTime) {
        if (this.state === 'growing') {
          if (this.targetMass !== null) {
            if (this.mass < this.targetMass) {
              this.mass += this.massGrowthRate * deltaTime;
              if (this.mass >= this.targetMass) {
                this.mass = this.targetMass;
                this.state = 'moving';
                this.vy = this.direction * this.speed;
                this.vx = 0;
                this.movingStartTime = globalTime;
              }
            }
          } else {
            this.mass += this.massGrowthRate * deltaTime;
            this.radius = this.initialRadius + (this.mass - this.initialRadius * 0.1) * 0.5;
            if (this.mass >= this.maxMass) {
              this.mass = this.maxMass;
              this.state = 'moving';
              this.vy = this.direction * this.speed;
              this.vx = 0;
              this.movingStartTime = globalTime;
            }
          }
          if (this.targetMass === null) {
            this.radius = this.initialRadius + (this.mass - this.initialRadius * 0.1) * 0.5;
          } else {
            this.radius = this.initialRadius + (this.mass - this.initialRadius * 0.1) * 0.5;
          }
        }
        if (this.state === 'moving') {
          if (this.movingStartTime !== null) {
            const movingDuration = globalTime - this.movingStartTime;
            this.noiseStrength = Math.max(0, this.initialNoiseStrength - movingDuration * NOISE_REDUCTION_RATE);
          }
          this.centerX += this.vx * deltaTime;
          this.centerY += this.vy * deltaTime;
        }
        const _this = this;
        this.points.forEach(function(point) {
          const x = _this.centerX + Math.cos(point.angle) * _this.radius;
          const y = _this.centerY + Math.sin(point.angle) * _this.radius;
          const noiseValue = noise2D(x * _this.noiseScale, y * _this.noiseScale + globalTime * _this.morphSpeed);
          point.offset = noiseValue * _this.noiseStrength;
        });
      };
  
      Blob.prototype.draw = function(ctx) {
        ctx.save();
        ctx.translate(this.centerX, this.centerY);
        ctx.beginPath();
        const points = this.points;
        const len = points.length;
        for (let i = 0; i < len; i++) {
          const current = points[i];
          const next = points[(i + 1) % len];
          const currentAngle = current.angle;
          const currentRadius = this.radius + (current.offset || 0);
          const currentX = currentRadius * Math.cos(currentAngle);
          const currentY = currentRadius * Math.sin(currentAngle);
          const nextAngle = next.angle;
          const nextRadius = this.radius + (next.offset || 0);
          const nextX = nextRadius * Math.cos(nextAngle);
          const nextY = nextRadius * Math.sin(nextAngle);
          const cpX = (currentX + nextX) / 2;
          const cpY = (currentY + nextY) / 2;
          if (i === 0) {
            ctx.moveTo(currentX, currentY);
          }
          ctx.quadraticCurveTo(currentX, currentY, cpX, cpY);
        }
        ctx.closePath();
        const gradient = ctx.createRadialGradient(0, 0, this.radius * 0.2, 0, 0, this.radius);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1;
        ctx.fill();
        ctx.restore();
      };
  
      const blobs = [];
      const initialBlobCount = MIN_BUBBLES;
  
      function createBlob(origin) {
        const maxMassVal = Math.random() < SMALL_BUBBLE_CHANCE
          ? random(SMALL_BUBBLE_MAX_MASS_MIN, SMALL_BUBBLE_MAX_MASS_MAX)
          : random(MIN_MAX_MASS, MAX_MASS);
        return new Blob({
          numPoints: NUM_POINTS,
          radius: random(INITIAL_RADIUS_MIN, INITIAL_RADIUS_MAX),
          origin: origin,
          centerX: random(dimensions.width * 0.2, dimensions.width * 0.8),
          centerY: origin === 'top' ? random(-60, 0) : random(dimensions.height, dimensions.height + 60),
          color: blobBaseColor,
          speed: random(MOVE_SPEED_MIN, MOVE_SPEED_MAX),
          morphSpeed: random(MORPH_SPEED_MIN, MORPH_SPEED_MAX),
          noiseScale: NOISE_SCALE,
          noiseStrength: NOISE_STRENGTH,
          massGrowthRate: GROWTH_RATE,
          maxMass: maxMassVal
        });
      }
  
      for (let i = 0; i < initialBlobCount; i++) {
        const o = i % 2 === 0 ? 'top' : 'bottom';
        blobs.push(createBlob(o));
      }
  
      let blobSpawnTimer = 0;
      const BLOB_SPAWN_INTERVAL_MIN = 30;
      const BLOB_SPAWN_INTERVAL_MAX = 60;
      let nextBlobSpawnTime = random(BLOB_SPAWN_INTERVAL_MIN, BLOB_SPAWN_INTERVAL_MAX);
      let noBlobsStartTime = null;
      let lastTime = performance.now();
  
      function animate(currentTime) {
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;
        time += deltaTime;
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        blobs.forEach(blob => {
          blob.update(deltaTime, time);
          blob.draw(ctx);
        });
  
        // Collision response between blobs
        for (let i = 0; i < blobs.length; i++) {
          for (let j = i + 1; j < blobs.length; j++) {
            const blobA = blobs[i];
            const blobB = blobs[j];
            const dx = blobA.centerX - blobB.centerX;
            const dy = blobA.centerY - blobB.centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = (blobA.radius + blobB.radius) * 1.2;
            if (distance < minDistance && distance > 0) {
              const overlap = minDistance - distance;
              const angle = Math.atan2(dy, dx);
              const force = (overlap / minDistance) * 0.05;
              blobA.centerX += Math.cos(angle) * force;
              blobA.centerY += Math.sin(angle) * force;
              blobB.centerX -= Math.cos(angle) * force;
              blobB.centerY -= Math.sin(angle) * force;
            }
          }
        }
  
        // Merging blobs while growing
        for (let i = 0; i < blobs.length; i++) {
          for (let j = i + 1; j < blobs.length; j++) {
            const blobA = blobs[i];
            const blobB = blobs[j];
            if (blobA.state === 'growing' && blobB.state === 'growing') {
              const dx = blobA.centerX - blobB.centerX;
              const dy = blobA.centerY - blobB.centerY;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance < (blobA.radius + blobB.radius)) {
                const newMass = blobA.mass + blobB.mass;
                const newCenterX = (blobA.centerX * blobA.mass + blobB.centerX * blobB.mass) / newMass;
                const newCenterY = (blobA.centerY * blobA.mass + blobB.centerY * blobB.mass) / newMass;
                const avgRadius = (blobA.radius + blobB.radius) / 2;
                const mergedBlob = new Blob({
                  numPoints: NUM_POINTS,
                  radius: avgRadius,
                  origin: blobA.origin,
                  centerX: newCenterX,
                  centerY: newCenterY,
                  color: blobBaseColor,
                  speed: (blobA.speed + blobB.speed) / 2,
                  morphSpeed: (blobA.morphSpeed + blobB.morphSpeed) / 2,
                  noiseScale: NOISE_SCALE,
                  noiseStrength: NOISE_STRENGTH,
                  massGrowthRate: GROWTH_RATE,
                  maxMass: newMass
                });
                mergedBlob.mass = (blobA.mass + blobB.mass) / 2;
                mergedBlob.targetMass = newMass;
                mergedBlob.state = 'growing';
                blobs.splice(j, 1);
                blobs.splice(i, 1, mergedBlob);
                j = i;
              }
            }
          }
        }
  
        // Remove and spawn blobs
        for (let i = blobs.length - 1; i >= 0; i--) {
          const blob = blobs[i];
          if (blob.isOutOfBounds(dimensions.width, dimensions.height)) {
            const origin = blob.origin === 'top' ? 'bottom' : 'top';
            blobs.splice(i, 1);
            if (blobs.length < MAX_BUBBLES) {
              blobs.push(createBlob(origin));
            }
          }
        }
  
        while (blobs.length < MIN_BUBBLES && blobs.length < MAX_BUBBLES) {
          const origin = blobs.length % 2 === 0 ? 'top' : 'bottom';
          blobs.push(createBlob(origin));
        }
  
        blobSpawnTimer += deltaTime;
        if (blobSpawnTimer >= nextBlobSpawnTime) {
          if (blobs.length < MAX_BUBBLES) {
            const origin = Math.random() < 0.5 ? 'top' : 'bottom';
            blobs.push(createBlob(origin));
          }
          blobSpawnTimer = 0;
          nextBlobSpawnTime = random(BLOB_SPAWN_INTERVAL_MIN, BLOB_SPAWN_INTERVAL_MAX);
        }
  
        if (blobs.length === 0) {
          if (!noBlobsStartTime) {
            noBlobsStartTime = time;
          } else if (time - noBlobsStartTime >= FAILSAFE_TIMEOUT) {
            blobs.push(createBlob('top'));
            noBlobsStartTime = null;
          }
        } else {
          noBlobsStartTime = null;
        }
  
        animationFrameId = requestAnimationFrame(animate);
      }
  
      animationFrameId = requestAnimationFrame(animate);
    }
  })();
  