/* =========================
   SOLICITUD COMPARTIDA
========================= */

(function iniciarSolicitudStore() {
  const STORAGE_KEY = "la-lucha-solicitud";
  const IGV_INCLUIDO_FACTOR = 18 / 118;

  function normalizarItem(item) {
    const id = String(item.id || item.nombre || Date.now());
    const tipo = item.tipo || "producto";
    const precio = Number(item.precio);
    const cantidad = Math.max(1, Math.trunc(Number(item.cantidad || 1)));

    return {
      id,
      tipo,
      nombre: String(item.nombre || "Producto sin nombre").trim(),
      precio: Number.isFinite(precio) ? precio : 0,
      cantidad,
      imagen: String(item.imagen || item.imagenUrl || "").trim()
    };
  }

  function obtenerSolicitud() {
    try {
      const datos = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(datos) ? datos.map(normalizarItem).filter((item) => item.nombre) : [];
    } catch (error) {
      console.warn("No se pudo leer la solicitud guardada.", error);
      return [];
    }
  }

  function guardarSolicitud(items) {
    const itemsNormalizados = Array.isArray(items) ? items.map(normalizarItem) : [];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsNormalizados));
    window.dispatchEvent(new CustomEvent("la-lucha:solicitud-actualizada"));
    return itemsNormalizados;
  }

  function agregarItem(item) {
    const nuevoItem = normalizarItem(item);
    const solicitud = obtenerSolicitud();
    const existente = solicitud.find(
      (itemSolicitud) => itemSolicitud.id === nuevoItem.id && itemSolicitud.tipo === nuevoItem.tipo
    );

    if (existente) {
      existente.cantidad += nuevoItem.cantidad;
      return guardarSolicitud(solicitud);
    }

    return guardarSolicitud([...solicitud, nuevoItem]);
  }

  function actualizarCantidad(id, tipo, cantidad) {
    const cantidadNormalizada = Math.trunc(Number(cantidad));
    const solicitud = obtenerSolicitud();

    if (!Number.isFinite(cantidadNormalizada) || cantidadNormalizada < 1) {
      return solicitud;
    }

    return guardarSolicitud(
      solicitud.map((item) =>
        item.id === String(id) && item.tipo === tipo ? { ...item, cantidad: cantidadNormalizada } : item
      )
    );
  }

  function quitarItem(id, tipo) {
    return guardarSolicitud(
      obtenerSolicitud().filter((item) => item.id !== String(id) || item.tipo !== tipo)
    );
  }

  function limpiarSolicitud() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("la-lucha:solicitud-actualizada"));
    return [];
  }

  function calcularTotales(items = obtenerSolicitud()) {
    const total = items.reduce((suma, item) => suma + Number(item.precio) * Number(item.cantidad), 0);
    const igvIncluido = total * IGV_INCLUIDO_FACTOR;
    const cantidadTotal = items.reduce((suma, item) => suma + Number(item.cantidad), 0);

    return { total, igvIncluido, cantidadTotal };
  }

  window.LaLuchaSolicitud = {
    agregarItem,
    actualizarCantidad,
    calcularTotales,
    guardarSolicitud,
    limpiarSolicitud,
    obtenerSolicitud,
    quitarItem
  };
})();
