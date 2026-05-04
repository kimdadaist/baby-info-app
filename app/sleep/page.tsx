import SleepSoundPlayer from '@/components/SleepSoundPlayer'

export default function SleepPage() {
  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <h1 className="text-xl font-bold text-gray-800">🌙 백색소음기</h1>
        <p className="text-sm text-gray-400 mt-1">광고 없이, 아기가 잠들 때까지</p>
      </div>
      <SleepSoundPlayer />
    </div>
  )
}
