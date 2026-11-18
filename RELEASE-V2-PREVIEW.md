# AeroLearn V2 Preview Release

**Release:** V2 Preview (Android)
**Build status:** GitHub Actions — successful
**Workflow run:** #7
**Commit:** 557ed21
**Artifact:** AeroLearn-Android-APK
**Build date:** 18 November 2026
**Platform:** Android APK (Expo / React Native)

## Highlights
- Graphite/charcoal foundation with violet and warm-metal accent tokens replacing the former blue-heavy palette.
- Astronomy Atlas integrated into Laboratories and root navigation.
- Searchable catalogue with 20 astronomy entries: Sun, Mercury, Venus, Earth, Moon, Mars, Jupiter, Saturn, Uranus, Neptune, Solar System, Asteroid Belt, Comet, Black Hole, Milky Way, Nebula, Pulsar, Supernova, International Space Station, and Hubble Space Telescope.
- Detail panels include introductory facts, reference notes, and related exploration/mission names.

## Technology
- React Native + Expo SDK 58
- TypeScript
- Native Android build generated with Expo prebuild and Gradle release task in GitHub Actions
- Navigation: typed React Navigation root stack
- Theme: shared token-based palette
- APK packaged as a GitHub Actions workflow artifact

## Download and install
Download the V2 APK from the release artifact link provided with this preview. If downloaded as a ZIP, extract the APK before installing. On Android, permit installation from the file manager/browser that downloaded it, then open the APK to install.

## Preview scope and limitations
This is an early V2 preview build. The Atlas is a catalogue and detail-view feature, not a comprehensive interactive 3D astronomy engine. Additional 3D models, rocket/spacecraft catalogue, expanded mission explorer, and advanced challenge content remain planned. Verify functionality on a physical Android device before wider distribution.

## Build provenance
The successful Android build corresponds to commit `557ed21b9a8e1016553747095a06679064cffce7`. The GitHub Actions artifact is temporary and expires according to GitHub artifact retention settings.
