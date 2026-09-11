# Tüketici Hakkım

> Tüketici uyuşmazlıklarını tek tek senaryolara ayıran, tamamen statik bir "hakkım var mı?" sözlüğü.

Her senaryo kendi URL'sinde tek bir soruyu cevaplar — **hakkınız var mı?** — ve cevabı
kanun maddesi, süre, başvuru mercii ve somut adımlarla birlikte verir.

- 🟢 `HAKKINIZ VAR` · 🔴 `HAKKINIZ YOK` · 🟡 `DURUMA GÖRE`
- Sunucu yok, veritabanı yok, çerez yok, analitik yok
- Arama tarayıcıda çalışır (Türkçe karakter duyarsız: `ayakkabi` → `ayakkabı`)
- Tüm site build sonrası ~700 KB

## Kurulum

```bash
npm install
npm run dev      # http://localhost:4321
```

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu |
| `npm run validate` | `cases.json` bütünlük kontrolü |
| `npm run build` | Doğrula + `dist/` üret |
| `npm run preview` | Üretilen çıktıyı önizle |

## Yeni senaryo eklemek

Tek yapılacak şey [`src/data/cases.json`](src/data/cases.json) dosyasına bir nesne eklemek.
Sayfa, sitemap, arama indeksi, "benzer senaryolar" ve önceki/sonraki bağlantıları otomatik üretilir.

```jsonc
{
  "slug": "kargo-kayboldu",              // URL: /kargo-kayboldu/ — a-z, 0-9, tire
  "title": "Kargom kayboldu / hasarlı geldi",
  "question": "Kargom kayboldu, kime başvurmalıyım?",  // H1 ve FAQ schema'da kullanılır
  "verdict": "var",                      // "var" | "yok" | "kosullu"
  "category": "Kargo & Teslimat",
  "aliases": ["kargo kayıp tazminat"],   // yalnız aramada kullanılır
  "summary": "Tek cümlelik cevap (en az 40 karakter).",
  "situation": "Durumun ne anlama geldiği.",
  "legal": "Hukuki değerlendirme.",
  "rights": ["Talep edilebilecekler"],
  "deadline": "Süre bilgisi",
  "authority": "Nereye başvurulur",
  "steps": ["Adım 1", "Adım 2"],
  "basis": [{ "law": "6502 sayılı TKHK", "article": "m.48", "note": "Kısa açıklama" }],
  "related": ["siparis-teslim-edilmedi"], // mevcut slug'lar olmalı
  "updated": "2026-09-11"
}
```

`npm run validate` eksik alan, tekrar eden slug, geçersiz verdict ve kırık `related`
referanslarını yakalar; `npm run build` bunu otomatik çalıştırır.

## Yayınlama

Canlı: **https://osmnnl.github.io/tuketicihakkim/**

`master` dalına her push, [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
üzerinden GitHub Pages'e otomatik dağıtılır.

Adres ve alt dizin iki ortam değişkeniyle yönetilir — kod içinde sabit adres yoktur:

| Değişken | Varsayılan | Açıklama |
| --- | --- | --- |
| `SITE_URL` | `https://osmnnl.github.io` | Kök adres |
| `BASE_PATH` | `/tuketicihakkim` | Alt dizin |

**Kendi alan adınıza taşırken** (örn. `tuketicihakkim.com`) yalnızca şunu çalıştırın:

```bash
SITE_URL=https://tuketicihakkim.com BASE_PATH=/ npm run build
```

Sitemap, robots.txt, canonical etiketleri ve tüm dahili bağlantılar buna göre üretilir.
(GitHub Pages'te özel alan adı kullanacaksanız workflow'a bu değişkenleri ekleyip
`public/CNAME` dosyası oluşturun.)

Cloudflare Pages / Netlify için: build `npm run build`, output `dist`.

## Yapı

```
src/
  data/cases.json        ← tek içerik kaynağı
  lib/cases.ts           ← tipler, sıralama, ilişkiler, arama indeksi
  layouts/Base.astro     ← iskelet, tema, istemci tarafı arama
  components/            ← SearchBox · VerdictBadge · CaseCard
  pages/
    index.astro          ← ana sayfa
    [slug].astro         ← senaryo detayı (her kayıt için bir sayfa)
    senaryolar/          ← A–Z liste + kategori filtresi
    basvuru-rehberi/
    hakkinda/
    sitemap.xml.ts
scripts/validate.mjs
```

## Yasal uyarı

Bu depodaki içerik **genel bilgilendirme amaçlıdır, hukuki danışmanlık değildir** ve
avukat–müvekkil ilişkisi doğurmaz. Mevzuat ve parasal sınırlar değişir; somut olayın
koşulları farklı sonuç doğurabilir. Hatalı bulduğunuz bir kaydı issue açarak bildirin.

## Lisans

Kod MIT. İçerik CC BY 4.0 — kullanırken kaynak gösterin.
