# Motion Language & Animation Standards

Principles for authoring physics-based, cause-and-effect motion in HyperFrames using GreenSock (GSAP).

---

## 1. Core Principles

1. **Snappy & Decisive**: Entrances are brisk and purposeful (`0.24s to 0.48s`). No leisurely drifting or floating.
2. **Cause & Effect**: Interface elements only change state in response to an identifiable trigger (e.g., cursor click, speaker speech beat, or step progression).
3. **Restrained Settle**: Small physical overshoots (`scale: 1.03 -> 1.0` or `y: 18 -> 0`) using `power3.out` or subtle spring easing.
4. **Hard Cue Exits**: Captions and text cues cut out decisively with no lagging opacity ghosts.

---

## 2. Easing & Duration Table

| Motion Role | GSAP Ease | Typical Duration | Properties |
|---|---|---|---|
| **Hook Word Pop-In** | `back.out(1.7)` or `power3.out` | `0.18s – 0.28s` | `opacity: 0 -> 1`, `scale: 0.92 -> 1`, `y: 16 -> 0` |
| **Kinetic Caption Cue** | `power3.out` (in) / `power2.in` (out) | `0.10s – 0.14s` in / `0.08s` out | `opacity`, `y: 10 -> 0`, `scale: 0.98 -> 1` |
| **Document Card Reveal** | `power3.out` | `0.42s – 0.58s` | `opacity: 0 -> 1`, `y: 32 -> 0` |
| **Inspector Window Reveal** | `power3.out` | `0.48s – 0.62s` | `opacity: 0 -> 1`, `scale: 0.95 -> 1` |
| **Cursor Travel** | `power2.inOut` | `0.60s – 0.85s` | `x`, `y` |
| **Cursor Click Ripple** | `power1.inOut` | `0.16s` | `scale: 1 -> 0.82 -> 1` |
| **Progress Line Fill** | `power2.out` | `0.50s – 0.75s` | `width: 0% -> 100%` |
| **Status Tag / Pill Pop** | `back.out(2.0)` | `0.26s` | `scale: 0.7 -> 1`, `opacity: 0 -> 1` |

---

## 3. Kinetic Caption Implementation (GSAP)

```javascript
// Synchronizing a cue with millisecond precision
function animateCue(cueEl, start, end) {
  const entranceDuration = Math.min(0.14, (end - start) * 0.4);
  const exitDuration = Math.min(0.08, (end - start) * 0.25);
  const exitStart = Math.max(start + entranceDuration, end - exitDuration);

  // Set visible at start
  timeline.set(cueEl, { visibility: "visible" }, start);

  // Snappy spring entrance
  timeline.fromTo(
    cueEl,
    { opacity: 0, y: 14, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: entranceDuration, ease: "power3.out" },
    start
  );

  // Decisive exit
  timeline.to(
    cueEl,
    { opacity: 0, y: -6, duration: exitDuration, ease: "power2.in" },
    exitStart
  );

  // Immediate kill
  timeline.set(cueEl, { visibility: "hidden" }, end);
}
```

---

## 4. Cursor-Led State Change Pattern

A cursor should never wander aimlessly. It travels to a target, clicks, triggers a state change, and departs:

```javascript
// Cursor moves to button/tab
timeline.to("#editor-cursor", { x: 420, y: 680, duration: 0.55, ease: "power2.inOut" }, 1.2);

// Cursor clicks (scale down & back up)
timeline.to("#editor-cursor", { scale: 0.82, duration: 0.08, ease: "power1.in" }, 1.75);
timeline.to("#editor-cursor", { scale: 1.0, duration: 0.08, ease: "power1.out" }, 1.83);

// Target responds immediately at click moment
timeline.fromTo("#target-pill", 
  { backgroundColor: "#FFFFFF", borderColor: "#D9D9D6" },
  { backgroundColor: "#DCFCE7", borderColor: "#10A37F", duration: 0.15 },
  1.83
);
```
