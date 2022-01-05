'use strict'

// DOM Variables
const gameMenu = document.querySelector('.game--menu')
const playground = document.querySelector('.playground')
const beginBtn = document.querySelector('.btn--begin')
const btnRules = document.querySelector('.btn--rules')
const btnMaxScore = document.querySelector('.btn--lastscore')
const score = document.querySelector('.score')
const stage = document.querySelector('.stage')
const textField = document.querySelector('.text--field')
const timer = document.querySelector('.timer')
const country = document.querySelector('.country')
const modalRules = document.querySelector('.modal--rules')
const modalMaxScore = document.querySelector('.modal--maxscore')
const modalCancel = document.querySelector('.cancel--modal')
const modalAgree = document.querySelector('.modal--btn')
const refreshBtn = document.querySelector('.refresh--btn')
const modalShadow = document.querySelector('.modal--shadow')
const correctSound = document.querySelector('.correct-sound')
const gameOverSound = document.querySelector('.game-over')
const timerRunningOutSound = document.querySelector('.time-running-out')

// Volume for sound
correctSound.volume = 0.2
gameOverSound.volume = 0.2
timerRunningOutSound.volume = 0.2

// Giving '' value for DOM variables
country.textContent = ''

// Onclick functions on btns

beginBtn.addEventListener('click', function () {
  setTimeout(function () {
    gameMenu.classList.add('hidden')
    playground.classList.remove('hidden')
  }, 500)
})

refreshBtn.addEventListener('click', function () {
  if (confirm('დარწმუნებული ხარ?')) {
    window.location.reload()
  }
})

// Modal functionality

function openModal(element, element2) {
  element.style.display = 'flex'
  element2.style.display = 'block'
}

function closeModal(element, element2) {
  return function () {
    element.style.display = 'none'
    element2.style.display = 'none'
  }
}

function changeModal(text, text2) {
  modalRules.childNodes[3].textContent = text
  modalRules.childNodes[5].textContent = text2
}

btnRules.addEventListener('click', function () {
  changeModal(
    'წესები',
    `წესები მარტივია! 
    გამოსახულებაზე დაწერილი ტექსტი უნდა ჩაწერო სწრაფად ტექსტის ველში, 
    თანაც უნდა გაითვალისწინოთ ის, რომ დროში ხართ შეზღუდული. 
    ამ თამაშით, თქვენ გაგივარჯიშდებათ თქვენი თითები და კლავიატურაზე უფრო სწრაფად დაწერთ.
    ეტაპები თანდათან რთულდება, ასე რომ წარმატებები :))`
  )
  openModal(modalRules, modalShadow)
})

modalCancel.addEventListener('click', closeModal(modalRules, modalShadow))
modalAgree.addEventListener('click', closeModal(modalRules, modalShadow))

// Playground

class Game {
  #playerScore = 0
  #playerStage = 1
  #gameTimer = 60
  #stages = [
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170,
    180, 190, 200, 210, 220, 230, 240, 250, 260, 270, 280, 290, 300, 310, 320,
    330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450, 460, 470,
    480, 490, 500, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 600, 610,
    620, 630, 640, 650, 660, 670, 680, 690, 700, 710, 720, 730, 740, 750, 760,
    770, 780, 790, 800, 810, 820, 830, 840, 850, 860, 870, 880, 890, 900, 910,
    920, 930, 940, 950, 960, 970, 980, 990, 1000,
  ]
  #countries = []

  constructor() {
    score.textContent = `ქულა: ${this.#playerScore}`
    stage.textContent = `ეტაპი: ${this.#playerStage}`
    timer.textContent = `${this.#gameTimer} წამი`
    textField.value = ''
    this.setTimer(1000)
    this.addScore()
    this.getLastScore()
    this.getRandomCountry(this.getCountries())
  }

  async getCountries() {
    try {
      const res = await fetch('https://restcountries.com/v3.1/region/europe')
      const countries = await res.json()
      for (let i = 0; i < countries.length; i++) {
        this.#countries.push(countries[i].name.common)
      }
      const badCountry = this.#countries.indexOf('Åland Islands')
      if (badCountry > -1) {
        this.#countries.splice(badCountry, 1)
      }
      return this.#countries
    } catch (err) {
      country.textContent = 'ინტერნეტკავშირი გაწყდა'
      textField.setAttribute('onkeydown', 'return false;')
    }
  }

  getRandomCountry(fn) {
    fn.then(function (result) {
      const randomCountry = result[Math.floor(Math.random() * result.length)]
      country.textContent = randomCountry
    })
  }

  setTimer(interval) {
    const self = this
    beginBtn.addEventListener('click', function () {
      const gameTimerInt = setInterval(() => {
        self.#gameTimer -= 1
        if (self.#gameTimer === 0) {
          clearInterval(gameTimerInt)
          changeModal(
            'დრო ამოიწურა :(',
            `შენი ქულა არის ${self.#playerScore}, ეტაპი კი ${self.#playerStage}`
          )
          gameOverSound.play()
          openModal(modalRules, modalShadow)
          country.textContent = 'დრო ამოიწურა'
          textField.setAttribute('onkeydown', 'return false;')
          textField.value = ''
          self.saveScore(self.#playerScore)
        }
        if (self.#gameTimer === 8) {
          timerRunningOutSound.play()
        }
        timer.textContent = `${self.#gameTimer} წამი`
      }, interval)
    })
  }

  addScore() {
    const self = this
    textField.onkeyup = function (e) {
      if (e.target.value === country.textContent) {
        setTimeout(() => {
          country.classList.remove('correct')
        }, 500)
        correctSound.play()
        textField.value = ''
        self.#playerScore += 1
        self.addStage(self.#playerScore)
        score.textContent = `ქულა: ${self.#playerScore}`
        self.getRandomCountry(self.getCountries())
        country.classList.add('correct')
      }

      if (e.target.value !== country.textContent) {
        setTimeout(() => {
          country.classList.remove('incorrect')
        }, 150)
        country.classList.add('incorrect')
      }
    }
  }

  addStage(score) {
    for (let i = 0; i < this.#stages.length; i++) {
      if (score === this.#stages[i]) {
        this.#playerStage += 1
      }
    }

    stage.textContent = `ეტაპი: ${this.#playerStage}`

    if (this.#playerStage === 2) {
      this.getRandomCountry(this.addCountries('oceania'))
    }
    if (this.#playerStage === 3) {
      this.getRandomCountry(this.addCountries('africa'))
    }
    if (this.#playerStage === 4) {
      this.getRandomCountry(this.addCountries('americas'))
    }
  }

  async addCountries(region) {
    const res = await fetch(`https://restcountries.com/v3.1/region/${region}`)
    const countries = await res.json()
    this.#countries = []
    this.#countries.length = 0

    for (let i = 0; i < countries.length; i++) {
      this.#countries.push(countries[i].name.common)
    }

    return this.#countries
  }

  saveScore(score) {
    localStorage.setItem('lastScore', score)
  }

  getLastScore() {
    const lastScore = Number(localStorage.getItem('lastScore'))
    btnMaxScore.addEventListener('click', function () {
      changeModal('ბოლოს აღებული ქულა', `შენ ბოლოს აიღე ${lastScore} ქულა`)
      openModal(modalRules, modalShadow)
    })
  }
}

const game = new Game()
