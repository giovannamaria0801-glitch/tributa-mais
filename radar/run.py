#!/usr/bin/env python3
"""TRIBUTA+ Radar Tributário — monitor diário de normas (somente biblioteca padrão).
Fluxo: fontes (data/sources.json) -> coleta -> deduplicação/versões -> IA (opcional) -> data/normas.json.
A IA só roda se OPENAI_API_KEY e OPENAI_MODEL existirem (Secrets/Variables). Nada é apagado: normas ficam
para sempre; só o log de execuções (runs.json) é limitado às últimas 90 execuções."""
import datetime as dt, difflib, hashlib, json, os, re, sys, time
import urllib.error, urllib.request
import xml.etree.ElementTree as ET
from html.parser import HTMLParser

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, "data")
UA = "TRIBUTA+ Radar (projeto educacional sem fins lucrativos)"
NA = "não identificado no texto"
# Status editoriais. A automação só define os dois primeiros e 'atualizada_posteriormente'.
STATUS = ["identificada", "aguardando_analise", "em_revisao", "revisada", "publicada", "rejeitada", "atualizada_posteriormente"]
AI_KEYS = {"tipo_documento": str, "numero": str, "orgao": str, "data_publicacao": str, "assunto": str,
           "resumo_simples": str, "o_que_mudou": str, "dispositivos_citados": list, "afetados": str,
           "repercussao_pratica": str, "prazos_vigencia": str, "pontos_para_conferencia": list,
           "palavras_chave": list, "categorias": list}
PROMPT = ("Você é analista de legislação tributária brasileira. Use SOMENTE o texto fornecido. Nunca invente artigos, "
          "alíquotas, datas, prazos, obrigações, interpretações ou efeitos jurídicos. O que não constar expressamente no texto "
          f"deve ser respondido exatamente como '{NA}'. Não emita parecer nem conclua sobre vigência além do que o texto disser. "
          "Se receber apenas um trecho ou um diff, diga isso em pontos_para_conferencia. Explique em português simples. "
          "Responda apenas um objeto JSON com as chaves: " + ", ".join(AI_KEYS) + " (as chaves do tipo lista devem ser listas de strings).")

def now(): return dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")
def load(p, d):
    try:
        with open(p, encoding="utf-8") as f: return json.load(f)
    except FileNotFoundError: return d
def save(p, o):
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p + ".tmp", "w", encoding="utf-8") as f: json.dump(o, f, ensure_ascii=False, indent=1)
    os.replace(p + ".tmp", p)
def sha(s): return hashlib.sha256(s.encode("utf-8")).hexdigest()

def fetch(url, tries=3):
    """GET com tentativas e espera exponencial (falhas temporárias)."""
    err = None
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=30) as r: return r.read()
        except (urllib.error.URLError, TimeoutError, OSError) as e:
            err = e; time.sleep(2 ** n)
    raise RuntimeError(f"{url}: {err}")

def decode(b):
    try: return b.decode("utf-8")
    except UnicodeDecodeError: return b.decode("cp1252", "replace")

class _Text(HTMLParser):
    def __init__(s): super().__init__(); s.out = []; s.skip = 0
    def handle_starttag(s, t, a):
        if t in ("script", "style"): s.skip += 1
        if t in ("p", "div", "br", "li", "tr", "h1", "h2", "h3", "h4"): s.out.append("\n")
    def handle_endtag(s, t):
        if t in ("script", "style"): s.skip = max(0, s.skip - 1)
    def handle_data(s, d):
        if not s.skip: s.out.append(d)
def html_text(h):
    p = _Text(); p.feed(h)
    lines = (re.sub(r"\s+", " ", l).strip() for l in "".join(p.out).split("\n"))
    return "\n".join(l for l in lines if l)

def parse_feed(xml):
    """RSS 2.0 ou Atom -> [{titulo,url,publicado,texto}]."""
    root = ET.fromstring(xml); out = []
    tag = lambda e: e.tag.split("}")[-1]
    for it in root.iter():
        if tag(it) not in ("item", "entry"): continue
        f = {tag(c): c for c in it}
        link = (f["link"].get("href") or f["link"].text or "") if "link" in f else ""
        g = lambda k: ((f[k].text or "").strip() if k in f else "")
        out.append({"titulo": g("title"), "url": link.strip(), "publicado": g("pubDate") or g("updated") or g("published"),
                    "texto": html_text(g("description") or g("summary") or "")})
    return out

def collect(src):
    """Adapters: 'page' (observa uma página oficial) e 'rss' (feed oficial). Novas fontes = novos tipos aqui."""
    if src["type"] == "page":
        return [{"titulo": src["titulo"], "url": src["url"], "publicado": src.get("publicado"), "texto": html_text(decode(fetch(src["url"])))}]
    if src["type"] == "rss":
        kws = [k.lower() for k in src.get("keywords", [])]
        return [i for i in parse_feed(fetch(src["url"])) if i["url"] and (not kws or any(k in (i["titulo"] + i["texto"]).lower() for k in kws))]
    raise ValueError("tipo de fonte desconhecido: " + src["type"])

def valid_ai(o):
    return isinstance(o, dict) and all(isinstance(o.get(k), t) for k, t in AI_KEYS.items())

def ai_analyze(item, prev_text=None):
    """Chama a OpenAI só no ambiente protegido. Retorna dict validado ou None."""
    key, model = os.environ.get("OPENAI_API_KEY"), os.environ.get("OPENAI_MODEL")
    if not (key and model): return None
    txt = item["texto"]
    if prev_text is not None:
        d = [l for l in difflib.unified_diff(prev_text.splitlines(), txt.splitlines(), lineterm="", n=0) if l[:1] in "+-" and l[:3] not in ("+++", "---")]
        body = "VERSÃO ALTERADA. Linhas removidas (-) e acrescentadas (+):\n" + "\n".join(d)[:12000]
    else:
        body = "TEXTO (primeiros 12000 caracteres):\n" + txt[:12000]
    req = urllib.request.Request("https://api.openai.com/v1/chat/completions", method="POST",
        data=json.dumps({"model": model, "response_format": {"type": "json_object"},
                         "messages": [{"role": "system", "content": PROMPT},
                                      {"role": "user", "content": f"Título: {item['titulo']}\nURL: {item['url']}\n{body}"}]}).encode(),
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            o = json.loads(json.loads(r.read())["choices"][0]["message"]["content"])
        return o if valid_ai(o) else None
    except Exception as e:  # nunca registrar a chave nem o corpo da requisição
        print("IA falhou:", type(e).__name__); return None

def upsert(db, src, item, ts, ai=ai_analyze, cache=None):
    """Deduplica por id(URL)/hash; detecta alteração. Retorna 'novo' | 'alterado' | None."""
    h = sha(item["texto"]); nid = sha(item["url"])[:12]
    rec = next((r for r in db if r["id"] == nid), None)
    if rec is None:
        if any(r["hash"] == h for r in db): return None
        rec = {"id": nid, "titulo": item["titulo"], "tipo": src.get("tipo", NA), "orgao": src.get("orgao", NA), "numero": src.get("numero", NA),
               "publicado_em": item.get("publicado") or src.get("publicado"), "url": item["url"], "fonte_id": src["id"], "hash": h,
               "referencia": item["texto"][:800], "resumo_ia": None, "status": "identificada", "versao_anterior": None,
               "primeira_vez_em": ts, "atualizado_em": ts, "verificado_em": ts, "historico": [{"em": ts, "evento": "identificada", "hash": h}]}
        rec["resumo_ia"] = ai(item)
        if rec["resumo_ia"]: rec["status"] = "aguardando_analise"
        if cache is not None: cache(nid, item["texto"], None)
        db.append(rec); return "novo"
    rec["verificado_em"] = ts
    if rec["hash"] == h: return None
    prev = cache(nid, None, None) if cache else None
    rec.update(versao_anterior=rec["hash"], hash=h, atualizado_em=ts, referencia=item["texto"][:800], status="atualizada_posteriormente")
    rec["historico"].append({"em": ts, "evento": "alterada", "hash": h})
    rec["resumo_ia"] = ai(item, prev) or rec["resumo_ia"]
    if cache is not None: cache(nid, item["texto"], None)
    return "alterado"

def _cache(nid, new, _):
    p = os.path.join(DATA, "cache", nid + ".txt")
    if new is None:
        try: return open(p, encoding="utf-8").read()
        except FileNotFoundError: return None
    os.makedirs(os.path.dirname(p), exist_ok=True); open(p, "w", encoding="utf-8").write(new)

def run_all(sources, db, ts, ai=ai_analyze, cache=None):
    """Uma fonte com falha não interrompe as demais."""
    log = {"inicio": ts, "fontes": [], "novos": 0, "alterados": 0}
    for s in sources:
        if not s.get("enabled", True): continue
        try:
            items = collect(s); n = a = 0
            for it in items:
                r = upsert(db, s, it, ts, ai, cache); n += r == "novo"; a += r == "alterado"
            log["novos"] += n; log["alterados"] += a; log["fontes"].append({"id": s["id"], "ok": True, "itens": len(items)})
        except Exception as e:
            log["fontes"].append({"id": s["id"], "ok": False, "erro": str(e)[:200]})
        time.sleep(1)  # cortesia com as fontes
    log["fim"] = now(); return log

def main():
    ts = now(); src = load(os.path.join(DATA, "sources.json"), [])
    meta = load(os.path.join(DATA, "normas.json"), {"itens": []}); db = meta["itens"]
    log = run_all(src, db, ts, cache=_cache)
    log["ia"] = bool(os.environ.get("OPENAI_API_KEY") and os.environ.get("OPENAI_MODEL"))
    meta.update(itens=db, ultima_verificacao=ts, aviso="Conteúdo automatizado; resumos de IA pendentes de revisão humana.")
    save(os.path.join(DATA, "normas.json"), meta)
    runs = load(os.path.join(DATA, "runs.json"), []); runs.append(log); save(os.path.join(DATA, "runs.json"), runs[-90:])
    print(json.dumps(log, ensure_ascii=False))
    ok = [f for f in log["fontes"] if f["ok"]]
    return 0 if ok or not log["fontes"] else 1  # falha total => workflow vermelho

if __name__ == "__main__": sys.exit(main())
