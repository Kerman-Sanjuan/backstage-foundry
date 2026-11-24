# Script v3: Azure AI Foundry + Backstage

Ronda 3. Responde al feedback: más técnico, menos ventas, con demo en vivo en Azure Cloud Lab. Sustituye a la v2: los ids antiguos se indican cuando se reutilizan.

**Thesis:** Habilitar IA en un proyecto tiene que costar un formulario, no un ticket. Backstage lo pide, el AI Gateway lo mide y Foundry lo ejecuta, y todo queda versionado en un repositorio.
**Audience:** Azure Cloud Lab: gente técnica de Azure, DevOps y plataforma. Quieren ver recursos reales, código y demos, no definiciones. Nivel medio.
**Time:** 60 min. Tres demos en vivo. ~22 diapositivas, con más tiempo en demo que en diapositivas.
**Arc:** antes (sin autoservicio) > ahora (con autoservicio) > el mapa con el AI Gateway en el centro > qué aprovisiona Backstage > qué ofrece cada pieza > demos en Azure > después (día 2) > cierre.

---

## Cambios respecto a la v2

- Se quita el bloque "por qué ahora" y la tesis genérica: sobra ventas. Entra directamente una historia animada.
- Nueva diapositiva animada de antes y ahora (storytelling): el mismo desarrollador pide IA para su proyecto, primero sin autoservicio y luego con él.
- El mapa de arquitectura pone el AI Gateway en el centro y separa dos flujos: el de aprovisionamiento (Backstage crea todo) y el de ejecución (la app llama al gateway).
- Una diapositiva por pieza con "qué ofrece" y "cómo habilita", cada una enlazada a una demo en Azure.
- El texto de las diapositivas sube de tamaño: menos texto por diapositiva y letra más grande.
- Se añade el caso "después": qué pasa el día 2, cuando el décimo equipo y las actualizaciones de la plantilla.

---

## 01 · cover (cover)
**Says:** Azure AI Foundry + Backstage: IA para tu proyecto en un formulario.
**Why here:** abre con la promesa técnica y concreta, sin contexto de mercado.
**Spoken:** Quién soy en diez segundos. Hoy no hay diapositivas largas: hay tres demos en Azure y un repo.

## 02 · before-after (story, animada)
**Says:** El mismo desarrollador pide IA para su proyecto. Antes: un ticket y siete esperas. Ahora: un formulario.
**Why here:** es la historia que da sentido al resto. Se ve el coste de no tener plataforma antes de ver la plataforma.
**Spoken:** Carril de arriba, sin autoservicio: ticket, espera por el recurso de Foundry, espera por la cuota, clave enviada por chat, red abierta a mano, nadie sabe quién gasta. Carril de abajo, con autoservicio: formulario, repo, gate, desplegado. La animación recorre los dos carriles a la vez.
(unverified: el número de pasos y de esperas del carril "antes" son los de un proceso típico; hay que ajustarlos a tu experiencia. No ponemos días ni horas si no se han medido.)

## 03 · three-pieces (diagram, animado)
**Says:** Tres piezas y un camino: Backstage pide, el AI Gateway mide, Foundry ejecuta.
**Why here:** presenta el reparto de roles antes de abrir cada pieza.
**Spoken:** Una frase por pieza. Backstage: dónde el desarrollador pide y se registra quién es dueño. AI Gateway: por dónde pasa cada petición. Foundry: dónde viven modelos, proyectos y trazas.

---

## 04 · architecture (diagram, dos flujos)
**Says:** El AI Gateway va en el centro. Un flujo aprovisiona y otro ejecuta.
**Why here:** responde a "dónde está el gateway" y separa lo que ocurre una vez (crear) de lo que ocurre siempre (llamar).
**Spoken:** Flujo de aprovisionamiento, arriba: Backstage crea el repo, el proyecto de Foundry y la suscripción del gateway para ese equipo. Flujo de ejecución, abajo: la app llama al gateway con su identidad y el gateway llega a Foundry con la suya. Foundry nunca ve al desarrollador, solo al gateway.

## 05 · provisioning (diagram, animado)
**Says:** Un formulario aprovisiona cuatro cosas: repo, proyecto Foundry, suscripción en el gateway y entrada en el catálogo.
**Why here:** es el flujo de "Backstage despliega todo" que faltaba.
**Spoken:** Pasos de la plantilla, en orden: `fetch:template`, `foundry:ensure-project`, `publish:github` con rama protegida y check requerido, `catalog:register`. Falta el paso del gateway: ver pregunta 2.

---

## 06 · backstage (diagram + qué ofrece)
**Says:** Backstage: la puerta de entrada y la memoria.
**Why here:** primera pieza. Se abre con el catálogo real y se cierra con la plantilla.
**Spoken:** Qué ofrece: catálogo (dueño, sistema, dependencias), plantilla (cinco campos), acciones (la de Foundry es nuestra). Cómo habilita: nadie pide permiso para empezar y el catálogo ya sabe quién responde.

## 07 · backstage-catalog (screenshot)
**Says:** El catálogo es la memoria: dueño, sistema y ciclo de vida.
**Spoken:** Captura de la demo pública. En la demo en vivo se usa el Backstage del laboratorio. (unverified: confirmar si hay un Backstage desplegado para la charla.)

## 08 · backstage-template (diagram)
**Says:** Cinco campos entran, cinco cosas salen.
**Spoken:** El modelo sale de una lista aprobada, la cuota existe antes de la primera factura y `personal_data` cambia lo que se genera.

## 09 · backstage-actions (screenshot)
**Says:** No hay acción oficial de Foundry: la escribimos (121 líneas).
**Spoken:** `foundry:ensure-project`: llama al plano de control con la identidad federada de quien pide y falla cerrado.

---

## 10 · gateway (diagram, animado)
**Says:** AI Gateway: lo único que ve quién llama en cada petición.
**Why here:** segunda pieza. Se ve por dentro lo que hace con una petición.
**Spoken:** Validar al llamante, limitar tokens por equipo, añadir la cabecera de atribución, llegar a Foundry con identidad gestionada. Qué ofrece: límites, atribución, alias estables. Cómo habilita: un equipo nuevo comparte capacidad sin poder gastar sin límite.

## 11 · gateway-policy (code)
**Says:** La política `llm-token-limit` en doce líneas.
**Spoken:** Se enseña el XML real de `platform/policies/llm-token-limit.xml`: `counter-key` por suscripción, tokens por minuto, estimación de tokens del prompt, cabecera de atribución, identidad gestionada.

## 12 · foundry (diagram)
**Says:** Foundry: el recurso gobierna, los proyectos desarrollan.
**Why here:** tercera pieza. Un proyecto por equipo y entorno.
**Spoken:** Qué ofrece: despliegues de modelos y cuota, proyectos, trazas OTel, evaluaciones. Cómo habilita: el equipo trabaja en su proyecto sin tocar red ni identidad.

## 13 · foundry-terraform (code)
**Says:** El recurso en Terraform: sin red pública, sin claves locales.
**Spoken:** `public_network_access_enabled = false`, `local_auth_enabled = false`, el proyecto dentro del recurso, la cuota en el despliegue. Es la forma de la frontera, no un módulo listo para producción. (Se aclara en voz alta.)

---

## 14 · demo-1 (demo en vivo, Azure)
**Says:** Demo 1: el formulario crea repo, proyecto y suscripción.
**Spoken:** Backstage del laboratorio > Create > rellenar los cinco campos > ver la ejecución paso a paso > abrir en el portal de Azure el proyecto de Foundry recién creado. Si falla, se cuenta lo que habría hecho y se pasa a la demo 2.

## 15 · demo-2 (demo en vivo, Azure)
**Says:** Demo 2: la misma llamada por el gateway, con y sin cuota.
**Spoken:** Llamada al gateway con la clave del equipo: 200 y cabeceras `x-remaining-tokens`. Segunda llamada superando la cuota: 429. Luego el bypass: una llamada directa al endpoint de Foundry con la red cerrada falla. (unverified: depende de que el laboratorio tenga APIM y Foundry desplegados; ver pregunta 3.)

## 16 · gate (code + gate-run)
**Says:** El gate cabe en ocho líneas y se ejecuta en cada PR.
**Spoken:** `thresholds.yaml` y la salida real de `make demo`. Cuatro métricas deterministas, `invented_owners` con umbral cero.

## 17 · demo-3 (demo en vivo)
**Says:** Demo 3: una PR bloqueada por el check requerido.
**Spoken:** Salida real de `demo/gate-fails` y la PR roja en el navegador. Un check que avisa no es un check.

---

## 18 · lineage (diagram)
**Says:** Trazabilidad: de un resultado se sabe qué equipo, modelo, cambio y petición hay detrás.
**Spoken:** Catálogo (quién), repo (qué cambio), trazas de Foundry (qué pasó), gateway (quién gastó). No es linaje de datos.

## 19 · after (story, animada)
**Says:** Después: el día 2. Qué pasa cuando hay diez equipos y la plantilla cambia.
**Why here:** cierra la historia de antes, ahora y después. Lo difícil no es crear el repo número uno, es mantener el décimo.
**Spoken:** Actualizar los repos ya generados, mover un proyecto de dev a pro, retirar un modelo del catálogo, cerrar el bypass con Azure Policy. Ver pregunta 4.

## 20 · limits (quote)
**Says:** Tu gate es tan bueno como tu dataset.
**Spoken:** `schema_valid` comprueba forma, no significado. Los fixtures del repo son sintéticos. El gateway solo controla lo que pasa por él.

## 21 · closing (closing)
**Says:** Un formulario, un gateway y un gate.
**Spoken:** Repositorio y contacto. Preguntas.

---

## Decisiones aplicadas (sin respuesta del usuario: se tomó la recomendada)

Plannotator se cerró sin feedback, así que se aplicaron las opciones recomendadas. Cualquiera se puede revertir.

- "Después" es el día 2: mantener y operar (diapositiva `after`). "Lo que viene" (agentes y MCP) no se incluye.
- Se añade el paso del gateway a la plantilla: `apim:ensure-subscription` en `platform/backstage/template/actions/apim-subscription.ts`. Está escrito contra la API de ARM y no se ha ejecutado contra un gateway real.
- Las demos asumen Foundry y APIM reales en el laboratorio y Backstage en local. **Sin verificar**: hay que confirmar qué hay desplegado.
- Tres demos y 22 diapositivas.

## Ronda 4

- Nueva diapositiva 02, `about` ("Sobre mí"), con el contenido de k3rman.com/about: rol actual, enfoque en IA y nube, cuatro años de Azure y Terraform, certificaciones y home lab. Foto de k3rman.com.
- Diagramas con iconos oficiales de Azure (AI Foundry, proyecto, modelos, APIM, App Insights) y glifos de Backstage y GitHub, brillo por pieza, líneas que se dibujan y paquetes que las recorren.
- Se mantiene GSAP en vez de una librería de diagramas: ver `docs/authoring.md`, sección "Diagrams".

## Ronda 5

- Sobre mí sin las cuatro tarjetas (ahora, trayectoria, certificados, en casa): solo foto, rol, frase, etiquetas y enlaces.
- Pregunta abierta (`open-question`) y un recorrido visual (`errand`): la misma persona hace el mismo recado dos veces, primero con salas de espera y luego con autoservicio. Se mantiene después la diapositiva de cajas (`before-after`).
- `three-pieces` con los logos de las tres piezas.
- Diapositivas de transición para Backstage, AI Gateway y Foundry, con su logo.
- Más pantallazos técnicos reales: la acción de Foundry en GitHub (`action-code`) y la pull request roja (`pr-gate`).
- `limits` ya no es una cita: es un experimento real. Se renombra `due` a `deadline` en los fixtures y el gate sigue en verde.

## Ronda 6

- Los puntos de las flechas ahora reinician el recorrido: cuando el diagrama termina de dibujarse, siguen recorriendo sus líneas en bucle mientras la diapositiva está en pantalla. Es lo único del deck que corre con reloj.
- Las flechas ya no comparten tramos de cable: cada línea tiene su punto de enganche y su canal, ordenados para que no se crucen.
- Diapositiva de índice (03) con las siete secciones, y separadores de sección para cada una: El problema, El mapa, Backstage, AI Gateway, Foundry, Demos y Día dos. Total: 35 diapositivas.

## Pendiente

- Confirmar qué hay desplegado en Azure Cloud Lab (demos 1 y 2).
- Contrastar con tu experiencia los pasos del carril "antes" de la diapositiva 02.
- Confirmar la URL del repositorio en el cierre.
