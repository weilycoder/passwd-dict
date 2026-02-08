export function getCommonCSS() {
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

export function escapeHTML(str) {
  return str.replace(
    /[&<>"']/g,
    (tag) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[tag]
  );
}
