# 🧪 Onboarding Testing Guide

## Prerequisites
- iOS Simulator / Android Emulator OR Physical Device
- Expo Go app (for physical device testing)
- Node.js and Yarn installed

---

## 🚀 Running the App

### Option 1: Start Development Server
```bash
cd /app/yield
yarn dev
```

### Option 2: Specific Platform
```bash
# iOS Simulator
yarn ios

# Android Emulator
yarn android

# Web Browser (for quick preview)
yarn web
```

---

## ✅ What to Test

### 1. **Visual Appearance**
- [ ] Brand orange color (#FA4616) appears correctly
- [ ] Dark black background throughout
- [ ] Pulsing glow effect animates smoothly around icons
- [ ] Icons appear with bounce animation on each slide
- [ ] Text is readable with proper hierarchy
- [ ] Skip button appears top-right (slides 1-3 only)

### 2. **Navigation**
- [ ] "Continue" button advances to next slide
- [ ] Button changes to "Get Started" on final slide
- [ ] Swipe left gesture moves to next slide
- [ ] Swipe right gesture moves to previous slide
- [ ] "Skip" button jumps directly to sign-in
- [ ] "Get Started" navigates to sign-in screen

### 3. **Progress Indicators**
- [ ] Progress bar fills smoothly as you advance
- [ ] Step dots highlight correctly (orange = current, dim = future)
- [ ] Step counter updates ("Step 1 of 4" → "Step 2 of 4", etc.)
- [ ] All indicators sync with current slide

### 4. **Animations**
- [ ] Icon glow pulses continuously (2-second loop)
- [ ] Icon scales with bounce effect on slide change
- [ ] Slide transitions are smooth (no jank)
- [ ] Progress bar animates smoothly
- [ ] Content fades in on each slide
- [ ] Parallax effect visible during swipe gesture

### 5. **Haptic Feedback** (Physical Device Only)
- [ ] Slight vibration when tapping buttons
- [ ] Feedback when swiping between slides
- [ ] Consistent across all interactive elements

### 6. **Content Verification**

**Slide 1: Welcome**
- Title: "Welcome to Kinetic"
- Subtitle: "DEFI UNBOUND"
- Icon: Wallet (orange)
- Hint: "Swipe to explore →"

**Slide 2: Yield**
- Title: "Maximize Your Yield"
- Icon: TrendingUp (orange)
- Description mentions aggregation engine

**Slide 3: Speed**
- Title: "Lightning Fast"
- Icon: Zap (orange)
- Description mentions Movement Network

**Slide 4: Security**
- Title: "Secure & Private"
- Icon: Shield (orange)
- Terms & privacy notice at bottom

### 7. **Edge Cases**
- [ ] Can't swipe past first slide backwards
- [ ] Can't swipe past last slide forward
- [ ] Skip button hidden on last slide
- [ ] Terms notice only shows on last slide
- [ ] Swipe hint only shows on first slide

### 8. **Performance**
- [ ] Animations run at 60fps (smooth, no stuttering)
- [ ] No lag when swiping
- [ ] No memory leaks during repeated navigation
- [ ] App responsive to all gestures

---

## 🐛 Known Requirements

### Required Permissions
- None (onboarding is permission-free)

### Required Packages
✅ Installed during refactor:
- `react-native-gesture-handler@2.30.0`

Already in project:
- `react-native-reanimated@4.1.1`
- `expo-linear-gradient@15.0.8`
- `expo-haptics@15.0.2`
- `lucide-react-native@0.545.0`

---

## 📱 Testing Checklist

### Quick Test (5 min)
1. Launch app fresh
2. Verify onboarding appears
3. Navigate through all 4 slides
4. Check visual appearance
5. Complete onboarding

### Comprehensive Test (15 min)
1. **Fresh Launch** - Complete onboarding normally
2. **Gesture Test** - Try all swipe directions
3. **Skip Test** - Launch again, use skip button
4. **Visual Test** - Check all animations and colors
5. **Performance Test** - Navigate back/forth rapidly
6. **Different Devices** - Test on multiple screen sizes

---

## 🎯 Success Criteria

✅ **Passed** if:
- All 4 slides display correctly
- Brand colors match app aesthetic
- Animations are smooth (60fps)
- Gestures work reliably
- Navigation flows logically
- No crashes or errors

❌ **Failed** if:
- Color mismatches (blue/purple instead of orange)
- Jittery animations
- Gestures don't respond
- Missing content
- App crashes

---

## 🔍 Debugging

### Check Component Import
```bash
cd /app/yield
grep -r "DEXOnboarding" app/
```

### View Console Logs
Look for errors in Metro bundler terminal

### Reset Onboarding
To test again after completion:
1. Uninstall app
2. Reinstall OR
3. Clear app data in settings

---

## 📞 Support

If issues occur:
1. Check error logs in Metro bundler
2. Verify all dependencies installed
3. Try clearing cache: `yarn dev --clear`
4. Check React Native Debugger

---

**Ready to Test!** 🚀
The onboarding flow is refactored and ready for hands-on testing on your preferred device/simulator.
