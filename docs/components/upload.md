###  1.使用
####  依赖组件
```js
"vux":
"cropper": "^4.0.0",
"lrz": "^4.9.40",
"exif-js": "2.2.1"
```
#### main.js 引入
```js
import clipper from 'components/upload/clipper.js'
Vue.use(clipper)
```
#### 代码
[upload文件夹](https://github.com/chentvtchen/jieyun-components/tree/master/components/)
放在components文件夹下面
#### 使用案例
```
<template>
    <div class="demo">  
        <button @click="uploadImg">图片上传</button>  
        <upload ref="uploadRef" :config="config" @getImgData="getImg"></upload>
    </div>
</template>

<script>
import upload from 'components/upload/index.vue'
export default {
    name: 'app',
    data(){
        return {
            config : {
                isCrop : true,
                cropBoxResizable:false,         //是否可以调整裁剪框的大小
                minCropBoxWidth:144,            //裁剪层的最小宽度
                minCropBoxHeight:192,           //裁剪层的最小高度
                aspectRatioWidth : 144,          //裁剪框宽高比之宽度
                aspectRatioHeight : 144,        //裁剪框宽高比之高度
                maxUploadMb: 5,                 //上传到后台图片最大
            },
            info: {
                id: '',
                name: ''
            }
        }
    },
    components: {
        upload
    },
    methods:{
        uploadImg(){
            this.$refs.uploadRef.uploadEvent();
        },
        getImg(info) {
            this.info = info;
            console.log(info);
        }
    },
}
</script>

```
### 2.属性
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| maxUploadMb  | 上传到后台图片最大mb   | Number|  自定义  |     5    |
| quality     | 压缩图片的质量 | String  | 自定义 |  0.8   |
| themeColor| 主题色| String    | 自定义 |   #1aad19    |
| config  |  裁剪框的配置  | Object    |  自定义  |    下面有详解    |
##### config参数
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| isCrop  | 是否进行裁剪   | Boolean   |  —    |    false    |
| cropBoxResizable  | 是否可以调整裁剪框的大小   | Boolean  |  —   |    false    |
| minCropBoxWidth     | 裁剪层的最小宽度  | Number| 自定义 |  144  |
| minCropBoxHeight | 裁剪层的最小高度 | Number| 自定义 |   192     |
| aspectRatioWidth    | 裁剪框宽高比之宽度   | Number| 自定义  |   144 |
| aspectRatioHeight   | 裁剪框宽高比之高度   | Number| 自定义  |   192 |
### 3.方法
| 名称     | 参数      | 说明    | 类型      | 
|----------|---------- |-------- |---------- |
 | @getImgData| (info)| 获取图片的id和名称   | Object    | 
