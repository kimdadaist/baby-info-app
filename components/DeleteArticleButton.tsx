'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ConfirmDialog from './ConfirmDialog'

export default function DeleteArticleButton({ articleId }: { articleId: string }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    try {
      await fetch('/api/admin/article', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId }),
      })
      router.refresh()
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={loading}
        className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1"
        title="글 삭제"
      >
        삭제
      </button>
      <ConfirmDialog
        open={showConfirm}
        title="글을 삭제할까요?"
        message="삭제된 글은 사이트에서 즉시 사라지며 복구할 수 없어요."
        confirmLabel="삭제"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  )
}
