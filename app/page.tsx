import dynamic from 'next/dynamic'

const GoalTracker = dynamic(() => import('../components/GoalTracker'), {
  ssr: false,
})

export default function Home() {
  return <GoalTracker />
} 