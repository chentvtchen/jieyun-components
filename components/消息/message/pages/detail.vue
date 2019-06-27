<template>
    <div class="lechatMessageDetail flex flex-direction-column">
        <!-- , preventGoBack: true -->
        <x-header :left-options="{showBack: true, backText: ''}" class="header vux-1px-b"
            @on-click-back="backLastPage">
            内容详情
        </x-header>
        <div class="container flex-1">
            <div class="title">
                {{info.title}}
            </div>
            <div class="info">
                {{info.createTime | dateTime_format}}
            </div>
            <div class="text">
                {{info.content}}
            </div>
        </div>
        <loading :show="showLoading" text="加载中"></loading>
    </div>
</template>

<script>
import {XHeader, Loading} from 'vux'
import api from 'message/assets/js/api.js'

export default {
    data() {
        return {
            showLoading: false,
            info: {},
        }
    },
    components: {
        XHeader,
        Loading
    },
    mounted(){
        let query = this.$route.query;
        if(query.id) {
            this.getInfo(query.id);
        }
    },
    methods: {
        getInfo(id) {
            api.getMessageDetail(id).then( res=>{
                if(res.status === 0) {
                    if(res.data) {
                        this.info = res.data;
                    }
                }else {
                    common.toastMsg( res.message )
                }
            })
        },
        // 返回消息列表页面
        backLastPage() {
            this.$router.push({
                path: '/messageList'
            })
        }
    }
}
</script>

<style lang="scss">
@import '~apps/message/assets/css/common.scss';
.lechatMessageDetail {
    height: 100%;
    .header.vux-header {
        padding: 2px 0;
        background: $message_theme_color;
        .vux-header-title {
            font-size: 17px;
            color: $message_header_title_color;
        }
        .vux-header-left .left-arrow:before {
            border-color: $message_header_title_color;
        }
    }
    .container {
        padding: 15px;
        background: #fff;
        word-break: break-word;
        .title {
            font-size: 25px;
            line-height: 35px;
            margin-bottom: 15px;
            color: #333;
        }
        .info {
            font-size: 13px;
            color: #909090;
            margin-bottom: 20px;
        }
        .text {
            font-size: 18px;
            color: $message_header_title_color;
            img {
                max-width: 100%;
            }
        }
    }
}
</style>
