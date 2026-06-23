'use client'
import Link from 'next/link'
import { FiCamera } from 'react-icons/fi'
import type { IpProfileData } from '../types'
import { INDUSTRIES } from '../constants'

interface ProfilePanelProps {
  profile: IpProfileData
  editingProfile: boolean
  profilePercent: number
  onToggleEditing: () => void
  onClearProfile: () => void
  onProfileChange: (updater: (p: IpProfileData) => IpProfileData) => void
}

export default function ProfilePanel({ profile, editingProfile, profilePercent, onToggleEditing, onClearProfile, onProfileChange }: ProfilePanelProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">IP 档案</h2>
        <div className="flex gap-2">
          <button onClick={onToggleEditing}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            {editingProfile ? '完成' : '编辑'}
          </button>
          <button onClick={onClearProfile} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-400 hover:bg-gray-50">重置</button>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">品牌/店铺名称</label>
          <input disabled={!editingProfile} value={profile.name} onChange={e => onProfileChange(p => ({ ...p, name: e.target.value }))}
            placeholder="你的品牌或店名"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-brand-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">行业</label>
          {editingProfile ? (
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <button key={ind} onClick={() => onProfileChange(p => ({ ...p, industry: ind }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${profile.industry === ind ? 'text-white' : 'text-gray-600 border-gray-200 hover:border-brand-200'}`}
                  style={profile.industry === ind ? { backgroundColor: '#FF6034', borderColor: '#FF6034' } : {}}>
                  {ind}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-700">{profile.industry || '未设置（通过聊天自动采集）'}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">从业经历</label>
          <textarea disabled={!editingProfile} value={profile.experience} onChange={e => onProfileChange(p => ({ ...p, experience: e.target.value }))}
            placeholder="做了多久？之前是做什么的？"
            rows={2} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 resize-none focus:outline-none focus:border-brand-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">目标人群</label>
          <input disabled={!editingProfile} value={profile.targetAudience} onChange={e => onProfileChange(p => ({ ...p, targetAudience: e.target.value }))}
            placeholder="你的客户是什么样的人？"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:outline-none focus:border-brand-400" />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">创业/品牌故事</label>
          <textarea disabled={!editingProfile} value={profile.originStory} onChange={e => onProfileChange(p => ({ ...p, originStory: e.target.value }))}
            placeholder="当初为什么开始做这个？有什么故事？"
            rows={3} className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-400 resize-none focus:outline-none focus:border-brand-400" />
        </div>
      </div>

      {/* Quick fill from chat */}
      {profile.industry && !editingProfile && (
        <div className="mt-6 rounded-lg bg-brand-50 p-4">
          <p className="text-xs font-semibold text-brand-700 mb-2">AI自动采集到以下信息</p>
          <div className="space-y-1 text-xs text-brand-600">
            {profile.name && <p>• 品牌/名称：{profile.name}</p>}
            {profile.industry && <p>• 行业：{profile.industry}</p>}
            {profile.experience && <p>• 经历：{profile.experience}</p>}
            {profile.originStory && <p>• 故事：已采集</p>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{profile.videoCount || 0}</p>
          <p className="text-[10px] text-gray-400">生成视频</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{profile.followUpCount || 0}</p>
          <p className="text-[10px] text-gray-400">AI跟进次数</p>
        </div>
        <div className="rounded-lg bg-gray-50 p-3 text-center">
          <p className="text-lg font-bold text-gray-900">{profilePercent}%</p>
          <p className="text-[10px] text-gray-400">IP完整度</p>
        </div>
      </div>

      {/* Go generate video */}
      <div className="mt-6 rounded-xl p-4 text-center" style={{ background: 'linear-gradient(135deg, #FFF5F0, #FFE4D6)' }}>
        <p className="text-sm font-semibold text-gray-900">档案完善了？用AI生成一条短视频脚本吧</p>
        <Link href="/ai-video" className="mt-2 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm" style={{ backgroundColor: '#FF6034' }}>
          <FiCamera className="h-4 w-4" /> 去生成短视频
        </Link>
      </div>
    </div>
  )
}
