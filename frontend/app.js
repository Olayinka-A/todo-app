// ToDo App - plain React (no JSX, no build step).
const { useState, useEffect, useRef, createElement: h } = React;

const COLORS = ["#FFE066", "#FFAD99", "#FF8FAB", "#C8B6FF", "#BDE0FE", "#A7F3D0", "#FBCFE8", "#FDE68A"];
const PRIO_COLOR = { high: "#ef4444", medium: "#f59e0b", low: "#22c55e" };

const STRINGS = {
  en: { tasks: "Tasks", calendar: "Calendar", settings: "Settings", search: "Search todos...", add: "Add",
    all: "All", active: "Active", done: "Done", progress: "done", empty: "Nothing here yet — add your first todo above! 🎉",
    notesPane: "📝 Notes pane", selectTodo: "Select a todo to view its notes here.", viewingFor: "Viewing notes for:",
    addNotes: "Add notes", editNotes: "Edit notes", saveNotes: "Save notes", cancel: "Cancel",
    noNotes: "No notes yet — click “Add notes” to write some.", dueDate: "Due date", priority: "Priority",
    high: "High", medium: "Medium", low: "Low", sort: "Sort", manual: "Manual", byDue: "Due date", byPrio: "Priority", newest: "Newest",
    recur: "Repeat", remind: "Reminder", noneR: "None", daily: "Daily", weekly: "Weekly", monthly: "Monthly",
    theme: "Theme", colourful: "Colourful", light: "Light", dark: "Dark", language: "Language",
    sound: "Notification sound", off: "Off", chime: "Chime", pop: "Pop", ding: "Ding",
    notif: "Due-today browser notification", profile: "Username", yourName: "Your name", avatar: "Avatar",
    photo: "Profile photo", choosePhoto: "Choose photo", removePhoto: "Remove photo",
    showCompleted: "Show completed in Calendar", saveSettings: "Save settings", export: "Export data (JSON)",
    clearDone: "Clear completed", danger: "Danger zone", today: "Today", noDue: "No due date",
    overdue: "overdue", dueToday: "due today", tasksFor: "Tasks for", pickDay: "Pick a day to see its tasks.",
    enableSound: "Sounds play when you add / complete a task.", addUsername: "Add username", wipe: "Erase everything" },
  es: { tasks: "Tareas", calendar: "Calendario", settings: "Ajustes", search: "Buscar tareas...", add: "Añadir",
    all: "Todas", active: "Activas", done: "Hechas", progress: "hechas", empty: "Nada aquí — ¡añade tu primera tarea! 🎉",
    notesPane: "📝 Notas", selectTodo: "Selecciona una tarea para ver sus notas.", viewingFor: "Notas de:",
    addNotes: "Añadir notas", editNotes: "Editar notas", saveNotes: "Guardar notas", cancel: "Cancelar",
    noNotes: "Sin notas — pulsa «Añadir notas».", dueDate: "Vence", priority: "Prioridad",
    high: "Alta", medium: "Media", low: "Baja", sort: "Orden", manual: "Manual", byDue: "Vencimiento", byPrio: "Prioridad", newest: "Recientes",
    recur: "Repetir", remind: "Recordatorio", noneR: "Ninguna", daily: "Diaria", weekly: "Semanal", monthly: "Mensual",
    theme: "Tema", colourful: "Colorido", light: "Claro", dark: "Oscuro", language: "Idioma",
    sound: "Sonido de notificación", off: "Apagado", chime: "Campana", pop: "Pop", ding: "Ding",
    notif: "Notificación del navegador (vence hoy)", profile: "Nombre de usuario", yourName: "Tu nombre", avatar: "Avatar",
    photo: "Foto de perfil", choosePhoto: "Elegir foto", removePhoto: "Quitar foto",
    showCompleted: "Mostrar hechas en Calendario", saveSettings: "Guardar ajustes", export: "Exportar datos (JSON)",
    clearDone: "Borrar hechas", danger: "Zona peligrosa", today: "Hoy", noDue: "Sin fecha",
    overdue: "vencida", dueToday: "vence hoy", tasksFor: "Tareas para", pickDay: "Elige un día para ver sus tareas.",
    enableSound: "Los sonidos suenan al añadir / completar.", addUsername: "Añade un nombre", wipe: "Borrar todo" },
  fr: { tasks: "Tâches", calendar: "Calendrier", settings: "Réglages", search: "Rechercher...", add: "Ajouter",
    all: "Toutes", active: "Actives", done: "Faites", progress: "faites", empty: "Rien ici — ajoutez votre première tâche ! 🎉",
    notesPane: "📝 Notes", selectTodo: "Sélectionnez une tâche pour voir ses notes.", viewingFor: "Notes de :",
    addNotes: "Ajouter des notes", editNotes: "Modifier", saveNotes: "Enregistrer", cancel: "Annuler",
    noNotes: "Aucune note — cliquez « Ajouter des notes ».", dueDate: "Échéance", priority: "Priorité",
    high: "Haute", medium: "Moyenne", low: "Basse", sort: "Tri", manual: "Manuel", byDue: "Échéance", byPrio: "Priorité", newest: "Récent",
    recur: "Récurrence", remind: "Rappel", noneR: "Aucune", daily: "Quotidienne", weekly: "Hebdo", monthly: "Mensuelle",
    theme: "Thème", colourful: "Coloré", light: "Clair", dark: "Sombre", language: "Langue",
    sound: "Son de notification", off: "Coupé", chime: "Carillon", pop: "Pop", ding: "Ding",
    notif: "Notification navigateur (échéance jour)", profile: "Nom d'utilisateur", yourName: "Votre nom", avatar: "Avatar",
    photo: "Photo de profil", choosePhoto: "Choisir une photo", removePhoto: "Retirer la photo",
    showCompleted: "Afficher faites dans Calendrier", saveSettings: "Enregistrer", export: "Exporter (JSON)",
    clearDone: "Effacer faites", danger: "Zone dangereuse", today: "Aujourd'hui", noDue: "Sans date",
    overdue: "en retard", dueToday: "pour aujourd'hui", tasksFor: "Tâches pour", pickDay: "Choisissez un jour.",
    enableSound: "Sons joués à l'ajout / complétion.", addUsername: "Ajoutez un nom", wipe: "Tout effacer" },
  de: { tasks: "Aufgaben", calendar: "Kalender", settings: "Einstellungen", search: "Aufgaben suchen...", add: "Hinzufügen",
    all: "Alle", active: "Offen", done: "Fertig", progress: "fertig", empty: "Noch nichts — füge deine erste Aufgabe hinzu! 🎉",
    notesPane: "📝 Notizen", selectTodo: "Wähle eine Aufgabe für Notizen.", viewingFor: "Notizen für:",
    addNotes: "Notizen hinzufügen", editNotes: "Notizen bearbeiten", saveNotes: "Speichern", cancel: "Abbrechen",
    noNotes: "Keine Notizen — klicke „Hinzufügen“.", dueDate: "Fällig", priority: "Priorität",
    high: "Hoch", medium: "Mittel", low: "Niedrig", sort: "Sortierung", manual: "Manuell", byDue: "Fälligkeit", byPrio: "Priorität", newest: "Neueste",
    recur: "Wiederholung", remind: "Erinnerung", noneR: "Keine", daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich",
    theme: "Design", colourful: "Bunt", light: "Hell", dark: "Dunkel", language: "Sprache",
    sound: "Benachrichtigungston", off: "Aus", chime: "Glocke", pop: "Pop", ding: "Ding",
    notif: "Browser-Benachrichtigung (heute fällig)", profile: "Benutzername", yourName: "Dein Name", avatar: "Avatar",
    photo: "Profilfoto", choosePhoto: "Foto wählen", removePhoto: "Foto entfernen",
    showCompleted: "Erledigte im Kalender zeigen", saveSettings: "Speichern", export: "Daten exportieren (JSON)",
    clearDone: "Erledigte löschen", danger: "Gefahrenzone", today: "Heute", noDue: "Kein Datum",
    overdue: "überfällig", dueToday: "heute fällig", tasksFor: "Aufgaben für", pickDay: "Wähle einen Tag.",
    enableSound: "Töne bei Hinzufügen / Abschluss.", addUsername: "Namen hinzufügen", wipe: "Alles löschen" },
  pt: { tasks: "Tarefas", calendar: "Calendário", settings: "Ajustes", search: "Buscar tarefas...", add: "Adicionar",
    all: "Todas", active: "Ativas", done: "Feitas", progress: "feitas", empty: "Nada aqui — adicione sua primeira tarefa! 🎉",
    notesPane: "📝 Notas", selectTodo: "Selecione uma tarefa para ver as notas.", viewingFor: "Notas de:",
    addNotes: "Adicionar notas", editNotes: "Editar notas", saveNotes: "Salvar", cancel: "Cancelar",
    noNotes: "Sem notas — clique em «Adicionar notas».", dueDate: "Vence", priority: "Prioridade",
    high: "Alta", medium: "Média", low: "Baixa", sort: "Ordem", manual: "Manual", byDue: "Vencimento", byPrio: "Prioridade", newest: "Recentes",
    recur: "Repetição", remind: "Lembrete", noneR: "Nenhuma", daily: "Diária", weekly: "Semanal", monthly: "Mensal",
    theme: "Tema", colourful: "Colorido", light: "Claro", dark: "Escuro", language: "Idioma",
    sound: "Som de notificação", off: "Desligado", chime: "Campainha", pop: "Pop", ding: "Ding",
    notif: "Notificação do navegador (vence hoje)", profile: "Nome de usuário", yourName: "Seu nome", avatar: "Avatar",
    photo: "Foto de perfil", choosePhoto: "Escolher foto", removePhoto: "Remover foto",
    showCompleted: "Mostrar feitas no Calendário", saveSettings: "Salvar ajustes", export: "Exportar dados (JSON)",
    clearDone: "Apagar feitas", danger: "Zona perigosa", today: "Hoje", noDue: "Sem data",
    overdue: "atrasada", dueToday: "vence hoje", tasksFor: "Tarefas para", pickDay: "Escolha um dia.",
    enableSound: "Sons ao adicionar / concluir.", addUsername: "Adicione um nome", wipe: "Apagar tudo" },
  it: { tasks: "Attività", calendar: "Calendario", settings: "Impostazioni", search: "Cerca attività...", add: "Aggiungi",
    all: "Tutte", active: "Attive", done: "Fatte", progress: "fatte", empty: "Niente qui — aggiungi la prima attività! 🎉",
    notesPane: "📝 Note", selectTodo: "Seleziona un'attività per le note.", viewingFor: "Note di:",
    addNotes: "Aggiungi note", editNotes: "Modifica note", saveNotes: "Salva", cancel: "Annulla",
    noNotes: "Nessuna nota — fai clic su «Aggiungi note».", dueDate: "Scadenza", priority: "Priorità",
    high: "Alta", medium: "Media", low: "Bassa", sort: "Ordine", manual: "Manuale", byDue: "Scadenza", byPrio: "Priorità", newest: "Recenti",
    recur: "Ripetizione", remind: "Promemoria", noneR: "Nessuna", daily: "Giornaliera", weekly: "Settimanale", monthly: "Mensile",
    theme: "Tema", colourful: "Colorato", light: "Chiaro", dark: "Scuro", language: "Lingua",
    sound: "Suono di notifica", off: "Spento", chime: "Campana", pop: "Pop", ding: "Ding",
    notif: "Notifica browser (scade oggi)", profile: "Nome utente", yourName: "Il tuo nome", avatar: "Avatar",
    photo: "Foto profilo", choosePhoto: "Scegli foto", removePhoto: "Rimuovi foto",
    showCompleted: "Mostra fatte nel Calendario", saveSettings: "Salva", export: "Esporta dati (JSON)",
    clearDone: "Elimina fatte", danger: "Zona pericolosa", today: "Oggi", noDue: "Senza data",
    overdue: "in ritardo", dueToday: "scade oggi", tasksFor: "Attività per", pickDay: "Scegli un giorno.",
    enableSound: "Suoni all'aggiunta / completamento.", addUsername: "Aggiungi nome", wipe: "Cancella tutto" },
  nl: { tasks: "Taken", calendar: "Kalender", settings: "Instellingen", search: "Taken zoeken...", add: "Toevoegen",
    all: "Alle", active: "Open", done: "Klaar", progress: "klaar", empty: "Nog niets — voeg je eerste taak toe! 🎉",
    notesPane: "📝 Notities", selectTodo: "Kies een taak voor notities.", viewingFor: "Notities voor:",
    addNotes: "Notities toevoegen", editNotes: "Notities bewerken", saveNotes: "Opslaan", cancel: "Annuleren",
    noNotes: "Geen notities — klik «Notities toevoegen».", dueDate: "Vervaldatum", priority: "Prioriteit",
    high: "Hoog", medium: "Middel", low: "Laag", sort: "Sorteren", manual: "Handmatig", byDue: "Vervaldatum", byPrio: "Prioriteit", newest: "Nieuwste",
    recur: "Herhaling", remind: "Herinnering", noneR: "Geen", daily: "Dagelijks", weekly: "Wekelijks", monthly: "Maandelijks",
    theme: "Thema", colourful: "Kleurrijk", light: "Licht", dark: "Donker", language: "Taal",
    sound: "Meldingsgeluid", off: "Uit", chime: "Klok", pop: "Pop", ding: "Ding",
    notif: "Browsermelding (vandaag vervallen)", profile: "Gebruikersnaam", yourName: "Je naam", avatar: "Avatar",
    photo: "Profielfoto", choosePhoto: "Kies foto", removePhoto: "Verwijder foto",
    showCompleted: "Voltooide tonen in Kalender", saveSettings: "Opslaan", export: "Gegevens exporteren (JSON)",
    clearDone: "Voltooide wissen", danger: "Gevarenzone", today: "Vandaag", noDue: "Geen datum",
    overdue: "te laat", dueToday: "vandaag vervallen", tasksFor: "Taken voor", pickDay: "Kies een dag.",
    enableSound: "Geluiden bij toevoegen / voltooien.", addUsername: "Voeg naam toe", wipe: "Alles wissen" },
  sv: { tasks: "Uppgifter", calendar: "Kalender", settings: "Inställningar", search: "Sök uppgifter...", add: "Lägg till",
    all: "Alla", active: "Öppna", done: "Klara", progress: "klara", empty: "Inget här — lägg till din första uppgift! 🎉",
    notesPane: "📝 Anteckningar", selectTodo: "Välj en uppgift för anteckningar.", viewingFor: "Anteckningar för:",
    addNotes: "Lägg till anteckningar", editNotes: "Redigera anteckningar", saveNotes: "Spara", cancel: "Avbryt",
    noNotes: "Inga anteckningar — klicka «Lägg till anteckningar».", dueDate: "Förfaller", priority: "Prioritet",
    high: "Hög", medium: "Medel", low: "Låg", sort: "Sortering", manual: "Manuell", byDue: "Förfallodatum", byPrio: "Prioritet", newest: "Nyaste",
    recur: "Upprepning", remind: "Påminnelse", noneR: "Ingen", daily: "Dagligen", weekly: "Varje vecka", monthly: "Varje månad",
    theme: "Tema", colourful: "Färgglad", light: "Ljus", dark: "Mörk", language: "Språk",
    sound: "Aviseringsljud", off: "Av", chime: "Klocka", pop: "Pop", ding: "Ding",
    notif: "Webbläsaravisering (förfaller idag)", profile: "Användarnamn", yourName: "Ditt namn", avatar: "Avatar",
    photo: "Profilbild", choosePhoto: "Välj bild", removePhoto: "Ta bort bild",
    showCompleted: "Visa klara i Kalendern", saveSettings: "Spara", export: "Exportera data (JSON)",
    clearDone: "Rensa klara", danger: "Riskzon", today: "Idag", noDue: "Inget datum",
    overdue: "försenad", dueToday: "förfaller idag", tasksFor: "Uppgifter för", pickDay: "Välj en dag.",
    enableSound: "Ljud vid tillägg / slutförande.", addUsername: "Lägg till namn", wipe: "Rensa allt" },
  tr: { tasks: "Görevler", calendar: "Takvim", settings: "Ayarlar", search: "Görev ara...", add: "Ekle",
    all: "Tümü", active: "Açık", done: "Biten", progress: "biten", empty: "Henüz bir şey yok — ilk görevini ekle! 🎉",
    notesPane: "📝 Notlar", selectTodo: "Notları için bir görev seç.", viewingFor: "Notları:",
    addNotes: "Not ekle", editNotes: "Notları düzenle", saveNotes: "Kaydet", cancel: "İptal",
    noNotes: "Not yok — «Not ekle»ye tıkla.", dueDate: "Bitiş", priority: "Öncelik",
    high: "Yüksek", medium: "Orta", low: "Düşük", sort: "Sıralama", manual: "Manuel", byDue: "Bitiş tarihi", byPrio: "Öncelik", newest: "En yeni",
    recur: "Tekrar", remind: "Hatırlatıcı", noneR: "Yok", daily: "Günlük", weekly: "Haftalık", monthly: "Aylık",
    theme: "Tema", colourful: "Renkli", light: "Açık", dark: "Koyu", language: "Dil",
    sound: "Bildirim sesi", off: "Kapalı", chime: "Çan", pop: "Pop", ding: "Ding",
    notif: "Tarayıcı bildirimi (bugün biten)", profile: "Kullanıcı adı", yourName: "Adın", avatar: "Avatar",
    photo: "Profil fotoğrafı", choosePhoto: "Fotoğraf seç", removePhoto: "Fotoğrafı kaldır",
    showCompleted: "Bitmişleri Takvimde göster", saveSettings: "Kaydet", export: "Verileri dışa aktar (JSON)",
    clearDone: "Bitmişleri temizle", danger: "Tehlikeli bölge", today: "Bugün", noDue: "Tarih yok",
    overdue: "gecikmiş", dueToday: "bugün bitiyor", tasksFor: "Görevleri:", pickDay: "Bir gün seç.",
    enableSound: "Ekleme / bitirme sesleri.", addUsername: "Kullanıcı adı ekle", wipe: "Her şeyi sil" },
  id: { tasks: "Tugas", calendar: "Kalender", settings: "Pengaturan", search: "Cari tugas...", add: "Tambah",
    all: "Semua", active: "Aktif", done: "Selesai", progress: "selesai", empty: "Belum ada — tambahkan tugas pertamamu! 🎉",
    notesPane: "📝 Catatan", selectTodo: "Pilih tugas untuk melihat catatan.", viewingFor: "Catatan untuk:",
    addNotes: "Tambah catatan", editNotes: "Ubah catatan", saveNotes: "Simpan", cancel: "Batal",
    noNotes: "Belum ada catatan — klik «Tambah catatan».", dueDate: "Tenggat", priority: "Prioritas",
    high: "Tinggi", medium: "Sedang", low: "Rendah", sort: "Urutan", manual: "Manual", byDue: "Tenggat", byPrio: "Prioritas", newest: "Terbaru",
    recur: "Pengulangan", remind: "Pengingat", noneR: "Tidak ada", daily: "Harian", weekly: "Mingguan", monthly: "Bulanan",
    theme: "Tema", colourful: "Warna-warni", light: "Terang", dark: "Gelap", language: "Bahasa",
    sound: "Suara notifikasi", off: "Mati", chime: "Lonceng", pop: "Pop", ding: "Ding",
    notif: "Notifikasi browser (jatuh tempo hari ini)", profile: "Nama pengguna", yourName: "Namamu", avatar: "Avatar",
    photo: "Foto profil", choosePhoto: "Pilih foto", removePhoto: "Hapus foto",
    showCompleted: "Tampilkan selesai di Kalender", saveSettings: "Simpan", export: "Ekspor data (JSON)",
    clearDone: "Hapus yang selesai", danger: "Zona berbahaya", today: "Hari ini", noDue: "Tanpa tanggal",
    overdue: "terlambat", dueToday: "jatuh tempo hari ini", tasksFor: "Tugas untuk", pickDay: "Pilih hari.",
    enableSound: "Bunyi saat menambah / menyelesaikan.", addUsername: "Tambah nama pengguna", wipe: "Hapus semua" },
};

const LANGS = [["en", "English"], ["es", "Español"], ["fr", "Français"], ["de", "Deutsch"], ["pt", "Português"], ["it", "Italiano"], ["nl", "Nederlands"], ["sv", "Svenska"], ["tr", "Türkçe"], ["id", "Bahasa Indonesia"]];

// Sophisticated gear icon (inline SVG, no emoji)
function GearIcon(size) {
  const s = size || 18;
  return h("svg", { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", className: "gear-icon" },
    h("circle", { cx: 12, cy: 12, r: 3 }),
    h("path", { d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" }));
}

// Profile picture (user's own photo) or initial-letter fallback
function UserPic(pic, name) {
  if (pic) return h("img", { className: "avatar-img", src: pic, alt: (name || "profile") });
  const initial = (((name || "").trim()[0]) || "T").toUpperCase();
  return h("span", { className: "avatar-initial" }, initial);
}

function todayStr() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

// 10 notification sounds (WebAudio, no files needed)
const SOUNDS = {
  chime: [660, 880], pop: [500, 250], ding: [880, 660, 880],
  bell: [523, 659, 784, 1047], rise: [392, 494, 587, 784], fall: [784, 587, 494, 392],
  triad: [523, 659, 784], beep: [880], sparkle: [1047, 1319, 1568, 2093], echo: [700, 560, 700],
};
const SOUND_NAMES = ["chime", "pop", "ding", "bell", "rise", "fall", "triad", "beep", "sparkle", "echo"];
const SOUND_LABEL = (id) => id[0].toUpperCase() + id.slice(1);
function playSound(kind) {
  const notes = SOUNDS[kind];
  if (!notes) return;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine"; o.frequency.value = f;
      o.connect(g); g.connect(ctx.destination);
      const t = ctx.currentTime + i * 0.12;
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.4, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      o.start(t); o.stop(t + 0.2);
    });
  } catch (e) { /* audio not available */ }
}

function dueInfo(due) {
  if (!due) return { label: "", cls: "" };
  const t = todayStr();
  if (due < t) return { label: "⚠ " + due, cls: "due-overdue" };
  if (due === t) return { label: "📅 " + due, cls: "due-today" };
  return { label: "📅 " + due, cls: "due-future" };
}

function App() {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [newDue, setNewDue] = useState("");
  const [newPrio, setNewPrio] = useState("medium");
  const [newRecur, setNewRecur] = useState("none");
  const [newRemind, setNewRemind] = useState("");
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [view, setView] = useState("tasks"); // tasks | calendar | settings
  const [selectedId, setSelectedId] = useState(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [editDue, setEditDue] = useState("");
  const [editPrio, setEditPrio] = useState("medium");
  const [editRecur, setEditRecur] = useState("none");
  const [editRemind, setEditRemind] = useState("");
  const [status, setStatus] = useState("");
  const [dragId, setDragId] = useState(null);
  const [dropId, setDropId] = useState(null);
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const n = new Date(); return { y: n.getFullYear(), m: n.getMonth() }; });
  const [calDay, setCalDay] = useState(todayStr());
  const [settings, setSettings] = useState({ theme: "colourful", language: "en", notification_sound: "chime", notifications_enabled: "1", profile_name: "", profile_pic: "", sort: "manual", show_completed: "1" });
  const [settingsDraft, setSettingsDraft] = useState(null);
  const selectedIdRef = useRef(null);
  selectedIdRef.current = selectedId;

  const lang = (settings.language in STRINGS) ? settings.language : "en";
  const T = STRINGS[lang];

  const showStatus = (msg) => { setStatus(msg); setTimeout(() => setStatus(""), 2500); };

  const applyTheme = (theme) => { document.body.dataset.theme = theme || "colourful"; };
  useEffect(() => { applyTheme(settings.theme); }, [settings.theme]);

  const load = async () => {
    const res = await fetch("/api/todos");
    const data = await res.json();
    setTodos(data);
    const cur = selectedIdRef.current;
    if (data.length && !data.find((t) => t.id === cur)) {
      setSelectedId(data[0].id);
      setNotesDraft(data[0].notes || "");
    }
  };
  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      setSettings((p) => ({ ...p, ...data }));
    } catch (e) { /* offline: keep defaults */ }
  };

  useEffect(() => { load(); loadSettings(); }, []);
  useEffect(() => {
    const t = todos.find((x) => x.id === selectedId);
    if (t) setNotesDraft(t.notes || "");
    setIsEditingNotes(false);
  }, [selectedId]);

  // due-today browser notification (once per load)
  useEffect(() => {
    if (settings.notifications_enabled !== "1" || !todos.length) return;
    const t = todayStr();
    const dueToday = todos.filter((x) => x.due_date === t && !x.completed);
    if (!dueToday.length || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try { new Notification(`ToDo App: ${dueToday.length} due today`); } catch (e) {}
    }
  }, [todos.length]);

  const remindedRef = useRef(new Set());
  // time reminders: when a task's due-day + reminder time arrives, sound + notify
  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hm = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const t = todayStr();
      todos.forEach((todo) => {
        if (todo.completed || todo.due_date !== t || !todo.reminder_time) return;
        if (todo.reminder_time > hm) return;
        const key = todo.id + "@" + todo.reminder_time + "@" + t;
        if (remindedRef.current.has(key)) return;
        remindedRef.current.add(key);
        playSound(settings.notification_sound);
        showStatus("⏰ " + todo.title);
        if (settings.notifications_enabled === "1" && "Notification" in window && Notification.permission === "granted") {
          try { new Notification("⏰ " + todo.title); } catch (e) {}
        }
      });
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [todos, settings.notification_sound, settings.notifications_enabled]);

  const sorted = (list) => {
    const arr = [...list];
    if (settings.sort === "due") arr.sort((a, b) => (a.due_date || "9999") < (b.due_date || "9999") ? -1 : 1);
    else if (settings.sort === "priority") {
      const w = { high: 0, medium: 1, low: 2 };
      arr.sort((a, b) => (w[a.priority] ?? 1) - (w[b.priority] ?? 1));
    } else if (settings.sort === "newest") arr.sort((a, b) => b.id - a.id);
    return arr;
  };

  const visible = sorted(todos.filter((t) => {
    if (filter === "active" && t.completed) return false;
    if (filter === "done" && !t.completed) return false;
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      if (!(t.title.toLowerCase().includes(q) || (t.notes || "").toLowerCase().includes(q))) return false;
    }
    return true;
  }));
  const doneCount = todos.filter((t) => t.completed).length;
  const pct = todos.length ? Math.round((doneCount / todos.length) * 100) : 0;
  const selected = todos.find((t) => t.id === selectedId) || null;

  const addTodo = async (e, presetDue) => {
    if (e) e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const res = await fetch("/api/todos", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_date: presetDue || newDue, priority: newPrio, recurrence: newRecur, reminder_time: newRemind }),
    });
    if (res.ok) {
      const created = await res.json();
      setTodos((prev) => [...prev, created]);
      setSelectedId(created.id);
      setNotesDraft("");
      setNewTitle(""); setNewDue(""); setNewRecur("none"); setNewRemind("");
      playSound(settings.notification_sound);
      showStatus("Added ✓");
    }
  };

  const toggleTodo = async (todo) => {
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      if (updated.completed) playSound(settings.notification_sound);
      if (todo.recurrence && todo.recurrence !== "none" && !todo.completed) load(); // recurring → new occurrence spawned, refresh
    }
  };

  const deleteTodo = async (id) => {
    if (!confirm("Delete this todo?")) return;
    const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) {
      setTodos((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (selectedIdRef.current === id && next.length) setSelectedId(next[0].id);
        return next;
      });
      showStatus("Deleted");
    }
  };

  const clearDone = async () => {
    if (!confirm("Delete all completed todos?")) return;
    const res = await fetch("/api/todos/clear-completed", { method: "POST" });
    if (res.ok) { setTodos(await res.json()); showStatus("Cleared ✓"); }
  };

  const wipeAll = async () => {
    if (!confirm("Erase EVERYTHING? All tasks and settings will be reset.")) return;
    if (!confirm("Really sure? This cannot be undone.")) return;
    const res = await fetch("/api/wipe", { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setTodos(data.todos);
      setSettings(data.settings);
      setSettingsDraft(null);
      setSelectedId(null);
      setNotesDraft("");
      showStatus("Wiped clean 🧹");
    }
  };

  // small tappable user badge (jumps to settings); shown on Tasks + Calendar
  const UserChip = () => h("div", { className: "user-chip", onClick: () => { setSettingsDraft(settings); setView("settings"); }, title: T.settings },
    UserPic(settings.profile_pic, settings.profile_name),
    h("span", { className: settings.profile_name ? "chip-name" : "chip-name chip-empty" }, settings.profile_name || T.addUsername)
  );

  const startEdit = (todo) => { setEditingId(todo.id); setEditDraft(todo.title); setEditDue(todo.due_date || ""); setEditPrio(todo.priority || "medium"); setEditRecur(todo.recurrence || "none"); setEditRemind(todo.reminder_time || ""); };
  const saveEdit = async (id) => {
    const title = editDraft.trim();
    if (!title) return;
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, due_date: editDue, priority: editPrio, recurrence: editRecur, reminder_time: editRemind }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingId(null);
      showStatus("Saved ✓");
    }
  };

  const saveNotes = async (id, notes) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setNotesDraft(updated.notes || "");
      setIsEditingNotes(false);
      playSound(settings.notification_sound);
      showStatus("Notes saved ✓");
    }
  };

  const onDragStart = (e, id) => { setDragId(id); try { e.dataTransfer.effectAllowed = "move"; } catch (err) {} };
  const onDragOver = (e, id) => { e.preventDefault(); if (id !== dragId) setDropId(id); };
  const onDrop = async (e, targetId) => {
    e.preventDefault();
    if (dragId == null || dragId === targetId) { setDragId(null); setDropId(null); return; }
    const from = todos.findIndex((t) => t.id === dragId);
    const to = todos.findIndex((t) => t.id === targetId);
    const next = [...todos];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setTodos(next);
    setDragId(null); setDropId(null);
    const res = await fetch("/api/todos/reorder", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordered_ids: next.map((t) => t.id) }),
    });
    if (res.ok) { setTodos(await res.json()); showStatus("Moved ✓"); }
    else load();
  };

  const saveSettings = async () => {
    const draft = settingsDraft || settings;
    const res = await fetch("/api/settings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: draft }),
    });
    if (res.ok) {
      setSettings(await res.json());
      setSettingsDraft(null);
      showStatus("Settings saved ✓");
      if (draft.notifications_enabled === "1" && "Notification" in window && Notification.permission === "default") {
        try { await Notification.requestPermission(); } catch (e) {}
      }
    }
  };

  const exportJSON = async () => {
    const res = await fetch("/api/export");
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "todo-backup.json";
    a.click();
  };

  // ---------- calendar helpers ----------
  const monthCells = () => {
    const first = new Date(calMonth.y, calMonth.m, 1);
    const startDay = (first.getDay() + 6) % 7; // Monday-first
    const daysInMonth = new Date(calMonth.y, calMonth.m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(calMonth.y + "-" + String(calMonth.m + 1).padStart(2, "0") + "-" + String(d).padStart(2, "0"));
    }
    return cells;
  };
  const todosOn = (day) => todos.filter((t) => t.due_date === day && (settings.show_completed === "1" || !t.completed));
  const monthName = new Date(calMonth.y, calMonth.m, 1).toLocaleString(lang === "en" ? "en" : lang, { month: "long", year: "numeric" });

  // ---------- render pieces ----------
  const todoItems = visible.map((todo, i) => {
    const di = dueInfo(todo.due_date);
    return h("li", {
      key: todo.id,
      className: "todo" + (todo.completed ? " done" : "") + (dragId === todo.id ? " dragging" : "") + (dropId === todo.id ? " drop-target" : "") + (selectedId === todo.id ? " selected" : ""),
      style: { background: COLORS[i % COLORS.length] },
      draggable: editingId !== todo.id,
      onDragStart: (e) => onDragStart(e, todo.id),
      onDragOver: (e) => onDragOver(e, todo.id),
      onDrop: (e) => onDrop(e, todo.id),
      onClick: () => setSelectedId(todo.id),
    },
      h("span", { className: "drag-handle", title: "Drag to move" }, "⠿"),
      h("button", {
        className: "check" + (todo.completed ? " done" : ""),
        onClick: (e) => { e.stopPropagation(); toggleTodo(todo); },
      }, todo.completed ? "✓" : ""),
      h("div", { style: { flex: 1, minWidth: 0 } },
        editingId === todo.id
          ? h("div", null,
              h("input", { className: "title-input", value: editDraft, autoFocus: true,
                onChange: (e) => setEditDraft(e.target.value),
                onKeyDown: (e) => { if (e.key === "Enter") saveEdit(todo.id); if (e.key === "Escape") setEditingId(null); },
                onClick: (e) => e.stopPropagation(), }),
              h("div", { className: "edit-row" },
                h("input", { type: "date", className: "date-input", value: editDue, onChange: (e) => setEditDue(e.target.value), onClick: (e) => e.stopPropagation() }),
                h("select", { className: "prio-select", value: editPrio, onChange: (e) => setEditPrio(e.target.value), onClick: (e) => e.stopPropagation() },
                  h("option", { value: "low" }, T.low), h("option", { value: "medium" }, T.medium), h("option", { value: "high" }, T.high))
              ),
              h("div", { className: "edit-row" },
                h("select", { className: "prio-select", value: editRecur, onChange: (e) => setEditRecur(e.target.value), onClick: (e) => e.stopPropagation(), title: T.recur },
                  h("option", { value: "none" }, T.noneR), h("option", { value: "daily" }, T.daily),
                  h("option", { value: "weekly" }, T.weekly), h("option", { value: "monthly" }, T.monthly)),
                h("input", { type: "time", className: "date-input", value: editRemind, onChange: (e) => setEditRemind(e.target.value), onClick: (e) => e.stopPropagation(), title: T.remind })
              )
            )
          : h("span", { className: "title", onDoubleClick: () => startEdit(todo) }, todo.title),
        (todo.notes && editingId !== todo.id)
          ? h("div", { className: "notes-preview" }, todo.notes.length > 60 ? todo.notes.slice(0, 60) + "…" : todo.notes)
          : null,
        editingId !== todo.id
          ? h("div", { className: "meta-row" },
              todo.priority ? h("span", { className: "prio", style: { background: PRIO_COLOR[todo.priority] || "#999" } }, todo.priority) : null,
              di.label ? h("span", { className: "due " + di.cls }, di.label) : h("span", { className: "due due-none" }, "· " + T.noDue),
              (todo.recurrence && todo.recurrence !== "none") ? h("span", { className: "recur" }, "🔁 " + todo.recurrence) : null,
              todo.reminder_time ? h("span", { className: "remind" }, "⏰ " + todo.reminder_time) : null
            )
          : null
      ),
      editingId === todo.id
        ? h("button", { className: "icon-btn", onClick: () => saveEdit(todo.id) }, "💾")
        : h("button", { className: "icon-btn", onClick: (e) => { e.stopPropagation(); startEdit(todo); } }, "✏️"),
      h("button", { className: "icon-btn", onClick: (e) => { e.stopPropagation(); deleteTodo(todo.id); } }, "🗑️")
    );
  });

  const tasksView = h("div", { className: "layout" },
    h("div", { className: "card" },
      UserChip(),
      h("div", { style: { height: 10 } }),
      h("form", { className: "add-row", onSubmit: addTodo },
        h("input", { placeholder: "What needs doing?", value: newTitle, onChange: (e) => setNewTitle(e.target.value) }),
        h("input", { type: "date", className: "date-input", value: newDue, onChange: (e) => setNewDue(e.target.value), title: T.dueDate }),
        h("select", { className: "prio-select", value: newPrio, onChange: (e) => setNewPrio(e.target.value), title: T.priority },
          h("option", { value: "low" }, T.low), h("option", { value: "medium" }, T.medium), h("option", { value: "high" }, T.high)),
        h("select", { className: "prio-select", value: newRecur, onChange: (e) => setNewRecur(e.target.value), title: T.recur },
          h("option", { value: "none" }, T.noneR), h("option", { value: "daily" }, T.daily),
          h("option", { value: "weekly" }, T.weekly), h("option", { value: "monthly" }, T.monthly)),
        h("input", { type: "time", className: "date-input", value: newRemind, onChange: (e) => setNewRemind(e.target.value), title: T.remind }),
        h("button", { className: "btn-add", type: "submit" }, T.add)
      ),
      h("input", { className: "search", placeholder: "🔍 " + T.search, value: query, onChange: (e) => setQuery(e.target.value) }),
      h("div", { className: "filters" },
        ["all", "active", "done"].map((f) =>
          h("button", { key: f, className: filter === f ? "active" : "", onClick: () => setFilter(f) },
            f === "all" ? T.all : f === "active" ? T.active : T.done)
        ),
        h("select", { className: "sort-select", value: settings.sort, title: T.sort,
          onChange: async (e) => {
            const v = e.target.value;
            setSettings((p) => ({ ...p, sort: v }));
            await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: { sort: v } }) });
          } },
          h("option", { value: "manual" }, T.manual), h("option", { value: "due" }, T.byDue),
          h("option", { value: "priority" }, T.byPrio), h("option", { value: "newest" }, T.newest))
      ),
      visible.length === 0
        ? h("div", { className: "empty" }, T.empty)
        : h("ul", { className: "todos" }, todoItems),
      h("div", { className: "hint" }, "💡 Drag ⠿ to reorder. Tap a task to see notes."),
      h("div", { className: "status" }, status)
    ),
    h("div", { className: "card notes-pane" },
      h("h2", null, T.notesPane),
      !selected
        ? h("p", { className: "notes-meta" }, T.selectTodo)
        : h("div", null,
            h("div", { className: "notes-meta" }, T.viewingFor + " ", h("b", null, selected.title)),
            isEditingNotes
              ? h("div", null,
                  h("textarea", { value: notesDraft, onChange: (e) => setNotesDraft(e.target.value) }),
                  h("div", { style: { height: 10 } }),
                  h("div", { className: "notes-btn-row" },
                    h("button", { className: "btn-save", onClick: () => saveNotes(selected.id, notesDraft) }, T.saveNotes),
                    h("button", { className: "btn-cancel", onClick: () => { setNotesDraft(selected.notes || ""); setIsEditingNotes(false); } }, T.cancel)
                  )
                )
              : h("div", null,
                  selected.notes
                    ? h("div", { className: "notes-view" }, selected.notes)
                    : h("div", { className: "notes-view empty-notes" }, T.noNotes),
                  h("div", { style: { height: 10 } }),
                  h("button", { className: "btn-save", onClick: () => { setNotesDraft(selected.notes || ""); setIsEditingNotes(true); } }, selected.notes ? T.editNotes : T.addNotes)
                )
          )
    )
  );

  const calView = h("div", { className: "card" },
    UserChip(),
    h("div", { style: { height: 10 } }),
    h("div", { className: "cal-head" },
      h("button", { className: "icon-btn", onClick: () => setCalMonth((p) => p.m === 0 ? { y: p.y - 1, m: 11 } : { y: p.y, m: p.m - 1 }) }, "‹"),
      h("h2", { style: { margin: 0 } }, monthName),
      h("button", { className: "icon-btn", onClick: () => setCalMonth((p) => p.m === 11 ? { y: p.y + 1, m: 0 } : { y: p.y, m: p.m + 1 }) }, "›"),
      h("button", { className: "icon-btn", onClick: () => { const n = new Date(); setCalMonth({ y: n.getFullYear(), m: n.getMonth() }); setCalDay(todayStr()); } }, T.today)
    ),
    h("div", { className: "cal-grid cal-dow" }, ["M", "T", "W", "T", "F", "S", "S"].map((d, i) => h("div", { key: i, className: "cal-dow-cell" }, d))),
    h("div", { className: "cal-grid" },
      monthCells().map((day, i) => {
        if (!day) return h("div", { key: i, className: "cal-cell cal-empty" });
        const list = todosOn(day);
        return h("div", {
          key: i,
          className: "cal-cell" + (day === calDay ? " cal-selected" : "") + (day === todayStr() ? " cal-today" : ""),
          onClick: () => setCalDay(day),
        },
          h("div", { className: "cal-num" }, Number(day.slice(8))),
          h("div", { className: "cal-dots" }, list.slice(0, 3).map((t) =>
            h("span", { key: t.id, className: "cal-dot", style: { background: t.completed ? "#22c55e" : (PRIO_COLOR[t.priority] || "#764ba2") }, title: t.title })
          ),
          list.length > 3 ? h("span", { className: "cal-more" }, "+" + (list.length - 3)) : null
          )
        );
      })
    ),
    h("h3", null, T.tasksFor + " " + (calDay || "…")),
    todosOn(calDay).length === 0
      ? h("p", { className: "notes-meta" }, T.pickDay)
      : h("ul", { className: "todos" }, todosOn(calDay).map((t) =>
          h("li", { key: t.id, className: "todo" + (t.completed ? " done" : ""), style: { background: "#f4f1ff" } },
            h("button", { className: "check" + (t.completed ? " done" : ""), onClick: () => toggleTodo(t) }, t.completed ? "✓" : ""),
            h("span", { className: "title", style: { flex: 1 }, onClick: () => { setSelectedId(t.id); setView("tasks"); } }, t.title),
            h("span", { className: "prio", style: { background: PRIO_COLOR[t.priority] || "#999" } }, t.priority)
          )
        )),
    h("form", { className: "add-row", onSubmit: (e) => { e.preventDefault(); if (!newTitle.trim()) return; addTodo(e, calDay); } },
      h("input", { placeholder: "Add for " + calDay, value: newTitle, onChange: (e) => setNewTitle(e.target.value) }),
      h("button", { className: "btn-add", type: "submit" }, T.add)
    )
  );

  const draft = settingsDraft || settings;
  const set = (k, v) => setSettingsDraft((p) => ({ ...(p || settings), [k]: v }));
  // Photo-library upload: downscale to a 128px JPEG so it stays tiny in the DB
  const onPicFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { showStatus("Photo too large (max 5MB)"); return; }
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      try {
        const S = 128;
        const side = Math.min(img.width, img.height) || S;
        const c = document.createElement("canvas");
        c.width = S; c.height = S;
        c.getContext("2d").drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, S, S);
        set("profile_pic", c.toDataURL("image/jpeg", 0.8));
      } catch (err) { showStatus("Could not read photo"); }
      URL.revokeObjectURL(url);
    };
    img.onerror = () => { URL.revokeObjectURL(url); showStatus("Could not read photo"); };
    img.src = url;
    e.target.value = "";
  };
  const settingsView = h("div", { className: "card settings" },
    h("h2", { className: "settings-title" }, GearIcon(22), " " + T.settings),
    h("div", { className: "set-profile" },
      UserPic(draft.profile_pic, draft.profile_name),
      h("div", null,
        draft.profile_name
          ? h("b", null, draft.profile_name)
          : h("span", { className: "username-empty" }, T.addUsername),
        h("div", { className: "notes-meta" }, T.profile)
      )
    ),
    h("label", { className: "set-row" }, h("span", null, T.profile),
      h("input", { value: draft.profile_name || "", onChange: (e) => set("profile_name", e.target.value), placeholder: T.addUsername })),
    h("div", { className: "set-row" }, h("span", null, T.photo),
      h("div", { className: "photo-row" },
        h("label", { className: "btn-choose" }, T.choosePhoto,
          h("input", { type: "file", accept: "image/*", style: { display: "none" }, onChange: onPicFile })),
        draft.profile_pic ? h("button", { className: "btn-remove", onClick: () => set("profile_pic", "") }, T.removePhoto) : null
      )),
    h("label", { className: "set-row" }, h("span", null, T.theme),
      h("select", { value: draft.theme, onChange: (e) => set("theme", e.target.value) },
        h("option", { value: "colourful" }, T.colourful), h("option", { value: "light" }, T.light), h("option", { value: "dark" }, T.dark))),
    h("label", { className: "set-row" }, h("span", null, T.language),
      h("select", { value: draft.language, onChange: (e) => set("language", e.target.value) },
        LANGS.map((l) => h("option", { key: l[0], value: l[0] }, l[1])))),
    h("label", { className: "set-row" }, h("span", null, T.sound),
      h("select", { value: draft.notification_sound, onChange: (e) => { set("notification_sound", e.target.value); playSound(e.target.value); } },
        [h("option", { key: "off", value: "off" }, T.off)].concat(
          SOUND_NAMES.map((s) => h("option", { key: s, value: s }, SOUND_LABEL(s)))))),
    h("div", { className: "hint" }, T.enableSound),
    h("label", { className: "set-check" },
      h("input", { type: "checkbox", checked: draft.notifications_enabled === "1", onChange: (e) => set("notifications_enabled", e.target.checked ? "1" : "0") }),
      h("span", null, T.notif)),
    h("label", { className: "set-check" },
      h("input", { type: "checkbox", checked: draft.show_completed === "1", onChange: (e) => set("show_completed", e.target.checked ? "1" : "0") }),
      h("span", null, T.showCompleted)),
    h("div", { style: { height: 12 } }),
    h("button", { className: "btn-save", onClick: saveSettings }, T.saveSettings),
    h("div", { style: { height: 12 } }),
    h("button", { className: "icon-btn wide", onClick: exportJSON }, "⬇ " + T.export),
    h("h3", null, T.danger),
    h("button", { className: "btn-danger", onClick: clearDone }, "🗑 " + T.clearDone),
    h("div", { style: { height: 8 } }),
    h("button", { className: "btn-danger btn-wipe", onClick: wipeAll }, "🧹 " + T.wipe),
    h("div", { className: "status" }, status)
  );

  return h("div", { className: "wrap" },
    h("header", { className: "hero" },
      h("div", { className: "hero-top" },
        UserPic(settings.profile_pic, settings.profile_name),
        h("div", null,
          h("h1", null, "ToDo App"),
          h("p", null, (settings.profile_name ? settings.profile_name + " • " : "") + doneCount + "/" + todos.length + " " + T.progress + " (" + pct + "%)")
        )
      ),
      h("div", { className: "progress" }, h("div", { style: { width: pct + "%" } })),
      h("nav", { className: "tabs" },
        h("button", { className: view === "tasks" ? "active" : "", onClick: () => setView("tasks") }, "📋 " + T.tasks),
        h("button", { className: view === "calendar" ? "active" : "", onClick: () => setView("calendar") }, "📅 " + T.calendar),
        h("button", { className: view === "settings" ? "active" : "", onClick: () => { setSettingsDraft(settings); setView("settings"); } }, GearIcon(18), " " + T.settings)
      )
    ),
    view === "tasks" ? tasksView : view === "calendar" ? calView : settingsView,
    h("div", { className: "hint center" }, "FastAPI + SQLite • React • /docs")
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
