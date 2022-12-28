import * as jose from 'jose';

interface Token {
  optionsHash: string;
  accessToken: string;
  expiry: number;
}

let accessTokenCache: Token;

async function getAccessToken() {
  const options = await chrome.storage.sync.get();
  const optionsHash = `${options.keepClientEmail}||${options.keepUserEmail}||${options.keepClientPrivateKey}`;

  if (accessTokenCache && accessTokenCache.optionsHash === optionsHash && (accessTokenCache.expiry - 1000) > Date.now()) {
    return accessTokenCache.accessToken;
  }

  const privateKey = await jose.importPKCS8(options.keepClientPrivateKey, 'RS256')

  const jwt = await new jose.SignJWT({
    iss: options.keepClientEmail,
    sub: options.keepUserEmail,
    scope: 'https://www.googleapis.com/auth/keep',
    aud: 'https://oauth2.googleapis.com/token',
  })
  .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
  .setIssuedAt()
  .setExpirationTime('1h')
  .sign(privateKey)

  const authRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams([
      ['grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer'],
      ['assertion', jwt]
    ]).toString()
  });
  const authToken = await authRes.json() as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  accessTokenCache = {
    optionsHash,
    accessToken: authToken.access_token,
    expiry: Date.now() + (authToken.expires_in * 1000)
  };

  return accessTokenCache.accessToken;
}


export async function getKeepList() {
  const accessToken = await getAccessToken();
  const { keepNoteId, keepTransformations } = await chrome.storage.sync.get(['keepNoteId', 'keepTransformations']);

  const res = await fetch(`https://keep.googleapis.com/v1/notes/${keepNoteId}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const resData = await res.json() as {
    name: string;
    title: string;
    body: {
      list: {
        listItems: {
          text: { text: string; }
          checked: boolean;
        }[]
      }
    }
  };

  return resData.body.list.listItems
    .filter(v => v.checked === false)
    .map(v => v.text.text.trim())
    .map(v => v.replace(/^Test /gi, ''))
    .map(v => keepTransformations[v.toLowerCase()] ?? v);
}

