"use strict";

const signupModal = document.getElementById("signupModal");

const startButton = document.getElementById("startButton");
const signupButton = document.getElementById("signupButton");
const ctaSignup = document.getElementById("ctaSignup");

const loginButton = document.getElementById("loginButton");
const closeModal = document.getElementById("closeModal");

const modalBackdrop = document.querySelector(".modal-backdrop");

const signupForm = document.getElementById("signupForm");


/* =========================
   MODAL
========================= */

function openSignup() {

    signupModal.classList.add("active");

    document.body.style.overflow = "hidden";

    setTimeout(() => {

        document.getElementById("username")?.focus();

    }, 250);
}


function closeSignup() {

    signupModal.classList.remove("active");

    document.body.style.overflow = "";
}


startButton.addEventListener("click", openSignup);

signupButton.addEventListener("click", openSignup);

ctaSignup.addEventListener("click", openSignup);


closeModal.addEventListener("click", closeSignup);

modalBackdrop.addEventListener("click", closeSignup);


document.addEventListener("keydown", (event) => {

    if (event.key !== "Escape") {
        return;
    }

    closeSignup();

    if (
        loginModal &&
        loginModal.classList.contains("active")
    ) {
        closeLogin();
    }

});


/* =========================
   LOGIN
========================= */

/* =========================
   LOGIN MODAL
========================= */

const loginModal = document.getElementById("loginModal");

const closeLoginModal =
    document.getElementById("closeLoginModal");

const loginBackdrop =
    document.querySelector(".login-backdrop");

const loginForm =
    document.getElementById("loginForm");


function openLogin() {

    loginModal.classList.add("active");

    document.body.style.overflow = "hidden";

    setTimeout(() => {

        document
            .getElementById("loginUsername")
            ?.focus();

    }, 250);
}


function closeLogin() {

    loginModal.classList.remove("active");

    document.body.style.overflow = "";
}


loginButton.addEventListener(
    "click",
    openLogin
);


closeLoginModal.addEventListener(
    "click",
    closeLogin
);


loginBackdrop.addEventListener(
    "click",
    closeLogin
);


/* =========================
   EXPLORE
========================= */

document
    .getElementById("exploreButton")
    .addEventListener("click", () => {

        document
            .getElementById("about")
            .scrollIntoView({
                behavior: "smooth"
            });

    });


/* =========================
   REGISTER
========================= */

signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();


    const username =
        document
            .getElementById("username")
            .value
            .trim();


    const email =
        document
            .getElementById("email")
            .value
            .trim();


    const password =
        document
            .getElementById("password")
            .value;


    const confirmPassword =
        document
            .getElementById("confirmPassword")
            .value;


    /* Password confirmation */

    if (password !== confirmPassword) {

        alert("رمزهای عبور با یکدیگر یکسان نیستند.");

        return;

    }


    /* Password length */

    if (password.length < 8) {

        alert("رمز عبور باید حداقل ۸ کاراکتر باشد.");

        return;

    }


    /* Disable button while sending */

    const submitButton =
        signupForm.querySelector(".form-submit");


    submitButton.disabled = true;

    submitButton.textContent = "در حال ساخت حساب...";


    try {

        const response = await fetch(
            "https://catalogs-grew-dodge-wake.trycloudflare.com/api/register",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    email: email,
                    password: password
                })
            }
        );


        const data = await response.json();


        if (!response.ok || !data.success) {

            alert(
                data.message ||
                "ساخت حساب با خطا مواجه شد."
            );

            return;

        }


        /* Success */

        alert(
            `حساب NOVA با موفقیت ساخته شد ✦\n\nخوش آمدی ${username}`
        );


        signupForm.reset();

        closeSignup();


    } catch (error) {

        console.error(error);

        alert(
            "ارتباط با سرور برقرار نشد.\n\n" +
            "مطمئن شو Backend در حال اجراست."
        );


    } finally {

        submitButton.disabled = false;

        submitButton.textContent = "ساخت حساب";

    }

});



/* =========================
   LOGIN REQUEST
========================= */

loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            document
                .getElementById("loginUsername")
                .value
                .trim();


        const password =
            document
                .getElementById("loginPassword")
                .value;


        if (!username || !password) {

            alert(
                "نام کاربری و رمز عبور را وارد کنید."
            );

            return;

        }


        const submitButton =
            loginForm.querySelector(".form-submit");


        submitButton.disabled = true;

        submitButton.textContent =
            "در حال ورود...";


        try {

            const response =
                await fetch(
                 "https://catalogs-grew-dodge-wake.trycloudflare.com/api/login",
                   {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
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
                    "ورود ناموفق بود."
                );

                return;

            }


            loginForm.reset();

window.location.href = "app.html";


        } catch (error) {

            console.error(error);

            alert(
                "ارتباط با سرور برقرار نشد."
            );

        } finally {

            submitButton.disabled = false;

            submitButton.textContent =
                "ورود به NOVA";

        }

    }
);