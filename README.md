# Password Dictionary Manager

简易的线上密码本，部署在 Cloudflare。

## 部署教程

我不太了解 Cloudflare 部署服务的相关内容，若以下内容不起效，可以尝试在 issues 中提出。

### 建立 KV namespace

首先，你应该为项目建立一个 KV 命名空间，例如

```bash
pnpm wrangler kv namespace create PASSWD_DICT
```

或者参考 Cloudflare 的文档。

然后，你应该可以看到终端输出包含类似以下格式的内容

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

你应该记下 `<BINDING_ID>` 的值，并在 `wrangler.jsonc` 中修改。

### 上传 Cloudflare

运行

```bash
npm run deploy
```

或者同等效果的其他命令。

### 设置删除密码（可选）

在密码本中删除密码需要口令验证，口令的 sha512 加密应被存储在 `delete-passwd` 中。

默认情况下，口令未被设置，即任何人都不能从密码本中删除密码。

若希望设置删除口令，你需要先计算口令的 sha512 加密值，例如，在 Python 中，使用

```python
print(__import__('hashlib').sha512(b'123456').hexdigest())
```

输出 `123456` 的 hash 值 

```
ba3253876aed6bc22d4a6ff53d8406c6ad864195ed144ab5c87621b6c233b548baeae6956df346ec8c17f5ea10f35ee3cbc514797ed7ddd3145464e2a0bab413
```

接下来，可以使用以下命令将删除口令设为 `123456`：

```bash
npx wrangler kv key put --binding=PASSWD_DICT "delete-passwd" "0627a34645f3e942ac20586b3bb890450406e8913abb8a998c53d42ab1937d1e243950df7e564bd016e1e8254c88ba56b898b434bd0f680ed3eae31f40509643"
```
