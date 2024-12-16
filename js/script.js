import { Vector } from './Vector.js';
import { Circle } from './Circle.js';
import { SpatialGrid } from './SpatialGrid.js';

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  const width = 800;
  const height = 600;
  const pixelDense = Math.round(devicePixelRatio);
  const subSteps = 1;
  const gravity = { x: 0, y: 0 };
  const fontSize = 12;
  const pointer = new Vector(width / 2, height / 2);

  const bodies = [];
  const minSize = 2;
  const maxSize = 5;
  const numCircles = 5000;

  const spatialBounds = {
    min: { x: 0, y: 0 },
    max: { x: width, y: height }
  };
  const cellSize = maxSize * 2;
  const spatialDimentions = {
    x: Math.ceil(width / cellSize),
    y: Math.ceil(height / cellSize)
  };
  const spatialGrid = new SpatialGrid(spatialBounds, spatialDimentions);

  // Set Render Quality
  canvas.width = width * pixelDense;
  canvas.height = height * pixelDense;
  ctx.scale(pixelDense, pixelDense);
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  function initialize() {
    for (let i = 0; i < numCircles; i++) {
      const radius = Math.random() * (maxSize - minSize) + minSize;
      const x = Math.random() * (width - radius * 2) + radius;
      const y = Math.random() * (height - radius * 2) + radius;

      const circle = new Circle(x, y, radius);
      bodies.push(circle);

      spatialGrid.add(circle);
      setAABoundingBox(circle);
    }
  }

  function setAABoundingBox(circle) {
    circle.aabb = {
      minX: circle.position.x - circle.radius,
      minY: circle.position.y - circle.radius,
      maxX: circle.position.x + circle.radius,
      maxY: circle.position.y + circle.radius
    };
  }

  function isAABBOverlap(boxA, boxB) {
    return (
      boxA.minX < boxB.maxX &&
      boxA.maxX > boxB.minX &&
      boxA.minY < boxB.maxY &&
      boxA.maxY > boxB.minY
    );
  }

  canvas.addEventListener('pointerdown', event => {
    pointer.x = event.offsetX;
    pointer.y = event.offsetY;
  });

  canvas.addEventListener('pointermove', event => {
    pointer.x = event.offsetX;
    pointer.y = event.offsetY;
  });

  function setBoundary(body, x, y, w, h) {
    if (body.position.x < x + body.radius) {
      body.position.x = x + body.radius;
      body.velocity.x *= -1;
    } else if (body.position.x > w - body.radius) {
      body.position.x = w - body.radius;
      body.velocity.x *= -1;
    }

    if (body.position.y < y + body.radius) {
      body.position.y = y + body.radius;
      body.velocity.y *= -1;
    } else if (body.position.y > h - body.radius) {
      body.position.y = h - body.radius;
      body.velocity.y *= -1;
    }
  }

  function resolveCollision(bodyA, bodyB) {
    const direction = Vector.subtract(bodyB.position, bodyA.position);
    let distance = direction.x ** 2 + direction.y ** 2;
    const radii = bodyA.radius + bodyB.radius;

    if (distance >= radii * radii || distance === 0) return;

    distance = Math.sqrt(distance);
    const normal = direction.scale(1 / distance);
    const depth = (radii - distance) * 0.5;

    bodyA.position.add(normal, -depth);
    bodyB.position.add(normal, depth);

    const relativeVelocity = Vector.subtract(bodyB.velocity, bodyA.velocity);
    const velocityAlongNormal = relativeVelocity.dot(normal);

    if (velocityAlongNormal > 0) {
      return;
    }

    const restitution = Math.min(bodyA.restitution, bodyB.restitution);
    const impulse =
      (-(1 + restitution) * velocityAlongNormal) /
      (bodyA.inverseMass + bodyB.inverseMass);

    bodyA.velocity.add(normal, -impulse * bodyA.inverseMass);
    bodyB.velocity.add(normal, impulse * bodyB.inverseMass);
  }

  // (Debug)
  function drawGrid() {
    const cellWidth = width / spatialDimentions.x;
    const cellHeight = height / spatialDimentions.y;

    ctx.strokeStyle = '#444444';
    for (let x = 0; x <= width; x += cellWidth) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += cellHeight) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }

  // (Debug)
  function highlightActiveCells() {
    const cellWidth = width / spatialGrid.dimentions.x;
    const cellHeight = height / spatialGrid.dimentions.y;

    for (const [key, cell] of spatialGrid.cells.entries()) {
      if (cell.size > 0) {
        // Reverse the key calculation to get x and y
        const x = Math.floor(key / spatialGrid.dimentions.y);
        const y = key % spatialGrid.dimentions.y;

        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'; // Semi-transparent red
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
      }
    }
  }

  function update(currentTime) {
    const deltaTime = currentTime - update.previousTime || 0;
    update.previousTime = currentTime;

    // Render
    ctx.clearRect(0, 0, width, height);

    // Draw Grid (Debug)
    // drawGrid();
    // highlightActiveCells();

    // Draw bodies
    for (const body of bodies) {
      ctx.beginPath();
      ctx.arc(body.position.x, body.position.y, body.radius, 0, 6.2831853072);
      ctx.closePath();
      ctx.fillStyle = body.color;
      ctx.fill();
    }

    // Draw Settings (Debug)
    ctx.font = `${fontSize}px Verdana`;
    ctx.textAlign = 'start';
    ctx.baseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `FPS: ${Math.round(1 / (deltaTime / 1000))}`,
      fontSize,
      fontSize
    );
    ctx.fillText(`BODIES: ${bodies.length}`, fontSize, fontSize * 2);
    ctx.fillText(`SUBSTEPS: ${subSteps}`, fontSize, fontSize * 3);

    // Simulate
    for (let subStep = 0; subStep < subSteps; subStep++) {
      for (let i = 0; i < bodies.length; i++) {
        const bodyA = bodies[i];
        const acceleration = Vector.scale(gravity, bodyA.inverseMass);

        bodyA.velocity.add(acceleration, deltaTime / subSteps);
        bodyA.position.add(bodyA.velocity, deltaTime / subSteps);
        setBoundary(bodyA, 0, 0, width, height);

        spatialGrid.update(bodyA);
        setAABoundingBox(bodyA);

        const nearby = spatialGrid.getNearby(bodyA.position);

        for (const bodyB of nearby) {
          if (bodyA === bodyB) continue;

          if (!isAABBOverlap(bodyA.aabb, bodyB.aabb)) continue;

          resolveCollision(bodyA, bodyB);
        }

        // Naive Version
        /* for (let j = i + 1; j < bodies.length; j++) {
          const bodyB = bodies[j];

          if (bodyA === bodyB) continue;

          if (!isAABBOverlap(bodyA.aabb, bodyB.aabb)) {
            continue;
          }
          
          console.log('check');
          resolveCollision(bodyA, bodyB);
        } */
      }
    }

    // Draw pointer events (Debug)
    const rangeX = (width / spatialDimentions.x) * 3;
    const rangeY = (height / spatialDimentions.y) * 3;
    const pointerNearBy = spatialGrid.getNearby(pointer);

    ctx.fillStyle = '#498df837';
    ctx.fillRect(
      pointer.x - rangeX * 0.5,
      pointer.y - rangeY * 0.5,
      rangeX,
      rangeY
    );
    for (const body of pointerNearBy) {
      ctx.strokeStyle = '#15ff004f';
      ctx.strokeRect(
        body.position.x - rangeX / 6,
        body.position.y - rangeY / 6,
        rangeX / 3,
        rangeY / 3
      );
    }
    ctx.fillStyle = 'blue';
    ctx.fillRect(pointer.x - 1, pointer.y - 1, 2, 2);

    requestAnimationFrame(update);
  }

  initialize();
  update(performance.now());
}

window.onload = main;
