<template>
  <div id="app">
    <div>
      <div class="div-query">
        <input
          v-model="query"
          class="query"
          lang="zh"
          type="text"
          label="query"
          placeholder="输入要查询的字、词或句子……"
        >
      </div>
      <p
        class="result-pattern"
      >
        <span
          v-for="pattern in result.pattern"
          :key="pattern.id"
          class="pattern"
        >
          <span
            v-if="pattern.type === 'normal'"
            class="pattern-normal"
          >{{ pattern.text }}</span>
          <span
            v-if="pattern.type === 'undecided'"
            class="pattern-undecided"
            @click="switchPattern(pattern.id)"
          >{{ pattern.text }}</span>
          <span
            v-if="pattern.type === 'separator'"
            class="pattern-separator"
          >{{ pattern.text }}</span>
        </span>
      </p>
      <p
        class="result-reference"
        lang="zh"
      >
        <span
          v-for="character in result.reference"
          :key="character.id"
        >
          <span
            v-if="character.type === 'character'"
          >
            <a
              class="character-text"
              :href="`http://www.guoxuedashi.com/so.php?sokeytm=${character.original}&ka=100`"
              target="_blank"
            >{{ character.original }}</a>
            |
            <span class="character-terms">
              <span
                v-for="(term, index) in character.terms"
                :key="index"
                class="character-term"
                @click="switchTerm(character.id, index)"
              >
                <span class="term-contour" :style="`color:${getContourColor(term.contour)}`">{{ term.contour }}</span><span class="term-group">{{ term.group }}</span><span v-if="term.explanation" class="term-explanation">[{{ term.explanation }}]</span>
              </span>
            </span>
          </span>
          <span
            v-else-if="character.type === 'unknown'"
          >
            <span class="character-text">{{ character.text }}</span>
            | ?
          </span>
          <br>
        </span>
      </p>
    </div>
    <div>
      <p
        class="version"
        lang="zh"
      >
        版本 {{ version }}
      </p>
    </div>
    <div
      class="dummy"
      style="display:none"
    >
      {{ dummy }}
    </div>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { OpenCC } from './helper/opencc'

//import TheSearch from './components/TheSearch.vue'
let DATA
import('./assets/dicts').then((module) => {
  DATA = module.default
})

const PUNC = {"，":true, "。":true, "；":true, "！":true, "？":true, " ":true}
const PATTERN = {"平":"-", "上":"|", "去":"|", "入":"|"}
const CONTOUR = 0
const GROUP = 1
const EXPLANATION = 2
/* eslint-disable no-console */

let cc
(async () => {
  cc = await OpenCC.PresetConverter({ fromVariant: 't', toVariant: 'cn' })
})()

cc = {
  convert: words => { return words } // Dummy
}

function lookUp(words) {
  /* eslint-disable no-console */
  let original = words
  words = cc.convert(words)

  let reference = []
  let pattern = []

  let iterator = words[Symbol.iterator]()
  let item = iterator.next()
  let length = words.length
  let char, thisPattern, thisReference, thisTerm

  for (let i = 0; i < length; i++) {
    char = words[i]

    if (char in PUNC) {
      reference.push({ id: i, type: 'punctuation', text: char })
      pattern.push({ id: i, text: ' ', type: 'separator' })
      item = iterator.next()
      continue
    }

    if (!(char in DATA)) {
      reference.push({ id: i, type: 'unknown', text: char })
      // reference += char + ' | ?\n'
      pattern.push({ id: i, text: '?', type: 'undecided' })
      item = iterator.next()
      continue
    }

    thisPattern = ''
    thisReference = { id: i, type: 'character', text: char, original: original[i], terms: [] }

    DATA[char].forEach(items => {
      thisTerm = { focused: false }
      if (thisPattern == '') thisPattern = PATTERN[items[CONTOUR]]
      else if (thisPattern != PATTERN[items[CONTOUR]]) thisPattern = '?'

      thisTerm['contour'] = items[CONTOUR]
      thisTerm['group'] = items[GROUP]
      if (items[EXPLANATION].length !== 0) thisTerm['explanation'] = items[EXPLANATION]
      else thisTerm['explanation'] = null

      thisReference.terms.push(thisTerm)
    })
    reference.push(thisReference)
    pattern.push({ id: i, text: thisPattern, type: thisPattern === '?' ? 'undecided' : 'normal' })

    item = iterator.next()
  }

  return {
    reference: reference,
    pattern: pattern
  }
}

export default {
  name: 'App',
  components: {},
  data: function() {
    return {
      query: '',
      dummy: 0,
      version: process.env.VUE_APP_VERSION
    }
  },
  computed: {
    result: function() {
      return lookUp(this.$data.query)
    }
  },
  methods: {
    switchPattern: function(id) {
      const SYMBOLS = ['?', '-', '|']
      let length = 3
      let currentSymbol = this.result.pattern[id].text
      for (let i = 0; i < length; i++) {
        if (currentSymbol === SYMBOLS[i]) {
          this.result.pattern[id].text = SYMBOLS[(i + 1) % 3]
          this.dummy += 1
          break
        }
      }
    },

    switchTerm: function(charID, termID) {
      this.result.pattern[charID].text = PATTERN[this.result.reference[charID].terms[termID].contour]

      if (termID !== 0) {
        let swapMediate
        swapMediate = this.result.reference[charID].terms[termID]
        this.result.reference[charID].terms[termID] = this.result.reference[charID].terms[0]
        this.result.reference[charID].terms[0] = swapMediate
      }

      this.dummy += 1
    },

    getContourColor: (contour) => {
      return {
        '平': '#2e317c',
        '上': '#1177b0',
        '去': '#12aa9c',
        '入': '#229453',
      }[contour]
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  margin: 2em;
}

::selection {
  background-color: #2c3e50;
  color: white;
}

.div-query {
  outline: none;
}

.query {
  display: block;
  padding-left: 0px;
  padding-right: 0px;
  border-style: none none solid;
  border-width: 0px 0px 2px;
  border-color: gray;
  border-radius: 0;
  width: 100%;
  height: 1.75em;
  font-size: unset;
}

.query:hover {
  border-color: #2c3e50;
}

.query:focus {
  outline: none;
  border-style: none none solid;
  border-width: 0px 0px 2px;
  border-color: #2c3e50;
}

.character-text {
  display: inline-block;
  min-width: 1em;
  color: inherit;
  cursor: pointer;
  text-decoration: inherit;
}

.character-term {
  display: inline-block;
  margin-right: 0.5em;
}

.character-term:not(:first-child) {
  opacity: 75%;
}

.result-pattern {
  margin-top: 0.25em;
}

.pattern {
  display: inline-block;
  font-family: 'Courier New', Courier, monospace;
  text-align: center;
  width: 1rem;
}

.version {
  color: gray;
}
</style>
