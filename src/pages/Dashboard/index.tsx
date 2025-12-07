export function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-industrial-100 mb-2">Dashboard</h1>
          <p className="text-industrial-400">
            Overview of your diagnostics activity and system metrics
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary-500/10">
              <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-medium text-industrial-400 mb-1">Total Consultations</h3>
          <p className="text-2xl font-bold text-industrial-100">0</p>
          <p className="text-xs text-industrial-500 mt-2">No data yet</p>
        </div>

        <div className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-accent-500/10">
              <svg className="w-6 h-6 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-medium text-industrial-400 mb-1">Tokens Used</h3>
          <p className="text-2xl font-bold text-industrial-100">0</p>
          <p className="text-xs text-industrial-500 mt-2">This month</p>
        </div>

        <div className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-success-500/10">
              <svg className="w-6 h-6 text-success-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-medium text-industrial-400 mb-1">Resolved</h3>
          <p className="text-2xl font-bold text-industrial-100">0</p>
          <p className="text-xs text-industrial-500 mt-2">Issues resolved</p>
        </div>

        <div className="card-hover">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-warning-500/10">
              <svg className="w-6 h-6 text-warning-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-sm font-medium text-industrial-400 mb-1">Pending</h3>
          <p className="text-2xl font-bold text-industrial-100">0</p>
          <p className="text-xs text-industrial-500 mt-2">Awaiting resolution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-100 mb-4">Recent Activity</h2>
          <div className="text-sm text-industrial-400">
            No recent consultations. Start by creating a new consultation.
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-industrial-100 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/chat"
              className="flex items-center gap-3 p-3 rounded-lg card-industrial hover:bg-industrial-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-primary-500/10">
                <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-industrial-200">Start New Chat</span>
            </a>
            <a
              href="/history"
              className="flex items-center gap-3 p-3 rounded-lg card-industrial hover:bg-industrial-700/50 hover:border-primary-500/50 transition-all cursor-pointer"
            >
              <div className="p-2 rounded-lg bg-accent-500/10">
                <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-industrial-200">View History</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}


