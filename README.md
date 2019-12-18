# Augmented-debug README

This sample extension shows how a [`vscode.DebugAdapterTracker`](https://github.com/microsoft/vscode/blob/b6ae21e6e2e7255978993df45c1317a869170d21/src/vs/vscode.d.ts#L9649-L9688) can be used to augment a debug session with additional information.

The following screencast shows a new scope "GPU" in the VARIABLES view that is fed by the extension.
The underlying C++ debugger is unmodified and completely unaware of this.

![feature X](images/gpu.gif)

The complete source is [here](https://github.com/weinand/augmented-debug/blob/master/src/extension.ts).


# Run the Sample

- run `git clone https://github.com/weinand/augmented-debug.git`
- run `cd augmented-debug`
- run `npm install`
- run `cd cpp-project`
- run `gcc -g hello.c`
- run `cd ..`
- run `code .`
- install the C++ extension
- F5 -> new window opens
- F5 -> debugger breaks on line 4 and VARIABLES view shows a "GPU" scope
- expand GPU scope -> 3 registers are shown
- continue stepping -> registers under GPU update their values

## Please Note:

The `vscode.DebugAdapterTracker` API was designed to **tap** the communication between VS Code and debug adapters. It was not designed to **modify** messages in transit. So this example actually shows a use case that is not officially supported.

However, we are currently working on another (similar) API that supports intercepting and modifying DAP messages. And as long as this API is not a part of the official VS Code extension API (i.e. `vscode.d.ts`), we will continue to support the "unofficial" use case.


### 1.0.0

Initial release.
