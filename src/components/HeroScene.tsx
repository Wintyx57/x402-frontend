import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HeroSceneProps {
  hoverState: 'none' | 'provider' | 'agent';
}

export default function HeroScene({ hoverState }: HeroSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ hoverState, flowDir: -1 as number });

  useEffect(() => {
    stateRef.current.hoverState = hoverState;
    stateRef.current.flowDir = hoverState === 'provider' ? 1 : -1;
  }, [hoverState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let disposed = false;
    let cleanupFn = () => {};

    import('three/examples/jsm/postprocessing/EffectComposer.js').then(async ({ EffectComposer }) => {
      if (disposed) return;

      const [{ RenderPass }, { UnrealBloomPass }, { ShaderPass }] = await Promise.all([
        import('three/examples/jsm/postprocessing/RenderPass.js'),
        import('three/examples/jsm/postprocessing/UnrealBloomPass.js'),
        import('three/examples/jsm/postprocessing/ShaderPass.js'),
      ]);
      if (disposed) return;

      // === RENDERER ===
      const parent = canvas.parentElement;
      const w = parent ? parent.clientWidth : window.innerWidth;
      const h = parent ? parent.clientHeight : window.innerHeight;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
      renderer.setSize(w, h);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.0;

      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x030303, 0.06);

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.set(0, 0, 14);

      // === POST-PROCESSING ===
      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      // Bloom
      const bloom = new UnrealBloomPass(new THREE.Vector2(w, h), 0.25, 0.5, 0.7);
      composer.addPass(bloom);

      // Vignette + Chromatic Aberration
      const vignetteShader = {
        uniforms: {
          tDiffuse: { value: null },
          darkness: { value: 1.2 },
          offset: { value: 1.0 },
        },
        vertexShader: `varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
        fragmentShader: `uniform sampler2D tDiffuse;uniform float darkness;uniform float offset;varying vec2 vUv;
          void main(){
            vec2 uv=vUv;
            float aberr=0.002;
            float r=texture2D(tDiffuse,vec2(uv.x+aberr,uv.y)).r;
            float g=texture2D(tDiffuse,uv).g;
            float b=texture2D(tDiffuse,vec2(uv.x-aberr,uv.y)).b;
            vec3 color=vec3(r,g,b);
            vec2 center=uv-0.5;
            float dist=length(center);
            float vig=smoothstep(offset,offset-0.5,dist*darkness);
            gl_FragColor=vec4(color*vig,1.0);
          }`,
      };
      composer.addPass(new ShaderPass(vignetteShader));

      // === LIGHTS ===
      scene.add(new THREE.AmbientLight(0x223344, 0.8));
      const frontLight = new THREE.DirectionalLight(0xccddff, 0.6);
      frontLight.position.set(0, 2, 10);
      scene.add(frontLight);
      const pL = new THREE.PointLight(0xff9900, 2.5, 25);
      pL.position.set(-7, 3, 6);
      scene.add(pL);
      const aL = new THREE.PointLight(0x3b82f6, 2.5, 25);
      aL.position.set(7, 3, 6);
      scene.add(aL);
      const cL = new THREE.PointLight(0x8b5cf6, 0.8, 18);
      cL.position.set(0, 0, 8);
      scene.add(cL);

      // === PORTAL RING ===
      const portalGeo = new THREE.TorusGeometry(1.3, 0.025, 16, 80);
      const portalMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.7,
      });
      const portal = new THREE.Mesh(portalGeo, portalMat);
      portal.position.set(0, 0, 1);
      scene.add(portal);

      const portalOuterMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x8b5cf6,
        emissiveIntensity: 0.3,
        transparent: true,
        opacity: 0.3,
      });
      const portalOuter = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.015, 16, 80), portalOuterMat);
      portalOuter.position.set(0, 0, 1);
      scene.add(portalOuter);

      // Portal glow sprite
      const pGlowC = document.createElement('canvas');
      pGlowC.width = 256;
      pGlowC.height = 256;
      const pgx = pGlowC.getContext('2d')!;
      const pgrd = pgx.createRadialGradient(128, 128, 0, 128, 128, 128);
      pgrd.addColorStop(0, 'rgba(139,92,246,0.2)');
      pgrd.addColorStop(0.3, 'rgba(139,92,246,0.08)');
      pgrd.addColorStop(1, 'rgba(139,92,246,0)');
      pgx.fillStyle = pgrd;
      pgx.fillRect(0, 0, 256, 256);
      const pGlowTex = new THREE.CanvasTexture(pGlowC);
      const pGlowMat = new THREE.SpriteMaterial({
        map: pGlowTex,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const pGlow = new THREE.Sprite(pGlowMat);
      pGlow.scale.set(6, 6, 1);
      pGlow.position.set(0, 0, 1);
      scene.add(pGlow);

      let portalPulse = 0;

      // === USDC TOKEN FACE TEXTURE ===
      function makeUSDCFace(res: number): THREE.CanvasTexture {
        const c = document.createElement('canvas');
        c.width = res;
        c.height = res;
        const x = c.getContext('2d')!;
        const cx = res / 2;
        const r = res * 0.46;

        // Solid USDC blue background
        x.beginPath();
        x.arc(cx, cx, r, 0, Math.PI * 2);
        const bg = x.createRadialGradient(cx, cx * 0.7, 0, cx, cx, r);
        bg.addColorStop(0, '#4a9ee8');
        bg.addColorStop(0.7, '#3388d4');
        bg.addColorStop(1, '#2570b8');
        x.fillStyle = bg;
        x.fill();

        // Subtle edge shadow
        x.beginPath();
        x.arc(cx, cx, r, 0, Math.PI * 2);
        x.strokeStyle = 'rgba(0,0,0,0.3)';
        x.lineWidth = res * 0.008;
        x.stroke();

        // Outer raised ring
        x.beginPath();
        x.arc(cx, cx, r * 0.92, 0, Math.PI * 2);
        x.strokeStyle = 'rgba(255,255,255,0.12)';
        x.lineWidth = res * 0.012;
        x.stroke();
        x.beginPath();
        x.arc(cx, cx, r * 0.88, 0, Math.PI * 2);
        x.strokeStyle = 'rgba(0,0,0,0.1)';
        x.lineWidth = res * 0.006;
        x.stroke();

        // Inner decorative ring
        x.beginPath();
        x.arc(cx, cx, r * 0.62, 0, Math.PI * 2);
        x.strokeStyle = 'rgba(255,255,255,0.08)';
        x.lineWidth = res * 0.008;
        x.stroke();

        // "USDC" text at top
        x.save();
        x.font = `bold ${res * 0.07}px Inter,sans-serif`;
        x.textAlign = 'center';
        x.fillStyle = 'rgba(255,255,255,0.75)';
        x.fillText('USDC', cx, cx - r * 0.42);
        x.restore();

        // Dollar sign — shadow
        x.font = `900 ${res * 0.38}px Inter,sans-serif`;
        x.textAlign = 'center';
        x.textBaseline = 'middle';
        x.fillStyle = 'rgba(0,0,0,0.3)';
        x.fillText('$', cx + res * 0.005, cx + res * 0.02);
        // Highlight
        x.fillStyle = 'rgba(255,255,255,0.9)';
        x.fillText('$', cx, cx + res * 0.008);

        // Vertical bars through $ (embossed)
        const barW = res * 0.018;
        const barGap = res * 0.045;
        x.fillStyle = 'rgba(0,0,0,0.15)';
        x.fillRect(cx - barGap - barW / 2 + 1, cx - r * 0.28 + 1, barW, r * 0.56);
        x.fillRect(cx + barGap - barW / 2 + 1, cx - r * 0.28 + 1, barW, r * 0.56);
        x.fillStyle = 'rgba(255,255,255,0.7)';
        x.fillRect(cx - barGap - barW / 2, cx - r * 0.28, barW, r * 0.56);
        x.fillRect(cx + barGap - barW / 2, cx - r * 0.28, barW, r * 0.56);

        // "STABLECOIN" text at bottom
        x.font = `600 ${res * 0.045}px Inter,sans-serif`;
        x.textAlign = 'center';
        x.fillStyle = 'rgba(255,255,255,0.45)';
        x.fillText('STABLECOIN', cx, cx + r * 0.55);

        const tex = new THREE.CanvasTexture(c);
        tex.anisotropy = 4;
        return tex;
      }

      let usdcFaceTex = makeUSDCFace(512);

      // Shared glow texture
      const sharedGlowC = document.createElement('canvas');
      sharedGlowC.width = 64;
      sharedGlowC.height = 64;
      const sharedGlowCtx = sharedGlowC.getContext('2d')!;
      const sharedGlowGrad = sharedGlowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      sharedGlowGrad.addColorStop(0, 'rgba(39,117,202,0.06)');
      sharedGlowGrad.addColorStop(1, 'rgba(39,117,202,0)');
      sharedGlowCtx.fillStyle = sharedGlowGrad;
      sharedGlowCtx.fillRect(0, 0, 64, 64);
      const sharedGlowTex = new THREE.CanvasTexture(sharedGlowC);

      // === TOKEN CLASS ===
      class Token {
        big: boolean;
        s: number;
        coin: THREE.Mesh;
        face: THREE.Mesh;
        back: THREE.Mesh;
        glow: THREE.Sprite;
        trail: THREE.Line;
        grp: THREE.Group;
        cm: THREE.MeshStandardMaterial;
        fm: THREE.MeshStandardMaterial;
        bm: THREE.MeshStandardMaterial;
        gm: THREE.SpriteMaterial;
        tm: THREE.LineBasicMaterial;
        trailArr: Float32Array;
        maxTrail: number;
        vx = 0;
        vy = 0;
        wp = 0;
        ws = 0;
        rs = 0;
        life = 0;
        maxLife = 0;
        crossed = false;

        constructor(big: boolean) {
          this.big = big;
          const s = big ? 0.4 + Math.random() * 0.2 : 0.15 + Math.random() * 0.15;
          this.s = s;
          const thick = s * 0.2;

          // Beveled coin body using LatheGeometry
          const profile = [
            new THREE.Vector2(0, -thick / 2),
            new THREE.Vector2(s * 0.92, -thick / 2),
            new THREE.Vector2(s * 0.97, -thick / 2 + thick * 0.15),
            new THREE.Vector2(s, -thick * 0.15),
            new THREE.Vector2(s, thick * 0.15),
            new THREE.Vector2(s * 0.97, thick / 2 - thick * 0.15),
            new THREE.Vector2(s * 0.92, thick / 2),
            new THREE.Vector2(0, thick / 2),
          ];
          const latheGeo = new THREE.LatheGeometry(profile, 48);
          latheGeo.computeVertexNormals();

          const coinMat = new THREE.MeshStandardMaterial({
            color: big ? 0x3388dd : 0x2a75c0,
            metalness: 0.3,
            roughness: 0.4,
            emissive: 0x2775ca,
            emissiveIntensity: big ? 0.15 : 0.1,
            transparent: true,
            opacity: 0.95,
          });
          this.coin = new THREE.Mesh(latheGeo, coinMat);
          this.coin.rotation.x = Math.PI / 2;

          // Front face
          const faceGeo = new THREE.CircleGeometry(s * 0.91, 48);
          const faceMat = new THREE.MeshStandardMaterial({
            map: usdcFaceTex,
            metalness: 0.25,
            roughness: 0.45,
            emissive: 0x1a5090,
            emissiveIntensity: big ? 0.2 : 0.12,
            transparent: true,
            opacity: big ? 1 : 0.9,
          });
          this.face = new THREE.Mesh(faceGeo, faceMat);
          this.face.position.z = thick / 2 + 0.001;

          // Back face
          const backMat = new THREE.MeshStandardMaterial({
            map: usdcFaceTex,
            metalness: 0.25,
            roughness: 0.45,
            emissive: 0x1a5090,
            emissiveIntensity: big ? 0.15 : 0.08,
            transparent: true,
            opacity: big ? 0.9 : 0.75,
          });
          this.back = new THREE.Mesh(faceGeo.clone(), backMat);
          this.back.position.z = -(thick / 2 + 0.001);
          this.back.rotation.y = Math.PI;

          // Glow sprite (shared texture)
          const glowMat = new THREE.SpriteMaterial({
            map: sharedGlowTex,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: big ? 1 : 0.4,
          });
          this.glow = new THREE.Sprite(glowMat);
          this.glow.scale.set(s * 3, s * 3, 1);

          // Trail (pre-allocated buffer)
          const maxTrail = big ? 16 : 10;
          this.maxTrail = maxTrail;
          this.trailArr = new Float32Array(maxTrail * 3);
          const trailGeo = new THREE.BufferGeometry();
          trailGeo.setAttribute('position', new THREE.BufferAttribute(this.trailArr, 3));
          trailGeo.setDrawRange(0, maxTrail);
          const trailMat = new THREE.LineBasicMaterial({
            color: 0x2775ca,
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          this.trail = new THREE.Line(trailGeo, trailMat);

          this.grp = new THREE.Group();
          this.grp.add(this.coin);
          this.grp.add(this.face);
          this.grp.add(this.back);
          this.grp.add(this.glow);
          scene.add(this.grp);
          scene.add(this.trail);

          this.cm = coinMat;
          this.fm = faceMat;
          this.bm = backMat;
          this.gm = glowMat;
          this.tm = trailMat;

          this.reset();
        }

        reset() {
          const d = stateRef.current.flowDir;
          this.grp.position.x = d < 0 ? 5 + Math.random() * 4 : -5 - Math.random() * 4;
          this.grp.position.y = (Math.random() - 0.5) * 10;
          this.grp.position.z = -2 + (Math.random() - 0.5) * 5;
          this.vx = d * (this.big ? 0.009 + Math.random() * 0.005 : 0.014 + Math.random() * 0.012);
          this.vy = (Math.random() - 0.5) * 0.003;
          this.wp = Math.random() * Math.PI * 2;
          this.ws = 0.01 + Math.random() * 0.01;
          this.rs = (Math.random() - 0.5) * 0.02;
          this.life = 0;
          this.maxLife = this.big ? 350 + Math.random() * 200 : 220 + Math.random() * 180;
          this.crossed = false;
          const p = this.grp.position;
          for (let i = 0; i < this.maxTrail; i++) {
            this.trailArr[i * 3] = p.x;
            this.trailArr[i * 3 + 1] = p.y;
            this.trailArr[i * 3 + 2] = p.z;
          }
        }

        update(spd: number) {
          const tv = stateRef.current.flowDir * (this.big ? 0.012 : 0.018) * spd;
          this.vx += (tv - this.vx) * 0.02;
          this.grp.position.x += this.vx;

          // Funnel effect: tokens converge toward portal center as they approach x=0
          const distToCenter = Math.abs(this.grp.position.x);
          const funnelZone = 4;
          if (distToCenter < funnelZone) {
            const funnelStrength = 1 - distToCenter / funnelZone;
            const pullY = -this.grp.position.y * funnelStrength * 0.02;
            const pullZ = (1 - this.grp.position.z) * funnelStrength * 0.015;
            this.grp.position.y += pullY;
            this.grp.position.z += pullZ;
          }

          this.grp.position.y += this.vy + Math.sin(this.wp) * 0.006;
          this.grp.position.z += Math.cos(this.wp * 0.7) * 0.003;
          this.wp += this.ws;
          this.grp.rotation.y += this.rs;
          this.grp.rotation.z = Math.sin(this.wp) * 0.12;
          this.life++;

          // Trail update (shift buffer, no allocation)
          const ta = this.trailArr;
          for (let i = this.maxTrail - 1; i > 0; i--) {
            ta[i * 3] = ta[(i - 1) * 3];
            ta[i * 3 + 1] = ta[(i - 1) * 3 + 1];
            ta[i * 3 + 2] = ta[(i - 1) * 3 + 2];
          }
          ta[0] = this.grp.position.x;
          ta[1] = this.grp.position.y;
          ta[2] = this.grp.position.z;
          this.trail.geometry.attributes.position.needsUpdate = true;

          // Color by position
          const t = Math.max(0, Math.min(1, (this.grp.position.x + 7) / 14));
          const col = new THREE.Color();
          if (t < 0.5) {
            const sv = t * 2;
            col.setRGB(1 - sv * 0.85, 0.6 - sv * 0.18, sv * 0.8);
          } else {
            const sv = (t - 0.5) * 2;
            col.setRGB(0.15 + sv * 0.22, 0.45 + sv * 0.2, 0.8 + sv * 0.18);
          }
          const mutedCol = col.clone().multiplyScalar(0.55);
          this.cm.color.lerp(mutedCol, 0.03);
          this.cm.emissive.lerp(new THREE.Color(col.r * 0.05, col.g * 0.05, col.b * 0.05), 0.03);
          this.tm.color.lerp(col, 0.04);

          // Alpha fade in/out
          const a = Math.min(1, this.life / 25) * Math.min(1, (this.maxLife - this.life) / 35);
          this.cm.opacity = a * 0.95;
          this.fm.opacity = a * (this.big ? 0.95 : 0.8);
          this.bm.opacity = a * (this.big ? 0.85 : 0.65);
          this.gm.opacity = a * 0.3;
          this.tm.opacity = a * 0.08;

          // Portal crossing
          if (Math.abs(this.grp.position.x) < 0.8 && !this.crossed) {
            this.crossed = true;
            portalPulse = Math.min(1, portalPulse + 0.03);
            this.cm.emissiveIntensity = this.big ? 0.1 : 0.05;
            this.glow.scale.setScalar(this.s * 3.5);
          } else {
            this.cm.emissiveIntensity +=
              ((this.big ? 0.05 : 0.02) - this.cm.emissiveIntensity) * 0.05;
            this.glow.scale.setScalar(this.s * 2 + Math.sin(this.life * 0.05) * 0.1);
          }

          if (this.life > this.maxLife || this.grp.position.x < -9 || this.grp.position.x > 9) {
            this.reset();
          }
        }

        dispose() {
          scene.remove(this.grp);
          scene.remove(this.trail);
          this.coin.geometry.dispose();
          this.face.geometry.dispose();
          this.back.geometry.dispose();
          this.trail.geometry.dispose();
          this.cm.dispose();
          this.fm.dispose();
          this.bm.dispose();
          this.gm.dispose();
          this.tm.dispose();
        }
      }

      const tokens: Token[] = [];
      for (let i = 0; i < 22; i++) tokens.push(new Token(false));
      for (let i = 0; i < 8; i++) tokens.push(new Token(true));

      // Re-render USDC texture once fonts are loaded for crisp text
      document.fonts.ready.then(() => {
        if (disposed) return;
        usdcFaceTex = makeUSDCFace(512);
        tokens.forEach((t) => {
          t.fm.map = usdcFaceTex;
          t.bm.map = usdcFaceTex;
          t.fm.needsUpdate = true;
          t.bm.needsUpdate = true;
        });
      });

      // === DUST ===
      const dustN = 300;
      const dg = new THREE.BufferGeometry();
      const dp = new Float32Array(dustN * 3);
      for (let i = 0; i < dustN; i++) {
        dp[i * 3] = (Math.random() - 0.5) * 24;
        dp[i * 3 + 1] = (Math.random() - 0.5) * 16;
        dp[i * 3 + 2] = (Math.random() - 0.5) * 12;
      }
      dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
      const dm = new THREE.PointsMaterial({
        color: 0x4a6fa5,
        size: 0.025,
        transparent: true,
        opacity: 0.25,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        sizeAttenuation: true,
      });
      const dust = new THREE.Points(dg, dm);
      scene.add(dust);

      // === MOUSE TRACKING ===
      let mxT = 0;
      let myT = 0;
      let mx = 0;
      let my = 0;
      const onMouseMove = (e: MouseEvent) => {
        mxT = (e.clientX / innerWidth - 0.5) * 2;
        myT = (e.clientY / innerHeight - 0.5) * 2;
      };
      document.addEventListener('mousemove', onMouseMove);

      // === RESIZE ===
      const onResize = () => {
        const pw = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
        const ph = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
        camera.aspect = pw / ph;
        camera.updateProjectionMatrix();
        renderer.setSize(pw, ph);
        composer.setSize(pw, ph);
      };
      window.addEventListener('resize', onResize);

      // === ANIMATE ===
      const clock = new THREE.Clock();
      let animId = 0;

      function animate() {
        animId = requestAnimationFrame(animate);
        if (prefersReducedMotion) {
          composer.render();
          return;
        }
        const t = clock.getElapsedTime();
        mx += (mxT - mx) * 0.04;
        my += (myT - my) * 0.04;
        camera.position.x = mx * 1;
        camera.position.y = my * 0.5;
        camera.lookAt(0, 0, 0);

        const hov =
          stateRef.current.hoverState === 'provider' || stateRef.current.hoverState === 'agent';
        const spd = hov ? 1.35 : 1;
        pL.intensity = stateRef.current.hoverState === 'provider' ? 3.5 : 2.5;
        aL.intensity = stateRef.current.hoverState === 'agent' ? 3.5 : 2.5;

        tokens.forEach((tk) => tk.update(spd));

        // Portal animation
        portal.rotation.z = t * 0.3;
        portalOuter.rotation.z = -t * 0.15;
        portalMat.emissiveIntensity = 0.5 + portalPulse * 1;
        portalMat.opacity = 0.6 + portalPulse * 0.3;
        portalOuterMat.emissiveIntensity = 0.2 + portalPulse * 0.5;
        portalOuterMat.opacity = 0.25 + portalPulse * 0.2;
        pGlowMat.opacity = 0.35 + portalPulse * 0.5;
        pGlow.scale.setScalar(5 + portalPulse * 3);
        portalPulse *= 0.94;

        // Dust animation
        const dps = dust.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < dustN; i++) {
          dps[i * 3] += Math.sin(t + i) * 0.0008;
          dps[i * 3 + 1] += Math.cos(t * 0.7 + i) * 0.0004;
        }
        dust.geometry.attributes.position.needsUpdate = true;
        dust.rotation.y = t * 0.015;

        composer.render();
      }

      animate();

      cleanupFn = () => {
        cancelAnimationFrame(animId);
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);

        tokens.forEach((tk) => tk.dispose());

        // Dispose portal assets
        portalGeo.dispose();
        portalMat.dispose();
        portalOuterMat.dispose();
        portalOuter.geometry.dispose();
        pGlowTex.dispose();
        pGlowMat.dispose();

        // Dispose dust
        dg.dispose();
        dm.dispose();

        // Dispose shared textures
        sharedGlowTex.dispose();
        usdcFaceTex.dispose();

        // Dispose lights (no geometry/material, just remove from scene)
        scene.clear();

        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanupFn();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 z-[1]"
    />
  );
}
