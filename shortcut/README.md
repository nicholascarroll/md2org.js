# md2org as an iOS Shortcut

On your iPhone or iPad, copy some Markdown, trigger the Shortcut, and your clipboard content is replaced with Org.

## How it works

This setup uses the free **[Actions](https://apps.apple.com/app/actions/id1586435171)** app by Sindre Sorhus, which adds a native *Transform Text with JavaScript* action to Shortcuts. The converter lives inside that action. Notification is used to provide non-interactive feedback that it ran. 

## Setup 

1. **Install Actions** from the App Store (free).

2. **Create a new shortcut** in the Shortcuts app with these actions, in order:

   - **Get Clipboard**
   - **Transform Text with JavaScript**: paste the contents of
     [`transform.js`](transform.js) into the code field. 
     Set **Text** input to **Clipboard**. 
   - **If**: Transformed Text **Begins With** — `⚠️ md2org:`
   - **Show Alert** with Transformed Text
   - **Otherwise**
   - **Copy to Clipboard**:  set the input to transformed text.
   - **Show Notification**
   - **End If**

###  Add it to Control Centre
1. Swipe down from the top right corner of your iPhone
2. In **Control Centre**, long press
3. Tap **Add a Control**
4. Add **md2org** shortcut

## Use

Copy Markdown, trigger the Shortcut, paste — and out comes Org.

## Troubleshooting

**Pasting the code crashes the Shortcuts app.**
If you have not modified `transform.js`, please log an issue with your device and iOS version — the file's dimensions have only ever been measured on one device.  If you have modified it, the cause is almost certainly its shape: too many lines, too many bytes, or a single line that is too long. Note that wrapping the code *narrower* makes this worse, not better. See the measurement table in `test/size.js`.

**Something else is wrong and you want detail.**
Paste [`diagnostic.js`](diagnostic.js) into the same action in place of
`transform.js` and run the Shortcut. It reports what the input looked like and which JavaScript features the environment supports, then you can paste the result.
