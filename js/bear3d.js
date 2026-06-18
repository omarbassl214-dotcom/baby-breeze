document.addEventListener('DOMContentLoaded', () => {
    // Only run if the container exists and Three.js is loaded
    const container = document.getElementById('bear-canvas-container');
    if (!container || typeof THREE === 'undefined') return;

    // Scene setup
    const scene = new THREE.Scene();
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 9;
    camera.position.y = 0;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting (Soft studio lighting to match brand)
    const ambientLight = new THREE.AmbientLight(0xfff0f5, 0.7); // Soft pinkish white
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffe0e5, 0.6);
    fillLight.position.set(-5, 3, 5);
    scene.add(fillLight);

    // Group for the bear head so we can rotate the whole thing
    const bearGroup = new THREE.Group();
    scene.add(bearGroup);

    // Materials
    const furMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x8c5b3f, // Warm soft brown
        roughness: 0.9,
        metalness: 0.1 
    });
    
    const snoutMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xdfc2a6, // Light tan/cream
        roughness: 1.0,
        metalness: 0.0 
    });
    
    const eyeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222, // Almost black
        roughness: 0.3,
        metalness: 0.8 
    });

    // 1. Head
    const headGeo = new THREE.SphereGeometry(2, 64, 64);
    const head = new THREE.Mesh(headGeo, furMaterial);
    bearGroup.add(head);

    // 2. Ears
    const earGeo = new THREE.SphereGeometry(0.85, 32, 32);
    
    const leftEar = new THREE.Mesh(earGeo, furMaterial);
    leftEar.position.set(-1.5, 1.4, 0);
    bearGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, furMaterial);
    rightEar.position.set(1.5, 1.4, 0);
    bearGroup.add(rightEar);

    // Inner Ears
    const innerEarGeo = new THREE.SphereGeometry(0.45, 32, 32);
    const leftInnerEar = new THREE.Mesh(innerEarGeo, snoutMaterial);
    leftInnerEar.position.set(-1.55, 1.4, 0.75);
    bearGroup.add(leftInnerEar);

    const rightInnerEar = new THREE.Mesh(innerEarGeo, snoutMaterial);
    rightInnerEar.position.set(1.55, 1.4, 0.75);
    bearGroup.add(rightInnerEar);

    // 3. Snout
    const snoutGeo = new THREE.SphereGeometry(0.9, 32, 32);
    const snout = new THREE.Mesh(snoutGeo, snoutMaterial);
    snout.position.set(0, -0.4, 1.65);
    snout.scale.set(1.3, 0.85, 0.8);
    bearGroup.add(snout);

    // 4. Nose
    const noseGeo = new THREE.SphereGeometry(0.25, 32, 32);
    const nose = new THREE.Mesh(noseGeo, eyeMaterial);
    nose.position.set(0, -0.1, 2.3);
    nose.scale.set(1.3, 0.8, 1);
    bearGroup.add(nose);

    // 5. Eyes
    const eyeGeo = new THREE.SphereGeometry(0.2, 32, 32);
    
    const leftEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    leftEye.position.set(-0.7, 0.4, 1.8);
    bearGroup.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeo, eyeMaterial);
    rightEye.position.set(0.7, 0.4, 1.8);
    bearGroup.add(rightEye);

    // Scale slightly for better fit
    bearGroup.scale.set(1.2, 1.2, 1.2);

    // Interaction variables
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    // Listen to mouse movement
    document.addEventListener('mousemove', (event) => {
        // Normalize mouse coordinates from -1 to 1
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        targetRotationY = mouseX * 0.6; // Max horizontal rotation
        targetRotationX = -mouseY * 0.4; // Max vertical rotation
    });

    // Listen to touch movement for mobile
    document.addEventListener('touchmove', (event) => {
        if(event.touches.length > 0) {
            mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            
            targetRotationY = mouseX * 0.6;
            targetRotationX = -mouseY * 0.4;
        }
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
        if (!container) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // Animation Loop
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // 1. Gently float up and down (breathing effect)
        bearGroup.position.y = Math.sin(time * 2) * 0.15;

        // 2. Smoothly rotate towards the mouse cursor
        bearGroup.rotation.y += (targetRotationY - bearGroup.rotation.y) * 0.05;
        bearGroup.rotation.x += (targetRotationX - bearGroup.rotation.x) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
});
