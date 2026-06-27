/* =========================
   PEDIDO
========================= */

const pedidoForm = document.getElementById("pedido-form");
const tipoPedidoSelect = document.getElementById("tipo-pedido");
const productoPedidoInput = document.getElementById("producto-pedido");
const origenPedidoInput = document.getElementById("origen-pedido");
const itemPedidoInput = document.getElementById("item-pedido");
const mensajeTextarea = document.getElementById("mensaje");
const feedbackPedido = document.getElementById("pedido-feedback");
const nombreInput = document.getElementById("nombre");
const telefonoInput = document.getElementById("telefono");
const correoInput = document.getElementById("correo");
const telefonoError = document.getElementById("telefono-error");
const correoError = document.getElementById("correo-error");
const cantidadInput = document.getElementById("cantidad");
const modalidadPedidoSelect = document.getElementById("modalidad-pedido");
const localRecojoSelect = document.getElementById("local-recojo");
const horaRecojoInput = document.getElementById("hora-recojo");
const horaRecojoError = document.getElementById("hora-recojo-error");
const direccionDeliveryInput = document.getElementById("direccion-delivery");
const metodoPagoSelect = document.getElementById("metodo-pago");
const grupoLocalRecojo = document.getElementById("grupo-local-recojo");
const grupoHoraRecojo = document.getElementById("grupo-hora-recojo");
const grupoDireccionDelivery = document.getElementById("grupo-direccion-delivery");

const pedidoPrecioPreview = document.getElementById("pedido-precio-preview");
const pedidoIgvPreview = document.getElementById("pedido-igv-preview");
const pedidoTotalPreview = document.getElementById("pedido-total-preview");
const pedidoLista = document.getElementById("pedido-lista");
const pedidoTipoPreview = document.getElementById("pedido-tipo-preview");
const pedidoNombrePreview = document.getElementById("pedido-nombre-preview");
const pedidoResumenTexto = document.getElementById("pedido-resumen-texto");
const solicitudStore = window.LaLuchaSolicitud;

const API_BASE_URL = window.LA_LUCHA_API_CONFIG?.baseUrl;
const IMAGEN_FALLBACK = "assets/img/productos/sanguches/chicharron.webp";
const IMAGENES_PRODUCTO = {
  chicharron: "assets/img/productos/sanguches/chicharron.webp",
  pavo: "assets/img/productos/sanguches/pavo.webp",
  asado: "assets/img/productos/sanguches/asado.webp",
  mixto: "assets/img/productos/sanguches/mixto.webp",
  pollo: "assets/img/productos/sanguches/pollo.webp",
  hamburguesa: "assets/img/productos/sanguches/hamburguesa.webp",
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
  mazamorra: "assets/img/productos/postres/mazamorra-morada.webp"
};
const HORA_RECOJO_MIN = "08:00";
const HORA_RECOJO_MAX = "22:00";

/* =========================
   UTILIDADES
========================= */

function obtenerParametroUrl(nombreParametro) {
  const parametros = new URLSearchParams(window.location.search);
  return parametros.get(nombreParametro);
}

function limpiarTexto(texto) {
  return typeof texto === "string" ? texto.trim() : "";
}

function normalizarTexto(texto) {
  return String(texto)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatearPrecio(precio) {
  const precioNumerico = Number(precio);

  if (!Number.isFinite(precioNumerico)) return "S/ 0.00";

  return `S/ ${precioNumerico.toFixed(2)}`;
}

function mostrarFeedback(mensaje, tipo = "exito") {
  if (!feedbackPedido) return;

  feedbackPedido.textContent = mensaje;
  feedbackPedido.dataset.estado = tipo;
}

function validarNombre(nombre) {
  return limpiarTexto(nombre).length >= 3;
}

function validarTelefonoPeru(telefono) {
  return /^9\d{8}$/.test(limpiarTexto(telefono));
}

function validarCorreo(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(limpiarTexto(correo));
}

function actualizarEstadoCampo(input, errorElemento, mensajeError) {
  if (!input || !errorElemento) return true;

  const valor = limpiarTexto(input.value);
  const esCampoVacio = valor === "";
  const esValido = esCampoVacio || mensajeError === "";

  input.classList.toggle("is-invalid", !esValido);
  input.setAttribute("aria-invalid", String(!esValido));
  errorElemento.textContent = esValido ? "" : mensajeError;

  return esValido;
}

function mostrarErrorCampo(input, errorElemento, mensajeError) {
  if (!input || !errorElemento) return false;

  input.classList.add("is-invalid");
  input.setAttribute("aria-invalid", "true");
  errorElemento.textContent = mensajeError;

  return false;
}

function validarTelefonoEnVivo() {
  if (!telefonoInput) return true;

  const valor = limpiarTexto(telefonoInput.value);
  const mensaje =
    valor === "" || validarTelefonoPeru(valor)
      ? ""
      : "Celular inválido. Usa 9 dígitos y empieza con 9.";

  return actualizarEstadoCampo(telefonoInput, telefonoError, mensaje);
}

function validarCorreoEnVivo() {
  if (!correoInput) return true;

  const valor = limpiarTexto(correoInput.value);
  const mensaje = valor === "" || validarCorreo(valor) ? "" : "Correo inválido. Revisa el @ y el dominio.";

  return actualizarEstadoCampo(correoInput, correoError, mensaje);
}

function actualizarModalidadPedido() {
  const modalidad = modalidadPedidoSelect?.value || "";
  const esRecojo = modalidad === "recojo";
  const esDelivery = modalidad === "delivery";

  if (grupoLocalRecojo) {
    grupoLocalRecojo.hidden = !esRecojo;
  }

  if (grupoHoraRecojo) {
    grupoHoraRecojo.hidden = !esRecojo;
  }

  if (grupoDireccionDelivery) {
    grupoDireccionDelivery.hidden = !esDelivery;
  }

  if (localRecojoSelect) {
    localRecojoSelect.required = esRecojo;
    if (!esRecojo) localRecojoSelect.value = "";
  }

  if (horaRecojoInput) {
    horaRecojoInput.required = esRecojo;
    if (!esRecojo) {
      horaRecojoInput.value = "";
      actualizarEstadoCampo(horaRecojoInput, horaRecojoError, "");
    }
  }

  if (direccionDeliveryInput) {
    direccionDeliveryInput.required = esDelivery;
    if (!esDelivery) direccionDeliveryInput.value = "";
  }
}

function validarHoraRecojo(hora) {
  return hora >= HORA_RECOJO_MIN && hora <= HORA_RECOJO_MAX;
}

function validarHoraRecojoEnVivo() {
  if (!horaRecojoInput) return true;

  const hora = limpiarTexto(horaRecojoInput.value);

  if (!hora) {
    return actualizarEstadoCampo(horaRecojoInput, horaRecojoError, "");
  }

  if (!validarHoraRecojo(hora)) {
    horaRecojoInput.value = "";
    return mostrarErrorCampo(
      horaRecojoInput,
      horaRecojoError,
      "Ingresa una hora entre 08:00 y 22:00."
    );
  }

  return actualizarEstadoCampo(horaRecojoInput, horaRecojoError, "");
}

function resolverImagenProducto(producto) {
  const nombreNormalizado = normalizarTexto(producto?.nombre || "");

  if (nombreNormalizado.includes("chicharron")) return IMAGENES_PRODUCTO.chicharron;
  if (nombreNormalizado.includes("pavo")) return IMAGENES_PRODUCTO.pavo;
  if (nombreNormalizado.includes(" de asado") || nombreNormalizado.startsWith("asado")) {
    return IMAGENES_PRODUCTO.asado;
  }
  if (nombreNormalizado.includes("mixto")) return IMAGENES_PRODUCTO.mixto;
  if (nombreNormalizado.includes("pollo")) return IMAGENES_PRODUCTO.pollo;
  if (nombreNormalizado.includes("hamburguesa")) return IMAGENES_PRODUCTO.hamburguesa;
  if (nombreNormalizado.includes("chicha")) return IMAGENES_PRODUCTO.chicha;
  if (nombreNormalizado.includes("cafe")) return IMAGENES_PRODUCTO.cafe;
  if (nombreNormalizado.includes("emoliente")) return IMAGENES_PRODUCTO.emoliente;
  if (nombreNormalizado.includes("gaseosa")) return IMAGENES_PRODUCTO.gaseosa;
  if (nombreNormalizado.includes("limonada")) return IMAGENES_PRODUCTO.limonada;
  if (nombreNormalizado.includes("camote")) return IMAGENES_PRODUCTO.camote;
  if (nombreNormalizado.includes("papas") && nombreNormalizado.includes("familiar")) {
    return IMAGENES_PRODUCTO.papasFamiliares;
  }
  if (nombreNormalizado.includes("papas")) return IMAGENES_PRODUCTO.papasPersonales;
  if (nombreNormalizado.includes("salsa criolla")) return IMAGENES_PRODUCTO.salsaCriolla;
  if (nombreNormalizado.includes("combo") && nombreNormalizado.includes("familiar")) {
    return IMAGENES_PRODUCTO.comboFamiliar;
  }
  if (nombreNormalizado.includes("combo") && nombreNormalizado.includes("full")) {
    return IMAGENES_PRODUCTO.comboFull;
  }
  if (nombreNormalizado.includes("combo")) return IMAGENES_PRODUCTO.comboCriollo;
  if (nombreNormalizado.includes("alfajor")) return IMAGENES_PRODUCTO.alfajor;
  if (nombreNormalizado.includes("mazamorra")) return IMAGENES_PRODUCTO.mazamorra;

  return limpiarTexto(producto?.imagen || producto?.imagenUrl) || IMAGEN_FALLBACK;
}

function sincronizarCamposSolicitud(items) {
  if (!solicitudStore) return;

  const { cantidadTotal } = solicitudStore.calcularTotales(items);
  const resumenItems = items
    .map((item) => `${item.cantidad} x ${item.nombre} - ${formatearPrecio(item.precio * item.cantidad)}`)
    .join("\n");

  if (tipoPedidoSelect) {
    tipoPedidoSelect.value = items.length ? "producto" : "";
  }

  if (productoPedidoInput) {
    productoPedidoInput.value = resumenItems;
  }

  if (cantidadInput) {
    cantidadInput.value = Math.max(1, cantidadTotal);
  }

  if (origenPedidoInput) {
    origenPedidoInput.value = "carta";
  }

  if (itemPedidoInput) {
    itemPedidoInput.value = JSON.stringify(items);
  }
}

async function obtenerProductoPorId(productoId) {
  if (!API_BASE_URL) {
    throw new Error("No se encontro la configuracion de la API publica.");
  }

  const respuesta = await fetch(`${API_BASE_URL}/productos/${productoId}`);

  if (!respuesta.ok) {
    throw new Error(`La API respondio ${respuesta.status} al buscar el producto.`);
  }

  return respuesta.json();
}

/* =========================
   RENDER DE SOLICITUD
========================= */

function crearFilaSolicitud(item) {
  const fila = document.createElement("article");
  fila.className = "pedido-item";

  const subtotal = Number(item.precio) * Number(item.cantidad);

  const imagen = document.createElement("img");
  imagen.className = "pedido-item__imagen";
  imagen.src = resolverImagenProducto(item);
  imagen.alt = `Imagen de ${item.nombre}`;
  imagen.onerror = () => {
    imagen.src = IMAGEN_FALLBACK;
  };

  const contenido = document.createElement("div");
  contenido.className = "pedido-item__contenido";

  const titulo = document.createElement("strong");
  titulo.className = "pedido-item__nombre";
  titulo.textContent = item.nombre;

  const precio = document.createElement("span");
  precio.className = "pedido-item__precio";
  precio.textContent = `${formatearPrecio(item.precio)} c/u`;

  const acciones = document.createElement("div");
  acciones.className = "pedido-item__acciones";

  const cantidad = document.createElement("input");
  cantidad.className = "pedido-item__cantidad";
  cantidad.type = "number";
  cantidad.min = "1";
  cantidad.value = item.cantidad;
  cantidad.setAttribute("aria-label", `Cantidad de ${item.nombre}`);
  cantidad.addEventListener("input", () => {
    solicitudStore.actualizarCantidad(item.id, item.tipo, cantidad.value);
    renderizarSolicitud();
  });

  const quitar = document.createElement("button");
  quitar.className = "pedido-item__quitar";
  quitar.type = "button";
  quitar.textContent = "Quitar";
  quitar.setAttribute("aria-label", `Quitar ${item.nombre} de la solicitud`);
  quitar.addEventListener("click", () => {
    solicitudStore.quitarItem(item.id, item.tipo);
    renderizarSolicitud();
  });

  const subtotalElemento = document.createElement("span");
  subtotalElemento.className = "pedido-item__subtotal";
  subtotalElemento.textContent = formatearPrecio(subtotal);

  acciones.append(cantidad, quitar, subtotalElemento);
  contenido.append(titulo, precio, acciones);
  fila.append(imagen, contenido);

  return fila;
}

function renderizarSolicitud() {
  if (!solicitudStore || !pedidoLista) return;

  const items = solicitudStore.obtenerSolicitud();
  const { cantidadTotal, total, igvIncluido } = solicitudStore.calcularTotales(items);

  pedidoLista.innerHTML = "";

  if (!items.length) {
    const mensajeVacio = document.createElement("p");
    mensajeVacio.className = "pedido-lista__vacio";
    mensajeVacio.textContent = "Agrega productos desde la carta para ver el total de tu pedido.";
    pedidoLista.append(mensajeVacio);
  } else {
    items.forEach((item) => pedidoLista.append(crearFilaSolicitud(item)));
  }

  if (pedidoTipoPreview) {
    pedidoTipoPreview.textContent = items.length ? "Pedido de productos" : "Pedido";
  }

  if (pedidoNombrePreview) {
    pedidoNombrePreview.textContent =
      cantidadTotal > 0
        ? `${cantidadTotal} ${cantidadTotal === 1 ? "producto" : "productos"} seleccionados`
        : "Pedido vacío";
  }

  if (pedidoResumenTexto) {
    pedidoResumenTexto.textContent = items.length
      ? "Puedes ajustar cantidades o seguir agregando productos desde la carta."
      : "Agrega productos desde la carta para iniciar tu pedido.";
  }

  if (pedidoPrecioPreview) {
    pedidoPrecioPreview.textContent = `Subtotal productos: ${formatearPrecio(total)}`;
  }

  if (pedidoIgvPreview) {
    pedidoIgvPreview.textContent = `IGV incluido (18%): ${formatearPrecio(igvIncluido)}`;
  }

  if (pedidoTotalPreview) {
    pedidoTotalPreview.textContent = `Total: ${formatearPrecio(total)}`;
  }

  sincronizarCamposSolicitud(items);
}

/* =========================
   PRECARGA DESDE URL
========================= */

async function prepararPedidoDesdeUrl() {
  if (!solicitudStore) return;

  const productoId = limpiarTexto(obtenerParametroUrl("productoId"));
  const producto = limpiarTexto(obtenerParametroUrl("producto"));
  const promocion = limpiarTexto(obtenerParametroUrl("promocion"));

  if (productoId) {
    try {
      const productoApi = await obtenerProductoPorId(productoId);
      const nombreProducto = limpiarTexto(productoApi.nombre);

      solicitudStore.agregarItem({
        id: productoApi.productoId || productoId,
        tipo: "producto",
        nombre: nombreProducto,
        precio: productoApi.precio,
        cantidad: 1,
        imagen: resolverImagenProducto(productoApi)
      });

      if (mensajeTextarea && !mensajeTextarea.value) {
        mensajeTextarea.value = `Hola, quiero consultar la disponibilidad del producto: ${nombreProducto}.`;
      }
    } catch (error) {
      console.error("No se pudo cargar el producto seleccionado desde la API.", error);
      mostrarFeedback(
        "No se pudo cargar el producto seleccionado. Puedes agregarlo nuevamente desde la carta.",
        "error"
      );
    }

    renderizarSolicitud();
    return;
  }

  if (producto || promocion) {
    const tipo = producto ? "producto" : "promocion";
    const nombre = producto || promocion;

    solicitudStore.agregarItem({
      id: nombre,
      tipo,
      nombre,
      precio: 0,
      cantidad: 1,
      imagen: IMAGEN_FALLBACK
    });

    if (mensajeTextarea && !mensajeTextarea.value) {
      mensajeTextarea.value = `Hola, quiero consultar la disponibilidad de ${nombre}.`;
    }
  }

  renderizarSolicitud();
}

/* =========================
   ENVIO TEMPORAL
========================= */

function obtenerDatosPedido() {
  const items = solicitudStore ? solicitudStore.obtenerSolicitud() : [];
  const { total, igvIncluido, cantidadTotal } = solicitudStore
    ? solicitudStore.calcularTotales(items)
    : { total: 0, igvIncluido: 0, cantidadTotal: 0 };

  return {
    nombre: limpiarTexto(nombreInput?.value),
    telefono: limpiarTexto(telefonoInput?.value),
    correo: limpiarTexto(correoInput?.value),
    tipoPedido: tipoPedidoSelect?.value || "general",
    itemPedido: limpiarTexto(productoPedidoInput?.value),
    cantidad: cantidadTotal,
    items,
    total,
    igvIncluido,
    modalidadPedido: modalidadPedidoSelect?.value || "",
    localRecojo: limpiarTexto(localRecojoSelect?.value),
    horaRecojo: limpiarTexto(horaRecojoInput?.value),
    direccionDelivery: limpiarTexto(direccionDeliveryInput?.value),
    metodoPago: metodoPagoSelect?.value || "",
    mensaje: limpiarTexto(mensajeTextarea?.value),
    origenPedido: origenPedidoInput?.value || "general"
  };
}

function validarDatosPedido(datosPedido) {
  if (!datosPedido.items.length || !Number.isInteger(datosPedido.cantidad) || datosPedido.cantidad <= 0) {
    return "Agrega al menos un producto desde la carta.";
  }

  if (!datosPedido.modalidadPedido) {
    return "Selecciona si deseas recojo en tienda o delivery.";
  }

  if (datosPedido.modalidadPedido === "recojo" && !datosPedido.localRecojo) {
    return "Selecciona la tienda donde recogerás tu pedido.";
  }

  if (datosPedido.modalidadPedido === "recojo" && !datosPedido.horaRecojo) {
    actualizarEstadoCampo(horaRecojoInput, horaRecojoError, "Selecciona una hora de recojo.");
    return "Selecciona una hora de recojo.";
  }

  if (datosPedido.modalidadPedido === "recojo" && !validarHoraRecojo(datosPedido.horaRecojo)) {
    validarHoraRecojoEnVivo();
    return "Ingresa una hora adecuada para el recojo.";
  }

  if (datosPedido.modalidadPedido === "delivery" && datosPedido.direccionDelivery.length < 8) {
    return "Ingresa una dirección de entrega válida.";
  }

  if (!datosPedido.metodoPago) {
    return "Selecciona tu método de pago preferido.";
  }

  if (!validarNombre(datosPedido.nombre)) {
    return "Ingresa tu nombre completo.";
  }

  if (!validarTelefonoPeru(datosPedido.telefono)) {
    validarTelefonoEnVivo();
    return "Celular inválido. Usa 9 dígitos y empieza con 9.";
  }

  if (!validarCorreo(datosPedido.correo)) {
    validarCorreoEnVivo();
    return "Correo inválido. Revisa el @ y el dominio.";
  }

  return "";
}

async function enviarSolicitudPedido(datosPedido) {
  return {
    ok: true,
    modo: "frontend-preparado",
    datos: datosPedido
  };
}

function obtenerMensajeConfirmacion(datosPedido) {
  const total = formatearPrecio(datosPedido.total);

  if (datosPedido.modalidadPedido === "delivery") {
    return `Gracias por confiar en La Lucha. Recibimos tu pedido para delivery y pronto coordinaremos la entrega. Total: ${total}.`;
  }

  return `Gracias por elegir La Lucha. Recibimos tu pedido para recojo en tienda. Te atenderemos por orden de llegada. Total: ${total}.`;
}

async function manejarEnvioPedido(event) {
  event.preventDefault();

  const datosPedido = obtenerDatosPedido();

  const errorValidacion = validarDatosPedido(datosPedido);

  if (errorValidacion) {
    mostrarFeedback(errorValidacion, "error");
    return;
  }

  const resultado = await enviarSolicitudPedido(datosPedido);

  if (!resultado.ok) {
    mostrarFeedback("No se pudo registrar la solicitud. Intenta nuevamente.", "error");
    return;
  }

  mostrarFeedback(obtenerMensajeConfirmacion(datosPedido), "exito");
}

/* =========================
   INICIALIZACION
========================= */

if (pedidoForm && nombreInput && telefonoInput && correoInput && solicitudStore) {
  prepararPedidoDesdeUrl();
  renderizarSolicitud();
  actualizarModalidadPedido();

  modalidadPedidoSelect?.addEventListener("change", actualizarModalidadPedido);
  horaRecojoInput?.addEventListener("input", validarHoraRecojoEnVivo);
  horaRecojoInput?.addEventListener("change", validarHoraRecojoEnVivo);
  telefonoInput.addEventListener("input", validarTelefonoEnVivo);
  correoInput.addEventListener("input", validarCorreoEnVivo);
  pedidoForm.addEventListener("submit", manejarEnvioPedido);
  window.addEventListener("la-lucha:solicitud-actualizada", renderizarSolicitud);
}
