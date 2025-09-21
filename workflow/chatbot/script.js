// 채팅창, 입력창, 버튼 등 HTML 요소를 변수에 연결
const chatWindow = document.getElementById('chat-window');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const fileInput = document.getElementById('file-input');
const preview = document.getElementById('preview');

const chatListEl = document.getElementById('chat-list');
const newChatBtn = document.getElementById('new-chat-btn');

let sessionId = null;         // 사용자 세션 식별자
let selectedFile = null;      // 선택된 이미지 파일

// 랜덤한 문자열을 생성 (채팅방 ID 등에서 사용)
function generateRandomId(length = 80) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// 로컬스토리지에서 채팅 목록과 현재 채팅 ID 불러오기 (없으면 새로 생성)
let chats = JSON.parse(localStorage.getItem('chats')) || [{ id: generateRandomId(), title: '', messages: [] }];
let currentChatId = JSON.parse(localStorage.getItem('currentChatId')) || chats[0].id;

// 로컬스토리지에 현재 채팅 정보 저장
function saveChatsToStorage() {
  localStorage.setItem('chats', JSON.stringify(chats));
  localStorage.setItem('currentChatId', JSON.stringify(currentChatId));
}

// 메시지 또는 파일이 없으면 전송 버튼 비활성화
function updateSendButtonState() {
  sendBtn.disabled = chatInput.value.trim() === '' && !selectedFile;
}

// textarea 자동 높이 조절 (줄바꿈이 있을 때만)
function autoResizeTextarea() {
  const hasLineBreaks = chatInput.value.includes('\n');
  if (hasLineBreaks) {
    chatInput.style.height = '40px'; // 기본 높이로 초기화
    const scrollHeight = chatInput.scrollHeight;
    const maxHeight = 120;
    chatInput.style.height = Math.min(scrollHeight, maxHeight) + 'px';
  } else {
    chatInput.style.height = '40px'; // 한 줄일 때는 기본 높이
  }
}

chatInput.addEventListener('input', () => {
  updateSendButtonState();
  autoResizeTextarea();
});

// 컨텍스트 메뉴 생성
function createContextMenu() {
  const contextMenu = document.createElement('div');
  contextMenu.id = 'context-menu';
  contextMenu.style.cssText = `
    position: fixed;
    background: white;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    z-index: 1000;
    display: none;
    min-width: 120px;
  `;

  const renameOption = document.createElement('div');
  renameOption.textContent = '이름 변경';
  renameOption.style.cssText = `
    padding: 8px 15px;
    cursor: pointer;
    user-select: none;
  `;
  renameOption.addEventListener('mouseenter', () => {
    renameOption.style.background = '#f0f0f0';
  });
  renameOption.addEventListener('mouseleave', () => {
    renameOption.style.background = 'white';
  });

  contextMenu.appendChild(renameOption);
  document.body.appendChild(contextMenu);

  return { contextMenu, renameOption };
}

// 컨텍스트 메뉴 초기화
const { contextMenu, renameOption } = createContextMenu();
let contextMenuTargetId = null;

// 문서 클릭 시 컨텍스트 메뉴 숨기기
document.addEventListener('click', () => {
  contextMenu.style.display = 'none';
});

// 채팅방 이름 변경 함수
function renameChatRoom(chatId) {
  const chat = chats.find(c => c.id === chatId);
  if (!chat) return;

  // 현재 제목 가져오기
  let currentTitle = chat.title && chat.title.trim() !== '' ? chat.title : '';
  if (!currentTitle) {
    if (chat.messages.length > 0) {
      const firstTextMsg = chat.messages.find(m => m.type === 'text');
      currentTitle = firstTextMsg ? firstTextMsg.content.slice(0, 30) + (firstTextMsg.content.length > 30 ? '...' : '') : '새 채팅';
    } else {
      currentTitle = '새 채팅';
    }
  }

  // 프롬프트로 새 이름 입력받기
  const newTitle = prompt('새로운 채팅방 이름을 입력하세요:', currentTitle);

  if (newTitle !== null && newTitle.trim() !== '') {
    chat.title = newTitle.trim();
    saveChatsToStorage();
    renderChatList();
  }
}

// 컨텍스트 메뉴 이벤트 리스너
renameOption.addEventListener('click', (e) => {
  e.stopPropagation();
  contextMenu.style.display = 'none';
  if (contextMenuTargetId) {
    renameChatRoom(contextMenuTargetId);
  }
});

// 왼쪽 채팅 목록 UI 렌더링
function renderChatList() {
  chatListEl.innerHTML = '';
  chats.forEach(chat => {
    const chatItem = document.createElement('div');
    chatItem.className = 'chat-item' + (chat.id === currentChatId ? ' active' : '');

    // 채팅 제목이 없을 경우, 첫 메시지 내용을 일부 잘라서 제목으로 표시
    let titleText = chat.title && chat.title.trim() !== '' ? chat.title : '';
    if (!titleText) {
      if (chat.messages.length > 0) {
        const firstTextMsg = chat.messages.find(m => m.type === 'text');
        titleText = firstTextMsg ? firstTextMsg.content.slice(0, 30) + (firstTextMsg.content.length > 30 ? '...' : '') : '새 채팅';
      } else {
        titleText = '새 채팅';
      }
    }

    // 제목 텍스트를 담을 span 요소 생성
    const titleSpan = document.createElement('span');
    titleSpan.textContent = titleText;
    titleSpan.style.flexGrow = '1';
    titleSpan.style.overflow = 'hidden';
    titleSpan.style.textOverflow = 'ellipsis';
    titleSpan.style.whiteSpace = 'nowrap';

    // 채팅 삭제 버튼 생성
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.className = 'close-btn';
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      removeChat(chat.id); // 클릭 시 삭제
    };

    chatItem.appendChild(titleSpan);
    chatItem.appendChild(closeBtn);

    // 좌클릭으로 채팅 전환
    chatItem.onclick = () => switchChat(chat.id);

    // 우클릭으로 컨텍스트 메뉴 표시
    chatItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      contextMenuTargetId = chat.id;

      // 컨텍스트 메뉴 위치 설정
      const rect = chatItem.getBoundingClientRect();
      contextMenu.style.left = e.clientX + 'px';
      contextMenu.style.top = e.clientY + 'px';
      contextMenu.style.display = 'block';
    });

    chatListEl.appendChild(chatItem);
  });
}

// 채팅 삭제 함수 (UI 및 서버에 삭제 요청)
function removeChat(id) {
  const chatToDelete = chats.find(c => c.id === id);
  if (!chatToDelete) return;

  const formData = new FormData();
  formData.append('chatInput', '삭제되었습니다.');
  formData.append('sessionId', sessionId);
  formData.append('chatroomId', id.toString());
  formData.append('delete', 'true');

  fetch(N8N_WEBHOOK_URL, {
    method: 'POST',
    body: formData,
  }).then(() => {
    // 삭제 후 채팅 목록에서 제거 및 UI 갱신
    chats = chats.filter(c => c.id !== id);
    if (currentChatId === id) {
      if (chats.length > 0) {
        currentChatId = chats[0].id;
      } else {
        createNewChat();
        return;
      }
    }
    renderChatList();
    renderMessages();
    saveChatsToStorage();
  }).catch((error) => {
    alert('삭제 요청 중 오류 발생: ' + error.message);
  });
}

// 새 채팅 생성 함수
function createNewChat() {
  const newId = generateRandomId();
  const newChat = { id: newId, title: '', messages: [] };
  chats.push(newChat);
  currentChatId = newId;
  renderChatList();
  renderMessages();
  saveChatsToStorage();
  return newId;
}
newChatBtn.onclick = createNewChat;

// 채팅방 전환 함수
function switchChat(id) {
  currentChatId = id;
  renderChatList();
  renderMessages();
  saveChatsToStorage();
}

// 현재 채팅방의 메시지를 화면에 출력
function renderMessages() {
  chatWindow.innerHTML = '';
  const chat = chats.find(c => c.id === currentChatId);
  if (!chat) return;
  chat.messages.forEach(msg => {
    if (msg.type === 'text') {
      addMessageToWindow(msg.content, msg.sender);
    } else if (msg.type === 'image') {
      addImageMessageToWindow(msg.content, msg.sender);
    }
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// URL을 클릭 가능한 링크로 변환하는 함수
function convertUrlsToLinks(text) {
  // URL 패턴 매칭 (http, https)
  const urlPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  
  return text.replace(urlPattern, (url) => {
    // 새 창에서 열리는 링크로 변환
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3e78ff; text-decoration: underline; font-weight: bold;">${url}</a>`;
  });
}

// 마크다운 링크를 HTML 링크로 변환하는 함수
function convertMarkdownLinks(text) {
  // 마크다운 링크 패턴: [텍스트](URL)
  const markdownLinkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  return text.replace(markdownLinkPattern, (match, linkText, url) => {
    return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #3e78ff; text-decoration: underline; font-weight: bold;">${linkText}</a>`;
  });
}

// 텍스트 메시지를 DOM에 추가 (링크 변환 기능 포함)
function addMessageToWindow(text, sender) {
  const div = document.createElement('div');
  div.classList.add('message', sender);

  // "\\n"을 실제 줄바꿈 문자 "\n"로 변환
  let normalizedText = text.replace(/\\n/g, '\n');

  // 마크다운 링크를 HTML 링크로 변환
  normalizedText = convertMarkdownLinks(normalizedText);
  
  // URL을 클릭 가능한 링크로 변환
  normalizedText = convertUrlsToLinks(normalizedText);

  // 실제 줄바꿈 문자만 <br>로 변환
  const formattedText = normalizedText.replace(/\n/g, '<br>');

  div.innerHTML = formattedText;
  chatWindow.appendChild(div);
}

// 이미지 메시지를 DOM에 추가
function addImageMessageToWindow(imgSrc, sender) {
  const div = document.createElement('div');
  div.classList.add('message', sender);
  const img = document.createElement('img');
  img.src = imgSrc;
  img.style.maxWidth = '150px';
  img.style.borderRadius = '10px';
  div.appendChild(img);
  chatWindow.appendChild(div);
}

// 파일 input 변경 시 이미지 미리보기 표시
fileInput.addEventListener('change', () => {
  preview.innerHTML = '';
  selectedFile = fileInput.files[0];
  if (selectedFile) showImagePreview(selectedFile);
});

// 채팅 입력창에 이미지 붙여넣기 시 처리
chatInput.addEventListener('paste', (event) => {
  const items = event.clipboardData?.items;
  if (!items) return;
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      const file = item.getAsFile();
      if (file) {
        selectedFile = file;
        preview.innerHTML = '';
        showImagePreview(file);
        break;
      }
    }
  }
});

// 이미지 미리보기 렌더링
function showImagePreview(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const container = document.createElement('div');
    container.className = 'preview-container';
    const img = document.createElement('img');
    img.src = e.target.result;
    const btn = document.createElement('button');
    btn.innerText = '×';
    btn.className = 'remove-img';
    btn.onclick = () => {
      selectedFile = null;
      preview.innerHTML = '';
      updateSendButtonState();
    };
    container.appendChild(img);
    container.appendChild(btn);
    preview.appendChild(container);
  };
  reader.readAsDataURL(file);
  updateSendButtonState();
}

// n8n 서버 웹훅 주소
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/571e72eb-2db3-45f1-a371-4b55c43a8331/chat';

// 메시지 전송 처리 (텍스트 및 이미지 포함 가능)
async function sendMessage() {
  const userMessage = chatInput.value.trim();
  const formData = new FormData();
  formData.append('chatInput', userMessage);
  if (selectedFile) formData.append('file', selectedFile);
  if (sessionId) formData.append('sessionId', sessionId);
  formData.append('chatroomId', currentChatId.toString());

  const currentChat = chats.find(c => c.id === currentChatId);
  if (!currentChat) return;

  // 사용자의 메시지 로컬에 추가
  if (userMessage) currentChat.messages.push({ type: 'text', content: userMessage, sender: 'user' });
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      currentChat.messages.push({ type: 'image', content: e.target.result, sender: 'user' });
      renderMessages();
      saveChatsToStorage();
    };
    reader.readAsDataURL(selectedFile);
  }

  renderMessages();
  chatInput.value = '';
  chatInput.style.height = '40px'; // textarea 높이를 기본 높이로 초기화
  fileInput.value = '';
  preview.innerHTML = '';
  selectedFile = null;
  updateSendButtonState();
  saveChatsToStorage();

  // n8n 서버에 메시지 전송
  try {
    const res = await fetch(N8N_WEBHOOK_URL, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('서버 응답 실패');
    const data = await res.json();

    // 서버 응답 처리
    if (data.sessionId) sessionId = data.sessionId;
    if (data.imageUrl) currentChat.messages.push({ type: 'image', content: data.imageUrl, sender: 'bot' });
    if (data.output) {
      currentChat.messages.push({ type: 'text', content: data.output, sender: 'bot' });
    } else {
      currentChat.messages.push({ type: 'text', content: '답변이 없습니다.', sender: 'bot' });
    }
    if (data.summary) currentChat.title = data.summary;
    renderChatList();
    renderMessages();
    saveChatsToStorage();
  } catch (error) {
    alert('메시지 전송 중 오류 발생: ' + error.message);
  }
}

// 버튼 및 엔터키로 메시지 전송
sendBtn.onclick = sendMessage;
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    if (e.shiftKey) {
      // Shift + Enter: 줄바꿈 추가 (기본 동작 허용)
      return;
    } else {
      // Enter만: 메시지 전송
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage();
    }
  }
});

// UUID 생성 함수 (세션 ID용)
function generateUUIDv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// 세션 ID가 없을 경우 새로 생성
if (!sessionId) {
  sessionId = generateUUIDv4();
  console.log('새로 생성된 sessionId:', sessionId);
}

// 초기 렌더링
renderChatList();
renderMessages();
updateSendButtonState();