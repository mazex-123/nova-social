from flask import Flask, jsonify, request, session
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

from database import get_connection, init_database, init_posts_table


import os

app = Flask(__name__)
app.secret_key = os.environ.get("NOVA_SECRET_KEY")

CORS(
    app,
    supports_credentials=True,
    origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "https://approaches-olive-earthquake-renew.trycloudflare.com"
    ]
)


# -------------------------
# Database
# -------------------------

init_database()
init_posts_table()


# -------------------------
# API Status
# -------------------------

@app.route("/api/status")
def status():

    return jsonify({
        "success": True,
        "message": "NOVA backend is running",
        "project": "NOVA",
        "version": "1.0"
    })


# -------------------------
# Register
# -------------------------

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400

    username = data.get("username", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({
            "success": False,
            "message": "همه فیلدها الزامی هستند."
        }), 400

    if len(username) < 3:
        return jsonify({
            "success": False,
            "message": "نام کاربری باید حداقل ۳ کاراکتر باشد."
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "رمز عبور باید حداقل ۸ کاراکتر باشد."
        }), 400

    password_hash = generate_password_hash(password)

    connection = get_connection()

    try:

        connection.execute("""
            INSERT INTO users (
                username,
                email,
                password_hash
            )
            VALUES (?, ?, ?)
        """, (
            username,
            email,
            password_hash
        ))

        connection.commit()

    except Exception as error:

        connection.close()

        if "username" in str(error).lower():
            message = "این نام کاربری قبلاً استفاده شده است."

        elif "email" in str(error).lower():
            message = "این ایمیل قبلاً استفاده شده است."

        else:
            message = "خطایی هنگام ساخت حساب رخ داد."

        return jsonify({
            "success": False,
            "message": message
        }), 409

    connection.close()

    return jsonify({
        "success": True,
        "message": "حساب NOVA با موفقیت ساخته شد.",
        "user": {
            "username": username,
            "email": email
        }
    }), 201


# -------------------------
# Login
# -------------------------

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({
            "success": False,
            "message": "نام کاربری و رمز عبور الزامی هستند."
        }), 400

    connection = get_connection()

    user = connection.execute("""
        SELECT id, username, email, password_hash
        FROM users
        WHERE username = ?
    """, (username,)).fetchone()

    connection.close()

    if not user:

        return jsonify({
            "success": False,
            "message": "نام کاربری یا رمز عبور اشتباه است."
        }), 401

    if not check_password_hash(
        user["password_hash"],
        password
    ):

        return jsonify({
            "success": False,
            "message": "نام کاربری یا رمز عبور اشتباه است."
        }), 401

    session["user_id"] = user["id"]

    session["username"] = user["username"]

    return jsonify({
        "success": True,
        "message": "ورود موفقیت‌آمیز بود.",
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"]
        }
    }), 200


# -------------------------
# Current User
# -------------------------

@app.route("/api/me")
def current_user():

    user_id = session.get("user_id")

    if not user_id:

        return jsonify({
            "success": False,
            "authenticated": False
        }), 401

    connection = get_connection()

    user = connection.execute("""
        SELECT id, username, email, created_at
        FROM users
        WHERE id = ?
    """, (user_id,)).fetchone()

    connection.close()

    if not user:

        session.clear()

        return jsonify({
            "success": False,
            "authenticated": False
        }), 401

    return jsonify({
        "success": True,
        "authenticated": True,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "created_at": user["created_at"]
        }
    })



# -------------------------
# Get Profile
# -------------------------

@app.route("/api/profile", methods=["GET"])
def get_profile():

    user_id = session.get("user_id")

    if not user_id:

        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401


    connection = get_connection()

    user = connection.execute("""
        SELECT
            id,
            username,
            email,
            display_name,
            bio,
            battle_card,
            avatar_id,
            created_at
        FROM users
        WHERE id = ?
    """, (user_id,)).fetchone()


    posts_count = connection.execute("""
    SELECT COUNT(*)
    FROM posts
    WHERE user_id = ?
""", (user_id,)).fetchone()[0]

    connection.close()


    if not user:

        session.clear()

        return jsonify({
            "success": False,
            "message": "کاربر پیدا نشد."
        }), 404


    return jsonify({

        "success": True,

        "profile": {

            "id": user["id"],

            "username": user["username"],

            "email": user["email"],

            "display_name": user["display_name"],

            "bio": user["bio"],

            "battle_card": user["battle_card"] or "cosmic",

            "avatar_id": user["avatar_id"] or 1,

            "posts_count": posts_count,

            "created_at": user["created_at"]

        }

    })



# -------------------------
# Update Profile
# -------------------------

@app.route("/api/profile", methods=["PUT"])
def update_profile():

    user_id = session.get("user_id")

    if not user_id:

        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401


    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400


    display_name = data.get(
        "display_name",
        ""
    ).strip()


    bio = data.get(
        "bio",
        ""
    ).strip()


    if len(display_name) > 50:

        return jsonify({
            "success": False,
            "message": "نام نمایشی نمی‌تواند بیشتر از ۵۰ کاراکتر باشد."
        }), 400


    if len(bio) > 160:

        return jsonify({
            "success": False,
            "message": "Bio نمی‌تواند بیشتر از ۱۶۰ کاراکتر باشد."
        }), 400


    connection = get_connection()


    connection.execute("""
        UPDATE users

        SET
            display_name = ?,
            bio = ?

        WHERE id = ?
    """, (
        display_name,
        bio,
        user_id
    ))


    connection.commit()


    user = connection.execute("""
        SELECT
            id,
            username,
            email,
            display_name,
            bio,
            battle_card,
            avatar_id,
            created_at
        FROM users
        WHERE id = ?
    """, (user_id,)).fetchone()


    connection.close()


    return jsonify({

        "success": True,

        "message": "پروفایل با موفقیت به‌روزرسانی شد.",

        "profile": {

            "id": user["id"],

            "username": user["username"],

            "email": user["email"],

            "display_name": user["display_name"],

            "bio": user["bio"],

            "battle_card": user["battle_card"] or "cosmic",

            "avatar_id": user["avatar_id"] or 1,

            "created_at": user["created_at"]

        }

    })



# -------------------------
# Posts
# -------------------------

@app.route("/api/posts", methods=["POST"])
def create_post():

    user_id = session.get("user_id")

    if not user_id:

        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401


    data = request.get_json()

    if not data:

        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400


    content = data.get(
        "content",
        ""
    ).strip()


    if not content:

        return jsonify({
            "success": False,
            "message": "متن پست نمی‌تواند خالی باشد."
        }), 400


    if len(content) > 2000:

        return jsonify({
            "success": False,
            "message": "پست نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد."
        }), 400


    connection = get_connection()


    cursor = connection.execute("""
        INSERT INTO posts (
            user_id,
            content
        )
        VALUES (?, ?)
    """, (
        user_id,
        content
    ))


    connection.commit()


    post_id = cursor.lastrowid


    connection.close()


    return jsonify({

        "success": True,

        "message": "پست با موفقیت ساخته شد.",

        "post_id": post_id

    }), 201



@app.route("/api/posts", methods=["GET"])
def get_posts():

    user_id = session.get("user_id")

    if not user_id:

        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401


    connection = get_connection()


    posts = connection.execute("""
        SELECT

            posts.id,

            posts.content,

            posts.created_at,

            users.id AS user_id,

            users.username,

            users.display_name,


            /* =========================
               LIKE COUNT
            ========================= */

            (
                SELECT COUNT(*)
                FROM post_likes
                WHERE post_id = posts.id
            ) AS likes_count,


            /* =========================
               MY LIKE STATUS
            ========================= */

            EXISTS(
                SELECT 1
                FROM post_likes
                WHERE post_id = posts.id
                AND user_id = ?
            ) AS liked_by_me,


            /* =========================
               COMMENT COUNT
            ========================= */

            (
                SELECT COUNT(*)
                FROM post_comments
                WHERE post_id = posts.id
            ) AS comments_count


        FROM posts


        INNER JOIN users
            ON users.id = posts.user_id


        ORDER BY posts.id DESC


        LIMIT 50

    """, (
        user_id,
    )).fetchall()


    result = []


    for post in posts:

        result.append({

            "id":
                post["id"],

            "content":
                post["content"],

            "created_at":
                post["created_at"],


            "likes_count":
                post["likes_count"],

            "liked_by_me":
                bool(
                    post["liked_by_me"]
                ),


            "comments_count":
                post["comments_count"],


            "user": {

                "id":
                    post["user_id"],

                "username":
                    post["username"],

                "display_name":
                    post["display_name"]
                    or post["username"]

            }

        })


    connection.close()


    return jsonify({

        "success": True,

        "posts":
            result

    }), 200


@app.route("/api/profile/posts", methods=["GET"])
def get_my_posts():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    connection = get_connection()

    posts = connection.execute("""
        SELECT
            posts.id,
            posts.content,
            posts.created_at,

            (
                SELECT COUNT(*)
                FROM post_likes
                WHERE post_id = posts.id
            ) AS likes_count,

            EXISTS(
                SELECT 1
                FROM post_likes
                WHERE post_id = posts.id
                AND user_id = ?
            ) AS liked_by_me,

            (
                SELECT COUNT(*)
                FROM post_comments
                WHERE post_id = posts.id
            ) AS comments_count

        FROM posts

        WHERE posts.user_id = ?

        ORDER BY posts.id DESC

        LIMIT 50
    """, (user_id, user_id)).fetchall()

    result = []

    for post in posts:
        result.append({
            "id": post["id"],
            "content": post["content"],
            "created_at": post["created_at"],
            "likes_count": post["likes_count"],
            "liked_by_me": bool(post["liked_by_me"]),
            "comments_count": post["comments_count"]
        })

    connection.close()

    return jsonify({
        "success": True,
        "posts": result
    }), 200


    connection.close()


    result = []


    for post in posts:

        result.append({

            "id": post["id"],

            "content": post["content"],

            "created_at": post["created_at"],

            "likes_count": post["likes_count"],

            "liked_by_me": bool(post["liked_by_me"]),

            "user": {

                "id": post["user_id"],

                "username": post["username"],

                "display_name": post["display_name"]

            }

        })


    return jsonify({

        "success": True,

        "posts": result

    })


# =========================
# POST LIKES
# =========================

@app.route("/api/posts/<int:post_id>/like", methods=["POST"])
def like_post(post_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    connection = get_connection()

    try:

        connection.execute("""
            INSERT INTO post_likes (
                post_id,
                user_id
            )
            VALUES (?, ?)
        """, (
            post_id,
            user_id
        ))

        connection.commit()

    except Exception:

        connection.close()

        return jsonify({
            "success": False,
            "message": "این پست قبلاً لایک شده است."
        }), 400

    connection.close()

    return jsonify({
        "success": True,
        "liked": True
    }), 200


@app.route("/api/posts/<int:post_id>/like", methods=["DELETE"])
def unlike_post(post_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    connection = get_connection()

    connection.execute("""
        DELETE FROM post_likes
        WHERE post_id = ?
        AND user_id = ?
    """, (
        post_id,
        user_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "liked": False
    }), 200


# =========================
# POST COMMENTS
# =========================

@app.route("/api/posts/<int:post_id>/comments", methods=["POST"])
def create_comment(post_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400

    content = data.get(
        "content",
        ""
    ).strip()

    if not content:
        return jsonify({
            "success": False,
            "message": "کامنت نمی‌تواند خالی باشد."
        }), 400

    if len(content) > 500:
        return jsonify({
            "success": False,
            "message": "کامنت نمی‌تواند بیشتر از 500 کاراکتر باشد."
        }), 400

    connection = get_connection()

    post = connection.execute("""
        SELECT id
        FROM posts
        WHERE id = ?
    """, (
        post_id,
    )).fetchone()

    if not post:
        connection.close()

        return jsonify({
            "success": False,
            "message": "پست پیدا نشد."
        }), 404

    cursor = connection.execute("""
        INSERT INTO post_comments (
            post_id,
            user_id,
            content
        )
        VALUES (?, ?, ?)
    """, (
        post_id,
        user_id,
        content
    ))

    connection.commit()

    comment_id = cursor.lastrowid

    comment = connection.execute("""
        SELECT
            post_comments.id,
            post_comments.content,
            post_comments.created_at,
            users.username,
            users.display_name
        FROM post_comments

        JOIN users
            ON users.id = post_comments.user_id

        WHERE post_comments.id = ?
    """, (
        comment_id,
    )).fetchone()

    connection.close()

    return jsonify({
        "success": True,
        "comment": {
            "id": comment["id"],
            "content": comment["content"],
            "created_at": comment["created_at"],
            "user": {
                "username": comment["username"],
                "display_name":
                    comment["display_name"]
                    or comment["username"]
            }
        }
    }), 201


@app.route("/api/posts/<int:post_id>/comments", methods=["GET"])
def get_comments(post_id):

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    connection = get_connection()

    comments = connection.execute("""
        SELECT
            post_comments.id,
            post_comments.content,
            post_comments.created_at,
            users.username,
            users.display_name

        FROM post_comments

        JOIN users
            ON users.id = post_comments.user_id

        WHERE post_comments.post_id = ?

        ORDER BY
            post_comments.created_at ASC
    """, (
        post_id,
    )).fetchall()

    connection.close()

    result = []

    for comment in comments:

        result.append({

            "id":
                comment["id"],

            "content":
                comment["content"],

            "created_at":
                comment["created_at"],

            "user": {

                "username":
                    comment["username"],

                "display_name":
                    comment["display_name"]
                    or comment["username"]

            }

        })

    return jsonify({

        "success": True,

        "comments":
            result,

        "count":
            len(result)

    }), 200


# -------------------------
# Logout
# -------------------------

@app.route("/api/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "success": True,
        "message": "با موفقیت خارج شدید."
    })


# -------------------------
# Home
# -------------------------

@app.route("/")
def home():

    return """
    <h1>NOVA Backend</h1>
    <p>Backend is running successfully.</p>
    """


# -------------------------
# Run Server
# -------------------------

@app.route("/api/profile/battle-card", methods=["PUT"])
def update_battle_card():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400

    battle_card = data.get(
        "battle_card",
        ""
    ).strip().lower()

    allowed_cards = {
        "cosmic",
        "void",
        "aurora"
    }

    if battle_card not in allowed_cards:
        return jsonify({
            "success": False,
            "message": "کارت انتخاب‌شده معتبر نیست."
        }), 400

    connection = get_connection()

    connection.execute("""
        UPDATE users
        SET battle_card = ?
        WHERE id = ?
    """, (
        battle_card,
        user_id
    ))

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "Battle Card با موفقیت ذخیره شد.",
        "battle_card": battle_card
    }), 200


@app.route("/api/profile/avatar", methods=["PUT"])
def update_avatar():

    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "لطفاً ابتدا وارد حساب شوید."
        }), 401

    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "اطلاعاتی دریافت نشد."
        }), 400

    try:
        avatar_id = int(data.get("avatar_id", 0))
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "آواتار نامعتبر است."
        }), 400

    if avatar_id < 1 or avatar_id > 16:
        return jsonify({
            "success": False,
            "message": "آواتار انتخاب‌شده معتبر نیست."
        }), 400

    connection = get_connection()

    connection.execute("""
        UPDATE users
        SET avatar_id = ?
        WHERE id = ?
    """, (avatar_id, user_id))

    connection.commit()
    connection.close()

    return jsonify({
        "success": True,
        "message": "آواتار با موفقیت ذخیره شد.",
        "avatar_id": avatar_id
    }), 200

if __name__ == "__main__":

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
