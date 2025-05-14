export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-teal-500 border-r-transparent border-b-teal-500 border-l-transparent rounded-full mx-auto mb-4"></div>
        <p>Laden...</p>
      </div>
    </div>
  )
}
