import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── PALETTE & THEME ────────────────────────────────────────────────────────
const COLORS = {
  paper: "#f5f0e8",
  ink: "#1a1208",
  red: "#b8001f",
  redGlow: "#ff0033",
  amber: "#c47b00",
  faded: "#8a7a60",
  burn: "#3d2b00",
};

// ─── GLITCH EFFECTS ─────────────────────────────────────────────────────────
const glitchStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Share+Tech+Mono&family=Courier+Prime:wght@400;700&display=swap');

  * { box-sizing: border-box; }

  @keyframes glitch-1 {
    0%, 100% { clip-path: inset(0 0 95% 0); transform: translate(-4px,0); }
    20%       { clip-path: inset(30% 0 50% 0); transform: translate(4px,0); }
    40%       { clip-path: inset(70% 0 10% 0); transform: translate(-2px,0); }
    60%       { clip-path: inset(10% 0 80% 0); transform: translate(3px,0); }
    80%       { clip-path: inset(50% 0 30% 0); transform: translate(-4px,0); }
  }
  @keyframes glitch-2 {
    0%, 100% { clip-path: inset(40% 0 40% 0); transform: translate(4px,0); color: #b8001f; }
    33%       { clip-path: inset(10% 0 70% 0); transform: translate(-4px,0); }
    66%       { clip-path: inset(80% 0 5% 0); transform: translate(2px,0); }
  }
  @keyframes scanlines {
    0%   { background-position: 0 0; }
    100% { background-position: 0 4px; }
  }
  @keyframes flicker {
    0%,100% { opacity:1; } 92% { opacity:1; } 93% { opacity:.85; } 94% { opacity:1; } 96% { opacity:.9; } 97% { opacity:1; }
  }
  @keyframes typewriter {
    from { width: 0; }
    to   { width: 100%; }
  }
  @keyframes blink {
    0%,100% { opacity:1; } 50% { opacity:0; }
  }
  @keyframes redact-reveal {
    0%   { background-color: #1a1208; color: transparent; }
    100% { background-color: transparent; color: inherit; }
  }
  @keyframes stamp-in {
    0%   { transform: scale(3) rotate(-15deg); opacity:0; }
    60%  { transform: scale(0.95) rotate(2deg); opacity:1; }
    100% { transform: scale(1) rotate(-1deg); opacity:1; }
  }
  @keyframes noise {
    0%  { transform: translate(0,0); }
    10% { transform: translate(-2%,-3%); }
    20% { transform: translate(3%,2%); }
    30% { transform: translate(-1%,4%); }
    40% { transform: translate(2%,-1%); }
    50% { transform: translate(-3%,3%); }
    60% { transform: translate(3%,-2%); }
    70% { transform: translate(-2%,1%); }
    80% { transform: translate(1%,-3%); }
    90% { transform: translate(-1%,2%); }
    100%{ transform: translate(0,0); }
  }
  @keyframes terminal-glow {
    0%,100% { text-shadow: 0 0 4px #b8001f, 0 0 8px #b8001f; }
    50%      { text-shadow: 0 0 8px #ff0033, 0 0 16px #ff0033, 0 0 24px #ff003366; }
  }
  @keyframes pulse-border {
    0%,100% { border-color: #b8001f; box-shadow: 0 0 4px #b8001f44; }
    50%      { border-color: #ff0033; box-shadow: 0 0 12px #ff003366; }
  }

  .glitch-title {
    position: relative;
    display: inline-block;
  }
  .glitch-title::before,
  .glitch-title::after {
    content: attr(data-text);
    position: absolute;
    inset: 0;
    opacity: 0.85;
  }
  .glitch-title::before {
    animation: glitch-1 2.5s infinite steps(1);
    color: #b8001f;
  }
  .glitch-title::after {
    animation: glitch-2 3.1s infinite steps(1);
    color: #1a1208;
  }
  .paper-texture {
    background-image:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E"),
      repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(26,18,8,0.03) 28px, rgba(26,18,8,0.03) 29px);
  }
  .scanlines::after {
    content: '';
    position: fixed;
    inset: 0;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px);
    pointer-events: none;
    animation: scanlines 0.15s linear infinite;
    z-index: 9999;
  }
  .terminal-input {
    background: transparent;
    border: none;
    outline: none;
    font-family: 'Share Tech Mono', monospace;
    color: #b8001f;
    caret-color: #b8001f;
    animation: terminal-glow 2s ease-in-out infinite;
    width: 100%;
  }
  .terminal-input::placeholder { color: rgba(184,0,31,0.4); }
  .stamp {
    animation: stamp-in 0.4s cubic-bezier(.36,.07,.19,.97) forwards;
    transform-origin: center;
  }
  .cursor-blink::after {
    content: '█';
    animation: blink 1s step-end infinite;
    color: #b8001f;
    margin-left: 2px;
  }
  .pulse-border { animation: pulse-border 2s ease-in-out infinite; }
`;

// ─── MISSIONS DATA ───────────────────────────────────────────────────────────
const MISSIONS = [
  {
    id: 1,
    date: "25 de Mayo, 1810",
    title: "INFILTRACIÓN INICIAL",
    subtitle: "La Primera Junta toma el poder",
    type: "code",
    narrative: `El Imperio español ha caído en Buenos Aires. La Primera Junta gobierna, pero los realistas controlan las imprentas. Tu misión: hackear el sistema tipográfico colonial e inyectar el primer mensaje de libertad.`,
    challenge: {
      prompt: "Desencripta el código de acceso a la Imprenta de los Niños Expósitos:",
      code: `function libertad(pueblo) {
  return pueblo.map(c => c === '█' ? '?' : c);
}
// Input cifrado: ['M','█','R','█','N','█']
// Completa los caracteres faltantes: `,
      answer: "MORENO",
      hint: "El apellido del Secretario de la Junta...",
    },
    success: "¡ACCESO CONCEDIDO! La imprenta está en tus manos. El 7 de junio de 1810, la Gaceta de Buenos Ayres sale a la luz.",
    asciiArt: `
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
 ░  █▀▀ █▀▀█ █▀▀ █▀▀ ▀▀█▀▀ █▀▀ ░
 ░  █   █▄▄█ █   █▀▀   █   █▀▀ ░
 ░  ▀▀▀ ▀  ▀ ▀▀▀ ▀▀▀   ▀   ▀▀▀ ░
 ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
  },
  {
    id: 2,
    date: "7 de Junio, 1810",
    title: "PRIMERA EDICIÓN",
    subtitle: "Nace la Gaceta de Buenos Ayres",
    type: "keyword",
    narrative: `Los censores realistas han tachado palabras clave del primer ejemplar. Identifica las 4 palabras redactadas que Moreno quería imprimir. Cada error activa una alarma.`,
    challenge: {
      prompt: "Identifica las palabras CENSURADAS (marcadas con ████) en el fragmento:",
      text: `"El pueblo tiene derecho a conocer la ████ de sus gobernantes, y la ████ no puede ser patrimonio de los reyes. La ████ es la antorcha que ilumina a las ████ libres."`,
      blanks: ["conducta", "soberanía", "ilustración", "naciones"],
      words: ["conducta", "soberanía", "ilustración", "naciones", "corona", "virtud", "justicia", "imperio"],
      answer: ["conducta", "soberanía", "ilustración", "naciones"],
    },
    success: "¡PALABRAS RECUPERADAS! El texto de Moreno permanece íntegro. La censura ha fallado.",
    asciiArt: `
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
 ▓  GACETA DE BUENOS AYRES ▓
 ▓  Número I — Junio 1810  ▓
 ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓`,
  },
  {
    id: 3,
    date: "15 de Junio, 1810",
    title: "FIREWALL REALISTA",
    subtitle: "Los espías de la Corona",
    type: "terminal",
    narrative: `Agentes del Virrey Cisneros han instalado un firewall de censura en el nodo tipográfico. Debes ejecutar los comandos correctos para neutralizarlo antes de imprimir la próxima edición.`,
    challenge: {
      prompt: "Terminal > Ejecuta los comandos en orden correcto:",
      commands: [
        { cmd: "sudo rm -rf /virrey/censura/", correct: true },
        { cmd: "chmod +x /junta/libertad_prensa.sh", correct: true },
        { cmd: "ping realistas.es", correct: false },
        { cmd: "./junta/libertad_prensa.sh --fuerza", correct: true },
      ],
      sequence: [0, 1, 3],
      answer: ["sudo rm -rf /virrey/censura/", "chmod +x /junta/libertad_prensa.sh", "./junta/libertad_prensa.sh --fuerza"],
    },
    success: "FIREWALL DESTRUIDO. Los canales de comunicación revolucionaria están libres.",
    asciiArt: `
 [███████████████████] 100%
 FIREWALL_REALISTA: NEUTRALIZADO
 LIBERTAD_PRENSA: ACTIVA`,
  },
  {
    id: 4,
    date: "1 de Julio, 1810",
    title: "ROUSSEAU CIFRADO",
    subtitle: "El Contrato Social como arma",
    type: "code",
    narrative: `Moreno traduce El Contrato Social de Rousseau para distribuirlo junto a la Gaceta. Los inquisidores han cifrado el texto con un código de sustitución. Descifra el mensaje clave.`,
    challenge: {
      prompt: "Descifra el mensaje de Rousseau usando el código ROT-13 invertido:",
      code: `// Código cifrado interceptado:
const msg = "rn cbroyb rf yn shragr qry crbqre";
// Aplica la función para descifrar:
function descifrar(texto) {
  // ROT-13: cada letra avanza 13 posiciones
  return texto.replace(/[a-z]/g, c =>
    String.fromCharCode(((c.charCodeAt(0)-97+??)%26)+97)
  );
}
// ¿Qué número reemplaza a '??' ?`,
      answer: "13",
      hint: "ROT-13 es simétrico. El número es el nombre del cifrado.",
    },
    success: `Mensaje descifrado: "el pueblo es la fuente del poder" — Rousseau, 1762. Moreno lo distribuye en 200 copias.`,
    asciiArt: `
 ╔══════════════════════════╗
 ║  CONTRATO SOCIAL — 1810  ║
 ║  Traducción: M. Moreno   ║
 ║  [MATERIAL SUBVERSIVO]   ║
 ╚══════════════════════════╝`,
  },
  {
    id: 5,
    date: "20 de Agosto, 1810",
    title: "NODO INTERIOR",
    subtitle: "Propagando la revolución al interior",
    type: "terminal",
    narrative: `La Junta necesita llevar la Gaceta a Córdoba, Salta y el Alto Perú. Los realistas controlan las rutas postales. Hackea el sistema de correos colonial para redirigir los envíos.`,
    challenge: {
      prompt: "Introduce los comandos para redirigir el correo colonial:",
      commands: [
        { cmd: "route del VIRREYNATO --postal-node córdoba", correct: true },
        { cmd: "inject /gaceta/boletin_7.pdf --destino córdoba salta altoperú", correct: true },
        { cmd: "traceroute españa.crown.es", correct: false },
        { cmd: "encrypt --key=junta1810 /gaceta/*.pdf", correct: true },
      ],
      sequence: [0, 1, 3],
      answer: ["route del VIRREYNATO --postal-node córdoba", "inject /gaceta/boletin_7.pdf --destino córdoba salta altoperú", "encrypt --key=junta1810 /gaceta/*.pdf"],
    },
    success: "PAQUETES REENRUTADOS. La Gaceta llega al interior. Las ideas no tienen fronteras.",
    asciiArt: `
 CÓRDOBA ──→ SALTA ──→ ALTO PERÚ
     ↑            ↓
 BUENOS AYRES ←── RED LIBRE`,
  },
  {
    id: 6,
    date: "5 de Octubre, 1810",
    title: "PLAN DE OPERACIONES",
    subtitle: "El documento más peligroso",
    type: "keyword",
    narrative: `Moreno redacta su Plan de Operaciones — el texto más radical de la revolución. Los moderados de la Junta quieren destruirlo. Recupera las 4 ideas centrales antes de que sean borradas.`,
    challenge: {
      prompt: "Recupera los conceptos REDACTADOS del Plan de Operaciones:",
      text: `"Para consolidar la revolución se requiere: ████ de los grandes propietarios al Estado, ████ de la industria nacional, ████ de los pueblos originarios, y la ████ de toda forma de tiranía."`,
      blanks: ["expropiación", "fomento", "protección", "extinción"],
      words: ["expropiación", "fomento", "protección", "extinción", "sumisión", "control", "reforma", "expansión"],
      answer: ["expropiación", "fomento", "protección", "extinción"],
    },
    success: "¡PLAN RECUPERADO! El documento más radical del Río de la Plata está a salvo.",
    asciiArt: `
 ┌─────────────────────────────┐
 │  PLAN DE OPERACIONES        │
 │  [CLASIFICADO — NIVEL Ω]    │
 │  Autor: M. Moreno, 1810     │
 │  Estado: ██████ RECUPERADO  │
 └─────────────────────────────┘`,
  },
  {
    id: 7,
    date: "18 de Diciembre, 1810",
    title: "GOLPE DE ESTADO DIGITAL",
    subtitle: "Saavedra vs. Moreno",
    type: "code",
    narrative: `El sector conservador liderado por Saavedra ha inyectado malware en el sistema editorial. El "Decreto de Supresión" amenaza con cerrar la Gaceta. Elimina el código corrupto.`,
    challenge: {
      prompt: "Elimina las líneas de código CORRUPTAS (las que censuran) y deja solo las válidas:",
      code: `const gaceta = {
  editor: "Moreno",           // ← ¿MANTENER?
  censura: true,              // ← ¿ELIMINAR?
  libertad_prensa: false,     // ← ¿ELIMINAR?
  pueblo_soberano: true,      // ← ¿MANTENER?
  virrey_manda: true,         // ← ¿ELIMINAR?
  junta_libre: true,          // ← ¿MANTENER?
};
// Escribe solo las claves que deben QUEDAR (separadas por coma):`,
      answer: "editor,pueblo_soberano,junta_libre",
      hint: "Elimina todo lo que censurar o da poder al virrey",
    },
    success: "CÓDIGO LIMPIO. La Gaceta sobrevive al golpe. Moreno continúa como editor.",
    asciiArt: `
 PROCESO: saavedra_censura.exe
 STATUS: ████████ ELIMINADO
 PROCESO: moreno_gaceta.sh
 STATUS: ████████ ACTIVO ✓`,
  },
  {
    id: 8,
    date: "4 de Marzo, 1811",
    title: "ÚLTIMO MENSAJE",
    subtitle: "Moreno parte al exilio",
    type: "terminal",
    narrative: `Moreno, derrotado políticamente, parte en misión diplomática a Europa. En el barco, cifra un último mensaje para sus compañeros. Antes de perder la conexión, descifra su legado.`,
    challenge: {
      prompt: "El barco se aleja. Ejecuta el protocolo de legado antes de perder señal:",
      commands: [
        { cmd: "ssh moreno@fragata_mulhouse --legacy-protocol", correct: true },
        { cmd: "cat /ultimo/mensaje_revolucion.txt", correct: true },
        { cmd: "ping london.diplomacia.es", correct: false },
        { cmd: "gpg --decrypt legado_moreno.gpg > pueblo_argentino.txt", correct: true },
      ],
      sequence: [0, 1, 3],
      answer: ["ssh moreno@fragata_mulhouse --legacy-protocol", "cat /ultimo/mensaje_revolucion.txt", "gpg --decrypt legado_moreno.gpg > pueblo_argentino.txt"],
    },
    success: `MENSAJE DESCIFRADO: "Los pueblos que ceden sus derechos merecen las cadenas que llevan." — M. Moreno, Mar del Plata, 1811.`,
    asciiArt: `
 SEÑAL: ████████░░ PERDIENDO...
 CONEXIÓN: FRAGATA MULHOUSE
 LEGADO: TRANSFERIDO ✓
 MORENO: [DESCONECTADO]`,
  },
  {
    id: 9,
    date: "13 de Marzo, 1812",
    title: "BIBLIOTECA NACIONAL",
    subtitle: "El conocimiento como revolución",
    type: "keyword",
    narrative: `El legado de Moreno se materializa: la creación de la Biblioteca Pública de Buenos Aires (hoy Biblioteca Nacional). Los textos subversivos deben ser catalogados antes de que los censores los destruyan.`,
    challenge: {
      prompt: "Clasifica los 4 textos que DEBEN ingresar al catálogo de la Biblioteca Revolucionaria:",
      text: `Textos incautados en el puerto: "████ Social" de Rousseau, "████ de las Naciones" de Smith, "████ del Hombre" de Paine, "████ Filosófico" de Voltaire; más "Catecismo ████" y "Lealtad al ████".`,
      blanks: ["Contrato", "Riqueza", "Derechos", "Diccionario"],
      words: ["Contrato", "Riqueza", "Derechos", "Diccionario", "Real", "Absolutista", "Imperial", "Monárquico"],
      answer: ["Contrato", "Riqueza", "Derechos", "Diccionario"],
    },
    success: "CATÁLOGO COMPLETO. Los textos iluministas están a salvo. La Biblioteca Nacional nace libre.",
    asciiArt: `
 ┌──────────────────────────────────┐
 │  BIBLIOTECA PÚBLICA              │
 │  Buenos Ayres — Est. 1812        │
 │  Fondo: 4,200 volúmenes          │
 │  Donante original: M. Moreno     │
 │  [CONOCIMIENTO = PODER LIBRE]    │
 └──────────────────────────────────┘`,
  },
  {
    id: 10,
    date: "Indefinido, 1812—∞",
    title: "MANIFIESTO FINAL",
    subtitle: "La Revolución es permanente",
    type: "code",
    narrative: `Misión final. El sistema colonial intenta corromper el último nodo de la red revolucionaria. Solo el nombre del periódico fundado por Moreno puede autenticar tu identidad como agente de la libertad.`,
    challenge: {
      prompt: "Autentícate con el nombre exacto del periódico fundado por Moreno el 7 de junio de 1810:",
      code: `// PROTOCOLO DE AUTENTICACIÓN FINAL
// Sistema: Red_Revolucionaria_v1810
// Credencial requerida:

authenticate({
  agente: "INFILTRADO",
  periódico: "????????????????????",
  //          ↑ Escribe el nombre exacto (sin comillas):
  año: 1810,
  misión: "LIBERTAD"
});`,
      answer: "Gaceta de Buenos Ayres",
      hint: "El nombre del periódico que cambió la historia del Río de la Plata",
    },
    success: "AUTENTICACIÓN EXITOSA. MISIÓN COMPLETADA. La red revolucionaria es invencible.",
    asciiArt: `✓ SISTEMA LIBERADO`,
  },
];

// ─── MISSION TYPE COMPONENTS ─────────────────────────────────────────────────

function CodeChallenge({ challenge, onSuccess, onFail, attempts }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    if (input.trim().toLowerCase() === challenge.answer.toLowerCase()) {
      onSuccess();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      onFail();
    }
  };

  return (
    <div className="space-y-4">
      <div
        style={{
          background: "#0d0a06",
          border: `1px solid ${COLORS.red}`,
          borderRadius: 2,
          padding: "1rem",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.78rem",
          color: "#e8e0d0",
          whiteSpace: "pre-wrap",
          lineHeight: 1.6,
          boxShadow: `0 0 12px ${COLORS.red}33`,
        }}
      >
        <span style={{ color: COLORS.amber }}>// CÓDIGO CIFRADO:</span>
        {"\n"}
        {challenge.code}
      </div>
      <div style={{ color: COLORS.faded, fontSize: "0.75rem", fontFamily: "'Share Tech Mono', monospace" }}>
        💡 {challenge.hint}
      </div>
      <motion.div
        animate={shake ? { x: [-8, 8, -6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.5 }}
        style={{
          display: "flex",
          gap: "0.5rem",
          border: `1px solid ${COLORS.red}`,
          padding: "0.5rem",
          borderRadius: 2,
          animation: "pulse-border 2s ease-in-out infinite",
        }}
      >
        <span style={{ color: COLORS.red, fontFamily: "'Share Tech Mono', monospace" }}>&gt;</span>
        <input
          className="terminal-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="ingresa tu respuesta..."
          style={{ fontSize: "0.9rem" }}
        />
        <button
          onClick={handleSubmit}
          style={{
            background: COLORS.red,
            color: COLORS.paper,
            border: "none",
            padding: "0.25rem 0.75rem",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.75rem",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          EXEC
        </button>
      </motion.div>
      <div style={{ color: COLORS.faded, fontSize: "0.7rem", fontFamily: "'Share Tech Mono', monospace" }}>
        INTENTOS RESTANTES: <span style={{ color: attempts <= 1 ? COLORS.red : COLORS.amber }}>{attempts}</span>
      </div>
    </div>
  );
}

function KeywordChallenge({ challenge, onSuccess, onFail, attempts }) {
  const [selected, setSelected] = useState([]);
  const [shake, setShake] = useState(false);

  const toggle = (word) => {
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else if (selected.length < challenge.answer.length) {
      setSelected([...selected, word]);
    }
  };

  const handleSubmit = () => {
    const correct =
      selected.length === challenge.answer.length &&
      challenge.answer.every((w) => selected.includes(w));
    if (correct) {
      onSuccess();
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      onFail();
    }
  };

  return (
    <div className="space-y-4">
      <div
        style={{
          border: `1px solid ${COLORS.burn}`,
          padding: "1rem",
          background: "rgba(26,18,8,0.04)",
          fontFamily: "'Special Elite', cursive",
          fontSize: "0.95rem",
          lineHeight: 1.8,
          color: COLORS.ink,
          borderRadius: 2,
        }}
        dangerouslySetInnerHTML={{
          __html: challenge.text.replace(/████/g, `<span style="background:${COLORS.ink};color:transparent;border-radius:2px;padding:0 4px;letter-spacing:2px">████</span>`),
        }}
      />
      <p style={{ color: COLORS.faded, fontSize: "0.75rem", fontFamily: "'Share Tech Mono', monospace" }}>
        Selecciona {challenge.answer.length} palabras censuradas:
      </p>
      <motion.div
        animate={shake ? { x: [-6, 6, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
      >
        {challenge.words.map((word) => (
          <button
            key={word}
            onClick={() => toggle(word)}
            style={{
              padding: "0.35rem 0.75rem",
              border: `1px solid ${selected.includes(word) ? COLORS.red : COLORS.burn}`,
              background: selected.includes(word) ? COLORS.red : "transparent",
              color: selected.includes(word) ? COLORS.paper : COLORS.ink,
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.8rem",
              cursor: "pointer",
              borderRadius: 2,
              transition: "all 0.15s",
              boxShadow: selected.includes(word) ? `0 0 8px ${COLORS.red}66` : "none",
            }}
          >
            {word}
          </button>
        ))}
      </motion.div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: COLORS.faded, fontSize: "0.7rem", fontFamily: "'Share Tech Mono', monospace" }}>
          INTENTOS RESTANTES: <span style={{ color: attempts <= 1 ? COLORS.red : COLORS.amber }}>{attempts}</span>
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length !== challenge.answer.length}
          style={{
            background: selected.length === challenge.answer.length ? COLORS.red : COLORS.faded,
            color: COLORS.paper,
            border: "none",
            padding: "0.4rem 1rem",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.8rem",
            cursor: selected.length === challenge.answer.length ? "pointer" : "not-allowed",
            borderRadius: 2,
            letterSpacing: "0.1em",
          }}
        >
          DESCIFRAR [{selected.length}/{challenge.answer.length}]
        </button>
      </div>
    </div>
  );
}

function TerminalChallenge({ challenge, onSuccess, onFail, attempts }) {
  const [typed, setTyped] = useState("");
  const [history, setHistory] = useState([]);
  const [executed, setExecuted] = useState([]);
  const [shake, setShake] = useState(false);
  const inputRef = useRef(null);

  const validCommands = challenge.commands.filter((c) => c.correct).map((c) => c.cmd);

  const handleKey = (e) => {
    if (e.key === "Enter" && typed.trim()) {
      const cmd = typed.trim();
      const isValid = challenge.commands.find((c) => c.cmd === cmd);

      let response;
      if (!isValid) {
        response = `bash: ${cmd}: command not found`;
      } else if (!isValid.correct) {
        response = `ERROR: Protocolo enemigo detectado. Conexión sospechosa.`;
      } else {
        const newExecuted = [...executed, cmd];
        setExecuted(newExecuted);
        response = `✓ OK — ejecutado: ${cmd}`;

        if (newExecuted.length === challenge.answer.length &&
            challenge.answer.every((c) => newExecuted.includes(c))) {
          setTimeout(onSuccess, 500);
        }
      }

      setHistory([...history, { cmd, response, valid: isValid?.correct }]);
      setTyped("");
    }
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          background: "#0a0705",
          border: `1px solid ${COLORS.red}`,
          borderRadius: 2,
          padding: "1rem",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.78rem",
          minHeight: 180,
          cursor: "text",
          boxShadow: `0 0 16px ${COLORS.red}44`,
        }}
      >
        <div style={{ color: COLORS.amber, marginBottom: "0.5rem" }}>
          RED_REVOLUCIONARIA v1810 — Comandos disponibles:
        </div>
        {challenge.commands.map((c, i) => (
          <div key={i} style={{ color: COLORS.faded, marginBottom: 2 }}>
            <span style={{ color: "#555" }}># </span>{c.cmd}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${COLORS.burn}`, marginTop: "0.75rem", paddingTop: "0.5rem" }}>
          {history.map((h, i) => (
            <div key={i}>
              <div style={{ color: COLORS.red }}>$ {h.cmd}</div>
              <div style={{ color: h.valid ? "#7fff7f" : "#ff6666", marginBottom: 4 }}>{h.response}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{ color: COLORS.red }}>$</span>
            <input
              ref={inputRef}
              autoFocus
              className="terminal-input"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={handleKey}
              placeholder="escribe un comando..."
              style={{ fontSize: "0.78rem" }}
            />
          </div>
        </div>
      </div>
      <div style={{ marginTop: "0.5rem", color: COLORS.faded, fontSize: "0.7rem", fontFamily: "'Share Tech Mono', monospace" }}>
        Progreso: [{executed.length}/{challenge.answer.length}] — INTENTOS: <span style={{ color: attempts <= 1 ? COLORS.red : COLORS.amber }}>{attempts}</span>
      </div>
    </div>
  );
}

// ─── FINAL MANIFESTO ─────────────────────────────────────────────────────────
const MORENO_ASCII = `
    ███╗   ███╗ ██████╗ ██████╗ ███████╗███╗   ██╗ ██████╗
    ████╗ ████║██╔═══██╗██╔══██╗██╔════╝████╗  ██║██╔═══██╗
    ██╔████╔██║██║   ██║██████╔╝█████╗  ██╔██╗ ██║██║   ██║
    ██║╚██╔╝██║██║   ██║██╔══██╗██╔══╝  ██║╚██╗██║██║   ██║
    ██║ ╚═╝ ██║╚██████╔╝██║  ██║███████╗██║ ╚████║╚██████╔╝
    ╚═╝     ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝ ╚═════╝

              Secretary of the First Junta · 1810
         Editor: Gaceta de Buenos Ayres · Fundador: Biblioteca Nacional


    "Si los pueblos no se ilustran,
     si no se vulgarizan sus derechos,
     si cada hombre no conoce lo que vale,
     lo que puede y lo que se le debe,
     nuevas ilusiones sucederán a las antiguas
     y después de vacilar algún tiempo
     entre mil incertidumbres,
     será tal vez el precio de nuestra sangre
     no una gloria duradera,
     sino una nueva cadena."

                                              — Mariano Moreno, 1810


    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   7 JUN 1810 — Gaceta de Buenos Ayres: FUNDADA              ║
    ║   AUG 1810   — Contrato Social distribuido: LIBRE           ║
    ║   OCT 1810   — Plan de Operaciones: REDACTADO               ║
    ║   MAR 1811   — Moreno parte al exilio: INMORTAL             ║
    ║   MAR 1812   — Biblioteca Nacional: FUNDADA                 ║
    ║                                                              ║
    ║              LA REVOLUCIÓN ES PERMANENTE                    ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝


    ░░░░░░░░░░ LA INFORMACIÓN ES PODER ░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░ EL PODER ES DEL PUEBLO ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
    ░░░░░░░░░░ EL PUEBLO ES LIBRE     ░░░░░░░░░░░░░░░░░░░░░░░░░░░░
`;

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function MarianoMoreno() {
  const [screen, setScreen] = useState("intro"); // intro | game | success | fail | manifesto
  const [currentMission, setCurrentMission] = useState(0);
  const [attempts, setAttempts] = useState(3);
  const [missionSuccess, setMissionSuccess] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [completedMissions, setCompletedMissions] = useState([]);
  const [showASCII, setShowASCII] = useState(false);

  const mission = MISSIONS[currentMission];

  // Glitch effect trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSuccess = useCallback(() => {
    setMissionSuccess(true);
    setCompletedMissions((prev) => [...prev, currentMission]);
  }, [currentMission]);

  const handleFail = useCallback(() => {
    const newAttempts = attempts - 1;
    setAttempts(newAttempts);
    if (newAttempts <= 0) setScreen("fail");
  }, [attempts]);

  const nextMission = () => {
    if (currentMission >= MISSIONS.length - 1) {
      setScreen("manifesto");
    } else {
      setCurrentMission((m) => m + 1);
      setAttempts(3);
      setMissionSuccess(false);
    }
  };

  const restart = () => {
    setScreen("intro");
    setCurrentMission(0);
    setAttempts(3);
    setMissionSuccess(false);
    setCompletedMissions([]);
    setShowASCII(false);
  };

  const renderChallenge = () => {
    const props = { challenge: mission.challenge, onSuccess: handleSuccess, onFail: handleFail, attempts };
    if (mission.type === "code") return <CodeChallenge {...props} />;
    if (mission.type === "keyword") return <KeywordChallenge {...props} />;
    if (mission.type === "terminal") return <TerminalChallenge {...props} />;
  };

  // ── INTRO SCREEN ──────────────────────────────────────────────────────────
  if (screen === "intro") {
    return (
      <>
        <style>{glitchStyle}</style>
        <div
          className="scanlines paper-texture"
          style={{
            minHeight: "100vh",
            background: COLORS.paper,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Red corner decorations */}
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{
              position: "absolute",
              [i < 2 ? "top" : "bottom"]: 0,
              [i % 2 === 0 ? "left" : "right"]: 0,
              width: 60, height: 60,
              borderTop: i < 2 ? `4px solid ${COLORS.red}` : "none",
              borderBottom: i >= 2 ? `4px solid ${COLORS.red}` : "none",
              borderLeft: i % 2 === 0 ? `4px solid ${COLORS.red}` : "none",
              borderRight: i % 2 === 1 ? `4px solid ${COLORS.red}` : "none",
            }} />
          ))}

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            style={{ textAlign: "center", maxWidth: 680 }}
          >
            {/* Classification stamp */}
            <div style={{
              display: "inline-block",
              border: `3px solid ${COLORS.red}`,
              color: COLORS.red,
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.25em",
              padding: "0.25rem 1rem",
              marginBottom: "2rem",
              opacity: 0.85,
            }}>
              ▓ DOCUMENTO CLASIFICADO — NIVEL OMEGA ▓
            </div>

            <h1
              className="glitch-title"
              data-text="GACETA UNDERGROUND"
              style={{
                fontFamily: "'Special Elite', cursive",
                fontSize: "clamp(2rem, 6vw, 3.5rem)",
                color: COLORS.ink,
                letterSpacing: "0.08em",
                lineHeight: 1.1,
                marginBottom: "0.5rem",
                position: "relative",
              }}
            >
              GACETA UNDERGROUND
            </h1>

            <div style={{
              fontFamily: "'Share Tech Mono', monospace",
              color: COLORS.red,
              fontSize: "0.85rem",
              letterSpacing: "0.3em",
              marginBottom: "2rem",
              animation: "terminal-glow 2s ease-in-out infinite",
            }}>
              1810 — REVOLUCIÓN DIGITAL
            </div>

            <div style={{
              fontFamily: "'Special Elite', cursive",
              color: COLORS.faded,
              fontSize: "0.95rem",
              lineHeight: 1.7,
              marginBottom: "2.5rem",
              maxWidth: 500,
              margin: "0 auto 2.5rem",
            }}>
              Año 1810. La Primera Junta gobierna pero los realistas controlan la información. 
              Eres un agente encubierto de Mariano Moreno. Tu misión: infiltrar ideas de libertad 
              en los circuitos del sistema colonial. <strong style={{ color: COLORS.ink }}>10 misiones. La historia no espera.</strong>
            </div>

            <div style={{
              background: "rgba(26,18,8,0.05)",
              border: `1px solid ${COLORS.burn}`,
              padding: "1rem",
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.75rem",
              color: COLORS.faded,
              marginBottom: "2rem",
              textAlign: "left",
              borderRadius: 2,
            }}>
              <div style={{ color: COLORS.amber, marginBottom: "0.5rem" }}>BRIEFING DEL AGENTE:</div>
              <div>• 10 misiones históricas · 3 intentos por misión</div>
              <div>• Tipos: [CÓDIGO] [PALABRAS CLAVE] [TERMINAL]</div>
              <div>• Período: 25/05/1810 → Biblioteca Nacional</div>
              <div>• Falla 3 veces: conexión cortada</div>
            </div>

            <motion.button
              whileHover={{ scale: 1.04, boxShadow: `0 0 24px ${COLORS.red}88` }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setScreen("game")}
              style={{
                background: COLORS.ink,
                color: COLORS.paper,
                border: `2px solid ${COLORS.red}`,
                padding: "0.85rem 2.5rem",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.9rem",
                letterSpacing: "0.2em",
                cursor: "pointer",
                borderRadius: 2,
                boxShadow: `0 0 12px ${COLORS.red}44`,
              }}
            >
              ▶ INICIAR INFILTRACIÓN
            </motion.button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── FAIL SCREEN ───────────────────────────────────────────────────────────
  if (screen === "fail") {
    return (
      <>
        <style>{glitchStyle}</style>
        <div className="scanlines paper-texture" style={{
          minHeight: "100vh", background: COLORS.paper,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "2rem",
        }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center" }}>
            <div className="glitch-title" data-text="CONEXIÓN PERDIDA" style={{
              fontFamily: "'Special Elite', cursive",
              fontSize: "3rem", color: COLORS.red, letterSpacing: "0.1em",
              animation: "terminal-glow 1s ease-in-out infinite",
            }}>
              CONEXIÓN PERDIDA
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", color: COLORS.faded, marginTop: "1rem", marginBottom: "2rem" }}>
              Los realistas han rastreado tu IP. Reinicia el protocolo.
            </div>
            <div style={{ fontFamily: "'Share Tech Mono', monospace", fontSize: "0.8rem", color: COLORS.ink, marginBottom: "2rem" }}>
              Misiones completadas: {completedMissions.length} / 10
            </div>
            <button onClick={restart} style={{
              background: COLORS.red, color: COLORS.paper, border: "none",
              padding: "0.75rem 2rem", fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.85rem", letterSpacing: "0.15em", cursor: "pointer",
            }}>
              ↺ REINICIAR PROTOCOLO
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  // ── MANIFESTO SCREEN ──────────────────────────────────────────────────────
  if (screen === "manifesto") {
    return (
      <>
        <style>{glitchStyle}</style>
        <div className="paper-texture" style={{
          minHeight: "100vh", background: COLORS.paper,
          display: "flex", flexDirection: "column",
          alignItems: "center", padding: "3rem 1.5rem",
          position: "relative", overflow: "hidden",
        }}>
          {/* Glitch stripes */}
          {[...Array(5)].map((_, i) => (
            <motion.div key={i}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: [0, 1, 0], opacity: [0, 0.07, 0] }}
              transition={{ delay: i * 0.3, duration: 1.5, repeat: Infinity, repeatDelay: 5 }}
              style={{
                position: "absolute",
                top: `${15 + i * 18}%`,
                left: 0, right: 0,
                height: 2 + i,
                background: i % 2 === 0 ? COLORS.red : COLORS.ink,
                transformOrigin: "left",
              }}
            />
          ))}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            style={{ width: "100%", maxWidth: 760, position: "relative" }}
          >
            {/* Stamp */}
            <motion.div
              initial={{ scale: 3, rotate: -15, opacity: 0 }}
              animate={{ scale: 1, rotate: -2, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, type: "spring" }}
              style={{
                display: "inline-block",
                border: `4px solid ${COLORS.red}`,
                color: COLORS.red,
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "1.1rem",
                letterSpacing: "0.2em",
                padding: "0.4rem 1.5rem",
                marginBottom: "2rem",
                transform: "rotate(-2deg)",
                opacity: 0.9,
                boxShadow: `4px 4px 0 ${COLORS.red}44`,
              }}
            >
              ✓ MISIÓN COMPLETADA
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{
                fontFamily: "'Special Elite', cursive",
                fontSize: "clamp(1.8rem, 5vw, 3rem)",
                color: COLORS.ink,
                letterSpacing: "0.05em",
                marginBottom: "1rem",
                lineHeight: 1.15,
              }}
            >
              MANIFIESTO REVOLUCIONARIO
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              style={{
                height: 2, background: COLORS.red,
                marginBottom: "2rem", transformOrigin: "left",
              }}
            />

            {/* ASCII Art */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              style={{
                background: "#0d0a06",
                border: `1px solid ${COLORS.red}`,
                borderRadius: 2,
                padding: "1.5rem",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "clamp(0.45rem, 1.2vw, 0.65rem)",
                color: COLORS.amber,
                whiteSpace: "pre",
                overflowX: "auto",
                lineHeight: 1.4,
                boxShadow: `0 0 30px ${COLORS.red}33, inset 0 0 40px rgba(0,0,0,0.5)`,
                marginBottom: "2rem",
                animation: "flicker 4s ease-in-out infinite",
              }}
            >
              {MORENO_ASCII}
            </motion.div>

            {/* Mission log */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
              style={{
                border: `1px solid ${COLORS.burn}`,
                padding: "1.5rem",
                background: "rgba(26,18,8,0.04)",
                marginBottom: "2rem",
                borderRadius: 2,
              }}
            >
              <div style={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.7rem",
                color: COLORS.red,
                letterSpacing: "0.2em",
                marginBottom: "1rem",
              }}>
                LOG DE MISIONES — COMPLETADAS:
              </div>
              {MISSIONS.map((m, i) => (
                <div key={i} style={{
                  display: "flex", gap: "1rem",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.72rem",
                  color: COLORS.ink,
                  marginBottom: "0.35rem",
                  opacity: completedMissions.includes(i) ? 1 : 0.35,
                }}>
                  <span style={{ color: COLORS.amber, minWidth: 20 }}>
                    {completedMissions.includes(i) ? "✓" : "○"}
                  </span>
                  <span style={{ color: COLORS.faded, minWidth: 140 }}>{m.date}</span>
                  <span>{m.title}</span>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5 }}
              style={{
                textAlign: "center",
                fontFamily: "'Special Elite', cursive",
                fontSize: "1.1rem",
                color: COLORS.red,
                letterSpacing: "0.1em",
                marginBottom: "2rem",
                animation: "terminal-glow 2s ease-in-out infinite",
              }}
            >
              "LA PATRIA ES EL PUEBLO, Y EL PUEBLO SOY YO."
            </motion.div>

            <div style={{ textAlign: "center" }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                onClick={restart}
                style={{
                  background: "transparent",
                  color: COLORS.ink,
                  border: `2px solid ${COLORS.ink}`,
                  padding: "0.75rem 2rem",
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.8rem",
                  letterSpacing: "0.15em",
                  cursor: "pointer",
                  borderRadius: 2,
                }}
              >
                ↺ NUEVA INFILTRACIÓN
              </motion.button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  // ── GAME SCREEN ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{glitchStyle}</style>
      <div
        className="scanlines paper-texture"
        style={{
          minHeight: "100vh",
          background: COLORS.paper,
          padding: "0",
          position: "relative",
          overflow: "hidden",
          animation: "flicker 6s ease-in-out infinite",
        }}
      >
        {/* Glitch overlay */}
        <AnimatePresence>
          {glitchActive && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                inset: 0,
                background: `linear-gradient(transparent 49%, ${COLORS.red}18 50%, transparent 51%)`,
                backgroundSize: "100% 6px",
                pointerEvents: "none",
                zIndex: 100,
                mixBlendMode: "multiply",
              }}
            />
          )}
        </AnimatePresence>

        {/* Header */}
        <div style={{
          background: COLORS.ink,
          padding: "0.75rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `2px solid ${COLORS.red}`,
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: COLORS.paper,
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
          }}>
            GACETA_UNDERGROUND://
          </div>
          <div style={{
            fontFamily: "'Share Tech Mono', monospace",
            color: COLORS.red,
            fontSize: "0.75rem",
            animation: "terminal-glow 2s ease-in-out infinite",
          }}>
            MISIÓN {currentMission + 1}/10 — {mission.type.toUpperCase()}
          </div>
          <div style={{
            display: "flex", gap: 6,
          }}>
            {MISSIONS.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8,
                borderRadius: "50%",
                background: completedMissions.includes(i)
                  ? COLORS.red
                  : i === currentMission
                    ? COLORS.amber
                    : COLORS.faded,
                opacity: completedMissions.includes(i) || i === currentMission ? 1 : 0.3,
                boxShadow: i === currentMission ? `0 0 6px ${COLORS.amber}` : "none",
                transition: "all 0.3s",
              }} />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1.5rem" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`mission-${currentMission}`}
              initial={{ opacity: 0, x: 30, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -30, filter: "blur(4px)" }}
              transition={{ duration: 0.5 }}
            >
              {/* Date & Mission header */}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.7rem",
                  color: COLORS.red,
                  letterSpacing: "0.25em",
                  marginBottom: "0.5rem",
                  animation: "terminal-glow 2s ease-in-out infinite",
                }}>
                  [{mission.date}] — NODO {currentMission + 1} DE 10
                </div>
                <h2 style={{
                  fontFamily: "'Special Elite', cursive",
                  fontSize: "clamp(1.5rem, 4vw, 2.2rem)",
                  color: COLORS.ink,
                  letterSpacing: "0.06em",
                  lineHeight: 1.1,
                  marginBottom: "0.25rem",
                }}>
                  {mission.title}
                </h2>
                <div style={{
                  fontFamily: "'Special Elite', cursive",
                  color: COLORS.faded,
                  fontSize: "1rem",
                  marginBottom: "1rem",
                }}>
                  {mission.subtitle}
                </div>
                <div style={{
                  height: 1,
                  background: `linear-gradient(to right, ${COLORS.red}, transparent)`,
                  marginBottom: "1.25rem",
                }} />
              </div>

              {/* Narrative */}
              <div style={{
                background: "rgba(26,18,8,0.04)",
                border: `1px solid ${COLORS.burn}`,
                borderLeft: `3px solid ${COLORS.red}`,
                padding: "1rem 1.25rem",
                fontFamily: "'Special Elite', cursive",
                fontSize: "0.92rem",
                color: COLORS.ink,
                lineHeight: 1.75,
                marginBottom: "1.5rem",
                borderRadius: 2,
              }}>
                <span style={{ color: COLORS.red, fontFamily: "'Share Tech Mono', monospace", fontSize: "0.7rem", letterSpacing: "0.15em" }}>
                  BRIEFING &gt;
                </span>
                <br />
                {mission.narrative}
              </div>

              {/* ASCII art for mission */}
              <div style={{
                background: "#0d0a06",
                border: `1px solid ${COLORS.burn}`,
                padding: "0.75rem",
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.65rem",
                color: COLORS.faded,
                whiteSpace: "pre",
                marginBottom: "1.5rem",
                borderRadius: 2,
                overflowX: "auto",
              }}>
                {mission.asciiArt}
              </div>

              {/* Challenge section */}
              {!missionSuccess ? (
                <div>
                  <div style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    color: COLORS.amber,
                    fontSize: "0.78rem",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                    animation: "terminal-glow 2s ease-in-out infinite",
                  }}>
                    ⚡ {mission.challenge.prompt}
                  </div>
                  {renderChallenge()}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  style={{
                    border: `2px solid ${COLORS.red}`,
                    padding: "1.5rem",
                    background: "rgba(184,0,31,0.04)",
                    borderRadius: 2,
                    boxShadow: `0 0 20px ${COLORS.red}33`,
                  }}
                >
                  <div className="stamp" style={{
                    display: "inline-block",
                    border: `3px solid ${COLORS.red}`,
                    color: COLORS.red,
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "1.2rem",
                    letterSpacing: "0.2em",
                    padding: "0.25rem 1rem",
                    marginBottom: "1rem",
                    transform: "rotate(-1deg)",
                  }}>
                    ✓ MISIÓN CUMPLIDA
                  </div>
                  <div style={{
                    fontFamily: "'Special Elite', cursive",
                    color: COLORS.ink,
                    fontSize: "0.95rem",
                    lineHeight: 1.7,
                    marginBottom: "1.5rem",
                  }}>
                    {mission.success}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: `0 0 16px ${COLORS.red}66` }}
                    whileTap={{ scale: 0.97 }}
                    onClick={nextMission}
                    style={{
                      background: COLORS.ink,
                      color: COLORS.paper,
                      border: `1px solid ${COLORS.red}`,
                      padding: "0.65rem 1.75rem",
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.8rem",
                      letterSpacing: "0.15em",
                      cursor: "pointer",
                      borderRadius: 2,
                    }}
                  >
                    {currentMission >= MISSIONS.length - 1 ? "▶ VER MANIFIESTO FINAL" : "▶ SIGUIENTE MISIÓN"}
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom bar */}
        <div style={{
          position: "fixed",
          bottom: 0, left: 0, right: 0,
          background: COLORS.ink,
          borderTop: `1px solid ${COLORS.red}`,
          padding: "0.5rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: "0.65rem",
          color: COLORS.faded,
          zIndex: 50,
        }}>
          <span>AGENTE: INFILTRADO_Ω</span>
          <span style={{ color: COLORS.red, animation: "blink 1s step-end infinite" }}>● CONECTADO</span>
          <span>1810—{new Date().getFullYear()}</span>
        </div>
      </div>
    </>
  );
}