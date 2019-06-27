<template>
    <!--没有数据时显示-->
    <div class="noDataTip" v-show="showFlag == true" style="margin-top:40%;" :style="{ marginTop: top ? top+'px' : '40%'}">
        <img src="~message/assets/img/myyy.png"/>
        <br/>{{msg}}
    </div>
</template>

<script>
    export default{
        name: 'noDataTip',
        data () {
            return {
                value: ""
            }
        },
        props: [
            'msg', 'showFlag', 'top'
        ],
        components: {},
        mounted: function () {
           
        },
        methods: {}
    }
</script>


<style lang="scss">
    @import '~assets/css/public.scss';

    .noDataTip {
        margin-top: 250px;
        text-align: center;
        font-size: 18px;
        color: $font_color_currency_light;
        img {
            height: 80px;
        }
    }

</style>
