import { getPasswords, savePasswords } from "./kv.js";
import { escapeHTML, getCommonCSS } from "./utils.js";

export async function handleDelete(request, env, passwdToDelete) {
  let passwords = await getPasswords(env);
  if (!passwords.includes(passwdToDelete)) {
    return handleNotFound(passwdToDelete);
  }
  let message = "";
  if (request.method === "POST") {
    const formData = await request.formData();
    const verification = formData.get("verification");
    const encoder = new TextEncoder();
    const data = encoder.encode(verification);
    const hashBuffer = await crypto.subtle.digest("SHA-512", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    const deletePasswordHash = await env.PASSWD_DICT.get("delete-passwd");
    if (hashHex === deletePasswordHash) {
      passwords = passwords.filter((password) => password !== passwdToDelete);
      await savePasswords(env, passwords);
      return new Response(
        `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Deletion Successful</title>
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="container">
    <h1>Deletion Successful</h1>
    <div class="success">Password successfully deleted: ${escapeHTML(passwdToDelete)}</div>
    <div class="actions">
      <a href="/" class="btn">Back to Home</a>
    </div>
  </div>
</body>
</html>
      `,
        {
          headers: { "Content-Type": "text/html; charset=UTF-8" }
        }
      );
    }
    message = `<div class="error">Verification password incorrect!</div>`;
  }
  return new Response(
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Delete Password</title>
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="container">
    <h1>Delete Password</h1>
    ${message}
    <p>You are about to delete password: <strong>${escapeHTML(passwdToDelete)}</strong></p>
    <form method="POST">
      <div class="form-group">
        <label for="verification">Verification Password:</label>
        <input type="password" id="verification" name="verification" required>
      </div>
      <button type="submit" class="delete-btn">Confirm Delete</button>
      <a href="/" class="btn">Cancel</a>
    </form>
  </div>
</body>
</html>
  `,
    {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      status: 200
    }
  );
}

export async function handleNotFound(passwdToDelete) {
  return new Response(
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Error</title>
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="container">
    <h1>Error</h1>
    <div class="error">Password does not exist: ${escapeHTML(passwdToDelete)}</div>
    <div class="actions">
      <a href="/" class="btn">Back to Home</a>
    </div>
  </div>
</body>
</html>
    `,
    {
      headers: { "Content-Type": "text/html; charset=UTF-8" },
      status: 404
    }
  );
}
