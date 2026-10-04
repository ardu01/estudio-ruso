# Estudio Ruso

PWA personal para estudiar ruso básico desde cero. La interfaz está en español; lo que se aprende está en cirílico, con pronunciación y significado.

Hecha para Miguel. Sin cuenta, sin servidor y sin analítica: el progreso se guarda en el navegador.

## Qué cubre la v2

La ruta va del alfabeto a las sílabas, las primeras palabras, la gramática básica y unos diálogos cortos. No está bloqueada: es una lista y un «siguiente paso».

- **Inicio.** Saludo, seguir por donde lo dejaste, meta del día, el siguiente paso de la ruta y el repaso que toca hoy.
- **Alfabeto.** Las 33 letras, con pista de pronunciación, nota en español y un ejemplo. Si el navegador tiene voz, «Escuchar» suena en ruso.
- **Sílabas.** Consonante más vocal, para oír y elegir el cirílico.
- **Mazos.** Saludos, frases, números, colores y palabras de uso diario, y además familia, comida, viaje, tiempo, clima, casa, cuerpo, animales, compras, restaurante, direcciones, emociones, trabajo y clase, adjetivos, preguntas, pronombres y preposiciones.
- **Tarjetas.** Ruso → español o español → ruso. Al voltear, marcas Otra vez, Bien o Fácil. Eso programa la siguiente vez (un repaso espaciado sencillo, al estilo SM-2). La estrella guarda la palabra en Favoritas.
- **Práctica.** Opciones o escritura, y además Escuchar (eliges el significado de lo que oyes) y Escribir (teclado cirílico, o una ayuda de latino a cirílico que es aproximada).
- **Gramática.** Género, plural, presente de verbos frecuentes, nominativo y acusativo, y posesión.
- **Diálogos.** Escenas cortas con un hueco para completar.
- **Repaso.** Solo lo que vence hoy, más hasta diez palabras nuevas. No saca todo el archivo de golpe.
- **Búsqueda.** En Palabras, por cirílico, pronunciación o español.
- **Progreso.** Solo `localStorage` (clave `estudio-ruso`): último sitio, racha de estudio, racha de meta, tarjetas y aciertos. Si había progreso de la v1, las tarjetas marcadas pasan al repaso.
- **Ajustes.** Tema sistema, claro u oscuro, meta diaria (10, 15, 20 o 30) y borrar el progreso. El tema y la meta se conservan al borrar.

## Abrir en local

Hace falta un servidor estático para el service worker y para instalarla. Desde la carpeta del repo:

```bash
python3 -m http.server 8000
```

Abre [http://localhost:8000](http://localhost:8000).

También puedes abrir `index.html` en el navegador: el estudio funciona, pero la instalación y el modo sin conexión no, porque el service worker solo vive en `http` o `https`.

## Publicar en GitHub Pages

1. Fusiona esta rama en `main`.
2. En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch**.
3. Branch: `main`. Carpeta: **`/ (root)`**.
4. Cuando termine el despliegue, la app queda en `https://ardu01.github.io/estudio-ruso/`.

No hay paso de compilación. El archivo `.nojekyll` evita que Pages pase el sitio por Jekyll, así que el manifest, el service worker y los iconos se publican tal cual.

## Instalarla en el iPhone

Ábrela en Safari (mejor desde GitHub Pages, con HTTPS). Pulsa **Compartir** y luego **Añadir a pantalla de inicio**. El icono y la pantalla de arranque salen del manifest.

Después de abrirla una vez con conexión, el service worker guarda la interfaz y los mazos para poder usarla sin red. El progreso no se sincroniza entre dispositivos.

Si «Escuchar» no suena, en el iPhone descarga una voz rusa: **Ajustes → Accesibilidad → Contenido leído → Voces**. Si ese navegador no tiene síntesis de voz, la app sigue mostrando la pronunciación escrita.

## Comprobar los datos

```bash
node tests/check.js
```

Revisa que el alfabeto tenga 33 letras, que no se repitan fichas y que la racha y las respuestas acepten lo que debe aceptar un principiante.
