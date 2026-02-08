const listElement = document.querySelector("#dict-list");
const countElement = document.querySelector("#dict-count");
const noticeElement = document.querySelector("#notice");

function setNotice(type, message) {
    if (!message) {
        noticeElement.textContent = "";
        noticeElement.className = "notice";
        return;
    }
    noticeElement.textContent = message;
    noticeElement.className = `notice ${type}`;
}

async function loadDictionary() {
    const response = await fetch("/api/passwords");
    if (!response.ok) {
        throw new Error("Failed to load dictionary.");
    }
    const data = await response.json();
    countElement.textContent = `${data.count}`;
    listElement.innerHTML = "";
    if (!data.items.length) {
        const empty = document.createElement("div");
        empty.className = "muted";
        empty.textContent = "No passwords yet.";
        listElement.appendChild(empty);
        return;
    }
    data.items.forEach((password) => {
        const row = document.createElement("div");
        row.className = "password-row";
        const value = document.createElement("div");
        value.className = "password-value";
        value.textContent = password;
        row.appendChild(value);
        listElement.appendChild(row);
    });
}

loadDictionary().catch((error) => {
    setNotice("error", error.message);
});
