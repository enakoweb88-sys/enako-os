export default function OutreachEvents() {
  const events = [
    { id: 1, title: '2026 Primary Scholarship', type: 'SCHOLARSHIP', status: 'OPEN', applicants: 142, closeDate: '2026-08-30' },
    { id: 2, title: 'Clean Water Fundraiser', type: 'FUNDRAISER', status: 'OPEN', raised: '450,000 XAF', target: '1,000,000 XAF' }
  ];

  return (
    <div className="p-6 pb-20">
      <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-display text-xl font-bold text-primary">Manage Outreach Events</h3>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Create Event</button>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-outline-variant/50 text-secondary text-sm">
              <th className="pb-3 font-semibold">Title</th>
              <th className="pb-3 font-semibold">Type</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Details</th>
            </tr>
          </thead>
          <tbody>
            {events.map(ev => (
              <tr key={ev.id} className="border-b border-outline-variant/20 last:border-0">
                <td className="py-4 font-bold text-primary">{ev.title}</td>
                <td className="py-4 text-sm text-secondary">{ev.type}</td>
                <td className="py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{ev.status}</span></td>
                <td className="py-4 text-sm text-secondary">{ev.type === 'SCHOLARSHIP' ? `${ev.applicants} Applicants` : `${ev.raised} / ${ev.target}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
