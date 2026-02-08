import { getPasswords, savePasswords } from "./kv.js";

const JSON_HEADERS = { "Content-Type": "application/json; charset=UTF-8" };

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: JSON_HEADERS
  });
}

async function sha512Hex(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value ?? "");
  const hashBuffer = await crypto.subtle.digest("SHA-512", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function handleList(env) {
  const passwords = await getPasswords(env);
  return jsonResponse({ items: passwords, count: passwords.length });
}

async function handleAdd(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON body." }, 400);
  }
  const password = body?.password?.trim();
  if (!password) {
    return jsonResponse({ ok: false, message: "Password is required." }, 400);
  }
  const passwords = await getPasswords(env);
  if (passwords.includes(password)) {
    return jsonResponse({ ok: false, message: "Password already exists." }, 409);
  }
  passwords.push(password);
  await savePasswords(env, passwords);
  return jsonResponse({ ok: true, message: "Password added.", count: passwords.length }, 201);
}

async function handleDelete(request, env, passwordToDelete) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, message: "Invalid JSON body." }, 400);
  }
  const verification = body?.verification ?? "";
  if (!verification) {
    return jsonResponse({ ok: false, message: "Verification password is required." }, 400);
  }
  const passwords = await getPasswords(env);
  if (!passwords.includes(passwordToDelete)) {
    return jsonResponse({ ok: false, message: "Password does not exist." }, 404);
  }
  const hashHex = await sha512Hex(verification);
  const deletePasswordHash = await env.PASSWD_DICT.get("delete-passwd");
  if (hashHex !== deletePasswordHash) {
    return jsonResponse({ ok: false, message: "Verification password incorrect." }, 403);
  }
  const updated = passwords.filter((password) => password !== passwordToDelete);
  await savePasswords(env, updated);
  return jsonResponse({ ok: true, message: "Password deleted.", count: updated.length });
}

async function handleInstall(env) {
  const passwords = await getPasswords(env);
  return new Response(passwords.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Content-Disposition": "attachment; filename=\"password-dictionary.txt\""
    }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/api/passwords" && request.method === "GET") {
      return handleList(env);
    }
    if (path === "/api/passwords" && request.method === "POST") {
      return handleAdd(request, env);
    }
    if (path.startsWith("/api/passwords/") && request.method === "DELETE") {
      const encoded = path.slice("/api/passwords/".length);
      const passwordToDelete = decodeURIComponent(encoded || "");
      if (!passwordToDelete) {
        return jsonResponse({ ok: false, message: "Password is required." }, 400);
      }
      return handleDelete(request, env, passwordToDelete);
    }
    if (path === "/api/install" && request.method === "GET") {
      return handleInstall(env);
    }
    if (path.startsWith("/api/")) {
      return jsonResponse({ ok: false, message: "Not Found." }, 404);
    }
    return new Response("Not Found", { status: 404 });
  }
};
