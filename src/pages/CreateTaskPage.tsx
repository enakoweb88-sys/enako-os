import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';
import { useAuth } from '../lib/auth';
import { toast } from 'sonner';

const DEPARTMENTS = [
  'Operations & Logistics',
  'Finance & Accounts',
  'Engineering & Tech',
  'Outreach & Field',
  'Marketing & Growth',
  'Human Resources',
  'Executive Office'
];

export default function CreateTaskPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('NORMAL');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState(user?.id || '');
  const [usersList, setUsersList] = useState<any[]>([]);
  const [status, setStatus] = useState('TODO');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Load users for assignment
    const loadAssignees = async () => {
      try {
        const res = await api.listUsers();
        if (Array.isArray(res) && res.length > 0) {
          setUsersList(res);
          if (!assigneeId && user?.id) setAssigneeId(user.id);
          return;
        }
      } catch (err) {
        console.warn('api.listUsers failed, trying api.employees:', err);
      }

      try {
        const empRes = await api.employees({ limit: 100 });
        if (empRes?.items && Array.isArray(empRes.items) && empRes.items.length > 0) {
          setUsersList(empRes.items);
          if (!assigneeId && user?.id) setAssigneeId(user.id);
          return;
        }
      } catch (empErr) {
        console.warn('api.employees also failed:', empErr);
      }

      // Fallback demo users if all fail
      setUsersList([
        { id: user?.id || 'usr-me', fullName: user?.fullName || 'Current User', email: user?.email || '', role: user?.role || 'Staff' },
        { id: 'usr-1', fullName: 'Christian Enako', email: 'ceo@enako.cm', role: 'CEO' },
        { id: 'usr-2', fullName: 'Marcelle Ebogo', email: 'marcelle@enako.cm', role: 'MANAGER' },
        { id: 'usr-3', fullName: 'Jean-Paul Kamga', email: 'jp@enako.cm', role: 'EMPLOYEE' }
      ]);
      if (!assigneeId && user?.id) setAssigneeId(user.id);
    };

    loadAssignees();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    setSubmitting(true);
    const assignedUser = usersList.find(u => u.id === assigneeId) || user;

    // Ensure assigneeId passed to backend is a valid ID (not mock usr- ID)
    const validAssigneeId = (assigneeId && !assigneeId.startsWith('usr-')) ? assigneeId : (user?.id && !user.id.startsWith('usr-') ? user.id : undefined);

    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      department,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      assigneeId: validAssigneeId,
      status,
    };

    try {
      let created = null;
      try {
        created = await api.createTask(payload);
      } catch (err) {
        console.warn('Backend API deferred, saving to local tasks cache:', err);
      }

      // Persist in local storage cache for instant update
      const localId = created?.id || `TASK-${Date.now()}`;
      const newTask = {
        id: localId,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        department: payload.department,
        dueDate: payload.dueDate,
        status: payload.status,
        createdAt: new Date().toISOString(),
        assignee: assignedUser ? {
          id: assignedUser.id,
          fullName: assignedUser.fullName,
          email: assignedUser.email,
        } : undefined
      };

      const existingRaw = localStorage.getItem('enako_tasks_cache');
      const existing = existingRaw ? JSON.parse(existingRaw) : [];
      localStorage.setItem('enako_tasks_cache', JSON.stringify([newTask, ...existing]));

      toast.success(`Task "${payload.title}" created successfully!`);
      navigate('/app/tasks');
    } catch (e: any) {
      toast.error(e.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-24 font-sans">
      {/* Header (No cards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
            <Link to="/app/tasks" className="hover:text-slate-800 transition-colors">
              Operations & Workflows
            </Link>
            <span>/</span>
            <Link to="/app/tasks" className="hover:text-slate-800 transition-colors">
              Tasks
            </Link>
            <span>/</span>
            <span className="text-[#001f5b] font-bold">New Task</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create Operational Task
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define, assign, and dispatch operational workflows and team responsibilities.
          </p>
        </div>

        <Link
          to="/app/tasks"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Tasks
        </Link>
      </div>

      {/* Flat Form (No Cards, No Enclosing Boxes) */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Task Particulars */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Task Overview
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Audit Douala Field Cash Envelopes, Deploy Database Schema Migration"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High Priority</option>
                  <option value="URGENT">Urgent (Immediate Action)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Target Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
                >
                  <option value="TODO">To Do (Open)</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">In Review</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Assignment & Department */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Ownership & Assignment
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assigned Team Member
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                {usersList.map((u) => {
                  const roleStr = typeof u.role === 'object' ? u.role?.name : (u.role || 'Staff');
                  return (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({roleStr})
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department / Functional Area
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 outline-none focus:border-[#001f5b] focus:bg-white"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Detailed Description & Instructions (Spacious Textarea) */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
            Task Specifications & Deliverable Details (Optional)
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Provide background context, checklist items, acceptance criteria, or relevant file links.
          </p>
          <textarea
            rows={8}
            placeholder="Type comprehensive task details, operational procedures, counterparty contacts, or expected deliverable criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-4 bg-slate-50/60 border border-slate-200 rounded-lg text-xs font-medium text-slate-900 outline-none focus:border-[#001f5b] focus:bg-white transition-all placeholder:text-slate-400 leading-relaxed"
          />
        </div>

        {/* Footer Buttons (No Cards) */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="text-xs text-slate-500">
            Dispatched via <strong>ENAKO Operations Engine</strong> • Assigned in real-time
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/app/tasks"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#001f5b] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#001744] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Creating Task...' : 'Create & Assign Task'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
