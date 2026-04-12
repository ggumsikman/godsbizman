/* ── 네비 ── */
function toggleDrawer() { document.getElementById('drawer').classList.toggle('open'); }
function closeDrawer()  { document.getElementById('drawer').classList.remove('open'); }

/* ── 스크롤 reveal ── */
const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ── 강의 아카이브 토글 ── */
function toggleSession(id) {
    const body = document.getElementById('body-' + id);
    const toggle = document.getElementById('toggle-' + id);
    body.classList.toggle('open');
    toggle.classList.toggle('open');
}

/* ════════════════════════════
   Q&A 게시판 (Supabase)
════════════════════════════ */
const ADMIN_PW = window.__ENV__.ADMIN_PW;
const sb = supabase.createClient(
    window.__ENV__.SUPABASE_URL,
    window.__ENV__.SUPABASE_ANON_KEY
);

let isAdmin     = false;
let openId      = null;
let verifiedPws = {};

/* 날짜 ── */
function fmtDate(ts) {
    const d = new Date(ts);
    return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}
function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

/* 렌더 ── */
async function render() {
    const { data: posts, error } = await sb.from('posts').select('*').order('created_at', { ascending: false });
    if (error) { console.error('render error:', error); return; }

    document.getElementById('boardCount').textContent = `전체 ${posts.length}건`;
    const list = document.getElementById('boardList');

    if (!posts.length) {
        list.innerHTML = '<div class="board-empty">아직 질문이 없습니다.<br>첫 번째 질문을 남겨보세요!</div>';
        return;
    }

    list.innerHTML = posts.map((p, i) => {
        const num   = posts.length - i;
        const isNew = (Date.now() - new Date(p.created_at).getTime()) < 86400000;
        const title = p.title || p.content.slice(0, 40) + (p.content.length > 40 ? '…' : '');
        return `
        <div class="board-item" id="item-${p.id}">
            <div class="board-item-row" onclick="toggleDetail(${p.id})">
                <span class="bi-num">${num}</span>
                <span class="bi-title">
                    ${escHtml(title)}
                    ${isNew ? '<span class="new-badge">NEW</span>' : ''}
                    ${p.answer ? '<span class="status-answered" style="font-size:.7em;margin-left:4px;">답변완료</span>' : ''}
                </span>
                <span class="bi-name">${escHtml(p.name)}</span>
            </div>
            <div class="board-detail ${openId === p.id ? 'open' : ''}" id="detail-${p.id}">
                ${buildDetail(p)}
            </div>
        </div>`;
    }).join('');
}

function buildDetail(p) {
    const answerBlock = p.answer
        ? `<div class="detail-answer">
               <div class="detail-a-label">✍️ 이강락 대표님 답변 <small style="font-weight:400;color:var(--gray)">${fmtDate(p.answered_at)}</small></div>
               <div class="detail-a-content">${escHtml(p.answer)}</div>
           </div>`
        : '<div class="detail-no-answer">아직 답변이 등록되지 않았습니다. 곧 답변드리겠습니다.</div>';

    const userActions = `
        <div class="post-actions">
            <button class="btn-edit" onclick="event.stopPropagation(); startEditOrDelete(${p.id},'edit')">수정</button>
            <button class="btn-delete" onclick="event.stopPropagation(); startEditOrDelete(${p.id},'delete')">삭제</button>
        </div>
        <div class="pw-confirm" id="pwc-${p.id}">
            <input type="password" placeholder="비밀번호 입력" id="pwi-${p.id}"
                   onkeydown="if(event.key==='Enter') confirmPw(${p.id})">
            <button onclick="confirmPw(${p.id})">확인</button>
            <button class="pw-cancel" onclick="cancelPw(${p.id})">취소</button>
        </div>
        <div class="edit-form" id="ef-${p.id}">
            <input type="text" id="et-${p.id}" value="${escHtml(p.title||'')}" placeholder="제목 (선택)">
            <textarea id="ec-${p.id}" rows="3">${escHtml(p.content)}</textarea>
            <div style="display:flex;gap:8px;">
                <button class="btn-admin-save" onclick="saveEdit(${p.id})">저장</button>
                <button class="btn-admin-cancel" onclick="cancelEdit(${p.id})">취소</button>
            </div>
        </div>`;

    const adminBlock = isAdmin
        ? `<div class="post-actions" style="margin-top:16px; padding-top:14px; border-top:1px solid var(--line);">
               <button class="btn-edit" onclick="event.stopPropagation(); toggleAnswerForm(${p.id})">${p.answer ? '답변 수정' : '답변 달기'}</button>
               <button class="btn-delete" onclick="event.stopPropagation(); adminDelete(${p.id})">질문 삭제</button>
           </div>
           <div class="admin-answer-form" id="af-${p.id}">
               <textarea placeholder="답변을 입력하세요...">${p.answer || ''}</textarea>
               <div class="admin-btns">
                   <button class="btn-admin-save" onclick="saveAnswer(${p.id})">저장</button>
                   <button class="btn-admin-cancel" onclick="toggleAnswerForm(${p.id})">취소</button>
               </div>
           </div>`
        : '';

    return `
    <div class="detail-q-label">Q. 질문</div>
    <div class="detail-q-content">${escHtml(p.title ? p.title + '\n\n' + p.content : p.content)}</div>
    ${answerBlock}
    ${userActions}
    ${adminBlock}`;
}

/* 게시물 펼치기/닫기 ── */
async function toggleDetail(id) {
    openId = (openId === id) ? null : id;
    await render();
    if (openId) {
        const el = document.getElementById(`item-${openId}`);
        if (el) setTimeout(() => el.scrollIntoView({ behavior:'smooth', block:'nearest' }), 50);
    }
}

/* 글쓰기 폼 ── */
function toggleForm() {
    const f = document.getElementById('boardForm');
    f.classList.toggle('open');
    if (f.classList.contains('open')) document.getElementById('fName').focus();
}

async function submitPost() {
    const name    = document.getElementById('fName').value.trim();
    const pw      = document.getElementById('fPw').value;
    const title   = document.getElementById('fTitle').value.trim();
    const content = document.getElementById('fContent').value.trim();

    if (!name)    { alert('이름을 입력해주세요.'); document.getElementById('fName').focus(); return; }
    if (!pw)      { alert('비밀번호를 입력해주세요.'); document.getElementById('fPw').focus(); return; }
    if (!title)   { alert('제목을 입력해주세요.'); document.getElementById('fTitle').focus(); return; }
    if (!content) { alert('질문 내용을 입력해주세요.'); document.getElementById('fContent').focus(); return; }

    const { error } = await sb.from('posts').insert({ name, title, content, password: pw });
    if (error) { alert('등록 중 오류가 발생했습니다.'); console.error(error); return; }

    document.getElementById('fName').value    = '';
    document.getElementById('fPw').value      = '';
    document.getElementById('fTitle').value   = '';
    document.getElementById('fContent').value = '';
    document.getElementById('boardForm').classList.remove('open');

    await render();
    alert('질문이 등록되었습니다. 이강락 대표님이 곧 답변드리겠습니다.');
}

/* 수정/삭제 — 비밀번호 확인 ── */
let pendingAction = null;

function startEditOrDelete(id, type) {
    if (isAdmin) {
        if (type === 'delete') { adminDelete(id); }
        else { showEditForm(id); }
        return;
    }
    pendingAction = { id, type };
    document.querySelectorAll('.pw-confirm.open').forEach(el => el.classList.remove('open'));
    const pwc = document.getElementById(`pwc-${id}`);
    pwc.classList.add('open');
    document.getElementById(`pwi-${id}`).value = '';
    document.getElementById(`pwi-${id}`).focus();
}

async function confirmPw(id) {
    const pw = document.getElementById(`pwi-${id}`).value;
    const { data: ok } = await sb.rpc('verify_post_password', { p_id: id, p_password: pw });
    if (!ok) { alert('비밀번호가 일치하지 않습니다.'); return; }

    verifiedPws[id] = pw;
    document.getElementById(`pwc-${id}`).classList.remove('open');

    if (pendingAction && pendingAction.type === 'delete') {
        if (confirm('정말 삭제하시겠습니까?')) {
            await sb.rpc('delete_post_by_password', { p_id: id, p_password: pw });
            openId = null;
            await render();
        }
    } else {
        showEditForm(id);
    }
    pendingAction = null;
}

function cancelPw(id) {
    document.getElementById(`pwc-${id}`).classList.remove('open');
    pendingAction = null;
}

/* 수정 폼 ── */
function showEditForm(id) {
    document.getElementById(`ef-${id}`).classList.add('open');
}
function cancelEdit(id) {
    document.getElementById(`ef-${id}`).classList.remove('open');
}
async function saveEdit(id) {
    const newTitle   = document.getElementById(`et-${id}`).value.trim();
    const newContent = document.getElementById(`ec-${id}`).value.trim();
    if (!newContent) { alert('내용을 입력해주세요.'); return; }

    if (isAdmin) {
        await sb.rpc('admin_update_post', { p_id: id, p_title: newTitle, p_content: newContent });
    } else {
        const pw = verifiedPws[id] || '';
        const { data: ok } = await sb.rpc('update_post_content', { p_id: id, p_password: pw, p_title: newTitle, p_content: newContent });
        if (!ok) { alert('수정 권한이 없습니다.'); return; }
    }
    await render();
}

/* 관리자 삭제 ── */
async function adminDelete(id) {
    if (!confirm('이 질문을 삭제하시겠습니까?')) return;
    await sb.rpc('admin_delete_post', { p_id: id });
    openId = null;
    await render();
}

/* 답변 폼 (관리자) ── */
function toggleAnswerForm(id) {
    document.getElementById(`af-${id}`).classList.toggle('open');
}
async function saveAnswer(id) {
    const textarea = document.querySelector(`#af-${id} textarea`);
    const answer = textarea.value.trim();
    if (!answer) { alert('답변 내용을 입력해주세요.'); return; }
    await sb.rpc('admin_save_answer', { p_id: id, p_answer: answer });
    await render();
}

/* 관리자 로그인/아웃 ── */
function openAdminLogin() {
    if (isAdmin) { adminLogout(); return; }
    document.getElementById('adminModal').classList.add('open');
    setTimeout(() => document.getElementById('adminPwInput').focus(), 100);
}
function closeAdminModal() {
    document.getElementById('adminModal').classList.remove('open');
    document.getElementById('adminPwInput').value = '';
}
function doAdminLogin() {
    const pw = document.getElementById('adminPwInput').value;
    if (pw === ADMIN_PW) {
        isAdmin = true;
        document.getElementById('adminFloat').classList.add('on');
        closeAdminModal();
        render();
    } else {
        alert('비밀번호가 올바르지 않습니다.');
        document.getElementById('adminPwInput').value = '';
    }
}
function adminLogout() {
    if (!confirm('관리자 모드를 종료하시겠습니까?')) return;
    isAdmin = false;
    document.getElementById('adminFloat').classList.remove('on');
    render();
}

/* 초기 렌더 ── */
render();
