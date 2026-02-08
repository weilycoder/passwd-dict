const listElement = document.querySelector("#password-list");
const countElement = document.querySelector("#password-count");
const noticeElement = document.querySelector("#notice");
const formElement = document.querySelector("#add-form");
const verificationInput = document.querySelector("#verification");
const deleteModal = document.querySelector("#delete-modal");
const deleteTarget = document.querySelector("#delete-target");
const confirmDeleteButton = document.querySelector("#confirm-delete");
const modalCloseButtons = deleteModal.querySelectorAll("[data-modal-close]");
let pendingDelete = "";

function setNotice(type, message) {
    if (!message) {
        noticeElement.textContent = "";
        noticeElement.className = "notice";
        return;
    }
    noticeElement.textContent = message;
    noticeElement.className = `notice ${type}`;
}

async function fetchPasswords() {
    const response = await fetch("/api/passwords");
    if (!response.ok) {
        throw new Error("Failed to load passwords.");
    }
    return response.json();
}

function renderList(items) {
    listElement.innerHTML = "";
    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "muted";
        empty.textContent = "No passwords yet.";
        listElement.appendChild(empty);
        return;
    }
    items.forEach((password) => {
        const row = document.createElement("div");
        row.className = "password-row";

        const value = document.createElement("div");
        value.className = "password-value";
        value.textContent = password;

        const actions = document.createElement("div");
        actions.className = "inline-actions";

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-btn";
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => openDeleteModal(password));

        actions.appendChild(deleteButton);
        row.appendChild(value);
        row.appendChild(actions);
        listElement.appendChild(row);
    });
}

async function refreshList() {
    const data = await fetchPasswords();
    countElement.textContent = `${data.count}`;
    renderList(data.items);
}

async function handleAdd(event) {
    event.preventDefault();
    const formData = new FormData(formElement);
    const password = formData.get("password")?.toString().trim();
    if (!password) {
        setNotice("error", "Please enter a valid password.");
        return;
    }
    const response = await fetch("/api/passwords", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
    });
    const data = await response.json();
    if (!response.ok) {
        setNotice("error", data.message || "Failed to add password.");
        return;
    }
    formElement.reset();
    setNotice("success", data.message || "Password added.");
    await refreshList();
}

function openDeleteModal(password) {
    pendingDelete = password;
    deleteTarget.textContent = `Target: ${password}`;
    verificationInput.value = "";
    deleteModal.classList.add("open");
    deleteModal.setAttribute("aria-hidden", "false");
    verificationInput.focus();
}

function closeDeleteModal() {
    pendingDelete = "";
    deleteModal.classList.remove("open");
    deleteModal.setAttribute("aria-hidden", "true");
}

async function confirmDelete() {
    if (!pendingDelete) {
        closeDeleteModal();
        return;
    }
    const verification = verificationInput.value.trim();
    if (!verification) {
        setNotice("error", "Verification password is required.");
        verificationInput.focus();
        return;
    }
    const response = await fetch(`/api/passwords/${encodeURIComponent(pendingDelete)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ verification })
    });
    const data = await response.json();
    if (!response.ok) {
        setNotice("error", data.message || "Failed to delete password.");
        return;
    }
    closeDeleteModal();
    setNotice("success", data.message || "Password deleted.");
    await refreshList();
}

confirmDeleteButton.addEventListener("click", confirmDelete);
verificationInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        confirmDelete();
    }
});
modalCloseButtons.forEach((button) => {
    button.addEventListener("click", closeDeleteModal);
});
deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && deleteModal.classList.contains("open")) {
        closeDeleteModal();
    }
});

formElement.addEventListener("submit", handleAdd);

refreshList().catch((error) => {
    setNotice("error", error.message);
});
