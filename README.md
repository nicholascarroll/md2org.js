# md2org

Convert Markdown to Org mode. 

**This is WIP** 🔧🔨🚧

Copy some Markdown, get Org mode back:
- at the command line as a Unix filter  🙂
- on your phone via an iOS Shortcut  😎
- in your browser with nothing uploaded anywhere 🥷

**[Try it in your browser →](https://nicholascarroll.github.io/md2org/)**

The conversion is one-way only: Markdown is a small language and maps cleanly onto Org; the reverse is lossy and I don't plan to attempt it.

## Use

### 1. Command line

A Unix filter. Needs [Node.js](https://nodejs.org).

```sh
git clone https://github.com/nicholascarroll/md2org
cd md2org
chmod +x bin/md2org

./bin/md2org notes.md > notes.org      # convert a file
cat notes.md | ./bin/md2org            # or read a pipe
```

Put `bin/md2org` on your `PATH` to use it anywhere. It pairs naturally with an
editor that can pipe a region through a shell command.

### 2. iOS Shortcut

Copy Markdown, tap a button, get Org on your clipboard — no app switch, no size
limit. See **[shortcut/README.md](shortcut/README.md)** for the two-minute setup.

### 3. In the browser

Open the [live page](https://nicholascarroll.github.io/md2org/). Paste Markdown on the left, copy the Org on the right. Conversion happens entirely on your device; the page has no server and sends nothing over the network.

## The Test is the Spec


```sh
node test/spec.js
```

## License

MIT
