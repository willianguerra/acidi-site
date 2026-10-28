// Ícones de traço (24x24), copiados do antigo ferramentas/gerar_site.py.
const P = {
  down: "<path d=\"M6 9l6 6 6-6\"/>",
  go: "<path d=\"M5 12h14M13 6l6 6-6 6\"/>",
  back: "<path d=\"M19 12H5M11 6l-6 6 6 6\"/>",
  ext: "<path d=\"M7 17L17 7M8 7h9v9\"/>",
  menu: "<path d=\"M4 7h16M4 12h16M4 17h16\"/>",
  x: "<path d=\"M6 6l12 12M18 6L6 18\"/>",
  phone: "<path d=\"M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2\"/>",
  mail: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"14\" rx=\"2\"/><path d=\"M3 7l9 6 9-6\"/>",
  insta: "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"5\"/><circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M17.5 6.5h.01\"/>",
  face: "<path d=\"M15 3h-2.5A3.5 3.5 0 009 6.5V21M6 11h7\"/>",
  clock: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 7v5l3 2\"/>",
  people: "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20c.8-3.5 3.4-5.5 6.5-5.5s5.7 2 6.5 5.5\"/><path d=\"M16 4.5a3.5 3.5 0 010 7M18 14.8c1.8.8 3 2.6 3.5 5.2\"/>",
  bars: "<path d=\"M4 20V10M10 20V4M16 20v-7M22 20H2\"/>",
  gov: "<path d=\"M3 10l9-6 9 6M5 10v9M19 10v9M9 10v9M15 10v9M3 20h18\"/>",
  grid: "<rect x=\"3\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\" rx=\"1\"/>",
  card: "<rect x=\"3\" y=\"6\" width=\"18\" height=\"12\" rx=\"2\"/><path d=\"M3 10h18M7 15h4\"/>",
  tooth: "<path d=\"M7 3c-2 0-3 2-3 4 0 4 2 6 2 10 0 2 1 4 2 4s1-3 2-5 1-2 2-2 1 0 2 2 1 5 2 5 2-2 2-4c0-4 2-6 2-10 0-2-1-4-3-4-2 0-3 1-5 1S9 3 7 3z\"/>",
  search: "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"M20 20l-3.5-3.5M8 11l2 2 4-4\"/>",
  doc: "<path d=\"M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z\"/><path d=\"M14 3v6h6M8 14l2.5 2.5L16 11\"/>",
  screen: "<path d=\"M3 5h18v11H3zM8 20h8M12 16v4\"/>",
  cal: "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4\"/>",
  info: "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v6M12 7.5v.5\"/>",
  check: "<path d=\"M20 6L9 17l-5-5\"/>",
  pause: "<path d=\"M9 6v12M15 6v12\"/>",
  play: "<path d=\"M8 5.5v13l10-6.5z\"/>",
  replay: "<path d=\"M4 12a8 8 0 1 0 2.4-5.7\"/><path d=\"M4 4v4.5h4.5\"/>",
} as const;

export type IconName = keyof typeof P;

export function Ico({ n, cls = 'ico' }: { n: IconName; cls?: string }) {
  return <svg className={cls} viewBox="0 0 24 24" aria-hidden="true" focusable="false" dangerouslySetInnerHTML={{ __html: P[n] }} />;
}

export function Ext({ href, children, cls }: { href: string; children: React.ReactNode; cls?: string }) {
  return <a className={cls || undefined} href={href} target="_blank" rel="noopener">{children}<Ico n="ext" cls="ico ext-i" /><span className="sr"> (abre em nova aba)</span></a>;
}
