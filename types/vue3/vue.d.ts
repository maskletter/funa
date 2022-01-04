
declare module '*.vue' {
    import type { DefineComponent } from 'vue3'
    const component: DefineComponent<{}, {}, any>
    export default component
  }