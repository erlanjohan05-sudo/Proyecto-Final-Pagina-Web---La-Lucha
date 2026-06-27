/* =========================
   PROMOCIONES
========================= */

const contenedorPromociones = document.getElementById("promociones-container");
const API_BASE_URL = window.LA_LUCHA_API_CONFIG?.baseUrl;

const IMAGENES_PROMOCIONES = {
  "combo criollo": "assets/img/promos/combocriollo.webp",
  "la brava de la casa": "assets/img/promos/labrava.webp",
  "promo universitario": "assets/img/promos/universitario.webp",
  "combo full aji": "assets/img/promos/full.webp",
  "promo familiar": "assets/img/promos/familiar.webp",
  "martes 2x1": "assets/img/promos/martes.webp",
  "donde comen 2 comen 3": "assets/img/promos/dondecomen.webp"
};

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearPrecio(valor) {
  const precio = Number(valor);

  if (!Number.isFinite(precio)) return "Consultar";

  return `S/. ${precio.toFixed(2)}`;
}

function formatearFecha(fecha) {
  if (!fecha) return "";

  const fechaLocal = new Date(`${fecha}T00:00:00`);

  if (Number.isNaN(fechaLocal.getTime())) return "";

  return fechaLocal.toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function resolverImagenPromocion(promocion) {
  if (promocion.imagenUrl) return promocion.imagenUrl;

  const clave = normalizarTexto(promocion.nombre);

  return IMAGENES_PROMOCIONES[clave] || IMAGENES_PROMOCIONES["combo criollo"];
}

function adaptarPromocionApi(promocion) {
  const fechaInicio = formatearFecha(promocion.fechaInicio);
  const fechaFin = formatearFecha(promocion.fechaFin);
  const vigencia = fechaInicio && fechaFin ? `Vigente del ${fechaInicio} al ${fechaFin}` : "";

  return {
    id: promocion.promocionId,
    nombre: promocion.nombre,
    badge: "Promocion vigente",
    incluye: promocion.descripcion,
    extra: vigencia || "Consulta disponibilidad en el local mas cercano.",
    precioPromo: formatearPrecio(promocion.precioPromocional),
    cta: "Pedir promocion",
    imagen: resolverImagenPromocion(promocion)
  };
}

async function obtenerPromocionesDesdeApi() {
  if (!API_BASE_URL) {
    throw new Error("No se encontro la configuracion de la API publica.");
  }

  const respuesta = await fetch(`${API_BASE_URL}/promociones`);

  if (!respuesta.ok) {
    throw new Error(`La API respondio ${respuesta.status} en /promociones`);
  }

  const promocionesApi = await respuesta.json();

  return promocionesApi
    .filter((promocion) => promocion.estado !== false)
    .map(adaptarPromocionApi);
}

/* =========================
   UTILIDADES
========================= */

function crearElementoTexto(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  elemento.className = clase;
  elemento.textContent = texto;

  return elemento;
}

/* =========================
   CREAR CARD PROMOCION
========================= */

function crearCardPromocion(promocion, index) {
  const posicionInvertida = index % 2 !== 0;

  const articulo = document.createElement("article");
  articulo.className = `promocion-card reveal active ${
    posicionInvertida ? "promocion-card--reverse reveal-delay-1" : ""
  }`;
  articulo.setAttribute("aria-label", `Promocion ${promocion.nombre}`);

  const media = document.createElement("div");
  media.className = "promocion-imagen";

  const imagen = document.createElement("img");
  imagen.src = promocion.imagen;
  imagen.alt = `Promocion ${promocion.nombre}`;
  imagen.loading = "lazy";

  const contenido = document.createElement("div");
  contenido.className = "promocion-contenido";

  const badge = crearElementoTexto(
    "span",
    "promocion-badge",
    promocion.badge || "Promocion especial"
  );

  const incluye = crearElementoTexto("p", "promocion-incluye", promocion.incluye);
  const extra = crearElementoTexto("p", "promocion-extra", promocion.extra);

  const precios = document.createElement("div");
  precios.className = "promocion-precios";
  precios.setAttribute("aria-label", "Precio de la promocion");

  if (promocion.precioOriginal) {
    const precioOriginal = crearElementoTexto(
      "span",
      "promocion-precio-original",
      promocion.precioOriginal
    );

    precios.append(precioOriginal);
  }

  const precioPromo = crearElementoTexto("strong", "promocion-precio-final", promocion.precioPromo);

  precios.append(precioPromo);

  const boton = document.createElement("a");
  boton.className = "promocion-btn";
  boton.href = `pedido.html?promocion=${encodeURIComponent(promocion.nombre)}`;
  boton.textContent = promocion.cta || "Pedir promocion";
  boton.setAttribute("aria-label", `Pedir promocion ${promocion.nombre}`);

  media.append(imagen);
  contenido.append(badge, incluye, extra, precios, boton);
  articulo.append(media, contenido);

  return articulo;
}

/* =========================
   RENDER PROMOCIONES
========================= */

function renderizarPromociones(listaPromociones) {
  if (!contenedorPromociones) return;

  contenedorPromociones.innerHTML = "";

  if (!Array.isArray(listaPromociones) || listaPromociones.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "sin-promociones";
    mensaje.textContent = "No se encontraron promociones disponibles.";
    contenedorPromociones.append(mensaje);
    return;
  }

  const fragmento = document.createDocumentFragment();

  listaPromociones.forEach((promocion, index) => {
    fragmento.append(crearCardPromocion(promocion, index));
  });

  contenedorPromociones.append(fragmento);
  activarRevealsDinamicos(contenedorPromociones);
}

function activarRevealsDinamicos(contenedor) {
  requestAnimationFrame(() => {
    contenedor.querySelectorAll(".reveal").forEach((elemento) => {
      elemento.classList.add("active");
    });
  });
}

async function inicializarPromociones() {
  if (!contenedorPromociones) return;

  contenedorPromociones.innerHTML =
    '<p class="sin-promociones">Cargando promociones desde el backend...</p>';

  try {
    renderizarPromociones(await obtenerPromocionesDesdeApi());
  } catch (error) {
    console.error("No se pudo cargar promociones desde la API publica.", error);
    renderizarPromociones([]);
  }
}

inicializarPromociones();
