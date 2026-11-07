"""Static SEO and contact regressions. Run: python tests/check_site.py"""
from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.tags = []
        self.feed(path.read_text(encoding='utf-8'))

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))

    def find(self, tag, **attrs):
        return [a for t, a in self.tags if t == tag and all(a.get(k) == v for k, v in attrs.items())]

class SiteTests(unittest.TestCase):
    def test_public_pages(self):
        canonicals = set()
        for path in ROOT.glob('*.html'):
            with self.subTest(page=path.name):
                doc = Document(path)
                self.assertEqual(len(doc.find('h1')), 1)
                self.assertEqual(len(doc.find('main', id='conteudo')), 1)
                descriptions = doc.find('meta', name='description')
                self.assertEqual(len(descriptions), 1)
                self.assertTrue(30 <= len(descriptions[0]['content']) <= 155)
                self.assertEqual(len(doc.find('title')), 1)
                canonical = doc.find('link', rel='canonical')
                self.assertEqual(len(canonical), 1)
                self.assertTrue(canonical[0]['href'].startswith('https://asydim.pt/'))
                self.assertNotIn(canonical[0]['href'], canonicals)
                canonicals.add(canonical[0]['href'])
                self.assertEqual(len(doc.find('meta', property='og:title')), 1)
                self.assertEqual(len(doc.find('meta', property='og:description')), 1)
                for href in ['politica-privacidade.html', 'termos-condicoes.html', 'https://www.livroreclamacoes.pt']:
                    self.assertTrue(doc.find('a', href=href), href)
                scripts = [tag['src'] for tag in doc.find('script') if 'src' in tag]
                self.assertLess(scripts.index('enhancements.js'), scripts.index('script.js'))
                text = path.read_text(encoding='utf-8')
                for stale in ['info@asydim.pt', '© 2025', 'Q3 2025']:
                    self.assertNotIn(stale, text)
        sitemap = ET.parse(ROOT / 'sitemap.xml')
        locations = {e.text for e in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')}
        self.assertEqual(locations, canonicals)
        self.assertIn('Sitemap: https://asydim.pt/sitemap.xml', (ROOT / 'robots.txt').read_text())

    def test_form_contract(self):
        doc = Document(ROOT / 'index.html')
        form = doc.find('form', id='contact-form')[0]
        self.assertEqual(form['method'], 'POST')
        self.assertEqual(form['enctype'], 'multipart/form-data')
        self.assertEqual(form['data-netlify'], 'true')
        self.assertNotIn('novalidate', form)
        self.assertIn('required', doc.find('input', id='consentimento')[0])
        self.assertEqual(doc.find('select', id='servico')[0]['name'], 'assunto')
        self.assertEqual([option['value'] for option in doc.find('option')],
                         ['', 'energia', 'domotica', 'engenharia', 'especialidade'])
        self.assertTrue(doc.find('input', name='servico'))
        self.assertTrue(doc.find('input', name='form-name', value='contacto'))
        self.assertIn('disabled', doc.find('input', id='fatura')[0])
        self.assertEqual(doc.find('input', id='fatura')[0]['type'], 'file')
        for field in ['nome', 'email', 'consentimento']:
            self.assertIn('required', doc.find('input', id=field)[0])

    def test_simulator_contract(self):
        doc = Document(ROOT / 'raiz-procurement.html')
        slider = doc.find('input', id='monthly-bill')[0]
        self.assertEqual([slider[k] for k in ['type', 'min', 'max', 'step']], ['range', '500', '50000', '500'])
        self.assertTrue(doc.find('a', id='calculator-cta'))
        self.assertTrue(doc.find('strong', id='annual-saving'))

if __name__ == '__main__':
    unittest.main(verbosity=2)
