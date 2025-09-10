// Get password list
export async function getPasswords(env) {
  const data = await env.PASSWD_DICT.get('data');
  return data ? JSON.parse(data) : [];
}

// Save password list
export async function savePasswords(env, passwords) {
  await env.PASSWD_DICT.put('data', JSON.stringify(passwords));
}