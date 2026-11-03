---
title: 'Aprendí a manejar con caja manual'
description: 'Nací en 1999, cursé casi toda la carrera sin IA y empecé a trabajar justo cuando llegaba. Por qué aprender a la antigua me sirve más que nunca, y qué le diría a quien arranca hoy.'
date: 2026-10-27
lang: es
key: caja-manual
slug: aprendi-a-manejar-con-caja-manual
tags: ['Carrera', 'IA', 'Aprendizaje']
---

Aprendí a manejar con caja manual. Hoy casi todos los autos nuevos son automáticos y manejar es más fácil, pero haber aprendido con embrague me dejó algo que no se va: entiendo qué hace el auto cuando cambia, por qué se ahoga en una subida, cuándo conviene una marcha más baja. Con la programación y la IA me pasa exactamente lo mismo.

## Un pie en cada mundo

Soy de 1999. Los de mi generación crecimos haciendo muchas cosas como las hacían nuestros padres, y al mismo tiempo vimos llegar casi todo lo que hoy damos por sentado.

<div class="note-figure">
<div class="note-legend"><span><i class="me"></i>Mi vida</span><span><i></i>La tecnología</span></div>
<div class="note-timeline">
<div class="me"><b>1999</b><span>Nazco.</span></div>
<div><b>2005</b><span>Nace YouTube.</span></div>
<div class="me"><b>2006</b><span>Llega la primera computadora a casa: jueguitos y el cyber.</span></div>
<div><b>2008</b><span>Android, el iPhone y Stack Overflow.</span></div>
<div><b>2013</b><span>Sale Docker.</span></div>
<div class="me"><b>2018</b><span>Entro a Ingeniería en Sistemas en la UTN.</span></div>
<div class="me"><b>2020</b><span>Primer trabajo freelance: el sitio de la Federación Cordobesa de Natación.</span></div>
<div class="me"><b>2022</b><span>Julio: entro a mi primera empresa.</span></div>
<div><b>2022</b><span>Noviembre: sale ChatGPT.</span></div>
<div class="me"><b>2024</b><span>Me recibo de ingeniero.</span></div>
<div class="me"><b>2026</b><span>La IA escribe; yo decido qué y por qué.</span></div>
</div>
<p class="note-caption">Cursé casi toda la carrera sin IA: cuando llegó ChatGPT ya estaba terminando. Entré a mi primera empresa cuatro meses antes.</p>
</div>

La primera computadora llegó en 2006 y era para jugar. Después vinieron Gmail, Messenger, Skype, Facebook, Twitter y YouTube. Y en algún momento quise modificar mi teléfono: buscaba videos que explicaban cómo conectarlo a la computadora y qué había que tocar. Ahí, sin saberlo, empecé a aprender como iba a aprender todo lo demás: probando, rompiendo y volviendo a buscar.

## Aprender a fuerza bruta

Cuando hice mis primeros trabajos y entré a la empresa, la IA recién aparecía y no servía para mucho. Así que aprendí a la antigua: hacer páginas desde cero, buscar en Stack Overflow y en foros, leer documentaciones enteras, mirar tutoriales en YouTube. No había otra forma.

CSS me costó horrores. Centrar un div, las posiciones absolutas, flexbox, el z-index, cómo se combinan clases e identificadores. De tanto renegar, terminé entendiéndolo. Y lo mismo me pasó con casi todo lo demás.

Tampoco entendía cómo se publicaba una web. Era todo por línea de comandos: entrar al servidor, levantar el proceso con pm2 y rezar. Después pasamos todo a Docker, y hoy publicar una versión es poner un tag en GitLab.

<div class="note-figure">
<div class="note-steps" style="--n:4">
<div><b>A mano</b><small>Entrar al servidor por consola y copiar archivos.</small></div>
<div><b>pm2</b><small>El proceso de Node se reinicia solo si se cae.</small></div>
<div><b>Docker</b><small>La app y todo lo que necesita, en una imagen.</small></div>
<div><b>Un tag</b><small>GitLab construye, despliega y vuelve atrás si algo falla.</small></div>
</div>
<p class="note-caption">Cómo fui publicando una web, de 2022 a hoy.</p>
</div>

Esa etapa fue lenta y frustrante, y es la que más me sirve hoy.

## Lo que cambió con la IA

Hoy escribo mucho menos código a mano: la IA escribe y yo diseño, reviso y corrijo. Uso Claude Code para la mayor parte del trabajo: armo un primer producto mínimo, y lo voy escalando a medida que aparecen requerimientos. Investigo, sumo herramientas, escribo buenos prompts y, sobre todo, leo lo que me devuelve. Si no entiendo algo, le pregunto hasta entenderlo.

La forma de programar cambió: ahora el trabajo es decidir qué pedir y revisar lo que llega. Y para las dos cosas hace falta la base.

Un ejemplo. Una vez le pedí ayuda con el ruteo de un servicio y me dio una configuración correcta en el papel. Pero en la empresa había un proxy con reglas propias para redirigir los sockets, y la IA no tenía ese contexto. Yo sí, porque sabía cómo estaba armada nuestra infraestructura. Si no lo hubiera sabido, habría aplicado algo que no funcionaba sin entender por qué.

<div class="note-figure">
<div class="note-split">
<div><p>Lo que hace la IA</p><span>Escribe el código.</span><span>Propone soluciones.</span><span>Busca y resume documentación.</span><span>Arma un primer prototipo en minutos.</span></div>
<div><p>Lo que te toca a vos</p><span>Saber qué pedirle.</span><span>Conocer tu infraestructura.</span><span>Exigir buenas prácticas y seguridad.</span><span>Entender lo que entregó antes de usarlo.</span></div>
</div>
</div>

Si no entendés cómo funciona tu sistema, la IA te puede dar uno que funciona y que no entendés. Y entonces dependés de ella para todo, incluso para mantenerlo.

## Los dos extremos

Al estar en el medio, veo los dos lados.

Quien arranca hoy escribe código más rápido que nunca. Pero si se salta las etapas, le falta la base para darse cuenta cuando algo está mal, y esa base ahora hay que buscarla a propósito, porque la IA no te obliga a construirla.

En el otro extremo está quien programó toda la vida de una forma y le cuesta cambiar. Cuando entré a la empresa me tocó armar capacitaciones de Git, Docker y Jira para todos, y no fue fácil: cada vez había que mostrar por qué era mejor y qué se ganaba. Con acompañamiento lo fueron adoptando, y hoy lo usan y entienden por qué.

Por eso digo que estamos en lo mejor de los dos mundos: aprendimos con caja manual y ahora manejamos un automático. Y sabemos que el auto también hay que llevarlo al service: en cualquier equipo, quedarse quieto tiene un costo, con sistemas atados a versiones viejas, todo lo que eso implica en seguridad y herramientas que dejan de tener soporte.

## Cómo aprendería hoy

Primero sin IA, después con IA. Es una herramienta que llegó para quedarse y hay que saber usarla, pero la base se construye peleándose con los problemas.

A quien arranca le diría que no se salte las etapas. Empezar de golpe con la IA, sin los conceptos, puede ser abrumador. Es un proceso de prueba, error y aprendizaje, y el panorama se va aclarando de a poco. Antes había muchas cosas que no entendía; hoy tengo la cabeza mucho más amplia. Y aun así me sigo topando con tecnologías nuevas que me obligan a volver a aprender.

Ese es el punto: la IA cambió cómo se escribe el código, no la necesidad de entenderlo.
