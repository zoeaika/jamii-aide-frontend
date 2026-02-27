const BASE_URL = process.env.BACKEND_URL || "http://127.0.0.1:8000";
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;
const AUTO_REGISTER = (process.env.AUTO_REGISTER || "false").toLowerCase() === "true";
const FIRST_NAME = process.env.TEST_FIRST_NAME || "Contract";
const LAST_NAME = process.env.TEST_LAST_NAME || "User";

if (!EMAIL || !PASSWORD) {
  console.error("Set TEST_EMAIL and TEST_PASSWORD env vars first.");
  process.exit(1);
}

const results = [];
const now = Date.now();

function pass(name, extra = "") {
  results.push({ ok: true, name, extra });
}

function fail(name, err) {
  results.push({ ok: false, name, extra: String(err?.message || err) });
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

async function api(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return { ok: res.ok, status: res.status, data };
}

async function loginOrRegister() {
  const login = await api("/api/auth/login/", {
    method: "POST",
    body: { email: EMAIL, password: PASSWORD },
  });

  if (login.ok && login.data?.access_token) {
    return { token: login.data.access_token, mode: "login" };
  }

  if (!AUTO_REGISTER) {
    throw new Error(`Login failed (${login.status}): ${JSON.stringify(login.data)}`);
  }

  const register = await api("/api/auth/register/", {
    method: "POST",
    body: {
      email: EMAIL,
      password: PASSWORD,
      first_name: FIRST_NAME,
      last_name: LAST_NAME,
      role: "END_USER",
    },
  });

  if (register.ok && register.data?.access_token) {
    return { token: register.data.access_token, mode: "register" };
  }

  throw new Error(
    `Login failed (${login.status}): ${JSON.stringify(login.data)} | Register failed (${register.status}): ${JSON.stringify(register.data)}`
  );
}

(async () => {
  let token;
  let createdId;

  try {
    const auth = await loginOrRegister();
    token = auth.token;
    pass("Auth login shape", `via ${auth.mode}`);
  } catch (e) {
    fail("Auth login shape", e);
  }

  try {
    const me = await api("/api/auth/me/", { token });
    assert(me.ok, `GET /api/auth/me/ failed (${me.status})`);
    assert(typeof me.data?.id === "string", "me.id must be string");
    assert(typeof me.data?.role === "string", "me.role must be string");
    pass("Auth me shape");
  } catch (e) {
    fail("Auth me shape", e);
  }

  try {
    const list = await api("/api/family-members/", { token });
    assert(list.ok, `GET /api/family-members/ failed (${list.status})`);
    assert(Array.isArray(list.data?.results), "family-members must return paginated {results: []}");
    pass("Family members list is paginated");
  } catch (e) {
    fail("Family members list is paginated", e);
  }

  try {
    const create = await api("/api/family-members/", {
      method: "POST",
      token,
      body: {
        first_name: `Contract${now}`,
        last_name: "Check",
        date_of_birth: "1960-01-01",
        gender: "FEMALE",
      },
    });
    assert(create.ok, `POST /api/family-members/ failed (${create.status}): ${JSON.stringify(create.data)}`);
    assert(typeof create.data?.id === "string", "Created family member missing id");
    createdId = create.data.id;
    pass("Create family member without end_user_profile");
  } catch (e) {
    fail("Create family member without end_user_profile", e);
  }

  try {
    const list = await api("/api/family-members/", { token });
    assert(list.ok, `GET /api/family-members/ failed (${list.status})`);
    const ids = new Set((list.data?.results || []).map((x) => x.id));
    assert(createdId && ids.has(createdId), "Created family member not found in list");
    pass("Saved family member appears in list");
  } catch (e) {
    fail("Saved family member appears in list", e);
  }

  try {
    const appointments = await api("/api/appointments/", { token });
    assert(appointments.ok, `GET /api/appointments/ failed (${appointments.status})`);
    assert(Array.isArray(appointments.data?.results), "appointments must return paginated {results: []}");
    pass("Appointments list is paginated");
  } catch (e) {
    fail("Appointments list is paginated", e);
  }

  console.log("\nBackend/Frontend Alignment Check");
  for (const result of results) {
    console.log(`${result.ok ? "PASS" : "FAIL"} - ${result.name}${result.extra ? ` | ${result.extra}` : ""}`);
  }

  const failed = results.filter((r) => !r.ok).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} passed`);
  process.exit(failed ? 1 : 0);
})();
