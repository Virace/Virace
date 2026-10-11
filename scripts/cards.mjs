export const profileStyle = 'pixel';

export const cardStyles = [
  { id: 'graphite', name: '石墨', detail: '留白、细线与黑白排版。' },
  { id: 'blueprint', name: '蓝图', detail: '冷蓝线框，像工作台上的另一块屏幕。' },
  { id: 'tabs', name: '页签', detail: '淡紫文件页签，轻一点，也软一点。' },
  { id: 'pixel', name: '像素窗口', detail: '灰白像素边框，呼应上面的汤姆猫。' },
];

export const themes = {
  light: { mode: 'light', bg: '#FFFFFF', border: '#D0D7DE', ink: '#1F2328', muted: '#626B77', line: '#E8EBEF' },
  dark: { mode: 'dark', bg: '#161B22', border: '#3D444D', ink: '#F0F3F6', muted: '#A4ADBA', line: '#30363D' },
};

export function escapeXml(text) {
  return String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]);
}

function svg(title, body, animation = '') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="152" viewBox="0 0 320 152" role="img" aria-labelledby="card-title">
  <title id="card-title">${escapeXml(title)}</title>
  <style>
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif; }
    .mono { font-family: ui-monospace, Consolas, monospace; }
    ${animation}
    @media (prefers-reduced-motion: reduce) { .motion { animation: none !important; } }
  </style>
  ${body}
</svg>\n`;
}

function textWidth(text) {
  return [...text].reduce((width, char) => width + (/^[\x00-\x7F]$/.test(char) ? .56 : 1), 0);
}

function trimLine(text, width) {
  if (textWidth(text) <= width) return text;
  let line = '';
  for (const char of text) {
    if (textWidth(line + char + '…') > width) break;
    line += char;
  }
  return line.trimEnd() + '…';
}

function titleLines(title) {
  const split = title.search(/[：:]/u);
  if (split > 0 && textWidth(title.slice(0, split)) <= 13) {
    return [title.slice(0, split), trimLine(title.slice(split + 1).trim(), 20)];
  }
  let first = '';
  for (const char of title) {
    if (textWidth(first + char) > 13) break;
    first += char;
  }
  return [first.trimEnd(), trimLine(title.slice(first.length).trim(), 20)];
}

function content(note) {
  const latest = Boolean(note);
  const [title, subtitle] = latest ? titleLines(note.title) : ['孤独的未知数', '经验、踩坑和一些项目进展。'];
  return {
    latest, title, subtitle,
    label: latest ? '最近一篇' : '随手记',
    footer: latest ? note.date.replaceAll('-', '.') : 'x-item.com',
    description: latest ? `最近一篇：${note.title}，${note.date}` : '孤独的未知数：经验、踩坑和项目进展',
  };
}

function copy(data, palette, x = 20, y = 68, size = 20) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="600" fill="${palette.ink}">${escapeXml(data.title)}</text>
    <text x="${x}" y="${y + 24}" font-size="13" fill="${palette.muted}">${escapeXml(data.subtitle)}</text>`;
}

function arrow(color, x = 287, y = 128) {
  return `<path d="M${x - 8} ${y}H${x + 8}M${x + 3} ${y - 5}L${x + 8} ${y}L${x + 3} ${y + 5}" fill="none" stroke="${color}" stroke-width="1.3"/>`;
}

const blink = '.cursor { animation: blink 2.4s steps(1) infinite; } @keyframes blink { 0%, 64% { opacity: 1; } 65%, 100% { opacity: 0; } }';
const scan = '.head { animation: scan 5s ease-in-out infinite; } @keyframes scan { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(70px); } }';

function graphite(data, theme) {
  const body = `<rect x=".5" y=".5" width="319" height="151" rx="5" fill="${theme.bg}" stroke="${theme.border}"/>
    <text x="20" y="27" font-size="11" fill="${theme.muted}">${data.label}</text>
    <text x="299" y="27" text-anchor="end" font-size="10" class="mono" fill="${theme.muted}">${data.latest ? '02 / LATEST' : '01 / NOTES'}</text>
    ${copy(data, theme)}
    <path d="M20 110H300" stroke="${theme.line}"/>
    <text x="20" y="132" class="mono" font-size="11" fill="${theme.muted}">${data.footer}</text>
    ${data.latest
      ? `<path d="M163 128H258" stroke="${theme.line}"/><path class="motion head" d="M172 125V131" stroke="${theme.ink}" stroke-width="2"/>`
      : `<path class="motion cursor" d="M93 133H100" stroke="${theme.ink}" stroke-width="1.5"/>`}
    ${arrow(theme.ink)}`;
  return svg(data.description, body, blink + scan);
}

function blueprint(data, theme) {
  const dark = theme.mode === 'dark';
  const palette = { ...theme, bg: dark ? '#111D30' : '#F8FAFF', border: dark ? '#354969' : '#B9C9E1', ink: dark ? '#E5EDFF' : '#203553', muted: dark ? '#A4B5CE' : '#586F8C' };
  const blue = dark ? '#8BACF7' : '#4C6BA8';
  let grid = '';
  for (let x = 16; x < 320; x += 16) grid += `<path d="M${x} 0V152"/>`;
  for (let y = 8; y < 152; y += 16) grid += `<path d="M0 ${y}H320"/>`;
  const body = `<rect x=".5" y=".5" width="319" height="151" fill="${palette.bg}" stroke="${palette.border}"/>
    <g fill="none" stroke="${blue}" stroke-opacity=".055">${grid}</g>
    <path d="M1 11V1H11M309 1H319V11M319 141V151H309M11 151H1V141" fill="none" stroke="${blue}" stroke-width="2"/>
    <path d="M16 31H304" stroke="${palette.border}" stroke-dasharray="2 4"/>
    <text x="20" y="23" font-size="11" fill="${blue}">${data.label}</text>
    <text x="299" y="23" text-anchor="end" class="mono" font-size="10" fill="${palette.muted}">${data.latest ? 'RSS / 02' : 'LOG / 01'}</text>
    ${copy(data, palette, 20, 66)}
    <text x="20" y="132" class="mono" font-size="11" fill="${palette.muted}">${data.footer}</text>
    ${data.latest
      ? `<path d="M165 127H258" stroke="${palette.border}"/><path d="M166 127H177V123H180V130H183V119H186V135H189V125H194V128H199V121H202V132H205V125H212V118H215V135H218V124H224V130H229V121H232V133H235V126H258" fill="none" stroke="${blue}" stroke-width="1.2"/><path class="motion head" d="M173 115V139" stroke="${palette.ink}" stroke-opacity=".65"/>`
      : `<rect class="motion cursor" x="98" y="122" width="5" height="11" fill="${blue}"/><path d="M166 128H257" stroke="${palette.border}" stroke-dasharray="2 4"/>`}
    ${arrow(blue)}`;
  return svg(data.description, body, blink + scan);
}

function tabs(data, theme) {
  const dark = theme.mode === 'dark';
  const palette = { ...theme, bg: dark ? '#1C1B26' : '#FDFCFF', border: dark ? '#494355' : '#D9D2E4' };
  const violet = dark ? '#B7A4D6' : '#7E669E';
  const tab = dark ? '#2C2738' : '#EFEBF5';
  const body = `<path d="M.5 145V10Q.5 .5 10 .5H84Q91 .5 96 8L107 23H310Q319.5 23 319.5 32V142Q319.5 151.5 310 151.5H10Q.5 151.5 .5 142Z" fill="${palette.bg}" stroke="${palette.border}"/>
    <path d="M1 10Q1 1 10 1H84Q91 1 96 8L107 23H1Z" fill="${tab}"/>
    <path d="M1 23H107" stroke="${palette.border}"/>
    <text x="16" y="16" font-size="11" fill="${violet}">${data.label}</text>
    <path d="M288 11H300M291 15H300M294 19H300" stroke="${palette.border}"/>
    <path d="M13 42V136" stroke="${palette.border}"/>
    ${copy(data, palette, 25, 69)}
    <text x="25" y="133" class="mono" font-size="11" fill="${theme.muted}">${data.footer}</text>
    ${data.latest
      ? `<path d="M163 129H254" stroke="${palette.border}"/><path class="motion head" d="M171 129H189" stroke="${violet}" stroke-width="2"/>`
      : `<path class="motion cursor" d="M98 135H106" stroke="${violet}" stroke-width="2"/>`}
    ${arrow(violet)}`;
  return svg(data.description, body, blink + scan);
}

function pixel(data, theme) {
  const dark = theme.mode === 'dark';
  const palette = { ...theme, bg: dark ? '#171922' : '#FAFAFD', border: dark ? '#777D91' : '#8D93A3', ink: dark ? '#EAEDF5' : '#333A4C', muted: dark ? '#ACB2C4' : '#686F82' };
  const header = dark ? '#252937' : '#ECEEF4';
  const pixelColor = dark ? '#A5AEC8' : '#707C9E';
  const body = `<g shape-rendering="crispEdges">
    <path d="M4 1H316V4H319V148H316V151H4V148H1V4H4Z" fill="${palette.bg}" stroke="${palette.border}" stroke-width="2"/>
    <path d="M5 3H315V6H317V31H3V6H5Z" fill="${header}"/>
    <path d="M2 32H318" stroke="${palette.border}"/>
    <path d="M14 12H24V22H14Z" fill="none" stroke="${pixelColor}" stroke-width="2"/>
    <path d="M271 21H279M288 13H298V22H288Z" fill="none" stroke="${palette.border}" stroke-width="2"/>
    <text x="33" y="22" font-size="11" fill="${palette.ink}">${data.label}</text>
    ${copy(data, palette, 20, 67, 19)}
    <path d="M17 108H303" stroke="${header}" stroke-width="2"/>
    <text x="20" y="132" class="mono" font-size="11" fill="${palette.muted}">${data.footer}</text>
    ${data.latest
      ? `<path d="M168 128H260" stroke="${header}" stroke-width="8"/><path d="M169 128H259" stroke="${pixelColor}" stroke-width="2" stroke-dasharray="2 5"/><rect class="motion head" x="171" y="123" width="5" height="10" fill="${palette.ink}"/>`
      : `<rect class="motion cursor" x="98" y="122" width="6" height="10" fill="${pixelColor}"/>`}
    <path d="M280 128H297M291 122H294V125H297V128H300V131H297V134H294V137H291" fill="none" stroke="${palette.ink}" stroke-width="2"/>
  </g>`;
  return svg(data.description, body, blink + '.head { animation: scan 5.6s steps(10) infinite; } @keyframes scan { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(77px); } }');
}

const renderers = { graphite, blueprint, tabs, pixel };

function render(note, theme, style) {
  if (!renderers[style]) throw new Error(`未知卡片样式：${style}`);
  return renderers[style](content(note), theme);
}

export function renderNotebook(theme, style = profileStyle) {
  return render(null, theme, style);
}

export function renderLatest(note, theme, style = profileStyle) {
  return render(note, theme, style);
}
