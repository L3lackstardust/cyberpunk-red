# Cyberpunk RED — Milestones 20–119

Status: planned, not implemented. Each milestone requires code, appropriate automated tests, and verification before completion.

Principles: original art only; six base bodies; shared Avatar Studio/Cyberware renderer; 48-frame viewer with fallback; non-destructive customization; private/local GM data stays off public Pages.

## Avatar anatomical fidelity
- [x] 20. shoulder contours
- [x] 21. elbow joints
- [x] 22. hand silhouettes
- [ ] 23. neck proportions
- [ ] 24. torso depth
- [ ] 25. hip transitions
- [ ] 26. knee joints
- [ ] 27. boot anatomy
- [ ] 28. face profile cleanup
- [ ] 29. six-body visual snapshot audit

## Rotation consistency
- [ ] 30. cardinal-angle reference fixtures
- [ ] 31. left/right cyberarm parity
- [ ] 32. front/rear occlusion
- [ ] 33. near-side arm layering
- [ ] 34. far-side arm layering
- [ ] 35. profile head placement
- [ ] 36. pose rotation continuity
- [ ] 37. frame wrap continuity
- [ ] 38. drag sensitivity tuning
- [ ] 39. 48-frame rotation regression

## Cyberware rendering
- [ ] 40. left arm component anchors
- [ ] 41. right arm component anchors
- [ ] 42. bilateral plating
- [ ] 43. optic location mapping
- [ ] 44. optic side distinction
- [ ] 45. cyberware color differentiation
- [ ] 46. installed/uninstalled comparison
- [ ] 47. rear cyberware visibility
- [ ] 48. profile cyberware visibility
- [ ] 49. cross-page cyberware visual parity

## Avatar customization
- [ ] 50. skin palette accessibility
- [ ] 51. hair palette contrast
- [ ] 52. hair silhouette differentiation
- [ ] 53. face shape differentiation
- [ ] 54. outfit layer separation
- [ ] 55. pose personality cues
- [ ] 56. compact customization controls
- [ ] 57. preset reset clarity
- [ ] 58. portrait consistency
- [ ] 59. customization persistence audit

## Image-sequence architecture
- [ ] 60. frame manifest specification
- [ ] 61. asset fallback contract
- [ ] 62. six-body asset namespace
- [ ] 63. pose asset namespace
- [ ] 64. cyberware overlay namespace
- [ ] 65. preload budget policy
- [ ] 66. frame caching policy
- [ ] 67. image decode race handling
- [ ] 68. missing-frame recovery
- [ ] 69. asset pipeline integration test

## Character sheet integration
- [ ] 70. shared character ID contract
- [ ] 71. avatar-to-sheet navigation
- [ ] 72. sheet-to-avatar navigation
- [ ] 73. cyberware inventory reconciliation
- [ ] 74. humanity cost visibility
- [ ] 75. modifier source labels
- [ ] 76. derived-stat recalculation
- [ ] 77. roll modifier binding
- [ ] 78. character save atomicity
- [ ] 79. cross-tab sync regression

## Roll automation
- [ ] 80. skill roll modifier audit
- [ ] 81. combat roll modifier audit
- [ ] 82. conditional modifier applicability
- [ ] 83. modifier stacking visibility
- [ ] 84. dice result breakdown
- [ ] 85. critical roll display
- [ ] 86. injury penalty integration
- [ ] 87. cyberware roll examples
- [ ] 88. roll history consistency
- [ ] 89. roll reproducibility tests

## Cyberware manager UX
- [ ] 90. central figure sizing
- [ ] 91. compact slot panels
- [ ] 92. location highlight on selection
- [ ] 93. selected-slot detail panel
- [ ] 94. installed cyberware summary
- [ ] 95. body-side filter
- [ ] 96. slot availability feedback
- [ ] 97. humanity delta preview
- [ ] 98. undo-safe installation flow
- [ ] 99. manager keyboard accessibility

## Performance and reliability
- [ ] 100. avatar render benchmark
- [ ] 101. rotation input throttling
- [ ] 102. cache invalidation tests
- [ ] 103. mobile viewport audit
- [ ] 104. low-end device fallback
- [ ] 105. localStorage quota recovery
- [ ] 106. JSON import schema validation
- [ ] 107. storage migration fixture
- [ ] 108. offline Pages smoke test
- [ ] 109. public/private content audit

## Release and acceptance
- [ ] 110. six-body visual review
- [ ] 111. four-pose visual review
- [ ] 112. front/rear anatomy review
- [ ] 113. cyberarm side acceptance
- [ ] 114. cyberoptics acceptance
- [ ] 115. 48-frame continuity acceptance
- [ ] 116. modifier-to-roll acceptance
- [ ] 117. accessibility acceptance
- [ ] 118. deployment smoke acceptance
- [ ] 119. milestone-119 release readiness report

## Release gates

- No milestone is marked complete solely because a plan or mockup exists.
- Require character regression and browser stability checks for changes that touch shared renderer, avatar, cyberware, or character storage.
- Record known limitations: current avatar is procedural SVG; high-resolution frame assets have not been produced.
- Validate all new UI against compact horizontal layout and keyboard use.
- Never publish private GM campaign content, secrets, or local GM state.