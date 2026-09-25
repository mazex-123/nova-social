import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


// =========================
// SCENE
// =========================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x090812);


// =========================
// CAMERA
// =========================

const camera =
    new THREE.PerspectiveCamera(
        35,
        window.innerWidth /
        window.innerHeight,
        0.1,
        100
    );

camera.position.set(
    0,
    1.15,
    5.5
);


// =========================
// RENDERER
// =========================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });

renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
    THREE.SRGBColorSpace;

document
    .getElementById("petCanvas")
    .appendChild(renderer.domElement);


// =========================
// LIGHTS
// =========================

const ambientLight =
    new THREE.HemisphereLight(
        0xc7b7ff,
        0x080810,
        2.2
    );

scene.add(ambientLight);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        3
    );

mainLight.position.set(
    3,
    5,
    4
);

mainLight.castShadow = true;

scene.add(mainLight);


const purpleLight =
    new THREE.PointLight(
        0x9b5cff,
        12,
        7
    );

purpleLight.position.set(
    -2,
    1.5,
    2
);

scene.add(purpleLight);


const blueLight =
    new THREE.PointLight(
        0x4c8dff,
        8,
        6
    );

blueLight.position.set(
    2,
    1,
    -1
);

scene.add(blueLight);


// =========================
// PET
// =========================

const pet =
    new THREE.Group();

pet.position.y = -0.65;

scene.add(pet);


// =========================
// MATERIALS
// =========================

const bodyMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x8c63d9,
        roughness: 0.65,
        metalness: 0.05
    });


const darkMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x29213d,
        roughness: 0.5
    });


const eyeMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xe8d8ff
    });


// =========================
// BODY
// =========================

const bodyGeometry =
    new THREE.SphereGeometry(
        0.72,
        32,
        24
    );

const body =
    new THREE.Mesh(
        bodyGeometry,
        bodyMaterial
    );

body.scale.set(
    1,
    1.08,
    0.85
);

body.position.y = 0.72;

body.castShadow = true;
body.receiveShadow = true;

pet.add(body);


// =========================
// HEAD
// =========================

const headGeometry =
    new THREE.SphereGeometry(
        0.78,
        32,
        24
    );

const head =
    new THREE.Mesh(
        headGeometry,
        bodyMaterial
    );

head.scale.set(
    1.05,
    0.95,
    0.95
);

head.position.set(
    0,
    1.55,
    0.02
);

head.castShadow = true;

pet.add(head);


// =========================
// EARS
// =========================

function createEar(
    x,
    rotationZ
) {

    const geometry =
        new THREE.ConeGeometry(
            0.25,
            0.65,
            16
        );

    const ear =
        new THREE.Mesh(
            geometry,
            bodyMaterial
        );

    ear.position.set(
        x,
        2.18,
        0
    );

    ear.rotation.z =
        rotationZ;

    ear.castShadow = true;

    pet.add(ear);

    return ear;
}


const leftEar =
    createEar(
        -0.43,
        -0.35
    );


const rightEar =
    createEar(
        0.43,
        0.35
    );


// =========================
// EYES
// =========================

function createEye(x) {

    const geometry =
        new THREE.SphereGeometry(
            0.105,
            20,
            16
        );

    const eye =
        new THREE.Mesh(
            geometry,
            eyeMaterial
        );

    eye.position.set(
        x,
        1.63,
        0.72
    );

    eye.scale.y = 1.15;

    pet.add(eye);

    return eye;
}


const leftEye =
    createEye(-0.25);

const rightEye =
    createEye(0.25);


// =========================
// EYE GLOW
// =========================

function createEyeGlow(x) {

    const geometry =
        new THREE.SphereGeometry(
            0.16,
            16,
            12
        );

    const material =
        new THREE.MeshBasicMaterial({
            color: 0x9d6cff,
            transparent: true,
            opacity: 0.16
        });

    const glow =
        new THREE.Mesh(
            geometry,
            material
        );

    glow.position.set(
        x,
        1.63,
        0.68
    );

    pet.add(glow);

    return glow;
}


const leftEyeGlow =
    createEyeGlow(-0.25);

const rightEyeGlow =
    createEyeGlow(0.25);


// =========================
// MOUTH
// =========================

const mouthGeometry =
    new THREE.TorusGeometry(
        0.08,
        0.025,
        8,
        16,
        Math.PI
    );

const mouth =
    new THREE.Mesh(
        mouthGeometry,
        darkMaterial
    );

mouth.position.set(
    0,
    1.38,
    0.75
);

mouth.rotation.x =
    Math.PI;

pet.add(mouth);


// =========================
// FEET
// =========================

function createFoot(x) {

    const geometry =
        new THREE.SphereGeometry(
            0.28,
            20,
            16
        );

    const foot =
        new THREE.Mesh(
            geometry,
            darkMaterial
        );

    foot.scale.set(
        0.9,
        0.65,
        1.1
    );

    foot.position.set(
        x,
        0.18,
        0.15
    );

    foot.castShadow = true;

    pet.add(foot);

    return foot;
}


const leftFoot =
    createFoot(-0.38);

const rightFoot =
    createFoot(0.38);


// =========================
// TAIL
// =========================

const tailGeometry =
    new THREE.TorusGeometry(
        0.38,
        0.11,
        12,
        24,
        Math.PI * 1.5
    );

const tail =
    new THREE.Mesh(
        tailGeometry,
        bodyMaterial
    );

tail.position.set(
    0.55,
    0.75,
    -0.45
);

tail.rotation.x =
    Math.PI / 2;

tail.rotation.z =
    -0.35;

tail.castShadow = true;

pet.add(tail);


// =========================
// GROUND GLOW
// =========================

const groundGeometry =
    new THREE.CircleGeometry(
        1.5,
        64
    );

const groundMaterial =
    new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.10
    });

const ground =
    new THREE.Mesh(
        groundGeometry,
        groundMaterial
    );

ground.rotation.x =
    -Math.PI / 2;

ground.position.y = 0;

ground.scale.set(
    1,
    0.45,
    1
);

scene.add(ground);


// =========================
// ANIMATION SYSTEM
// =========================

const clock =
    new THREE.Clock();


// Animation state

let blinkTimer = 0;

let nextBlink =
    2.5 + Math.random() * 3;

let blinkProgress = 0;

let blinking = false;


let actionTimer = 0;

let nextAction =
    3 + Math.random() * 4;

let actionType = 0;

let actionProgress = 0;


// Look direction

let lookX = 0;

let targetLookX = 0;


// =========================
// BLINK
// =========================

function startBlink() {

    if (blinking) return;

    blinking = true;

    blinkProgress = 0;
}


function updateBlink(delta) {

    blinkTimer += delta;

    if (
        !blinking &&
        blinkTimer >= nextBlink
    ) {

        startBlink();

        blinkTimer = 0;

        nextBlink =
            2.5 + Math.random() * 4;
    }


    if (!blinking) return;

    blinkProgress += delta;


    let value;


    if (blinkProgress < 0.07) {

        value =
            1 -
            blinkProgress / 0.07;

    } else if (blinkProgress < 0.14) {

        value =
            (blinkProgress - 0.07) /
            0.07;

    } else {

        value = 1;

        blinking = false;
    }


    leftEye.scale.y =
        Math.max(
            0.15,
            value * 1.15
        );

    rightEye.scale.y =
        Math.max(
            0.15,
            value * 1.15
        );
}


// =========================
// RANDOM ACTIONS
// =========================

function chooseAction() {

    actionType =
        Math.floor(
            Math.random() * 4
        );

    actionProgress = 0;

    nextAction =
        4 + Math.random() * 5;
}


function updateAction(delta) {

    actionTimer += delta;

    actionProgress += delta;


    if (
        actionTimer >= nextAction
    ) {

        actionTimer = 0;

        chooseAction();
    }


    // LOOK AROUND

    if (actionType === 0) {

        if (actionProgress < 0.4) {

            targetLookX =
                Math.random() > 0.5
                    ? 0.35
                    : -0.35;
        }

        if (
            actionProgress > 1.8
        ) {

            targetLookX = 0;
        }
    }


    // HAPPY TAIL

    if (actionType === 1) {

        tail.rotation.y =
            Math.sin(
                actionProgress * 7
            ) * 0.35;
    }


    // LITTLE BODY LEAN

    if (actionType === 2) {

        pet.rotation.z =
            Math.sin(
                actionProgress * 4
            ) * 0.035;
    }


    // EAR TWITCH

    if (actionType === 3) {

        leftEar.rotation.z =
            -0.35 +
            Math.sin(
                actionProgress * 9
            ) * 0.12;

        rightEar.rotation.z =
            0.35 +
            Math.sin(
                actionProgress * 9 + 1
            ) * 0.12;
    }
}


// =========================
// MAIN ANIMATION
// =========================

function animate() {

    requestAnimationFrame(
        animate
    );


    // IMPORTANT:
    // getDelta FIRST

    const delta =
        clock.getDelta();

    const time =
        clock.elapsedTime;


    // =====================
    // BREATHING
    // =====================

    const breathing =
        Math.sin(
            time * 2.1
        ) * 0.025;


    body.scale.y =
        1.08 + breathing;


    head.position.y =
        1.55 +
        breathing * 0.7;


    // =====================
    // FLOATING
    // =====================

    pet.position.y =
        -0.65 +
        Math.sin(
            time * 1.7
        ) * 0.035;


    // =====================
    // NATURAL TAIL
    // =====================

    if (actionType !== 1) {

        tail.rotation.y =
            Math.sin(
                time * 1.4
            ) * 0.16;
    }


    // =====================
    // NATURAL EARS
    // =====================

    if (actionType !== 3) {

        leftEar.rotation.z =
            -0.35 +
            Math.sin(
                time * 1.5
            ) * 0.035;


        rightEar.rotation.z =
            0.35 +
            Math.sin(
                time * 1.5 + 1
            ) * 0.035;
    }


    // =====================
    // EYE GLOW
    // =====================

    const glow =
        0.13 +
        Math.sin(
            time * 2
        ) * 0.04;


    leftEyeGlow
        .material
        .opacity = glow;


    rightEyeGlow
        .material
        .opacity = glow;


    // =====================
    // BLINK
    // =====================

    updateBlink(delta);


    // =====================
    // RANDOM ACTION
    // =====================

    updateAction(delta);


    // =====================
    // SMOOTH LOOK
    // =====================

    lookX +=
        (
            targetLookX -
            lookX
        ) *
        Math.min(
            delta * 3,
            1
        );


    head.rotation.y =
        lookX;


    // =====================
    // CAMERA
    // =====================

    camera.lookAt(
        0,
        1,
        0
    );


    // =====================
    // RENDER
    // =====================

    renderer.render(
        scene,
        camera
    );
}


// =========================
// RESIZE
// =========================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }
);


// =========================
// START
// =========================

chooseAction();

animate();