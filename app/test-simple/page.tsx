export default function TestSimplePage() {
  return (
    <div>
      <h1>Test pagina</h1>
      <p>Als je dit ziet, werkt React</p>

      {/* Simpele modal die ALTIJD zichtbaar is */}
      <div className="fixed inset-0 bg-red-500 flex items-center justify-center z-50">
        <div className="bg-white p-8 rounded">
          <h2>TEST MODAL</h2>
          <p>Deze modal zou ALTIJD zichtbaar moeten zijn</p>
        </div>
      </div>
    </div>
  )
}
