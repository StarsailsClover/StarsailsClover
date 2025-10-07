/* scripts.js */
(function(){
  // Basic utilities
  const $ = sel => document.querySelector(sel);
  const $$ = sel => document.querySelectorAll(sel);

  // Year
  document.getElementById('year').textContent = new Date().getFullYear();

  // 页面加载完成后添加主动效果
  document.addEventListener('DOMContentLoaded', () => {
    // 为项目卡片添加悬停效果
    $$('.project-card').forEach((card, index) => {
      // 添加进入视口时的动画延迟
      card.style.animationDelay = `${index * 0.1}s`;
      
      // 添加鼠标悬停时的3D效果
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const angleY = (x - centerX) / 25;
        const angleX = (centerY - y) / 25;
        card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale3d(1.05, 1.05, 1.05)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });

    // 为音乐播放器添加主动效果
    $$('.track').forEach(track => {
      const img = track.querySelector('img');
      const audio = track.querySelector('audio');
      
      img.addEventListener('click', () => {
        if (audio.paused) {
          img.style.transform = 'scale(1.05)';
          img.style.boxShadow = '0 10px 30px rgba(124, 92, 255, 0.4)';
          setTimeout(() => {
            img.style.transform = '';
            img.style.boxShadow = '';
          }, 300);
        }
      });
    });

    // 添加背景粒子效果
    createParticles();
    
    // 添加滚动进度条
    createProgressBar();
    
    // 添加视差效果
    addParallaxEffects();
    
    // 初始化语言功能
    initLanguage();
  });

  // 创建背景粒子效果
  function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: -1;
      overflow: hidden;
    `;
    document.body.appendChild(particleContainer);

    // 创建粒子
    for (let i = 0; i < 30; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: absolute;
        width: ${Math.random() * 5 + 1}px;
        height: ${Math.random() * 5 + 1}px;
        background: rgba(124, 92, 255, 0.3);
        border-radius: 50%;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        animation: float ${Math.random() * 20 + 10}s infinite ease-in-out;
        opacity: 0;
      `;
      
      // 随机动画延迟和持续时间
      const delay = Math.random() * 5;
      const duration = Math.random() * 10 + 10;
      particle.style.animation = `float ${duration}s ${delay}s infinite ease-in-out`;
      
      // 设置自定义属性用于视差效果
      particle.dataset.parallaxFactor = (Math.random() * 0.05 + 0.01).toFixed(3);
      
      particleContainer.appendChild(particle);
      
      // 添加关键帧动画
      if (!document.querySelector('#float-keyframes')) {
        const style = document.createElement('style');
        style.id = 'float-keyframes';
        style.textContent = `
          @keyframes float {
            0% {
              transform: translate(0, 0) rotate(0deg);
              opacity: 0;
            }
            10% {
              opacity: 0.5;
            }
            90% {
              opacity: 0.3;
            }
            100% {
              transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) rotate(360deg);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
    }
  }

  // 创建滚动进度条
  function createProgressBar() {
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.body.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      progressBar.style.width = `${scrollPercent}%`;
    });
  }

  // 添加视差效果
  function addParallaxEffects() {
    window.addEventListener('scroll', () => {
      const scrolled = window.pageYOffset;
      const rate = scrolled * -0.5;
      const hero = document.querySelector('.hero');
      
      if (hero) {
        hero.style.backgroundPosition = `center ${rate}px`;
      }
      
      // 为粒子添加视差效果
      document.querySelectorAll('.particles div').forEach(particle => {
        const factor = parseFloat(particle.dataset.parallaxFactor) || 0.02;
        const yPos = scrolled * factor;
        particle.style.transform = `translateY(${yPos}px)`;
      });
    });
  }

  // Mobile menu
  const burger = $('#burger');
  const mobileMenu = $('#mobile-menu');
  burger.addEventListener('click', ()=> mobileMenu.classList.toggle('open'));

  // Theme toggle (keeps dark as default; toggles a subtle accent inversion)
  const themeToggle = $('#theme-toggle');
  themeToggle.addEventListener('click', ()=>{
    document.documentElement.classList.toggle('alt-theme');
    themeToggle.textContent = document.documentElement.classList.contains('alt-theme') ? '☼' : '☾';
  });

  // Smooth anchor scrolling
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const target = a.getAttribute('href');
      if(target.length>1){
        e.preventDefault();
        document.querySelector(target).scrollIntoView({behavior:'smooth',block:'start'});
        if(mobileMenu.classList.contains('open')) mobileMenu.classList.remove('open');
      }
    })
  });

  // Reveal on scroll
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting) entry.target.classList.add('visible');
    })
  },{threshold:0.12});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Typing effect for tagline (simple)
  const tagline = document.querySelector('.tagline');
  const full = tagline.textContent;
  tagline.textContent = '';
  let i=0;
  const typer = setInterval(()=>{
    tagline.textContent += full[i++]||'';
    if(i>full.length) clearInterval(typer);
  },28);

  // Copy email (replace with your real email in variable)
  const email = 'SailsHuang@gmail.com'; // << REPLACE this with your real email
  const copyBtn = document.getElementById('copy-email');
  copyBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(email);
      copyBtn.textContent = 'Copied!';
      setTimeout(()=>copyBtn.textContent = 'Copy email',1600);
    }catch(e){
      alert('Copy failed — open console for fallback.');
      console.error(e);
    }
  });

  // Copy GitHub URL
  document.getElementById('copy-github').addEventListener('click', async ()=>{
    const url = 'https://github.com/StarsailsClover';
    try{ 
      await navigator.clipboard.writeText(url); 
      const btn = document.getElementById('copy-github');
      const originalText = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = originalText, 1600);
    }catch(e){ 
      console.error(e); 
      alert('Copy failed — open console for fallback.');
    }
  });

  // Simulated form send
  document.getElementById('send-btn').addEventListener('click', ()=>{
    const name = document.querySelector('[name="name"]').value || 'Someone';
    const message = document.querySelector('[name="message"]').value || '(empty)';
    // This is a static demo — you can wire this up to an API later.
    alert(`Thanks ${name}! Message preview:\n${message}`);
  });

  // Fetch GitHub repos (client-side; unauthenticated)
  const repoContainer = document.getElementById('repos-container');
  if(repoContainer){
    fetch('https://api.github.com/users/StarsailsClover/repos?sort=updated')
      .then(r=>{
        if(!r.ok) throw new Error('GitHub fetch failed: '+r.status);
        return r.json();
      })
      .then(data=>{
        repoContainer.innerHTML = '';
        if(data.length === 0) {
          repoContainer.innerHTML = '<div class="muted">No public repositories found.</div>';
          return;
        }
        const slice = data.slice(0,6);
        slice.forEach(repo=>{
          const el = document.createElement('div'); el.className='repo';
          el.innerHTML = `<strong>${repo.name}</strong><p class=\"muted\">${repo.description||'No description provided.'}</p>
            <div style=\"margin-top:8px;display:flex;gap:8px;align-items:center\"><a href=\"${repo.html_url}\" target=\"_blank\" class=\"btn small\">Repo</a><span class=\"muted\">★ ${repo.stargazers_count}</span></div>`;
          repoContainer.appendChild(el);
        });
      })
      .catch(err=>{
        console.warn(err);
        repoContainer.innerHTML = '<div class="muted">Could not load repos (rate limit or network). You can still link to your GitHub profile.</div>';
      })
  }

  // Graceful image fallback: if portrait missing, set gradient
  const portrait = document.querySelector('.portrait');
  if(portrait) {
    portrait.addEventListener('error', ()=>{
      portrait.style.display = 'none';
      const frame = document.querySelector('.portrait-frame');
      if(frame) {
        frame.style.background = 'linear-gradient(135deg, rgba(124,92,255,0.14), rgba(0,229,168,0.06))';
        const fallback = document.createElement('div'); 
        fallback.style.padding = '24px'; 
        fallback.style.color='#cfe7ff'; 
        fallback.style.fontWeight=700; 
        fallback.style.textAlign='center';
        fallback.textContent = 'Profile image — replace assets/profile.jpg';
        frame.appendChild(fallback);
      }
    });
  }

  // Add keyboard accessibility to mobile menu
  burger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      burger.click();
    }
  });

  // Close mobile menu when clicking outside
  document.addEventListener('click', (e) => {
    if (mobileMenu.classList.contains('open') && 
        !mobileMenu.contains(e.target) && 
        !burger.contains(e.target)) {
      mobileMenu.classList.remove('open');
    }
  });

  // 添加悬停粒子效果
  document.addEventListener('mousemove', (e) => {
    // 创建临时粒子跟随鼠标
    if (Math.random() > 0.7) { // 降低创建频率
      const particle = document.createElement('div');
      particle.style.cssText = `
        position: fixed;
        width: ${Math.random() * 6 + 2}px;
        height: ${Math.random() * 6 + 2}px;
        background: rgba(${Math.random() > 0.5 ? '124, 92, 255' : '0, 229, 168'}, 0.6);
        border-radius: 50%;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        pointer-events: none;
        z-index: 9999;
        animation: fadeOut 1s forwards;
      `;
      
      document.body.appendChild(particle);
      
      // 添加淡出动画
      if (!document.querySelector('#fade-keyframes')) {
        const style = document.createElement('style');
        style.id = 'fade-keyframes';
        style.textContent = `
          @keyframes fadeOut {
            0% {
              transform: translate(0, 0) scale(1);
              opacity: 0.6;
            }
            100% {
              transform: translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px) scale(0);
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }
      
      // 移除粒子元素
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 1000);
    }
  });

  // 音乐播放器功能
  function initMusicPlayer() {
    // 从playlist.json获取音乐列表
    let musicList = [];
    
    // 获取播放列表数据
    fetch('assets/musicbox/cover/playlist.json')
      .then(response => response.json())
      .then(data => {
        musicList = data.songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: song.artist,
          file: song.filePath,
          cover: song.coverPath,
          album: song.album
        }));
        
        // 初始化播放器
        initializePlayer();
      })
      .catch(error => {
        console.error('Failed to load playlist:', error);
        // 使用默认播放列表作为后备
        musicList = [
          { 
            id: "song001",
            title: "却还记得你", 
            artist: "ZC", 
            file: "assets/musicbox/却还记得你.mp3", 
            cover: "assets/musicbox/cover/却还记得你.jpg",
            album: "却还记得你"
          },
          { 
            id: "song002",
            title: "冬天", 
            artist: "ZC", 
            file: "assets/musicbox/冬天.mp3", 
            cover: "assets/musicbox/cover/冬天.jpg",
            album: "冬天"
          }
        ];
        initializePlayer();
      });

    const audioPlayer = document.getElementById('audio-player');
    const musicFloat = document.getElementById('music-float');
    const musicSettings = document.getElementById('music-settings');
    const musicPlayerModal = document.getElementById('music-player-modal');
    const floatAlbumArt = document.getElementById('float-album-art');
    const albumArt = document.getElementById('album-art');
    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const progressBarContainer = document.querySelector('.progress-bar-container');

    let currentTrackIndex = 0;
    let isPlaying = false;
    let isMusicBoxPlaying = false;
    let interruptedTrack = null;
    let hasPlayedBefore = false; // 新增：标记是否曾经播放过

    // 初始化音乐播放器
    function initializePlayer() {
      if (musicList.length > 0) {
        // 初始化时随机播放除Song001和Song002之外的歌曲
        const filteredSongs = musicList.filter(song => song.id !== 'song001' && song.id !== 'song002');
        if (filteredSongs.length > 0) {
          currentTrackIndex = musicList.indexOf(filteredSongs[Math.floor(Math.random() * filteredSongs.length)]);
        } else {
          currentTrackIndex = 0;
        }
        
        // 初始化时加载但不自动播放
        loadTrack(currentTrackIndex);
        audioPlayer.volume = 0.7;
        
        // 设置初始显示为当前选中的歌曲
        const track = musicList[currentTrackIndex];
        if (track) {
          albumArt.src = track.cover;
          floatAlbumArt.src = track.cover;
          songTitle.textContent = track.title;
          songArtist.textContent = track.artist;
        }
        
        // 事件监听器
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', playPrevTrack);
        nextBtn.addEventListener('click', playNextTrack);
        musicSettings.addEventListener('click', openMusicPlayer);
        musicFloat.addEventListener('click', openMusicPlayer);
        
        // 音频事件
        audioPlayer.addEventListener('ended', handleTrackEnd);
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', updateTotalTime);
        
        // 进度条点击事件
        progressBarContainer.addEventListener('click', seek);
        
        // 添加音乐轨道播放按钮事件
        document.querySelectorAll('.play-track').forEach(button => {
          button.addEventListener('click', function() {
            const src = this.getAttribute('data-src');
            const cover = this.getAttribute('data-cover');
            const title = this.parentElement.querySelector('h4').textContent;
            const artist = "ZC"; // 默认艺术家
            
            // 中断音乐盒播放
            if (isPlaying) {
              pauseTrack();
            }
            
            // 保存当前音乐盒状态
            if (isMusicBoxPlaying) {
              interruptedTrack = {
                index: currentTrackIndex,
                time: audioPlayer.currentTime
              };
            }
            
            // 播放选中的轨道
            playSpecificTrack(src, cover, title, artist);
          });
        });
      }
    }

    // 加载音轨
    function loadTrack(index) {
      const track = musicList[index];
      if (!track) return;
      
      audioPlayer.src = track.file;
      albumArt.src = track.cover;
      floatAlbumArt.src = track.cover;
      songTitle.textContent = track.title;
      songArtist.textContent = track.artist;
    }

    // 播放特定音乐文件
    function playSpecificTrack(src, cover, title, artist) {
      isMusicBoxPlaying = true;
      audioPlayer.src = src;
      albumArt.src = cover;
      floatAlbumArt.src = cover;
      songTitle.textContent = title;
      songArtist.textContent = artist;
      
      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          playPauseBtn.textContent = '⏸';
          hasPlayedBefore = true; // 标记已播放
        })
        .catch(error => {
          console.error("播放失败:", error);
        });
    }

    // 播放音轨
    function playTrack() {
      if (musicList.length === 0) return;
      
      audioPlayer.play()
        .then(() => {
          isPlaying = true;
          playPauseBtn.textContent = '⏸';
          isMusicBoxPlaying = true;
          hasPlayedBefore = true; // 标记已播放
          
          // 恢复正常的歌曲信息显示
          const track = musicList[currentTrackIndex];
          if (track) {
            albumArt.src = track.cover;
            floatAlbumArt.src = track.cover;
            songTitle.textContent = track.title;
            songArtist.textContent = track.artist;
          }
        })
        .catch(error => {
          console.error("播放失败:", error);
        });
    }

    // 暂停音轨
    function pauseTrack() {
      audioPlayer.pause();
      isPlaying = false;
      playPauseBtn.textContent = '▶';
    }

    // 切换播放/暂停
    function togglePlayPause() {
      if (isPlaying) {
        pauseTrack();
      } else {
        // 如果是第一次播放，则播放当前选中的歌曲
        if (!hasPlayedBefore) {
          playTrack();
        } else {
          playTrack();
        }
      }
    }

    // 上一首
    function playPrevTrack() {
      if (musicList.length === 0) return;
      currentTrackIndex--;
      if (currentTrackIndex < 0) {
        currentTrackIndex = musicList.length - 1;
      }
      loadTrack(currentTrackIndex);
      playTrack();
    }

    // 下一首
    function playNextTrack() {
      if (musicList.length === 0) return;
      currentTrackIndex++;
      if (currentTrackIndex >= musicList.length) {
        currentTrackIndex = 0;
      }
      loadTrack(currentTrackIndex);
      playTrack();
    }

    // 处理音轨结束
    function handleTrackEnd() {
      // 如果是音乐盒被中断后播放的曲目结束，则恢复音乐盒
      if (isMusicBoxPlaying && interruptedTrack) {
        // 6秒过渡时间后再恢复音乐盒
        setTimeout(() => {
          currentTrackIndex = interruptedTrack.index;
          loadTrack(currentTrackIndex);
          audioPlayer.currentTime = interruptedTrack.time;
          playTrack();
          interruptedTrack = null;
        }, 6000);
      } else if (isMusicBoxPlaying) {
        // 正常播放音乐盒下一首
        setTimeout(() => {
          playNextTrack();
        }, 6000);
      }
    }

    // 更新进度条
    function updateProgress() {
      const percent = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      progressBar.style.width = `${percent}%`;
      
      // 更新当前时间显示
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    }

    // 更新总时间
    function updateTotalTime() {
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }

    // 格式化时间 (mm:ss)
    function formatTime(seconds) {
      if (isNaN(seconds)) return "0:00";
      const minutes = Math.floor(seconds / 60);
      seconds = Math.floor(seconds % 60);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // 跳转到指定位置
    function seek(e) {
      const width = this.clientWidth;
      const clickX = e.offsetX;
      const duration = audioPlayer.duration;
      
      audioPlayer.currentTime = (clickX / width) * duration;
    }

    // 打开音乐播放器模态框
    function openMusicPlayer() {
      musicPlayerModal.style.display = 'block';
    }

    // 关闭音乐播放器模态框
    function closeMusicPlayer() {
      musicPlayerModal.style.display = 'none';
    }

    // 更新默认显示（未播放状态）
    function updateDefaultDisplay() {
      // 检查是否有音乐列表且至少有一首歌
      if (musicList.length > 0) {
        // 显示第一首歌的信息而不是默认信息
        const firstTrack = musicList[0];
        albumArt.src = firstTrack.cover;
        floatAlbumArt.src = firstTrack.cover;
        songTitle.textContent = firstTrack.title;
        songArtist.textContent = firstTrack.artist;
      } else {
        // 如果没有音乐，则显示默认信息
        albumArt.src = 'assets/musicbox/cover/MSC.png';
        floatAlbumArt.src = 'assets/musicbox/cover/MSC.png';
        songTitle.textContent = '当前未在播放';
        songArtist.textContent = '';
      }
    }

    // 将关闭函数暴露到全局作用域
    window.closeMusicPlayer = closeMusicPlayer;
  }

  // 语言切换功能
  function initLanguage() {
    const languageToggle = $('#language-toggle');
    const languageModal = $('#language-modal');
    const closeBtn = $('.close');
    const langButtons = $$('.lang-btn');
    const themePreference = $('#theme-preference');
    const themeTitle = $('#theme-title');
    const themeDesc = $('#theme-desc');
    
    // 检查是否已设置语言偏好
    const savedLanguage = localStorage.getItem('preferredLanguage');
    const savedTheme = localStorage.getItem('preferredTheme');
    
    // 如果没有设置语言偏好，显示语言选择模态框
    if (!savedLanguage) {
      languageModal.style.display = 'block';
      themePreference.style.display = 'none'; // 确保主题选择部分隐藏
    } else if (!savedTheme) {
      // 如果语言偏好已设置但主题偏好未设置，直接显示主题选择
      languageModal.style.display = 'block';
      themePreference.style.display = 'block';
      themePreference.classList.add('show');
    } else {
      // 如果都已设置，则不自动显示模态框
    }
    
    // 打开语言选择模态框
    languageToggle.addEventListener('click', () => {
      // 检查是否已设置语言和主题偏好
      const savedLanguage = localStorage.getItem('preferredLanguage');
      const savedTheme = localStorage.getItem('preferredTheme');
      
      if (savedLanguage && savedTheme) {
        // 如果都已设置，则切换语言
        const newLanguage = savedLanguage === 'zh' ? 'en' : 'zh';
        localStorage.setItem('preferredLanguage', newLanguage);
        applyLanguage(newLanguage);
      } else {
        // 否则显示语言选择模态框
        languageModal.style.display = 'block';
        themePreference.style.display = 'none'; // 重置模态框状态
      }
    });
    
    // 关闭模态框
    closeBtn.addEventListener('click', () => {
      if (localStorage.getItem('preferredLanguage') && localStorage.getItem('preferredTheme')) {
        languageModal.style.display = 'none';
        // 重置主题选择部分的状态
        themePreference.classList.remove('show');
      }
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', (e) => {
      if (e.target === languageModal) {
        if (localStorage.getItem('preferredLanguage') && localStorage.getItem('preferredTheme')) {
          languageModal.style.display = 'none';
          // 重置主题选择部分的状态
          themePreference.classList.remove('show');
        }
      }
    });
    
    // 选择语言
    langButtons.forEach(button => {
      button.addEventListener('click', () => {
        const selectedLang = button.getAttribute('data-lang');
        const selectedTheme = button.getAttribute('data-theme');
        
        if (selectedLang) {
          localStorage.setItem('preferredLanguage', selectedLang);
          // 添加过渡效果
          languageModal.classList.add('language-transition');
          setTimeout(() => {
            applyLanguage(selectedLang);
            languageModal.classList.remove('language-transition');
          }, 150);
          
          // 显示主题选择部分并添加动画效果
          themePreference.style.display = 'block';
          // 触发重排以确保display变化生效
          themePreference.offsetHeight;
          themePreference.classList.add('show');
          
          // 标题和描述的过渡效果
          themeTitle.style.opacity = '0';
          themeDesc.style.opacity = '0';
          
          setTimeout(() => {
            // 根据语言设置更新主题选择文本
            if (selectedLang === 'zh') {
              themeTitle.textContent = '选择主题';
              themeDesc.textContent = '请选择您喜欢的主题';
              themePreference.querySelector('[data-theme="dark"]').textContent = '深色主题';
              themePreference.querySelector('[data-theme="light"]').textContent = '浅色主题';
            } else {
              themeTitle.textContent = 'Select Theme';
              themeDesc.textContent = 'Choose your preferred theme';
              themePreference.querySelector('[data-theme="dark"]').textContent = 'Dark Theme';
              themePreference.querySelector('[data-theme="light"]').textContent = 'Light Theme';
            }
            
            themeTitle.style.opacity = '1';
            themeDesc.style.opacity = '1';
          }, 150);
        } else if (selectedTheme) {
          localStorage.setItem('preferredTheme', selectedTheme);
          applyThemePreference(selectedTheme);
          languageModal.style.display = 'none';
          // 重置主题选择部分的状态
          themePreference.classList.remove('show');
        }
      });
    });
  }
  
  // 应用语言设置
  function applyLanguage(lang) {
    // 添加过渡类
    document.body.classList.add('language-transition');
    
    // 这里可以添加更多语言切换逻辑
    // 例如切换页面内容的语言
    
    // 示例：根据语言切换页面标题
    const titleElement = document.querySelector('title');
    const heroName = document.querySelector('.name');
    const heroTagline = document.querySelector('.tagline');
    const heroLead = document.querySelector('.lead');
    const aboutHeading = document.querySelector('#about h2');
    const projectsHeading = document.querySelector('#projects h2');
    const researchHeading = document.querySelector('#research h2');
    const musicHeading = document.querySelector('#music h2');
    const contactHeading = document.querySelector('#contact h2');
    
    if (lang === 'zh') {
      titleElement.textContent = 'Sails Huang — 作品集';
      heroName.innerHTML = 'Sails Huang <span class="cn">(泽川)</span>';
      heroTagline.textContent = '跨学科学生 · 机器人与研究 · 音乐与代码';
      heroLead.textContent = '广州的一名高中生，致力于创意编程、实验项目和音乐创作——安静而有抱负，刻意保持好奇心。';
      aboutHeading.textContent = '关于我';
      projectsHeading.textContent = '项目';
      researchHeading.textContent = '研究与想法';
      musicHeading.textContent = '音乐';
      contactHeading.textContent = '联系我';
    } else {
      titleElement.textContent = 'Sails Huang — Portfolio';
      heroName.innerHTML = 'Sails Huang <span class="cn">(泽川)</span>';
      heroTagline.textContent = 'Cross-disciplinary student · Robotics & research · Music & code';
      heroLead.textContent = 'High school student in Guangzhou building creative code, experimental projects and music — quietly ambitious, deliberately curious.';
      aboutHeading.textContent = 'About';
      projectsHeading.textContent = 'Projects';
      researchHeading.textContent = 'Research & Ideas';
      musicHeading.textContent = 'Music';
      contactHeading.textContent = 'Contact';
    }
    
    // 移除过渡类
    setTimeout(() => {
      document.body.classList.remove('language-transition');
    }, 300);
    
    // 可以在这里添加更多语言相关的DOM更新逻辑
  }
  
  // 应用主题偏好设置
  function applyThemePreference(theme) {
    if (theme === 'light') {
      document.documentElement.classList.add('alt-theme');
      if ($('#theme-toggle')) {
        $('#theme-toggle').textContent = '☼';
      }
    } else {
      document.documentElement.classList.remove('alt-theme');
      if ($('#theme-toggle')) {
        $('#theme-toggle').textContent = '☾';
      }
    }
  }
  
  // 初始化设置功能
  function initSettings() {
    const settingsToggle = $('#settings-toggle');
    const settingsSidebar = $('#settings-sidebar');
    const settingsClose = $('#settings-close');
    const settingsOverlay = $('#settings-overlay');
    const tabButtons = $$('.tab-button');
    const macosStyleToggle = $('#macos-style-toggle');
    const body = document.body;
    
    // 打开设置
    settingsToggle.addEventListener('click', () => {
      settingsSidebar.classList.add('open');
      settingsOverlay.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止背景滚动
    });
    
    // 关闭设置
    function closeSettings() {
      settingsSidebar.classList.remove('open');
      settingsOverlay.classList.remove('active');
      document.body.style.overflow = ''; // 恢复滚动
    }
    
    settingsClose.addEventListener('click', closeSettings);
    settingsOverlay.addEventListener('click', closeSettings);
    
    // 标签页切换
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // 移除所有活动状态
        $$('.tab-button').forEach(btn => btn.classList.remove('active'));
        $$('.tab-content').forEach(content => content.classList.remove('active'));
        
        // 添加活动状态到当前标签
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab');
        $(`#${tabId}`).classList.add('active');
      });
    });
    
    // MacOS 26风格切换
    macosStyleToggle.addEventListener('change', (e) => {
      if (e.target.checked) {
        body.classList.add('liquid-glass');
        // 添加高光效果容器
        addHighlightEffect();
      } else {
        body.classList.remove('liquid-glass');
        // 移除高光效果
        removeHighlightEffect();
      }
    });
    
    // 主题设置同步
    const themeSetting = $('#theme-setting');
    themeSetting.addEventListener('change', (e) => {
      const theme = e.target.value;
      applyThemePreference(theme);
      // 同步顶部主题切换按钮
      if ($('#theme-toggle')) {
        $('#theme-toggle').textContent = theme === 'light' ? '☼' : '☾';
      }
    });
    
    // 语言设置同步
    const languageSetting = $('#language-setting');
    languageSetting.addEventListener('change', (e) => {
      const lang = e.target.value;
      localStorage.setItem('preferredLanguage', lang);
      applyLanguage(lang);
    });
    
    // 音乐设置
    const musicAutoplay = $('#music-autoplay');
    const volumeControl = $('#volume-control');
    const audioPlayer = $('#audio-player');
    
    musicAutoplay.addEventListener('change', (e) => {
      // 可以在这里添加自动播放逻辑
    });
    
    volumeControl.addEventListener('input', (e) => {
      const volume = e.target.value / 100;
      audioPlayer.volume = volume;
    });
  }
  
  // 添加高光效果
  function addHighlightEffect() {
    // 创建高光元素
    const highlight = document.createElement('div');
    highlight.className = 'highlight-effect';
    document.body.appendChild(highlight);
    
    // 检测是否为移动设备
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
      // 移动端使用陀螺仪
      window.addEventListener('deviceorientation', (e) => {
        // 使用gamma(左右倾斜)和beta(前后倾斜)来控制高光位置
        const x = (e.gamma / 90) * (window.innerWidth / 2) + window.innerWidth / 2;
        const y = (e.beta / 90) * (window.innerHeight / 2) + window.innerHeight / 2;
        highlight.style.transform = `translate(${x - 50}px, ${y - 50}px)`;
      });
    } else {
      // 桌面端使用鼠标位置
      document.addEventListener('mousemove', (e) => {
        highlight.style.transform = `translate(${e.clientX - 50}px, ${e.clientY - 50}px)`;
      });
    }
  }
  
  // 移除高光效果
  function removeHighlightEffect() {
    const highlight = $('.highlight-effect');
    if (highlight) {
      highlight.remove();
    }
  }

  // 初始化音乐播放器
  initMusicPlayer();
  
  // 初始化设置功能
  initSettings();

})();