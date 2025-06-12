// Dit script controleert credits en toont een modal als nodig
;(() => {
  // Wacht tot de pagina geladen is
  window.addEventListener("DOMContentLoaded", async () => {
    try {
      // Check credits via API
      const response = await fetch("/api/credits")
      const data = await response.json()

      // Als er geen credits zijn, toon modal
      if (data.credits < 1) {
        showCreditModal()
      }

      // Voeg event listeners toe aan alle form elementen
      const formElements = document.querySelectorAll("input, select, textarea, button")
      formElements.forEach((element) => {
        element.addEventListener("click", (e) => {
          if (data.credits < 1) {
            e.preventDefault()
            e.stopPropagation()
            showCreditModal()
            return false
          }
        })
      })
    } catch (error) {
      console.error("Error checking credits:", error)
    }
  })

  // Functie om modal te tonen
  function showCreditModal() {
    // Verwijder bestaande modal als die er is
    const existingModal = document.getElementById("credit-modal")
    if (existingModal) {
      existingModal.remove()
    }

    // Maak modal element
    const modal = document.createElement("div")
    modal.id = "credit-modal"
    modal.style.position = "fixed"
    modal.style.top = "0"
    modal.style.left = "0"
    modal.style.width = "100%"
    modal.style.height = "100%"
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)"
    modal.style.display = "flex"
    modal.style.alignItems = "center"
    modal.style.justifyContent = "center"
    modal.style.zIndex = "9999"

    // Maak modal inhoud
    const modalContent = document.createElement("div")
    modalContent.style.backgroundColor = "white"
    modalContent.style.padding = "20px"
    modalContent.style.borderRadius = "8px"
    modalContent.style.maxWidth = "400px"
    modalContent.style.width = "90%"

    // Voeg titel toe
    const title = document.createElement("h2")
    title.textContent = "Geen credits beschikbaar"
    title.style.marginBottom = "15px"

    // Voeg bericht toe
    const message = document.createElement("p")
    message.textContent = "Je hebt geen credits meer om een swap aan te vragen. Koop credits om door te gaan."
    message.style.marginBottom = "20px"

    // Voeg knoppen toe
    const buttonContainer = document.createElement("div")
    buttonContainer.style.display = "flex"
    buttonContainer.style.gap = "10px"

    const buyButton = document.createElement("button")
    buyButton.textContent = "Credits kopen"
    buyButton.style.backgroundColor = "#2563eb"
    buyButton.style.color = "white"
    buyButton.style.padding = "8px 16px"
    buyButton.style.borderRadius = "4px"
    buyButton.style.border = "none"
    buyButton.style.cursor = "pointer"
    buyButton.style.flex = "1"
    buyButton.onclick = () => {
      window.location.href = "/credits"
    }

    const cancelButton = document.createElement("button")
    cancelButton.textContent = "Annuleren"
    cancelButton.style.backgroundColor = "#f3f4f6"
    cancelButton.style.color = "#374151"
    cancelButton.style.padding = "8px 16px"
    cancelButton.style.borderRadius = "4px"
    cancelButton.style.border = "none"
    cancelButton.style.cursor = "pointer"
    cancelButton.style.flex = "1"
    cancelButton.onclick = () => {
      modal.remove()
    }

    // Voeg alles samen
    buttonContainer.appendChild(buyButton)
    buttonContainer.appendChild(cancelButton)

    modalContent.appendChild(title)
    modalContent.appendChild(message)
    modalContent.appendChild(buttonContainer)

    modal.appendChild(modalContent)

    // Voeg modal toe aan body
    document.body.appendChild(modal)
  }
})()
