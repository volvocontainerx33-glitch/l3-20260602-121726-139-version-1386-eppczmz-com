import { H as Hls } from './hls-vendor-dru42stk.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function setupMobileMenu() {
  const button = $('[data-menu-toggle]');
  const menu = $('[data-mobile-menu]');

  if (!button || !menu) {
    return;
  }

  button.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function setupHero() {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');

  if (slides.length < 2) {
    return;
  }

  let active = 0;

  const show = (index) => {
    active = index % slides.length;
    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle('is-active', slideIndex === active);
    });
    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle('is-active', dotIndex === active);
    });
  };

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => show(index));
  });

  window.setInterval(() => show(active + 1), 5200);
}

function textOf(card) {
  return [
    card.dataset.title,
    card.dataset.region,
    card.dataset.type,
    card.dataset.year,
    card.dataset.genre,
    card.dataset.tags,
    card.textContent,
  ].join(' ').toLowerCase();
}

function setupFilters() {
  const forms = $$('[data-filter-scope]');

  forms.forEach((scope) => {
    const input = $('[data-search]', scope);
    const region = $('[data-region-filter]', scope);
    const type = $('[data-type-filter]', scope);
    const year = $('[data-year-filter]', scope);
    const cards = $$('.movie-card', scope);
    const empty = $('.empty-state', scope);

    const apply = () => {
      const q = (input?.value || '').trim().toLowerCase();
      const regionValue = region?.value || '';
      const typeValue = type?.value || '';
      const yearValue = year?.value || '';
      let shown = 0;

      cards.forEach((card) => {
        const okSearch = !q || textOf(card).includes(q);
        const okRegion = !regionValue || card.dataset.region === regionValue;
        const okType = !typeValue || card.dataset.type === typeValue;
        const okYear = !yearValue || card.dataset.year === yearValue;
        const visible = okSearch && okRegion && okType && okYear;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', shown === 0);
      }
    };

    [input, region, type, year].forEach((control) => {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });

    apply();
  });
}

function setupPlayer() {
  const boxes = $$('.player-box');

  boxes.forEach((box) => {
    const video = $('video', box);
    const button = $('[data-play]', box);

    if (!video || !button) {
      return;
    }

    button.addEventListener('click', async () => {
      const source = button.dataset.src;

      if (!source) {
        return;
      }

      button.disabled = true;
      button.setAttribute('aria-label', '正在加载播放源');

      try {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
          });

          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play();
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              hls.destroy();
              video.src = source;
              video.play();
            }
          });
        } else {
          video.src = source;
          await video.play();
        }

        box.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
      } catch (error) {
        button.disabled = false;
        button.setAttribute('aria-label', '点击播放');
        console.warn('播放器加载失败', error);
      }
    });
  });
}

function setupImageFallback() {
  $$('img').forEach((image) => {
    image.addEventListener('error', () => {
      image.style.opacity = '0';
    }, { once: true });
  });
}

setupMobileMenu();
setupHero();
setupFilters();
setupPlayer();
setupImageFallback();
