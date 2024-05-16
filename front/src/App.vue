<template>
  <div ref="template">
    <div class="top-container">
      <div @mouseup="fade_mode = !fade_mode" class="top-button"
        v-bind:style="{ 'background-color': fade_mode ? 'pink' : 'lightblue' }">
        FADE
      </div>
      <div @mouseup="settings_mode = !settings_mode" class=" top-button"
        v-bind:style="{ 'background-color': settings_mode ? 'pink' : 'lightblue' }">
        settings
      </div>
      <div @mouseup="modal_props_visible = true" class=" top-button">
        ODAL
      </div>

    </div>

    <div class="container" :style="{ 'overflow-y': settings_mode ? 'hidden' : 'auto' }">

      <div v-for="elem in elems" :key="elem.id">
        <div @touchstart="on_element_touched($event, elem)" class="button_wrapper">
          <div class="box" :class="[elem.playing ? 'playing' : 'stopped']">
            <div class="fixed_font" style="height: 30px;"> {{ elem.name }}</div>

            <p></p>

            <div @touchstart="on_element_touched($event, elem)" style="width: 40px;height: 40px;"
              :class="elem.playing ? 'mdi--pause' : 'mdi--play'">
            </div>
            <div @touchstart="stop_audio($event, elem)" style="width: 40px;height: 40px;" class="mdi--stop">
            </div>
            <div style="background-color: red; height: 12px;  opacity: .5; color: black;"
              :style="{ 'width': elem.percent_played + '%' }"> </div>

          </div>
          <div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <modalSlider ref="modal_props_ref" :isOpen="modal_props_visible" @modal-close="modal_props_visible = false" />

</template>
<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { useFetch } from '@vueuse/core'
import modalSlider from './components/modal-audio-props.vue'
const modal_props_visible = ref(false)
const modal_props_ref = ref(null)
import * as Tone from "tone"

const elems = ref([])
const fade_mode = ref(false)
const settings_mode = ref(false)
const template = ref(null)

let settings = {}
watch(settings_mode, () => {
  console.log("settings_mode", settings_mode.value)
})
watch(fade_mode, () => {
  console.log("fade_mode", fade_mode.value)
}, { deep: true })
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
watch(modal_props_visible, async (newValue, oldValue) => {
  console.log("modal_props_visible", newValue)
  if (newValue === false) {
    await save_settings()
  }
})

watch(elems, (newValue, oldValue) => {
  console.log("elems", newValue)
})
async function stop_audio(event, elem) {
  if (settings_mode.value) return
  elem.audio.pause()
  elem.audio.currentTime = 0
}
let toneStarted = false
async function on_element_touched(event, elem) {
  if (!toneStarted) Tone.start()
  //event.preventDefault()
  if (settings_mode.value) {
    modal_props_ref.value.elem = elem
    modal_props_visible.value = true
  } else {
    if (elem.playing) {
      elem.audio.pause()
    } else {
      elem.audio.play()
    }
  }
}

onMounted(async () => {
  let settings_data = await useFetch(import.meta.env.VITE_BACKEND_URL + '/settings').json()


  settings = settings_data.data.value
  let dirty_settings = false
  let files = await traer_archivos()
  //console.log("files", files)
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
    //console.log(elem)

    if (!settings[elem.id]) {
      console.log("seteo settings", elem.name)
      dirty_settings = true
      settings[elem.id] = { volumen: .7 }
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

      console.log("paused", elem.name)
    })
    elem.audio.addEventListener('timeupdate', (e) => {
    })

    if (settings[elem.id]["loop"] == undefined) settings[elem.id]["loop"] = false
    if (settings[elem.id]["fadein"] == undefined) settings[elem.id]["fadein"] = 0
    if (settings[elem.id]["fadeout"] == undefined) settings[elem.id]["fadeout"] = 0
    elem.audio.volume = settings[elem.id].volumen
    elem.settings = settings[elem.id]
    //console.log("settings", elem.id, settings[elem.id].volumen)
    elems.value.push(elem)

  })
  if (dirty_settings) await save_settings()

})
async function save_settings() {
  const { data } = await useFetch(import.meta.env.VITE_BACKEND_URL + '/settings').post(settings)
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
.mdi--stop {
  display: inline-block;
  width: 1em;
  height: 1em;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M18 18H6V6h12z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

@keyframes scaleIn {
  from {

    opacity: .5;
  }

  to {

    opacity: 0;
  }
}

.mdi--play {

  display: inline-block;
  width: 1em;
  height: 1em;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M8 5.14v14l11-7z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

.mdi--pause {

  display: inline-block;
  width: 1em;
  height: 1em;
  --svg: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23000' d='M14 19h4V5h-4M6 19h4V5H6z'/%3E%3C/svg%3E");
  background-color: currentColor;
  -webkit-mask-image: var(--svg);
  mask-image: var(--svg);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
}

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
  margin: 6px;
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
  padding: 5px;
  /* Adjust the padding as needed */
  border: 1px solid #1e0303;
  /* Add a border for visual separation of boxes */
  margin-bottom: 5px;
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
