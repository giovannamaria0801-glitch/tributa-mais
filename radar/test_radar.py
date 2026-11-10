import os, sys, unittest
from unittest import mock
sys.path.insert(0, os.path.dirname(__file__))
import run

RSS = b"<rss><channel><item><title>Portaria IBS 1</title><link>https://x.gov.br/1</link><pubDate>Mon, 02 Nov 2026</pubDate><description>&lt;p&gt;Regula o IBS&lt;/p&gt;</description></item></channel></rss>"
ATOM = b'<feed xmlns="http://www.w3.org/2005/Atom"><entry><title>CBS</title><link href="https://x.gov.br/2"/><updated>2026-11-01</updated><summary>texto</summary></entry></feed>'
SRC = {"id": "s", "type": "page", "titulo": "LC", "url": "https://x.gov.br/lc"}
IT = lambda t: {"titulo": "LC", "url": "https://x.gov.br/lc", "texto": t}
VALID = {k: ("x" if t is str else ["x"]) for k, t in run.AI_KEYS.items()}

class T(unittest.TestCase):
    def test_feeds(self):
        self.assertEqual(run.parse_feed(RSS)[0]["texto"], "Regula o IBS")
        self.assertEqual(run.parse_feed(ATOM)[0]["url"], "https://x.gov.br/2")
    def test_html(self): self.assertEqual(run.html_text("<style>a{}</style><p>Olá</p><p>mundo</p>"), "Olá\nmundo")
    def test_new_dedupe_change(self):
        db = []
        self.assertEqual(run.upsert(db, SRC, IT("v1"), "t1", ai=lambda *a: None), "novo")
        self.assertEqual(db[0]["status"], "identificada")
        self.assertIsNone(run.upsert(db, SRC, IT("v1"), "t2", ai=lambda *a: None))  # mesma URL e hash
        self.assertEqual(db[0]["verificado_em"], "t2")
        self.assertIsNone(run.upsert(db, {**SRC, "id": "o"}, {**IT("v1"), "url": "https://y"}, "t2", ai=lambda *a: None))  # hash duplicado
        self.assertEqual(run.upsert(db, SRC, IT("v2"), "t3", ai=lambda *a: None), "alterado")
        self.assertEqual((db[0]["status"], len(db[0]["historico"])), ("atualizada_posteriormente", 2))
        self.assertEqual(len(db), 1)
    def test_ai_sets_pending(self):
        db = []; run.upsert(db, SRC, IT("a"), "t", ai=lambda *a: VALID)
        self.assertEqual(db[0]["status"], "aguardando_analise")
    def test_ai_validation_and_no_key(self):
        self.assertTrue(run.valid_ai(VALID)); self.assertFalse(run.valid_ai({"resumo_simples": "x"}))
        with mock.patch.dict(os.environ, {}, clear=True): self.assertIsNone(run.ai_analyze(IT("a")))
    def test_failing_source_does_not_stop_others(self):
        def fake(s):
            if s["id"] == "bad": raise RuntimeError("fora do ar")
            return [IT("ok")]
        db = []
        with mock.patch.object(run, "collect", fake), mock.patch.object(run.time, "sleep"):
            log = run_all = run.run_all([{**SRC, "id": "bad"}, SRC, {**SRC, "id": "off", "enabled": False}], db, "t", ai=lambda *a: None)
        self.assertEqual([f["ok"] for f in log["fontes"]], [False, True]); self.assertEqual(len(db), 1)

    def test_listing_only_https_allowed_domains_and_keywords(self):
        html = b'<a href="/ato-1">Ato Conjunto RFB/CGIBS</a><a href="https://evil.example/ato">Ato IBS</a><a href="/noticia">Evento cultural</a>'
        pages = {
            "https://www.gov.br/lista": html,
            "https://www.gov.br/ato-1": b"<html><p>Publicado em 10/11/2026</p><p>Texto do ato IBS e CBS</p></html>",
        }
        src = {"id":"list","type":"listing","url":"https://www.gov.br/lista","allowed_domains":["gov.br"],"keywords":["Ato Conjunto"],"max_items":10}
        with mock.patch.object(run, "fetch", side_effect=lambda u: pages[u]):
            items = run.collect(src)
        self.assertEqual(len(items), 1)
        self.assertEqual(items[0]["url"], "https://www.gov.br/ato-1")
        self.assertEqual(items[0]["publicado"], "10/11/2026")

    def test_retry(self):
        with mock.patch.object(run.urllib.request, "urlopen", side_effect=OSError("x")), mock.patch.object(run.time, "sleep") as sl:
            with self.assertRaises(RuntimeError): run.fetch("https://x")
        self.assertEqual(sl.call_count, 3)

if __name__ == "__main__": unittest.main()
