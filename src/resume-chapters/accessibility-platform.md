---
tags: resumeChapters
permalink: false
title: Browser Accessibility Infrastructure
period: 2019–Present
order: 3
printPageTwo: true
---
- Helped build accessibility infrastructure for browser UI and web content
  through the [ViewsAX refactoring][viewsax], including a shared UI layer and
  cache.
- Owned Chromium changes supporting Narrator's use of Windows UI Automation
  (UIA) TextPattern, including text navigation, text ranges, event reliability,
  and UIA tree testing.
- Implemented MathML support for Windows UI Automation in Chromium,
  [enabled by default for Chromium Canary users][mathml-uia].
- Built accessibility usage and performance telemetry that informed investment
  decisions and helped diagnose unexpected accessibility activation. Added
  fuzzers and automated tests to catch regressions.
- As a Chromium Accessibility owner, resolve security vulnerabilities,
  release-blocking crashes, compliance defects, and cross-product regressions.
  Mentor engineers through code review and debugging. Led and co-led mentoring
  groups.
- Led Accessible Shopping Navigation from architecture and user research through
  prototyping and experimentation, then recommended against shipping based on
  the results. Lead inventor on
  [U.S. Patent 12282522, “Assistance user interface for computer
  accessibility.”][shopping-patent]

[viewsax]:
  https://chromium-review.googlesource.com/q/owner:janewman+hashtag:views-ax+status:merged
[mathml-uia]:
  https://chromium-review.googlesource.com/q/owner:janewman+message:UIA-MathML+status:merged
[shopping-patent]:
  https://patents.google.com/patent/US12282522B2/
