# md2org as an iOS Shortcut

On your iPhone or iPad you can copy some of markdown text, trigger the shortcut and it transforms you clipboard content to org-mode.

## How it works

This setup uses the free **[Actions](https://apps.apple.com/app/actions/id1586435171)** app by Sindre Sorhus, which adds a native *Transform Text with JavaScript* action to Shortcuts. The converter lives inside that action. Notification is used to provide non-interactive feedback that it ran. 

You can bind the shortcut to in different ways (explained below).

## Setup 

1. **Install Actions** from the App Store (free).

2. **Create a new shortcut** in the Shortcuts app with these four actions in order:

   - **Get Clipboard**
   - **Transform Text with JavaScript**: set the  *Clipboard* variable in as the input, and paste the contents of [`transform.js`](transform.js) into the code field.
   - **Copy to Clipboard**:  set the input to transformed text.
   - **Show Notification**

3. **Bind it to a button** 
   - **Action Button** (iPhone 15 Pro and later): Settings-> Action Button->
     Shortcut.
   - **Back Tap** (any recent iPhone): Settings-> Accessibility-> Touch-> Back Tap
     → Triple Tap-> scroll to the Shortcuts section-> pick it.
   - Or add it to **Control Centre** or the **Home Screen**.

## Use

Copy Markdown, trigger the shortcut, paste and *voila!*: org mode is pasted.

## The code

The shortcut runs [`transform.js`](transform.js), which is the exact converter from
[`../src/md2org.js`](../src/md2org.js) adapted for Actions: input is a global `$text` and the code `return`s the result. 
