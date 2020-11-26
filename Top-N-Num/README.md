# Usage

## Top-N-Num

Find out the top N number from input (stdin or file, in decimal delimit by newlines)

```bash
node index.js [filepath]
```

If file is no file path given, stdin will be used instead.

## getRand

Generate random number for 'Top-N-Num'

```bash
node getRand.js [filepath]
```

If file is no file path given, stdout will be used instead. For example:

```bash
# Windows or UNIX
node getRand.js | node index.js
```
