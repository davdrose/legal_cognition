/* ============================================================
   CAUSE & FAULT EXPERIMENT 2 — CHILDREN
   jsPsych 7 – Cookie Allocation Task + Fault Question
   ============================================================ */

/* ----------------------------------------------------------
   INITIALIZE jsPsych
   ---------------------------------------------------------- */
var participantConsented = false;
var _demoData = {}; // captured before jsPsych clears the display

const jsPsych = initJsPsych({
  display_element: 'jspsych-target',
  show_progress_bar: true,
  // Stops any narration still playing from the screen just finished, so it
  // never overlaps with the next screen's audio when a child clicks Next
  // (or Continue/Got it!) before a clip has finished.
  on_trial_finish: function () {
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.remove(); });
  },
  on_finish: function () {
    if (!participantConsented) {
      document.getElementById('jspsych-target').innerHTML = `
        <div style="text-align:center; padding:80px 40px; max-width:700px; margin:0 auto; font-family:sans-serif; color:#333;">
          <p style="font-size:20px;">You have chosen not to participate in this study.</p>
          <p style="font-size:18px; color:#666; margin-top:16px;">You may close this browser window.</p>
        </div>`;
      return;
    }
    // Send trial and demographic data to proliferate for storage.
    // Upload status is shown to the participant in the #thanks element.
    // The fault question and the allocation screen are two separate jsPsych
    // trials (so they can be shown as two screens), but they share a scenario_id —
    // merge them into a single row per scenario before submitting.
    const rawTrials = jsPsych.data.get().values().filter(row => row.is_practice === false && !row.is_demographic);
    const bySid = new Map();
    rawTrials.forEach(row => {
      if (row.scenario_id === undefined) return;
      if (!bySid.has(row.scenario_id)) bySid.set(row.scenario_id, {});
      const merged = bySid.get(row.scenario_id);
      if (row.is_fault_rating) {
        merged.fault_rating_v  = row.fault_rating_v;
        merged.fault_rating_p  = row.fault_rating_p;
        merged.fault_rating_rt = row.rt;
      } else if (row.is_checker_question) {
        // Two checker rows per scenario (actor + victim, order randomized) —
        // key by which role this particular row asked about so the second
        // response never overwrites the first.
        if (row.checker_target_role === 'p') {
          merged.checker_response_p = row.checker_response;
          merged.checker_rt_p       = row.rt;
        } else {
          merged.checker_response_v = row.checker_response;
          merged.checker_rt_v       = row.rt;
        }
      } else {
        Object.assign(merged, row);
      }
    });
    const trials = Array.from(bySid.values()).sort((a, b) => a.scenario_id - b.scenario_id);
    const demographics = jsPsych.data.get().filter({ is_demographic: true }).values();
    if (typeof proliferate !== 'undefined') {
      proliferate.submit({ "trials": trials, "demographics": demographics });
    } else {
      // Fallback when not launched through proliferate (e.g. local preview):
      // log the data and show a simple thank-you screen so nothing appears broken.
      console.table(trials);
      console.table(demographics);
      document.body.innerHTML = `
        <div style="text-align:center; padding:80px; font-family:sans-serif;">
          <h2>Thank you for participating!</h2>
          <p>Your responses have been recorded.</p>
        </div>`;
    }
  }
});

/* ----------------------------------------------------------
   PARTICIPANT-LEVEL RANDOMIZATION
   sessionStorage keeps values stable across jump-reloads so the
   researcher debug panel always lands on the correct slide.
   ---------------------------------------------------------- */
function sessionGet(key, generator) {
  const stored = sessionStorage.getItem(key);
  if (stored !== null) return JSON.parse(stored);
  const val = generator();
  sessionStorage.setItem(key, JSON.stringify(val));
  return val;
}

/** Fisher-Yates shuffle — used once to pick this participant's fixed
 *  left-to-right arrangement of P, V, and the Cookie Jar. */
function shuffle3(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// One of 6 possible left-to-right arrangements of P, V, and the Cookie Jar,
// drawn once per participant and held fixed for every warmup screen and
// every scenario's allocation screen. Fault/checker screens (no jar there)
// derive their P/V order from the relative position of 'P' and 'V' within
// this same array, so everything stays consistent for this participant.
const CHARACTER_ORDER = sessionGet('exp2_children_vgo0_char_order', () => shuffle3(['P', 'V', 'TRASH']));
const P_BEFORE_V = CHARACTER_ORDER.indexOf('P') < CHARACTER_ORDER.indexOf('V');

/* ----------------------------------------------------------
   SHARED ASSET LOCATIONS
   Character portraits, the cookie jar icon, and the story-outcome
   images are canonical assets already vetted for experiment2 — they
   live in the sibling adult "v goes to zero" folder and are referenced
   here rather than duplicated. Maggie and the warmup audio/video clips
   are shared across all of experiment1's variants, one level further up.
   ---------------------------------------------------------- */
const CHAR_IMG_BASE  = '../adults - v goes to zero/img/';
const SHARED_BASE     = '../../experiment1/children-shared%20files/';

/* ----------------------------------------------------------
   HELPERS
   ---------------------------------------------------------- */

/** Cookie grid HTML (3+2 layout). size = 'large' | 'medium' | 'small' */
function cookieGridHTML(filled, total, size, animate) {
  const layout = [[0, 1, 2], [3, 4]];
  let html = '<div class="cookie-grid' + (size === 'small' ? ' hud-grid' : '') + '">';
  layout.forEach((row, ri) => {
    html += '<div class="cookie-row ' + (ri === 1 ? 'row-bottom' : 'row-top') + '">';
    row.forEach(i => {
      if (i >= total) return;
      const isFilled = i < filled;
      const animClass = animate && isFilled ? ' animate-cookie-appear stagger-' + i : '';
      html += `<div class="cookie-slot ${size} ${isFilled ? 'filled' : 'empty'}${animClass}">`;
      if (isFilled) html += '<span class="cookie-emoji">🍪</span>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

/** Free-floating cookie icons — no slots, no grid */
function freeCookiesHTML(count, animate) {
  let html = '<div class="free-cookies-row">';
  for (let i = 0; i < count; i++) {
    const cls = animate ? ` animate-cookie-appear stagger-${i}` : '';
    html += `<span class="free-cookie-emoji${cls}">🍪</span>`;
  }
  html += '</div>';
  return html;
}

/** Single-person display for one-at-a-time introductions */
function onePersonHTML(name, imgFile) {
  return `
    <div class="two-person-display">
      <div class="person-col">
        <img src="${CHAR_IMG_BASE}${imgFile}" class="char-img intro-img" alt="${name}">
        <p class="intro-name">${name}</p>
      </div>
    </div>`;
}

/** Two-person display (P left, V right) with optional cookies.
 *  showSlots:   render the 3+2 slot grid (used in outcome slides)
 *  showCookies: render free-floating emoji icons (used in intro slides)
 */
function twoPersonHTML({ pCookies, vCookies, pLabel, vLabel, showSlots, showCookies, animate,
                         pName = 'Finn', vName = 'Cleo',
                         pImg  = 'finn_neutral.png', vImg = 'cleo_neutral.png' }) {
  return `
    <div class="two-person-display">
      <div class="person-col">
        <img src="${CHAR_IMG_BASE}${pImg}" class="char-img" alt="${pName}">
        <p class="person-name">${pName}</p>
        ${showSlots   ? `<div class="cookie-label">${pLabel}</div>${cookieGridHTML(pCookies, 5, 'large', animate)}` : ''}
        ${showCookies ? `<div class="cookie-label">${pLabel}</div>${freeCookiesHTML(pCookies, animate)}` : ''}
      </div>
      <div class="person-col">
        <img src="${CHAR_IMG_BASE}${vImg}" class="char-img" alt="${vName}">
        <p class="person-name">${vName}</p>
        ${showSlots   ? `<div class="cookie-label">${vLabel}</div>${cookieGridHTML(vCookies, 5, 'large', animate)}` : ''}
        ${showCookies ? `<div class="cookie-label">${vLabel}</div>${freeCookiesHTML(vCookies, animate)}` : ''}
      </div>
    </div>`;
}

/** Slide with two-person display on left + instruction text on right */
function slideLayout(mainHTML, instructionHTML) {
  return `
    <div class="slide-wrapper">
      <div>${mainHTML}</div>
      <div class="slide-content-area">
        <p class="slide-instruction">${instructionHTML}</p>
      </div>
    </div>`;
}

/** Event box HTML for a scenario */
function eventBoxHTML(scenario, showHarm) {
  const pName = scenario.p_name || 'Finn';
  const vName = scenario.v_name || 'Cleo';
  const harmTypeLabel = scenario.harm_type === 'intentional' ? 'perpetrator'
                      : scenario.harm_type === 'negligent'   ? 'negligent'
                      : 'strict-liability';
  const eventText = showHarm
    ? `<strong>Oh no!</strong> ${vName} lost ${scenario.harm_amount} cookie${scenario.harm_amount !== 1 ? 's' : ''} during this event.`
    : scenario.event_text;

  return `
    <div class="event-box">
      <div class="event-scene">
        <div class="event-person ${harmTypeLabel}">
          <div class="char-card medium">${pName}</div>
          <div class="event-person-label">${pName}</div>
        </div>
        <div class="event-arrow">→</div>
        <div class="event-person">
          <div class="char-card medium">${vName}</div>
          <div class="event-person-label">${vName}</div>
        </div>
      </div>
      <div class="event-description">${eventText}</div>
    </div>`;
}

/* ----------------------------------------------------------
   SCENARIO DEFINITIONS
   story_slides / story_video mirror the corrected exp2 adult set:
   the header/outcome image (last story_slides entry) is the same
   already-fixed artwork used by the adult version; the video is
   this folder's own child-friendly retelling of the same event.
   ---------------------------------------------------------- */
// Finn & Cleo scenarios (randomized block)
const finnCleoScenarios = [
  {
    id: 2,
    p_name: 'Finn', v_name: 'Cleo', p_img: 'finn_neutral.png', v_img: 'cleo_neutral.png',
    harm_type: 'negligent',
    p_cookies: 5, p_after: 5,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Finn spills water and doesn\'t clean it up. Cleo slips on the wet floor and 2 of Cleo\'s cookies are destroyed.',
    event_title: 'Finn Spills Water — Cleo Slips',
    story_slides: [1,2,3,4,5,6,7,8,9,10,11,12].map(n => `${CHAR_IMG_BASE}trailppt/finn_cleo/finn_cleo_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/finn%20and%20cleo%20vgo0.mp4'
  }
];

// Second block — always after Finn & Cleo, randomized among themselves
const secondBlockScenarios = [
  {
    id: 5,
    p_name: 'Milo', v_name: 'Sasha', p_img: 'Milo.png', v_img: 'Sasha.png',
    harm_type: 'intentional',
    p_cookies: 5, p_after: 5,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Milo is angry at Sasha. He walks over and deliberately knocks off 2 of Sasha\'s cookies.',
    event_title: 'Milo Knocks Sasha\'s Cookies',
    story_slides: [1,2,3,4,5,6,7,8,9,10].map(n => `${CHAR_IMG_BASE}trailppt/milo_sasha/milo_sasha_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/milo%20and%20sasha%20vgo0.mp4'
  },
  {
    id: 6,
    p_name: 'Zoe', v_name: 'Rex', p_img: 'zoe.png', v_img: 'rex.png',
    harm_type: 'intentional',
    p_cookies: 7, p_after: 7,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Zoe wants Rex to have fewer cookies. She deliberately throws away 2 of Rex\'s cookies.',
    event_title: 'Zoe Throws Rex\'s Cookies Away',
    story_slides: [1,2,3,4,5,6,7,8,9].map(n => `${CHAR_IMG_BASE}trailppt/rex_zoe/rex_zoe_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/rex%20and%20zoe%20vgo0.mp4'
  },
  {
    id: 7,
    p_name: 'Kai', v_name: 'Ruby', p_img: 'kai.png', v_img: 'Ruby.png',
    harm_type: 'negligent',
    p_cookies: 7, p_after: 7,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Kai walks without looking where he is going and bumps into Ruby. 2 of Ruby\'s cookies fall off.',
    event_title: 'Kai Bumps Into Ruby',
    story_slides: [1,2,3,4,5,6,7,8,9].map(n => `${CHAR_IMG_BASE}trailppt/kai_ruby/kai_ruby_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/kai%20and%20ruby%20vgo0.mp4'
  },
  {
    id: 8,
    p_name: 'Sam', v_name: 'Ella', p_img: 'sam.png', v_img: 'ella.png',
    harm_type: 'strict_liability',
    p_cookies: 5, p_after: 5,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Sam is walking his dog on a leash when the dog breaks free and eats 2 of Ella\'s cookies.',
    event_title: 'Sam\'s Dog Eats Ella\'s Cookies',
    story_slides: [1,2,3,4,5,6,7,8,9,10].map(n => `${CHAR_IMG_BASE}trailppt/sam_ella/sam_ella_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/sam%20and%20ella%20vgo0.mp4'
  },
  {
    id: 9,
    p_name: 'Catherine', v_name: 'Andy', p_img: 'catherine.png', v_img: 'andy.png',
    harm_type: 'strict_liability',
    p_cookies: 7, p_after: 7,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Andy and Catherine bumped into each other accidentally. Catherine\'s wolf ate 2 of Andy\'s cookies.',
    event_title: 'Catherine\'s Wolf Eats Andy\'s Cookies',
    story_slides: [1,2,3,4,5,6,7,8,9].map(n => `${CHAR_IMG_BASE}trailppt/andy_catherine/andy_catherine_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/andy%20and%20catherine%20vgo0.mp4'
  },
  {
    id: 10,
    p_name: 'Tony', v_name: 'Katie', p_img: 'tony.png', v_img: 'katie.png',
    harm_type: 'control',
    p_cookies: 5, p_after: 5,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'Katie and Tony are having a picnic when a gust of wind blows 2 of Katie\'s cookies away.',
    event_title: 'Wind Blows Away Katie\'s Cookies',
    story_slides: [1,2,3,4,5,6,7,8,9,10].map(n => `${CHAR_IMG_BASE}trailppt/harry_katie/harry_katie_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/harry%20and%20katie%20vgo0.mp4'
  },
  {
    id: 11,
    p_name: 'Eric', v_name: 'Nora', p_img: 'eric.png', v_img: 'nora.png',
    harm_type: 'control',
    p_cookies: 7, p_after: 7,
    v_initial: 2, v_after_harm: 0, harm_amount: 2,
    event_text: 'While Nora is playing outside, a squirrel eats 2 of Nora\'s cookies.',
    event_title: 'Squirrel Eats Nora\'s Cookies',
    story_slides: [1,2,3,4,5,6,7,8,9].map(n => `${CHAR_IMG_BASE}trailppt/nora_eric/nora_eric_${n}.png`),
    story_video: '../../experiment1/children-%20v%20goes%20to%200/videos%20vgo0/nora%20and%20eric%20vgo0.mp4'
  }
];

/* ----------------------------------------------------------
   CONSENT SCREEN (first page of study)
   ---------------------------------------------------------- */
const consentScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div id="consent-scroll" style="max-width:720px; margin:0 auto; padding:36px 48px 28px 48px; font-family:'Helvetica Neue', Arial, sans-serif; color:#333; font-size:14px; line-height:1.5; text-align:left; max-height:calc(100vh - 220px); overflow-y:auto; background-color:#b8d4e8; border-radius:4px;">
      <h2 style="text-align:center; font-size:16px; font-weight:bold; letter-spacing:0.04em; margin:0 0 24px 0; text-transform:uppercase;">Consent Form</h2>
      <p style="margin:0 0 14px 0;">Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, we will present you with a fictional scenario, and then we will ask you to answer a brief series of questions about that scenario. The questions have no right or wrong answers-- we're just exploring features of human psychology in this research. You will be paid $4.00 for your time and efforts (based on a rate of $8 per hour for this approximately 30-minute study). We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>
      <p style="margin:0 0 14px 0;">Your involvement should take about 30 minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the arrow to advance. If not, simply close your browser window.</p>
      <p style="margin:0 0 14px 0;">The research data will be collected anonymously. We will not ask you to provide any personally identifiable information (such as an email-address, name, etc.) and will not be able to link your response to you. We anticipate that your participation in this survey presents no greater risk than everyday use of the Internet. Of course, please note that there is always the possible risk of intrusion by outside agents (i.e. hacking) whenever information shared over the Internet. In order to keep your identifying information and data from this study separate, we will host the survey on an unaffiliated platform, Qualtrics. Thus, Prolific will not have access to the data you provide us. Additionally, we will not ask for directly or indirectly identifiable information in the survey.</p>
      <p style="margin:0 0 14px 0;">If you have any questions about the research study, please contact Shaun Nichols (sbn44@cornell.edu) at Cornell University. If you have any questions or concerns regarding your rights as a subject in this study, you may contact the Institutional Review Board (IRB) for Human Participants at 607-255-5138 or access their website at <a href="http://www.irb.cornell.edu" target="_blank">http://www.irb.cornell.edu</a>. You may also report your concerns or complaints anonymously through Ethicspoint online at <a href="http://www.hotline.cornell.edu" target="_blank">www.hotline.cornell.edu</a> or by calling toll free at 1-866-293-3077. Ethicspoint is an independent organization that serves as a liaison between the University and the person bringing the complaint so that anonymity can be ensured.</p>
      <p style="margin:0 0 14px 0;">Taking part in this study is voluntary. You can stop at any time. Withdrawal or refusal to participate will not result in any penalty. You do not waive any legal rights or release any agent from liability for negligence by consenting to participate.</p>
      <p style="margin:20px 0 0 0;">If you consent to take part in this survey, please indicate so below:</p>
    </div>`,
  choices: ['I Agree'],
  on_load: function() {
    const btn = document.querySelector('#jspsych-html-button-response-btngroup .jspsych-btn');
    if (btn) {
      btn.style.cssText = 'background:#fff; border:1px solid #999; padding:4px 20px; font-size:14px; color:#333; cursor:pointer; border-radius:2px; font-family:sans-serif; box-shadow:none;';
    }
  },
  on_finish: function(data) {
    participantConsented = true;
  },
  _debugLabel: 'Consent Form',
};

/* ----------------------------------------------------------
   WARMUP TIMELINE
   ---------------------------------------------------------- */

// Slide 0 – Welcome screen
const welcomeScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="welcome-video" src="${SHARED_BASE}overall_study_intro.mp4" autoplay playsinline
             style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
      </video>
    </div>`,
  choices: ['Next'],
  on_load: function() {
    const nextBtn = document.querySelector('.jspsych-btn');
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.4';
    nextBtn.style.cursor = 'not-allowed';
    document.getElementById('welcome-video').addEventListener('ended', () => {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    });
  },
};

// Slide 0b – Introducing Maggie
const introMaggieVideo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="intro-maggie-video" src="${SHARED_BASE}children%20-%20welcome%20page.mp4" autoplay playsinline
             style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
      </video>
    </div>`,
  choices: [],
  on_load: function() {
    document.getElementById('intro-maggie-video').addEventListener('ended', () => {
      setTimeout(() => jsPsych.finishTrial(), 1000);
    });
  },
  _debugLabel: 'Introducing Maggie (video)',
};

// Slide 1c – Locked layout: show the game board and introduce the two ways
const warmupLayoutLocked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "In our game, if you think anyone should be punished, you can decide how they lose their cookies.",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    // NOTE: this filename doesn't exist in children-shared files yet — the
    // old recording says "If you think anyone..." without "In our game,".
    // Needs a fresh recording of the updated line; the 'error' fallback
    // below keeps this locked screen from stalling until it's added.
    audio.src = `${SHARED_BASE}In our game, if you think anyone should be punished, you can decided how they lose their cookies.m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    const advance = () => {
      audio.remove();
      setTimeout(() => jsPsych.finishTrial(), 1000);
    };
    audio.addEventListener('ended', advance);
    audio.addEventListener('error', advance);
  },
};

// Slide 1d – Locked: two ways intro
const warmupLayoutTwoWays = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "They can lose cookies in two ways.",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}They can lose cookies in two ways..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => {
      audio.remove();
      setTimeout(() => jsPsych.finishTrial(), 1000);
    });
  },
};

// Slide 2a-intro – Way 1 explanation (locked)
const warmupWay1Locked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "<strong>First, you can punish them by giving their cookies to another person.</strong><br><br>You can take Michael's cookies and give them to Claire, or take Claire's cookies and give them to Michael.<br><br>Let's have Maggie try it out!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  auto_demo: true,
  demo_cookie_id: 0,
  demo_char_img: `${SHARED_BASE}maggie.png`,
  demo_char_name: 'Maggie',
  demo_text: "Watch me! I'll move one of Michael's cookies to Claire's plate! 🍪",
  demo_text_after: "Great! Now you try!",
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: `${SHARED_BASE}First, you can punish them by giving their cookies to another person..m4a`,
};

const warmupPracticeDemoMaggie = null; // merged into warmupWay1Locked

// Slide 2a – Practice: move Michael's cookie to Claire
const warmupPracticeV = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Now you try! Move one of Michael's cookies to Claire's plate.",
  require_v: true,
  require_trash: false,
  require_both: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}Now you try! Move one of Michael’s cookies to Claire’s plate.m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

// Slide 2b – Practice: move Claire's cookie to Michael
const warmupPracticeVtoP = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Now you try! Move one of Claire's cookies to Michael's plate.",
  require_v_to_p: true,
  allow_v_to_p: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}Now you try! Move one of Claire's cookies to Michael's plate..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

// Slide 2c-intro – Way 2 explanation (locked)
const warmupWay2Locked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "<strong>Second, you can punish them by putting cookies in the cookie jar.</strong><br><br>If they go in the cookie jar, nobody gets them.<br><br>Let's have Maggie try it out!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  auto_demo: true,
  demo_moves: [{ from: 'p', to: 'trash', cookie_id: 0 }],
  demo_char_img: `${SHARED_BASE}maggie.png`,
  demo_char_name: 'Maggie',
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: `${SHARED_BASE}Second, you can punish them by putting cookies in the cookie jar..m4a`,
};

// Slide 2c – Practice: move Michael's cookie to the Cookie Jar
const warmupPracticeTrash = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Now you try! Move one of Michael's cookies to the Cookie Jar.",
  require_v: false,
  require_trash: true,
  require_both: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}Now you try! Move one of Michael's cookies to the Cookie Jar..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

// Slide 2d – Practice: move Claire's cookie to the Cookie Jar
const warmupPracticeFromV = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Now you try! Move one of Claire's cookies to the Cookie Jar.",
  require_v: false,
  require_trash: false,
  require_both: false,
  require_from_v: true,
  allow_v_to_p: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}Now you try! Move one of Claire's cookies to the Cookie Jar..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

// Slide 2e-intro – Summary: both mechanics (locked)
const warmupPracticeSummary = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Ok, so in our game you can decide that someone should lose cookies — you can give them to another person or put them in the cookie jar. Let's have Maggie try it out!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  auto_demo: true,
  demo_moves: [{ from: 'p', to: 'v', cookie_id: 0 }, { from: 'p', to: 'trash', cookie_id: 1 }],
  demo_char_img: `${SHARED_BASE}maggie.png`,
  demo_char_name: 'Maggie',
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: `${SHARED_BASE}Ok, so in our game you can decide that someone should lose cookies.m4a`,
};

// Slide 2e – Practice: use both mechanics at once
const warmupPracticeBoth = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  character_order: CHARACTER_ORDER.join(','),
  harm_text: '',
  instruction_text: "Now you try! Take a cookie and give it to Claire, and take one and put it in the cookie jar.",
  require_v: false,
  require_trash: false,
  require_both: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
  corner_char_img: `${SHARED_BASE}maggie.png`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}Now you try! Take a cookie and give it to Claire, and take one and put it in the cookie jar..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

/* ----------------------------------------------------------
   TWO-SCALE FAULT WIDGET HELPERS
   Volume-bar style: narrow + see-through at 0, wide + full red
   at 100. Used by the warmup demo/practice pairs below.
   ---------------------------------------------------------- */
function twoScaleHTML(id, vName, pName, draggable, vImg, pImg, pFirst, unanswered) {
  const cls = draggable ? ' draggable' : '';
  const unansweredCls = unanswered ? ' two-scale-track-unanswered' : '';
  const vPortrait = vImg ? `<img src="${vImg}" class="two-scale-portrait" alt="${vName}">` : '';
  const pPortrait = pImg ? `<img src="${pImg}" class="two-scale-portrait" alt="${pName}">` : '';
  // Display order only — the track ids stay keyed to the true V/P role
  // below regardless of which side of the screen they're drawn on, so
  // fault_rating_v/fault_rating_p never depend on left/right placement.
  const vCol = `
      <div class="two-scale-col" id="${id}-v-col">
        ${vPortrait}
        <div class="two-scale-name">${vName}</div>
        <div class="two-scale-track${cls}${unansweredCls}" id="${id}-v-track">
          <div class="two-scale-track-bg"></div>
          <div class="two-scale-fill-wrap" id="${id}-v-wrap">
            <div class="two-scale-fill" id="${id}-v-fill"></div>
          </div>
          <div class="two-scale-track-mid"></div>
        </div>
      </div>`;
  const pCol = `
      <div class="two-scale-col" id="${id}-p-col">
        ${pPortrait}
        <div class="two-scale-name">${pName}</div>
        <div class="two-scale-track${cls}${unansweredCls}" id="${id}-p-track">
          <div class="two-scale-track-bg"></div>
          <div class="two-scale-fill-wrap" id="${id}-p-wrap">
            <div class="two-scale-fill" id="${id}-p-fill"></div>
          </div>
          <div class="two-scale-track-mid"></div>
        </div>
      </div>`;
  return `
    <div class="two-scale-row">${pFirst ? pCol + vCol : vCol + pCol}
    </div>`;
}

function setScaleValue(id, who, val) {
  const wrap = document.getElementById(`${id}-${who}-wrap`);
  const fill = document.getElementById(`${id}-${who}-fill`);
  if (!wrap || !fill) return;
  wrap.style.width = val + '%';
  fill.style.background = `rgba(217, 33, 33, ${Math.max(0, Math.min(1, val / 100))})`;
}

/** Brief pulsing ripple at a point, to show a click actually happened
 *  (used right when Maggie's cursor "presses" something). */
function showClickEffect(pt) {
  const ripple = document.createElement('div');
  ripple.className = 'two-scale-click-ripple';
  ripple.style.left = pt.x + 'px';
  ripple.style.top  = pt.y + 'px';
  document.body.appendChild(ripple);
  requestAnimationFrame(() => ripple.classList.add('animate'));
  setTimeout(() => ripple.remove(), 550);
}

/** Maggie walks in from her usual corner and demonstrates one target
 *  combination of the two bars, then the child clicks "Got it!". `visitPFirst`
 *  controls which bar she visits first — independent of on-screen layout,
 *  which always keeps Claire on the left and Michael on the right so the
 *  bars never appear to swap places between screens. If `afterText` is
 *  given, it replaces the rule text once Maggie's demonstration finishes,
 *  as a brief recap of what she just showed. */
function buildScaleDemoTrial(id, label, ruleText, targetV, targetP, visitPFirst, afterText, audioSrc, afterAudioSrc) {
  return {
    _debugLabel: `Warmup: Bar Demo — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div class="video-frame-domain">
        <img id="${id}-corner" src="${SHARED_BASE}maggie.png" class="corner-char-img" alt="">
      </div>
      <div id="${id}-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
        <img src="${SHARED_BASE}maggie.png" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
      </div>
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p id="${id}-text" style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.2;">${ruleText}</p>
        ${twoScaleHTML(id, 'Claire', 'Michael', false, CHAR_IMG_BASE + 'claire.png', CHAR_IMG_BASE + 'michael.png', P_BEFORE_V, true)}
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Got it!</button>
        </div>
      </div>`,
    on_load: function() {
      const cursor       = document.getElementById(`${id}-cursor`);
      const cornerStatic = document.getElementById(`${id}-corner`);
      const btn          = document.getElementById(`${id}-continue`);
      const textEl       = document.getElementById(`${id}-text`);
      const vTrack       = document.getElementById(`${id}-v-track`);
      const pTrack       = document.getElementById(`${id}-p-track`);

      const cr = cornerStatic.getBoundingClientRect();
      const cornerPos = { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };

      function trackPosAtVal(trackEl, val) {
        const r = trackEl.getBoundingClientRect();
        return { x: r.left + r.width * (val / 100), y: r.top + r.height / 2 };
      }
      function setCursorPos(pt) {
        cursor.style.left = (pt.x - window.innerWidth * 0.042) + 'px';
        cursor.style.top  = (pt.y - 70) + 'px';
      }
      setCursorPos(cornerPos);

      /** Flashes a brief ripple at the click point, so Maggie's click on the
       *  zero endpoint is visibly deliberate even though the bar itself
       *  doesn't change (0 -> 0), rather than looking like she just parked
       *  there without answering. */
      function showClickRipple(pt) {
        const ripple = document.createElement('div');
        ripple.className = 'two-scale-click-ripple';
        ripple.style.left = pt.x + 'px';
        ripple.style.top  = pt.y + 'px';
        document.body.appendChild(ripple);
        requestAnimationFrame(() => ripple.classList.add('animate'));
        setTimeout(() => ripple.remove(), 550);
      }

      function animateCursorTo(from, to, duration, onDone) {
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / duration);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setCursorPos({ x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased });
          if (t < 1) { requestAnimationFrame(step); } else { onDone(); }
        }
        requestAnimationFrame(step);
      }

      /** Animates the bar value while dragging Maggie's cursor along the
       *  track so she visibly tracks the current fill boundary, like a
       *  slider thumb, rather than sitting still at the track's center. */
      function animateBarValue(who, from, to, duration, trackEl, onDone) {
        trackEl.classList.add('answered');
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / duration);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const val = from + (to - from) * eased;
          setScaleValue(id, who, val);
          setCursorPos(trackPosAtVal(trackEl, val));
          if (t < 1) { requestAnimationFrame(step); } else { onDone(); }
        }
        requestAnimationFrame(step);
      }

      const firstKey    = visitPFirst ? 'p' : 'v';
      const secondKey   = visitPFirst ? 'v' : 'p';
      const firstTrack  = visitPFirst ? pTrack : vTrack;
      const secondTrack = visitPFirst ? vTrack : pTrack;
      const firstTarget  = visitPFirst ? targetP : targetV;
      const secondTarget = visitPFirst ? targetV : targetP;

      /** Maggie's walk-and-demonstrate animation. Runs once, when we're
       *  ready to show it (see below — gated on the rule audio finishing,
       *  not a blind delay from page load). */
      function runDemo() {
        setTimeout(() => {
          cornerStatic.style.visibility = 'hidden';
          cursor.style.visibility = 'visible';
          animateCursorTo(cornerPos, trackPosAtVal(firstTrack, 0), 900, () => {
            showClickRipple(trackPosAtVal(firstTrack, 0));
            setTimeout(() => {
              animateBarValue(firstKey, 0, firstTarget, 1100, firstTrack, () => {
                setTimeout(() => {
                  animateCursorTo(trackPosAtVal(firstTrack, firstTarget), trackPosAtVal(secondTrack, 0), 700, () => {
                    showClickRipple(trackPosAtVal(secondTrack, 0));
                    setTimeout(() => {
                      animateBarValue(secondKey, 0, secondTarget, 1100, secondTrack, () => {
                        setTimeout(() => {
                          animateCursorTo(trackPosAtVal(secondTrack, secondTarget), cornerPos, 900, () => {
                            cursor.style.visibility = 'hidden';
                            cornerStatic.style.visibility = 'visible';
                            btn.disabled = false;
                            btn.style.opacity = '1';
                            btn.style.cursor = 'pointer';
                          });
                        }, 400);
                      });
                    }, 300);
                  });
                }, 400);
              });
            }, 400);
          });
        }, 500);
      }

      /** Flips the caption to the recap line and starts its audio (if any),
       *  then runs Maggie's demo — so the demo is only on screen while the
       *  recap narration plays, not during the (longer) rule explanation. */
      function showRecapAndDemo() {
        if (afterText) { textEl.textContent = afterText; }
        if (afterAudioSrc) {
          const audio2 = document.createElement('audio');
          audio2.src = afterAudioSrc;
          audio2.style.display = 'none';
          document.body.appendChild(audio2);
          audio2.play().catch(() => {});
          audio2.addEventListener('ended', () => audio2.remove());
          audio2.addEventListener('error', () => audio2.remove());
        }
        runDemo();
      }

      if (audioSrc) {
        const audio = document.createElement('audio');
        audio.src = audioSrc;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.play().catch(() => {});
        const afterRuleAudio = () => { audio.remove(); showRecapAndDemo(); };
        audio.addEventListener('ended', afterRuleAudio);
        audio.addEventListener('error', afterRuleAudio);
      } else {
        showRecapAndDemo();
      }

      btn.addEventListener('click', () => jsPsych.finishTrial());
    },
  };
}

/** Child tries the same combination themselves; Continue stays disabled
 *  until both bars have been touched and validate(vVal, pVal) passes. */
function buildScalePracticeTrial(id, label, practiceText, validate, hintMsg, audioSrc) {
  return {
    _debugLabel: `Warmup: Bar Practice — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.2;">${practiceText}</p>
        ${twoScaleHTML(id, 'Claire', 'Michael', true, CHAR_IMG_BASE + 'claire.png', CHAR_IMG_BASE + 'michael.png', P_BEFORE_V, true)}
        <div id="${id}-hint" class="alloc-hint-hidden"></div>
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Continue</button>
        </div>
      </div>`,
    on_load: function() {
      if (audioSrc) {
        const audio = document.createElement('audio');
        audio.src = audioSrc;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.play().catch(() => {});
        audio.addEventListener('ended', () => audio.remove());
        audio.addEventListener('error', () => audio.remove());
      }
      let vVal = 0, pVal = 0, touchedV = false, touchedP = false, dragging = null;
      const vTrack = document.getElementById(`${id}-v-track`);
      const pTrack = document.getElementById(`${id}-p-track`);
      const btn    = document.getElementById(`${id}-continue`);
      const hintEl = document.getElementById(`${id}-hint`);

      function checkValid() {
        const ok = validate(vVal, pVal, touchedV, touchedP);
        btn.disabled = !ok;
        btn.style.opacity = ok ? '1' : '0.4';
        btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
        hintEl.textContent = ok ? '' : hintMsg;
        hintEl.className   = ok ? 'alloc-hint-hidden' : 'alloc-hint-visible';
      }

      function updateFromClientX(who, clientX) {
        const track = who === 'v' ? vTrack : pTrack;
        track.classList.add('answered');
        const r = track.getBoundingClientRect();
        const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
        const val = Math.round(pct * 100);
        setScaleValue(id, who, val);
        if (who === 'v') { vVal = val; touchedV = true; } else { pVal = val; touchedP = true; }
        checkValid();
      }

      function onPointerDownFactory(who) {
        return function(e) {
          dragging = who;
          updateFromClientX(who, e.clientX);
          e.preventDefault();
        };
      }
      function onPointerMove(e) {
        if (!dragging) return;
        updateFromClientX(dragging, e.clientX);
      }
      function onPointerUp() { dragging = null; }

      // Pointer events (not mouse-only) so mouse, touchscreen, and stylus
      // input all work identically for dragging the fault bars.
      vTrack.addEventListener('pointerdown', onPointerDownFactory('v'));
      pTrack.addEventListener('pointerdown', onPointerDownFactory('p'));
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);

      checkValid();

      btn.addEventListener('click', () => {
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        jsPsych.finishTrial();
      });
    },
  };
}

// Slide 2f-intro – introduces the two-bar concept (static, both bars at 0),
// matching the adult version exactly.
const barExistsIntro = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">In our game, each person has a bar. The bars show how much each person is at fault.</p>
      ${twoScaleHTML('bei', 'Claire', 'Michael', false, CHAR_IMG_BASE + 'claire.png', CHAR_IMG_BASE + 'michael.png', P_BEFORE_V)}
    </div>`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}In our game, each person has a bar. The bars show how much each person is at fault..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
    audio.addEventListener('error', () => audio.remove());
  },
  _debugLabel: 'Warmup: Bar Exists Intro',
};

function trackPosAtVal(trackEl, val) {
  const r = trackEl.getBoundingClientRect();
  return { x: r.left + r.width * (val / 100), y: r.top + r.height / 2 };
}
/** Sets up Maggie's corner-idle image + floating walking cursor for a
 *  "how to show..." concept screen, mirroring buildScaleDemoTrial's pattern.
 *  Returns helpers to walk her to a point, click, and send her home. */
function setupMaggieWalker(id) {
  const cursor       = document.getElementById(`${id}-cursor`);
  const cornerStatic = document.getElementById(`${id}-corner`);
  const cr = cornerStatic.getBoundingClientRect();
  const cornerPos = { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };

  function setCursorPos(pt) {
    cursor.style.left = (pt.x - window.innerWidth * 0.042) + 'px';
    cursor.style.top  = (pt.y - 70) + 'px';
  }
  setCursorPos(cornerPos);

  function animateCursorTo(from, to, duration, onDone) {
    const t0 = performance.now();
    function step(now) {
      const t = Math.min(1, (now - t0) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setCursorPos({ x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased });
      if (t < 1) { requestAnimationFrame(step); } else { onDone(); }
    }
    requestAnimationFrame(step);
  }

  function comeOut() {
    cornerStatic.style.visibility = 'hidden';
    cursor.style.visibility = 'visible';
  }
  function goHome(onDone) {
    animateCursorTo(cursor._lastPos || cornerPos, cornerPos, 900, () => {
      cursor.style.visibility = 'hidden';
      cornerStatic.style.visibility = 'visible';
      if (onDone) onDone();
    });
  }
  function walkTo(pt, duration, onDone) {
    animateCursorTo(cursor._lastPos || cornerPos, pt, duration, onDone);
    cursor._lastPos = pt;
  }

  return { cornerPos, comeOut, goHome, walkTo };
}

// Slide 2e-3 – explains how to show that someone IS at fault: click their
// bar to add some red, then click/move farther along to make it redder.
const howToShowAtFault = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div class="video-frame-domain">
      <img id="hsaf-corner" src="${SHARED_BASE}maggie.png" class="corner-char-img" alt="">
    </div>
    <div id="hsaf-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
      <img src="${SHARED_BASE}maggie.png" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
    </div>
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is at fault, click their bar to make it red. The more red in their bar, the more at fault they are.</p>
      ${twoScaleHTML('hsaf', 'Claire', 'Michael', false, CHAR_IMG_BASE + 'claire.png', CHAR_IMG_BASE + 'michael.png', P_BEFORE_V)}
    </div>`,
  on_load: function() {
    const nextBtn = document.querySelector('#jspsych-html-button-response-btngroup .jspsych-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
    }
    function enableNext() {
      if (!nextBtn) return;
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    }
    const vTrack = document.getElementById('hsaf-v-track');
    const maggie = setupMaggieWalker('hsaf');
    function animateFill(who, from, to, duration, onDone) {
      const t0 = performance.now();
      function step(now) {
        const t = Math.min(1, (now - t0) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setScaleValue('hsaf', who, from + (to - from) * eased);
        if (t < 1) { requestAnimationFrame(step); } else if (onDone) { onDone(); }
      }
      requestAnimationFrame(step);
    }
    // Recording is ~10.6s: "click their bar to make it red" comes first
    // (~35% through, by word count), then "the more red...the more at
    // fault they are" (~65% through).
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}If someone is at fault, click their bar to make it red. The more red in their bar, the more at fault they are..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
    audio.addEventListener('error', () => audio.remove());

    setTimeout(() => {
      maggie.comeOut();
      maggie.walkTo(trackPosAtVal(vTrack, 30), 700, () => {
        showClickEffect(trackPosAtVal(vTrack, 30));
        animateFill('v', 0, 30, 700, () => {
          setTimeout(() => {
            maggie.walkTo(trackPosAtVal(vTrack, 75), 700, () => {
              showClickEffect(trackPosAtVal(vTrack, 75));
              animateFill('v', 30, 75, 900, () => {
                setTimeout(() => maggie.goHome(enableNext), 400);
              });
            });
          }, 3000);
        });
      });
    }, 500);
  },
  _debugLabel: 'Warmup: How To Show At Fault',
};

// Slide 2e-4 – explains how to show that someone is NOT at fault at all: a
// deliberate click at the very beginning of the bar, which stays gray.
const howToShowNotAtFault = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div class="video-frame-domain">
      <img id="hsnaf-corner" src="${SHARED_BASE}maggie.png" class="corner-char-img" alt="">
    </div>
    <div id="hsnaf-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
      <img src="${SHARED_BASE}maggie.png" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
    </div>
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is not at fault at all, click the very beginning of their bar. Their bar will stay gray.</p>
      ${twoScaleHTML('hsnaf', 'Claire', 'Michael', false, CHAR_IMG_BASE + 'claire.png', CHAR_IMG_BASE + 'michael.png', P_BEFORE_V)}
    </div>`,
  on_load: function() {
    const nextBtn = document.querySelector('#jspsych-html-button-response-btngroup .jspsych-btn');
    if (nextBtn) {
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.4';
      nextBtn.style.cursor = 'not-allowed';
    }
    function enableNext() {
      if (!nextBtn) return;
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    }
    const vTrack = document.getElementById('hsnaf-v-track');
    const maggie = setupMaggieWalker('hsnaf');
    // The click demo is gated on this audio finishing, not a blind delay.
    const audio = document.createElement('audio');
    audio.src = `${SHARED_BASE}If someone is not at fault at all, click the very beginning of their bar. Their bar will stay gray..m4a`;
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    const showDemo = () => {
      audio.remove();
      maggie.comeOut();
      maggie.walkTo(trackPosAtVal(vTrack, 0), 700, () => {
        showClickEffect(trackPosAtVal(vTrack, 0));
        setTimeout(() => maggie.goHome(enableNext), 500);
      });
    };
    audio.addEventListener('ended', showDemo);
    audio.addEventListener('error', showDemo);
  },
  _debugLabel: 'Warmup: How To Show Not At Fault',
};

// Slide 2f – Maggie demonstrates five scenarios (Claire at fault only,
// Michael at fault only, Claire more at fault than Michael, both equally
// at fault, neither at fault), each followed by the child trying the same
// combination themselves, before the two-bar fault question first appears
// in a real trial (which now comes after allocation).
const scaleDemo1 = buildScaleDemoTrial(
  'sd1', 'Claire at fault only',
  "In our game, if Claire is at fault but Michael is not at fault, Claire's bar should have some red, and Michael's bar should stay gray. Let's see Maggie do it.",
  85, 0,
  false,
  undefined,
  `${SHARED_BASE}In our game, if Claire is at fault but Michael is not at fault,.m4a`
);
const scalePractice1 = buildScalePracticeTrial(
  'sp1', 'Claire at fault only',
  "Now you try! Show that Claire is at fault and Michael is not at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && v >= 40 && p <= 2,
  "⚠️ Show that Claire is at fault and Michael is not at fault.",
  `${SHARED_BASE}Now you try! Show that Claire is at fault and Michael is not at fault.m4a`
);

const scaleDemo2 = buildScaleDemoTrial(
  'sd2', 'Michael at fault only',
  "In our game, if Michael is at fault but Claire is not at fault, Michael's bar should have some red, and Claire's bar should stay gray. Let's see Maggie do it.",
  0, 85,
  false,
  undefined,
  `${SHARED_BASE}In our game, if Michael is at fault but Claire is not at fault,.m4a`
);
const scalePractice2 = buildScalePracticeTrial(
  'sp2', 'Michael at fault only',
  "Now you try! Show that Michael is at fault and Claire is not at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && p >= 40 && v <= 2,
  "⚠️ Show that Michael is at fault and Claire is not at fault.",
  `${SHARED_BASE}Now you try! Show that Michael is at fault and Claire is not at fault.m4a`
);

const scaleDemo3 = buildScaleDemoTrial(
  'sd3', 'Claire more at fault',
  "Sometimes both people can be at fault, but one person can be more at fault than the other. If Claire is more at fault than Michael, Claire's bar should have more red. Let's see Maggie do it.",
  70, 30,
  false,
  undefined,
  `${SHARED_BASE}Sometimes both people can be at fault, but one person can be more at fault than the other. If.m4a`
);
const scalePractice3 = buildScalePracticeTrial(
  'sp3', 'Claire more at fault',
  "Now you try! Give both Claire and Michael some fault, but make Claire's bigger.",
  (v, p, tv, tp) => tv && tp && v > p + 15 && p >= 15,
  "⚠️ Give both some fault, but make Claire's bar bigger than Michael's.",
  `${SHARED_BASE}Now you try! Give both Claire and Michael some fault, but make Claire's bigger.m4a`
);

const scaleDemo4 = buildScaleDemoTrial(
  'sd4', 'Equally at fault',
  "If Claire and Michael are equally at fault, their bars should have the same amount of red. Let's see Maggie do it.",
  55, 55,
  false,
  undefined,
  `${SHARED_BASE}If Claire and Michael are equally at fault,.m4a`
);
const scalePractice4 = buildScalePracticeTrial(
  'sp4', 'Equally at fault',
  "Now you try! Make Claire's and Michael's bars the same size.",
  // "Equally at fault" allows a small +/-2 margin.
  (v, p, tv, tp) => tv && tp && Math.abs(v - p) <= 2 && v >= 25,
  "⚠️ Make Claire's and Michael's bars exactly the same size.",
  `${SHARED_BASE}Now you try! Make Claire's and Michael's bars the same size.m4a`
);

const scaleDemo5 = buildScaleDemoTrial(
  'sd5', 'Neither at fault',
  "If neither Claire nor Michael is at fault, both bars should stay gray. Let's see Maggie do it.",
  0, 0,
  false,
  undefined,
  `${SHARED_BASE}If neither Claire nor Michael is at fault, both bars should stay gray..m4a`
);
const scalePractice5 = buildScalePracticeTrial(
  'sp5', 'Neither at fault',
  "Now you try! Show that neither Claire nor Michael is at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && v <= 2 && p <= 2,
  "⚠️ Show that neither Claire nor Michael is at fault.",
  `${SHARED_BASE}Now you try! Show that neither Claire nor Michael is at fault.m4a`
);

/** Renders one person's portrait + name + "Was X being careful?" with big
 *  green-check/red-cross buttons — the single-person warmup version of the
 *  real checker-question widget used in `buildCheckerTrial`. */
function checkerPersonHTML(id, name, imgUrl) {
  return `
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; margin:16px auto 0 auto;">
      <img src="${imgUrl}" alt="${name}" class="two-scale-portrait">
      <div class="two-scale-name">${name}</div>
      <p style="font-size:28px; font-weight:600; margin:8px 0 4px 0;">Was ${name} being careful?</p>
      <div style="display:flex; gap:24px;">
        <button id="${id}-yes-btn" type="button" class="jspsych-btn checker-btn checker-btn-yes"><span class="checker-icon">✓</span><span class="checker-label">Yes</span></button>
        <button id="${id}-no-btn" type="button" class="jspsych-btn checker-btn checker-btn-no"><span class="checker-icon">✗</span><span class="checker-label">No</span></button>
      </div>
    </div>`;
}

/** Maggie walks in and presses the target Yes/No button, then the child
 *  clicks "Got it!". Mirrors buildScaleDemoTrial's cursor-walk pattern. */
function buildCheckerDemoTrial(id, label, ruleText, name, imgUrl, targetAnswer, audioSrc, questionAudioSrc) {
  return {
    _debugLabel: `Warmup: Checker Demo — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div class="video-frame-domain">
        <img id="${id}-corner" src="${SHARED_BASE}maggie.png" class="corner-char-img" alt="">
      </div>
      <div id="${id}-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
        <img src="${SHARED_BASE}maggie.png" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
      </div>
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.2;">${ruleText}</p>
        ${checkerPersonHTML(id, name, imgUrl)}
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Got it!</button>
        </div>
      </div>`,
    on_load: function() {
      const cursor       = document.getElementById(`${id}-cursor`);
      const cornerStatic = document.getElementById(`${id}-corner`);
      const btn          = document.getElementById(`${id}-continue`);
      const targetBtn    = document.getElementById(`${id}-${targetAnswer}-btn`);

      const cr = cornerStatic.getBoundingClientRect();
      const cornerPos = { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };

      function btnPos(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }
      function setCursorPos(pt) {
        cursor.style.left = (pt.x - window.innerWidth * 0.042) + 'px';
        cursor.style.top  = (pt.y - 70) + 'px';
      }
      setCursorPos(cornerPos);

      function animateCursorTo(from, to, duration, onDone) {
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / duration);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          setCursorPos({ x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased });
          if (t < 1) { requestAnimationFrame(step); } else { onDone(); }
        }
        requestAnimationFrame(step);
      }

      /** Maggie's walk-to-button-and-click demo. Only shown once the rule
       *  audio has finished, in sync with the "Was [name] being careful?"
       *  clip (if any) rather than during the (longer) rule explanation. */
      function runDemo() {
        setTimeout(() => {
          cornerStatic.style.visibility = 'hidden';
          cursor.style.visibility = 'visible';
          animateCursorTo(cornerPos, btnPos(targetBtn), 900, () => {
            targetBtn.classList.add('checker-btn-pressed');
            setTimeout(() => {
              animateCursorTo(btnPos(targetBtn), cornerPos, 900, () => {
                cursor.style.visibility = 'hidden';
                cornerStatic.style.visibility = 'visible';
                targetBtn.classList.remove('checker-btn-pressed');
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
              });
            }, 700);
          });
        }, 500);
      }

      function showQuestionAndDemo() {
        if (questionAudioSrc) {
          const audio2 = document.createElement('audio');
          audio2.src = questionAudioSrc;
          audio2.style.display = 'none';
          document.body.appendChild(audio2);
          audio2.play().catch(() => {});
          audio2.addEventListener('ended', () => audio2.remove());
          audio2.addEventListener('error', () => audio2.remove());
        }
        runDemo();
      }

      if (audioSrc) {
        const audio = document.createElement('audio');
        audio.src = audioSrc;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.play().catch(() => {});
        const afterRuleAudio = () => { audio.remove(); showQuestionAndDemo(); };
        audio.addEventListener('ended', afterRuleAudio);
        audio.addEventListener('error', afterRuleAudio);
      } else {
        showQuestionAndDemo();
      }

      btn.addEventListener('click', () => jsPsych.finishTrial());
    },
  };
}

/** Child tries clicking Yes/No themselves; Continue stays disabled until
 *  they click the correct button (matching what Maggie just demonstrated). */
function buildCheckerPracticeTrial(id, label, practiceText, name, imgUrl, correctAnswer, hintMsg, audioSrc) {
  return {
    _debugLabel: `Warmup: Checker Practice — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.2;">${practiceText}</p>
        ${checkerPersonHTML(id, name, imgUrl)}
        <div id="${id}-hint" class="alloc-hint-hidden"></div>
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Continue</button>
        </div>
      </div>`,
    on_load: function() {
      if (audioSrc) {
        const audio = document.createElement('audio');
        audio.src = audioSrc;
        audio.style.display = 'none';
        document.body.appendChild(audio);
        audio.play().catch(() => {});
        audio.addEventListener('ended', () => audio.remove());
        audio.addEventListener('error', () => audio.remove());
      }
      const yesBtn = document.getElementById(`${id}-yes-btn`);
      const noBtn  = document.getElementById(`${id}-no-btn`);
      const btn    = document.getElementById(`${id}-continue`);
      const hintEl = document.getElementById(`${id}-hint`);
      let picked = null;

      function checkValid() {
        const ok = picked === correctAnswer;
        btn.disabled = !ok;
        btn.style.opacity = ok ? '1' : '0.4';
        btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
        hintEl.textContent = (picked && !ok) ? hintMsg : '';
        hintEl.className   = (picked && !ok) ? 'alloc-hint-visible' : 'alloc-hint-hidden';
      }

      yesBtn.addEventListener('click', () => {
        picked = 'yes';
        yesBtn.classList.add('checker-btn-pressed');
        noBtn.classList.remove('checker-btn-pressed');
        checkValid();
      });
      noBtn.addEventListener('click', () => {
        picked = 'no';
        noBtn.classList.add('checker-btn-pressed');
        yesBtn.classList.remove('checker-btn-pressed');
        checkValid();
      });

      btn.addEventListener('click', () => jsPsych.finishTrial());
    },
  };
}

// Whichever of Claire/Michael is shown first (per P_BEFORE_V, same order
// used for the cookie warmup) gets the scene-setting "In our game..."
// framing; the other gets the "Now let's think about..." continuation, so
// the narration always matches whichever demo plays first.
const checkerYesRuleText = P_BEFORE_V
  ? "Now let's think about Claire. If you think Claire was careful, click the green yes mark. Let's watch Maggie try it."
  : "In our game, you can also decide if Claire and Michael were careful. If you think Claire was careful, click the green yes mark. Let's watch Maggie try it.";
const checkerYesRuleAudio = P_BEFORE_V
  ? `${SHARED_BASE}Now let's think about Claire. If you think Claire was careful, click the green yes mark.m4a`
  : `${SHARED_BASE}In our game, you can also decide if Claire and Michael were careful. If you think Claire w.m4a`;
const checkerNoRuleText = P_BEFORE_V
  ? "In our game, you can also decide if Michael and Claire were careful. If you think Michael was not careful, click the red no mark. Let's watch Maggie try it."
  : "Now let's think about Michael. If you think Michael was not careful, click the red no mark. Let's watch Maggie try it.";
const checkerNoRuleAudio = P_BEFORE_V
  ? `${SHARED_BASE}In our game, you can also decide if Michael and Claire were careful. If you think Michael was not careful, click the red no mark.m4a`
  : `${SHARED_BASE}Now let's think about Michael. If you think Michael was not careful, click the red no mark.m4a`;

const checkerDemoYes = buildCheckerDemoTrial(
  'cd1', 'Yes (careful)',
  checkerYesRuleText,
  'Claire', CHAR_IMG_BASE + 'claire.png', 'yes',
  checkerYesRuleAudio,
  `${SHARED_BASE}Was Claire being careful%3F.m4a`
);
const checkerPracticeYes = buildCheckerPracticeTrial(
  'cp1', 'Yes (careful)',
  "Now you try! Click the green yes mark for Claire.",
  'Claire', CHAR_IMG_BASE + 'claire.png', 'yes',
  '⚠️ Click the green checkmark for Yes.',
  `${SHARED_BASE}Now you try! Click the green yes mark for Claire.m4a`
);

const checkerDemoNo = buildCheckerDemoTrial(
  'cd2', 'No (not careful)',
  checkerNoRuleText,
  'Michael', CHAR_IMG_BASE + 'michael.png', 'no',
  checkerNoRuleAudio,
  `${SHARED_BASE}Was Michael being careful%3F.m4a`
);
const checkerPracticeNo = buildCheckerPracticeTrial(
  'cp2', 'No (not careful)',
  "Now you try! Click the red no mark for Michael.",
  'Michael', CHAR_IMG_BASE + 'michael.png', 'no',
  '⚠️ Click the red cross for No.',
  `${SHARED_BASE}Now you try! Click the red no mark for Michael.m4a`
);

// Whichever character is on the left (per CHARACTER_ORDER) is asked about
// first here too, matching the real checker trials.
const checkerWarmupBlock = P_BEFORE_V
  ? [checkerDemoNo, checkerPracticeNo, checkerDemoYes, checkerPracticeYes]
  : [checkerDemoYes, checkerPracticeYes, checkerDemoNo, checkerPracticeNo];

// Slide 3 – Practice confirmation
const warmupFinishVideo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="warmup-finish-video" src="${SHARED_BASE}warmup_finish.mp4" autoplay playsinline
             style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
      </video>
    </div>`,
  choices: [],
  on_load: function() {
    document.getElementById('warmup-finish-video').addEventListener('ended', () => {
      setTimeout(() => jsPsych.finishTrial(), 1000);
    });
  },
  _debugLabel: 'Warmup finish (video)',
};

const testCaseIntroVideo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="test-case-intro-video" src="${SHARED_BASE}test_case_intro.mp4" autoplay playsinline
             style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
      </video>
    </div>`,
  choices: ['Next'],
  on_load: function() {
    const nextBtn = document.querySelector('.jspsych-btn');
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.4';
    nextBtn.style.cursor = 'not-allowed';
    document.getElementById('test-case-intro-video').addEventListener('ended', () => {
      nextBtn.disabled = false;
      nextBtn.style.opacity = '1';
      nextBtn.style.cursor = 'pointer';
    });
  },
  _debugLabel: 'Test case intro (video)',
};

/* ----------------------------------------------------------
   FAULT QUESTION TRIAL BUILDER (slider variant)
   Shown after the story video, before the punishment/allocation screen.
   Children drag a slider between P's portrait and V's portrait, with
   the story's own outcome image ("together") at the midpoint. Downward
   arrows tie each picture to the point on the scale it represents.
   Recorded on the same 0/50/100 scale as the adult fault-rating slider
   (100 = P fully at fault, 0 = V fully at fault) so the two experiments
   stay comparable.
   ---------------------------------------------------------- */
function buildFaultQuestionTrial(scenario) {
  const pName = scenario.p_name || 'Finn';
  const vName = scenario.v_name || 'Cleo';
  const pImg  = scenario.p_img  || 'finn_neutral.png';
  const vImg  = scenario.v_img  || 'cleo_neutral.png';
  const togetherImg = scenario.story_slides[scenario.story_slides.length - 1];
  const id = `fq${scenario.id}`;

  return {
    _debugLabel: `${pName} & ${vName} — Fault Question`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:8px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <img src="${togetherImg}" style="max-width:984px; width:100%; max-height:min(24vh, 180px); object-fit:contain; border-radius:8px; margin-bottom:7px;">
        <p style="font-size:24px; font-weight:600; margin:0 0 12px 0;">Now that you saw what happened, how much do you think each person is at fault?</p>
        ${twoScaleHTML(id, vName, pName, true, CHAR_IMG_BASE + vImg, CHAR_IMG_BASE + pImg, P_BEFORE_V, true)}
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Continue</button>
        </div>
      </div>`,
    scenario_id: scenario.id,
    is_practice: false,
    data: { scenario_id: scenario.id, is_practice: false, is_fault_rating: true, p_name: pName, v_name: vName },
    on_load: function() {
      const startTime = performance.now();
      let vVal = 0, pVal = 0, touchedV = false, touchedP = false, dragging = null;
      const vTrack = document.getElementById(`${id}-v-track`);
      const pTrack = document.getElementById(`${id}-p-track`);
      const btn    = document.getElementById(`${id}-continue`);

      const questionAudio = document.createElement('audio');
      questionAudio.src = `${SHARED_BASE}Now that you saw what happened, how much do you think each person is at fault%3F.m4a`;
      questionAudio.style.display = 'none';
      document.body.appendChild(questionAudio);
      questionAudio.play().catch(() => {});
      questionAudio.addEventListener('ended', () => questionAudio.remove());
      questionAudio.addEventListener('error', () => questionAudio.remove());

      function checkValid() {
        const ok = touchedV && touchedP;
        btn.disabled = !ok;
        btn.style.opacity = ok ? '1' : '0.4';
        btn.style.cursor  = ok ? 'pointer' : 'not-allowed';
      }

      function updateFromClientX(who, clientX) {
        const track = who === 'v' ? vTrack : pTrack;
        track.classList.add('answered');
        const r = track.getBoundingClientRect();
        const pct = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
        const val = Math.round(pct * 100);
        setScaleValue(id, who, val);
        if (who === 'v') { vVal = val; touchedV = true; } else { pVal = val; touchedP = true; }
        checkValid();
      }

      function onPointerDownFactory(who) {
        return function(e) {
          dragging = who;
          updateFromClientX(who, e.clientX);
          e.preventDefault();
        };
      }
      function onPointerMove(e) {
        if (!dragging) return;
        updateFromClientX(dragging, e.clientX);
      }
      function onPointerUp() { dragging = null; }

      // Pointer events (not mouse-only) so mouse, touchscreen, and stylus
      // input all work identically for dragging the fault bars.
      vTrack.addEventListener('pointerdown', onPointerDownFactory('v'));
      pTrack.addEventListener('pointerdown', onPointerDownFactory('p'));
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
      document.addEventListener('pointercancel', onPointerUp);
      checkValid();

      btn.addEventListener('click', () => {
        questionAudio.pause();
        questionAudio.remove();
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
        document.removeEventListener('pointercancel', onPointerUp);
        jsPsych.finishTrial({
          fault_rating_v: vVal,
          fault_rating_p: pVal,
          rt: Math.round(performance.now() - startTime),
        });
      });
    },
  };
}

/* ----------------------------------------------------------
   CHECKER QUESTION
   Manipulation check to rule out that participants read strict-
   liability scenarios as also involving carelessness on P's part.
   Shown after the fault question. Always shows the ending picture
   (the scenario's last story slide) as the visual reminder.
   ---------------------------------------------------------- */
/** One carefulness question, about either the actor (targetRole 'p') or
 *  the victim (targetRole 'v'). Two of these — order randomized per
 *  scenario — are shown so both characters get asked about. */
function buildCheckerTrial(scenario, targetRole) {
  const pName = scenario.p_name || 'Finn';
  const vName = scenario.v_name || 'Cleo';
  const targetName = targetRole === 'p' ? pName : vName;
  const endingImg = scenario.story_slides[scenario.story_slides.length - 1];
  const id = `ck${scenario.id}${targetRole}`;

  return {
    _debugLabel: `${pName} & ${vName} — Checker Question (${targetName})`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 52px 0 52px; max-width:1118px; margin:0 auto;">
        <img src="${endingImg}" style="max-width:1066px; width:100%; max-height:min(39vh, 312px); object-fit:contain; border-radius:8px; margin-bottom:18px;">
        <p style="font-size:31px; font-weight:600;">Was ${targetName} being careful?</p>
        <div style="display:flex; justify-content:center; gap:24px; margin-top:14px;">
          <button id="${id}-yes-btn" type="button" class="jspsych-btn checker-btn checker-btn-yes"><span class="checker-icon">✓</span><span class="checker-label">Yes</span></button>
          <button id="${id}-no-btn" type="button" class="jspsych-btn checker-btn checker-btn-no"><span class="checker-icon">✗</span><span class="checker-label">No</span></button>
        </div>
      </div>`,
    scenario_id: scenario.id,
    is_practice: false,
    data: {
      is_checker_question: true,
      is_practice: false,
      scenario_id: scenario.id,
      harm_type: scenario.harm_type,
      checker_target_role: targetRole,
      p_name: pName,
      v_name: vName,
    },
    on_load: function() {
      const startTime = performance.now();
      const yesBtn = document.getElementById(`${id}-yes-btn`);
      const noBtn  = document.getElementById(`${id}-no-btn`);

      // "Was [Name] being careful?" — one recording per character, matching
      // the on-screen question exactly (not the generic Yes/No reminder).
      const questionAudio = document.createElement('audio');
      questionAudio.src = `${SHARED_BASE}Was ${targetName} being careful%3F.m4a`;
      questionAudio.style.display = 'none';
      document.body.appendChild(questionAudio);
      questionAudio.play().catch(() => {});
      questionAudio.addEventListener('ended', () => questionAudio.remove());
      questionAudio.addEventListener('error', () => questionAudio.remove());
      function stopAudio() {
        questionAudio.pause();
        questionAudio.remove();
      }

      function pick(key, btn) {
        stopAudio();
        yesBtn.disabled = true;
        noBtn.disabled  = true;
        btn.classList.add('checker-btn-pressed');
        setTimeout(() => {
          jsPsych.finishTrial({
            checker_response: key,
            checker_target_role: targetRole,
            rt: Math.round(performance.now() - startTime),
          });
        }, 400);
      }

      yesBtn.addEventListener('click', () => pick('careful', yesBtn));
      noBtn.addEventListener('click',  () => pick('not_careful', noBtn));
    },
  };
}

/* ----------------------------------------------------------
   TEST TRIAL BUILDER
   ---------------------------------------------------------- */
function buildTestTrial(scenario, scenarioIdx, total) {
  const pName  = scenario.p_name  || 'Finn';
  const vName  = scenario.v_name  || 'Cleo';
  const pImg   = scenario.p_img   || 'finn_neutral.png';
  const vImg   = scenario.v_img   || 'cleo_neutral.png';
  const pAfter = scenario.p_after !== undefined ? scenario.p_after : scenario.p_cookies;
  const pGained = pAfter - scenario.p_cookies; // > 0 means P gained cookies

  const trialLabel = `${pName} & ${vName}`;

  // Story slide – video
  const _storyVideo = scenario.story_video;
  const storySlide = {
    _debugLabel: `${trialLabel} — Story`,
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
        <video id="story-video" src="${_storyVideo}" autoplay playsinline
               style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
        </video>
      </div>`,
    choices: [],
    on_start: function() { updateProgressBar(scenarioIdx, total); },
    on_load: function() {
      document.getElementById('story-video').addEventListener('ended', () => {
        setTimeout(() => jsPsych.finishTrial(), 1000);
      });
    },
  };

  // Fault question — shown after the story, before punishment/allocation
  const faultQuestionSlide = buildFaultQuestionTrial(scenario);

  // Allocation screen with gate question integrated
  const headerImg = scenario.story_slides[scenario.story_slides.length - 1];
  const slideG = {
    _debugLabel: `${trialLabel} — Allocation`,
    type: jsPsychAllocation,
    p_cookies: pAfter,
    v_cookies_current: scenario.v_after_harm,
    hud_p_cookies: scenario.p_cookies,
    hud_v_cookies: scenario.v_initial,
    character_order: CHARACTER_ORDER.join(','),
    header_img: headerImg,
    harm_text: '',
    instruction_text: '',
    p_name: pName, v_name: vName, p_img: pImg, v_img: vImg,
    require_v: false,
    require_trash: false,
    require_both: false,
    is_practice: false,
    scenario_id: scenario.id,
    harm_type: scenario.harm_type,
    event_title: scenario.event_title || '',
    show_gate_question: true,
    on_load: function() {
      const audio = document.createElement('audio');
      audio.src = `${SHARED_BASE}Allocation screen question.m4a`;
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audio.play().catch(() => {});
      audio.addEventListener('ended', () => audio.remove());
      const stopAudio = () => { audio.pause(); audio.remove(); };
      document.getElementById('gate-yes')?.addEventListener('click', stopAudio);
      document.getElementById('gate-no')?.addEventListener('click', stopAudio);
    },
  };

  // Ask about both characters' carefulness, order randomized per scenario
  // rather than always asking about the actor first.
  const actorFirst = sessionGet('exp2_children_vgo0_checker_order_' + scenario.id, () => Math.random() < 0.5);
  const checkerTrials = actorFirst
    ? [buildCheckerTrial(scenario, 'p'), buildCheckerTrial(scenario, 'v')]
    : [buildCheckerTrial(scenario, 'v'), buildCheckerTrial(scenario, 'p')];

  const trials = [storySlide, slideG, faultQuestionSlide, ...checkerTrials];
  return trials;
}

/* ----------------------------------------------------------
   PROGRESS BAR HELPER
   ---------------------------------------------------------- */
function updateProgressBar(scenarioIdx, total) {
  let container = document.getElementById('scenario-progress-container');
  if (!container) {
    // jsPsych may have cleared the body — recreate the bar
    container = document.createElement('div');
    container.id = 'scenario-progress-container';
    container.innerHTML = `
      <div id="scenario-progress-track">
        <div id="scenario-progress-fill"></div>
      </div>`;
    document.body.appendChild(container);
    console.warn('[progress] container was missing — recreated');
  }
  const pct = ((scenarioIdx + 1) / total * 100).toFixed(1);
  container.style.display = 'block';
  document.getElementById('scenario-progress-fill').style.width = pct + '%';
}

/* ----------------------------------------------------------
   BUILD FULL TIMELINE
   ---------------------------------------------------------- */

// Warmup block
const warmupBlock = [
  welcomeScreen,
  introMaggieVideo,
  warmupLayoutLocked,
  warmupLayoutTwoWays,
  warmupWay1Locked,
  warmupPracticeV,
  warmupPracticeVtoP,
  warmupWay2Locked,
  warmupPracticeTrash,
  warmupPracticeFromV,
  warmupPracticeSummary,
  warmupPracticeBoth,
  barExistsIntro,
  howToShowAtFault,
  howToShowNotAtFault,
  scaleDemo1, scalePractice1,
  scaleDemo2, scalePractice2,
  scaleDemo3, scalePractice3,
  scaleDemo4, scalePractice4,
  scaleDemo5, scalePractice5,
  ...checkerWarmupBlock,
  warmupFinishVideo,
  testCaseIntroVideo,
];

// All scenarios combined — fully randomized per participant (stable across jump-reloads)
const allScenarios = [...finnCleoScenarios, ...secondBlockScenarios];
const shuffledAll = sessionGet('exp2_children_vgo0_shuffle_all',
  () => jsPsych.randomization.shuffle(allScenarios.map((_, i) => i))
).map(i => allScenarios[i]);
const totalTrials = shuffledAll.length;
const testBlock = [];
shuffledAll.forEach((scenario, idx) => {
  buildTestTrial(scenario, idx, totalTrials).forEach(t => testBlock.push(t));
});

/* ----------------------------------------------------------
   DEMOGRAPHIC & FEEDBACK SCREENS
   ---------------------------------------------------------- */
const demographicsScreen = {
  type: jsPsychHtmlButtonResponse,
  // choices: [] means jsPsych renders NO button and registers NO click handler.
  // Our own Submit button is embedded in the stimulus and calls jsPsych.finishTrial()
  // directly, bypassing jsPsych's event system entirely.
  choices: [],
  stimulus: `
    <div style="max-width:680px; margin:0 auto; padding:40px 30px; font-family:sans-serif; color:#333; font-size:15px; text-align:left;">
      <p style="text-align:center; font-weight:bold; font-size:17px; margin-bottom:28px;">Demographic information:</p>

      <table style="width:100%; border-collapse:collapse; line-height:2;">

        <!-- Age -->
        <tr>
          <td style="padding:10px 24px 10px 0; vertical-align:middle; white-space:nowrap;">1. Age:</td>
          <td style="padding:10px 0; vertical-align:middle;">
            <input type="number" id="demo-age" min="18" max="120"
              style="width:70px; padding:3px 7px; font-size:15px; border:1px solid #999; border-radius:3px;">
          </td>
        </tr>

        <!-- Gender -->
        <tr>
          <td style="padding:10px 24px 10px 0; vertical-align:top; white-space:nowrap;">2. Gender:</td>
          <td style="padding:10px 0;">
            <div style="margin-bottom:6px;">
              <label style="margin-right:18px; cursor:pointer;"><input type="radio" name="gender" value="Female" style="margin-right:5px;">Female</label>
              <label style="margin-right:18px; cursor:pointer;"><input type="radio" name="gender" value="Male" style="margin-right:5px;">Male</label>
              <label style="cursor:pointer;"><input type="radio" name="gender" value="Non-binary" style="margin-right:5px;">Non-binary</label>
            </div>
            <div>
              <label style="cursor:pointer;">
                <input type="radio" name="gender" value="__other__" style="margin-right:5px;">Other:
                <input type="text" id="gender-other" style="margin-left:6px; padding:2px 7px; font-size:14px; border:1px solid #999; border-radius:3px; width:180px;">
              </label>
            </div>
          </td>
        </tr>

        <!-- Race -->
        <tr>
          <td style="padding:10px 24px 10px 0; vertical-align:top; white-space:nowrap;">3. Race:</td>
          <td style="padding:10px 0;">
            ${['White','Black/African American','American Indian/Alaska Native','Asian',
               'Native Hawaiian/Pacific Islander','Multiracial/Mixed']
              .map(r => `<div><label style="cursor:pointer;"><input type="radio" name="race" value="${r}" style="margin-right:5px;">${r}</label></div>`).join('')}
            <div>
              <label style="cursor:pointer;">
                <input type="radio" name="race" value="__other__" style="margin-right:5px;">Other:
                <input type="text" id="race-other" style="margin-left:6px; padding:2px 7px; font-size:14px; border:1px solid #999; border-radius:3px; width:180px;">
              </label>
            </div>
          </td>
        </tr>

        <!-- Ethnicity -->
        <tr>
          <td style="padding:10px 24px 10px 0; vertical-align:middle; white-space:nowrap;">4. Ethnicity:</td>
          <td style="padding:10px 0;">
            <label style="margin-right:18px; cursor:pointer;"><input type="radio" name="ethnicity" value="Hispanic" style="margin-right:5px;">Hispanic</label>
            <label style="cursor:pointer;"><input type="radio" name="ethnicity" value="Non-Hispanic" style="margin-right:5px;">Non-Hispanic</label>
          </td>
        </tr>

      </table>

      <p style="margin-top:28px; font-size:15px;">Please press <strong>Submit</strong> to complete the experiment.</p>
      <p id="demo-error" style="color:#cc0000; font-size:14px; margin-top:8px; display:none; font-weight:500;">Please answer all questions before submitting.</p>
      <div style="text-align:center; margin-top:16px;">
        <button id="demo-submit-btn" class="jspsych-btn" style="padding:8px 28px; font-size:15px; cursor:pointer;">Submit</button>
      </div>
    </div>`,
  on_load: function() {
    const startTime = performance.now();
    document.getElementById('demo-submit-btn').addEventListener('click', function() {
      const age       = document.getElementById('demo-age')?.value?.trim();
      const genderEl  = document.querySelector('input[name="gender"]:checked');
      const raceEl    = document.querySelector('input[name="race"]:checked');
      const ethnicEl  = document.querySelector('input[name="ethnicity"]:checked');
      const errEl     = document.getElementById('demo-error');
      if (!age || !genderEl || !raceEl || !ethnicEl) {
        if (errEl) errEl.style.display = 'block';
        return;
      }
      if (errEl) errEl.style.display = 'none';
      const gender    = genderEl.value === '__other__'
        ? 'Other: ' + (document.getElementById('gender-other')?.value || '')
        : genderEl.value;
      const race      = raceEl.value === '__other__'
        ? 'Other: ' + (document.getElementById('race-other')?.value || '')
        : raceEl.value;
      jsPsych.finishTrial({
        rt:        Math.round(performance.now() - startTime),
        age:       age,
        gender:    gender,
        race:      race,
        ethnicity: ethnicEl.value,
      });
    });
  },
  data: { is_demographic: true, is_practice: false },
  _debugLabel: 'Demographics',
};

// Final screen
const studyEndVideo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="study-end-video" src="${SHARED_BASE}overall_study_end.mp4" autoplay playsinline
             style="max-width:1150px; width:100%; max-height:82vh; border-radius:8px;">
      </video>
    </div>`,
  choices: ['Finish'],
  on_load: function() {
    const finishBtn = document.querySelector('.jspsych-btn');
    finishBtn.disabled = true;
    finishBtn.style.opacity = '0.4';
    finishBtn.style.cursor = 'not-allowed';
    document.getElementById('study-end-video').addEventListener('ended', () => {
      finishBtn.disabled = false;
      finishBtn.style.opacity = '1';
      finishBtn.style.cursor = 'pointer';
    });
  },
};

const endScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align:center; padding:80px 40px; font-family:sans-serif;">
      <h2 style="font-size:36px; font-weight:400; color:#333;">Thank you!</h2>
      <p style="font-size:20px; color:#666; margin-top:20px;">
        You have completed all scenarios.
      </p>
    </div>`,
  choices: ['Finish'],
};

/* ----------------------------------------------------------
   DEBUG LABELS (read by researcher panel — harmless in production)
   ---------------------------------------------------------- */
consentScreen._debugLabel   = 'Consent Form';
welcomeScreen._debugLabel   = 'Welcome Screen';
introMaggieVideo._debugLabel = 'Introducing Maggie (video)';
warmupLayoutLocked._debugLabel    = 'Warmup: Layout (locked)';
warmupLayoutTwoWays._debugLabel   = 'Warmup: Two Ways (locked)';
warmupWay1Locked._debugLabel      = 'Warmup: Way 1 + Maggie Demo';
warmupPracticeV._debugLabel       = 'Warmup: Practice (Michael→Claire)';
warmupPracticeVtoP._debugLabel    = 'Warmup: Practice (Claire→Michael)';
warmupWay2Locked._debugLabel      = 'Warmup: Way 2 (locked)';
warmupPracticeTrash._debugLabel   = 'Warmup: Practice (Michael→Jar)';
warmupPracticeFromV._debugLabel   = 'Warmup: Practice (Claire→Jar)';
warmupPracticeSummary._debugLabel = 'Warmup: Summary (locked)';
warmupPracticeBoth._debugLabel    = 'Warmup: Practice (Both)';
warmupFinishVideo._debugLabel     = 'Warmup: Finish (video)';
testCaseIntroVideo._debugLabel    = 'Test Case Intro (video)';
demographicsScreen._debugLabel = 'Demographics';
studyEndVideo._debugLabel      = 'Study End (video)';

endScreen._debugLabel          = 'End Screen';

/* ----------------------------------------------------------
   RUN
   ---------------------------------------------------------- */
const timeline = [
  consentScreen,
  ...warmupBlock,
  ...testBlock,
  demographicsScreen,
  studyEndVideo,
  endScreen,
];

/* ============================================================
   RESEARCHER DEBUG PANEL — JUMP TO ANY SCREEN
   Hidden by default for public / participant deployment.
   To reveal it (researcher use only), set SHOW_DEBUG_PANEL = true.
   ============================================================ */
const SHOW_DEBUG_PANEL = false;  // ← change to true to show the Jump-to-Screen panel

(function () {
  // Public deployment: panel stays hidden — just run the experiment normally.
  if (!SHOW_DEBUG_PANEL) {
    jsPsych.run(timeline);
    return;
  }

  const DATA_KEY = 'exp2_children_vgo0_debug_data';

  // Read jump target from URL param (?jumpTo=N)
  const params  = new URLSearchParams(window.location.search);
  const jumpTo  = parseInt(params.get('jumpTo') || '0');

  // Restore any data saved from previous jump sessions so accumulated
  // trial responses survive page reloads.
  const savedData = sessionStorage.getItem(DATA_KEY);
  if (savedData) {
    try {
      JSON.parse(savedData).forEach(row => jsPsych.data.write(row));
    } catch(e) { /* ignore corrupt cache */ }
  }

  // Build dropdown: one option per timeline slide
  const options = timeline.map((trial, i) => {
    const label = trial._debugLabel || `Slide ${i}`;
    const sel   = i === jumpTo ? ' selected' : '';
    return `<option value="${i}"${sel}>${i}: ${label}</option>`;
  }).join('');

  // Two-scale warmup screens (intro + the 4 demo/practice pairs) get their
  // own quick-jump tab so researchers don't have to hunt for them in the
  // full slide dropdown while iterating on that flow specifically.
  const scaleIndices = timeline
    .map((trial, i) => ({ i, label: trial._debugLabel || '' }))
    .filter(({ label }) => /^Warmup: (Bar Exists Intro|Bar (Demo|Practice)|Checker (Demo|Practice))/.test(label));
  const scaleButtons = scaleIndices.map(({ i, label }) =>
    `<button class="rdp-scale-jump" data-idx="${i}">${label.replace(/^Warmup: /, '')}</button>`
  ).join('');

  const POSITION_LABELS = { P: 'P', V: 'V', TRASH: 'Cookie Jar' };
  const positionLine = CHARACTER_ORDER.map(k => POSITION_LABELS[k]).join(' — ');

  const panel = document.createElement('div');
  panel.id = 'researcher-debug-panel';
  panel.innerHTML = `
    <div id="rdp-title">🔬 Researcher: Jump to Screen</div>
    <div id="rdp-position">Position: ${positionLine}</div>
    <div id="rdp-tabs">
      <button id="rdp-tab-btn-all" class="rdp-tab-btn active">All Screens</button>
      <button id="rdp-tab-btn-scale" class="rdp-tab-btn">Two-Bar Warmup</button>
    </div>
    <div id="rdp-tab-all" class="rdp-tab-panel">
      <select id="rdp-select">${options}</select>
      <button id="rdp-jump">▶ Jump</button>
    </div>
    <div id="rdp-tab-scale" class="rdp-tab-panel" style="display:none;">
      ${scaleButtons}
    </div>
    <button id="rdp-reroll" title="Draw a new random P/V/Cookie Jar position">🎲 Re-roll position</button>
    <button id="rdp-reroll-study" title="Randomly reassign this participant to children v-above-0 or v-goes-to-0">🔀 Re-roll study</button>
    <button id="rdp-clear" title="Clear saved trial data">🗑 Clear data</button>
  `;
  document.body.appendChild(panel);

  function jumpTo_(idx) {
    // Save current data before reloading so it survives the jump.
    sessionStorage.setItem(DATA_KEY, jsPsych.data.get().json());
    window.location.search = '?jumpTo=' + idx;
  }

  document.getElementById('rdp-jump').addEventListener('click', () => {
    jumpTo_(document.getElementById('rdp-select').value);
  });

  document.querySelectorAll('.rdp-scale-jump').forEach(btn => {
    btn.addEventListener('click', () => jumpTo_(btn.dataset.idx));
  });

  document.getElementById('rdp-tab-btn-all').addEventListener('click', () => {
    document.getElementById('rdp-tab-all').style.display = '';
    document.getElementById('rdp-tab-scale').style.display = 'none';
    document.getElementById('rdp-tab-btn-all').classList.add('active');
    document.getElementById('rdp-tab-btn-scale').classList.remove('active');
  });
  document.getElementById('rdp-tab-btn-scale').addEventListener('click', () => {
    document.getElementById('rdp-tab-all').style.display = 'none';
    document.getElementById('rdp-tab-scale').style.display = '';
    document.getElementById('rdp-tab-btn-all').classList.remove('active');
    document.getElementById('rdp-tab-btn-scale').classList.add('active');
  });

  document.getElementById('rdp-reroll').addEventListener('click', () => {
    // Drop the stored P/V/Cookie Jar order so the next load draws a fresh
    // one, but keep the current screen (jumpTo) and saved trial data.
    sessionStorage.removeItem('exp2_children_vgo0_char_order');
    location.reload();
  });

  document.getElementById('rdp-reroll-study').addEventListener('click', () => {
    // Same between-subjects random assignment a fresh visitor would get,
    // then jumps straight to the chosen study's own index.html (dropping
    // jumpTo — that only makes sense for the study we're currently on).
    const newCondition = Math.random() < 0.5 ? 'above' : 'zero';
    sessionStorage.setItem('exp2_children_outcome_condition', newCondition);
    const folder = newCondition === 'above' ? 'children- v above 0 (slider)' : 'children- v goes to 0 (slider)';
    const params = new URLSearchParams(window.location.search);
    params.delete('jumpTo');
    const qs = params.toString();
    window.location.href = '../' + encodeURIComponent(folder) + '/index.html' + (qs ? '?' + qs : '');
  });

  document.getElementById('rdp-clear').addEventListener('click', () => {
    sessionStorage.removeItem(DATA_KEY);
    location.reload();
  });

  // Start experiment from the selected slide
  jsPsych.run(jumpTo > 0 ? timeline.slice(jumpTo) : timeline);
})();
/* *** END OF RESEARCHER DEBUG BLOCK *** */
