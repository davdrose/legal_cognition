// ════════════════════════════════════════════════════════════════════
//  LEGAL COGNITION — COOKIE ALLOCATION  (children – v-above-0 / v-goes-to-0 switcher)
//  CHS jsPsych version
// ════════════════════════════════════════════════════════════════════

const BASE_SHARED = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-shared%20files/';
const BASE_IMG_VGO0    = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20goes%20to%200/img/';
const BASE_IMG_ABOVE0    = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20above%200/img/';
let BASE_IMG = BASE_IMG_VGO0;
const BASE_VID_ABOVE0 = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20above%200/';
const BASE_VID_VGO0   = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20goes%20to%200/';

(function () {
  const style = document.createElement('style');
  style.textContent = `/* ============================================================
   GLOBAL LAYOUT OVERRIDES
   ============================================================ */

/* html,body resets removed for CHS */

body {
  background: #fff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
}

/* Override jsPsych's overflow-y: auto — no scrollbar anywhere */
/* .jspsych-display-element overrides removed for CHS */

.jspsych-content-wrapper {
  width: 100%;
  min-height: 0;
}

.jspsych-content {
  max-width: 1400px;
  width: 96%;
  padding: 0;
}

/* ============================================================
   CHARACTER CARD
   ============================================================ */

.char-card {
  border-radius: 22px;
  border: 2px solid #ccc;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #333;
  /* Slot for future image replacement: set background-image here */
}

.char-card.large {
  width: 190px;
  height: 165px;
  font-size: 20px;
}

.char-card.medium {
  width: 120px;
  height: 104px;
  font-size: 15px;
  border-radius: 16px;
}

.char-card.small {
  width: 82px;
  height: 72px;
  font-size: 12px;
  border-radius: 12px;
}

/* ============================================================
   COOKIE GRID  (3 top + 2 bottom)
   ============================================================ */

.cookie-grid {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 6px;
  user-select: none;
}

.cookie-row {
  display: flex;
  gap: 6px;
}

.cookie-row.row-bottom {
  padding-left: 35px; /* centers 2 slots under 3 */
}

/* HUD-size grid adjustments */
.hud-grid .cookie-row.row-bottom {
  padding-left: 17px;
}

/* ============================================================
   COOKIE SLOT
   ============================================================ */

.cookie-slot {
  border-radius: 10px;
  border: 1.5px solid #bbb;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition: background 0.15s, border-color 0.15s;
}

/* Large slots (main display) */
.cookie-slot.large {
  width: 64px;
  height: 48px;
  border-radius: 10px;
}

/* Medium slots (allocation panel) */
.cookie-slot.medium {
  width: 56px;
  height: 42px;
  border-radius: 9px;
}

/* Small slots (HUD) */
.cookie-slot.small {
  width: 30px;
  height: 22px;
  border-radius: 6px;
}

/* Filled slots get white background to contrast the oval */
.cookie-slot.filled {
  background: #fff;
  border-color: #aaa;
}

/* Drop target highlight */
.cookie-slot.drop-hover {
  border-color: #4a90d9;
  background: #e8f1fb;
}

/* ============================================================
   COOKIE OVAL
   ============================================================ */

.cookie-emoji {
  pointer-events: none;
  flex-shrink: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.large .cookie-emoji  { font-size: 28px; }
.medium .cookie-emoji { font-size: 24px; }
.small .cookie-emoji  { font-size: 13px; }

/* ============================================================
   DRAGGABLE COOKIE SLOT
   ============================================================ */

.cookie-slot.draggable {
  cursor: grab;
  transition: transform 0.1s, box-shadow 0.1s;
}

.cookie-slot.draggable:hover {
  border-color: #888;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  transform: scale(1.05);
}


/* Ghost cookie (follows cursor while dragging) */
#drag-ghost {
  position: fixed;
  pointer-events: none;
  z-index: 10002;
  display: none;
  font-size: 52px;
  line-height: 1;
  opacity: 0.88;
  user-select: none;
}

/* Auto-demo overlay (cursor demonstrating a drag) */
#demo-cursor {
  position: fixed;
  z-index: 10000;
  pointer-events: none;
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  transition: transform 0.15s ease;
}
#demo-cursor img {
  display: block;
  width: 8.4vw;
  height: auto;
}
#demo-cursor.grabbing {
  transform: translate(-50%, -50%); /* no size change — stays the same size as her static corner pose */
}

/* Reference "domain" matching the on-screen box the intro video actually
   renders into (max-width:860px, width:100%, max-height:62vh, 16:9 —
   same rules as #welcome-video / #intro-maggie-video — centered in the
   viewport, which is where that box empirically ends up). Used so
   characters (e.g. Maggie) can be positioned on later warmup screens at
   the same relative spot they occupied within the video frame, rather
   than relative to the full browser viewport. */
.video-frame-domain {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 100%;
  max-width: 1150px;
  max-height: 82vh;
  aspect-ratio: 16 / 9;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 50;
}

/* Character peeking in from the bottom-left corner (e.g. Maggie),
   positioned as a % of .video-frame-domain to match her position
   within the "introducing maggie" video frame */
.corner-char-img {
  position: absolute;
  left: 1.73%;
  bottom: 2.31%;
  width: 8.4vw;
  height: auto;
  pointer-events: none;
  transform: scaleX(-1); /* face right, into the screen */
}

/* Practice hint / warning */
.alloc-hint-visible {
  text-align: center;
  font-size: 15px;
  color: #c0392b;
  background: #fff5f5;
  border: 1.5px solid #e8a0a0;
  border-radius: 8px;
  padding: 6px 20px;
  margin: 4px auto 0;
  max-width: 560px;
}
.alloc-hint-hidden {
  height: 0;
  overflow: hidden;
  margin: 0;
}

/* ============================================================
   HUD (fixed top-left)
   ============================================================ */

.hud {
  position: fixed;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: row;
  gap: 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 8px 12px;
  z-index: 500;
  box-shadow: 0 1px 6px rgba(0,0,0,0.08);
}

.hud-person {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.hud-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

/* ============================================================
   TWO-PERSON DISPLAY (intro slides)
   ============================================================ */

.two-person-display {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: flex-start;
  gap: 120px;
  margin: 40px auto;
}

.person-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.char-img {
  width: 200px;
  height: auto;
  object-fit: contain;
}

.person-name {
  font-size: 24px;
  color: #333;
  text-align: center;
  margin: 8px 0 0;
  font-weight: 500;
}

.char-img.intro-img {
  width: 180px;
  max-height: 40vh;
  object-fit: contain;
}

.intro-name {
  font-size: 26px;
  color: #333;
  text-align: center;
  margin: 10px 0 0;
  font-weight: 500;
}

.cookie-label {
  font-size: 18px;
  color: #555;
  text-align: center;
}

/* ============================================================
   SLIDE INSTRUCTION TEXT
   ============================================================ */

.slide-instruction {
  font-size: 22px;
  color: #555;
  max-width: 520px;
  line-height: 1.45;
  margin: 0 auto;
  text-align: center;
}

.slide-title {
  font-size: 52px;
  font-weight: 400;
  color: #222;
  text-align: center;
  margin: 0;
  padding: 40px 0;
}

/* ============================================================
   EVENT ANIMATION BOX
   ============================================================ */

.event-box {
  width: 680px;
  min-height: 220px;
  border-radius: 24px;
  border: 2px solid #ddd;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 30px 40px;
  margin: 0 auto;
  box-sizing: border-box;
}

.event-scene {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 32px;
}

.event-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.event-person-label {
  font-size: 13px;
  color: #888;
  font-weight: 600;
}

.event-description {
  font-size: 17px;
  color: #444;
  text-align: center;
  line-height: 1.5;
  max-width: 440px;
}

.event-arrow {
  font-size: 28px;
  color: #999;
}

/* Intentional: red glow on perpetrator */
.event-person.perpetrator .char-card.medium {
  box-shadow: 0 0 0 3px rgba(220,60,60,0.25);
}

/* Negligent: orange glow */
.event-person.negligent .char-card.medium {
  box-shadow: 0 0 0 3px rgba(230,140,30,0.25);
}

/* Strict liability: blue glow */
.event-person.strict-liability .char-card.medium {
  box-shadow: 0 0 0 3px rgba(80,140,220,0.25);
}

/* ============================================================
   HARM RESULT DISPLAY
   ============================================================ */

.harm-result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin: 20px auto;
}

.harm-result-text {
  font-size: 22px;
  color: #555;
  text-align: center;
  max-width: 580px;
  line-height: 1.4;
}

.harm-result-chars {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 60px;
}

.harm-result-char {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.decision-prompt {
  font-size: 20px;
  color: #333;
  text-align: center;
  max-width: 580px;
  line-height: 1.4;
  margin-top: 12px;
  font-style: italic;
}

/* ============================================================
   ALLOCATION SCREEN
   ============================================================ */

.allocation-screen {
  width: 100%;
  padding-top: 4px;
  box-sizing: border-box;
}

.allocation-header-img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 20vh;
  margin: 0 auto 4px auto;
  border-radius: 8px;
}

.allocation-harm-text {
  font-size: 20px;
  color: #555;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 20px auto;
  line-height: 1.45;
}

.allocation-instruction {
  font-size: 22px;
  color: #555;
  text-align: center;
  max-width: 600px;
  margin: 0 auto 24px auto;
  line-height: 1.45;
}

/* Three-column layout */
.allocation-columns {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
  gap: 20px;
  margin: 0 auto;
}

/* Outer panel (Trash or V) */
.alloc-panel {
  width: 260px;
  min-height: 250px;
  border: 2px solid transparent;
  border-radius: 22px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  box-sizing: border-box;
  gap: 4px;
  background: #fff;
}

/* Character image and name inside allocation panels / P pool */
.alloc-char-img {
  width: 75px;
  height: 72px;
  object-fit: contain;
}

.alloc-char-name {
  font-size: 17px;
  color: #333;
  font-weight: 500;
  text-align: center;
  margin: 2px 0 0;
}

/* Center P pool */
.p-pool-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 4px;
  width: 260px;
}

/* P pool cookie grid – medium sized, draggable */
#p-pool-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

#p-pool-grid .cookie-row.row-bottom {
  padding-left: 31px;
}

/* Drop zone grid inside panels */
.drop-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.drop-grid .cookie-row.row-bottom {
  padding-left: 31px;
}

/* Existing V cookies (non-draggable) */
.v-existing-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.v-existing-grid .cookie-row.row-bottom {
  padding-left: 31px;
}

/* Cookie jar icon area */
.trash-icon-area {
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cookie-jar-img {
  width: 120px;
  height: auto;
  object-fit: contain;
}

/* Panel label */
.panel-name {
  font-size: 15px;
  font-weight: 500;
  color: #555;
  text-align: center;
}

/* Button row (Confirm + Do Nothing) */
.allocation-btn-row {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
}

#confirm-btn {
  padding: 12px 48px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  background: #4a86e8;
  color: #fff;
  border: none;
}

#confirm-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}

#confirm-btn:not(:disabled):hover {
  background: #3a72cc;
}

#do-nothing-btn {
  padding: 12px 36px;
  font-size: 18px;
  border-radius: 8px;
  cursor: pointer;
  background: #fff;
  color: #555;
  border: 2px solid #ccc;
}

#do-nothing-btn:hover {
  background: #f5f5f5;
  border-color: #aaa;
}

/* ============================================================
   FREE-FLOATING COOKIE ICONS (intro slides — no slots)
   ============================================================ */

.free-cookies-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  max-width: 220px;
  margin-top: 4px;
}

.free-cookie-emoji {
  font-size: 32px;
  line-height: 1;
  user-select: none;
  display: inline-block;
}

.free-cookie-emoji.animate-cookie-appear {
  animation: cookie-appear 0.35s ease-out both;
}

/* ============================================================
   OPEN PLATE (allocation screen)
   ============================================================ */

/* Circular plate that replaces the slot grid in the allocation screen */
.cookie-plate {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(ellipse at 38% 32%, #fdf9f2, #ede0c8);
  border: 3px solid #c8b898;
  box-shadow:
    inset 0 3px 10px rgba(0,0,0,0.07),
    inset 0 -2px 6px rgba(255,255,255,0.6),
    0 3px 8px rgba(0,0,0,0.09);
  position: relative;
  flex-shrink: 0;
  transition: border-color 0.15s, box-shadow 0.15s;
}

/* Shrink the whole plate area (as one centered unit) on screens showing
   a corner character (e.g. Maggie), so it no longer overlaps her */
.allocation-screen.has-corner-char .cookie-plate {
  transform: scale(0.93);
}
.allocation-screen.has-corner-char .allocation-columns {
  gap: 20px;
}
.allocation-screen.has-corner-char .alloc-panel,
.allocation-screen.has-corner-char .p-pool-col {
  width: 320px;
}
.allocation-screen.has-corner-char .alloc-char-img {
  width: 66px;
  height: 90px;
}
.allocation-screen.has-corner-char .alloc-char-name {
  font-size: 26px;
}
.allocation-screen.has-corner-char .panel-name {
  font-size: 16px;
}
.allocation-screen.has-corner-char .allocation-instruction {
  font-size: 26px;
  line-height: 1.2;
  max-width: 850px;
  margin-bottom: 2px;
}

/* Highlight when a cookie is being dragged over this plate */
.cookie-plate.drop-hover {
  border-color: #4a90d9;
  box-shadow:
    inset 0 3px 10px rgba(0,0,0,0.07),
    0 0 0 4px rgba(74,144,217,0.22),
    0 3px 8px rgba(0,0,0,0.09);
}

/* Trash panel highlight (uses the panel border, not a plate) */
#trash-panel.drop-hover {
  border-color: #4a90d9;
  box-shadow: 0 0 0 3px rgba(74,144,217,0.2);
}

/* Individual cookie sitting on a plate.
   left/top = desired CENTER of cookie within the plate (px from plate top-left).
   transform: translate(-50%,-50%) centers the element at that point. */
.plate-cookie {
  position: absolute;
  width: 58px;
  height: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  transition: filter 0.1s, transform 0.1s;
  user-select: none;
  z-index: 10001; /* always render in front of #demo-cursor (Maggie) */
}

.plate-cookie .cookie-emoji {
  font-size: 44px;
  pointer-events: none;
  line-height: 1;
}

/* Draggable cookies show a grab cursor and scale up on hover */
.plate-cookie.draggable {
  cursor: grab;
}

.plate-cookie.draggable:hover {
  filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));
  transform: translate(-50%, -50%) scale(1.14);
}

/* Trash pile — free-form area below the cookie jar where trashed cookies land */
#trash-pile {
  position: relative;
  width: 200px;
  min-height: 90px;
  flex: 1;        /* expands to fill remaining space in the trash panel */
}

/* Cookies inside the trash pile are also absolute-positioned */
#trash-pile .plate-cookie {
  /* inherits position:absolute, left/top set inline */
}

/* ============================================================
   COOKIE ANIMATIONS
   ============================================================ */

@keyframes cookie-appear {
  0%   { opacity: 0; transform: scale(0.3); }
  70%  { transform: scale(1.12); }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes cookie-disappear {
  0%   { opacity: 1; transform: scale(1); }
  25%  { transform: scale(1.1) rotate(-8deg); }
  60%  { transform: scale(0.7) rotate(12deg); opacity: 0.4; }
  100% { opacity: 0; transform: scale(0); }
}

@keyframes slot-shake {
  0%, 100% { transform: translateX(0); }
  20%       { transform: translateX(-6px); }
  40%       { transform: translateX(6px); }
  60%       { transform: translateX(-4px); }
  80%       { transform: translateX(4px); }
}

.animate-cookie-appear .cookie-emoji {
  animation: cookie-appear 0.35s ease-out both;
}

.animate-cookie-disappear {
  animation: cookie-disappear 0.5s ease-in forwards;
}

.animate-shake {
  animation: slot-shake 0.45s ease-in-out;
}

/* Staggered delays for cookie-appear (applied via JS data-delay) */
.stagger-0  { animation-delay: 0s; }
.stagger-1  { animation-delay: 0.12s; }
.stagger-2  { animation-delay: 0.24s; }
.stagger-3  { animation-delay: 0.36s; }
.stagger-4  { animation-delay: 0.48s; }

/* ============================================================
   SLIDE WRAPPER (centers content vertically for intro slides)
   ============================================================ */

.slide-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 30px;
  box-sizing: border-box;
  gap: 24px;
}

.slide-content-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  max-width: 560px;
}

/* ============================================================
   SCENARIO PROGRESS BAR (fixed top, test trials only)
   ============================================================ */

#scenario-progress-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  display: none;
  background: #f8f8f8;
  border-bottom: 1px solid #e8e8e8;
  padding: 10px 24px 8px;
}

#scenario-progress-track {
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

#scenario-progress-fill {
  height: 100%;
  background: #4a86e8;
  border-radius: 4px;
  width: 0%;
  transition: width 0.5s ease;
}


/* jspsych button override */
.jspsych-btn {
  margin-top: 28px;
  padding: 10px 36px;
  font-size: 17px;
}

/* ----------------------------------------------------------
   TWO-BAR FAULT WIDGET & CHECKER QUESTION
   Ported from experiment2 children (slider variant).
   ---------------------------------------------------------- */
.two-scale-row {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 130px;
  margin: 18px auto;
}

.two-scale-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.two-scale-portrait {
  height: 110px;
  object-fit: contain;
}

.two-scale-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.two-scale-track {
  position: relative;
  width: 480px;
  height: 120px;
  user-select: none;
  transition: opacity 0.25s ease;
}

/* Faint until the participant deliberately clicks somewhere on the bar
   (even the zero endpoint) — makes "unanswered" visually distinct from
   just having clicked all the way at zero. */
.two-scale-track-unanswered {
  opacity: 0.4;
}

.two-scale-track-unanswered.answered {
  opacity: 1;
}

.two-scale-track-bg {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: #f2f2f2;
  clip-path: polygon(0% 64%, 100% 0%, 100% 100%, 0% 100%);
  pointer-events: none;
}

.two-scale-track.draggable {
  cursor: pointer;
}

.two-scale-track-mid {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(0, 0, 0, 0.22);
  pointer-events: none;
}

.two-scale-fill-wrap {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 0%;
  overflow: hidden;
  pointer-events: none;
}

.two-scale-fill {
  position: absolute;
  left: 0;
  top: 0;
  width: 480px;
  height: 120px;
  background: rgba(217, 33, 33, 0);
  clip-path: polygon(0% 64%, 100% 0%, 100% 100%, 0% 100%);
}

.checker-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 23px 44px;
}

.checker-icon {
  font-size: 73px;
  line-height: 1;
}

.checker-btn-yes .checker-icon {
  color: #2e7d32;
}

.checker-btn-no .checker-icon {
  color: #c62828;
}

.checker-label {
  font-size: 23px;
  font-weight: 600;
  color: #333;
}

.two-scale-col-highlight {
  border-radius: 12px;
  box-shadow: 0 0 0 4px #ffd54f, 0 0 22px 6px rgba(255, 213, 79, 0.85);
  transition: box-shadow 0.3s ease;
}

.checker-btn-pressed {
  transform: scale(0.92);
  background: #ffd54f;
  border-color: #ffc107;
  transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
}

.two-scale-click-ripple {
  position: fixed;
  width: 34px;
  height: 34px;
  margin-left: -17px;
  margin-top: -17px;
  border: 3px solid #ffc107;
  border-radius: 50%;
  transform: scale(0.4);
  opacity: 0.9;
  pointer-events: none;
  z-index: 3;
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}

.two-scale-click-ripple.animate {
  transform: scale(1.6);
  opacity: 0;
}
`;
  document.head.appendChild(style);
})();

/**
 * jsPsych Allocation Plugin — Plate Edition
 *
 * P's cookies sit on an open circular plate in the center.
 * Participants drag them freely onto V's plate or the Trash panel.
 * Records cookies_from_p_to_v, cookies_from_p_to_c, cookies_kept_by_p, cookies_from_v_to_c, gate_rt, allocation_rt.
 *
 * Requires: jsPsych 7
 */
var jsPsychAllocation = (function (jspsych) {

  const info = {
    name: 'allocation',
    version: '1.0.0',
    data: {},
    parameters: {
      p_cookies:          { type: jspsych.ParameterType.INT,         default: 5 },
      v_cookies_current:  { type: jspsych.ParameterType.INT,         default: 2 },
      hud_p_cookies:      { type: jspsych.ParameterType.INT,         default: 5 },
      hud_v_cookies:      { type: jspsych.ParameterType.INT,         default: 5 },
      /** Left-to-right arrangement of P, V, and the Cookie Jar for this
       *  participant, as a comma-joined string, e.g. "TRASH,P,V". */
      character_order:    { type: jspsych.ParameterType.STRING,      default: 'TRASH,P,V' },
      harm_text:          { type: jspsych.ParameterType.HTML_STRING, default: '' },
      instruction_text:   { type: jspsych.ParameterType.HTML_STRING, default: '' },
      require_v:          { type: jspsych.ParameterType.BOOL,        default: false },
      require_trash:      { type: jspsych.ParameterType.BOOL,        default: false },
      require_both:       { type: jspsych.ParameterType.BOOL,        default: false },
      require_from_v:     { type: jspsych.ParameterType.BOOL,        default: false },
      require_v_to_p:     { type: jspsych.ParameterType.BOOL,        default: false },
      allow_v_to_p:       { type: jspsych.ParameterType.BOOL,        default: false },
      locked:             { type: jspsych.ParameterType.BOOL,        default: false },
      is_practice:        { type: jspsych.ParameterType.BOOL,        default: false },
      scenario_id:        { type: jspsych.ParameterType.INT,         default: 0 },
      harm_type:          { type: jspsych.ParameterType.STRING,      default: '' },
      event_title:        { type: jspsych.ParameterType.STRING,      default: '' },
      p_name: { type: jspsych.ParameterType.STRING, default: 'Finn' },
      v_name: { type: jspsych.ParameterType.STRING, default: 'Cleo' },
      p_img:  { type: jspsych.ParameterType.STRING, default: 'finn_neutral.png' },
      v_img:  { type: jspsych.ParameterType.STRING, default: 'cleo_neutral.png' },
      header_img:         { type: jspsych.ParameterType.STRING,      default: '' },
      /** Show yes/no gate question on the allocation screen before cookies are movable */
      show_gate_question: { type: jspsych.ParameterType.BOOL,        default: false },
      /** Auto-play a demo drag animation on load (a narrator character demonstrating the mechanic) */
      auto_demo:          { type: jspsych.ParameterType.BOOL,        default: false },
      demo_cookie_id:     { type: jspsych.ParameterType.INT,         default: 0 },
      demo_char_img:      { type: jspsych.ParameterType.STRING,      default: 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-shared%20files/maggie.png' },
      demo_char_name:     { type: jspsych.ParameterType.STRING,      default: 'Maggie' },
      demo_text:          { type: jspsych.ParameterType.HTML_STRING, default: '' },
      demo_text_after:    { type: jspsych.ParameterType.HTML_STRING, default: '' },
      confirm_label:      { type: jspsych.ParameterType.STRING,      default: '' },
      /** Audio to play before the demo starts (narrates instruction text); demo waits until it ends */
      demo_audio_before:  { type: jspsych.ParameterType.STRING,      default: '' },
      /** Audio to play when the demo animation begins (Maggie starts moving) */
      demo_audio_carry:   { type: jspsych.ParameterType.STRING,      default: '' },
      /** Audio to play when the demo animation completes (confirm button enabled) */
      demo_audio_after:   { type: jspsych.ParameterType.STRING,      default: '' },
      /** Optional character image pinned to the bottom-left corner of the screen (e.g. Maggie peeking in) */
      corner_char_img:    { type: jspsych.ParameterType.STRING,      default: '' },
    }
  };

  class AllocationPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }

    trial(display_element, trial) {
      const self = this;
      const startTime = performance.now();
      let gate_rt      = null;
      let allocStartTime = null;
      let moveInstructionAudio = null;

      /* -------------------------------------------------------
         STATE
      ------------------------------------------------------- */
      const cookieDest  = Array.from({ length: trial.p_cookies         }, () => 'pool');
      const vCookieDest = Array.from({ length: trial.v_cookies_current }, () => 'v');

      /* -------------------------------------------------------
         PLATE GEOMETRY
      ------------------------------------------------------- */
      const PLATE_D  = 220;
      const PLATE_R  = PLATE_D / 2;
      const COOKIE_R = 24;

      const OFFSETS = [
        { x: -48, y: -36 },
        { x:  30, y: -52 },
        { x:  62, y:  10 },
        { x: -60, y:  24 },
        { x:   6, y:  56 },
        { x:  46, y: -26 },
        { x:   0, y:   0 },
      ];

      function offsetToPlatePos(i) {
        const o = OFFSETS[i % OFFSETS.length];
        return { left: PLATE_R + o.x, top: PLATE_R + o.y };
      }

      const homePositions   = Array.from({ length: trial.p_cookies        }, (_, i) => offsetToPlatePos(i));
      const vFixedPositions = Array.from({ length: trial.v_cookies_current }, (_, i) => offsetToPlatePos(i));

      function clampToPlate(plateEl, clientX, clientY) {
        const rect = plateEl.getBoundingClientRect();
        const cx = rect.left + PLATE_R, cy = rect.top + PLATE_R;
        let dx = clientX - cx, dy = clientY - cy;
        const maxR = PLATE_R - COOKIE_R;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxR) { dx = dx / dist * maxR; dy = dy / dist * maxR; }
        return { left: PLATE_R + dx, top: PLATE_R + dy };
      }

      /* -------------------------------------------------------
         HTML BUILDERS
      ------------------------------------------------------- */
      function pPlateHTML() {
        const draggable = (trial.show_gate_question || trial.locked) ? '' : ' draggable';
        let html = `<div class="cookie-plate" id="p-plate">`;
        for (let i = 0; i < trial.p_cookies; i++) {
          const { left, top } = homePositions[i];
          html += `<div class="plate-cookie${draggable}" id="p-cookie-${i}" data-cookie-id="${i}" style="left:${left}px;top:${top}px;"><span class="cookie-emoji">🍪</span></div>`;
        }
        html += `</div>`;
        return html;
      }

      function vPanelHTML() {
        const draggable = (trial.show_gate_question || trial.locked) ? '' : ' draggable';
        let plateHTML = `<div class="cookie-plate" id="v-plate">`;
        for (let i = 0; i < trial.v_cookies_current; i++) {
          const { left, top } = vFixedPositions[i];
          plateHTML += `<div class="plate-cookie${draggable}" id="v-existing-${i}" data-v-cookie-id="${i}" style="left:${left}px;top:${top}px;"><span class="cookie-emoji">🍪</span></div>`;
        }
        plateHTML += `</div>`;

        const vLabel = `${trial.v_name} has ${trial.v_cookies_current} cookie${trial.v_cookies_current !== 1 ? 's' : ''}`;
        return `
          <div class="alloc-panel" id="v-panel">
            <img src="https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20goes%20to%200/img/${trial.v_img}" class="alloc-char-img" alt="${trial.v_name}">
            <p class="alloc-char-name">${trial.v_name}</p>
            <div class="panel-name" id="v-panel-name">${vLabel}</div>
            ${plateHTML}
          </div>`;
      }

      function trashPanelHTML() {
        return `
          <div class="alloc-panel" id="trash-panel">
            <img src="https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20goes%20to%200/img/cookie_jar.png" class="alloc-char-img" alt="The Cookie Jar">
            <p class="alloc-char-name">The Cookie Jar</p>
            <div class="panel-name" style="visibility:hidden">Cookie Jar</div>
            <div class="cookie-plate" id="trash-plate"></div>
          </div>`;
      }

      function pPanelHTML() {
        return `
          <div class="p-pool-col">
            <img src="https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-%20v%20goes%20to%200/img/${trial.p_img}" class="alloc-char-img" alt="${trial.p_name}">
            <p class="alloc-char-name">${trial.p_name}</p>
            <div class="panel-name" id="p-panel-name">${trial.p_name} has ${trial.p_cookies} cookie${trial.p_cookies !== 1 ? 's' : ''}</div>
            ${pPlateHTML()}
          </div>`;
      }

      /* -------------------------------------------------------
         BUILD FULL SCREEN HTML
         Columns are assembled left-to-right per trial.character_order
         (e.g. "TRASH,P,V"), so P is no longer pinned to the middle —
         all 6 permutations of {P, V, Cookie Jar} are supported.
      ------------------------------------------------------- */
      const PANEL_BUILDERS = { P: pPanelHTML, V: vPanelHTML, TRASH: trashPanelHTML };
      const columnOrder  = trial.character_order.split(',').map(s => s.trim().toUpperCase());
      const columnsHTML  = columnOrder.map(key => PANEL_BUILDERS[key]()).join('');
      const confirmLabel = trial.locked ? 'Next' : (trial.is_practice ? 'Done' : 'Confirm');

      function needsDisabled() {
        return !trial.locked && (trial.require_v || trial.require_trash || trial.require_both || trial.require_from_v || trial.require_v_to_p);
      }

      const html = `
        <div class="allocation-screen${trial.corner_char_img ? ' has-corner-char' : ''}">
          ${trial.header_img ? `<img src="${trial.header_img}" class="allocation-header-img" alt="">` : ''}
          ${trial.harm_text        ? `<div class="allocation-harm-text">${trial.harm_text}</div>`         : ''}
          ${trial.instruction_text ? `<div class="allocation-instruction">${trial.instruction_text}</div>` : ''}
          ${trial.show_gate_question ? `
            <div id="gate-question" style="text-align:center; margin:0 0 6px 0;">
              <p style="font-size:18px; font-weight:600; margin:0 0 6px 0;">Now that you saw what happened, do you think anyone should be punished?</p>
              <div style="display:flex; gap:20px; justify-content:center;">
                <button id="gate-yes" class="jspsych-btn" style="padding:8px 28px; font-size:15px; margin-top:8px;">Yes</button>
                <button id="gate-no"  class="jspsych-btn" style="padding:8px 28px; font-size:15px; margin-top:8px;">No</button>
              </div>
            </div>
            <p id="move-instruction" style="display:none; text-align:center; font-size:18px; font-weight:600; margin:0 0 6px 0;">Please move cookies wherever you'd like.</p>
          ` : ''}
          <div class="allocation-columns">
            ${columnsHTML}
          </div>
          ${needsDisabled() ? `<div id="alloc-hint" class="alloc-hint-hidden"></div>` : ''}
          <div class="allocation-btn-row"${(trial.locked || trial.show_gate_question) ? ' style="display:none"' : ''}>
            <button id="confirm-btn" ${needsDisabled() ? 'disabled' : ''}>${confirmLabel}</button>
          </div>
        </div>
        ${trial.corner_char_img ? `
          <div class="video-frame-domain">
            <img src="${trial.corner_char_img}" class="corner-char-img" alt="">
          </div>
        ` : ''}
        <div id="drag-ghost">🍪</div>
      `;

      display_element.innerHTML = html;

      /* -------------------------------------------------------
         GATE QUESTION LISTENERS
      ------------------------------------------------------- */
      if (trial.show_gate_question) {
        const gateEl     = display_element.querySelector('#gate-question');
        const moveInstr  = display_element.querySelector('#move-instruction');
        const confirmRow = display_element.querySelector('.allocation-btn-row');

        display_element.querySelector('#gate-yes').addEventListener('click', () => {
          gate_rt        = Math.round(performance.now() - startTime) / 1000;
          allocStartTime = performance.now();
          display_element.querySelectorAll('.plate-cookie').forEach(el => el.classList.add('draggable'));
          gateEl.style.display     = 'none';
          moveInstr.style.display  = 'block';
          confirmRow.style.display = '';
          display_element.querySelector('#confirm-btn').disabled = true;
          moveInstructionAudio = document.createElement('audio');
          moveInstructionAudio.src = 'https://davdrose.github.io/legal_cognition/code/experiments/experiment1/children-shared%20files/Moving cookie instruction.m4a';
          moveInstructionAudio.style.display = 'none';
          document.body.appendChild(moveInstructionAudio);
          moveInstructionAudio.play().catch(() => {});
          moveInstructionAudio.addEventListener('ended', () => moveInstructionAudio.remove());
        });

        display_element.querySelector('#gate-no').addEventListener('click', () => {
          gate_rt = Math.round(performance.now() - startTime) / 1000;
          finishAllocation.call(this, true);
        });
      }

      /* -------------------------------------------------------
         HELPERS
      ------------------------------------------------------- */
      function countInZone(zone) {
        return cookieDest.filter(d => d === zone).length;
      }

      function updateConfirmBtn() {
        if (trial.locked) return;
        const btn    = display_element.querySelector('#confirm-btn');
        const hintEl = display_element.querySelector('#alloc-hint');
        const inV    = countInZone('v'), inTrash = countInZone('trash');
        const vToP   = vCookieDest.filter(d => d === 'p').length;
        let ok = true;
        let hintMsg = '';

        if (trial.require_both) {
          if (inV < 1 && inTrash < 1) { ok = false; hintMsg = `⚠️ Move at least one cookie to ${trial.v_name}'s plate and at least one to the Cookie Jar.`; }
          else if (inV < 1)           { ok = false; hintMsg = `⚠️ Don't forget to move a cookie to ${trial.v_name}'s plate too.`; }
          else if (inTrash < 1)       { ok = false; hintMsg = "⚠️ Don't forget to move a cookie to the Cookie Jar too."; }
        } else if (trial.require_v_to_p  && vToP < 1)                                         { ok = false; hintMsg = `⚠️ Move at least one of ${trial.v_name}'s cookies to ${trial.p_name}'s plate to continue.`; }
        else if   (trial.require_v      && inV < 1)                              { ok = false; hintMsg = `⚠️ Move at least one cookie to ${trial.v_name}'s plate to continue.`; }
        else if   (trial.require_trash  && inTrash < 1)                          { ok = false; hintMsg = "⚠️ Move at least one cookie to the Cookie Jar to continue."; }
        else if   (trial.require_from_v && vCookieDest.filter(d => d === 'trash').length < 1) { ok = false; hintMsg = `⚠️ Move at least one of ${trial.v_name}'s cookies to the Cookie Jar to continue.`; }
        else if   (inV + inTrash + vToP + vCookieDest.filter(d => d === 'trash').length < 1) { ok = false; }

        btn.disabled = !ok;
        if (hintEl) {
          hintEl.textContent = hintMsg;
          hintEl.className   = hintMsg ? 'alloc-hint-visible' : 'alloc-hint-hidden';
        }
      }

      function getCookieEl(id)  { return display_element.querySelector(`#p-cookie-${id}`); }
      function getVCookieEl(id) { return display_element.querySelector(`#v-existing-${id}`); }

      function updatePanelLabels() {
        const pLabelEl = display_element.querySelector('#p-panel-name');
        const vLabelEl = display_element.querySelector('#v-panel-name');
        if (pLabelEl) {
          const n = countInZone('pool');
          pLabelEl.textContent = `${trial.p_name} has ${n} cookie${n !== 1 ? 's' : ''}`;
        }
        if (vLabelEl) {
          const n = vCookieDest.filter(d => d === 'v').length + countInZone('v');
          vLabelEl.textContent = `${trial.v_name} has ${n} cookie${n !== 1 ? 's' : ''}`;
        }
      }

      function placeCookie(cookieEl, containerEl, left, top, zone, cookieId) {
        containerEl.appendChild(cookieEl);
        cookieEl.style.left  = left + 'px';
        cookieEl.style.top   = top  + 'px';
        cookieEl.style.opacity = '1';
        cookieDest[cookieId] = zone;
        updateConfirmBtn();
        updatePanelLabels();
      }

      function returnToPool(cookieId) {
        const pPlate = display_element.querySelector('#p-plate');
        const { left, top } = homePositions[cookieId];
        placeCookie(getCookieEl(cookieId), pPlate, left, top, 'pool', cookieId);
      }

      function returnVToPlate(vCookieId) {
        const vPlate = display_element.querySelector('#v-plate');
        const { left, top } = vFixedPositions[vCookieId];
        const cookieEl = getVCookieEl(vCookieId);
        vPlate.appendChild(cookieEl);
        cookieEl.style.left    = left + 'px';
        cookieEl.style.top     = top  + 'px';
        cookieEl.style.opacity = '1';
        vCookieDest[vCookieId] = 'v';
        updateConfirmBtn();
        updatePanelLabels();
      }

      /* -------------------------------------------------------
         DRAG AND DROP
      ------------------------------------------------------- */
      let dragging = null;
      const ghostEl = display_element.querySelector('#drag-ghost');

      function showGhost(x, y, sz) {
        const s = (sz !== undefined) ? sz : 52;
        ghostEl.style.display  = 'block';
        ghostEl.style.fontSize = s + 'px';
        ghostEl.style.left     = (x - s * 0.42) + 'px';
        ghostEl.style.top      = (y - s * 0.42) + 'px';
      }
      function hideGhost() { ghostEl.style.display = 'none'; }

      function clearDropHovers() {
        display_element.querySelectorAll('.drop-hover').forEach(el => el.classList.remove('drop-hover'));
      }

      display_element.addEventListener('mousedown', (e) => {
        const cookieEl = e.target.closest('.plate-cookie.draggable');
        if (!cookieEl) return;
        const pId = parseInt(cookieEl.dataset.cookieId);
        const vId = parseInt(cookieEl.dataset.vCookieId);
        if (!isNaN(pId))      { dragging = { cookieId: pId, isVCookie: false }; }
        else if (!isNaN(vId)) { dragging = { cookieId: vId, isVCookie: true  }; }
        else return;
        e.preventDefault();
        cookieEl.style.opacity = '0';
        showGhost(e.clientX, e.clientY);
      });

      display_element.addEventListener('click', (e) => {
        if (dragging) return;
        const cookieEl = e.target.closest('.plate-cookie.draggable');
        if (!cookieEl) return;
        const pId = parseInt(cookieEl.dataset.cookieId);
        const vId = parseInt(cookieEl.dataset.vCookieId);
        if (!isNaN(pId) && cookieDest[pId]  !== 'pool') returnToPool(pId);
        if (!isNaN(vId) && vCookieDest[vId] !== 'v')    returnVToPlate(vId);
      });

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup',   onMouseUp);

      function onMouseMove(e) {
        if (!dragging) return;
        showGhost(e.clientX, e.clientY);
        const target     = document.elementFromPoint(e.clientX, e.clientY);
        const vPlate     = display_element.querySelector('#v-plate');
        const pPlate     = display_element.querySelector('#p-plate');
        const trashPlate = display_element.querySelector('#trash-plate');
        clearDropHovers();
        if (dragging.isVCookie) {
          if (target?.closest('#trash-panel')) trashPlate.classList.add('drop-hover');
          else if (trial.allow_v_to_p && target?.closest('.p-pool-col')) pPlate.classList.add('drop-hover');
        } else {
          if      (target?.closest('#v-panel'))     vPlate.classList.add('drop-hover');
          else if (target?.closest('#trash-panel')) trashPlate.classList.add('drop-hover');
          else if (target?.closest('.p-pool-col'))  pPlate.classList.add('drop-hover');
        }
      }

      function onMouseUp(e) {
        if (!dragging) return;
        const { cookieId, isVCookie } = dragging;
        dragging = null;
        hideGhost();
        clearDropHovers();

        const cookieEl   = isVCookie ? getVCookieEl(cookieId) : getCookieEl(cookieId);
        const target     = document.elementFromPoint(e.clientX, e.clientY);
        const vPlate     = display_element.querySelector('#v-plate');
        const pPlate     = display_element.querySelector('#p-plate');
        const trashPlate = display_element.querySelector('#trash-plate');

        if (isVCookie) {
          if (target?.closest('#trash-panel')) {
            const pos = clampToPlate(trashPlate, e.clientX, e.clientY);
            trashPlate.appendChild(cookieEl);
            cookieEl.style.left    = pos.left + 'px';
            cookieEl.style.top     = pos.top  + 'px';
            cookieEl.style.opacity = '1';
            vCookieDest[cookieId]  = 'trash';
            updateConfirmBtn();
            updatePanelLabels();
          } else if (trial.allow_v_to_p && target?.closest('.p-pool-col')) {
            const pos = clampToPlate(pPlate, e.clientX, e.clientY);
            pPlate.appendChild(cookieEl);
            cookieEl.style.left    = pos.left + 'px';
            cookieEl.style.top     = pos.top  + 'px';
            cookieEl.style.opacity = '1';
            vCookieDest[cookieId]  = 'p';
            updateConfirmBtn();
            updatePanelLabels();
          } else {
            returnVToPlate(cookieId);
          }
        } else {
          if (target?.closest('#v-panel')) {
            const pos = clampToPlate(vPlate, e.clientX, e.clientY);
            placeCookie(cookieEl, vPlate, pos.left, pos.top, 'v', cookieId);
          } else if (target?.closest('#trash-panel')) {
            const pos = clampToPlate(trashPlate, e.clientX, e.clientY);
            placeCookie(cookieEl, trashPlate, pos.left, pos.top, 'trash', cookieId);
          } else if (target?.closest('.p-pool-col')) {
            if (target?.closest('#p-plate')) {
              const pos = clampToPlate(pPlate, e.clientX, e.clientY);
              placeCookie(cookieEl, pPlate, pos.left, pos.top, 'pool', cookieId);
            } else {
              returnToPool(cookieId);
            }
          } else {
            returnToPool(cookieId);
          }
        }
      }

      /* -------------------------------------------------------
         CONFIRM BUTTON
      ------------------------------------------------------- */
      function finishAllocation(doNothing) {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup',   onMouseUp);

        // Stop any narration audio still playing (gate question, move
        // instructions, demo audio, etc.) so it doesn't carry over and
        // overlap with the next screen's audio.
        document.querySelectorAll('audio').forEach(a => { a.pause(); a.remove(); });

        const fromPToV = doNothing ? 0 : countInZone('v');
        const fromPToC = doNothing ? 0 : countInZone('trash');
        const keptByP  = doNothing ? trial.p_cookies : countInZone('pool');
        const fromVToC = doNothing ? 0 : vCookieDest.filter(d => d === 'trash').length;
        const fromVToP = doNothing ? 0 : vCookieDest.filter(d => d === 'p').length;

        const finalGateRt = trial.show_gate_question
          ? gate_rt
          : (() => {
              const prev = this.jsPsych.data.get().last(1).values();
              return (prev.length > 0 && prev[0].trial_type === 'html-button-response') ? prev[0].rt / 1000 : null;
            })();
        const finalAllocRt = trial.show_gate_question
          ? (allocStartTime ? Math.round(performance.now() - allocStartTime) / 1000 : null)
          : Math.round(performance.now() - startTime) / 1000;

        this.jsPsych.finishTrial({
          scenario_id:         trial.scenario_id,
          harm_type:           trial.harm_type,
          event_title:         trial.event_title,
          p_name:              trial.p_name,
          v_name:              trial.v_name,
          v_initial:           trial.hud_v_cookies,
          v_after_harm:        trial.v_cookies_current,
          cookies_from_p_to_v: fromPToV,
          cookies_from_p_to_c: fromPToC,
          cookies_kept_by_p:   keptByP,
          cookies_from_v_to_p: fromVToP,
          cookies_from_v_to_c: fromVToC,
          do_nothing:          !!doNothing,
          character_order:     trial.character_order,
          is_practice:         trial.is_practice,
          gate_rt:             finalGateRt,
          allocation_rt:       finalAllocRt,
        });
      }

      display_element.querySelector('#confirm-btn').addEventListener('click', () => {
        finishAllocation.call(this, false);
      });

      /* -------------------------------------------------------
         AUTO DEMO
         Plays out one or more pickup → carry → drop moves using
         demo_moves: [{from:'p'|'v', to:'v'|'p'|'trash', cookie_id:N}]
         Falls back to legacy demo_cookie_id (p→v) if demo_moves is empty.
      ------------------------------------------------------- */
      if (trial.auto_demo) {
        const demoMoves = (trial.demo_moves && trial.demo_moves.length > 0)
          ? trial.demo_moves
          : [{ from: 'p', to: 'v', cookie_id: trial.demo_cookie_id ?? 0 }];

        const confirmBtn = display_element.querySelector('#confirm-btn');

        if (confirmBtn) {
          confirmBtn.disabled = true;
          if (trial.confirm_label) confirmBtn.textContent = trial.confirm_label;
        }

        const cornerEl = trial.corner_char_img
          ? display_element.querySelector('.corner-char-img')
          : null;

        const cursor = document.createElement('div');
        cursor.id = 'demo-cursor';
        cursor.innerHTML = `<img src="${trial.demo_char_img}" alt="${trial.demo_char_name}" style="transform:scaleX(-1); width:8.4vw;">`;
        display_element.appendChild(cursor);

        const cookieOffset = { x: 22, y: 16 };
        const setCursorPos = (p) => { cursor.style.left = p.x + 'px'; cursor.style.top = p.y + 'px'; };

        let homeTarget = null;
        if (cornerEl) {
          const r = cornerEl.getBoundingClientRect();
          homeTarget = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
          cornerEl.style.visibility = 'hidden';
          setCursorPos(homeTarget);
        } else {
          const firstKey = demoMoves[0].from === 'v' ? `#v-existing-${demoMoves[0].cookie_id}` : `#p-cookie-${demoMoves[0].cookie_id}`;
          const firstEl  = display_element.querySelector(firstKey);
          if (firstEl) { const cr = firstEl.getBoundingClientRect(); setCursorPos({ x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 }); }
        }

        function animate(from, to, duration, onStep, onDone) {
          const t0 = performance.now();
          function step(now) {
            const t = Math.min(1, (now - t0) / duration);
            const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
            const cur = { x: from.x + (to.x - from.x) * eased, y: from.y + (to.y - from.y) * eased };
            setCursorPos(cur);
            if (onStep) onStep(cur, t);
            if (t < 1) { requestAnimationFrame(step); } else { onDone(); }
          }
          requestAnimationFrame(step);
        }

        function playDemoAudio(src) {
          if (!src) return null;
          const a = document.createElement('audio');
          a.src = src; a.style.display = 'none';
          document.body.appendChild(a);
          a.play().catch(() => {});
          a.addEventListener('ended', () => a.remove());
          return a;
        }

        function getTargetPlate(to) {
          if (to === 'v')     return display_element.querySelector('#v-plate');
          if (to === 'p')     return display_element.querySelector('#p-plate');
          if (to === 'trash') return display_element.querySelector('#trash-plate');
          return null;
        }

        function updateStateAndPlace(move, cookieEl, targetPl, dropX, dropY) {
          const pos = clampToPlate(targetPl, dropX, dropY);
          if (move.from === 'p') {
            const zone = move.to === 'v' ? 'v' : move.to === 'trash' ? 'trash' : 'pool';
            placeCookie(cookieEl, targetPl, pos.left, pos.top, zone, move.cookie_id);
            // placeCookie calls updatePanelLabels() automatically
          } else {
            // V cookie — place inline and update vCookieDest
            targetPl.appendChild(cookieEl);
            cookieEl.style.left    = pos.left + 'px';
            cookieEl.style.top     = pos.top  + 'px';
            cookieEl.style.opacity = '1';
            vCookieDest[move.cookie_id] = move.to === 'p' ? 'p' : move.to === 'trash' ? 'trash' : 'v';
            updatePanelLabels();
          }
        }

        function runMoves(moveIdx, currentPos) {
          if (moveIdx >= demoMoves.length) {
            if (homeTarget) {
              animate(currentPos, homeTarget, 900, null, () => {
                cursor.remove();
                if (cornerEl) cornerEl.style.visibility = '';
                playDemoAudio(trial.demo_audio_after);
                if (confirmBtn) confirmBtn.disabled = false;
                if (trial.locked) setTimeout(() => finishAllocation.call(self, false), 1000);
              });
            } else {
              cursor.remove();
              playDemoAudio(trial.demo_audio_after);
              if (confirmBtn) confirmBtn.disabled = false;
              if (trial.locked) setTimeout(() => finishAllocation.call(self, false), 1000);
            }
            return;
          }

          const move     = demoMoves[moveIdx];
          const cookieEl = display_element.querySelector(move.from === 'v' ? `#v-existing-${move.cookie_id}` : `#p-cookie-${move.cookie_id}`);
          const targetPl = getTargetPlate(move.to);
          if (!cookieEl || !targetPl) { runMoves(moveIdx + 1, currentPos); return; }

          const cr = cookieEl.getBoundingClientRect();
          const cookiePt = { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };

          animate(currentPos, cookiePt, 900, null, () => {
            cursor.classList.add('grabbing');
            cookieEl.style.opacity = '0';
            showGhost(cookiePt.x + cookieOffset.x, cookiePt.y + cookieOffset.y, 52);

            const tr = targetPl.getBoundingClientRect();
            const dropPt = { x: tr.left + tr.width / 2, y: tr.top + tr.height / 2 };

            animate(cookiePt, dropPt, 2200,
              (cur) => showGhost(cur.x + cookieOffset.x, cur.y + cookieOffset.y),
              () => {
                hideGhost();
                cursor.classList.remove('grabbing');
                updateStateAndPlace(move, cookieEl, targetPl, dropPt.x, dropPt.y);
                setTimeout(() => runMoves(moveIdx + 1, dropPt), 350);
              }
            );
          });
        }

        function startDemoAnimation() {
          const startPos = homeTarget || (() => {
            const firstKey = demoMoves[0].from === 'v' ? `#v-existing-${demoMoves[0].cookie_id}` : `#p-cookie-${demoMoves[0].cookie_id}`;
            const el = display_element.querySelector(firstKey);
            if (!el) return { x: 0, y: 0 };
            const cr = el.getBoundingClientRect();
            return { x: cr.left + cr.width / 2, y: cr.top + cr.height / 2 };
          })();
          runMoves(0, startPos);
        }

        if (trial.demo_audio_before) {
          const beforeAudio = playDemoAudio(trial.demo_audio_before);
          beforeAudio.addEventListener('ended', () => setTimeout(startDemoAnimation, 500));
        } else {
          setTimeout(startDemoAnimation, 1000);
        }
      }

    } // end trial()
  } // end class

  AllocationPlugin.info = info;
  return AllocationPlugin;

})(jsPsychModule);

const jsPsych = initJsPsych({
  show_progress_bar: true,
  // Stops any narration still playing from the screen just finished, so it
  // never overlaps with the next screen's audio when a child clicks Next
  // (or Continue/Got it!) before a clip has finished.
  on_trial_finish: function () {
    document.querySelectorAll('audio').forEach(a => { a.pause(); a.remove(); });
  },
  on_finish: function () {
    const trials = jsPsych.data.get().values()
      .filter(row => row.is_practice === false && !row.is_demographic)
      .sort((a, b) => a.scenario_id - b.scenario_id);
    const demographics = jsPsych.data.get().filter({ is_demographic: true }).values();
    console.log('Experiment complete. Trials:', trials, 'Demographics:', demographics);
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
// Between-subjects outcome condition: each participant is randomly assigned
// to either the "v above 0" or "v goes to 0" version of this experiment,
// instead of those being two separately-linked studies. Drawn once and
// held fixed for the whole session.
const OUTCOME_CONDITION = sessionGet('exp1_children_switcher_outcome_condition', () => Math.random() < 0.5 ? 'above' : 'zero');
if (OUTCOME_CONDITION === 'above') { BASE_IMG = BASE_IMG_ABOVE0; }

const CHARACTER_ORDER = sessionGet('exp1_children_switcher_char_order', () => shuffle3(['P', 'V', 'TRASH']));
const P_BEFORE_V = CHARACTER_ORDER.indexOf('P') < CHARACTER_ORDER.indexOf('V');

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
        <img src="${BASE_IMG}${imgFile}" class="char-img intro-img" alt="${name}">
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
        <img src="${BASE_IMG}${pImg}" class="char-img" alt="${pName}">
        <p class="person-name">${pName}</p>
        ${showSlots   ? `<div class="cookie-label">${pLabel}</div>${cookieGridHTML(pCookies, 5, 'large', animate)}` : ''}
        ${showCookies ? `<div class="cookie-label">${pLabel}</div>${freeCookiesHTML(pCookies, animate)}` : ''}
      </div>
      <div class="person-col">
        <img src="${BASE_IMG}${vImg}" class="char-img" alt="${vName}">
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
    v_initial: OUTCOME_CONDITION === 'above' ? 5 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 3 : 0, harm_amount: 2,
    event_text: 'Finn spills water and doesn\'t clean it up. Cleo slips on the wet floor and 2 of Cleo\'s cookies are destroyed.',
    event_title: 'Finn Spills Water — Cleo Slips',
    story_slides: [BASE_IMG + 'trailppt/finn_cleo/finn_cleo_1.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_2.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_3.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_4.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_5.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_6.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_7.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_8.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_9.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_10.png',BASE_IMG + 'trailppt/finn_cleo/finn_cleo_11.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/finn%20and%20cleo%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/finn%20and%20cleo%20vgo0.mov'
  }
];

// Second block — always after Finn & Cleo, randomized among themselves
const secondBlockScenarios = [
  {
    id: 5,
    p_name: 'Milo', v_name: 'Sasha', p_img: 'Milo.png', v_img: 'Sasha.png',
    harm_type: 'intentional',
    p_cookies: 5, p_after: 5,
    v_initial: OUTCOME_CONDITION === 'above' ? 5 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 3 : 0, harm_amount: 2,
    event_text: 'Milo is angry at Sasha. He walks over and deliberately knocks off 2 of Sasha\'s cookies.',
    event_title: 'Milo Knocks Sasha\'s Cookies',
    story_slides: [BASE_IMG + 'trailppt/milo_sasha/milo_sasha_1.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_2.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_3.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_4.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_5.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_6.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_7.png',BASE_IMG + 'trailppt/milo_sasha/milo_sasha_8.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/milo%20and%20sasha%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/milo%20and%20sasha%20vgo0.mov'
  },
  {
    id: 6,
    p_name: 'Zoe', v_name: 'Rex', p_img: 'zoe.png', v_img: 'rex.png',
    harm_type: 'intentional',
    p_cookies: 7, p_after: 7,
    v_initial: OUTCOME_CONDITION === 'above' ? 7 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 5 : 0, harm_amount: 2,
    event_text: 'Zoe wants Rex to have fewer cookies. She deliberately throws away 2 of Rex\'s cookies.',
    event_title: 'Zoe Throws Rex\'s Cookies Away',
    story_slides: [BASE_IMG + 'trailppt/rex_zoe/rex_zoe_1.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_2.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_3.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_4.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_5.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_6.png',BASE_IMG + 'trailppt/rex_zoe/rex_zoe_7.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/rex%20and%20zoe%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/rex%20and%20zoe%20vgo0.mov'
  },
  {
    id: 7,
    p_name: 'Kai', v_name: 'Ruby', p_img: 'kai.png', v_img: 'Ruby.png',
    harm_type: 'negligent',
    p_cookies: 7, p_after: 7,
    v_initial: OUTCOME_CONDITION === 'above' ? 7 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 5 : 0, harm_amount: 2,
    event_text: 'Kai walks without looking where he is going and bumps into Ruby. 2 of Ruby\'s cookies fall off.',
    event_title: 'Kai Bumps Into Ruby',
    story_slides: [BASE_IMG + 'trailppt/kai_ruby/kai_ruby_1.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_2.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_3.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_4.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_5.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_6.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_7.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_8.png',BASE_IMG + 'trailppt/kai_ruby/kai_ruby_9.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/kai%20and%20ruby%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/kai%20and%20ruby%20vgo0.mov'
  },
  {
    id: 8,
    p_name: 'Sam', v_name: 'Ella', p_img: 'sam.png', v_img: 'ella.png',
    harm_type: 'strict_liability',
    p_cookies: 5, p_after: 5,
    v_initial: OUTCOME_CONDITION === 'above' ? 5 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 3 : 0, harm_amount: 2,
    event_text: 'Sam is walking his dog on a leash when the dog breaks free and eats 2 of Ella\'s cookies.',
    event_title: 'Sam\'s Dog Eats Ella\'s Cookies',
    story_slides: [BASE_IMG + 'trailppt/sam_ella/sam_ella_1.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_2.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_3.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_4.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_5.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_6.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_7.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_8.png',BASE_IMG + 'trailppt/sam_ella/sam_ella_9.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/sam%20and%20ella%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/sam%20and%20ella%20vgo0.mov'
  },
  {
    id: 9,
    p_name: 'Catherine', v_name: 'Andy', p_img: 'catherine.png', v_img: 'andy.png',
    harm_type: 'strict_liability',
    p_cookies: 7, p_after: 7,
    v_initial: OUTCOME_CONDITION === 'above' ? 7 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 5 : 0, harm_amount: 2,
    event_text: 'Andy and Catherine bumped into each other accidentally. Catherine\'s wolf ate 2 of Andy\'s cookies.',
    event_title: 'Catherine\'s Wolf Eats Andy\'s Cookies',
    story_slides: [BASE_IMG + 'trailppt/andy_catherine/andy_catherine_1.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_2.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_3.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_4.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_5.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_6.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_7.png',BASE_IMG + 'trailppt/andy_catherine/andy_catherine_8.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/andy%20and%20catherine%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/andy%20and%20catherine%20vgo0.mov'
  },
  {
    id: 10,
    p_name: 'Tony', v_name: 'Katie', p_img: 'tony.png', v_img: 'katie.png',
    harm_type: 'control',
    p_cookies: 5, p_after: 5,
    v_initial: OUTCOME_CONDITION === 'above' ? 5 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 3 : 0, harm_amount: 2,
    event_text: 'Katie and Tony are having a picnic when a gust of wind blows 2 of Katie\'s cookies away.',
    event_title: 'Wind Blows Away Katie\'s Cookies',
    story_slides: [BASE_IMG + 'trailppt/harry_katie/harry_katie_1.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_2.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_3.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_4.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_5.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_6.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_7.png',BASE_IMG + 'trailppt/harry_katie/harry_katie_8.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/harry%20and%20katie%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/harry%20and%20katie%20vgo0.mov'
  },
  {
    id: 11,
    p_name: 'Nora', v_name: 'Eric', p_img: 'nora.png', v_img: 'eric.png',
    harm_type: 'control',
    p_cookies: 7, p_after: 7,
    v_initial: OUTCOME_CONDITION === 'above' ? 7 : 2, v_after_harm: OUTCOME_CONDITION === 'above' ? 5 : 0, harm_amount: 2,
    event_text: 'While Eric is tying his shoelaces, a squirrel eats 2 of Eric\'s cookies.',
    event_title: 'Squirrel Eats Eric\'s Cookies',
    story_slides: [BASE_IMG + 'trailppt/nora_eric/nora_eric_1.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_2.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_3.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_4.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_5.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_6.png',BASE_IMG + 'trailppt/nora_eric/nora_eric_7.png'],
    story_video: OUTCOME_CONDITION === 'above'
      ? BASE_VID_ABOVE0 + 'videos%20v%20above%200/nora%20and%20eric%20above%200.mov'
      : BASE_VID_VGO0   + 'videos%20vgo0/nora%20and%20eric%20vgo0.mov'
  }
];

/* ----------------------------------------------------------
   CONSENT SCREEN (first page of study)
   ---------------------------------------------------------- */
/* ----------------------------------------------------------
   WARMUP TIMELINE
   ---------------------------------------------------------- */

// Slide 0 – Welcome screen
const welcomeScreen = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="welcome-video" src="${BASE_SHARED}overall_study_intro.mov" autoplay playsinline
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
      <video id="intro-maggie-video" src="${BASE_SHARED}children%20-%20welcome%20page.mov" autoplay playsinline
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    // NOTE: this filename doesn't exist in children-shared files yet — the
    // old recording says "If you think anyone..." without "In our game,".
    // Needs a fresh recording of the updated line; the 'error' fallback
    // below keeps this locked screen from stalling until it's added.
    audio.src = BASE_SHARED + 'In our game, if you think anyone should be punished, you can decide how they lose their cookies.m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'They can lose cookies in two ways..m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  auto_demo: true,
  demo_cookie_id: 0,
  demo_char_img: BASE_SHARED + 'maggie.png',
  demo_char_name: 'Maggie',
  demo_text: "Watch me! I'll move one of Michael's cookies to Claire's plate! 🍪",
  demo_text_after: "Great! Now you try!",
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: BASE_SHARED + 'First, you can punish them by giving their cookies to another person..m4a',
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'Now you try! Move one of Michael’s cookies to Claire’s plate.m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'Now you try! Move one of Claire\'s cookies to Michael\'s plate..m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  auto_demo: true,
  demo_moves: [{ from: 'p', to: 'trash', cookie_id: 0 }],
  demo_char_img: BASE_SHARED + 'maggie.png',
  demo_char_name: 'Maggie',
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: BASE_SHARED + 'Second, you can punish them by putting cookies in the cookie jar..m4a',
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'Now you try! Move one of Michael\'s cookies to the Cookie Jar..m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'Now you try! Move one of Claire\'s cookies to the Cookie Jar..m4a';
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  auto_demo: true,
  demo_moves: [{ from: 'p', to: 'v', cookie_id: 0 }, { from: 'p', to: 'trash', cookie_id: 1 }],
  demo_char_img: BASE_SHARED + 'maggie.png',
  demo_char_name: 'Maggie',
  confirm_label: "Got it! Now I'll try!",
  demo_audio_before: BASE_SHARED + 'Ok, so in our game you can decide that someone should lose cookies.m4a',
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
  corner_char_img: BASE_SHARED + 'maggie.png',
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'Now you try! Take a cookie and give it to Claire, and take one and put it in the cookie jar..m4a';
    audio.style.display = 'none';
    document.body.appendChild(audio);
    audio.play().catch(() => {});
    audio.addEventListener('ended', () => audio.remove());
  },
};

// Slide 3 – Practice confirmation
const warmupFinishVideo = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="display:flex; flex-direction:column; align-items:center; gap:16px; padding-top:20px;">
      <video id="warmup-finish-video" src="${BASE_SHARED}warmup_finish.mov" autoplay playsinline
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
      <video id="test-case-intro-video" src="${BASE_SHARED}test_case_intro.mov" autoplay playsinline
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
   TWO-BAR FAULT WIDGET — shared helpers
   Ported from experiment2 children (slider variant). Volume-bar style:
   narrow + see-through at 0, wide + full red at 100.
   ---------------------------------------------------------- */
const MAGGIE_IMG = BASE_SHARED + 'maggie.png';

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

function setScaleValue(id, who, val) {
  const wrap = document.getElementById(`${id}-${who}-wrap`);
  const fill = document.getElementById(`${id}-${who}-fill`);
  if (!wrap || !fill) return;
  wrap.style.width = val + '%';
  fill.style.background = `rgba(217, 33, 33, ${Math.max(0, Math.min(1, val / 100))})`;
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
        <img id="${id}-corner" src="${MAGGIE_IMG}" class="corner-char-img" alt="">
      </div>
      <div id="${id}-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
        <img src="${MAGGIE_IMG}" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
      </div>
      <div style="text-align:center; padding:10px 20px 0 20px; max-width:1200px; margin:0 auto;">
        <p id="${id}-text" style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.2;">${ruleText}</p>
        ${twoScaleHTML(id, 'Claire', 'Michael', false, BASE_IMG + 'claire.png', BASE_IMG + 'michael.png', P_BEFORE_V, true)}
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
            showClickEffect(trackPosAtVal(firstTrack, 0));
            setTimeout(() => {
              animateBarValue(firstKey, 0, firstTarget, 1100, firstTrack, () => {
                setTimeout(() => {
                  animateCursorTo(trackPosAtVal(firstTrack, firstTarget), trackPosAtVal(secondTrack, 0), 700, () => {
                    showClickEffect(trackPosAtVal(secondTrack, 0));
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
        ${twoScaleHTML(id, 'Claire', 'Michael', true, BASE_IMG + 'claire.png', BASE_IMG + 'michael.png', P_BEFORE_V, true)}
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
      ${twoScaleHTML('bei', 'Claire', 'Michael', false, BASE_IMG + 'claire.png', BASE_IMG + 'michael.png', P_BEFORE_V)}
    </div>`,
  on_load: function() {
    const audio = document.createElement('audio');
    audio.src = BASE_SHARED + 'In our game, each person has a bar. The bars show how much each person is at fault..m4a';
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
      <img id="hsaf-corner" src="${MAGGIE_IMG}" class="corner-char-img" alt="">
    </div>
    <div id="hsaf-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
      <img src="${MAGGIE_IMG}" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
    </div>
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is at fault, click their bar to make it red. The more red in their bar, the more at fault they are.</p>
      ${twoScaleHTML('hsaf', 'Claire', 'Michael', false, BASE_IMG + 'claire.png', BASE_IMG + 'michael.png', P_BEFORE_V)}
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
    audio.src = BASE_SHARED + 'If someone is at fault, click their bar to make it red. The more red in their bar, the more at fault they are..m4a';
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
      <img id="hsnaf-corner" src="${MAGGIE_IMG}" class="corner-char-img" alt="">
    </div>
    <div id="hsnaf-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
      <img src="${MAGGIE_IMG}" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
    </div>
    <div style="text-align:center; padding:20px 20px 0 20px; max-width:1200px; margin:0 auto;">
      <p style="font-size:26px; color:#555; text-align:center; max-width:850px; margin:0 auto 2px auto; line-height:1.3;">If someone is not at fault at all, click the very beginning of their bar. Their bar will stay gray.</p>
      ${twoScaleHTML('hsnaf', 'Claire', 'Michael', false, BASE_IMG + 'claire.png', BASE_IMG + 'michael.png', P_BEFORE_V)}
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
    audio.src = BASE_SHARED + 'If someone is not at fault at all, click the very beginning of their bar. Their bar will stay gray..m4a';
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

const scaleDemo1 = buildScaleDemoTrial(
  'sd1', 'Claire at fault only',
  "In our game, if Claire is at fault but Michael is not at fault, Claire's bar should have some red, and Michael's bar should stay gray. Let's see Maggie do it.",
  85, 0,
  false,
  undefined,
  `${BASE_SHARED}In our game, if Claire is at fault but Michael is not at fault,.m4a`
);
const scalePractice1 = buildScalePracticeTrial(
  'sp1', 'Claire at fault only',
  "Now you try! Show that Claire is at fault and Michael is not at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && v >= 40 && p <= 2,
  "⚠️ Show that Claire is at fault and Michael is not at fault.",
  `${BASE_SHARED}Now you try! Show that Claire is at fault and Michael is not at fault.m4a`
);

const scaleDemo2 = buildScaleDemoTrial(
  'sd2', 'Michael at fault only',
  "In our game, if Michael is at fault but Claire is not at fault, Michael's bar should have some red, and Claire's bar should stay gray. Let's see Maggie do it.",
  0, 85,
  false,
  undefined,
  `${BASE_SHARED}In our game, if Michael is at fault but Claire is not at fault,.m4a`
);
const scalePractice2 = buildScalePracticeTrial(
  'sp2', 'Michael at fault only',
  "Now you try! Show that Michael is at fault and Claire is not at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && p >= 40 && v <= 2,
  "⚠️ Show that Michael is at fault and Claire is not at fault.",
  `${BASE_SHARED}Now you try! Show that Michael is at fault and Claire is not at fault.m4a`
);

const scaleDemo3 = buildScaleDemoTrial(
  'sd3', 'Claire more at fault',
  "Sometimes both people can be at fault, but one person can be more at fault than the other. If Claire is more at fault than Michael, Claire's bar should have more red. Let's see Maggie do it.",
  70, 30,
  false,
  undefined,
  `${BASE_SHARED}Sometimes both people can be at fault, but one person can be more at fault than the other. If.m4a`
);
const scalePractice3 = buildScalePracticeTrial(
  'sp3', 'Claire more at fault',
  "Now you try! Give both Claire and Michael some fault, but make Claire's bigger.",
  (v, p, tv, tp) => tv && tp && v > p + 15 && p >= 15,
  "⚠️ Give both some fault, but make Claire's bar bigger than Michael's.",
  `${BASE_SHARED}Now you try! Give both Claire and Michael some fault, but make Claire's bigger.m4a`
);

const scaleDemo4 = buildScaleDemoTrial(
  'sd4', 'Equally at fault',
  "If Claire and Michael are equally at fault, their bars should have the same amount of red. Let's see Maggie do it.",
  55, 55,
  false,
  undefined,
  `${BASE_SHARED}If Claire and Michael are equally at fault,.m4a`
);
const scalePractice4 = buildScalePracticeTrial(
  'sp4', 'Equally at fault',
  "Now you try! Make Claire's and Michael's bars the same size.",
  // "Equally at fault" allows a small +/-2 margin.
  (v, p, tv, tp) => tv && tp && Math.abs(v - p) <= 2 && v >= 25,
  "⚠️ Make Claire's and Michael's bars exactly the same size.",
  `${BASE_SHARED}Now you try! Make Claire's and Michael's bars the same size.m4a`
);

const scaleDemo5 = buildScaleDemoTrial(
  'sd5', 'Neither at fault',
  "If neither Claire nor Michael is at fault, both bars should stay gray. Let's see Maggie do it.",
  0, 0,
  false,
  undefined,
  `${BASE_SHARED}If neither Claire nor Michael is at fault, both bars should stay gray..m4a`
);
const scalePractice5 = buildScalePracticeTrial(
  'sp5', 'Neither at fault',
  "Now you try! Show that neither Claire nor Michael is at fault.",
  // "Not at fault" allows a small 0-2 margin.
  (v, p, tv, tp) => tv && tp && v <= 2 && p <= 2,
  "⚠️ Show that neither Claire nor Michael is at fault.",
  `${BASE_SHARED}Now you try! Show that neither Claire nor Michael is at fault.m4a`
);

/* ----------------------------------------------------------
   CHECKER-QUESTION WARMUP — shared helpers
   ---------------------------------------------------------- */
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
        <img id="${id}-corner" src="${MAGGIE_IMG}" class="corner-char-img" alt="">
      </div>
      <div id="${id}-cursor" style="position:fixed; pointer-events:none; z-index:1; visibility:hidden;">
        <img src="${MAGGIE_IMG}" alt="Maggie" style="width:8.4vw; transform:scaleX(-1);">
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
            showClickEffect(btnPos(targetBtn));
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
  ? BASE_SHARED + 'Now let\'s think about Claire. If you think Claire was careful, click the green yes mark.m4a'
  : BASE_SHARED + 'In our game, you can also decide if Claire and Michael were careful. If you think Claire w.m4a';
const checkerNoRuleText = P_BEFORE_V
  ? "In our game, you can also decide if Michael and Claire were careful. If you think Michael was not careful, click the red no mark. Let's watch Maggie try it."
  : "Now let's think about Michael. If you think Michael was not careful, click the red no mark. Let's watch Maggie try it.";
const checkerNoRuleAudio = P_BEFORE_V
  ? BASE_SHARED + 'In our game, you can also decide if Michael and Claire were careful. If you think Michael was not careful, click the red no mark.m4a'
  : BASE_SHARED + 'Now let\'s think about Michael. If you think Michael was not careful, click the red no mark.m4a';

const checkerDemoYes = buildCheckerDemoTrial(
  'cd1', 'Yes (careful)',
  checkerYesRuleText,
  'Claire', BASE_IMG + 'claire.png', 'yes',
  checkerYesRuleAudio,
  BASE_SHARED + 'Was Claire being careful%3F.m4a'
);
const checkerPracticeYes = buildCheckerPracticeTrial(
  'cp1', 'Yes (careful)',
  "Now you try! Click the green yes mark for Claire.",
  'Claire', BASE_IMG + 'claire.png', 'yes',
  '⚠️ Click the green checkmark for Yes.',
  BASE_SHARED + 'Now you try! Click the green yes mark for Claire.m4a'
);

const checkerDemoNo = buildCheckerDemoTrial(
  'cd2', 'No (not careful)',
  checkerNoRuleText,
  'Michael', BASE_IMG + 'michael.png', 'no',
  checkerNoRuleAudio,
  BASE_SHARED + 'Was Michael being careful%3F.m4a'
);
const checkerPracticeNo = buildCheckerPracticeTrial(
  'cp2', 'No (not careful)',
  "Now you try! Click the red no mark for Michael.",
  'Michael', BASE_IMG + 'michael.png', 'no',
  '⚠️ Click the red cross for No.',
  BASE_SHARED + 'Now you try! Click the red no mark for Michael.m4a'
);

// Whichever character is on the left (per CHARACTER_ORDER) is asked about
// first here too, matching the real checker trials.
const checkerWarmupBlock = P_BEFORE_V
  ? [checkerDemoNo, checkerPracticeNo, checkerDemoYes, checkerPracticeYes]
  : [checkerDemoYes, checkerPracticeYes, checkerDemoNo, checkerPracticeNo];

/* ----------------------------------------------------------
   FAULT QUESTION TRIAL BUILDER (two-bar widget)
   Shown after the punishment/allocation screen.
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
        ${twoScaleHTML(id, vName, pName, true, `${BASE_IMG}${vImg}`, `${BASE_IMG}${pImg}`, P_BEFORE_V, true)}
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
      questionAudio.src = BASE_SHARED + 'Now that you saw what happened, how much do you think each person is at fault%3F.m4a';
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
      <div style="text-align:center; padding:8px 40px 0 40px; max-width:860px; margin:0 auto;">
        <img src="${endingImg}" style="max-width:820px; width:100%; max-height:min(30vh, 240px); object-fit:contain; border-radius:8px; margin-bottom:14px;">
        <img src="${BASE_IMG}${targetImg}" alt="${targetName}" style="width:88px; height:88px; object-fit:contain; border-radius:50%; margin-bottom:10px;">
        <p style="font-size:24px; font-weight:600;">Was ${targetName} being careful?</p>
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
      questionAudio.src = `${BASE_SHARED}Was ${targetName} being careful%3F.m4a`;
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
      audio.src = BASE_SHARED + 'Allocation screen question.m4a';
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audio.play().catch(() => {});
      audio.addEventListener('ended', () => audio.remove());
      const stopAudio = () => { audio.pause(); audio.remove(); };
      document.getElementById('gate-yes')?.addEventListener('click', stopAudio);
      document.getElementById('gate-no')?.addEventListener('click', stopAudio);
    },
  };

  const faultQuestionSlide = buildFaultQuestionTrial(scenario);
  // Ask about both characters' carefulness, order randomized per scenario
  // rather than always asking about the actor first.
  const actorFirst = sessionGet('exp1_children_switcher_checker_order_' + scenario.id, () => Math.random() < 0.5);
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
const shuffledAll = sessionGet('exp1_shuffle_all',
  () => jsPsych.randomization.shuffle(allScenarios.map((_, i) => i))
).map(i => allScenarios[i]);
const totalTrials = shuffledAll.length;
const testBlock = [];
shuffledAll.forEach((scenario, idx) => {
  buildTestTrial(scenario, idx, totalTrials).forEach(t => testBlock.push(t));
});

/* ----------------------------------------------------------
   DEBUG LABELS (read by researcher panel — harmless in production)
   ---------------------------------------------------------- */
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

/* ----------------------------------------------------------
   RUN
   ---------------------------------------------------------- */
const timeline = [
  ...warmupBlock,
  ...testBlock,
];

//  CHS-SPECIFIC FRAMES
//  (These replace the Lookit EFP frames for webcam config, consent,
//   recording, and exit survey.)
// ════════════════════════════════════════════════════════════════════

const video_config = {
    type: chsRecord.VideoConfigPlugin
    // locale: 'zh'  // uncomment to change language
};

const video_consent = {
    type: chsRecord.VideoConsentPlugin,
    PIName:      'Shaun Nichols',
    institution: 'Cornell University',
    PIContact:   'Shaun Nichols at sbn44@cornell.edu',
    purpose:     'This study is about how children think about causation, fault, and responsibility — specifically, how they decide what should happen when one person causes another person to lose something they value.',
    procedures:  'Your child will watch short videos about two fictional characters. After each video, your child will decide whether to move cookies between the characters, or put them in a cookie jar.',
    risk_statement: 'There are no expected risks to participation.',
    payment:     'After you finish the study, we will email you a $5 Amazon gift card within approximately 3–5 business days.',
    research_rights_statement: 'This research has been reviewed and approved by an Institutional Review Board (“IRB”) for Human Participants at Cornell University, a group of people who oversee research involving humans as participants. Information to help you understand research is on-line at http://www.irb.cornell.edu. You may talk to an IRB staff member at (607) 255-5138 for any of the following: 1) Your questions, concerns, or complaints are not being answered by the research team; 2) you cannot reach the research team; 3) you want to talk to someone besides the research team; 4) you have questions about your rights as a research subject; 5) you want to get information or provide input about this research. You may also report concerns or complaints anonymously through Ethicspoint online at www.hotline.cornell.edu or by calling toll free at 1-866-293-3077.',
    include_databrary: true
};

const instructions = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="instructions-box">
            <h2>Overview</h2>
            <ul>
                <li>The study takes about 25 minutes.</li>
                <li>Your child will watch short videos and decide whether to move cookies between characters, or put them in a cookie jar.</li>
                <li>There are no right or wrong answers.</li>
            </ul>
            <p><strong>For parents:</strong> Please help keep your child's attention,
               but don't tell them which answer to choose.</p>
        </div>`,
    choices: ['Start ▶'],
    data: { trial_type: 'instructions' }
};

const start_recording = { type: chsRecord.StartRecordPlugin };
const stop_recording  = { type: chsRecord.StopRecordPlugin  };

const debrief_page = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <div class="instructions-box" style="max-width: 800px; margin: 40px auto; text-align: left; line-height: 1.7; font-family: Arial, sans-serif;">
            <h1 style="text-align: center; margin-bottom: 30px; font-size: 2.2em; font-weight: normal; color: #333;">Thank you!</h1>
            
            <p style="margin-bottom: 1.5em; font-size: 1.05em; color: #444;">This study is part of our ongoing research examining how children reason about causation, fault, and punishment when one person causes another person to lose something they value.</p>
            
            <p style="margin-bottom: 1.5em; font-size: 1.05em; color: #444;">In our previous work, we examined how children and adults decide whether someone should be punished for causing harm, and how that decision changes depending on whether the harm was caused on purpose or by accident. We wanted to build on this work by adding two new elements: first, a wider range of causes for the harm — from deliberate actions, to carelessness, to accidents that are truly nobody's fault (like a pet running off or a gust of wind); and second, letting your child decide not just whether someone should be punished, but how — by choosing whether to take cookies away from the person responsible and give them to the person who was harmed, or put them in a cookie jar where no one gets them.</p>
            
            <p style="margin-bottom: 1.5em; font-size: 1.05em; color: #444;">We are interested in how children's judgments of causation, fault, and punishment develop, particularly in how they distinguish intentional actions, carelessness, and accidents, and how that shapes the way they choose to respond.</p>
            
            <p style="margin-bottom: 1.5em; font-size: 1.05em; color: #444;"><strong>Compensation:</strong> As a reminder, you will receive a $5 Amazon.com gift card via email within approximately a week of completing the study.</p>
            
            <p style="margin-bottom: 2em; font-size: 1.05em; color: #444;">This experiment specifically tests how children's choice of punishment — giving the person's cookies to the one who was harmed, versus putting them in a cookie jar where no one benefits — changes depending on whether the harm was caused on purpose, through carelessness, or by pure accident. This research is conducted by Dr. Shaun Nichols and the Explanation Lab. If you have any questions, please contact us at <a href="mailto:sbn44@cornell.edu" style="color: #337ab7; text-decoration: none;">sbn44@cornell.edu</a>. Thank you again for your participation!</p>
            
            <p style="margin-bottom: 2em; font-size: 1.05em; color: #444;">If you'd like to learn more about this topic, check out [TED talk / popular-science article / educational video link here], or see our published research: <a href="https://davdrose.github.io/assets/pdf/cause_fault_cog_sci.pdf" target="_blank" style="color: #337ab7; text-decoration: none;">this paper</a>.</p>
            
            <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
                <button id="fb-share-btn" class="jspsych-btn" style="background-color: #3b5998; color: white; border: none; padding: 12px 24px; font-size: 1.1em; border-radius: 4px; cursor: pointer; margin-right: 15px; font-weight: bold;">Share this study on Facebook!</button>
                <button id="exit-btn" class="jspsych-btn" style="background-color: #5cb85c; color: white; border: none; padding: 12px 24px; font-size: 1.1em; border-radius: 4px; cursor: pointer; font-weight: bold;">Exit</button>
            </div>
        </div>
    `,
    choices: "NO_KEYS",
    on_load: function() {
        const fbBtn = document.getElementById('fb-share-btn');
        if (fbBtn) {
            fbBtn.addEventListener('click', function() {
                const studyUrl = window.location.href;
                const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(studyUrl)}`;
                window.open(fbShareUrl, '_blank');
            });
        }
        const exitBtn = document.getElementById('exit-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', function() {
                window.location.href = "https://childrenhelpingscience.com/studies/history/";
            });
        }
    },
    data: { trial_type: 'debrief' }
};

const chsTimeline = [
  video_config,
  video_consent,
  instructions,
  start_recording,
  ...timeline,
  stop_recording,
  debrief_page,
];

/* ============================================================
   RESEARCHER DEBUG PANEL — JUMP TO ANY SCREEN
   Hidden by default for public / participant deployment.
   To reveal it (researcher use only), set SHOW_DEBUG_PANEL = true.
   ============================================================ */
const SHOW_DEBUG_PANEL = true;  // ← change to true to show the Jump-to-Screen panel

(function () {
  // Public deployment: panel stays hidden — just run the CHS-wrapped
  // timeline (consent/recording included) normally.
  if (!SHOW_DEBUG_PANEL) {
    jsPsych.run(chsTimeline);
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

  const POSITION_LABELS = { P: 'P', V: 'V', TRASH: 'Cookie Jar' };
  const positionLine = CHARACTER_ORDER.map(k => POSITION_LABELS[k]).join(' — ');

  const panel = document.createElement('div');
  panel.id = 'researcher-debug-panel';
  panel.innerHTML = `
    <div id="rdp-title">🔬 Researcher: Jump to Screen</div>
    <div id="rdp-position">Position: ${positionLine}</div>
    <select id="rdp-select">${options}</select>
    <button id="rdp-jump">▶ Jump</button>
    <button id="rdp-reroll" title="Draw a new random P/V/Cookie Jar position">🎲 Re-roll position</button>
    <button id="rdp-reroll-study" title="Randomly re-draw the v-above-0 / v-goes-to-0 outcome condition">🔀 Re-roll study</button>
    <button id="rdp-clear" title="Clear saved trial data">🗑 Clear data</button>
  `;
  document.body.appendChild(panel);

  document.getElementById('rdp-jump').addEventListener('click', () => {
    // Save current data before reloading so it survives the jump.
    sessionStorage.setItem(DATA_KEY, jsPsych.data.get().json());
    const idx = document.getElementById('rdp-select').value;
    window.location.search = '?jumpTo=' + idx;
  });

  document.getElementById('rdp-reroll').addEventListener('click', () => {
    // Drop the stored P/V/Cookie Jar order so the next load draws a fresh
    // one, but keep the current screen (jumpTo) and saved trial data.
    sessionStorage.removeItem('exp1_children_switcher_char_order');
    location.reload();
  });

  document.getElementById('rdp-reroll-study').addEventListener('click', () => {
    // Same between-subjects random assignment a fresh visitor would get.
    // Since this switcher build runs both conditions from one bundle, we
    // just drop the stored outcome condition (and the P/V/Cookie Jar order,
    // so that re-rolls too) and reload in place, instead of navigating to
    // a sibling folder's index.html.
    sessionStorage.removeItem('exp1_children_switcher_outcome_condition');
    sessionStorage.removeItem('exp1_children_switcher_char_order');
    location.reload();
  });

  document.getElementById('rdp-clear').addEventListener('click', () => {
    sessionStorage.removeItem(DATA_KEY);
    location.reload();
  });

  // Start experiment from the selected slide
  jsPsych.run(jumpTo > 0 ? timeline.slice(jumpTo) : timeline);
})();
/* *** END OF RESEARCHER DEBUG BLOCK *** */