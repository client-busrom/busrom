import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to admin panel
  redirect('/admin')
}
