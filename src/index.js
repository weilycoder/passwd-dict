export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const path = url.pathname;

		// Root path - password submission form
		if (path === '/' || path === '/index.html') {
			return handleRoot(request, env);
		}

		// View password dictionary
		if (path === '/dict' || path === '/dict/') {
			return handleDict(env);
		}

		// Download password dictionary
		if (path === '/install' || path === '/install/') {
			return handleInstall(env);
		}

		// Delete password
		if (path.startsWith('/delete/')) {
			const passwdToDelete = decodeURIComponent(path.split('/delete/')[1]);
			return handleDelete(request, env, passwdToDelete);
		}

		return new Response('Not Found', { status: 404 });
	}
};

// Handle root path request
async function handleRoot(request, env) {
	let message = '';

	// Process form submission
	if (request.method === 'POST') {
		const formData = await request.formData();
		const newPassword = formData.get('password')?.trim();

		if (newPassword) {
			// Get current password list
			let passwords = await getPasswords(env);

			// Add new password (avoid duplicates)
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

	// Get current password list for display
	const passwords = await getPasswords(env);

	return new Response(`
<!DOCTYPE html>
<html>
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
        ${passwords.map(p => `<li>${escapeHTML(p)} <a href="/delete/${encodeURIComponent(p)}" class="delete-link">Delete</a></li>`).join('')}
      </ul>
    </div>
    
    <div class="actions">
      <a href="/dict" class="btn">View Dictionary</a>
      <a href="/install" class="btn">Download Dictionary</a>
    </div>
  </div>
</body>
</html>
  `, {
		headers: { 'Content-Type': 'text/html; charset=UTF-8' }
	});
}

// Display password dictionary
async function handleDict(env) {
	const passwords = await getPasswords(env);
	return new Response(`
<!DOCTYPE html>
<html>
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
async function handleInstall(env) {
	const passwords = await getPasswords(env);
	return new Response(passwords.join('\n'), {
		headers: {
			'Content-Type': 'text/plain; charset=UTF-8',
			'Content-Disposition': 'attachment; filename="password-dictionary.txt"'
		}
	});
}

// Handle password deletion
async function handleDelete(request, env, passwdToDelete) {
	let passwords = await getPasswords(env);

	// Check if password exists
	if (!passwords.includes(passwdToDelete)) {
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
    status: 403,
	});
}

// Get password list
async function getPasswords(env) {
	const data = await env.PASSWD_DICT.get('data');
	return data ? JSON.parse(data) : [];
}

// Save password list
async function savePasswords(env, passwords) {
	await env.PASSWD_DICT.put('data', JSON.stringify(passwords));
}

// Get common CSS styles
function getCommonCSS() {
	return `
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background-color: #f5f7fa;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    h1 {
      color: #2c3e50;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .form-group {
      margin-bottom: 15px;
    }
    
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 600;
    }
    
    input[type="text"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    
    button, .btn {
      background: #3498db;
      color: white;
      border: none;
      padding: 10px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      text-decoration: none;
      display: inline-block;
      margin-right: 10px;
    }
    
    .delete-btn {
      background: #e74c3c;
    }
    
    .btn:hover, button:hover {
      opacity: 0.9;
    }
    
    .actions {
      margin-top: 20px;
    }
    
    .success {
      color: #27ae60;
      background: #e8f8f0;
      padding: 10px;
      border-radius: 4px;
      margin: 15px 0;
    }
    
    .error {
      color: #c0392b;
      background: #fdeded;
      padding: 10px;
      border-radius: 4px;
      margin: 15px 0;
    }
    
    .password-content {
      background: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .delete-link {
      color: #e74c3c;
      font-size: 0.9em;
      margin-left: 10px;
    }
  `;
}

// Prevent XSS attacks with HTML escaping
function escapeHTML(str) {
	return str.replace(/[&<>"']/g,
		tag => ({
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#39;'
		}[tag]));
}