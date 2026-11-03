import { Component, type ReactNode, type ErrorInfo } from 'react';

// Keep navigation available if a page encounters an unexpected render error.
export class WorkspaceErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  declare props: { children: ReactNode };
  state = { failed: false };

  static getDerivedStateFromError() { return { failed: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Workspace page could not render', error, info.componentStack);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-slate-900">
        <h1 className="text-lg font-bold">This page could not be displayed</h1>
        <p className="mt-2 text-sm">Please reload this page or use the sidebar to open another section.</p>
        <button onClick={() => window.location.reload()} className="mt-4 rounded-lg bg-[#001f5b] px-4 py-2 text-sm text-white">Reload page</button>
      </div>
    );
  }
}
