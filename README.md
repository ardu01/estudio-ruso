# Estudio Ruso

PWA personal para estudiar ruso básico desde cero. La interfaz está en español; lo que se aprende está en cirílico, con pronunciación y significado.

Hecha para Miguel. Sin cuenta, sin servidor y sin analítica: el progreso se guarda en el navegador.

## Qué cubre la v1

- **Inicio.** Saludo, seguir por donde lo dejaste, acceso a cada sección y un resumen de racha, repasos, aciertos y letras.
- **Alfabeto.** Las 33 letras, con pista de pronunciación, nota en español y un ejemplo. Si el navegador tiene voz, al tocar «Escuchar» suena en ruso.
- **Mazos.** Saludos, frases cortas, números del 1 al 20, colores, y verbos y sustantivos de uso diario.
- **Tarjetas.** Ruso → español o español → ruso. Toca la tarjeta para voltearla, márcala como «La sé» o «Aún no».
- **Práctica.** Diez preguntas del mazo en curso: opciones o escritura. En escritura acepta el español sin obsesionarse con los acentos, y el ruso en cirílico o en letras latinas.
- **Progreso.** Solo `localStorage` (clave `estudio-ruso`): último sitio, racha, tarjetas sabidas y aciertos.
- **Ajustes.** Tema sistema, claro u oscuro, y borrar el progreso sin cambiar el tema.

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
