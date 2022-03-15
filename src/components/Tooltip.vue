<template>
  <transition name="fade" appear>
    <div class="container" v-show="isShow">
      <slot></slot>
    </div>
  </transition>
</template>

<script>
export default {
  props: ["isShow"],
};
</script>

<style lang="scss" scoped>
.container {
  position: absolute;
  top: 25px;
  right: -6px;
  z-index: 9998;
  border: 1px solid #fcb641;
  background-color: #fff;
  font-size: 0.5rem;
  text-align: left;
  padding: 0 0.5rem;
  border-radius: 0.2rem;
  width: max-content;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
