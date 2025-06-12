// This script will be loaded on the page and will directly manipulate the DOM
// to show a modal when any form element is clicked

document.addEventListener("DOMContentLoaded", () => {
  // Create modal HTML
  const modalHTML = `
    <div id="credit-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 1rem;">
      <div style="background: white; border-radius: 0.5rem; max-width: 28rem; width: 100%; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; border-bottom: 1px solid #e5e7eb;">
          <h2 style="font-size: 1.25rem; font-weight: 600;">Geen credits beschikbaar</h2>
          <button id="close-modal" style="padding: 0.25rem; border-radius: 9999px; transition: background-color 0.2s;">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <div style="padding: 1.5rem;">
          <div style="display: flex; gap: 0.75rem; padding: 1rem; background-color: #fffbeb; border-radius: 0.5rem; margin-bottom: 1rem;">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            <div>
              <p style="font-weight: 500; color: #92400e;">Credits vereist</p>
              <p style="font-size: 0.875rem; color: #b45309;">Je hebt geen credits meer om een swap aan te vragen. Koop credits om door te gaan met je aanvraag.</p>
            </div>
          </div>
          
          <div style="background-color: #f9fafb; border-radius: 0.5rem; padding: 1rem; margin-bottom: 1rem;">
            <h4 style="font-weight: 500; color: #111827; margin-bottom: 0.5rem;">Wat zijn credits?</h4>
            <p style="font-size: 0.875rem; color: #4b5563;">Credits gebruik je om swap aanvragen te versturen. Elke aanvraag kost 1 credit. Dit houdt de kwaliteit van aanvragen hoog en voorkomt spam.</p>
          </div>

          <div style="display: flex; gap: 0.75rem; padding-top: 1rem;">
            <button id="buy-credits" style="flex: 1; background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; transition: background-color 0.2s;">Credits kopen</button>
            <button id="cancel-modal" style="flex: 1; background-color: #f3f4f6; color: #374151; padding: 0.5rem 1rem; border-radius: 0.375rem; font-weight: 500; transition: background-color 0.2s;">Annuleren</button>
          </div>
        </div>
      </div>
    </div>
  `

  // Inject modal into body
  document.body.insertAdjacentHTML("beforeend", modalHTML)

  // Get modal elements
  const modal = document.getElementById("credit-modal")
  const closeBtn = document.getElementById("close-modal")
  const buyCreditsBtn = document.getElementById("buy-credits")
  const cancelBtn = document.getElementById("cancel-modal")

  // Function to show modal
  function showModal() {
    modal.style.display = "flex"
  }

  // Function to hide modal
  function hideModal() {
    modal.style.display = "none"
  }

  // Add event listeners to modal buttons
  closeBtn.addEventListener("click", hideModal)
  cancelBtn.addEventListener("click", hideModal)
  buyCreditsBtn.addEventListener("click", () => {
    window.location.href = "/credits"
  })

  // Find the swap request form
  const form = document.querySelector("form")
  if (form) {
    // Add event listeners to all form elements
    const formElements = form.querySelectorAll("input, select, textarea, button")
    formElements.forEach((element) => {
      element.addEventListener("click", (e) => {
        // Prevent default action
        e.preventDefault()
        e.stopPropagation()

        // Show modal
        showModal()
      })
    })

    // Also show modal on form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault()
      showModal()
    })

    // Show modal immediately
    setTimeout(showModal, 500)
  }
})
