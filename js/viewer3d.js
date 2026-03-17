/* ============================================================
   PODTS — viewer3d.js  v2
   Three.js 3D garment viewer — proper ExtrudeGeometry approach
   ============================================================ */
(function () {
    'use strict';

    const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';

    let THREE = null;
    let renderer, scene, camera;
    let garmentGroup = null;
    let printMesh    = null;
    let printTexture = null;
    let printCanvas  = null;

    let rotY = 0.3, rotX = 0.05;
    let targetRotY = 0.3, targetRotX = 0.05;
    let isDragging = false, isAutoRotating = true;
    let prevMouse  = { x: 0, y: 0 };
    let cameraZ = 3.2, targetCameraZ = 3.2;
    const MIN_Z = 2.0, MAX_Z = 5.0;
    let pinchDist = 0;
    let currentFace = 'front';
    let rafId = null;
    let mountEl = null;
    let idleTimer = null;
    let builtGarmentId = null;
    let builtColor     = null;

    /* ── BOOT ────────────────────────────────────────────────── */
    function boot() {
        if (builtGarmentId !== null) return;
        if (window.THREE) { THREE = window.THREE; setup(); return; }
        const s = document.createElement('script');
        s.src = THREE_URL;
        s.onload = () => { THREE = window.THREE; setup(); };
        document.head.appendChild(s);
    }

    /* ── SCENE SETUP ─────────────────────────────────────────── */
    function setup() {
        mountEl = document.getElementById('viewer3d-mount');
        if (!mountEl) return;
        const W = mountEl.clientWidth  || 480;
        const H = mountEl.clientHeight || 440;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(W, H);
        renderer.setClearColor(0x1e1e24, 1);  // dark neutral — works for any garment colour
        mountEl.appendChild(renderer.domElement);

        scene  = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(36, W / H, 0.01, 1000);
        camera.position.set(0, 0, cameraZ);

        scene.add(new THREE.AmbientLight(0xffffff, 0.65));
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(3, 5, 4); scene.add(key);
        const fill = new THREE.DirectionalLight(0xfff0e0, 0.5);
        fill.position.set(-4, 2, 3); scene.add(fill);
        const rim = new THREE.DirectionalLight(0xddeeff, 0.35);
        rim.position.set(0, -3, -4); scene.add(rim);

        printCanvas = document.createElement('canvas');
        printCanvas.width = printCanvas.height = 512;
        printTexture = new THREE.CanvasTexture(printCanvas);
        window.printTexture = printTexture;  // ← ADD THIS
        window.printCanvas  = printCanvas;   // ← ADD THIS

        if (!window._customGLBEnabled) {
            buildGarment();
        } else {
            // Reserve the group slot so update() doesn't rebuild procedural geometry
            garmentGroup = new THREE.Group();
            scene.add(garmentGroup);
            window._viewer3dProceduralGroup = garmentGroup;
            builtGarmentId = getGarmentId();   // ← prevents update() from calling buildGarment()
            builtColor     = getColor();
        }
        bindEvents();
        new ResizeObserver(onResize).observe(mountEl);
        loop();

        // Expose scene ref so the GLB loader extension can access it
        window._viewer3dScene = scene;

        // Trigger custom model load now that scene is ready
        if (window._tryLoadCustomModelWhenReady) {
            window._tryLoadCustomModelWhenReady();
        }
    }

    /* ── HELPERS ─────────────────────────────────────────────── */
    function getColor() {
        if (typeof designerState === 'undefined') return '#2a2a2a';
        if (designerState.customColor) return designerState.customColor;
        const c = (typeof COLORS !== 'undefined') ? COLORS.find(c => c.id === designerState.colorId) : null;
        return c ? c.shirtFill : '#2a2a2a';
    }

    function getGarmentId() {
        return (typeof designerState !== 'undefined') ? designerState.garmentId : 'mens-tee';
    }

    function makeMat(hex) {
        return new THREE.MeshStandardMaterial({
            color:     new THREE.Color(hex),
            roughness: 0.85,
            metalness: 0.0,
            side:      THREE.DoubleSide,
        });
    }
    /* Helper — call this before re-adding the plane */
    function removePrintPlane(obj) {
        /* Remove from scene if it was added to world space */
        if (obj.userData.__print_plane_world) {
            var scn = window._viewer3dScene;
            if (scn) scn.remove(obj.userData.__print_plane_world);
            obj.userData.__print_plane_world.geometry.dispose();
            obj.userData.__print_plane_world.material.dispose();
            obj.userData.__print_plane_world = null;
        }
        /* Legacy: also remove if it was parented to obj */
        var existing = obj.getObjectByName('__print_plane');
        if (existing) { obj.remove(existing); existing.geometry.dispose(); existing.material.dispose(); }
    }


    /* ── SILHOUETTE SHAPES ───────────────────────────────────── */
    function teeShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.40, -0.76);
        s.lineTo(-0.40,  0.26);
        s.lineTo(-0.62,  0.24);
        s.lineTo(-0.74,  0.40);
        s.lineTo(-0.58,  0.54);
        s.lineTo(-0.38,  0.60);
        s.bezierCurveTo(-0.24, 0.66, -0.13, 0.70,  0.00, 0.70);
        s.bezierCurveTo( 0.13, 0.70,  0.24, 0.66,  0.38, 0.60);
        s.lineTo( 0.58,  0.54);
        s.lineTo( 0.74,  0.40);
        s.lineTo( 0.62,  0.24);
        s.lineTo( 0.40,  0.26);
        s.lineTo( 0.40, -0.76);
        s.lineTo(-0.40, -0.76);
        return s;
    }

    function hoodieShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.44, -0.82);
        s.lineTo(-0.44,  0.24);
        s.lineTo(-0.70,  0.20);
        s.lineTo(-0.84,  0.34);
        s.lineTo(-0.66,  0.50);
        s.lineTo(-0.42,  0.56);
        s.bezierCurveTo(-0.30, 0.62, -0.18, 0.66, -0.10, 0.70);
        s.bezierCurveTo(-0.10, 0.90,  0.00, 0.98,  0.10, 0.90);
        s.bezierCurveTo( 0.18, 0.66,  0.30, 0.62,  0.42, 0.56);
        s.lineTo( 0.66,  0.50);
        s.lineTo( 0.84,  0.34);
        s.lineTo( 0.70,  0.20);
        s.lineTo( 0.44,  0.24);
        s.lineTo( 0.44, -0.82);
        s.lineTo(-0.44, -0.82);
        return s;
    }

    function poloShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.38, -0.72);
        s.lineTo(-0.38,  0.26);
        s.lineTo(-0.56,  0.24);
        s.lineTo(-0.64,  0.36);
        s.lineTo(-0.50,  0.46);
        s.lineTo(-0.34,  0.52);
        s.bezierCurveTo(-0.22, 0.56, -0.12, 0.60,  0.00, 0.60);
        s.bezierCurveTo( 0.12, 0.60,  0.22, 0.56,  0.34, 0.52);
        s.lineTo( 0.50,  0.46);
        s.lineTo( 0.64,  0.36);
        s.lineTo( 0.56,  0.24);
        s.lineTo( 0.38,  0.26);
        s.lineTo( 0.38, -0.72);
        s.lineTo(-0.38, -0.72);
        return s;
    }

    function oversizedShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.50, -0.86);
        s.lineTo(-0.48,  0.24);
        s.lineTo(-0.76,  0.18);
        s.lineTo(-0.92,  0.28);
        s.lineTo(-0.76,  0.46);
        s.lineTo(-0.48,  0.54);
        s.bezierCurveTo(-0.32, 0.62, -0.16, 0.66,  0.00, 0.66);
        s.bezierCurveTo( 0.16, 0.66,  0.32, 0.62,  0.48, 0.54);
        s.lineTo( 0.76,  0.46);
        s.lineTo( 0.92,  0.28);
        s.lineTo( 0.76,  0.18);
        s.lineTo( 0.48,  0.24);
        s.lineTo( 0.50, -0.86);
        s.lineTo(-0.50, -0.86);
        return s;
    }

    function womensTeeShape() {
        const s = new THREE.Shape();
        s.moveTo(-0.36, -0.70);
        s.bezierCurveTo(-0.38, -0.3, -0.40, 0.1, -0.37, 0.24);
        s.lineTo(-0.55,  0.22);
        s.lineTo(-0.63,  0.36);
        s.lineTo(-0.49,  0.48);
        s.lineTo(-0.33,  0.54);
        s.bezierCurveTo(-0.21, 0.60, -0.11, 0.64,  0.00, 0.64);
        s.bezierCurveTo( 0.11, 0.64,  0.21, 0.60,  0.33, 0.54);
        s.lineTo( 0.49,  0.48);
        s.lineTo( 0.63,  0.36);
        s.lineTo( 0.55,  0.22);
        s.lineTo( 0.37,  0.24);
        s.bezierCurveTo( 0.40, 0.1,  0.38, -0.3,  0.36, -0.70);
        s.lineTo(-0.36, -0.70);
        return s;
    }

    function getShape(id) {
        switch (id) {
            case 'hoodie':     return hoodieShape();
            case 'polo':       return poloShape();
            case 'oversized':  return oversizedShape();
            case 'womens-tee': return womensTeeShape();
            default:           return teeShape();
        }
    }

    /* ── BUILD GARMENT ───────────────────────────────────────── */
    function buildGarment() {
        const id  = getGarmentId();
        const hex = getColor();

        if (garmentGroup) {
            scene.remove(garmentGroup);
            garmentGroup.traverse(o => {
                if (o.geometry) o.geometry.dispose();
                if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material.dispose(); }
            });
        }

        garmentGroup = new THREE.Group();
        scene.add(garmentGroup);
        window._viewer3dProceduralGroup = garmentGroup;  // expose for GLB loader

        const shape = getShape(id);
        const mat   = makeMat(hex);

        const extGeo = new THREE.ExtrudeGeometry(shape, {
            depth:          0.08,
            bevelEnabled:   true,
            bevelThickness: 0.015,
            bevelSize:      0.010,
            bevelSegments:  4,
            curveSegments:  24,
        });
        extGeo.center();

        /* Subtle fabric displacement on front face only */
        const pos = extGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
            if (z > 0.02) {
                pos.setZ(i, z + Math.sin(x * 7) * 0.007 + Math.sin(y * 5 + x * 3) * 0.005);
            }
        }
        extGeo.computeVertexNormals();

        garmentGroup.add(new THREE.Mesh(extGeo, mat));

        addDetails(id, hex);
        buildPrintPlane();
        applyPrint();

        builtGarmentId = id;
        builtColor     = hex;
    }

    function addDetails(id, hex) {
        /* Collar */
        if (id !== 'hoodie') {
            const colW = id === 'polo' ? 0.13 : 0.15;
            const colH = id === 'polo' ? 0.07 : 0.04;
            const neckY = id === 'polo' ? 0.28 : 0.33;

            const cShape = new THREE.Shape();
            cShape.moveTo(-colW, 0);
            cShape.bezierCurveTo(-colW, colH, colW, colH, colW, 0);
            cShape.bezierCurveTo(colW * 0.7, -colH * 0.5, -colW * 0.7, -colH * 0.5, -colW, 0);

            const cGeo = new THREE.ShapeGeometry(cShape, 16);
            const cMat = makeMat(new THREE.Color(hex).multiplyScalar(0.88).getStyle());
            const cMesh = new THREE.Mesh(cGeo, cMat);
            cMesh.position.set(0, neckY, 0.052);
            garmentGroup.add(cMesh);
        }

        /* Kangaroo pocket */
        if (id === 'hoodie') {
            const pShape = new THREE.Shape();
            pShape.moveTo(-0.18, -0.12);
            pShape.lineTo(-0.18,  0.05);
            pShape.lineTo( 0.18,  0.05);
            pShape.lineTo( 0.18, -0.12);
            pShape.bezierCurveTo(0.18, -0.18, -0.18, -0.18, -0.18, -0.12);
            const pGeo  = new THREE.ShapeGeometry(pShape, 8);
            const pMat  = makeMat(new THREE.Color(hex).multiplyScalar(0.87).getStyle());
            const pMesh = new THREE.Mesh(pGeo, pMat);
            pMesh.position.set(0, -0.16, 0.052);
            garmentGroup.add(pMesh);
        }

        /* Polo placket + buttons */
        if (id === 'polo') {
            const plShape = new THREE.Shape();
            plShape.moveTo(-0.032, -0.20);
            plShape.lineTo(-0.032,  0.24);
            plShape.lineTo( 0.032,  0.24);
            plShape.lineTo( 0.032, -0.20);
            plShape.lineTo(-0.032, -0.20);
            const plGeo  = new THREE.ShapeGeometry(plShape, 4);
            const plMat  = makeMat(new THREE.Color(hex).multiplyScalar(0.84).getStyle());
            const plMesh = new THREE.Mesh(plGeo, plMat);
            plMesh.position.set(0, 0.02, 0.052);
            garmentGroup.add(plMesh);

            for (let i = 0; i < 4; i++) {
                const bGeo  = new THREE.CircleGeometry(0.011, 8);
                const bMat  = makeMat(new THREE.Color(hex).multiplyScalar(0.68).getStyle());
                const bMesh = new THREE.Mesh(bGeo, bMat);
                bMesh.position.set(0, 0.18 - i * 0.10, 0.056);
                garmentGroup.add(bMesh);
            }
        }
    }

    /* ── PRINT PLANE ─────────────────────────────────────────── */
    function buildPrintPlane() {
        if (printMesh) {
            garmentGroup.remove(printMesh);
            printMesh.geometry.dispose();
            printMesh.material.dispose();
        }
        const geo = new THREE.PlaneGeometry(0.35, 0.35, 6, 6);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            pos.setZ(i, 0.057 + 0.012 - Math.abs(x) * 0.025);
        }
        geo.computeVertexNormals();

        const mat = new THREE.MeshBasicMaterial({
            map:         printTexture,
            transparent: true,
            depthWrite:  false,
            opacity:     0.94,
        });
        printMesh = new THREE.Mesh(geo, mat);
        printMesh.position.set(0, 0.08, 0);
        printMesh.visible = false;
        garmentGroup.add(printMesh);
    }

    function applyPrint() {
        if (!printCanvas) return;
        const src = (typeof designerState !== 'undefined') ? designerState.printSrc : null;
        const ctx  = printCanvas.getContext('2d');
        ctx.clearRect(0, 0, 512, 512);
        if (!src) { if (printMesh) printMesh.visible = false; return; }
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, 512, 512);
            ctx.drawImage(img, 0, 0, 512, 512);
            printTexture.needsUpdate = true;
            if (printMesh) printMesh.visible = true;
        };
        img.src = src;
    }

    /* ── RENDER LOOP ─────────────────────────────────────────── */
    function loop() {
        rafId = requestAnimationFrame(loop);
        if (isAutoRotating && !isDragging) targetRotY += 0.005;
        rotY += (targetRotY - rotY) * 0.09;
        rotX += (targetRotX - rotX) * 0.09;
        targetRotX = Math.max(-0.4, Math.min(0.4, targetRotX));
        if (garmentGroup) { garmentGroup.rotation.y = rotY; garmentGroup.rotation.x = rotX; }
        /* Rotate custom GLB model in sync */
        if (window.viewer3d && window.viewer3d._rotateCustomModel) {
            window.viewer3d._rotateCustomModel(rotY, rotX);
        }
        cameraZ += (targetCameraZ - cameraZ) * 0.10;
        camera.position.z = cameraZ;
        renderer.render(scene, camera);
    }

    /* ── EVENTS ──────────────────────────────────────────────── */
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => { isAutoRotating = true; }, 3000);
    }

    function bindEvents() {
        const el = renderer.domElement;
        el.addEventListener('mousedown', e => {
            isDragging = true; isAutoRotating = false;
            prevMouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mousemove', e => {
            if (!isDragging) return;
            targetRotY += (e.clientX - prevMouse.x) * 0.013;
            targetRotX += (e.clientY - prevMouse.y) * 0.009;
            prevMouse = { x: e.clientX, y: e.clientY };
        });
        window.addEventListener('mouseup', () => { isDragging = false; resetIdleTimer(); });
        el.addEventListener('wheel', e => {
            e.preventDefault();
            targetCameraZ = Math.max(MIN_Z, Math.min(MAX_Z, targetCameraZ + e.deltaY * 0.004));
        }, { passive: false });
        el.addEventListener('touchstart', e => {
            isAutoRotating = false;
            if (e.touches.length === 1) { isDragging = true; prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY }; }
            else if (e.touches.length === 2) { isDragging = false; pinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); }
        }, { passive: true });
        el.addEventListener('touchmove', e => {
            e.preventDefault();
            if (e.touches.length === 1 && isDragging) {
                targetRotY += (e.touches[0].clientX - prevMouse.x) * 0.015;
                targetRotX += (e.touches[0].clientY - prevMouse.y) * 0.010;
                prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
            } else if (e.touches.length === 2) {
                const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
                targetCameraZ = Math.max(MIN_Z, Math.min(MAX_Z, targetCameraZ + (pinchDist - d) * 0.01));
                pinchDist = d;
            }
        }, { passive: false });
        el.addEventListener('touchend', () => { isDragging = false; resetIdleTimer(); });
    }

    function onResize() {
        if (!mountEl || !renderer) return;
        const W = mountEl.clientWidth, H = mountEl.clientHeight;
        camera.aspect = W / H; camera.updateProjectionMatrix();
        renderer.setSize(W, H);
    }

    /* ── PUBLIC API ──────────────────────────────────────────── */
    window.viewer3d = {
        init()  { boot(); },
        update() {
            if (!THREE || !scene) return;
            if (window._customModelObj) return;   // ← GLB is active, don't touch procedural
            if (getGarmentId() !== builtGarmentId || getColor() !== builtColor) buildGarment();
            else applyPrint();
        },
        flipToBack() {
            isAutoRotating = false;
            targetRotY += currentFace === 'front' ? Math.PI : -Math.PI;
            currentFace  = currentFace === 'front' ? 'back' : 'front';
            resetIdleTimer();
        },
        setAutoRotate(v) { isAutoRotating = v; },
        destroy() {
            if (rafId) cancelAnimationFrame(rafId);
            if (renderer) { renderer.dispose(); renderer.domElement.remove(); }
            scene = renderer = camera = garmentGroup = null;
            builtGarmentId = null;
        }
    };
})();

/* ============================================================
   PODTS — GLB path loader
   ─────────────────────────────────────────────────────────────
   HOW TO USE YOUR OWN MODEL:
     1. Put your .glb file somewhere relative to index.html,
        e.g.  assets/shirt.glb
     2. Change CUSTOM_MODEL_PATH below to that path.
     3. Set CUSTOM_MODEL_ENABLED = true.

   On mobile (screen width ≤ 768 px) the loader is skipped and
   the procedural geometry is used instead (fallback).

   The model is loaded once and cached. Garment colour is applied
   to all MeshStandardMaterial meshes automatically.
   ============================================================ */
(function () {
    'use strict';

    /* ══════════════════════════════════════════════════════════
       ✏️  CONFIGURE YOUR MODEL HERE
       ══════════════════════════════════════════════════════════ */
    var CUSTOM_MODEL_ENABLED = true;           // ← set true to use your model
    var CUSTOM_MODEL_PATH    = 'T_SHhirt_mockup.glb';  // ← path relative to index.html
    /* ══════════════════════════════════════════════════════════ */

    // Tell the main viewer immediately — before setup() runs buildGarment()
    if (CUSTOM_MODEL_ENABLED) window._customGLBEnabled = true;

    var GLTF_LOADER_URL = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js';

    var cachedModel    = null;   // THREE.Group once loaded
    var isLoading      = false;
    var loadCallbacks  = [];     // queued callbacks while loading

    /* Mobile check — fallback to procedural on small screens */
    function isMobile() {
        return window.innerWidth <= 768;
    }

    /* Inject GLTFLoader script once */
    function ensureGLTFLoader(cb) {
        if (window.THREE && window.THREE.GLTFLoader) { cb(); return; }
        if (document.querySelector('script[data-gltf-loader]')) {
            // Script tag exists but may still be loading — poll
            var poll = setInterval(function () {
                if (window.THREE && window.THREE.GLTFLoader) { clearInterval(poll); cb(); }
            }, 50);
            return;
        }
        var s = document.createElement('script');
        s.setAttribute('data-gltf-loader', '1');
        s.src = GLTF_LOADER_URL;
        s.onload = cb;
        document.head.appendChild(s);
    }

    /* Fit model to view regardless of export scale.
       Steps:
         1. Measure raw bounding box
         2. Apply scale so longest axis = 1.6 units
         3. Re-measure AFTER scaling to get correct centre
         4. Offset position so model is centred at origin  */
    function fitToView(obj) {
        // Step 1 — raw size before any transform
        var box  = new THREE.Box3().setFromObject(obj);
        var size = box.getSize(new THREE.Vector3());
        var max  = Math.max(size.x, size.y, size.z);

        console.log('[viewer3d] Raw model size:', size.x.toFixed(3), size.y.toFixed(3), size.z.toFixed(3));

        if (max === 0) {
            console.warn('[viewer3d] Model has zero size — check the file exports geometry');
            return;
        }

        // Step 2 — scale
        var scale = 1.6 / max;
        obj.scale.setScalar(scale);

        // Step 3+4 — re-measure after scale, then centre
        obj.updateMatrixWorld(true);
        var box2   = new THREE.Box3().setFromObject(obj);
        var centre = box2.getCenter(new THREE.Vector3());
        obj.position.set(-centre.x, -centre.y, -centre.z);

        // Nudge slightly up so model sits at eye level
        obj.position.y += 0.05;

        console.log('[viewer3d] Fitted — scale:', scale.toFixed(4),
            '| centred at:', centre.x.toFixed(3), centre.y.toFixed(3), centre.z.toFixed(3));
    }

    /* Tint meshes to the current garment colour.
       We only set .color on the existing material — this preserves the
       original normals, roughness, specular and any baked textures.
       Original materials are cached on first call so we can restore them. */
    function tintModel(obj, hex) {
        var col = new THREE.Color(hex);
        obj.traverse(function (child) {
            if (!child.isMesh) return;
            // Cache original material on first tint
            if (!child.userData._origMaterial) {
                child.userData._origMaterial = child.material;
            }
            var mat = child.userData._origMaterial;
            // Clone once so we don't mutate the cached original
            if (!child.userData._tintedMaterial) {
                child.userData._tintedMaterial = mat.clone();
                child.material = child.userData._tintedMaterial;
            }
            child.userData._tintedMaterial.color.set(col);
        });
    }

    /* Loading overlay ────────────────────────────────────────── */
    function showOverlay(msg) {
        var mount = document.getElementById('viewer3d-mount');
        if (!mount) return;
        mount.style.position = 'relative';
        var el = document.getElementById('glb-load-overlay');
        if (!el) {
            el = document.createElement('div');
            el.id = 'glb-load-overlay';
            el.style.cssText = [
                'position:absolute','inset:0','z-index:20',
                'display:flex','flex-direction:column',
                'align-items:center','justify-content:center','gap:0.6rem',
                'background:rgba(249,248,246,0.80)',
                'backdrop-filter:blur(6px)','-webkit-backdrop-filter:blur(6px)',
                'border-radius:inherit',
                'font-family:var(--font-mono,monospace)',
                'font-size:0.7rem','letter-spacing:0.1em',
                'text-transform:uppercase','color:var(--text-muted,#6b6960)',
            ].join(';');
            /* spinner SVG */
            el.innerHTML = '<svg id="glb-spinner" width="26" height="26" viewBox="0 0 24 24"'
                + ' fill="none" stroke="currentColor" stroke-width="1.8"'
                + ' style="animation:glbspin 0.9s linear infinite">'
                + '<path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83'
                + ' M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>'
                + '<span id="glb-overlay-msg"></span>';
            mount.appendChild(el);
            if (!document.getElementById('glbspin-style')) {
                var st = document.createElement('style');
                st.id  = 'glbspin-style';
                st.textContent = '@keyframes glbspin{to{transform:rotate(360deg)}}';
                document.head.appendChild(st);
            }
        }
        el.style.display = 'flex';
        var msgEl = el.querySelector('#glb-overlay-msg');
        if (msgEl) msgEl.textContent = msg || 'Loading model…';
    }

    function hideOverlay() {
        var el = document.getElementById('glb-load-overlay');
        if (el) el.style.display = 'none';
    }

    /* Core load function ─────────────────────────────────────── */
    function loadGLB(onLoaded, onError) {
        /* Return cached model immediately if already loaded */
        if (cachedModel) { onLoaded(cachedModel.clone()); return; }

        /* Queue callback if a load is already in progress */
        if (isLoading) { loadCallbacks.push({ ok: onLoaded, err: onError }); return; }

        isLoading = true;
        showOverlay('Loading model…');

        ensureGLTFLoader(function () {
            var loader = new THREE.GLTFLoader();
            loader.load(
                CUSTOM_MODEL_PATH,
                function (gltf) {
                    cachedModel = gltf.scene;
                    isLoading   = false;
                    hideOverlay();
                    onLoaded(cachedModel.clone());
                    /* flush queue */
                    loadCallbacks.forEach(function (cb) { cb.ok(cachedModel.clone()); });
                    loadCallbacks = [];
                },
                function (xhr) {
                    if (xhr.total > 0) {
                        showOverlay('Loading… ' + Math.round(xhr.loaded / xhr.total * 100) + '%');
                    }
                },
                function (err) {
                    isLoading = false;
                    hideOverlay();
                    console.warn('[viewer3d] GLB load failed:', err);
                    if (typeof showToast === 'function') showToast('Model not found — using built-in');
                    onError && onError(err);
                    loadCallbacks.forEach(function (cb) { cb.err && cb.err(err); });
                    loadCallbacks = [];
                }
            );
        });
    }

    /* ── PUBLIC EXTENSION API ─────────────────────────────────── */
    /* Called by the main viewer after scene is ready */
    function tryLoadCustomModel() {
        if (!CUSTOM_MODEL_ENABLED) return;
        if (isMobile()) return;

        loadGLB(
            function (model) {
                var scn = window._viewer3dScene;
                if (!scn) { console.warn('[viewer3d] Scene not ready'); return; }

                // Remove procedural group — GLB takes over
                if (window._viewer3dProceduralGroup) {
                    scn.remove(window._viewer3dProceduralGroup);
                    window._viewer3dProceduralGroup = null;
                }

                fitToView(model);
                tintModel(model, getColorHex());
                scn.add(model);
                window._customModelObj = model;

                var meshCount = 0;
                model.traverse(function(o) { if (o.isMesh) meshCount++; });
                console.log('[viewer3d] Custom model loaded. Meshes:', meshCount);
                if (typeof showToast === 'function') showToast('3D model loaded ✓');
            },
            function (err) {
                console.warn('[viewer3d] GLB load failed, keeping procedural:', err);
                if (typeof showToast === 'function') showToast('Could not load model — using built-in');
            }
        );
    }

    function getColorHex() {
        if (typeof designerState === 'undefined') return '#2a2a2a';
        if (designerState.customColor) return designerState.customColor;
        var c = (typeof COLORS !== 'undefined')
            ? COLORS.find(function (c) { return c.id === designerState.colorId; })
            : null;
        return c ? c.shirtFill : '#2a2a2a';
    }

    /* Patch the main viewer's render loop to rotate custom model */
    var _origLoop = null;
    function patchRenderLoop() {
        /* The main IIFE exposes garmentGroup via closure — we hook via
           the existing rotation logic by overriding the group reference */
        /* Simpler approach: override viewer3d.update to also rotate custom model */

        var orig = window.viewer3d && window.viewer3d.update;
        if (window.viewer3d) {
            window.viewer3d._rotateCustomModel = function (ry, rx) {
                if (window._customModelObj) {
                    window._customModelObj.rotation.y = ry;
                    window._customModelObj.rotation.x = rx;
                }
            };
            var lastPrintSrc = null;
            /* Patch update to retint on colour change */
            window.viewer3d.update = function () {

                if (orig) orig.call(window.viewer3d);

                if (window._customModelObj && !isMobile()) {

                    tintModel(window._customModelObj, getColorHex());

                    var src = (typeof designerState !== 'undefined')
                        ? designerState.printSrc
                        : null;

                    if (src !== lastPrintSrc) {

                        lastPrintSrc = src;

                        if (src) {
                            applyPrintToCustomModel(window._customModelObj);
                        } else {

                            var existing = window._customModelObj.getObjectByName('__print_plane');

                            if (existing) {
                                window._customModelObj.remove(existing);
                                existing.geometry.dispose();
                                existing.material.dispose();
                            }
                        }
                    }
                }
            };
        }
    }

    function applyPrintToCustomModel(obj) {

        var src = (typeof designerState !== 'undefined') ? designerState.printSrc : null;
        if (!src || !window.printTexture || !window.printCanvas) return;

        /* Remove existing print */
        var existing = obj.getObjectByName('__print_plane');
        if (existing) {
            obj.remove(existing);
            existing.geometry.dispose();
            existing.material.dispose();
        }

        /* Get model dimensions */
        obj.updateMatrixWorld(true);

        var box  = new THREE.Box3().setFromObject(obj);
        var size = box.getSize(new THREE.Vector3());
        var center = box.getCenter(new THREE.Vector3());

        /*
        Typical POD print width = ~45% of chest width
        */
        var printWidth  = size.x * 0.45;
        var printHeight = printWidth;

        var geo = new THREE.PlaneGeometry(printWidth, printHeight);

        var mat = new THREE.MeshBasicMaterial({
            map: window.printTexture,
            transparent: true,
            depthWrite: false,
            opacity: 0.98
        });

        var plane = new THREE.Mesh(geo, mat);
        plane.name = '__print_plane';

        /*
        Positioning logic
        */

        var chestHeight = center.y + size.y * 0.18;
        var frontOffset = box.max.z + 0.015;

        plane.position.set(
            center.x,
            chestHeight,
            frontOffset
        );

        /*
        Attach to model
        */
        obj.add(plane);

        /*
        Load the image
        */
        var img = new Image();
        img.onload = function () {

            var ctx = window.printCanvas.getContext('2d');

            ctx.clearRect(0, 0, 512, 512);

            ctx.drawImage(img, 0, 0, 512, 512);

            window.printTexture.needsUpdate = true;
        };

        img.src = src;
    }

    /* Register as a callback to fire once the scene is ready.
       The main viewer's setup() calls window._tryLoadCustomModelWhenReady()
       after scene is created — this is the only reliable trigger point.  */
    patchRenderLoop();  // safe to call early — just sets up function refs

    window._tryLoadCustomModelWhenReady = function () {
        if (!CUSTOM_MODEL_ENABLED) return;
        if (isMobile()) return;  // mobile uses procedural fallback
        tryLoadCustomModel();
    };

    /* Fallback: if viewer was already init'd before this script ran */
    if (window._viewer3dScene) {
        window._tryLoadCustomModelWhenReady();
    }

    /* Also expose manual trigger in case init is called late */
    window.viewer3d = window.viewer3d || {};
    window.viewer3d.reloadCustomModel = tryLoadCustomModel;

})();