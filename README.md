# passwd-dict

使用 Cloudflare Workers 构建的弱密码字典管理应用。

## 快速开始

1. 克隆仓库：

    ```bash
    git clone <repository_url>
    cd passwd-dict
    ```

2. 安装依赖：

    ```bash
    npm install
    ```

3. 设置 kv 命名空间：

    - 在 Cloudflare Workers 仪表盘创建一个新的 KV 命名空间（建议叫做 `passwd_dict`）。
    - 记下命名空间 ID。
    - 将 `wrangler.toml` 文件中的 `kv_namespaces` 部分更新为：

      ```toml
      [[kv_namespaces]]
      binding = "PASSWD_DICT"
      id = "<your_kv_namespace_id>"
      ```

    - 如果需要在命令行创建 KV 命名空间，可以使用以下命令：

        ```bash
        wrangler kv namespace create PASSWD_DICT
        ```

        将返回如下格式的信息：

        ```
        {
          "kv_namespaces": [
            {
              "binding": "PASSWD_DICT",
              "id": "<BINDING_ID>"
            }
          ]
        }
        ```

4. 设置删除密码：

    - 应用希望任何人都可以添加条目，而删除条目需要密码保护。
    - 使用
  
        ```bash
        wrangler kv key put delete-passwd <your_delete_password> --binding=PASSWD_DICT
        ```

        将删除密码存储在 KV 命名空间中。
    - 如果希望将密码上传到 Cloudflare，需要在命令后加入 `--remote` 标志。
    - 请注意这里的 `<your_delete_password>` 是密码的 SHA-512 哈希值。
    - 在存在 Python 环境的情况下，可以使用以下命令生成 SHA-512 哈希值：

      ```bash
      python -c "print(__import__('hashlib').sha512(__import__('getpass').getpass().encode()).hexdigest())"
      ```

      输入密码时不会在终端中出现任何回显。

5. 部署应用：

    ```bash
    npx wrangler publish
    ```
