import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Sparkles,
  Globe,
  UserCircle,
  ClipboardList,
  PenLine,
  Copy,
  Gift,
  Users,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <span className="font-heading text-xl font-bold text-primary">AI Property Copy</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Coba Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="mx-auto max-w-4xl">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Didukung AI terkini — Gemma, GLM, MiniMax
          </span>
          <h1 className="mt-6 font-heading text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Ubah Spek Properti Menjadi{' '}
            <span className="text-primary">Listing Mewah</span>{' '}
            dalam 15 Detik.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Copywriter AI pribadi untuk agen properti profesional. Hasilkan deskripsi yang
            emosional, persuasif, dan berkelas tanpa perlu mengetik dari nol.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="gap-2 px-8 text-base">
              <Link href="/register">
                Coba Gratis Sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="px-8 text-base">
              <Link href="/login">Sudah punya akun? Masuk</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Gratis 3 kredit saat daftar. Tidak perlu kartu kredit.
          </p>
        </div>

        {/* Hero visual — mockup card */}
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border bg-muted/40 px-5 py-3 text-left">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                <span className="h-3 w-3 rounded-full bg-primary/40" />
                <span className="h-3 w-3 rounded-full bg-primary/70" />
                <span className="ml-3 text-xs text-muted-foreground">AI Listing Generator</span>
              </div>
            </div>
            <div className="space-y-4 p-6 text-left">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Tipe Properti', value: 'Rumah Mewah' },
                  { label: 'Lokasi', value: 'Pondok Indah, Jakarta' },
                  { label: 'Luas Bangunan', value: '350 m²' },
                  { label: 'Kamar Tidur', value: '5 Kamar' },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-border bg-muted/30 px-3 py-2">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-medium">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <p className="text-xs font-semibold text-primary mb-2">✨ Hasil Generate AI</p>
                <p className="text-sm leading-relaxed text-foreground">
                  <strong>Hunian Eksklusif di Jantung Pondok Indah — Gaya Hidup Premium yang Sesungguhnya.</strong>
                  {' '}Hadirkan kehidupan impian Anda dalam rumah mewah 350 m² yang dirancang untuk keluarga modern
                  bervisi tinggi. Dengan 5 kamar tidur lega, taman privat, dan finishing premium…
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Feature Highlights ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Semua yang Anda Butuhkan untuk Listing Profesional
            </h2>
            <p className="mt-4 text-muted-foreground">
              Tiga keunggulan utama yang membedakan agen biasa dari agen berprestasi.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: <Sparkles className="h-6 w-6" />,
                title: 'AI Magic Generator',
                desc: 'Masukkan luas tanah, lokasi, dan keunggulan properti. Biarkan AI kami merangkai kata yang menyentuh emosi pembeli dan mendorong mereka untuk segera menghubungi Anda.',
              },
              {
                icon: <Globe className="h-6 w-6" />,
                title: 'Multilingual Professional',
                desc: 'Tembus pasar internasional. Generate listing dalam Bahasa Indonesia, Inggris, Prancis, atau Spanyol secara instan — tanpa biaya translator tambahan.',
              },
              {
                icon: <UserCircle className="h-6 w-6" />,
                title: 'Personalized Workspace',
                desc: 'Simpan profil bisnis Anda sekali saja. Setiap listing otomatis dilengkapi dengan kontak dan signature profesional Anda di setiap deskripsi yang dihasilkan.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-2xl border border-border bg-card p-8 transition-shadow hover:shadow-md"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {f.icon}
                </div>
                <h3 className="font-heading text-lg font-bold">{f.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-muted/30 px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">Semudah 1 – 2 – 3</h2>
            <p className="mt-4 text-muted-foreground">
              Dari spek mentah ke deskripsi siap posting dalam hitungan detik.
            </p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {[
              {
                step: '01',
                icon: <ClipboardList className="h-5 w-5" />,
                title: 'Input Detail Properti',
                desc: 'Masukkan tipe properti, lokasi, luas tanah & bangunan, jumlah kamar, serta keunggulan utama yang ingin Anda tonjolkan.',
              },
              {
                step: '02',
                icon: <PenLine className="h-5 w-5" />,
                title: 'Pilih Gaya Penulisan',
                desc: 'Tentukan tone — Formal untuk listing premium, atau Santai untuk pendekatan yang lebih personal dan relatable.',
              },
              {
                step: '03',
                icon: <Copy className="h-5 w-5" />,
                title: 'Copy & Publish',
                desc: 'Salin hasil deskripsi AI langsung ke portal properti, media sosial, atau kirim via WhatsApp ke calon pembeli.',
              },
            ].map((s) => (
              <div key={s.step} className="relative rounded-2xl border border-border bg-card p-8">
                <span className="font-heading text-5xl font-black text-primary/15 select-none">
                  {s.step}
                </span>
                <div className="mt-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {s.icon}
                </div>
                <h3 className="mt-4 font-heading text-base font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Growth & Loyalty ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold sm:text-4xl">
              Makin Sering Dipakai, Makin Banyak Untungnya
            </h2>
            <p className="mt-4 text-muted-foreground">
              Sistem kredit yang dirancang untuk menghargai kesetiaan Anda.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2">
            <div className="flex flex-col gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Kredit Gratis Setiap Hari</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Cukup login dan klaim bonus harian Anda. Konsisten hadir, konsisten dapat kredit —
                  tidak perlu beli, tidak perlu menunggu.
                </p>
              </div>
              <ul className="space-y-2">
                {['Login setiap hari', 'Klik tombol klaim', 'Kredit langsung masuk'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-heading text-xl font-bold">Ajak Rekan, Dapat Bonus</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Bagikan link referral unik Anda ke sesama agen. Saat mereka bergabung, Anda
                  berdua langsung mendapat <strong>5 kredit premium</strong> sebagai hadiah.
                </p>
              </div>
              <ul className="space-y-2">
                {['Salin link referral Anda', 'Bagikan ke rekan agen', 'Keduanya dapat 5 kredit bonus'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl rounded-3xl border border-primary/20 bg-primary/5 px-8 py-16 text-center">
          <h2 className="font-heading text-3xl font-bold sm:text-4xl">
            Mulai Gratis. Tidak Perlu Kartu Kredit.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Bergabunglah dengan ribuan agen properti yang sudah merasakan perbedaannya.
            Daftar dalam 30 detik dan dapatkan 3 kredit gratis langsung.
          </p>
          <Button size="lg" asChild className="mt-8 gap-2 px-10 text-base">
            <Link href="/register">
              Daftar Sekarang — Gratis
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <span className="font-heading font-semibold text-foreground">AI Property Copy</span>
          <span>© {new Date().getFullYear()} AI Property Copy. Semua hak dilindungi.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Masuk</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
