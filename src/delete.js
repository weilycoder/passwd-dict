import { getPasswords, savePasswords } from "./kv.js";
import { getCommonCSS, escapeHTML } from './utils.js';

// Handle password deletion
export async function handleDelete(request, env, passwdToDelete) {
  let passwords = await getPasswords(env);

  // Check if password exists
  if (!passwords.includes(passwdToDelete)) {
    return handleNotFound();
  }

  let message = '';

  // Process verification password submission
  if (request.method === 'POST') {
    const formData = await request.formData();
    const verification = formData.get('verification');

    // Calculate SHA512 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(verification);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    const delete_passwd_hash = await env.PASSWD_DICT.get('delete-passwd');

    // Verify password
    if (hashHex === delete_passwd_hash) {
      // Delete password
      passwords = passwords.filter(p => p !== passwdToDelete);
      await savePasswords(env, passwords);
      return new Response(`
<!DOCTYPE html>
<html>
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
      `, {
        headers: { 'Content-Type': 'text/html; charset=UTF-8' }
      });
    } else {
      message = `<div class="error">Verification password incorrect!</div>`;
    }
  }

  // Show verification form
  return new Response(`
<!DOCTYPE html>
<html>
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
  `, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    status: 200,
  });
}

async function handleNotFound() {
  return new Response(`
<!DOCTYPE html>
<html>
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
    `, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' },
    status: 404,
  });
}