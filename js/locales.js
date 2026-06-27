/* =========================
   LOCALES
========================= */

const contenedorLocales = document.getElementById("locales-container");
const API_BASE_URL = window.LA_LUCHA_API_CONFIG?.baseUrl;

const IMAGENES_LOCALES = {
  miraflores: "assets/img/locales/miraflores.webp",
  surco: "assets/img/locales/SDS.jpg",
  "san isidro": "assets/img/locales/Sanmiguel.jpg",
  "la molina": "assets/img/locales/barranco.jpg",
  ate: "assets/img/locales/chorrillos.jpg"
};

const MAPAS_LOCALES = {
  miraflores: "https://maps.google.com/?q=Av.%20Diagonal%20308%20Miraflores%20Lima",
  surco: "https://maps.google.com/?q=Av.%20Primavera%201205%20Santiago%20de%20Surco%20Lima",
  "san isidro": "https://maps.google.com/?q=Av.%20Camino%20Real%20456%20San%20Isidro%20Lima",
  "la molina": "https://maps.google.com/?q=Av.%20La%20Molina%20789%20La%20Molina%20Lima",
  ate: "https://maps.google.com/?q=Av.%20Industrial%201500%20Ate%20Lima"
};

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarTelefono(telefono) {
  return String(telefono).replace(/\D/g, "");
}

function formatearTelefono(telefono) {
  const telefonoLimpio = normalizarTelefono(telefono);

  if (telefonoLimpio.length !== 9) return String(telefono);

  return `${telefonoLimpio.slice(0, 3)} ${telefonoLimpio.slice(3, 6)} ${telefonoLimpio.slice(6)}`;
}

function resolverClaveLocal(local) {
  const textoLocal = normalizarTexto(`${local.nombre} ${local.distrito}`);

  if (textoLocal.includes("miraflores")) return "miraflores";
  if (textoLocal.includes("surco")) return "surco";
  if (textoLocal.includes("san isidro")) return "san isidro";
  if (textoLocal.includes("molina")) return "la molina";
  if (textoLocal.includes("ate")) return "ate";

  return "miraflores";
}

function adaptarLocalApi(local) {
  const claveLocal = resolverClaveLocal(local);

  return {
    id: local.localId,
    nombre: local.nombre,
    direccion: `${local.direccion}, ${local.distrito}`,
    horario: "Atencion diaria | 8:00 am - 10:00 pm",
    telefono: formatearTelefono(local.telefono),
    imagen: IMAGENES_LOCALES[claveLocal] || IMAGENES_LOCALES.miraflores,
    maps: MAPAS_LOCALES[claveLocal] || MAPAS_LOCALES.miraflores
  };
}

async function obtenerLocalesDesdeApi() {
  if (!API_BASE_URL) {
    throw new Error("No se encontro la configuracion de la API publica.");
  }

  const respuesta = await fetch(`${API_BASE_URL}/locales`);

  if (!respuesta.ok) {
    throw new Error(`La API respondio ${respuesta.status} en /locales`);
  }

  const localesApi = await respuesta.json();

  return localesApi
    .filter((local) => local.estado !== false)
    .map(adaptarLocalApi);
}

function crearMetaLocal(label, valor, enlace) {
  const item = document.createElement("p");
  item.className = "card__meta-item";

  const strong = document.createElement("strong");
  strong.textContent = `${label}: `;

  item.append(strong);

  if (enlace) {
    item.append(enlace);
  } else {
    item.append(valor);
  }

  return item;
}

function crearCardLocal(local, index) {
  const posicionInvertida = index % 2 !== 0;

  const articulo = document.createElement("article");
  articulo.className = `card card--location card--horizontal reveal active ${
    posicionInvertida ? "card--reverse reveal-delay-1" : ""
  }`;

  const media = document.createElement("div");
  media.className = "card__media";

  const imagen = document.createElement("img");
  imagen.className = "card__image";
  imagen.src = local.imagen;
  imagen.alt = local.nombre;
  imagen.loading = "lazy";

  const body = document.createElement("div");
  body.className = "card__body";

  const eyebrow = document.createElement("p");
  eyebrow.className = "card__eyebrow";
  eyebrow.textContent = "Local";

  const titulo = document.createElement("h3");
  titulo.className = "card__title";
  titulo.textContent = local.nombre;

  const meta = document.createElement("div");
  meta.className = "card__meta";

  const telefonoLink = document.createElement("a");
  telefonoLink.href = `tel:+51${normalizarTelefono(local.telefono)}`;
  telefonoLink.textContent = local.telefono;

  meta.append(
    crearMetaLocal("Direccion", local.direccion),
    crearMetaLocal("Horario", local.horario),
    crearMetaLocal("Telefono", local.telefono, telefonoLink)
  );

  const actions = document.createElement("div");
  actions.className = "card__actions";

  const mapsLink = document.createElement("a");
  mapsLink.className = "card__action";
  mapsLink.href = local.maps;
  mapsLink.target = "_blank";
  mapsLink.rel = "noopener noreferrer";
  mapsLink.textContent = "Ver ubicacion";

  actions.append(mapsLink);
  media.append(imagen);
  body.append(eyebrow, titulo, meta, actions);
  articulo.append(media, body);

  return articulo;
}

function renderizarLocales(listaLocales) {
  if (!contenedorLocales) return;

  contenedorLocales.innerHTML = "";

  if (!Array.isArray(listaLocales) || listaLocales.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "sin-locales";
    mensaje.textContent = "No se encontraron locales disponibles.";
    contenedorLocales.append(mensaje);
    return;
  }

  const fragmento = document.createDocumentFragment();

  listaLocales.forEach((local, index) => {
    fragmento.append(crearCardLocal(local, index));
  });

  contenedorLocales.append(fragmento);
  activarRevealsDinamicos(contenedorLocales);
}

function activarRevealsDinamicos(contenedor) {
  requestAnimationFrame(() => {
    contenedor.querySelectorAll(".reveal").forEach((elemento) => {
      elemento.classList.add("active");
    });
  });
}

async function inicializarLocales() {
  if (!contenedorLocales) return;

  contenedorLocales.innerHTML = '<p class="sin-locales">Cargando locales desde el backend...</p>';

  try {
    renderizarLocales(await obtenerLocalesDesdeApi());
  } catch (error) {
    console.error("No se pudo cargar locales desde la API publica.", error);
    renderizarLocales([]);
  }
}

inicializarLocales();
