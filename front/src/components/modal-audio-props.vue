<script setup>
import { defineProps, defineEmits, ref, watch } from "vue";
import { onClickOutside } from '@vueuse/core'

const elem = ref({})
const props = defineProps({
  isOpen: Boolean,

});
defineExpose({ elem })
watch(elem, (newValue, oldValue) => {
  console.log("elem", newValue.settings)
  volumen_slider.value = newValue.settings.volumen
  fadein_slider.value = newValue.settings.fadein
  fadeout_slider.value = newValue.settings.fadeout
})

const emit = defineEmits(["modal-close"]);
const volumen_slider = ref(null)
const fadein_slider = ref(null)
const fadeout_slider = ref(null)
const target = ref(null)
onClickOutside(target, () => emit('modal-close'))
async function on_volumen_change(event) {
  //console.log(event.target.value, elem.value)
  elem.value.settings.volumen = event.target.value
  elem.value.audio.volume = event.target.value
}
async function on_fadein_change(event) {
  //console.log(event.target.value, elem.value.settings.fadein)
  elem.value.settings.fadein = event.target.value

}
async function on_fadeout_change(event) {
  //console.log(event.target.value, elem)
  elem.value.settings.fadeout = event.target.value

}
</script>

<template>
  <div v-if="isOpen" class="modal-mask">
    <div class="modal-wrapper">
      <div class="modal-container" ref="target">
        <div class="modal-header">
          <slot name="header"> {{ elem.name }} </slot>
        </div>
        <p></p>
        <div class="modal-body">
          <div class="fixed_width">volumen {{ elem.settings.volumen }}</div>
          <input id="volumen" ref="volumen_slider" @input="on_volumen_change($event)" type="range" min="0" max="1"
            step=".1" :value="elem.settings.volumen" />

          <div class="fixed_width"> Fade In {{ elem.settings.fadein }}</div>
          <input ref="fadein_slider" @input="on_fadein_change($event)" type="range" min="0" max="10" step=".5"
            :value="elem.settings.fadein" />

          <div class="fixed_width">
            Fade Out {{ elem.settings.fadeout }}
          </div>
          <input ref="fadeout_slider" @input="on_fadeout_change($event)" type="range" min="0" max="10" step=".5"
            :value="elem.settings.fadeout" />

          <!--input type="checkbox" :value="elem.settings.loop" /-->
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.fixed_width {
  width: 50px;
}

.modal-header {
  height: 30px;
  justify-content: space-between;
  border: 1px;
  border-color: black;
}

.modal-body {
  display: flex;
  border: 1px;
  border-color: black;
}

input[type="range"] {
  margin-block-end: 20px;
  writing-mode: vertical-lr;
  direction: rtl;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-container {

  width: 300px;
  margin: 150px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
}
</style>