"use strict";

/* ===== Helper ===== */
const $ = (selector) => document.querySelector(selector);
const rupiah = (angka) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(angka);

/* ===== 1. Dark Mode Toggle ===== */
function setTema(tema) {
  document.documentElement.setAttribute("data-bs-theme", tema);
  const tombol = $("#themeToggle");
  tombol.textContent = tema === "dark" ? "Mode terang" : "Mode gelap";
  tombol.setAttribute("aria-pressed", String(tema === "dark"));
  try { localStorage.setItem("tema", tema); } catch (e) { /* penyimpanan tidak tersedia */ }
}

function toggleTema() {
  const sekarang = document.documentElement.getAttribute("data-bs-theme");
  setTema(sekarang === "dark" ? "light" : "dark");
}

/* ===== 2. Filter & Search Proyek ===== */
function filterProyek() {
  const kata = $("#cariProyek").value.trim().toLowerCase();
  const kategori = $("#filterKategori").value;
  let tampil = 0;

  document.querySelectorAll(".proyek").forEach((kartu) => {
    const cocokKata = kartu.textContent.toLowerCase().includes(kata);
    const cocokKategori = kategori === "semua" || kartu.dataset.kategori === kategori;
    const tampilkan = cocokKata && cocokKategori;
    kartu.classList.toggle("d-none", !tampilkan);
    if (tampilkan) tampil++;
  });

  $("#hasilProyek").textContent =
    tampil === 0 ? "Tidak ada proyek yang cocok. Coba kata kunci lain." : `Menampilkan ${tampil} proyek.`;
}

/* ===== 3. Kalkulator Estimasi Biaya ===== */
const HARGA_HALAMAN_TAMBAHAN = 250000;

function hitungEstimasi(event) {
  event.preventDefault();
  const inputHalaman = $("#jumlahHalaman");
  const halaman = parseInt(inputHalaman.value, 10);

  if (Number.isNaN(halaman) || halaman < 1 || halaman > 50) {
    inputHalaman.classList.add("is-invalid");
    return;
  }
  inputHalaman.classList.remove("is-invalid");

  const dasar = Number($("#jenisWeb").value);
  const biayaHalaman = (halaman - 1) * HARGA_HALAMAN_TAMBAHAN;
  const biayaFitur = [...document.querySelectorAll(".fitur:checked")].reduce((total, f) => total + Number(f.value), 0);
  const pengali = Number($("#kecepatan").value);
  const subtotal = dasar + biayaHalaman + biayaFitur;
  const total = subtotal * pengali;

  $("#rincian").innerHTML = `
    <dt class="col-7 fw-normal">Paket dasar</dt><dd class="col-5">${rupiah(dasar)}</dd>
    <dt class="col-7 fw-normal">Halaman tambahan (${halaman - 1})</dt><dd class="col-5">${rupiah(biayaHalaman)}</dd>
    <dt class="col-7 fw-normal">Fitur tambahan</dt><dd class="col-5">${rupiah(biayaFitur)}</dd>
    <dt class="col-7 fw-normal">Biaya kecepatan</dt><dd class="col-5">${rupiah(total - subtotal)}</dd>
    <dt class="col-12 border-top pt-2 mt-2">Total estimasi</dt><dd class="col-12 total">${rupiah(total)}</dd>`;
}

function resetEstimasi() {
  $("#jumlahHalaman").classList.remove("is-invalid");
  $("#rincian").innerHTML =
    '<dt class="col-12 fw-normal text-body-secondary">Tekan “Hitung estimasi” untuk melihat hasil.</dt>';
}

/* ===== 4. Validasi Form Kontak ===== */
function validasiField(input, valid) {
  input.classList.toggle("is-invalid", !valid);
  input.classList.toggle("is-valid", valid);
  return valid;
}

function validasiKontak(event) {
  event.preventDefault();
  const nama = $("#nama"), email = $("#email"), pesan = $("#pesan");
  const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const hasil = [
    validasiField(nama, nama.value.trim().length >= 3),
    validasiField(email, polaEmail.test(email.value.trim())),
    validasiField(pesan, pesan.value.trim().length >= 10),
  ];
  const notif = $("#notifKontak");

  if (hasil.every(Boolean)) {
    const nm = document.createElement("div");
    nm.className = "alert alert-success";
    nm.setAttribute("role", "alert");
    nm.textContent = `Terima kasih, ${nama.value.trim()}. Pesan Anda sudah tercatat.`;
    notif.replaceChildren(nm);
    event.target.reset();
    [nama, email, pesan].forEach((el) => el.classList.remove("is-valid"));
  } else {
    notif.innerHTML = '<div class="alert alert-danger" role="alert">Periksa kembali kolom yang bertanda merah.</div>';
  }
}

/* ===== Inisialisasi ===== */
document.addEventListener("DOMContentLoaded", () => {
  let tema = "light";
  try { tema = localStorage.getItem("tema") || (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"); } catch (e) { /* abaikan */ }
  setTema(tema);

  $("#themeToggle").addEventListener("click", toggleTema);
  $("#cariProyek").addEventListener("input", filterProyek);
  $("#filterKategori").addEventListener("change", filterProyek);
  $("#formEstimasi").addEventListener("submit", hitungEstimasi);
  $("#formEstimasi").addEventListener("reset", resetEstimasi);
  $("#formKontak").addEventListener("submit", validasiKontak);
  filterProyek();
});