// Inicio de sesión con Google a través de Cognito, escrito a mano (sin librerías) para que se vea cada paso.
//
// Flujo "código de autorización + PKCE":
//  1. login(): se inventa una clave al azar (verifier) y se manda a Cognito solo su huella SHA-256
//     (challenge). El navegador va a la página de Cognito, que lo manda directo a Google.
//  2. Google confirma quién es, Cognito vuelve a la consola con ?code=...&state=...
//  3. handleRedirect(): se cambia ese código de un solo uso por los tokens, mostrando la clave original.
//     Cognito comprueba que su huella coincida: si alguien robó el código, sin la clave no le sirve.
//
// Nada de esto es secreto: el dominio y el ID de cliente son públicos. El secreto de Google vive en Cognito.

export type AuthConfig = { domain: string; clientId: string; redirectUri: string };
export type User = { name: string; email: string; picture?: string };
type Tokens = { id: string; access: string; refresh?: string; expires: number };

const TOKENS = 'console-auth'; // localStorage: la sesión sobrevive a cerrar la pestaña
const PENDING = 'console-auth-pending'; // sessionStorage: solo mientras se va y vuelve de Google

// Base64 "para URL": sin +, / ni = (así viaja tal cual en una dirección)
const b64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const randomString = (size = 32) => b64url(crypto.getRandomValues(new Uint8Array(size)));

// Un JWT son tres partes separadas por puntos: encabezado.datos.firma. Leer los datos no necesita
// ninguna clave (no están cifrados, solo firmados). Verificar la firma lo hace la API, no la web.
function readJwt(token: string): Record<string, any> {
  const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)); // TextDecoder: para que lleguen bien los acentos
}

export function createAuth(cfg: AuthConfig) {
  const read = <T>(storage: Storage, key: string): T | null => {
    try {
      return JSON.parse(storage.getItem(key) ?? 'null');
    } catch {
      return null;
    }
  };
  const save = (tokens: Tokens | null) => {
    try {
      if (tokens) localStorage.setItem(TOKENS, JSON.stringify(tokens));
      else localStorage.removeItem(TOKENS);
    } catch {}
  };

  // Pide tokens al endpoint de Cognito (sirve para el código y para renovar)
  async function requestTokens(params: Record<string, string>, previous?: Tokens) {
    const res = await fetch(`${cfg.domain}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ client_id: cfg.clientId, ...params }),
    });
    if (!res.ok) throw new Error(`Cognito respondió ${res.status}`);
    const data = await res.json();
    const tokens: Tokens = {
      id: data.id_token,
      access: data.access_token,
      refresh: data.refresh_token ?? previous?.refresh, // al renovar, Cognito no manda uno nuevo
      expires: Date.now() + data.expires_in * 1000,
    };
    save(tokens);
    return tokens;
  }

  return {
    async login() {
      const verifier = randomString(48);
      const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
      const state = randomString(16); // se compara a la vuelta: que la respuesta sea de este pedido
      try {
        sessionStorage.setItem(PENDING, JSON.stringify({ verifier, state }));
      } catch {}
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: cfg.clientId,
        redirect_uri: cfg.redirectUri,
        scope: 'openid email profile',
        identity_provider: 'Google', // directo a Google, sin la pantalla intermedia de Cognito
        state,
        code_challenge: b64url(new Uint8Array(digest)),
        code_challenge_method: 'S256',
      });
      location.assign(`${cfg.domain}/oauth2/authorize?${params}`);
    },

    // Al volver de Google: 'ok', 'error', o null si no se venía de un login
    async handleRedirect(): Promise<'ok' | 'error' | null> {
      const query = new URLSearchParams(location.search);
      const code = query.get('code');
      if (!code && !query.get('error')) return null;
      // Se limpia la dirección: el código no debe quedar en el historial ni compartirse al copiar el link
      history.replaceState(history.state, '', location.pathname + location.hash);
      const pending = read<{ verifier: string; state: string }>(sessionStorage, PENDING);
      try {
        sessionStorage.removeItem(PENDING);
      } catch {}
      if (!code || !pending || pending.state !== query.get('state')) return 'error';
      try {
        await requestTokens({ grant_type: 'authorization_code', code, redirect_uri: cfg.redirectUri, code_verifier: pending.verifier });
        return 'ok';
      } catch (e) {
        console.error(e);
        return 'error';
      }
    },

    // Quién está conectado (para mostrar nombre y foto). Sale del ID token.
    user(): User | null {
      const tokens = read<Tokens>(localStorage, TOKENS);
      if (!tokens) return null;
      try {
        const data = readJwt(tokens.id);
        return { name: data.name ?? data.email, email: data.email, picture: data.picture };
      } catch {
        return null;
      }
    },

    // El access token para llamar a la API (etapa 8). Dura 1 hora: si venció, se renueva con el refresh token.
    async accessToken(): Promise<string | null> {
      const tokens = read<Tokens>(localStorage, TOKENS);
      if (!tokens) return null;
      if (tokens.expires - 60_000 > Date.now()) return tokens.access;
      if (!tokens.refresh) return null;
      try {
        return (await requestTokens({ grant_type: 'refresh_token', refresh_token: tokens.refresh }, tokens)).access;
      } catch {
        save(null); // el refresh token venció o lo revocaron: hay que entrar de nuevo
        return null;
      }
    },

    // Cerrar sesión: se borran los tokens y se pasa por Cognito para que olvide la sesión de su lado
    logout() {
      save(null);
      const params = new URLSearchParams({ client_id: cfg.clientId, logout_uri: cfg.redirectUri });
      location.assign(`${cfg.domain}/logout?${params}`);
    },
  };
}
