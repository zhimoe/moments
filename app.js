(() => {
  "use strict";

  const albums = window.FAMILY_ALBUMS || [];
  const grid = document.querySelector("#album-grid");
  const total = document.querySelector("#album-total");
  const reader = document.querySelector("#reader");
  const shell = reader.querySelector(".reader-shell");
  const book = document.querySelector("#book");
  const leftPage = document.querySelector("#page-left");
  const rightPage = document.querySelector("#page-right");
  const prev = document.querySelector("#prev-page");
  const next = document.querySelector("#next-page");
  const pageCount = document.querySelector("#page-count");
  const progressBar = document.querySelector("#progress-bar");
  const lightbox = document.querySelector("#lightbox");
  const mobileQuery = matchMedia("(max-width: 760px)");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let activeAlbum = null;
  let cursor = 0;
  let lastFocus = null;
  let touchStart = null;

  const coverMarkup = (album) => `
    <button class="album-card tone-${album.tone}" type="button" data-album="${album.id}" aria-label="翻开《${album.title}》相册">
      <span class="album-object" aria-hidden="true">
        <span class="album-spine"><small>${album.number}</small></span>
        <span class="album-cover">
          <span class="cover-rule"></span>
          <span class="cover-photo"><img src="${album.cover}" alt="" loading="${album.number === "01" ? "eager" : "lazy"}"></span>
          <span class="cover-copy"><small>${album.date}</small><strong>${album.title}</strong><em>${album.subtitle}</em></span>
        </span>
        <span class="album-pages"></span>
      </span>
      <span class="album-label"><strong>${album.title}</strong><small>${album.photos.length} 张照片</small></span>
    </button>`;

  grid.innerHTML = albums.map(coverMarkup).join("");
  grid.classList.toggle("album-grid-many", albums.length >= 3);
  grid.classList.toggle("album-grid-four", albums.length === 4);
  total.textContent = `${String(albums.length).padStart(2, "0")} 册`;

  function pagesFor(album) {
    return [
      { type: "intro", title: album.title, subtitle: album.subtitle, body: album.intro, date: album.date },
      ...album.photos.map((photo, index) => ({ ...photo, type: "photo", index }))
    ];
  }

  function pageMarkup(page, folio) {
    if (!page) {
      return `<div class="blank-page" aria-hidden="true"><span>✦</span></div>`;
    }

    if (page.type === "intro") {
      return `
        <div class="album-intro">
          <p>${page.date}</p>
          <span class="intro-ornament" aria-hidden="true"></span>
          <h3>${page.title}</h3>
          <em>${page.subtitle}</em>
          <blockquote>${page.body}</blockquote>
          <small>FAMILY ALBUM · ${activeAlbum.number}</small>
        </div>`;
    }

    return `
      <figure class="photo-page orientation-${page.orientation}">
        <button class="photo-mat" type="button" data-photo-index="${page.index}" aria-label="放大照片：${page.alt}">
          <img src="${page.src}" alt="${page.alt}" loading="eager" draggable="false">
        </button>
        <figcaption>
          <p>${page.caption}</p>
          <small>${page.meta}</small>
        </figcaption>
      </figure>
      <span class="folio" aria-hidden="true">${String(folio).padStart(2, "0")}</span>`;
  }

  function perView() {
    return mobileQuery.matches ? 1 : 2;
  }

  function render(direction = 0) {
    if (!activeAlbum) return;
    const pages = pagesFor(activeAlbum);
    const step = perView();
    cursor = Math.max(0, Math.min(cursor, Math.max(0, pages.length - 1)));
    if (step === 2 && cursor % 2 !== 0) cursor -= 1;

    if (direction && !reduceMotion.matches) {
      book.classList.remove("turn-next", "turn-prev");
      void book.offsetWidth;
      book.classList.add(direction > 0 ? "turn-next" : "turn-prev");
    }

    leftPage.innerHTML = pageMarkup(pages[cursor], cursor + 1);
    if (step === 2) {
      rightPage.hidden = false;
      rightPage.innerHTML = pageMarkup(pages[cursor + 1], cursor + 2);
    } else {
      rightPage.hidden = true;
      rightPage.innerHTML = "";
    }

    const visibleEnd = Math.min(cursor + step, pages.length);
    pageCount.textContent = `${String(cursor + 1).padStart(2, "0")} — ${String(visibleEnd).padStart(2, "0")} / ${String(pages.length).padStart(2, "0")}`;
    progressBar.style.width = `${(visibleEnd / pages.length) * 100}%`;
    prev.disabled = cursor === 0;
    next.disabled = visibleEnd >= pages.length;
    shell.querySelector("#reader-kicker").textContent = activeAlbum.date;
    shell.querySelector("#reader-title").textContent = activeAlbum.title;
  }

  function openAlbum(album, trigger) {
    activeAlbum = album;
    cursor = 0;
    lastFocus = trigger;
    reader.setAttribute("aria-hidden", "false");
    reader.classList.add("is-open");
    document.body.classList.add("reader-open");
    render();
    requestAnimationFrame(() => reader.querySelector(".close-button").focus());
  }

  function closeAlbum() {
    reader.setAttribute("aria-hidden", "true");
    reader.classList.remove("is-open");
    document.body.classList.remove("reader-open");
    activeAlbum = null;
    if (lastFocus) lastFocus.focus();
  }

  function move(delta) {
    if (!activeAlbum) return;
    const step = perView();
    const target = cursor + delta * step;
    const pages = pagesFor(activeAlbum);
    if (target < 0 || target >= pages.length) return;
    cursor = target;
    render(delta);
  }

  function openPhoto(index) {
    const photo = activeAlbum?.photos[index];
    if (!photo) return;
    document.querySelector("#lightbox-image").src = photo.src;
    document.querySelector("#lightbox-image").alt = photo.alt;
    document.querySelector("#lightbox-caption").textContent = `${photo.caption} · ${photo.meta}`;
    lightbox.showModal();
  }

  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-album]");
    if (!trigger) return;
    const album = albums.find((item) => item.id === trigger.dataset.album);
    if (album) openAlbum(album, trigger);
  });

  reader.addEventListener("click", (event) => {
    if (event.target.closest("[data-close-reader]")) closeAlbum();
    const photoButton = event.target.closest("[data-photo-index]");
    if (photoButton) openPhoto(Number(photoButton.dataset.photoIndex));
  });

  prev.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) lightbox.close();
  });

  document.addEventListener("keydown", (event) => {
    if (lightbox.open) return;
    if (!activeAlbum) return;
    if (event.key === "ArrowLeft") move(-1);
    if (event.key === "ArrowRight") move(1);
    if (event.key === "Escape") closeAlbum();
  });

  book.addEventListener("touchstart", (event) => {
    touchStart = event.changedTouches[0].clientX;
  }, { passive: true });
  book.addEventListener("touchend", (event) => {
    if (touchStart === null) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 52) move(distance < 0 ? 1 : -1);
    touchStart = null;
  }, { passive: true });

  mobileQuery.addEventListener("change", () => {
    if (!activeAlbum) return;
    cursor = mobileQuery.matches ? cursor : cursor - (cursor % 2);
    render();
  });
})();
