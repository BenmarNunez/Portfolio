(function initHero3D() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;

  try {
    if (typeof THREE === 'undefined') throw new Error('THREE not loaded');

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    if (!renderer.getContext()) throw new Error('WebGL context unavailable');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const isSmall = window.innerWidth < 640;
    const detail = isSmall ? 0 : 1;

    const geometry = new THREE.IcosahedronGeometry(1.3, detail);
    const solidMaterial = new THREE.MeshStandardMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.15,
      roughness: 0.3,
    });
    const solidMesh = new THREE.Mesh(geometry, solidMaterial);
    scene.add(solidMesh);

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x22d3ee });
    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    scene.add(wireframe);

    const pointLight = new THREE.PointLight(0x22d3ee, 1.5, 10);
    pointLight.position.set(2, 2, 3);
    scene.add(pointLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);
    resize();

    const PARALLAX_SENSITIVITY = 0.6;
    const PARALLAX_DAMPING = 0.03;
    const ROTATION_SPEED_Y = 0.003;
    const ROTATION_SPEED_X = 0.001;

    let targetX = 0, targetY = 0;
    window.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * PARALLAX_SENSITIVITY;
      targetY = (e.clientY / window.innerHeight - 0.5) * PARALLAX_SENSITIVITY;
    });

    function animate() {
      try {
        solidMesh.rotation.y += ROTATION_SPEED_Y;
        solidMesh.rotation.x += ROTATION_SPEED_X;
        wireframe.rotation.copy(solidMesh.rotation);

        camera.position.x += (targetX - camera.position.x) * PARALLAX_DAMPING;
        camera.position.y += (-targetY - camera.position.y) * PARALLAX_DAMPING;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
      } catch (err) {
        console.warn('Hero3D disabled:', err.message);
        canvas.style.display = 'none';
        return;
      }
      requestAnimationFrame(animate);
    }
    animate();
  } catch (err) {
    console.warn('Hero3D disabled:', err.message);
    canvas.style.display = 'none';
  }
})();
