const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const utility = {
  getRandomNumberArray (count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

//cheat
let cheatMode = false
const cheatModeButton = document.querySelector("#cheat-mode-btn")
const cheatModeStatus = document.querySelector("#cheat-mode-btn-status")


const view = {
  getCardElement (index) {
  if (cheatMode) {
      return this.getCardContent (index)
   }else {
      return `<div data-index="${index}" class="card back"></div>`
   }
  },
  
  getCardContent (index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
    <div class="text">
      <p>${number}</p>
      <img src="${symbol}" />
      <p>${number}</p>
      </div>
    `
  },
  
  transformNumber (number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  
  displayCards () {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
  },
  
  flipCard (card) {
    if (card.classList.contains('back')) {
      // 回傳正面
      card.classList.remove('back')
      card.innerHTML = this.getCardContent(Number(card.dataset.index))
      return
    }
    // 回傳背面
    card.classList.add('back')
    card.innerHTML = null
  },
  
   pairCard (card) {
    card.classList.add('paired')
  },
  
   renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You have: ${times} times left`;
  },
  
  appendWrongAnimation(...cards) {
  cards.map(card => {
    card.classList.add('wrong')
    card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
    })
  },
  
   showGameFinished () {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Congratulations</p>
      <p>Score: ${model.score}</p>
      <p>You've tried ${50-model. triedTimes}</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
  
  showGameOver () {
    const div = document.createElement('div')
    div.classList.add('over')
    div.innerHTML = `
      <p>Game Over</p>
      <p>Score: ${model.score}</p>
      <p>You've run out of times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
  
   cheatModeBtnUpdate() {
    if (cheatMode) {
       cheatModeStatus.textContent = "ON <Turn off to continue the game>"
      cheatModeButton.classList.add("btn-danger")
      cheatModeButton.classList.remove("btn-success")
    } else {
      cheatModeStatus.textContent = "OFF"
      cheatModeButton.classList.remove("btn-danger")
      cheatModeButton.classList.add("btn-success")
    }
  },
}


const model = {
  revealedCards: [],
  
  score: 0,
  
  triedTimes: 50,
  
  isRevealedCardsMatched () {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  
   isGameOver(){
    return this.triedTimes === 0
  },  
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards () {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  
  cheatModeButtonClick() {
   const unpairedCards = Array.from(document.querySelectorAll(".card"))

    if (cheatMode) {
      cheatMode = false
      unpairedCards.forEach(card => {
        if (card.classList.contains('paired')){
          card.classList.remove('back')
          card.innerHTML = view.getCardContent(Number(card.dataset.index)) 
        }else{
        // 其他卡片隱藏內容
        card.classList.add('back')
        card.innerHTML = ""
        }
      })
      
    } else {
      cheatMode = true
      unpairedCards.forEach(card => {   
       card.classList.remove('back')
      card.innerHTML = view.getCardContent(Number(card.dataset.index)) 
        
      })
    }
    view.cheatModeBtnUpdate()
  },

  dispatchCardAction (card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.flipCard(card)
        model.revealedCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwaits
        break
        
      case GAME_STATE.SecondCardAwaits:
        //超過規定次數
         if (model.isGameOver()) {
            view.showGameOver ()
            this.currentGameState = GAME_STATE.GameFinished
            return
          } 
        view.renderTriedTimes(--model.triedTimes)
        view.flipCard(card)
        model.revealedCards.push(card)
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
           view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.pairCard(model.revealedCards[0])
          view.pairCard(model.revealedCards[1])
          model.revealedCards = []
          
           if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
           }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
           view.appendWrongAnimation(...model.revealedCards)
          setTimeout(() => {
            view.flipCard(model.revealedCards[0])
            view.flipCard(model.revealedCards[1])
            model.revealedCards = []
            this.currentState = GAME_STATE.FirstCardAwaits
          }, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  }
}

controller.generateCards()
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})

cheatModeButton.addEventListener("click", controller.cheatModeButtonClick)