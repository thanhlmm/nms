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
  top: 30px;
  right: 0;
  z-index: 9998;
  border: 1px solid #fcb641;
  background-color: #fff;
  font-size: 0.5rem;
  text-align: left;
  padding: 0 0.5rem;
  border-radius: 0.2rem;
}
.container::after {
  content: "";
  border: 10px solid transparent;
  border-bottom-color: #fff;
  position: absolute;
  top: -18px;
  left: 5px;
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
