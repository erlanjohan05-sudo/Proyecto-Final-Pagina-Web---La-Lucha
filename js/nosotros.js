const e = React.createElement;

const misionVision = [
  {
    titulo: "Misión",
    icono: "🎯",
    texto:
      "Conservar la esencia de la gastronomía peruana fusionando sánguches criollos con un ambiente tradicional y acogedor, ofreciendo productos frescos y de calidad."
  },
  {
    titulo: "Visión",
    icono: "🌟",
    texto:
      "Afianzar diariamente la creencia de que el esfuerzo y la dedicación son claves para alcanzar las metas, llevando el sabor criollo peruano a más personas."
  }
];

const valores = [
  {
    icono: "🥖",
    titulo: "Calidad Artesanal",
    texto: "Pan elaborado diariamente e insumos frescos para mantener el sabor auténtico."
  },
  {
    icono: "🤝",
    titulo: "Buena Atención",
    texto: "Una atención cercana y amable para que cada cliente se sienta en casa."
  },
  {
    icono: "❤️",
    titulo: "Identidad Peruana",
    texto: "Orgullo por la gastronomía criolla y las tradiciones del Perú."
  },
  {
    icono: "📈",
    titulo: "Crecimiento",
    texto: "Expansión nacional e internacional manteniendo la esencia de la marca."
  }
];

const cifras = [
  { numero: "+15", texto: "Años de trayectoria" },
  { numero: "2009", texto: "Año de fundación" },
  { numero: "3", texto: "Países internacionales" },
  { numero: "4", texto: "Ciudades en Perú" }
];

function MisionVision() {
  const [seleccionado, setSeleccionado] = React.useState(misionVision[0]);

  return e(
    "section",
    { className: "nosotros-mv" },
    e(
      "div",
      { className: "container" },
      e("h2", { className: "nosotros-seccion-titulo" }, "Misión y Visión"),

      e(
        "div",
        { className: "nosotros-tabs" },
        misionVision.map((item) =>
          e(
            "button",
            {
              key: item.titulo,
              className:
                seleccionado.titulo === item.titulo
                  ? "nosotros-tab is-active"
                  : "nosotros-tab",
              onClick: () => setSeleccionado(item)
            },
            item.icono + " " + item.titulo
          )
        )
      ),

      e(
        "div",
        { className: "nosotros-mv__grid" },
        e(
          "div",
          { className: "mv-card" },
          e("div", { className: "mv-card__icono" }, seleccionado.icono),
          e("h3", { className: "mv-card__titulo" }, seleccionado.titulo),
          e("p", { className: "mv-card__texto" }, seleccionado.texto)
        )
      )
    )
  );
}

function Valores() {
  const [valorActivo, setValorActivo] = React.useState(valores[0]);

  return e(
    "section",
    { className: "nosotros-valores" },
    e(
      "div",
      { className: "container" },
      e("h2", { className: "nosotros-seccion-titulo" }, "Nuestros Valores"),

      e(
        "div",
        { className: "nosotros-valores__grid" },
        valores.map((valor) =>
          e(
            "div",
            {
              key: valor.titulo,
              className:
                valorActivo.titulo === valor.titulo
                  ? "valor-card valor-card--activo"
                  : "valor-card",
              onClick: () => setValorActivo(valor)
            },
            e("div", { className: "valor-card__icono" }, valor.icono),
            e("h3", { className: "valor-card__titulo" }, valor.titulo),
            e("p", { className: "valor-card__texto" }, valor.texto)
          )
        )
      ),

      e(
        "div",
        { className: "valor-detalle" },
        e("span", null, "Valor seleccionado"),
        e("h3", null, valorActivo.titulo),
        e("p", null, valorActivo.texto)
      )
    )
  );
}

function Cifras() {
  return e(
    "section",
    { className: "nosotros-cifras" },
    e(
      "div",
      { className: "container" },
      e(
        "div",
        { className: "nosotros-cifras__grid" },
        cifras.map((cifra) =>
          e(
            "div",
            { className: "cifra-card", key: cifra.texto },
            e("span", { className: "cifra-card__numero" }, cifra.numero),
            e("span", { className: "cifra-card__label" }, cifra.texto)
          )
        )
      )
    )
  );
}

function FraseFinal() {
  const frase =
    "Cada sánguche cuenta una historia. La nuestra empezó en Miraflores y hoy llega a todo el mundo.";

  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const seccion = document.querySelector(".nosotros-frase");

    if (!seccion) return;

    const observer = new IntersectionObserver(
      function (entradas) {
        const entrada = entradas[0];

        if (entrada.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.35
      }
    );

    observer.observe(seccion);

    return function () {
      observer.disconnect();
    };
  }, []);

  return e(
    "section",
    { className: "nosotros-frase" },
    e(
      "div",
      { className: "container" },
      e(
        "blockquote",
        {
          className: visible
            ? "nosotros-frase__texto frase-visible"
            : "nosotros-frase__texto"
        },
        frase.split("").map(function (letra, index) {
          return e(
            "span",
            {
              key: index,
              className: "frase-letra",
              style: {
                transitionDelay: index * 0.025 + "s"
              }
            },
            letra === " " ? "\u00A0" : letra
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