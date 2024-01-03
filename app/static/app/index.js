var logged_in = false;

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        var cookies = document.cookie.split(";");
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === name + "=") {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );
                break;
            }
        }
    }
    return cookieValue;
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("recent-playlists").style.display = "none";
    const brewConfirm = document.getElementById("brew-confirm");
    const watchConfirm = document.getElementById("watch-confirm");
    brewConfirm.addEventListener("click", () => {
        showBrewConfirm(false, "");
    });
    watchConfirm.addEventListener("click", () => {
        showWatchConfirm(false, "");
    });
    // Hide confirm messages
    showBrewConfirm(false, "");
    showWatchConfirm(false, "");

    const brewError = document.getElementById("brew-error");
    const watchError = document.getElementById("watch-error");
    brewError.addEventListener("click", () => {
        showBrewError(false, "");
    });
    watchError.addEventListener("click", () => {
        showWatchError(false, "");
    });
    // Hide error messages
    showBrewError(false, "");
    showWatchError(false, "");

    // Hide spinners
    showBrewSpinner(false);
    showWatchSpinner(false);

    // Hide watch form
    document.getElementById("watch-form").style.display = "none";

    document.getElementById("watch-btn").addEventListener("click", () => {
        const form = document.getElementById("watch-form");
        if (form.style.display == "none") {
            form.style.display = "block";
        } else {
            form.style.display = "none";
        }
    });

    document.getElementById("brew-form").addEventListener("submit", brew);
    document.getElementById("watch-form").addEventListener("submit", watch);

    fetch("/check-login")
        .then((response) => response.json())
        .then((data) => {
            if (data.is_logged_in) {
                logged_in = true;
                loadPlaylists();
                document.getElementById("recent-playlists").style.display =
                    "block";
            } else {
                logged_in = false;
            }
        });
});

function brew(event) {
    event.preventDefault();

    // Get link and file format from form
    const link = document.getElementById("brew-link").value;
    const fileFormat = document.getElementById("brew-format").value;
    if (link == "" || fileFormat == "") {
        showBrewError(true, "Please fill out all fields");
        return;
    }

    // Check if link is valid
    try {
        url = new URL(link);
    } catch (TypeError) {
        showBrewError(true, "Invalid link");
        return;
    }

    showBrewSpinner(true);
    showBrewConfirm(false, "");
    showBrewError(false, "");

    fetch("/brew", {
        method: "PUT",
        body: JSON.stringify({
            link: link,
            fileFormat: fileFormat,
        }),
        headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.error) {
                showBrewError(true, data.message);
                showBrewSpinner(false);
                return;
            }

            // If playlist, update recent playlist grid
            if (logged_in && data.is_playlist) {
                if (data.exists) {
                    col = document.getElementById(data.model.playlist_id);
                    col.remove();
                }
                createPlaylist(
                    data.model,
                    document.getElementById("playlists-row"),
                    false
                );
            }

            const a = document.createElement("a");
            a.href = "download/" + data.path;
            a.target = "_blank"; // This allows thumbnail to load for some reason
            document.body.appendChild(a);
            a.click();
            a.remove();

            showBrewSpinner(false);
            showBrewConfirm(true, data.message);
        });
    document.querySelector("#brew-form").reset();
}

function createPlaylist(model, row, append) {
    const col = document.createElement("div");
    col.id = model.playlist_id;
    col.className = "col";
    const playlist = document.createElement("div");
    playlist.className = "playlist";
    const h5 = document.createElement("h5");
    h5.innerHTML = model.name;
    const h6 = document.createElement("h6");
    h6.innerHTML = model.owner;

    const a = document.createElement("a");
    a.href = "playlist/" + model.platform + "/" + model.playlist_id;
    a.target = "_blank";
    const img = document.createElement("img");
    img.className = "playlist-thumbnail";
    img.src = model.thumbnail;
    img.alt = `${playlist.name} thumbnail`;
    img.height = 250;
    img.width = 250;
    a.appendChild(img);

    const btns = document.createElement("div");
    btns.className = "playlist-btns";
    const btnGroup = document.createElement("div");
    btnGroup.className = "btn-group";

    const updateBtn = document.createElement("a");
    updateBtn.className = "btn btn-secondary";
    updateBtn.innerHTML = "Update";
    updateBtn.addEventListener("click", () => {
        showWatchConfirm(false, "");
        showWatchError(false, "");
        showWatchSpinner(true);
        fetch("update/" + model.playlist_id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
                    showWatchSpinner(false);
                    return;
                }
                if (data.path) {
                    const a = document.createElement("a");
                    a.href = "download/" + data.path;
                    a.target = "_blank"; // This allows thumbnail to load for some reason
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                }

                col.remove();
                img.src = data.thumbnail;
                row.insertBefore(col, row.firstChild);

                showWatchSpinner(false);
                showWatchConfirm(true, data.message);
            });
    });

    const downloadBtn = document.createElement("a");
    downloadBtn.className = "btn btn-secondary";
    downloadBtn.innerHTML = "Download";
    downloadBtn.addEventListener("click", () => {
        showWatchConfirm(false, "");
        showWatchError(false, "");
        showWatchSpinner(true);
        fetch("/brew/" + model.playlist_id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
                    showWatchSpinner(false);
                    return;
                }

                const a = document.createElement("a");
                a.href = "/download/" + data.path;
                a.target = "_blank"; // This allows thumbnail to load for some reason
                document.body.appendChild(a);
                a.click();
                a.remove();

                col.remove();
                img.src = data.model.thumbnail;
                row.insertBefore(col, row.firstChild);

                showWatchSpinner(false);
                showWatchConfirm(true, "Playlist downloaded");
            });
    });

    const removeBtn = document.createElement("a");
    removeBtn.className = "btn btn-secondary";
    removeBtn.innerHTML = "Remove";
    removeBtn.addEventListener("click", () => {
        fetch("/remove/" + model.playlist_id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
                    showWatchSpinner(false);
                    return;
                }
                col.remove();
            });
    });

    btnGroup.appendChild(updateBtn);
    btnGroup.appendChild(downloadBtn);
    btnGroup.appendChild(removeBtn);
    btns.appendChild(btnGroup);

    playlist.appendChild(h5);
    playlist.appendChild(h6);
    playlist.appendChild(a);
    playlist.appendChild(btns);
    col.appendChild(playlist);

    if (append) {
        row.appendChild(col);
    } else {
        row.insertBefore(col, row.firstChild);
    }
}

function loadPlaylists() {
    const playlistsGrid = document.getElementById("playlists-grid");
    playlistsGrid.innerHTML = "";

    const container = document.createElement("div");
    container.id = "playlists-container";
    container.className = "container";
    const row = document.createElement("div");
    row.id = "playlists-row";
    row.className = "row";
    container.appendChild(row);
    playlistsGrid.appendChild(container);

    fetch("/get-playlists")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((model) => {
                createPlaylist(model, row, false);
            });
        });
}

function watch(event) {
    event.preventDefault();

    document.getElementById("watch").style.display = "block";

    const link = document.getElementById("watch-link").value;
    if (link == "") {
        showWatchError(true, "Please fill out all fields");
        return;
    }

    try {
        url = new URL(link);
    } catch (TypeError) {
        showWatchError(true, "Invalid YouTube/Spotify link");
        return;
    }

    showWatchSpinner(true);
    showWatchConfirm(false, "");
    showWatchError(false, "");

    fetch("/watch", {
        method: "PUT",
        body: JSON.stringify({
            link: link,
        }),
        headers: { "X-CSRFToken": getCookie("csrftoken") },
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            showWatchSpinner(false);

            if (data.error) {
                showWatchError(true, data.message);
                showWatchSpinner(false);
                return;
            } else if (!data.exists) {
                createPlaylist(
                    data.data,
                    document.getElementById("playlists-row"),
                    false
                );
                showWatchConfirm(true, "Playlist created");
            } else if (data.exists) {
                showWatchConfirm(true, "Playlist already exists");
            }
            document.querySelector("#watch-form").reset();
            document.querySelector("#watch-form").style.display = "none";
        });
}

function showBrewSpinner(show) {
    if (show) {
        document.getElementById("brew-spinner").style.display = "block";
    } else {
        document.getElementById("brew-spinner").style.display = "none";
    }
}

function showWatchSpinner(show) {
    if (show) {
        document.getElementById("watch-spinner").style.display = "block";
    } else {
        document.getElementById("watch-spinner").style.display = "none";
    }
}

function showBrewConfirm(show, message) {
    const brewConfirm = document.getElementById("brew-confirm");
    brewConfirm.innerHTML = message;
    if (show) {
        brewConfirm.style.display = "block";
    } else {
        brewConfirm.style.display = "none";
    }
}

function showWatchConfirm(show, message) {
    const watchConfirm = document.getElementById("watch-confirm");
    watchConfirm.innerHTML = message;
    if (show) {
        watchConfirm.style.display = "block";
    } else {
        watchConfirm.style.display = "none";
    }
}

function showBrewError(show, message) {
    const brewError = document.getElementById("brew-error");
    brewError.innerHTML = message;
    if (show) {
        brewError.style.display = "block";
    } else {
        brewError.style.display = "none";
    }
}

function showWatchError(show, message) {
    const watchError = document.getElementById("watch-error");
    watchError.innerHTML = message;
    if (show) {
        watchError.style.display = "block";
    } else {
        watchError.style.display = "none";
    }
}
