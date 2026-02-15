import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { id: string } }) {
  // Projects detail pages aren't implemented; redirect to projects list
  // Optionally you can implement detailed project content here using `params.id`.
  redirect('/projects')
}
