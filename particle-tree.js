// 粒子圣诞树系统
class ParticleTree {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isActive = false;
        
        // 设置画布尺寸
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    // 生成圣诞树粒子
    generateTree() {
        this.isActive = true;
        this.particles = [];
        
        const treeHeight = Math.min(this.canvas.height * 0.6, 400);
        const treeWidth = treeHeight * 0.6;
        const layers = 8; // 树的层数
        
        // 生成每层的粒子
        for (let layer = 0; layer < layers; layer++) {
            const layerY = this.centerY - treeHeight / 2 + (layer * treeHeight / layers);
            const layerWidth = treeWidth * (1 - layer * 0.15);
            const particlesPerLayer = 15 + layer * 3;
            
            for (let i = 0; i < particlesPerLayer; i++) {
                const angle = (Math.PI * 2 * i) / particlesPerLayer;
                const radius = (layerWidth / 2) * (0.5 + Math.random() * 0.5);
                const x = this.centerX + Math.cos(angle) * radius;
                const y = layerY + (Math.random() - 0.5) * 30;
                
                // 随机颜色：绿色系和装饰色
                const colors = [
                    '#00ff00', '#00cc00', '#66ff66', // 绿色
                    '#ff0000', '#ff6600', '#ffff00', // 装饰色
                    '#ff00ff', '#00ffff', '#ffffff'  // 装饰色
                ];
                const color = colors[Math.floor(Math.random() * colors.length)];
                
                this.particles.push({
                    x: x,
                    y: y,
                    baseX: x,
                    baseY: y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: 2 + Math.random() * 3,
                    color: color,
                    opacity: 0.7 + Math.random() * 0.3,
                    twinkle: Math.random() * Math.PI * 2,
                    twinkleSpeed: 0.02 + Math.random() * 0.03
                });
            }
        }
        
        // 添加树顶星星
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: this.centerX,
                y: this.centerY - treeHeight / 2 - 20,
                baseX: this.centerX,
                baseY: this.centerY - treeHeight / 2 - 20,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: 4 + Math.random() * 4,
                color: '#ffff00',
                opacity: 0.8 + Math.random() * 0.2,
                twinkle: Math.random() * Math.PI * 2,
                twinkleSpeed: 0.05 + Math.random() * 0.05
            });
        }
    }

    // 清除所有粒子
    clear() {
        this.isActive = false;
        // 让粒子逐渐消失（使用更平滑的淡出）
        const fadeSpeed = 0.03;
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.opacity -= fadeSpeed;
            // 同时缩小粒子
            particle.size *= 0.98;
            
            if (particle.opacity <= 0 || particle.size < 0.1) {
                this.particles.splice(i, 1);
            }
        }
    }

    // 更新粒子状态
    update() {
        if (!this.isActive && this.particles.length === 0) {
            return;
        }

        // 使用更高效的更新方式
        const particlesToRemove = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            
            // 粒子围绕基础位置浮动
            particle.x = particle.baseX + Math.sin(particle.twinkle) * 5;
            particle.y = particle.baseY + Math.cos(particle.twinkle) * 5;
            
            // 添加随机运动
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // 边界反弹（使用更平滑的方式）
            if (particle.x < 0 || particle.x > this.canvas.width) {
                particle.vx *= -0.8; // 添加阻尼
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.canvas.height) {
                particle.vy *= -0.8;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // 闪烁效果
            particle.twinkle += particle.twinkleSpeed;
            
            // 逐渐回到基础位置（使用更平滑的插值）
            const lerpFactor = 0.1;
            particle.baseX += (particle.x - particle.baseX) * lerpFactor;
            particle.baseY += (particle.y - particle.baseY) * lerpFactor;
            
            // 标记需要移除的粒子
            if (particle.opacity <= 0) {
                particlesToRemove.push(i);
            }
        }

        // 从后往前移除，避免索引问题
        for (let i = particlesToRemove.length - 1; i >= 0; i--) {
            this.particles.splice(particlesToRemove[i], 1);
        }
    }

    // 渲染粒子
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = particle.color;
            
            // 绘制粒子
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        });
    }

    // 动画循环
    animate() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

