(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (start, end, amount) => start + (end - start) * amount;
  const smoothstep = (start, end, value) => {
    const x = clamp((value - start) / (end - start));
    return x * x * (3 - 2 * x);
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const header = $('#siteHeader');
  const pageProgress = $('#pageProgress');
  const quickProgress = $('#quickProgress');
  const quickActions = $('#quickActions');
  const quickContact = $('.quick-contact', quickActions || document);
  const quickTooltip = $('#quickTooltip');
  const quickTooltipClose = $('#quickTooltipClose');
  const scrollTop = $('#scrollTop');
  const menuToggle = $('#menuToggle');
  const mobileMenu = $('#mobileMenu');
  const railLinks = $$('[data-rail]');
  const chapters = $$('[data-chapter]');

  let lastScrollY = window.scrollY;
  let scrollTicking = false;

  function setMenu(open) {
    body.classList.toggle('menu-open', open);
    menuToggle?.setAttribute('aria-expanded', String(open));
    if (mobileMenu) mobileMenu.hidden = !open;
  }

  menuToggle?.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  $$('a[href^="#"]', mobileMenu || document).forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) setMenu(false);
  });

  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' })
    : null;

  $$('.reveal').forEach((element) => {
    if (reducedMotion || !revealObserver) element.classList.add('is-visible');
    else revealObserver.observe(element);
  });

  function updateHeaderAndProgress() {
    const y = window.scrollY;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp(y / max);

    pageProgress?.style.setProperty('transform', `scaleX(${progress})`);
    quickProgress?.style.setProperty('transform', `scaleX(${progress})`);
    header?.classList.toggle('is-scrolled', y > 24);

    const movingDown = y > lastScrollY;
    header?.classList.toggle('is-hidden', movingDown && y > window.innerHeight * 1.2 && !body.classList.contains('menu-open'));
    lastScrollY = y;
  }

  function updateActiveChapter() {
    const targetY = window.innerHeight * 0.48;
    let active = chapters[0]?.dataset.chapter;
    let closest = Number.POSITIVE_INFINITY;

    chapters.forEach((chapter) => {
      const rect = chapter.getBoundingClientRect();
      if (rect.top <= targetY && rect.bottom >= targetY) {
        active = chapter.dataset.chapter;
        closest = 0;
        return;
      }
      const distance = Math.min(Math.abs(rect.top - targetY), Math.abs(rect.bottom - targetY));
      if (distance < closest) {
        closest = distance;
        active = chapter.dataset.chapter;
      }
    });

    railLinks.forEach((link) => link.classList.toggle('is-active', link.dataset.rail === active));
    body.classList.toggle('on-light-chapter', active === 'beneficii' || active === 'suport');
  }

  const sceneElements = $$('[data-scroll-scene]');
  const heroScene = $('.hero-scene');
  const planScene = $('.plan-scene');
  const planDecisionItems = $$('.plan-decisions li', planScene || document);
  const systemScene = $('.system-scene');
  const heroMedia = $('#heroMedia');
  const assemblyVisual = $('.assembly-visual');
  const assemblyFrames = $$('[data-assembly-frame]');
  const authorityMedia = $('#authorityMedia');
  const authorityMediaWrap = $('#authorityMediaWrap');
  const authorityMediaLabelText = $('#authorityMediaLabelText');
  const returnMedia = $('#returnMedia');
  const returnSystem = $('.return-system');
  const assemblyLayers = $$('.assembly-layer', systemScene || document);
  const assemblySteps = $$('.assembly-steps li');
  const assemblyStatus = $('#assemblyStatus');
  const assemblyCaption = $('#assemblyCaption');

  const assemblyLabels = [
    ['STRUCTURĂ / 20%', 'Fundația pentru un joc constant.'],
    ['MECANICĂ / 40%', 'Mișcarea din spatele fiecărei aruncări.'],
    ['SCORING / 60%', 'Controlul și experiența devin un singur flux.'],
    ['OPERARE / 80%', 'Spațiul este pregătit pentru oameni.'],
    ['ATMOSFERĂ / 100%', 'Sistemul tehnic devine o destinație.']
  ];

  function getSceneProgress(scene) {
    const rect = scene.getBoundingClientRect();
    const travel = Math.max(1, scene.offsetHeight - window.innerHeight);
    return clamp(-rect.top / travel);
  }

  function syncHeroMedia(progress) {
    if (!heroMedia || reducedMotion || heroMedia.readyState < 1 || !Number.isFinite(heroMedia.duration)) return;
    const targetTime = clamp(progress) * Math.max(0, heroMedia.duration - 0.08);
    if (Math.abs(heroMedia.currentTime - targetTime) < 0.045) return;
    try {
      heroMedia.currentTime = targetTime;
    } catch (error) {
      // The CSS scene remains available if the browser cannot seek the video.
    }
  }

  function updateHero(progress) {
    if (!heroScene) return;
    syncHeroMedia(progress);
    const trace = smoothstep(0.08, 0.42, progress);
    const light = smoothstep(0.02, 0.78, progress);
    const copyExit = smoothstep(0.26, 0.43, progress);
    const decisionIn = smoothstep(0.46, 0.61, progress);
    const decisionOut = smoothstep(0.91, 0.99, progress);
    const decisionOpacity = decisionIn * (1 - decisionOut);
    const ballTravel = smoothstep(0.23, 0.77, progress);
    const ballFade = smoothstep(0.76, 0.89, progress);

    heroScene.style.setProperty('--hero-trace', trace.toFixed(4));
    heroScene.style.setProperty('--hero-light', light.toFixed(4));
    heroScene.style.setProperty('--hero-copy-exit', copyExit.toFixed(4));
    heroScene.style.setProperty('--hero-decision-opacity', decisionOpacity.toFixed(4));
    heroScene.style.setProperty('--hero-decision-events', decisionOpacity > 0.72 ? 'auto' : 'none');
    heroScene.style.setProperty('--hero-ball-opacity', (smoothstep(0.18, 0.3, progress) * (1 - ballFade)).toFixed(4));
    heroScene.style.setProperty('--hero-ball-y', `${lerp(80, -255, ballTravel).toFixed(2)}px`);
    heroScene.style.setProperty('--hero-ball-x', `${Math.sin(ballTravel * Math.PI * 2) * 16}px`);
    heroScene.style.setProperty('--hero-ball-scale', lerp(1, 0.28, ballTravel).toFixed(4));
    heroScene.style.setProperty('--hero-ball-rotation', `${(ballTravel * 520).toFixed(1)}deg`);
  }

  function updatePlan(progress) {
    if (!planScene) return;
    const activeStep = Math.min(3, Math.floor(clamp(progress * 1.001) * 4));
    planDecisionItems.forEach((item, index) => {
      item.classList.toggle('is-active', index === activeStep);
      item.classList.toggle('is-past', index < activeStep);
    });
  }

  function updateSystem(progress) {
    if (!systemScene) return;
    const activeStep = Math.min(4, Math.floor(clamp(progress * 1.08) * 5));

    const layerThresholds = [0, 0, 1, 2, 3, 4];
    assemblyLayers.forEach((layer, index) => layer.classList.toggle('is-visible', layerThresholds[index] <= activeStep));
    assemblySteps.forEach((step, index) => step.classList.toggle('is-active', index === activeStep));
    assemblyFrames.forEach((frame, index) => frame.classList.toggle('is-active', index === activeStep));

    if (assemblyStatus) assemblyStatus.textContent = assemblyLabels[activeStep][0];
    if (assemblyCaption) assemblyCaption.textContent = assemblyLabels[activeStep][1];
  }

  function updateScenes() {
    if (reducedMotion) return;
    sceneElements.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      if (rect.bottom < -window.innerHeight || rect.top > window.innerHeight * 2) return;
      const progress = getSceneProgress(scene);
      scene.style.setProperty('--scene-progress', progress.toFixed(4));
      if (scene === heroScene) updateHero(progress);
      if (scene === planScene) updatePlan(progress);
      if (scene === systemScene) updateSystem(progress);
    });
  }

  function updateScrollSystems() {
    updateHeaderAndProgress();
    updateActiveChapter();
    updateScenes();
    scrollTicking = false;
  }

  function requestScrollUpdate() {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScrollSystems);
  }

  function initMedia() {
    if (heroMedia && heroScene) {
      const markHeroReady = () => {
        heroMedia.pause();
        heroScene.classList.add('media-ready');
        requestScrollUpdate();
      };
      if (heroMedia.readyState >= 2) markHeroReady();
      else heroMedia.addEventListener('loadeddata', markHeroReady, { once: true });
      heroMedia.addEventListener('seeked', requestScrollUpdate);
      heroMedia.addEventListener('error', () => heroScene.classList.remove('media-ready'));
    }

    if (assemblyVisual && assemblyFrames.length) {
      const firstFrame = assemblyFrames[0];
      const markAssemblyReady = () => assemblyVisual.classList.add('media-ready');
      if (firstFrame.complete && firstFrame.naturalWidth) markAssemblyReady();
      else firstFrame.addEventListener('load', markAssemblyReady, { once: true });
      firstFrame.addEventListener('error', () => assemblyVisual.classList.remove('media-ready'));
    }

    if (authorityMedia && authorityMediaWrap) {
      const markAuthorityReady = () => {
        authorityMediaWrap.classList.remove('media-failed');
        authorityMediaWrap.classList.add('media-ready');
        if (authorityMediaLabelText) authorityMediaLabelText.textContent = 'FLYBY / CENTRU DE BOWLING';
      };
      const markAuthorityFailed = () => {
        authorityMediaWrap.classList.remove('media-ready');
        authorityMediaWrap.classList.add('media-failed');
        if (authorityMediaLabelText) authorityMediaLabelText.textContent = 'PROIECT / CENTRU DE BOWLING';
      };
      authorityMedia.addEventListener('loadeddata', markAuthorityReady, { once: true });
      authorityMedia.addEventListener('error', markAuthorityFailed, { once: true });

      const activateAuthorityVideo = () => {
        const source = document.createElement('source');
        source.src = authorityMedia.dataset.src;
        source.type = 'video/mp4';
        source.addEventListener('error', markAuthorityFailed, { once: true });
        authorityMedia.append(source);
        authorityMedia.load();

        if ('IntersectionObserver' in window) {
          const authorityObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting && !authorityMediaWrap.classList.contains('media-failed')) authorityMedia.play().catch(() => {});
              else authorityMedia.pause();
            });
          }, { rootMargin: '180px 0px' });
          authorityObserver.observe(authorityMediaWrap);
        } else {
          authorityMedia.play().catch(() => {});
        }
      };

      if (reducedMotion) {
        authorityMedia.pause();
        if (authorityMediaLabelText) authorityMediaLabelText.textContent = 'PROIECT / CENTRU DE BOWLING';
      } else if (authorityMedia.dataset.src) {
        activateAuthorityVideo();
      }
    }

    if (returnMedia && returnSystem) {
      returnMedia.addEventListener('loadeddata', () => returnSystem.classList.add('media-ready'), { once: true });
      returnMedia.addEventListener('error', () => returnSystem.classList.remove('media-ready'));

      if (reducedMotion) {
        returnMedia.pause();
      } else if ('IntersectionObserver' in window) {
        const returnObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) returnMedia.play().catch(() => {});
            else returnMedia.pause();
          });
        }, { rootMargin: '180px 0px' });
        returnObserver.observe(returnSystem);
      } else {
        returnMedia.play().catch(() => {});
      }
    }
  }

  initMedia();

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', requestScrollUpdate, { passive: true });

  scrollTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' }));

  const QUICK_TOOLTIP_KEY = 'bowlingtech-quick-tooltip-seen';
  const quickTooltipReadyAt = Date.now() + 5000;
  let quickTooltipAutoTimer;
  let quickTooltipHideTimer;
  let quickTooltipAutoScheduled = false;
  let quickTooltipScrollSeen = window.scrollY > 80;
  let suppressQuickTooltipFocus = false;

  function hasSeenQuickTooltip() {
    try {
      return window.sessionStorage.getItem(QUICK_TOOLTIP_KEY) === '1';
    } catch (error) {
      return false;
    }
  }

  function markQuickTooltipSeen() {
    try {
      window.sessionStorage.setItem(QUICK_TOOLTIP_KEY, '1');
    } catch (error) {
      // The tooltip still works when storage is unavailable.
    }
  }

  function hideQuickTooltip({ restoreFocus = false } = {}) {
    window.clearTimeout(quickTooltipHideTimer);
    quickTooltip?.classList.remove('is-visible');
    quickTooltip?.setAttribute('aria-hidden', 'true');
    quickTooltip?.setAttribute('inert', '');
    quickContact?.setAttribute('aria-expanded', 'false');
    if (restoreFocus && quickContact) {
      suppressQuickTooltipFocus = true;
      quickContact.focus({ preventScroll: true });
      window.requestAnimationFrame(() => { suppressQuickTooltipFocus = false; });
    }
  }

  function showQuickTooltip({ auto = false } = {}) {
    if (!quickTooltip || !quickActions || quickActions.classList.contains('is-suppressed') || body.classList.contains('menu-open')) {
      if (auto) quickTooltipAutoScheduled = false;
      return;
    }
    window.clearTimeout(quickTooltipHideTimer);
    quickTooltip.removeAttribute('inert');
    quickTooltip.classList.add('is-visible');
    quickTooltip.setAttribute('aria-hidden', 'false');
    quickContact?.setAttribute('aria-expanded', 'true');
    if (auto) {
      markQuickTooltipSeen();
      quickTooltipHideTimer = window.setTimeout(() => hideQuickTooltip(), window.innerWidth <= 680 ? 6000 : 8000);
    }
  }

  function scheduleQuickTooltip() {
    if (!quickTooltip || hasSeenQuickTooltip() || quickTooltipAutoScheduled || !quickTooltipScrollSeen) return;
    quickTooltipAutoScheduled = true;
    const delay = Math.max(0, quickTooltipReadyAt - Date.now());
    quickTooltipAutoTimer = window.setTimeout(() => showQuickTooltip({ auto: true }), delay);
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY <= 80) return;
    quickTooltipScrollSeen = true;
    scheduleQuickTooltip();
  }, { passive: true });

  if (quickTooltipScrollSeen) scheduleQuickTooltip();

  quickTooltipClose?.addEventListener('click', () => {
    markQuickTooltipSeen();
    hideQuickTooltip({ restoreFocus: true });
  });

  $('.quick-tooltip-link', quickTooltip || document)?.addEventListener('click', () => {
    markQuickTooltipSeen();
    hideQuickTooltip();
  });

  quickContact?.addEventListener('mouseenter', () => showQuickTooltip());
  quickContact?.addEventListener('focus', () => {
    if (!suppressQuickTooltipFocus) showQuickTooltip();
  });
  quickContact?.addEventListener('mouseleave', () => {
    quickTooltipHideTimer = window.setTimeout(() => hideQuickTooltip(), 650);
  });
  quickContact?.addEventListener('blur', () => {
    quickTooltipHideTimer = window.setTimeout(() => hideQuickTooltip(), 650);
  });
  quickTooltip?.addEventListener('mouseenter', () => window.clearTimeout(quickTooltipHideTimer));
  quickTooltip?.addEventListener('mouseleave', () => {
    quickTooltipHideTimer = window.setTimeout(() => hideQuickTooltip(), 650);
  });
  quickTooltip?.addEventListener('focusin', () => window.clearTimeout(quickTooltipHideTimer));
  quickTooltip?.addEventListener('focusout', (event) => {
    if (quickTooltip.contains(event.relatedTarget) || quickContact?.contains(event.relatedTarget)) return;
    quickTooltipHideTimer = window.setTimeout(() => hideQuickTooltip(), 150);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !quickTooltip?.classList.contains('is-visible')) return;
    markQuickTooltipSeen();
    hideQuickTooltip({ restoreFocus: true });
  });

  if (quickActions && 'IntersectionObserver' in window) {
    const suppressionState = new Map();
    const suppressQuickActions = new IntersectionObserver((entries) => {
      entries.forEach((entry) => suppressionState.set(entry.target, entry.isIntersecting));
      const shouldSuppress = [...suppressionState.values()].some(Boolean);
      quickActions.classList.toggle('is-suppressed', shouldSuppress);
      if (shouldSuppress) hideQuickTooltip();
      else scheduleQuickTooltip();
    }, { threshold: 0.08 });
    const servicesSection = $('#servicii');
    const locationSection = $('#locatii');
    const configSection = $('#configurator');
    const authoritySection = $('#autoritate');
    const footer = $('.site-footer');
    if (servicesSection) suppressQuickActions.observe(servicesSection);
    if (locationSection) suppressQuickActions.observe(locationSection);
    if (configSection) suppressQuickActions.observe(configSection);
    if (authoritySection) suppressQuickActions.observe(authoritySection);
    if (footer) suppressQuickActions.observe(footer);
  }

  const configLanes = $('#configLanes');
  const configLaneOutput = $('#configLaneOutput');

  configLanes?.addEventListener('input', (event) => {
    if (configLaneOutput) configLaneOutput.textContent = `${event.target.value} piste`;
    updateConfigurator();
  });

  const projectConfigurator = $('#projectConfigurator');
  const configSummary = $('#configSummary');
  const configWhatsapp = $('#configWhatsapp');
  const configStepLabel = $('#configStepLabel');
  const projectPathOptions = $$('.path-option');
  const WHATSAPP_BASE = 'https://wa.me/40732430303?text=';

  function normalizeLocation(value) {
    return value.toLocaleLowerCase('ro-RO');
  }

  function updateConfigurator() {
    if (!projectConfigurator || !configSummary || !configWhatsapp) return;
    const formData = new FormData(projectConfigurator);
    const project = formData.get('proiect') || 'Centru nou';
    const lanes = Number(formData.get('piste') || 6);
    const location = formData.get('locatie') || 'Mall / retail';
    const stage = formData.get('etapa') || 'Am un spațiu / plan';
    const stageSentence = stage === 'Am un spațiu / plan'
      ? 'Există deja un spațiu sau un plan de analizat.'
      : 'Proiectul este în faza de explorare.';

    configSummary.textContent = `${project} cu ${lanes} piste, într-o locație de tip ${normalizeLocation(location)}. ${stageSentence}`;

    const message = [
      'Bună, vreau să discut despre un proiect de bowling.',
      '',
      `Tip proiect: ${project}`,
      `Număr orientativ de piste: ${lanes}`,
      `Tip locație: ${location}`,
      `Etapa proiectului: ${stage}`,
      '',
      'Aș dori să stabilim o discuție tehnică.'
    ].join('\n');

    configWhatsapp.href = WHATSAPP_BASE + encodeURIComponent(message);
    projectPathOptions.forEach((option) => option.classList.toggle('is-selected', option.dataset.projectChoice === project));
  }

  projectConfigurator?.addEventListener('input', updateConfigurator);
  projectConfigurator?.addEventListener('change', updateConfigurator);
  projectConfigurator?.addEventListener('focusin', (event) => {
    const fieldset = event.target.closest('.config-fieldset');
    if (!fieldset || !configStepLabel) return;
    const fields = $$('.config-fieldset', projectConfigurator);
    const index = fields.indexOf(fieldset) + 1;
    configStepLabel.textContent = `${String(index).padStart(2, '0')} / ${String(fields.length).padStart(2, '0')}`;
  });

  projectPathOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const value = option.dataset.projectChoice;
      const radio = $(`input[name="proiect"][value="${CSS.escape(value)}"]`, projectConfigurator || document);
      if (radio) radio.checked = true;
      projectPathOptions.forEach((item) => item.classList.toggle('is-selected', item === option));
      updateConfigurator();
    });
  });

  const projects = [
    {
      city: 'Oradea', lanes: '12 piste', name: 'Lotus Center Mall', image: 'assets/images/project-oradea.jpg',
      alt: 'Centru de bowling Lotus Center Mall Oradea', type: 'Instalare completă', format: 'Mall / entertainment',
      description: 'Proiect de capacitate mare pentru trafic intens și operare zilnică.'
    },
    {
      city: 'Cluj', lanes: '12 piste', name: 'Bowling Club Cluj', image: 'assets/images/project-cluj.jpg',
      alt: 'Centru de bowling din Cluj', type: 'Instalare / echipare', format: 'Club urban',
      description: 'Capacitate ridicată pentru grupuri, competiții și evenimente corporate.'
    },
    {
      city: 'Sibiu', lanes: '5 piste', name: 'Switch Bowl', image: 'assets/images/project-sibiu.jpg',
      alt: 'Centru de bowling Switch Bowl Sibiu', type: 'Modernizare / service', format: 'Club / entertainment',
      description: 'Format flexibil pentru public mixt, evenimente și utilizare constantă.'
    },
    {
      city: 'Brașov', lanes: '6 piste', name: 'Tequila Bowling', image: 'assets/images/project-brasov.jpg',
      alt: 'Centru de bowling din Brașov', type: 'Instalare / echipare', format: 'Entertainment',
      description: 'O experiență vizuală puternică, construită în jurul jocului și atmosferei.'
    },
    {
      city: 'Suceava', lanes: '8 piste', name: 'Club Strikers', image: 'assets/images/project-suceava.jpg',
      alt: 'Club Strikers Suceava', type: 'Instalare completă', format: 'Mall',
      description: 'Soluție pentru familii, grupuri și flux constant de vizitatori indoor.'
    },
    {
      city: 'Iași', lanes: '6 piste', name: 'Play Again Palas Mall', image: 'assets/images/project-iasi.jpg',
      alt: 'Play Again Palas Mall Iași', type: 'Instalare completă', format: 'Mall / entertainment',
      description: 'Format compact pentru o locație urbană în care spațiul trebuie folosit inteligent.'
    }
  ];

  const projectImage = $('#projectImage');
  const projectNumber = $('#projectNumber');
  const projectCity = $('#projectCity');
  const projectLanes = $('#projectLanes');
  const projectName = $('#projectName');
  const projectDescription = $('#projectDescription');
  const projectType = $('#projectType');
  const projectFormat = $('#projectFormat');
  const projectBar = $('#projectBar');
  const projectImageWrap = $('.project-image-wrap');
  const mapPoints = $$('.map-point[data-project]');
  let activeProject = 0;

  function showProject(index) {
    activeProject = (index + projects.length) % projects.length;
    const project = projects[activeProject];
    projectImageWrap?.classList.add('is-changing');

    window.setTimeout(() => {
      if (projectImage) {
        projectImage.src = project.image;
        projectImage.alt = project.alt;
      }
      if (projectNumber) projectNumber.textContent = String(activeProject + 1).padStart(2, '0');
      if (projectCity) projectCity.textContent = project.city;
      if (projectLanes) projectLanes.textContent = project.lanes;
      if (projectName) projectName.textContent = project.name;
      if (projectDescription) projectDescription.textContent = project.description;
      if (projectType) projectType.textContent = project.type;
      if (projectFormat) projectFormat.textContent = project.format;
      if (projectBar) projectBar.style.transform = `scaleX(${(activeProject + 1) / projects.length})`;
      mapPoints.forEach((point) => {
        const isActive = Number(point.dataset.project) === activeProject;
        point.classList.toggle('is-active', isActive);
        point.setAttribute('aria-pressed', String(isActive));
      });
      projectImageWrap?.classList.remove('is-changing');
    }, reducedMotion ? 0 : 180);
  }

  $('#projectPrev')?.addEventListener('click', () => showProject(activeProject - 1));
  $('#projectNext')?.addEventListener('click', () => showProject(activeProject + 1));
  mapPoints.forEach((point) => point.addEventListener('click', () => showProject(Number(point.dataset.project))));

  $('#currentYear').textContent = String(new Date().getFullYear());

  showProject(0);
  updateConfigurator();
  updateSystem(reducedMotion ? 4 : 0);
  updateScrollSystems();
})();
