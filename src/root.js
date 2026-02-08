import { getPasswords, savePasswords } from "./kv.js";
import { escapeHTML, getCommonCSS } from "./utils.js";

export async function handleRoot(request, env) {
  let message = "";
  if (request.method === "POST") {
    const formData = await request.formData();
    const newPassword = formData.get("password")?.trim();
    if (newPassword) {
      let passwords = await getPasswords(env);
      if (!passwords.includes(newPassword)) {
        passwords.push(newPassword);
        await savePasswords(env, passwords);
        message = `<div class="success">Password added successfully!</div>`;
      } else {
        message = `<div class="error">Password already exists!</div>`;
      }
    } else {
      message = `<div class="error">Please enter a valid password!</div>`;
    }
  }
  const passwords = await getPasswords(env);
  return new Response(
    `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Dictionary Manager</title>
  <style>
    ${getCommonCSS()}
    .password-list {
      margin-top: 20px;
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #ddd;
      padding: 10px;
      border-radius: 4px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Dictionary Manager</h1>
    ${message}
    <form method="POST">
      <div class="form-group">
        <label for="password">New Password:</label>
        <input type="text" id="password" name="password" required>
      </div>
      <button type="submit">Add Password</button>
    </form>
    
    <div class="password-list">
      <h3>Current Password List (${passwords.length} items)</h3>
      <ul>
        ${passwords
          .map(
            (password) =>
              `<li>${escapeHTML(password)} <a href="/delete/${encodeURIComponent(password)}" class="delete-link">Delete</a></li>`
          )
          .join("")}
      </ul>
    </div>
    
    <div class="actions">
      <a href="/dict" class="btn">View Dictionary</a>
      <a href="/install" class="btn">Download Dictionary</a>
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
