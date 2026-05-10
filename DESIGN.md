---
name: SlimeFit Cute Light
colors:
  primary: '#34d399' # Mint green
  on-primary: '#ffffff'
  secondary: '#fbbf24' # Warm yellow/orange for egg/stars
  on-secondary: '#ffffff'
  background: '#f8fafc' # Soft gray-blue background
  surface: '#ffffff'
  on-surface: '#334155'
  error: '#f87171'
typography:
  headline-lg:
    fontFamily: Quicksand
    fontSize: 32px
    fontWeight: '700'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
rounded:
  DEFAULT: 1rem
  lg: 1.5rem
  full: 9999px
---

## Brand & Style

SlimeFit is a gamified habit tracker. The design should be **extremely cute, approachable, and playful**.
It targets users who want a low-pressure, fun way to build exercise habits.

- **Soft & Bouncy:** Use large border radii (fully rounded buttons, soft cards).
- **Bright & Pastel:** Use light, friendly colors like Mint Green, Baby Blue, and Soft Yellow. Avoid harsh blacks.
- **Game Elements:** Progress bars should look like "XP bars" in RPG games (chunky, colorful).
- **Slime Character:** Prominently feature a cute, squishy slime character that changes based on user progress (Egg -> Baby Slime -> Cool Slime).

## Components

- **Cards:** White background, 24px border radius, very soft drop shadow (`box-shadow: 0 4px 20px rgba(0,0,0,0.05)`).
- **Buttons:** Chunky, pill-shaped (`border-radius: 9999px`), bright mint green, with a subtle "bouncy" press effect.
- **XP Bar:** A thick progress bar with a bright yellow or mint fill.
- **Ads:** Keep ad banners unobtrusive, separated by a light border, placed at the bottom of the screen.
