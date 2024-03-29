async function addNextOffer() {
  const WAIT_TIME_MS = 1000
  var offerButtons = document.getElementsByClassName('sixersoffers__cta')
  for (let i = 0; i < offerButtons.length; i++) {
    if (offerButtons[i].getAttribute('aria-label').toLowerCase().includes('add to card')) {
      offerButtons[i].click()
      setTimeout(() => {
        document.getElementById('flyoutClose').click()
        // return true
      }, WAIT_TIME_MS)
      return true
    }
  }

  console.log('all deals have been added!')
  return false
}

function main() {
  const WAIT_TIME_MS = 3000
  var offerButtons = document.getElementsByClassName('sixersoffers__cta')
  for (let i = 0; i < offerButtons.length; ++i) {
    setTimeout(() => {
      if (!addNextOffer()) {
        return true
      }
      else {
        return false
      }
    }, i * WAIT_TIME_MS)
  }
}

main()
