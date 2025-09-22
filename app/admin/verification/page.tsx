'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

type Request = {
  id: string
  organizer_id: string
  status: 'pending' | 'approved' | 'rejected'
  created_at?: string
}

export default function VerificationAdminPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/verification', { cache: 'no-store' })
      const data = await res.json()
      setRequests(data.requests || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const review = async (id: string, status: 'approved' | 'rejected') => {
    await fetch(`/api/verification/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await load()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="display text-gray-900 mb-2">Verification Requests</h1>
          <p className="text-gray-600">Review organizer verification submissions</p>
        </div>

        <Card className="border-2 border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-gray-900">Requests</CardTitle>
            <CardDescription className="text-gray-600">Pending approvals</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-gray-600">Loading...</p>
            ) : (
              <div className="space-y-3">
                {requests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="text-gray-900 text-sm">Organizer: {r.organizer_id}</div>
                      <div className="text-gray-500 text-xs">Status: {r.status}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="btn-primary" onClick={() => review(r.id, 'approved')}>Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => review(r.id, 'rejected')}>Reject</Button>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-gray-600">No requests.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


