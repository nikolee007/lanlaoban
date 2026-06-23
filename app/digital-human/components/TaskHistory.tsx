'use client'

import { FiTrash2, FiExternalLink } from 'react-icons/fi'
import type { RenderTask } from '@/app/components/BackgroundTaskMonitor'

interface TaskHistoryProps {
  tasks: RenderTask[]
  onViewTask: (tid: string) => void
  onClear: () => void
  onClose: () => void
}

export default function TaskHistory({ tasks, onViewTask, onClear, onClose }: TaskHistoryProps) {
  return (
    <div className="mb-6 card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900">渲染任务</h3>
        <div className="flex gap-2">
          <button onClick={() => { onClear(); onClose() }}
            className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><FiTrash2 className="h-3 w-3" /> 清空</button>
          <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600">关闭</button>
        </div>
      </div>
      {tasks.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-4">暂无渲染任务</p>
      ) : (
        <div className="space-y-2">
          {tasks.map(t => (
            <div key={t.taskId} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'failed' ? 'bg-red-500' : 'bg-blue-500 animate-pulse'}`} />
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {t.status === 'completed' ? '已完成' : t.status === 'failed' ? '失败' : t.status === 'rendering' ? '渲染中' : '排队中'}
                  </p>
                  <p className="text-[10px] text-gray-400">{new Date(t.createdAt).toLocaleTimeString('zh-CN')}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {t.status === 'completed' && (
                  <button onClick={() => onViewTask(t.taskId)} className="text-xs text-brand-400 hover:text-brand-500 flex items-center gap-1">
                    <FiExternalLink className="h-3 w-3" /> 查看
                  </button>
                )}
                {t.status === 'failed' && <span className="text-xs text-red-400">{t.error?.slice(0, 20)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
