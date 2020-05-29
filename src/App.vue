<template>
  <div id="app">
    <div>
      <div>
        <input
          v-model="query"
          class="query"
          lang="zh"
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
  </div>
</template>

<script>

//import TheSearch from './components/TheSearch.vue'
const DATA = require('./assets/dicts').default
const PUNC = {"，":true, "。":true, "；":true, "！":true, "？":true, " ":true}
const PATTERN = {"平":"-", "上":"|", "去":"|", "入":"|"}
const CONTOUR = 0
const GROUP = 1
const EXPLANATION = 2

function lookUp(words) {
  /* eslint-disable no-console */
  console.log("LOOKINGUP")
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
      query: ""
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
  width: 100%;
  height: 1.5em;
  font-size: unset;
}

.result-pattern {
  font-family:'Courier New', Courier, monospace;
}
</style>
