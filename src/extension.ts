import * as vscode from 'vscode';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Variable, Scope } from 'vscode-debugadapter';

export function activate(context: vscode.ExtensionContext) {

	// register this mechanism only for the C++ debugger
	context.subscriptions.push(vscode.debug.registerDebugAdapterTrackerFactory('cppdbg', {
		createDebugAdapterTracker(session: vscode.DebugSession) {
			return new GPUAugmenter();
		}
	}));
}

export function deactivate() { }

class GPUAugmenter implements vscode.DebugAdapterTracker {

	static GPU_SCOPE_ID = 123456789;	// an "unused" ID for the GPU scope

	private pendingVariableResponses = new Map<number, Variable[]>();	// store responses temporarily here until they are sent back

	private someCounter = 0;

	onDidSendMessage(message: DebugProtocol.ProtocolMessage) {
		if (message.type === 'response') {
			const m = message as DebugProtocol.Response;
			if (m.command === 'scopes' && m.body && Array.isArray(m.body.scopes)) {
				// we always add a GPU scope with a well known ID when being asked for all scopes
				m.body.scopes.push(new Scope('GPU', GPUAugmenter.GPU_SCOPE_ID));
			}
			if (m.command === 'variables' && this.pendingVariableResponses.has(m.request_seq)) {
				// if we see the response for the GPU request, add the temporarily stored variables
				m.body = m.body || {};	// make sure that the response has a body
				m.body.variables = this.pendingVariableResponses.get(m.request_seq);
				m.success = true;	// override any error that might be returned from the DA
				delete m.message;	// clear the error message
				this.pendingVariableResponses.delete(m.request_seq);
			}
		}
		else if (message.type === 'event') {
			const event = message as DebugProtocol.Event;
			if (event.event === 'stopped') {	// listen on stopped events so that we can have some "state" that changes
				this.someCounter++;
			}
		}
	}

	onWillReceiveMessage?(message: DebugProtocol.ProtocolMessage) {
		if (message.type === 'request') {
			const m = message as DebugProtocol.Request;
			if (m.command === 'variables' && m.arguments && typeof m.arguments.variablesReference === 'number') {
				// if variables for GPU scope are requested, intercept the call and prepare for returning gpu registers in the corresponding response
				if (m.arguments.variablesReference === GPUAugmenter.GPU_SCOPE_ID) {
					this.pendingVariableResponses.set(m.seq, [
						new Variable('gpu reg 1', this.getValueFromGPU(1)),
						new Variable('gpu reg 2', this.getValueFromGPU(2)),
						new Variable('gpu reg 3', this.getValueFromGPU(3))
					]);
				}
			}
		}
	}

	getValueFromGPU(registerNo: number): string {
		switch (registerNo) {
			case 1:
				return (123.45 * this.someCounter).toString();
			case 2:
				return (3.1415 * this.someCounter).toString();
			case 3:
				return (2.81 * this.someCounter).toString();
		}
		return 'error';
	}
}
