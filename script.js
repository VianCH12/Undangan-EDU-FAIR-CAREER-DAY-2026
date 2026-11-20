"use strict";

const sampleGuests = [
  { id: "1", nama_tamu: "Dr. Rina Kusumawati, M.Pd.", instansi: "Universitas Indonesia", kategori: "Universitas", no_whatsapp: "6281234567890" },
  { id: "2", nama_tamu: "Budi Santoso, S.Kom.", instansi: "PT Telkom Indonesia (Persero) Tbk", kategori: "Perusahaan", no_whatsapp: "6281398765432" },
  { id: "3", nama_tamu: "Siti Rahmawati", instansi: "Institut Teknologi Bandung", kategori: "Universitas", no_whatsapp: "6285711223344" },
  { id: "4", nama_tamu: "Ahmad Fauzi", instansi: "Alumni Angkatan 2022 - Software Engineer", kategori: "Alumni", no_whatsapp: "6287855667788" },
  { id: "5", nama_tamu: "Dian Pratama, S.T.", instansi: "PT Astra International Tbk", kategori: "Perusahaan", no_whatsapp: "6282199001122" },
  { id: "6", nama_tamu: "Prof. Hendra Wijaya", instansi: "Universitas Bina Nusantara (BINUS)", kategori: "Universitas", no_whatsapp: "6281144556677" },
  { id: "7", nama_tamu: "Nadia Putri", instansi: "Alumni Angkatan 2023 - UI/UX Designer", kategori: "Alumni", no_whatsapp: "6289633445566" },
  { id: "8", nama_tamu: "Yudha", instansi: "Alumni Angkatan 2027 - Software", kategori: "Alumni", no_whatsapp: "6282264647120" },
  { id: "9", nama_tamu: "caca", instansi: "Alumni Angkatan 2027 - Software", kategori: "Alumni", no_whatsapp: "628982680904" },
  { id: "10", nama_tamu: "Bu dinda", instansi: "Guru SMKN 6 Tangerang Selatan", kategori: "Guru", no_whatsapp: "6282260060509" }
];

const RSVP_WHATSAPP_NUMBER = "6285711366593";
const invitationUrl = new URL("index.html", window.location.href);

function getGuestFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return {
    id: params.get("id") || "",
    name: params.get("nama") || "",
    institution: params.get("instansi") || "",
    category: params.get("kategori") || ""
  };
}

function personalizeInvitation() {
  const guest = getGuestFromUrl();
  const name = document.getElementById("guest-name");
  const details = document.getElementById("guest-details");
  if (!name || !details) return;

  if (guest.name) name.textContent = guest.name;
  if (guest.institution || guest.category) {
    details.textContent = [guest.category, guest.institution].filter(Boolean).join(" · ");
  }
  if (guest.name) {
    document.title = `Undangan untuk ${guest.name} — Edu Fair & Career Day 2026`;
  }

  const form = document.getElementById("rsvp-form");
  if (!form) return;
  const key = `edufair-rsvp-${guest.id || guest.name || "guest"}`;
  const feedback = document.getElementById("rsvp-feedback");
  let saved = null;
  try {
    saved = localStorage.getItem(key);
  } catch (error) {
    if (feedback) feedback.textContent = "Penyimpanan lokal tidak tersedia; RSVP tetap dapat dikirim melalui WhatsApp.";
  }
  if (saved && feedback) feedback.textContent = "Terima kasih, konfirmasi Anda sebelumnya sudah tersimpan di perangkat ini.";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const response = {
      id: guest.id,
      nama_tamu: guest.name || "Tamu Undangan",
      instansi: guest.institution,
      attendance: formData.get("attendance"),
      guestCount: formData.get("guest-count"),
      note: formData.get("guest-note"),
      submittedAt: new Date().toISOString()
    };
    let responseSaved = false;
    try {
      localStorage.setItem(key, JSON.stringify(response));
      responseSaved = true;
    } catch (error) {
      responseSaved = false;
    }

    const message = [
      "Konfirmasi RSVP — Edu Fair & Career Day 2026",
      `ID undangan: ${response.id || "-"}`,
      `Nama: ${response.nama_tamu}`,
      `Instansi: ${response.instansi || "-"}`,
      `Kategori: ${guest.category || "-"}`,
      `Kehadiran: ${response.attendance}`,
      response.attendance === "Hadir" ? `Jumlah perwakilan: ${response.guestCount}` : "",
      response.note ? `Catatan: ${response.note}` : ""
    ].filter(Boolean).join("\n");
    const whatsappUrl = new URL(`https://wa.me/${RSVP_WHATSAPP_NUMBER}`);
    whatsappUrl.searchParams.set("text", message);

    let whatsappWindow = null;
    try {
      whatsappWindow = window.open(whatsappUrl.href, "_blank");
      if (whatsappWindow) whatsappWindow.opener = null;
    } catch (error) {
      whatsappWindow = null;
    }

    if (!feedback) return;
    feedback.replaceChildren();
    const status = document.createElement("span");
    if (whatsappWindow) {
      status.textContent = responseSaved
        ? "WhatsApp terbuka dengan pesan RSVP siap dikirim. Tekan Kirim di WhatsApp."
        : "Data tidak tersimpan di perangkat ini, tetapi pesan RSVP siap dikirim melalui WhatsApp.";
    } else {
      status.textContent = responseSaved
        ? "Pop-up terblokir. Buka tautan berikut untuk mengirim RSVP melalui WhatsApp:"
        : "Data tidak tersimpan di perangkat ini. Buka tautan berikut untuk mengirim RSVP melalui WhatsApp:";
    }
    const link = document.createElement("a");
    link.href = whatsappUrl.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = " Buka WhatsApp";
    feedback.append(status, link);
  });
}

function initializeInvitationNavigation() {
  const nav = document.querySelector(".main-nav");
  if (!nav) return;

  const links = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = links
    .map((link) => document.getElementById(link.hash.slice(1)))
    .filter((section) => section !== null);

  function setActiveSection(id) {
    links.forEach((link) => {
      const active = link.hash === `#${id}`;
      link.classList.toggle("is-active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  links.forEach((link) => {
    link.addEventListener("click", () => setActiveSection(link.hash.slice(1)));
  });
  if (window.location.hash) setActiveSection(window.location.hash.slice(1));
  if (!("IntersectionObserver" in window)) return;

  const header = document.querySelector(".site-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting);
    if (!visible.length) return;
    visible.sort((a, b) =>
      Math.abs(a.boundingClientRect.top - headerHeight) -
      Math.abs(b.boundingClientRect.top - headerHeight)
    );
    setActiveSection(visible[0].target.id);
  }, {
    rootMargin: `-${headerHeight + 8}px 0px -65% 0px`,
    threshold: 0
  });

  sections.forEach((section) => observer.observe(section));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const input = text.replace(/^\uFEFF/, "");

  for (let i = 0; i < input.length; i += 1) {
    const character = input[i];
    if (quoted) {
      if (character === '"' && input[i + 1] === '"') {
        value += '"';
        i += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        value += character;
      }
    } else if (character === '"' && value.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(value.trim());
      value = "";
    } else if (character === "\n" || character === "\r") {
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      value = "";
      if (character === "\r" && input[i + 1] === "\n") i += 1;
    } else {
      value += character;
    }
  }

  row.push(value.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  if (quoted) throw new Error("CSV memiliki tanda kutip yang belum ditutup.");
  if (rows.length < 2) throw new Error("CSV belum berisi baris data tamu.");

  const headers = rows[0].map((header) => header.trim().toLowerCase());
  const required = ["id", "nama_tamu", "instansi", "kategori", "no_whatsapp"];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) throw new Error(`Kolom wajib tidak ditemukan: ${missing.join(", ")}.`);
  const positions = Object.fromEntries(required.map((header) => [header, headers.indexOf(header)]));

  return rows.slice(1).map((cells, index) => {
    const guest = {};
    required.forEach((header) => {
      guest[header] = cells[positions[header]] || "";
    });
    if (!guest.id || !guest.nama_tamu || !guest.no_whatsapp) {
      throw new Error(`Data pada baris ${index + 2} harus memiliki id, nama_tamu, dan no_whatsapp.`);
    }
    if (!normalizePhone(guest.no_whatsapp)) {
      throw new Error(`Nomor WhatsApp pada baris ${index + 2} tidak valid.`);
    }
    return guest;
  });
}

function normalizePhone(phone) {
  let digits = String(phone).replace(/\D/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  else if (digits.startsWith("8")) digits = `62${digits}`;
  return digits;
}

function createInvitationLink(guest) {
  const configuredBase = document.getElementById("public-base-url");
  const url = configuredBase && configuredBase.value.trim()
    ? new URL(configuredBase.value.trim())
    : new URL(invitationUrl);
  url.search = new URLSearchParams({
    id: guest.id,
    nama: guest.nama_tamu,
    instansi: guest.instansi,
    kategori: guest.kategori
  }).toString();
  return url.href;
}

function createWhatsAppLink(guest) {
  const link = createInvitationLink(guest);
  const message = [
    `Yth. ${guest.nama_tamu},`,
    "",
    "Dengan hormat, kami mengundang Anda untuk hadir di Edu Fair & Career Day 2026.",
    `Instansi: ${guest.instansi}`,
    `Kategori undangan: ${guest.kategori}`,
    `Tanggal: Rabu, 25 Desember 2026 | 08.00–15.30 WIB`,
    `Lokasi: SMKN 6 Tangerang Selatan`,
    "",
    `Undangan personal dan konfirmasi kehadiran: ${link}`,
    "",
    "Sampai jumpa!"
  ].join("\n");
  return `https://wa.me/${normalizePhone(guest.no_whatsapp)}?text=${encodeURIComponent(message)}`;
}

function initializeAdmin() {
  const fileInput = document.getElementById("csv-file");
  const tableBody = document.getElementById("guest-rows");
  if (!fileInput || !tableBody) return;

  let guests = sampleGuests.slice();
  const search = document.getElementById("guest-search");
  const status = document.getElementById("admin-status");
  const publicBaseInput = document.getElementById("public-base-url");
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    publicBaseInput.value = invitationUrl.href;
  }

  function renderGuests() {
    const query = (search.value || "").trim().toLowerCase();
    const filtered = guests.filter((guest) =>
      [guest.id, guest.nama_tamu, guest.instansi, guest.kategori, guest.no_whatsapp]
        .some((value) => value.toLowerCase().includes(query))
    );
    tableBody.replaceChildren();

    if (!filtered.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.className = "empty-row";
      cell.textContent = guests.length ? "Tidak ada tamu yang cocok dengan pencarian." : "Belum ada data tamu.";
      row.append(cell);
      tableBody.append(row);
      return;
    }

    filtered.forEach((guest) => {
      const row = document.createElement("tr");
      [guest.id, guest.nama_tamu, guest.instansi].forEach((value) => {
        const cell = document.createElement("td");
        cell.textContent = value;
        row.append(cell);
      });
      const categoryCell = document.createElement("td");
      const category = document.createElement("span");
      category.className = "category-tag";
      category.textContent = guest.kategori;
      categoryCell.append(category);
      row.append(categoryCell);

      const actionCell = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "guest-actions";
      const send = document.createElement("a");
      send.href = createWhatsAppLink(guest);
      send.target = "_blank";
      send.rel = "noreferrer";
      send.textContent = "Kirim via WhatsApp ↗";
      send.setAttribute("aria-label", `Kirim undangan WhatsApp untuk ${guest.nama_tamu}`);
      const copy = document.createElement("button");
      copy.type = "button";
      copy.className = "copy-link";
      copy.textContent = "Salin tautan";
      copy.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(createInvitationLink(guest));
          status.textContent = `Tautan personal untuk ${guest.nama_tamu} berhasil disalin.`;
        } catch (error) {
          status.textContent = "Tautan tidak dapat disalin. Buka tombol WhatsApp atau salin tautan dari alamat undangan.";
        }
      });
      actions.append(send, copy);
      actionCell.append(actions);
      row.append(actionCell);
      tableBody.append(row);
    });
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        guests = parseCsv(String(reader.result || ""));
        status.textContent = `${guests.length} data tamu berhasil dimuat dari ${file.name}.`;
        renderGuests();
      } catch (error) {
        status.textContent = error.message;
      }
    });
    reader.addEventListener("error", () => {
      status.textContent = "File CSV gagal dibaca. Silakan coba pilih file kembali.";
    });
    reader.readAsText(file, "UTF-8");
  });

  document.getElementById("load-sample").addEventListener("click", () => {
    guests = sampleGuests.slice();
    fileInput.value = "";
    status.textContent = "Data contoh siap digunakan. Unggah data-tamu.csv untuk memuat data dari berkas.";
    renderGuests();
  });
  search.addEventListener("input", renderGuests);
  publicBaseInput.addEventListener("change", () => {
    const candidate = publicBaseInput.value.trim();
    if (candidate) {
      try {
        const url = new URL(candidate);
        if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("URL harus menggunakan HTTP atau HTTPS.");
        status.textContent = "URL publik diperbarui. Tautan personal dan pesan WhatsApp telah disegarkan.";
      } catch (error) {
        status.textContent = error.message || "Masukkan URL undangan publik yang valid.";
        return;
      }
    } else {
      status.textContent = "URL publik belum diisi. Tautan saat ini hanya berfungsi untuk pratinjau lokal.";
    }
    renderGuests();
  });
  status.textContent = window.location.protocol === "file:"
    ? "Data contoh ditampilkan. Tautan lokal hanya untuk pratinjau; isi URL undangan publik setelah situs di-hosting."
    : "Data contoh ditampilkan. Unggah data-tamu.csv untuk membaca daftar tamu Anda.";
  renderGuests();
}

if (document.body.dataset.page === "invitation") {
  personalizeInvitation();
  initializeInvitationNavigation();
}
if (document.body.dataset.page === "admin") initializeAdmin();
