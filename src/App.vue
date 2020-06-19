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
        class="result-reference"
        lang="zh"
        style="white-space: pre-line"
      >
        {{ result.reference }}
      </p>
      <p
        class="result-pattern"
      >
        <span
          v-for="each in result.pattern"
          :key="each.id"
        >
          <span
            v-if="each.type === 'normal'"
            class="pattern-normal"
          >{{ each.text }}</span>
          <span
            v-if="each.type === 'undecided'"
            class="pattern-undecided"
            @click="switchPattern(each.id)"
          >{{ each.text }}</span>
          <span
            v-if="each.type === 'separator'"
            class="pattern-separator"
          >{{ each.text }}</span>
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
  words = cc.convert(words)

  let reference = ''
  let pattern = []

  let iterator = words[Symbol.iterator]()
  let item = iterator.next()
  let length = words.length
  let char, thisPattern

  for (let i = 0; i < length; i++) {
    char = item.value

    if (char in PUNC) {
      reference += '\n'
      pattern.push({ id: i, text: ' ', type: 'separator' })
      item = iterator.next()
      continue
    }

    if (!(char in DATA)) {
      reference += char + ' | ?\n'
      pattern.push({ id: i, text: '?', type: 'undecided' })
      item = iterator.next()
      continue
    }

    reference += char + ' | '
    thisPattern = ''

    DATA[char].forEach(items => {
      if (thisPattern == '') thisPattern = PATTERN[items[CONTOUR]]
      else if (thisPattern != PATTERN[items[CONTOUR]]) thisPattern = '?'

      if (items[EXPLANATION].length == 0)
        reference += `${items[CONTOUR]} ${items[GROUP]}`
      else
        reference += `${items[CONTOUR]} ${items[GROUP]}(${items[EXPLANATION]})`
      reference += '；'
    })
    pattern.push({ id: i, text: thisPattern, type: thisPattern === '?' ? 'undecided' : 'normal' })
    reference += '\n'

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

.result-pattern {
  font-family: 'Courier New', Courier, monospace;
}

.version {
  color: gray;
}
</style>
