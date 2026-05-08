import { useState, useEffect } from 'react';
import { archaeologyStore } from '../utils/dataStore';

export default function ArchaeologySessionList({ activeSessionId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);

  // 刷新列表
  const refresh = () => setSessions(archaeologyStore.getAllSessions());

  useEffect(() => { refresh(); }, []);

  const handleCreate = () => {
    const name = prompt('给这次考古起个名字：', '产品决策复盘');
    if (!name) return;
    archaeologyStore.createSession(name);
    refresh();
  };

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (!confirm('确定删除这个考古会话？')) return;
    archaeologyStore.deleteSession(id);
    if (activeSessionId === id) onSelectSession(null);
    refresh();
  };

  return (
    <div style={{ width: 200, borderRight: '1px solid #eee', padding: 8 }}>
      <button onClick={handleCreate} style={{ width: '100%', marginBottom: 8, padding: 8 }}>
        + 新建考古会话
      </button>
      
      {sessions.length === 0 && (
        <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
          暂无考古会话<br/>点击上方新建
        </div>
      )}
      
      {sessions.map(s => (
        <div
          key={s.id}
          onClick={() => onSelectSession(s.id)}
          style={{
            padding: 8,
            marginBottom: 4,
            borderRadius: 4,
            cursor: 'pointer',
            background: s.id === activeSessionId ? '#e0e7ff' : '#f9fafb'
          }}
        >
          <div style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>
            {s.conversationChunks.length}段对话 ·
            {s.status === 'analyzing' ? '分析中' : s.status === 'reviewing' ? '审核中' : '已归档'}
          </div>
          <button
            onClick={(e) => handleDelete(s.id, e)}
            style={{ fontSize: 11, color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginTop: 4 }}
          >
            删除
          </button>
        </div>
      ))}
    </div>
  );
}
