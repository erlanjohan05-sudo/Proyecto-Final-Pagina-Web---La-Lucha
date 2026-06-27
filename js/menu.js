/* =========================
   NAVBAR BEHAVIOR
========================= */

(function () {
  const LABEL_OPEN = "Abrir menú de navegación";
  const LABEL_CLOSE = "Cerrar menú de navegación";
  let navbarController = null;

  function normalizarRuta(ruta) {
    const url = new URL(ruta, window.location.href);
    const archivo = url.pathname.split("/").pop();
    return archivo || "index.html";
  }

  function actualizarEstado(navbar, toggle, estaAbierto) {
    navbar.dataset.state = estaAbierto ? "open" : "closed";
    toggle.setAttribute("aria-expanded", String(estaAbierto));
    toggle.setAttribute("aria-label", estaAbierto ? LABEL_CLOSE : LABEL_OPEN);
  }

  function marcarLinkActivo(navbar) {
    const rutaActual = normalizarRuta(window.location.pathname);
    const links = navbar.querySelectorAll(".site-nav__link");

    links.forEach((link) => {
      const href = link.getAttribute("href");

      if (!href) {
        return;
      }

      const rutaLink = normalizarRuta(href);

      if (rutaLink === rutaActual) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function initNavbar(contenedor) {
    const scope = contenedor || document;
    const navbar = scope.querySelector("[data-navbar]");

    if (!navbar) {
      return;
    }

    const toggle = navbar.querySelector("[data-nav-toggle]");
    const menu = navbar.querySelector("[data-nav-menu]");

    marcarLinkActivo(navbar);

    if (!toggle || !menu) {
      return;
    }

    if (navbarController) {
      navbarController.abort();
    }

    navbarController = new AbortController();
    const opcionesListener = { signal: navbarController.signal };

    actualizarEstado(navbar, toggle, false);

    toggle.addEventListener("click", () => {
      const estaAbierto = navbar.dataset.state === "open";
      actualizarEstado(navbar, toggle, !estaAbierto);
    }, opcionesListener);

    menu.addEventListener("click", (event) => {
      if (!(event.target instanceof Element)) {
        return;
      }

      const link = event.target.closest(".site-nav__link");

      if (link) {
        actualizarEstado(navbar, toggle, false);
      }
    }, opcionesListener);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navbar.dataset.state === "open") {
        actualizarEstado(navbar, toggle, false);
        toggle.focus();
      }
    }, opcionesListener);
  }

  window.initNavbar = initNavbar;
})();
