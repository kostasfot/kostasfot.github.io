(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Initialize Lucide icons without preventing the rest of the page if the CDN is unavailable.
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }

    // Mobile navigation.
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            const willOpen = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenuBtn.setAttribute('aria-expanded', String(willOpen));
        });

        mobileLinks.forEach((link) => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Scroll reveal. Reduced-motion users see all content immediately.
    const revealElements = document.querySelectorAll('.reveal');
    if (prefersReducedMotion.matches || !('IntersectionObserver' in window)) {
        revealElements.forEach((element) => element.classList.add('active'));
    } else {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -5% 0px',
            threshold: 0.1
        });

        revealElements.forEach((element) => revealObserver.observe(element));
    }

    // Expandable experience details. Kept global because the existing markup calls it inline.
    window.toggleDetails = (id, button) => {
        const details = document.getElementById(id);
        if (!details || !button) return;

        const icon = button.querySelector('[data-lucide], svg');
        const label = button.querySelector('span');
        const isOpening = details.classList.contains('hidden');

        details.classList.toggle('hidden', !isOpening);
        button.setAttribute('aria-expanded', String(isOpening));

        if (label) {
            label.textContent = isOpening ? 'Hide Detailed Breakdown' : 'View Detailed Breakdown';
        }
        if (icon) {
            icon.style.transform = isOpening ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    };

    // Email copy with a secure-context fallback.
    window.copyEmail = async () => {
        const email = 'fotogloucostas@gmail.com';
        const toast = document.getElementById('toast');
        let copied = false;

        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(email);
                copied = true;
            } else {
                const temporaryInput = document.createElement('textarea');
                temporaryInput.value = email;
                temporaryInput.setAttribute('readonly', '');
                temporaryInput.style.position = 'fixed';
                temporaryInput.style.opacity = '0';
                document.body.appendChild(temporaryInput);
                temporaryInput.select();
                copied = document.execCommand('copy');
                temporaryInput.remove();
            }
        } catch (error) {
            copied = false;
        }

        if (toast && copied) {
            toast.classList.remove('opacity-0', 'pointer-events-none');
            window.setTimeout(() => {
                toast.classList.add('opacity-0', 'pointer-events-none');
            }, 2500);
        }
    };

    class TechnologyBackground {
        constructor(canvas) {
            this.canvas = canvas;
            this.context = canvas ? canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;
            this.width = 0;
            this.height = 0;
            this.dpr = 1;
            this.nodes = [];
            this.links = [];
            this.flows = [];
            this.structures = [];
            this.projectedNodes = [];
            this.frameId = null;
            this.lastTimestamp = 0;
            this.elapsed = 0;
            this.running = false;
            this.visible = !document.hidden;
            this.reducedMotion = prefersReducedMotion.matches;
            this.coarsePointer = window.matchMedia('(pointer: coarse)').matches;
            this.lowPower = (navigator.hardwareConcurrency || 8) <= 4;
            this.frameCounter = 0;
            this.resizeFrame = null;
            this.frameInterval = 25;
            this.lastRenderTimestamp = 0;
            this.pointer = {
                targetX: 0,
                targetY: 0,
                x: 0,
                y: 0,
                screenX: -9999,
                screenY: -9999,
                active: false
            };
            this.scrollTarget = 0;
            this.scrollProgress = 0;

            this.onPointerMove = this.onPointerMove.bind(this);
            this.onPointerLeave = this.onPointerLeave.bind(this);
            this.onScroll = this.onScroll.bind(this);
            this.onResize = this.onResize.bind(this);
            this.onVisibilityChange = this.onVisibilityChange.bind(this);
            this.onMotionPreferenceChange = this.onMotionPreferenceChange.bind(this);
            this.animate = this.animate.bind(this);
        }

        init() {
            if (!this.canvas || !this.context) {
                document.documentElement.classList.add('no-canvas');
                return;
            }

            this.resize();
            this.onScroll();
            this.attachListeners();

            if (this.reducedMotion) {
                this.render(0, true);
            } else {
                this.start();
            }
        }

        attachListeners() {
            window.addEventListener('resize', this.onResize, { passive: true });
            window.addEventListener('scroll', this.onScroll, { passive: true });
            document.addEventListener('visibilitychange', this.onVisibilityChange);

            if (!this.coarsePointer) {
                window.addEventListener('pointermove', this.onPointerMove, { passive: true });
                document.documentElement.addEventListener('pointerleave', this.onPointerLeave, { passive: true });
            }

            if (typeof prefersReducedMotion.addEventListener === 'function') {
                prefersReducedMotion.addEventListener('change', this.onMotionPreferenceChange);
            } else if (typeof prefersReducedMotion.addListener === 'function') {
                prefersReducedMotion.addListener(this.onMotionPreferenceChange);
            }
        }

        destroy() {
            this.stop();
            if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
            window.removeEventListener('resize', this.onResize);
            window.removeEventListener('scroll', this.onScroll);
            document.removeEventListener('visibilitychange', this.onVisibilityChange);
            window.removeEventListener('pointermove', this.onPointerMove);
            document.documentElement.removeEventListener('pointerleave', this.onPointerLeave);

            if (typeof prefersReducedMotion.removeEventListener === 'function') {
                prefersReducedMotion.removeEventListener('change', this.onMotionPreferenceChange);
            } else if (typeof prefersReducedMotion.removeListener === 'function') {
                prefersReducedMotion.removeListener(this.onMotionPreferenceChange);
            }

            this.nodes.length = 0;
            this.links.length = 0;
            this.flows.length = 0;
            this.structures.length = 0;
            this.projectedNodes.length = 0;
            this.context.clearRect(0, 0, this.width, this.height);
        }

        onPointerMove(event) {
            if (this.reducedMotion) return;
            this.pointer.targetX = (event.clientX / Math.max(this.width, 1) - 0.5) * 2;
            this.pointer.targetY = (event.clientY / Math.max(this.height, 1) - 0.5) * 2;
            this.pointer.screenX = event.clientX;
            this.pointer.screenY = event.clientY;
            this.pointer.active = true;
        }

        onPointerLeave() {
            this.pointer.targetX = 0;
            this.pointer.targetY = 0;
            this.pointer.active = false;
        }

        onScroll() {
            const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            this.scrollTarget = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
        }

        onResize() {
            if (this.resizeFrame) cancelAnimationFrame(this.resizeFrame);
            this.resizeFrame = requestAnimationFrame(() => {
                this.resizeFrame = null;
                this.resize();
                if (this.reducedMotion) this.render(0, true);
            });
        }

        onVisibilityChange() {
            this.visible = !document.hidden;
            if (this.visible && !this.reducedMotion) {
                this.lastTimestamp = performance.now();
                this.start();
            } else {
                this.stop();
            }
        }

        onMotionPreferenceChange(event) {
            this.reducedMotion = event.matches;
            if (this.reducedMotion) {
                this.stop();
                this.pointer.targetX = 0;
                this.pointer.targetY = 0;
                this.scrollTarget = 0;
                this.scrollProgress = 0;
                this.render(0, true);
            } else if (this.visible) {
                this.lastTimestamp = performance.now();
                this.start();
            }
        }

        start() {
            if (this.running || !this.visible || this.reducedMotion) return;
            this.running = true;
            this.lastRenderTimestamp = 0;
            this.frameId = requestAnimationFrame(this.animate);
        }

        stop() {
            this.running = false;
            if (this.frameId) cancelAnimationFrame(this.frameId);
            this.frameId = null;
        }

        resize() {
            this.width = Math.max(window.innerWidth, 1);
            this.height = Math.max(window.innerHeight, 1);
            const mobile = this.width < 768 || this.coarsePointer;
            const dprCap = mobile ? 1 : 1.15;
            this.frameInterval = 1000 / (mobile ? 30 : 40);
            this.dpr = Math.min(window.devicePixelRatio || 1, dprCap);

            this.canvas.width = Math.round(this.width * this.dpr);
            this.canvas.height = Math.round(this.height * this.dpr);
            this.canvas.style.width = `${this.width}px`;
            this.canvas.style.height = `${this.height}px`;
            this.context.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            this.context.lineCap = 'round';
            this.context.lineJoin = 'round';
            this.canvas.dataset.renderer = 'active';

            this.buildScene();
        }

        createRandom(seed) {
            let value = seed >>> 0;
            return () => {
                value += 0x6D2B79F5;
                let result = value;
                result = Math.imul(result ^ (result >>> 15), result | 1);
                result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
                return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
            };
        }

        buildScene() {
            const random = this.createRandom(0x4B464356 + Math.round(this.width * 7 + this.height * 11));
            const mobile = this.width < 768 || this.coarsePointer;
            const areaBasedCount = Math.round((this.width * this.height) / (mobile ? 23000 : 28000));
            let nodeCount = mobile
                ? Math.min(Math.max(areaBasedCount, 24), 38)
                : Math.min(Math.max(areaBasedCount, 48), 78);

            if (this.lowPower) nodeCount = Math.round(nodeCount * 0.72);
            if (this.reducedMotion) nodeCount = Math.round(nodeCount * 0.72);

            this.nodes.length = 0;
            this.links.length = 0;
            this.flows.length = 0;
            this.projectedNodes.length = nodeCount;

            for (let index = 0; index < nodeCount; index += 1) {
                const sideBias = random() < 0.58;
                let x = (random() * 2 - 1) * 2.45;
                if (sideBias && Math.abs(x) < 0.72) {
                    x += x < 0 ? -0.9 : 0.9;
                }

                this.nodes.push({
                    x,
                    y: (random() * 2 - 1) * 1.7,
                    z: (random() * 2 - 1) * 1.55,
                    phase: random() * Math.PI * 2,
                    drift: 0.16 + random() * 0.22,
                    size: 0.8 + random() * 1.45,
                    accent: random() < 0.18,
                    teal: random() < 0.48
                });
            }

            // Stable sparse topology: each node connects only to a few nearby neighbors.
            const linkKeys = new Set();
            const maxNeighbors = mobile ? 1 : 2;
            const maximumDistance = mobile ? 1.42 : 1.55;

            for (let index = 0; index < this.nodes.length; index += 1) {
                const origin = this.nodes[index];
                const candidates = [];

                for (let otherIndex = index + 1; otherIndex < this.nodes.length; otherIndex += 1) {
                    const target = this.nodes[otherIndex];
                    const dx = origin.x - target.x;
                    const dy = origin.y - target.y;
                    const dz = origin.z - target.z;
                    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                    if (distance < maximumDistance) {
                        candidates.push({ index: otherIndex, distance });
                    }
                }

                candidates.sort((a, b) => a.distance - b.distance);
                candidates.slice(0, maxNeighbors).forEach((candidate) => {
                    const key = `${index}:${candidate.index}`;
                    if (!linkKeys.has(key)) {
                        linkKeys.add(key);
                        this.links.push({
                            a: index,
                            b: candidate.index,
                            strength: 1 - candidate.distance / maximumDistance,
                            teal: random() < 0.52
                        });
                    }
                });
            }

            const flowCount = mobile ? Math.min(4, this.links.length) : Math.min(10, this.links.length);
            for (let index = 0; index < flowCount; index += 1) {
                this.flows.push({
                    linkIndex: Math.floor(random() * this.links.length),
                    offset: random(),
                    speed: 0.085 + random() * 0.11,
                    teal: random() < 0.55
                });
            }

            this.structures = [
                { x: mobile ? 1.42 : 1.72, y: -0.66, z: 0.18, size: mobile ? 0.32 : 0.40, phase: 0.8, teal: true }
            ];
        }

        rotatePoint(x, y, z, yaw, pitch, roll = 0) {
            const cosY = Math.cos(yaw);
            const sinY = Math.sin(yaw);
            const x1 = x * cosY - z * sinY;
            const z1 = x * sinY + z * cosY;

            const cosX = Math.cos(pitch);
            const sinX = Math.sin(pitch);
            const y1 = y * cosX - z1 * sinX;
            const z2 = y * sinX + z1 * cosX;

            const cosZ = Math.cos(roll);
            const sinZ = Math.sin(roll);
            return {
                x: x1 * cosZ - y1 * sinZ,
                y: x1 * sinZ + y1 * cosZ,
                z: z2
            };
        }

        project(point, yaw, pitch, centerX, centerY, cameraDistance, roll = 0) {
            const rotated = this.rotatePoint(point.x, point.y, point.z, yaw, pitch, roll);
            const depth = rotated.z + cameraDistance;
            if (depth <= 0.2) return null;

            const focalLength = Math.min(this.width, this.height) * 1.08;
            const perspective = focalLength / depth;
            return {
                x: centerX + rotated.x * perspective,
                y: centerY + rotated.y * perspective,
                depth,
                perspective,
                visibility: Math.min(Math.max((6.4 - depth) / 4.6, 0.08), 1)
            };
        }

        drawGrid(time, scroll) {
            const context = this.context;
            const horizon = this.height * (0.68 + scroll * 0.018);
            const centerX = this.width * (0.54 + this.pointer.x * 0.012);
            const bottom = this.height + 1;
            const gridAlpha = this.reducedMotion ? 0.065 : 0.078 + scroll * 0.018;

            context.save();
            context.lineWidth = 0.65;
            context.strokeStyle = `rgba(6, 182, 212, ${gridAlpha})`;

            for (let index = -8; index <= 8; index += 1) {
                const horizonOffset = index * Math.max(this.width * 0.012, 10);
                const bottomOffset = index * Math.max(this.width * 0.095, 58);
                context.beginPath();
                context.moveTo(centerX + horizonOffset, horizon);
                context.lineTo(centerX + bottomOffset, bottom);
                context.stroke();
            }

            const phase = this.reducedMotion ? 0 : (time * 0.085 + scroll * 0.8) % 1;
            for (let index = 0; index < 11; index += 1) {
                const normalized = ((index / 11) + phase) % 1;
                const eased = normalized * normalized;
                const y = horizon + (bottom - horizon) * eased;
                const alpha = gridAlpha * (0.35 + normalized * 0.8);
                context.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
                context.beginPath();
                context.moveTo(0, y);
                context.lineTo(this.width, y);
                context.stroke();
            }

            context.restore();
        }

        drawStructures(time, yaw, pitch, centerX, centerY, cameraDistance) {
            const vertices = [
                { x: 0, y: -1, z: 0 },
                { x: 1, y: 0, z: 0 },
                { x: 0, y: 1, z: 0 },
                { x: -1, y: 0, z: 0 },
                { x: 0, y: 0, z: 1 },
                { x: 0, y: 0, z: -1 }
            ];
            const edges = [
                [0, 1], [0, 3], [0, 4], [0, 5],
                [2, 1], [2, 3], [2, 4], [2, 5],
                [1, 4], [1, 5], [3, 4], [3, 5]
            ];

            this.structures.forEach((structure) => {
                const structureTime = this.reducedMotion ? structure.phase : time * 0.08 + structure.phase;
                const projected = vertices.map((vertex) => {
                    const local = this.rotatePoint(
                        vertex.x * structure.size,
                        vertex.y * structure.size,
                        vertex.z * structure.size,
                        structureTime,
                        structureTime * 0.67,
                        structureTime * 0.28
                    );
                    return this.project({
                        x: local.x + structure.x,
                        y: local.y + structure.y,
                        z: local.z + structure.z
                    }, yaw, pitch, centerX, centerY, cameraDistance);
                });

                const color = structure.teal ? '20, 184, 166' : '6, 182, 212';
                this.context.save();
                this.context.lineWidth = 0.95;
                this.context.strokeStyle = `rgba(${color}, ${this.reducedMotion ? 0.15 : 0.21})`;
                this.context.shadowBlur = 0;
                edges.forEach(([a, b]) => {
                    if (!projected[a] || !projected[b]) return;
                    this.context.beginPath();
                    this.context.moveTo(projected[a].x, projected[a].y);
                    this.context.lineTo(projected[b].x, projected[b].y);
                    this.context.stroke();
                });
                this.context.restore();
            });
        }

        render(timestamp, staticFrame = false) {
            const context = this.context;
            if (!context) return;

            if (!staticFrame) {
                const delta = this.lastTimestamp ? Math.min((timestamp - this.lastTimestamp) / 1000, 0.05) : 0;
                this.lastTimestamp = timestamp;
                this.elapsed += delta;
            }

            const time = this.reducedMotion || staticFrame ? 0 : this.elapsed;
            const interpolation = this.reducedMotion ? 1 : 0.055;
            this.pointer.x += (this.pointer.targetX - this.pointer.x) * interpolation;
            this.pointer.y += (this.pointer.targetY - this.pointer.y) * interpolation;
            this.scrollProgress += (this.scrollTarget - this.scrollProgress) * (this.reducedMotion ? 1 : 0.045);

            context.clearRect(0, 0, this.width, this.height);
            this.drawGrid(time, this.scrollProgress);

            const yaw = this.pointer.x * 0.09 + this.scrollProgress * 0.19 + time * 0.032;
            const pitch = this.pointer.y * 0.055 - this.scrollProgress * 0.048 + Math.sin(time * 0.18) * 0.018;
            const centerX = this.width * (this.width < 768 ? 0.52 : 0.56) + this.pointer.x * 11;
            const centerY = this.height * 0.46 + this.pointer.y * 7 - this.scrollProgress * 14;
            const cameraDistance = 4.95 - this.scrollProgress * 0.22;

            for (let index = 0; index < this.nodes.length; index += 1) {
                const node = this.nodes[index];
                const driftX = this.reducedMotion ? 0 : Math.sin(time * node.drift + node.phase) * 0.055;
                const driftY = this.reducedMotion ? 0 : Math.cos(time * node.drift * 0.82 + node.phase) * 0.04;
                const driftZ = this.reducedMotion ? 0 : Math.sin(time * node.drift * 0.61 + node.phase) * 0.035;
                const projected = this.project({
                    x: node.x + driftX,
                    y: node.y + driftY,
                    z: node.z + driftZ
                }, yaw, pitch, centerX, centerY, cameraDistance);

                if (projected && this.pointer.active && !this.reducedMotion && !this.coarsePointer) {
                    const dx = projected.x - this.pointer.screenX;
                    const dy = projected.y - this.pointer.screenY;
                    const distanceSquared = dx * dx + dy * dy;
                    const radius = 145;
                    if (distanceSquared < radius * radius) {
                        const distance = Math.sqrt(distanceSquared) || 1;
                        const force = (1 - distance / radius) * 6 * projected.visibility;
                        projected.x += (dx / distance) * force;
                        projected.y += (dy / distance) * force;
                    }
                }

                this.projectedNodes[index] = projected;
            }

            // Connection layer.
            context.save();
            this.links.forEach((link) => {
                const a = this.projectedNodes[link.a];
                const b = this.projectedNodes[link.b];
                if (!a || !b) return;

                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const maximumScreenDistance = Math.min(this.width * 0.23, 225);
                if (dx * dx + dy * dy > maximumScreenDistance * maximumScreenDistance) return;

                const visibility = Math.min(a.visibility, b.visibility);
                const alpha = (0.065 + link.strength * 0.16) * visibility;
                const color = link.teal ? '20, 184, 166' : '6, 182, 212';
                context.strokeStyle = `rgba(${color}, ${alpha})`;
                context.lineWidth = 0.7 + link.strength * 0.55;
                context.beginPath();
                context.moveTo(a.x, a.y);
                context.lineTo(b.x, b.y);
                context.stroke();
            });
            context.restore();

            this.drawStructures(time, yaw, pitch, centerX, centerY, cameraDistance);

            // Data-flow particles moving through selected connections.
            context.save();
            this.flows.forEach((flow) => {
                const link = this.links[flow.linkIndex];
                if (!link) return;
                const a = this.projectedNodes[link.a];
                const b = this.projectedNodes[link.b];
                if (!a || !b) return;

                const progress = this.reducedMotion
                    ? flow.offset
                    : (flow.offset + time * flow.speed + this.scrollProgress * 0.15) % 1;
                const x = a.x + (b.x - a.x) * progress;
                const y = a.y + (b.y - a.y) * progress;
                const visibility = Math.min(a.visibility, b.visibility);
                const color = flow.teal ? '20, 184, 166' : '6, 182, 212';

                context.fillStyle = `rgba(${color}, ${0.48 + visibility * 0.34})`;
                context.shadowColor = `rgba(${color}, 0.48)`;
                context.shadowBlur = 4;
                context.beginPath();
                context.arc(x, y, 1.05 + visibility * 0.85, 0, Math.PI * 2);
                context.fill();
            });
            context.restore();

            // Node layer.
            context.save();
            for (let index = 0; index < this.nodes.length; index += 1) {
                const node = this.nodes[index];
                const point = this.projectedNodes[index];
                if (!point) continue;

                const color = node.teal ? '20, 184, 166' : '6, 182, 212';
                const radius = Math.min(Math.max(node.size * point.perspective * 0.0085, 0.75), 3.15);
                const pulse = this.reducedMotion ? 1 : 0.88 + Math.sin(time * 0.7 + node.phase) * 0.12;
                const alpha = (node.accent ? 0.48 : 0.24) + point.visibility * (node.accent ? 0.36 : 0.28);

                if (node.accent) {
                    context.shadowColor = `rgba(${color}, 0.48)`;
                    context.shadowBlur = 5;
                } else {
                    context.shadowBlur = 0;
                }

                context.fillStyle = `rgba(${color}, ${alpha})`;
                context.beginPath();
                context.arc(point.x, point.y, radius * pulse, 0, Math.PI * 2);
                context.fill();
            }
            context.restore();
        }

        animate(timestamp) {
            if (!this.running) return;

            if (!this.lastRenderTimestamp || timestamp - this.lastRenderTimestamp >= this.frameInterval) {
                this.lastRenderTimestamp = timestamp;
                this.render(timestamp, false);
                this.frameCounter += 1;
            }

            this.frameId = requestAnimationFrame(this.animate);
        }
    }

    const background = new TechnologyBackground(document.getElementById('tech-canvas'));
    background.init();
    window.addEventListener('pagehide', () => background.destroy(), { once: true });
})();
