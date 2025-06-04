---
theme: default
title: NoteEase - Simple Note Management
info: |
  ## NoteEase
  A simple and intuitive notes application built with Slidev.
  
  Features:
  - Create, edit, and delete notes
  - Search functionality
  - Category organization
  - Responsive design
class: text-center
drawings:
  persist: false
transition: slide-left
mdc: true
layout: cover
---

<NoteEase />

<style>
/* Global styles for the NoteEase application */
.slidev-layout {
  padding: 0 !important;
  height: 100vh !important;
  overflow: hidden !important;
}

/* Hide Slidev navigation elements */
.slidev-nav {
  display: none !important;
}

/* Hide slide counter */
.slidev-page-indicator {
  display: none !important;
}

/* Ensure full screen coverage */
body {
  margin: 0;
  padding: 0;
  overflow: hidden;
}

/* Custom styling for the entire app */
#app {
  height: 100vh;
  overflow: auto;
}

/* Remove any default Slidev styling that might interfere */
.slidev-code, .slidev-code-wrapper {
  display: none !important;
}

/* Ensure proper mobile responsiveness */
@media (max-width: 768px) {
  .slidev-layout {
    padding: 0 !important;
  }
}
</style>
