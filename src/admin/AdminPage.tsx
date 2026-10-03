import { useEffect, useMemo, useRef, useState } from 'react';
import type { ContentEntry, ContentKind, CoverLayout, MediaAsset } from '../data/contentTypes';
import { isContentUrl, parseContentDocument } from '../content/contentRepository';
import { ProjectCover } from '../portfolio/ProjectCover';
import { GamePreviewDialog } from './GamePreviewDialog';
import type { ContentDocument } from '../data/contentTypes';
import { adminRequest, loadSnapshot, saveSnapshot, uploadFile, type Snapshot } from './adminApi';
import './admin.css';

const GROUPS: { kind: ContentKind; label: string; name: string; categories: [string, string][]; location: string }[] = [
  { kind: 'writing', label: '文案作品', name: 'WRITE HOUSE', categories: [['tvc', 'TVC 文案'], ['brand', '品牌文案'], ['ecommerce', '电商文案'], ['audience', '人群文案']], location: 'print-house' },
  { kind: 'brand', label: '品牌与视觉', name: 'BRAND & VISUAL', categories: [['ip', 'IP'], ['art', '视觉 / 海报'], ['brand', '品牌'], ['ecommerce', '电商 / H5']], location: 'brand-museum' },
  { kind: 'film', label: '影像作品', name: 'MARC CINEMA', categories: [['短片', '短片'], ['广告', '广告'], ['MV', 'MV'], ['影像实验', '影像实验']], location: 'marc-cinema' },
  { kind: 'hobby', label: '个人兴趣', name: 'HOBBY STUDIO', categories: [['photo', '摄影'], ['reading', '书籍'], ['vinyl', '唱片'], ['cycling', '骑行'], ['film', '电影']], location: 'my-hobby' },
  { kind: 'experiment', label: '实验室', name: 'EXPERIMENT LAB', categories: [['film', '影像实验'], ['game', '游戏实验'], ['interaction', '交互实验'], ['brand', '品牌实验'], ['visual', '视觉实验']], location: 'experiment-lab' },
  { kind: 'game-experience', label: '游戏经历', name: 'MY GAME', categories: [['journey', '游戏经历']], location: 'my-game' },
  { kind: 'game-project', label: '游戏互动', name: 'MY GAME', categories: [['making', '游戏互动']], location: 'my-game' },
  { kind: 'general', label: '其他作品', name: 'PORTFOLIO', categories: [['general', '其他作品']], location: '' },
];
const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif';
const VIDEO_ACCEPT = '.mp4,.webm,video/mp4,video/webm';
const clone = (entry: ContentEntry) => JSON.parse(JSON.stringify(entry)) as ContentEntry;
const thumbnail = (entry: ContentEntry) => entry.cover?.type === 'image' ? entry.cover.url : entry.cover?.poster || entry.media.find(asset => asset.type === 'image')?.url;
function defaultPresentation(kind: ContentKind, category: string): ContentEntry['presentation'] {
  return kind === 'hobby' && category === 'reading' ? 'portrait' : kind === 'hobby' && category === 'vinyl' ? 'square' : 'landscape';
}

export default function AdminPage() {
  const [session, setSession] = useState<{ token: string; dataDirectory: string } | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [groupIndex, setGroupIndex] = useState(0);
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState<ContentEntry | null>(null);
  const [original, setOriginal] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [message, setMessage] = useState('正在连接本机作品库…');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ document: ContentDocument; entryId: string; unsaved: boolean } | null>(null);
  const draftRef = useRef(draft); draftRef.current = draft;
  const group = GROUPS[groupIndex];
  const dirty = !!draft && JSON.stringify(draft) !== original;
  const entries = snapshot?.document.entries || [];
  const list = useMemo(() => entries.filter(entry => entry.kind === group.kind && (category === 'all' || entry.category === category)
    && `${entry.title} ${entry.description}`.toLowerCase().includes(query.toLowerCase())), [entries, group.kind, category, query]);

  async function connect() {
    setError('');
    try {
      const current = await adminRequest<{ token: string; dataDirectory: string }>('session');
      setSession(current); setSnapshot(await loadSnapshot(current.token)); setMessage('已连接本机作品库');
    } catch (error) { setError((error as Error).message); setMessage('连接失败'); }
  }
  useEffect(() => { void connect(); }, []);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => { if (dirty || busy) { event.preventDefault(); event.returnValue = ''; } };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, busy]);
  const discard = () => !busy && (!dirty || window.confirm('当前修改还没有保存，确定离开这个项目？'));
  function edit(entry: ContentEntry) { if (discard()) { const value = clone(entry); setDraft(value); setOriginal(JSON.stringify(value)); setError(''); } }
  function chooseGroup(index: number) { if (discard()) { setGroupIndex(index); setCategory('all'); setQuery(''); setDraft(null); setError(''); } }
  const patch = (value: Partial<ContentEntry>) => setDraft(previous => previous ? { ...previous, ...value } : previous);
  function setCover(cover?: MediaAsset) {
    setDraft(previous => previous ? { ...previous, cover, media: previous.media.map(asset => asset.type === 'video' && asset.poster === previous.cover?.url
      ? { ...asset, poster: cover?.type === 'image' ? cover.url : undefined } : asset) } : previous);
  }
  function setCoverLayout(value: Partial<CoverLayout>) {
    patch({ coverLayout: { ratio: 'original', fit: 'contain', ...draft?.coverLayout, ...value, ...(value.ratio === 'original' ? { fit: 'contain' } : {}) } });
  }
  function add() {
    if (!discard()) return;
    const nextCategory = category === 'all' ? group.categories[0][0] : category;
    setDraft({ id: `work-${crypto.randomUUID()}`, kind: group.kind, category: nextCategory, title: '', description: '', media: [], tags: [],
      locationId: group.location || undefined, section: group.kind === 'writing' ? 'WORDS' : undefined,
      presentation: defaultPresentation(group.kind, nextCategory), coverLayout: { ratio: group.kind === 'film' ? '16:9' : group.kind === 'game-experience' ? '1:1' : 'original', fit: 'contain' } }); setOriginal(''); setError('');
  }
  async function persist(nextEntries: ContentEntry[], nextDraft: ContentEntry | null, text: string) {
    if (!session || !snapshot) return;
    setBusy(true); setError('');
    try {
      const saved = await saveSnapshot(session.token, snapshot, { version: 1, entries: nextEntries });
      setSnapshot(saved); setDraft(nextDraft); setOriginal(nextDraft ? JSON.stringify(nextDraft) : ''); setMessage(text);
      localStorage.setItem('portfolio-content-updated', String(Date.now()));
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  async function save() {
    if (!draft || !draft.title.trim()) { setError('请填写项目名称'); return; }
    if (draft.detail && (!isContentUrl(draft.detail.url) || (draft.detail.type === 'link' && !/^https?:\/\//i.test(draft.detail.url)))) { setError(draft.detail.type === 'pdf' ? '请先上传 PDF' : '请填写完整的 http 或 https 链接'); return; }
    if (draft.demoUrl && !isContentUrl(draft.demoUrl)) { setError('体验链接格式不正确'); return; }
    const value = { ...draft, title: draft.title.trim() };
    await persist(entries.some(entry => entry.id === value.id) ? entries.map(entry => entry.id === value.id ? value : entry) : [...entries, value], value, '已保存，前台已更新');
  }
  async function remove() {
    if (!draft || !window.confirm(`从作品库移除「${draft.title}」？上传文件和自动备份仍会保留。`)) return;
    if (!entries.some(entry => entry.id === draft.id)) { setDraft(null); return; }
    await persist(entries.filter(entry => entry.id !== draft.id), null, '项目已移除，文件仍保留在本机');
  }
  async function upload(files: FileList | null, target: 'cover' | 'media' | 'video' | 'pdf') {
    if (!files?.length || !session || !draft) return;
    const targetId = draft.id; const completed: MediaAsset[] = []; let pdfUrl: string | undefined;
    setBusy(true); setError('');
    try {
      for (const file of Array.from(files)) {
        if (target === 'video' && !/\.(mp4|webm)$/i.test(file.name)) throw new Error('视频请选择 MP4 或 WebM 文件');
        if (target === 'pdf' && !/\.pdf$/i.test(file.name)) throw new Error('项目详情请选择 PDF 文件');
        if (target === 'cover' && !/\.(jpe?g|png|webp|gif)$/i.test(file.name)) throw new Error('封面请选择 JPG、PNG、WebP 或 GIF 图片');
        const result = await uploadFile(file, session.token, percent => setProgress(`${file.name} · ${percent}%`));
        if (target === 'pdf' && result.mime !== 'application/pdf') throw new Error('详情文件请选择 PDF');
        if (target === 'cover' && !result.mime.startsWith('image/')) throw new Error('封面请选择图片');
        if (target === 'media' && !/^(image|video)\//.test(result.mime)) throw new Error('系列画面请选择图片或视频');
        if (target === 'video' && !result.mime.startsWith('video/')) throw new Error('文件内容不是有效视频');
        if (target === 'pdf') pdfUrl = result.url;
        else completed.push({ id: result.id, type: result.mime.startsWith('video/') ? 'video' : 'image', url: result.url, alt: file.name,
          ...(result.mime.startsWith('video/') && draftRef.current?.cover?.type === 'image' ? { poster: draftRef.current.cover.url } : {}) });
      }
      setMessage('文件已上传，请保存项目让它出现在前台');
    } catch (error) { setError((error as Error).message); }
    finally {
      // Keep successful files in the draft even if a later file in the batch failed.
      setDraft(previous => !previous || previous.id !== targetId ? previous : target === 'pdf' && pdfUrl
        ? { ...previous, detail: { type: 'pdf', url: pdfUrl } } : target === 'cover' && completed[0]
        ? { ...previous, cover: completed[0], media: previous.media.map(asset => asset.type === 'video' && asset.poster === previous.cover?.url ? { ...asset, poster: completed[0].url } : asset) } : (target === 'media' || target === 'video') && completed.length
        ? { ...previous, media: [...previous.media, ...completed], cover: previous.cover || completed.find(asset => asset.type === 'image') } : previous);
      setBusy(false); setProgress('');
    }
  }
  function moveAsset(index: number, step: number) {
    if (!draft || index + step < 0 || index + step >= draft.media.length) return;
    const media = [...draft.media]; [media[index], media[index + step]] = [media[index + step], media[index]]; patch({ media });
  }
  function exportContent() {
    if (!snapshot) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot.document, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'portfolio-content.json'; anchor.click(); URL.revokeObjectURL(url);
  }
  function openPreview() {
    if (!draft || busy) return;
    try {
      const value = { ...clone(draft), title: draft.title.trim() || '未命名作品' };
      // An unfinished PDF/link choice has no detail file yet; still preview its cover and panel.
      if (value.detail && !value.detail.url) delete value.detail;
      const document = parseContentDocument({ version: 1, entries: entries.some(entry => entry.id === value.id)
        ? entries.map(entry => entry.id === value.id ? value : entry) : [...entries, value] });
      setError(''); setPreview({ document, entryId: value.id, unsaved: dirty });
    } catch { setError('请检查作品链接与文件设置后再预览'); }
  }

  return <div className="admin-page">
    <aside className="admin-sidebar"><a className="admin-wordmark" href="/" target="_blank" rel="noopener noreferrer"><span>▦</span> MARC ISLAND</a><span className="admin-eyebrow">作品管理</span>
      <nav aria-label="作品板块">{GROUPS.map((item, index) => <button key={item.kind} className={index === groupIndex ? 'is-active' : ''} disabled={busy} onClick={() => chooseGroup(index)}><span>{item.label}</span><small>{entries.filter(entry => entry.kind === item.kind).length}</small></button>)}</nav>
      <div className="admin-local-note"><i /> 本机保存<p>文件保存在这台电脑。保存后可在游戏中查看。</p><a href="/" target="_blank" rel="noopener noreferrer">打开个人主页 ↗</a></div>
    </aside>
    <main className="admin-main"><header className="admin-heading"><div><span className="admin-eyebrow">{group.name}</span><h1>{group.label}</h1></div><div><button className="admin-button subtle" onClick={exportContent} disabled={!snapshot}>导出内容清单</button></div></header>
      <div className={`admin-notice ${error ? 'has-error' : ''}`} role={error ? 'alert' : 'status'}><span>{error || progress || message}</span>{error && <button onClick={() => { if (discard()) { setDraft(null); void connect(); } }} disabled={busy}>重新连接 / 载入</button>}</div>
      <div className="admin-workspace"><section className="admin-project-list" aria-label="项目列表"><label className="admin-search"><span>搜索项目</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="输入名称或简介" /></label>
        <div className="admin-category-filter"><button onClick={() => setCategory('all')} className={category === 'all' ? 'is-active' : ''}>全部</button>{group.categories.map(([id, name]) => <button key={id} onClick={() => setCategory(id)} className={category === id ? 'is-active' : ''}>{name}</button>)}</div>
        <div className="admin-list-heading"><span>{list.length} 个作品</span><button className="admin-button" onClick={add} disabled={!snapshot || busy}>＋ 添加作品</button></div>
        <div className="admin-project-cards">{list.map(entry => <button key={entry.id} data-admin-entry={entry.id} className={`admin-project-card ${draft?.id === entry.id ? 'is-active' : ''}`} onClick={() => edit(entry)} disabled={busy}>{thumbnail(entry) ? <span className="admin-list-cover"><ProjectCover asset={{ id: 'thumbnail', type: 'image', url: thumbnail(entry)! }} layout={entry.coverLayout} title={entry.title} /></span> : <span className="admin-cover-empty">▧</span>}<span><strong>{entry.title}</strong><small>{group.categories.find(([id]) => id === entry.category)?.[1] || entry.category}</small></span></button>)}{!list.length && <p className="admin-empty">这里还没有作品。点击「添加作品」，上传你的内容。</p>}</div>
      </section>
      {!draft ? <section className="admin-editor admin-editor-empty"><span>▧</span><h2>把作品放进小岛</h2><p>选择一个项目进行编辑，或新建一个项目。</p><p>支持封面、系列图片、视频、PDF 和外部详情链接。</p></section> : <section className="admin-editor" aria-label="项目编辑">
        <div className="admin-editor-heading"><h2>{draft.title || '新项目'}</h2><div className="admin-editor-tools"><span>{dirty ? '修改未保存' : '已保存'}</span><button className="admin-button subtle" disabled={busy} onClick={openPreview}>游戏中预览</button></div></div>
        <fieldset disabled={busy}>
        <div className="admin-form-row"><label>项目名称<input value={draft.title} onChange={event => patch({ title: event.target.value })} maxLength={200} /></label><label>所属分类<select aria-label="所属分类" value={draft.category} onChange={event => patch({ category: event.target.value })}>{!group.categories.some(([id]) => id === draft.category) && <option value={draft.category}>{draft.category}</option>}{group.categories.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label></div>
        <label>简短介绍<textarea aria-label="简短介绍" rows={2} value={draft.description} onChange={event => patch({ description: event.target.value })} /></label>
        <div className="admin-form-row"><label>详情画面比例<select aria-label="详情画面比例" value={draft.presentation || 'original'} onChange={event => patch({ presentation: event.target.value as ContentEntry['presentation'] })}><option value="portrait">竖屏 · H5 / 书籍</option><option value="landscape">16:9 · 海报 / 视频</option><option value="square">正方形 · 唱片</option><option value="original">保留原始比例</option></select></label>{draft.kind === 'game-experience' ? <label>体验时长（小时）<input type="number" min="0" value={draft.hours ?? ''} onChange={event => patch({ hours: event.target.value === '' ? undefined : Number(event.target.value) })} /></label> : <label>日期（选填）<input value={draft.date || ''} placeholder="例如 2026.10" onChange={event => patch({ date: event.target.value || undefined })} /></label>}</div>
        <div className="admin-media-section"><h3>作品封面</h3><div className="admin-cover-editor"><div className="admin-cover-preview" aria-label="封面预览"><ProjectCover asset={thumbnail(draft) ? { id: 'preview', type: 'image', url: thumbnail(draft)! } : undefined} layout={draft.coverLayout} kind={draft.kind} title={draft.title || '封面预览'} /></div><div className="admin-cover-settings"><div><label className="admin-upload-button">上传 / 替换封面<input aria-label="上传封面" type="file" accept={IMAGE_ACCEPT} onChange={event => { void upload(event.target.files, 'cover'); event.target.value = ''; }} /></label>{draft.cover && <button className="admin-text-button" onClick={() => setCover(undefined)}>移除封面</button>}</div><div className="admin-form-row"><label>封面比例<select aria-label="封面比例" value={draft.coverLayout?.ratio || 'original'} onChange={event => setCoverLayout({ ratio: event.target.value as CoverLayout['ratio'] })}><option value="4:3">4:3 · 横向</option><option value="16:9">16:9 · 宽屏</option><option value="9:16">9:16 · 竖屏</option><option value="1:1">1:1 · 正方形</option><option value="original">保留原始比例</option></select></label><label>封面适配<select aria-label="封面适配" value={draft.coverLayout?.fit || 'contain'} disabled={draft.coverLayout?.ratio === 'original' || !draft.coverLayout} onChange={event => setCoverLayout({ fit: event.target.value as CoverLayout['fit'] })}><option value="contain">完整显示 · 不裁切</option><option value="cover">填满画框 · 居中裁切</option></select></label></div><p className="admin-help">选择比例后自动适配，左侧预览与前台封面一致。原始文件保留，可随时重新调整。</p></div></div></div>
        <div className="admin-media-section"><div className="admin-section-heading"><h3>作品图片与视频</h3><div className="admin-upload-actions"><label className="admin-upload-button">上传系列图片<input aria-label="上传系列图片" type="file" multiple accept={IMAGE_ACCEPT} onChange={event => { void upload(event.target.files, 'media'); event.target.value = ''; }} /></label><label className="admin-upload-button admin-upload-primary">上传视频<input aria-label="上传视频" type="file" multiple accept={VIDEO_ACCEPT} onChange={event => { void upload(event.target.files, 'video'); event.target.value = ''; }} /></label></div></div><p className="admin-help">图片可多选，单张最多 50 MB。视频支持 MP4 / WebM，单个最多 250 MB；保存后可直接在页面播放。</p>
          <div className="admin-media-grid">{draft.media.map((asset, index) => <div key={asset.id} className="admin-media-card">{asset.type === 'video' ? <video src={asset.url} poster={asset.poster} controls preload="metadata" /> : <img src={asset.url} alt={asset.alt || ''} />}<label className="admin-media-caption">画面说明<input aria-label={`画面 ${index + 1} 说明`} value={asset.caption || ''} onChange={event => patch({ media: draft.media.map((item, i) => i === index ? { ...item, caption: event.target.value } : item) })} /></label><div><button disabled={index === 0} onClick={() => moveAsset(index, -1)} aria-label={`前移画面 ${index + 1}`}>←</button><span>{index + 1}</span><button disabled={index === draft.media.length - 1} onClick={() => moveAsset(index, 1)} aria-label={`后移画面 ${index + 1}`}>→</button>{asset.type === 'image' && <button onClick={() => setCover(asset)}>设为封面</button>}<button onClick={() => patch({ media: draft.media.filter((_, i) => i !== index) })}>移除</button></div></div>)}</div>
        </div>
        <div className="admin-detail-section"><div className="admin-section-heading"><h3>项目详情</h3><label className="admin-upload-button admin-upload-primary">{draft.detail?.type === 'pdf' && draft.detail.url ? '替换项目 PDF' : '上传项目 PDF'}<input aria-label="上传项目 PDF" type="file" accept=".pdf,application/pdf" onChange={event => { void upload(event.target.files, 'pdf'); event.target.value = ''; }} /></label></div><p className="admin-help">品牌方案、海报合集等可直接上传 PDF（最多 50 MB）。上传后自动设为详情，访客可连续滚动、拖动和放大查看。</p><div className="admin-detail-modes">{[['media', '图片 / 视频'], ['pdf', 'PDF 连续阅读'], ['link', '跳转外部链接']].map(([mode, label]) => <label key={mode}><input type="radio" name="detailMode" checked={(draft.detail?.type || 'media') === mode} onChange={() => patch({ detail: mode === 'media' ? undefined : { type: mode as 'pdf' | 'link', url: '' } })} />{label}</label>)}</div>
          {draft.detail?.type === 'pdf' && <div className="admin-pdf-upload">{draft.detail.url ? <a href={draft.detail.url} target="_blank" rel="noopener noreferrer">PDF 已添加 · 查看原文件 ↗</a> : <span className="admin-help">点击上方「上传项目 PDF」选择文件。</span>}</div>}
          {draft.detail?.type === 'link' && <label>外部详情链接<input type="url" value={draft.detail.url} placeholder="https://…（例如飞书文档链接）" onChange={event => patch({ detail: { type: 'link', url: event.target.value } })} /><span className="admin-help">直接在新窗口打开。文档访问权限请在原平台设置。</span></label>}
          {!draft.detail && <label>项目介绍（选填）<textarea aria-label="项目介绍" rows={4} value={draft.body || ''} onChange={event => patch({ body: event.target.value || undefined })} /></label>}
        </div>
        <label>体验链接（选填）<input type="url" value={draft.demoUrl || ''} placeholder="H5 / 游戏体验的 https:// 地址" onChange={event => patch({ demoUrl: event.target.value || undefined })} /></label>
        </fieldset>
        <footer className="admin-save-bar"><button className="admin-text-button danger" disabled={busy} onClick={remove}>移除项目</button><span>{progress || (dirty ? '可先预览，保存后更新前台' : '内容已保存在本机')}</span><div className="admin-save-actions"><button className="admin-button subtle" disabled={busy} onClick={openPreview}>游戏中预览</button><button className="admin-button" disabled={busy || !dirty} onClick={save}>{busy ? '正在处理…' : '保存到作品库'}</button></div></footer>
      </section>}</div>
      {session && <details className="admin-storage-info"><summary>本机保存与备份</summary><p>上传文件和作品信息保存在：<code>{session.dataDirectory}</code></p><p>每次保存都会备份上一份内容清单。完整备份请复制整个目录，导出的清单不包含图片、视频和 PDF。线上数据库与文件存储尚未连接。</p></details>}
    </main>
    {preview && <GamePreviewDialog {...preview} onClose={() => setPreview(null)} />}
  </div>;
}
