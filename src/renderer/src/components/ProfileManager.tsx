import { useState } from 'react'
import { Profile } from '../../../shared/types'
import './ProfileManager.css'

interface Props {
  profiles: Profile[]
  activeProfileId: string
  isRunning: boolean
  onSelect: (id: string) => void
  onAdd: () => void
  onDelete: (id: string) => void
  onRename: (name: string) => void
}

export default function ProfileManager({
  profiles, activeProfileId, isRunning,
  onSelect, onAdd, onDelete, onRename
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const startEdit = (profile: Profile) => {
    if (isRunning) return
    setEditingId(profile.id)
    setEditValue(profile.name)
  }

  const commitEdit = () => {
    if (editValue.trim()) onRename(editValue.trim())
    setEditingId(null)
  }

  return (
    <div className="profiles">
      <div className="label">Profiles</div>
      <div className="profiles__list">
        {profiles.map(profile => (
          <div
            key={profile.id}
            className={`profiles__item ${profile.id === activeProfileId ? 'profiles__item--active' : ''}`}
            onClick={() => !editingId && onSelect(profile.id)}
          >
            {editingId === profile.id ? (
              <input
                className="profiles__name-input"
                value={editValue}
                autoFocus
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditingId(null) }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span
                className="profiles__name"
                onDoubleClick={() => startEdit(profile)}
                title="Double-click to rename"
              >
                {profile.name}
              </span>
            )}
            {profiles.length > 1 && profile.id === activeProfileId && !isRunning && (
              <button
                className="profiles__delete"
                onClick={e => { e.stopPropagation(); onDelete(profile.id) }}
                title="Delete profile"
              >
                ✕
              </button>
            )}
          </div>
        ))}

        <button
          className="profiles__add"
          onClick={onAdd}
          disabled={isRunning}
          title="New profile"
        >
          +
        </button>
      </div>
    </div>
  )
}
