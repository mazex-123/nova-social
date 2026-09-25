"use strict";

import * as THREE from
    "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";


/* =========================
   API
========================= */

const API_URL = "https://catalogs-grew-dodge-wake.trycloudflare.com";


/* =========================
   ELEMENTS
========================= */

const topUsername =
    document.getElementById("topUsername");

const logoutButton =
    document.getElementById("logoutButton");

const navItems =
    document.querySelectorAll(
        ".nav-item[data-page]"
    );

const pages =
    document.querySelectorAll(".app-page");


/* =========================
   AUTHENTICATION
========================= */

async function loadCurrentUser() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            window.location.href =
                "index.html";

            return;
        }


        const data =
            await response.json();


        console.log(
            "NOVA /api/me STATUS:",
            response.status
        );

        console.log(
            "NOVA /api/me DATA:",
            data
        );


        if (
            !data.success ||
            !data.authenticated
        ) {

            window.location.href =
                "index.html";

            return;
        }


        const username =
            data.user.username;


        if (topUsername) {

            topUsername.textContent =
                `@${username}`;

        }

    } catch (error) {

        console.error(error);

        window.location.href =
            "index.html";

    }

}


/* =========================
   NAVIGATION
========================= */

navItems.forEach((item) => {

    item.addEventListener(
        "click",
        () => {

            const page =
                item.dataset.page;


            navItems.forEach((nav) => {

                nav.classList.remove(
                    "active"
                );

            });


            item.classList.add(
                "active"
            );


            pages.forEach((section) => {

                section.classList.remove(
                    "active"
                );

            });


            const targetPage =
                document.getElementById(
                    `${page}Page`
                );


            if (targetPage) {

                targetPage.classList.add(
                    "active"
                );

            }

        }
    );

});


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    async () => {

        const confirmed =
            confirm(
                "می‌خواهی از حساب NOVA خارج شوی؟"
            );


        if (!confirmed) {

            return;

        }


        try {

            await fetch(
                `${API_URL}/api/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        } catch (error) {

            console.error(error);

        }


        window.location.href =
            "index.html";

    }
);


/* =========================
   PROFILE
========================= */

const profileDisplayName =
    document.getElementById(
        "profileDisplayName"
    );

const profileUsername =
    document.getElementById(
        "profileUsername"
    );

const profileBio =
    document.getElementById(
        "profileBio"
    );

const profileAvatar =
    document.getElementById(
        "profileAvatar"
    );

const profileStats =
    document.querySelectorAll(
        ".profile-stat strong"
    );

const editProfileButton =
    document.getElementById(
        "editProfileButton"
    );

const profileEditOverlay =
    document.getElementById(
        "profileEditOverlay"
    );

const closeProfileEdit =
    document.getElementById(
        "closeProfileEdit"
    );

const profileEditForm =
    document.getElementById(
        "profileEditForm"
    );

const editDisplayName =
    document.getElementById(
        "editDisplayName"
    );

const editBio =
    document.getElementById(
        "editBio"
    );


let currentProfile = null;


/* Load profile */

async function loadProfile() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/profile`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            return;

        }


        const data =
            await response.json();


        if (!data.success) {

            return;

        }


        currentProfile =
            data.profile;


        renderProfile(
            currentProfile
        );

        

    } catch (error) {

        console.error(error);

    }

}





/* Render profile */

function renderProfile(profile) {

    const displayName =
        profile.display_name ||
        profile.username;


    profileDisplayName.textContent =
        displayName;


    profileUsername.textContent =
        `@${profile.username}`;


    profileBio.textContent =
        profile.bio ||
        "هنوز Bio نوشته نشده.";


    profileAvatar.textContent =
        profile.username
            .charAt(0)
            .toUpperCase();


    if (profileStats.length > 0) {

    profileStats[0].textContent =
        profile.posts_count || 0;

}

renderAvatar(profile.avatar_id || 1);

}


/* Open edit */

editProfileButton.addEventListener(
    "click",
    () => {

        if (!currentProfile) {

            return;

        }


        editDisplayName.value =
            currentProfile.display_name || "";


        editBio.value =
            currentProfile.bio || "";


        profileEditOverlay.classList.add(
            "active"
        );

    }
);


/* Close edit */

closeProfileEdit.addEventListener(
    "click",
    () => {

        profileEditOverlay.classList.remove(
            "active"
        );

    }
);


/* Save profile */

profileEditForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const displayName =
            editDisplayName.value.trim();


        const bio =
            editBio.value.trim();


        const button =
            profileEditForm.querySelector(
                ".profile-save-button"
            );


        button.disabled = true;

        button.textContent =
            "در حال ذخیره...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/profile`,
                    {
                        method: "PUT",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            display_name:
                                displayName,

                            bio:
                                bio
                        })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "ذخیره اطلاعات ناموفق بود."
                );

                return;

            }


            currentProfile =
                data.profile;


            renderProfile(
                currentProfile
            );


            profileEditOverlay.classList.remove(
                "active"
            );


        } catch (error) {

            console.error(error);

            alert(
                "ارتباط با سرور برقرار نشد."
            );


        } finally {

            button.disabled = false;

            button.textContent =
                "ذخیره تغییرات";

        }

    }
);


/* Load profile */

loadProfile();



/* =========================
   AVATAR SELECTOR
========================= */

const avatarSelectorOverlay =
    document.getElementById("avatarSelectorOverlay");

const closeAvatarSelector =
    document.getElementById("closeAvatarSelector");

const avatarHits =
    document.querySelectorAll(".avatar-hit");

const selectedAvatarNumber =
    document.getElementById("selectedAvatarNumber");

const confirmAvatarButton =
    document.getElementById("confirmAvatarButton");


let selectedAvatar = 1;


/* Real positions from NOVA avatar sheet */

const avatarPositions = {
    1:  { x: "7.9%",  y: "19.5%" },
    2:  { x: "36.3%", y: "19.5%" },
    3:  { x: "63.9%", y: "19.5%" },
    4:  { x: "91.6%", y: "19.4%" },

    5:  { x: "8.3%",  y: "43.5%" },
    6:  { x: "36.0%", y: "43.5%" },
    7:  { x: "63.6%", y: "43.4%" },
    8:  { x: "91.2%", y: "43.5%" },

    9:  { x: "7.6%",  y: "66.8%" },
    10: { x: "35.9%", y: "66.6%" },
    11: { x: "63.5%", y: "66.8%" },
    12: { x: "91.4%", y: "66.9%" },

    13: { x: "7.8%",  y: "89.7%" },
    14: { x: "35.7%", y: "90.2%" },
    15: { x: "63.5%", y: "90.2%" },
    16: { x: "91.6%", y: "90.3%" }
};


/* Apply avatar to profile */

function renderAvatar(avatarId) {

    const position = avatarPositions[avatarId];

    if (!position) return;

    profileAvatar.textContent = "";

    profileAvatar.classList.add("has-avatar");

    profileAvatar.style.setProperty(
        "--avatar-pos-x",
        position.x
    );

    profileAvatar.style.setProperty(
        "--avatar-pos-y",
        position.y
    );
}


/* Select avatar inside selector */

function selectAvatar(avatarId) {

    selectedAvatar = Number(avatarId);

    avatarHits.forEach((item) => {
        item.classList.toggle(
            "selected",
            Number(item.dataset.avatar) === selectedAvatar
        );
    });

    selectedAvatarNumber.textContent = selectedAvatar;
}


/* Open selector */

profileAvatar.addEventListener("click", () => {

    avatarSelectorOverlay.classList.add("active");

    selectAvatar(
        currentProfile?.avatar_id || 1
    );

});


/* Close selector */

closeAvatarSelector.addEventListener("click", () => {
    avatarSelectorOverlay.classList.remove("active");
});


/* Click outside */

avatarSelectorOverlay.addEventListener("click", (event) => {

    if (event.target === avatarSelectorOverlay) {
        avatarSelectorOverlay.classList.remove("active");
    }

});


/* Avatar clicks */

avatarHits.forEach((avatar) => {

    avatar.addEventListener("click", () => {

        selectAvatar(
            avatar.dataset.avatar
        );

    });

});


/* Save avatar */

confirmAvatarButton.addEventListener("click", async () => {

    confirmAvatarButton.disabled = true;
    confirmAvatarButton.textContent = "در حال ذخیره...";

    try {

        const response = await fetch(
            `${API_URL}/api/profile/avatar`,
            {
                method: "PUT",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    avatar_id: selectedAvatar
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "ذخیره آواتار ناموفق بود."
            );

            return;
        }

        currentProfile.avatar_id =
            data.avatar_id;

        renderAvatar(
            data.avatar_id
        );

        avatarSelectorOverlay.classList.remove(
            "active"
        );

    } catch (error) {

        console.error(error);

        alert(
            "ارتباط با سرور برقرار نشد."
        );

    } finally {

        confirmAvatarButton.disabled = false;
        confirmAvatarButton.textContent =
            "انتخاب آواتار";

    }

});


/* =========================
   HOME / POSTS
========================= */

const postContent =
    document.getElementById(
        "postContent"
    );

const postCounter =
    document.getElementById(
        "postCounter"
    );

const publishPostButton =
    document.getElementById(
        "publishPostButton"
    );

const feedList =
    document.getElementById(
        "feedList"
    );

const refreshFeedButton =
    document.getElementById(
        "refreshFeedButton"
    );

const createPostAvatar =
    document.getElementById(
        "createPostAvatar"
    );


/* =========================
   PET MESSAGE
========================= */

const novaPetMessage =
    document.getElementById(
        "novaPetMessage"
    );


const petMessages = [

    "GOOD TO SEE YOU AGAIN.",

    "WELCOME BACK, LEGEND.",

    "READY FOR SOMETHING NEW?",

    "KEEP BUILDING YOUR WORLD.",

    "YOUR STORY CONTINUES.",

    "LET'S MAKE TODAY COUNT.",

    "NOVA MISSED YOU.",

    "SOMETHING GREAT STARTS HERE."

];


function showPetMessage(
    customMessage = null
) {

    if (!novaPetMessage) {

        return;

    }


    const message =
        customMessage ||
        petMessages[
            Math.floor(
                Math.random() *
                petMessages.length
            )
        ];


    novaPetMessage.textContent =
        message;


    novaPetMessage.style.opacity =
        "0";


    novaPetMessage.style.transition =
        "opacity 0.5s ease";


    requestAnimationFrame(() => {

        novaPetMessage.style.opacity =
            "1";

    });


    clearTimeout(
        showPetMessage.hideTimer
    );


    showPetMessage.hideTimer =
        setTimeout(() => {

            novaPetMessage.style.opacity =
                "0";

        }, 4200);

}


showPetMessage();


/* =========================
   3D NOVA PET
========================= */

function initNovaPet() {

    const container =
        document.getElementById(
            "novaPetCanvas"
        );


    if (!container) {

        return;

    }


    /* Scene */

    const scene =
        new THREE.Scene();


    /* Camera */

    const camera =
        new THREE.PerspectiveCamera(
            35,
            container.clientWidth /
            container.clientHeight,
            0.1,
            100
        );


    camera.position.set(
        0,
        1.15,
        5.5
    );


    /* Renderer */

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
        container.clientWidth,
        container.clientHeight
    );


    renderer.outputColorSpace =
        THREE.SRGBColorSpace;


    renderer.shadowMap.enabled =
        true;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    container.appendChild(
        renderer.domElement
    );


    /* Lights */

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


    mainLight.castShadow =
        true;


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


    /* Pet */

    const pet =
        new THREE.Group();


    pet.position.y =
        -0.65;


    scene.add(pet);


    /* Materials */

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


    /* Body */

    const body =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.72,
                32,
                24
            ),
            bodyMaterial
        );


    body.scale.set(
        1,
        1.08,
        0.85
    );


    body.position.y =
        0.72;


    body.castShadow =
        true;


    body.receiveShadow =
        true;


    pet.add(body);


    /* Head */

    const head =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.78,
                32,
                24
            ),
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


    head.castShadow =
        true;


    pet.add(head);


    /* Ears */

    function createEar(
        x,
        rotationZ
    ) {

        const ear =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.25,
                    0.65,
                    16
                ),
                bodyMaterial
            );


        ear.position.set(
            x,
            2.18,
            0
        );


        ear.rotation.z =
            rotationZ;


        ear.castShadow =
            true;


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


    /* Eyes */

    function createEye(x) {

        const eye =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.105,
                    20,
                    16
                ),
                eyeMaterial
            );


        eye.position.set(
            x,
            1.63,
            0.72
        );


        eye.scale.y =
            1.15;


        pet.add(eye);


        return eye;

    }


    const leftEye =
        createEye(-0.25);


    const rightEye =
        createEye(0.25);


    /* Eye glow */

    function createEyeGlow(x) {

        const glow =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.16,
                    16,
                    12
                ),
                new THREE.MeshBasicMaterial({
                    color: 0x9d6cff,
                    transparent: true,
                    opacity: 0.16
                })
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


    /* Mouth */

    const mouth =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.08,
                0.025,
                8,
                16,
                Math.PI
            ),
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


    /* Feet */

    function createFoot(x) {

        const foot =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.28,
                    20,
                    16
                ),
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


        foot.castShadow =
            true;


        pet.add(foot);


        return foot;

    }


    createFoot(-0.38);
    createFoot(0.38);


    /* Tail */

    const tail =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.38,
                0.11,
                12,
                24,
                Math.PI * 1.5
            ),
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


    tail.castShadow =
        true;


    pet.add(tail);


    /* Ground glow */

    const ground =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                1.5,
                64
            ),
            new THREE.MeshBasicMaterial({
                color: 0x8b5cf6,
                transparent: true,
                opacity: 0.10
            })
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.scale.set(
        1,
        0.45,
        1
    );


    scene.add(ground);


    /* =====================
       ANIMATION
    ===================== */

    const clock =
        new THREE.Clock();


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


    let lookX = 0;

    let targetLookX = 0;


    function startBlink() {

        if (blinking) {

            return;

        }


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


        if (!blinking) {

            return;

        }


        blinkProgress += delta;


        let value;


        if (
            blinkProgress < 0.07
        ) {

            value =
                1 -
                blinkProgress /
                0.07;

        } else if (
            blinkProgress < 0.14
        ) {

            value =
                (
                    blinkProgress -
                    0.07
                ) /
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


        if (actionType === 0) {

            if (
                actionProgress < 0.4
            ) {

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


        if (actionType === 1) {

            tail.rotation.y =
                Math.sin(
                    actionProgress * 7
                ) * 0.35;

        }


        if (actionType === 2) {

            pet.rotation.z =
                Math.sin(
                    actionProgress * 4
                ) * 0.035;

        }


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


    function animate() {

        requestAnimationFrame(
            animate
        );


        const delta =
            clock.getDelta();


        const time =
            clock.elapsedTime;


        /* Breathing */

        const breathing =
            Math.sin(
                time * 2.1
            ) * 0.025;


        body.scale.y =
            1.08 + breathing;


        head.position.y =
            1.55 +
            breathing * 0.7;


        /* Floating */

        pet.position.y =
            -0.65 +
            Math.sin(
                time * 1.7
            ) * 0.035;


        /* Tail */

        if (
            actionType !== 1
        ) {

            tail.rotation.y =
                Math.sin(
                    time * 1.4
                ) * 0.16;

        }


        /* Ears */

        if (
            actionType !== 3
        ) {

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


        /* Eye glow */

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


        /* Blink */

        updateBlink(delta);


        /* Random action */

        updateAction(delta);


        /* Look */

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


        /* Camera */

        camera.lookAt(
            0,
            1,
            0
        );


        renderer.render(
            scene,
            camera
        );

    }


    /* Resize */

    function resizePet() {

        const width =
            container.clientWidth;

        const height =
            container.clientHeight;


        if (
            width === 0 ||
            height === 0
        ) {

            return;

        }


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height
        );

    }


    window.addEventListener(
        "resize",
        resizePet
    );


    chooseAction();

    resizePet();

    animate();

}


/* Start 3D pet */

initNovaPet();


/* =========================
   POST COUNTER
========================= */

postContent.addEventListener(
    "input",
    () => {

        const length =
            postContent.value.length;


        postCounter.textContent =
            `${length} / 2000`;

    }
);


/* =========================
   LOAD FEED
========================= */

async function loadFeed() {

    feedList.innerHTML = `
        <div class="feed-loading">
            Loading your feed...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${API_URL}/api/posts`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            feedList.innerHTML = `
                <div class="feed-loading">
                    نتوانستیم پست‌ها را دریافت کنیم.
                </div>
            `;

            return;

        }


        renderFeed(
            data.posts
        );


    } catch (error) {

        console.error(error);


        feedList.innerHTML = `
            <div class="feed-loading">
                ارتباط با سرور برقرار نشد.
            </div>
        `;

    }

}


/* =========================
   RENDER FEED
========================= */

function renderFeed(posts) {

    if (!posts.length) {

        feedList.innerHTML = `
            <div class="feed-loading">
                هنوز هیچ پستی ساخته نشده ✦
            </div>
        `;

        return;
    }

    feedList.innerHTML =
        posts.map(post => {

            const name =
                post.user.display_name ||
                post.user.username;

            const initial =
                post.user.username
                    .charAt(0)
                    .toUpperCase();

            const likesCount =
                Number(post.likes_count) || 0;

            const likedByMe =
                Boolean(post.liked_by_me);

            return `

                <article
                    class="feed-post"
                    data-post-id="${post.id}"
                >

                    <div class="feed-post-header">

                        <div class="feed-post-avatar">
                            ${escapeHtml(initial)}
                        </div>

                        <div class="feed-post-user">

                            <strong>
                                ${escapeHtml(name)}
                            </strong>

                            <span>
                                @${escapeHtml(
                                    post.user.username
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="feed-post-content">
                        ${escapeHtml(post.content)}
                    </div>


<div class="feed-post-actions">

    <button
        class="post-like-button ${likedByMe ? "liked" : ""}"
        data-post-id="${post.id}"
        type="button"
        aria-label="Like post"
    >

        <span class="like-ripple"></span>

        <span class="post-like-icon">

            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7C3.2 5.9 5.3 4 7.9 4c1.6 0 3 .8 4.1 2.1C13.1 4.8 14.5 4 16.1 4c2.6 0 4.7 1.9 4.7 4.7Z"
                />
            </svg>

        </span>

        <span class="post-like-count">
            ${likesCount}
        </span>

    </button>


    <button
        class="post-comment-button"
        data-post-id="${post.id}"
        type="button"
        aria-label="Comments"
    >

        <span class="post-comment-icon">

            <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    d="M5 5.5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H11l-4.5 3v-3H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z"
                />
            </svg>

        </span>

        <span class="post-comment-count">
            ${post.comments_count || 0}
        </span>

    </button>

</div>

                </article>

            `;

        }).join("");
}


/* =========================
   POST LIKE INTERACTION
========================= */

feedList.addEventListener("click", async (event) => {

    const button =
        event.target.closest(
            ".post-like-button"
        );

    if (!button) {
        return;
    }

    const postId =
        button.dataset.postId;

    const isLiked =
        button.classList.contains("liked");

    const countElement =
        button.querySelector(
            ".post-like-count"
        );

    const icon =
        button.querySelector(
            ".post-like-icon"
        );

    try {

        button.disabled = true;

        const response =
            await fetch(
                `${API_URL}/api/posts/${postId}/like`,
                {
                    method:
                        isLiked
                            ? "DELETE"
                            : "POST",

                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok ||
            !data.success) {

            console.error(
                "Like error:",
                data
            );

            return;
        }

        const currentCount =
            Number(
                countElement.textContent
            ) || 0;

        const newCount =
            isLiked
                ? Math.max(0, currentCount - 1)
                : currentCount + 1;


        if (isLiked) {

            button.classList.remove(
                "liked"
            );

        } else {

            button.classList.add(
                "liked"
            );

            button.classList.remove(
                "like-pop"
            );

            void button.offsetWidth;

            button.classList.add(
                "like-pop"
            );
        }


        countElement.textContent =
            newCount;

    } catch (error) {

        console.error(
            "Like request failed:",
            error
        );

    } finally {

        button.disabled = false;
    }

});





    /* =========================
       LIKE BUTTONS
    ========================= */

    const likeButtons =
        feedList.querySelectorAll(
            ".post-like-button"
        );


    likeButtons.forEach(button => {

        button.addEventListener(
            "click",
            async () => {

                if (button.dataset.loading === "true") {
                    return;
                }


                const postId =
                    button.dataset.postId;


                const isLiked =
                    button.classList.contains("liked");


                const countElement =
                    button.querySelector(
                        ".post-like-count"
                    );


                const iconElement =
                    button.querySelector(
                        ".post-like-icon"
                    );


                button.dataset.loading = "true";


                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/posts/${postId}/like`,
                            {
                                method:
                                    isLiked
                                        ? "DELETE"
                                        : "POST",

                                credentials:
                                    "include"
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        alert(
                            data.message ||
                            "عملیات لایک انجام نشد."
                        );

                        return;

                    }


                    const currentCount =
                        Number(
                            countElement.textContent
                        ) || 0;


                    if (data.liked) {

                        button.classList.add(
                            "liked"
                        );

                        iconElement.textContent =
                            "♥";

                        countElement.textContent =
                            currentCount + 1;

                    } else {

                        button.classList.remove(
                            "liked"
                        );

                        iconElement.textContent =
                            "♡";

                        countElement.textContent =
                            Math.max(
                                0,
                                currentCount - 1
                            );

                    }

                } catch (error) {

                    console.error(error);

                    alert(
                        "ارتباط با سرور برقرار نشد."
                    );

                } finally {

                    button.dataset.loading =
                        "false";

                }

            }
        );

    });




/* =====================================================
   NOVA COMMENTS
===================================================== */

feedList.addEventListener("click", async (event) => {

    const button = event.target.closest(
        ".post-comment-button"
    );

    if (!button) {
        return;
    }

    const postId = button.dataset.postId;

    const post = button.closest(".feed-post");

    if (!post) {
        return;
    }

    let panel = post.querySelector(
        ".post-comments-panel"
    );

    /* اگر پنل وجود ندارد، بساز */

    if (!panel) {

        panel = document.createElement("div");

        panel.className =
            "post-comments-panel";

        panel.innerHTML = `

            <div class="comments-panel-header">

                <div>
                    <strong>Comments</strong>

                    <span class="comments-panel-count">
                        0
                    </span>
                </div>

                <button
                    class="comments-close-button"
                    type="button"
                    aria-label="Close comments"
                >
                    ×
                </button>

            </div>

            <div class="comments-list">

                <div class="comments-loading">
                    Loading comments...
                </div>

            </div>

            <div class="comment-input-area">

                <input
                    class="comment-input"
                    type="text"
                    maxlength="500"
                    placeholder="Write a comment..."
                >

                <button
                    class="comment-send-button"
                    type="button"
                >

                    <span>➤</span>

                </button>

            </div>

        `;

        post.appendChild(panel);

        /* شروع انیمیشن */

        requestAnimationFrame(() => {

            panel.classList.add(
                "comments-open"
            );

        });

        await loadComments(
            postId,
            panel
        );

    } else {

        /* باز و بسته کردن */

        panel.classList.toggle(
            "comments-open"
        );

    }

});


/* =====================================================
   LOAD COMMENTS
===================================================== */

async function loadComments(
    postId,
    panel
) {

    const list =
        panel.querySelector(
            ".comments-list"
        );

    const count =
        panel.querySelector(
            ".comments-panel-count"
        );

    try {

        const response =
            await fetch(
                `${API_URL}/api/posts/${postId}/comments`,
                {
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            list.innerHTML = `
                <div class="comments-empty">
                    Failed to load comments.
                </div>
            `;

            return;
        }

        count.textContent =
            data.count;

        if (!data.comments.length) {

            list.innerHTML = `
                <div class="comments-empty">
                    هنوز کامنتی وجود نداره ✦
                </div>
            `;

            return;
        }

        list.innerHTML =
            data.comments
                .map((comment, index) => {

                    const name =
                        comment.user.display_name ||
                        comment.user.username;

                    const initial =
                        comment.user.username
                            .charAt(0)
                            .toUpperCase();

                    return `

                        <div
                            class="comment-item"
                            style="--comment-index:${index}"
                        >

                            <div class="comment-avatar">
                                ${escapeHtml(initial)}
                            </div>

                            <div class="comment-body">

                                <div class="comment-user">

                                    <strong>
                                        ${escapeHtml(name)}
                                    </strong>

                                    <span>
                                        @${escapeHtml(
                                            comment.user.username
                                        )}
                                    </span>

                                </div>

                                <div class="comment-text">
                                    ${escapeHtml(
                                        comment.content
                                    )}
                                </div>

                            </div>

                        </div>

                    `;

                })
                .join("");

    } catch (error) {

        console.error(
            "Comments load error:",
            error
        );

        list.innerHTML = `
            <div class="comments-empty">
                ارتباط با سرور برقرار نشد.
            </div>
        `;
    }
}    


/* =====================================================
   CREATE COMMENT
===================================================== */

async function createComment(postId, panel) {

    const input =
        panel.querySelector(".comment-input");

    const sendButton =
        panel.querySelector(".comment-send-button");

    const content =
        input.value.trim();

    if (!content) {
        input.focus();
        return;
    }

    try {

        sendButton.disabled = true;
        sendButton.classList.add("sending");

        const response =
            await fetch(
                `${API_URL}/api/posts/${postId}/comments`,
                {
                    method: "POST",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        content: content
                    })
                }
            );

        const data =
            await response.json();

        if (
            !response.ok ||
            !data.success
        ) {

            alert(
                data.message ||
                "ارسال کامنت ناموفق بود."
            );

            return;
        }

        /* پاک کردن Input */

        input.value = "";

        /* اضافه کردن کامنت جدید */

        const list =
            panel.querySelector(
                ".comments-list"
            );

        const comment =
            data.comment;

        const name =
            comment.user.display_name ||
            comment.user.username;

        const initial =
            comment.user.username
                .charAt(0)
                .toUpperCase();

        const commentElement =
            document.createElement("div");

        commentElement.className =
            "comment-item comment-new";

        commentElement.innerHTML = `

            <div class="comment-avatar">
                ${escapeHtml(initial)}
            </div>

            <div class="comment-body">

                <div class="comment-user">

                    <strong>
                        ${escapeHtml(name)}
                    </strong>

                    <span>
                        @${escapeHtml(
                            comment.user.username
                        )}
                    </span>

                </div>

                <div class="comment-text">
                    ${escapeHtml(
                        comment.content
                    )}
                </div>

            </div>

        `;

        /* اگر پیام خالی قبلی وجود دارد حذفش کن */

        const emptyMessage =
            list.querySelector(
                ".comments-empty"
            );

        if (emptyMessage) {
            emptyMessage.remove();
        }

        list.appendChild(
            commentElement
        );

        /* اسکرول به کامنت جدید */

        requestAnimationFrame(() => {

            list.scrollTo({
                top: list.scrollHeight,
                behavior: "smooth"
            });

        });

        /* آپدیت شمارنده پنل */

        const panelCount =
            panel.querySelector(
                ".comments-panel-count"
            );

        const currentCount =
            Number(
                panelCount.textContent
            ) || 0;

        panelCount.textContent =
            currentCount + 1;

        /* آپدیت شمارنده روی خود پست */

        const post =
            panel.closest(".feed-post");

        if (post) {

            const postCount =
                post.querySelector(
                    ".post-comment-count"
                );

            if (postCount) {

                const currentPostCount =
                    Number(
                        postCount.textContent
                    ) || 0;

                postCount.textContent =
                    currentPostCount + 1;

            }

        }

    } catch (error) {

        console.error(
            "Create comment error:",
            error
        );

        alert(
            "ارتباط با سرور برقرار نشد."
        );

    } finally {

        sendButton.disabled = false;

        sendButton.classList.remove(
            "sending"
        );

        input.focus();
    }
}


/* =====================================================
   COMMENT SEND EVENTS
===================================================== */

feedList.addEventListener("click", (event) => {

    const sendButton =
        event.target.closest(
            ".comment-send-button"
        );

    if (!sendButton) {
        return;
    }

    const panel =
        sendButton.closest(
            ".post-comments-panel"
        );

    const post =
        sendButton.closest(
            ".feed-post"
        );

    if (!panel || !post) {
        return;
    }

    const postId =
        post.dataset.postId;

    createComment(
        postId,
        panel
    );

});


feedList.addEventListener("keydown", (event) => {

    if (
        event.key !== "Enter" ||
        event.shiftKey
    ) {
        return;
    }

    const input =
        event.target.closest(
            ".comment-input"
        );

    if (!input) {
        return;
    }

    event.preventDefault();

    const panel =
        input.closest(
            ".post-comments-panel"
        );

    const post =
        input.closest(
            ".feed-post"
        );

    if (!panel || !post) {
        return;
    }

    createComment(
        post.dataset.postId,
        panel
    );

});



/* =========================
   ESCAPE HTML
========================= */

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


/* =========================
   PUBLISH
========================= */

publishPostButton.addEventListener(
    "click",
    async () => {

        const content =
            postContent.value.trim();


        if (!content) {

            alert(
                "اول چیزی برای پست کردن بنویس."
            );

            postContent.focus();

            return;

        }


        publishPostButton.disabled =
            true;


        publishPostButton.textContent =
            "در حال انتشار...";


        try {

            const response =
                await fetch(
                    `${API_URL}/api/posts`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                content:
                                    content
                            })
                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                alert(
                    data.message ||
                    "ساخت پست ناموفق بود."
                );

                return;

            }


            postContent.value =
                "";


            postCounter.textContent =
                "0 / 2000";


            await loadFeed();


            showPetMessage(
                "NICE ONE. KEEP SHARING."
            );


        } catch (error) {

            console.error(error);


            alert(
                "ارتباط با سرور برقرار نشد."
            );


        } finally {

            publishPostButton.disabled =
                false;


            publishPostButton.textContent =
                "انتشار پست";

        }

    }
);


/* =========================
   REFRESH
========================= */

refreshFeedButton.addEventListener(
    "click",
    loadFeed
);


/* =========================
   INITIAL LOAD
========================= */

loadCurrentUser();

loadFeed();



/* =========================
   BATTLE CARDS
========================= */

const battleCardOptions =
    document.querySelectorAll(
        ".battle-card-option"
    );

const activeBattleCard =
    document.getElementById(
        "activeBattleCard"
    );

const activeBattleCardTitle =
    document.getElementById(
        "activeBattleCardTitle"
    );

const activeBattleCardDescription =
    document.getElementById(
        "activeBattleCardDescription"
    );


const battleCards = {

    cosmic: {
        title: "COSMIC NOVA",
        description: "Born beyond the stars."
    },

    void: {
        title: "VOID KING",
        description: "Silence rules the unknown."
    },

    aurora: {
        title: "AURORA",
        description: "Light finds its way."
    }

};


function renderBattleCard(card) {

    const data =
        battleCards[card];

    if (!data) {
        return;
    }

    activeBattleCardTitle.textContent =
        data.title;

    activeBattleCardDescription.textContent =
        data.description;


    activeBattleCard.className =
        "active-battle-card " +
        card + "-active";


    battleCardOptions.forEach(
        (option) => {

            option.classList.toggle(
                "active",
                option.dataset.card === card
            );

        }
    );

}


async function selectBattleCard(card) {

    console.log("SELECT BATTLE CARD START:", card);
    try {

        const response =
            await fetch(
                `${API_URL}/api/profile/battle-card`,
                {
                    method: "PUT",

                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        battle_card: card
                    })
                }
            );


        const data =
            await response.json();

        console.log("BATTLE CARD RESPONSE:", response.status);
        console.log("BATTLE CARD DATA:", data);
  

        if (!response.ok ||
            !data.success) {

            alert(
                data.message ||
                "ذخیره کارت ناموفق بود."
            );

            return;
        }


        console.log("BEFORE RENDER");

        renderBattleCard(
            data.battle_card
        );

        console.log("AFTER RENDER");


    } catch (error) {

        console.error(error);

        alert(
            "ارتباط با سرور برقرار نشد."
        );

    }

}


battleCardOptions.forEach(
    (option) => {

        option.addEventListener(
            "click",
            async (event) => {

                event.preventDefault();
                event.stopPropagation();

                const card =
                    option.dataset.card;

                await selectBattleCard(card);

            }
        );

    }
);