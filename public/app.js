// ==========================================
// CODEALPHA SOCIAL MEDIA PLATFORM
// APP.JS
// ==========================================

const API_URL = "/api";

// ==========================================
// ELEMENTS
// ==========================================

const loginSection =
    document.getElementById("loginSection");

const registerSection =
    document.getElementById("registerSection");

const homeSection =
    document.getElementById("homeSection");

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegisterBtn =
    document.getElementById("showRegisterBtn");

const showLoginBtn =
    document.getElementById("showLoginBtn");

const logoutBtn =
    document.getElementById("logoutBtn");

const createPostForm =
    document.getElementById("createPostForm");

const postContent =
    document.getElementById("postContent");

const postsContainer =
    document.getElementById("postsContainer");

const currentUsername =
    document.getElementById("currentUsername");


// ==========================================
// LOGIN DATA
// ==========================================

let token =
    localStorage.getItem("token");

let loggedInUser =
    JSON.parse(
        localStorage.getItem("user")
    ) || null;


// ==========================================
// PAGE LOAD
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        if (
            token &&
            loggedInUser
        ) {

            showHome();

            loadPosts();

        } else {

            showLogin();

        }

    }
);


// ==========================================
// SHOW LOGIN
// ==========================================

function showLogin() {

    loginSection.style.display =
        "flex";

    registerSection.style.display =
        "none";

    homeSection.style.display =
        "none";
}


// ==========================================
// SHOW REGISTER
// ==========================================

function showRegister() {

    loginSection.style.display =
        "none";

    registerSection.style.display =
        "flex";

    homeSection.style.display =
        "none";
}


// ==========================================
// SHOW HOME
// ==========================================

function showHome() {

    loginSection.style.display =
        "none";

    registerSection.style.display =
        "none";

    homeSection.style.display =
        "block";

    if (
        currentUsername &&
        loggedInUser
    ) {

        currentUsername.textContent =
            loggedInUser.username;

    }
}


// ==========================================
// REGISTER BUTTON
// ==========================================

if (showRegisterBtn) {

    showRegisterBtn.addEventListener(
        "click",
        () => {

            showRegister();

        }
    );

}


// ==========================================
// LOGIN BUTTON
// ==========================================

if (showLoginBtn) {

    showLoginBtn.addEventListener(
        "click",
        () => {

            showLogin();

        }
    );

}


// ==========================================
// REGISTER
// ==========================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const username =
                document
                    .getElementById(
                        "registerUsername"
                    )
                    .value
                    .trim();


            const email =
                document
                    .getElementById(
                        "registerEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "registerPassword"
                    )
                    .value;


            if (
                !username ||
                !email ||
                !password
            ) {

                alert(
                    "Please fill all fields."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/register`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    username,
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                    return;

                }


                alert(
                    "Registration successful! Please login."
                );


                registerForm.reset();

                showLogin();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        }
    );

}


// ==========================================
// LOGIN
// ==========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "loginEmail"
                    )
                    .value
                    .trim();


            const password =
                document
                    .getElementById(
                        "loginPassword"
                    )
                    .value;


            if (
                !email ||
                !password
            ) {

                alert(
                    "Please enter email and password."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/auth/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email,
                                    password
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Login failed."
                    );

                    return;

                }


                token =
                    data.token;


                loggedInUser =
                    data.user;


                localStorage.setItem(
                    "token",
                    token
                );


                localStorage.setItem(
                    "user",
                    JSON.stringify(
                        loggedInUser
                    )
                );


                loginForm.reset();

                showHome();

                loadPosts();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to connect to server."
                );

            }

        }
    );

}


// ==========================================
// CREATE POST
// ==========================================

if (createPostForm) {

    createPostForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const content =
                postContent.value.trim();


            if (!content) {

                alert(
                    "Please write something."
                );

                return;

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/posts`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "Authorization":
                                    `Bearer ${token}`
                            },

                            body:
                                JSON.stringify({
                                    content
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.message ||
                        "Failed to create post."
                    );

                    return;

                }


                postContent.value = "";

                loadPosts();


            } catch (error) {

                console.error(error);

                alert(
                    "Failed to create post."
                );

            }

        }
    );

}


// ==========================================
// LOAD POSTS
// ==========================================

async function loadPosts() {

    if (!postsContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/posts`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const posts =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                logout();

                return;

            }


            postsContainer.innerHTML =
                "<p>Failed to load posts.</p>";

            return;

        }


        renderPosts(posts);


    } catch (error) {

        console.error(error);

        postsContainer.innerHTML =
            "<p>Unable to load posts.</p>";

    }

}


// ==========================================
// RENDER POSTS
// ==========================================

function renderPosts(posts) {

    if (!posts.length) {

        postsContainer.innerHTML = `
            <div class="no-posts">

                <h3>
                    No posts yet
                </h3>

                <p>
                    Create the first post!
                </p>

            </div>
        `;

        return;

    }


    postsContainer.innerHTML =
        posts
            .map(
                (post) => {

                    const username =
                        post.user
                            ? post.user.username
                            : "Unknown User";


                    const userId =
                        post.user
                            ? post.user._id
                            : "";


                    const date =
                        post.createdAt
                            ? new Date(
                                post.createdAt
                            ).toLocaleString()
                            : "";


                    const likesCount =
                        post.likes
                            ? post.likes.length
                            : 0;


                    // IMPORTANT:
                    // ObjectId आणि String comparison fix

                    const isLiked =
                        post.likes &&
                        loggedInUser &&
                        post.likes.some(
                            id =>
                                id.toString() ===
                                loggedInUser._id.toString()
                        );


                    const isOwner =
                        loggedInUser &&
                        post.user &&
                        post.user._id.toString() ===
                        loggedInUser._id.toString();


                    return `

                        <div
                            class="post-card"
                            id="post-${post._id}"
                        >

                            <!-- POST HEADER -->

                            <div
                                class="post-header"
                            >

                                <div>

                                    <strong
                                        class="clickable-username"
                                        onclick="
                                            openProfile(
                                                '${userId}'
                                            )
                                        "
                                    >
                                        ${escapeHtml(
                                            username
                                        )}
                                    </strong>


                                    <small>
                                        ${escapeHtml(
                                            date
                                        )}
                                    </small>

                                </div>

                            </div>


                            <!-- POST CONTENT -->

                            <div
                                class="post-content"
                            >

                                ${escapeHtml(
                                    post.content
                                )}

                            </div>


                            <!-- POST ACTIONS -->

                            <div
                                class="post-actions"
                            >

                                <button
                                    onclick="
                                        likePost(
                                            '${post._id}'
                                        )
                                    "
                                >

                                    ${
                                        isLiked
                                            ? "❤️"
                                            : "🤍"
                                    }

                                    Like
                                    (${likesCount})

                                </button>


                                ${
                                    isOwner
                                        ? `
                                            <button
                                                class="delete-btn"
                                                onclick="
                                                    deletePost(
                                                        '${post._id}'
                                                    )
                                                "
                                            >
                                                🗑 Delete
                                            </button>
                                        `
                                        : ""
                                }

                            </div>


                            <!-- COMMENTS -->

                            <div
                                class="comments-section"
                            >

                                <h4>
                                    Comments
                                </h4>


                                <div
                                    id="comments-${post._id}"
                                    class="comments-list"
                                >
                                    Loading comments...
                                </div>


                                <form
                                    class="comment-form"
                                    onsubmit="
                                        addComment(
                                            event,
                                            '${post._id}'
                                        )
                                    "
                                >

                                    <input
                                        type="text"
                                        id="comment-input-${post._id}"
                                        placeholder="Write a comment..."
                                        required
                                    >


                                    <button
                                        type="submit"
                                    >
                                        Comment
                                    </button>

                                </form>

                            </div>

                        </div>

                    `;

                }
            )
            .join("");


    // Load comments for every post

    posts.forEach(
        post => {

            loadComments(
                post._id
            );

        }
    );

}


// ==========================================
// OPEN PROFILE
// ==========================================

function openProfile(userId) {

    if (!userId) {

        alert(
            "User profile not available."
        );

        return;

    }


    window.location.href =
        `profile.html?id=${userId}`;

}


// ==========================================
// LIKE / UNLIKE POST
// ==========================================

async function likePost(postId) {

    try {

        const response =
            await fetch(
                `${API_URL}/posts/${postId}/like`,
                {
                    method: "POST",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to like post."
            );

            return;

        }


        loadPosts();


    } catch (error) {

        console.error(error);

        alert(
            "Failed to like post."
        );

    }

}


// ==========================================
// DELETE POST
// ==========================================

async function deletePost(postId) {

    const confirmation =
        confirm(
            "Are you sure you want to delete this post?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/posts/${postId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete post."
            );

            return;

        }


        loadPosts();


    } catch (error) {

        console.error(error);

        alert(
            "Failed to delete post."
        );

    }

}


// ==========================================
// LOAD COMMENTS
// ==========================================

async function loadComments(postId) {

    const commentsContainer =
        document.getElementById(
            `comments-${postId}`
        );


    if (!commentsContainer) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/comments/${postId}`,
                {
                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const comments =
            await response.json();


        if (!response.ok) {

            commentsContainer.innerHTML =
                "<p>Failed to load comments.</p>";

            return;

        }


        renderComments(
            postId,
            comments
        );


    } catch (error) {

        console.error(error);

        commentsContainer.innerHTML =
            "<p>Failed to load comments.</p>";

    }

}


// ==========================================
// RENDER COMMENTS
// ==========================================

function renderComments(
    postId,
    comments
) {

    const container =
        document.getElementById(
            `comments-${postId}`
        );


    if (!container) {
        return;
    }


    if (!comments.length) {

        container.innerHTML = `
            <p class="no-comments">
                No comments yet.
            </p>
        `;

        return;

    }


    container.innerHTML =
        comments
            .map(
                comment => {

                    const username =
                        comment.user
                            ? comment.user.username
                            : "Unknown User";


                    const userId =
                        comment.user
                            ? comment.user._id
                            : "";


                    // IMPORTANT:
                    // ObjectId आणि String comparison fix

                    const isOwner =
                        loggedInUser &&
                        comment.user &&
                        comment.user._id.toString() ===
                        loggedInUser._id.toString();


                    return `

                        <div
                            class="comment-item"
                        >

                            <div>

                                <strong
                                    class="clickable-username"
                                    onclick="
                                        openProfile(
                                            '${userId}'
                                        )
                                    "
                                >
                                    ${escapeHtml(
                                        username
                                    )}
                                </strong>


                                <p>
                                    ${escapeHtml(
                                        comment.content
                                    )}
                                </p>

                            </div>


                            ${
                                isOwner
                                    ? `
                                        <button
                                            class="comment-delete-btn"
                                            onclick="
                                                deleteComment(
                                                    '${comment._id}',
                                                    '${postId}'
                                                )
                                            "
                                        >
                                            🗑 Delete
                                        </button>
                                    `
                                    : ""
                            }

                        </div>

                    `;

                }
            )
            .join("");

}


// ==========================================
// ADD COMMENT
// ==========================================

async function addComment(
    event,
    postId
) {

    event.preventDefault();


    const input =
        document.getElementById(
            `comment-input-${postId}`
        );


    if (!input) {
        return;
    }


    const content =
        input.value.trim();


    if (!content) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/comments/${postId}`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body:
                        JSON.stringify({
                            content
                        })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to add comment."
            );

            return;

        }


        input.value = "";


        loadComments(
            postId
        );


    } catch (error) {

        console.error(error);

        alert(
            "Failed to add comment."
        );

    }

}


// ==========================================
// DELETE COMMENT
// ==========================================

async function deleteComment(
    commentId,
    postId
) {

    const confirmation =
        confirm(
            "Delete this comment?"
        );


    if (!confirmation) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/comments/${commentId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.message ||
                "Failed to delete comment."
            );

            return;

        }


        loadComments(
            postId
        );


    } catch (error) {

        console.error(error);

        alert(
            "Failed to delete comment."
        );

    }

}


// ==========================================
// LOGOUT
// ==========================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        () => {

            logout();

        }
    );

}


function logout() {

    localStorage.removeItem(
        "token"
    );

    localStorage.removeItem(
        "user"
    );


    token = null;

    loggedInUser = null;


    showLogin();

}


// ==========================================
// ESCAPE HTML
// ==========================================

function escapeHtml(text) {

    if (
        text === undefined ||
        text === null
    ) {

        return "";

    }


    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}