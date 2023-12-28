document.addEventListener("DOMContentLoaded", () => {
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
    loadPlaylists();
});

function brew(event) {
    event.preventDefault();

    const link = document.getElementById("brew-link").value;
    const fileFormat = document.getElementById("brew-format").value;
    if (link == "" || fileFormat == "") {
        showBrewError(true, "Please fill out all fields");
        return;
    }

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
    })
        .then((response) => response.json())
        .then((data) => {
            showBrewSpinner(false);

            if (data.error) {
                showBrewError(true, data.message);
                return;
            }

            if (data.exists) {
                col = document.getElementById(data.model.id);
                col.remove();
            }

            createPlaylist(
                data.model,
                document.getElementById("playlists-row")
            );

            const a = document.createElement("a");
            a.href = "download/" + data.name + "/" + data.path;
            document.body.appendChild(a);
            a.click();
            a.remove();
            showBrewConfirm(true, "Playlist downloaded");
        });
    document.querySelector("#brew-form").reset();
}

function createPlaylist(model, row, append) {
    const col = document.createElement("div");
    col.id = model.id;
    col.className = "col";
    const playlist = document.createElement("div");
    playlist.className = "playlist";
    const h5 = document.createElement("h5");
    h5.innerHTML = model.name;
    const h6 = document.createElement("h6");
    h6.innerHTML = model.owner;

    const a = document.createElement("a");
    a.href = "playlist/" + model.platform + "/" + model.id;
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
        fetch("update/" + model.id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
                    return;
                }
                col.remove();
                row.insertBefore(col, row.firstChild);
                showWatchConfirm(true, "Playlist updated");
            });
    });

    const downloadBtn = document.createElement("a");
    downloadBtn.className = "btn btn-secondary";
    downloadBtn.innerHTML = "Download";
    downloadBtn.addEventListener("click", () => {
        fetch("brew/" + model.id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
                    return;
                }
                window.location.href =
                    "download/" + data.name + "/" + data.path;
                showWatchConfirm(true, "Playlist downloaded");
            });
    });

    const removeBtn = document.createElement("a");
    removeBtn.className = "btn btn-secondary";
    removeBtn.innerHTML = "Remove";
    removeBtn.addEventListener("click", () => {
        fetch("remove/" + model.id)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    showWatchError(true, data.message);
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
                createPlaylist(model, row);
            });
        });
}

function watch(event) {
    event.preventDefault();

    document.getElementById("watch").style.display = "block";

    const link = document.getElementById("watch-link").value;
    console.log(link);
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
    })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            showWatchSpinner(false);

            if (data.error) {
                showWatchError(true, data.message);
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
        });
    document.querySelector("#watch-form").reset();
    document.querySelector("#watch-form").style.display = "none";
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
