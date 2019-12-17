import * as vscode from 'vscode';
import { DebugProtocol } from 'vscode-debugprotocol';
import { Variable, Scope } from 'vscode-debugadapter';

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.debug.registerDebugAdapterTrackerFactory('cppdbg', {
		createDebugAdapterTracker(session: vscode.DebugSession) {
			return new GPUAugmenter();
		}
	}));
}

export function deactivate() { }

class GPUAugmenter implements vscode.DebugAdapterTracker {

	static GPU_SCOPE_ID = 12345;

	private pendingVariableResponses = new Map<number, Variable[]>();

	onDidSendMessage(m: DebugProtocol.ProtocolMessage) {
		if (m.type === 'response') {
			this.processResponse(m as DebugProtocol.Response);
		}
	}

	onWillReceiveMessage?(m: DebugProtocol.ProtocolMessage) {
		if (m.type === 'request') {
			this.processRequest(m as DebugProtocol.Request);
		}
	}

	processResponse(m: DebugProtocol.Response) {
		if (m.command === 'scopes' && m.body && Array.isArray(m.body.scopes)) {
			// we always add a GPU scope with a well known ID when being asked for all scopes
			m.body.scopes.push(new Scope('GPU', GPUAugmenter.GPU_SCOPE_ID));
		}
		if (m.command === 'variables' && this.pendingVariableResponses.has(m.request_seq)) {
			// if response
			m.body.variables = this.pendingVariableResponses.get(m.request_seq);
			this.pendingVariableResponses.delete(m.request_seq);
		}
	}

	processRequest(m: DebugProtocol.Request) {
		if (m.command === 'variables' && m.arguments && typeof m.arguments.variablesReference === 'number') {
			// if variables for GPU scope are requested, intercept the call and prepare for returning gpu registers in the corresponding response
			if (m.arguments.variablesReference === GPUAugmenter.GPU_SCOPE_ID) {
				this.pendingVariableResponses.set(m.seq, [
					new Variable('gpu reg 1', '123.45'),
					new Variable('gpu reg 2', '3.1415'),
					new Variable('gpu reg 3', '2.81')
				]);
			}
		}
	}
}
