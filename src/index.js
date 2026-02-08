import { handleDelete } from "./delete.js";
import { handleIcon } from "./icon.js";
import { handleRoot } from "./root.js";
import { handleDict, handleInstall } from "./show.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    if (path === "/" || path === "/index.html") {
      return handleRoot(request, env);
    }
    if (path === "/dict" || path === "/dict/") {
      return handleDict(env);
    }
    if (path === "/install" || path === "/install/") {
      return handleInstall(env);
    }
    if (path.startsWith("/delete/")) {
      const passwdToDelete = decodeURIComponent(path.split("/delete/")[1]);
      return handleDelete(request, env, passwdToDelete);
    }
    if (path === "/favicon.ico") {
      return handleIcon();
    }
    return new Response("Not Found", { status: 404 });
  }
};
