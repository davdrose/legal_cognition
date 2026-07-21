/* ============================================================
   CAUSE & FAULT EXPERIMENT 1
   jsPsych 7 – Cookie Allocation Task
   ============================================================ */

/* ----------------------------------------------------------
   INITIALIZE jsPsych
   ---------------------------------------------------------- */
var participantConsented = false;
var _demoData = {}; // captured before jsPsych clears the display

const jsPsych = initJsPsych({
  display_element: 'jspsych-target',
  show_progress_bar: true,
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
    // The fault question, checker question, and allocation screen are
    // separate jsPsych trials (so they can be shown as separate screens),
    // but they share a scenario_id — merge them into a single row per
    // scenario before submitting.
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

const TRASH_ON_LEFT = sessionGet('exp1_trash', () => Math.random() < 0.5);

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
        <img src="img/${imgFile}" class="char-img intro-img" alt="${name}">
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
        <img src="img/${pImg}" class="char-img" alt="${pName}">
        <p class="person-name">${pName}</p>
        ${showSlots   ? `<div class="cookie-label">${pLabel}</div>${cookieGridHTML(pCookies, 5, 'large', animate)}` : ''}
        ${showCookies ? `<div class="cookie-label">${pLabel}</div>${freeCookiesHTML(pCookies, animate)}` : ''}
      </div>
      <div class="person-col">
        <img src="img/${vImg}" class="char-img" alt="${vName}">
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
   ---------------------------------------------------------- */
// Finn & Cleo scenarios (randomized block)
const finnCleoScenarios = [
  {
    id: 2,
    p_name: 'Finn', v_name: 'Cleo', p_img: 'finn_neutral.png', v_img: 'cleo_neutral.png',
    harm_type: 'negligent',
    p_cookies: 5, p_after: 5,
    v_initial: 5, v_after_harm: 3, harm_amount: 2,
    event_text: 'Finn spills water and doesn\'t clean it up. Cleo slips on the wet floor and 2 of Cleo\'s cookies are destroyed.',
    event_title: 'Finn Spills Water — Cleo Slips',
    story_slides: ['img/trailppt/finn_cleo/finn_cleo_1.png','img/trailppt/finn_cleo/finn_cleo_2.png','img/trailppt/finn_cleo/finn_cleo_3.png','img/trailppt/finn_cleo/finn_cleo_4.png','img/trailppt/finn_cleo/finn_cleo_5.png','img/trailppt/finn_cleo/finn_cleo_6.png','img/trailppt/finn_cleo/finn_cleo_7.png','img/trailppt/finn_cleo/finn_cleo_8.png','img/trailppt/finn_cleo/finn_cleo_9.png','img/trailppt/finn_cleo/finn_cleo_10.png','img/trailppt/finn_cleo/finn_cleo_11.png']
  }
];

// Second block — always after Finn & Cleo, randomized among themselves
const secondBlockScenarios = [
  {
    id: 5,
    p_name: 'Milo', v_name: 'Sasha', p_img: 'Milo.png', v_img: 'Sasha.png',
    harm_type: 'intentional',
    p_cookies: 5, p_after: 5,
    v_initial: 5, v_after_harm: 3, harm_amount: 2,
    event_text: 'Milo is angry at Sasha. He walks over and deliberately knocks off 2 of Sasha\'s cookies.',
    event_title: 'Milo Knocks Sasha\'s Cookies',
    story_slides: ['img/trailppt/milo_sasha/milo_sasha_1.png','img/trailppt/milo_sasha/milo_sasha_2.png','img/trailppt/milo_sasha/milo_sasha_3.png','img/trailppt/milo_sasha/milo_sasha_4.png','img/trailppt/milo_sasha/milo_sasha_5.png','img/trailppt/milo_sasha/milo_sasha_6.png','img/trailppt/milo_sasha/milo_sasha_7.png','img/trailppt/milo_sasha/milo_sasha_8.png']
  },
  {
    id: 6,
    p_name: 'Zoe', v_name: 'Rex', p_img: 'zoe.png', v_img: 'rex.png',
    harm_type: 'intentional',
    p_cookies: 7, p_after: 7,
    v_initial: 7, v_after_harm: 5, harm_amount: 2,
    event_text: 'Zoe wants Rex to have fewer cookies. She deliberately throws away 2 of Rex\'s cookies.',
    event_title: 'Zoe Throws Rex\'s Cookies Away',
    story_slides: ['img/trailppt/rex_zoe/rex_zoe_1.png','img/trailppt/rex_zoe/rex_zoe_2.png','img/trailppt/rex_zoe/rex_zoe_3.png','img/trailppt/rex_zoe/rex_zoe_4.png','img/trailppt/rex_zoe/rex_zoe_5.png','img/trailppt/rex_zoe/rex_zoe_6.png','img/trailppt/rex_zoe/rex_zoe_7.png']
  },
  {
    id: 7,
    p_name: 'Kai', v_name: 'Ruby', p_img: 'kai.png', v_img: 'Ruby.png',
    harm_type: 'negligent',
    p_cookies: 7, p_after: 7,
    v_initial: 7, v_after_harm: 5, harm_amount: 2,
    event_text: 'Kai walks without looking where he is going and bumps into Ruby. 2 of Ruby\'s cookies fall off.',
    event_title: 'Kai Bumps Into Ruby',
    story_slides: ['img/trailppt/kai_ruby/kai_ruby_1.png','img/trailppt/kai_ruby/kai_ruby_2.png','img/trailppt/kai_ruby/kai_ruby_3.png','img/trailppt/kai_ruby/kai_ruby_4.png','img/trailppt/kai_ruby/kai_ruby_5.png','img/trailppt/kai_ruby/kai_ruby_6.png','img/trailppt/kai_ruby/kai_ruby_7.png','img/trailppt/kai_ruby/kai_ruby_8.png','img/trailppt/kai_ruby/kai_ruby_9.png']
  },
  {
    id: 8,
    p_name: 'Sam', v_name: 'Ella', p_img: 'sam.png', v_img: 'ella.png',
    harm_type: 'strict_liability',
    p_cookies: 5, p_after: 5,
    v_initial: 5, v_after_harm: 3, harm_amount: 2,
    event_text: 'Sam is walking his dog on a leash when the dog breaks free and eats 2 of Ella\'s cookies.',
    event_title: 'Sam\'s Dog Eats Ella\'s Cookies',
    story_slides: ['img/trailppt/sam_ella/sam_ella_1.png','img/trailppt/sam_ella/sam_ella_2.png','img/trailppt/sam_ella/sam_ella_3.png','img/trailppt/sam_ella/sam_ella_4.png','img/trailppt/sam_ella/sam_ella_5.png','img/trailppt/sam_ella/sam_ella_6.png','img/trailppt/sam_ella/sam_ella_7.png','img/trailppt/sam_ella/sam_ella_8.png','img/trailppt/sam_ella/sam_ella_9.png']
  },
  {
    id: 9,
    p_name: 'Catherine', v_name: 'Andy', p_img: 'catherine.png', v_img: 'andy.png',
    harm_type: 'strict_liability',
    p_cookies: 7, p_after: 7,
    v_initial: 7, v_after_harm: 5, harm_amount: 2,
    event_text: 'Andy and Catherine bumped into each other accidentally. Catherine\'s wolf ate 2 of Andy\'s cookies.',
    event_title: 'Catherine\'s Wolf Eats Andy\'s Cookies',
    story_slides: ['img/trailppt/andy_catherine/andy_catherine_1.png','img/trailppt/andy_catherine/andy_catherine_2.png','img/trailppt/andy_catherine/andy_catherine_3.png','img/trailppt/andy_catherine/andy_catherine_4.png','img/trailppt/andy_catherine/andy_catherine_5.png','img/trailppt/andy_catherine/andy_catherine_6.png','img/trailppt/andy_catherine/andy_catherine_7.png','img/trailppt/andy_catherine/andy_catherine_8.png']
  },
  {
    id: 10,
    p_name: 'Tony', v_name: 'Katie', p_img: 'tony.png', v_img: 'katie.png',
    harm_type: 'control',
    p_cookies: 5, p_after: 5,
    v_initial: 5, v_after_harm: 3, harm_amount: 2,
    event_text: 'Katie and Tony are having a picnic when a gust of wind blows 2 of Katie\'s cookies away.',
    event_title: 'Wind Blows Away Katie\'s Cookies',
    story_slides: ['img/trailppt/harry_katie/harry_katie_1.png','img/trailppt/harry_katie/harry_katie_2.png','img/trailppt/harry_katie/harry_katie_3.png','img/trailppt/harry_katie/harry_katie_4.png','img/trailppt/harry_katie/harry_katie_5.png','img/trailppt/harry_katie/harry_katie_6.png','img/trailppt/harry_katie/harry_katie_7.png','img/trailppt/harry_katie/harry_katie_8.png']
  },
  {
    id: 11,
    p_name: 'Nora', v_name: 'Eric', p_img: 'nora.png', v_img: 'eric.png',
    harm_type: 'control',
    p_cookies: 7, p_after: 7,
    v_initial: 7, v_after_harm: 5, harm_amount: 2,
    event_text: 'While Eric is tying his shoelaces, a squirrel eats 2 of Eric\'s cookies.',
    event_title: 'Squirrel Eats Eric\'s Cookies',
    story_slides: ['img/trailppt/nora_eric/nora_eric_1.png','img/trailppt/nora_eric/nora_eric_2.png','img/trailppt/nora_eric/nora_eric_3.png','img/trailppt/nora_eric/nora_eric_4.png','img/trailppt/nora_eric/nora_eric_5.png','img/trailppt/nora_eric/nora_eric_6.png','img/trailppt/nora_eric/nora_eric_7.png']
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
      <p style="margin:0 0 14px 0;">Thank you for agreeing to take part in this study. We appreciate your time and effort. In this study, we will present you with a fictional scenario, and then we will ask you to answer a brief series of questions about that scenario. The questions have no right or wrong answers-- we're just exploring features of human psychology in this research. You will be paid $2.00 for your time and efforts (based on a rate of $8 per hour for this approximately 15-minute study). We do not anticipate any risks from participating in this research. While you will not directly benefit from taking part in this research study, we hope society and the scientific community will benefit from the knowledge gained about human psychology and judgment.</p>
      <p style="margin:0 0 14px 0;">Your involvement should take about 15 minutes. Your participation is voluntary and you can stop at any time. If you consent to take part in this survey, please indicate so below, and then click the arrow to advance. If not, simply close your browser window.</p>
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
    <div style="text-align:center; padding:60px 40px; max-width:700px; margin:0 auto; font-family:sans-serif; color:#333;">
      <p style="font-size:22px; line-height:1.6;">
        Welcome! In this game, you will watch two characters interact.
        Your job is to decide how to move their cookies around.
        Let's practice first!
      </p>
    </div>`,
  choices: ['Next'],
};

// Slide 1a – Introduce Michael
const warmupIntroFinn = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align:center; padding:30px 20px;">
      <p class="slide-instruction">This is Michael</p>
      <img src="img/michael.png" class="char-img intro-img" alt="Michael" style="margin:20px auto; display:block;">
      <p class="slide-instruction" style="margin-top:16px;">Michael has 3 cookies</p>
      <div style="display:flex; justify-content:center; margin-top:10px;">
        ${freeCookiesHTML(3, false)}
      </div>
    </div>`,
  choices: ['Next'],
};

// Slide 1b – Introduce Claire
const warmupIntroCleo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align:center; padding:30px 20px;">
      <p class="slide-instruction">This is Claire</p>
      <img src="img/claire.png" class="char-img intro-img" alt="Claire" style="margin:20px auto; display:block;">
      <p class="slide-instruction" style="margin-top:16px;">Claire has 3 cookies</p>
      <div style="display:flex; justify-content:center; margin-top:10px;">
        ${freeCookiesHTML(3, false)}
      </div>
    </div>`,
  choices: ['Next'],
};

// Slide 1c – Locked layout: show the game board and introduce the two ways
const warmupLayoutLocked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "In our game, if you think anyone should be punished, you can decide how they lose their cookies.",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 1d – Locked: two ways intro
const warmupLayoutTwoWays = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "They can lose cookies in two ways.",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2a-intro – Way 1 explanation (locked)
const warmupWay1Locked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "<strong>First, you can punish them by giving their cookies to another person.</strong><br><br>You can take Michael's cookies and give them to Claire, or take Claire's cookies and give them to Michael.<br><br>Let's try it out!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2a – Practice: move Michael's cookie to Claire
const warmupPracticeV = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Move one of Michael's cookies to Claire's plate.",
  require_v: true,
  require_trash: false,
  require_both: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2b – Practice: move Claire's cookie to Michael
const warmupPracticeVtoP = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Now move one of Claire's cookies to Michael's plate.",
  require_v_to_p: true,
  allow_v_to_p: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2c-intro – Way 2 explanation (locked)
const warmupWay2Locked = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "<strong>Second, you can punish them by putting cookies in the cookie jar.</strong><br><br>If they go in the cookie jar, nobody gets them.<br>Let's try it out!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2c – Practice: move Michael's cookie to the Cookie Jar
const warmupPracticeTrash = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Move one of Michael's cookies to the Cookie Jar.",
  require_v: false,
  require_trash: true,
  require_both: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2d – Practice: move Claire's cookie to the Cookie Jar
const warmupPracticeFromV = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Now move one of Claire's cookies to the Cookie Jar.",
  require_v: false,
  require_trash: false,
  require_both: false,
  require_from_v: true,
  allow_v_to_p: false,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2e-intro – Summary: both mechanics (locked)
const warmupPracticeSummary = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Ok, so in our game you can decide that someone should lose cookies — you can give them to another person or put them in the cookie jar. Let's do both!",
  locked: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

// Slide 2e – Practice: use both mechanics at once
const warmupPracticeBoth = {
  type: jsPsychAllocation,
  p_cookies: 3,
  v_cookies_current: 3,
  hud_p_cookies: 3,
  hud_v_cookies: 3,
  trash_on_left: TRASH_ON_LEFT,
  harm_text: '',
  instruction_text: "Take a cookie and give it to Claire, and take one and put it in the cookie jar.",
  require_v: false,
  require_trash: false,
  require_both: true,
  is_practice: true,
  scenario_id: 0,
  p_name: 'Michael', v_name: 'Claire',
  p_img: 'michael.png', v_img: 'claire.png',
};

/* ----------------------------------------------------------
   TWO-BAR FAULT WIDGET — shared helpers
   Ported from experiment2 children (slider variant). Static/no-mascot
   here: demos just show the example bar values directly, and practice
   is the same drag-to-set-value interaction as the children version.
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
        <div class="two-scale-pct" id="${id}-v-pct" style="font-size:14px; color:#555; min-height:18px; margin-top:4px;"></div>
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
        <div class="two-scale-pct" id="${id}-p-pct" style="font-size:14px; color:#555; min-height:18px; margin-top:4px;"></div>
      </div>`;
  return `
    <div class="two-scale-row">${pFirst ? pCol + vCol : vCol + pCol}
    </div>`;
}

/** Shows the numeric percentage next to a bar once the participant has
 *  actually clicked/dragged it — not called during the animated warmup
 *  demos, so it only appears in response to a real interaction. */
function showScalePercent(id, who, val) {
  const pctEl = document.getElementById(`${id}-${who}-pct`);
  if (pctEl) pctEl.textContent = `${val}%`;
}

/* ----------------------------------------------------------
   CURSOR ICON — demonstrates clicks/drags on the warmup screens
   (no mascot for adults, so a plain pointer icon stands in for
   "here's where you'd click/drag").
   ---------------------------------------------------------- */
function cursorImgHTML(prefix) {
  return `<img id="${prefix}-cursor" src="img/cursor.png" alt="" style="position:fixed; width:26px; visibility:hidden; pointer-events:none; z-index:5;">`;
}
function setCursorPos(prefix, pt) {
  const el = document.getElementById(`${prefix}-cursor`);
  if (!el) return;
  el.style.visibility = 'visible';
  el.style.left = (pt.x - 4) + 'px';
  el.style.top  = (pt.y - 3) + 'px';
}
function hideCursor(prefix) {
  const el = document.getElementById(`${prefix}-cursor`);
  if (el) el.style.visibility = 'hidden';
}
/** Slides the cursor icon from one point to another (simulates dragging),
 *  then calls onDone. If from and to are the same point, it just appears
 *  there (simulates a single click, e.g. at the zero end of a bar). */
function animateCursorTo(prefix, from, to, duration, onDone) {
  const t0 = performance.now();
  function step(now) {
    const t = Math.min(1, (now - t0) / duration);
    const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    setCursorPos(prefix, { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased });
    if (t < 1) { requestAnimationFrame(step); } else if (onDone) { onDone(); }
  }
  requestAnimationFrame(step);
}

/** Brief pulsing ripple at a point, to show a click actually happened
 *  (used right when the cursor icon "presses" something). */
function showClickEffect(pt) {
  const ripple = document.createElement('div');
  ripple.className = 'two-scale-click-ripple';
  ripple.style.left = pt.x + 'px';
  ripple.style.top  = pt.y + 'px';
  document.body.appendChild(ripple);
  requestAnimationFrame(() => ripple.classList.add('animate'));
  setTimeout(() => ripple.remove(), 550);
}

function setScaleValue(id, who, val) {
  const wrap = document.getElementById(`${id}-${who}-wrap`);
  const fill = document.getElementById(`${id}-${who}-fill`);
  if (!wrap || !fill) return;
  wrap.style.width = val + '%';
  fill.style.background = `rgba(217, 33, 33, ${Math.max(0, Math.min(1, val / 100))})`;
}

/** Animated example: fills both bars from empty up to their target values
 *  (no mascot — just the bars animating), with the explanatory rule text
 *  above, and a Next button. */
function buildScaleDemoTrial(id, label, ruleText, targetV, targetP) {
  return {
    _debugLabel: `Warmup: Bar Demo — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: ['Next'],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">${ruleText}</p>
        ${twoScaleHTML(id, 'Claire', 'Michael', false, 'img/claire.png', 'img/michael.png')}
        ${cursorImgHTML(id)}
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
      const vTrack = document.getElementById(`${id}-v-track`);
      const pTrack = document.getElementById(`${id}-p-track`);
      function trackPosAtVal(trackEl, val) {
        const r = trackEl.getBoundingClientRect();
        return { x: r.left + r.width * (val / 100), y: r.top + r.height / 2 };
      }
      // Drags the cursor along the track in sync with the fill — when the
      // target is 0 this is a no-op motion, so the cursor just sits at the
      // zero point (a click, not a drag), matching how the same value would
      // really be set.
      function animateFillWithCursor(who, trackEl, to, duration, onDone) {
        const t0 = performance.now();
        function step(now) {
          const t = Math.min(1, (now - t0) / duration);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          const val = to * eased;
          setScaleValue(id, who, val);
          setCursorPos(id, trackPosAtVal(trackEl, val));
          if (t < 1) { requestAnimationFrame(step); } else if (onDone) { onDone(); }
        }
        requestAnimationFrame(step);
      }
      setTimeout(() => {
        setCursorPos(id, trackPosAtVal(vTrack, 0));
        showClickEffect(trackPosAtVal(vTrack, 0));
        setTimeout(() => {
          animateFillWithCursor('v', vTrack, targetV, 1000, () => {
            setTimeout(() => {
              setCursorPos(id, trackPosAtVal(pTrack, 0));
              showClickEffect(trackPosAtVal(pTrack, 0));
              setTimeout(() => {
                animateFillWithCursor('p', pTrack, targetP, 1000, () => {
                  setTimeout(() => { hideCursor(id); enableNext(); }, 600);
                });
              }, 300);
            }, 300);
          });
        }, 200);
      }, 400);
    },
  };
}

/** Participant drags both bars themselves; Continue stays disabled until
 *  both have been touched and validate(vVal, pVal) passes. */
function buildScalePracticeTrial(id, label, practiceText, validate, hintMsg) {
  return {
    _debugLabel: `Warmup: Bar Practice — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">${practiceText}</p>
        ${twoScaleHTML(id, 'Claire', 'Michael', true, 'img/claire.png', 'img/michael.png', false, true)}
        <div id="${id}-hint" class="alloc-hint-hidden"></div>
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Continue</button>
        </div>
      </div>`,
    on_load: function() {
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
        showScalePercent(id, who, val);
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

// Slide 2f-intro – introduces the two-bar concept (static, both bars at 0)
const barExistsIntro = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">In our game, each person has a bar. The bars show how much each person is at fault.</p>
      ${twoScaleHTML('bei', 'Claire', 'Michael', false, 'img/claire.png', 'img/michael.png')}
    </div>`,
  _debugLabel: 'Warmup: Bar Exists Intro',
};


// Explains how to show that someone IS at fault: click their bar to add
// red, then click/move farther along to make it redder.
const howToShowAtFault = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is at fault, click their bar to make it red. The more red in their bar, the more at fault they are.</p>
      ${twoScaleHTML('hsaf', 'Claire', 'Michael', false, 'img/claire.png', 'img/michael.png')}
      ${cursorImgHTML('hsaf')}
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
    function trackPosAtVal(trackEl, val) {
      const r = trackEl.getBoundingClientRect();
      return { x: r.left + r.width * (val / 100), y: r.top + r.height / 2 };
    }
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
    const vTrack = document.getElementById('hsaf-v-track');
    setTimeout(() => {
      setCursorPos('hsaf', trackPosAtVal(vTrack, 30));
      showClickEffect(trackPosAtVal(vTrack, 30));
      animateFill('v', 0, 30, 700, () => {
        setTimeout(() => {
          setCursorPos('hsaf', trackPosAtVal(vTrack, 75));
          showClickEffect(trackPosAtVal(vTrack, 75));
          animateFill('v', 30, 75, 900, () => {
            setTimeout(() => { hideCursor('hsaf'); enableNext(); }, 600);
          });
        }, 500);
      });
    }, 500);
  },
  _debugLabel: 'Warmup: How To Show At Fault',
};

// Explains how to show that someone is NOT at fault at all: a deliberate
// click at the very beginning of the bar, which stays gray.
const howToShowNotAtFault = {
  type: jsPsychHtmlButtonResponse,
  choices: ['Next'],
  stimulus: `
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is not at fault at all, click the very beginning of their bar. Their bar will stay gray.</p>
      ${twoScaleHTML('hsnaf', 'Claire', 'Michael', false, 'img/claire.png', 'img/michael.png')}
      ${cursorImgHTML('hsnaf')}
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
    function trackPosAtVal(trackEl, val) {
      const r = trackEl.getBoundingClientRect();
      return { x: r.left + r.width * (val / 100), y: r.top + r.height / 2 };
    }
    const vTrack = document.getElementById('hsnaf-v-track');
    setTimeout(() => {
      setCursorPos('hsnaf', trackPosAtVal(vTrack, 0));
      showClickEffect(trackPosAtVal(vTrack, 0));
      setTimeout(() => { hideCursor('hsnaf'); enableNext(); }, 900);
    }, 500);
  },
  _debugLabel: 'Warmup: How To Show Not At Fault',
};

const scaleDemo1 = buildScaleDemoTrial(
  'sd1', 'Claire at fault only',
  "In our game, if Claire is at fault but Michael is not at fault, Claire's bar should have some red, and Michael's bar should stay gray. Here's an example.",
  85, 0
);
const scalePractice1 = buildScalePracticeTrial(
  'sp1', 'Claire at fault only',
  "Now you try! Show that Claire is at fault and Michael is not at fault.",
  // "Not at fault" means exactly 0 — no tolerance.
  (v, p, tv, tp) => tv && tp && v >= 40 && p === 0,
  "⚠️ Show that Claire is at fault and Michael is not at fault."
);

const scaleDemo2 = buildScaleDemoTrial(
  'sd2', 'Michael at fault only',
  "In our game, if Michael is at fault but Claire is not at fault, Michael's bar should have some red, and Claire's bar should stay gray. Here's an example.",
  0, 85
);
const scalePractice2 = buildScalePracticeTrial(
  'sp2', 'Michael at fault only',
  "Now you try! Show that Michael is at fault and Claire is not at fault.",
  // "Not at fault" means exactly 0 — no tolerance.
  (v, p, tv, tp) => tv && tp && p >= 40 && v === 0,
  "⚠️ Show that Michael is at fault and Claire is not at fault."
);

const scaleDemo3 = buildScaleDemoTrial(
  'sd3', 'Claire more at fault',
  "Sometimes both people can be at fault, but one person can be more at fault than the other. If Claire is more at fault than Michael, Claire's bar should have more red. Here's an example.",
  70, 30
);
const scalePractice3 = buildScalePracticeTrial(
  'sp3', 'Claire more at fault',
  "Now you try! Give both Claire and Michael some fault, but make Claire's bigger.",
  (v, p, tv, tp) => tv && tp && v > p + 15 && p >= 15,
  "⚠️ Give both some fault, but make Claire's bar bigger than Michael's."
);

const scaleDemo4 = buildScaleDemoTrial(
  'sd4', 'Equally at fault',
  "If Claire and Michael are equally at fault, their bars should have the same amount of red. Here's an example.",
  55, 55
);
const scalePractice4 = buildScalePracticeTrial(
  'sp4', 'Equally at fault',
  "Now you try! Make Claire's and Michael's bars the same size.",
  // "Equally at fault" means exactly equal — no tolerance.
  (v, p, tv, tp) => tv && tp && v === p && v >= 25,
  "⚠️ Make Claire's and Michael's bars exactly the same size."
);

const scaleDemo5 = buildScaleDemoTrial(
  'sd5', 'Neither at fault',
  "If neither Claire nor Michael is at fault, both bars should stay gray. Here's an example.",
  0, 0
);
const scalePractice5 = buildScalePracticeTrial(
  'sp5', 'Neither at fault',
  "Now you try! Show that neither Claire nor Michael is at fault.",
  // "Not at fault" means exactly 0 — no tolerance.
  (v, p, tv, tp) => tv && tp && v === 0 && p === 0,
  "⚠️ Show that neither Claire nor Michael is at fault."
);

/* ----------------------------------------------------------
   CHECKER-QUESTION WARMUP — shared helpers
   ---------------------------------------------------------- */
function checkerPersonHTML(id, name, imgUrl) {
  return `
    <div style="display:flex; flex-direction:column; align-items:center; gap:8px; margin:16px auto 0 auto;">
      <img src="${imgUrl}" alt="${name}" class="two-scale-portrait">
      <div class="two-scale-name">${name}</div>
      <p style="font-size:22px; font-weight:600; margin:8px 0 4px 0;">Was ${name} being careful?</p>
      <div style="display:flex; gap:24px;">
        <button id="${id}-yes-btn" type="button" class="jspsych-btn checker-btn checker-btn-yes"><span class="checker-icon">✓</span><span class="checker-label">Yes</span></button>
        <button id="${id}-no-btn" type="button" class="jspsych-btn checker-btn checker-btn-no"><span class="checker-icon">✗</span><span class="checker-label">No</span></button>
      </div>
    </div>`;
}

/** Static example: the example answer is shown already selected (yellow),
 *  with a Next button. */
function buildCheckerDemoTrial(id, label, ruleText, name, imgUrl, exampleAnswer) {
  return {
    _debugLabel: `Warmup: Checker Demo — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: ['Next'],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">${ruleText}</p>
        ${checkerPersonHTML(id, name, imgUrl)}
        ${cursorImgHTML(id)}
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
      const btnEl = document.getElementById(`${id}-${exampleAnswer}-btn`);
      const r = btnEl.getBoundingClientRect();
      const target = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      const start  = { x: target.x, y: target.y - 60 };
      setTimeout(() => {
        setCursorPos(id, start);
        animateCursorTo(id, start, target, 500, () => {
          showClickEffect(target);
          btnEl.classList.add('checker-btn-pressed');
          setTimeout(() => { hideCursor(id); enableNext(); }, 700);
        });
      }, 400);
    },
  };
}

/** Participant clicks Yes/No themselves; Continue stays disabled until
 *  they click the correct button (matching the example just shown). */
function buildCheckerPracticeTrial(id, label, practiceText, name, imgUrl, correctAnswer, hintMsg) {
  return {
    _debugLabel: `Warmup: Checker Practice — ${label}`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p style="font-size:20px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">${practiceText}</p>
        ${checkerPersonHTML(id, name, imgUrl)}
        <div id="${id}-hint" class="alloc-hint-hidden"></div>
        <div style="margin-top:14px;">
          <button id="${id}-continue" class="jspsych-btn" disabled style="opacity:0.4; cursor:not-allowed;">Continue</button>
        </div>
      </div>`,
    on_load: function() {
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

const checkerDemoYes = buildCheckerDemoTrial(
  'cd1', 'Yes (careful)',
  "In our game, you can also decide if Claire and Michael were careful. If you think Claire was careful, you would click the green yes mark. Here's an example.",
  'Claire', 'img/claire.png', 'yes'
);
const checkerPracticeYes = buildCheckerPracticeTrial(
  'cp1', 'Yes (careful)',
  "Now you try! Click the green yes mark for Claire.",
  'Claire', 'img/claire.png', 'yes',
  '⚠️ Click the green checkmark for Yes.'
);

const checkerDemoNo = buildCheckerDemoTrial(
  'cd2', 'No (not careful)',
  "Now think about Michael. If you think Michael was not careful, you would click the red no mark. Here's an example.",
  'Michael', 'img/michael.png', 'no'
);
const checkerPracticeNo = buildCheckerPracticeTrial(
  'cp2', 'No (not careful)',
  "Now you try! Click the red no mark for Michael.",
  'Michael', 'img/michael.png', 'no',
  '⚠️ Click the red cross for No.'
);

// Slide 3 – Practice confirmation
const warmupDone = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="text-align:center; padding:80px 40px; max-width:700px; margin:0 auto;">
      <p class="slide-instruction">Good job!</p>
      <p style="font-size:20px; margin-top:20px; color:#555; font-family:sans-serif;">
        You're now ready to begin. Click Next when you're ready to start.
      </p>
    </div>`,
  choices: ['Next'],
};

/* ----------------------------------------------------------
   FAULT QUESTION TRIAL BUILDER (two-bar widget)
   Shown after the punishment/allocation screen. Each of V and P has
   an independent unipolar bar (0-100) — see twoScaleHTML above.
   ---------------------------------------------------------- */
function buildFaultQuestionTrial(scenario, headerImg) {
  const pName = scenario.p_name || 'Finn';
  const vName = scenario.v_name || 'Cleo';
  const pImg  = scenario.p_img  || 'finn_neutral.png';
  const vImg  = scenario.v_img  || 'cleo_neutral.png';
  const id = `fq${scenario.id}`;

  return {
    _debugLabel: `${pName} & ${vName} — Fault Question`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:8px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <img src="${headerImg}" style="max-width:963px; width:100%; max-height:min(27vh, 213px); object-fit:contain; border-radius:8px; margin-bottom:7px;">
        <p style="font-size:20px; font-weight:600; margin:0 0 12px 0;">Now that you saw what happened, how much do you think each person is at fault?</p>
        ${twoScaleHTML(id, vName, pName, true, `img/${vImg}`, `img/${pImg}`, true, true)}
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
        showScalePercent(id, who, val);
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
   Shown after the fault question, on every scenario. Always shows
   the scenario's ending picture.
   ---------------------------------------------------------- */
/** One carefulness question, about either the actor (targetRole 'p') or
 *  the victim (targetRole 'v'). Two of these — order randomized per
 *  scenario — are shown so both characters get asked about. */
function buildCheckerTrial(scenario, targetRole) {
  const pName = scenario.p_name || 'Finn';
  const vName = scenario.v_name || 'Cleo';
  const pImg  = scenario.p_img  || 'finn_neutral.png';
  const vImg  = scenario.v_img  || 'cleo_neutral.png';
  const targetName = targetRole === 'p' ? pName : vName;
  const targetImg  = targetRole === 'p' ? pImg  : vImg;
  const endingImg = scenario.story_slides[scenario.story_slides.length - 1];
  const id = `ck${scenario.id}${targetRole}`;

  return {
    _debugLabel: `${pName} & ${vName} — Checker Question (${targetName})`,
    type: jsPsychHtmlButtonResponse,
    choices: [],
    stimulus: `
      <div style="text-align:center; padding:10px 40px 0 40px; max-width:900px; margin:0 auto;">
        <img src="${endingImg}" style="max-width:860px; width:100%; max-height:min(30vh, 240px); object-fit:contain; border-radius:8px; margin-bottom:14px;">
        <img src="img/${targetImg}" alt="${targetName}" style="width:88px; height:88px; object-fit:contain; border-radius:50%; margin-bottom:10px;">
        <p style="font-size:20px; font-weight:600;">Was ${targetName} being careful?</p>
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

      function pick(key, btn) {
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

  // Story slide – all slides
  const _storyImgs = scenario.story_slides;
  const storySlide = {
    _debugLabel: `${trialLabel} — Story`,
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
        <img id="story-img" src="${_storyImgs[0]}"
             style="max-width:860px; width:100%; max-height:62vh; object-fit:contain; border-radius:8px;">
        <div style="display:flex; align-items:center; gap:16px;">
          <button id="story-prev"
                  style="padding:8px 20px; font-size:15px; border-radius:6px; cursor:pointer;">
            ◀ Prev
          </button>
          <span id="story-counter" style="font-size:15px; color:#555;">
            1 / ${_storyImgs.length}
          </span>
          <button id="story-next"
                  style="padding:8px 20px; font-size:15px; border-radius:6px; cursor:pointer;">
            Next ▶
          </button>
        </div>
      </div>`,
    choices: ['Continue'],
    on_start: function() { updateProgressBar(scenarioIdx, total); },
    on_load: function() {
      const imgs = _storyImgs;
      let cur = 0;
      const continueBtn = document.querySelector('.jspsych-btn');
      if (imgs.length > 1) {
        continueBtn.disabled = true;
        continueBtn.style.opacity = '0.4';
        continueBtn.style.cursor = 'not-allowed';
      }
      function update() {
        document.getElementById('story-img').src = imgs[cur];
        document.getElementById('story-counter').textContent = (cur + 1) + ' / ' + imgs.length;
        if (cur === imgs.length - 1) {
          continueBtn.disabled = false;
          continueBtn.style.opacity = '1';
          continueBtn.style.cursor = 'pointer';
        }
      }
      document.getElementById('story-prev').addEventListener('click', () => {
        if (cur > 0) { cur--; update(); }
      });
      document.getElementById('story-next').addEventListener('click', () => {
        if (cur < imgs.length - 1) { cur++; update(); }
      });
    },
  };

  // Allocation screen with gate question integrated
  const headerImg = scenario.story_slides[scenario.story_slides.length - 1];
  const slideG = {
    _debugLabel: `${trialLabel} — Allocation`,
    type: jsPsychAllocation,
    p_cookies: pAfter,
    v_cookies_current: scenario.v_after_harm,
    hud_p_cookies: scenario.p_cookies,
    hud_v_cookies: scenario.v_initial,
    trash_on_left: TRASH_ON_LEFT,
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
  };

  const faultQuestionSlide = buildFaultQuestionTrial(scenario, headerImg);
  // Ask about both characters' carefulness, order randomized per scenario
  // rather than always asking about the actor first.
  const actorFirst = sessionGet('exp1_adults_vabove0_checker_order_' + scenario.id, () => Math.random() < 0.5);
  const checkerTrials = actorFirst
    ? [buildCheckerTrial(scenario, 'p'), buildCheckerTrial(scenario, 'v')]
    : [buildCheckerTrial(scenario, 'v'), buildCheckerTrial(scenario, 'p')];
  return [storySlide, slideG, faultQuestionSlide, ...checkerTrials];
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
  warmupIntroFinn,
  warmupIntroCleo,
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
  checkerDemoYes, checkerPracticeYes,
  checkerDemoNo, checkerPracticeNo,
  warmupDone,
];

// All scenarios combined — fully randomized per participant (stable across jump-reloads)
const allScenarios = [...finnCleoScenarios, ...secondBlockScenarios];
const shuffledAll = sessionGet('exp1_shuffle_all',
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

        <!-- State -->
        <tr>
          <td style="padding:10px 24px 10px 0; vertical-align:middle; white-space:nowrap;">5. State of residence:</td>
          <td style="padding:10px 0;">
            <select id="demo-state" style="width:220px; padding:4px 7px; font-size:15px; border:1px solid #999; border-radius:3px;">
              <option value="" selected disabled>Select a state...</option>
              ${['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
                 'Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois',
                 'Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts',
                 'Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
                 'New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota',
                 'Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island','South Carolina',
                 'South Dakota','Tennessee','Texas','Utah','Vermont','Virginia','Washington',
                 'West Virginia','Wisconsin','Wyoming','Other','Prefer not to answer']
                .map(s => `<option value="${s}">${s}</option>`).join('')}
            </select>
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
      const stateEl   = document.getElementById('demo-state');
      const state     = stateEl?.value;
      const errEl     = document.getElementById('demo-error');
      if (!age || !genderEl || !raceEl || !ethnicEl || !state) {
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
        state:     state,
      });
    });
  },
  data: { is_demographic: true, is_practice: false },
  _debugLabel: 'Demographics',
};

const feedbackScreen = {
  type: jsPsychHtmlButtonResponse,
  choices: [],
  stimulus: `
    <div style="text-align:center; padding:40px; max-width:700px; margin:0 auto; font-family:sans-serif;">
      <p style="font-size:20px; margin-bottom:20px;">Was anything confusing, or do you have any feedback about any part of this study?</p>
      <textarea id="feedback-input" rows="6"
        style="width:100%; font-size:16px; padding:12px; border:2px solid #ccc;
               border-radius:8px; resize:vertical; font-family:inherit;"
        placeholder="Please share your feedback here..."></textarea>
      <p id="feedback-error" style="color:#cc0000; font-size:14px; margin-top:8px; display:none; font-weight:500;">Please enter your feedback before submitting.</p>
      <div style="margin-top:16px;">
        <button id="feedback-submit-btn" class="jspsych-btn" style="padding:8px 28px; font-size:15px; cursor:pointer;">Submit</button>
      </div>
    </div>`,
  on_load: function() {
    const startTime = performance.now();
    document.getElementById('feedback-submit-btn').addEventListener('click', function() {
      const val = document.getElementById('feedback-input')?.value?.trim();
      const errEl = document.getElementById('feedback-error');
      if (!val) {
        errEl.style.display = 'block';
        document.getElementById('feedback-input').style.borderColor = '#cc0000';
        return;
      }
      jsPsych.finishTrial({
        rt:       Math.round(performance.now() - startTime),
        feedback: val,
      });
    });
  },
  data: { is_demographic: true, demographic_type: 'feedback', is_practice: false },
  _debugLabel: 'Feedback',
};

const cookieJarScreen = {
  type: jsPsychHtmlButtonResponse,
  choices: [],
  stimulus: `
    <div style="text-align:center; padding:40px; max-width:700px; margin:0 auto; font-family:sans-serif;">
      <p style="font-size:20px; margin-bottom:20px;">What do you think the Cookie Jar represents in this study?</p>
      <textarea id="cookiejar-input" rows="6"
        style="width:100%; font-size:16px; padding:12px; border:2px solid #ccc;
               border-radius:8px; resize:vertical; font-family:inherit;"
        placeholder="Your answer here (optional)..."></textarea>
      <div style="margin-top:16px;">
        <button id="cookiejar-submit-btn" class="jspsych-btn" style="padding:8px 28px; font-size:15px; cursor:pointer;">Submit</button>
      </div>
    </div>`,
  on_load: function() {
    const startTime = performance.now();
    document.getElementById('cookiejar-submit-btn').addEventListener('click', function() {
      jsPsych.finishTrial({
        rt:                  Math.round(performance.now() - startTime),
        cookie_jar_meaning:  document.getElementById('cookiejar-input')?.value || '',
      });
    });
  },
  data: { is_demographic: true, demographic_type: 'cookie_jar_meaning', is_practice: false },
  _debugLabel: 'Cookie Jar Meaning',
};

// Final screen
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
warmupIntroFinn._debugLabel      = 'Intro: Michael';
warmupIntroCleo._debugLabel      = 'Intro: Claire';
warmupLayoutLocked._debugLabel    = 'Warmup: Layout (locked)';
warmupLayoutTwoWays._debugLabel   = 'Warmup: Two Ways (locked)';
warmupWay1Locked._debugLabel      = 'Warmup: Way 1 (locked)';
warmupPracticeV._debugLabel       = 'Warmup: Practice (Michael→Claire)';
warmupPracticeVtoP._debugLabel    = 'Warmup: Practice (Claire→Michael)';
warmupWay2Locked._debugLabel      = 'Warmup: Way 2 (locked)';
warmupPracticeTrash._debugLabel   = 'Warmup: Practice (Michael→Jar)';
warmupPracticeFromV._debugLabel   = 'Warmup: Practice (Claire→Jar)';
warmupPracticeSummary._debugLabel = 'Warmup: Summary (locked)';
warmupPracticeBoth._debugLabel    = 'Warmup: Practice (Both)';
warmupDone._debugLabel            = 'Warmup: Done';
demographicsScreen._debugLabel = 'Demographics';
feedbackScreen._debugLabel     = 'Feedback';
cookieJarScreen._debugLabel    = 'Cookie Jar Meaning';
endScreen._debugLabel          = 'End Screen';

/* ----------------------------------------------------------
   RUN
   ---------------------------------------------------------- */
const timeline = [
  consentScreen,
  ...warmupBlock,
  ...testBlock,
  demographicsScreen,
  feedbackScreen,
  cookieJarScreen,
  endScreen,
];

/* ============================================================
   RESEARCHER DEBUG PANEL — JUMP TO ANY SCREEN
   Hidden by default for public / participant deployment.
   To reveal it (researcher use only), set SHOW_DEBUG_PANEL = true.
   ============================================================ */
const SHOW_DEBUG_PANEL = false;   // ← change to true to show the Jump-to-Screen panel

(function () {
  // Public deployment: panel stays hidden — just run the experiment normally.
  if (!SHOW_DEBUG_PANEL) {
    jsPsych.run(timeline);
    return;
  }

  const DATA_KEY = 'exp1_debug_data';

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

  const panel = document.createElement('div');
  panel.id = 'researcher-debug-panel';
  panel.innerHTML = `
    <div id="rdp-title">🔬 Researcher: Jump to Screen</div>
    <select id="rdp-select">${options}</select>
    <button id="rdp-jump">▶ Jump</button>
    <button id="rdp-clear" title="Clear saved trial data">🗑 Clear data</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('rdp-jump').addEventListener('click', () => {
    // Save current data before reloading so it survives the jump.
    sessionStorage.setItem(DATA_KEY, jsPsych.data.get().json());
    const idx = document.getElementById('rdp-select').value;
    window.location.search = '?jumpTo=' + idx;
  });

  document.getElementById('rdp-clear').addEventListener('click', () => {
    sessionStorage.removeItem(DATA_KEY);
    location.reload();
  });

  // Start experiment from the selected slide
  jsPsych.run(jumpTo > 0 ? timeline.slice(jumpTo) : timeline);
})();
/* *** END OF RESEARCHER DEBUG BLOCK *** */
