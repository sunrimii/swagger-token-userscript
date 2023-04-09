// ==UserScript==
// @name        Auto swagger token
// @namespace   https://github.com/sunrimii
// @grant       none
// @version     1.0
// @author      Jiahe
// @description Automactlly fill in token that is fetched from member service on swagger page.
// @match        *://*/docs/index.html
// @match        *://*/docs/api/index.html
// @match        *://localhost:*/swagger/index.html#/*
// ==/UserScript==

fetch("http://localhost:8080/api/v1/guest/access_token")
  .then(response => response.json())
  .then(guestData => {
    const guestToken = `Bearer ${guestData.access_token}`

    fetch("http://localhost:8080/api/v1/accounts/MQ==/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: guestToken,
      },
      body: JSON.stringify({ encrypted_password: "123" }),
    })
      .then(response => response.json())
      .then(memberData => {
        const memberToken = `Bearer ${memberData.access_token}`
        console.log(`Token to be filled: ${memberToken}`)

        const fillAuthToken = () => {
          const authFields = document.querySelectorAll('input[placeholder="Authorization"]')
          authFields.forEach(field => {
            field.value = memberToken
          })
        }

        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
              fillAuthToken()
            }
          })
        })

        observer.observe(document.body, {
          childList: true,
          subtree: true,
        })
      })
      .catch(error => {
        console.error(`Error fetching member access token: ${error}`)
      })
  })
  .catch(error => {
    console.error(`Error fetching guest access token: ${error}`)
  })
