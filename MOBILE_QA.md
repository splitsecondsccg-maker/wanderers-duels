# Mobile QA workflow

Open:

```text
index.html?mobile=1&debug=1&qa=1
```

Flags:

```text
?mobile=1   Force phone layout
?debug=1    Show viewport badge
?qa=1       Open QA panel
?touch=1    Outline touch targets
?safe=1     Show safe-area frame
?grid=1     Show 24px layout grid
?slow=1     Slow transitions/animations
```

Automated screenshots:

```bash
npm install
npm run qa:install
npm run qa:screens
```

Screenshots are saved to:

```text
qa-screenshots/
```
