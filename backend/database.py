import sqlite3


DATABASE = "nova.db"


def get_connection():

    connection = sqlite3.connect(DATABASE)

    connection.row_factory = sqlite3.Row

    return connection


def init_database():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS users (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT NOT NULL UNIQUE,

            email TEXT NOT NULL UNIQUE,

            password_hash TEXT NOT NULL,

            display_name TEXT NOT NULL DEFAULT '',

            bio TEXT NOT NULL DEFAULT '',

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

        )
    """)


    # Migration برای Databaseهای قبلی



    columns = connection.execute(
        "PRAGMA table_info(users)"
    ).fetchall()

    column_names = [
        column["name"]
        for column in columns
    ]


    if "display_name" not in column_names:

        connection.execute("""
            ALTER TABLE users
            ADD COLUMN display_name TEXT NOT NULL DEFAULT ''
        """)


    if "bio" not in column_names:

        connection.execute("""
            ALTER TABLE users
            ADD COLUMN bio TEXT NOT NULL DEFAULT ''
        """)


    # =========================
    # BATTLE CARD
    # =========================

    if "battle_card" not in column_names:

        connection.execute("""
            ALTER TABLE users
            ADD COLUMN battle_card TEXT
            DEFAULT 'cosmic'
        """)

    if "avatar_id" not in column_names:
        connection.execute("""
            ALTER TABLE users
            ADD COLUMN avatar_id INTEGER
            NOT NULL DEFAULT 1
        """)
    
    connection.commit()

    connection.close()


def init_posts_table():

    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS posts (

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            user_id INTEGER NOT NULL,

            content TEXT NOT NULL,

            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

            FOREIGN KEY (user_id)
                REFERENCES users(id)
                ON DELETE CASCADE

        )
    """)

    connection.execute("""
    CREATE TABLE IF NOT EXISTS post_likes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        UNIQUE(post_id, user_id),

        FOREIGN KEY(post_id)
            REFERENCES posts(id)
            ON DELETE CASCADE,

        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
""")


    connection.execute("""
    CREATE TABLE IF NOT EXISTS post_comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        post_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY(post_id)
            REFERENCES posts(id)
            ON DELETE CASCADE,

        FOREIGN KEY(user_id)
            REFERENCES users(id)
            ON DELETE CASCADE
    )
""")

    connection.commit()

    connection.close()

