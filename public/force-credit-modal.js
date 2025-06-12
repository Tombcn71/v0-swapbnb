// Script om de credit modal te forceren
;(() => {
  // Verwijder bestaande modals
  const existingModals = document.querySelectorAll(".credit-modal-overlay")
  existingModals.forEach((modal) => modal.remove())

  // Maak de modal overlay
  const overlay = document.createElement("div")
  overlay.className =
    "credit-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"

  // Maak de modal content
  const modal = document.createElement("div")
  modal.className = "bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden"

  // Header
  const header = document.createElement("div")
  header.className = "bg-gray-100 px-6 py-4 border-b"
  const title = document.createElement("h2")
  title.className = "text-xl font-bold text-gray-800"
  title.textContent = "Credits nodig"
  header.appendChild(title)

  // Content
  const content = document.createElement("div")
  content.className = "px-6 py-4"
  const message = document.createElement("p")
  message.className = "text-gray-700 mb-4"
  message.textContent = "Je hebt niet genoeg credits om deze swap aan te vragen. Elke swap kost 1 credit."
  content.appendChild(message)

  // Buttons
  const buttons = document.createElement("div")
  buttons.className = "flex justify-end space-x-2 px-6 py-3 bg-gray-50"

  const closeButton = document.createElement("button")
  closeButton.className = "px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
  closeButton.textContent = "Sluiten"
  closeButton.onclick = () => {
    overlay.remove()
  }

  const buyButton = document.createElement("button")
  buyButton.className = "px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
  buyButton.textContent = "Credits kopen"
  buyButton.onclick = () => {
    window.location.href = "/credits"
  }

  buttons.appendChild(closeButton)
  buttons.appendChild(buyButton)

  // Voeg alles samen
  modal.appendChild(header)
  modal.appendChild(content)
  modal.appendChild(buttons)
  overlay.appendChild(modal)

  // Voeg toe aan body
  document.body.appendChild(overlay)

  // Sluit modal bij escape toets
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overlay.remove()
    }
  })

  // Sluit modal bij klik buiten modal
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove()
    }
  })

  console.log("Credit modal geforceerd weergegeven")
})()
