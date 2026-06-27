/* =========================
   COMPONENT LOADER
========================= */

async function cargarComponente(idContenedor, rutaArchivo, callback) {
  const contenedor = document.getElementById(idContenedor);

  if (!contenedor) {
    return false;
  }

  try {
    const respuesta = await fetch(rutaArchivo);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${rutaArchivo}. Estado: ${respuesta.status}`);
    }

    const contenido = await respuesta.text();
    contenedor.innerHTML = contenido;

    if (typeof callback === "function") {
      callback(contenedor);
    }

    return true;
  } catch (error) {
    console.error("Error al cargar componente:", rutaArchivo, error);
    return false;
  }
}

/* =========================
   APP INIT
========================= */

async function inicializarComponentes() {
  await Promise.all([
    cargarComponente("navbar-container", "components/navbar.html", window.initNavbar),
    cargarComponente("hero-container", "components/hero.html"),
    cargarComponente("footer-container", "components/footer.html")
  ]);
}

document.addEventListener("DOMContentLoaded", inicializarComponentes);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const registros = await navigator.serviceWorker.getRegistrations();

      await Promise.all(registros.map((registro) => registro.unregister()));

      if ("caches" in window) {
        const nombresCache = await caches.keys();
        await Promise.all(nombresCache.map((nombreCache) => caches.delete(nombreCache)));
      }
    } catch (error) {
      console.error("No se pudo limpiar el service worker anterior:", error);
    }
  });
}
