import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Activity, Zap, Heart, PlayCircle, Trophy, Sparkles, Dumbbell } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // --- Configuration ---
    const PARTICLE_DENSITY = width < 768 ? 50 : 120; // Number of nodes
    const CONNECTION_DIST = 120; // Distance to draw lines
    const MOUSE_RADIUS = 180;    // Size of repulsion interaction
    const REPULSION_FORCE = 25;  // Strength of the push
    const RETURN_SPEED = 0.05;   // How fast they snap back (lower = floatier)

    // --- State ---
    const mouse = { x: -1000, y: -1000 };
    
    // Icon shapes to draw on canvas
    type ShapeType = 'circle' | 'heart' | 'bolt' | 'dumbbell';
    const shapes: ShapeType[] = ['circle', 'circle', 'heart', 'bolt', 'dumbbell'];

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      color: string;
      shape: ShapeType;
      size: number;
      angle: number;
      spinSpeed: number;

      constructor() {
        // Random position all over the screen (Already spread out)
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.originX = this.x;
        this.originY = this.y;
        
        // Visuals
        const colors = ['#2dd4bf', '#f472b6', '#fb923c', '#818cf8', '#34d399']; // Teal, Pink, Orange, Indigo, Emerald
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.shape = shapes[Math.floor(Math.random() * shapes.length)];
        this.size = Math.random() * 8 + 4; // Bigger icons
        this.angle = Math.random() * Math.PI * 2;
        this.spinSpeed = (Math.random() - 0.5) * 0.02;
      }

      update() {
        // 1. Interaction: Repulsion from mouse
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let forceX = 0;
        let forceY = 0;

        if (distance < MOUSE_RADIUS) {
            const force = (MOUSE_RADIUS - distance) / MOUSE_RADIUS;
            const angle = Math.atan2(dy, dx);
            // Push away
            forceX = -Math.cos(angle) * force * REPULSION_FORCE;
            forceY = -Math.sin(angle) * force * REPULSION_FORCE;
        }

        // 2. Physics: Move towards target (Origin + Force)
        // This creates the "Spring" effect. 
        // Target is Origin + the Repulsion offset.
        // We add a tiny bit of noise to origin so they float slightly.
        const time = Date.now() * 0.001;
        const floatX = Math.sin(time + this.originY * 0.01) * 10;
        const floatY = Math.cos(time + this.originX * 0.01) * 10;

        const targetX = this.originX + forceX + floatX;
        const targetY = this.originY + forceY + floatY;

        this.x += (targetX - this.x) * RETURN_SPEED;
        this.y += (targetY - this.y) * RETURN_SPEED;

        // Spin
        this.angle += this.spinSpeed;
      }

      draw() {
        ctx!.save();
        ctx!.translate(this.x, this.y);
        ctx!.rotate(this.angle);
        ctx!.fillStyle = this.color;
        ctx!.strokeStyle = this.color;
        ctx!.lineWidth = 2;
        ctx!.globalAlpha = 0.8;

        // Custom Icon Drawing
        if (this.shape === 'circle') {
            ctx!.beginPath();
            ctx!.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            ctx!.fill();
        } else if (this.shape === 'heart') {
             // Simplified Heart
            const s = this.size * 0.5;
            ctx!.beginPath();
            ctx!.moveTo(0, s/2);
            ctx!.bezierCurveTo(0, -s/2, -s, -s/2, -s, 0);
            ctx!.bezierCurveTo(-s, s, 0, s*1.5, 0, s*2);
            ctx!.bezierCurveTo(0, s*1.5, s, s, s, 0);
            ctx!.bezierCurveTo(s, -s/2, 0, -s/2, 0, s/2);
            ctx!.fill();
        } else if (this.shape === 'bolt') {
            // Lightning Bolt
            const s = this.size * 0.6;
            ctx!.beginPath();
            ctx!.moveTo(s, -s);
            ctx!.lineTo(0, 0);
            ctx!.lineTo(s/2, 0);
            ctx!.lineTo(-s/2, s);
            ctx!.lineTo(0, 0);
            ctx!.lineTo(-s, 0);
            ctx!.fill();
        } else if (this.shape === 'dumbbell') {
            // Dumbbell shape
            const w = this.size;
            const h = this.size * 0.3;
            ctx!.fillRect(-w, -h, w*0.4, h*2); // Left weight
            ctx!.fillRect(w*0.6, -h, w*0.4, h*2); // Right weight
            ctx!.fillRect(-w*0.6, -h/2, w*1.2, h); // Bar
        }

        ctx!.restore();
      }
    }

    // Initialize Particles
    const particles: Particle[] = [];
    for (let i = 0; i < PARTICLE_DENSITY; i++) {
        particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // 1. Draw Connections (Wireframe) first so they are behind icons
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Connect to neighbors
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < CONNECTION_DIST) {
                // Opacity based on distance
                const alpha = 1 - (dist / CONNECTION_DIST);
                ctx.globalAlpha = alpha * 0.3; // Subtle lines
                
                const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                grad.addColorStop(0, p1.color);
                grad.addColorStop(1, p2.color);
                ctx.strokeStyle = grad;
                
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        }
      }

      // 2. Update and Draw Particles
      particles.forEach(p => {
          p.update();
          p.draw();
      });

      requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    };

    const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        // Re-distribute on resize
        particles.forEach(p => {
             p.originX = Math.random() * width;
             p.originY = Math.random() * height;
             p.x = p.originX;
             p.y = p.originY;
        });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);
    animate();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans overflow-x-hidden relative selection:bg-brand-pink selection:text-white">
      
      {/* 1. Gradient Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] pointer-events-none"></div>
      
      {/* 2. Interactive Canvas Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 z-10 block" />

      {/* 3. Navbar */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-gradient-to-tr from-brand-cyan to-brand-blue rounded-xl flex items-center justify-center shadow-lg shadow-brand-blue/20 z-50 relative">
                    <Activity className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 z-50 relative">FitPulse</span>
            </div>
            <div className="flex items-center gap-6 z-50 relative">
                <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</Link>
                <Link to="/signup" className="px-6 py-2.5 bg-white text-slate-900 rounded-full text-sm font-bold hover:bg-brand-cyan hover:text-white transition-all shadow-lg hover:shadow-brand-cyan/50 transform hover:-translate-y-0.5">
                    Start Free
                </Link>
            </div>
        </div>
      </nav>

      {/* 4. Hero Content */}
      <main className="relative z-20 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center min-h-[90vh] text-center pointer-events-none">
        {/* Pointer events none on container allows mouse to pass through to canvas, but we need pointer-events-auto on buttons */}
        
        {/* Animated Badge */}
        <div className="animate-float mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-sm font-bold uppercase tracking-wider backdrop-blur-sm pointer-events-auto">
            <Sparkles className="w-4 h-4 text-brand-pink" />
            <span>The Future of Fitness Tracking</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[1.1] drop-shadow-2xl">
            Unleash Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-pink">
                True Potential
            </span>
        </h1>
        
        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Connect your life to the mesh. FitPulse combines <span className="text-brand-cyan font-bold">AI motion analysis</span> with biomechanical insights to sculpt the perfect version of you.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto pointer-events-auto">
            <Link 
                to="/signup" 
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-brand-blue to-brand-purple hover:from-brand-cyan hover:to-brand-blue text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-brand-blue/25 flex items-center justify-center gap-3 group hover:scale-105"
            >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button className="w-full sm:w-auto px-10 py-5 bg-slate-800/80 hover:bg-slate-800 border border-white/10 text-white rounded-2xl font-bold text-lg transition-all backdrop-blur-md flex items-center justify-center gap-3 hover:scale-105">
                <PlayCircle className="w-5 h-5 text-brand-cyan" />
                See It In Action
            </button>
        </div>

        {/* Floating Feature Highlights */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pointer-events-auto">
            <div className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:border-brand-pink/50 text-left shadow-xl">
                <div className="w-12 h-12 bg-brand-pink/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="w-6 h-6 text-brand-pink" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Live Health Metrics</h3>
                <p className="text-slate-400">Real-time heart rate and recovery analysis powered by your device.</p>
            </div>

            <div className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:border-brand-cyan/50 text-left shadow-xl">
                <div className="w-12 h-12 bg-brand-cyan/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Zap className="w-6 h-6 text-brand-cyan" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Energy Optimization</h3>
                <p className="text-slate-400">Smart caloric tracking that adapts to your metabolic output.</p>
            </div>

            <div className="group p-6 rounded-2xl bg-slate-900/60 border border-white/10 backdrop-blur-md hover:bg-slate-800/80 transition-all hover:-translate-y-1 hover:border-brand-purple/50 text-left shadow-xl">
                <div className="w-12 h-12 bg-brand-purple/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Trophy className="w-6 h-6 text-brand-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white">Gamified Goals</h3>
                <p className="text-slate-400">Earn badges and compete on leaderboards to stay consistent.</p>
            </div>
        </div>

      </main>
    </div>
  );
};

export default Landing;