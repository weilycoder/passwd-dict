import { handleRoot } from './root.js';
import { handleDelete } from './delete.js';
import { handleDict, handleInstall } from './show.js';

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