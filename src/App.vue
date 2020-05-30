/* eslint-disable vue/script-indent */
<template>
  <div id="app">
    <div>
      <div>
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
        {{ result.pattern }}
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
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import { OpenCC } from './opencc'

//import TheSearch from './components/TheSearch.vue'
let DATA
import('./assets/dicts').then((module) => {
  DATA = module.default
});

const PUNC = {"，":true, "。":true, "；":true, "！":true, "？":true, " ":true}
const PATTERN = {"平":"-", "上":"|", "去":"|", "入":"|"}
const CONTOUR = 0
const GROUP = 1
const EXPLANATION = 2
/* eslint-disable no-console */

let cc
(async () => {
  cc = await OpenCC.PresetConverter({ fromVariant: 't', toVariant: 'cn' })
})();

cc = {
  convert: words => { return words } // Dummy
}

function lookUp(words) {
  /* eslint-disable no-console */
  words = cc.convert(words)

  let reference = ''
  let pattern = ''

  let iterator = words[Symbol.iterator]()
  let item = iterator.next()
  let char, thisPattern

  while (!item.done) {
    char = item.value

    if (char in PUNC) {
      reference += '\n'
      pattern += ' '
      item = iterator.next()
      continue
    }

    if (!(char in DATA)) {
      reference += char + ' | ?\n'
      pattern += '?'
      item = iterator.next()
      continue
    }

    reference += char + ' | '
    thisPattern = ''

    DATA[char].forEach(items => {
      if (thisPattern == '') thisPattern = PATTERN[items[CONTOUR]]
      else if (thisPattern != PATTERN[items[CONTOUR]]) thisPattern = '?'

      if (items[EXPLANATION].length == 0) reference += `${items[CONTOUR]} ${items[GROUP]}`
      else reference += `${items[CONTOUR]} ${items[GROUP]}(${items[EXPLANATION]})`
      reference += "；"
    });
    pattern += thisPattern
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
  components: {
  },
  data: function() {
    return {
      query: "",
      version: process.env.VUE_APP_VERSION,
    }
  },
  computed: {
    result: function() {
      return lookUp(this.$data.query)
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

.query {
  display: block;
  width: calc(100% - 8px);
  height: 1.75em;
  font-size: unset;
}

.result-pattern {
  font-family:'Courier New', Courier, monospace;
}

.version {
  color: gray;
}
</style>
