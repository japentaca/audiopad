<template>
  <div ref="template">
    <div class="top-container">
      <div @mouseup="fade_mode = !fade_mode" class="top-button"
        v-bind:style="{ 'background-color': fade_mode ? 'pink' : 'lightblue' }">
        FADE
      </div>
      <div @mouseup="mixer_mode = !mixer_mode" class=" top-button"
        v-bind:style="{ 'background-color': mixer_mode ? 'pink' : 'lightblue' }">
        MIXER
      </div>

    </div>

    <div class="container" :style="{ 'overflow-y': mixer_mode ? 'hidden' : 'auto' }">

      <div v-for="elem in elems" :key="elem.id">
        <div class="button_wrapper">
          <div @touchstart="on_element_touched($event, elem)" @touchmove="on_element_swiped($event, elem)" class="box"
            :class="[elem.playing ? 'playing' : 'stopped']">
            <div class="fixed_font" style="height: 30px;"> {{ elem.name }}</div>
            <p></p>
            <div style="background-color: brown; height: 12px;  color: black;"
              :style="{ 'width': elem.percent_played + '%' }"> </div>
            <p></p>
            <div class="fixed_font"> V:{{ mixer[elem.id].volumen.toFixed(2) }}</div>
          </div>
          <div>
          </div>
        </div>

      </div>
    </div>
  </div>

</template>
<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useFetch } from '@vueuse/core'


const elems = ref([])
const fade_mode = ref(false)
const mixer_mode = ref(false)
const template = ref(null)
let touch_last_y = 0


let mixer = {}
watch(mixer_mode, () => {
  console.log("mixer_mode", mixer_mode.value)
})
watch(fade_mode, () => {
  console.log("fade_mode", fade_mode.value)
})

setInterval(async () => {
  elems.value.map(elem => {
    if (elem.loaded) {
      elem.remaining = elem.audio.duration - elem.audio.currentTime
      elem.percent_played = (100 / elem.audio.duration) * elem.audio.currentTime
      if (elem.fading_in) {

        //obj.volumen = convertRange(obj.audio.currentTime, [0, obj.audio.duration], [0, 1])
      }
    }
  })
}, 100)
async function on_element_touched(event, elem) {
  //event.preventDefault()
  if (!mixer_mode.value) {

    if (!elem.playing) {
      elem.audio.play()
    }
    else {
      elem.audio.pause()
      elem.audio.currentTime = 0
    }
  }
  else {
    console.log("template", window.innerHeight, window.outerHeight)
    touch_last_y = event.touches[0].pageY.toFixed()
    console.log("touch start", event.touches[0].pageY.toFixed(2), event.target.offsetTop, event.target.offsetHeight)
  }
}
let last_swipe_evt = Date.now()
async function on_element_swiped(event, elem) {
  //event.preventDefault()
  if (!mixer_mode.value) return

  if (Date.now() - last_swipe_evt < 20) return
  last_swipe_evt = Date.now()

  let direction = touch_last_y > event.touches[0].pageY ? Number(0.02) : Number(-0.02)
  console.log("dir", direction)
  touch_last_y = event.touches[0].pageY

  console.log("vol prev", mixer[elem.id].volumen)
  mixer[elem.id].volumen = Number(mixer[elem.id].volumen + direction)
  console.log("vol post", mixer[elem.id].volumen)
  if (mixer[elem.id].volumen > 1) mixer[elem.id].volumen = 1
  if (mixer[elem.id].volumen < 0) mixer[elem.id].volumen = 0
  elem.audio.volume = mixer[elem.id].volumen
  //await save_mixer()
  //console.log(event.touches[0])
  //if (pos < 0 || pos > event.target.offsetHeight) return
  //console.log(event.touches[0].clientY.toFixed(2), event.target.offsetTop, event.target.offsetHeight, pos)
  //console.log(event.touches[0].pageY, touch_start_y, event.touches[0].pageY - touch_start_y)
  //console.log(pos, volumen)
  //let volumen = convertRange(pos, [0, event.target.offsetHeight], [0, 1])
  //elem.audio.volume = convertRange(pos, [0, event.target.offsetHeight], [0, 1])
  //console.log(volumen)
  //console.log(pos.toFixed(2), event.target.offsetParent.offsetHeight)

}
async function element_clicked(elem) {
  if (mixer_mode.value) return
  console.log("clicked", elem.name)
  if (!elem.playing) {
    elem.audio.play()
  }
  else {
    elem.audio.pause()
    elem.audio.currentTime = 0
  }
}

onMounted(async () => {
  let mixer_data = await useFetch(import.meta.env.VITE_BACKEND_URL + '/mixer').json()
  //console.log("mixer_data", mixer_data.data.value)

  mixer = mixer_data.data.value

  let files = await traer_archivos()
  files.map(f => {
    let elem = {
      id: f,
      name: f,
      playing: false,
      remaining: 0,
      fading_in: false,
      fading_out: false,
      audio: new Audio(import.meta.env.VITE_BACKEND_URL + '/audio?f=' + f),
      loaded: false,
      percent_played: Number(0),
      duration: 0,
    }
    elems.value.push(elem)
    if (!mixer[elem.id]) {
      console.log("seteo mixer", elem.name)
      mixer[elem.id] = { volumen: .7 }
    }
    elem.audio.addEventListener('canplaythrough', () => {
      elem.loaded = true
      elem.duration = elem.audio.duration
      //console.log("cpt", elem.name, elem.audio.duration)
    })
    elem.audio.addEventListener('playing', (e) => {
      elem.playing = true
      console.log("playing", elem.name)

    })
    elem.audio.addEventListener('ended', (e) => {
      elem.playing = false
      elem.percent_played = Number(1)
      console.log("ended", elem.name)
    })
    elem.audio.addEventListener('pause', (e) => {
      elem.playing = false
      elem.percent_played = Number(1)
      elem.audio.currentTime = 0
      console.log("paused", elem.name)
    })
    elem.audio.addEventListener('timeupdate', (e) => {




    })


    elem.audio.volume = mixer[elem.id].volumen

  })
  await save_mixer()

})
async function save_mixer() {
  const { data } = await useFetch(import.meta.env.VITE_BACKEND_URL + '/mixer').post(mixer)
}
const traer_archivos = async () => {
  const { data } = await useFetch(import.meta.env.VITE_BACKEND_URL + '/get_files').json()
  return data.value
}
function convertRange(value, r1, r2) {
  return (value - r1[0]) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}

console.log(convertRange(50, [0, 99], [0, 1]))
</script>

<style scoped>
.main {
  overflow-y: hidden;
}

.fixed_font {

  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

.top-container {
  display: flex;

  height: 10vh;
  /* Adjust the height as needed */

}

.container {
  display: flex;
  flex-wrap: wrap;
  max-height: 85vh;
  /* Adjust the height as needed */
  overflow-y: auto;
}

.top-button {
  user-select: none;
  margin: 3px;
  flex: 0 0 25%;
  overflow-wrap: break-word;

  /* Each box will take up 25% of the container's width */

  /* Ensure the box does not exceed 25% width */
  height: 50px;
  width: 50px;
  /* Adjust the height as needed */
  /*box-sizing: border-box;
  /* Include padding and border in the box's size */
  padding: 10px;
  /* Adjust the padding as needed */
  border: 1px solid #ccc;
  /* Add a border for visual separation of boxes */
  margin-bottom: 10px;
  /* Optional space between rows */
}

.box {
  user-select: none;
  box-shadow: 6px 6px 2px 1px rgba(0, 0, 255, .2);
  margin: 2px;
  flex: 0 0 25%;
  overflow-wrap: break-word;

  /* Each box will take up 25% of the container's width */
  max-width: 100px;
  /* Ensure the box does not exceed 25% width */
  height: 100px;
  width: 100px;
  /* Adjust the height as needed */
  /*box-sizing: border-box;
  /* Include padding and border in the box's size */
  padding: 10px;
  /* Adjust the padding as needed */
  border: 1px solid #ccc;
  /* Add a border for visual separation of boxes */
  margin-bottom: 10px;
  /* Optional space between rows */
}

/* For responsiveness, if you want the boxes to stack on smaller screens */
@media (max-width: 768px) {
  .box {
    flex-basis: 50%;
    max-width: 50%;
  }
}

/* If you want a single column on even smaller screens */
@media (max-width: 480px) {
  .box {
    flex-basis: 100%;
    max-width: 100%;
  }
}

.playing {
  background-color: rgb(228, 127, 127);
}

.stopped {
  background-color: lightblue;
}

body {
  overflow: hidden;
  height: 100vh;
}
</style>
