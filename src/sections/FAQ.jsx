import { useState } from 'react'
import ScrollReveal3D from '../components/ScrollReveal3D'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  {
    q: 'Apa perbedaan Sewa Bot Cloud dengan Beli Full Source Code?',
    a: 'Sewa Bot Cloud (Starter/Pro/Enterprise) sudah termasuk server cloud 24/7 yang kami kelola; Anda cukup memasukkan token bot dan stok akun di dashboard. Paket Full Source Code (Rp 300.000 sekali bayar) memberikan seluruh kode Node.js, Express, Telegraf, dan SQL tanpa enkripsi untuk di-deploy di VPS milik Anda sendiri.'
  },
  {
    q: 'Bagaimana keamanan token bot dan stok password akun saya?',
    a: 'Seluruh token bot Telegram dan kredensial stok akun dienkripsi menggunakan algoritma AES-256-GCM sebelum disimpan ke database. Endpoint API daftar bot dan akun tidak pernah mengembalikan teks rahasia tersebut ke browser.'
  },
  {
    q: 'Metode pembayaran apa saja yang didukung?',
    a: 'Tersedia pembayaran otomatis melalui Midtrans Snap (ketika kunci produksi diaktifkan) serta pembayaran QRIS dan Transfer Bank manual dengan unggah bukti transfer (JPG/PNG/WEBP maksimal 5MB) yang diverifikasi cepat oleh admin.'
  },
  {
    q: 'Apakah bisa mengganti nama bot dan pesan sambutan sesuai toko saya?',
    a: 'Ya. Karena Anda menggunakan token bot resmi dari @BotFather milik Anda sendiri, nama bot, username (@NamaToko_bot), foto profil, dan katalog produk sepenuhnya membawa identitas toko Anda.'
  },
  {
    q: 'Bagaimana cara mengunduh file script setelah membeli paket Source Code?',
    a: 'Setelah pesanan paket Script Only berstatus Paid (Lunas), buka menu "Script & Lisensi" di Dashboard Merchant. Kunci lisensi HMAC dan tombol unduh paket source code akan langsung terbuka.'
  },
  {
    q: 'Apakah ada potongan komisi per transaksi penjualan akun?',
    a: 'Tidak ada potongan komisi dari Autobotz (0% platform fee). Seluruh omset penjualan akun digital masuk ke rekening atau payment gateway toko Anda.'
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0)

  return (
    <section id="faq" className="py-16 md:py-24 bg-brand-chill-white border-b-2 border-brand-dark stage-3d">
      <div className="container-brutalist space-y-10">
        
        <ScrollReveal3D direction="up" className="max-w-2xl space-y-2 text-left">
          <p className="font-mono text-xs font-bold uppercase tracking-wider text-brand-pink">
            DOKUMENTASI &amp; TANYA JAWAB
          </p>
          <h2 className="heading-section">
            Pertanyaan Teknis &amp; Operasional.
          </h2>
        </ScrollReveal3D>

        {/* Dual-Column Clean Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <ScrollReveal3D
                key={idx}
                direction="up"
                delay={idx * 55}
                className="bg-white border-2 border-brand-dark rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  aria-expanded={isOpen}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-heading font-bold text-sm sm:text-base text-brand-dark hover:bg-brand-surface-tint/60 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-brand-dark shrink-0 transition-transform duration-150 ${
                      isOpen ? 'rotate-180 text-brand-pink' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-xs sm:text-sm text-brand-muted leading-relaxed font-sans border-t-2 border-brand-dark/10 bg-brand-surface-tint/30">
                    {faq.a}
                  </div>
                )}
              </ScrollReveal3D>
            )
          })}
        </div>

      </div>
    </section>
  )
}
