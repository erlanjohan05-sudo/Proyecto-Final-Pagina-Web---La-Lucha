const e = React.createElement;

/* =========================
   ANIMACIONES PARA LA PARTE HTML ESTÁTICA
========================= */

(function activarAnimacionesEstaticas() {
  function iniciar() {
    const elementos = document.querySelectorAll(
      ".nosotros-empresa .container, .dato-card"
    );

    if (!elementos.length) return;

    elementos.forEach(function (elemento, index) {
      elemento.classList.add("reveal-static");
      elemento.style.transitionDelay = index * 0.08 + "s";
    });

    const observer = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            observer.unobserve(entrada.target);
          }
        });
      },
      {
        threshold: 0.2
      }
    );

    elementos.forEach(function (elemento) {
      observer.observe(elemento);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();

/* =========================
   DATA
========================= */

const misionVision = [
  {
    id: "mision",
    titulo: "Misión",
    icono: "🎯",
    etiqueta: "Lo que hacemos",
    texto:
      "Conservar la esencia de la gastronomía peruana fusionando sánguches criollos con un ambiente tradicional y acogedor, ofreciendo productos frescos, atención cercana y una experiencia auténtica.",
    puntos: ["Sabor criollo", "Productos frescos", "Atención cercana"]
  },
  {
    id: "vision",
    titulo: "Visión",
    icono: "🌟",
    etiqueta: "Hacia dónde vamos",
    texto:
      "Seguir creciendo como una marca referente de la gastronomía peruana, llevando el sabor criollo a más ciudades y países, sin perder la calidad, tradición y calidez que nos caracteriza.",
    puntos: ["Crecimiento", "Calidad constante", "Marca peruana global"]
  }
];

const valores = [
  {
    icono: "🥖",
    titulo: "Calidad Artesanal",
    texto:
      "Pan elaborado diariamente e insumos frescos para mantener el sabor auténtico de cada sánguche."
  },
  {
    icono: "🤝",
    titulo: "Buena Atención",
    texto:
      "Una atención cercana y amable para que cada cliente se sienta bien recibido."
  },
  {
    icono: "❤️",
    titulo: "Identidad Peruana",
    texto:
      "Orgullo por la gastronomía criolla y por las tradiciones que representan al Perú."
  },
  {
    icono: "📈",
    titulo: "Crecimiento",
    texto:
      "Expansión nacional e internacional manteniendo la esencia de la marca."
  },
  {
    icono: "✅",
    titulo: "Estándares de Calidad",
    texto:
      "Limpieza, control y buenas prácticas para ofrecer una experiencia confiable."
  },
  {
    icono: "🔥",
    titulo: "Esfuerzo y Dedicación",
    texto:
      "Trabajo constante para mejorar cada día y mantener la preferencia del público."
  },
  {
    icono: "🫶",
    titulo: "Compromiso",
    texto:
      "Compromiso con el cliente, el equipo y la experiencia en cada visita."
  }
];

const cifras = [
  {
    numero: 15,
    prefijo: "+",
    etiqueta: "Años de trayectoria",
    progreso: 95
  },
  {
    numero: 3,
    prefijo: "",
    etiqueta: "Países internacionales",
    progreso: 70
  },
  {
    numero: 4,
    prefijo: "",
    etiqueta: "Ciudades en el Perú",
    progreso: 80
  },
  {
    numero: 2009,
    prefijo: "",
    etiqueta: "Año de fundación",
    progreso: 100
  }
];

/* =========================
   HOOKS
========================= */

function useReveal(threshold) {
  const ref = React.useRef(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(function () {
    const nodo = ref.current;

    if (!nodo) return;

    const observer = new IntersectionObserver(
      function (entradas) {
        const entrada = entradas[0];

        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: threshold || 0.2,
        rootMargin: "0px 0px -70px 0px"
      }
    );

    observer.observe(nodo);

    return function () {
      observer.disconnect();
    };
  }, [threshold]);

  return [ref, visible];
}

function useCounter(numeroFinal, activo, duracion) {
  const [valor, setValor] = React.useState(0);

  React.useEffect(
    function () {
      if (!activo) return;

      let inicio = null;
      const tiempo = duracion || 1400;

      function animar(timestamp) {
        if (!inicio) inicio = timestamp;

        const progreso = Math.min((timestamp - inicio) / tiempo, 1);
        const suavizado = 1 - Math.pow(1 - progreso, 3);

        setValor(Math.round(numeroFinal * suavizado));

        if (progreso < 1) {
          requestAnimationFrame(animar);
        }
      }

      const frame = requestAnimationFrame(animar);

      return function () {
        cancelAnimationFrame(frame);
      };
    },
    [numeroFinal, activo, duracion]
  );

  return valor;
}

/* =========================
   COMPONENTES
========================= */

function MisionVision() {
  const [seleccionado, setSeleccionado] = React.useState(misionVision[0]);
  const [ref, visible] = useReveal(0.25);

  return e(
    "section",
    {
      ref: ref,
      className: visible
        ? "nosotros-mv react-section reveal-section is-visible"
        : "nosotros-mv react-section reveal-section"
    },
    e(
      "div",
      { className: "container" },
      e("span", { className: "section-eyebrow" }, "Nuestro propósito"),
      e("h2", { className: "nosotros-seccion-titulo" }, "Misión y Visión"),

      e(
        "div",
        { className: "mv-tabs" },
        misionVision.map(function (item) {
          return e(
            "button",
            {
              key: item.id,
              type: "button",
              className:
                seleccionado.id === item.id
                  ? "mv-tab is-active"
                  : "mv-tab",
              onClick: function () {
                setSeleccionado(item);
              }
            },
            e("span", { className: "mv-tab__icono" }, item.icono),
            e("span", null, item.titulo)
          );
        })
      ),

      e(
        "div",
        { className: "mv-layout" },
        e(
          "div",
          { className: "mv-visual" },
          e("div", { className: "mv-orbita" }, seleccionado.icono),
          e(
            "div",
            { className: "mv-mini mv-mini--one" },
            "Tradición"
          ),
          e(
            "div",
            { className: "mv-mini mv-mini--two" },
            "Calidad"
          ),
          e(
            "div",
            { className: "mv-mini mv-mini--three" },
            "Perú"
          )
        ),

        e(
          "article",
          { className: "mv-panel" },
          e("span", { className: "mv-panel__label" }, seleccionado.etiqueta),
          e("h3", { className: "mv-panel__titulo" }, seleccionado.titulo),
          e("p", { className: "mv-panel__texto" }, seleccionado.texto),
          e(
            "div",
            { className: "mv-puntos" },
            seleccionado.puntos.map(function (punto) {
              return e(
                "span",
                { key: punto, className: "mv-punto" },
                punto
              );
            })
          )
        )
      )
    )
  );
}

function Valores() {
  const [ref, visible] = useReveal(0.2);

  return e(
    "section",
    {
      ref: ref,
      className: visible
        ? "nosotros-valores react-section reveal-section is-visible"
        : "nosotros-valores react-section reveal-section"
    },
    e(
      "div",
      { className: "container" },

      e("span", { className: "section-eyebrow" }, "Lo que nos representa"),
      e(
        "h2",
        { className: "nosotros-seccion-titulo" },
        "Nuestros Valores"
      ),

      e(
        "div",
        { className: "nosotros-valores__grid" },

        valores.map(function (valor, index) {
          return e(
            "article",
            {
              key: valor.titulo,
              className: "valor-card",
              style: {
                animationDelay: index * 0.08 + "s"
              }
            },

            e(
              "div",
              { className: "valor-card__icono" },
              valor.icono
            ),

            e(
              "h3",
              { className: "valor-card__titulo" },
              valor.titulo
            ),

            e(
              "p",
              { className: "valor-card__texto" },
              valor.texto
            )
          );
        })
      )
    )
  );
}

function CifraCard(props) {
  const valorAnimado = useCounter(props.numero, props.visible, 1500);

  return e(
    "article",
    {
      className: props.visible ? "cifra-card is-visible" : "cifra-card",
      style: {
        transitionDelay: props.index * 0.12 + "s"
      }
    },
    e(
      "span",
      { className: "cifra-card__numero" },
      props.prefijo + valorAnimado
    ),
    e("span", { className: "cifra-card__label" }, props.etiqueta),
    e(
      "div",
      { className: "cifra-card__barra" },
      e("span", {
        className: "cifra-card__progreso",
        style: {
          width: props.visible ? props.progreso + "%" : "0%"
        }
      })
    )
  );
}

function Cifras() {
  const [ref, visible] = useReveal(0.1);

  return e(
    "section",
    {
      ref: ref,
      className: visible
        ? "nosotros-cifras react-section reveal-section is-visible"
        : "nosotros-cifras react-section reveal-section"
    },
    e(
      "div",
      { className: "container" },
      e("span", { className: "section-eyebrow section-eyebrow--light" }, "Estamos creciendo"),
      e("h2", { className: "nosotros-seccion-titulo nosotros-seccion-titulo--light" }, "Nuestro crecimiento"),

      e(
        "div",
        { className: "nosotros-cifras__grid" },
        cifras.map(function (cifra, index) {
          return e(CifraCard, {
            key: cifra.etiqueta,
            numero: cifra.numero,
            prefijo: cifra.prefijo,
            etiqueta: cifra.etiqueta,
            progreso: cifra.progreso,
            visible: visible,
            index: index
          });
        })
      )
    )
  );
}

function FraseFinal() {
  const frase =
    "Cada sánguche cuenta una historia. La nuestra empezó en Miraflores y hoy llega a todo el mundo.";

  const palabras = frase.split(" ");
  const [ref, visible] = useReveal(0.35);

  return e(
    "section",
    {
      ref: ref,
      className: visible
        ? "nosotros-frase react-section frase-visible"
        : "nosotros-frase react-section"
    },
    e(
      "div",
      { className: "container frase-container" },
      e("span", { className: "section-eyebrow" }, "Nuestra esencia"),
      e(
        "blockquote",
        { className: "nosotros-frase__texto" },
        palabras.map(function (palabra, index) {
          return e(
            "span",
            {
              key: index,
              className: "frase-palabra",
              style: {
                transitionDelay: index * 0.09 + "s"
              }
            },
            palabra + (index < palabras.length - 1 ? "\u00A0" : "")
          );
        })
      ),
      e(
        "p",
        { className: "nosotros-frase__autor" },
        "— César Taboada Valdiezo, Fundador"
      )
    )
  );
}

function NosotrosReact() {
  return e(
    React.Fragment,
    null,
    e(MisionVision),
    e(Valores),
    e(Cifras),
    e(FraseFinal)
  );
}

const contenedor = document.getElementById("nosotros-react-root");

if (contenedor) {
  const root = ReactDOM.createRoot(contenedor);
  root.render(e(NosotrosReact));
} else {
  console.error("No se encontró el contenedor nosotros-react-root");
}