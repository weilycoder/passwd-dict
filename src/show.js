import { getPasswords } from "./kv.js";
import { getCommonCSS, escapeHTML } from './utils.js';

// Display password dictionary
export async function handleDict(env) {
  const passwords = await getPasswords(env);
  return new Response(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Password Dictionary</title>
  <style>${getCommonCSS()}</style>
</head>
<body>
  <div class="container">
    <h1>Password Dictionary</h1>
    <div class="password-content">
      ${passwords.map(p => `<div>${escapeHTML(p)}</div>`).join('')}
    </div>
    <div class="actions">
      <a href="/" class="btn">Back to Home</a>
    </div>
  </div>
</body>
</html>
  `, {
    headers: { 'Content-Type': 'text/html; charset=UTF-8' }
  });
}

// Download password dictionary
export async function handleInstall(env) {
  const passwords = await getPasswords(env);
  return new Response(passwords.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Content-Disposition': 'attachment; filename="password-dictionary.txt"'
    }
  });
}