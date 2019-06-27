<template>
    <div id="app">
        <keep-alive>
            <router-view v-if="$route.meta.keepAlive"></router-view>
        </keep-alive>
        <router-view v-if="!$route.meta.keepAlive"></router-view>
    </div>
</template>

<script>
export default {
    name: 'app',
     data(){
        return {

        }
    },
    components: {
    },
    mounted:function () {
    },
    methods:{
       
    },
}
</script>

<style lang="scss">
@import '~assets/css/public.scss';
#app {
    position: absolute;
    top: 0px;
    bottom: 0px;
    width: 100%;
}

</style>
