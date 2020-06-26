<template>
  <div
    id="app"
    lang="zh"
  >
    <div>
      <div class="div-query">
        <input
          v-model="query"
          class="query"
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
              :href="useSearchService(character.original)"
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
      <button
        @click="switchSearchService"
      >
        使用{{ searchService[currentSearchService].name }}搜索
      </button>
      <button
        @click="clearInertia"
      >
        抹去記憶
      </button>
      <br>
      <span
        class="version"
        lang="zh"
      >
        版本 {{ version }}
      </span>
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
  let char, thisPatternText, thisReference, thisTerm

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

    thisPatternText = ''
    thisReference = { id: i, type: 'character', text: char, original: original[i], terms: [] }

    if (thisReference.original in this.inertia) {
      thisReference.terms = this.inertia[thisReference.original].reference.terms
      console.log(i, thisReference)
      reference.push(thisReference)
      pattern.push({
        id: i,
        text: this.inertia[thisReference.original].pattern.text,
        type: this.inertia[thisReference.original].pattern.type,
      })
      continue
    }

    DATA[char].forEach(items => {
      thisTerm = { focused: false }
      if (thisPatternText == '') thisPatternText = PATTERN[items[CONTOUR]]
      else if (thisPatternText != PATTERN[items[CONTOUR]]) thisPatternText = '?'

      thisTerm['contour'] = items[CONTOUR]
      thisTerm['group'] = items[GROUP]
      if (items[EXPLANATION].length !== 0) thisTerm['explanation'] = items[EXPLANATION]
      else thisTerm['explanation'] = null

      thisReference.terms.push(thisTerm)
    })
    reference.push(thisReference)
    pattern.push({ id: i, text: thisPatternText, type: thisPatternText === '?' ? 'undecided' : 'normal' })
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
      inertia: {},
      currentSearchService: 0,
      searchService: [
        {
          name: '國學大師',
          url: 'http://www.guoxuedashi.com/so.php?sokeytm=%s&ka=100'
        },
        {
          name: '韻典',
          url: 'https://ytenx.org/zim?dzih=%s&dzyen=1&jtkb=1&jtkd=1&jtdt=1&jtgt=1'
        },
        {
          name: '搜韻',
          url: 'https://sou-yun.cn/QR.aspx?c=%s'
        }
      ],
      dummy: 0,
      version: process.env.VUE_APP_VERSION
    }
  },
  computed: {
    result: function() {
      return lookUp.call(this, this.$data.query)
    }
  },
  methods: {
    switchTerm: function(charID, termID) {
      console.log([charID, termID])
      this.result.pattern[charID].text = PATTERN[this.result.reference[charID].terms[termID].contour]

      if (termID !== 0) {
        let swapMediate
        swapMediate = this.result.reference[charID].terms[termID]
        this.result.reference[charID].terms[termID] = this.result.reference[charID].terms[0]
        this.result.reference[charID].terms[0] = swapMediate
      }

      let original = this.result.reference[charID].original
      this.inertia[original] = {
        reference: this.result.reference[charID],
        pattern: this.result.pattern[charID]
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
    },

    switchSearchService: function() {
      this.currentSearchService = (this.currentSearchService + 1) % 3
    },
    useSearchService: function(word) {
      return this.searchService[this.currentSearchService].url.replace("%s", word)
    },

    clearInertia: function() {
      this.inertia = {}
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
  opacity: 0.75;
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

button {
  text-rendering: auto;
  color: gray;
  font-size: 1rem;
  letter-spacing: normal;
  word-spacing: normal;
  text-transform: none;
  text-indent: 0px;
  text-shadow: none;
  display: inline-block;
  text-align: center;
  align-items: flex-start;
  cursor: pointer;
  background-color: unset;
  box-sizing: border-box;
  margin: 0px 1rem 0px 0px;
  padding: 0px;
  border: none;
  outline: none;
}

button:hover {
  color: #2c3e50;
  text-decoration: underline dashed;
}

.version {
  color: gray;
}
</style>
