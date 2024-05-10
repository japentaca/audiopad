<template>
  <div class="top-container">
    <div @mouseup="fade_pressed = false" @mousedown="fade_pressed = true" class="top-button"
      style="background-color: lightcoral">
      FADE
    </div>
    <div @mousedown="volumen_pressed = true" @mouseup="volumen_pressed = false" class=" top-button"
      style="background-color: lightgreen">
      VOLUMEN
    </div>
    <div class="top-button">
      boton 1
    </div>
  </div>

  <div class="container">

    <div class="mcontainer" v-for="elem in elems" :key="elem.id">
      <div @click="element_clicked(elem)" class="box" :class="[elem.playing ? 'playing' : 'stopped']">
        <div> {{ elem.name }}</div>
        <p></p>
        <div style="font-family: 'Courier New', Courier, monospace;"> {{ elem.remaining.toFixed(1) }}</div>
      </div>


    </div>
  </div>

</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useFetch } from '@vueuse/core'

const elems = ref([])
const fade_pressed = ref(false)
const volumen_pressed = ref(false)

setInterval(async () => {

  elems.value.map(obj => {

    if (obj.loaded) {
      obj.remaining = obj.audio.duration - obj.audio.currentTime
    }
  })
}, 100)
async function element_clicked(elem) {
  console.log("clicked", elem)
  if (!elem.playing) {
    elem.audio.play()
  }
  else {
    elem.audio.pause()
    elem.audio.currentTime = 0
  }
}

onMounted(async () => {

  let files = await traer_archivos()
  files.map(f => {
    let elem = {
      id: f,
      name: f,
      playing: false,
      remaining: 0,
      fading_up: false,
      fading_down: false,
      audio: new Audio(import.meta.env.VITE_BACKEND_URL + '/audio?f=' + f),
      loaded: false
    }
    elems.value.push(elem)
    elem.audio.addEventListener('canplaythrough', () => {
      elem.loaded = true
      console.log(elem.name, elem.audio.duration)
    })
    elem.audio.addEventListener('playing', (e) => {
      elem.playing = true
      console.log("playing", e)
    })
    elem.audio.addEventListener('ended', (e) => {
      elem.playing = false
      console.log("ended", e)
    })
    elem.audio.addEventListener('pause', (e) => {
      elem.playing = false
      console.log("ended", e)
    })

  })




  /* for (let i = 0; i < 22; i++) {
    elems.value.push({
      id: i,
      name: `Element aso pepepepepepe ${i}`
    })
  } */
  //console.log(ultima_novedad)
})
const traer_archivos = async () => {
  //console.log("Pido files", import.meta.env)
  const { data } = await useFetch(import.meta.env.VITE_BACKEND_URL + '/get_files').json()
  //console.log(data.value.elapsed)
  return data.value
}
</script>

<style scoped>
.playing {
  background-color: red;
}

.stopped {
  background-color: lightblue;
}

.top-container {
  display: flex;

  height: 80px;
  /* Adjust the height as needed */

}

.container {
  display: flex;
  flex-wrap: wrap;
  max-height: 100vh;
  /* Adjust the height as needed */
  overflow-y: auto;
}

.top-button {
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
  box-shadow: 12px 12px 2px 1px rgba(0, 0, 255, .2);
  margin: 3px;
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
</style>
