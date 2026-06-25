use serde::Deserialize;

#[derive(Deserialize)]
struct AiMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
struct AiRequest {
    provider: String, // "anthropic" | "ollama"
    model: String,
    system: Option<String>,
    messages: Vec<AiMessage>,
    api_key: Option<String>, // BYOK — Anthropic only
    endpoint: Option<String>, // base URL — Ollama only
    max_tokens: Option<u32>,
}

/// Optional, opt-in AI completion. The ONLY network egress in the app — it runs
/// here in Rust (never the webview), so the webview CSP stays locked to 'self'
/// and the user's key never touches the front-end network layer. Called only
/// when the user has explicitly enabled AI in settings.
#[tauri::command]
async fn ai_complete(req: AiRequest) -> Result<String, String> {
    let client = reqwest::Client::new();

    match req.provider.as_str() {
        // ── Anthropic Claude (bring-your-own-key, cloud) ──────────────────
        "anthropic" => {
            let key = req
                .api_key
                .clone()
                .filter(|k| !k.trim().is_empty())
                .ok_or("Missing Anthropic API key")?;

            let messages: Vec<serde_json::Value> = req
                .messages
                .iter()
                .map(|m| serde_json::json!({ "role": m.role, "content": m.content }))
                .collect();
            let mut body = serde_json::json!({
                "model": req.model,
                "max_tokens": req.max_tokens.unwrap_or(2048),
                "messages": messages,
            });
            if let Some(sys) = &req.system {
                body["system"] = serde_json::json!(sys);
            }

            let resp = client
                .post("https://api.anthropic.com/v1/messages")
                .header("x-api-key", key)
                .header("anthropic-version", "2023-06-01")
                .header("content-type", "application/json")
                .json(&body)
                .send()
                .await
                .map_err(|e| format!("Network error: {e}"))?;

            let status = resp.status();
            let val: serde_json::Value =
                resp.json().await.map_err(|e| format!("Bad response: {e}"))?;
            if !status.is_success() {
                let msg = val["error"]["message"].as_str().unwrap_or("request failed");
                return Err(format!("Anthropic API error ({status}): {msg}"));
            }
            // Response content is a list of blocks: [{type:"text", text:"..."}]
            let text = val["content"]
                .as_array()
                .map(|arr| {
                    arr.iter()
                        .filter_map(|b| b["text"].as_str())
                        .collect::<Vec<_>>()
                        .join("")
                })
                .unwrap_or_default();
            Ok(text)
        }

        // ── Ollama (local model, stays on-device) ─────────────────────────
        "ollama" => {
            let base = req
                .endpoint
                .clone()
                .filter(|e| !e.trim().is_empty())
                .unwrap_or_else(|| "http://localhost:11434".to_string());
            let url = format!("{}/api/chat", base.trim_end_matches('/'));

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

        other => Err(format!("Unknown AI provider: {other}")),
    }
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
