/* =========================
   PRODUCTOS
========================= */

const contenedorProductos = document.getElementById("productos-grid");
const buscadorInput = document.getElementById("buscador-input");
const botonesCategorias = document.querySelectorAll(".categorias-lista button");

const btnAnterior = document.getElementById("btn-anterior");
const btnSiguiente = document.getElementById("btn-siguiente");
const contenedorPaginacion = document.getElementById("paginacion-numeros");
const estadoProductos = document.getElementById("productos-estado");
const seccionProductos = document.querySelector(".carta-productos");
const btnLimpiarFiltros = document.getElementById("limpiar-filtros");
const totalProductosHero = document.getElementById("carta-total-productos");
const totalCategoriasHero = document.getElementById("carta-total-categorias");
const solicitudStore = window.LaLuchaSolicitud;

const API_BASE_URL = window.LA_LUCHA_API_CONFIG?.baseUrl;
const PRODUCTO_ID_MAX_CATALOGO = 20;
const PRODUCTOS_POR_PAGINA = 6;
const IMAGENES_FALLBACK = {
  chicharron: "assets/img/productos/sanguches/chicharron.webp",
  pavo: "assets/img/productos/sanguches/pavo.webp",
  chicha: "assets/img/productos/bebidas/chicha.webp",
  cafe: "assets/img/productos/bebidas/cafe.webp",
  emoliente: "assets/img/productos/bebidas/emoliente.webp",
  gaseosa: "assets/img/productos/bebidas/gaseosa-personal.webp",
  limonada: "assets/img/productos/bebidas/limonada-frozen.webp",
  camote: "assets/img/productos/acompanamientos/camote-frito.webp",
  papasPersonales: "assets/img/productos/acompanamientos/papas-fritas-personales.webp",
  papasFamiliares: "assets/img/productos/acompanamientos/papas-fritas-familiar.webp",
  salsaCriolla: "assets/img/productos/acompanamientos/salsa-criolla-extra.webp",
  comboCriollo: "assets/img/productos/combos/combo-criollo-personal.webp",
  comboFamiliar: "assets/img/productos/combos/combo-familiar.webp",
  comboFull: "assets/img/productos/combos/combo-full-aji.webp",
  alfajor: "assets/img/productos/postres/alfajor-artesanal.webp",
  mazamorra: "assets/img/productos/postres/mazamorra-morada.webp",
  sanguches: "assets/img/productos/sanguches/chicharron.webp",
  bebidas: "assets/img/productos/bebidas/chicha.webp",
  acompanamientos: "assets/img/productos/acompanamientos/papas-fritas-personales.webp",
  combos: "assets/img/productos/combos/combo-criollo-personal.webp",
  postres: "assets/img/productos/postres/alfajor-artesanal.webp",
  promociones: "assets/img/productos/sanguches/chicharron.webp"
};

let categoriaActual = "todos";
let textoBusqueda = "";
let paginaActual = 1;
let productosActuales = [];
let productosCatalogo = [];

/* =========================
   UTILIDADES
========================= */

function formatearPrecio(precio) {
  return `S/ ${Number(precio).toFixed(2)}`;
}

function crearMiniSolicitud() {
  const miniSolicitud = document.createElement("aside");
  miniSolicitud.className = "solicitud-mini";
  miniSolicitud.id = "solicitud-mini";
  miniSolicitud.hidden = true;
  miniSolicitud.setAttribute("aria-live", "polite");

  miniSolicitud.innerHTML = `
    <div class="solicitud-mini__info">
      <span class="solicitud-mini__label">Tu solicitud</span>
      <strong id="solicitud-mini-cantidad">0 productos</strong>
      <span id="solicitud-mini-total">Total: S/ 0.00</span>
    </div>
    <a class="solicitud-mini__link" href="pedido.html">Ver solicitud</a>
  `;

  document.body.append(miniSolicitud);
  return miniSolicitud;
}

const miniSolicitud = solicitudStore ? crearMiniSolicitud() : null;

function actualizarMiniSolicitud() {
  if (!solicitudStore || !miniSolicitud) return;

  const items = solicitudStore.obtenerSolicitud();
  const { cantidadTotal, total } = solicitudStore.calcularTotales(items);
  const cantidadTexto = cantidadTotal === 1 ? "1 producto" : `${cantidadTotal} productos`;

  miniSolicitud.hidden = cantidadTotal === 0;
  miniSolicitud.querySelector("#solicitud-mini-cantidad").textContent = cantidadTexto;
  miniSolicitud.querySelector("#solicitud-mini-total").textContent = `Total: ${formatearPrecio(total)}`;
}

function agregarProductoASolicitud(producto) {
  if (!solicitudStore) {
    window.location.href = `pedido.html?productoId=${encodeURIComponent(producto.id)}`;
    return;
  }

  solicitudStore.agregarItem({
    id: producto.id,
    tipo: "producto",
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: 1,
    imagen: producto.imagen
  });

  actualizarMiniSolicitud();
}

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizarCategoriaApi(nombreCategoria) {
  const categoria = normalizarTexto(nombreCategoria);

  if (categoria.includes("sanguch")) return "sanguches";
  if (categoria.includes("bebida")) return "bebidas";
  if (categoria.includes("acompan")) return "acompanamientos";
  if (categoria.includes("combo")) return "combos";
  if (categoria.includes("postre")) return "postres";
  if (categoria.includes("promocion")) return "promociones";

  return "sanguches";
}

function obtenerCategoriaPorId(categoriaId, categoriasPorId) {
  const categoriaNormalizada = categoriasPorId[categoriaId];

  if (categoriaNormalizada) return categoriaNormalizada;
  if (categoriaId === 1) return "sanguches";
  if (categoriaId === 2) return "bebidas";
  if (categoriaId === 3) return "acompanamientos";
  if (categoriaId === 4) return "combos";
  if (categoriaId === 5) return "postres";
  if (categoriaId === 6) return "promociones";

  return "sanguches";
}

function resolverImagenProducto(producto, categoria) {
  const nombreNormalizado = normalizarTexto(producto.nombre);

  if (nombreNormalizado.includes("chicharron")) return IMAGENES_FALLBACK.chicharron;
  if (nombreNormalizado.includes("pavo")) return IMAGENES_FALLBACK.pavo;
  if (nombreNormalizado.includes(" de asado") || nombreNormalizado.startsWith("asado")) {
    return "assets/img/productos/sanguches/asado.webp";
  }
  if (nombreNormalizado.includes("mixto")) return "assets/img/productos/sanguches/mixto.webp";
  if (nombreNormalizado.includes("pollo")) return "assets/img/productos/sanguches/pollo.webp";
  if (nombreNormalizado.includes("hamburguesa")) return "assets/img/productos/sanguches/hamburguesa.webp";
  if (nombreNormalizado.includes("chicha")) return IMAGENES_FALLBACK.chicha;
  if (nombreNormalizado.includes("cafe")) return IMAGENES_FALLBACK.cafe;
  if (nombreNormalizado.includes("emoliente")) return IMAGENES_FALLBACK.emoliente;
  if (nombreNormalizado.includes("gaseosa")) return IMAGENES_FALLBACK.gaseosa;
  if (nombreNormalizado.includes("limonada")) return IMAGENES_FALLBACK.limonada;
  if (nombreNormalizado.includes("camote")) return IMAGENES_FALLBACK.camote;
  if (nombreNormalizado.includes("papas") && nombreNormalizado.includes("familiar")) {
    return IMAGENES_FALLBACK.papasFamiliares;
  }
  if (nombreNormalizado.includes("papas")) return IMAGENES_FALLBACK.papasPersonales;
  if (nombreNormalizado.includes("salsa criolla")) return IMAGENES_FALLBACK.salsaCriolla;
  if (nombreNormalizado.includes("combo") && nombreNormalizado.includes("familiar")) {
    return IMAGENES_FALLBACK.comboFamiliar;
  }
  if (nombreNormalizado.includes("combo") && nombreNormalizado.includes("full")) {
    return IMAGENES_FALLBACK.comboFull;
  }
  if (nombreNormalizado.includes("combo")) return IMAGENES_FALLBACK.comboCriollo;
  if (nombreNormalizado.includes("alfajor")) return IMAGENES_FALLBACK.alfajor;
  if (nombreNormalizado.includes("mazamorra")) return IMAGENES_FALLBACK.mazamorra;

  if (producto.imagenUrl) return producto.imagenUrl;

  return IMAGENES_FALLBACK[categoria] || IMAGENES_FALLBACK.sanguches;
}

function adaptarProductoApi(producto, categoriasPorId) {
  const categoria = obtenerCategoriaPorId(producto.categoriaId, categoriasPorId);

  return {
    id: producto.productoId,
    nombre: producto.nombre,
    categoria,
    descripcion: producto.descripcion,
    precio: producto.precio,
    pedido: producto.destacado ? 90 : 70,
    imagen: resolverImagenProducto(producto, categoria)
  };
}

async function obtenerJsonApi(ruta) {
  if (!API_BASE_URL) {
    throw new Error("No se encontro la configuracion de la API publica.");
  }

  const respuesta = await fetch(`${API_BASE_URL}${ruta}`);

  if (!respuesta.ok) {
    throw new Error(`La API respondio ${respuesta.status} en ${ruta}`);
  }

  return respuesta.json();
}

async function cargarProductosDesdeApi() {
  const [productosApi, categoriasApi] = await Promise.all([
    obtenerJsonApi("/productos"),
    obtenerJsonApi("/categorias")
  ]);

  const categoriasPorId = categoriasApi.reduce((mapa, categoria) => {
    mapa[categoria.categoriaId] = normalizarCategoriaApi(categoria.nombre);
    return mapa;
  }, {});

  return productosApi
    .filter(
      (producto) =>
        producto.estado !== false && Number(producto.productoId) <= PRODUCTO_ID_MAX_CATALOGO
    )
    .map((producto) => adaptarProductoApi(producto, categoriasPorId));
}

function actualizarMetricasHero() {
  if (totalProductosHero) {
    totalProductosHero.textContent = productosCatalogo.length;
  }

  if (totalCategoriasHero) {
    const categoriasUnicas = new Set(productosCatalogo.map((producto) => producto.categoria));
    totalCategoriasHero.textContent = categoriasUnicas.size;
  }
}

function obtenerTotalPaginas(listaProductos) {
  return Math.ceil(listaProductos.length / PRODUCTOS_POR_PAGINA);
}

function obtenerProductosPagina(listaProductos) {
  const inicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA;
  const fin = inicio + PRODUCTOS_POR_PAGINA;

  return listaProductos.slice(inicio, fin);
}

function obtenerEtiquetaCategoria(categoria) {
  if (categoria === "todos") return "productos";

  const botonActivo = document.querySelector(`[data-categoria="${categoria}"]`);

  if (!botonActivo) return categoria;

  return (
    botonActivo.querySelector(".categoria-label")?.textContent.trim().toLowerCase() || categoria
  );
}

function obtenerEtiquetaPopularidad(pedido) {
  if (Number(pedido) >= 90) return "Más pedido";
  if (Number(pedido) >= 80) return "Favorito criollo";
  return "Para acompañar";
}

function actualizarEstadoProductos(totalProductos) {
  if (!estadoProductos) return;

  const etiquetaCategoria = obtenerEtiquetaCategoria(categoriaActual);
  const busqueda = textoBusqueda.trim();
  const totalPaginas = obtenerTotalPaginas(productosActuales);

  if (totalProductos === 0) {
    estadoProductos.textContent = busqueda
      ? `No encontramos resultados para "${busqueda}" en ${etiquetaCategoria}.`
      : `No hay productos disponibles en ${etiquetaCategoria}.`;
    return;
  }

  const rangoInicio = (paginaActual - 1) * PRODUCTOS_POR_PAGINA + 1;
  const rangoFin = Math.min(paginaActual * PRODUCTOS_POR_PAGINA, totalProductos);
  const detalleBusqueda = busqueda ? ` con la búsqueda "${busqueda}"` : "";

  estadoProductos.textContent =
    `Mostrando ${rangoInicio}-${rangoFin} de ${totalProductos} ${etiquetaCategoria}${detalleBusqueda}.` +
    (totalPaginas > 1 ? ` Página ${paginaActual} de ${totalPaginas}.` : "");
}

function desplazarAResultados() {
  if (!seccionProductos) return;

  seccionProductos.scrollIntoView({ behavior: "smooth", block: "start" });
}

function animarResultados() {
  if (!contenedorProductos) return;

  contenedorProductos.classList.remove("is-refreshing");
  window.requestAnimationFrame(() => {
    contenedorProductos.classList.add("is-refreshing");
  });
}

function contarPorCategoria(categoria) {
  if (categoria === "todos") return productosCatalogo.length;

  return productosCatalogo.filter(
    (producto) => normalizarTexto(producto.categoria) === normalizarTexto(categoria)
  ).length;
}

function actualizarConteosCategorias() {
  botonesCategorias.forEach((boton) => {
    const contador = boton.querySelector(".categoria-count");
    if (!contador) return;

    contador.textContent = contarPorCategoria(boton.dataset.categoria);
  });
}

function actualizarBotonLimpiar() {
  if (!btnLimpiarFiltros) return;

  const hayCategoriaFiltrada = categoriaActual !== "todos";
  const hayBusqueda = textoBusqueda.trim() !== "";

  btnLimpiarFiltros.hidden = !hayCategoriaFiltrada && !hayBusqueda;
}

function activarCategoria(categoria) {
  botonesCategorias.forEach((boton) => {
    const esActivo = boton.dataset.categoria === categoria;

    boton.classList.toggle("activo", esActivo);
    boton.setAttribute("aria-pressed", String(esActivo));
  });

  categoriaActual = categoria;
}

function limpiarFiltros() {
  textoBusqueda = "";

  if (buscadorInput) {
    buscadorInput.value = "";
    buscadorInput.focus();
  }

  activarCategoria("todos");
  filtrarProductos();
}

/* =========================
   CREAR CARD PRODUCTO
========================= */

function crearCardProducto(producto) {
  const articulo = document.createElement("article");
  articulo.className = "card card--product card--interactive";
  articulo.setAttribute("aria-label", `Producto ${producto.nombre}`);

  const media = document.createElement("div");
  media.className = "card__media";

  const imagen = document.createElement("img");
  imagen.className = "card__image";
  imagen.src = producto.imagen;
  imagen.alt = producto.nombre;
  imagen.loading = "lazy";

  const badge = document.createElement("span");
  badge.className = "card__badge";
  badge.textContent = producto.categoria;

  const body = document.createElement("div");
  body.className = "card__body";

  const popularidad = document.createElement("span");
  popularidad.className = "card__popularidad";

  const popularidadIcono = document.createElement("span");
  popularidadIcono.className = "material-symbols-rounded";
  popularidadIcono.setAttribute("aria-hidden", "true");
  popularidadIcono.textContent = "local_fire_department";

  const popularidadTexto = document.createElement("span");
  popularidadTexto.textContent = obtenerEtiquetaPopularidad(producto.pedido);

  const titulo = document.createElement("h3");
  titulo.className = "card__title";
  titulo.textContent = producto.nombre;

  const descripcion = document.createElement("p");
  descripcion.className = "card__text";
  descripcion.textContent = producto.descripcion;

  const actions = document.createElement("div");
  actions.className = "card__actions";

  const precio = document.createElement("span");
  precio.className = "card__price";
  precio.textContent = formatearPrecio(producto.precio);

  const accion = document.createElement("button");
  accion.className = "card__action card__action--button";
  accion.type = "button";
  accion.textContent = "Agregar";
  accion.setAttribute("aria-label", `Agregar ${producto.nombre} a la solicitud`);
  accion.addEventListener("click", () => agregarProductoASolicitud(producto));

  media.append(imagen, badge);
  popularidad.append(popularidadIcono, popularidadTexto);
  actions.append(precio, accion);
  body.append(popularidad, titulo, descripcion, actions);
  articulo.append(media, body);

  return articulo;
}

/* =========================
   RENDER PRODUCTOS
========================= */

function renderizarProductos(listaProductos) {
  if (!contenedorProductos) return;

  contenedorProductos.innerHTML = "";
  actualizarEstadoProductos(listaProductos.length);

  if (listaProductos.length === 0) {
    const mensaje = document.createElement("p");
    mensaje.className = "sin-productos";
    mensaje.textContent = "Prueba con otra categoría o limpia la búsqueda para ver toda la carta.";
    contenedorProductos.append(mensaje);
    renderizarPaginacion([]);
    return;
  }

  const productosPagina = obtenerProductosPagina(listaProductos);
  const fragmento = document.createDocumentFragment();

  productosPagina.forEach((producto) => {
    fragmento.append(crearCardProducto(producto));
  });

  contenedorProductos.append(fragmento);
  renderizarPaginacion(listaProductos);
  animarResultados();
}

/* =========================
   PAGINACIÓN
========================= */

function renderizarPaginacion(listaProductos) {
  if (!contenedorPaginacion || !btnAnterior || !btnSiguiente) return;

  const totalPaginas = obtenerTotalPaginas(listaProductos);

  contenedorPaginacion.innerHTML = "";

  if (totalPaginas <= 1) {
    btnAnterior.disabled = true;
    btnSiguiente.disabled = true;
    btnAnterior.setAttribute("aria-disabled", "true");
    btnSiguiente.setAttribute("aria-disabled", "true");
    return;
  }

  btnAnterior.disabled = paginaActual === 1;
  btnSiguiente.disabled = paginaActual === totalPaginas;
  btnAnterior.setAttribute("aria-disabled", String(btnAnterior.disabled));
  btnSiguiente.setAttribute("aria-disabled", String(btnSiguiente.disabled));

  for (let numeroPagina = 1; numeroPagina <= totalPaginas; numeroPagina++) {
    const botonPagina = document.createElement("button");
    botonPagina.type = "button";
    botonPagina.className = "paginacion__numero";
    botonPagina.textContent = numeroPagina;
    botonPagina.setAttribute("aria-label", `Ir a la página ${numeroPagina}`);

    if (numeroPagina === paginaActual) {
      botonPagina.classList.add("paginacion__numero--activo");
      botonPagina.setAttribute("aria-current", "page");
    }

    botonPagina.addEventListener("click", () => {
      paginaActual = numeroPagina;
      renderizarProductos(productosActuales);
      contenedorProductos.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    contenedorPaginacion.append(botonPagina);
  }
}

function irPaginaAnterior() {
  if (paginaActual > 1) {
    paginaActual--;
    renderizarProductos(productosActuales);
    contenedorProductos.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function irPaginaSiguiente() {
  const totalPaginas = obtenerTotalPaginas(productosActuales);

  if (paginaActual < totalPaginas) {
    paginaActual++;
    renderizarProductos(productosActuales);
    contenedorProductos.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/* =========================
   FILTRAR PRODUCTOS
========================= */

function filtrarProductos() {
  if (!Array.isArray(productosCatalogo)) {
    productosActuales = [];
    renderizarProductos(productosActuales);
    return;
  }

  const busquedaNormalizada = normalizarTexto(textoBusqueda);
  let productosFiltrados = [...productosCatalogo];

  if (categoriaActual !== "todos") {
    productosFiltrados = productosFiltrados.filter(
      (producto) => normalizarTexto(producto.categoria) === normalizarTexto(categoriaActual)
    );
  }

  if (busquedaNormalizada !== "") {
    productosFiltrados = productosFiltrados.filter((producto) => {
      const textoProducto = normalizarTexto(
        `${producto.nombre} ${producto.descripcion} ${producto.categoria}`
      );

      return textoProducto.includes(busquedaNormalizada);
    });
  }

  productosActuales = productosFiltrados;
  paginaActual = 1;

  renderizarProductos(productosActuales);
  actualizarBotonLimpiar();
}

/* =========================
   EVENTOS
========================= */

botonesCategorias.forEach((boton) => {
  boton.addEventListener("click", () => {
    activarCategoria(boton.dataset.categoria);
    filtrarProductos();
  });
});

if (buscadorInput) {
  buscadorInput.addEventListener("input", (event) => {
    textoBusqueda = event.target.value;
    filtrarProductos();
  });
}

if (btnLimpiarFiltros) {
  btnLimpiarFiltros.addEventListener("click", limpiarFiltros);
}

if (btnAnterior) {
  btnAnterior.addEventListener("click", irPaginaAnterior);
}

if (btnSiguiente) {
  btnSiguiente.addEventListener("click", irPaginaSiguiente);
}

/* =========================
   CARGA INICIAL
========================= */

botonesCategorias.forEach((boton) => {
  boton.setAttribute("aria-pressed", String(boton.classList.contains("activo")));
});

async function inicializarCarta() {
  if (estadoProductos) {
    estadoProductos.textContent = "Cargando productos desde el backend...";
  }

  try {
    productosCatalogo = await cargarProductosDesdeApi();
  } catch (error) {
    console.error("No se pudo cargar productos desde la API publica.", error);
    productosCatalogo = [];
    actualizarConteosCategorias();

    if (estadoProductos) {
      estadoProductos.textContent =
        "No se pudo cargar la carta desde el backend publico. Intenta nuevamente en unos segundos.";
    }

    renderizarPaginacion([]);
    return;
  }

  actualizarMetricasHero();
  actualizarConteosCategorias();
  productosActuales = productosCatalogo;
  renderizarProductos(productosActuales);
}

inicializarCarta();
actualizarMiniSolicitud();
window.addEventListener("la-lucha:solicitud-actualizada", actualizarMiniSolicitud);
