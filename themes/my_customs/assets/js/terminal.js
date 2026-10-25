/* Terminal sandbox for the whoami page.
   A small fake shell over an in-memory filesystem. Nothing here touches a
   server; everything resets on refresh. See data/terminal.yaml for the files. */
(() => {
  'use strict';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  const sleep = ms => new Promise(r => setTimeout(r, reduce ? 0 : ms));

  function init(term) {
    if (term.dataset.init) return;
    term.dataset.init = '1';

    const host = term.dataset.host || 'guest@localhost';
    const [user, hostname = 'localhost'] = host.split('@');
    const HOME = `/home/${user}`;
    const body = term.querySelector('.term-body');
    const form = term.querySelector('.term-end');
    const input = term.querySelector('.term-input');
    const promptEl = form.querySelector('.term-prompt');
    const boot = Date.now();
    const DATE = 'Oct 25 23:05';
    let fortunes = [];
    try { fortunes = JSON.parse(term.dataset.fortunes || '[]'); } catch (e) { /* ignore */ }
    let cwd = HOME, hist = [], hpos = 0, busy = false, pending = null, closed = false;

    /* ---------- filesystem ---------- */
    const mkdir = () => ({ type: 'dir', children: Object.create(null), denied: false });
    // trusted=false for anything the user writes: no @link/@image/@denied directives from shell input
    const mkfile = (s = '', trusted = true) => {
      const f = { type: 'file', content: s, denied: false, link: null, page: null, special: null };
      if (!trusted) { if (!f.content.endsWith('\n')) f.content += '\n'; }
      else if (s.startsWith('@denied')) { f.denied = true; f.content = s.slice(7).replace(/^ /, ''); if (!f.content.endsWith('\n')) f.content += '\n'; }
      else if (s.startsWith('@link ')) { f.link = s.slice(6).trim(); f.content = f.link + '\n'; }
      else if (s.startsWith('@page ')) {
        const [url, title, date, ...rest] = s.slice(6).split('|');
        f.page = { url, title, date };
        f.content = `# ${title}\ndate: ${date}\nurl: ${url}\n\n${rest.join('|')}\n\n(open this file to read the whole post)\n`;
      }
      else if (s.startsWith('@image ')) { const [url, alt] = s.slice(7).split('|'); f.image = { url, alt: alt || 'image' }; f.content = `[binary JPEG] ${alt || 'image'}. use cat or open to view.\n`; }
      else if (s === '@random') { f.special = 'random'; f.content = ''; }
      else if (s === '@bin') { f.special = 'bin'; f.content = 'ELF 64-bit LSB executable. run it instead of reading it.\n'; }
      return f;
    };
    const build = map => {
      const d = mkdir();
      d.denied = !!map._denied;
      for (const k of Object.keys(map)) {
        if (k === '_denied') continue;
        const v = map[k];
        d.children[k] = v && typeof v === 'object' ? build(v) : mkfile(v == null ? '' : String(v));
      }
      return d;
    };
    let root;
    try { root = build(JSON.parse(term.dataset.fs || '{}')); } catch (e) { root = mkdir(); }
    const ensureDir = abs => {
      let n = root;
      for (const s of abs.split('/').filter(Boolean)) {
        if (!n.children[s]) n.children[s] = mkdir();
        n = n.children[s];
        if (n.type !== 'dir') return null;
      }
      return n;
    };
    ensureDir(HOME); ensureDir('/tmp'); ensureDir('/bin');

    const normalize = p => {
      if (!p) return cwd;
      if (p === '~' || p.startsWith('~/')) p = HOME + p.slice(1);
      if (!p.startsWith('/')) p = cwd + '/' + p;
      const out = [];
      for (const seg of p.split('/')) {
        if (!seg || seg === '.') continue;
        if (seg === '..') out.pop(); else out.push(seg);
      }
      return '/' + out.join('/');
    };
    // ls -F style markers (moments@, blog/) get pasted back in. forgive a trailing @ on a link.
    const resolveSeg = (dir, seg) => {
      if (dir.children[seg]) return seg;
      const bare = seg.endsWith('@') ? seg.slice(0, -1) : seg;
      return bare !== seg && dir.children[bare] && dir.children[bare].link ? bare : seg;
    };
    const lookup = p => {
      const abs = normalize(p);
      if (abs === '/') return { node: root, parent: null, name: '/', path: '/' };
      let node = root, parent = null, name = '';
      for (const raw of abs.slice(1).split('/')) {
        if (node.type !== 'dir') return { node: null, parent, name, path: abs, notdir: true };
        if (node.denied) return { node: null, parent, name, path: abs, denied: true };
        const seg = resolveSeg(node, raw);
        parent = node; name = seg; node = node.children[seg];
        if (!node) return { node: null, parent, name, path: abs };
      }
      return { node, parent, name, path: abs };
    };
    const parentOf = p => {
      const abs = normalize(p), i = abs.lastIndexOf('/');
      const dir = lookup(abs.slice(0, i) || '/');
      const name = dir.node && dir.node.type === 'dir' ? resolveSeg(dir.node, abs.slice(i + 1)) : abs.slice(i + 1);
      return { dir, name, abs };
    };
    const pretty = abs => abs === HOME ? '~' : abs.startsWith(HOME + '/') ? '~' + abs.slice(HOME.length) : abs;
    const err = text => ({ text, cls: 'term-out', err: true });
    const noent = (c, p) => err(`${c}: ${p}: No such file or directory`);
    const eperm = (c, p) => err(`${c}: ${p}: Permission denied`);
    const deco = (n, node) => node.type === 'dir' ? n + '/' : node.link ? n + '@' : n;
    const pad = (s, w) => String(s).padStart(w);
    const toLines = s => (s === '' ? [] : s.replace(/\n$/, '').split('\n'));
    const rand = n => { const cs = '!@#$%^&*()_+-=[]{};:,.<>/?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; let o = ''; for (let i = 0; i < n; i++) o += cs[Math.floor(Math.random() * cs.length)]; return o; };
    const muted = text => ({ text, cls: 'term-muted' });
    const go = (url, label) => {
      if (!/^(https?:\/\/|\/(?!\/))/.test(url)) return [err(`open: refusing to open '${url}'`)];
      setTimeout(() => { location.href = url; }, 450); return [muted(`opening ${label || url} ...`)];
    };
    const flags = argv => {
      const f = {}, a = [];
      for (const x of argv) {
        if (x.startsWith('--') && x.length > 2) f[x.slice(2)] = true;
        else if (x.startsWith('-') && x.length > 1 && !/^-\d/.test(x)) for (const c of x.slice(1)) f[c] = true;
        else a.push(x);
      }
      return { f, a };
    };
    const readFile = (c, p) => {
      const r = lookup(p);
      if (!r.node) return { err: r.denied ? eperm(c, p) : noent(c, p) };
      if (r.node.type === 'dir') return { err: err(`${c}: ${p}: Is a directory`) };
      if (r.node.denied) return { err: eperm(c, p) };
      if (r.node.special === 'random') return { lines: [rand(72)] };
      if (r.node.image) return { lines: [{ text: `[${r.node.image.alt}]`, image: r.node.image }] };
      return { lines: toLines(r.node.content) };
    };
    const writeFile = (p, content, append) => {
      const { dir, name } = parentOf(p);
      if (!dir.node || dir.node.type !== 'dir') return noent('bash', p);
      if (dir.node.denied) return eperm('bash', p);
      const ex = dir.node.children[name];
      if (ex && ex.type === 'dir') return err(`bash: ${p}: Is a directory`);
      if (ex && ex.denied) return eperm('bash', p);
      if (ex && append) ex.content += content; else dir.node.children[name] = mkfile(content, false);
      return null;
    };
    const gather = (c, files, stdin) => {
      if (!files.length) return { lines: stdin, errs: [] };
      const lines = [], errs = [];
      for (const p of files) { const r = readFile(c, p); if (r.err) errs.push(r.err); else lines.push(...r.lines); }
      return { lines, errs };
    };
    const nOpt = argv => {
      let n = 10; const rest = [];
      for (let i = 0; i < argv.length; i++) {
        if (argv[i] === '-n') n = parseInt(argv[++i], 10) || 10;
        else if (/^-\d+$/.test(argv[i])) n = parseInt(argv[i].slice(1), 10);
        else rest.push(argv[i]);
      }
      return { n, rest };
    };
    const glob = pat => new RegExp('^' + pat.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');

    /* ---------- commands ---------- */
    const cmds = Object.create(null), man = Object.create(null);
    const builtins = new Set(['cd', 'pwd', 'echo', 'help', 'exit', 'history', 'clear', 'type', 'man']);
    const def = (names, help, fn) => { for (const n of [].concat(names)) { cmds[n] = fn; man[n] = help; } };
    const NET = 'network unreachable. this is a static site, mate.';

    def('ls', 'list directory contents (-a all, -l long)', (argv, stdin, ctx) => {
      const o = flags(argv), paths = o.a.length ? o.a : ['.'], out = [], piped = !!(ctx && ctx.piped);
      const fmt = (n, node) => {
        if (!o.f.l) return deco(n, node);
        const perm = node.type === 'dir' ? (node.denied ? 'drwx------' : 'drwxr-xr-x') : node.link ? 'lrwxrwxrwx' : node.denied ? '----------' : '-rw-r--r--';
        const size = node.type === 'dir' ? 4096 : (node.content || '').length;
        return `${perm} 1 ${user} ${user} ${pad(size, 6)} ${DATE} ${deco(n, node)}${node.link ? ' -> ' + node.link : ''}`;
      };
      for (const p of paths) {
        const r = lookup(p);
        if (!r.node) { out.push(r.denied ? `ls: cannot open directory '${p}': Permission denied` : `ls: cannot access '${p}': No such file or directory`); continue; }
        if (r.node.type === 'file') { out.push(fmt(r.name, r.node)); continue; }
        if (r.node.denied) { out.push(`ls: cannot open directory '${p}': Permission denied`); continue; }
        if (paths.length > 1) out.push(`${p}:`);
        let names = Object.keys(r.node.children).sort((a, b) => a.localeCompare(b));
        if (!o.f.a) names = names.filter(n => !n.startsWith('.'));
        if (o.f.l) { if (o.f.a) out.push(`drwxr-xr-x 1 ${user} ${user}   4096 ${DATE} ./`, `drwxr-xr-x 1 ${user} ${user}   4096 ${DATE} ../`); names.forEach(n => out.push(fmt(n, r.node.children[n]))); }
        else { const items = (o.f.a ? ['.', '..'] : []).concat(names.map(n => deco(n, r.node.children[n]))); if (piped) out.push(...items); else out.push(items.join('  ')); }
      }
      return out;
    });
    def('cd', 'change directory', argv => {
      const p = argv[0] || '~', r = lookup(p);
      if (!r.node) return [r.denied ? `bash: cd: ${p}: Permission denied` : `bash: cd: ${p}: No such file or directory`];
      if (r.node.type === 'file') return r.node.link ? go(r.node.link, p) : [`bash: cd: ${p}: Not a directory`];
      if (r.node.denied) return [`bash: cd: ${p}: Permission denied`];
      cwd = r.path;
      return [];
    });
    def('pwd', 'print working directory', () => [cwd]);
    def('cat', 'print files', (argv, stdin) => {
      if (!argv.length) return stdin;
      const out = [];
      for (const p of argv) { const r = readFile('cat', p); if (r.err) out.push(r.err); else out.push(...r.lines); }
      return out;
    });
    def(['open', 'xdg-open'], 'open a post, a link, or a section in the browser', argv => {
      const p = argv[0];
      if (!p) return ['open: missing path'];
      const r = lookup(p);
      if (!r.node) return [r.denied ? eperm('open', p) : noent('open', p)];
      const n = r.node;
      if (n.image) return [{ text: `[${n.image.alt}]`, image: n.image }];
      if (n.page) return go(n.page.url, n.page.title);
      if (n.link) return go(n.link);
      if (n.type === 'dir' && n.children['.url']) return go(n.children['.url'].content.trim(), p);
      return [`open: ${p}: nothing to open. try a .md post, a @link, or a directory with a .url`];
    });
    def('echo', 'print text (supports > and >> redirection)', argv => [argv.join(' ')]);
    def('touch', 'create an empty file', argv => {
      const out = [];
      for (const p of argv) {
        const { dir, name } = parentOf(p);
        if (!dir.node || dir.node.type !== 'dir') { out.push(`touch: cannot touch '${p}': No such file or directory`); continue; }
        if (dir.node.denied) { out.push(`touch: cannot touch '${p}': Permission denied`); continue; }
        if (!dir.node.children[name]) dir.node.children[name] = mkfile('', false);
      }
      return out;
    });
    def('mkdir', 'make a directory (-p for parents)', argv => {
      const o = flags(argv), out = [];
      if (!o.a.length) return ['mkdir: missing operand'];
      for (const p of o.a) {
        if (o.f.p) { ensureDir(normalize(p)); continue; }
        const { dir, name } = parentOf(p);
        if (!dir.node || dir.node.type !== 'dir') { out.push(`mkdir: cannot create directory '${p}': No such file or directory`); continue; }
        if (dir.node.denied) { out.push(`mkdir: cannot create directory '${p}': Permission denied`); continue; }
        if (dir.node.children[name]) { out.push(`mkdir: cannot create directory '${p}': File exists`); continue; }
        dir.node.children[name] = mkdir();
      }
      return out;
    });
    const nuke = () => ({ anim: async (print, scroll) => {
      for (const d of ['/bin', '/etc', '/var/log', '/dev', '/tmp', `${HOME}/blog`, `${HOME}/certs`, `${HOME}/.ssh`, HOME, '/']) {
        print(muted(`rm: removing ${d} ...`)); scroll(); await sleep(170);
      }
      root.children = Object.create(null); cwd = '/';
      print(''); print("it's gone. all of it. you absolute menace."); print(muted('(refresh the page to restore the universe)'));
    } });
    def(['rm', 'rmdir'], 'remove files (-r for directories). you know what rm -rf / does', argv => {
      const o = flags(argv), out = [];
      if (!o.a.length) return ['rm: missing operand'];
      for (const p of o.a) {
        const abs = normalize(p);
        if (abs === '/' || abs === '/*') {
          if (!o.f['no-preserve-root']) { out.push("rm: it is dangerous to operate recursively on '/'", 'rm: use --no-preserve-root to override this failsafe'); continue; }
          return nuke();
        }
        const r = lookup(p);
        if (!r.node) { out.push(`rm: cannot remove '${p}': ${r.denied ? 'Permission denied' : 'No such file or directory'}`); continue; }
        if (r.node.type === 'dir' && !(o.f.r || o.f.R)) { out.push(`rm: cannot remove '${p}': Is a directory`); continue; }
        if (r.node.denied && r.node.type === 'dir') { out.push(`rm: cannot remove '${p}': Permission denied`); continue; }
        delete r.parent.children[r.name];
        if (cwd === abs || cwd.startsWith(abs + '/')) cwd = normalize(abs + '/..');
      }
      return out;
    });
    const clone = n => n.type === 'dir'
      ? Object.assign(mkdir(), { denied: n.denied, children: Object.assign(Object.create(null), ...Object.keys(n.children).map(k => ({ [k]: clone(n.children[k]) }))) })
      : Object.assign({}, n);
    const place = (c, src, dst, copy, recursive) => {
      const s = lookup(src);
      if (!s.node) return s.denied ? eperm(c, src) : noent(c, src);
      if (s.node.denied && s.node.type === 'dir') return eperm(c, src);
      if (copy && s.node.type === 'dir' && !recursive) return `cp: -r not specified; omitting directory '${src}'`;
      let dir, name = s.name;
      const d = lookup(dst);
      if (d.node && d.node.type === 'dir') dir = d.node;
      else { const p = parentOf(dst); if (!p.dir.node || p.dir.node.type !== 'dir') return noent(c, dst); dir = p.dir.node; name = p.name; }
      if (dir.denied) return eperm(c, dst);
      if (!copy && !s.parent) return `mv: cannot move '/'`;
      const dirPath = d.node && d.node.type === 'dir' ? d.path : parentOf(dst).dir.path;
      if (s.node.type === 'dir' && (dirPath === s.path || dirPath.startsWith(s.path === '/' ? '/' : s.path + '/'))) return `${c}: cannot ${copy ? 'copy' : 'move'} '${src}' into itself, '${dst}'`;
      dir.children[name] = copy ? clone(s.node) : s.node;
      if (!copy) delete s.parent.children[s.name];
      return null;
    };
    def('mv', 'move or rename', argv => { const o = flags(argv); if (o.a.length < 2) return ['mv: missing file operand']; const e = place('mv', o.a[0], o.a[1], false, true); return e ? [e] : []; });
    def('cp', 'copy (-r for directories)', argv => { const o = flags(argv); if (o.a.length < 2) return ['cp: missing file operand']; const e = place('cp', o.a[0], o.a[1], true, o.f.r || o.f.R); return e ? [e] : []; });
    def('chmod', 'change permissions. chmod +r .flag, if you dare', argv => {
      const mode = argv[0], files = argv.slice(1), out = [];
      if (!mode || !files.length) return ['usage: chmod MODE FILE...'];
      for (const p of files) {
        const r = lookup(p);
        if (!r.node) { out.push(r.denied ? eperm('chmod', p) : noent('chmod', p)); continue; }
        if (/^[0-7]{3,4}$/.test(mode)) r.node.denied = mode.slice(-3).charAt(0) < '4';
        else if (mode.includes('+')) r.node.denied = false;
        else if (mode.includes('-')) r.node.denied = true;
        else out.push(`chmod: invalid mode: '${mode}'`);
      }
      return out;
    });
    def('tree', 'directory tree (-a all)', argv => {
      const o = flags(argv), start = o.a[0] || '.', r = lookup(start);
      if (!r.node || r.node.type !== 'dir') return [`tree: ${start}: not a directory`];
      if (r.node.denied) return [eperm('tree', start)];
      const out = [start]; let nd = 0, nf = 0;
      (function walk(node, prefix) {
        const names = Object.keys(node.children).sort().filter(n => o.f.a || !n.startsWith('.'));
        names.forEach((n, i) => {
          const last = i === names.length - 1, c = node.children[n];
          out.push(prefix + (last ? '└── ' : '├── ') + deco(n, c));
          if (c.type === 'dir') { nd++; if (!c.denied) walk(c, prefix + (last ? '    ' : '│   ')); } else nf++;
        });
      })(r.node, '');
      out.push('', `${nd} director${nd === 1 ? 'y' : 'ies'}, ${nf} file${nf === 1 ? '' : 's'}`);
      return out;
    });
    def('find', 'find files: find . -name "*.md"', argv => {
      let start = '.', pat = null;
      for (let i = 0; i < argv.length; i++) { if (argv[i] === '-name' || argv[i] === '-iname') pat = argv[++i]; else if (!argv[i].startsWith('-')) start = argv[i]; }
      const r = lookup(start);
      if (!r.node) return [r.denied ? eperm('find', start) : noent('find', start)];
      const re = pat ? glob(pat) : null, out = [];
      (function walk(node, p) {
        if (!re || re.test(p.split('/').pop())) out.push(p);
        if (node.type === 'dir' && !node.denied) for (const n of Object.keys(node.children).sort()) walk(node.children[n], p.replace(/\/$/, '') + '/' + n);
      })(r.node, start);
      return out;
    });
    def('grep', 'search lines: grep [-i] PATTERN [FILE...]', (argv, stdin) => {
      const o = flags(argv), pat = o.a[0], files = o.a.slice(1);
      if (!pat) return ['usage: grep [-i] PATTERN [FILE...]'];
      let re; try { re = new RegExp(pat, o.f.i ? 'i' : ''); } catch (e) { return ['grep: invalid pattern']; }
      if (!files.length) return stdin.filter(l => re.test(l));
      const out = [];
      for (const p of files) {
        const r = readFile('grep', p);
        if (r.err) { out.push(r.err); continue; }
        r.lines.forEach(l => { if (re.test(l)) out.push((files.length > 1 ? p + ':' : '') + l); });
      }
      return out;
    });
    def('head', 'first lines (-n N)', (argv, stdin) => { const { n, rest } = nOpt(argv); const g = gather('head', rest, stdin); return g.errs.concat(g.lines.slice(0, n)); });
    def('tail', 'last lines (-n N)', (argv, stdin) => { const { n, rest } = nOpt(argv); const g = gather('tail', rest, stdin); return g.errs.concat(g.lines.slice(-n)); });
    def('wc', 'count lines, words, chars (-l -w -c)', (argv, stdin) => {
      const o = flags(argv), g = gather('wc', o.a, stdin), text = g.lines.join('\n');
      const l = g.lines.length, w = text.split(/\s+/).filter(Boolean).length, c = text.length, parts = [];
      if (o.f.l) parts.push(l); if (o.f.w) parts.push(w); if (o.f.c) parts.push(c);
      if (!parts.length) parts.push(l, w, c);
      return g.errs.concat(parts.map(x => pad(x, 7)).join('') + (o.a.length ? ' ' + o.a.join(' ') : ''));
    });
    def('sort', 'sort lines (-r reverse, -u unique)', (argv, stdin) => { const o = flags(argv), g = gather('sort', o.a, stdin); let s = g.lines.slice().sort(); if (o.f.r) s.reverse(); if (o.f.u) s = s.filter((x, i) => s.indexOf(x) === i); return g.errs.concat(s); });
    def('uniq', 'drop repeated adjacent lines', (argv, stdin) => { const g = gather('uniq', argv, stdin); return g.errs.concat(g.lines.filter((x, i, a) => i === 0 || x !== a[i - 1])); });
    def('file', 'what kind of file is it', argv => argv.map(p => { const r = lookup(p); if (!r.node) return r.denied ? eperm('file', p) : `${p}: cannot open (No such file or directory)`; const n = r.node; return `${p}: ${n.type === 'dir' ? 'directory' : n.link ? 'symbolic link to ' + n.link : n.image ? 'JPEG image data, one security engineer, sunglasses' : n.special === 'bin' ? 'ELF 64-bit LSB executable' : n.denied ? 'regular file, no read permission' : 'ASCII text'}`; }));
    def('which', 'locate a command', argv => argv.map(c => builtins.has(c) ? `${c}: shell built-in command` : lookup('/bin/' + c).node ? `/bin/${c}` : `${c} not found`));
    def('type', 'describe a command', argv => argv.map(c => builtins.has(c) ? `${c} is a shell builtin` : lookup('/bin/' + c).node ? `${c} is /bin/${c}` : `bash: type: ${c}: not found`));
    def('man', 'manual pages, one line each', argv => argv.length ? argv.map(c => man[c] ? `${c} - ${man[c]}` : `No manual entry for ${c}`) : ['What manual page do you want?', 'For example, try: man ls']);
    def('help', 'this', () => [
      'files:    ls  cd  pwd  cat  tree  find  grep  head  tail  wc  sort  touch  mkdir  rm  mv  cp  chmod  echo  open',
      'system:   whoami  id  hostname  uname  uptime  date  env  ps  df  free  history  clear  exit',
      'fun:      fortune  make coffee  cowsay  sl  hack  neofetch  nmap  yes  sudo',
      'tricks:   pipes (cat .profile | grep ROLE), redirects (echo hi > notes.txt), chaining (cd blog && ls), tab completion, up/down history',
      muted('man <cmd> for a one-liner. your posts live in ~/blog. try: cat .flag'),
      muted('ls marks dirs with / and links with @. open <name> follows a link, ls -l shows where it goes.'),
    ]);
    def('whoami', 'who you are', () => [user]);
    def('id', 'uid and groups', () => [`uid=1000(${user}) gid=1000(${user}) groups=1000(${user}),998(docker),1337(ctf)`]);
    def('hostname', 'hostname', () => [hostname]);
    def('uname', 'kernel info', argv => [argv.includes('-a') ? `Linux ${hostname} 6.1.0-static #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux` : 'Linux']);
    def('uptime', 'time since you loaded this page', () => { const s = Math.floor((Date.now() - boot) / 1000); return [` ${new Date().toTimeString().slice(0, 8)} up ${Math.floor(s / 60)} min, 1 user, load average: 0.00, 0.01, 0.05`]; });
    def('date', 'current date', () => [new Date().toString()]);
    def(['env', 'printenv'], 'environment', () => Object.entries(envVars()).map(([k, v]) => `${k}=${v}`));
    def('export', 'pretend to set a variable', argv => argv.length ? [] : ['declare -x HOME="' + HOME + '"']);
    def('ps', 'processes', () => ['  PID TTY          TIME CMD', '    1 ?        00:00:01 init', '  420 ?        00:04:20 hugo', ' 1337 ?        00:13:37 sshd', ' 2024 pts/0    00:00:00 fakesh', ' 2025 pts/0    00:00:00 ps']);
    def('df', 'disk usage, allegedly', () => ['Filesystem      Size  Used Avail Use% Mounted on', 'ram             4.0G   48M  4.0G   2% /', 'static          1.0T  1.1M  1.0T   1% /home/' + user + '/blog']);
    def('free', 'memory', () => { const m = performance.memory; const used = m ? Math.round(m.usedJSHeapSize / 1048576) : 48, total = m ? Math.round(m.jsHeapSizeLimit / 1048576) : 4096; return ['               total        used        free', `Mem:      ${pad(total, 10)}  ${pad(used, 10)}  ${pad(total - used, 10)}`, 'Swap:              0           0           0']; });
    def('history', 'command history (-c to clear)', argv => { if (argv[0] === '-c') { hist = []; hpos = 0; return []; } return hist.map((h, i) => `${pad(i + 1, 5)}  ${h}`); });
    def('clear', 'clear the screen (also Ctrl+L)', () => { for (const l of body.querySelectorAll('.term-line')) if (l !== form) l.remove(); return []; });
    def(['exit', 'logout', 'quit'], 'close the session', () => { closed = true; return ['logout', muted(`Connection to ${hostname} closed.`), muted('(refresh the page to reconnect)')]; });
    def('fortune', 'words of wisdom', () => [fortunes.length ? fortunes[Math.floor(Math.random() * fortunes.length)] : 'You will refresh this page.']);
    def('make', 'make coffee', argv => !argv.length ? ['make: *** No targets specified and no makefile found.  Stop.'] : argv[0] === 'coffee' ? ['cortado ☕  code crafted with perfection'] : argv[0] === 'tea' ? ['make: *** tea is a rule, not a target. use the kettle.  Stop.'] : [`make: *** No rule to make target '${argv[0]}'.  Stop.`]);
    def('coffee', 'see make coffee', () => ['usage: make coffee']);
    def('cowsay', 'a cow says things', (argv, stdin) => {
      const msg = (argv.length ? argv.join(' ') : stdin.join(' ')) || 'moo';
      const w = Math.min(40, msg.length), parts = [];
      for (let s = msg; s.length; s = s.slice(w)) parts.push(s.slice(0, w).padEnd(w));
      const out = [' ' + '_'.repeat(w + 2)];
      parts.forEach((p, i) => { const one = parts.length === 1; const l = one ? '<' : i === 0 ? '/' : i === parts.length - 1 ? '\\' : '|'; const r = one ? '>' : i === 0 ? '\\' : i === parts.length - 1 ? '/' : '|'; out.push(`${l} ${p} ${r}`); });
      out.push(' ' + '-'.repeat(w + 2), '        \\   ^__^', '         \\  (oo)\\_______', '            (__)\\       )\\/\\', '                ||----w |', '                ||     ||');
      return out;
    });
    def('yes', 'y, forever. well, for a bit', argv => { const y = argv.join(' ') || 'y'; const out = []; for (let i = 0; i < 24; i++) out.push(y); out.push(muted('^C  (I am not doing that forever)')); return out; });
    def('nmap', 'port scan this site', argv => ['Starting Nmap 7.94 ( https://nmap.org ) at ' + new Date().toISOString().slice(0, 16).replace('T', ' '), `Nmap scan report for ${argv.find(a => !a.startsWith('-')) || hostname}`, 'Host is up (0.00042s latency).', '', 'PORT     STATE  SERVICE', '22/tcp   closed ssh        (nice try)', '80/tcp   open   http', '443/tcp  open   https', '1337/tcp open   leet', '', 'Nmap done: 1 IP address (1 host up) scanned in 0.13 seconds']);
    def(['curl', 'wget', 'ping', 'nc', 'telnet', 'dig', 'pip', 'npm', 'git'], 'no network here', argv => [NET]);
    def('ssh', 'no network here', argv => [`ssh: connect to host ${argv.find(a => !a.startsWith('-')) || 'nowhere'} port 22: Network is unreachable`, muted(NET)]);
    def(['apt', 'apt-get', 'dnf', 'pacman', 'brew'], 'no packages here', () => ['E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)', 'E: Unable to acquire the dpkg frontend lock, are you root?']);
    def(['vim', 'vi', 'nano', 'emacs', 'ed'], 'there are no editors here', () => ['no editors on this box. use cat to read and echo "text" > file to write.']);
    def(['reboot', 'shutdown', 'poweroff', 'systemctl'], 'systemd says no', () => ['Failed to set wall message, ignoring: Interactive authentication required', 'Failed to reboot system via logind: Interactive authentication required']);
    def(['true'], 'does nothing, successfully', () => []);
    def(['false'], 'does nothing, unsuccessfully', () => []);
    def('su', 'become root. try it', () => ({ out: [], prompt: { text: 'Password:', secret: true, then: () => ({ out: ['su: Authentication failure'] }) } }));
    def('sudo', 'superuser do. you are not the superuser', argv => {
      if (!argv.length) return ['usage: sudo <command>'];
      let tries = 0;
      const ask = () => ({ text: `[sudo] password for ${user}:`, secret: true, then: () => { tries++; return tries < 3 ? { out: ['Sorry, try again.'], prompt: ask() } : { out: ['sudo: 3 incorrect password attempts', `${user} is not in the sudoers file. This incident will be reported.`] }; } });
      return { out: [], prompt: ask() };
    });
    def('neofetch', 'system info, mostly lies', () => {
      const up = Math.floor((Date.now() - boot) / 1000), m = performance.memory;
      const ua = navigator.userAgent, br = /Firefox/.test(ua) ? 'Firefox' : /Edg\//.test(ua) ? 'Edge' : /Chrome/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'a browser';
      const logo = ['   __        __', '   \\ \\      / /', '    \\ \\ /\\ / / ', '     \\ V  V /  ', '      \\_/\\_/   ', '', `   >_ ${hostname}`];
      const info = [host, '-'.repeat(host.length), 'OS: Hugo + PaperMod (static)', `Host: ${hostname}`, 'Kernel: 6.1.0-static', `Uptime: ${Math.floor(up / 60)}m ${up % 60}s`, 'Shell: fakesh 0.2', `Resolution: ${innerWidth}x${innerHeight}`, `Theme: ${document.body.classList.contains('dark') ? 'dark' : 'light'}`, `Terminal: ${br}`, 'CPU: 1 x cortado @ 3.0GHz', `Memory: ${m ? Math.round(m.usedJSHeapSize / 1048576) + 'MiB / ' + Math.round(m.jsHeapSizeLimit / 1048576) + 'MiB' : 'enough'}`];
      const w = Math.max(...logo.map(l => l.length)) + 3, out = [];
      for (let i = 0; i < Math.max(logo.length, info.length); i++) out.push((logo[i] || '').padEnd(w) + (info[i] || ''));
      return out;
    });
    const TRAIN = [
      '      ====        ________                ___________ ',
      '  _D _|  |_______/        \\__I_I_____===__|_________| ',
      '   |(_)---  |   H\\________/ |   |        =|___ ___|   ',
      '   /     |  |   H  |  |     |   |         ||_| |_||   ',
      '  |      |  |   H  |__--------------------| [___] |   ',
      '  | ________|___H__/__|_____/[][]~\\_______|       |   ',
      '  |/ |   |-----------I_____I [][] []  D   |=======|__ ',
      '__/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__ ',
      ' |/-=|___|=    ||    ||    ||    |_____/~\\___/        ',
      '  \\_/      \\O=====O=====O=====O_/      \\_/            ',
    ];
    def('sl', 'you typed ls wrong', () => ({ anim: async (print, scroll) => {
      const probe = document.createElement('span'); probe.textContent = 'MMMMMMMMMM'; probe.style.cssText = 'visibility:hidden;white-space:pre;position:absolute'; body.appendChild(probe);
      const cw = probe.getBoundingClientRect().width / 10 || 8; probe.remove();
      const cols = Math.max(24, Math.floor((body.clientWidth - 40) / cw)), w = TRAIN[0].length;
      const rows = TRAIN.map(() => print('')); scroll();
      if (reduce) { TRAIN.forEach((t, i) => { rows[i].textContent = t.slice(0, cols); }); return; }
      for (let off = cols; off > -w; off -= 3) {
        TRAIN.forEach((t, i) => { rows[i].textContent = (off >= 0 ? ' '.repeat(off) + t : t.slice(-off)).slice(0, cols); });
        await sleep(45);
      }
      rows.forEach(r => r.remove());
      print(muted('choo choo. it was ls you wanted.'));
    } }));
    def('hack', 'hack the planet', argv => ({ anim: async (print, scroll) => {
      const target = argv[0] || hostname;
      print(`[*] target: ${target}`); scroll(); await sleep(400);
      const bar = print('[*] bypassing firewall  [          ]   0%');
      for (let i = 1; i <= 10; i++) { bar.textContent = `[*] bypassing firewall  [${'#'.repeat(i)}${' '.repeat(10 - i)}] ${pad(i * 10, 3)}%`; await sleep(110); }
      print('[*] cracking hashes ........ done (they were all "password1")'); scroll(); await sleep(500);
      print('[*] escalating privileges .. root'); scroll(); await sleep(400);
      print('[+] access achieved'); scroll(); await sleep(300);
      const flag = lookup(HOME + '/.flag').node;
      if (!flag || flag.type !== 'file') { print(muted('[!] nothing worth taking. somebody already cleaned house.')); scroll(); return; }
      print('[+] file of interest: ~/.flag (0600, root only)'); scroll(); await sleep(400);
      const ex = print('[*] exfiltrating to ~/loot/ ...'); scroll(); await sleep(600);
      const loot = ensureDir(HOME + '/loot');
      if (!loot) { print(muted('[!] ~/loot is not a directory. move it out of the way and try again.')); scroll(); return; }
      loot.children.flag = mkfile(flag.content, false);
      ex.textContent += ' done';
      print(muted('run: cat ~/loot/flag')); scroll();
    } }));
    def('matrix', 'wake up, neo', () => ({ anim: async (print, scroll) => {
      const rows = []; for (let i = 0; i < 6; i++) rows.push(print(''));
      scroll();
      for (let f = 0; f < (reduce ? 1 : 24); f++) { rows.forEach(r => { r.textContent = rand(48).replace(/[^01a-z]/g, ' '); }); await sleep(80); }
      rows.forEach(r => r.remove());
      print(muted('follow the white rabbit. (there is no rabbit. it is a static site.)'));
    } }));

    const envVars = () => ({ HOME, USER: user, PWD: cwd, SHELL: '/bin/fakesh', TERM: 'xterm-256color', EDITOR: 'cat', HOSTNAME: hostname, LANG: 'en_GB.UTF-8' });
    const bin = lookup('/bin').node;
    for (const n of Object.keys(cmds)) if (!builtins.has(n)) bin.children[n] = mkfile('@bin');
    bin.children.fakesh = mkfile('@bin');

    /* ---------- shell ---------- */
    const expand = s => s.replace(/\$([A-Z_]+)/g, (m, k) => (envVars()[k] !== undefined ? envVars()[k] : m));
    const tokenize = s => {
      const t = []; let cur = '', q = null;
      for (let i = 0; i < s.length; i++) {
        const c = s[i];
        if (q) { if (c === q) q = null; else cur += c; }
        else if (c === '"' || c === "'") q = c;
        else if (/\s/.test(c)) { if (cur) { t.push(cur); cur = ''; } }
        else if (c === ';') { if (cur) { t.push(cur); cur = ''; } t.push(';'); }
        else if (c === '&' && s[i + 1] === '&') { if (cur) { t.push(cur); cur = ''; } t.push(';'); i++; }
        else if (c === '|' && s[i + 1] === '|') { if (cur) { t.push(cur); cur = ''; } t.push(';'); i++; }
        else if (c === '|' || c === '>') { if (cur) { t.push(cur); cur = ''; } if (c === '>' && s[i + 1] === '>') { t.push('>>'); i++; } else t.push(c); }
        else cur += c;
      }
      if (cur) t.push(cur);
      return t;
    };
    const exec = (name, argv, stdin, piped) => {
      if (name === 'll') { name = 'ls'; argv = ['-la', ...argv]; }
      if (name === 'la') { name = 'ls'; argv = ['-a', ...argv]; }
      if (!cmds[name]) return [err(`bash: ${name}: command not found`)];
      const b = lookup('/bin').node;
      if (!builtins.has(name) && !(b && b.children[name])) return [err(`bash: ${name}: command not found`)];
      return cmds[name](argv, stdin || [], { piped: !!piped });
    };
    const runLine = raw => {
      const line = raw.trim();
      if (!line) return { out: [] };
      if (line.replace(/\s/g, '') === ':(){:|:&};:') return { out: ['bash: fork: retry: Resource temporarily unavailable', 'bash: fork: retry: Resource temporarily unavailable', 'bash: fork: Resource temporarily unavailable', muted('nice try. the sandbox has a cap on wackiness.')] };
      const all = tokenize(expand(line)), segs = []; let seg = [];
      for (const t of all) { if (t === ';') { segs.push(seg); seg = []; } else seg.push(t); }
      segs.push(seg);
      if (segs.length === 1) return runSegment(segs[0]);
      const out = [];
      for (const sg of segs) { if (!sg.length) continue; const r = runSegment(sg); if (r && !Array.isArray(r.out)) return r; if (r.anim || r.prompt) { out.push(...(r.out || [])); return Object.assign(r, { out }); } out.push(...r.out); }
      return { out };
    };
    const runSegment = toks => {
      let redir = null;
      const gt = toks.findIndex(t => t === '>' || t === '>>');
      if (gt >= 0) { redir = { append: toks[gt] === '>>', file: toks[gt + 1] }; toks.splice(gt); if (!redir.file) return { out: ["bash: syntax error near unexpected token `newline'"] }; }
      const stages = []; let cur = [];
      for (const t of toks) { if (t === '|') { stages.push(cur); cur = []; } else cur.push(t); }
      stages.push(cur);
      let stdin = [], out = [], errs = [];
      for (let k = 0; k < stages.length; k++) {
        const st = stages[k];
        if (!st.length) return { out: ["bash: syntax error near unexpected token `|'"] };
        const res = exec(st[0], st.slice(1), stdin, k < stages.length - 1 || !!redir);
        if (res && !Array.isArray(res)) { if (stages.length > 1 || redir) return { out: [`bash: ${st[0]}: cannot be piped or redirected`] }; return res; }
        out = (res || []).filter(l => !(l && l.err));
        errs.push(...(res || []).filter(l => l && l.err));
        stdin = out.map(l => (typeof l === 'string' ? l : l.text));
      }
      if (redir) { const e = writeFile(redir.file, stdin.join('\n') + (stdin.length ? '\n' : ''), redir.append); return { out: errs.concat(e ? [e] : []) }; }
      return { out: errs.concat(out) };
    };

    /* ---------- UI ---------- */
    const print = l => {
      const s = document.createElement('span');
      const str = typeof l === 'string';
      s.className = 'term-line show ' + (str ? 'term-out' : (l.cls || 'term-out'));
      const text = str ? l : l.text;
      if (!str && l.image) { const img = document.createElement('img'); img.className = 'term-img'; img.src = l.image.url; img.alt = l.image.alt; img.loading = 'lazy'; img.addEventListener('load', scroll); s.appendChild(img); body.insertBefore(s, form); return s; }
      const parts = text.split(/(https?:\/\/[^\s<>"')]+)/);
      if (parts.length === 1) s.textContent = text;
      else parts.forEach((p, k) => { if (k % 2) { const a = document.createElement('a'); a.href = p; a.textContent = p; a.target = '_blank'; a.rel = 'noopener'; s.appendChild(a); } else if (p) s.appendChild(document.createTextNode(p)); });
      body.insertBefore(s, form);
      return s;
    };
    const promptText = () => `${host} ${pretty(cwd)} $`;
    const echoCmd = (text, prompt) => {
      const s = document.createElement('span'); s.className = 'term-line term-cmd show';
      const p = document.createElement('span'); p.className = 'term-prompt'; p.textContent = prompt || promptText();
      const t = document.createElement('span'); t.className = 'term-text'; t.textContent = text;
      s.append(p, ' ', t); body.insertBefore(s, form);
      return { line: s, text: t };
    };
    const scroll = () => { body.scrollTop = body.scrollHeight; };
    const refreshPrompt = () => { promptEl.textContent = pending ? pending.text : promptText(); input.type = pending && pending.secret ? 'password' : 'text'; };
    const lock = v => { busy = v; input.disabled = v || closed; term.classList.toggle('is-busy', v); if (!v && !closed && fine) input.focus({ preventScroll: true }); };
    const handle = async res => {
      if (!res) return;
      if (res.out) res.out.forEach(print);
      if (res.anim) { lock(true); try { await res.anim(print, scroll); } finally { lock(false); } }
      pending = res.prompt || null;
      if (closed) { form.style.display = 'none'; input.disabled = true; }
      refreshPrompt(); scroll();
    };
    const submit = async raw => {
      if (pending) { const p = pending; pending = null; echoCmd('', p.text); await handle(p.then(raw)); return; }
      echoCmd(raw);
      if (raw.trim()) { hist.push(raw.trim()); hpos = hist.length; await handle(runLine(raw)); }
      else { refreshPrompt(); scroll(); }
    };
    const complete = v => {
      const m = v.match(/^(.*?)(\S*)$/), before = m[1], tok = m[2];
      let cands;
      if (!before.trim()) cands = Object.keys(cmds).filter(c => builtins.has(c) || lookup('/bin/' + c).node).map(c => c + ' ');
      else {
        const i = tok.lastIndexOf('/'), dirPart = i >= 0 ? tok.slice(0, i + 1) : '', base = tok.slice(i + 1);
        const r = lookup(dirPart || '.');
        if (!r.node || r.node.type !== 'dir' || r.node.denied) return v;
        cands = Object.keys(r.node.children).filter(n => base.startsWith('.') || !n.startsWith('.')).map(n => dirPart + n + (r.node.children[n].type === 'dir' ? '/' : ' '));
      }
      const ms = cands.filter(c => c.startsWith(tok));
      if (!ms.length) return v;
      if (ms.length === 1) return before + ms[0];
      let cp = ms[0]; for (const c of ms) while (!c.startsWith(cp)) cp = cp.slice(0, -1);
      if (cp.length > tok.length) return before + cp;
      print(muted(ms.map(c => c.trim()).join('  '))); scroll();
      return v;
    };

    form.addEventListener('submit', e => { e.preventDefault(); if (busy || closed) return; const v = input.value; input.value = ''; submit(v); });
    input.addEventListener('keydown', e => {
      if (busy) { e.preventDefault(); return; }
      if (e.key === 'ArrowUp') { if (hpos > 0) { hpos--; input.value = hist[hpos]; } e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (hpos < hist.length - 1) { hpos++; input.value = hist[hpos]; } else { hpos = hist.length; input.value = ''; } e.preventDefault(); }
      else if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); if (!pending) input.value = complete(input.value); }
      else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); cmds.clear([]); }
      else if (e.key === 'c' && e.ctrlKey) { e.preventDefault(); echoCmd(input.value + '^C'); input.value = ''; if (pending) { pending = null; refreshPrompt(); } scroll(); }
      else if (e.key === 'd' && e.ctrlKey && !input.value) { e.preventDefault(); submit('exit'); }
    });
    term.addEventListener('click', e => {
      if (busy || closed || term.classList.contains('is-typing')) return;
      if (e.target !== input && !(window.getSelection && String(window.getSelection()))) input.focus({ preventScroll: !fine });
    });

    /* ---------- intro: replay the transcript through the real shell ---------- */
    (async () => {
      const script = [];
      for (const l of Array.from(body.querySelectorAll('.term-line'))) {
        if (l === form) continue;
        if (l.classList.contains('term-cmd')) script.push({ cmd: l.querySelector('.term-text').textContent });
        else if (l.classList.contains('term-muted')) script.push({ muted: l.textContent });
        l.remove();
      }
      term.classList.add('is-typing'); lock(true);
      let skip = reduce;
      const onClick = () => { skip = true; };
      term.addEventListener('click', onClick);
      for (const s of script) {
        if (s.muted !== undefined) { print(muted(s.muted)); continue; }
        const e = echoCmd('');
        if (!skip) { e.line.classList.add('cur'); await sleep(260); for (const ch of s.cmd) { if (skip) break; e.text.textContent += ch; await sleep(28 + Math.random() * 50); } }
        e.text.textContent = s.cmd; e.line.classList.remove('cur');
        const res = runLine(s.cmd);
        if (res.out) res.out.forEach(print);
        scroll();
        if (!skip) await sleep(220);
      }
      term.removeEventListener('click', onClick);
      print(muted('this is a real shell, sort of. type help. tab completes. have a look around.'));
      term.classList.remove('is-typing');
      lock(false); refreshPrompt(); scroll(); requestAnimationFrame(scroll);
    })();
  }

  const start = () => document.querySelectorAll('.term').forEach(init);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
