export default function PageLoading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="page-loading" role="status">
      <span className="spinner" aria-hidden="true" />
      {label}
    </div>
  )
}
