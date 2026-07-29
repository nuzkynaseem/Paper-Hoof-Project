import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import gsap from 'gsap';
import './GravityCanvas.css';

const GravityCanvas = () => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Helper to get precise container width & height
    const getBounds = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width > 0 ? rect.width : (container.clientWidth || window.innerWidth);
      const h = rect.height > 0 ? rect.height : (container.clientHeight || 220);
      return { width: Math.max(w, 280), height: Math.max(h, 160) };
    };

    let { width, height } = getBounds();

    // Preload Paper Hoof Horse SVG
    const horseImg = new Image();
    horseImg.src = `${process.env.PUBLIC_URL}/paperhoof-horse.svg`;

    // 1. Create Matter.js Engine
    const { Engine, Render, Runner, Bodies, Composite, Mouse, MouseConstraint, Vector, Events } = Matter;
    const engine = Engine.create({
      gravity: { x: 0, y: 1.8, scale: 0.0012 }
    });
    engineRef.current = engine;

    // 2. Create Renderer using existing React canvasRef (prevents duplicate canvas DOM nodes!)
    const render = Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: width,
        height: height,
        wireframes: false,
        background: 'transparent',
        pixelRatio: window.devicePixelRatio || 1
      }
    });

    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // 3. Create Static Boundaries (Ground & Walls)
    const wallOptions = { isStatic: true, render: { fillStyle: 'transparent' } };
    const ground = Bodies.rectangle(width / 2, height - 12, width * 3, 24, wallOptions);
    const leftWall = Bodies.rectangle(-30, height / 2, 60, height * 10, wallOptions);
    const rightWall = Bodies.rectangle(width + 30, height / 2, 60, height * 10, wallOptions);

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Color palette for dynamic shapes
    const colors = [
      'rgba(227, 76, 24, 0.94)',   // Mane Orange
      'rgba(32, 36, 35, 0.94)',    // Horse Black
      'rgba(1, 54, 10, 0.92)',     // Saddle Green
      'rgba(13, 46, 74, 0.92)',    // Hero Navy
      'rgba(215, 70, 20, 0.94)'    // Accent Orange
    ];

    const spawnShapes = () => {
      const { width: curW, height: curH } = getBounds();

      // Align ground & side walls to current container dimensions
      Matter.Body.setPosition(ground, Vector.create(curW / 2, curH - 12));
      Matter.Body.setPosition(leftWall, Vector.create(-30, curH / 2));
      Matter.Body.setPosition(rightWall, Vector.create(curW + 30, curH / 2));

      // Remove existing dynamic shapes
      const existing = Composite.allBodies(engine.world).filter((b) => !b.isStatic);
      existing.forEach((b) => Composite.remove(engine.world, b));

      const newBodies = [];
      // Doubled the number of shapes (was curW / 80, min 7, max 15; now curW / 40, min 14, max 28)
      const numShapes = Math.min(Math.max(Math.floor(curW / 40), 14), 28);

      for (let i = 0; i < numShapes; i++) {
        // Spawn shapes inside visible top region (y = 10..60) for immediate visible falling action
        const x = Math.random() * (curW - 120) + 60;
        const y = Math.random() * 50 + 10;
        const color = colors[i % colors.length];
        const shapeType = i % 4; // 0: Box, 1: Circle, 2: Triangle, 3: Paper Hoof Horse

        let body;
        if (shapeType === 0) {
          const size = Math.random() * 12 + 36;
          body = Bodies.rectangle(x, y, size, size, {
            chamfer: { radius: 8 },
            restitution: 0.6,
            friction: 0.2,
            render: { fillStyle: color }
          });
          body.customType = 'box';
          body.customSize = size;
        } else if (shapeType === 1) {
          const radius = Math.random() * 8 + 18;
          body = Bodies.circle(x, y, radius, {
            restitution: 0.7,
            friction: 0.1,
            render: { fillStyle: color }
          });
          body.customType = 'circle';
          body.customRadius = radius;
        } else if (shapeType === 2) {
          const radius = Math.random() * 8 + 20;
          body = Bodies.polygon(x, y, 3, radius, {
            restitution: 0.55,
            friction: 0.2,
            render: { fillStyle: color }
          });
          body.customType = 'triangle';
          body.customRadius = radius;
        } else {
          const size = 44;
          body = Bodies.rectangle(x, y, size, size, {
            chamfer: { radius: 10 },
            restitution: 0.65,
            friction: 0.15,
            render: { fillStyle: 'rgba(227, 76, 24, 0.95)' }
          });
          body.customType = 'horse';
          body.customSize = size;
        }

        // Apply downward velocity for immediate fall animation
        Matter.Body.setVelocity(body, {
          x: (Math.random() - 0.5) * 2,
          y: Math.random() * 2 + 1.5
        });

        newBodies.push(body);
      }

      Composite.add(engine.world, newBodies);

      gsap.fromTo(
        container,
        { opacity: 0.6 },
        { opacity: 1, duration: 0.4, ease: 'power2.out' }
      );
    };

    // Custom Glassmorphic Borders & Horse Icon Overlay
    // Uses body.vertices directly in world space so triangle (and all shapes) borders align 100% perfectly with Matter.js geometry!
    Events.on(render, 'afterRender', () => {
      const ctx = render.context;
      if (!ctx) return;

      const bodies = Composite.allBodies(engine.world);

      bodies.forEach((body) => {
        if (body.isStatic || !body.customType) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 2.5;

        if (body.customType === 'circle') {
          ctx.beginPath();
          ctx.arc(body.position.x, body.position.y, body.customRadius || 20, 0, Math.PI * 2);
          ctx.stroke();
        } else if (body.vertices && body.vertices.length > 0) {
          ctx.beginPath();
          body.vertices.forEach((v, idx) => {
            if (idx === 0) ctx.moveTo(v.x, v.y);
            else ctx.lineTo(v.x, v.y);
          });
          ctx.closePath();
          ctx.stroke();
        }

        // Draw Horse Icon if Horse Body
        if (body.customType === 'horse' && horseImg.complete && horseImg.naturalWidth > 0) {
          ctx.translate(body.position.x, body.position.y);
          ctx.rotate(body.angle);
          const iconSize = 28;
          ctx.drawImage(horseImg, -iconSize / 2, -iconSize / 2, iconSize, iconSize);
        }

        ctx.restore();
      });
    });

    // Mouse Dragging Support
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false }
      }
    });

    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    // Spawn shapes after layout frame
    const timer = setTimeout(() => {
      spawnShapes();
    }, 50);

    // IntersectionObserver to re-spawn when scrolled into view
    let isCurrentlyVisible = false;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!isCurrentlyVisible) {
              spawnShapes();
              isCurrentlyVisible = true;
            }
          } else {
            isCurrentlyVisible = false;
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(container);

    // ResizeObserver for canvas resolution syncing
    const resizeObserver = new ResizeObserver(() => {
      const { width: newW, height: newH } = getBounds();
      render.canvas.width = newW * (window.devicePixelRatio || 1);
      render.canvas.height = newH * (window.devicePixelRatio || 1);
      render.options.width = newW;
      render.options.height = newH;

      Matter.Body.setPosition(ground, Vector.create(newW / 2, newH - 12));
      Matter.Body.setPosition(leftWall, Vector.create(-30, newH / 2));
      Matter.Body.setPosition(rightWall, Vector.create(newW + 30, newH / 2));
    });

    resizeObserver.observe(container);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
      resizeObserver.disconnect();
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world);
      Engine.clear(engine);
    };
  }, []);

  return (
    <div
      className="gravity-canvas-container"
      ref={containerRef}
      data-cursor="canvas"
      data-cursor-text="PLAY WITH SHAPES"
      data-testid="gravity-canvas"
    >
      <canvas ref={canvasRef} className="gravity-canvas-element" />
    </div>
  );
};

export default GravityCanvas;
