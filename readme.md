# ExecBG for VS Code

Execute commands in the background. Configure your keybindings.json (Command
Palette => 'Preferences: Open Keyboard Shortcut (JSON)') and configure like
such:

```json
[
  {
    "key": "shift+alt+r",
    "command": "execbg.run",
    "args": {
      "cmd": "/usr/bin/sleep",
      "args": ["60"],
    },
  }
]
```
