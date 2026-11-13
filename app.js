(function () {
  'use strict';

  const STORAGE_KEY = 'minifeed_posts';
  const MAX_LENGTH = 280;

  const input = document.getElementById('post-input');
  const publishBtn = document.getElementById('publish-btn');
  const charCount = document.getElementById('char-count');
  const timeline = document.getElementById('timeline');
  const emptyState = document.getElementById('empty-state');
  const postCount = document.getElementById('post-count');

  function loadPosts() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed)
        ? parsed.filter(function (item) {
            return item && typeof item.content === 'string';
          })
        : [];
    } catch (error) {
      console.warn('读取本地数据失败，已重置为空列表。', error);
      return [];
    }
  }

  function savePosts(posts) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
      return true;
    } catch (error) {
      console.error('保存本地数据失败。', error);
      alert('保存失败：浏览器本地存储不可用或空间已满。');
      return false;
    }
  }

  function formatTime(isoString) {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '时间未知';
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return (
      date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) +
      ' ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
    );
  }

  function createPostElement(post) {
    const card = document.createElement('article');
    card.className = 'post-card';
    card.setAttribute('role', 'listitem');

    const content = document.createElement('p');
    content.className = 'post-content';
    content.textContent = post.content;

    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const avatar = document.createElement('span');
    avatar.className = 'post-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = '我';

    const author = document.createElement('span');
    author.textContent = '我';

    const time = document.createElement('time');
    time.className = 'post-time';
    time.dateTime = post.createdAt || '';
    time.textContent = formatTime(post.createdAt);

    meta.append(avatar, author, time);
    card.append(content, meta);
    return card;
  }

  function render() {
    const posts = loadPosts();
    timeline.replaceChildren();
    posts.forEach(function (post) {
      timeline.appendChild(createPostElement(post));
    });
    emptyState.hidden = posts.length > 0;
    postCount.textContent = posts.length + ' 条动态';
  }

  function updateComposerState() {
    const length = input.value.length;
    charCount.textContent = length + ' / ' + MAX_LENGTH;
    charCount.classList.toggle('is-near-limit', length >= MAX_LENGTH - 20);
    publishBtn.disabled = input.value.trim().length === 0;
  }

  function publish() {
    const content = input.value.trim().slice(0, MAX_LENGTH);
    if (!content) return;

    const post = {
      id: (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      content: content,
      createdAt: new Date().toISOString()
    };
    const posts = [post].concat(loadPosts());
    if (!savePosts(posts)) return;

    input.value = '';
    updateComposerState();
    render();
    input.focus();
  }

  publishBtn.addEventListener('click', publish);
  input.addEventListener('input', updateComposerState);
  input.addEventListener('keydown', function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
      event.preventDefault();
      publish();
    }
  });

  updateComposerState();
  render();
})();
