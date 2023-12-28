document.addEventListener("DOMContentLoaded", () => {
    load_playlists();
    document.getElementById("brew-form").addEventListener("submit", brew);
});

function brew(event) {
    event.preventDefault();

    const link = document.getElementById("brew-link").value;
    const file_format = document.getElementById("brew-format").value;
    if (link == "" || file_format == "") {
        alert("Please fill out all fields");
        return;
    }

    try {
        url = new URL(link);
    } catch (TypeError) {
        alert("Invalid URL");
        return;
    }

    fetch("/brew", {
        method: "PUT",
        body: JSON.stringify({
            link: link,
            file_format: file_format,
        }),
    })
        .then((response) => {
            load_playlists();
            return response.json();
        })
        .then((data) => {
            if (data.error) {
                alert(data.error);
            }
            if (data.path) {
                const a = document.createElement("a");
                a.href = "download/" + data.name + "/" + data.path;
                a.target = "_blank";
                document.body.appendChild(a);
                a.click();
                a.remove();
            }
        });
    document.querySelector("#brew-form").reset();
}

function load_playlists() {
    const playlists = document.getElementById("playlists");
    playlists.innerHTML = "";

    const container = document.createElement("div");
    container.className = "container";
    const row = document.createElement("div");
    row.className = "row";

    fetch("/playlists")
        .then((response) => response.json())
        .then((data) => {
            data.forEach((model) => {
                const col = document.createElement("div");
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
                const btn_group = document.createElement("div");
                btn_group.className = "btn-group";

                const update_btn = document.createElement("a");
                update_btn.className = "btn btn-secondary";
                update_btn.innerHTML = "Update";
                update_btn.addEventListener("click", () => {
                    fetch("update/" + model.id)
                        .then((response) => {
                            load_playlists();
                            return response.json();
                        })
                        .then((data) => {
                            if (data.error) {
                                alert(data.error);
                            }
                        });
                });

                const download_btn = document.createElement("a");
                download_btn.className = "btn btn-secondary";
                download_btn.innerHTML = "Download";
                download_btn.addEventListener("click", () => {
                    fetch("brew/" + model.id)
                        .then((response) => response.json())
                        .then((data) => {
                            if (data.error) {
                                alert(data.error);
                            }
                            window.location.href =
                                "download/" + data.name + "/" + data.path;
                        });
                });

                const remove_btn = document.createElement("a");
                remove_btn.className = "btn btn-secondary";
                remove_btn.innerHTML = "Remove";
                remove_btn.addEventListener("click", () => {
                    fetch("remove/" + model.id)
                        .then((response) => {
                            col.remove();
                            return response.json();
                        })
                        .then((data) => {
                            if (data.error) {
                                alert(data.error);
                            }
                        });
                });

                btn_group.appendChild(update_btn);
                btn_group.appendChild(download_btn);
                btn_group.appendChild(remove_btn);
                btns.appendChild(btn_group);

                playlist.appendChild(h5);
                playlist.appendChild(h6);
                playlist.appendChild(a);
                playlist.appendChild(btns);
                col.appendChild(playlist);
                row.appendChild(col);
            });
            container.appendChild(row);
            playlists.appendChild(container);
        });
}
