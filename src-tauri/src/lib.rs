use serde::Deserialize;

#[derive(Deserialize)]
struct AiMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct AiRequest {
    model: String,
    system: Option<String>,
    messages: Vec<AiMessage>,
    endpoint: Option<String>, // Ollama base URL — must be loopback
    max_tokens: Option<u32>,
}

/// v2 is strictly local: the only model backend is Ollama on this machine.
/// Accept an endpoint only if its host is loopback — a literal 127.0.0.0/8 or
/// ::1 address, or the name "localhost". Anything else (including LAN hosts
/// and DNS names that would merely *resolve* to loopback) is refused, so a
/// tampered settings record cannot route HR data off the device.
fn ensure_loopback(base: &str) -> Result<url::Url, String> {
    let parsed = url::Url::parse(base)
        .map_err(|_| format!("Invalid Ollama endpoint: {base}"))?;
    if parsed.scheme() != "http" && parsed.scheme() != "https" {
        return Err(format!("Ollama endpoint must be http(s), got {}", parsed.scheme()));
    }
    let local = match parsed.host() {
        Some(url::Host::Ipv4(ip)) => ip.is_loopback(),
        Some(url::Host::Ipv6(ip)) => ip.is_loopback(),
        Some(url::Host::Domain(d)) => d.eq_ignore_ascii_case("localhost"),
        None => false,
    };
    if !local {
        return Err(format!(
            "hr-tools v2 is local-only: the Ollama endpoint must be on this machine \
             (localhost / 127.0.0.1), got {base}"
        ));
    }
    Ok(parsed)
}

/// Opt-in, local-only AI completion — the sole network code in the app, and it
/// never leaves the machine: the endpoint is validated as loopback above, and
/// redirects are disabled so a local process can't bounce the request to a
/// remote host. Runs in Rust (never the webview), so the webview CSP stays
/// locked to 'self'. Called only when the user has enabled AI in settings.
#[tauri::command]
async fn ai_complete(req: AiRequest) -> Result<String, String> {
    let base = req
        .endpoint
        .clone()
        .filter(|e| !e.trim().is_empty())
        .unwrap_or_else(|| "http://localhost:11434".to_string());
    ensure_loopback(&base)?;
    let url = format!("{}/api/chat", base.trim_end_matches('/'));

    // no_proxy: reqwest honours HTTP(S)_PROXY env vars by default, which would
    // route even a loopback request through an off-device proxy.
    let client = reqwest::Client::builder()
        .redirect(reqwest::redirect::Policy::none())
        .no_proxy()
        .build()
        .map_err(|e| format!("HTTP client error: {e}"))?;

    let mut messages: Vec<serde_json::Value> = Vec::new();
    if let Some(sys) = &req.system {
        messages.push(serde_json::json!({ "role": "system", "content": sys }));
    }
    for m in &req.messages {
        messages.push(serde_json::json!({ "role": m.role, "content": m.content }));
    }
    let body = serde_json::json!({
        "model": req.model,
        "messages": messages,
        "stream": false,
        "options": { "num_predict": req.max_tokens.unwrap_or(2048) },
    });

    let resp = client
        .post(&url)
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("Can't reach Ollama at {base} — is it running? ({e})"))?;

    let status = resp.status();
    let val: serde_json::Value =
        resp.json().await.map_err(|e| format!("Bad response: {e}"))?;
    if !status.is_success() {
        let msg = val["error"].as_str().unwrap_or("request failed");
        return Err(format!("Ollama error ({status}): {msg}"));
    }
    Ok(val["message"]["content"].as_str().unwrap_or("").to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![ai_complete])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::ensure_loopback;

    #[test]
    fn accepts_loopback() {
        assert!(ensure_loopback("http://localhost:11434").is_ok());
        assert!(ensure_loopback("http://127.0.0.1:11434").is_ok());
        assert!(ensure_loopback("http://[::1]:11434").is_ok());
        assert!(ensure_loopback("http://LOCALHOST:11434").is_ok());
        assert!(ensure_loopback("http://[0:0:0:0:0:0:0:1]:11434").is_ok());
        assert!(ensure_loopback("http://127.0.0.2:11434").is_ok()); // 127/8 is loopback
    }

    #[test]
    fn rejects_remote() {
        assert!(ensure_loopback("http://example.com:11434").is_err());
        assert!(ensure_loopback("https://api.anthropic.com").is_err());
        assert!(ensure_loopback("http://192.168.1.10:11434").is_err());
        assert!(ensure_loopback("http://127.0.0.1.evil.com").is_err());
        assert!(ensure_loopback("ftp://localhost").is_err());
        assert!(ensure_loopback("not a url").is_err());
        // IPv4-mapped IPv6 is NOT Ipv6Addr::is_loopback — must stay rejected
        assert!(ensure_loopback("http://[::ffff:8.8.8.8]:11434").is_err());
        assert!(ensure_loopback("http://[::ffff:127.0.0.1]:11434").is_err());
        // 0.0.0.0 reaches local listeners on some platforms but is not loopback
        assert!(ensure_loopback("http://0.0.0.0:11434").is_err());
        // userinfo must not confuse host extraction
        assert!(ensure_loopback("http://localhost@evil.com:11434").is_err());
        // trailing-dot FQDN form is not the literal "localhost"
        assert!(ensure_loopback("http://localhost.:11434").is_err());
    }
}
