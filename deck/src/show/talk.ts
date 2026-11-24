/**
 * THE TALK. This is the only file you edit to make a new presentation.
 *
 * One chapter is one section of the talk, one slide is one stop on the stage.
 * Every string is bilingual: `bi('English', 'Español')`.
 *
 * Rules that the checks enforce (scripts/check-talk.mjs):
 * - `id` is unique and short: it is the URL hash (`#/chapter/slide/stop`) and the debug label.
 * - Every string has both languages and neither uses an en dash or an em dash.
 * - `note` is the speaker's page in the presenter window (P). One bullet per line.
 *
 * Facts on a slide must be true and checked before you present. Do not use a
 * number you have not seen in a real terminal.
 */
import { bi, type Bi } from './text.ts'

export type LayoutId =
  | 'cover'
  | 'section'
  | 'points'
  | 'statement'
  | 'stats'
  | 'quote'
  | 'code'
  | 'split'
  | 'steps'
  | 'closing'
  | 'diagram'
  | 'screenshot'
  | 'story'
  | 'demo'
  | 'about'
  | 'journey'
  | 'agenda'
  | 'event'

interface SlideBase {
  /** Unique, short. It shows in the URL hash, so keep it readable. */
  id: string
  /** Speaker notes for the presenter window. One bullet per line. */
  note?: Bi
  /** Length on the global timeline, in units. Default 1. */
  duration?: number
}

export interface Point {
  title?: Bi
  text: Bi
  /** A glyph from src/show/icons.ts or a file in public/icons/. Shown big on the card. */
  icon?: string
}

export interface Stat {
  value: string
  label: Bi
}

export interface Column {
  title: Bi
  items: Bi[]
}

export interface Step {
  label: Bi
  text?: Bi
}

export interface Link {
  label: Bi
  value: string
}

export type Slide =
  | (SlideBase & {
      layout: 'cover'
      kicker: Bi
      title: Bi
      lead?: Bi
      terminal?: { title: Bi; lines: string[] }
      byline?: Bi
      role?: Bi
      venue?: Bi
    })
  | (SlideBase & { layout: 'section'; number: string; title: Bi; lead?: Bi; icon?: string })
  | (SlideBase & { layout: 'points'; kicker?: Bi; title: Bi; lead?: Bi; items: Point[] })
  | (SlideBase & { layout: 'statement'; text: Bi; attribution?: Bi })
  | (SlideBase & { layout: 'stats'; title: Bi; lead?: Bi; stats: Stat[] })
  | (SlideBase & { layout: 'quote'; text: Bi; author: Bi; role?: Bi })
  | (SlideBase & { layout: 'code'; title: Bi; lead?: Bi; code: { title: Bi; lines: string[]; highlight?: number[] } })
  | (SlideBase & { layout: 'split'; title: Bi; lead?: Bi; left: Column; right: Column })
  | (SlideBase & { layout: 'steps'; title: Bi; lead?: Bi; steps: Step[] })
  | (SlideBase & { layout: 'closing'; title: Bi; lead?: Bi; links: Link[]; byline?: Bi; role?: Bi })
  | (SlideBase & { layout: 'diagram'; title: Bi; lead?: Bi; nodes: DiagramNode[]; edges?: DiagramEdge[]; caption?: Bi })
  | (SlideBase & { layout: 'screenshot'; title: Bi; lead?: Bi; image: string; url: string; callouts: Callout[] })
  | (SlideBase & { layout: 'story'; title: Bi; lead?: Bi; lanes: Lane[] })
  | (SlideBase & { layout: 'about'; name: string; role: Bi; photo: string; bio: Bi; facts?: Fact[]; tags: string[]; links: Link[] })
  | (SlideBase & { layout: 'journey'; title: Bi; lead?: Bi; trips: Trip[] })
  | (SlideBase & { layout: 'agenda'; title: Bi; lead?: Bi; items: AgendaItem[] })
  | (SlideBase & { layout: 'event'; title: Bi; date: Bi; name: string; photo: string; zones: Zone[]; site: string })
  | (SlideBase & { layout: 'demo'; title: Bi; lead?: Bi; stops: DemoStop[]; fallback?: Bi })

export type DiagramTone = 'plain' | 'clay' | 'sage' | 'sky' | 'ghost' | 'zone'

/** The diagram canvas is 160 by 60 units. Boxes are placed by hand: x, y, w, h. */
export interface DiagramNode {
  id: string
  x: number
  y: number
  w: number
  h: number
  label: Bi
  sub?: Bi
  tone?: DiagramTone
  /** Border colour of a zone. */
  accent?: 'clay' | 'sage' | 'sky'
  /** A glyph from src/show/icons.ts, or the name of a file in public/icons/. */
  icon?: string
}

export type Side = 'l' | 'r' | 't' | 'b'

export interface DiagramEdge {
  from: string
  to: string
  /** Force the side the line leaves and enters. Without them the route is chosen by position. */
  fromSide?: Side
  toSide?: Side
  label?: Bi
  tone?: 'clay' | 'sage' | 'sky'
  dashed?: boolean
}

/** A numbered marker on a screenshot. x and y are percentages of the image. */
export interface Callout {
  x: number
  y: number
  title: Bi
  text: Bi
}

export interface LaneStep {
  label: Bi
  /** A step where somebody waits: drawn dashed and dim. */
  wait?: boolean
}

export interface Lane {
  name: Bi
  /** `slow` is the lane without the platform, `fast` the one with it. */
  pace: 'slow' | 'fast'
  steps: LaneStep[]
  result: Bi
}

export interface DemoStop {
  /** Where the speaker looks: Backstage, Azure, Terminal, GitHub. Not translated. */
  where: string
  text: Bi
}

export interface Fact {
  label: Bi
  text: Bi
}

export interface Station {
  /** What stands at this stop: a hand-drawn prop (ticket, hourglass, key, lock, coin, check) or an icon name. */
  prop: string
  label: Bi
  /** The traveller waits here: the prop keeps turning. */
  wait?: boolean
}

export interface Trip {
  name: Bi
  pace: 'slow' | 'fast'
  stations: Station[]
}

export interface AgendaItem {
  title: Bi
  text: Bi
  /** A section with a live demo. */
  live?: boolean
}

export interface Zone {
  /** A file in public/brand/: flag-<code>.svg. */
  flag: string
  time: string
}

export interface Chapter {
  id: string
  title: Bi
  slides: Slide[]
}

export interface Talk {
  /** Shown in the top left of every slide. */
  short: Bi
  chapters: Chapter[]
}

/** The title of a slide for the debug panel and the aria label. */
export function titleOf(slide: Slide): string {
  return 'title' in slide ? slide.title.en : slide.id
}

export const talk: Talk = {
  short: bi('Foundry + Backstage', 'Foundry + Backstage'),
  chapters: [
    {
      id: 'intro',
      title: bi('Intro', 'Intro'),
      slides: [
        {
          id: 'cover',
          layout: 'event',
          title: bi(
            'Azure AI Foundry + Backstage: from models to an AI platform for developers',
            'Azure AI Foundry + Backstage: de los modelos a una plataforma de IA para desarrolladores',
          ),
          date: bi('Thu, 3 Dec 2026 · 19:00', 'jue., 03/12/2026 · 19:00'),
          name: 'Kerman Sanjuan',
          photo: 'kerman.jpeg',
          zones: [
            { flag: 'es', time: '17:00 - 21:00 CET' },
            { flag: 'mx', time: '10:00 - 14:00 CST' },
            { flag: 'pe', time: '10:00 - 14:00 PET' },
            { flag: 'ar', time: '12:00 - 16:00 ART' },
            { flag: 'cl', time: '12:00 - 16:00 CLST' },
          ],
          site: 'www.azurecloudlab.net',
          note: bi(
            'Who I am in ten seconds. Thank the organisers: Azure Cloud Lab and Sevilla DotNet.\nThere are few slides today: three demos in Azure and one repository.\nThe talk is at 19:00 on 3 December. The time zone strip is the window of the whole event day, as on the event banner: check the local time of your session before you say it aloud.',
            'Quién soy en diez segundos. Da las gracias a la organización: Azure Cloud Lab y Sevilla DotNet.\nHoy hay pocas diapositivas: tres demos en Azure y un repositorio.\nLa charla es el 3 de diciembre a las 19:00. La franja de husos horarios es la ventana de todo el día del evento, como en el banner: comprueba la hora local de tu sesión antes de decirla en voz alta.',
          ),
        },
        {
          id: 'about',
          layout: 'about',
          name: 'Kerman Sanjuan',
          role: bi('Cloud engineer and architect, Plain Concepts, Bilbao', 'Cloud engineer y arquitecto, Plain Concepts, Bilbao'),
          photo: 'kerman.jpeg',
          bio: bi(
            'Platforms, automation, and the agents that will end up operating them.',
            'Plataformas, automatización y los agentes que acabarán operándolas.',
          ),
          tags: ['Azure', 'Terraform', 'Platform', 'DevOps', 'AI agents'],
          links: [
            { label: bi('Web', 'Web'), value: 'k3rman.com' },
            { label: bi('GitHub', 'GitHub'), value: 'github.com/Kerman-Sanjuan' },
            { label: bi('LinkedIn', 'LinkedIn'), value: 'linkedin.com/in/kerman-sanjuan' },
          ],
          note: bi(
            'Ten seconds, not a CV. The content comes from k3rman.com/about: check it still says the same before presenting.\nThe one sentence that matters: I design platforms, and I am the one who has to live with them six months later.\nThen move on: today there are three demos.',
            'Diez segundos, no un currículum. El contenido sale de k3rman.com/about: comprueba que sigue igual antes de presentar.\nLa frase que importa: diseño plataformas y soy quien tiene que convivir con ellas seis meses después.\nSigue: hoy hay tres demos.',
          ),
        },
        {
          id: 'agenda',
          layout: 'agenda',
          title: bi('What we will see', 'Lo que vamos a ver'),
          items: [
            { title: bi('The problem', 'El problema'), text: bi('A team asks for AI, with and without a platform.', 'Un equipo pide IA, con y sin plataforma.') },
            { title: bi('The map', 'El mapa'), text: bi('Three pieces, two flows, one form.', 'Tres piezas, dos flujos, un formulario.') },
            { title: bi('Backstage', 'Backstage'), text: bi('Where the team asks and who owns what.', 'Donde se pide y quién es dueño de qué.') },
            { title: bi('AI Gateway', 'AI Gateway'), text: bi('Who is calling, and how much it spends.', 'Quién llama y cuánto gasta.') },
            { title: bi('Foundry', 'Foundry'), text: bi('Resource, projects, models and traces.', 'Recurso, proyectos, modelos y trazas.') },
            { title: bi('Demos', 'Demos'), text: bi('The form, the gateway and the gate, in Azure.', 'El formulario, el gateway y el gate, en Azure.'), live: true },
            { title: bi('Day two', 'Día dos'), text: bi('Lineage, updates and limits.', 'Linaje, actualizaciones y límites.') },
          ],
          note: bi(
            'Thirty seconds. Name the seven parts and say where the demos are: they are the middle of the talk, not the end.\nTell them the deck is public and the repository too.',
            'Treinta segundos. Nombra las siete partes y di dónde están las demos: son el centro de la charla, no el final.\nDi que la presentación es pública, y el repositorio también.',
          ),
        },
      ],
    },
    {
      id: 'story',
      title: bi('The story', 'La historia'),
      slides: [
        {
          id: 'story-section',
          layout: 'section',
          number: '01',
          title: bi('The problem', 'El problema'),
          lead: bi('A team asks for AI. What has to happen?', 'Un equipo pide IA. ¿Qué tiene que pasar?'),
          note: bi('Section one. Ask the question and let the room answer.', 'Sección uno. Haz la pregunta y deja que la sala responda.'),
        },
        {
          id: 'open-question',
          layout: 'statement',
          text: bi(
            'A new team wants to use AI tomorrow. What has to happen for them to be able to?',
            'Un equipo nuevo quiere usar IA mañana. ¿Qué tiene que pasar para que pueda?',
          ),
          attribution: bi('The question for today', 'La pregunta de hoy'),
          note: bi(
            'Ask it and wait. Let someone in the room answer: they will say ticket, key, quota, network.\nThat is the problem. The next slide walks it.',
            'Pregúntalo y espera. Deja que alguien de la sala responda: dirán ticket, clave, cuota, red.\nEse es el problema. La siguiente diapositiva lo recorre.',
          ),
        },
        {
          id: 'errand',
          layout: 'journey',
          title: bi('The same errand, two ways', 'El mismo recado, dos caminos'),
          lead: bi('A team asks for AI. First without a platform, then with one.', 'Un equipo pide IA. Primero sin plataforma, luego con ella.'),
          trips: [
            {
              name: bi('Without a platform', 'Sin plataforma'),
              pace: 'slow',
              stations: [
                { prop: 'ticket', label: bi('Open a\nticket', 'Abrir un\nticket') },
                { prop: 'hourglass', label: bi('Wait for\nthe resource', 'Esperar el\nrecurso'), wait: true },
                { prop: 'hourglass', label: bi('Wait for\nthe quota', 'Esperar la\ncuota'), wait: true },
                { prop: 'key', label: bi('Key by\nchat', 'Clave por\nchat') },
                { prop: 'lock', label: bi('Open the\nnetwork', 'Abrir la\nred') },
                { prop: 'coin', label: bi('Who is\nspending?', '¿Quién\ngasta?') },
              ],
            },
            {
              name: bi('With self-service', 'Con autoservicio'),
              pace: 'fast',
              stations: [
                { prop: 'backstage', label: bi('Form', 'Formulario') },
                { prop: 'github', label: bi('Repo', 'Repo') },
                { prop: 'apim', label: bi('Gateway', 'Gateway') },
                { prop: 'ai-foundry', label: bi('Project', 'Proyecto') },
                { prop: 'check', label: bi('Ready', 'Listo') },
              ],
            },
          ],
          note: bi(
            'The same person walks the same errand twice. The top walk is long and has waiting rooms (the hourglasses turn); the bottom one is short.\nDo not say days or hours: nothing was measured. The length of the walk is the argument.\nCheck the stops of the top walk against your own experience: they are a typical process, not a measured one.',
            'La misma persona hace el mismo recado dos veces. El camino de arriba es largo y tiene salas de espera (los relojes de arena giran); el de abajo es corto.\nNo digas días ni horas: no se ha medido nada. La longitud del camino es el argumento.\nContrasta las paradas del camino de arriba con tu experiencia: son un proceso típico, no medido.',
          ),
        },
        {
          id: 'before-after',
          layout: 'story',
          title: bi('The same project asks for AI', 'El mismo proyecto pide IA'),
          lead: bi('Without self-service, and with it.', 'Sin autoservicio, y con él.'),
          lanes: [
            {
              name: bi('Before\nwithout platform', 'Antes\nsin plataforma'),
              pace: 'slow',
              steps: [
                { label: bi('Open a\nticket', 'Abrir un\nticket') },
                { label: bi('Wait for the Foundry resource', 'Esperar el recurso Foundry'), wait: true },
                { label: bi('Wait for the model quota', 'Esperar la cuota del modelo'), wait: true },
                { label: bi('Key sent by chat', 'Clave enviada por chat') },
                { label: bi('Network opened by hand', 'Red abierta a mano') },
                { label: bi('Nobody knows who spends', 'Nadie sabe quién gasta'), wait: true },
              ],
              result: bi('Works, with no owner', 'Funciona, sin dueño'),
            },
            {
              name: bi('Now\nself-service', 'Ahora\nautoservicio'),
              pace: 'fast',
              steps: [
                { label: bi('Fill in the form', 'Rellenar el formulario') },
                { label: bi('Repo, project and gateway', 'Repo, proyecto y gateway') },
                { label: bi('Gate on every PR', 'Gate en cada PR') },
              ],
              result: bi('Running, with owner and counter', 'En marcha, con dueño y contador'),
            },
          ],
          note: bi(
            'The animation runs both lanes at once. The slow lane is the one with waits (dashed boxes); the fast lane finishes early.\nDo not say days or hours: nothing was measured. The length of the lane is the argument.\nCheck the steps of the top lane against your own experience before presenting: they are a typical process, not a measured one.',
            'La animación recorre los dos carriles a la vez. El lento es el de las esperas (cajas punteadas); el rápido termina antes.\nNo digas días ni horas: no se ha medido nada. La longitud del carril es el argumento.\nContrasta los pasos del carril de arriba con tu experiencia antes de presentar: son un proceso típico, no medido.',
          ),
        },
        {
          id: 'three-pieces',
          layout: 'points',
          title: bi('Three pieces, one path', 'Tres piezas, un camino'),
          items: [
            {
              title: bi('Backstage asks', 'Backstage pide'),
              icon: 'backstage',
              text: bi('The form, the catalog and who owns what.', 'El formulario, el catálogo y quién es dueño de qué.'),
            },
            {
              title: bi('The gateway measures', 'El gateway mide'),
              icon: 'apim',
              text: bi('Every request passes through it, with a team.', 'Cada petición pasa por él, con un equipo.'),
            },
            {
              title: bi('Foundry runs', 'Foundry ejecuta'),
              icon: 'ai-foundry',
              text: bi('Models, projects, traces and evaluations.', 'Modelos, proyectos, trazas y evaluaciones.'),
            },
          ],
          note: bi(
            'One sentence per piece. We open each one later, with a demo.\nBackstage is CNCF Incubating, not graduated: someone in the room knows.\nThe repository is the fourth piece: it says what is allowed.',
            'Una frase por pieza. Abrimos cada una después, con una demo.\nBackstage es CNCF Incubating, no graduado: alguien en la sala lo sabe.\nEl repositorio es la cuarta pieza: dice lo que está permitido.',
          ),
        },
      ],
    },
    {
      id: 'map',
      title: bi('The map', 'El mapa'),
      slides: [
        {
          id: 'map-section',
          layout: 'section',
          number: '02',
          title: bi('The map', 'El mapa'),
          lead: bi('Three pieces and two flows.', 'Tres piezas y dos flujos.'),
          note: bi('Section two. The map first, then each piece.', 'Sección dos. Primero el mapa, luego cada pieza.'),
        },
        {
          id: 'architecture',
          layout: 'diagram',
          title: bi('The gateway is in the middle', 'El gateway está en el centro'),
          lead: bi('Orange happens once, when the team is created. Blue happens on every request.', 'Naranja pasa una vez, al crear el equipo. Azul pasa en cada petición.'),
          nodes: [
            { id: 'dev', icon: 'user', x: 4, y: 2, w: 28, h: 13, label: bi('Developer', 'Developer'), sub: bi('a team', 'un equipo') },
            { id: 'bs', icon: 'backstage', x: 58, y: 2, w: 44, h: 13, label: bi('Backstage', 'Backstage'), sub: bi('asks and registers', 'pide y registra'), tone: 'clay' },
            { id: 'repo', icon: 'github', x: 4, y: 27, w: 38, h: 14, label: bi('Repo', 'Repo'), sub: bi('required check', 'check requerido') },
            { id: 'gw', icon: 'apim', x: 60, y: 27, w: 40, h: 14, label: bi('AI Gateway', 'AI Gateway'), sub: bi('counts tokens', 'cuenta tokens'), tone: 'sky' },
            { id: 'fp', icon: 'ai-foundry', x: 118, y: 27, w: 40, h: 14, label: bi('Foundry', 'Foundry'), sub: bi('project + model', 'proyecto + modelo'), tone: 'sage' },
            { id: 'app', icon: 'app', x: 4, y: 47, w: 38, h: 11, label: bi('Team app', 'App del equipo') },
          ],
          edges: [
            { from: 'dev', to: 'bs', label: bi('fields', 'campos') },
            { from: 'bs', to: 'repo', fromSide: 'b', toSide: 't', tone: 'clay' },
            { from: 'bs', to: 'gw', fromSide: 'b', toSide: 't', tone: 'clay' },
            { from: 'bs', to: 'fp', fromSide: 'b', toSide: 't', tone: 'clay' },
            { from: 'app', to: 'gw', fromSide: 'r', toSide: 'b', label: bi('token', 'token'), tone: 'sky' },
            { from: 'gw', to: 'fp', label: bi('MI', 'MI'), tone: 'sky' },
          ],
          caption: bi('Foundry never sees the developer. It only sees the gateway.', 'Foundry nunca ve al desarrollador. Solo ve al gateway.'),
          note: bi(
            'Two flows.\nProvisioning, orange: Backstage creates the repo, the gateway subscription and the Foundry project. It happens once.\nExecution, blue: the app calls the gateway with its token; the gateway reaches Foundry with its managed identity (MI).\nThe gateway is the only piece that sees the caller on every request. That is why it sits in the middle.',
            'Dos flujos.\nAprovisionamiento, naranja: Backstage crea el repo, la suscripción del gateway y el proyecto de Foundry. Pasa una vez.\nEjecución, azul: la app llama al gateway con su token; el gateway llega a Foundry con su identidad gestionada (MI).\nEl gateway es la única pieza que ve al llamante en cada petición. Por eso está en el centro.',
          ),
        },
        {
          id: 'provisioning',
          layout: 'diagram',
          title: bi('One form provisions five things', 'Un formulario aprovisiona cinco cosas'),
          lead: bi('The steps of the template, in order.', 'Los pasos de la plantilla, en orden.'),
          nodes: [
            { id: 'n1', icon: 'template', x: 1, y: 2, w: 27, h: 29, label: bi('Skeleton', 'Esqueleto'), sub: bi('fetch:\ntemplate', 'fetch:\ntemplate'), tone: 'clay' },
            { id: 'n2', icon: 'foundry-project', x: 33.5, y: 3, w: 27, h: 28, label: bi('Foundry\nproject', 'Proyecto\nFoundry'), sub: bi('foundry:\nensure-project', 'foundry:\nensure-project'), tone: 'sage' },
            { id: 'n3', icon: 'apim', x: 66, y: 3, w: 27, h: 28, label: bi('Gateway', 'Gateway'), sub: bi('apim:ensure-\nsubscription', 'apim:ensure-\nsubscription'), tone: 'sky' },
            { id: 'n4', icon: 'github', x: 98.5, y: 3, w: 27, h: 28, label: bi('Repo', 'Repo'), sub: bi('publish:\ngithub', 'publish:\ngithub'), tone: 'clay' },
            { id: 'n5', icon: 'backstage', x: 131, y: 3, w: 27, h: 28, label: bi('Catalog', 'Catálogo'), sub: bi('catalog:\nregister', 'catalog:\nregister'), tone: 'clay' },
            { id: 'r1', x: 1, y: 41, w: 27, h: 16, label: bi('agent\nevals\ninfra', 'agent\nevals\ninfra') },
            { id: 'r2', x: 33.5, y: 41, w: 27, h: 16, label: bi('project +\ndeployment', 'proyecto +\ndespliegue') },
            { id: 'r3', x: 66, y: 41, w: 27, h: 16, label: bi('one counter\nper team', 'un contador\npor equipo'), tone: 'sky' },
            { id: 'r4', x: 98.5, y: 41, w: 27, h: 16, label: bi('protected\nbranch + check', 'rama protegida\n+ check') },
            { id: 'r5', x: 131, y: 41, w: 27, h: 16, label: bi('owner and\ndependencies', 'dueño y\ndependencias') },
          ],
          edges: [
            { from: 'n1', to: 'n2' },
            { from: 'n2', to: 'n3' },
            { from: 'n3', to: 'n4' },
            { from: 'n4', to: 'n5' },
            { from: 'n1', to: 'r1', tone: 'clay' },
            { from: 'n2', to: 'r2', tone: 'sage' },
            { from: 'n3', to: 'r3', tone: 'sky' },
            { from: 'n4', to: 'r4', tone: 'clay' },
            { from: 'n5', to: 'r5', tone: 'clay' },
          ],
          caption: bi('Each step fails closed: if one fails, no repository is created.', 'Cada paso falla cerrado: si uno falla, no se crea el repositorio.'),
          note: bi(
            'These are the five steps of platform/backstage/template/template.yaml. The third one, apim:ensure-subscription, is new: it gives the team its counter in the gateway.\nIt is written against the ARM API but it has not been run against a real gateway: say so.\nFoundry action: 121 lines. Fails closed: a repository without a project is a repo whose infra cannot deploy.',
            'Son los cinco pasos de platform/backstage/template/template.yaml. El tercero, apim:ensure-subscription, es nuevo: da al equipo su contador en el gateway.\nEstá escrito contra la API de ARM pero no se ha ejecutado contra un gateway real: dilo.\nAcción de Foundry: 121 líneas. Falla cerrado: un repo sin proyecto es un repo cuya infra no puede desplegarse.',
          ),
        },
      ],
    },
    {
      id: 'backstage',
      title: bi('Backstage', 'Backstage'),
      slides: [
        {
          id: 'backstage-section',
          layout: 'section',
          number: '03',
          title: bi('Backstage', 'Backstage'),
          lead: bi('Where the team asks, and where we remember who owns what.', 'Donde el equipo pide, y donde recordamos quién es dueño de qué.'),
          icon: 'backstage',
          note: bi('First piece. Three slides and then the catalog on screen.\nBackstage is CNCF Incubating, not graduated: someone in the room knows.', 'Primera pieza. Tres diapositivas y luego el catálogo en pantalla.\nBackstage es CNCF Incubating, no graduado: alguien en la sala lo sabe.'),
        },
        {
          id: 'backstage-role',
          layout: 'diagram',
          title: bi('Backstage: the front door', 'Backstage: la puerta de entrada'),
          lead: bi('It creates things. It does not run them.', 'Crea cosas. No las ejecuta.'),
          nodes: [
            { id: 'dev', icon: 'user', x: 3, y: 22, w: 34, h: 14, label: bi('Developer', 'Developer'), sub: bi('five fields', 'cinco campos') },
            { id: 'bs', icon: 'backstage', x: 56, y: 17, w: 44, h: 24, label: bi('Backstage', 'Backstage'), sub: bi('catalog + template', 'catálogo + plantilla'), tone: 'clay' },
            { id: 'o1', icon: 'github', x: 114, y: 1, w: 44, h: 12, label: bi('Repo', 'Repo'), sub: bi('agent, evals, infra', 'agent, evals, infra') },
            { id: 'o2', icon: 'foundry-project', x: 114, y: 16, w: 44, h: 12, label: bi('Foundry project', 'Proyecto Foundry'), sub: bi('custom action', 'acción propia'), tone: 'sage' },
            { id: 'o3', icon: 'apim', x: 114, y: 31, w: 44, h: 12, label: bi('Gateway subscription', 'Alta en el gateway'), sub: bi('custom action', 'acción propia'), tone: 'sky' },
            { id: 'o4', icon: 'backstage', x: 114, y: 46, w: 44, h: 12, label: bi('Catalog entry', 'Entrada de catálogo'), sub: bi('owner, dependencies', 'dueño, dependencias') },
            { id: 'no', x: 56, y: 46, w: 44, h: 12, label: bi('No deploys, no evals', 'Sin despliegues ni evals'), tone: 'ghost' },
          ],
          edges: [
            { from: 'dev', to: 'bs', tone: 'clay' },
            { from: 'bs', to: 'o1', fromSide: 'r', toSide: 'l', tone: 'clay' },
            { from: 'bs', to: 'o2', fromSide: 'r', toSide: 'l', tone: 'clay' },
            { from: 'bs', to: 'o3', fromSide: 'r', toSide: 'l', tone: 'clay' },
            { from: 'bs', to: 'o4', fromSide: 'r', toSide: 'l', tone: 'clay' },
          ],
          caption: bi('What it offers: a catalog, a template, actions. What it enables: nobody asks permission to start.', 'Qué ofrece: catálogo, plantilla, acciones. Qué habilita: nadie pide permiso para empezar.'),
          note: bi(
            'Backstage does two things here: the catalog (who owns what) and the template (a form that creates things).\nOne form, four outputs. Two of them go through custom actions we wrote.\nThe dashed box is what it does not do. The moment the portal is the only place a rule exists, the rule is invisible in a pull request.\nA template is a product: it needs an owner, a version and a way to update the repos it generated.',
            'Backstage hace dos cosas aquí: el catálogo (quién es dueño de qué) y la plantilla (un formulario que crea cosas).\nUn formulario, cuatro salidas. Dos pasan por acciones propias que escribimos.\nLa caja punteada es lo que no hace. Cuando el portal es el único sitio donde existe una regla, la regla es invisible en una pull request.\nUna plantilla es un producto: necesita dueño, versión y una forma de actualizar los repos que generó.',
          ),
        },
        {
          id: 'backstage-catalog',
          layout: 'screenshot',
          title: bi('The catalog is the memory', 'El catálogo es la memoria'),
          image: 'shots/backstage-catalog.png',
          url: 'demo.backstage.io/catalog',
          callouts: [
            { x: 49.2, y: 36.3, title: bi('Owner', 'Dueño'), text: bi('Every component has a team.', 'Cada componente tiene un equipo.') },
            { x: 39.4, y: 36.3, title: bi('System', 'Sistema'), text: bi('What it belongs to.', 'A qué pertenece.') },
            { x: 65, y: 36.3, title: bi('Lifecycle', 'Ciclo de vida'), text: bi('How much to trust it.', 'Cuánto fiarse.') },
            { x: 91.2, y: 10.5, title: bi('Create', 'Create'), text: bi('The golden path starts here.', 'Aquí arranca el golden path.') },
          ],
          note: bi(
            'This is the public Backstage demo, not our catalog. The idea is the same.\nOne row per workload. Owner, system and lifecycle answer who do I call.\nThe Create button is the door to the template. In the live demo this is the lab Backstage.',
            'Esta es la demo pública de Backstage, no nuestro catálogo. La idea es la misma.\nUna fila por carga. Dueño, sistema y ciclo de vida responden a quién llamo.\nEl botón Create es la puerta a la plantilla. En la demo en vivo es el Backstage del laboratorio.',
          ),
        },
        {
          id: 'backstage-template',
          layout: 'diagram',
          title: bi('Five fields in, a repo out', 'Cinco campos entran, un repo sale'),
          lead: bi('personal_data changes what is generated.', 'personal_data cambia lo que se genera.'),
          nodes: [
            { id: 'f1', x: 3, y: 2, w: 36, h: 9, label: bi('name', 'name') },
            { id: 'f2', x: 3, y: 13, w: 36, h: 9, label: bi('owner', 'owner') },
            { id: 'f3', x: 3, y: 24, w: 36, h: 9, label: bi('model', 'model') },
            { id: 'f4', x: 3, y: 35, w: 36, h: 9, label: bi('tpm', 'tpm') },
            { id: 'f5', x: 3, y: 46, w: 36, h: 9, label: bi('personal_data', 'personal_data'), tone: 'clay' },
            { id: 'tpl', icon: 'template', x: 62, y: 17, w: 36, h: 24, label: bi('template.yaml', 'template.yaml'), tone: 'clay' },
            { id: 's1', x: 108, y: 2, w: 50, h: 9, label: bi('agent/ · prompt', 'agent/ · prompt') },
            { id: 's2', x: 108, y: 13, w: 50, h: 9, label: bi('evals/ · dataset + gate', 'evals/ · dataset + gate') },
            { id: 's3', x: 108, y: 24, w: 50, h: 9, label: bi('infra/ · project + quota', 'infra/ · proyecto + cuota') },
            { id: 's4', x: 108, y: 35, w: 50, h: 9, label: bi('.github/ · check', '.github/ · check') },
            { id: 's5', x: 108, y: 46, w: 50, h: 9, label: bi('catalog-info.yaml', 'catalog-info.yaml') },
          ],
          edges: [
            { from: 'f1', to: 'tpl' },
            { from: 'f2', to: 'tpl' },
            { from: 'f3', to: 'tpl' },
            { from: 'f4', to: 'tpl' },
            { from: 'f5', to: 'tpl', tone: 'clay' },
            { from: 'tpl', to: 's1', tone: 'clay' },
            { from: 'tpl', to: 's2', tone: 'clay' },
            { from: 'tpl', to: 's3', tone: 'clay' },
            { from: 'tpl', to: 's4', tone: 'clay' },
            { from: 'tpl', to: 's5', tone: 'clay' },
          ],
          caption: bi('The model comes from a list. The quota exists before the first invoice.', 'El modelo sale de una lista. La cuota existe antes de la primera factura.'),
          note: bi(
            'Every field that is missing is a decision someone makes in main on a Friday at 6pm.\nThe model is picked from the approved list, never typed.\npersonal_data adds the retention policy and the redaction step: that is the difference between a template and a form.\nWhat the template does not let you decide matters more than what it creates.',
            'Cada campo que falta es una decisión que alguien toma en main un viernes a las 18:00.\nEl modelo se elige de la lista aprobada, nunca se escribe.\npersonal_data añade la política de retención y el paso de redacción: esa es la diferencia entre plantilla y formulario.\nLo que la plantilla no te deja decidir importa más que lo que crea.',
          ),
        },
        {
          id: 'backstage-actions',
          layout: 'screenshot',
          title: bi('There is no Foundry action. You write it.', 'No hay acción de Foundry. La escribes tú.'),
          image: 'shots/backstage-actions.png',
          url: 'demo.backstage.io/create/actions',
          callouts: [
            { x: 29.8, y: 8.7, title: bi('Actions', 'Actions'), text: bi('Every step is an action.', 'Cada paso es una acción.') },
            { x: 14.4, y: 57.3, title: bi('catalog:register', 'catalog:register'), text: bi('Ships with Backstage.', 'Viene con Backstage.') },
            { x: 96, y: 18, title: bi('foundry:ensure-project', 'foundry:ensure-project'), text: bi('Search "foundry": nothing. Ours: 121 lines.', 'Busca "foundry": nada. La nuestra: 121 líneas.') },
          ],
          note: bi(
            'The Azure module of Backstage publishes to Azure DevOps. There is no official Foundry action.\nSo the platform team writes one: it calls the Foundry control plane with the caller\'s federated identity. 121 lines in platform/backstage/template/actions/foundry-project.ts.\nThe gateway action, apim-subscription.ts, follows the same rules: idempotent, fails closed, never returns a key.\nSaying we wrote it is more credible than implying a plugin exists.',
            'El módulo de Azure de Backstage publica en Azure DevOps. No hay acción oficial de Foundry.\nAsí que el equipo de plataforma escribe una: llama al plano de control de Foundry con la identidad federada de quien pide. 121 líneas en platform/backstage/template/actions/foundry-project.ts.\nLa acción del gateway, apim-subscription.ts, sigue las mismas reglas: idempotente, falla cerrado, nunca devuelve una clave.\nDecir que la escribimos es más creíble que insinuar que hay un plugin.',
          ),
        },
        {
          id: 'action-code',
          layout: 'screenshot',
          title: bi('Four rules, written in the action', 'Cuatro reglas, escritas en la acción'),
          image: 'shots/github-action.png',
          url: 'github.com/Kerman-Sanjuan/backstage-foundry/blob/main/.../foundry-project.ts',
          callouts: [
            { x: 70, y: 61.9, title: bi('Idempotent', 'Idempotente'), text: bi('Run the template twice: still one project.', 'Lanza la plantilla dos veces: sigue habiendo un proyecto.') },
            { x: 70, y: 66, title: bi('Fails closed', 'Falla cerrado'), text: bi('No project, no repository.', 'Sin proyecto, no hay repositorio.') },
            { x: 70, y: 70.5, title: bi('Never returns a key', 'Nunca devuelve una clave'), text: bi('The pipeline uses federated OIDC.', 'El pipeline usa OIDC federado.') },
            { x: 70, y: 75, title: bi('No token limit here', 'Aquí no hay límite de tokens'), text: bi('That is the gateway policy.', 'Eso es la política del gateway.') },
          ],
          note: bi(
            'This is the real file on GitHub, 121 lines. The four rules are the comment at the top: they are the design, written where the code is.\nIdempotent: re-running the template must not create a second project.\nFails closed: a repository without a project is a repo whose infra cannot deploy.\nNever returns a key.\nSetting a quota in two places is how you get two answers: the token limit belongs to the gateway policy.',
            'Este es el fichero real en GitHub, 121 líneas. Las cuatro reglas son el comentario de arriba: son el diseño, escrito donde está el código.\nIdempotente: relanzar la plantilla no debe crear un segundo proyecto.\nFalla cerrado: un repo sin proyecto es un repo cuya infra no puede desplegarse.\nNunca devuelve una clave.\nPoner una cuota en dos sitios es como se consiguen dos respuestas: el límite de tokens es de la política del gateway.',
          ),
        },
      ],
    },
    {
      id: 'gateway',
      title: bi('AI Gateway', 'AI Gateway'),
      slides: [
        {
          id: 'gateway-section',
          layout: 'section',
          number: '04',
          title: bi('AI Gateway', 'AI Gateway'),
          lead: bi('The only piece that sees who is calling on every request.', 'La única pieza que ve quién llama en cada petición.'),
          icon: 'apim',
          note: bi('Second piece. This is where the cost and the limits live.', 'Segunda pieza. Aquí viven el coste y los límites.'),
        },
        {
          id: 'gateway-map',
          layout: 'diagram',
          title: bi('The gateway sees who is calling', 'El gateway ve quién llama'),
          lead: bi('What it offers: limits, attribution, stable aliases.', 'Qué ofrece: límites, atribución, alias estables.'),
          nodes: [
            { id: 'zgw', icon: 'apim', x: 46, y: 1, w: 66, h: 47, label: bi('AI Gateway · APIM', 'AI Gateway · APIM'), tone: 'zone', accent: 'sky' },
            { id: 'a', icon: 'app', x: 3, y: 4, w: 36, h: 11, label: bi('Team A app', 'App equipo A') },
            { id: 'b', icon: 'app', x: 3, y: 19, w: 36, h: 11, label: bi('Team B app', 'App equipo B') },
            { id: 'c', x: 3, y: 48, w: 36, h: 10, label: bi('Team C', 'Equipo C'), sub: bi('holds a key', 'tiene una clave'), tone: 'ghost' },
            { id: 'i1', x: 50, y: 8, w: 58, h: 8.5, label: bi('1 · who is calling', '1 · quién llama'), tone: 'sky' },
            { id: 'i2', x: 50, y: 18, w: 58, h: 8.5, label: bi('2 · tokens/min per team', '2 · tokens/min por equipo'), tone: 'sky' },
            { id: 'i3', x: 50, y: 28, w: 58, h: 8.5, label: bi('3 · attribution header', '3 · cabecera de atribución'), tone: 'sky' },
            { id: 'i4', x: 50, y: 38, w: 58, h: 8.5, label: bi('4 · managed identity', '4 · identidad gestionada'), tone: 'sky' },
            { id: 'f', icon: 'ai-foundry', x: 124, y: 1, w: 34, h: 57, label: bi('Foundry', 'Foundry'), sub: bi('deployments\nquota', 'despliegues\ncuota'), tone: 'sage' },
          ],
          edges: [
            { from: 'a', to: 'zgw', tone: 'sky' },
            { from: 'b', to: 'zgw', tone: 'sky' },
            { from: 'i4', to: 'f', tone: 'sage' },
            { from: 'c', to: 'f', label: bi('bypass', 'bypass'), tone: 'clay', dashed: true },
          ],
          caption: bi('What it enables: a new team shares capacity and cannot spend without limit.', 'Qué habilita: un equipo nuevo comparte capacidad y no puede gastar sin límite.'),
          note: bi(
            'Four things happen inside: identify the caller, limit tokens per team (not requests), add the attribution header, reach Foundry with the gateway\'s managed identity.\nExceeding the rate returns 429, exceeding the quota returns 403.\nTeam C holds a key to the model endpoint: it skips everything. Closing that takes Azure Policy to deny direct deployments in spoke projects and a backend restricted to the gateway identity. It is governance, not a gateway feature.\nFor a single team, Foundry quotas are enough: the gateway earns its place when several callers share capacity.',
            'Dentro pasan cuatro cosas: identificar al llamante, limitar tokens por equipo (no peticiones), añadir la cabecera de atribución y llegar a Foundry con la identidad gestionada del gateway.\nSuperar la tasa devuelve 429, superar la cuota devuelve 403.\nEl equipo C tiene una clave del endpoint del modelo: se salta todo. Cerrarlo exige Azure Policy para denegar despliegues directos en los proyectos spoke y un backend restringido a la identidad del gateway. Es gobierno, no una función del gateway.\nPara un solo equipo bastan las cuotas de Foundry: el gateway se justifica cuando varios llamantes comparten capacidad.',
          ),
        },
        {
          id: 'gateway-policy',
          layout: 'code',
          title: bi('The policy is code', 'La política es código'),
          lead: bi('Tokens, not requests. One counter per subscription.', 'Tokens, no peticiones. Un contador por suscripción.'),
          code: {
            title: bi('platform/policies/llm-token-limit.xml (extract)', 'platform/policies/llm-token-limit.xml (extracto)'),
            lines: [
              '<llm-token-limit',
              '  counter-key="@(context.Subscription.Id)"',
              '  tokens-per-minute="20000"',
              '  estimate-prompt-tokens="true"',
              '  remaining-tokens-header-name="x-remaining-tokens" />',
              '<set-header name="x-attribution-team" exists-action="override">',
              '  <value>@(context.Subscription.Name)</value>',
              '</set-header>',
              '<authentication-managed-identity',
              '  resource="https://cognitiveservices.azure.com" />',
            ],
            highlight: [1, 2, 6, 8],
          },
          note: bi(
            'A 200 token answer and a 30 000 token summary are one request each: any limit in requests limits nothing.\ncounter-key by subscription is what makes attribution possible: one counter per team.\nThe attribution header lets traces in App Insights be joined with the cost report.\nThe gateway reaches the backend with its managed identity, never the caller\'s.\nRe-check the current state of APIM as an AI gateway and of Azure AI Gateway before the talk: this moved in 2026.',
            'Una respuesta de 200 tokens y un resumen de 30 000 son una petición cada uno: un límite en peticiones no limita nada.\ncounter-key por suscripción es lo que hace posible la atribución: un contador por equipo.\nLa cabecera de atribución permite cruzar las trazas de App Insights con el informe de coste.\nEl gateway llega al backend con su identidad gestionada, nunca la del llamante.\nRevisa el estado actual de APIM como gateway de IA y de Azure AI Gateway antes de la charla: se movió en 2026.',
          ),
        },
      ],
    },
    {
      id: 'foundry',
      title: bi('Foundry', 'Foundry'),
      slides: [
        {
          id: 'foundry-section',
          layout: 'section',
          number: '05',
          title: bi('Foundry', 'Foundry'),
          lead: bi('Where the models run, and where each team has its own project.', 'Donde se ejecutan los modelos y donde cada equipo tiene su proyecto.'),
          icon: 'ai-foundry',
          note: bi('Third piece. Resource for governance, project for development.', 'Tercera pieza. Recurso para el gobierno, proyecto para el desarrollo.'),
        },
        {
          id: 'foundry-map',
          layout: 'diagram',
          title: bi('Foundry: resource and projects', 'Foundry: recurso y proyectos'),
          lead: bi('What it offers: models, projects, traces, evaluations.', 'Qué ofrece: modelos, proyectos, trazas, evaluaciones.'),
          nodes: [
            { id: 'res', icon: 'ai-foundry', x: 0, y: 1, w: 108, h: 57, label: bi('Foundry resource · governance', 'Recurso Foundry · gobierno'), tone: 'zone', accent: 'sage' },
            { id: 'dep', icon: 'foundry-models', x: 4, y: 9, w: 32, h: 46, label: bi('Model\ndeployments', 'Despliegues\nde modelos'), sub: bi('gpt-4o-mini\ngpt-4o\no4-mini\nquota (tpm)', 'gpt-4o-mini\ngpt-4o\no4-mini\ncuota (tpm)'), tone: 'sage' },
            { id: 'p1', icon: 'foundry-project', x: 46, y: 9, w: 58, h: 13, label: bi('Project: team A, dev', 'Proyecto: equipo A, dev'), sub: bi('agents, datasets, evals', 'agentes, datasets, evals') },
            { id: 'p2', icon: 'foundry-project', x: 46, y: 25, w: 58, h: 13, label: bi('Project: team A, pro', 'Proyecto: equipo A, pro'), sub: bi('same team, other environment', 'mismo equipo, otro entorno') },
            { id: 'p3', icon: 'foundry-project', x: 46, y: 41, w: 58, h: 13, label: bi('Project: team B, dev', 'Proyecto: equipo B, dev'), sub: bi('its own quota and RBAC', 'su propia cuota y RBAC') },
            { id: 'tr', icon: 'app-insights', x: 116, y: 9, w: 42, h: 13, label: bi('OTel traces', 'Trazas OTel'), sub: bi('App Insights', 'App Insights') },
            { id: 'ev', x: 116, y: 25, w: 42, h: 13, label: bi('Evaluations', 'Evaluaciones'), sub: bi('per project', 'por proyecto') },
            { id: 'net', x: 116, y: 41, w: 42, h: 13, label: bi('Network, identity', 'Red, identidad'), sub: bi('platform team', 'equipo de plataforma'), tone: 'ghost' },
          ],
          edges: [
            { from: 'dep', to: 'p1', tone: 'sage' },
            { from: 'dep', to: 'p2', tone: 'sage' },
            { from: 'dep', to: 'p3', tone: 'sage' },
            { from: 'p1', to: 'tr' },
            { from: 'p2', to: 'ev' },
            { from: 'res', to: 'net', dashed: true },
          ],
          caption: bi('What it enables: the team works in its project without touching network or identity.', 'Qué habilita: el equipo trabaja en su proyecto sin tocar red ni identidad.'),
          note: bi(
            'Three boundaries.\nResource: governance. Network, encryption, model deployments, quota. The platform team owns it.\nProject: development. Agents, datasets, evaluations. One per team and per environment.\nRepository: accountability. Foundry cannot see who answers for a workload; Backstage can.\nConfusing resource and project is the expensive mistake: a shared project where nobody owns the quota, or a resource per team and no control of egress.',
            'Tres fronteras.\nRecurso: gobierno. Red, cifrado, despliegues de modelos, cuota. Es del equipo de plataforma.\nProyecto: desarrollo. Agentes, datasets, evaluaciones. Uno por equipo y por entorno.\nRepositorio: responsabilidad. Foundry no ve quién responde por una carga; Backstage sí.\nConfundir recurso y proyecto es el error caro: un proyecto compartido sin dueño de la cuota, o un recurso por equipo y sin control de salida.',
          ),
        },
        {
          id: 'foundry-terraform',
          layout: 'code',
          title: bi('The boundary, in Terraform', 'La frontera, en Terraform'),
          lead: bi('No public network, no local keys. The project lives inside the resource.', 'Sin red pública, sin claves locales. El proyecto vive dentro del recurso.'),
          code: {
            title: bi('platform/terraform/foundry.tf (extract)', 'platform/terraform/foundry.tf (extracto)'),
            lines: [
              'resource "azurerm_cognitive_account" "foundry" {',
              '  kind                               = "AIServices"',
              '  public_network_access_enabled      = false',
              '  local_auth_enabled                 = false',
              '  outbound_network_access_restricted = true',
              '}',
              '',
              'resource "azurerm_cognitive_account_project" "team" {',
              '  cognitive_account_id = azurerm_cognitive_account.foundry.id',
              '}',
            ],
            highlight: [2, 3, 4, 8],
          },
          note: bi(
            'Not applied anywhere in the repository: there is no subscription and no state. It is the shape of the boundary, not a module for production. Say it.\nTerraform plan against your own subscription is the first thing to run, and the first thing to expect to change: resource providers move.\nNote what is not here: no per-team token limit. The deployment quota is a ceiling; the per-caller split is a gateway policy.',
            'No se aplica en ningún sitio del repositorio: no hay suscripción ni estado. Es la forma de la frontera, no un módulo para producción. Dilo.\nTerraform plan contra tu propia suscripción es lo primero que hay que ejecutar, y lo primero que cambiará: los resource providers se mueven.\nFíjate en lo que no está: no hay límite de tokens por equipo. La cuota del despliegue es un techo; el reparto por llamante es una política del gateway.',
          ),
        },
      ],
    },
    {
      id: 'demos',
      title: bi('Demos', 'Demos'),
      slides: [
        {
          id: 'demos-section',
          layout: 'section',
          number: '06',
          title: bi('Demos', 'Demos'),
          lead: bi('Everything running, nothing slides.', 'Todo funcionando, nada de diapositivas.'),
          note: bi('Section six. Open every tab before the session. The tabs are ready, nothing is built on stage.', 'Sección seis. Abre todas las pestañas antes de la sesión. Las pestañas están listas, nada se construye en el escenario.'),
        },
        {
          id: 'demo-1',
          layout: 'demo',
          title: bi('Demo 1: the form provisions the team', 'Demo 1: el formulario aprovisiona al equipo'),
          lead: bi('Five fields in. Look at what appears in Azure.', 'Cinco campos entran. Mira lo que aparece en Azure.'),
          stops: [
            { where: 'Backstage', text: bi('Create, then "AI agent from the golden path"', 'Create y luego "AI agent from the golden path"') },
            { where: 'Backstage', text: bi('Fill in the five fields and watch the steps run', 'Rellenar los cinco campos y ver los pasos ejecutarse') },
            { where: 'Azure', text: bi('Foundry: the new project inside the resource', 'Foundry: el proyecto nuevo dentro del recurso') },
            { where: 'Azure', text: bi('APIM: the new subscription of the team', 'APIM: la suscripción nueva del equipo') },
            { where: 'GitHub', text: bi('The repo, with a protected branch and the required check', 'El repo, con rama protegida y el check requerido') },
          ],
          fallback: bi('If it fails: say what it would have done and move to demo 2.', 'Si falla: di lo que habría hecho y pasa a la demo 2.'),
          note: bi(
            'Open every tab before the session. Do not do first-time logins on stage.\nTODO: confirm what is deployed in the lab (Backstage, APIM, Foundry). If Backstage runs only locally, say so. Whatever does not exist is a recording, and the slide says it.\nDemo 1 talks to GitHub and Azure: it is the one that can fail. Never run terraform apply on stage.\nWhat the template does not let you decide: the model comes from the catalog, the dataset is already there, the check is already required.',
            'Abre todas las pestañas antes de la sesión. No hagas el primer login en el escenario.\nPENDIENTE: confirma qué hay desplegado en el laboratorio (Backstage, APIM, Foundry). Si Backstage solo corre en local, dilo. Lo que no exista es una grabación, y la diapositiva lo dice.\nLa demo 1 habla con GitHub y Azure: es la que puede fallar. Nunca ejecutes terraform apply en el escenario.\nLo que la plantilla no te deja decidir: el modelo sale del catálogo, el dataset ya está y el check ya es requerido.',
          ),
        },
        {
          id: 'demo-2',
          layout: 'demo',
          title: bi('Demo 2: the same call, with and without quota', 'Demo 2: la misma llamada, con y sin cuota'),
          lead: bi('Everything goes through the gateway. Then we try to skip it.', 'Todo pasa por el gateway. Luego intentamos saltárnoslo.'),
          stops: [
            { where: 'Terminal', text: bi('Call the gateway with the team key: 200', 'Llamar al gateway con la clave del equipo: 200') },
            { where: 'Terminal', text: bi('Read x-remaining-tokens and x-tokens-consumed', 'Leer x-remaining-tokens y x-tokens-consumed') },
            { where: 'Terminal', text: bi('Go over the quota: 429 with Retry-After', 'Pasarse de la cuota: 429 con Retry-After') },
            { where: 'Terminal', text: bi('Call the Foundry endpoint directly: it fails', 'Llamar directo al endpoint de Foundry: falla') },
            { where: 'Azure', text: bi('App Insights: the call, with the team that made it', 'App Insights: la llamada, con el equipo que la hizo') },
          ],
          fallback: bi('If the lab is down: show the policy slide and say what each header would return.', 'Si el laboratorio cae: enseña la diapositiva de la política y di qué devolvería cada cabecera.'),
          note: bi(
            'TODO: this demo needs APIM and a Foundry deployment really running in the lab. Confirm before the talk (open question in SCRIPT.md).\nThe headers x-remaining-tokens, x-tokens-consumed and Retry-After come from the policy in platform/policies/llm-token-limit.xml.\nThe direct call fails because the Foundry resource has public network access disabled and local keys disabled (foundry.tf). That is what closes the bypass; the gateway alone does not.\nDo not promise an exact error text: read it from the screen.',
            'PENDIENTE: esta demo necesita APIM y un despliegue de Foundry funcionando de verdad en el laboratorio. Confírmalo antes de la charla (pregunta abierta en SCRIPT.md).\nLas cabeceras x-remaining-tokens, x-tokens-consumed y Retry-After salen de la política de platform/policies/llm-token-limit.xml.\nLa llamada directa falla porque el recurso de Foundry tiene el acceso de red público y las claves locales desactivados (foundry.tf). Eso es lo que cierra el bypass; el gateway solo no.\nNo prometas el texto exacto del error: léelo de la pantalla.',
          ),
        },
        {
          id: 'gate',
          layout: 'code',
          title: bi('The gate fits in eight lines', 'El gate cabe en ocho líneas'),
          lead: bi('A metric is above its floor or below it. There is no "review later".', 'Una métrica está por encima de su mínimo o por debajo. No existe "lo miramos luego".'),
          code: {
            title: bi('evals/thresholds.yaml', 'evals/thresholds.yaml'),
            lines: [
              'dataset: dataset.jsonl',
              'evaluators:',
              '  schema_valid:     { min: 1.00 }',
              '  decisions_recall: { min: 0.80 }',
              '  owner_accuracy:   { min: 0.75 }',
              '  invented_owners:  { max: 0 }',
            ],
            highlight: [5],
          },
          note: bi(
            'Four deterministic metrics. No LLM judge in the merge path: a required check must be reproducible.\ninvented_owners is a count with threshold zero: an average over twenty cases hides an invented name.\nRequired in main, or it is a comment. Latency and cost are reported, not gated.\nThe gate only runs on PRs that touch agent or evals.',
            'Cuatro métricas deterministas. Sin juez LLM en el merge: un check requerido tiene que ser reproducible.\ninvented_owners es un conteo con umbral cero: una media sobre veinte casos esconde un nombre inventado.\nRequerido en main, o es un comentario. La latencia y el coste se reportan, no bloquean.\nEl gate solo se ejecuta en las PR que tocan agent o evals.',
          ),
        },
        {
          id: 'gate-fail',
          layout: 'code',
          title: bi('A cheaper prompt, and the gate says no', 'Un prompt más barato, y el gate dice que no'),
          lead: bi('Branch demo/gate-fails. Two metrics fall below their floor.', 'Rama demo/gate-fails. Dos métricas caen bajo su mínimo.'),
          code: {
            title: bi('demo/gate-fails · exit 1', 'demo/gate-fails · exit 1'),
            lines: [
              '$ make demo',
              'schema_valid           1.000   >= 1.00   PASS',
              'decisions_recall       0.625   >= 0.80   FAIL',
              'owner_accuracy         0.925   >= 0.75   PASS',
              'invented_owners            3   <= 0      FAIL',
              'c03  invented owner: Carlos Mendoza',
              'c07  invented owner: Patricia Gil',
              'GATE: FAIL: decisions_recall, invented_owners',
            ],
            highlight: [2, 4, 7],
          },
          note: bi(
            'Real output from the demo/gate-fails branch. The fixtures are synthetic (the repo was built without an Azure subscription): they prove the gate works, not that a model works. Say so.\nNext: the demo, in the browser.',
            'Salida real de la rama demo/gate-fails. Los fixtures son sintéticos (el repo se construyó sin suscripción de Azure): demuestran que el gate funciona, no que un modelo funcione. Dilo.\nLo siguiente: la demo, en el navegador.',
          ),
        },
        {
          id: 'pr-gate',
          layout: 'screenshot',
          title: bi('The real pull request', 'La pull request real'),
          image: 'shots/github-pr.png',
          url: 'github.com/Kerman-Sanjuan/backstage-foundry/pull/1',
          callouts: [
            { x: 53, y: 28.4, title: bi('The branch', 'La rama'), text: bi('demo/gate-fails: a cheaper prompt.', 'demo/gate-fails: un prompt más barato.') },
            { x: 39.5, y: 38, title: bi('Checks', 'Checks'), text: bi('The evaluation gate runs on this PR.', 'El gate de evaluación corre en esta PR.') },
            { x: 70.5, y: 91, title: bi('The red cross', 'La cruz roja'), text: bi('The commit fails. It cannot merge.', 'El commit falla. No puede mergearse.') },
          ],
          note: bi(
            'The real pull request #1 of the repository, open and red. It is public: anyone can look at it after the talk.\nThe description says what a person would write: a cheaper prompt, 40% fewer tokens. The gate does not care about the intention.\nFor the demo, open this page live and refresh. The branch protection is what makes the gate binding; the screenshot shows the failing commit.',
            'La pull request real número 1 del repositorio, abierta y en rojo. Es pública: cualquiera puede mirarla después de la charla.\nLa descripción dice lo que escribiría una persona: un prompt más barato, 40% menos de tokens. Al gate no le importa la intención.\nEn la demo, abre esta página en vivo y refresca. La protección de rama es lo que hace que el gate obligue; la captura muestra el commit que falla.',
          ),
        },
        {
          id: 'demo-3',
          layout: 'demo',
          title: bi('Demo 3: a pull request that cannot merge', 'Demo 3: una pull request que no puede mergearse'),
          lead: bi('A check that warns is not a check. It is a comment with better formatting.', 'Un check que avisa no es un check. Es un comentario con mejor formato.'),
          stops: [
            { where: 'GitHub', text: bi('The open pull request, with the red check', 'La pull request abierta, con el check en rojo') },
            { where: 'GitHub', text: bi('The Merge button, blocked by branch protection', 'El botón de merge, bloqueado por la protección de rama') },
            { where: 'Terminal', text: bi('Read why it is red: the three invented owners', 'Leer por qué está rojo: los tres nombres inventados') },
          ],
          fallback: bi('The pull request is open and red before the session. It is a browser refresh.', 'La pull request está abierta y en rojo antes de la sesión. Es refrescar el navegador.'),
          note: bi(
            'This is the demo that carries the talk. It does not need Azure to be up.\nThe pull request from demo/gate-fails is open and red, not merged, not closed.\nThe line to land: a check that warns is not a check, it is a comment with better formatting.\nIf there is no time: cut demo 1 and keep this one.',
            'Esta es la demo que sostiene la charla. No necesita que Azure esté arriba.\nLa pull request de demo/gate-fails está abierta y en rojo, ni mergeada ni cerrada.\nLa frase que cierra: un check que avisa no es un check, es un comentario con mejor formato.\nSi falta tiempo: quita la demo 1 y quédate con esta.',
          ),
        },
      ],
    },
    {
      id: 'after',
      title: bi('Day two', 'Día dos'),
      slides: [
        {
          id: 'after-section',
          layout: 'section',
          number: '07',
          title: bi('Day two', 'Día dos'),
          lead: bi('Lineage, updates and limits.', 'Linaje, actualizaciones y límites.'),
          note: bi('Section seven. What happens after the demo, when there are ten teams.', 'Sección siete. Lo que pasa después de la demo, cuando hay diez equipos.'),
        },
        {
          id: 'lineage',
          layout: 'diagram',
          title: bi('Lineage is traceability', 'Linaje es trazabilidad'),
          lead: bi('Behind every result: team, model, change, request.', 'Detrás de cada resultado: equipo, modelo, cambio, petición.'),
          nodes: [
            { id: 'r', x: 62, y: 4, w: 36, h: 52, label: bi('A result', 'Un resultado'), sub: bi('in production', 'en producción'), tone: 'clay' },
            { id: 'cat', icon: 'backstage', x: 3, y: 4, w: 46, h: 15, label: bi('Catalog', 'Catálogo'), sub: bi('who owns it?', '¿quién es dueño?'), tone: 'clay' },
            { id: 'repo', icon: 'github', x: 3, y: 41, w: 46, h: 15, label: bi('Repository', 'Repositorio'), sub: bi('which prompt, which eval?', '¿qué prompt, qué eval?') },
            { id: 'tr', icon: 'ai-foundry', x: 111, y: 4, w: 46, h: 15, label: bi('Foundry traces', 'Trazas de Foundry'), sub: bi('what happened?', '¿qué pasó?'), tone: 'sage' },
            { id: 'gw', icon: 'apim', x: 111, y: 41, w: 46, h: 15, label: bi('Gateway', 'Gateway'), sub: bi('who spent what?', '¿quién gastó cuánto?'), tone: 'sky' },
          ],
          edges: [
            { from: 'cat', to: 'r', tone: 'clay' },
            { from: 'repo', to: 'r' },
            { from: 'tr', to: 'r', tone: 'sage' },
            { from: 'gw', to: 'r', tone: 'sky' },
          ],
          caption: bi('Not data lineage. Traceability: team, model, change and request.', 'No es linaje de datos. Es trazabilidad: equipo, modelo, cambio y petición.'),
          note: bi(
            'Say clearly: this is not data lineage, it is traceability. If someone asks about data lineage, that is another conversation.\nTwo questions, two places: why is this answer wrong (traces), how much does team X spend (gateway).\nOne dashboard for both is a dashboard nobody uses.\nThe gateway adds the team as a header so traces and cost can be joined.',
            'Di claro: esto no es linaje de datos, es trazabilidad. Si preguntan por linaje de datos, es otra conversación.\nDos preguntas, dos sitios: por qué esta respuesta es mala (trazas), cuánto gasta el equipo X (gateway).\nUn dashboard para las dos es un dashboard que nadie usa.\nEl gateway añade el equipo como cabecera para poder cruzar trazas y coste.',
          ),
        },
        {
          id: 'after',
          layout: 'story',
          title: bi('Day two: the template changes', 'Día dos: la plantilla cambia'),
          lead: bi('Ten teams already have a repo. Then the template gets an update.', 'Diez equipos ya tienen su repo. Y la plantilla recibe una actualización.'),
          lanes: [
            {
              name: bi('Without\nmaintenance', 'Sin\nmantenimiento'),
              pace: 'slow',
              steps: [
                { label: bi('Template v2 is published', 'Se publica la plantilla v2') },
                { label: bi('Old repos do not know', 'Los repos viejos no se enteran'), wait: true },
                { label: bi('Each team drifts', 'Cada equipo diverge'), wait: true },
                { label: bi('Nobody knows which version runs', 'Nadie sabe qué versión corre'), wait: true },
              ],
              result: bi('Ten copies, ten rules', 'Diez copias, diez reglas'),
            },
            {
              name: bi('Versioned\ntemplate', 'Plantilla\nversionada'),
              pace: 'fast',
              steps: [
                { label: bi('Template v2 is published', 'Se publica la plantilla v2') },
                { label: bi('A PR opens in each repo', 'Se abre una PR en cada repo') },
                { label: bi('The gate checks it', 'El gate la comprueba') },
              ],
              result: bi('One rule, ten repos', 'Una regla, diez repos'),
            },
          ],
          note: bi(
            'The hard part nobody demos: a template that generates twenty repos and cannot update them is copy-paste with extra steps.\nOptions, in increasing effort: re-run the template with a diff comment, a Renovate-style bot that opens PRs, or a shared package the repos consume. Pick one before the tenth team.\nNone of this is built in the repository: it is the next step, and the slide says so.\nAlso day two: close the bypass with Azure Policy, move a project from dev to pro, retire a model from the catalog.',
            'Lo difícil que nadie enseña: una plantilla que genera veinte repos y no puede actualizarlos es copiar y pegar con pasos extra.\nOpciones, de menos a más esfuerzo: relanzar la plantilla con un comentario de diff, un bot tipo Renovate que abre PR, o un paquete compartido que consumen los repos. Elige una antes del décimo equipo.\nNada de esto está construido en el repositorio: es el siguiente paso, y la diapositiva lo dice.\nTambién es día dos: cerrar el bypass con Azure Policy, mover un proyecto de dev a pro, retirar un modelo del catálogo.',
          ),
        },
        {
          id: 'limits',
          layout: 'code',
          title: bi('A renamed field passes the gate', 'Un campo renombrado pasa el gate'),
          lead: bi('due became deadline. Whoever reads due loses every date. The gate is green.', 'due pasó a ser deadline. Quien lee due pierde todas las fechas. El gate está en verde.'),
          code: {
            title: bi('main, with the fixtures edited · exit 0', 'main, con los fixtures editados · exit 0'),
            lines: [
              '$ sed -i \'s/"due"/"deadline"/\' evals/fixtures/*.json',
              '$ make demo',
              'schema_valid           1.000   >= 1.00   PASS',
              'decisions_recall       0.925   >= 0.80   PASS',
              'owner_accuracy         0.975   >= 0.75   PASS',
              'invented_owners            0   <= 0      PASS',
              'GATE: PASS',
            ],
            highlight: [0, 2, 6],
          },
          note: bi(
            'A real run: in a copy of the repo, "due" was renamed to "deadline" in every recorded response. The gate stays green.\nWhy: schema_valid checks that the required fields are there and well formed. due is optional, so a missing one is valid. It checks shape, not meaning.\nDetecting this needs a consumer contract test: a different file and a different conversation.\nAlso say: decisions_recall is fuzzy matching, and the fixtures in the repo are synthetic. Your gate is exactly as good as your dataset.',
            'Una ejecución real: en una copia del repo se renombró "due" a "deadline" en todas las respuestas grabadas. El gate sigue en verde.\nPor qué: schema_valid comprueba que los campos obligatorios estén y estén bien formados. due es opcional, así que si falta es válido. Comprueba forma, no significado.\nDetectarlo exige un test de contrato del consumidor: otro fichero y otra conversación.\nAñade: decisions_recall es coincidencia aproximada y los fixtures del repo son sintéticos. Tu gate es tan bueno como tu dataset.',
          ),
        },
        {
          id: 'closing',
          layout: 'closing',
          title: bi('A form, a gateway and a gate', 'Un formulario, un gateway y un gate'),
          lead: bi(
            'Everything else is a decision someone should have written down.',
            'Todo lo demás es una decisión que alguien debería haber dejado escrita.',
          ),
          links: [
            { label: bi('Repository', 'Repositorio'), value: 'github.com/Kerman-Sanjuan/backstage-foundry' },
            { label: bi('Web', 'Web'), value: 'k3rman.com' },
          ],
          byline: bi('Kerman Sanjuan', 'Kerman Sanjuan'),
          role: bi('Cloud Engineer, Plain Concepts', 'Cloud Engineer, Plain Concepts'),
          note: bi(
            'Confirm the repository URL before presenting.\nQuestions go after this slide.',
            'Confirma la URL del repositorio antes de presentar.\nLas preguntas van después de esta diapositiva.',
          ),
        },
      ],
    },
  ],
}
