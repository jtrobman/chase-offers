async function addNextOffer() {
  const WAIT_TIME_MS = 1000
  var offerButtons = document.getElementsByClassName('sixersoffers__cta')

  setTimeout(() => {
    if (offerButtons[0].innerText.toLowerCase() == 'add to card') {
      console.log('clicking ' + offerButtons[0].getAttribute('aria-label'))
      offerButtons[0].click()
      setTimeout(() => {
        document.getElementById('flyoutClose').click();
        return true;
      }, WAIT_TIME_MS)
    }
    else {
      console.log('all deals have been added!')
      return false;
    }
  }, WAIT_TIME_MS)
}

function main() {
  const WAIT_TIME_MS = 3000;
  for (let i = 0; i < 100; ++i) {
    setTimeout(() => {
      addNextOffer()
    }, i * WAIT_TIME_MS)
  }
}

main();
